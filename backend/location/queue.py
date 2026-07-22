import json
import logging
from datetime import datetime, timezone

import requests
from django.conf import settings
from django_redis import get_redis_connection

logger = logging.getLogger("django")

# Shared Redis key names for the LocationIQ lookup rendezvous. See
# doc/spec/20260720_1400_locationiq_rate_limited_queue_design.md for the full
# contract — used by both LocationAutocompleteView (location_views.py) and
# the fetch_autocomplete Celery task (tasks.py).
LOCATIONIQ_LOOKUP_KEY_PREFIX = "locationiq:lookup:"
LOCATIONIQ_PENDING_JOBS_KEY = "locationiq:pending_jobs"


def get_redis_conn():
    return get_redis_connection("default")


def _normalize_query(q, countrycodes):
    return f"{q.strip().lower()}|{countrycodes.strip().lower()}"


def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def _locationiq_daily_budget_exceeded():
    """
    IP-agnostic backstop: caps total LocationIQ calls per day regardless of
    who's sending them, independent of the per-second/per-IP rate limits.
    No-op unless LOCATIONIQ_DAILY_BUDGET is configured.
    """
    if not settings.LOCATIONIQ_DAILY_BUDGET:
        return False

    from location.models import NominatimPeriodStats

    today_key = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    total_today = (
        NominatimPeriodStats.objects.filter(
            period_type="day", period_key=today_key, provider="locationiq"
        )
        .values_list("total_requests", flat=True)
        .first()
    ) or 0
    return total_today >= settings.LOCATIONIQ_DAILY_BUDGET


def _try_locationiq(q, countrycodes, accept_language):
    if not settings.LOCATIONIQ_API_KEY:
        return None, None
    if _locationiq_daily_budget_exceeded():
        logger.warning(
            "LocationIQ daily budget (%s) exceeded, skipping to Nominatim",
            settings.LOCATIONIQ_DAILY_BUDGET,
        )
        return None, None
    params = {
        "key": settings.LOCATIONIQ_API_KEY,
        "q": q,
        "limit": 10,
        "accept-language": accept_language,
        "format": "json",
        "addressdetails": 1,
        "polygon_geojson": 1,
        "polygon_threshold": 0.001,
    }
    if countrycodes:
        params["countrycodes"] = countrycodes
    try:
        resp = requests.get(
            settings.LOCATIONIQ_AUTOCOMPLETE_URL,
            params=params,
            timeout=settings.LOCATIONIQ_TIMEOUT,
        )
        if resp.status_code == 200:
            data = resp.json()
            # A valid-but-empty list is a real "no matches" result, not a
            # failure — only a non-list (or non-200) body should fall
            # through to the Nominatim fallback.
            if isinstance(data, list):
                return data, "locationiq"
        logger.warning(
            "LocationIQ returned status %d for query '%s'", resp.status_code, q
        )
    except requests.RequestException as exc:
        logger.warning("LocationIQ request failed for query '%s': %s", q, exc)
    return None, None


def _try_nominatim(q, countrycodes, accept_language):
    url = settings.LOCATION_SERVICE_BASE_URL + "/search"
    params = {
        "q": q,
        "format": "json",
        "addressdetails": 1,
        "polygon_geojson": 1,
        "polygon_threshold": 0.001,
    }
    if countrycodes:
        params["countrycodes"] = countrycodes
    headers = {
        "User-Agent": settings.CUSTOM_USER_AGENT,
        "Accept-Language": accept_language,
    }
    try:
        resp = requests.get(
            url, params=params, headers=headers, timeout=settings.NOMINATIM_TIMEOUT
        )
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list):
                return data, "nominatim"
        logger.warning(
            "Nominatim fallback returned status %d for query '%s'",
            resp.status_code,
            q,
        )
    except requests.RequestException as exc:
        logger.warning("Nominatim fallback failed for query '%s': %s", q, exc)
    return None, None


def _fetch_results(q, countrycodes, accept_language):
    results, provider = _try_locationiq(q, countrycodes, accept_language)
    if results is None:
        results, provider = _try_nominatim(q, countrycodes, accept_language)
    return results, provider


def _store_result(redis_conn, key, job_id, results, provider):
    """
    Write the terminal state for a LocationIQ lookup key.

    A real result (including a legitimately empty list) is cached for
    LOCATIONIQ_RESULT_TTL_S. A failure (results is None — both providers
    down, or a task that crashed) only gets LOCATIONIQ_NEGATIVE_TTL_S, so a
    transient outage self-corrects within seconds instead of being served as
    an empty answer for the full positive-cache lifetime. See Gap #7 in the
    design doc.
    """
    ttl = (
        settings.LOCATIONIQ_RESULT_TTL_S
        if results is not None
        else settings.LOCATIONIQ_NEGATIVE_TTL_S
    )
    redis_conn.setex(
        key,
        ttl,
        json.dumps(
            {
                "status": "done",
                "results": results,
                "provider": provider,
                "job_id": job_id,
            }
        ),
    )

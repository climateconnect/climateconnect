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
# Short-lived NX lock held while one request takes over an abandoned pending
# sentinel, so concurrent pollers don't all fetch the same query at once.
LOCATIONIQ_RECLAIM_KEY_PREFIX = "locationiq:reclaim:"


def get_redis_conn():
    return get_redis_connection("default")


def _primary_language(accept_language):
    """
    Reduce an Accept-Language header to its primary tag ("de-DE,de;q=0.9" ->
    "de").

    Only the primary tag goes into the cache key: the full header varies per
    browser, so keying on it would shatter the cache into near-duplicates,
    while ignoring language entirely would serve German display names to
    English users (and vice versa) for the whole RESULT_TTL_S.
    """
    if not accept_language:
        return ""
    return accept_language.split(",")[0].split(";")[0].split("-")[0].strip().lower()


def _normalize_query(q, countrycodes, accept_language=""):
    return (
        f"{q.strip().lower()}"
        f"|{countrycodes.strip().lower()}"
        f"|{_primary_language(accept_language)}"
    )


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
            # failure — only a non-list (or unexpected-status) body should
            # fall through to the Nominatim fallback.
            if isinstance(data, list):
                return data, "locationiq"
        elif resp.status_code == 404:
            # LocationIQ's /autocomplete returns 404 (not 200 + []) when a
            # query has zero matches — also a real "no matches" result, not
            # a provider failure worth falling back to Nominatim for.
            return [], "locationiq"
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


def strip_geometry(results):
    """
    Drop bulky polygon coordinates from autocomplete results before they are
    cached and returned.

    We request `polygon_geojson=1` because the geometry is what ends up in
    Location.multi_polygon — but a single country/region polygon at
    polygon_threshold=0.001 can be megabytes, and autocomplete never *shows*
    the geometry, it only shows names. Caching those payloads in Redis (which
    is also the Celery broker and the Channels layer) is what makes this
    expensive.

    So we keep the geometry *type* and drop only the coordinates:

        {"type": "MultiPolygon", "coordinates": [[...huge...]]}
        ->  {"type": "MultiPolygon", "coordinates": None}

    The type is what the frontend needs (it drives Point-vs-area handling),
    and it is also the marker the backend uses later: when a location is
    saved for the first time, `location.utility.get_location()` sees the
    missing coordinates and re-fetches the real geometry from the provider by
    osm_id/osm_type, so the DB still gets the full polygon.

    Point geometries are left untouched — they are two floats, and keeping
    them avoids a pointless upstream lookup for the most common case.
    """
    if not results:
        return results

    stripped = []
    for entry in results:
        geojson = entry.get("geojson") if isinstance(entry, dict) else None
        if isinstance(geojson, dict) and geojson.get("type") != "Point":
            entry = {**entry, "geojson": {**geojson, "coordinates": None}}
        stripped.append(entry)
    return stripped


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
                "results": strip_geometry(results),
                "provider": provider,
                "job_id": job_id,
            }
        ),
    )

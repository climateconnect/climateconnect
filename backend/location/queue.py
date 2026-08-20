import json
import logging
import time
from datetime import datetime, timedelta, timezone

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
# LRU index over cached results: member = lookup key, score = last access time.
# Only successful results are indexed — pending sentinels are already tracked
# in LOCATIONIQ_PENDING_JOBS_KEY, and negative-cached failures live for a few
# seconds and must not consume a cache slot.
LOCATIONIQ_LRU_KEY = "locationiq:lru"
# Per-day cache effectiveness counters. Redis INCRs rather than DB rows: this
# is the hot path, and NominatimRequestLog already records the expensive event
# (an actual upstream call) in Postgres.
LOCATIONIQ_STATS_HITS_KEY_PREFIX = "locationiq:stats:hits:"
LOCATIONIQ_STATS_MISSES_KEY_PREFIX = "locationiq:stats:misses:"


def get_redis_conn():
    return get_redis_connection("default")


def locationiq_autocomplete_enabled():
    """
    Whether the LocationIQ autocomplete path is switched on for this backend.

    When the LOCATIONIQ_AUTOCOMPLETE toggle is off the frontend calls Nominatim
    directly from the browser, so the proxy only ever sees requests from
    clients still running a cached JS bundle. Those keep working — they just
    get the Nominatim fallback instead of consuming paid LocationIQ quota.

    Defaults to False: if the toggle can't be read at all, degrade to the
    behaviour that was proven on master.

    **Flipping this toggle requires clearing the result cache.** Cache entries
    are provider-agnostic — `_serve_cached` returns any stored result whatever
    produced it — so entries fetched from Nominatim while the toggle was off go
    on being served for up to LOCATION_PROXY_MAX_CACHE_AGE_S after it is turned on.
    The hottest query prefixes are the most likely to be cached, so those are
    exactly the ones that would *not* reach LocationIQ, and both the provider
    mix in NominatimStatsView and the new hit-rate counters would misreport the
    first two days after a flip. See "Flipping the toggle" in
    doc/spec/20260804_1202_locationiq_feature_toggle_and_result_caching.md.
    """
    # Imported lazily so location.queue stays importable during app loading.
    from feature_toggles.utility import is_feature_enabled_for_current_environment

    return is_feature_enabled_for_current_environment(
        "LOCATIONIQ_AUTOCOMPLETE", default=False
    )


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
    if not locationiq_autocomplete_enabled():
        logger.debug(
            "LOCATIONIQ_AUTOCOMPLETE is off, serving %r from Nominatim instead", q
        )
        return None, None
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
    if not settings.LOCATION_SERVICE_BASE_URL:
        logger.warning(
            "LOCATION_SERVICE_BASE_URL is not configured, skipping Nominatim fallback"
        )
        return None, None

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


def _decode(value):
    return value.decode() if isinstance(value, bytes) else value


def _index_and_trim(redis_conn, key, now):
    """
    Record `key` as the most recently used cache entry and evict the oldest
    ones once the index exceeds LOCATION_PROXY_CACHE_MAX_ENTRIES.

    The trim is not atomic with the write above it. A race there can at worst
    evict an entry a moment early, which costs one extra upstream fetch — not
    worth a Lua script to prevent.

    Members can also outlive their keys (a key expires; its sorted-set member
    does not). That is bounded and harmless: the trim keeps ZCARD at or below
    the cap, DEL on a missing key is a no-op, and eviction is oldest-first —
    exactly the members most likely to be expired already. The only cost is
    that the live cache can be slightly smaller than the configured cap.

    That drift does have one sharp edge, which is why eviction checks the value
    before deleting it. A lookup key holds two different things over its life:
    a pending sentinel first, then the cached result. Only results are indexed
    here, but when a cached entry expires its index member stays behind with an
    old score — and if that query is searched again, the *same key* now holds a
    fresh pending sentinel while a stale, very-low-scored member points at it.
    Evicting oldest-first would then DEL a live sentinel out from under an
    in-flight lookup: pollers would see an empty key, re-claim, and enqueue a
    second upstream fetch for a query already being fetched. So a victim whose
    key currently holds a sentinel is dropped from the index only.
    """
    redis_conn.zadd(LOCATIONIQ_LRU_KEY, {key: now})

    max_entries = settings.LOCATION_PROXY_CACHE_MAX_ENTRIES
    if not max_entries:
        return

    overflow = redis_conn.zcard(LOCATIONIQ_LRU_KEY) - max_entries
    if overflow <= 0:
        return

    for victim in redis_conn.zrange(LOCATIONIQ_LRU_KEY, 0, overflow - 1):
        victim_key = _decode(victim)
        if _holds_pending_sentinel(redis_conn, victim_key):
            # Stale index member pointing at a resurrected key. Drop the member
            # so the cap still makes progress, but leave the sentinel alone.
            redis_conn.zrem(LOCATIONIQ_LRU_KEY, victim_key)
            continue
        redis_conn.delete(victim_key)
        redis_conn.zrem(LOCATIONIQ_LRU_KEY, victim_key)


def _holds_pending_sentinel(redis_conn, key):
    """
    True if `key` currently holds an in-flight lookup rather than a result.

    One extra GET, and only on the eviction path, so it costs nothing on a
    normal store. A key that has gone missing or holds something unparseable is
    treated as evictable — DEL on it is a no-op anyway.
    """
    try:
        raw = redis_conn.get(key)
        return bool(raw) and json.loads(raw).get("status") == "pending"
    except (ValueError, TypeError):
        return False


def refresh_cache_entry(redis_conn, key, data, now):
    """
    Apply the sliding TTL on a cache hit. Returns False when the entry has
    outlived LOCATION_PROXY_MAX_CACHE_AGE_S and must be re-fetched.

    The refreshed TTL is capped by the entry's remaining age budget, so the key
    expires on its own exactly LOCATION_PROXY_MAX_CACHE_AGE_S after it was first
    fetched. The explicit age check below is a safety net for clock skew.

    Also consumes the `delivered` marker: the first read of a freshly stored
    result is the tail of the lookup that produced it, not a cache hit. See
    was_undelivered() and _store_result.

    Only ever called for successful results — a negative-cached failure must
    keep its few-second TTL rather than being promoted to a day.

    The writes go out in one pipeline. There is nothing to make atomic here —
    the ops are independent and the trim was never atomic either — but this is
    the hottest endpoint in the app, so it is worth one round trip instead of
    two or three.

    **Every write here is best-effort.** A cache hit cannot be a pure read in
    this design — the sliding TTL needs EXPIRE, LRU-by-*access* needs ZADD, the
    delivery marker needs SETEX — but none of those affect the response: they
    are cache maintenance, and the results are already in hand. Redis can
    accept reads while refusing writes (at `maxmemory` under a `noeviction`
    policy, on a read-only replica, mid-failover), and that is precisely the
    situation this cache is designed around, since the same instance carries
    the Celery broker and the Channels layer. Letting a failed EXPIRE turn a
    servable hit into a 500 would make the endpoint *less* available than it
    was before the cache existed. So the writes are wrapped, and the one thing
    that must never be swallowed — whether the entry is past its age ceiling —
    is decided from the payload alone, before any Redis call.
    """
    first_fetched_at = data.get("first_fetched_at")
    too_old = (
        first_fetched_at is not None
        and (now - first_fetched_at) >= settings.LOCATION_PROXY_MAX_CACHE_AGE_S
    )
    # Both of these change the stored value, so they need a rewrite rather
    # than a bare EXPIRE.
    needs_rewrite = data.get("delivered") is False
    data["delivered"] = True

    try:
        if too_old:
            pipe = redis_conn.pipeline()
            pipe.delete(key)
            pipe.zrem(LOCATIONIQ_LRU_KEY, key)
            pipe.execute()
        elif first_fetched_at is None:
            # Written by a deploy that predates this field. Adopt now as its
            # birth and persist that, so later hits age from a stable point
            # rather than resetting the 48h budget on every request.
            data["first_fetched_at"] = now
            redis_conn.setex(
                key, settings.LOCATION_PROXY_RESULT_TTL_S, json.dumps(data)
            )
            _index_and_trim(redis_conn, key, now)
        else:
            new_ttl = int(
                min(
                    settings.LOCATION_PROXY_RESULT_TTL_S,
                    settings.LOCATION_PROXY_MAX_CACHE_AGE_S - (now - first_fetched_at),
                )
            )
            pipe = redis_conn.pipeline()
            if needs_rewrite:
                pipe.setex(key, max(new_ttl, 1), json.dumps(data))
            elif new_ttl > 0:
                pipe.expire(key, new_ttl)
            # Refresh recency so the trim measures last *access*, not last write.
            pipe.zadd(LOCATIONIQ_LRU_KEY, {key: now})
            pipe.execute()
    except Exception:
        # Worst case the entry keeps its previous TTL and is re-fetched sooner,
        # or an unconsumed delivery marker costs one uncounted hit. Both are
        # cheaper than failing the request.
        logger.warning(
            "Could not refresh autocomplete cache entry %s; serving it anyway",
            key,
            exc_info=True,
        )

    return not too_old


def was_undelivered(data):
    """
    True if nothing has read this cached result yet.

    Must be called *before* refresh_cache_entry, which consumes the marker.
    Entries written before the marker existed have no `delivered` key and count
    as already delivered — the safe default, since treating an old entry as a
    fresh delivery would silently drop a real hit.

    Consumption is at-most-once, not exactly-once: the read here and the
    rewrite in refresh_cache_entry are not atomic, so two pollers arriving
    together on a freshly stored result both see False and neither counts a
    hit. That is deliberate. It undercounts (one genuinely saved upstream call
    goes unrecorded) rather than overcounts, which is the right direction for a
    metric whose whole purpose is to prove the cache is worth its complexity —
    and a CAS or Lua script to make it exact would cost more, on the hot path,
    than the accuracy is worth. Do not "fix" this by moving the marker read
    into refresh_cache_entry: that reintroduces the ~50% hit_rate floor this
    marker exists to remove.
    """
    return data.get("delivered") is False


def _day_key(prefix, moment=None):
    moment = moment or datetime.now(timezone.utc)
    return f"{prefix}{moment.strftime('%Y-%m-%d')}"


def _incr_stat(redis_conn, prefix):
    """
    Bump a per-day counter. Never lets a metrics failure break a user-facing
    request — same principle as log_autocomplete_request.

    Only the increment that *creates* the key sets its TTL. Re-expiring on
    every write would cost a second round trip per request on the hot path, and
    would turn the documented 7-day retention into a sliding window that keeps
    a busy day's counter alive indefinitely.
    """
    key = _day_key(prefix)
    try:
        if redis_conn.incr(key) == 1:
            redis_conn.expire(key, settings.LOCATION_PROXY_STATS_TTL_S)
    except Exception as exc:
        logger.warning(
            "Failed to increment autocomplete cache counter %s: %s", key, exc
        )


def record_cache_hit(redis_conn):
    _incr_stat(redis_conn, LOCATIONIQ_STATS_HITS_KEY_PREFIX)


def record_cache_miss(redis_conn):
    _incr_stat(redis_conn, LOCATIONIQ_STATS_MISSES_KEY_PREFIX)


def get_cache_stats(days=7):
    """
    Per-day cache hit/miss counts, newest first.

    Once results are cached for a day, NominatimPeriodStats necessarily falls —
    that is the point, but it makes a working cache indistinguishable from a
    drop in traffic. These counters are what tells the two apart.
    """
    redis_conn = get_redis_conn()
    today = datetime.now(timezone.utc)
    stats = []
    for offset in range(days):
        moment = today - timedelta(days=offset)
        hits = int(
            _decode(redis_conn.get(_day_key(LOCATIONIQ_STATS_HITS_KEY_PREFIX, moment)))
            or 0
        )
        misses = int(
            _decode(
                redis_conn.get(_day_key(LOCATIONIQ_STATS_MISSES_KEY_PREFIX, moment))
            )
            or 0
        )
        total = hits + misses
        stats.append(
            {
                "day": moment.strftime("%Y-%m-%d"),
                "hits": hits,
                "misses": misses,
                "hit_rate": round(hits / total, 4) if total else None,
            }
        )
    return stats


def _store_result(redis_conn, key, job_id, results, provider, delivered=False):
    """
    Write the terminal state for a LocationIQ lookup key.

    A real result (including a legitimately empty list) is cached for
    LOCATION_PROXY_RESULT_TTL_S and enters the LRU index. A failure (results is
    None — both providers down, or a task that crashed) only gets
    LOCATION_PROXY_NEGATIVE_TTL_S and is deliberately left out of the index, so a
    transient outage self-corrects within seconds instead of being served as
    an empty answer for the full positive-cache lifetime and occupying a cache
    slot while it does. See Gap #7 in the design doc.

    `delivered` says whether the caller is handing this result straight back to
    a user. The Celery task isn't (it writes the result for a *later* poll to
    collect, so the default is False); the inline fetch is, and passes True.
    It only affects the hit/miss counters — see was_undelivered().
    """
    is_real_result = results is not None
    ttl = (
        settings.LOCATION_PROXY_RESULT_TTL_S
        if is_real_result
        else settings.LOCATION_PROXY_NEGATIVE_TTL_S
    )
    now = time.time()
    payload = {
        "status": "done",
        "results": strip_geometry(results),
        "provider": provider,
        "job_id": job_id,
    }
    if is_real_result:
        # Anchors the 48h ceiling. Absent on failures, which never slide.
        payload["first_fetched_at"] = now
        payload["delivered"] = delivered

    redis_conn.setex(key, ttl, json.dumps(payload))

    if is_real_result:
        _index_and_trim(redis_conn, key, now)

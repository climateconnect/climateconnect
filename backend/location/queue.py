import json
import logging
import threading
import time
from uuid import uuid4

import requests
from django.conf import settings
from django_redis import get_redis_connection

from location.location_views import _increment_counters

logger = logging.getLogger("django")

LOCATIONIQ_MAX_RATE = 2
DRAIN_INTERVAL_S = 1.0 / LOCATIONIQ_MAX_RATE
QUEUE_MAX_LEN = 100
RESULT_TTL_S = 300
REQUEST_TIMEOUT_S = 10
PROCESSING_TTL_S = 15

QUEUE_KEY = "locationiq:queue"
RESULT_PREFIX = "locationiq:result:"
PROCESSING_PREFIX = "locationiq:processing:"
WAITERS_FOR_PREFIX = "locationiq:waiters_for_query:"

_worker_thread = None
_stop_event = threading.Event()
_registry_lock = threading.Lock()
_request_registry = {}


class RequestState:
    __slots__ = ("request_id", "event", "result", "arrived_at")

    def __init__(self, request_id, event, result, arrived_at):
        self.request_id = request_id
        self.event = event
        self.result = result
        self.arrived_at = arrived_at


def get_redis_conn():
    return get_redis_connection("default")


def _normalize_query(q, countrycodes):
    return f"{q.strip().lower()}|{countrycodes.strip().lower()}"


def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def _try_locationiq(q, countrycodes, accept_language):
    if not settings.LOCATIONIQ_API_KEY:
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
            if isinstance(data, list) and data:
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


def _signal_waiters(redis_conn, normalized_q, results):
    waiters_key = f"{WAITERS_FOR_PREFIX}{normalized_q}"
    request_ids = redis_conn.smembers(waiters_key)
    for rid_bytes in request_ids:
        rid = rid_bytes.decode() if isinstance(rid_bytes, bytes) else rid_bytes
        with _registry_lock:
            state = _request_registry.get(rid)
        if state is not None:
            state.result = results
            state.event.set()
    redis_conn.delete(waiters_key)


def _process_one(item_bytes, redis_conn):
    item = json.loads(item_bytes)
    normalized_q = item["normalized_q"]

    cached = redis_conn.get(f"{RESULT_PREFIX}{normalized_q}")
    if cached:
        _signal_waiters(redis_conn, normalized_q, json.loads(cached))
        return

    is_new = redis_conn.set(
        f"{PROCESSING_PREFIX}{normalized_q}",
        item["request_id"],
        nx=True,
        ex=PROCESSING_TTL_S,
    )
    if not is_new:
        return

    results, provider = _fetch_results(
        item["q"], item["countrycodes"], item["accept_language"]
    )

    if results is not None:
        redis_conn.setex(
            f"{RESULT_PREFIX}{normalized_q}",
            RESULT_TTL_S,
            json.dumps(results),
        )

    _signal_waiters(redis_conn, normalized_q, results)
    redis_conn.delete(f"{PROCESSING_PREFIX}{normalized_q}")

    if results is not None:
        _increment_counters(provider)


def _queue_worker(stop_event):
    logger.info(
        "LocationIQ queue worker started (drain rate: %s req/s)", LOCATIONIQ_MAX_RATE
    )
    redis_conn = get_redis_conn()
    while not stop_event.is_set():
        try:
            result = redis_conn.brpop(QUEUE_KEY, timeout=1)
            if result is None:
                continue
            _, item_bytes = result
            _process_one(item_bytes, redis_conn)
        except Exception:
            logger.exception("Queue worker error")
            time.sleep(0.5)
        stop_event.wait(timeout=DRAIN_INTERVAL_S)
    logger.info("LocationIQ queue worker stopped")


def enqueue_request(q, countrycodes, accept_language):
    try:
        redis_conn = get_redis_conn()
    except Exception:
        logger.critical(
            "Redis unavailable for location queue, falling back to direct fetch"
        )
        results, provider = _fetch_results(q, countrycodes, accept_language)
        return {
            "results": results,
            "provider": provider or "direct_fallback",
            "status": "ok",
        }

    normalized_q = _normalize_query(q, countrycodes)
    request_id = uuid4().hex

    cached = redis_conn.get(f"{RESULT_PREFIX}{normalized_q}")
    if cached:
        return {"results": json.loads(cached), "provider": "cached", "status": "ok"}

    event = threading.Event()
    state = RequestState(
        request_id=request_id, event=event, result=None, arrived_at=time.time()
    )
    with _registry_lock:
        _request_registry[request_id] = state

    redis_conn.sadd(f"{WAITERS_FOR_PREFIX}{normalized_q}", request_id)
    redis_conn.expire(f"{WAITERS_FOR_PREFIX}{normalized_q}", 30)

    current_len = redis_conn.llen(QUEUE_KEY)
    if current_len >= QUEUE_MAX_LEN:
        _cleanup_waiter(redis_conn, request_id, normalized_q)
        return {"results": None, "provider": None, "status": "queue_full"}

    item = json.dumps(
        {
            "request_id": request_id,
            "q": q,
            "countrycodes": countrycodes,
            "accept_language": accept_language,
            "normalized_q": normalized_q,
            "ts": time.time(),
        }
    )
    redis_conn.lpush(QUEUE_KEY, item)

    cached = redis_conn.get(f"{RESULT_PREFIX}{normalized_q}")
    if cached:
        _cleanup_waiter(redis_conn, request_id, normalized_q)
        return {"results": json.loads(cached), "provider": "cached", "status": "ok"}

    event_set = event.wait(timeout=REQUEST_TIMEOUT_S)
    _cleanup_waiter(redis_conn, request_id, normalized_q)

    if event_set and state.result is not None:
        return {"results": state.result, "provider": "queued", "status": "ok"}

    cached = redis_conn.get(f"{RESULT_PREFIX}{normalized_q}")
    if cached:
        return {"results": json.loads(cached), "provider": "cached", "status": "ok"}

    return {"results": None, "provider": None, "status": "timeout"}


def _cleanup_waiter(redis_conn, request_id, normalized_q):
    with _registry_lock:
        _request_registry.pop(request_id, None)
    redis_conn.srem(f"{WAITERS_FOR_PREFIX}{normalized_q}", request_id)


def start_worker():
    global _worker_thread
    if _worker_thread is not None and _worker_thread.is_alive():
        return
    _stop_event.clear()
    _worker_thread = threading.Thread(
        target=_queue_worker, args=(_stop_event,), daemon=True
    )
    _worker_thread.start()


def stop_worker():
    _stop_event.set()
    if _worker_thread is not None:
        _worker_thread.join(timeout=5)

import json
import threading
from unittest.mock import MagicMock, patch

from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from location.queue import (
    QUEUE_KEY,
    RESULT_PREFIX,
    WAITERS_FOR_PREFIX,
    RequestState,
    _normalize_query,
    _process_one,
    _request_registry,
    _registry_lock,
    enqueue_request,
    get_client_ip,
    start_worker,
    stop_worker,
)


class TestNormalizeQuery(TestCase):
    def test_basic(self):
        self.assertEqual(_normalize_query("Berlin", "de"), "berlin|de")

    def test_empty_countrycodes(self):
        self.assertEqual(_normalize_query("Berlin", ""), "berlin|")

    def test_strips_whitespace(self):
        self.assertEqual(_normalize_query("  Berlin  ", "  DE  "), "berlin|de")

    def test_case_insensitive(self):
        self.assertEqual(_normalize_query("BERLIN", "DE"), "berlin|de")


class TestGetClientIp(TestCase):
    def test_direct(self):
        request = MagicMock()
        request.META = {"REMOTE_ADDR": "1.2.3.4"}
        self.assertEqual(get_client_ip(request), "1.2.3.4")

    def test_x_forwarded_for(self):
        request = MagicMock()
        request.META = {
            "HTTP_X_FORWARDED_FOR": "5.6.7.8, 9.10.11.12",
            "REMOTE_ADDR": "1.2.3.4",
        }
        self.assertEqual(get_client_ip(request), "5.6.7.8")

    def test_no_ip(self):
        request = MagicMock()
        request.META = {}
        self.assertIsNone(get_client_ip(request))


def _make_mock_redis():
    store = {}

    def _get(key):
        val = store.get(key)
        if val is None:
            return None
        return val.encode() if isinstance(val, str) else val

    def _set(key, value, nx=False, ex=None):
        if nx and key in store:
            return False
        store[key] = value
        return True

    def _setex(key, ttl, value):
        store[key] = value

    def _delete(key):
        store.pop(key, None)

    def _llen(key):
        return len(store.get(key, []))

    def _lpush(key, value):
        store.setdefault(key, []).append(value)

    def _brpop(key, timeout=0):
        lst = store.get(key, [])
        if lst:
            val = lst.pop(0)
            return (key, val.encode() if isinstance(val, str) else val)
        return None

    def _sadd(key, value):
        store.setdefault(key, set()).add(value)

    def _smembers(key):
        return store.get(key, set())

    def _srem(key, value):
        s = store.get(key)
        if s:
            s.discard(value)

    def _expire(key, ttl):
        pass

    redis = MagicMock()
    redis.get = MagicMock(side_effect=_get)
    redis.set = MagicMock(side_effect=_set)
    redis.setex = MagicMock(side_effect=_setex)
    redis.delete = MagicMock(side_effect=_delete)
    redis.llen = MagicMock(side_effect=_llen)
    redis.lpush = MagicMock(side_effect=_lpush)
    redis.brpop = MagicMock(side_effect=_brpop)
    redis.sadd = MagicMock(side_effect=_sadd)
    redis.smembers = MagicMock(side_effect=_smembers)
    redis.srem = MagicMock(side_effect=_srem)
    redis.expire = MagicMock(side_effect=_expire)
    redis._store = store
    return redis


class TestEnqueueRequest(TestCase):
    def setUp(self):
        _request_registry.clear()

    def tearDown(self):
        _request_registry.clear()

    @patch("location.queue.get_redis_conn")
    def test_returns_cached_result(self, mock_conn):
        mock_redis = _make_mock_redis()
        mock_conn.return_value = mock_redis
        cached_data = [{"display_name": "Berlin, Germany"}]
        mock_redis._store[f"{RESULT_PREFIX}berlin|de"] = json.dumps(cached_data)
        result = enqueue_request("Berlin", "de", "en")
        self.assertEqual(result["status"], "ok")
        self.assertEqual(result["results"], cached_data)
        self.assertEqual(result["provider"], "cached")

    @patch("location.queue.get_redis_conn")
    def test_queue_full_returns_error(self, mock_conn):
        mock_redis = _make_mock_redis()
        mock_conn.return_value = mock_redis
        mock_redis._store[QUEUE_KEY] = ["x"] * 100
        result = enqueue_request("Berlin", "de", "en")
        self.assertEqual(result["status"], "queue_full")

    @patch("location.queue.get_redis_conn")
    def test_redis_down_falls_back(self, mock_conn):
        mock_conn.side_effect = Exception("Redis connection refused")
        with patch(
            "location.queue._fetch_results",
            return_value=([{"test": True}], "locationiq"),
        ):
            result = enqueue_request("Berlin", "de", "en")
        self.assertEqual(result["status"], "ok")
        self.assertEqual(result["provider"], "locationiq")


class TestWorkerDeduplication(TestCase):
    def setUp(self):
        _request_registry.clear()

    def tearDown(self):
        _request_registry.clear()

    @patch("location.queue.get_redis_conn")
    @patch("location.queue.DRAIN_INTERVAL_S", 0.01)
    @patch("location.queue.REQUEST_TIMEOUT_S", 10)
    def test_same_query_only_one_fetch(self, mock_conn):
        mock_redis = _make_mock_redis()
        mock_conn.return_value = mock_redis

        call_count = 0

        def mock_fetch(q, countrycodes, accept_language):
            nonlocal call_count
            call_count += 1
            return [{"display_name": f"{q}, Germany"}], "locationiq"

        results = []

        def make_request():
            result = enqueue_request("Berlin", "de", "en")
            results.append(result)

        with patch("location.queue._fetch_results", side_effect=mock_fetch):
            start_worker()
            try:
                threads = [threading.Thread(target=make_request) for _ in range(3)]
                for t in threads:
                    t.start()
                for t in threads:
                    t.join(timeout=15)
            finally:
                stop_worker()

        for r in results:
            self.assertEqual(r["status"], "ok")
        self.assertEqual(call_count, 1)


class TestWorkerTimeout(TestCase):
    def setUp(self):
        _request_registry.clear()

    def tearDown(self):
        _request_registry.clear()

    @patch("location.queue.get_redis_conn")
    def test_timeout_returns_timeout(self, mock_conn):
        mock_redis = _make_mock_redis()
        mock_conn.return_value = mock_redis
        with patch("location.queue.REQUEST_TIMEOUT_S", 0.3):
            result = enqueue_request("TestCity", "us", "en")
        self.assertEqual(result["status"], "timeout")


class TestProcessOne(TestCase):
    @patch("location.queue.get_redis_conn")
    def test_process_one_signals_waiters(self, mock_conn):
        mock_redis = _make_mock_redis()
        mock_conn.return_value = mock_redis

        event = threading.Event()
        state = RequestState(
            request_id="test123", event=event, result=None, arrived_at=0
        )
        with _registry_lock:
            _request_registry["test123"] = state

        normalized_q = "berlin|de"
        mock_redis.sadd(f"{WAITERS_FOR_PREFIX}{normalized_q}", "test123")

        item = json.dumps(
            {
                "request_id": "test123",
                "q": "Berlin",
                "countrycodes": "de",
                "accept_language": "en",
                "normalized_q": normalized_q,
                "ts": 0,
            }
        )

        with patch(
            "location.queue._fetch_results",
            return_value=([{"display_name": "Berlin"}], "locationiq"),
        ):
            _process_one(item.encode(), mock_redis)

        self.assertTrue(event.is_set())
        self.assertEqual(state.result, [{"display_name": "Berlin"}])

    @patch("location.queue.get_redis_conn")
    def test_process_one_skips_if_cached(self, mock_conn):
        mock_redis = _make_mock_redis()
        mock_conn.return_value = mock_redis

        normalized_q = "berlin|de"
        cached = [{"display_name": "Berlin Cached"}]
        mock_redis._store[f"{RESULT_PREFIX}{normalized_q}"] = json.dumps(cached)

        event = threading.Event()
        state = RequestState(
            request_id="test456", event=event, result=None, arrived_at=0
        )
        with _registry_lock:
            _request_registry["test456"] = state
        mock_redis.sadd(f"{WAITERS_FOR_PREFIX}{normalized_q}", "test456")

        item = json.dumps(
            {
                "request_id": "test456",
                "q": "Berlin",
                "countrycodes": "de",
                "accept_language": "en",
                "normalized_q": normalized_q,
                "ts": 0,
            }
        )

        with patch("location.queue._fetch_results") as mock_fetch:
            _process_one(item.encode(), mock_redis)

        mock_fetch.assert_not_called()
        self.assertTrue(event.is_set())
        self.assertEqual(state.result, cached)


class TestLocationAutocompleteView(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("location:location-autocomplete")
        _request_registry.clear()

    def tearDown(self):
        _request_registry.clear()

    @override_settings(RATELIMIT_ENABLE=False)
    def test_short_query_returns_empty(self):
        response = self.client.get(self.url, {"q": "Be"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    @patch("location.queue.enqueue_request")
    @override_settings(RATELIMIT_ENABLE=False)
    def test_returns_results_through_queue(self, mock_enqueue):
        mock_enqueue.return_value = {
            "results": [{"display_name": "Berlin"}],
            "provider": "locationiq",
            "status": "ok",
        }
        response = self.client.get(self.url, {"q": "Berlin"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    @patch("location.queue.enqueue_request")
    @override_settings(RATELIMIT_ENABLE=False)
    def test_queue_full_returns_429(self, mock_enqueue):
        mock_enqueue.return_value = {
            "results": None,
            "provider": None,
            "status": "queue_full",
        }
        response = self.client.get(self.url, {"q": "Berlin"})
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    @patch("location.queue.enqueue_request")
    @override_settings(RATELIMIT_ENABLE=False)
    def test_timeout_returns_504(self, mock_enqueue):
        mock_enqueue.return_value = {
            "results": None,
            "provider": None,
            "status": "timeout",
        }
        response = self.client.get(self.url, {"q": "Berlin"})
        self.assertEqual(response.status_code, status.HTTP_504_GATEWAY_TIMEOUT)

    @patch("location.queue.enqueue_request")
    @override_settings(RATELIMIT_ENABLE=False)
    def test_no_results_returns_502(self, mock_enqueue):
        mock_enqueue.return_value = {
            "results": None,
            "provider": None,
            "status": "ok",
        }
        response = self.client.get(self.url, {"q": "Berlin"})
        self.assertEqual(response.status_code, status.HTTP_502_BAD_GATEWAY)

    @patch("django_ratelimit.core.is_ratelimited", return_value=True)
    def test_ratelimit_returns_429(self, mock_rl):
        response = self.client.get(self.url, {"q": "Berlin"})
        self.assertEqual(response.status_code, 429)
        self.assertIn("Retry-After", response)

import datetime as dt
import json
import time
from unittest.mock import MagicMock, patch

from django.core.cache import cache
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from location.queue import (
    LOCATIONIQ_LOOKUP_KEY_PREFIX,
    LOCATIONIQ_PENDING_JOBS_KEY,
    _locationiq_daily_budget_exceeded,
    _normalize_query,
    _store_result,
    _try_locationiq,
    get_client_ip,
)
from location.tasks import fetch_autocomplete


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
    """
    Single-process, in-memory stand-in for the LocationIQ rendezvous. Only
    implements the redis-py surface this design actually uses (string
    get/set/setex/delete and the pending_jobs sorted set).
    """
    store = {}
    zsets = {}

    def _to_score(value):
        if isinstance(value, str):
            if value.lstrip("+") in ("inf", "Inf", "INF") and value.startswith("-"):
                return float("-inf")
            if value in ("+inf", "inf", "+Inf", "INF"):
                return float("inf")
            if value == "-inf":
                return float("-inf")
            return float(value)
        return float(value)

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
        return True

    def _delete(key):
        store.pop(key, None)

    def _zadd(key, mapping):
        zsets.setdefault(key, {}).update(mapping)

    def _zcard(key):
        return len(zsets.get(key, {}))

    def _zrem(key, member):
        zsets.get(key, {}).pop(member, None)

    def _zremrangebyscore(key, min_score, max_score):
        members = zsets.get(key, {})
        lo, hi = _to_score(min_score), _to_score(max_score)
        for member in [m for m, s in members.items() if lo <= s <= hi]:
            members.pop(member, None)

    redis = MagicMock()
    redis.get = MagicMock(side_effect=_get)
    redis.set = MagicMock(side_effect=_set)
    redis.setex = MagicMock(side_effect=_setex)
    redis.delete = MagicMock(side_effect=_delete)
    redis.zadd = MagicMock(side_effect=_zadd)
    redis.zcard = MagicMock(side_effect=_zcard)
    redis.zrem = MagicMock(side_effect=_zrem)
    redis.zremrangebyscore = MagicMock(side_effect=_zremrangebyscore)
    redis._store = store
    redis._zsets = zsets
    return redis


class TestTryLocationiq(TestCase):
    def test_no_api_key_skips_locationiq(self):
        with override_settings(LOCATIONIQ_API_KEY=""):
            results, provider = _try_locationiq("berlin", "", "en")
        self.assertIsNone(results)
        self.assertIsNone(provider)

    @override_settings(LOCATIONIQ_API_KEY="test-key")
    @patch("location.queue.requests.get")
    def test_empty_result_list_is_success_not_failure(self, mock_get):
        # A valid 200 with an empty list is a real "no matches" answer, not
        # a failure — it must not trigger a Nominatim fallback attempt.
        mock_get.return_value = MagicMock(status_code=200, json=lambda: [])
        results, provider = _try_locationiq("asdkjasjdk", "", "en")
        self.assertEqual(results, [])
        self.assertEqual(provider, "locationiq")

    @override_settings(LOCATIONIQ_API_KEY="test-key")
    @patch("location.queue.requests.get")
    def test_non_list_body_is_a_failure(self, mock_get):
        mock_get.return_value = MagicMock(
            status_code=200, json=lambda: {"error": "bad"}
        )
        results, provider = _try_locationiq("berlin", "", "en")
        self.assertIsNone(results)
        self.assertIsNone(provider)

    @override_settings(LOCATIONIQ_API_KEY="test-key", LOCATIONIQ_DAILY_BUDGET=5)
    @patch("location.queue._locationiq_daily_budget_exceeded", return_value=True)
    @patch("location.queue.requests.get")
    def test_daily_budget_exceeded_skips_locationiq_entirely(
        self, mock_get, _mock_budget
    ):
        results, provider = _try_locationiq("berlin", "", "en")
        self.assertIsNone(results)
        self.assertIsNone(provider)
        mock_get.assert_not_called()


class TestLocationiqDailyBudget(TestCase):
    def _seed_today(self, total_requests):
        from location.models import NominatimPeriodStats

        today_key = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d")
        NominatimPeriodStats.objects.create(
            period_type="day",
            period_key=today_key,
            provider="locationiq",
            total_requests=total_requests,
        )

    def test_not_configured_never_exceeded(self):
        with override_settings(LOCATIONIQ_DAILY_BUDGET=None):
            self.assertFalse(_locationiq_daily_budget_exceeded())

    @override_settings(LOCATIONIQ_DAILY_BUDGET=5)
    def test_below_budget_not_exceeded(self):
        self._seed_today(4)
        self.assertFalse(_locationiq_daily_budget_exceeded())

    @override_settings(LOCATIONIQ_DAILY_BUDGET=5)
    def test_at_budget_is_exceeded(self):
        self._seed_today(5)
        self.assertTrue(_locationiq_daily_budget_exceeded())

    @override_settings(LOCATIONIQ_DAILY_BUDGET=5)
    def test_no_rows_yet_not_exceeded(self):
        self.assertFalse(_locationiq_daily_budget_exceeded())


class TestStoreResult(TestCase):
    @override_settings(LOCATIONIQ_RESULT_TTL_S=300, LOCATIONIQ_NEGATIVE_TTL_S=8)
    def test_success_uses_positive_ttl(self):
        mock_redis = _make_mock_redis()
        _store_result(mock_redis, "key1", "job1", [{"a": 1}], "locationiq")
        key, ttl, payload = mock_redis.setex.call_args[0]
        self.assertEqual(key, "key1")
        self.assertEqual(ttl, 300)
        stored = json.loads(payload)
        self.assertEqual(
            stored,
            {
                "status": "done",
                "results": [{"a": 1}],
                "provider": "locationiq",
                "job_id": "job1",
            },
        )

    @override_settings(LOCATIONIQ_RESULT_TTL_S=300, LOCATIONIQ_NEGATIVE_TTL_S=8)
    def test_empty_but_real_result_uses_positive_ttl(self):
        # Distinguishes a legitimate "no matches" ([]) from a failure (None).
        mock_redis = _make_mock_redis()
        _store_result(mock_redis, "key1", "job1", [], "locationiq")
        _, ttl, _ = mock_redis.setex.call_args[0]
        self.assertEqual(ttl, 300)

    @override_settings(LOCATIONIQ_RESULT_TTL_S=300, LOCATIONIQ_NEGATIVE_TTL_S=8)
    def test_failure_uses_negative_ttl(self):
        mock_redis = _make_mock_redis()
        _store_result(mock_redis, "key1", "job1", None, None)
        _, ttl, payload = mock_redis.setex.call_args[0]
        self.assertEqual(ttl, 8)
        self.assertIsNone(json.loads(payload)["results"])


class TestFetchAutocompleteTask(TestCase):
    @patch("location.location_views._increment_counters")
    @patch("location.tasks._fetch_results")
    @patch("location.tasks.get_redis_conn")
    def test_success_stores_result_and_clears_pending(
        self, mock_conn, mock_fetch, mock_incr
    ):
        mock_redis = _make_mock_redis()
        mock_conn.return_value = mock_redis
        mock_fetch.return_value = ([{"display_name": "Berlin"}], "locationiq")
        key = f"{LOCATIONIQ_LOOKUP_KEY_PREFIX}berlin|"
        mock_redis._store[key] = json.dumps({"status": "pending", "job_id": "job1"})
        mock_redis._zsets[LOCATIONIQ_PENDING_JOBS_KEY] = {key: time.time()}

        fetch_autocomplete.run(key, "job1", "Berlin", "", "en")

        stored = json.loads(mock_redis._store[key])
        self.assertEqual(stored["status"], "done")
        self.assertEqual(stored["results"], [{"display_name": "Berlin"}])
        self.assertNotIn(key, mock_redis._zsets.get(LOCATIONIQ_PENDING_JOBS_KEY, {}))
        mock_incr.assert_called_once_with("locationiq")

    @patch("location.location_views._increment_counters")
    @patch("location.tasks._fetch_results")
    @patch("location.tasks.get_redis_conn")
    def test_superseded_generation_does_not_overwrite(
        self, mock_conn, mock_fetch, mock_incr
    ):
        mock_redis = _make_mock_redis()
        mock_conn.return_value = mock_redis
        mock_fetch.return_value = ([{"display_name": "Stale"}], "locationiq")
        key = f"{LOCATIONIQ_LOOKUP_KEY_PREFIX}berlin|"
        # A newer generation already overwrote the sentinel under a different job_id.
        mock_redis._store[key] = json.dumps({"status": "pending", "job_id": "job2"})

        fetch_autocomplete.run(key, "job1", "Berlin", "", "en")

        self.assertEqual(
            json.loads(mock_redis._store[key]), {"status": "pending", "job_id": "job2"}
        )
        mock_incr.assert_not_called()

    @patch("location.location_views._increment_counters")
    @patch("location.tasks._fetch_results", side_effect=RuntimeError("boom"))
    @patch("location.tasks.get_redis_conn")
    def test_unexpected_exception_still_resolves_to_terminal_state(
        self, mock_conn, _mock_fetch, mock_incr
    ):
        mock_redis = _make_mock_redis()
        mock_conn.return_value = mock_redis
        key = f"{LOCATIONIQ_LOOKUP_KEY_PREFIX}berlin|"
        mock_redis._store[key] = json.dumps({"status": "pending", "job_id": "job1"})

        fetch_autocomplete.run(key, "job1", "Berlin", "", "en")

        stored = json.loads(mock_redis._store[key])
        self.assertEqual(stored["status"], "done")
        self.assertIsNone(stored["results"])
        mock_incr.assert_not_called()


class TestLocationAutocompleteView(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse("location:location-autocomplete")
        cache.clear()

    @override_settings(RATELIMIT_ENABLE=False)
    def test_short_query_returns_empty(self):
        response = self.client.get(self.url, {"q": "Be"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    @override_settings(RATELIMIT_ENABLE=False)
    def test_too_long_query_returns_empty(self):
        response = self.client.get(self.url, {"q": "b" * 201})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    @override_settings(RATELIMIT_ENABLE=False)
    @patch("location.location_views.get_redis_conn")
    def test_cache_hit_returns_200_with_results(self, mock_conn):
        mock_redis = _make_mock_redis()
        mock_conn.return_value = mock_redis
        key = f"{LOCATIONIQ_LOOKUP_KEY_PREFIX}berlin|"
        mock_redis._store[key] = json.dumps(
            {
                "status": "done",
                "results": [{"display_name": "Berlin"}],
                "provider": "locationiq",
                "job_id": "j",
            }
        )
        response = self.client.get(self.url, {"q": "Berlin"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    @override_settings(RATELIMIT_ENABLE=False)
    @patch("location.location_views.get_redis_conn")
    def test_cache_hit_with_empty_results_returns_200_with_empty_list(self, mock_conn):
        mock_redis = _make_mock_redis()
        mock_conn.return_value = mock_redis
        key = f"{LOCATIONIQ_LOOKUP_KEY_PREFIX}berlin|"
        mock_redis._store[key] = json.dumps(
            {"status": "done", "results": [], "provider": "locationiq", "job_id": "j"}
        )
        response = self.client.get(self.url, {"q": "Berlin"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    @override_settings(RATELIMIT_ENABLE=False)
    @patch("location.location_views.get_redis_conn")
    def test_pending_sentinel_returns_202(self, mock_conn):
        mock_redis = _make_mock_redis()
        mock_conn.return_value = mock_redis
        key = f"{LOCATIONIQ_LOOKUP_KEY_PREFIX}berlin|"
        mock_redis._store[key] = json.dumps({"status": "pending", "job_id": "j"})
        response = self.client.get(self.url, {"q": "Berlin"})
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)

    @override_settings(RATELIMIT_ENABLE=False)
    @patch("location.location_views.fetch_autocomplete.apply_async")
    @patch("location.location_views.get_redis_conn")
    def test_new_query_creates_sentinel_and_dispatches_task(
        self, mock_conn, mock_apply_async
    ):
        mock_redis = _make_mock_redis()
        mock_conn.return_value = mock_redis

        response = self.client.get(self.url, {"q": "Berlin"})

        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        mock_apply_async.assert_called_once()
        key = f"{LOCATIONIQ_LOOKUP_KEY_PREFIX}berlin|"
        self.assertIn(key, mock_redis._store)
        self.assertEqual(json.loads(mock_redis._store[key])["status"], "pending")
        self.assertIn(key, mock_redis._zsets.get(LOCATIONIQ_PENDING_JOBS_KEY, {}))

    @override_settings(RATELIMIT_ENABLE=False, LOCATIONIQ_PENDING_CAP=1)
    @patch("location.location_views.fetch_autocomplete.apply_async")
    @patch("location.location_views.get_redis_conn")
    def test_backpressure_cap_returns_503(self, mock_conn, mock_apply_async):
        mock_redis = _make_mock_redis()
        mock_conn.return_value = mock_redis
        mock_redis._zsets[LOCATIONIQ_PENDING_JOBS_KEY] = {"some:other:key": time.time()}

        response = self.client.get(self.url, {"q": "Berlin"})

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        mock_apply_async.assert_not_called()

    @override_settings(RATELIMIT_ENABLE=False)
    @patch("location.location_views._fetch_results")
    @patch(
        "location.location_views.fetch_autocomplete.apply_async",
        side_effect=Exception("broker down"),
    )
    @patch("location.location_views.get_redis_conn")
    def test_broker_unavailable_falls_back_to_direct_fetch(
        self, mock_conn, _mock_apply_async, mock_fetch
    ):
        mock_redis = _make_mock_redis()
        mock_conn.return_value = mock_redis
        mock_fetch.return_value = ([{"display_name": "Berlin"}], "locationiq")

        response = self.client.get(self.url, {"q": "Berlin"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        key = f"{LOCATIONIQ_LOOKUP_KEY_PREFIX}berlin|"
        # Terminal state written directly, and the backpressure slot released
        # rather than leaked until sentinel-TTL pruning.
        self.assertEqual(json.loads(mock_redis._store[key])["status"], "done")
        self.assertNotIn(key, mock_redis._zsets.get(LOCATIONIQ_PENDING_JOBS_KEY, {}))

    @patch("location.location_views.get_redis_conn")
    def test_pending_poll_does_not_consume_strict_ip_limit(self, mock_conn):
        mock_redis = _make_mock_redis()
        mock_conn.return_value = mock_redis
        key = f"{LOCATIONIQ_LOOKUP_KEY_PREFIX}berlin|"
        mock_redis._store[key] = json.dumps({"status": "pending", "job_id": "j"})

        with override_settings(
            LOCATIONIQ_IP_RATE_STRICT="1/s", LOCATIONIQ_IP_RATE_LOOSE="1000/s"
        ):
            for _ in range(5):
                response = self.client.get(self.url, {"q": "Berlin"})
                self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)

    @patch("location.location_views.fetch_autocomplete.apply_async")
    @patch("location.location_views.get_redis_conn")
    def test_strict_limit_blocks_second_new_query_same_second(
        self, mock_conn, _mock_apply_async
    ):
        mock_redis = _make_mock_redis()
        mock_conn.return_value = mock_redis

        with override_settings(
            LOCATIONIQ_IP_RATE_STRICT="1/s", LOCATIONIQ_IP_RATE_LOOSE="1000/s"
        ):
            first = self.client.get(self.url, {"q": "Berlin"})
            second = self.client.get(
                self.url, {"q": "Munich"}
            )  # distinct query, not a poll

        self.assertEqual(first.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(second.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertIn("Retry-After", second)

    @patch("location.location_views.get_redis_conn")
    def test_loose_limit_blocks_all_traffic_including_polls(self, mock_conn):
        mock_redis = _make_mock_redis()
        mock_conn.return_value = mock_redis
        key = f"{LOCATIONIQ_LOOKUP_KEY_PREFIX}berlin|"
        mock_redis._store[key] = json.dumps({"status": "pending", "job_id": "j"})

        with override_settings(LOCATIONIQ_IP_RATE_LOOSE="1/s"):
            first = self.client.get(self.url, {"q": "Berlin"})
            second = self.client.get(self.url, {"q": "Berlin"})

        self.assertEqual(first.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(second.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

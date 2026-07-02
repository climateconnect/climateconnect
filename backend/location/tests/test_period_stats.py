import concurrent.futures
import time
from datetime import datetime, timezone
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase, TransactionTestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from location.location_views import (
    _get_current_period_keys,
    _increment_nominatim_counters,
)
from location.models import NominatimPeriodStats, NominatimRequestLog

User = get_user_model()


class TestIncrementNominatimCounters(TestCase):
    """Tests for the _increment_nominatim_counters() function."""

    def setUp(self):
        NominatimPeriodStats.objects.all().delete()
        NominatimRequestLog.objects.all().delete()

    def test_single_request_creates_all_period_rows(self):
        _increment_nominatim_counters()

        now = int(time.time())
        periods = _get_current_period_keys(now)

        for period_type, period_key, _ in periods:
            stats = NominatimPeriodStats.objects.get(
                period_type=period_type, period_key=period_key
            )
            self.assertEqual(stats.total_requests, 1)
            self.assertGreater(stats.avg_req_per_second, 0)
            self.assertAlmostEqual(stats.peak_req_per_second, 1 / 60, places=4)

    def test_60_requests_in_one_minute(self):
        for _ in range(60):
            _increment_nominatim_counters()

        now = int(time.time())
        periods = _get_current_period_keys(now)

        for period_type, period_key, _ in periods:
            stats = NominatimPeriodStats.objects.get(
                period_type=period_type, period_key=period_key
            )
            self.assertEqual(stats.total_requests, 60)
            self.assertAlmostEqual(stats.peak_req_per_second, 1.0, places=4)

    def test_requests_span_two_minutes_peak_preserved(self):
        fixed_now = int(time.time())
        fixed_minute_key = fixed_now // 60

        with patch("location.location_views.time") as mock_time:
            mock_time.time.return_value = fixed_minute_key * 60 + 30
            for _ in range(30):
                _increment_nominatim_counters()

            mock_time.time.return_value = (fixed_minute_key + 1) * 60 + 5
            for _ in range(10):
                _increment_nominatim_counters()

        periods = _get_current_period_keys(fixed_now)
        for period_type, period_key, _ in periods:
            stats = NominatimPeriodStats.objects.get(
                period_type=period_type, period_key=period_key
            )
            self.assertEqual(stats.total_requests, 40)
            self.assertAlmostEqual(stats.peak_req_per_second, 0.5, places=4)

    def test_old_minute_buckets_deleted_on_request(self):
        now = int(time.time())
        yesterday_bucket = (now // 86400 - 1) * 24 * 60 + 720
        NominatimRequestLog.objects.create(minute_key=yesterday_bucket, processed=True)

        _increment_nominatim_counters()

        self.assertFalse(
            NominatimRequestLog.objects.filter(minute_key=yesterday_bucket).exists()
        )
        today_bucket = now // 60
        self.assertTrue(
            NominatimRequestLog.objects.filter(minute_key=today_bucket).exists()
        )

    def test_new_iso_week_creates_new_row(self):
        fixed_ts = int(datetime(2026, 6, 15, 12, 0, 0, tzinfo=timezone.utc).timestamp())

        with patch("location.location_views.time") as mock_time:
            mock_time.time.return_value = fixed_ts
            _increment_nominatim_counters()

        stats = NominatimPeriodStats.objects.get(
            period_type="week", period_key="2026-W25"
        )
        self.assertEqual(stats.total_requests, 1)

    def test_first_of_month_creates_new_row(self):
        fixed_ts = int(datetime(2026, 7, 1, 12, 0, 0, tzinfo=timezone.utc).timestamp())

        with patch("location.location_views.time") as mock_time:
            mock_time.time.return_value = fixed_ts
            _increment_nominatim_counters()

        stats = NominatimPeriodStats.objects.get(
            period_type="month", period_key="2026-07"
        )
        self.assertEqual(stats.total_requests, 1)


class TestConcurrentIncrements(TransactionTestCase):
    """
    Concurrency proof: N concurrent tracked requests produce exactly N total_requests.

    Uses TransactionTestCase because ThreadPoolExecutor spawns threads that use
    separate DB connections — the outer TestCase transaction cannot cover them.
    """

    def setUp(self):
        NominatimPeriodStats.objects.all().delete()
        NominatimRequestLog.objects.all().delete()

    def test_concurrent_increments_zero_lost(self):
        N = 100

        with concurrent.futures.ThreadPoolExecutor(max_workers=20) as pool:
            futures = [pool.submit(_increment_nominatim_counters) for _ in range(N)]
            concurrent.futures.wait(futures)

        now = int(time.time())
        periods = _get_current_period_keys(now)

        for period_type, period_key, _ in periods:
            stats = NominatimPeriodStats.objects.get(
                period_type=period_type, period_key=period_key
            )
            self.assertEqual(
                stats.total_requests,
                N,
                f"{period_type}: expected {N}, got {stats.total_requests}",
            )


class TestGetCurrentPeriodKeys(TestCase):
    """Tests for the _get_current_period_keys() helper."""

    def test_iso_year_boundary_dec_29(self):
        dt = datetime(2025, 12, 29, 12, 0, 0, tzinfo=timezone.utc)
        epoch = int(dt.timestamp())

        periods = _get_current_period_keys(epoch)
        week_entry = [p for p in periods if p[0] == "week"][0]

        self.assertEqual(week_entry[1], "2026-W01")

    def test_returns_day_week_month(self):
        now = int(time.time())
        periods = _get_current_period_keys(now)

        period_types = [p[0] for p in periods]
        self.assertEqual(period_types, ["day", "week", "month"])

    def test_period_key_formats(self):
        dt = datetime(2026, 6, 11, 14, 30, 0, tzinfo=timezone.utc)
        epoch = int(dt.timestamp())

        periods = _get_current_period_keys(epoch)
        by_type = {p[0]: p[1] for p in periods}

        self.assertEqual(by_type["day"], "2026-06-11")
        self.assertEqual(by_type["week"], "2026-W24")
        self.assertEqual(by_type["month"], "2026-06")


class TestNominatimStatsView(APITestCase):
    """Tests for GET /api/nominatim_stats/."""

    def setUp(self):
        NominatimPeriodStats.objects.all().delete()
        NominatimRequestLog.objects.all().delete()

        self.url = reverse("location:nominatim-stats")
        self.admin = User.objects.create_user(
            username="stats_admin", password="testpass", is_staff=True
        )
        self.regular_user = User.objects.create_user(
            username="stats_regular", password="testpass"
        )

        for i in range(7):
            key = f"2026-06-{11 - i:02d}"
            NominatimPeriodStats.objects.create(
                period_type="day",
                period_key=key,
                total_requests=100 + i,
                avg_req_per_second=0.01 + i * 0.001,
                peak_req_per_second=0.1 + i * 0.01,
            )
        for i in range(4):
            NominatimPeriodStats.objects.create(
                period_type="week",
                period_key=f"2026-W{24 - i:02d}",
                total_requests=700 + i,
                avg_req_per_second=0.008 + i * 0.001,
                peak_req_per_second=0.2 + i * 0.01,
            )
        NominatimPeriodStats.objects.create(
            period_type="month",
            period_key="2026-06",
            total_requests=5000,
            avg_req_per_second=0.005,
            peak_req_per_second=0.3,
        )

    def test_no_params_returns_day_week_month(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("day", response.data)
        self.assertIn("week", response.data)
        self.assertIn("month", response.data)

        self.assertEqual(response.data["day"]["period_key"], "2026-06-11")
        self.assertEqual(response.data["week"]["period_key"], "2026-W24")
        self.assertEqual(response.data["month"]["period_key"], "2026-06")

    def test_period_type_with_limit(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url, {"period_type": "week", "limit": 4})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["period_type"], "week")
        self.assertEqual(len(response.data["periods"]), 4)
        self.assertEqual(response.data["periods"][0]["period_key"], "2026-W24")
        self.assertEqual(response.data["periods"][3]["period_key"], "2026-W21")

    def test_period_type_default_limit_is_1(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url, {"period_type": "day"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["periods"]), 1)

    def test_limit_capped_at_365(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url, {"period_type": "day", "limit": 999})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["periods"]), 7)

    def test_unauthenticated_user_rejected(self):
        response = self.client.get(self.url)
        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )

    def test_requires_auth(self):
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_invalid_period_type_returns_400(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url, {"period_type": "year"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid period_type", response.data["detail"])

    def test_invalid_limit_returns_400(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(self.url, {"period_type": "day", "limit": "abc"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid", response.data["detail"])


class TestTrackNominatimRequestView(APITestCase):
    """Tests for POST /api/nominatim_request_count/."""

    def setUp(self):
        NominatimPeriodStats.objects.all().delete()
        NominatimRequestLog.objects.all().delete()

    def test_post_returns_204(self):
        url = reverse("location:track-nominatim-request")
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_post_creates_period_stats(self):
        url = reverse("location:track-nominatim-request")
        self.client.post(url)

        now = int(time.time())
        periods = _get_current_period_keys(now)

        for period_type, period_key, _ in periods:
            self.assertTrue(
                NominatimPeriodStats.objects.filter(
                    period_type=period_type, period_key=period_key
                ).exists()
            )

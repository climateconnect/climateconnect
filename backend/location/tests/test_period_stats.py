from datetime import datetime, timedelta, timezone
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone as tz
from rest_framework import status
from rest_framework.test import APITestCase

from location.tasks import _get_period_keys_for_dt, aggregate_nominatim_stats
from location.models import NominatimPeriodStats, NominatimRequestLog

User = get_user_model()


class TestGetPeriodKeysForDt(TestCase):
    """Tests for the _get_period_keys_for_dt() helper."""

    def test_iso_year_boundary_dec_29(self):
        dt = datetime(2025, 12, 29, 12, 0, 0, tzinfo=timezone.utc)
        periods = _get_period_keys_for_dt(dt)
        week_entry = [p for p in periods if p[0] == "week"][0]

        self.assertEqual(week_entry[1], "2026-W01")

    def test_returns_day_week_month(self):
        dt = tz.now()
        periods = _get_period_keys_for_dt(dt)

        period_types = [p[0] for p in periods]
        self.assertEqual(period_types, ["day", "week", "month"])

    def test_period_key_formats(self):
        dt = datetime(2026, 6, 11, 14, 30, 0, tzinfo=timezone.utc)
        periods = _get_period_keys_for_dt(dt)
        by_type = {p[0]: p[1] for p in periods}

        self.assertEqual(by_type["day"], "2026-06-11")
        self.assertEqual(by_type["week"], "2026-W24")
        self.assertEqual(by_type["month"], "2026-06")


class TestAggregateNominatimStats(TestCase):
    """Tests for the aggregate_nominatim_stats Celery task."""

    def setUp(self):
        NominatimPeriodStats.objects.all().delete()
        NominatimRequestLog.objects.all().delete()

    def test_single_request_creates_all_period_rows(self):
        NominatimRequestLog.objects.create()

        aggregate_nominatim_stats()

        now = tz.now()
        periods = _get_period_keys_for_dt(now)

        for period_type, period_key, _ in periods:
            stats = NominatimPeriodStats.objects.get(
                period_type=period_type, period_key=period_key
            )
            self.assertEqual(stats.total_requests, 1)
            self.assertGreater(stats.avg_req_per_second, 0)
            self.assertEqual(stats.peak_req_per_second, 1)

    def test_60_requests_in_same_second(self):
        now = tz.now()
        for _ in range(60):
            NominatimRequestLog.objects.create(created_at=now)

        aggregate_nominatim_stats()

        periods = _get_period_keys_for_dt(now)

        for period_type, period_key, _ in periods:
            stats = NominatimPeriodStats.objects.get(
                period_type=period_type, period_key=period_key
            )
            self.assertEqual(stats.total_requests, 60)
            self.assertEqual(stats.peak_req_per_second, 60)

    def test_requests_across_seconds_peak_is_max(self):
        base = tz.now().replace(microsecond=0)
        second1 = base
        second2 = base + timedelta(seconds=1)

        for _ in range(30):
            NominatimRequestLog.objects.create(created_at=second1)
        for _ in range(10):
            NominatimRequestLog.objects.create(created_at=second2)

        aggregate_nominatim_stats()

        periods = _get_period_keys_for_dt(base)
        for period_type, period_key, _ in periods:
            stats = NominatimPeriodStats.objects.get(
                period_type=period_type, period_key=period_key
            )
            self.assertEqual(stats.total_requests, 40)
            self.assertEqual(stats.peak_req_per_second, 30)

    def test_log_rows_marked_processed_after_aggregation(self):
        NominatimRequestLog.objects.create()
        NominatimRequestLog.objects.create()

        aggregate_nominatim_stats()

        self.assertEqual(NominatimRequestLog.objects.count(), 2)
        self.assertEqual(NominatimRequestLog.objects.filter(processed=True).count(), 2)

    def test_only_unprocessed_rows_aggregated(self):
        now = tz.now()
        NominatimRequestLog.objects.create(created_at=now, processed=True)
        NominatimRequestLog.objects.create(created_at=now, processed=False)

        aggregate_nominatim_stats()

        periods = _get_period_keys_for_dt(now)
        for period_type, period_key, _ in periods:
            stats = NominatimPeriodStats.objects.get(
                period_type=period_type, period_key=period_key
            )
            self.assertEqual(stats.total_requests, 1)

    def test_old_rows_cleaned_up_after_7_days(self):
        now = tz.now()
        old_dt = now - timedelta(days=8)
        NominatimRequestLog.objects.create(created_at=old_dt, processed=True)
        NominatimRequestLog.objects.create(created_at=now)

        aggregate_nominatim_stats()

        self.assertEqual(NominatimRequestLog.objects.count(), 1)
        self.assertTrue(
            NominatimRequestLog.objects.filter(created_at=now, processed=True).exists()
        )

    def test_empty_log_does_nothing(self):
        aggregate_nominatim_stats()

        self.assertEqual(NominatimPeriodStats.objects.count(), 0)

    def test_new_iso_week_creates_new_row(self):
        fixed_dt = datetime(2026, 6, 15, 12, 0, 0, tzinfo=timezone.utc)
        NominatimRequestLog.objects.create(created_at=fixed_dt)

        aggregate_nominatim_stats()

        stats = NominatimPeriodStats.objects.get(
            period_type="week", period_key="2026-W25"
        )
        self.assertEqual(stats.total_requests, 1)

    def test_first_of_month_creates_new_row(self):
        fixed_dt = datetime(2026, 7, 1, 12, 0, 0, tzinfo=timezone.utc)
        NominatimRequestLog.objects.create(created_at=fixed_dt)

        aggregate_nominatim_stats()

        stats = NominatimPeriodStats.objects.get(
            period_type="month", period_key="2026-07"
        )
        self.assertEqual(stats.total_requests, 1)

    def test_incremental_aggregation(self):
        now = tz.now()
        for _ in range(3):
            NominatimRequestLog.objects.create(created_at=now)

        aggregate_nominatim_stats()

        for _ in range(2):
            NominatimRequestLog.objects.create(created_at=now)

        aggregate_nominatim_stats()

        periods = _get_period_keys_for_dt(now)
        for period_type, period_key, _ in periods:
            stats = NominatimPeriodStats.objects.get(
                period_type=period_type, period_key=period_key
            )
            self.assertEqual(stats.total_requests, 5)


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
                peak_req_per_second=5 + i,
            )
        for i in range(4):
            NominatimPeriodStats.objects.create(
                period_type="week",
                period_key=f"2026-W{24 - i:02d}",
                total_requests=700 + i,
                avg_req_per_second=0.008 + i * 0.001,
                peak_req_per_second=10 + i,
            )
        NominatimPeriodStats.objects.create(
            period_type="month",
            period_key="2026-06",
            total_requests=5000,
            avg_req_per_second=0.005,
            peak_req_per_second=15,
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

    def test_post_creates_log_row(self):
        url = reverse("location:track-nominatim-request")
        self.client.post(url)

        self.assertEqual(NominatimRequestLog.objects.count(), 1)

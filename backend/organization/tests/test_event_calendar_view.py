from datetime import datetime, timedelta

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from climateconnect_api.models import Language
from hubs.models.hub import Hub
from organization.models import (
    Project,
    ProjectSectorMapping,
    ProjectStatus,
    Sector,
)


class TestEventCalendarListView(APITestCase):
    """
    Tests for the Event Calendar list endpoint (GET /api/events/).

    The endpoint is always available (no feature toggle) and returns only
    active, non-draft event-type projects, ordered by start_date, with
    support for text search, topic (sectors), hub scoping and a date range.
    """

    def setUp(self):
        self.url = reverse("organization:list-events")

        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active",
                "name_de_translation": "aktiv",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )

        now = timezone.now()
        # Two active, non-draft events in the future.
        self.event1 = Project.objects.create(
            name="Future Event Alpha",
            url_slug="future-event-alpha",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="EV",
            start_date=now + timedelta(days=10),
            end_date=now + timedelta(days=10, hours=2),
        )
        self.event2 = Project.objects.create(
            name="Future Event Beta",
            url_slug="future-event-beta",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="EV",
            start_date=now + timedelta(days=20),
            end_date=now + timedelta(days=20, hours=2),
        )
        # Draft event -> excluded.
        Project.objects.create(
            name="Draft Event",
            url_slug="draft-event",
            is_active=True,
            is_draft=True,
            status=self.project_status,
            language=self.language,
            project_type="EV",
            start_date=now + timedelta(days=15),
            end_date=now + timedelta(days=15, hours=2),
        )
        # Inactive event -> excluded.
        Project.objects.create(
            name="Inactive Event",
            url_slug="inactive-event",
            is_active=False,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="EV",
            start_date=now + timedelta(days=15),
            end_date=now + timedelta(days=15, hours=2),
        )
        # Idea (not an event) -> excluded.
        Project.objects.create(
            name="An Idea",
            url_slug="an-idea",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="ID",
            start_date=now + timedelta(days=12),
        )
        # Project (not an event) -> excluded.
        Project.objects.create(
            name="A Project",
            url_slug="a-project",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="PR",
            start_date=now + timedelta(days=12),
        )

    def _slugs(self, response):
        # ListEventsView has no pagination -> the response body is a plain list.
        return [item["url_slug"] for item in response.json()]

    def test_url_resolves(self):
        self.assertEqual(self.url, "/api/events/")

    def test_only_active_events_returned(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = self._slugs(response)
        self.assertIn(self.event1.url_slug, slugs)
        self.assertIn(self.event2.url_slug, slugs)
        self.assertNotIn("draft-event", slugs)
        self.assertNotIn("inactive-event", slugs)
        self.assertNotIn("an-idea", slugs)
        self.assertNotIn("a-project", slugs)
        self.assertEqual(len(slugs), 2)

    def test_orders_by_start_date_ascending(self):
        response = self.client.get(self.url)
        self.assertEqual(
            self._slugs(response),
            [self.event1.url_slug, self.event2.url_slug],
        )

    def test_date_range_filter(self):
        start = (timezone.now() + timedelta(days=5)).isoformat()
        end = (timezone.now() + timedelta(days=12)).isoformat()
        response = self.client.get(self.url, {"start_date": start, "end_date": end})
        slugs = self._slugs(response)
        self.assertIn(self.event1.url_slug, slugs)
        self.assertNotIn(self.event2.url_slug, slugs)

    def test_overlap_semantics_for_multi_day_event(self):
        # Event starts before the window but is still ongoing inside it.
        now = timezone.now()
        multi = Project.objects.create(
            name="Multi Day Event",
            url_slug="multi-day-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="EV",
            start_date=now - timedelta(days=2),
            end_date=now + timedelta(days=25),
        )
        start = (now + timedelta(days=5)).isoformat()
        end = (now + timedelta(days=30)).isoformat()
        response = self.client.get(self.url, {"start_date": start, "end_date": end})
        self.assertIn(multi.url_slug, self._slugs(response))

    def test_sectors_filter(self):
        sector = Sector.objects.create(
            name="Climate Sector", name_de_translation="Klima", key="climate"
        )
        ProjectSectorMapping.objects.create(sector=sector, project=self.event1)
        response = self.client.get(self.url, {"sectors": sector.name})
        slugs = self._slugs(response)
        self.assertIn(self.event1.url_slug, slugs)
        self.assertNotIn(self.event2.url_slug, slugs)

    def test_sectors_filter_does_not_duplicate_multi_sector_event(self):
        sector_a = Sector.objects.create(
            name="Sector A", name_de_translation="Sektor A", key="sector-a"
        )
        sector_b = Sector.objects.create(
            name="Sector B", name_de_translation="Sektor B", key="sector-b"
        )
        ProjectSectorMapping.objects.create(sector=sector_a, project=self.event1)
        ProjectSectorMapping.objects.create(sector=sector_b, project=self.event1)
        response = self.client.get(
            self.url, {"sectors": f"{sector_a.name},{sector_b.name}"}
        )
        slugs = self._slugs(response)
        # The event matches both selected topics but must appear only once.
        self.assertEqual(slugs.count(self.event1.url_slug), 1)
        self.assertNotIn(self.event2.url_slug, slugs)

    def test_search_filter(self):
        response = self.client.get(self.url, {"search": "Alpha"})
        slugs = self._slugs(response)
        self.assertIn(self.event1.url_slug, slugs)
        self.assertNotIn(self.event2.url_slug, slugs)

    def test_hub_filter(self):
        hub = Hub.objects.create(
            name="Test Hub",
            url_slug="test-hub",
            hub_type=Hub.CUSTOM_HUB_TYPE,
            segway_text="segway",
        )
        self.event1.related_hubs.add(hub)
        response = self.client.get(self.url, {"hub": hub.url_slug})
        slugs = self._slugs(response)
        self.assertIn(self.event1.url_slug, slugs)
        self.assertNotIn(self.event2.url_slug, slugs)

    def test_window_is_capped_to_six_months(self):
        # Request a very wide window; the backend clamps it to 6 months from
        # the start date, so an event a year out must be excluded.
        now = timezone.now()
        far_event = Project.objects.create(
            name="Far Future Event",
            url_slug="far-future-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="EV",
            start_date=now + timedelta(days=365),
            end_date=now + timedelta(days=365, hours=2),
        )
        start = now.isoformat()
        end = (now + timedelta(days=730)).isoformat()
        response = self.client.get(self.url, {"start_date": start, "end_date": end})
        self.assertNotIn(far_event.url_slug, self._slugs(response))


class TestEventCalendarCountsView(APITestCase):
    """
    Tests for the per-day event counts endpoint (GET /api/events/calendar/).

    Returns a list of {"date": "YYYY-MM-DD", "count": N} objects for the
    requested month, applying the same exclusion and filter rules as the
    list endpoint. Multi-day events are counted on every day they span.
    """

    def setUp(self):
        self.url = reverse("organization:events-calendar-counts")

        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active",
                "name_de_translation": "aktiv",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )

        now = timezone.now()
        self.now = now
        # event1: single day in the current month.
        self.event1 = Project.objects.create(
            name="Count Event Alpha",
            url_slug="count-event-alpha",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="EV",
            start_date=now + timedelta(days=10),
            end_date=now + timedelta(days=10, hours=2),
        )
        # event2: multi-day event spanning 3 days in the current month.
        self.event2 = Project.objects.create(
            name="Count Event Beta",
            url_slug="count-event-beta",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="EV",
            start_date=now + timedelta(days=20),
            end_date=now + timedelta(days=22, hours=2),
        )
        # Draft / inactive / non-event -> excluded from counts.
        Project.objects.create(
            name="Draft Count Event",
            url_slug="draft-count-event",
            is_active=True,
            is_draft=True,
            status=self.project_status,
            language=self.language,
            project_type="EV",
            start_date=now + timedelta(days=15),
            end_date=now + timedelta(days=15, hours=2),
        )
        Project.objects.create(
            name="Inactive Count Event",
            url_slug="inactive-count-event",
            is_active=False,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="EV",
            start_date=now + timedelta(days=15),
            end_date=now + timedelta(days=15, hours=2),
        )
        Project.objects.create(
            name="Count Idea",
            url_slug="count-idea",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="ID",
            start_date=now + timedelta(days=12),
        )

    def _counts_map(self, response):
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return {item["date"]: item["count"] for item in response.json()}

    def test_url_resolves(self):
        self.assertEqual(self.url, "/api/events/calendar/")

    def test_requires_year_and_month(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response = self.client.get(self.url, {"year": self.now.year})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response = self.client.get(self.url, {"month": self.now.month})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_month_rejected(self):
        response = self.client.get(self.url, {"year": self.now.year, "month": 13})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_counts_exclude_draft_inactive_and_non_events(self):
        response = self.client.get(
            self.url, {"year": self.now.year, "month": self.now.month}
        )
        counts = self._counts_map(response)
        day1 = (self.now + timedelta(days=10)).date().isoformat()
        self.assertEqual(counts.get(day1), 1)
        # Draft / inactive / idea days must not appear.
        draft_day = (self.now + timedelta(days=15)).date().isoformat()
        self.assertNotIn(draft_day, counts)
        idea_day = (self.now + timedelta(days=12)).date().isoformat()
        self.assertNotIn(idea_day, counts)

    def test_results_sorted_by_date(self):
        response = self.client.get(
            self.url, {"year": self.now.year, "month": self.now.month}
        )
        dates = [item["date"] for item in response.json()]
        self.assertEqual(dates, sorted(dates))

    def test_sectors_filter(self):
        sector = Sector.objects.create(
            name="Count Sector", name_de_translation="Zähler", key="count"
        )
        ProjectSectorMapping.objects.create(sector=sector, project=self.event1)
        response = self.client.get(
            self.url,
            {
                "year": self.now.year,
                "month": self.now.month,
                "sectors": sector.name,
            },
        )
        counts = self._counts_map(response)
        day1 = (self.now + timedelta(days=10)).date().isoformat()
        day2 = (self.now + timedelta(days=20)).date().isoformat()
        self.assertEqual(counts.get(day1), 1)
        self.assertNotIn(day2, counts)

    def test_multi_sector_event_counted_once_per_day(self):
        sector_a = Sector.objects.create(
            name="Count Sector A", name_de_translation="Zähler A", key="count-a"
        )
        sector_b = Sector.objects.create(
            name="Count Sector B", name_de_translation="Zähler B", key="count-b"
        )
        ProjectSectorMapping.objects.create(sector=sector_a, project=self.event1)
        ProjectSectorMapping.objects.create(sector=sector_b, project=self.event1)
        response = self.client.get(
            self.url,
            {
                "year": self.now.year,
                "month": self.now.month,
                "sectors": f"{sector_a.name},{sector_b.name}",
            },
        )
        counts = self._counts_map(response)
        day1 = (self.now + timedelta(days=10)).date().isoformat()
        # event1 spans a single day and matches both topics; it must be
        # counted exactly once, not once per matching topic.
        self.assertEqual(counts.get(day1), 1)

    def test_search_filter(self):
        response = self.client.get(
            self.url,
            {
                "year": self.now.year,
                "month": self.now.month,
                "search": "Alpha",
            },
        )
        counts = self._counts_map(response)
        day1 = (self.now + timedelta(days=10)).date().isoformat()
        day2 = (self.now + timedelta(days=20)).date().isoformat()
        self.assertEqual(counts.get(day1), 1)
        self.assertNotIn(day2, counts)

    def test_hub_filter(self):
        hub = Hub.objects.create(
            name="Counts Hub",
            url_slug="counts-hub",
            hub_type=Hub.CUSTOM_HUB_TYPE,
            segway_text="segway",
        )
        self.event1.related_hubs.add(hub)
        response = self.client.get(
            self.url,
            {
                "year": self.now.year,
                "month": self.now.month,
                "hub": hub.url_slug,
            },
        )
        counts = self._counts_map(response)
        day1 = (self.now + timedelta(days=10)).date().isoformat()
        day2 = (self.now + timedelta(days=20)).date().isoformat()
        self.assertEqual(counts.get(day1), 1)
        self.assertNotIn(day2, counts)

    def test_counts_are_bucketed_in_requested_timezone(self):
        # An event at 2026-02-01 23:00 UTC is on 2026-02-02 in Asia/Tokyo
        # (UTC+9) but on 2026-02-01 in UTC. The day a count is attributed to
        # must follow the requested timezone so it matches the browser-local
        # day grouping on the frontend.
        Project.objects.create(
            name="Timezone Boundary Event",
            url_slug="timezone-boundary-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="EV",
            start_date=datetime(2026, 2, 1, 23, 0, 0, tzinfo=timezone.utc),
            end_date=datetime(2026, 2, 1, 23, 0, 0, tzinfo=timezone.utc),
        )

        tokyo = self.client.get(
            self.url, {"year": 2026, "month": 2, "timezone": "Asia/Tokyo"}
        )
        tokyo_counts = self._counts_map(tokyo)
        self.assertEqual(tokyo_counts.get("2026-02-02"), 1)
        self.assertNotIn("2026-02-01", tokyo_counts)

        utc = self.client.get(self.url, {"year": 2026, "month": 2, "timezone": "UTC"})
        utc_counts = self._counts_map(utc)
        self.assertEqual(utc_counts.get("2026-02-01"), 1)
        self.assertNotIn("2026-02-02", utc_counts)

    def test_invalid_timezone_falls_back_gracefully(self):
        response = self.client.get(
            self.url, {"year": 2026, "month": 2, "timezone": "Not/ARealZone"}
        )
        # Must not error; falls back to the server timezone and still returns
        # a valid (empty or populated) list.
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.json(), list)

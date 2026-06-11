"""
Tests for GET /api/members/me/registered-events/ (ListMemberRegisteredEventsView).

Acceptance criteria covered:
- 401 Unauthorized for unauthenticated requests.
- Returns only upcoming events (start_date >= today) for the authenticated user.
- Excludes past events (start_date < today).
- Excludes events where the registration has been cancelled.
- Does not leak another user's registrations.
- Orders events by start_date ascending.
- Maximum page size of 12 (MembersPagination).
- Returns an empty list when the user has no upcoming registered events.
"""

from datetime import timedelta

from django.contrib.auth.models import User
from django.test import tag
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from climateconnect_api.models import Language
from location.models import Location, LocationTranslation
from organization.models import Project, ProjectStatus
from organization.models.event_registration import (
    EventRegistration,
    EventRegistrationConfig,
    RegistrationStatus,
)

_REGISTERED_EVENTS_URL = reverse("member-registered-events-api")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _create_project_status():
    ps, _ = ProjectStatus.objects.update_or_create(
        id=2,
        defaults={
            "name": "active_ep",
            "name_de_translation": "aktiv",
            "has_end_date": True,
            "has_start_date": True,
        },
    )
    return ps


def _get_language():
    lang, _ = Language.objects.get_or_create(
        language_code="en",
        defaults={"name": "English", "native_name": "English"},
    )
    return lang


def _create_event(slug, project_status, language, **kwargs):
    defaults = dict(
        name=f"Event {slug}",
        url_slug=slug,
        is_active=True,
        is_draft=False,
        status=project_status,
        language=language,
        project_type="EV",
        start_date=timezone.now() + timedelta(days=30),
        end_date=timezone.now() + timedelta(days=60),
    )
    defaults.update(kwargs)
    return Project.objects.create(**defaults)


def _create_open_er(project, max_participants=50):
    return EventRegistrationConfig.objects.create(
        project=project,
        max_participants=max_participants,
        registration_end_date=timezone.now() + timedelta(days=20),
        status=RegistrationStatus.OPEN,
    )


def _register_user(user, event_registration_config):
    return EventRegistration.objects.create(
        user=user,
        registration_config=event_registration_config,
    )


# ---------------------------------------------------------------------------
# Auth tests
# ---------------------------------------------------------------------------


class TestRegisteredEventsAuth(APITestCase):
    @tag("registered_events", "auth")
    def test_unauthenticated_returns_401(self):
        """Unauthenticated requests must return 401."""
        response = self.client.get(_REGISTERED_EVENTS_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @tag("registered_events", "auth")
    def test_authenticated_returns_200(self):
        """Authenticated requests return 200."""
        User.objects.create_user(username="auth_user", password="pass")
        self.client.login(username="auth_user", password="pass")
        response = self.client.get(_REGISTERED_EVENTS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Core behaviour tests
# ---------------------------------------------------------------------------


class TestRegisteredEventsCore(APITestCase):
    def setUp(self):
        self.ps = _create_project_status()
        self.lang = _get_language()
        self.language_de, _ = Language.objects.get_or_create(
            language_code="de",
            defaults={"name": "German", "native_name": "Deutsch"},
        )
        self.user = User.objects.create_user(username="member", password="pass")
        self.client.login(username="member", password="pass")

    @tag("registered_events")
    def test_empty_list_when_no_registrations(self):
        """Returns empty results list when user has no registrations."""
        response = self.client.get(_REGISTERED_EVENTS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"], [])

    @tag("registered_events")
    def test_upcoming_registered_event_is_returned(self):
        """An upcoming registered event appears in the results."""
        event = _create_event("future-event", self.ps, self.lang)
        er_config = _create_open_er(event)
        _register_user(self.user, er_config)

        response = self.client.get(_REGISTERED_EVENTS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = [item["url_slug"] for item in response.data["results"]]
        self.assertIn("future-event", slugs)

    @tag("registered_events")
    def test_past_event_is_excluded(self):
        """Events with start_date before today are excluded."""
        past_event = _create_event(
            "past-event",
            self.ps,
            self.lang,
            start_date=timezone.now() - timedelta(days=1),
            end_date=timezone.now() + timedelta(days=1),
        )
        er_config = _create_open_er(past_event)
        _register_user(self.user, er_config)

        response = self.client.get(_REGISTERED_EVENTS_URL)

        slugs = [item["url_slug"] for item in response.data["results"]]
        self.assertNotIn("past-event", slugs)

    @tag("registered_events")
    def test_cancelled_registration_is_excluded(self):
        """Cancelled registrations (cancelled_at is set) do not appear."""
        event = _create_event("cancelled-event", self.ps, self.lang)
        er_config = _create_open_er(event)
        EventRegistration.objects.create(
            user=self.user,
            registration_config=er_config,
            cancelled_at=timezone.now(),
        )

        response = self.client.get(_REGISTERED_EVENTS_URL)

        slugs = [item["url_slug"] for item in response.data["results"]]
        self.assertNotIn("cancelled-event", slugs)

    @tag("registered_events")
    def test_only_authenticated_users_events_returned(self):
        """No cross-user data leakage — only the current user's registrations."""
        other_user = User.objects.create_user(username="other", password="pass")
        event = _create_event("other-users-event", self.ps, self.lang)
        er_config = _create_open_er(event)
        _register_user(other_user, er_config)

        response = self.client.get(_REGISTERED_EVENTS_URL)

        slugs = [item["url_slug"] for item in response.data["results"]]
        self.assertNotIn("other-users-event", slugs)

    @tag("registered_events")
    def test_events_ordered_by_start_date_ascending(self):
        """Results are ordered by start_date ascending."""
        later = _create_event(
            "later-event",
            self.ps,
            self.lang,
            start_date=timezone.now() + timedelta(days=60),
        )
        sooner = _create_event(
            "sooner-event",
            self.ps,
            self.lang,
            start_date=timezone.now() + timedelta(days=10),
        )
        _register_user(self.user, _create_open_er(later))
        _register_user(self.user, _create_open_er(sooner))

        response = self.client.get(_REGISTERED_EVENTS_URL)

        slugs = [item["url_slug"] for item in response.data["results"]]
        self.assertLess(slugs.index("sooner-event"), slugs.index("later-event"))

    @tag("registered_events")
    def test_response_contains_url_slug_field(self):
        """Response items include url_slug (used by frontend for navigation)."""
        event = _create_event("slug-check-event", self.ps, self.lang)
        er_config = _create_open_er(event)
        _register_user(self.user, er_config)

        response = self.client.get(_REGISTERED_EVENTS_URL)

        self.assertIn("url_slug", response.data["results"][0])

    @tag("registered_events")
    def test_page_size_is_at_most_12(self):
        """Page size is capped at 12 — the standard MembersPagination default."""
        for i in range(15):
            event = _create_event(f"event-{i}", self.ps, self.lang)
            er_config = _create_open_er(event)
            _register_user(self.user, er_config)

        response = self.client.get(_REGISTERED_EVENTS_URL)

        self.assertLessEqual(len(response.data["results"]), 12)

    @tag("registered_events")
    def test_event_with_null_start_date_excluded(self):
        """Events without a start_date are excluded (cannot determine if upcoming)."""
        event = _create_event(
            "no-start-date-event",
            self.ps,
            self.lang,
            start_date=None,
        )
        er_config = _create_open_er(event)
        _register_user(self.user, er_config)

        response = self.client.get(_REGISTERED_EVENTS_URL)

        slugs = [item["url_slug"] for item in response.data["results"]]
        self.assertNotIn("no-start-date-event", slugs)

    @tag("registered_events", "location")
    def test_registered_events_return_translated_location_name(self):
        location = Location.objects.create(
            name="Munich",
            city="Munich",
            country="Germany",
        )
        LocationTranslation.objects.create(
            location=location,
            language=self.language_de,
            name_translation="München",
        )
        event = _create_event("translated-event", self.ps, self.lang, loc=location)
        er_config = _create_open_er(event)
        _register_user(self.user, er_config)

        response = self.client.get(_REGISTERED_EVENTS_URL, HTTP_ACCEPT_LANGUAGE="de")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["results"][0]["location"], "München")

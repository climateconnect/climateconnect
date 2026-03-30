"""
Tests for the EventParticipant / member event registration feature.

Covers POST /api/projects/{slug}/register/ (RegisterForEventView):
    - 201 Created on first successful registration
    - 200 OK on idempotent re-registration (same user, same event)
    - 400 Bad Request when registration is closed / full / deadline passed
    - 401 Unauthorized for unauthenticated requests
    - 404 Not Found for unknown project slugs
    - Race-condition / last-seat handling (status -> FULL)
    - available_seats on the detail endpoint (vs. null on list)
"""
from datetime import timedelta

from django.contrib.auth.models import User
from django.test import override_settings, tag
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch

from climateconnect_api.models import Language
from organization.models import Project, ProjectStatus
from organization.models.event_registration import (
    EventParticipant,
    EventRegistration,
    RegistrationStatus,
)

# Use a dummy cache in all tests to avoid needing a live Redis connection.
_DUMMY_CACHE = {"default": {"BACKEND": "django.core.cache.backends.dummy.DummyCache"}}

# The module-level alias used in project_views.py for the Celery task.
_TASK_PATH = "organization.views.project_views._send_registration_email"


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


def _create_open_er(project, max_participants=50, days_until_close=20):
    return EventRegistration.objects.create(
        project=project,
        max_participants=max_participants,
        registration_end_date=timezone.now() + timedelta(days=days_until_close),
        status=RegistrationStatus.OPEN,
    )


def _register_url(slug):
    return reverse("organization:register-for-event", kwargs={"url_slug": slug})


def _detail_url(slug):
    return reverse("organization:project-api-view", kwargs={"url_slug": slug})


# ---------------------------------------------------------------------------
# Happy-path registration tests
# ---------------------------------------------------------------------------


@override_settings(CACHES=_DUMMY_CACHE, CACHE_BACHED_RANK_REQUEST=False)
class TestRegisterForEventHappyPath(APITestCase):
    """201 / 200 responses for successful registrations."""

    def setUp(self):
        self.ps = _create_project_status()
        self.lang = _get_language()
        self.user = User.objects.create_user(
            username="reg_member", password="testpassword"
        )
        self.event = _create_event("open-event", self.ps, self.lang)
        self.er = _create_open_er(self.event, max_participants=10)

    @tag("event_participant", "registration")
    @patch(_TASK_PATH)
    def test_first_registration_returns_201(self, mock_task):
        """A logged-in user registering for the first time gets 201."""
        self.client.login(username="reg_member", password="testpassword")
        response = self.client.post(_register_url("open-event"))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertTrue(response.data["registered"])
        self.assertIn("available_seats", response.data)

    @tag("event_participant", "registration")
    @patch(_TASK_PATH)
    def test_first_registration_creates_eventparticipant_record(self, mock_task):
        """POST creates exactly one EventParticipant row."""
        self.client.login(username="reg_member", password="testpassword")
        self.client.post(_register_url("open-event"))
        self.assertEqual(
            EventParticipant.objects.filter(
                user=self.user, event_registration=self.er
            ).count(),
            1,
        )

    @tag("event_participant", "registration")
    @patch(_TASK_PATH)
    def test_re_registration_returns_200(self, mock_task):
        """Calling register a second time returns 200 (idempotent)."""
        self.client.login(username="reg_member", password="testpassword")
        self.client.post(_register_url("open-event"))
        response = self.client.post(_register_url("open-event"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["registered"])

    @tag("event_participant", "registration")
    @patch(_TASK_PATH)
    def test_re_registration_does_not_duplicate_record(self, mock_task):
        """Idempotent re-registration must not create a second row."""
        self.client.login(username="reg_member", password="testpassword")
        self.client.post(_register_url("open-event"))
        self.client.post(_register_url("open-event"))
        self.assertEqual(
            EventParticipant.objects.filter(
                user=self.user, event_registration=self.er
            ).count(),
            1,
        )

    @tag("event_participant", "registration")
    @patch(_TASK_PATH)
    def test_available_seats_decrements(self, mock_task):
        """available_seats in the response decrements after registration."""
        self.client.login(username="reg_member", password="testpassword")
        response = self.client.post(_register_url("open-event"))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["available_seats"], 9)  # 10 - 1

    @tag("event_participant", "registration")
    def test_confirmation_email_task_is_dispatched(self):
        """
        Celery task is dispatched after successful registration.

        Patches transaction.on_commit to run immediately and patches the
        module-level task alias so we can assert on .delay() without dealing
        with Celery's PromiseProxy.
        """
        self.client.login(username="reg_member", password="testpassword")
        with (
            patch("django.db.transaction.on_commit", side_effect=lambda fn, using=None: fn()),
            patch(_TASK_PATH) as mock_task,
        ):
            response = self.client.post(_register_url("open-event"))

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        mock_task.delay.assert_called_once_with(
            user_id=self.user.id, event_slug="open-event"
        )

    @tag("event_participant", "registration")
    def test_confirmation_email_not_sent_on_idempotent_reregistration(self):
        """Celery task must NOT be dispatched on idempotent re-registration."""
        self.client.login(username="reg_member", password="testpassword")
        on_commit_immediate = lambda fn, using=None: fn()

        # First registration - task should be dispatched
        with (
            patch("django.db.transaction.on_commit", side_effect=on_commit_immediate),
            patch(_TASK_PATH) as _first_task,
        ):
            self.client.post(_register_url("open-event"))

        # Second (idempotent) registration - task should NOT be dispatched
        with (
            patch("django.db.transaction.on_commit", side_effect=on_commit_immediate),
            patch(_TASK_PATH) as mock_task,
        ):
            self.client.post(_register_url("open-event"))

        mock_task.delay.assert_not_called()


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------


@override_settings(CACHES=_DUMMY_CACHE, CACHE_BACHED_RANK_REQUEST=False)
class TestRegisterForEventAuth(APITestCase):
    def setUp(self):
        self.ps = _create_project_status()
        self.lang = _get_language()
        self.event = _create_event("auth-event", self.ps, self.lang)
        _create_open_er(self.event)

    @tag("event_participant", "registration", "auth")
    def test_unauthenticated_returns_401(self):
        """Unauthenticated POST -> 401."""
        response = self.client.post(_register_url("auth-event"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ---------------------------------------------------------------------------
# 404 / no registration enabled
# ---------------------------------------------------------------------------


@override_settings(CACHES=_DUMMY_CACHE, CACHE_BACHED_RANK_REQUEST=False)
class TestRegisterForEventNotFound(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="notfound_user", password="testpassword"
        )
        self.ps = _create_project_status()
        self.lang = _get_language()

    @tag("event_participant", "registration")
    def test_unknown_project_slug_returns_404(self):
        """POST with unknown slug -> 404."""
        self.client.login(username="notfound_user", password="testpassword")
        response = self.client.post(_register_url("does-not-exist-xyz"))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @tag("event_participant", "registration")
    def test_project_without_event_registration_returns_400(self):
        """POST for a project with no EventRegistration record -> 400."""
        Project.objects.create(
            name="Plain project",
            url_slug="plain-project-no-er",
            is_active=True,
            is_draft=False,
            status=self.ps,
            language=self.lang,
        )
        self.client.login(username="notfound_user", password="testpassword")
        response = self.client.post(_register_url("plain-project-no-er"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Closed / full / deadline tests
# ---------------------------------------------------------------------------


@override_settings(CACHES=_DUMMY_CACHE, CACHE_BACHED_RANK_REQUEST=False)
class TestRegisterForEventClosed(APITestCase):
    def setUp(self):
        self.ps = _create_project_status()
        self.lang = _get_language()
        self.user = User.objects.create_user(
            username="closed_user", password="testpassword"
        )

    @tag("event_participant", "registration")
    def test_closed_status_returns_400(self):
        """Registration with status=CLOSED -> 400."""
        event = _create_event("closed-event", self.ps, self.lang)
        EventRegistration.objects.create(
            project=event,
            max_participants=10,
            registration_end_date=timezone.now() + timedelta(days=10),
            status=RegistrationStatus.CLOSED,
        )
        self.client.login(username="closed_user", password="testpassword")
        response = self.client.post(_register_url("closed-event"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @tag("event_participant", "registration")
    def test_full_status_returns_400(self):
        """Registration with status=FULL -> 400."""
        event = _create_event("full-event", self.ps, self.lang)
        EventRegistration.objects.create(
            project=event,
            max_participants=5,
            registration_end_date=timezone.now() + timedelta(days=10),
            status=RegistrationStatus.FULL,
        )
        self.client.login(username="closed_user", password="testpassword")
        response = self.client.post(_register_url("full-event"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @tag("event_participant", "registration")
    def test_deadline_passed_returns_400(self):
        """Registration after registration_end_date -> 400."""
        event = _create_event("deadline-passed-event", self.ps, self.lang)
        EventRegistration.objects.create(
            project=event,
            max_participants=10,
            registration_end_date=timezone.now() - timedelta(hours=1),
            status=RegistrationStatus.OPEN,
        )
        self.client.login(username="closed_user", password="testpassword")
        response = self.client.post(_register_url("deadline-passed-event"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Last-seat / FULL-status promotion
# ---------------------------------------------------------------------------


@override_settings(CACHES=_DUMMY_CACHE, CACHE_BACHED_RANK_REQUEST=False)
class TestLastSeatPromotion(APITestCase):
    """Registering for the last available seat sets status to FULL."""

    def setUp(self):
        self.ps = _create_project_status()
        self.lang = _get_language()
        # Pre-fill event with max_participants - 1 users so the next one is the last.
        self.event = _create_event("last-seat-event", self.ps, self.lang)
        self.er = _create_open_er(self.event, max_participants=3)
        # Create 2 existing participants
        for i in range(2):
            existing_user = User.objects.create_user(
                username=f"existing_participant_{i}", password="x"
            )
            EventParticipant.objects.create(user=existing_user, event_registration=self.er)
        self.final_user = User.objects.create_user(
            username="last_seat_user", password="testpassword"
        )

    @tag("event_participant", "registration", "capacity")
    @patch(_TASK_PATH)
    def test_last_seat_registration_succeeds(self, mock_task):
        """The final participant can register successfully."""
        self.client.login(username="last_seat_user", password="testpassword")
        response = self.client.post(_register_url("last-seat-event"))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["available_seats"], 0)

    @tag("event_participant", "registration", "capacity")
    @patch(_TASK_PATH)
    def test_last_seat_sets_status_to_full(self, mock_task):
        """After the last seat is taken, EventRegistration.status -> FULL."""
        self.client.login(username="last_seat_user", password="testpassword")
        self.client.post(_register_url("last-seat-event"))
        self.er.refresh_from_db()
        self.assertEqual(self.er.status, RegistrationStatus.FULL)

    @tag("event_participant", "registration", "capacity")
    @patch(_TASK_PATH)
    def test_over_capacity_returns_400(self, mock_task):
        """Registering when already at max_participants -> 400."""
        # First take the last seat
        self.client.login(username="last_seat_user", password="testpassword")
        self.client.post(_register_url("last-seat-event"))
        # Now try with a new user
        overflow_user = User.objects.create_user(
            username="overflow_user", password="testpassword"
        )
        self.client.login(username="overflow_user", password="testpassword")
        response = self.client.post(_register_url("last-seat-event"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @tag("event_participant", "registration", "capacity")
    @patch(_TASK_PATH)
    def test_participant_count_does_not_exceed_max(self, mock_task):
        """Never more than max_participants rows exist regardless of concurrency."""
        self.client.login(username="last_seat_user", password="testpassword")
        self.client.post(_register_url("last-seat-event"))
        count = EventParticipant.objects.filter(event_registration=self.er).count()
        self.assertLessEqual(count, self.er.max_participants)


# ---------------------------------------------------------------------------
# Unlimited capacity (max_participants = None)
# ---------------------------------------------------------------------------


@override_settings(CACHES=_DUMMY_CACHE, CACHE_BACHED_RANK_REQUEST=False)
class TestUnlimitedCapacity(APITestCase):
    """Events with max_participants=None should not enforce a cap."""

    def setUp(self):
        self.ps = _create_project_status()
        self.lang = _get_language()
        self.user = User.objects.create_user(
            username="unlimited_user", password="testpassword"
        )
        self.event = _create_event("unlimited-event", self.ps, self.lang)
        EventRegistration.objects.create(
            project=self.event,
            max_participants=None,
            registration_end_date=timezone.now() + timedelta(days=30),
            status=RegistrationStatus.OPEN,
        )

    @tag("event_participant", "registration", "capacity")
    @patch(_TASK_PATH)
    def test_registration_succeeds_with_null_max_participants(self, mock_task):
        """Registration works for unlimited-capacity events."""
        self.client.login(username="unlimited_user", password="testpassword")
        response = self.client.post(_register_url("unlimited-event"))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(response.data["available_seats"])


# ---------------------------------------------------------------------------
# available_seats in the detail vs. list endpoint
# ---------------------------------------------------------------------------


@override_settings(CACHES=_DUMMY_CACHE, CACHE_BACHED_RANK_REQUEST=False)
class TestAvailableSeatsInSerializer(APITestCase):
    """available_seats is returned on the detail endpoint but null on the list."""

    def setUp(self):
        self.ps = _create_project_status()
        self.lang = _get_language()
        self.event = _create_event("serializer-seats-event", self.ps, self.lang)
        self.er = _create_open_er(self.event, max_participants=100)
        # Register one participant
        participant_user = User.objects.create_user(
            username="participant_for_serializer", password="x"
        )
        EventParticipant.objects.create(
            user=participant_user, event_registration=self.er
        )

    @tag("event_participant", "serializer")
    def test_detail_endpoint_returns_available_seats(self):
        """GET /api/projects/{slug}/ includes non-null available_seats."""
        response = self.client.get(_detail_url("serializer-seats-event"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        er_data = response.data["event_registration"]
        self.assertIsNotNone(er_data)
        self.assertIn("available_seats", er_data)
        self.assertEqual(er_data["available_seats"], 99)  # 100 - 1

    @tag("event_participant", "serializer")
    def test_list_endpoint_returns_null_available_seats(self):
        """GET /api/projects/ returns available_seats: null (no COUNT per row)."""
        response = self.client.get(reverse("organization:list-projects"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        matching = [
            p
            for p in results
            if p.get("url_slug") == "serializer-seats-event"
        ]
        self.assertTrue(matching, "Expected event to appear in list")
        er_data = matching[0]["event_registration"]
        self.assertIsNotNone(er_data)
        self.assertIn("available_seats", er_data)
        self.assertIsNone(er_data["available_seats"])

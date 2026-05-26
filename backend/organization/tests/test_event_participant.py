"""
Tests for the EventRegistration / member event registration feature.

Covers POST /api/projects/{slug}/registrations/ (EventRegistrationsView):
    - 201 Created on first successful registration
    - 200 OK on idempotent re-registration (same user, same event)
    - 400 Bad Request when registration is closed / full / deadline passed
    - 401 Unauthorized for unauthenticated requests
    - 404 Not Found for unknown project slugs
    - Race-condition / last-seat handling (status -> FULL)
    - available_seats on the detail endpoint (vs. null on list)
"""

from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import override_settings, tag
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from climateconnect_api.models import Language
from organization.models import Project, ProjectStatus
from organization.models.event_registration import (
    EventRegistration,
    EventRegistrationConfig,
    RegistrationFieldAnswer,
    RegistrationStatus,
)
from organization.models.registration_field import (
    RegistrationField,
    RegistrationFieldOption,
)

# Use a dummy cache in all tests to avoid needing a live Redis connection.
_DUMMY_CACHE = {"default": {"BACKEND": "django.core.cache.backends.dummy.DummyCache"}}

# The module-level alias used in event_registration_views.py for the Celery task.
_TASK_PATH = "organization.views.event_registration_views._send_registration_email"
# Admin notification task — must be mocked whenever transaction.on_commit is patched
# to run immediately, because EventRegistrationConfig.notify_admins defaults to True.
_NOTIFY_ADMINS_PATH = "organization.views.event_registration_views._notify_admins_task"


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
    return EventRegistrationConfig.objects.create(
        project=project,
        max_participants=max_participants,
        registration_end_date=timezone.now() + timedelta(days=days_until_close),
        status=RegistrationStatus.OPEN,
    )


def _register_url(slug):
    return reverse("organization:event-registrations", kwargs={"url_slug": slug})


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
    def test_first_registration_creates_eventregistration_record(self, mock_task):
        """POST creates exactly one EventRegistration row."""
        self.client.login(username="reg_member", password="testpassword")
        self.client.post(_register_url("open-event"))
        self.assertEqual(
            EventRegistration.objects.filter(
                user=self.user, registration_config=self.er
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
            EventRegistration.objects.filter(
                user=self.user, registration_config=self.er
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
            patch(
                "django.db.transaction.on_commit",
                side_effect=lambda fn, using=None: fn(),
            ),
            patch(_TASK_PATH) as mock_task,
            patch(
                _NOTIFY_ADMINS_PATH
            ),  # prevent broker connection; notify_admins defaults to True
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

        def on_commit_immediate(fn, using=None):
            fn()

        # First registration - task should be dispatched
        with (
            patch("django.db.transaction.on_commit", side_effect=on_commit_immediate),
            patch(_TASK_PATH) as _first_task,
            patch(_NOTIFY_ADMINS_PATH),  # prevent broker connection
        ):
            self.client.post(_register_url("open-event"))

        # Second (idempotent) registration - task should NOT be dispatched
        with (
            patch("django.db.transaction.on_commit", side_effect=on_commit_immediate),
            patch(_TASK_PATH) as mock_task,
            patch(_NOTIFY_ADMINS_PATH),  # prevent broker connection
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
        """POST for a project with no EventRegistrationConfig record -> 400."""
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
        EventRegistrationConfig.objects.create(
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
        EventRegistrationConfig.objects.create(
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
        EventRegistrationConfig.objects.create(
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
            EventRegistration.objects.create(
                user=existing_user, registration_config=self.er
            )
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
        User.objects.create_user(username="overflow_user", password="testpassword")
        self.client.login(username="overflow_user", password="testpassword")
        response = self.client.post(_register_url("last-seat-event"))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @tag("event_participant", "registration", "capacity")
    @patch(_TASK_PATH)
    def test_participant_count_does_not_exceed_max(self, mock_task):
        """Never more than max_participants rows exist regardless of concurrency."""
        self.client.login(username="last_seat_user", password="testpassword")
        self.client.post(_register_url("last-seat-event"))
        count = EventRegistration.objects.filter(registration_config=self.er).count()
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
        EventRegistrationConfig.objects.create(
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
        EventRegistration.objects.create(
            user=participant_user, registration_config=self.er
        )

    @tag("event_participant", "serializer")
    def test_detail_endpoint_returns_available_seats(self):
        """GET /api/projects/{slug}/ includes non-null available_seats."""
        response = self.client.get(_detail_url("serializer-seats-event"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        er_data = response.data["registration_config"]
        self.assertIsNotNone(er_data)
        self.assertIn("available_seats", er_data)
        self.assertEqual(er_data["available_seats"], 99)  # 100 - 1

    @tag("event_participant", "serializer")
    def test_list_endpoint_returns_null_available_seats(self):
        """GET /api/projects/ returns available_seats: null (no COUNT per row)."""
        response = self.client.get(reverse("organization:list-projects"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        matching = [p for p in results if p.get("url_slug") == "serializer-seats-event"]
        self.assertTrue(matching, "Expected event to appear in list")
        er_data = matching[0]["registration_config"]
        self.assertIsNotNone(er_data)
        self.assertIn("available_seats", er_data)
        self.assertIsNone(er_data["available_seats"])


# ---------------------------------------------------------------------------
# Custom registration field answers on POST /registrations/
# ---------------------------------------------------------------------------


@override_settings(CACHES=_DUMMY_CACHE, CACHE_BACHED_RANK_REQUEST=False)
class TestRegisterForEventWithCustomFieldAnswers(APITestCase):
    def setUp(self):
        self.ps = _create_project_status()
        self.lang = _get_language()
        self.user = User.objects.create_user(
            username="answers_user", password="testpassword"
        )

        self.event = _create_event("answers-event", self.ps, self.lang)
        self.er = _create_open_er(self.event, max_participants=20)

        self.checkbox_field = RegistrationField.objects.create(
            registration_config=self.er,
            field_type="checkbox",
            label="checkbox 1",
            order=0,
            is_required=True,
            settings={"description": "<p>I agree</p>"},
        )
        self.option_field = RegistrationField.objects.create(
            registration_config=self.er,
            field_type="option_select",
            label="option select 1",
            order=1,
            is_required=True,
            settings={"title": "Meal"},
        )
        self.option_veg = RegistrationFieldOption.objects.create(
            field=self.option_field,
            title="Vegetarian",
            order=0,
        )
        self.option_vegan = RegistrationFieldOption.objects.create(
            field=self.option_field,
            title="Vegan",
            order=1,
        )
        self.other_field = RegistrationField.objects.create(
            registration_config=self.er,
            field_type="option_select",
            order=2,
            is_required=False,
            settings={"title": "Other"},
        )
        self.other_option = RegistrationFieldOption.objects.create(
            field=self.other_field,
            title="Other Option",
            order=0,
        )

    @tag("event_participant", "registration", "custom_fields")
    @patch(_TASK_PATH)
    def test_valid_answers_create_registration_and_answer_rows(self, mock_task):
        self.client.login(username="answers_user", password="testpassword")
        response = self.client.post(
            _register_url("answers-event"),
            data={
                "answers": [
                    {"field": self.checkbox_field.id, "value_boolean": True},
                    {"field": self.option_field.id, "value_option": self.option_veg.id},
                ]
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        registration = EventRegistration.objects.get(
            user=self.user,
            registration_config=self.er,
        )
        self.assertEqual(registration.field_answers.count(), 2)
        self.assertTrue(
            registration.field_answers.get(field=self.checkbox_field).value_boolean
        )
        self.assertEqual(
            registration.field_answers.get(field=self.option_field).value_option_id,
            self.option_veg.id,
        )

    @tag("event_participant", "registration", "custom_fields")
    @patch(_TASK_PATH)
    def test_missing_required_answer_returns_400(self, mock_task):
        self.client.login(username="answers_user", password="testpassword")
        response = self.client.post(
            _register_url("answers-event"),
            data={
                "answers": [
                    {"field": self.checkbox_field.id, "value_boolean": True},
                ]
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("answers", response.data)
        self.assertEqual(
            EventRegistration.objects.filter(
                user=self.user, registration_config=self.er
            ).count(),
            0,
        )

    @tag("event_participant", "registration", "custom_fields")
    @patch(_TASK_PATH)
    def test_option_must_belong_to_selected_field(self, mock_task):
        self.client.login(username="answers_user", password="testpassword")
        response = self.client.post(
            _register_url("answers-event"),
            data={
                "answers": [
                    {"field": self.checkbox_field.id, "value_boolean": True},
                    {
                        "field": self.option_field.id,
                        "value_option": self.other_option.id,
                    },
                ]
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            EventRegistration.objects.filter(
                user=self.user, registration_config=self.er
            ).count(),
            0,
        )

    @tag("event_participant", "registration", "custom_fields")
    @patch(_TASK_PATH)
    def test_active_reregistration_is_still_idempotent(self, mock_task):
        self.client.login(username="answers_user", password="testpassword")
        first = self.client.post(
            _register_url("answers-event"),
            data={
                "answers": [
                    {"field": self.checkbox_field.id, "value_boolean": True},
                    {
                        "field": self.option_field.id,
                        "value_option": self.option_veg.id,
                    },
                ]
            },
            format="json",
        )
        self.assertEqual(first.status_code, status.HTTP_201_CREATED, first.data)

        second = self.client.post(
            _register_url("answers-event"),
            data={
                "answers": [
                    {"field": self.checkbox_field.id, "value_boolean": False},
                ]
            },
            format="json",
        )
        self.assertEqual(second.status_code, status.HTTP_200_OK, second.data)

        registration = EventRegistration.objects.get(
            user=self.user,
            registration_config=self.er,
        )
        self.assertEqual(registration.field_answers.count(), 2)
        self.assertEqual(
            registration.field_answers.get(field=self.option_field).value_option_id,
            self.option_veg.id,
        )

    @tag("event_participant", "registration", "custom_fields")
    @patch(_TASK_PATH)
    def test_self_reregistration_syncs_answer_values(self, mock_task):
        self.client.login(username="answers_user", password="testpassword")
        first = self.client.post(
            _register_url("answers-event"),
            data={
                "answers": [
                    {"field": self.checkbox_field.id, "value_boolean": True},
                    {
                        "field": self.option_field.id,
                        "value_option": self.option_veg.id,
                    },
                ]
            },
            format="json",
        )
        self.assertEqual(first.status_code, status.HTTP_201_CREATED, first.data)

        registration = EventRegistration.objects.get(
            user=self.user,
            registration_config=self.er,
        )
        registration.cancelled_at = timezone.now()
        registration.cancelled_by = self.user
        registration.save(update_fields=["cancelled_at", "cancelled_by"])

        second = self.client.post(
            _register_url("answers-event"),
            data={
                "answers": [
                    {"field": self.checkbox_field.id, "value_boolean": True},
                    {
                        "field": self.option_field.id,
                        "value_option": self.option_vegan.id,
                    },
                ]
            },
            format="json",
        )
        self.assertEqual(second.status_code, status.HTTP_201_CREATED, second.data)

        registration.refresh_from_db()
        self.assertIsNone(registration.cancelled_at)
        self.assertIsNone(registration.cancelled_by)
        self.assertEqual(
            registration.field_answers.get(field=self.option_field).value_option_id,
            self.option_vegan.id,
        )
        self.assertEqual(RegistrationFieldAnswer.objects.count(), 2)


# ---------------------------------------------------------------------------
# Inventory field answers on POST /registrations/
# ---------------------------------------------------------------------------


@override_settings(CACHES=_DUMMY_CACHE, CACHE_BACHED_RANK_REQUEST=False)
class TestRegisterForEventWithInventoryAnswers(APITestCase):
    def setUp(self):
        self.ps = _create_project_status()
        self.lang = _get_language()
        self.user = User.objects.create_user(
            username="inv_user", password="testpassword"
        )

        self.event = _create_event("inv-event", self.ps, self.lang)
        self.er = _create_open_er(self.event, max_participants=50)

        self.inventory_field = RegistrationField.objects.create(
            registration_config=self.er,
            field_type="inventory",
            label="meals",
            order=0,
            is_required=True,
            settings={"title": "Meal tickets"},
        )
        self.opt_veg = RegistrationFieldOption.objects.create(
            field=self.inventory_field,
            title="Vegetarian",
            order=0,
            available_amount=50,
            max_amount_per_guest=2,
        )
        self.opt_vegan = RegistrationFieldOption.objects.create(
            field=self.inventory_field,
            title="Vegan",
            order=1,
            available_amount=30,
            max_amount_per_guest=3,
        )
        # An optional checkbox field alongside.
        self.checkbox_field = RegistrationField.objects.create(
            registration_config=self.er,
            field_type="checkbox",
            label="agree",
            order=1,
            is_required=False,
            settings={"description": "<p>I agree</p>"},
        )

    @tag("event_participant", "registration", "inventory")
    @patch(_TASK_PATH)
    @patch(_NOTIFY_ADMINS_PATH)
    def test_valid_inventory_answer_creates_registration(self, mock_admins, mock_task):
        self.client.login(username="inv_user", password="testpassword")
        response = self.client.post(
            _register_url("inv-event"),
            data={
                "answers": [
                    {
                        "field": self.inventory_field.id,
                        "value_option": self.opt_veg.id,
                        "value_number": 2,
                    },
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        registration = EventRegistration.objects.get(
            user=self.user, registration_config=self.er
        )
        answer = registration.field_answers.get(field=self.inventory_field)
        self.assertEqual(answer.value_option_id, self.opt_veg.id)
        self.assertEqual(answer.value_number, 2)
        self.assertIsNone(answer.value_boolean)

    @tag("event_participant", "registration", "inventory")
    @patch(_TASK_PATH)
    @patch(_NOTIFY_ADMINS_PATH)
    def test_missing_required_inventory_returns_400(self, mock_admins, mock_task):
        self.client.login(username="inv_user", password="testpassword")
        response = self.client.post(
            _register_url("inv-event"),
            data={"answers": []},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            EventRegistration.objects.filter(
                user=self.user, registration_config=self.er
            ).count(),
            0,
        )

    @tag("event_participant", "registration", "inventory")
    @patch(_TASK_PATH)
    @patch(_NOTIFY_ADMINS_PATH)
    def test_inventory_missing_value_number_returns_400(self, mock_admins, mock_task):
        self.client.login(username="inv_user", password="testpassword")
        response = self.client.post(
            _register_url("inv-event"),
            data={
                "answers": [
                    {"field": self.inventory_field.id, "value_option": self.opt_veg.id},
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @tag("event_participant", "registration", "inventory")
    @patch(_TASK_PATH)
    @patch(_NOTIFY_ADMINS_PATH)
    def test_inventory_zero_quantity_returns_400(self, mock_admins, mock_task):
        self.client.login(username="inv_user", password="testpassword")
        response = self.client.post(
            _register_url("inv-event"),
            data={
                "answers": [
                    {
                        "field": self.inventory_field.id,
                        "value_option": self.opt_veg.id,
                        "value_number": 0,
                    },
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @tag("event_participant", "registration", "inventory")
    @patch(_TASK_PATH)
    @patch(_NOTIFY_ADMINS_PATH)
    def test_inventory_exceeds_max_per_guest_returns_400(self, mock_admins, mock_task):
        self.client.login(username="inv_user", password="testpassword")
        response = self.client.post(
            _register_url("inv-event"),
            data={
                "answers": [
                    {
                        "field": self.inventory_field.id,
                        "value_option": self.opt_veg.id,
                        "value_number": 5,
                    },
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @tag("event_participant", "registration", "inventory")
    @patch(_TASK_PATH)
    @patch(_NOTIFY_ADMINS_PATH)
    def test_inventory_option_from_different_field_returns_400(
        self, mock_admins, mock_task
    ):
        other_field = RegistrationField.objects.create(
            registration_config=self.er,
            field_type="inventory",
            label="drinks",
            order=2,
            is_required=False,
            settings={"title": "Drinks"},
        )
        other_option = RegistrationFieldOption.objects.create(
            field=other_field,
            title="Water",
            order=0,
            available_amount=10,
            max_amount_per_guest=1,
        )
        self.client.login(username="inv_user", password="testpassword")
        response = self.client.post(
            _register_url("inv-event"),
            data={
                "answers": [
                    {
                        "field": self.inventory_field.id,
                        "value_option": other_option.id,
                        "value_number": 1,
                    },
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @tag("event_participant", "registration", "inventory")
    @patch(_TASK_PATH)
    @patch(_NOTIFY_ADMINS_PATH)
    def test_inventory_capacity_exceeded_returns_400_with_field_error(
        self, mock_admins, mock_task
    ):
        RegistrationFieldAnswer.objects.create(
            registration=EventRegistration.objects.create(
                user=self.user, registration_config=self.er
            ),
            field=self.inventory_field,
            value_option=self.opt_veg,
            value_number=49,
        )
        User.objects.create_user(
            username="inv_user2", password="testpassword"
        )
        self.client.login(username="inv_user2", password="testpassword")
        response = self.client.post(
            _register_url("inv-event"),
            data={
                "answers": [
                    {
                        "field": self.inventory_field.id,
                        "value_option": self.opt_veg.id,
                        "value_number": 2,
                    },
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("field_errors", response.data)

    @tag("event_participant", "registration", "inventory")
    @patch(_TASK_PATH)
    @patch(_NOTIFY_ADMINS_PATH)
    def test_remaining_amount_excludes_cancelled_registrations(
        self, mock_admins, mock_task
    ):
        reg = EventRegistration.objects.create(
            user=self.user, registration_config=self.er
        )
        RegistrationFieldAnswer.objects.create(
            registration=reg,
            field=self.inventory_field,
            value_option=self.opt_veg,
            value_number=5,
        )
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = self.user
        reg.save(update_fields=["cancelled_at", "cancelled_by"])
        User.objects.create_user(
            username="inv_user3", password="testpassword"
        )
        self.client.login(username="inv_user3", password="testpassword")
        response = self.client.post(
            _register_url("inv-event"),
            data={
                "answers": [
                    {
                        "field": self.inventory_field.id,
                        "value_option": self.opt_veg.id,
                        "value_number": 2,
                    },
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

    @tag("event_participant", "registration", "inventory")
    def test_remaining_amount_in_detail_response(self):
        reg = EventRegistration.objects.create(
            user=self.user, registration_config=self.er
        )
        RegistrationFieldAnswer.objects.create(
            registration=reg,
            field=self.inventory_field,
            value_option=self.opt_veg,
            value_number=2,
        )
        response = self.client.get(_detail_url("inv-event"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        fields = response.data["registration_config"]["fields"]
        inv_field = next(f for f in fields if f["field_type"] == "inventory")
        veg_opt = next(o for o in inv_field["options"] if o["title"] == "Vegetarian")
        self.assertEqual(veg_opt["remaining_amount"], 48)

    @tag("event_participant", "registration", "inventory")
    @patch(_TASK_PATH)
    @patch(_NOTIFY_ADMINS_PATH)
    def test_inventory_with_checkbox_in_same_payload(self, mock_admins, mock_task):
        self.client.login(username="inv_user", password="testpassword")
        response = self.client.post(
            _register_url("inv-event"),
            data={
                "answers": [
                    {
                        "field": self.inventory_field.id,
                        "value_option": self.opt_vegan.id,
                        "value_number": 1,
                    },
                    {"field": self.checkbox_field.id, "value_boolean": True},
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        registration = EventRegistration.objects.get(
            user=self.user, registration_config=self.er
        )
        self.assertEqual(registration.field_answers.count(), 2)

    @tag("event_participant", "registration", "inventory")
    @patch(_TASK_PATH)
    @patch(_NOTIFY_ADMINS_PATH)
    def test_inventory_reregistration_syncs_answers(self, mock_admins, mock_task):
        self.client.login(username="inv_user", password="testpassword")
        first = self.client.post(
            _register_url("inv-event"),
            data={
                "answers": [
                    {
                        "field": self.inventory_field.id,
                        "value_option": self.opt_veg.id,
                        "value_number": 2,
                    },
                ]
            },
            format="json",
        )
        self.assertEqual(first.status_code, status.HTTP_201_CREATED, first.data)

        registration = EventRegistration.objects.get(
            user=self.user, registration_config=self.er
        )
        registration.cancelled_at = timezone.now()
        registration.cancelled_by = self.user
        registration.save(update_fields=["cancelled_at", "cancelled_by"])

        second = self.client.post(
            _register_url("inv-event"),
            data={
                "answers": [
                    {
                        "field": self.inventory_field.id,
                        "value_option": self.opt_vegan.id,
                        "value_number": 1,
                    },
                ]
            },
            format="json",
        )
        self.assertEqual(second.status_code, status.HTTP_201_CREATED, second.data)

        registration.refresh_from_db()
        self.assertIsNone(registration.cancelled_at)
        answer = registration.field_answers.get(field=self.inventory_field)
        self.assertEqual(answer.value_option_id, self.opt_vegan.id)
        self.assertEqual(answer.value_number, 1)

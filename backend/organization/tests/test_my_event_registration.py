"""
Tests for the ``my_event_registration`` field on the project detail endpoint.

Spec: doc/spec/20260526_1130_guest_view_modify_registration.md

Covers:
  - Field is populated for an authenticated registered guest (simple + custom fields)
  - Field is ``null`` for an unauthenticated request
  - Field is ``null`` for an authenticated user who has no registration
  - Field is ``null`` for a cancelled registration
  - Field is absent / null on the list endpoint GET /api/projects/
  - Another user's data is never returned (no IDOR)
  - Project without EventRegistrationConfig returns ``null``
"""

from datetime import timedelta

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

_DUMMY_CACHE = {"default": {"BACKEND": "django.core.cache.backends.dummy.DummyCache"}}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _get_or_create_language():
    lang, _ = Language.objects.get_or_create(
        language_code="en",
        defaults={"name": "English", "native_name": "English"},
    )
    return lang


def _get_or_create_project_status():
    ps, _ = ProjectStatus.objects.update_or_create(
        id=2,
        defaults={
            "name": "active_myreg",
            "name_de_translation": "aktiv",
            "has_end_date": True,
            "has_start_date": True,
        },
    )
    return ps


def _create_event(slug, project_status, language):
    return Project.objects.create(
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


def _create_open_er(project):
    return EventRegistrationConfig.objects.create(
        project=project,
        max_participants=50,
        registration_end_date=timezone.now() + timedelta(days=20),
        status=RegistrationStatus.OPEN,
    )


def _detail_url(slug):
    return reverse("organization:project-api-view", kwargs={"url_slug": slug})


def _list_url():
    return reverse("organization:list-projects")


# ---------------------------------------------------------------------------
# Test suite
# ---------------------------------------------------------------------------


@override_settings(CACHES=_DUMMY_CACHE, CACHE_BACHED_RANK_REQUEST=False)
class TestMyEventRegistrationField(APITestCase):
    """
    Unit-level tests for ``my_event_registration`` on the project detail response.
    """

    def setUp(self):
        ps = _get_or_create_project_status()
        lang = _get_or_create_language()

        self.guest = User.objects.create_user(
            username="guest_myreg",
            password="testpassword",
            first_name="Guest",
            last_name="User",
        )
        self.other_user = User.objects.create_user(
            username="other_myreg",
            password="testpassword",
        )

        self.event = _create_event("myreg-event", ps, lang)
        self.er = _create_open_er(self.event)

    # ------------------------------------------------------------------
    # 1. Populated for an authenticated registered guest
    # ------------------------------------------------------------------

    @tag("my_event_registration")
    def test_registered_guest_sees_own_registration(self):
        """Authenticated user with active registration gets my_event_registration."""
        reg = EventRegistration.objects.create(
            user=self.guest, registration_config=self.er
        )
        self.client.login(username="guest_myreg", password="testpassword")
        response = self.client.get(_detail_url("myreg-event"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["my_event_registration"]
        self.assertIsNotNone(data)
        self.assertEqual(data["id"], reg.id)
        self.assertEqual(data["user_first_name"], "Guest")
        self.assertEqual(data["user_last_name"], "User")
        self.assertIsNone(data["cancelled_at"])

    # ------------------------------------------------------------------
    # 2. Null for unauthenticated request
    # ------------------------------------------------------------------

    @tag("my_event_registration")
    def test_unauthenticated_returns_null(self):
        """Unauthenticated GET must return my_event_registration=null."""
        EventRegistration.objects.create(user=self.guest, registration_config=self.er)
        # No login.
        response = self.client.get(_detail_url("myreg-event"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data.get("my_event_registration"))

    # ------------------------------------------------------------------
    # 3. Null for authenticated non-registered user
    # ------------------------------------------------------------------

    @tag("my_event_registration")
    def test_non_registered_user_returns_null(self):
        """Authenticated user with no registration row gets null."""
        self.client.login(username="guest_myreg", password="testpassword")
        response = self.client.get(_detail_url("myreg-event"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data.get("my_event_registration"))

    # ------------------------------------------------------------------
    # 4. Null for cancelled registration
    # ------------------------------------------------------------------

    @tag("my_event_registration")
    def test_cancelled_registration_returns_null(self):
        """Cancelled registration (cancelled_at set) yields null."""
        reg = EventRegistration.objects.create(
            user=self.guest, registration_config=self.er
        )
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = self.guest
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

        self.client.login(username="guest_myreg", password="testpassword")
        response = self.client.get(_detail_url("myreg-event"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data.get("my_event_registration"))

    # ------------------------------------------------------------------
    # 5. Null for project without EventRegistrationConfig
    # ------------------------------------------------------------------

    @tag("my_event_registration")
    def test_project_without_registration_config_returns_null(self):
        """Project with no EventRegistrationConfig → null (no DoesNotExist crash)."""
        ps = _get_or_create_project_status()
        lang = _get_or_create_language()
        no_config_event = Project.objects.create(
            name="No Config Event",
            url_slug="no-config-event-myreg",
            is_active=True,
            is_draft=False,
            status=ps,
            language=lang,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=30),
            end_date=timezone.now() + timedelta(days=60),
        )
        self.client.login(username="guest_myreg", password="testpassword")
        response = self.client.get(_detail_url("no-config-event-myreg"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data.get("my_event_registration"))
        no_config_event.delete()

    # ------------------------------------------------------------------
    # 6. No IDOR — another user's data is never returned
    # ------------------------------------------------------------------

    @tag("my_event_registration")
    def test_other_users_data_not_returned(self):
        """Guest A must not see guest B's registration when B is logged in."""
        EventRegistration.objects.create(user=self.guest, registration_config=self.er)
        other_reg = EventRegistration.objects.create(
            user=self.other_user, registration_config=self.er
        )

        # other_user logs in and checks the detail endpoint.
        self.client.login(username="other_myreg", password="testpassword")
        response = self.client.get(_detail_url("myreg-event"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data["my_event_registration"]
        self.assertIsNotNone(data)
        # Must be other_user's registration, not guest's.
        self.assertEqual(data["id"], other_reg.id)

    # ------------------------------------------------------------------
    # 7. Custom field answers included in response
    # ------------------------------------------------------------------

    @tag("my_event_registration")
    def test_custom_field_answers_included(self):
        """my_event_registration.field_answers contains the guest's answers."""
        # Create a checkbox field and an option_select field.
        checkbox_field = RegistrationField.objects.create(
            registration_config=self.er,
            field_type="checkbox",
            label="Attending dinner?",
            order=1,
        )
        option_field = RegistrationField.objects.create(
            registration_config=self.er,
            field_type="option_select",
            label="T-shirt size",
            order=2,
        )
        option = RegistrationFieldOption.objects.create(
            field=option_field,
            title="M",
            order=1,
        )

        reg = EventRegistration.objects.create(
            user=self.guest, registration_config=self.er
        )
        RegistrationFieldAnswer.objects.create(
            registration=reg, field=checkbox_field, value_boolean=True
        )
        RegistrationFieldAnswer.objects.create(
            registration=reg, field=option_field, value_option=option
        )

        self.client.login(username="guest_myreg", password="testpassword")
        response = self.client.get(_detail_url("myreg-event"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        field_answers = response.data["my_event_registration"]["field_answers"]
        self.assertEqual(len(field_answers), 2)

        # Answers are sorted by field.order.
        self.assertEqual(field_answers[0]["field"], checkbox_field.id)
        self.assertTrue(field_answers[0]["value_boolean"])
        self.assertIsNone(field_answers[0]["value_option"])

        self.assertEqual(field_answers[1]["field"], option_field.id)
        self.assertIsNone(field_answers[1]["value_boolean"])
        self.assertEqual(field_answers[1]["value_option"], option.id)

    # ------------------------------------------------------------------
    # 8. Field is absent from list endpoint
    # ------------------------------------------------------------------

    @tag("my_event_registration")
    def test_field_absent_from_list_endpoint(self):
        """my_event_registration must NOT appear in the project list response."""
        EventRegistration.objects.create(user=self.guest, registration_config=self.er)
        # ListProjectsView is AllowAny; no auth needed (and test users have no
        # user_profile which causes the list view to crash when authenticated).
        self.client.logout()
        response = self.client.get(_list_url())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get("results", response.data)
        if isinstance(results, list) and results:
            first = results[0]
            self.assertNotIn(
                "my_event_registration",
                first,
                "my_event_registration must not appear in list endpoint results",
            )

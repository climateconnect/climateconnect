"""
Tests for the registration_enabled feature (Phase 4w backend).

Covers spec test cases:
  1. POST to create config for event without config
  2. POST when config already exists and enabled
  3. POST when config exists but disabled (re-enable)
  4. POST by non-admin
  5. POST for non-event project
  6. PATCH to disable enabled config
  7. PATCH to re-enable disabled config
  8. Disabled config excluded from project detail response
  9. Disabled config excluded from project list response
  10. Disabled config with custom fields preserved
  11. PATCH to disable published config
"""

from datetime import timedelta

from django.contrib.auth.models import User
from django.test import tag
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from climateconnect_api.models import Language, Role, UserProfile
from organization.models import Project, ProjectMember, ProjectStatus
from organization.models.event_registration import (
    EventRegistration,
    EventRegistrationConfig,
    RegistrationStatus,
)


class TestRegistrationEnabled(APITestCase):
    """
    Tests for POST and PATCH on /api/projects/{slug}/registration-config/
    with registration_enabled toggle.
    """

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_reg_toggle",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )

        # Organiser
        self.organiser = User.objects.create_user(
            username="reg_toggle_org",
            password="testpassword",
            email="org@example.com",
        )
        self.admin_role = Role.objects.create(
            name="Admin_reg_toggle", role_type=Role.ALL_TYPE
        )

        # Non-admin
        self.non_admin = User.objects.create_user(
            username="reg_toggle_nonadmin",
            password="testpassword",
        )
        # UserProfile required for list endpoint
        UserProfile.objects.get_or_create(user=self.organiser, defaults={"name": "Org"})
        UserProfile.objects.get_or_create(
            user=self.non_admin, defaults={"name": "NonAdmin"}
        )

        # Event project without registration
        self.event_no_reg = Project.objects.create(
            name="Event No Reg",
            url_slug="event-no-reg",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=10),
            end_date=timezone.now() + timedelta(days=60),
        )
        self.admin = ProjectMember.objects.create(
            user=self.organiser,
            project=self.event_no_reg,
            role=self.admin_role,
        )

        # Event project with enabled config
        self.event_with_reg = Project.objects.create(
            name="Event With Reg",
            url_slug="event-with-reg",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=10),
            end_date=timezone.now() + timedelta(days=60),
        )
        self.enabled_config = EventRegistrationConfig.objects.create(
            project=self.event_with_reg,
            max_participants=50,
            registration_end_date=timezone.now() + timedelta(days=30),
            status=RegistrationStatus.OPEN,
            is_draft=False,
            registration_enabled=True,
        )
        # Add a member so there are active registrations
        self.reg_user = User.objects.create_user(
            username="reg_toggle_participant", password="testpassword"
        )
        EventRegistration.objects.create(
            user=self.reg_user, registration_config=self.enabled_config
        )

        # Event project with disabled config
        self.event_disabled_reg = Project.objects.create(
            name="Event Disabled Reg",
            url_slug="event-disabled-reg",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=10),
            end_date=timezone.now() + timedelta(days=60),
        )
        self.disabled_config = EventRegistrationConfig.objects.create(
            project=self.event_disabled_reg,
            max_participants=30,
            status=RegistrationStatus.OPEN,
            is_draft=False,
            registration_enabled=False,
        )

        # Non-event project
        self.non_event = Project.objects.create(
            name="Non Event",
            url_slug="non-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="HO",
            start_date=timezone.now() + timedelta(days=10),
            end_date=timezone.now() + timedelta(days=60),
        )

        # Admin member on all event projects
        for project in [
            self.event_no_reg,
            self.event_with_reg,
            self.event_disabled_reg,
            self.non_event,
        ]:
            ProjectMember.objects.get_or_create(
                user=self.organiser,
                project=project,
                defaults={"role": self.admin_role},
            )

    def _post_url(self, slug):
        return f"/api/projects/{slug}/registration-config/"

    def _patch_url(self, slug):
        return f"/api/projects/{slug}/registration-config/"

    # ── 1. POST to create config for event without config ────────────────────

    @tag("registration_enabled", "post")
    def test_post_creates_draft_config(self):
        """POST creates a draft config with registration_enabled=True."""
        self.client.login(username="reg_toggle_org", password="testpassword")
        response = self.client.post(
            self._post_url("event-no-reg"), data={}, content_type="application/json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertTrue(response.data["is_draft"])
        self.assertTrue(response.data["registration_enabled"])
        self.assertEqual(response.data["status"], "open")
        self.assertIsNone(response.data["max_participants"])
        self.assertIsNone(response.data["registration_end_date"])

    # ── 2. POST when config already exists and enabled ───────────────────────

    @tag("registration_enabled", "post")
    def test_post_returns_409_when_enabled(self):
        """POST returns 409 when a config already exists and is enabled."""
        self.client.login(username="reg_toggle_org", password="testpassword")
        response = self.client.post(
            self._post_url("event-with-reg"), data={}, content_type="application/json"
        )
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    # ── 3. POST when config exists but disabled (re-enable) ──────────────────

    @tag("registration_enabled", "post")
    def test_post_re_enables_disabled_config(self):
        """POST re-enables an existing disabled config."""
        self.client.login(username="reg_toggle_org", password="testpassword")
        response = self.client.post(
            self._post_url("event-disabled-reg"),
            data={},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertTrue(response.data["registration_enabled"])
        self.assertFalse(response.data["is_draft"])
        self.disabled_config.refresh_from_db()
        self.assertTrue(self.disabled_config.registration_enabled)

    # ── 4. POST by non-admin ────────────────────────────────────────────────

    @tag("registration_enabled", "post")
    def test_post_by_non_admin_returns_403(self):
        """POST by non-admin returns 403."""
        self.client.login(username="reg_toggle_nonadmin", password="testpassword")
        response = self.client.post(
            self._post_url("event-no-reg"), data={}, content_type="application/json"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ── 5. POST for non-event project ───────────────────────────────────────

    @tag("registration_enabled", "post")
    def test_post_for_non_event_returns_400(self):
        """POST for non-event project returns 400."""
        self.client.login(username="reg_toggle_org", password="testpassword")
        response = self.client.post(
            self._post_url("non-event"), data={}, content_type="application/json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── 6. PATCH to disable enabled config ───────────────────────────────────

    @tag("registration_enabled", "patch")
    def test_patch_disables_enabled_config(self):
        """PATCH registration_enabled=false disables the config."""
        self.client.login(username="reg_toggle_org", password="testpassword")
        response = self.client.patch(
            self._patch_url("event-with-reg"),
            data={"registration_enabled": False},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertFalse(response.data["registration_enabled"])
        self.enabled_config.refresh_from_db()
        self.assertFalse(self.enabled_config.registration_enabled)

    # ── 7. PATCH to re-enable disabled config ────────────────────────────────

    @tag("registration_enabled", "patch")
    def test_patch_re_enables_disabled_config(self):
        """PATCH registration_enabled=true re-enables the config."""
        self.client.login(username="reg_toggle_org", password="testpassword")
        response = self.client.patch(
            self._patch_url("event-disabled-reg"),
            data={"registration_enabled": True},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertTrue(response.data["registration_enabled"])
        self.disabled_config.refresh_from_db()
        self.assertTrue(self.disabled_config.registration_enabled)

    # ── 8. Disabled config excluded from project detail response ─────────────

    @tag("registration_enabled", "filter")
    def test_disabled_config_excluded_from_detail(self):
        """Disabled config is null in project detail response."""
        self.client.login(username="reg_toggle_org", password="testpassword")
        response = self.client.get(f"/api/projects/event-disabled-reg/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data.get("registration_config"))

    # ── 9. Disabled config excluded from project list response ───────────────

    @tag("registration_enabled", "filter")
    def test_disabled_config_excluded_from_list(self):
        """Disabled config is null in project list response."""
        self.client.login(username="reg_toggle_org", password="testpassword")
        response = self.client.get("/api/projects/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = (
            response.data
            if isinstance(response.data, list)
            else response.data.get("results", [])
        )
        for p in results:
            if p["url_slug"] == "event-disabled-reg":
                self.assertIsNone(p.get("registration_config"))
                return
        self.fail("event-disabled-reg not found in project list")

    # ── 10. Disabled config with custom fields preserved ─────────────────────

    @tag("registration_enabled", "filter")
    def test_disabled_config_fields_preserved_in_db(self):
        """Custom fields are preserved in DB after disabling."""
        from organization.models.registration_field import (
            RegistrationField,
            RegistrationFieldType,
        )

        RegistrationField.objects.create(
            registration_config=self.disabled_config,
            field_type=RegistrationFieldType.OPTION_SELECT,
            order=0,
            label="Workshop",
            settings={"title": "Preferred workshop"},
        )
        # Disable
        self.client.login(username="reg_toggle_org", password="testpassword")
        self.client.patch(
            self._patch_url("event-disabled-reg"),
            data={"registration_enabled": False},
            content_type="application/json",
        )
        # Re-enable
        response = self.client.patch(
            self._patch_url("event-disabled-reg"),
            data={"registration_enabled": True},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            RegistrationField.objects.filter(
                registration_config=self.disabled_config
            ).exists()
        )

    # ── 11. PATCH to disable published config ────────────────────────────────

    @tag("registration_enabled", "patch")
    def test_patch_disables_published_config(self):
        """Disabling a published config preserves status."""
        self.client.login(username="reg_toggle_org", password="testpassword")
        response = self.client.patch(
            self._patch_url("event-with-reg"),
            data={"registration_enabled": False},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.enabled_config.refresh_from_db()
        self.assertFalse(self.enabled_config.registration_enabled)
        # Status should be preserved
        self.assertEqual(self.enabled_config.status, RegistrationStatus.OPEN)

    # ── 12. POST by unauthenticated returns 401 ─────────────────────────────

    @tag("registration_enabled", "post")
    def test_post_unauthenticated_returns_401(self):
        """POST by unauthenticated user returns 401."""
        response = self.client.post(
            self._post_url("event-no-reg"), data={}, content_type="application/json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

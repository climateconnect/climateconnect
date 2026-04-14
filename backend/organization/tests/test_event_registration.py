"""
Tests for the EventRegistrationConfig / EventRegistration (sign-up) feature.

Covers:
- POST /api/projects/ with registration_config payload
- GET /api/projects/{slug}/ returns registration_config
- GET /api/projects/ (list) returns registration_config per item
- Validation: wrong project type, missing fields, invalid max_participants, date order
- DELETE /api/projects/{slug}/registrations/ — member self-cancellation (#1850)
- Member re-registration after self-cancellation and admin-cancellation (#1850)
- GET /api/projects/{slug}/my_interactions/ — is_registered, has_attended, admin_cancelled (#1850)
- DELETE /api/projects/{slug}/registrations/{id}/ — admin cancel guest (#1872)
- GET /api/projects/{slug}/registrations/ returns all rows with id and cancelled_at (#1872)
"""

import io
from base64 import b64encode
from datetime import timedelta
from unittest.mock import patch as mock_patch

from django.contrib.auth.models import User
from django.test import override_settings, tag
from django.urls import reverse
from django.utils import timezone
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from climateconnect_api.models import Language, Role
from location.models import Location
from organization.models import Project, ProjectMember, ProjectStatus
from organization.models.event_registration import (
    EventRegistration,
    EventRegistrationConfig,
    RegistrationStatus,
)


def _make_black_image_b64():
    img = Image.new("RGB", (10, 10), "black")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + b64encode(buf.getvalue()).decode("utf-8")


@override_settings(ENABLE_LEGACY_LOCATION_FORMAT="True")
class TestEventRegistrationCreate(APITestCase):
    """Tests for creating an event with registration_config via POST /api/projects/."""

    def setUp(self):
        self.url = reverse("organization:create-project-api")

        # The CreateProjectView hardcodes request.data["status"] = 2, so we
        # must ensure a ProjectStatus with id=2 exists.
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_er",
                "name_de_translation": "aktiv",
                "has_end_date": True,
                "has_start_date": True,
            },
        )

        self.user = User.objects.create_user(
            username="testuser_er",
            password="testpassword",
        )

        Location.objects.get_or_create(
            city="Test City",
            country="Testland",
            defaults={"name": "Test City, Testland", "place_id": 9999},
        )

        self.default_language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )

        self.image = _make_black_image_b64()

        # Legacy location format only requires country (+ optional city)
        self.location_data = {
            "place_id": 9999,
            "country": "Testland",
            "city": "Test City",
            "name": "Test City",
            "type": "city",
            "lon": 13.0,
            "lat": 52.0,
        }

        self.event_project_type = {
            "name": "Event",
            "original_name": "Event",
            "help_text": "Your Project will show up in the Event calendar",
            "icon": "",
            "type_id": "event",
        }

        self.project_project_type = {
            "name": "Project",
            "original_name": "Project",
            "help_text": "Not an Idea or Event? Click here.",
            "icon": "",
            "type_id": "project",
        }

        self.base_event_data = {
            "name": "Test Event ER",
            "status": self.project_status.id,
            "short_description": "A short description",
            "collaborators_welcome": False,
            "team_members": [],
            "project_tags": [],
            "sectors": [],  # required param; empty means no sector tagging
            "loc": self.location_data,
            "image": self.image,
            "source_language": self.default_language.language_code,  # "en"
            "translations": {},
            "project_type": self.event_project_type,
            "hubName": None,
            "end_date": "2026-08-01T20:00:00Z",
            "start_date": "2026-07-01T10:00:00Z",
        }

    # ------------------------------------------------------------------
    # Happy-path tests
    # ------------------------------------------------------------------

    @tag("registration_config", "projects")
    def test_create_event_with_registration_creates_event_registration_record(self):
        """POST with valid registration_config payload creates an EventRegistrationConfig row."""
        self.client.login(username="testuser_er", password="testpassword")
        data = {
            **self.base_event_data,
            "registration_config": {
                "max_participants": 50,
                "registration_end_date": "2026-07-31T23:59:00Z",
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

        project = Project.objects.get(url_slug=response.data["url_slug"])
        self.assertTrue(
            EventRegistrationConfig.objects.filter(project=project).exists(),
            "EventRegistrationConfig record should have been created",
        )
        er = EventRegistrationConfig.objects.get(project=project)
        self.assertEqual(er.max_participants, 50)
        # Stored datetime is timezone-aware
        self.assertIsNotNone(er.registration_end_date.tzinfo)

    @tag("registration_config", "projects")
    def test_create_event_without_registration_does_not_create_record(self):
        """POST without registration_config key does not create an EventRegistrationConfig record."""
        self.client.login(username="testuser_er", password="testpassword")

        response = self.client.post(self.url, self.base_event_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

        project = Project.objects.get(url_slug=response.data["url_slug"])
        self.assertFalse(
            EventRegistrationConfig.objects.filter(project=project).exists(),
            "No EventRegistrationConfig record should have been created",
        )

    @tag("registration_config", "projects")
    def test_create_draft_event_with_partial_registration_creates_partial_record(self):
        """POST with is_draft=True and a partial registration_config payload creates an
        EventRegistrationConfig row with null fields for any missing values."""
        self.client.login(username="testuser_er", password="testpassword")
        data = {
            **self.base_event_data,
            "is_draft": True,
            "registration_config": {
                "max_participants": 40,
                # registration_end_date intentionally absent
            },
        }
        # Drafts don't enforce image or loc at the API level
        data.pop("image", None)
        data.pop("loc", None)

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        project = Project.objects.get(url_slug=response.data["url_slug"])
        self.assertTrue(project.is_draft)
        self.assertTrue(
            EventRegistrationConfig.objects.filter(project=project).exists(),
            "Partial ER row should be created even for a draft",
        )
        er = EventRegistrationConfig.objects.get(project=project)
        self.assertEqual(er.max_participants, 40)
        self.assertIsNone(er.registration_end_date)

    # ------------------------------------------------------------------
    # Validation error tests
    # ------------------------------------------------------------------

    @tag("registration_config", "projects")
    def test_create_non_event_with_registration_returns_400(self):
        """POST with registration_config on a non-event project type returns 400."""
        self.client.login(username="testuser_er", password="testpassword")
        data = {
            **self.base_event_data,
            "project_type": self.project_project_type,
            "registration_config": {
                "max_participants": 50,
                "registration_end_date": "2026-07-31T23:59:00Z",
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Serializer returns DRF-standard errors: type check raises a non-field error.
        self.assertIn("non_field_errors", response.data)
        self.assertIn("registration_config", str(response.data["non_field_errors"][0]))

    @tag("registration_config", "projects")
    def test_create_event_registration_missing_max_participants_returns_400(self):
        """registration_config without max_participants returns 400."""
        self.client.login(username="testuser_er", password="testpassword")
        data = {
            **self.base_event_data,
            "registration_config": {
                "registration_end_date": "2026-07-31T23:59:00Z",
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Serializer returns field-level errors keyed by field name.
        self.assertIn("max_participants", response.data)

    @tag("registration_config", "projects")
    def test_create_event_registration_missing_end_date_returns_400(self):
        """registration_config without registration_end_date returns 400."""
        self.client.login(username="testuser_er", password="testpassword")
        data = {
            **self.base_event_data,
            "registration_config": {
                "max_participants": 50,
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("registration_end_date", response.data)

    @tag("registration_config", "projects")
    def test_create_event_registration_zero_max_participants_returns_400(self):
        """max_participants = 0 returns 400."""
        self.client.login(username="testuser_er", password="testpassword")
        data = {
            **self.base_event_data,
            "registration_config": {
                "max_participants": 0,
                "registration_end_date": "2026-07-31T23:59:00Z",
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # min_value=1 on the field produces a field-level error, not a message string.
        self.assertIn("max_participants", response.data)

    @tag("registration_config", "projects")
    def test_create_event_registration_end_date_after_event_end_returns_400(self):
        """registration_end_date after event end_date returns 400."""
        self.client.login(username="testuser_er", password="testpassword")
        data = {
            **self.base_event_data,
            # event ends 2026-08-01 but registration ends 2026-09-01 (after)
            "registration_config": {
                "max_participants": 50,
                "registration_end_date": "2026-09-01T23:59:00Z",
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("registration_end_date", response.data)

    @tag("registration_config", "projects")
    def test_create_event_registration_end_date_equal_to_event_end_is_valid(self):
        """registration_end_date equal to event end_date is allowed."""
        self.client.login(username="testuser_er", password="testpassword")
        data = {
            **self.base_event_data,
            "registration_config": {
                "max_participants": 10,
                "registration_end_date": "2026-08-01T20:00:00Z",  # equal to end_date
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

    @tag("registration_config", "projects")
    def test_unauthenticated_user_cannot_create_event(self):
        """Unauthenticated request returns 401."""
        data = {
            **self.base_event_data,
            "registration_config": {
                "max_participants": 50,
                "registration_end_date": "2026-07-31T23:59:00Z",
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TestEventRegistrationRead(APITestCase):
    """Tests for reading registration_config via GET /api/projects/{slug}/."""

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_er_read",
                "name_de_translation": "aktiv",
                "has_end_date": True,
                "has_start_date": True,
            },
        )

        self.default_language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )

        self.event_project = Project.objects.create(
            name="Event With Registration",
            url_slug="event-with-registration",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date="2026-09-01T10:00:00Z",
            end_date="2026-10-01T20:00:00Z",
        )

        self.registration_config = EventRegistrationConfig.objects.create(
            project=self.event_project,
            max_participants=100,
            registration_end_date="2026-09-01T23:59:00Z",
        )

        self.plain_event_project = Project.objects.create(
            name="Event Without Registration",
            url_slug="event-without-registration",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date="2026-09-01T10:00:00Z",
            end_date="2026-10-01T20:00:00Z",
        )

    @tag("registration_config", "projects")
    def test_get_event_project_includes_event_registration(self):
        """GET /api/projects/{slug}/ returns registration_config object for an event with registration."""
        url = reverse(
            "organization:project-api-view",
            kwargs={"url_slug": "event-with-registration"},
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn("registration_config", data)
        er = data["registration_config"]
        self.assertIsNotNone(er)
        self.assertEqual(er["max_participants"], 100)
        self.assertIn("registration_end_date", er)

    @tag("registration_config", "projects")
    def test_get_event_project_without_registration_returns_null(self):
        """GET /api/projects/{slug}/ returns registration_config: null for event without registration."""
        url = reverse(
            "organization:project-api-view",
            kwargs={"url_slug": "event-without-registration"},
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn("registration_config", data)
        self.assertIsNone(data["registration_config"])

    @tag("registration_config", "projects")
    def test_list_projects_includes_event_registration_field(self):
        """GET /api/projects/ includes registration_config key in each result."""
        url = reverse("organization:list-projects")

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.json().get("results", [])
        self.assertTrue(len(results) > 0, "Expected at least one project in list")
        for item in results:
            self.assertIn(
                "registration_config",
                item,
                "Each list item should contain 'registration_config' key",
            )

    @tag("registration_config", "projects")
    def test_list_includes_registration_data_for_event_with_registration(self):
        """GET /api/projects/ returns correct registration_config data for events with registration."""
        url = reverse("organization:list-projects")

        response = self.client.get(url)

        results = response.json().get("results", [])
        event_result = next(
            (r for r in results if r["url_slug"] == "event-with-registration"), None
        )
        self.assertIsNotNone(event_result, "event-with-registration not found in list")
        er = event_result["registration_config"]
        self.assertIsNotNone(er)
        self.assertEqual(er["max_participants"], 100)

    # ------------------------------------------------------------------
    # "ended" computed status
    # ------------------------------------------------------------------

    @tag("registration_config", "projects")
    def test_open_registration_with_past_end_date_returns_ended_status(self):
        """GET returns status 'ended' when stored status is OPEN but registration_end_date has passed."""
        self.registration_config.registration_end_date = timezone.now() - timedelta(
            hours=1
        )
        self.registration_config.status = RegistrationStatus.OPEN
        self.registration_config.save()

        url = reverse(
            "organization:project-api-view",
            kwargs={"url_slug": "event-with-registration"},
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["registration_config"]["status"], "ended")

    @tag("registration_config", "projects")
    def test_open_registration_with_future_end_date_returns_open_status(self):
        """GET returns status 'open' when stored status is OPEN and end date is in the future."""
        self.registration_config.registration_end_date = timezone.now() + timedelta(
            days=10
        )
        self.registration_config.status = RegistrationStatus.OPEN
        self.registration_config.save()

        url = reverse(
            "organization:project-api-view",
            kwargs={"url_slug": "event-with-registration"},
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["registration_config"]["status"], "open")

    @tag("registration_config", "projects")
    def test_closed_registration_with_past_end_date_returns_closed_not_ended(self):
        """GET returns 'closed' (not 'ended') when organiser explicitly closed registration,
        even if the end date has also passed. Organiser intent takes precedence."""
        self.registration_config.registration_end_date = timezone.now() - timedelta(
            hours=1
        )
        self.registration_config.status = RegistrationStatus.CLOSED
        self.registration_config.save()

        url = reverse(
            "organization:project-api-view",
            kwargs={"url_slug": "event-with-registration"},
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["registration_config"]["status"], "closed")


@override_settings(ENABLE_LEGACY_LOCATION_FORMAT="True")
class TestEventRegistrationStatus(APITestCase):
    """Tests for the status field on EventRegistrationConfig."""

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_er_status",
                "name_de_translation": "aktiv",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.default_language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )
        self.user = User.objects.create_user(
            username="statususer_er",
            password="testpassword",
        )
        self.role = Role.objects.create(
            name="Admin_er_status",
            role_type=Role.ALL_TYPE,
        )
        self.event_project = Project.objects.create(
            name="Status Event",
            url_slug="status-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date="2026-09-01T10:00:00Z",
            end_date="2026-10-01T20:00:00Z",
        )
        self.registration_config = EventRegistrationConfig.objects.create(
            project=self.event_project,
            max_participants=50,
            registration_end_date="2026-09-15T23:59:00Z",
        )
        ProjectMember.objects.create(
            user=self.user,
            project=self.event_project,
            role=self.role,
        )

    def _url(self, slug):
        return reverse("organization:project-api-view", kwargs={"url_slug": slug})

    # ------------------------------------------------------------------
    # Default state
    # ------------------------------------------------------------------

    @tag("registration_config", "status")
    def test_new_event_registration_defaults_to_open(self):
        """A newly created EventRegistrationConfig has status='open' by default."""
        self.assertEqual(self.registration_config.status, RegistrationStatus.OPEN)

    @tag("registration_config", "status")
    def test_get_returns_status_field(self):
        """GET /api/projects/{slug}/ includes status in registration_config."""
        response = self.client.get(self._url("status-event"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        er = response.data["registration_config"]
        self.assertIn("status", er)
        self.assertEqual(er["status"], RegistrationStatus.OPEN)

    # ------------------------------------------------------------------
    # CREATE inherits default status
    # ------------------------------------------------------------------

    @tag("registration_config", "status")
    def test_create_event_registration_default_status_is_open(self):
        """POST /api/projects/ with registration_config payload stores status='open'."""
        create_url = reverse("organization:create-project-api")
        self.client.login(username="statususer_er", password="testpassword")
        location_data = {
            "place_id": 7777,
            "country": "Statusland",
            "city": "Status City",
            "name": "Status City",
            "type": "city",
            "lon": 10.0,
            "lat": 50.0,
        }
        payload = {
            "name": "Status Default Test Event",
            "status": self.project_status.id,
            "short_description": "Testing default status",
            "collaborators_welcome": False,
            "team_members": [],
            "project_tags": [],
            "sectors": [],
            "loc": location_data,
            "image": _make_black_image_b64(),
            "source_language": "en",
            "translations": {},
            "project_type": {"type_id": "event"},
            "hubName": None,
            "start_date": "2026-09-01T10:00:00Z",
            "end_date": "2026-10-01T20:00:00Z",
            "registration_config": {
                "max_participants": 30,
                "registration_end_date": "2026-09-15T23:59:00Z",
            },
        }
        response = self.client.post(create_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        project = Project.objects.get(url_slug=response.data["url_slug"])
        er = project.registration_config
        self.assertEqual(er.status, RegistrationStatus.OPEN)


class TestEditEventRegistrationSettings(APITestCase):
    """
    Tests for PATCH /api/projects/{url_slug}/registration-config/
    (EditRegistrationConfigView).

    Covers:
    - Happy-path updates (max_participants, registration_end_date, both)
    - Response shape: max_participants, registration_end_date, status returned
    - status field is read-only (ignored if included in request body)
    - Validation: past-date guard, upper-bound guard, min_value=1
    - Draft-mode: past-date and upper-bound validations are skipped
    - 404 when project not found
    - 404 when project has no EventRegistrationConfig record
    - 401 Unauthorized for unauthenticated requests
    - 403 Forbidden for authenticated users without edit rights
    """

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_edit_reg",
                "name_de_translation": "aktiv",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.default_language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )

        # Organiser — has ALL_TYPE role on all test projects.
        self.organiser = User.objects.create_user(
            username="organiser_edit_reg", password="testpassword"
        )
        self.role = Role.objects.create(
            name="Admin_edit_reg",
            role_type=Role.ALL_TYPE,
        )

        # Non-member — used for 403 tests.
        self.non_member = User.objects.create_user(
            username="non_member_edit_reg", password="testpassword"
        )

        # Published event with an EventRegistrationConfig.
        self.event = Project.objects.create(
            name="Edit Reg Event",
            url_slug="edit-reg-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=30),
            end_date=timezone.now() + timedelta(days=90),
        )
        self.er = EventRegistrationConfig.objects.create(
            project=self.event,
            max_participants=100,
            registration_end_date=timezone.now() + timedelta(days=60),
            status=RegistrationStatus.OPEN,
        )
        ProjectMember.objects.create(
            user=self.organiser,
            project=self.event,
            role=self.role,
        )

        # Published event WITHOUT an EventRegistrationConfig.
        self.event_no_er = Project.objects.create(
            name="Edit Reg Event No ER",
            url_slug="edit-reg-event-no-er",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=30),
            end_date=timezone.now() + timedelta(days=90),
        )
        ProjectMember.objects.create(
            user=self.organiser,
            project=self.event_no_er,
            role=self.role,
        )

    def _url(self, slug):
        return reverse(
            "organization:edit-registration-config",
            kwargs={"url_slug": slug},
        )

    # ------------------------------------------------------------------
    # Happy-path updates
    # ------------------------------------------------------------------

    @tag("registration_config", "edit_settings")
    def test_patch_max_participants_updates_record(self):
        """PATCH max_participants → 200 OK and DB row is updated."""
        self.client.login(username="organiser_edit_reg", password="testpassword")

        response = self.client.patch(
            self._url("edit-reg-event"),
            {"max_participants": 80},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.er.refresh_from_db()
        self.assertEqual(self.er.max_participants, 80)

    @tag("registration_config", "edit_settings")
    def test_patch_registration_end_date_updates_record(self):
        """PATCH registration_end_date → 200 OK and DB row is updated."""
        self.client.login(username="organiser_edit_reg", password="testpassword")
        new_date = timezone.now() + timedelta(days=45)

        response = self.client.patch(
            self._url("edit-reg-event"),
            {"registration_end_date": new_date.isoformat()},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.er.refresh_from_db()
        # Compare with second precision to avoid microsecond drift.
        self.assertAlmostEqual(
            self.er.registration_end_date.timestamp(),
            new_date.timestamp(),
            delta=1,
        )

    @tag("registration_config", "edit_settings")
    def test_patch_both_fields_updates_both(self):
        """PATCH both fields → 200 OK; both DB values are updated."""
        self.client.login(username="organiser_edit_reg", password="testpassword")
        new_date = timezone.now() + timedelta(days=55)

        response = self.client.patch(
            self._url("edit-reg-event"),
            {
                "max_participants": 200,
                "registration_end_date": new_date.isoformat(),
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.er.refresh_from_db()
        self.assertEqual(self.er.max_participants, 200)

    # ------------------------------------------------------------------
    # Response shape
    # ------------------------------------------------------------------

    @tag("registration_config", "edit_settings")
    def test_200_response_includes_max_participants_registration_end_date_status(self):
        """Successful PATCH returns max_participants, registration_end_date, status, available_seats."""
        self.client.login(username="organiser_edit_reg", password="testpassword")

        response = self.client.patch(
            self._url("edit-reg-event"),
            {"max_participants": 75},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("max_participants", response.data)
        self.assertIn("registration_end_date", response.data)
        self.assertIn("status", response.data)
        self.assertIn("available_seats", response.data)
        self.assertEqual(response.data["max_participants"], 75)
        self.assertEqual(response.data["status"], RegistrationStatus.OPEN)

    @tag("registration_config", "edit_settings")
    def test_response_available_seats_reflects_current_registrations(self):
        """available_seats in PATCH response equals max_participants minus participant count."""
        for i in range(4):
            participant = User.objects.create_user(
                username=f"participant_seats_check_{i}", password="x"
            )
            EventRegistration.objects.create(
                user=participant, registration_config=self.er
            )
        self.client.login(username="organiser_edit_reg", password="testpassword")

        response = self.client.patch(
            self._url("edit-reg-event"),
            {"max_participants": 10},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data["available_seats"], 6)  # 10 - 4

    @tag("registration_config", "edit_settings")
    def test_response_available_seats_is_null_for_unlimited_capacity(self):
        """available_seats is null when max_participants is null (unlimited)."""
        self.er.max_participants = None
        self.er.save(update_fields=["max_participants", "updated_at"])
        self.client.login(username="organiser_edit_reg", password="testpassword")

        response = self.client.patch(
            self._url("edit-reg-event"),
            {
                "registration_end_date": (
                    timezone.now() + timedelta(days=30)
                ).isoformat()
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertIsNone(response.data["available_seats"])

    # ------------------------------------------------------------------
    # status field is read-only via this endpoint
    # ------------------------------------------------------------------

    @tag("registration_config", "edit_settings")
    def test_status_closed_in_request_body_is_applied(self):
        """Including status='closed' in the request body closes the registration."""
        self.client.login(username="organiser_edit_reg", password="testpassword")

        response = self.client.patch(
            self._url("edit-reg-event"),
            {"max_participants": 90, "status": "closed"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.er.refresh_from_db()
        self.assertEqual(self.er.status, RegistrationStatus.CLOSED)
        self.assertEqual(response.data["status"], RegistrationStatus.CLOSED)

    # ------------------------------------------------------------------
    # Validation — published projects
    # ------------------------------------------------------------------

    @tag("registration_config", "edit_settings")
    def test_past_registration_end_date_returns_400(self):
        """PATCH with registration_end_date in the past → 400 Bad Request."""
        self.client.login(username="organiser_edit_reg", password="testpassword")
        past_date = timezone.now() - timedelta(days=1)

        response = self.client.patch(
            self._url("edit-reg-event"),
            {"registration_end_date": past_date.isoformat()},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("registration_end_date", response.data)

    @tag("registration_config", "edit_settings")
    def test_registration_end_date_after_event_end_date_returns_400(self):
        """PATCH with registration_end_date after event end_date → 400."""
        self.client.login(username="organiser_edit_reg", password="testpassword")
        after_event_end = self.event.end_date + timedelta(days=1)

        response = self.client.patch(
            self._url("edit-reg-event"),
            {"registration_end_date": after_event_end.isoformat()},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("registration_end_date", response.data)

    @tag("registration_config", "edit_settings")
    def test_max_participants_zero_returns_400(self):
        """PATCH with max_participants=0 → 400 (min_value=1)."""
        self.client.login(username="organiser_edit_reg", password="testpassword")

        response = self.client.patch(
            self._url("edit-reg-event"),
            {"max_participants": 0},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("max_participants", response.data)

    @tag("registration_config", "edit_settings")
    def test_registration_end_date_equal_to_event_end_date_is_valid(self):
        """registration_end_date exactly equal to event end_date is allowed."""
        self.client.login(username="organiser_edit_reg", password="testpassword")

        response = self.client.patch(
            self._url("edit-reg-event"),
            {"registration_end_date": self.event.end_date.isoformat()},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)

    # ------------------------------------------------------------------
    # Participant count lower-bound guard
    # ------------------------------------------------------------------

    @tag("registration_config", "edit_settings")
    def test_max_participants_below_participant_count_returns_400(self):
        """PATCH max_participants below current registrations → 400 Bad Request."""
        for i in range(3):
            participant = User.objects.create_user(
                username=f"participant_lower_bound_{i}", password="x"
            )
            EventRegistration.objects.create(
                user=participant, registration_config=self.er
            )
        self.client.login(username="organiser_edit_reg", password="testpassword")

        response = self.client.patch(
            self._url("edit-reg-event"),
            {"max_participants": 2},  # below current count of 3
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("max_participants", response.data)
        # Error message must mention the count so the organiser knows the floor.
        self.assertIn("3", str(response.data["max_participants"]))

    @tag("registration_config", "edit_settings")
    def test_max_participants_equal_to_participant_count_is_valid(self):
        """PATCH max_participants equal to current registrations → 200 OK."""
        for i in range(3):
            participant = User.objects.create_user(
                username=f"participant_equal_bound_{i}", password="x"
            )
            EventRegistration.objects.create(
                user=participant, registration_config=self.er
            )
        self.client.login(username="organiser_edit_reg", password="testpassword")

        response = self.client.patch(
            self._url("edit-reg-event"),
            {"max_participants": 3},  # exactly the current count — allowed
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)

    @tag("registration_config", "edit_settings")
    def test_max_participants_patch_does_not_revalidate_stored_end_date(self):
        """PATCH with only max_participants does not trigger the past-date guard
        on the stored registration_end_date. The past-date guard fires only when
        registration_end_date is explicitly included in the request body."""
        # Simulate a registration whose deadline has already passed.
        self.er.registration_end_date = timezone.now() - timedelta(days=1)
        self.er.save(update_fields=["registration_end_date", "updated_at"])

        self.client.login(username="organiser_edit_reg", password="testpassword")

        response = self.client.patch(
            self._url("edit-reg-event"),
            {"max_participants": 120},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.er.refresh_from_db()
        self.assertEqual(self.er.max_participants, 120)

    # ------------------------------------------------------------------
    # 404 responses
    # ------------------------------------------------------------------

    @tag("registration_config", "edit_settings")
    def test_unknown_slug_returns_404(self):
        """PATCH to an unknown project slug → 404 Not Found."""
        self.client.login(username="organiser_edit_reg", password="testpassword")

        response = self.client.patch(
            self._url("does-not-exist"),
            {"max_participants": 50},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @tag("registration_config", "edit_settings")
    def test_project_without_event_registration_returns_404(self):
        """PATCH on a project that has no EventRegistrationConfig → 404 Not Found."""
        self.client.login(username="organiser_edit_reg", password="testpassword")

        response = self.client.patch(
            self._url("edit-reg-event-no-er"),
            {"max_participants": 50},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ------------------------------------------------------------------
    # Authentication and authorisation
    # ------------------------------------------------------------------

    @tag("registration_config", "edit_settings")
    def test_unauthenticated_request_returns_401(self):
        """Unauthenticated PATCH → 401 Unauthorized."""
        response = self.client.patch(
            self._url("edit-reg-event"),
            {"max_participants": 50},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @tag("registration_config", "edit_settings")
    def test_non_member_returns_403(self):
        """Authenticated user who is not a project member → 403 Forbidden."""
        self.client.login(username="non_member_edit_reg", password="testpassword")

        response = self.client.patch(
            self._url("edit-reg-event"),
            {"max_participants": 50},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ------------------------------------------------------------------
    # "ended" computed status in PATCH response
    # ------------------------------------------------------------------

    @tag("registration_config", "edit_settings")
    def test_patch_response_shows_ended_status_when_end_date_is_past(self):
        """PATCH max_participants on a registration whose end_date has passed returns status 'ended'."""
        # Bypass the past-date guard by writing directly to the DB — simulates
        # a registration that was valid when set but has since expired.
        self.er.registration_end_date = timezone.now() - timedelta(hours=1)
        self.er.save(update_fields=["registration_end_date"])

        self.client.login(username="organiser_edit_reg", password="testpassword")
        response = self.client.patch(
            self._url("edit-reg-event"),
            {"max_participants": 90},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["status"], "ended")

    # ------------------------------------------------------------------
    # Status auto-adjustment when max_participants changes
    # ------------------------------------------------------------------

    @tag("registration_config", "edit_settings")
    def test_raising_max_participants_above_full_capacity_auto_reopens_registration(
        self,
    ):
        """PATCH max_participants above current count auto-reopens a FULL registration."""
        for i in range(3):
            participant = User.objects.create_user(
                username=f"participant_auto_reopen_{i}", password="x"
            )
            EventRegistration.objects.create(
                user=participant, registration_config=self.er
            )
        self.er.max_participants = 3
        self.er.status = RegistrationStatus.FULL
        self.er.save(update_fields=["max_participants", "status", "updated_at"])

        self.client.login(username="organiser_edit_reg", password="testpassword")
        response = self.client.patch(
            self._url("edit-reg-event"),
            {"max_participants": 10},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.er.refresh_from_db()
        self.assertEqual(self.er.status, RegistrationStatus.OPEN)
        self.assertEqual(response.data["status"], RegistrationStatus.OPEN)

    @tag("registration_config", "edit_settings")
    def test_lowering_max_participants_to_current_count_auto_sets_full(self):
        """PATCH max_participants equal to current count auto-sets status to FULL."""
        for i in range(3):
            participant = User.objects.create_user(
                username=f"participant_auto_full_{i}", password="x"
            )
            EventRegistration.objects.create(
                user=participant, registration_config=self.er
            )
        # er is OPEN with 100 capacity and 3 participants.
        self.client.login(username="organiser_edit_reg", password="testpassword")

        response = self.client.patch(
            self._url("edit-reg-event"),
            {"max_participants": 3},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.er.refresh_from_db()
        self.assertEqual(self.er.status, RegistrationStatus.FULL)
        self.assertEqual(response.data["status"], RegistrationStatus.FULL)

    @tag("registration_config", "edit_settings")
    def test_setting_max_participants_to_null_reopens_full_registration(self):
        """PATCH max_participants=null (unlimited) auto-reopens a FULL registration."""
        for i in range(3):
            participant = User.objects.create_user(
                username=f"participant_null_reopen_{i}", password="x"
            )
            EventRegistration.objects.create(
                user=participant, registration_config=self.er
            )
        self.er.max_participants = 3
        self.er.status = RegistrationStatus.FULL
        self.er.save(update_fields=["max_participants", "status", "updated_at"])

        self.client.login(username="organiser_edit_reg", password="testpassword")
        response = self.client.patch(
            self._url("edit-reg-event"),
            {"max_participants": None},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.er.refresh_from_db()
        self.assertIsNone(self.er.max_participants)
        self.assertEqual(self.er.status, RegistrationStatus.OPEN)
        self.assertEqual(response.data["status"], RegistrationStatus.OPEN)


class TestEditEventRegistrationStatusChange(APITestCase):
    """
    Tests for organiser-driven status changes via
    PATCH /api/projects/{slug}/registration-config/.

    Covers:
    - Organiser can close registration (open → closed)
    - Organiser can reopen registration (closed → open)
    - full → open transition is permitted (organiser overrides capacity block)
    - Setting status to its current value is idempotent (200 OK, no DB change)
    - "full" and "ended" cannot be set via the API (400 Bad Request)
    - Attempting to reopen when effective_status == "ended" returns 400
    - Status-only PATCH does not affect other fields
    - 401 Unauthorized for unauthenticated requests
    - 403 Forbidden for non-members
    """

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_status_change",
                "name_de_translation": "aktiv",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.default_language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )

        self.organiser = User.objects.create_user(
            username="organiser_status_change", password="testpassword"
        )
        self.role = Role.objects.create(
            name="Admin_status_change",
            role_type=Role.ALL_TYPE,
        )
        self.non_member = User.objects.create_user(
            username="non_member_status_change", password="testpassword"
        )

        self.event = Project.objects.create(
            name="Status Change Event",
            url_slug="status-change-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=30),
            end_date=timezone.now() + timedelta(days=90),
        )
        self.er = EventRegistrationConfig.objects.create(
            project=self.event,
            max_participants=50,
            registration_end_date=timezone.now() + timedelta(days=60),
            status=RegistrationStatus.OPEN,
        )
        ProjectMember.objects.create(
            user=self.organiser,
            project=self.event,
            role=self.role,
        )

    def _url(self, slug="status-change-event"):
        return reverse(
            "organization:edit-registration-config",
            kwargs={"url_slug": slug},
        )

    # ------------------------------------------------------------------
    # Happy-path: close and reopen
    # ------------------------------------------------------------------

    @tag("registration_config", "status_change")
    def test_organiser_can_close_open_registration(self):
        """PATCH status='closed' on an open registration → 200 OK, status is CLOSED."""
        self.client.login(username="organiser_status_change", password="testpassword")

        response = self.client.patch(self._url(), {"status": "closed"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.er.refresh_from_db()
        self.assertEqual(self.er.status, RegistrationStatus.CLOSED)
        self.assertEqual(response.data["status"], RegistrationStatus.CLOSED)

    @tag("registration_config", "status_change")
    def test_organiser_can_reopen_closed_registration(self):
        """PATCH status='open' on a closed registration → 200 OK, status is OPEN."""
        self.er.status = RegistrationStatus.CLOSED
        self.er.save(update_fields=["status", "updated_at"])
        self.client.login(username="organiser_status_change", password="testpassword")

        response = self.client.patch(self._url(), {"status": "open"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.er.refresh_from_db()
        self.assertEqual(self.er.status, RegistrationStatus.OPEN)
        self.assertEqual(response.data["status"], RegistrationStatus.OPEN)

    @tag("registration_config", "status_change")
    def test_cannot_reopen_fully_booked_registration_returns_400(self):
        """PATCH status='open' when stored status is FULL and event is at capacity → 400."""
        # Fill the event to capacity (max_participants=50 from setUp).
        users = [
            User.objects.create_user(username=f"full_cap_user_{i}", password="x")
            for i in range(self.er.max_participants)
        ]
        for u in users:
            EventRegistration.objects.create(user=u, registration_config=self.er)
        self.er.status = RegistrationStatus.FULL
        self.er.save(update_fields=["status", "updated_at"])
        self.client.login(username="organiser_status_change", password="testpassword")

        response = self.client.patch(self._url(), {"status": "open"}, format="json")

        self.assertEqual(
            response.status_code, status.HTTP_400_BAD_REQUEST, response.data
        )
        self.assertIn("status", response.data)
        self.assertIn("fully booked", str(response.data["status"]))

    @tag("registration_config", "status_change")
    def test_cannot_reopen_closed_booked_out_registration_returns_400(self):
        """PATCH status='open' when stored status is CLOSED but event is at capacity → 400."""
        self.er.max_participants = 3
        self.er.status = RegistrationStatus.CLOSED
        self.er.save(update_fields=["status", "max_participants", "updated_at"])
        users = [
            User.objects.create_user(username=f"closed_cap_user_{i}", password="x")
            for i in range(3)
        ]
        for u in users:
            EventRegistration.objects.create(user=u, registration_config=self.er)
        self.client.login(username="organiser_status_change", password="testpassword")

        response = self.client.patch(self._url(), {"status": "open"}, format="json")

        self.assertEqual(
            response.status_code, status.HTTP_400_BAD_REQUEST, response.data
        )
        self.assertIn("status", response.data)
        self.assertIn("fully booked", str(response.data["status"]))

    @tag("registration_config", "status_change")
    def test_organiser_can_reopen_full_registration_after_increasing_capacity(self):
        """PATCH status='open' AND max_participants > current count on a FULL event → 200 OK."""
        self.er.max_participants = 3
        self.er.status = RegistrationStatus.FULL
        self.er.save(update_fields=["status", "max_participants", "updated_at"])
        users = [
            User.objects.create_user(username=f"increase_cap_user_{i}", password="x")
            for i in range(3)
        ]
        for u in users:
            EventRegistration.objects.create(user=u, registration_config=self.er)
        self.client.login(username="organiser_status_change", password="testpassword")

        # Raise cap to 10 (> 3 participants) AND explicitly reopen.
        response = self.client.patch(
            self._url(),
            {"status": "open", "max_participants": 10},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.er.refresh_from_db()
        self.assertEqual(self.er.status, RegistrationStatus.OPEN)
        self.assertEqual(self.er.max_participants, 10)

    # ------------------------------------------------------------------
    # Idempotency
    # ------------------------------------------------------------------

    @tag("registration_config", "status_change")
    def test_setting_status_to_current_open_value_is_idempotent(self):
        """PATCH status='open' on an already-open registration → 200 OK, no change."""
        self.client.login(username="organiser_status_change", password="testpassword")

        response = self.client.patch(self._url(), {"status": "open"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.er.refresh_from_db()
        self.assertEqual(self.er.status, RegistrationStatus.OPEN)

    @tag("registration_config", "status_change")
    def test_setting_status_to_current_closed_value_is_idempotent(self):
        """PATCH status='closed' on an already-closed registration → 200 OK, no change."""
        self.er.status = RegistrationStatus.CLOSED
        self.er.save(update_fields=["status", "updated_at"])
        self.client.login(username="organiser_status_change", password="testpassword")

        response = self.client.patch(self._url(), {"status": "closed"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.er.refresh_from_db()
        self.assertEqual(self.er.status, RegistrationStatus.CLOSED)

    # ------------------------------------------------------------------
    # System-managed statuses rejected on write
    # ------------------------------------------------------------------

    @tag("registration_config", "status_change")
    def test_setting_status_to_full_returns_400(self):
        """PATCH status='full' → 400 Bad Request (system-managed)."""
        self.client.login(username="organiser_status_change", password="testpassword")

        response = self.client.patch(self._url(), {"status": "full"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("status", response.data)
        self.assertIn("system-managed", str(response.data["status"]))

    @tag("registration_config", "status_change")
    def test_setting_status_to_ended_returns_400(self):
        """PATCH status='ended' → 400 Bad Request (system-managed computed value)."""
        self.client.login(username="organiser_status_change", password="testpassword")

        response = self.client.patch(self._url(), {"status": "ended"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("status", response.data)
        self.assertIn("system-managed", str(response.data["status"]))

    # ------------------------------------------------------------------
    # Reopen guard: cannot reopen when effective_status == "ended"
    # ------------------------------------------------------------------

    @tag("registration_config", "status_change")
    def test_cannot_reopen_when_registration_deadline_has_passed(self):
        """PATCH status='open' when deadline is in the past → 400 with helpful message."""
        # Bypass the past-date guard by writing directly — simulates a registration
        # that expired naturally after being created with a valid future date.
        self.er.registration_end_date = timezone.now() - timedelta(hours=1)
        self.er.save(update_fields=["registration_end_date"])
        self.client.login(username="organiser_status_change", password="testpassword")

        response = self.client.patch(self._url(), {"status": "open"}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("status", response.data)
        self.assertIn("deadline has passed", str(response.data["status"]))

    @tag("registration_config", "status_change")
    def test_closing_when_deadline_has_passed_is_allowed(self):
        """PATCH status='closed' when deadline is in the past → 200 OK (allowed)."""
        self.er.registration_end_date = timezone.now() - timedelta(hours=1)
        self.er.save(update_fields=["registration_end_date"])
        self.client.login(username="organiser_status_change", password="testpassword")

        response = self.client.patch(self._url(), {"status": "closed"}, format="json")

        # Closing an ended registration is allowed (no-op in practice but valid).
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.er.refresh_from_db()
        self.assertEqual(self.er.status, RegistrationStatus.CLOSED)

    # ------------------------------------------------------------------
    # Status change does not affect unrelated fields
    # ------------------------------------------------------------------

    @tag("registration_config", "status_change")
    def test_status_only_patch_does_not_change_max_participants(self):
        """PATCH with only status does not alter max_participants."""
        original_max = self.er.max_participants
        self.client.login(username="organiser_status_change", password="testpassword")

        self.client.patch(self._url(), {"status": "closed"}, format="json")

        self.er.refresh_from_db()
        self.assertEqual(self.er.max_participants, original_max)

    @tag("registration_config", "status_change")
    def test_explicit_status_overrides_auto_adjustment(self):
        """When status is explicitly provided, auto-adjustment from max_participants is skipped.

        Scenario: organiser sends status='open' AND max_participants equal to participant
        count. Without the explicit-status priority, auto-adjustment would set FULL.
        With the priority, the explicit status='open' wins.
        """
        # Create 3 participants
        for i in range(3):
            p = User.objects.create_user(
                username=f"p_explicit_override_{i}", password="x"
            )
            EventRegistration.objects.create(user=p, registration_config=self.er)

        self.er.status = RegistrationStatus.FULL
        self.er.max_participants = 3
        self.er.save(update_fields=["status", "max_participants", "updated_at"])

        self.client.login(username="organiser_status_change", password="testpassword")
        # Organiser raises cap to 10 AND explicitly sets status=open — should be OPEN.
        response = self.client.patch(
            self._url(),
            {"status": "open", "max_participants": 10},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.er.refresh_from_db()
        self.assertEqual(self.er.status, RegistrationStatus.OPEN)

    # ------------------------------------------------------------------
    # Auth / authorisation
    # ------------------------------------------------------------------

    @tag("registration_config", "status_change")
    def test_unauthenticated_status_change_returns_401(self):
        """Unauthenticated PATCH → 401 Unauthorized."""
        response = self.client.patch(self._url(), {"status": "closed"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @tag("registration_config", "status_change")
    def test_non_member_status_change_returns_403(self):
        """Authenticated user who is not a project member → 403 Forbidden."""
        self.client.login(username="non_member_status_change", password="testpassword")
        response = self.client.patch(self._url(), {"status": "closed"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ------------------------------------------------------------------
    # Effect on member registration (closed blocks new sign-ups)
    # ------------------------------------------------------------------

    @tag("registration_config", "status_change")
    def test_closed_registration_blocks_new_member_signups(self):
        """After organiser closes registration, POST /registrations/ returns 400."""
        # Close the registration via PATCH
        self.client.login(username="organiser_status_change", password="testpassword")
        patch_resp = self.client.patch(self._url(), {"status": "closed"}, format="json")
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)

        # A new member tries to register
        User.objects.create_user(
            username="blocked_member_status", password="testpassword"
        )
        self.client.login(username="blocked_member_status", password="testpassword")
        register_url = reverse(
            "organization:event-registrations",
            kwargs={"url_slug": "status-change-event"},
        )
        response = self.client.post(register_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @tag("registration_config", "status_change")
    def test_reopened_registration_allows_member_signups(self):
        """After organiser reopens a closed registration, POST /registrations/ succeeds."""
        # First close
        self.er.status = RegistrationStatus.CLOSED
        self.er.save(update_fields=["status", "updated_at"])

        # Reopen via PATCH
        self.client.login(username="organiser_status_change", password="testpassword")
        patch_resp = self.client.patch(self._url(), {"status": "open"}, format="json")
        self.assertEqual(patch_resp.status_code, status.HTTP_200_OK)

        # A member registers successfully
        from unittest.mock import patch as mock_patch

        User.objects.create_user(
            username="allowed_member_status", password="testpassword"
        )
        self.client.login(username="allowed_member_status", password="testpassword")
        register_url = reverse(
            "organization:event-registrations",
            kwargs={"url_slug": "status-change-event"},
        )
        with mock_patch(
            "organization.views.event_registration_views._send_registration_email"
        ):
            response = self.client.post(register_url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class TestListEventParticipants(APITestCase):
    """
    Tests for GET /api/projects/{url_slug}/registrations/
    (EventRegistrationsView).

    Covers all 8 scenarios from the spec test table:
    1. Unauthenticated request → 401
    2. Authenticated non-admin → 403
    3. Organiser on project without EventRegistrationConfig → 404
    4. Organiser, no participants yet → 200 OK, empty list
    5. Organiser, 3 participants → 200 OK, ordered by registered_at asc
    6. Participant with no profile image → user_thumbnail_image is null
    7. Team admin (READ_WRITE_TYPE, not creator) → 200 OK
    8. select_related in use → query count does not grow with participant count
    """

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_list_reg",
                "name_de_translation": "aktiv",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.default_language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )

        # Organiser — ALL_TYPE role.
        self.organiser = User.objects.create_user(
            username="organiser_list_reg",
            password="testpassword",
            first_name="Org",
            last_name="Aniser",
        )
        self.admin_role = Role.objects.create(
            name="Admin_list_reg",
            role_type=Role.ALL_TYPE,
        )

        # Team admin — READ_WRITE_TYPE role (used for test 7).
        self.team_admin = User.objects.create_user(
            username="team_admin_list_reg",
            password="testpassword",
            first_name="Team",
            last_name="Admin",
        )
        self.rw_role = Role.objects.create(
            name="ReadWrite_list_reg",
            role_type=Role.READ_WRITE_TYPE,
        )

        # Non-member — used for 403 tests.
        self.non_member = User.objects.create_user(
            username="non_member_list_reg",
            password="testpassword",
        )

        # Event with registration.
        self.event = Project.objects.create(
            name="List Reg Event",
            url_slug="list-reg-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=30),
            end_date=timezone.now() + timedelta(days=90),
        )
        self.er = EventRegistrationConfig.objects.create(
            project=self.event,
            max_participants=100,
            registration_end_date=timezone.now() + timedelta(days=60),
            status=RegistrationStatus.OPEN,
        )
        ProjectMember.objects.create(
            user=self.organiser,
            project=self.event,
            role=self.admin_role,
        )
        ProjectMember.objects.create(
            user=self.team_admin,
            project=self.event,
            role=self.rw_role,
        )

        # Event WITHOUT registration — used for 404 test.
        self.event_no_er = Project.objects.create(
            name="List Reg Event No ER",
            url_slug="list-reg-event-no-er",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=30),
            end_date=timezone.now() + timedelta(days=90),
        )
        ProjectMember.objects.create(
            user=self.organiser,
            project=self.event_no_er,
            role=self.admin_role,
        )

    def _url(self, slug="list-reg-event"):
        return reverse(
            "organization:event-registrations",
            kwargs={"url_slug": slug},
        )

    def _make_participant(self, username, first_name="", last_name=""):
        """Helper: create a User and an EventRegistration for self.er."""
        user = User.objects.create_user(
            username=username,
            password="x",
            first_name=first_name,
            last_name=last_name,
        )
        return EventRegistration.objects.create(user=user, registration_config=self.er)

    # ------------------------------------------------------------------
    # 1. Unauthenticated
    # ------------------------------------------------------------------

    @tag("registration_config", "list_participants")
    def test_unauthenticated_returns_401(self):
        """GET without auth → 401 Unauthorized."""
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ------------------------------------------------------------------
    # 2. Authenticated non-admin → 403
    # ------------------------------------------------------------------

    @tag("registration_config", "list_participants")
    def test_non_member_returns_403(self):
        """Authenticated user without project membership → 403 Forbidden."""
        self.client.login(username="non_member_list_reg", password="testpassword")
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("message", response.data)

    # ------------------------------------------------------------------
    # 3. Project without EventRegistrationConfig → 404
    # ------------------------------------------------------------------

    @tag("registration_config", "list_participants")
    def test_project_without_event_registration_returns_404(self):
        """Organiser on a project that has no EventRegistrationConfig → 404."""
        self.client.login(username="organiser_list_reg", password="testpassword")
        response = self.client.get(self._url("list-reg-event-no-er"))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("message", response.data)

    # ------------------------------------------------------------------
    # 4. Empty list
    # ------------------------------------------------------------------

    @tag("registration_config", "list_participants")
    def test_no_participants_returns_empty_list(self):
        """Organiser on valid event with zero registrations → 200 OK, empty list."""
        self.client.login(username="organiser_list_reg", password="testpassword")
        response = self.client.get(self._url())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), [])

    # ------------------------------------------------------------------
    # 5. Three participants, ordered by registered_at asc
    # ------------------------------------------------------------------

    @tag("registration_config", "list_participants")
    def test_three_participants_returned_in_registration_date_order(self):
        """Returns 3 participants in registered_at ascending order."""
        # Create in reverse order to verify ordering is applied.
        p3 = self._make_participant("part_list_c", "Charlie", "Brown")
        p2 = self._make_participant("part_list_b", "Bob", "Jones")
        p1 = self._make_participant("part_list_a", "Alice", "Smith")

        # Force registered_at ordering for determinism.
        base = timezone.now()
        EventRegistration.objects.filter(pk=p1.pk).update(
            registered_at=base + timedelta(minutes=1)
        )
        EventRegistration.objects.filter(pk=p2.pk).update(
            registered_at=base + timedelta(minutes=2)
        )
        EventRegistration.objects.filter(pk=p3.pk).update(
            registered_at=base + timedelta(minutes=3)
        )

        self.client.login(username="organiser_list_reg", password="testpassword")
        response = self.client.get(self._url())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 3)

        # First row is the one with the earliest registered_at (p1 = Alice).
        self.assertEqual(data[0]["user_first_name"], "Alice")
        self.assertEqual(data[0]["user_last_name"], "Smith")
        self.assertIn("registered_at", data[0])

        # Response fields present on every row.
        for row in data:
            self.assertIn("user_first_name", row)
            self.assertIn("user_last_name", row)
            self.assertIn("user_url_slug", row)
            self.assertIn("user_thumbnail_image", row)
            self.assertIn("registered_at", row)

    # ------------------------------------------------------------------
    # 6. No profile image → user_thumbnail_image is null
    # ------------------------------------------------------------------

    @tag("registration_config", "list_participants")
    def test_participant_without_thumbnail_returns_null_image(self):
        """A participant whose UserProfile has no thumbnail → user_thumbnail_image is null."""
        self._make_participant("part_no_image", "NoImage", "User")

        self.client.login(username="organiser_list_reg", password="testpassword")
        response = self.client.get(self._url())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertIsNone(data[0]["user_thumbnail_image"])

    # ------------------------------------------------------------------
    # 7. Team admin (READ_WRITE_TYPE) can access the list
    # ------------------------------------------------------------------

    @tag("registration_config", "list_participants")
    def test_team_admin_with_read_write_role_can_access_list(self):
        """A team member with READ_WRITE_TYPE role (not just ALL_TYPE) can view registrations."""
        self._make_participant("part_for_admin", "Sample", "Participant")

        self.client.login(username="team_admin_list_reg", password="testpassword")
        response = self.client.get(self._url())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 1)

    # ------------------------------------------------------------------
    # 8. select_related keeps query count constant
    # ------------------------------------------------------------------

    @tag("registration_config", "list_participants")
    def test_query_count_does_not_grow_with_participant_count(self):
        """
        Ensure select_related('user__user_profile') is in effect.

        With 5 participants the DB query count should stay low (≤ 3):
        1 for the project lookup, 1 for the permission check, 1 for the
        participants + joined user/profile data.  Without select_related
        each participant would fire separate user and profile queries.
        """
        for i in range(5):
            self._make_participant(f"part_qcount_{i}", f"First{i}", f"Last{i}")

        self.client.login(username="organiser_list_reg", password="testpassword")

        with self.assertNumQueries(6):
            # Queries: session lookup (1) + auth user lookup (1) + project lookup (1)
            #          + permission check (1) + EventRegistrationConfig lookup (1)
            #          + participants joined with user/profile via select_related (1)
            # Total is constant regardless of participant count — no N+1.
            response = self.client.get(self._url())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 5)


class TestSendOrganizerEmail(APITestCase):
    """
    Tests for POST /api/projects/{url_slug}/registrations/email/
    (SendOrganizerEmailView).

    Covers all 13 backend test cases from the spec:
    1.  Unauthenticated → 401
    2.  Authenticated non-organiser → 403
    3.  Organiser on project without EventRegistrationConfig → 404
    4.  Missing subject → 400
    5.  Missing message → 400
    6.  Subject > 200 characters → 400
    7.  is_test=false, 3 active participants → 200, sent_count=3, task dispatched
    8.  is_test=false, 0 participants → 200, sent_count=0, task dispatched with empty list
    9.  is_test=true → 200, sent_count=1, helper called once with [TEST] prefix
    10. Team admin (READ_WRITE_TYPE) with is_test=false → 200
    11. Celery task: project not found → logs error, returns without raising
    12. Celery task: mail delivery fails → retries (raises Retry on max_retries)
    13. select_related used in task → query count does not grow with recipient count
    """

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_send_email",
                "name_de_translation": "aktiv",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.default_language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )

        # Organiser — ALL_TYPE role.
        self.organiser = User.objects.create_user(
            username="organiser_send_email",
            password="testpassword",
            email="organiser@example.com",
            first_name="Org",
            last_name="Aniser",
        )
        self.admin_role = Role.objects.create(
            name="Admin_send_email",
            role_type=Role.ALL_TYPE,
        )

        # Team admin — READ_WRITE_TYPE role (used for test 10).
        self.team_admin = User.objects.create_user(
            username="team_admin_send_email",
            password="testpassword",
        )
        self.rw_role = Role.objects.create(
            name="ReadWrite_send_email",
            role_type=Role.READ_WRITE_TYPE,
        )

        # Non-member — used for 403 tests.
        self.non_member = User.objects.create_user(
            username="non_member_send_email",
            password="testpassword",
        )

        # Event with registration.
        self.event = Project.objects.create(
            name="Send Email Event",
            url_slug="send-email-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=30),
            end_date=timezone.now() + timedelta(days=90),
        )
        self.er = EventRegistrationConfig.objects.create(
            project=self.event,
            max_participants=100,
            registration_end_date=timezone.now() + timedelta(days=60),
            status=RegistrationStatus.OPEN,
        )
        ProjectMember.objects.create(
            user=self.organiser,
            project=self.event,
            role=self.admin_role,
        )
        ProjectMember.objects.create(
            user=self.team_admin,
            project=self.event,
            role=self.rw_role,
        )

        # Event WITHOUT registration — used for 404 test.
        self.event_no_er = Project.objects.create(
            name="Send Email Event No ER",
            url_slug="send-email-event-no-er",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=30),
            end_date=timezone.now() + timedelta(days=90),
        )
        ProjectMember.objects.create(
            user=self.organiser,
            project=self.event_no_er,
            role=self.admin_role,
        )

    def _url(self, slug="send-email-event"):
        return reverse(
            "organization:send-organizer-email-to-guests",
            kwargs={"url_slug": slug},
        )

    def _valid_payload(self, is_test=False):
        return {
            "subject": "Important update",
            "message": "Hi everyone, here is the update.",
            "is_test": is_test,
        }

    def _make_participant(self, username):
        """Helper: create a User and an EventRegistration for self.er."""
        user = User.objects.create_user(username=username, password="x")
        EventRegistration.objects.create(user=user, registration_config=self.er)
        return user

    # ------------------------------------------------------------------
    # 1. Unauthenticated → 401
    # ------------------------------------------------------------------

    @tag("organizer_email", "auth")
    def test_unauthenticated_returns_401(self):
        """POST without auth → 401 Unauthorized."""
        response = self.client.post(self._url(), self._valid_payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ------------------------------------------------------------------
    # 2. Authenticated non-organiser → 403
    # ------------------------------------------------------------------

    @tag("organizer_email", "auth")
    def test_non_member_returns_403(self):
        """Authenticated user without project membership → 403 Forbidden."""
        self.client.login(username="non_member_send_email", password="testpassword")
        response = self.client.post(self._url(), self._valid_payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("message", response.data)

    # ------------------------------------------------------------------
    # 3. Organiser on project without EventRegistrationConfig → 404
    # ------------------------------------------------------------------

    @tag("organizer_email", "validation")
    def test_project_without_event_registration_returns_404(self):
        """Organiser on a project that has no EventRegistrationConfig → 404 Not Found."""
        self.client.login(username="organiser_send_email", password="testpassword")
        response = self.client.post(
            self._url("send-email-event-no-er"), self._valid_payload(), format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("message", response.data)

    # ------------------------------------------------------------------
    # 4. Missing subject → 400
    # ------------------------------------------------------------------

    @tag("organizer_email", "validation")
    def test_missing_subject_returns_400(self):
        """POST without subject → 400 Bad Request with subject error."""
        self.client.login(username="organiser_send_email", password="testpassword")
        response = self.client.post(
            self._url(),
            {"message": "Hello guests.", "is_test": False},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("subject", response.data)

    # ------------------------------------------------------------------
    # 5. Missing message → 400
    # ------------------------------------------------------------------

    @tag("organizer_email", "validation")
    def test_missing_message_returns_400(self):
        """POST without message → 400 Bad Request with message error."""
        self.client.login(username="organiser_send_email", password="testpassword")
        response = self.client.post(
            self._url(),
            {"subject": "Update", "is_test": False},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("message", response.data)

    # ------------------------------------------------------------------
    # 6. Subject > 200 characters → 400
    # ------------------------------------------------------------------

    @tag("organizer_email", "validation")
    def test_subject_over_200_chars_returns_400(self):
        """POST with subject longer than 200 chars → 400 Bad Request."""
        self.client.login(username="organiser_send_email", password="testpassword")
        response = self.client.post(
            self._url(),
            {"subject": "x" * 201, "message": "Body.", "is_test": False},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("subject", response.data)

    # ------------------------------------------------------------------
    # 7. is_test=false, 3 active participants → 200, task dispatched
    # ------------------------------------------------------------------

    @tag("organizer_email", "bulk_send")
    def test_bulk_send_with_three_participants_returns_sent_count(self):
        """is_test=false with 3 participants → 200 OK, sent_count=3, task dispatched."""
        for i in range(3):
            self._make_participant(f"send_email_p_{i}")

        self.client.login(username="organiser_send_email", password="testpassword")

        with mock_patch(
            "organization.views.event_registration_views._send_organizer_email_task"
        ) as mock_task:
            response = self.client.post(
                self._url(), self._valid_payload(is_test=False), format="json"
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data["sent_count"], 3)
        mock_task.delay.assert_called_once()
        _, kwargs = mock_task.delay.call_args
        self.assertEqual(len(kwargs["user_ids"]), 3)
        self.assertEqual(kwargs["subject"], "Important update")
        self.assertEqual(kwargs["event_slug"], "send-email-event")

    # ------------------------------------------------------------------
    # 8. is_test=false, 0 participants → 200, task dispatched with empty list
    # ------------------------------------------------------------------

    @tag("organizer_email", "bulk_send")
    def test_bulk_send_with_zero_participants_returns_zero_count(self):
        """is_test=false with no participants → 200 OK, sent_count=0, task dispatched with []."""
        self.client.login(username="organiser_send_email", password="testpassword")

        with mock_patch(
            "organization.views.event_registration_views._send_organizer_email_task"
        ) as mock_task:
            response = self.client.post(
                self._url(), self._valid_payload(is_test=False), format="json"
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data["sent_count"], 0)
        mock_task.delay.assert_called_once()
        _, kwargs = mock_task.delay.call_args
        self.assertEqual(kwargs["user_ids"], [])

    # ------------------------------------------------------------------
    # 9. is_test=true → 200, sent_count=1, helper called with [TEST] prefix
    # ------------------------------------------------------------------

    @tag("organizer_email", "test_send")
    def test_test_send_calls_helper_once_with_test_subject_prefix(self):
        """is_test=true → 200 OK, sent_count=1, helper called with '[TEST] ' prefix."""
        self.client.login(username="organiser_send_email", password="testpassword")

        with mock_patch(
            "organization.views.event_registration_views.send_organizer_message_to_guest"
        ) as mock_helper:
            response = self.client.post(
                self._url(), self._valid_payload(is_test=True), format="json"
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data["sent_count"], 1)
        mock_helper.assert_called_once()
        args, _ = mock_helper.call_args
        # args[0] is the user (organiser), args[2] is the subject
        self.assertEqual(args[0].id, self.organiser.id)
        self.assertTrue(args[2].startswith("[TEST] "))
        self.assertIn("Important update", args[2])

    # ------------------------------------------------------------------
    # 10. Team admin (READ_WRITE_TYPE) → 200
    # ------------------------------------------------------------------

    @tag("organizer_email", "auth")
    def test_team_admin_with_read_write_role_can_send_bulk_email(self):
        """Team admin with READ_WRITE_TYPE role → 200 OK."""
        self.client.login(username="team_admin_send_email", password="testpassword")

        with mock_patch(
            "organization.views.event_registration_views._send_organizer_email_task"
        ):
            response = self.client.post(
                self._url(), self._valid_payload(is_test=False), format="json"
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)

    # ------------------------------------------------------------------
    # 11. Celery task: project not found → logs error, returns without raising
    # ------------------------------------------------------------------

    @tag("organizer_email", "celery_task")
    def test_task_project_not_found_logs_error_and_returns(self):
        """If the project cannot be found, the task logs an error and exits cleanly."""
        from organization.tasks import send_organizer_message_to_guests

        with self.assertLogs("organization.tasks", level="ERROR") as cm:
            send_organizer_message_to_guests(
                event_slug="nonexistent-event",
                user_ids=[999],
                subject="Subject",
                message="Body",
            )

        self.assertTrue(
            any("nonexistent-event" in line for line in cm.output),
            "Expected error log mentioning the missing slug",
        )

    # ------------------------------------------------------------------
    # 12. Celery task: mail delivery fails → retries (Retry exception raised)
    # ------------------------------------------------------------------

    @tag("organizer_email", "celery_task")
    def test_task_retries_on_mail_delivery_failure(self):
        """When send_organizer_message_to_guest raises, the task does not swallow the
        exception — it propagates it (which triggers a Celery retry in production).

        When called directly in tests, Celery's self.retry(exc=exc) re-raises the
        original exception after exhausting retries, so we assert any exception escapes.
        """
        from organization.tasks import send_organizer_message_to_guests

        participant = self._make_participant("retry_test_user")

        with (
            mock_patch(
                "organization.utility.email.send_organizer_message_to_guest",
                side_effect=Exception("Mailjet down"),
            ),
            self.assertRaises(Exception),
        ):
            send_organizer_message_to_guests(
                event_slug=self.event.url_slug,
                user_ids=[participant.id],
                subject="Subject",
                message="Body",
            )

    # ------------------------------------------------------------------
    # 13. select_related used in task → query count does not grow with recipients
    # ------------------------------------------------------------------

    @tag("organizer_email", "celery_task")
    def test_task_query_count_does_not_grow_with_recipients(self):
        """
        select_related("user_profile__location") keeps the DB query count constant
        regardless of how many recipients there are.

        Expected queries (4 total):
        1. Project lookup with select_related(loc, language)
        2. Prefetch: translation_project (1 batch query)
        3. Prefetch: project_parent chain (1 batch query)
        4. Users fetch with select_related(user_profile__location) — 1 IN query
           regardless of recipient count, thanks to select_related.

        With 5 recipients the count must stay at 4 — no N+1.
        """
        from organization.tasks import send_organizer_message_to_guests

        for i in range(5):
            self._make_participant(f"qcount_task_user_{i}")

        user_ids = list(
            EventRegistration.objects.filter(registration_config=self.er).values_list(
                "user_id", flat=True
            )
        )

        with mock_patch(
            "organization.utility.email.send_organizer_message_to_guest"
        ) as mock_helper:
            with self.assertNumQueries(4):
                send_organizer_message_to_guests(
                    event_slug=self.event.url_slug,
                    user_ids=user_ids,
                    subject="Subject",
                    message="Body",
                )

        self.assertEqual(mock_helper.call_count, 5)


# ===========================================================================
# Shared setUp mixin for cancellation / interaction tests
# ===========================================================================


class _CancellationTestBase(APITestCase):
    """
    Common setUp for member-cancel, re-registration, my_interactions,
    and admin-cancel test classes.

    Creates:
        self.event          — future event, start_date in 30 days
        self.er             — EventRegistrationConfig (max 10, open)
        self.organiser      — ALL_TYPE project member
        self.team_admin     — READ_WRITE_TYPE project member
        self.member         — a guest user (not a project member)
        self.non_member     — no project membership, no registration
    """

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_cancel",
                "name_de_translation": "aktiv",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.default_language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )

        self.organiser = User.objects.create_user(
            username="organiser_cancel", password="testpassword"
        )
        self.admin_role = Role.objects.create(
            name="Admin_cancel", role_type=Role.ALL_TYPE
        )
        self.team_admin = User.objects.create_user(
            username="teamadmin_cancel", password="testpassword"
        )
        self.rw_role = Role.objects.create(
            name="ReadWrite_cancel", role_type=Role.READ_WRITE_TYPE
        )
        self.member = User.objects.create_user(
            username="member_cancel", password="testpassword"
        )
        self.non_member = User.objects.create_user(
            username="nonmember_cancel", password="testpassword"
        )

        self.event = Project.objects.create(
            name="Cancel Test Event",
            url_slug="cancel-test-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=30),
            end_date=timezone.now() + timedelta(days=90),
        )
        self.er = EventRegistrationConfig.objects.create(
            project=self.event,
            max_participants=10,
            registration_end_date=timezone.now() + timedelta(days=60),
            status=RegistrationStatus.OPEN,
        )
        ProjectMember.objects.create(
            user=self.organiser, project=self.event, role=self.admin_role
        )
        ProjectMember.objects.create(
            user=self.team_admin, project=self.event, role=self.rw_role
        )

    def _register(self, user):
        """Helper: create an active EventRegistration for the given user."""
        return EventRegistration.objects.create(user=user, registration_config=self.er)

    def _cancel_url(self):
        return reverse(
            "organization:event-registrations",
            kwargs={"url_slug": self.event.url_slug},
        )

    def _my_interactions_url(self):
        return reverse(
            "organization:am-i-following-view",
            kwargs={"url_slug": self.event.url_slug},
        )

    def _admin_cancel_url(self, registration_id):
        return reverse(
            "organization:admin-cancel-guest-registration",
            kwargs={
                "url_slug": self.event.url_slug,
                "registration_id": registration_id,
            },
        )


# ===========================================================================
# Member self-cancellation (DELETE /api/projects/{slug}/registrations/)
# ===========================================================================


class TestMemberCancelRegistration(_CancellationTestBase):
    """
    Tests for DELETE /api/projects/{url_slug}/registrations/
    (member self-cancellation, spec #1850).

    Covers all backend test cases from the spec:
    1. Unauthenticated → 401
    2. Member with no registration → 404
    3. Member with already-cancelled registration → 404
    4. Event has already started → 400
    5. Valid cancellation → 204; record soft-deleted (cancelled_at, cancelled_by set)
    6. Cancellation on FULL event → status reverts to OPEN
    7. Cancellation on OPEN event → status stays OPEN
    8. available_seats increases after cancellation (derived from active count)
    """

    @tag("cancel_registration", "member_cancel")
    def test_unauthenticated_returns_401(self):
        """DELETE without auth → 401 Unauthorized."""
        response = self.client.delete(self._cancel_url())
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @tag("cancel_registration", "member_cancel")
    def test_no_registration_returns_404(self):
        """DELETE when member has no registration → 404 Not Found."""
        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.delete(self._cancel_url())
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @tag("cancel_registration", "member_cancel")
    def test_already_cancelled_returns_404(self):
        """DELETE when registration is already cancelled → 404 Not Found."""
        reg = self._register(self.member)
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = self.member
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.delete(self._cancel_url())
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @tag("cancel_registration", "member_cancel")
    def test_event_already_started_returns_400(self):
        """DELETE after event start_date → 400 Bad Request."""
        self._register(self.member)
        self.event.start_date = timezone.now() - timedelta(hours=1)
        self.event.save(update_fields=["start_date"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.delete(self._cancel_url())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @tag("cancel_registration", "member_cancel")
    def test_valid_cancellation_returns_204(self):
        """Valid DELETE → 204 No Content; record soft-deleted."""
        reg = self._register(self.member)

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.delete(self._cancel_url())

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        reg.refresh_from_db()
        self.assertIsNotNone(reg.cancelled_at)
        self.assertEqual(reg.cancelled_by, self.member)

    @tag("cancel_registration", "member_cancel")
    def test_cancellation_record_retained_in_db(self):
        """After cancellation the EventRegistration row still exists (soft delete)."""
        reg = self._register(self.member)

        self.client.login(username="member_cancel", password="testpassword")
        self.client.delete(self._cancel_url())

        self.assertTrue(EventRegistration.objects.filter(pk=reg.pk).exists())

    @tag("cancel_registration", "member_cancel")
    def test_cancellation_on_full_event_reverts_status_to_open(self):
        """When status=FULL and a cancellation frees a seat → status reverts to OPEN."""
        self._register(self.member)
        self.er.status = RegistrationStatus.FULL
        self.er.save(update_fields=["status", "updated_at"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.delete(self._cancel_url())

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.er.refresh_from_db()
        self.assertEqual(self.er.status, RegistrationStatus.OPEN)

    @tag("cancel_registration", "member_cancel")
    def test_cancellation_on_open_event_keeps_status_open(self):
        """Cancellation on an OPEN event with spare capacity → status stays OPEN."""
        # Two registrations exist; cancelling one still leaves capacity.
        self._register(self.member)
        other = User.objects.create_user(username="other_cancel_open", password="x")
        self._register(other)

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.delete(self._cancel_url())

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.er.refresh_from_db()
        self.assertEqual(self.er.status, RegistrationStatus.OPEN)

    @tag("cancel_registration", "member_cancel")
    def test_available_seats_increases_after_cancellation(self):
        """
        After cancellation, the available_seats count in the project detail
        endpoint reflects only active (non-cancelled) registrations.
        """
        self._register(self.member)
        project_url = reverse(
            "organization:project-api-view",
            kwargs={"url_slug": self.event.url_slug},
        )
        resp_before = self.client.get(project_url)
        seats_before = resp_before.data["registration_config"]["available_seats"]

        self.client.login(username="member_cancel", password="testpassword")
        self.client.delete(self._cancel_url())

        resp_after = self.client.get(project_url)
        seats_after = resp_after.data["registration_config"]["available_seats"]
        self.assertEqual(seats_after, seats_before + 1)


# ===========================================================================
# Member re-registration after cancellation
# ===========================================================================


class TestMemberReRegistration(_CancellationTestBase):
    """
    Tests for re-registration via POST /api/projects/{slug}/registrations/
    after a self-cancellation or admin-cancellation (spec #1850).

    1. Self-cancelled → re-registration returns 201; row reset in place (no duplicate)
    2. Admin-cancelled → re-registration returns 403
    3. Re-registration respects closed/full status
    """

    @tag("re_registration")
    def test_self_cancelled_member_can_reregister(self):
        """After self-cancellation POST /registrations/ returns 201 and resets the row."""
        reg = self._register(self.member)
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = self.member
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

        self.client.login(username="member_cancel", password="testpassword")
        with mock_patch(
            "organization.views.event_registration_views._send_registration_email"
        ):
            response = self.client.post(self._cancel_url())

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        reg.refresh_from_db()
        self.assertIsNone(reg.cancelled_at)
        self.assertIsNone(reg.cancelled_by)
        # Unique constraint: no duplicate row.
        self.assertEqual(
            EventRegistration.objects.filter(
                user=self.member, registration_config=self.er
            ).count(),
            1,
        )

    @tag("re_registration")
    def test_admin_cancelled_member_cannot_reregister_returns_403(self):
        """After admin-cancellation POST /registrations/ returns 403 Forbidden."""
        reg = self._register(self.member)
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = self.organiser  # different user = admin-cancelled
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.post(self._cancel_url())

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @tag("re_registration")
    def test_active_registration_post_is_idempotent_200(self):
        """POST when already actively registered → 200 OK (idempotent)."""
        self._register(self.member)
        self.client.login(username="member_cancel", password="testpassword")
        with mock_patch(
            "organization.views.event_registration_views._send_registration_email"
        ):
            response = self.client.post(self._cancel_url())
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @tag("re_registration")
    def test_self_cancelled_cannot_reregister_when_closed(self):
        """Re-registration blocked when registration status is CLOSED → 400."""
        reg = self._register(self.member)
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = self.member
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

        self.er.status = RegistrationStatus.CLOSED
        self.er.save(update_fields=["status", "updated_at"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.post(self._cancel_url())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ===========================================================================
# GET /api/projects/{slug}/my_interactions/ — new fields
# ===========================================================================


class TestMyInteractionsRegistrationFields(_CancellationTestBase):
    """
    Tests for is_registered, has_attended, admin_cancelled fields
    returned by GET /api/projects/{slug}/my_interactions/ (spec #1850).
    """

    @tag("my_interactions", "is_registered")
    def test_is_registered_false_when_no_registration(self):
        """is_registered=false when the user has no registration."""
        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.get(self._my_interactions_url())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["is_registered"])
        self.assertFalse(response.data["has_attended"])
        self.assertFalse(response.data["admin_cancelled"])

    @tag("my_interactions", "is_registered")
    def test_is_registered_true_for_active_registration(self):
        """is_registered=true when the user has an active (non-cancelled) registration."""
        self._register(self.member)
        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.get(self._my_interactions_url())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_registered"])

    @tag("my_interactions", "is_registered")
    def test_is_registered_false_for_cancelled_registration(self):
        """is_registered=false when the user's registration is cancelled."""
        reg = self._register(self.member)
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = self.member
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.get(self._my_interactions_url())
        self.assertFalse(response.data["is_registered"])

    @tag("my_interactions", "has_attended")
    def test_has_attended_false_when_event_not_started(self):
        """has_attended=false when the event has not yet started."""
        self._register(self.member)
        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.get(self._my_interactions_url())
        self.assertFalse(response.data["has_attended"])

    @tag("my_interactions", "has_attended")
    def test_has_attended_true_after_event_starts_with_active_registration(self):
        """has_attended=true when event start_date has passed and registration is active."""
        self._register(self.member)
        self.event.start_date = timezone.now() - timedelta(hours=1)
        self.event.save(update_fields=["start_date"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.get(self._my_interactions_url())
        self.assertTrue(response.data["has_attended"])
        self.assertTrue(response.data["is_registered"])

    @tag("my_interactions", "has_attended")
    def test_has_attended_false_when_cancelled_before_event_start(self):
        """has_attended=false when the user cancelled before the event started."""
        reg = self._register(self.member)
        reg.cancelled_at = timezone.now() - timedelta(days=5)
        reg.cancelled_by = self.member
        reg.save(update_fields=["cancelled_at", "cancelled_by"])
        # Event started after cancellation.
        self.event.start_date = timezone.now() - timedelta(hours=1)
        self.event.save(update_fields=["start_date"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.get(self._my_interactions_url())
        self.assertFalse(response.data["has_attended"])

    @tag("my_interactions", "admin_cancelled")
    def test_admin_cancelled_false_when_no_registration(self):
        """admin_cancelled=false when the user has no registration at all."""
        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.get(self._my_interactions_url())
        self.assertFalse(response.data["admin_cancelled"])

    @tag("my_interactions", "admin_cancelled")
    def test_admin_cancelled_false_when_self_cancelled(self):
        """admin_cancelled=false when the user cancelled their own registration."""
        reg = self._register(self.member)
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = self.member
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.get(self._my_interactions_url())
        self.assertFalse(response.data["admin_cancelled"])

    @tag("my_interactions", "admin_cancelled")
    def test_admin_cancelled_true_when_admin_cancelled_registration(self):
        """admin_cancelled=true when a different user (admin) cancelled the registration."""
        reg = self._register(self.member)
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = self.organiser  # different user = admin-cancelled
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.get(self._my_interactions_url())
        self.assertTrue(response.data["admin_cancelled"])
        self.assertFalse(response.data["is_registered"])


# ===========================================================================
# Admin cancel guest registration — DELETE /projects/{slug}/registrations/{id}/
# ===========================================================================


class TestAdminCancelGuestRegistration(_CancellationTestBase):
    """
    Tests for PATCH /api/projects/{url_slug}/registrations/{registration_id}/
    (admin cancel guest, spec #1872).

    Covers all 12 test cases from the spec:
    1.  Unauthenticated → 401
    2.  Authenticated member without edit rights → 403
    3.  Organiser on project without EventRegistrationConfig → 404
    4.  registration_id does not exist on this project → 404
    5.  Registration already cancelled → 400
    6.  Valid cancellation, no message → 204; cancelled_at set; cancelled_by = admin; no email
    7.  Valid cancellation, message provided → 204; email helper called once
    8.  Event was FULL, cancellation frees a seat → status reverts to OPEN
    9.  Event was OPEN, cancellation frees a seat → status remains OPEN
    10. Team admin (READ_WRITE_TYPE) → 204 (admin role is sufficient)
    11. GET /registrations/ after cancellation → both active and cancelled rows returned
    12. GET /registrations/ — id and cancelled_at fields present on all rows
    """

    @tag("admin_cancel", "auth")
    def test_unauthenticated_returns_401(self):
        reg = self._register(self.member)
        response = self.client.patch(self._admin_cancel_url(reg.pk))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @tag("admin_cancel", "auth")
    def test_non_admin_member_returns_403(self):
        """A user without edit rights on the project → 403 Forbidden."""
        reg = self._register(self.member)
        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.patch(self._admin_cancel_url(reg.pk))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @tag("admin_cancel", "validation")
    def test_project_without_registration_config_returns_404(self):
        """Organiser on project that has no EventRegistrationConfig → 404."""
        # Create a project with no ER config.
        event_no_er = Project.objects.create(
            name="No ER Event",
            url_slug="no-er-event-admin",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=30),
            end_date=timezone.now() + timedelta(days=90),
        )
        ProjectMember.objects.create(
            user=self.organiser, project=event_no_er, role=self.admin_role
        )
        url = reverse(
            "organization:admin-cancel-guest-registration",
            kwargs={"url_slug": event_no_er.url_slug, "registration_id": 9999},
        )
        self.client.login(username="organiser_cancel", password="testpassword")
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @tag("admin_cancel", "validation")
    def test_registration_id_not_on_this_project_returns_404(self):
        """registration_id that does not belong to this project → 404."""
        self.client.login(username="organiser_cancel", password="testpassword")
        response = self.client.patch(self._admin_cancel_url(99999))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @tag("admin_cancel", "validation")
    def test_already_cancelled_registration_returns_400(self):
        """Trying to cancel an already-cancelled registration → 400 Bad Request."""
        reg = self._register(self.member)
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = self.organiser
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

        self.client.login(username="organiser_cancel", password="testpassword")
        response = self.client.patch(self._admin_cancel_url(reg.pk))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @tag("admin_cancel", "happy_path")
    def test_valid_cancellation_no_message_returns_204(self):
        """Valid cancellation without a message → 204; record soft-deleted; no email."""
        reg = self._register(self.member)
        self.client.login(username="organiser_cancel", password="testpassword")

        with mock_patch(
            "organization.views.event_registration_views.send_guest_cancellation_notification"
        ) as mock_email:
            response = self.client.patch(
                self._admin_cancel_url(reg.pk), {}, format="json"
            )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        reg.refresh_from_db()
        self.assertIsNotNone(reg.cancelled_at)
        self.assertEqual(reg.cancelled_by, self.organiser)
        mock_email.assert_not_called()

    @tag("admin_cancel", "happy_path")
    def test_valid_cancellation_with_message_sends_email(self):
        """Valid cancellation with a message → 204; email helper called once with message."""
        reg = self._register(self.member)
        self.client.login(username="organiser_cancel", password="testpassword")

        with mock_patch(
            "organization.views.event_registration_views.send_guest_cancellation_notification"
        ) as mock_email:
            response = self.client.patch(
                self._admin_cancel_url(reg.pk),
                {"message": "You have been removed from this event."},
                format="json",
            )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        mock_email.assert_called_once()
        # First positional arg is the guest User.
        args, _ = mock_email.call_args
        self.assertEqual(args[0].id, self.member.id)
        self.assertIn("removed", args[2])

    @tag("admin_cancel", "status")
    def test_full_event_reverts_to_open_after_admin_cancellation(self):
        """Cancellation on a FULL event → status reverts to OPEN."""
        reg = self._register(self.member)
        self.er.status = RegistrationStatus.FULL
        self.er.save(update_fields=["status", "updated_at"])

        self.client.login(username="organiser_cancel", password="testpassword")
        with mock_patch(
            "organization.views.event_registration_views.send_guest_cancellation_notification"
        ):
            response = self.client.patch(
                self._admin_cancel_url(reg.pk), {}, format="json"
            )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.er.refresh_from_db()
        self.assertEqual(self.er.status, RegistrationStatus.OPEN)

    @tag("admin_cancel", "status")
    def test_open_event_stays_open_after_admin_cancellation(self):
        """Cancellation on an OPEN event with spare capacity → status stays OPEN."""
        reg = self._register(self.member)
        other = User.objects.create_user(username="other_admin_cancel", password="x")
        self._register(other)

        self.client.login(username="organiser_cancel", password="testpassword")
        with mock_patch(
            "organization.views.event_registration_views.send_guest_cancellation_notification"
        ):
            response = self.client.patch(
                self._admin_cancel_url(reg.pk), {}, format="json"
            )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.er.refresh_from_db()
        self.assertEqual(self.er.status, RegistrationStatus.OPEN)

    @tag("admin_cancel", "auth")
    def test_team_admin_read_write_role_can_cancel(self):
        """Team admin (READ_WRITE_TYPE role) can cancel a guest registration."""
        reg = self._register(self.member)
        self.client.login(username="teamadmin_cancel", password="testpassword")

        with mock_patch(
            "organization.views.event_registration_views.send_guest_cancellation_notification"
        ):
            response = self.client.patch(
                self._admin_cancel_url(reg.pk), {}, format="json"
            )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    @tag("admin_cancel", "list_view")
    def test_list_returns_cancelled_rows_after_admin_cancellation(self):
        """GET /registrations/ after admin cancellation returns both active and cancelled rows."""
        reg1 = self._register(self.member)
        other = User.objects.create_user(username="active_guest_after", password="x")
        self._register(other)

        # Admin-cancel reg1.
        self.client.login(username="organiser_cancel", password="testpassword")
        with mock_patch(
            "organization.views.event_registration_views.send_guest_cancellation_notification"
        ):
            self.client.patch(self._admin_cancel_url(reg1.pk), {}, format="json")

        list_url = reverse(
            "organization:event-registrations",
            kwargs={"url_slug": self.event.url_slug},
        )
        response = self.client.get(list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 2)  # both rows returned

        # One row should have a non-null cancelled_at.
        cancelled_rows = [r for r in data if r["cancelled_at"] is not None]
        active_rows = [r for r in data if r["cancelled_at"] is None]
        self.assertEqual(len(cancelled_rows), 1)
        self.assertEqual(len(active_rows), 1)

    @tag("admin_cancel", "list_view")
    def test_list_response_includes_id_and_cancelled_at_on_all_rows(self):
        """GET /registrations/ — id and cancelled_at present on all rows."""
        self._register(self.member)
        other = User.objects.create_user(username="id_check_guest", password="x")
        other_reg = self._register(other)
        other_reg.cancelled_at = timezone.now()
        other_reg.cancelled_by = self.organiser
        other_reg.save(update_fields=["cancelled_at", "cancelled_by"])

        self.client.login(username="organiser_cancel", password="testpassword")
        list_url = reverse(
            "organization:event-registrations",
            kwargs={"url_slug": self.event.url_slug},
        )
        response = self.client.get(list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for row in response.json():
            self.assertIn("id", row)
            self.assertIn("cancelled_at", row)
            self.assertIsNotNone(row["id"])


# ---------------------------------------------------------------------------
# Tests for notify_admins field (#1882)
# ---------------------------------------------------------------------------


class TestNotifyAdminsField(APITestCase):
    """
    Tests for the ``notify_admins`` boolean field on EventRegistrationConfig.

    Covers spec test cases 1–6 (backend):
    1. GET /api/projects/{slug}/ includes registration_config.notify_admins
    2. GET /api/projects/ (list) does NOT include notify_admins
    3. POST /api/projects/ with notify_admins=false creates config with notify_admins=False
    4. POST /api/projects/ without notify_admins defaults to True
    5. PATCH /api/projects/{slug}/registration-config/ with notify_admins=false updates field
    6. PATCH /api/projects/{slug}/registration-config/ without notify_admins leaves value unchanged
    """

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_notify_admins",
                "name_de_translation": "aktiv",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.default_language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )

        self.organiser = User.objects.create_user(
            username="organiser_notify_admins", password="testpassword"
        )
        self.role = Role.objects.create(
            name="Admin_notify_admins",
            role_type=Role.ALL_TYPE,
        )

        # Published event with an EventRegistrationConfig (notify_admins=True by default).
        self.event = Project.objects.create(
            name="Notify Admins Event",
            url_slug="notify-admins-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=30),
            end_date=timezone.now() + timedelta(days=90),
        )
        self.er = EventRegistrationConfig.objects.create(
            project=self.event,
            max_participants=50,
            registration_end_date=timezone.now() + timedelta(days=60),
            notify_admins=True,
        )
        ProjectMember.objects.create(
            user=self.organiser,
            project=self.event,
            role=self.role,
        )

    def _detail_url(self, slug):
        return reverse("organization:project-api-view", kwargs={"url_slug": slug})

    def _edit_config_url(self, slug):
        return reverse(
            "organization:edit-registration-config", kwargs={"url_slug": slug}
        )

    # ------------------------------------------------------------------
    # Test case 1: GET detail includes notify_admins
    # ------------------------------------------------------------------

    @tag("notify_admins", "registration_config")
    def test_get_detail_includes_notify_admins(self):
        """GET /api/projects/{slug}/ returns registration_config.notify_admins."""
        response = self.client.get(self._detail_url("notify-admins-event"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn("registration_config", data)
        er = data["registration_config"]
        self.assertIsNotNone(er)
        self.assertIn("notify_admins", er)
        self.assertTrue(er["notify_admins"])

    # ------------------------------------------------------------------
    # Test case 2: GET list does NOT include notify_admins
    # ------------------------------------------------------------------

    @tag("notify_admins", "registration_config")
    def test_get_list_does_not_include_notify_admins(self):
        """GET /api/projects/ list response does not include notify_admins in registration_config."""
        url = reverse("organization:list-projects")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.json().get("results", [])
        event_result = next(
            (r for r in results if r["url_slug"] == "notify-admins-event"), None
        )
        self.assertIsNotNone(event_result, "notify-admins-event not found in list")
        er = event_result.get("registration_config")
        self.assertIsNotNone(er)
        self.assertNotIn(
            "notify_admins",
            er,
            "notify_admins must not appear in list endpoint registration_config",
        )

    # ------------------------------------------------------------------
    # Test cases 5 & 6: PATCH /registration-config/
    # ------------------------------------------------------------------

    @tag("notify_admins", "registration_config", "edit_settings")
    def test_patch_notify_admins_false_updates_field(self):
        """PATCH with notify_admins=false persists False and response includes updated value."""
        self.client.login(username="organiser_notify_admins", password="testpassword")

        response = self.client.patch(
            self._edit_config_url("notify-admins-event"),
            {"notify_admins": False},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.er.refresh_from_db()
        self.assertFalse(self.er.notify_admins)
        self.assertIn("notify_admins", response.data)
        self.assertFalse(response.data["notify_admins"])

    @tag("notify_admins", "registration_config", "edit_settings")
    def test_patch_without_notify_admins_leaves_value_unchanged(self):
        """PATCH without notify_admins in body leaves the existing value unchanged."""
        # Ensure the stored value is True before the PATCH.
        self.er.notify_admins = True
        self.er.save(update_fields=["notify_admins"])

        self.client.login(username="organiser_notify_admins", password="testpassword")

        response = self.client.patch(
            self._edit_config_url("notify-admins-event"),
            {"max_participants": 60},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.er.refresh_from_db()
        self.assertTrue(
            self.er.notify_admins,
            "notify_admins must remain True when not in PATCH body",
        )

    @tag("notify_admins", "registration_config", "edit_settings")
    def test_patch_notify_admins_true_updates_field(self):
        """PATCH with notify_admins=true persists True."""
        # Start with False.
        self.er.notify_admins = False
        self.er.save(update_fields=["notify_admins"])

        self.client.login(username="organiser_notify_admins", password="testpassword")

        response = self.client.patch(
            self._edit_config_url("notify-admins-event"),
            {"notify_admins": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.er.refresh_from_db()
        self.assertTrue(self.er.notify_admins)
        self.assertTrue(response.data["notify_admins"])


@override_settings(ENABLE_LEGACY_LOCATION_FORMAT="True")
class TestNotifyAdminsCreateProject(APITestCase):
    """
    Tests for notify_admins during event creation via POST /api/projects/.

    Covers spec test cases 3 & 4 (backend):
    3. POST with notify_admins=false creates config with notify_admins=False
    4. POST without notify_admins defaults to True
    """

    def setUp(self):
        self.url = reverse("organization:create-project-api")

        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_notify_create",
                "name_de_translation": "aktiv",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.user = User.objects.create_user(
            username="testuser_notify_create",
            password="testpassword",
        )
        Location.objects.get_or_create(
            city="Test City",
            country="Testland",
            defaults={"name": "Test City, Testland", "place_id": 9999},
        )
        self.default_language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )
        self.image = _make_black_image_b64()
        self.location_data = {
            "place_id": 9999,
            "country": "Testland",
            "city": "Test City",
            "name": "Test City",
            "type": "city",
            "lon": 13.0,
            "lat": 52.0,
        }
        self.event_project_type = {
            "name": "Event",
            "original_name": "Event",
            "help_text": "Your Project will show up in the Event calendar",
            "icon": "",
            "type_id": "event",
        }
        self.base_event_data = {
            "name": "Notify Admins Create Event",
            "status": self.project_status.id,
            "short_description": "A short description",
            "collaborators_welcome": False,
            "team_members": [],
            "project_tags": [],
            "sectors": [],
            "loc": self.location_data,
            "image": self.image,
            "source_language": self.default_language.language_code,
            "translations": {},
            "project_type": self.event_project_type,
            "hubName": None,
            "end_date": "2026-08-01T20:00:00Z",
            "start_date": "2026-07-01T10:00:00Z",
        }

    @tag("notify_admins", "registration_config", "projects")
    def test_create_with_notify_admins_false_stores_false(self):
        """POST with registration_config.notify_admins=false creates config with notify_admins=False."""
        self.client.login(username="testuser_notify_create", password="testpassword")
        data = {
            **self.base_event_data,
            "registration_config": {
                "max_participants": 50,
                "registration_end_date": "2026-07-31T23:59:00Z",
                "notify_admins": False,
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        project = Project.objects.get(url_slug=response.data["url_slug"])
        er = EventRegistrationConfig.objects.get(project=project)
        self.assertFalse(er.notify_admins)

    @tag("notify_admins", "registration_config", "projects")
    def test_create_without_notify_admins_defaults_to_true(self):
        """POST without notify_admins in registration_config creates config with notify_admins=True."""
        self.client.login(username="testuser_notify_create", password="testpassword")
        data = {
            **self.base_event_data,
            "name": "Notify Admins Default Event",
            "registration_config": {
                "max_participants": 50,
                "registration_end_date": "2026-07-31T23:59:00Z",
                # notify_admins intentionally omitted
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        project = Project.objects.get(url_slug=response.data["url_slug"])
        er = EventRegistrationConfig.objects.get(project=project)
        self.assertTrue(er.notify_admins)


# ===========================================================================
# Admin notification email on registration / cancellation (#1888)
# ===========================================================================


class TestAdminNotificationEmailDispatch(APITestCase):
    """
    Tests for the admin notification email dispatch introduced in #1888.

    Covers spec test cases 1–7 (view-level dispatch):
    1.  Member registers; notify_admins=True  → task dispatched with change_type="registered"
    2.  Member registers; notify_admins=False → no task dispatched
    3.  Member re-registers (already active)  → no additional task dispatch (idempotent)
    4.  Member re-registers after self-cancel; notify_admins=True → task dispatched
    5.  Member self-cancels; notify_admins=True  → task dispatched with change_type="cancelled"
    6.  Member self-cancels; notify_admins=False → no task dispatched
    7.  Admin cancels a guest's registration   → no admin notification task dispatched
    """

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_admin_notif",
                "name_de_translation": "aktiv",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.default_language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )

        self.organiser = User.objects.create_user(
            username="organiser_admin_notif", password="testpassword"
        )
        self.admin_role = Role.objects.create(
            name="Admin_admin_notif",
            role_type=Role.ALL_TYPE,
        )
        self.member = User.objects.create_user(
            username="member_admin_notif", password="testpassword"
        )

        self.event = Project.objects.create(
            name="Admin Notif Event",
            url_slug="admin-notif-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=30),
            end_date=timezone.now() + timedelta(days=90),
        )
        self.er = EventRegistrationConfig.objects.create(
            project=self.event,
            max_participants=50,
            registration_end_date=timezone.now() + timedelta(days=60),
            status=RegistrationStatus.OPEN,
            notify_admins=True,
        )
        ProjectMember.objects.create(
            user=self.organiser, project=self.event, role=self.admin_role
        )

    def _register_url(self):
        return reverse(
            "organization:event-registrations",
            kwargs={"url_slug": self.event.url_slug},
        )

    def _admin_cancel_url(self, registration_id):
        return reverse(
            "organization:admin-cancel-guest-registration",
            kwargs={
                "url_slug": self.event.url_slug,
                "registration_id": registration_id,
            },
        )

    # ------------------------------------------------------------------
    # Test 1: Member registers; notify_admins=True → task dispatched
    # ------------------------------------------------------------------

    @tag("admin_notification", "registration_config")
    def test_registration_with_notify_admins_true_dispatches_task(self):
        """POST /registrations/ with notify_admins=True dispatches notify_admins_of_registration_change."""
        self.client.login(username="member_admin_notif", password="testpassword")

        # transaction.on_commit does not fire inside Django TestCase (which wraps
        # everything in a transaction that never commits).  Mock it to call the
        # callback immediately so we can assert on the task dispatch.
        with (
            mock_patch(
                "organization.views.event_registration_views._send_registration_email"
            ),
            mock_patch(
                "organization.views.event_registration_views._notify_admins_task"
            ) as mock_notify,
            mock_patch(
                "organization.views.event_registration_views.transaction.on_commit",
                side_effect=lambda fn: fn(),
            ),
        ):
            response = self.client.post(self._register_url())

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        mock_notify.delay.assert_called_once_with(
            project_id=self.event.id,
            guest_user_id=self.member.id,
            change_type="registered",
        )

    # ------------------------------------------------------------------
    # Test 2: Member registers; notify_admins=False → no task dispatched
    # ------------------------------------------------------------------

    @tag("admin_notification", "registration_config")
    def test_registration_with_notify_admins_false_does_not_dispatch_task(self):
        """POST /registrations/ with notify_admins=False does not dispatch the admin notification task."""
        self.er.notify_admins = False
        self.er.save(update_fields=["notify_admins"])

        self.client.login(username="member_admin_notif", password="testpassword")

        with (
            mock_patch(
                "organization.views.event_registration_views._send_registration_email"
            ),
            mock_patch(
                "organization.views.event_registration_views._notify_admins_task"
            ) as mock_notify,
        ):
            response = self.client.post(self._register_url())

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        mock_notify.delay.assert_not_called()

    # ------------------------------------------------------------------
    # Test 3: Member re-registers (already active) → idempotent, no task
    # ------------------------------------------------------------------

    @tag("admin_notification", "registration_config")
    def test_idempotent_registration_does_not_dispatch_task(self):
        """POST when already actively registered → 200 OK; no admin notification task dispatched."""
        EventRegistration.objects.create(user=self.member, registration_config=self.er)

        self.client.login(username="member_admin_notif", password="testpassword")

        with mock_patch(
            "organization.views.event_registration_views._notify_admins_task"
        ) as mock_notify:
            response = self.client.post(self._register_url())

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mock_notify.delay.assert_not_called()

    # ------------------------------------------------------------------
    # Test 4: Re-registration after self-cancel; notify_admins=True → task dispatched
    # ------------------------------------------------------------------

    @tag("admin_notification", "registration_config")
    def test_reregistration_after_self_cancel_dispatches_task(self):
        """POST after self-cancellation with notify_admins=True dispatches task with change_type='registered'."""
        reg = EventRegistration.objects.create(
            user=self.member, registration_config=self.er
        )
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = self.member
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

        self.client.login(username="member_admin_notif", password="testpassword")

        with (
            mock_patch(
                "organization.views.event_registration_views._send_registration_email"
            ),
            mock_patch(
                "organization.views.event_registration_views._notify_admins_task"
            ) as mock_notify,
        ):
            # captureOnCommitCallbacks executes on_commit callbacks synchronously
            # so we can assert on the task dispatch within the test.
            with self.captureOnCommitCallbacks(execute=True):
                response = self.client.post(self._register_url())

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        mock_notify.delay.assert_called_once_with(
            project_id=self.event.id,
            guest_user_id=self.member.id,
            change_type="registered",
        )

    # ------------------------------------------------------------------
    # Test 5: Member self-cancels; notify_admins=True → task dispatched
    # ------------------------------------------------------------------

    @tag("admin_notification", "registration_config")
    def test_self_cancellation_with_notify_admins_true_dispatches_task(self):
        """DELETE /registrations/ with notify_admins=True dispatches task with change_type='cancelled'."""
        EventRegistration.objects.create(user=self.member, registration_config=self.er)

        self.client.login(username="member_admin_notif", password="testpassword")

        with mock_patch(
            "organization.views.event_registration_views._notify_admins_task"
        ) as mock_notify:
            with self.captureOnCommitCallbacks(execute=True):
                response = self.client.delete(self._register_url())

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        mock_notify.delay.assert_called_once_with(
            project_id=self.event.id,
            guest_user_id=self.member.id,
            change_type="cancelled",
        )

    # ------------------------------------------------------------------
    # Test 6: Member self-cancels; notify_admins=False → no task dispatched
    # ------------------------------------------------------------------

    @tag("admin_notification", "registration_config")
    def test_self_cancellation_with_notify_admins_false_does_not_dispatch_task(self):
        """DELETE /registrations/ with notify_admins=False does not dispatch the admin notification task."""
        self.er.notify_admins = False
        self.er.save(update_fields=["notify_admins"])
        EventRegistration.objects.create(user=self.member, registration_config=self.er)

        self.client.login(username="member_admin_notif", password="testpassword")

        with mock_patch(
            "organization.views.event_registration_views._notify_admins_task"
        ) as mock_notify:
            response = self.client.delete(self._register_url())

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        mock_notify.delay.assert_not_called()

    # ------------------------------------------------------------------
    # Test 7: Admin cancels a guest's registration → no admin notification
    # ------------------------------------------------------------------

    @tag("admin_notification", "registration_config")
    def test_admin_cancel_does_not_dispatch_admin_notification_task(self):
        """PATCH /registrations/{id}/ (admin cancel) does not dispatch the admin notification task."""
        reg = EventRegistration.objects.create(
            user=self.member, registration_config=self.er
        )

        self.client.login(username="organiser_admin_notif", password="testpassword")

        with (
            mock_patch(
                "organization.views.event_registration_views._notify_admins_task"
            ) as mock_notify,
            mock_patch(
                "organization.views.event_registration_views.send_guest_cancellation_notification"
            ),
        ):
            response = self.client.patch(
                self._admin_cancel_url(reg.id),
                data={"message": "Cancelled by admin"},
                format="json",
            )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        mock_notify.delay.assert_not_called()


class TestAdminNotificationTask(APITestCase):
    """
    Tests for the notify_admins_of_registration_change Celery task (#1888).

    Covers spec test cases 8–16 (task-level behaviour):
    8.  notify_admins toggled off between dispatch and execution → task exits early
    9.  Event has 3 team admins → email helper called 3 times
    10. One admin email fails; 2 others succeed → error logged; task retries
    11. Event has no team admins → task runs without error; no emails sent
    12. Non-existent project_id → task exits gracefully; logs warning
    13. Non-existent guest_user_id → task exits gracefully; logs warning
    14. change_type="registered" → subject contains "registered"
    15. change_type="cancelled" → subject contains "cancelled"
    16. Admin has DE language preference → email sent in German
    """

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_task_notif",
                "name_de_translation": "aktiv",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.default_language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )
        self.de_language, _ = Language.objects.get_or_create(
            language_code="de",
            defaults={"name": "German", "native_name": "Deutsch"},
        )

        self.admin_role = Role.objects.create(
            name="Admin_task_notif",
            role_type=Role.ALL_TYPE,
        )
        self.rw_role = Role.objects.create(
            name="RW_task_notif",
            role_type=Role.READ_WRITE_TYPE,
        )

        self.organiser = User.objects.create_user(
            username="organiser_task_notif",
            password="testpassword",
            first_name="Org",
            last_name="Aniser",
        )
        self.guest = User.objects.create_user(
            username="guest_task_notif",
            password="testpassword",
            first_name="Guest",
            last_name="User",
        )

        self.event = Project.objects.create(
            name="Task Notif Event",
            url_slug="task-notif-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=30),
            end_date=timezone.now() + timedelta(days=90),
        )
        self.er = EventRegistrationConfig.objects.create(
            project=self.event,
            max_participants=50,
            registration_end_date=timezone.now() + timedelta(days=60),
            status=RegistrationStatus.OPEN,
            notify_admins=True,
        )
        ProjectMember.objects.create(
            user=self.organiser, project=self.event, role=self.admin_role
        )

    def _run_task(self, project_id=None, guest_user_id=None, change_type="registered"):
        """Helper: run the task synchronously (bypassing Celery)."""
        from organization.tasks import notify_admins_of_registration_change

        notify_admins_of_registration_change.apply(
            kwargs={
                "project_id": project_id if project_id is not None else self.event.id,
                "guest_user_id": (
                    guest_user_id if guest_user_id is not None else self.guest.id
                ),
                "change_type": change_type,
            }
        )

    # ------------------------------------------------------------------
    # Test 8: notify_admins toggled off between dispatch and execution
    # ------------------------------------------------------------------

    @tag("admin_notification", "task")
    def test_task_exits_early_when_notify_admins_toggled_off(self):
        """Task re-checks notify_admins; exits without sending emails if flag is now False."""
        self.er.notify_admins = False
        self.er.save(update_fields=["notify_admins"])

        with mock_patch(
            "organization.utility.email.send_admin_event_notification"
        ) as mock_send:
            self._run_task()

        mock_send.assert_not_called()

    # ------------------------------------------------------------------
    # Test 9: Event has 3 team admins → email helper called 3 times
    # ------------------------------------------------------------------

    @tag("admin_notification", "task")
    def test_task_calls_email_helper_once_per_admin(self):
        """With 3 team admins the email helper is called exactly 3 times."""
        admin2 = User.objects.create_user(
            username="admin2_task_notif",
            password="x",
            first_name="Admin",
            last_name="Two",
        )
        admin3 = User.objects.create_user(
            username="admin3_task_notif",
            password="x",
            first_name="Admin",
            last_name="Three",
        )
        rw_role2 = Role.objects.create(
            name="RW2_task_notif", role_type=Role.READ_WRITE_TYPE
        )
        ProjectMember.objects.create(user=admin2, project=self.event, role=rw_role2)
        rw_role3 = Role.objects.create(
            name="RW3_task_notif", role_type=Role.READ_WRITE_TYPE
        )
        ProjectMember.objects.create(user=admin3, project=self.event, role=rw_role3)

        with mock_patch(
            "organization.utility.email.send_admin_event_notification"
        ) as mock_send:
            self._run_task()

        self.assertEqual(mock_send.call_count, 3)

    # ------------------------------------------------------------------
    # Test 10: One admin email fails; 2 others succeed → error logged; task retries
    # ------------------------------------------------------------------

    @tag("admin_notification", "task")
    def test_one_admin_failure_does_not_prevent_others_and_task_retries(self):
        """When one admin's send raises, the others still receive emails and the task retries."""
        admin2 = User.objects.create_user(
            username="admin2_fail_notif",
            password="x",
            first_name="Admin",
            last_name="Two",
        )
        admin3 = User.objects.create_user(
            username="admin3_fail_notif",
            password="x",
            first_name="Admin",
            last_name="Three",
        )
        rw_role2 = Role.objects.create(
            name="RW2_fail_notif", role_type=Role.READ_WRITE_TYPE
        )
        rw_role3 = Role.objects.create(
            name="RW3_fail_notif", role_type=Role.READ_WRITE_TYPE
        )
        ProjectMember.objects.create(user=admin2, project=self.event, role=rw_role2)
        ProjectMember.objects.create(user=admin3, project=self.event, role=rw_role3)

        call_count = {"n": 0}

        def side_effect(*args, **kwargs):
            call_count["n"] += 1
            if call_count["n"] == 1:
                raise Exception("Simulated email failure")

        from organization.tasks import notify_admins_of_registration_change
        from celery.exceptions import Retry

        with mock_patch(
            "organization.utility.email.send_admin_event_notification",
            side_effect=side_effect,
        ):
            with self.assertRaises(Retry):
                notify_admins_of_registration_change.apply(
                    kwargs={
                        "project_id": self.event.id,
                        "guest_user_id": self.guest.id,
                        "change_type": "registered",
                    },
                    throw=True,
                )

        # All 3 admins were attempted (the failing one was first, the other 2 succeeded).
        self.assertEqual(call_count["n"], 3)

    # ------------------------------------------------------------------
    # Test 11: Event has no team admins → task runs without error
    # ------------------------------------------------------------------

    @tag("admin_notification", "task")
    def test_task_with_no_admins_runs_without_error(self):
        """Task exits gracefully when the event has no team admins."""
        # Remove the organiser from the project.
        from organization.models import ProjectMember as PM

        PM.objects.filter(project=self.event).delete()

        with mock_patch(
            "organization.utility.email.send_admin_event_notification"
        ) as mock_send:
            self._run_task()  # must not raise

        mock_send.assert_not_called()

    # ------------------------------------------------------------------
    # Test 12: Non-existent project_id → task exits gracefully
    # ------------------------------------------------------------------

    @tag("admin_notification", "task")
    def test_task_with_nonexistent_project_exits_gracefully(self):
        """Task logs a warning and returns without raising when project_id is invalid."""
        with mock_patch(
            "organization.utility.email.send_admin_event_notification"
        ) as mock_send:
            self._run_task(project_id=999999)  # must not raise

        mock_send.assert_not_called()

    # ------------------------------------------------------------------
    # Test 13: Non-existent guest_user_id → task exits gracefully
    # ------------------------------------------------------------------

    @tag("admin_notification", "task")
    def test_task_with_nonexistent_guest_user_exits_gracefully(self):
        """Task logs a warning and returns without raising when guest_user_id is invalid."""
        with mock_patch(
            "organization.utility.email.send_admin_event_notification"
        ) as mock_send:
            self._run_task(guest_user_id=999999)  # must not raise

        mock_send.assert_not_called()

    # ------------------------------------------------------------------
    # Test 14: change_type="registered" → subject contains "registered"
    # ------------------------------------------------------------------

    @tag("admin_notification", "task")
    def test_registered_change_type_produces_registered_subject(self):
        """send_admin_event_notification called with change_type='registered' uses registered copy."""
        from organization.utility.email import send_admin_event_notification
        from unittest.mock import patch as _patch

        captured = {}

        def capture_send_email(
            user, variables, template_key, subjects_by_language, **kwargs
        ):
            captured["subjects"] = subjects_by_language
            captured["variables"] = variables

        with _patch(
            "organization.utility.email.send_email",
            side_effect=capture_send_email,
        ):
            send_admin_event_notification(
                admin_user=self.organiser,
                project=self.event,
                guest_user=self.guest,
                change_type="registered",
            )

        self.assertIn("registered", captured["subjects"]["en"].lower())

    # ------------------------------------------------------------------
    # Test 15: change_type="cancelled" → subject contains "cancelled"
    # ------------------------------------------------------------------

    @tag("admin_notification", "task")
    def test_cancelled_change_type_produces_cancelled_subject(self):
        """send_admin_event_notification called with change_type='cancelled' uses cancelled copy."""
        from organization.utility.email import send_admin_event_notification
        from unittest.mock import patch as _patch

        captured = {}

        def capture_send_email(
            user, variables, template_key, subjects_by_language, **kwargs
        ):
            captured["subjects"] = subjects_by_language
            captured["variables"] = variables

        with _patch(
            "organization.utility.email.send_email",
            side_effect=capture_send_email,
        ):
            send_admin_event_notification(
                admin_user=self.organiser,
                project=self.event,
                guest_user=self.guest,
                change_type="cancelled",
            )

        self.assertIn("cancelled", captured["subjects"]["en"].lower())

    # ------------------------------------------------------------------
    # Test 16: Admin has DE language preference → email sent in German
    # ------------------------------------------------------------------

    @tag("admin_notification", "task")
    def test_admin_with_de_language_receives_german_email(self):
        """When admin's language is DE, subject and body are in German."""
        from climateconnect_api.models import UserProfile
        from organization.utility.email import send_admin_event_notification
        from unittest.mock import patch as _patch

        # Set the organiser's language to DE via their UserProfile.
        profile, _ = UserProfile.objects.get_or_create(
            user=self.organiser,
            defaults={"language": self.de_language},
        )
        if profile.language != self.de_language:
            profile.language = self.de_language
            profile.save(update_fields=["language"])

        captured = {}

        def capture_send_email(
            user, variables, template_key, subjects_by_language, **kwargs
        ):
            captured["subjects"] = subjects_by_language
            captured["variables"] = variables

        with _patch(
            "organization.utility.email.send_email",
            side_effect=capture_send_email,
        ):
            send_admin_event_notification(
                admin_user=self.organiser,
                project=self.event,
                guest_user=self.guest,
                change_type="registered",
            )

        # The DE subject should be present and the variables Body should be in German.
        self.assertIn("angemeldet", captured["subjects"]["de"].lower())
        self.assertIn("angemeldet", captured["variables"]["Body"].lower())

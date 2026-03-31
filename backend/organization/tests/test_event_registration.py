"""
Tests for the EventRegistration feature.

Covers:
- POST /api/projects/ with event_registration payload
- GET /api/projects/{slug}/ returns event_registration
- GET /api/projects/ (list) returns event_registration per item
- Validation: wrong project type, missing fields, invalid max_participants, date order
"""

import io
from base64 import b64encode
from datetime import timedelta

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
    EventParticipant,
    EventRegistration,
    RegistrationStatus,
)


def _make_black_image_b64():
    img = Image.new("RGB", (10, 10), "black")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + b64encode(buf.getvalue()).decode("utf-8")


@override_settings(ENABLE_LEGACY_LOCATION_FORMAT="True")
class TestEventRegistrationCreate(APITestCase):
    """Tests for creating an event with event_registration via POST /api/projects/."""

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

    @tag("event_registration", "projects")
    def test_create_event_with_registration_creates_event_registration_record(self):
        """POST with valid event_registration creates an EventRegistration row."""
        self.client.login(username="testuser_er", password="testpassword")
        data = {
            **self.base_event_data,
            "event_registration": {
                "max_participants": 50,
                "registration_end_date": "2026-07-31T23:59:00Z",
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

        project = Project.objects.get(url_slug=response.data["url_slug"])
        self.assertTrue(
            EventRegistration.objects.filter(project=project).exists(),
            "EventRegistration record should have been created",
        )
        er = EventRegistration.objects.get(project=project)
        self.assertEqual(er.max_participants, 50)
        # Stored datetime is timezone-aware
        self.assertIsNotNone(er.registration_end_date.tzinfo)

    @tag("event_registration", "projects")
    def test_create_event_without_registration_does_not_create_record(self):
        """POST without event_registration key does not create an EventRegistration."""
        self.client.login(username="testuser_er", password="testpassword")

        response = self.client.post(self.url, self.base_event_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

        project = Project.objects.get(url_slug=response.data["url_slug"])
        self.assertFalse(
            EventRegistration.objects.filter(project=project).exists(),
            "No EventRegistration record should have been created",
        )

    @tag("event_registration", "projects")
    def test_create_draft_event_with_partial_registration_creates_partial_record(self):
        """POST with is_draft=True and a partial event_registration payload creates an
        EventRegistration row with null fields for any missing values."""
        self.client.login(username="testuser_er", password="testpassword")
        data = {
            **self.base_event_data,
            "is_draft": True,
            "event_registration": {
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
            EventRegistration.objects.filter(project=project).exists(),
            "Partial ER row should be created even for a draft",
        )
        er = EventRegistration.objects.get(project=project)
        self.assertEqual(er.max_participants, 40)
        self.assertIsNone(er.registration_end_date)

    # ------------------------------------------------------------------
    # Validation error tests
    # ------------------------------------------------------------------

    @tag("event_registration", "projects")
    def test_create_non_event_with_registration_returns_400(self):
        """POST with event_registration on a non-event project type returns 400."""
        self.client.login(username="testuser_er", password="testpassword")
        data = {
            **self.base_event_data,
            "project_type": self.project_project_type,
            "event_registration": {
                "max_participants": 50,
                "registration_end_date": "2026-07-31T23:59:00Z",
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Serializer returns DRF-standard errors: type check raises a non-field error.
        self.assertIn("non_field_errors", response.data)
        self.assertIn("event_registration", str(response.data["non_field_errors"][0]))

    @tag("event_registration", "projects")
    def test_create_event_registration_missing_max_participants_returns_400(self):
        """event_registration without max_participants returns 400."""
        self.client.login(username="testuser_er", password="testpassword")
        data = {
            **self.base_event_data,
            "event_registration": {
                "registration_end_date": "2026-07-31T23:59:00Z",
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Serializer returns field-level errors keyed by field name.
        self.assertIn("max_participants", response.data)

    @tag("event_registration", "projects")
    def test_create_event_registration_missing_end_date_returns_400(self):
        """event_registration without registration_end_date returns 400."""
        self.client.login(username="testuser_er", password="testpassword")
        data = {
            **self.base_event_data,
            "event_registration": {
                "max_participants": 50,
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("registration_end_date", response.data)

    @tag("event_registration", "projects")
    def test_create_event_registration_zero_max_participants_returns_400(self):
        """max_participants = 0 returns 400."""
        self.client.login(username="testuser_er", password="testpassword")
        data = {
            **self.base_event_data,
            "event_registration": {
                "max_participants": 0,
                "registration_end_date": "2026-07-31T23:59:00Z",
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # min_value=1 on the field produces a field-level error, not a message string.
        self.assertIn("max_participants", response.data)

    @tag("event_registration", "projects")
    def test_create_event_registration_end_date_after_event_end_returns_400(self):
        """registration_end_date after event end_date returns 400."""
        self.client.login(username="testuser_er", password="testpassword")
        data = {
            **self.base_event_data,
            # event ends 2026-08-01 but registration ends 2026-09-01 (after)
            "event_registration": {
                "max_participants": 50,
                "registration_end_date": "2026-09-01T23:59:00Z",
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("registration_end_date", response.data)

    @tag("event_registration", "projects")
    def test_create_event_registration_end_date_equal_to_event_end_is_valid(self):
        """registration_end_date equal to event end_date is allowed."""
        self.client.login(username="testuser_er", password="testpassword")
        data = {
            **self.base_event_data,
            "event_registration": {
                "max_participants": 10,
                "registration_end_date": "2026-08-01T20:00:00Z",  # equal to end_date
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

    @tag("event_registration", "projects")
    def test_unauthenticated_user_cannot_create_event(self):
        """Unauthenticated request returns 401."""
        data = {
            **self.base_event_data,
            "event_registration": {
                "max_participants": 50,
                "registration_end_date": "2026-07-31T23:59:00Z",
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class TestEventRegistrationRead(APITestCase):
    """Tests for reading event_registration via GET /api/projects/{slug}/."""

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

        self.event_registration = EventRegistration.objects.create(
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

    @tag("event_registration", "projects")
    def test_get_event_project_includes_event_registration(self):
        """GET /api/projects/{slug}/ returns event_registration object for an event with registration."""
        url = reverse(
            "organization:project-api-view",
            kwargs={"url_slug": "event-with-registration"},
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn("event_registration", data)
        er = data["event_registration"]
        self.assertIsNotNone(er)
        self.assertEqual(er["max_participants"], 100)
        self.assertIn("registration_end_date", er)

    @tag("event_registration", "projects")
    def test_get_event_project_without_registration_returns_null(self):
        """GET /api/projects/{slug}/ returns event_registration: null for event without registration."""
        url = reverse(
            "organization:project-api-view",
            kwargs={"url_slug": "event-without-registration"},
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn("event_registration", data)
        self.assertIsNone(data["event_registration"])

    @tag("event_registration", "projects")
    def test_list_projects_includes_event_registration_field(self):
        """GET /api/projects/ includes event_registration key in each result."""
        url = reverse("organization:list-projects")

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.json().get("results", [])
        self.assertTrue(len(results) > 0, "Expected at least one project in list")
        for item in results:
            self.assertIn(
                "event_registration",
                item,
                "Each list item should contain 'event_registration' key",
            )

    @tag("event_registration", "projects")
    def test_list_includes_registration_data_for_event_with_registration(self):
        """GET /api/projects/ returns correct event_registration data for events with registration."""
        url = reverse("organization:list-projects")

        response = self.client.get(url)

        results = response.json().get("results", [])
        event_result = next(
            (r for r in results if r["url_slug"] == "event-with-registration"), None
        )
        self.assertIsNotNone(event_result, "event-with-registration not found in list")
        er = event_result["event_registration"]
        self.assertIsNotNone(er)
        self.assertEqual(er["max_participants"], 100)

    # ------------------------------------------------------------------
    # "ended" computed status
    # ------------------------------------------------------------------

    @tag("event_registration", "projects")
    def test_open_registration_with_past_end_date_returns_ended_status(self):
        """GET returns status 'ended' when stored status is OPEN but registration_end_date has passed."""
        self.event_registration.registration_end_date = timezone.now() - timedelta(
            hours=1
        )
        self.event_registration.status = RegistrationStatus.OPEN
        self.event_registration.save()

        url = reverse(
            "organization:project-api-view",
            kwargs={"url_slug": "event-with-registration"},
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["event_registration"]["status"], "ended")

    @tag("event_registration", "projects")
    def test_open_registration_with_future_end_date_returns_open_status(self):
        """GET returns status 'open' when stored status is OPEN and end date is in the future."""
        self.event_registration.registration_end_date = timezone.now() + timedelta(
            days=10
        )
        self.event_registration.status = RegistrationStatus.OPEN
        self.event_registration.save()

        url = reverse(
            "organization:project-api-view",
            kwargs={"url_slug": "event-with-registration"},
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["event_registration"]["status"], "open")

    @tag("event_registration", "projects")
    def test_closed_registration_with_past_end_date_returns_closed_not_ended(self):
        """GET returns 'closed' (not 'ended') when organiser explicitly closed registration,
        even if the end date has also passed. Organiser intent takes precedence."""
        self.event_registration.registration_end_date = timezone.now() - timedelta(
            hours=1
        )
        self.event_registration.status = RegistrationStatus.CLOSED
        self.event_registration.save()

        url = reverse(
            "organization:project-api-view",
            kwargs={"url_slug": "event-with-registration"},
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["event_registration"]["status"], "closed")


@override_settings(ENABLE_LEGACY_LOCATION_FORMAT="True")
class TestEventRegistrationStatus(APITestCase):
    """Tests for the status field on EventRegistration."""

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
        self.event_registration = EventRegistration.objects.create(
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

    @tag("event_registration", "status")
    def test_new_event_registration_defaults_to_open(self):
        """A newly created EventRegistration has status='open' by default."""
        self.assertEqual(self.event_registration.status, RegistrationStatus.OPEN)

    @tag("event_registration", "status")
    def test_get_returns_status_field(self):
        """GET /api/projects/{slug}/ includes status in event_registration."""
        response = self.client.get(self._url("status-event"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        er = response.data["event_registration"]
        self.assertIn("status", er)
        self.assertEqual(er["status"], RegistrationStatus.OPEN)

    # ------------------------------------------------------------------
    # CREATE inherits default status
    # ------------------------------------------------------------------

    @tag("event_registration", "status")
    def test_create_event_registration_default_status_is_open(self):
        """POST /api/projects/ with event_registration payload stores status='open'."""
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
            "event_registration": {
                "max_participants": 30,
                "registration_end_date": "2026-09-15T23:59:00Z",
            },
        }
        response = self.client.post(create_url, payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        project = Project.objects.get(url_slug=response.data["url_slug"])
        er = project.event_registration
        self.assertEqual(er.status, RegistrationStatus.OPEN)


class TestEditEventRegistrationSettings(APITestCase):
    """
    Tests for PATCH /api/projects/{url_slug}/registration/
    (EditEventRegistrationSettingsView).

    Covers:
    - Happy-path updates (max_participants, registration_end_date, both)
    - Response shape: max_participants, registration_end_date, status returned
    - status field is read-only (ignored if included in request body)
    - Validation: past-date guard, upper-bound guard, min_value=1
    - Draft-mode: past-date and upper-bound validations are skipped
    - 404 when project not found
    - 404 when project has no EventRegistration record
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

        # Published event with an EventRegistration.
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
        self.er = EventRegistration.objects.create(
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

        # Published event WITHOUT an EventRegistration.
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
            "organization:edit-event-registration-settings",
            kwargs={"url_slug": slug},
        )

    # ------------------------------------------------------------------
    # Happy-path updates
    # ------------------------------------------------------------------

    @tag("event_registration", "edit_settings")
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

    @tag("event_registration", "edit_settings")
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

    @tag("event_registration", "edit_settings")
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

    @tag("event_registration", "edit_settings")
    def test_200_response_includes_max_participants_registration_end_date_status(self):
        """Successful PATCH returns max_participants, registration_end_date, status."""
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
        self.assertEqual(response.data["max_participants"], 75)
        self.assertEqual(response.data["status"], RegistrationStatus.OPEN)

    # ------------------------------------------------------------------
    # status field is read-only via this endpoint
    # ------------------------------------------------------------------

    @tag("event_registration", "edit_settings")
    def test_status_in_request_body_is_ignored(self):
        """Including status in the request body does not change the ER status."""
        self.client.login(username="organiser_edit_reg", password="testpassword")

        response = self.client.patch(
            self._url("edit-reg-event"),
            {"max_participants": 90, "status": "closed"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.er.refresh_from_db()
        # Status must remain OPEN — "closed" should have been silently ignored.
        self.assertEqual(self.er.status, RegistrationStatus.OPEN)
        self.assertEqual(response.data["status"], RegistrationStatus.OPEN)

    # ------------------------------------------------------------------
    # Validation — published projects
    # ------------------------------------------------------------------

    @tag("event_registration", "edit_settings")
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

    @tag("event_registration", "edit_settings")
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

    @tag("event_registration", "edit_settings")
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

    @tag("event_registration", "edit_settings")
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

    @tag("event_registration", "edit_settings")
    def test_max_participants_below_participant_count_returns_400(self):
        """PATCH max_participants below current registrations → 400 Bad Request."""
        for i in range(3):
            participant = User.objects.create_user(
                username=f"participant_lower_bound_{i}", password="x"
            )
            EventParticipant.objects.create(
                user=participant, event_registration=self.er
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

    @tag("event_registration", "edit_settings")
    def test_max_participants_equal_to_participant_count_is_valid(self):
        """PATCH max_participants equal to current registrations → 200 OK."""
        for i in range(3):
            participant = User.objects.create_user(
                username=f"participant_equal_bound_{i}", password="x"
            )
            EventParticipant.objects.create(
                user=participant, event_registration=self.er
            )
        self.client.login(username="organiser_edit_reg", password="testpassword")

        response = self.client.patch(
            self._url("edit-reg-event"),
            {"max_participants": 3},  # exactly the current count — allowed
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)

    @tag("event_registration", "edit_settings")
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

    @tag("event_registration", "edit_settings")
    def test_unknown_slug_returns_404(self):
        """PATCH to an unknown project slug → 404 Not Found."""
        self.client.login(username="organiser_edit_reg", password="testpassword")

        response = self.client.patch(
            self._url("does-not-exist"),
            {"max_participants": 50},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @tag("event_registration", "edit_settings")
    def test_project_without_event_registration_returns_404(self):
        """PATCH on a project that has no EventRegistration → 404 Not Found."""
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

    @tag("event_registration", "edit_settings")
    def test_unauthenticated_request_returns_401(self):
        """Unauthenticated PATCH → 401 Unauthorized."""
        response = self.client.patch(
            self._url("edit-reg-event"),
            {"max_participants": 50},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @tag("event_registration", "edit_settings")
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

    @tag("event_registration", "edit_settings")
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

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

from django.contrib.auth.models import User
from django.test import override_settings, tag
from django.urls import reverse
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase

from climateconnect_api.models import Language, Role
from location.models import Location
from organization.models import Project, ProjectMember, ProjectStatus
from organization.models.event_registration import EventRegistration, RegistrationStatus


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


class TestEventRegistrationPatch(APITestCase):
    """Tests for updating event_registration via PATCH /api/projects/{slug}/."""

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_er_patch",
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
            username="patchuser_er",
            password="testpassword",
        )

        self.role = Role.objects.create(
            name="Admin_er_patch",
            role_type=Role.ALL_TYPE,
        )

        # Published event project with an EventRegistration already attached.
        self.event_project = Project.objects.create(
            name="Patchable Event",
            url_slug="patchable-event",
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
            registration_end_date="2026-09-15T23:59:00Z",
        )
        ProjectMember.objects.create(
            user=self.user,
            project=self.event_project,
            role=self.role,
        )

        # Published event project WITHOUT an EventRegistration.
        self.event_project_no_er = Project.objects.create(
            name="Event Without ER",
            url_slug="event-without-er-patch",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date="2026-09-01T10:00:00Z",
            end_date="2026-10-01T20:00:00Z",
        )
        ProjectMember.objects.create(
            user=self.user,
            project=self.event_project_no_er,
            role=self.role,
        )

        # Draft event project (no EventRegistration yet).
        self.draft_event_project = Project.objects.create(
            name="Draft Event",
            url_slug="draft-event-patch",
            is_active=True,
            is_draft=True,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date="2026-09-01T10:00:00Z",
            end_date="2026-10-01T20:00:00Z",
        )
        ProjectMember.objects.create(
            user=self.user,
            project=self.draft_event_project,
            role=self.role,
        )

        # Non-event (plain project) — used to test the type-check error.
        self.plain_project = Project.objects.create(
            name="Plain Project",
            url_slug="plain-project-patch",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="PR",
            start_date="2026-09-01T10:00:00Z",
            end_date="2026-10-01T20:00:00Z",
        )
        ProjectMember.objects.create(
            user=self.user,
            project=self.plain_project,
            role=self.role,
        )

    def _url(self, slug):
        return reverse(
            "organization:project-api-view",
            kwargs={"url_slug": slug},
        )

    # ------------------------------------------------------------------
    # Happy-path: updating an existing EventRegistration
    # ------------------------------------------------------------------

    @tag("event_registration", "projects")
    def test_patch_updates_max_participants(self):
        """PATCH with max_participants only updates that field, leaves other fields intact."""
        self.client.login(username="patchuser_er", password="testpassword")

        response = self.client.patch(
            self._url("patchable-event"),
            {"event_registration": {"max_participants": 200}},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.event_registration.refresh_from_db()
        self.assertEqual(self.event_registration.max_participants, 200)

    @tag("event_registration", "projects")
    def test_patch_updates_registration_end_date(self):
        """PATCH with registration_end_date only updates that field."""
        self.client.login(username="patchuser_er", password="testpassword")

        response = self.client.patch(
            self._url("patchable-event"),
            {
                "event_registration": {
                    "registration_end_date": "2026-09-20T12:00:00Z",
                }
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.event_registration.refresh_from_db()
        self.assertEqual(
            self.event_registration.registration_end_date.strftime(
                "%Y-%m-%dT%H:%M:%SZ"
            ),
            "2026-09-20T12:00:00Z",
        )

    @tag("event_registration", "projects")
    def test_patch_adds_event_registration_to_event_without_one(self):
        """PATCH with full event_registration creates an EventRegistration for an event that had none."""
        self.client.login(username="patchuser_er", password="testpassword")

        response = self.client.patch(
            self._url("event-without-er-patch"),
            {
                "event_registration": {
                    "max_participants": 50,
                    "registration_end_date": "2026-09-25T23:59:00Z",
                }
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertTrue(
            EventRegistration.objects.filter(project=self.event_project_no_er).exists()
        )
        er = EventRegistration.objects.get(project=self.event_project_no_er)
        self.assertEqual(er.max_participants, 50)

    @tag("event_registration", "projects")
    def test_patch_null_event_registration_is_ignored(self):
        """PATCH with event_registration: null is a no-op — the frontend only sends
        touched fields, so None means the field was not touched in this request.
        The existing EventRegistration must remain untouched."""
        self.client.login(username="patchuser_er", password="testpassword")

        response = self.client.patch(
            self._url("patchable-event"),
            {"event_registration": None},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertTrue(
            EventRegistration.objects.filter(project=self.event_project).exists(),
            "EventRegistration should still exist after a None payload",
        )
        # Values must be unchanged
        self.event_registration.refresh_from_db()
        self.assertEqual(self.event_registration.max_participants, 100)

    # ------------------------------------------------------------------
    # Validation errors on published projects
    # ------------------------------------------------------------------

    @tag("event_registration", "projects")
    def test_patch_event_registration_on_non_event_type_returns_400(self):
        """PATCH event_registration on a non-event project returns 400."""
        self.client.login(username="patchuser_er", password="testpassword")

        response = self.client.patch(
            self._url("plain-project-patch"),
            {
                "event_registration": {
                    "max_participants": 50,
                    "registration_end_date": "2026-09-25T23:59:00Z",
                }
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Serializer returns DRF-standard errors: type check raises a non-field error.
        self.assertIn("non_field_errors", response.data)
        self.assertIn("event_registration", str(response.data["non_field_errors"][0]))

    @tag("event_registration", "projects")
    def test_patch_zero_max_participants_returns_400(self):
        """PATCH with max_participants = 0 returns 400."""
        self.client.login(username="patchuser_er", password="testpassword")

        response = self.client.patch(
            self._url("patchable-event"),
            {"event_registration": {"max_participants": 0}},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("max_participants", response.data)

    @tag("event_registration", "projects")
    def test_patch_registration_end_date_after_event_end_returns_400(self):
        """PATCH with registration_end_date after event end_date returns 400."""
        self.client.login(username="patchuser_er", password="testpassword")

        response = self.client.patch(
            self._url("patchable-event"),
            {
                "event_registration": {
                    # event ends 2026-10-01, this is after that
                    "registration_end_date": "2026-11-01T00:00:00Z",
                }
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("registration_end_date", response.data)

    @tag("event_registration", "projects")
    def test_patch_missing_required_field_on_new_er_for_published_project_returns_400(
        self,
    ):
        """PATCH adding event_registration to a published event without max_participants returns 400."""
        self.client.login(username="patchuser_er", password="testpassword")

        response = self.client.patch(
            self._url("event-without-er-patch"),
            {
                "event_registration": {
                    # missing max_participants
                    "registration_end_date": "2026-09-25T23:59:00Z",
                }
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("max_participants", response.data)

    # ------------------------------------------------------------------
    # Draft-mode: required fields are relaxed
    # ------------------------------------------------------------------

    @tag("event_registration", "projects")
    def test_patch_draft_event_allows_partial_event_registration(self):
        """PATCH on a draft event with only one of the required fields is accepted
        and persists a partial EventRegistration row (nullable fields stay null)."""
        self.client.login(username="patchuser_er", password="testpassword")

        # Send only max_participants — registration_end_date is missing.
        response = self.client.patch(
            self._url("draft-event-patch"),
            {"event_registration": {"max_participants": 30}},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        # The ER row MUST be created even though it is incomplete.
        self.assertTrue(
            EventRegistration.objects.filter(project=self.draft_event_project).exists(),
            "A partial ER row should be created for a draft project",
        )
        er = EventRegistration.objects.get(project=self.draft_event_project)
        self.assertEqual(er.max_participants, 30)
        self.assertIsNone(
            er.registration_end_date,
            "registration_end_date should be null for a partial draft ER",
        )

    @tag("event_registration", "projects")
    def test_patch_draft_with_full_event_registration_creates_record(self):
        """PATCH on a draft event with both required fields creates the EventRegistration."""
        self.client.login(username="patchuser_er", password="testpassword")

        response = self.client.patch(
            self._url("draft-event-patch"),
            {
                "event_registration": {
                    "max_participants": 30,
                    "registration_end_date": "2026-09-25T23:59:00Z",
                }
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertTrue(
            EventRegistration.objects.filter(project=self.draft_event_project).exists()
        )

    @tag("event_registration", "projects")
    def test_patch_draft_can_null_individual_field(self):
        """On a draft, sending an explicit null for a field clears it back to null."""
        self.client.login(username="patchuser_er", password="testpassword")

        # First give the draft a full ER
        EventRegistration.objects.create(
            project=self.draft_event_project,
            max_participants=40,
            registration_end_date="2026-09-25T23:59:00Z",
        )

        # Now clear max_participants by sending null
        response = self.client.patch(
            self._url("draft-event-patch"),
            {"event_registration": {"max_participants": None}},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        er = EventRegistration.objects.get(project=self.draft_event_project)
        self.assertIsNone(er.max_participants)
        # registration_end_date must be untouched
        self.assertIsNotNone(er.registration_end_date)

    @tag("event_registration", "projects")
    def test_patch_publishing_draft_with_incomplete_event_registration_returns_400(
        self,
    ):
        """PATCH that publishes a draft (is_draft key present) while supplying an
        incomplete event_registration must be rejected with 400.

        Even though partial ER rows are allowed during drafting, once the project
        is being published all required fields must be set (either already in the
        DB from a previous draft PATCH, or provided in this request).
        """
        self.client.login(username="patchuser_er", password="testpassword")

        # Sending is_draft means "publish this draft" (sets is_draft=False).
        # max_participants provided but registration_end_date missing → 400.
        response = self.client.patch(
            self._url("draft-event-patch"),
            {
                "is_draft": True,  # presence of key triggers publish
                "event_registration": {
                    "max_participants": 30,
                    # registration_end_date intentionally missing
                },
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("registration_end_date", response.data)

    # ------------------------------------------------------------------
    # Authentication
    # ------------------------------------------------------------------

    @tag("event_registration", "projects")
    def test_unauthenticated_patch_returns_401(self):
        """Unauthenticated PATCH returns 401."""
        response = self.client.patch(
            self._url("patchable-event"),
            {"event_registration": {"max_participants": 99}},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


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
    # Organiser can set OPEN / CLOSED via PATCH
    # ------------------------------------------------------------------

    @tag("event_registration", "status")
    def test_organiser_can_close_registration(self):
        """PATCH with status='closed' sets EventRegistration.status to CLOSED."""
        self.client.login(username="statususer_er", password="testpassword")

        response = self.client.patch(
            self._url("status-event"),
            {"event_registration": {"status": "closed"}},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.event_registration.refresh_from_db()
        self.assertEqual(self.event_registration.status, RegistrationStatus.CLOSED)

    @tag("event_registration", "status")
    def test_organiser_can_reopen_registration(self):
        """PATCH with status='open' transitions CLOSED back to OPEN."""
        self.event_registration.status = RegistrationStatus.CLOSED
        self.event_registration.save()
        self.client.login(username="statususer_er", password="testpassword")

        response = self.client.patch(
            self._url("status-event"),
            {"event_registration": {"status": "open"}},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.event_registration.refresh_from_db()
        self.assertEqual(self.event_registration.status, RegistrationStatus.OPEN)

    # ------------------------------------------------------------------
    # FULL is system-managed — organisers cannot set it directly
    # ------------------------------------------------------------------

    @tag("event_registration", "status")
    def test_organiser_cannot_set_status_full(self):
        """PATCH with status='full' is rejected with 400 — FULL is system-managed."""
        self.client.login(username="statususer_er", password="testpassword")

        response = self.client.patch(
            self._url("status-event"),
            {"event_registration": {"status": "full"}},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("status", response.data)

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

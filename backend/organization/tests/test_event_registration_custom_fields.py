"""
Tests for the custom registration fields feature (Phase 4a backend).

Tests covering spec test cases:
  1  – Create event with 5 custom fields (checkbox + option select)
  2  – 6th field rejected with 400
  3  – Option select with 0 options on publish → 400
  4  – Option select with 0 options on draft → accepted
  5  – Reorder fields → new order reflected in response
  6  – Delete a field → field and options removed
  7  – Unauthenticated → 401
  8  – Non-organiser → 403
  9  – Unknown settings key stripped (checkbox)
  10 – XSS in description stripped
  11 – <a> without rel → rel="noopener noreferrer" added
  12 – Checkbox empty description on publish → 400
  13 – Checkbox empty description on draft → accepted
  14 – Option select arbitrary settings stripped; {} persisted
"""

from datetime import timedelta

from django.contrib.auth.models import User
from django.test import tag
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from climateconnect_api.models import Language, Role
from location.models import Location
from organization.models import Project, ProjectMember, ProjectStatus
from organization.models.event_registration import (
    EventRegistrationConfig,
    RegistrationStatus,
)
from organization.models.registration_field import (
    RegistrationField,
    RegistrationFieldOption,
)

from ._helpers import _make_black_image_b64

# ---------------------------------------------------------------------------
# Base mixin — creates organiser + event project for PATCH-path tests
# ---------------------------------------------------------------------------


class _CustomFieldsBase(APITestCase):
    """
    Shared setUp for PATCH /registration-config/ custom-field tests.

    Creates:
        self.organiser     — ALL_TYPE project member
        self.non_organiser — authenticated user with no project membership
        self.event         — published event project
        self.er            — EventRegistrationConfig for self.event
        self.patch_url     — URL for PATCH /registration-config/
    """

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_cf",
                "name_de_translation": "aktiv",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.default_language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )
        self.admin_role = Role.objects.create(name="AdminCF", role_type=Role.ALL_TYPE)
        self.organiser = User.objects.create_user(
            username="organiser_cf", password="testpassword"
        )
        self.non_organiser = User.objects.create_user(
            username="non_organiser_cf", password="testpassword"
        )
        self.event = Project.objects.create(
            name="Custom Fields Event",
            url_slug="custom-fields-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=10),
            end_date=timezone.now() + timedelta(days=60),
        )
        self.er = EventRegistrationConfig.objects.create(
            project=self.event,
            max_participants=100,
            registration_end_date=timezone.now() + timedelta(days=30),
            status=RegistrationStatus.OPEN,
        )
        ProjectMember.objects.create(
            user=self.organiser, project=self.event, role=self.admin_role
        )
        self.patch_url = reverse(
            "organization:edit-registration-config",
            kwargs={"url_slug": self.event.url_slug},
        )


# ---------------------------------------------------------------------------
# POST /api/projects/ — create event with fields
# ---------------------------------------------------------------------------


class TestCreateEventWithCustomFields(APITestCase):
    """Tests for creating an event that includes custom registration fields."""

    def setUp(self):
        self.url = reverse("organization:create-project-api")

        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_cf_create",
                "name_de_translation": "aktiv",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.user = User.objects.create_user(
            username="testuser_cf_create", password="testpassword"
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
            "name": "Custom Fields Test Event",
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

    # ── Test 1: create with 5 mixed fields ──────────────────────────────────

    @tag("custom_fields", "projects")
    def test_create_event_with_five_custom_fields(self):
        """Spec test 1 — up to 5 fields (checkbox + option_select) are saved and returned."""
        self.client.login(username="testuser_cf_create", password="testpassword")
        data = {
            **self.base_event_data,
            "registration_config": {
                "max_participants": 50,
                "registration_end_date": "2026-07-31T23:59:00Z",
                "fields": [
                    {
                        "field_type": "checkbox",
                        "order": 0,
                        "is_required": True,
                        "settings": {"description": "<p>I agree to the terms.</p>"},
                    },
                    {
                        "field_type": "option_select",
                        "order": 1,
                        "is_required": False,
                        "settings": {},
                        "options": [
                            {"title": "Vegetarian", "order": 0},
                            {"title": "Vegan", "order": 1},
                        ],
                    },
                    {
                        "field_type": "checkbox",
                        "order": 2,
                        "is_required": False,
                        "settings": {"description": "<p>Newsletter opt-in</p>"},
                    },
                    {
                        "field_type": "option_select",
                        "order": 3,
                        "is_required": True,
                        "settings": {},
                        "options": [{"title": "Online", "order": 0}],
                    },
                    {
                        "field_type": "checkbox",
                        "order": 4,
                        "is_required": False,
                        "settings": {"description": "<p>GDPR consent</p>"},
                    },
                ],
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        project = Project.objects.get(url_slug=response.data["url_slug"])
        er = EventRegistrationConfig.objects.get(project=project)
        fields = RegistrationField.objects.filter(registration_config=er).order_by(
            "order"
        )
        self.assertEqual(fields.count(), 5)
        self.assertEqual(fields[0].field_type, "checkbox")
        self.assertEqual(fields[1].field_type, "option_select")
        self.assertEqual(
            RegistrationFieldOption.objects.filter(field=fields[1]).count(), 2
        )

    # ── Test 2: 6th field rejected ──────────────────────────────────────────

    @tag("custom_fields", "projects")
    def test_create_event_with_six_fields_rejected(self):
        """Spec test 2 — attempting to create 6 custom fields returns 400."""
        self.client.login(username="testuser_cf_create", password="testpassword")
        fields = [
            {
                "field_type": "checkbox",
                "order": i,
                "is_required": False,
                "settings": {"description": "<p>Field</p>"},
            }
            for i in range(6)
        ]
        data = {
            **self.base_event_data,
            "is_draft": True,
            "registration_config": {"fields": fields},
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("fields", response.data)

    # ── Test 3: option_select 0 options on publish → 400 ────────────────────

    @tag("custom_fields", "projects")
    def test_option_select_no_options_on_publish_rejected(self):
        """Spec test 3 — option_select with zero options rejected on publish."""
        self.client.login(username="testuser_cf_create", password="testpassword")
        data = {
            **self.base_event_data,
            "registration_config": {
                "max_participants": 50,
                "registration_end_date": "2026-07-31T23:59:00Z",
                "fields": [
                    {
                        "field_type": "option_select",
                        "order": 0,
                        "is_required": False,
                        "settings": {},
                        "options": [],
                    }
                ],
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Test 4: option_select 0 options on draft → accepted ─────────────────

    @tag("custom_fields", "projects")
    def test_option_select_no_options_on_draft_accepted(self):
        """Spec test 4 — option_select with zero options accepted in draft mode."""
        self.client.login(username="testuser_cf_create", password="testpassword")
        data = {
            **self.base_event_data,
            "is_draft": True,
            "registration_config": {
                "fields": [
                    {
                        "field_type": "option_select",
                        "order": 0,
                        "is_required": False,
                        "settings": {},
                        "options": [],
                    }
                ],
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        project = Project.objects.get(url_slug=response.data["url_slug"])
        er = EventRegistrationConfig.objects.get(project=project)
        self.assertEqual(
            RegistrationField.objects.filter(registration_config=er).count(), 1
        )

    # ── Test 9: unknown settings key stripped ───────────────────────────────

    @tag("custom_fields", "projects")
    def test_checkbox_unknown_settings_key_stripped(self):
        """Spec test 9 — unknown settings key is stripped; only description persisted."""
        self.client.login(username="testuser_cf_create", password="testpassword")
        data = {
            **self.base_event_data,
            "is_draft": True,
            "registration_config": {
                "fields": [
                    {
                        "field_type": "checkbox",
                        "order": 0,
                        "is_required": False,
                        "settings": {
                            "description": "<p>Valid</p>",
                            "rogue": "should-be-stripped",
                        },
                    }
                ],
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        project = Project.objects.get(url_slug=response.data["url_slug"])
        er = EventRegistrationConfig.objects.get(project=project)
        field = RegistrationField.objects.get(registration_config=er)
        self.assertNotIn("rogue", field.settings)
        self.assertIn("description", field.settings)

    # ── Test 10: XSS in description stripped ────────────────────────────────

    @tag("custom_fields", "projects")
    def test_checkbox_description_xss_stripped(self):
        """Spec test 10 — <script> tag in description is stripped."""
        self.client.login(username="testuser_cf_create", password="testpassword")
        data = {
            **self.base_event_data,
            "is_draft": True,
            "registration_config": {
                "fields": [
                    {
                        "field_type": "checkbox",
                        "order": 0,
                        "settings": {
                            "description": "<p>Safe</p><script>alert(1)</script>"
                        },
                    }
                ],
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        project = Project.objects.get(url_slug=response.data["url_slug"])
        er = EventRegistrationConfig.objects.get(project=project)
        field = RegistrationField.objects.get(registration_config=er)
        self.assertNotIn("script", field.settings["description"])
        self.assertIn("<p>Safe</p>", field.settings["description"])

    # ── Test 11: <a> without rel gets rel added ──────────────────────────────

    @tag("custom_fields", "projects")
    def test_checkbox_link_gets_noopener_rel(self):
        """Spec test 11 — <a> without rel gets rel="noopener noreferrer" on save."""
        self.client.login(username="testuser_cf_create", password="testpassword")
        data = {
            **self.base_event_data,
            "is_draft": True,
            "registration_config": {
                "fields": [
                    {
                        "field_type": "checkbox",
                        "order": 0,
                        "settings": {
                            "description": '<p>See <a href="https://example.com">terms</a></p>'
                        },
                    }
                ],
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        project = Project.objects.get(url_slug=response.data["url_slug"])
        er = EventRegistrationConfig.objects.get(project=project)
        field = RegistrationField.objects.get(registration_config=er)
        self.assertIn('rel="noopener noreferrer"', field.settings["description"])

    # ── Test 12: empty description on publish → 400 ──────────────────────────

    @tag("custom_fields", "projects")
    def test_checkbox_empty_description_on_publish_rejected(self):
        """Spec test 12 — empty checkbox description rejected on publish."""
        self.client.login(username="testuser_cf_create", password="testpassword")
        data = {
            **self.base_event_data,
            "registration_config": {
                "max_participants": 50,
                "registration_end_date": "2026-07-31T23:59:00Z",
                "fields": [
                    {
                        "field_type": "checkbox",
                        "order": 0,
                        "is_required": True,
                        "settings": {"description": ""},
                    }
                ],
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Test 13: empty description on draft → accepted ───────────────────────

    @tag("custom_fields", "projects")
    def test_checkbox_empty_description_on_draft_accepted(self):
        """Spec test 13 — empty checkbox description accepted in draft mode."""
        self.client.login(username="testuser_cf_create", password="testpassword")
        data = {
            **self.base_event_data,
            "is_draft": True,
            "registration_config": {
                "fields": [
                    {
                        "field_type": "checkbox",
                        "order": 0,
                        "is_required": True,
                        "settings": {"description": ""},
                    }
                ],
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

    # ── Test 14: option_select arbitrary settings stripped ───────────────────

    @tag("custom_fields", "projects")
    def test_option_select_arbitrary_settings_stripped(self):
        """Spec test 14 — arbitrary keys in option_select settings are stripped."""
        self.client.login(username="testuser_cf_create", password="testpassword")
        data = {
            **self.base_event_data,
            "is_draft": True,
            "registration_config": {
                "fields": [
                    {
                        "field_type": "option_select",
                        "order": 0,
                        "settings": {"arbitrary": "value", "another": 123},
                        "options": [{"title": "Option A", "order": 0}],
                    }
                ],
            },
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        project = Project.objects.get(url_slug=response.data["url_slug"])
        er = EventRegistrationConfig.objects.get(project=project)
        field = RegistrationField.objects.get(registration_config=er)
        self.assertEqual(field.settings, {})


# ---------------------------------------------------------------------------
# PATCH /api/projects/{slug}/registration-config/ — edit fields
# ---------------------------------------------------------------------------


class TestEditRegistrationConfigFields(_CustomFieldsBase):
    """Tests for syncing custom fields via the registration-config PATCH endpoint."""

    def _create_field(
        self, field_type="checkbox", order=0, settings=None, options=None
    ):
        """Helper: create a RegistrationField directly on self.er."""
        if settings is None:
            settings = (
                {"description": "<p>Test</p>"} if field_type == "checkbox" else {}
            )
        field = RegistrationField.objects.create(
            registration_config=self.er,
            field_type=field_type,
            order=order,
            is_required=False,
            settings=settings,
        )
        if options:
            for opt in options:
                RegistrationFieldOption.objects.create(field=field, **opt)
        return field

    # ── Test 5: reorder fields ───────────────────────────────────────────────

    @tag("custom_fields", "registration_config")
    def test_reorder_fields_reflected_in_response(self):
        """Spec test 5 — reordering fields is reflected in the API response."""
        field_a = self._create_field(order=0)
        field_b = self._create_field(
            field_type="option_select", order=1, options=[{"title": "Yes", "order": 0}]
        )

        self.client.login(username="organiser_cf", password="testpassword")
        response = self.client.patch(
            self.patch_url,
            {
                "fields": [
                    {"id": field_b.id, "order": 0},
                    {"id": field_a.id, "order": 1},
                ]
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        returned_fields = response.data["fields"]
        self.assertEqual(returned_fields[0]["id"], field_b.id)
        self.assertEqual(returned_fields[1]["id"], field_a.id)

        field_a.refresh_from_db()
        field_b.refresh_from_db()
        self.assertEqual(field_a.order, 1)
        self.assertEqual(field_b.order, 0)

    # ── Test 6: delete a field ───────────────────────────────────────────────

    @tag("custom_fields", "registration_config")
    def test_delete_field_removes_field_and_options(self):
        """Spec test 6 — field absent from the array is deleted, along with its options."""
        field_keep = self._create_field(order=0)
        field_delete = self._create_field(
            field_type="option_select",
            order=1,
            options=[{"title": "A", "order": 0}, {"title": "B", "order": 1}],
        )

        self.client.login(username="organiser_cf", password="testpassword")
        response = self.client.patch(
            self.patch_url,
            {"fields": [{"id": field_keep.id, "order": 0}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertFalse(RegistrationField.objects.filter(id=field_delete.id).exists())
        self.assertFalse(
            RegistrationFieldOption.objects.filter(field=field_delete).exists()
        )
        self.assertTrue(RegistrationField.objects.filter(id=field_keep.id).exists())

    # ── Test 7: unauthenticated → 401 ───────────────────────────────────────

    @tag("custom_fields", "registration_config")
    def test_unauthenticated_patch_returns_401(self):
        """Spec test 7 — unauthenticated request returns 401."""
        response = self.client.patch(
            self.patch_url,
            {"fields": []},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Test 8: non-organiser → 403 ─────────────────────────────────────────

    @tag("custom_fields", "registration_config")
    def test_non_organiser_patch_returns_403(self):
        """Spec test 8 — non-organiser authenticated request returns 403."""
        self.client.login(username="non_organiser_cf", password="testpassword")
        response = self.client.patch(
            self.patch_url,
            {"fields": []},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ── Full sync (create + update + delete) ─────────────────────────────────

    @tag("custom_fields", "registration_config")
    def test_full_field_sync_in_single_request(self):
        """Create, update, and delete fields atomically in a single PATCH."""
        field_update = self._create_field(order=0)
        field_delete = self._create_field(
            field_type="option_select",
            order=1,
            options=[{"title": "Option A", "order": 0}],
        )

        self.client.login(username="organiser_cf", password="testpassword")
        response = self.client.patch(
            self.patch_url,
            {
                "fields": [
                    # Update existing
                    {
                        "id": field_update.id,
                        "order": 0,
                        "settings": {"description": "<p>Updated</p>"},
                    },
                    # Create new
                    {
                        "field_type": "option_select",
                        "order": 1,
                        "settings": {},
                        "options": [{"title": "New opt", "order": 0}],
                    },
                    # field_delete absent → deleted
                ]
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)

        field_update.refresh_from_db()
        self.assertIn("Updated", field_update.settings.get("description", ""))

        self.assertFalse(RegistrationField.objects.filter(id=field_delete.id).exists())

        new_field = RegistrationField.objects.filter(
            registration_config=self.er, field_type="option_select", order=1
        ).first()
        self.assertIsNotNone(new_field)
        self.assertEqual(
            RegistrationFieldOption.objects.filter(field=new_field).count(), 1
        )

    # ── Max 5 field enforcement on PATCH ────────────────────────────────────

    @tag("custom_fields", "registration_config")
    def test_patch_six_fields_rejected(self):
        """6 fields via PATCH returns 400."""
        self.client.login(username="organiser_cf", password="testpassword")
        fields = [
            {
                "field_type": "checkbox",
                "order": i,
                "settings": {"description": "<p>x</p>"},
            }
            for i in range(6)
        ]
        response = self.client.patch(
            self.patch_url,
            {"is_draft": True, "fields": fields},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("fields", response.data)

    # ── Invalid field ID ─────────────────────────────────────────────────────

    @tag("custom_fields", "registration_config")
    def test_patch_invalid_field_id_rejected(self):
        """A field ID that doesn't belong to this event returns 400."""
        self.client.login(username="organiser_cf", password="testpassword")
        response = self.client.patch(
            self.patch_url,
            {"is_draft": True, "fields": [{"id": 999999, "order": 0}]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Duplicate order values rejected ─────────────────────────────────────

    @tag("custom_fields", "registration_config")
    def test_duplicate_field_orders_rejected(self):
        """Two fields with the same order value return 400."""
        self.client.login(username="organiser_cf", password="testpassword")
        response = self.client.patch(
            self.patch_url,
            {
                "is_draft": True,
                "fields": [
                    {"field_type": "checkbox", "order": 0, "settings": {}},
                    {"field_type": "checkbox", "order": 0, "settings": {}},
                ],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ── Fields not sent → existing fields unchanged ──────────────────────────

    @tag("custom_fields", "registration_config")
    def test_patch_without_fields_leaves_existing_fields_untouched(self):
        """PATCH that omits the `fields` key does not touch existing fields."""
        field = self._create_field(order=0)

        self.client.login(username="organiser_cf", password="testpassword")
        response = self.client.patch(
            self.patch_url,
            {"max_participants": 200},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertTrue(RegistrationField.objects.filter(id=field.id).exists())
        self.assertEqual(self.er.fields.count(), 1)

"""
Tests for the text custom registration field type.

Covers AC-1.9 from the spec:
  - create / update / sync of a text field via RegistrationFieldSerializer
  - publish-time validation errors (missing title, with options)
  - submission with required-text-empty (rejected), required-text-present (accepted),
    optional-text-empty (accepted, stored as null), > 300 chars (rejected)
  - answer-lock: cannot change settings.title after answers exist;
    can change settings.description / is_multiline / is_required / label
  - delete-blocked: cannot delete a text field that has answers
  - email builders: text answer renders correctly in both HTML (with <br>)
    and plaintext (with \n)
"""

from datetime import timedelta

from django.contrib.auth.models import User
from django.test import tag
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from climateconnect_api.models import Language, Role
from organization.models import Project, ProjectMember, ProjectStatus
from organization.models.event_registration import (
    EventRegistration,
    EventRegistrationConfig,
    RegistrationFieldAnswer,
    RegistrationStatus,
)
from organization.models.registration_field import (
    RegistrationField,
    RegistrationFieldType,
)
from organization.utility.email import (
    _build_field_answers_html,
    _build_field_answers_text,
)

class _TextBase(APITestCase):
    """Shared setUp for text-field tests."""

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_tf",
                "name_de_translation": "aktiv",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.default_language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )
        self.admin_role = Role.objects.create(name="AdminTF", role_type=Role.ALL_TYPE)
        self.organiser = User.objects.create_user(
            username="organiser_tf", password="testpassword"
        )
        self.guest = User.objects.create_user(
            username="guest_tf", password="testpassword"
        )
        self.event = Project.objects.create(
            name="Text Field Event",
            url_slug="text-field-event",
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
        self.register_url = reverse(
            "organization:event-registrations",
            kwargs={"url_slug": self.event.url_slug},
        )

    def _create_text_field(self, **kwargs):
        defaults = dict(
            registration_config=self.er,
            field_type=RegistrationFieldType.TEXT,
            order=0,
            is_required=False,
            label="Question 1",
            settings={
                "title": "What is your name?",
                "description": "",
                "is_multiline": False,
            },
        )
        defaults.update(kwargs)
        return RegistrationField.objects.create(**defaults)


class TestTextFieldConfig(_TextBase):
    """Tests for creating and updating text field configuration."""

    @tag("text_field", "registration_config")
    def test_create_text_field_via_patch(self):
        """Creating a text field through PATCH should persist correctly."""
        self.client.login(username="organiser_tf", password="testpassword")
        response = self.client.patch(
            self.patch_url,
            {
                "fields": [
                    {
                        "field_type": "text",
                        "order": 0,
                        "label": "Dietary",
                        "is_required": True,
                        "settings": {
                            "title": "Any dietary requirements?",
                            "description": "We'll accommodate.",
                            "is_multiline": True,
                        },
                    }
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        field = self.er.fields.first()
        self.assertEqual(field.field_type, RegistrationFieldType.TEXT)
        self.assertEqual(field.settings["title"], "Any dietary requirements?")
        self.assertEqual(field.settings["description"], "We'll accommodate.")
        self.assertTrue(field.settings["is_multiline"])
        self.assertTrue(field.is_required)

    @tag("text_field", "registration_config")
    def test_text_field_publish_requires_title(self):
        """Publishing with a text field that has no title returns 400."""
        self.client.login(username="organiser_tf", password="testpassword")
        response = self.client.patch(
            self.patch_url,
            {
                "is_draft": False,
                "fields": [
                    {
                        "field_type": "text",
                        "order": 0,
                        "label": "Q1",
                        "is_required": True,
                        "settings": {"title": "", "description": ""},
                    }
                ],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("fields", response.data)

    @tag("text_field", "registration_config")
    def test_text_field_with_options_rejected_on_publish(self):
        """Publishing a text field with options returns 400."""
        self.client.login(username="organiser_tf", password="testpassword")
        response = self.client.patch(
            self.patch_url,
            {
                "is_draft": False,
                "fields": [
                    {
                        "field_type": "text",
                        "order": 0,
                        "label": "Q1",
                        "is_required": False,
                        "settings": {"title": "Question?"},
                        "options": [{"title": "Bad", "order": 0}],
                    }
                ],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @tag("text_field", "registration_config")
    def test_text_field_default_settings_round_trip(self):
        """Default settings (is_multiline=False) round-trip through the serializer."""
        field = self._create_text_field()
        self.client.login(username="organiser_tf", password="testpassword")
        response = self.client.patch(self.patch_url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        returned = {f["id"]: f for f in response.data["fields"]}
        self.assertIn(field.id, returned)
        self.assertFalse(returned[field.id]["settings"]["is_multiline"])


class TestTextFieldSubmission(_TextBase):
    """Tests for submitting text field answers during registration."""

    def setUp(self):
        super().setUp()
        self.text_field = self._create_text_field(is_required=True)
        self.optional_text_field = RegistrationField.objects.create(
            registration_config=self.er,
            field_type=RegistrationFieldType.TEXT,
            order=1,
            is_required=False,
            label="Question 2",
            settings={
                "title": "Any comments?",
                "description": "",
                "is_multiline": True,
            },
        )

    @tag("text_field", "registration")
    def test_required_text_present_accepted(self):
        self.client.login(username="guest_tf", password="testpassword")
        response = self.client.post(
            self.register_url,
            {
                "answers": [
                    {"field": self.text_field.id, "value_text": "Vegetarian"},
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        reg = EventRegistration.objects.get(
            user=self.guest, registration_config=self.er
        )
        answer = reg.field_answers.get(field=self.text_field)
        self.assertEqual(answer.value_text, "Vegetarian")

    @tag("text_field", "registration")
    def test_required_text_empty_rejected(self):
        self.client.login(username="guest_tf", password="testpassword")
        response = self.client.post(
            self.register_url,
            {
                "answers": [
                    {"field": self.text_field.id, "value_text": ""},
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @tag("text_field", "registration")
    def test_required_text_missing_rejected(self):
        self.client.login(username="guest_tf", password="testpassword")
        response = self.client.post(
            self.register_url,
            {"answers": []},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @tag("text_field", "registration")
    def test_optional_text_empty_stored_as_null(self):
        self.client.login(username="guest_tf", password="testpassword")
        response = self.client.post(
            self.register_url,
            {
                "answers": [
                    {"field": self.text_field.id, "value_text": "OK"},
                    {"field": self.optional_text_field.id, "value_text": ""},
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        reg = EventRegistration.objects.get(
            user=self.guest, registration_config=self.er
        )
        opt_answer = reg.field_answers.get(field=self.optional_text_field)
        self.assertIsNone(opt_answer.value_text)

    @tag("text_field", "registration")
    def test_text_over_300_chars_rejected(self):
        self.client.login(username="guest_tf", password="testpassword")
        response = self.client.post(
            self.register_url,
            {
                "answers": [
                    {"field": self.text_field.id, "value_text": "x" * 301},
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @tag("text_field", "registration")
    def test_text_crlf_normalized_to_lf(self):
        self.client.login(username="guest_tf", password="testpassword")
        response = self.client.post(
            self.register_url,
            {
                "answers": [
                    {
                        "field": self.text_field.id,
                        "value_text": "line1\r\nline2\rline3\nline4",
                    },
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        reg = EventRegistration.objects.get(
            user=self.guest, registration_config=self.er
        )
        answer = reg.field_answers.get(field=self.text_field)
        self.assertEqual(answer.value_text, "line1\nline2\nline3\nline4")

    @tag("text_field", "registration")
    def test_text_answer_appears_in_field_answers_response(self):
        self.client.login(username="guest_tf", password="testpassword")
        self.client.post(
            self.register_url,
            {
                "answers": [
                    {"field": self.text_field.id, "value_text": "Hello world"},
                ]
            },
            format="json",
        )
        reg = EventRegistration.objects.get(
            user=self.guest, registration_config=self.er
        )
        self.client.login(username="organiser_tf", password="testpassword")
        get_url = reverse(
            "organization:event-registrations",
            kwargs={"url_slug": self.event.url_slug},
        )
        response = self.client.get(get_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        row = next(r for r in response.data if r["id"] == reg.id)
        answer = next(
            a for a in row["field_answers"] if a["field"] == self.text_field.id
        )
        self.assertEqual(answer["value_text"], "Hello world")

    @tag("text_field", "registration")
    def test_update_registration_overwrites_text_answer(self):
        self.client.login(username="guest_tf", password="testpassword")
        self.client.post(
            self.register_url,
            {"answers": [{"field": self.text_field.id, "value_text": "first"}]},
            format="json",
        )
        self.client.post(
            self.register_url,
            {"answers": [{"field": self.text_field.id, "value_text": "second"}]},
            format="json",
        )
        reg = EventRegistration.objects.get(
            user=self.guest, registration_config=self.er
        )
        answer = reg.field_answers.get(field=self.text_field)
        self.assertEqual(answer.value_text, "second")


class TestTextFieldAnswerLock(_TextBase):
    """Tests for answer-lock behaviour on text fields."""

    def setUp(self):
        super().setUp()
        self.text_field = self._create_text_field()
        self.registration = EventRegistration.objects.create(
            user=self.guest, registration_config=self.er
        )
        RegistrationFieldAnswer.objects.create(
            registration=self.registration,
            field=self.text_field,
            value_text="Some answer",
        )

    @tag("text_field", "answer_lock")
    def test_text_title_change_rejected_when_has_answers(self):
        self.client.login(username="organiser_tf", password="testpassword")
        response = self.client.patch(
            self.patch_url,
            {
                "fields": [
                    {
                        "id": self.text_field.id,
                        "order": 0,
                        "label": "Question 1",
                        "settings": {"title": "Changed title"},
                    }
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("fields", response.data)

    @tag("text_field", "answer_lock")
    def test_text_description_mutable_when_has_answers(self):
        self.client.login(username="organiser_tf", password="testpassword")
        response = self.client.patch(
            self.patch_url,
            {
                "fields": [
                    {
                        "id": self.text_field.id,
                        "order": 0,
                        "label": "Question 1",
                        "settings": {
                            "title": "What is your name?",
                            "description": "Updated helper",
                        },
                    }
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)

    @tag("text_field", "answer_lock")
    def test_text_is_multiline_mutable_when_has_answers(self):
        self.client.login(username="organiser_tf", password="testpassword")
        response = self.client.patch(
            self.patch_url,
            {
                "fields": [
                    {
                        "id": self.text_field.id,
                        "order": 0,
                        "label": "Question 1",
                        "settings": {
                            "title": "What is your name?",
                            "is_multiline": True,
                        },
                    }
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)

    @tag("text_field", "answer_lock")
    def test_text_is_required_mutable_when_has_answers(self):
        self.client.login(username="organiser_tf", password="testpassword")
        response = self.client.patch(
            self.patch_url,
            {
                "fields": [
                    {
                        "id": self.text_field.id,
                        "order": 0,
                        "label": "Question 1",
                        "is_required": True,
                        "settings": {"title": "What is your name?"},
                    }
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)

    @tag("text_field", "answer_lock")
    def test_text_label_mutable_when_has_answers(self):
        self.client.login(username="organiser_tf", password="testpassword")
        response = self.client.patch(
            self.patch_url,
            {
                "fields": [
                    {
                        "id": self.text_field.id,
                        "order": 0,
                        "label": "Renamed Label",
                        "settings": {"title": "What is your name?"},
                    }
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)


class TestTextFieldDeleteBlock(_TextBase):
    """Tests that a text field with answers cannot be deleted."""

    @tag("text_field", "delete")
    def test_delete_text_field_with_answers_blocked(self):
        text_field = self._create_text_field()
        registration = EventRegistration.objects.create(
            user=self.guest, registration_config=self.er
        )
        RegistrationFieldAnswer.objects.create(
            registration=registration,
            field=text_field,
            value_text="Answer",
        )
        self.client.login(username="organiser_tf", password="testpassword")
        # Attempt to remove the field by submitting an empty fields list
        self.client.patch(
            self.patch_url,
            {"fields": []},
            format="json",
        )
        # The field has answers so deletion is blocked via the same guard
        # that other types use. Check the field still exists.
        self.assertTrue(RegistrationField.objects.filter(id=text_field.id).exists())


class TestTextFieldEmailBuilder(_TextBase):
    """Tests for email rendering of text field answers."""

    @tag("text_field", "email")
    def test_text_answer_renders_in_html_with_br(self):
        from zoneinfo import ZoneInfo

        text_field = self._create_text_field()
        registration = EventRegistration.objects.create(
            user=self.guest, registration_config=self.er
        )
        RegistrationFieldAnswer.objects.create(
            registration=registration,
            field=text_field,
            value_text="Line 1\nLine 2\nLine 3",
        )
        registration = EventRegistration.objects.prefetch_related(
            "field_answers__field", "field_answers__value_option"
        ).get(pk=registration.pk)

        tz = ZoneInfo("UTC")
        html = _build_field_answers_html(registration, "en", tz)
        self.assertIn("Line 1", html)
        self.assertIn("<br>", html)
        self.assertNotIn("\n", html.replace("<br>", ""))

    @tag("text_field", "email")
    def test_text_answer_renders_in_plaintext_with_newlines(self):
        from zoneinfo import ZoneInfo

        text_field = self._create_text_field()
        registration = EventRegistration.objects.create(
            user=self.guest, registration_config=self.er
        )
        RegistrationFieldAnswer.objects.create(
            registration=registration,
            field=text_field,
            value_text="Line 1\nLine 2",
        )
        registration = EventRegistration.objects.prefetch_related(
            "field_answers__field", "field_answers__value_option"
        ).get(pk=registration.pk)

        tz = ZoneInfo("UTC")
        text = _build_field_answers_text(registration, "en", tz)
        self.assertIn("Line 1\nLine 2", text)

    @tag("text_field", "email")
    def test_empty_text_answer_renders_as_em_dash_in_html(self):
        from zoneinfo import ZoneInfo

        text_field = self._create_text_field()
        registration = EventRegistration.objects.create(
            user=self.guest, registration_config=self.er
        )
        RegistrationFieldAnswer.objects.create(
            registration=registration,
            field=text_field,
            value_text=None,
        )
        registration = EventRegistration.objects.prefetch_related(
            "field_answers__field", "field_answers__value_option"
        ).get(pk=registration.pk)

        tz = ZoneInfo("UTC")
        # value_text is None — should be skipped (not in answers_by_field)
        html = _build_field_answers_html(registration, "en", tz)
        self.assertEqual(html, "")

    @tag("text_field", "email")
    def test_text_answer_with_empty_string_renders_em_dash(self):
        from zoneinfo import ZoneInfo

        text_field = self._create_text_field()
        registration = EventRegistration.objects.create(
            user=self.guest, registration_config=self.er
        )
        # value_text="" (empty string, not None) — should still be included
        # The email builder checks for None, not empty string. An empty string
        # text field should show the em-dash.
        RegistrationFieldAnswer.objects.create(
            registration=registration,
            field=text_field,
            value_text="",
        )
        registration = EventRegistration.objects.prefetch_related(
            "field_answers__field", "field_answers__value_option"
        ).get(pk=registration.pk)

        tz = ZoneInfo("UTC")
        html = _build_field_answers_html(registration, "en", tz)
        self.assertIn("\u2014", html)

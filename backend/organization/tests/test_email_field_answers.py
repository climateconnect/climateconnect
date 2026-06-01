"""
Tests for including registration field answers in the confirmation email.

Covers spec test cases:
  1. Register with checkbox (checked) → email contains checkbox description
  2. Register with checkbox (unchecked) → email does not contain checkbox section
  3. Register with option_select → email contains field title + option title
  4. Register with inventory → email contains field title + option title × quantity
  5. Register with time_slot_select → email contains field title + formatted time range
  6. Register with multiple fields → all answers shown, ordered by field.order
  7. Register with no custom fields → email has no FieldAnswersHtml section
  8. Register with optional fields, no answers → email has no FieldAnswersHtml section
  9. Register with mix of answered and unanswered optional fields → only answered shown
"""

from datetime import timedelta

from django.contrib.auth.models import User
from django.test import TestCase, tag
from django.utils import timezone

from organization.models.event_registration import (
    EventRegistration,
    EventRegistrationConfig,
    RegistrationFieldAnswer,
    RegistrationStatus,
)
from organization.models.registration_field import (
    RegistrationField,
    RegistrationFieldOption,
    RegistrationFieldType,
)
from organization.models import Project, ProjectStatus
from organization.utility.email import _build_field_answers_html


class TestBuildFieldAnswersHtml(TestCase):
    """
    Unit tests for the _build_field_answers_html() helper function.
    """

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_email_test",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        from climateconnect_api.models import Language

        self.language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )
        self.project = Project.objects.create(
            name="Email Test Event",
            url_slug="email-test-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=10),
            end_date=timezone.now() + timedelta(days=60),
        )
        self.config = EventRegistrationConfig.objects.create(
            project=self.project,
            max_participants=100,
            registration_end_date=timezone.now() + timedelta(days=30),
            status=RegistrationStatus.OPEN,
        )
        self.user = User.objects.create_user(
            username="email_test_user", password="testpassword"
        )
        self.registration = EventRegistration.objects.create(
            user=self.user,
            registration_config=self.config,
        )

    def _create_field(self, field_type, order, label, settings, is_required=False):
        return RegistrationField.objects.create(
            registration_config=self.config,
            field_type=field_type,
            order=order,
            label=label,
            settings=settings,
            is_required=is_required,
        )

    def _create_option(self, field, title, order, **kwargs):
        return RegistrationFieldOption.objects.create(
            field=field,
            title=title,
            order=order,
            **kwargs,
        )

    def _create_answer(self, field, **kwargs):
        return RegistrationFieldAnswer.objects.create(
            registration=self.registration,
            field=field,
            **kwargs,
        )

    # ── Test 1: Checkbox (checked) → email contains description ──────────────

    @tag("field_answers_email")
    def test_checked_checkbox_included(self):
        """A checked checkbox includes its description (HTML-stripped) with ✓ prefix."""
        field = self._create_field(
            RegistrationFieldType.CHECKBOX,
            0,
            "Terms",
            {"description": "<p>I agree to the terms</p>"},
        )
        self._create_answer(field, value_boolean=True)

        html = _build_field_answers_html(self.registration, "en")
        self.assertIn("✓", html)
        self.assertIn("I agree to the terms", html)
        self.assertNotIn("<p>", html)  # HTML stripped

    # ── Test 2: Checkbox (unchecked) → not shown ─────────────────────────────

    @tag("field_answers_email")
    def test_unchecked_checkbox_not_included(self):
        """An unchecked checkbox is not included in the email."""
        field = self._create_field(
            RegistrationFieldType.CHECKBOX,
            0,
            "Terms",
            {"description": "I agree to the terms"},
        )
        self._create_answer(field, value_boolean=False)

        html = _build_field_answers_html(self.registration, "en")
        self.assertEqual(html, "")

    # ── Test 3: Option select → title + option title ─────────────────────────

    @tag("field_answers_email")
    def test_option_select_included(self):
        """Option select shows field title and selected option title."""
        field = self._create_field(
            RegistrationFieldType.OPTION_SELECT,
            0,
            "Workshop",
            {"title": "Preferred workshop"},
        )
        option = self._create_option(field, "Solar panel installation", 0)
        self._create_answer(field, value_option=option)

        html = _build_field_answers_html(self.registration, "en")
        self.assertIn("Preferred workshop", html)
        self.assertIn("Solar panel installation", html)

    # ── Test 4: Inventory → title + option × quantity ────────────────────────

    @tag("field_answers_email")
    def test_inventory_included(self):
        """Inventory shows field title, option title, and quantity."""
        field = self._create_field(
            RegistrationFieldType.INVENTORY,
            0,
            "Meals",
            {"title": "Meal preference"},
        )
        option = self._create_option(field, "Vegetarian", 0)
        self._create_answer(field, value_option=option, value_number=2)

        html = _build_field_answers_html(self.registration, "en")
        self.assertIn("Meal preference", html)
        self.assertIn("Vegetarian × 2", html)

    # ── Test 5: Time slot → title + formatted time range ─────────────────────

    @tag("field_answers_email")
    def test_time_slot_included(self):
        """Time slot shows field title and formatted time range."""
        field = self._create_field(
            RegistrationFieldType.TIME_SLOT_SELECT,
            0,
            "Pickup",
            {"title": "Pickup slot"},
        )
        start = timezone.now() + timedelta(days=10, hours=10)
        end = start + timedelta(hours=2)
        option = self._create_option(
            field,
            "",
            0,
            start_time=start,
            end_time=end,
        )
        self._create_answer(field, value_option=option)

        html = _build_field_answers_html(self.registration, "en")
        self.assertIn("Pickup slot", html)
        self.assertIn("–", html)  # time range separator

    # ── Test 6: Multiple fields → ordered by field.order ─────────────────────

    @tag("field_answers_email")
    def test_multiple_fields_ordered_by_order(self):
        """Multiple answers are shown in field order."""
        field_b = self._create_field(
            RegistrationFieldType.OPTION_SELECT,
            1,
            "Second",
            {"title": "Second field"},
        )
        field_a = self._create_field(
            RegistrationFieldType.OPTION_SELECT,
            0,
            "First",
            {"title": "First field"},
        )
        option_b = self._create_option(field_b, "Option B", 0)
        option_a = self._create_option(field_a, "Option A", 0)
        self._create_answer(field_b, value_option=option_b)
        self._create_answer(field_a, value_option=option_a)

        html = _build_field_answers_html(self.registration, "en")
        # Both fields present
        self.assertIn("First field", html)
        self.assertIn("Second field", html)
        # First field appears before second in the HTML
        idx_first = html.index("First field")
        idx_second = html.index("Second field")
        self.assertLess(idx_first, idx_second)

    # ── Test 7: No custom fields → empty string ──────────────────────────────

    @tag("field_answers_email")
    def test_no_custom_fields_returns_empty(self):
        """Registration with no custom fields returns empty string."""
        html = _build_field_answers_html(self.registration, "en")
        self.assertEqual(html, "")

    # ── Test 8: Optional fields, no answers → empty string ───────────────────

    @tag("field_answers_email")
    def test_optional_fields_no_answers_returns_empty(self):
        """Optional fields with no answers provided returns empty string."""
        self._create_field(
            RegistrationFieldType.OPTION_SELECT,
            0,
            "Optional",
            {"title": "Optional field"},
            is_required=False,
        )
        # No answer created
        html = _build_field_answers_html(self.registration, "en")
        self.assertEqual(html, "")

    # ── Test 9: Mix of answered and unanswered → only answered shown ─────────

    @tag("field_answers_email")
    def test_mix_answered_unanswered_only_answered_shown(self):
        """Only fields with answers are included; unanswered optional fields are skipped."""
        field_a = self._create_field(
            RegistrationFieldType.OPTION_SELECT,
            0,
            "Answered",
            {"title": "Answered field"},
            is_required=True,
        )
        self._create_field(
            RegistrationFieldType.OPTION_SELECT,
            1,
            "Unanswered",
            {"title": "Unanswered field"},
            is_required=False,
        )
        option_a = self._create_option(field_a, "Selected", 0)
        self._create_answer(field_a, value_option=option_a)
        # No answer for field_b

        html = _build_field_answers_html(self.registration, "en")
        self.assertIn("Answered field", html)
        self.assertNotIn("Unanswered field", html)

    # ── German language → heading in German ───────────────────────────────────

    @tag("field_answers_email")
    def test_german_heading(self):
        """German language code produces German heading."""
        field = self._create_field(
            RegistrationFieldType.OPTION_SELECT,
            0,
            "Workshop",
            {"title": "Workshop"},
        )
        option = self._create_option(field, "Solar", 0)
        self._create_answer(field, value_option=option)

        html = _build_field_answers_html(self.registration, "de")
        self.assertIn("Deine Anmeldeantworten", html)

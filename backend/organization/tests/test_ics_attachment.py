"""
Tests for .ics calendar attachment in registration confirmation emails.

Covers spec AC-1 and AC-2:
  - AC-1: .ics attachment is generated with correct iCal fields
  - AC-2: Edge cases (online events, missing location, no start/end date)
  - Field answers (especially timeslots) appear in the DESCRIPTION
"""

import base64
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from django.contrib.auth.models import User
from django.test import TestCase, tag
from django.utils import timezone as django_timezone
from icalendar import Calendar

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
    RegistrationFieldType,
)
from organization.utility.email import (
    _build_field_answers_text,
    generate_event_ics_attachment,
)

_UTC = ZoneInfo("UTC")


class TestGenerateEventIcsAttachment(TestCase):
    """Unit tests for generate_event_ics_attachment()."""

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_ics_test",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )
        self.project = Project.objects.create(
            name="Climate Action Summit",
            url_slug="climate-action-summit",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="EV",
            start_date=datetime(2026, 6, 20, 9, 0, tzinfo=_UTC),
            end_date=datetime(2026, 6, 20, 17, 0, tzinfo=_UTC),
        )

    def _parse_ics(self, attachment):
        """Decode and parse a Mailjet attachment dict into an icalendar Calendar."""
        ics_bytes = base64.b64decode(attachment["Base64Content"])
        return Calendar.from_ical(ics_bytes)

    @tag("ics_attachment")
    def test_attachment_metadata(self):
        """Attachment has correct filename and content type."""
        attachment = generate_event_ics_attachment(self.project, "en")
        self.assertEqual(attachment["Filename"], "climate-action-summit.ics")
        self.assertEqual(
            attachment["ContentType"],
            "text/calendar; method=PUBLISH; charset=utf-8",
        )

    @tag("ics_attachment")
    def test_vcalendar_structure(self):
        """ICS contains VCALENDAR with required properties."""
        attachment = generate_event_ics_attachment(self.project, "en")
        cal = self._parse_ics(attachment)
        self.assertEqual(cal.get("prodid"), "-//Climate Connect//EN")
        self.assertEqual(cal.get("version"), "2.0")
        self.assertEqual(cal.get("method"), "PUBLISH")

    @tag("ics_attachment")
    def test_vevent_uid(self):
        """VEVENT UID uses event ID + domain."""
        attachment = generate_event_ics_attachment(self.project, "en")
        cal = self._parse_ics(attachment)
        events = cal.walk("VEVENT")
        self.assertEqual(len(events), 1)
        self.assertEqual(
            events[0].get("uid"), f"{self.project.id}@climateconnect.earth"
        )

    @tag("ics_attachment")
    def test_vevent_summary_localised(self):
        """VEVENT SUMMARY uses the localised event name."""
        attachment = generate_event_ics_attachment(self.project, "en")
        cal = self._parse_ics(attachment)
        event = cal.walk("VEVENT")[0]
        self.assertEqual(event.get("summary"), "Climate Action Summit")

    @tag("ics_attachment")
    def test_vevent_dtstart_dtend(self):
        """VEVENT DTSTART and DTEND match the project dates."""
        attachment = generate_event_ics_attachment(self.project, "en")
        cal = self._parse_ics(attachment)
        event = cal.walk("VEVENT")[0]
        dtstart = event.get("dtstart").dt
        dtend = event.get("dtend").dt
        self.assertEqual(dtstart.year, 2026)
        self.assertEqual(dtstart.month, 6)
        self.assertEqual(dtstart.day, 20)
        self.assertEqual(dtstart.hour, 9)
        self.assertEqual(dtend.hour, 17)

    @tag("ics_attachment")
    def test_vevent_url(self):
        """VEVENT URL points to the event page."""
        attachment = generate_event_ics_attachment(self.project, "en")
        cal = self._parse_ics(attachment)
        event = cal.walk("VEVENT")[0]
        expected_url = f"http://localhost:3000/projects/{self.project.url_slug}"
        self.assertEqual(str(event.get("url")), expected_url)

    @tag("ics_attachment")
    def test_vevent_description_contains_url(self):
        """VEVENT DESCRIPTION includes the event URL."""
        attachment = generate_event_ics_attachment(self.project, "en")
        cal = self._parse_ics(attachment)
        event = cal.walk("VEVENT")[0]
        description = str(event.get("description"))
        self.assertIn(
            f"http://localhost:3000/projects/{self.project.url_slug}",
            description,
        )

    @tag("ics_attachment")
    def test_vevent_description_strips_html(self):
        """VEVENT DESCRIPTION strips HTML tags from project description."""
        self.project.description = "<p>Join us for a <strong>great</strong> event!</p>"
        self.project.save()
        attachment = generate_event_ics_attachment(self.project, "en")
        cal = self._parse_ics(attachment)
        event = cal.walk("VEVENT")[0]
        description = str(event.get("description"))
        self.assertNotIn("<p>", description)
        self.assertNotIn("<strong>", description)
        self.assertIn("Join us for a great event!", description)

    # ── AC-2: Edge cases ──────────────────────────────────────────────────────

    @tag("ics_attachment")
    def test_online_event_location(self):
        """Online event (is_online=True) uses 'Online' as LOCATION."""
        self.project.is_online = True
        self.project.save()
        attachment = generate_event_ics_attachment(self.project, "en")
        cal = self._parse_ics(attachment)
        event = cal.walk("VEVENT")[0]
        self.assertEqual(str(event.get("location")), "Online")

    @tag("ics_attachment")
    def test_event_with_no_location(self):
        """Event with no location omits LOCATION from .ics."""
        attachment = generate_event_ics_attachment(self.project, "en")
        cal = self._parse_ics(attachment)
        event = cal.walk("VEVENT")[0]
        self.assertIsNone(event.get("location"))

    @tag("ics_attachment")
    def test_online_event_with_website_uses_website_url(self):
        """Online event with website uses it as the iCal URL property."""
        self.project.is_online = True
        self.project.website = "https://zoom.us/j/123456"
        self.project.save()
        attachment = generate_event_ics_attachment(self.project, "en")
        cal = self._parse_ics(attachment)
        event = cal.walk("VEVENT")[0]
        self.assertEqual(str(event.get("url")), "https://zoom.us/j/123456")

    @tag("ics_attachment")
    def test_online_event_without_website_uses_event_page(self):
        """Online event without website falls back to event page URL."""
        self.project.is_online = True
        self.project.save()
        attachment = generate_event_ics_attachment(self.project, "en")
        cal = self._parse_ics(attachment)
        event = cal.walk("VEVENT")[0]
        self.assertEqual(
            str(event.get("url")),
            f"http://localhost:3000/projects/{self.project.url_slug}",
        )

    @tag("ics_attachment")
    def test_non_online_event_with_website_ignores_website(self):
        """Non-online event with website still uses event page URL."""
        self.project.website = "https://example.com"
        self.project.save()
        attachment = generate_event_ics_attachment(self.project, "en")
        cal = self._parse_ics(attachment)
        event = cal.walk("VEVENT")[0]
        self.assertEqual(
            str(event.get("url")),
            f"http://localhost:3000/projects/{self.project.url_slug}",
        )

    @tag("ics_attachment")
    def test_online_event_website_not_in_description_cta(self):
        """Online event website URL is separate from the DESCRIPTION CTA."""
        self.project.is_online = True
        self.project.website = "https://zoom.us/j/123456"
        self.project.save()
        attachment = generate_event_ics_attachment(self.project, "en")
        cal = self._parse_ics(attachment)
        event = cal.walk("VEVENT")[0]
        description = str(event.get("description"))
        self.assertIn(
            "http://localhost:3000/projects/climate-action-summit", description
        )
        self.assertNotIn("zoom.us", description)

    @tag("ics_attachment")
    def test_missing_start_date_returns_none(self):
        """Event with no start_date returns None (no attachment)."""
        self.project.start_date = None
        self.project.save()
        result = generate_event_ics_attachment(self.project, "en")
        self.assertIsNone(result)

    @tag("ics_attachment")
    def test_missing_end_date_returns_none(self):
        """Event with no end_date returns None (no attachment)."""
        self.project.end_date = None
        self.project.save()
        result = generate_event_ics_attachment(self.project, "en")
        self.assertIsNone(result)

    @tag("ics_attachment")
    def test_special_characters_escaped(self):
        """Special characters in event name are properly handled by icalendar."""
        self.project.name = "Event: Commas, Semicolons \\ Backslashes"
        self.project.save()
        attachment = generate_event_ics_attachment(self.project, "en")
        cal = self._parse_ics(attachment)
        event = cal.walk("VEVENT")[0]
        self.assertEqual(
            event.get("summary"), "Event: Commas, Semicolons \\ Backslashes"
        )


class TestSendConfirmationEmailWithIcs(TestCase):
    """Integration tests: confirmation email includes .ics attachment."""

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_ics_integration",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )
        self.project = Project.objects.create(
            name="Summit Test",
            url_slug="summit-test",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="EV",
            start_date=datetime(2026, 7, 1, 10, 0, tzinfo=_UTC),
            end_date=datetime(2026, 7, 1, 18, 0, tzinfo=_UTC),
        )
        self.config = EventRegistrationConfig.objects.create(
            project=self.project,
            max_participants=100,
            registration_end_date=django_timezone.now() + timedelta(days=30),
            status=RegistrationStatus.OPEN,
        )
        self.user = User.objects.create_user(
            username="ics_test_user",
            password="testpassword",
            first_name="Test",
            last_name="User",
        )
        self.registration = EventRegistration.objects.create(
            user=self.user,
            registration_config=self.config,
        )

    @tag("ics_attachment")
    def test_confirmation_email_includes_ics_attachment(self):
        """The confirmation email sends an .ics attachment via send_email."""
        from unittest.mock import patch

        from organization.utility.email import (
            send_event_registration_confirmation_to_user,
        )

        with patch("organization.utility.email.send_email") as mock_send_email:
            send_event_registration_confirmation_to_user(
                user=self.user,
                project=self.project,
                registration=self.registration,
            )
            mock_send_email.assert_called_once()
            call_kwargs = mock_send_email.call_args
            attachments = call_kwargs.kwargs.get("attachments") or call_kwargs[1].get(
                "attachments"
            )
            self.assertIsNotNone(attachments)
            self.assertEqual(len(attachments), 1)
            self.assertEqual(attachments[0]["Filename"], "summit-test.ics")
            self.assertIn("text/calendar", attachments[0]["ContentType"])

    @tag("ics_attachment")
    def test_confirmation_email_no_attachment_when_no_dates(self):
        """The confirmation email has no attachments when event has no dates."""
        from unittest.mock import patch

        from organization.utility.email import (
            send_event_registration_confirmation_to_user,
        )

        self.project.start_date = None
        self.project.end_date = None
        self.project.save()

        with patch("organization.utility.email.send_email") as mock_send_email:
            send_event_registration_confirmation_to_user(
                user=self.user,
                project=self.project,
                registration=self.registration,
            )
            mock_send_email.assert_called_once()
            call_kwargs = mock_send_email.call_args
            attachments = call_kwargs.kwargs.get("attachments") or call_kwargs[1].get(
                "attachments"
            )
            self.assertIsNone(attachments)


class TestBuildFieldAnswersText(TestCase):
    """Unit tests for _build_field_answers_text()."""

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_ics_text_test",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )
        self.project = Project.objects.create(
            name="Text Test Event",
            url_slug="text-test-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="EV",
            start_date=datetime(2026, 8, 1, 9, 0, tzinfo=_UTC),
            end_date=datetime(2026, 8, 1, 17, 0, tzinfo=_UTC),
        )
        self.config = EventRegistrationConfig.objects.create(
            project=self.project,
            max_participants=100,
            registration_end_date=django_timezone.now() + timedelta(days=30),
            status=RegistrationStatus.OPEN,
        )
        self.user = User.objects.create_user(
            username="text_test_user", password="testpassword"
        )
        self.registration = EventRegistration.objects.create(
            user=self.user,
            registration_config=self.config,
        )

    @tag("ics_attachment")
    def test_no_answers_returns_empty(self):
        """No field answers returns empty string."""
        result = _build_field_answers_text(self.registration, "en", _UTC)
        self.assertEqual(result, "")

    @tag("ics_attachment")
    def test_timeslot_answer_in_text(self):
        """Time slot answer includes the formatted time range."""
        field = RegistrationField.objects.create(
            registration_config=self.config,
            field_type=RegistrationFieldType.TIME_SLOT_SELECT,
            order=0,
            label="Workshop",
            settings={"title": "Workshop"},
        )
        option = RegistrationFieldOption.objects.create(
            field=field,
            title="Morning session",
            order=0,
            start_time=datetime(2026, 8, 1, 10, 0, tzinfo=_UTC),
            end_time=datetime(2026, 8, 1, 12, 0, tzinfo=_UTC),
        )
        RegistrationFieldAnswer.objects.create(
            registration=self.registration,
            field=field,
            value_option=option,
        )
        result = _build_field_answers_text(self.registration, "en", _UTC)
        self.assertIn("Workshop", result)
        self.assertIn("10:00", result)
        self.assertIn("12:00", result)

    @tag("ics_attachment")
    def test_checkbox_answer_in_text(self):
        """Checked checkbox appears as a bullet with checkmark."""
        field = RegistrationField.objects.create(
            registration_config=self.config,
            field_type=RegistrationFieldType.CHECKBOX,
            order=0,
            label="Terms",
            settings={"description": "I agree to the terms"},
        )
        RegistrationFieldAnswer.objects.create(
            registration=self.registration,
            field=field,
            value_boolean=True,
        )
        result = _build_field_answers_text(self.registration, "en", _UTC)
        self.assertIn("I agree to the terms", result)
        self.assertIn("\u2713", result)

    @tag("ics_attachment")
    def test_option_select_answer_in_text(self):
        """Option select shows field title and option title."""
        field = RegistrationField.objects.create(
            registration_config=self.config,
            field_type=RegistrationFieldType.OPTION_SELECT,
            order=0,
            label="T-shirt",
            settings={"title": "T-shirt size"},
        )
        option = RegistrationFieldOption.objects.create(
            field=field, title="Medium", order=0
        )
        RegistrationFieldAnswer.objects.create(
            registration=self.registration,
            field=field,
            value_option=option,
        )
        result = _build_field_answers_text(self.registration, "en", _UTC)
        self.assertIn("T-shirt size", result)
        self.assertIn("Medium", result)

    @tag("ics_attachment")
    def test_inventory_answer_in_text(self):
        """Inventory shows field title, option title, and quantity."""
        field = RegistrationField.objects.create(
            registration_config=self.config,
            field_type=RegistrationFieldType.INVENTORY,
            order=0,
            label="Equipment",
            settings={"title": "Equipment needed"},
        )
        option = RegistrationFieldOption.objects.create(
            field=field, title="Chairs", order=0
        )
        RegistrationFieldAnswer.objects.create(
            registration=self.registration,
            field=field,
            value_option=option,
            value_number=5,
        )
        result = _build_field_answers_text(self.registration, "en", _UTC)
        self.assertIn("Equipment needed", result)
        self.assertIn("Chairs", result)
        self.assertIn("5", result)

    @tag("ics_attachment")
    def test_heading_english(self):
        """English heading is included."""
        field = RegistrationField.objects.create(
            registration_config=self.config,
            field_type=RegistrationFieldType.OPTION_SELECT,
            order=0,
            label="Size",
            settings={"title": "Size"},
        )
        option = RegistrationFieldOption.objects.create(
            field=field, title="Small", order=0
        )
        RegistrationFieldAnswer.objects.create(
            registration=self.registration,
            field=field,
            value_option=option,
        )
        result = _build_field_answers_text(self.registration, "en", _UTC)
        self.assertTrue(result.startswith("Your registration answers:"))

    @tag("ics_attachment")
    def test_heading_german(self):
        """German heading is included."""
        field = RegistrationField.objects.create(
            registration_config=self.config,
            field_type=RegistrationFieldType.OPTION_SELECT,
            order=0,
            label="Groesse",
            settings={"title": "Groesse"},
        )
        option = RegistrationFieldOption.objects.create(
            field=field, title="Klein", order=0
        )
        RegistrationFieldAnswer.objects.create(
            registration=self.registration,
            field=field,
            value_option=option,
        )
        result = _build_field_answers_text(self.registration, "de", _UTC)
        self.assertTrue(result.startswith("Deine Anmeldeantworten:"))


class TestIcsDescriptionWithFieldAnswers(TestCase):
    """Tests that field answers appear in the ICS DESCRIPTION."""

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_ics_answers",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )
        self.project = Project.objects.create(
            name="Answers Test Event",
            url_slug="answers-test-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.language,
            project_type="EV",
            start_date=datetime(2026, 9, 1, 9, 0, tzinfo=_UTC),
            end_date=datetime(2026, 9, 1, 17, 0, tzinfo=_UTC),
        )
        self.config = EventRegistrationConfig.objects.create(
            project=self.project,
            max_participants=100,
            registration_end_date=django_timezone.now() + timedelta(days=30),
            status=RegistrationStatus.OPEN,
        )
        self.user = User.objects.create_user(
            username="answers_test_user", password="testpassword"
        )
        self.registration = EventRegistration.objects.create(
            user=self.user,
            registration_config=self.config,
        )

    def _parse_ics(self, attachment):
        ics_bytes = base64.b64decode(attachment["Base64Content"])
        return Calendar.from_ical(ics_bytes)

    @tag("ics_attachment")
    def test_description_includes_field_answers(self):
        """DESCRIPTION includes registration field answers when provided."""
        field = RegistrationField.objects.create(
            registration_config=self.config,
            field_type=RegistrationFieldType.TIME_SLOT_SELECT,
            order=0,
            label="Workshop",
            settings={"title": "Workshop"},
        )
        option = RegistrationFieldOption.objects.create(
            field=field,
            title="Morning",
            order=0,
            start_time=datetime(2026, 9, 1, 10, 0, tzinfo=_UTC),
            end_time=datetime(2026, 9, 1, 12, 0, tzinfo=_UTC),
        )
        RegistrationFieldAnswer.objects.create(
            registration=self.registration,
            field=field,
            value_option=option,
        )
        attachment = generate_event_ics_attachment(
            self.project,
            "en",
            registration=self.registration,
            tz=_UTC,
        )
        cal = self._parse_ics(attachment)
        event = cal.walk("VEVENT")[0]
        description = str(event.get("description"))
        self.assertIn("Workshop", description)
        self.assertIn("10:00", description)
        self.assertIn("12:00", description)
        self.assertIn(
            "http://localhost:3000/projects/answers-test-event",
            description,
        )

    @tag("ics_attachment")
    def test_description_without_registration_omits_answers(self):
        """DESCRIPTION omits field answers when no registration is provided."""
        attachment = generate_event_ics_attachment(self.project, "en")
        cal = self._parse_ics(attachment)
        event = cal.walk("VEVENT")[0]
        description = str(event.get("description"))
        self.assertNotIn("registration answers", description.lower())
        self.assertNotIn("Deine Anmeldeantworten", description)

    @tag("ics_attachment")
    def test_description_no_answers_when_registration_has_none(self):
        """DESCRIPTION omits answers heading when registration has no answers."""
        attachment = generate_event_ics_attachment(
            self.project,
            "en",
            registration=self.registration,
            tz=_UTC,
        )
        cal = self._parse_ics(attachment)
        event = cal.walk("VEVENT")[0]
        description = str(event.get("description"))
        self.assertNotIn("Your registration answers", description)

    @tag("ics_attachment")
    def test_description_answers_before_url(self):
        """Field answers appear between event description and URL."""
        self.project.description = "An exciting climate event."
        self.project.save()
        field = RegistrationField.objects.create(
            registration_config=self.config,
            field_type=RegistrationFieldType.OPTION_SELECT,
            order=0,
            label="Track",
            settings={"title": "Track"},
        )
        option = RegistrationFieldOption.objects.create(
            field=field, title="Policy", order=0
        )
        RegistrationFieldAnswer.objects.create(
            registration=self.registration,
            field=field,
            value_option=option,
        )
        attachment = generate_event_ics_attachment(
            self.project,
            "en",
            registration=self.registration,
            tz=_UTC,
        )
        cal = self._parse_ics(attachment)
        event = cal.walk("VEVENT")[0]
        description = str(event.get("description"))
        event_url = "http://localhost:3000/projects/answers-test-event"
        event_desc_pos = description.find("An exciting climate event.")
        answers_pos = description.find("Your registration answers:")
        url_pos = description.find(event_url)
        self.assertGreater(event_desc_pos, -1)
        self.assertGreater(answers_pos, event_desc_pos)
        self.assertGreater(url_pos, answers_pos)

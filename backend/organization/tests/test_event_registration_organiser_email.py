"""
Tests for the organiser-to-guest bulk email feature.

Contains:
  - TestSendOrganizerEmail
"""

from datetime import timedelta
from unittest.mock import patch as mock_patch

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
    RegistrationStatus,
)


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
        """is_test=false with 3 guests → 200 OK, sent_count=5 (3 guests + 2 admins),
        task dispatched with all 5 unique user IDs."""
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
        # 3 guests + organiser (ALL_TYPE) + team_admin (READ_WRITE_TYPE) = 5
        self.assertEqual(response.data["sent_count"], 5)
        mock_task.delay.assert_called_once()
        _, kwargs = mock_task.delay.call_args
        self.assertEqual(len(kwargs["user_ids"]), 5)
        self.assertEqual(kwargs["subject"], "Important update")
        self.assertEqual(kwargs["event_slug"], "send-email-event")

    # ------------------------------------------------------------------
    # 8. is_test=false, 0 participants → 200, task dispatched with empty list
    # ------------------------------------------------------------------

    @tag("organizer_email", "bulk_send")
    def test_bulk_send_with_zero_participants_returns_zero_count(self):
        """is_test=false with no registered guests → 200 OK, sent_count=2 (admins only),
        task dispatched with the 2 team admin IDs."""
        self.client.login(username="organiser_send_email", password="testpassword")

        with mock_patch(
            "organization.views.event_registration_views._send_organizer_email_task"
        ) as mock_task:
            response = self.client.post(
                self._url(), self._valid_payload(is_test=False), format="json"
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        # 0 guests + organiser (ALL_TYPE) + team_admin (READ_WRITE_TYPE) = 2
        self.assertEqual(response.data["sent_count"], 2)
        mock_task.delay.assert_called_once()
        _, kwargs = mock_task.delay.call_args
        self.assertEqual(len(kwargs["user_ids"]), 2)
        self.assertIn(self.organiser.id, kwargs["user_ids"])
        self.assertIn(self.team_admin.id, kwargs["user_ids"])

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
    # 14 (#1886). Bulk send: guests + admins with no overlap → correct total
    # ------------------------------------------------------------------

    @tag("organizer_email", "bulk_send", "admin_cc")
    def test_bulk_send_includes_team_admins_alongside_guests(self):
        """Bulk send with 5 distinct guests and 2 admins (no overlap) → sent_count=7."""
        for i in range(5):
            self._make_participant(f"admin_cc_guest_{i}")

        self.client.login(username="organiser_send_email", password="testpassword")

        with mock_patch(
            "organization.views.event_registration_views._send_organizer_email_task"
        ) as mock_task:
            response = self.client.post(
                self._url(), self._valid_payload(is_test=False), format="json"
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        # 5 guests + organiser (ALL_TYPE) + team_admin (READ_WRITE_TYPE) = 7
        self.assertEqual(response.data["sent_count"], 7)
        _, kwargs = mock_task.delay.call_args
        self.assertEqual(len(kwargs["user_ids"]), 7)

    # ------------------------------------------------------------------
    # 15 (#1886). Bulk send: admin who is also a registered guest → deduplicated
    # ------------------------------------------------------------------

    @tag("organizer_email", "bulk_send", "admin_cc")
    def test_bulk_send_deduplicates_admin_who_is_also_a_guest(self):
        """A team admin who is also registered as a guest appears only once in the
        recipient list and counts as one in sent_count."""
        # Register the organiser (ALL_TYPE admin) as a guest too.
        EventRegistration.objects.create(
            user=self.organiser, registration_config=self.er
        )

        self.client.login(username="organiser_send_email", password="testpassword")

        with mock_patch(
            "organization.views.event_registration_views._send_organizer_email_task"
        ) as mock_task:
            response = self.client.post(
                self._url(), self._valid_payload(is_test=False), format="json"
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        # organiser (guest + admin) counted once + team_admin (admin only) = 2
        self.assertEqual(response.data["sent_count"], 2)
        _, kwargs = mock_task.delay.call_args
        self.assertEqual(len(kwargs["user_ids"]), 2)
        self.assertIn(self.organiser.id, kwargs["user_ids"])
        self.assertIn(self.team_admin.id, kwargs["user_ids"])

    # ------------------------------------------------------------------
    # 16 (#1886). Bulk send: 0 guests but admins present → admins receive email
    # ------------------------------------------------------------------
    # Covered by the updated test_bulk_send_with_zero_participants_returns_zero_count above.

    # ------------------------------------------------------------------
    # 17 (#1886). Test send (is_test=true) → team admins NOT included
    # ------------------------------------------------------------------

    @tag("organizer_email", "test_send", "admin_cc")
    def test_test_send_does_not_include_team_admins(self):
        """Test send (is_test=true) sends only to the requesting organiser;
        team admins are not included (#1886)."""
        self.client.login(username="organiser_send_email", password="testpassword")

        with mock_patch(
            "organization.views.event_registration_views.send_organizer_message_to_guest"
        ) as mock_helper:
            response = self.client.post(
                self._url(), self._valid_payload(is_test=True), format="json"
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        # Only one call — to the requesting organiser. No admin copies.
        self.assertEqual(mock_helper.call_count, 1)
        self.assertEqual(response.data["sent_count"], 1)

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

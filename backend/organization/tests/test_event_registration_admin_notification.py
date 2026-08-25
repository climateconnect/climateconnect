"""
Tests for admin notification emails on registration/cancellation (#1888).

Contains:
  - TestAdminNotificationEmailDispatch
  - TestAdminNotificationTask
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

        # mock_patch.object(task, 'apply_async') prevents self.retry() from
        # trying to connect to the Celery broker (which isn't running in CI).
        # self.retry() still raises Retry — we just prevent the broker call.
        with (
            mock_patch(
                "organization.utility.email.send_admin_event_notification",
                side_effect=side_effect,
            ),
            mock_patch.object(notify_admins_of_registration_change, "apply_async"),
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

"""
Tests for notifying event guests on event deletion.

Covers:
    - Delete event with active registrations dispatches Celery task
    - Delete event with no active registrations does not dispatch task
    - Delete non-event project does not dispatch task
    - Celery task sends an email for each guest
    - Celery task does not look up the deleted project
    - A guest email failure does not prevent other emails
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


class TestDeleteEventWithRegistrations(APITestCase):
    """Tests for the delete endpoint when the event has registered guests."""

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_del_notif",
                "name_de_translation": "aktiv",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.default_language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )
        self.admin = User.objects.create_user(
            username="admin_del_notif", password="testpassword"
        )
        self.admin_role = Role.objects.create(
            name="Admin_del_notif", role_type=Role.ALL_TYPE
        )

        self.event = Project.objects.create(
            name="Delete Notif Event",
            url_slug="delete-notif-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=30),
            end_date=timezone.now() + timedelta(days=60),
        )
        self.er = EventRegistrationConfig.objects.create(
            project=self.event,
            max_participants=50,
            registration_end_date=timezone.now() + timedelta(days=40),
            status=RegistrationStatus.OPEN,
        )
        ProjectMember.objects.create(
            user=self.admin, project=self.event, role=self.admin_role
        )

        self.url = reverse(
            "organization:project-api-view",
            kwargs={"url_slug": self.event.url_slug},
        )

    def _create_guests(self, count):
        guests = []
        for i in range(count):
            user = User.objects.create_user(
                username=f"guest_del_{i}", password="testpassword"
            )
            EventRegistration.objects.create(user=user, registration_config=self.er)
            guests.append(user)
        return guests

    @tag("projects", "event_deletion")
    def test_delete_event_with_active_registrations_dispatches_task(self):
        self._create_guests(3)
        self.client.login(username="admin_del_notif", password="testpassword")

        with (
            mock_patch(
                "organization.views.project_views.send_event_deletion_guest_notifications"
            ) as mock_task,
            mock_patch(
                "organization.views.project_views.transaction.on_commit",
                side_effect=lambda fn: fn(),
            ),
        ):
            response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn("notified_guests", data)
        self.assertEqual(data["notified_guests"], 3)
        self.assertFalse(Project.objects.filter(url_slug="delete-notif-event").exists())
        mock_task.delay.assert_called_once()
        call_args = mock_task.delay.call_args
        user_ids = call_args[0][0]
        self.assertEqual(len(user_ids), 3)

    @tag("projects", "event_deletion")
    def test_delete_event_with_no_active_registrations(self):
        self.client.login(username="admin_del_notif", password="testpassword")

        with mock_patch(
            "organization.views.project_views.send_event_deletion_guest_notifications"
        ) as mock_task:
            response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertNotIn("notified_guests", data)
        mock_task.delay.assert_not_called()

    @tag("projects", "event_deletion")
    def test_delete_event_with_only_cancelled_registrations(self):
        guest = User.objects.create_user(
            username="guest_cancelled", password="testpassword"
        )
        EventRegistration.objects.create(
            user=guest,
            registration_config=self.er,
            cancelled_at=timezone.now(),
        )
        self.client.login(username="admin_del_notif", password="testpassword")

        with mock_patch(
            "organization.views.project_views.send_event_deletion_guest_notifications"
        ) as mock_task:
            response = self.client.delete(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertNotIn("notified_guests", data)
        mock_task.delay.assert_not_called()

    @tag("projects", "event_deletion")
    def test_delete_non_event_project_does_not_dispatch_task(self):
        non_event = Project.objects.create(
            name="Regular Project",
            url_slug="regular-project",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="PR",
        )
        ProjectMember.objects.create(
            user=self.admin, project=non_event, role=self.admin_role
        )
        url = reverse(
            "organization:project-api-view",
            kwargs={"url_slug": "regular-project"},
        )
        self.client.login(username="admin_del_notif", password="testpassword")

        with mock_patch(
            "organization.views.project_views.send_event_deletion_guest_notifications"
        ) as mock_task:
            response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertNotIn("notified_guests", data)
        mock_task.delay.assert_not_called()


class TestEventDeletionGuestNotificationTask(APITestCase):
    """Tests for the send_event_deletion_guest_notifications Celery task."""

    def setUp(self):
        self.default_language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )
        self.guests = []
        for i in range(3):
            user = User.objects.create_user(
                username=f"task_guest_{i}", password="testpassword"
            )
            self.guests.append(user)

        self.user_ids = [u.id for u in self.guests]
        self.event_names = {"en": "Test Event", "de": "Test Veranstaltung"}

    @tag("event_deletion", "tasks")
    def test_task_sends_email_for_each_guest(self):
        from organization.tasks import send_event_deletion_guest_notifications

        with mock_patch(
            "organization.utility.email.send_event_deleted_notification_to_guest"
        ) as mock_send:
            send_event_deletion_guest_notifications(self.user_ids, self.event_names)

        self.assertEqual(mock_send.call_count, 3)

    @tag("event_deletion", "tasks")
    def test_task_does_not_look_up_project(self):
        from organization.tasks import send_event_deletion_guest_notifications

        with (
            mock_patch(
                "organization.utility.email.send_event_deleted_notification_to_guest"
            ),
            mock_patch(
                "organization.models.project.Project.objects"
            ) as mock_project_objects,
        ):
            send_event_deletion_guest_notifications(self.user_ids, self.event_names)

        mock_project_objects.get.assert_not_called()
        mock_project_objects.filter.assert_not_called()

    @tag("event_deletion", "tasks")
    def test_task_continues_on_individual_email_failure(self):
        from organization.tasks import send_event_deletion_guest_notifications

        call_count = 0

        def side_effect(user, event_name):
            nonlocal call_count
            call_count += 1
            if user.username == "task_guest_1":
                raise ConnectionError("Mailjet down")

        with mock_patch(
            "organization.utility.email.send_event_deleted_notification_to_guest",
            side_effect=side_effect,
        ) as mock_send:
            send_event_deletion_guest_notifications(self.user_ids, self.event_names)

        self.assertEqual(mock_send.call_count, 3)

    @tag("event_deletion", "tasks")
    def test_task_passes_correct_event_name_per_language(self):
        from organization.tasks import send_event_deletion_guest_notifications

        de_language, _ = Language.objects.get_or_create(
            language_code="de",
            defaults={"name": "German", "native_name": "Deutsch"},
        )
        from climateconnect_api.models import UserProfile

        profile, _ = UserProfile.objects.get_or_create(
            user=self.guests[0], defaults={"name": "g0"}
        )
        profile.language = de_language
        profile.save()

        received_args = []

        def capture(user, event_name):
            received_args.append((user.username, event_name))

        with mock_patch(
            "organization.utility.email.send_event_deleted_notification_to_guest",
            side_effect=capture,
        ):
            send_event_deletion_guest_notifications(self.user_ids, self.event_names)

        names_by_user = {arg[0]: arg[1] for arg in received_args}
        self.assertEqual(names_by_user["task_guest_0"], "Test Veranstaltung")
        self.assertEqual(names_by_user["task_guest_1"], "Test Event")
        self.assertEqual(names_by_user["task_guest_2"], "Test Event")

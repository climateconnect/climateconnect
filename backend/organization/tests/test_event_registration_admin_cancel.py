"""
Tests for the admin participant list and admin guest cancellation.

Contains:
  - TestListEventParticipants
  - TestAdminCancelGuestRegistration
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

from ._helpers import _CancellationTestBase


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


# ===========================================================================
# Admin cancel guest registration — PATCH /projects/{slug}/registrations/{id}/
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

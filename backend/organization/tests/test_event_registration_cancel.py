"""
Tests for member self-cancellation, re-registration, and my_interactions fields.

Contains:
  - TestMemberCancelRegistration
  - TestMemberReRegistration
  - TestMyInteractionsRegistrationFields
"""

from datetime import timedelta
from unittest.mock import patch as mock_patch

from django.contrib.auth.models import User
from django.test import tag
from django.urls import reverse
from django.utils import timezone
from rest_framework import status

from organization.models.event_registration import EventRegistration, RegistrationStatus

from ._helpers import _CancellationTestBase

# ===========================================================================
# Member self-cancellation (DELETE /api/projects/{slug}/registrations/)
# ===========================================================================


class TestMemberCancelRegistration(_CancellationTestBase):
    """
    Tests for DELETE /api/projects/{url_slug}/registrations/
    (member self-cancellation, spec #1850).

    Covers all backend test cases from the spec:
    1. Unauthenticated → 401
    2. Member with no registration → 404
    3. Member with already-cancelled registration → 404
    4. Event has already started → 400
    5. Valid cancellation → 204; record soft-deleted (cancelled_at, cancelled_by set)
    6. Cancellation on FULL event → status reverts to OPEN
    7. Cancellation on OPEN event → status stays OPEN
    8. available_seats increases after cancellation (derived from active count)
    """

    @tag("cancel_registration", "member_cancel")
    def test_unauthenticated_returns_401(self):
        """DELETE without auth → 401 Unauthorized."""
        response = self.client.delete(self._cancel_url())
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @tag("cancel_registration", "member_cancel")
    def test_no_registration_returns_404(self):
        """DELETE when member has no registration → 404 Not Found."""
        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.delete(self._cancel_url())
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @tag("cancel_registration", "member_cancel")
    def test_already_cancelled_returns_404(self):
        """DELETE when registration is already cancelled → 404 Not Found."""
        reg = self._register(self.member)
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = self.member
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.delete(self._cancel_url())
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    @tag("cancel_registration", "member_cancel")
    def test_event_already_started_returns_400(self):
        """DELETE after event start_date → 400 Bad Request."""
        self._register(self.member)
        self.event.start_date = timezone.now() - timedelta(hours=1)
        self.event.save(update_fields=["start_date"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.delete(self._cancel_url())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @tag("cancel_registration", "member_cancel")
    def test_valid_cancellation_returns_204(self):
        """Valid DELETE → 204 No Content; record soft-deleted."""
        reg = self._register(self.member)

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.delete(self._cancel_url())

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        reg.refresh_from_db()
        self.assertIsNotNone(reg.cancelled_at)
        self.assertEqual(reg.cancelled_by, self.member)

    @tag("cancel_registration", "member_cancel")
    def test_cancellation_record_retained_in_db(self):
        """After cancellation the EventRegistration row still exists (soft delete)."""
        reg = self._register(self.member)

        self.client.login(username="member_cancel", password="testpassword")
        self.client.delete(self._cancel_url())

        self.assertTrue(EventRegistration.objects.filter(pk=reg.pk).exists())

    @tag("cancel_registration", "member_cancel")
    def test_cancellation_on_full_event_reverts_status_to_open(self):
        """When status=FULL and a cancellation frees a seat → status reverts to OPEN."""
        self._register(self.member)
        self.er.status = RegistrationStatus.FULL
        self.er.save(update_fields=["status", "updated_at"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.delete(self._cancel_url())

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.er.refresh_from_db()
        self.assertEqual(self.er.status, RegistrationStatus.OPEN)

    @tag("cancel_registration", "member_cancel")
    def test_cancellation_on_open_event_keeps_status_open(self):
        """Cancellation on an OPEN event with spare capacity → status stays OPEN."""
        # Two registrations exist; cancelling one still leaves capacity.
        self._register(self.member)
        other = User.objects.create_user(username="other_cancel_open", password="x")
        self._register(other)

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.delete(self._cancel_url())

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.er.refresh_from_db()
        self.assertEqual(self.er.status, RegistrationStatus.OPEN)

    @tag("cancel_registration", "member_cancel")
    def test_available_seats_increases_after_cancellation(self):
        """
        After cancellation, the available_seats count in the project detail
        endpoint reflects only active (non-cancelled) registrations.
        """
        self._register(self.member)
        project_url = reverse(
            "organization:project-api-view",
            kwargs={"url_slug": self.event.url_slug},
        )
        resp_before = self.client.get(project_url)
        seats_before = resp_before.data["registration_config"]["available_seats"]

        self.client.login(username="member_cancel", password="testpassword")
        self.client.delete(self._cancel_url())

        resp_after = self.client.get(project_url)
        seats_after = resp_after.data["registration_config"]["available_seats"]
        self.assertEqual(seats_after, seats_before + 1)


# ===========================================================================
# Member re-registration after cancellation
# ===========================================================================


class TestMemberReRegistration(_CancellationTestBase):
    """
    Tests for re-registration via POST /api/projects/{slug}/registrations/
    after a self-cancellation or admin-cancellation (spec #1850).

    1. Self-cancelled → re-registration returns 201; row reset in place (no duplicate)
    2. Admin-cancelled → re-registration returns 403
    3. Re-registration respects closed/full status
    """

    @tag("re_registration")
    def test_self_cancelled_member_can_reregister(self):
        """After self-cancellation POST /registrations/ returns 201 and resets the row."""
        reg = self._register(self.member)
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = self.member
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

        self.client.login(username="member_cancel", password="testpassword")
        with mock_patch(
            "organization.views.event_registration_views._send_registration_email"
        ):
            response = self.client.post(self._cancel_url())

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        reg.refresh_from_db()
        self.assertIsNone(reg.cancelled_at)
        self.assertIsNone(reg.cancelled_by)
        # Unique constraint: no duplicate row.
        self.assertEqual(
            EventRegistration.objects.filter(
                user=self.member, registration_config=self.er
            ).count(),
            1,
        )

    @tag("re_registration")
    def test_admin_cancelled_member_cannot_reregister_returns_403(self):
        """After admin-cancellation POST /registrations/ returns 403 Forbidden."""
        reg = self._register(self.member)
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = self.organiser  # different user = admin-cancelled
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.post(self._cancel_url())

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @tag("re_registration")
    def test_active_registration_post_is_idempotent_200(self):
        """POST when already actively registered → 200 OK (idempotent)."""
        self._register(self.member)
        self.client.login(username="member_cancel", password="testpassword")
        with mock_patch(
            "organization.views.event_registration_views._send_registration_email"
        ):
            response = self.client.post(self._cancel_url())
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    @tag("re_registration")
    def test_self_cancelled_cannot_reregister_when_closed(self):
        """Re-registration blocked when registration status is CLOSED → 400."""
        reg = self._register(self.member)
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = self.member
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

        self.er.status = RegistrationStatus.CLOSED
        self.er.save(update_fields=["status", "updated_at"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.post(self._cancel_url())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ===========================================================================
# GET /api/projects/{slug}/my_interactions/ — new fields
# ===========================================================================


class TestMyInteractionsRegistrationFields(_CancellationTestBase):
    """
    Tests for is_registered, has_attended, admin_cancelled fields
    returned by GET /api/projects/{slug}/my_interactions/ (spec #1850).
    """

    @tag("my_interactions", "is_registered")
    def test_is_registered_false_when_no_registration(self):
        """is_registered=false when the user has no registration."""
        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.get(self._my_interactions_url())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data["is_registered"])
        self.assertFalse(response.data["has_attended"])
        self.assertFalse(response.data["admin_cancelled"])

    @tag("my_interactions", "is_registered")
    def test_is_registered_true_for_active_registration(self):
        """is_registered=true when the user has an active (non-cancelled) registration."""
        self._register(self.member)
        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.get(self._my_interactions_url())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_registered"])

    @tag("my_interactions", "is_registered")
    def test_is_registered_false_for_cancelled_registration(self):
        """is_registered=false when the user's registration is cancelled."""
        reg = self._register(self.member)
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = self.member
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.get(self._my_interactions_url())
        self.assertFalse(response.data["is_registered"])

    @tag("my_interactions", "has_attended")
    def test_has_attended_false_when_event_not_started(self):
        """has_attended=false when the event has not yet started."""
        self._register(self.member)
        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.get(self._my_interactions_url())
        self.assertFalse(response.data["has_attended"])

    @tag("my_interactions", "has_attended")
    def test_has_attended_true_after_event_starts_with_active_registration(self):
        """has_attended=true when event start_date has passed and registration is active."""
        self._register(self.member)
        self.event.start_date = timezone.now() - timedelta(hours=1)
        self.event.save(update_fields=["start_date"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.get(self._my_interactions_url())
        self.assertTrue(response.data["has_attended"])
        self.assertTrue(response.data["is_registered"])

    @tag("my_interactions", "has_attended")
    def test_has_attended_false_when_cancelled_before_event_start(self):
        """has_attended=false when the user cancelled before the event started."""
        reg = self._register(self.member)
        reg.cancelled_at = timezone.now() - timedelta(days=5)
        reg.cancelled_by = self.member
        reg.save(update_fields=["cancelled_at", "cancelled_by"])
        # Event started after cancellation.
        self.event.start_date = timezone.now() - timedelta(hours=1)
        self.event.save(update_fields=["start_date"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.get(self._my_interactions_url())
        self.assertFalse(response.data["has_attended"])

    @tag("my_interactions", "admin_cancelled")
    def test_admin_cancelled_false_when_no_registration(self):
        """admin_cancelled=false when the user has no registration at all."""
        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.get(self._my_interactions_url())
        self.assertFalse(response.data["admin_cancelled"])

    @tag("my_interactions", "admin_cancelled")
    def test_admin_cancelled_false_when_self_cancelled(self):
        """admin_cancelled=false when the user cancelled their own registration."""
        reg = self._register(self.member)
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = self.member
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.get(self._my_interactions_url())
        self.assertFalse(response.data["admin_cancelled"])

    @tag("my_interactions", "admin_cancelled")
    def test_admin_cancelled_true_when_admin_cancelled_registration(self):
        """admin_cancelled=true when a different user (admin) cancelled the registration."""
        reg = self._register(self.member)
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = self.organiser  # different user = admin-cancelled
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

        self.client.login(username="member_cancel", password="testpassword")
        response = self.client.get(self._my_interactions_url())
        self.assertTrue(response.data["admin_cancelled"])
        self.assertFalse(response.data["is_registered"])

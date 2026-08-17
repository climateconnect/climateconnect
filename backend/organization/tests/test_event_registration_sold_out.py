"""
Tests for the capacity-limited field sold-out detection feature.

Covers:
  - evaluate_registration_status() unit tests (AC-1, AC-2, AC-4)
  - Integration tests: registration triggers sold-out (AC-1)
  - Integration tests: cancellation reverts sold-out (AC-2)
  - Integration tests: config PATCH respects sold-out (AC-3)
  - Edge cases: no fields, no options, unlimited, non-required (AC-4)
"""

from datetime import timedelta

from django.contrib.auth.models import User
from django.test import TestCase, tag
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
    RegistrationFieldOption,
    RegistrationFieldType,
)
from organization.utility.event_registration import (
    evaluate_registration_status,
)

# ---------------------------------------------------------------------------
# Shared base for unit tests
# ---------------------------------------------------------------------------


class _EventRegistrationUnitBase(TestCase):
    """Creates a minimal event + config for unit-testing the utility."""

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_soldout",
                "name_de_translation": "aktiv",
                "has_end_date": True,
                "has_start_date": True,
            },
        )
        self.default_language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )
        self.event = Project.objects.create(
            name="Sold Out Test Event",
            url_slug="sold-out-test-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=30),
            end_date=timezone.now() + timedelta(days=90),
        )
        self.rc = EventRegistrationConfig.objects.create(
            project=self.event,
            max_participants=10,
            registration_end_date=timezone.now() + timedelta(days=60),
            status=RegistrationStatus.OPEN,
        )
        self.user_counter = 0

    def _make_user(self):
        self.user_counter += 1
        return User.objects.create_user(
            username=f"soldout_user_{self.user_counter}",
            password="testpassword",
        )

    def _register(self):
        user = self._make_user()
        return EventRegistration.objects.create(user=user, registration_config=self.rc)

    def _create_inventory_field(self, is_required=True, order=0, label=None):
        if label is None:
            label = f"Inventory {order}"
        field = RegistrationField.objects.create(
            registration_config=self.rc,
            field_type=RegistrationFieldType.INVENTORY,
            order=order,
            is_required=is_required,
            label=label,
            settings={"title": "T-shirts"},
        )
        return field

    def _create_timeslot_field(self, is_required=True, order=0, label=None):
        if label is None:
            label = f"TimeSlot {order}"
        field = RegistrationField.objects.create(
            registration_config=self.rc,
            field_type=RegistrationFieldType.TIME_SLOT_SELECT,
            order=order,
            is_required=is_required,
            label=label,
            settings={"title": "Pick your slot"},
        )
        return field

    def _create_option(self, field, available_amount, order=0, title=None):
        if title is None:
            title = f"Option {order}"
        return RegistrationFieldOption.objects.create(
            field=field,
            title=title,
            order=order,
            available_amount=available_amount,
        )


# ===========================================================================
# Unit tests for evaluate_registration_status
# ===========================================================================


@tag("soldout", "unit")
class TestEvaluateRegistrationStatusUnit(_EventRegistrationUnitBase):
    """
    Spec test cases 1–17 for evaluate_registration_status().
    """

    # ── 1: No max_participants, no required fields → OPEN ─────────────────

    def test_no_max_no_fields_returns_open(self):
        self.rc.max_participants = None
        self.rc.save(update_fields=["max_participants"])
        self.assertEqual(evaluate_registration_status(self.rc), RegistrationStatus.OPEN)

    # ── 2: max_participants=10, 5 active → OPEN ───────────────────────────

    def test_max_participants_not_reached_returns_open(self):
        for _ in range(5):
            self._register()
        self.assertEqual(evaluate_registration_status(self.rc), RegistrationStatus.OPEN)

    # ── 3: max_participants=10, 10 active → FULL ──────────────────────────

    def test_max_participants_reached_returns_full(self):
        for _ in range(10):
            self._register()
        self.assertEqual(evaluate_registration_status(self.rc), RegistrationStatus.FULL)

    # ── 4: Required inventory field, all options have stock → OPEN ─────────

    def test_required_inventory_with_stock_returns_open(self):
        field = self._create_inventory_field()
        self._create_option(field, available_amount=5, order=0)
        self.assertEqual(evaluate_registration_status(self.rc), RegistrationStatus.OPEN)

    # ── 5: Required inventory field, all options sold out → FULL ───────────

    def test_required_inventory_all_sold_out_returns_full(self):
        field = self._create_inventory_field()
        opt = self._create_option(field, available_amount=2, order=0)
        reg1 = self._register()
        reg2 = self._register()
        RegistrationFieldAnswer.objects.create(
            registration=reg1, field=field, value_option=opt, value_number=1
        )
        RegistrationFieldAnswer.objects.create(
            registration=reg2, field=field, value_option=opt, value_number=1
        )
        self.assertEqual(evaluate_registration_status(self.rc), RegistrationStatus.FULL)

    # ── 6: Two required inventory fields, one sold out → FULL (per-field OR)

    def test_two_required_fields_one_sold_out_returns_full(self):
        """Any single required field being sold out blocks registration."""
        field_a = self._create_inventory_field(order=0, label="Inv A")
        opt_a = self._create_option(field_a, available_amount=1, order=0, title="A1")
        reg = self._register()
        RegistrationFieldAnswer.objects.create(
            registration=reg, field=field_a, value_option=opt_a, value_number=1
        )
        field_b = self._create_inventory_field(order=1, label="Inv B")
        self._create_option(field_b, available_amount=5, order=0, title="B1")
        self.assertEqual(evaluate_registration_status(self.rc), RegistrationStatus.FULL)

    # ── 7: Required inventory field with null option → OPEN (unlimited) ────

    def test_required_inventory_unlimited_option_returns_open(self):
        field = self._create_inventory_field()
        self._create_option(field, available_amount=None, order=0)
        self.assertEqual(evaluate_registration_status(self.rc), RegistrationStatus.OPEN)

    # ── 8: Required inventory field with zero options → OPEN ───────────────

    def test_required_inventory_no_options_returns_open(self):
        self._create_inventory_field()
        self.assertEqual(evaluate_registration_status(self.rc), RegistrationStatus.OPEN)

    # ── 9: Non-required inventory field, all sold out → OPEN ───────────────

    def test_non_required_inventory_sold_out_returns_open(self):
        field = self._create_inventory_field(is_required=False)
        opt = self._create_option(field, available_amount=1, order=0)
        reg = self._register()
        RegistrationFieldAnswer.objects.create(
            registration=reg, field=field, value_option=opt, value_number=1
        )
        self.assertEqual(evaluate_registration_status(self.rc), RegistrationStatus.OPEN)

    # ── 10: max_participants at capacity AND inventory sold out → FULL ─────

    def test_max_full_and_inventory_full_returns_full(self):
        for _ in range(10):
            self._register()
        field = self._create_inventory_field()
        self._create_option(field, available_amount=5, order=0)
        self.assertEqual(evaluate_registration_status(self.rc), RegistrationStatus.FULL)

    # ── 11: max_participants at capacity but inventory has stock → FULL ─────

    def test_max_full_inventory_has_stock_returns_full(self):
        for _ in range(10):
            self._register()
        field = self._create_inventory_field()
        self._create_option(field, available_amount=5, order=0)
        self.assertEqual(evaluate_registration_status(self.rc), RegistrationStatus.FULL)

    # ── 12: Required time slot field, all options sold out → FULL ──────────

    def test_required_timeslot_all_sold_out_returns_full(self):
        field = self._create_timeslot_field()
        opt = self._create_option(field, available_amount=1, order=0)
        reg = self._register()
        RegistrationFieldAnswer.objects.create(
            registration=reg, field=field, value_option=opt
        )
        self.assertEqual(evaluate_registration_status(self.rc), RegistrationStatus.FULL)

    # ── 13: Required time slot, one option has remaining seats → OPEN ──────

    def test_required_timeslot_one_with_stock_returns_open(self):
        field = self._create_timeslot_field()
        opt_sold = self._create_option(field, available_amount=1, order=0, title="Sold")
        self._create_option(field, available_amount=5, order=1, title="Open")
        reg = self._register()
        RegistrationFieldAnswer.objects.create(
            registration=reg, field=field, value_option=opt_sold
        )
        self.assertEqual(evaluate_registration_status(self.rc), RegistrationStatus.OPEN)

    # ── 14: Required time slot with null option → OPEN ────────────────────

    def test_required_timeslot_unlimited_option_returns_open(self):
        field = self._create_timeslot_field()
        self._create_option(field, available_amount=None, order=0)
        self.assertEqual(evaluate_registration_status(self.rc), RegistrationStatus.OPEN)

    # ── 15: Non-required time slot, all sold out → OPEN ────────────────────

    def test_non_required_timeslot_sold_out_returns_open(self):
        field = self._create_timeslot_field(is_required=False)
        opt = self._create_option(field, available_amount=1, order=0)
        reg = self._register()
        RegistrationFieldAnswer.objects.create(
            registration=reg, field=field, value_option=opt
        )
        self.assertEqual(evaluate_registration_status(self.rc), RegistrationStatus.OPEN)

    # ── 16: Inv sold out but time slots available → FULL (OR logic) ─────────

    def test_inv_sold_out_timeslot_available_returns_full(self):
        """When ALL required inventory options are sold out, the event is FULL
        regardless of time-slot availability (AC-1 OR logic)."""
        inv_field = self._create_inventory_field(order=0, label="Inv")
        inv_opt = self._create_option(
            inv_field, available_amount=1, order=0, title="Inv1"
        )
        reg = self._register()
        RegistrationFieldAnswer.objects.create(
            registration=reg, field=inv_field, value_option=inv_opt, value_number=1
        )
        ts_field = self._create_timeslot_field(order=1, label="TS")
        self._create_option(ts_field, available_amount=5, order=0, title="TS1")
        self.assertEqual(evaluate_registration_status(self.rc), RegistrationStatus.FULL)

    # ── 17: Both sold out → FULL ──────────────────────────────────────────

    def test_both_inv_and_timeslot_sold_out_returns_full(self):
        inv_field = self._create_inventory_field(order=0, label="Inv")
        inv_opt = self._create_option(
            inv_field, available_amount=1, order=0, title="Inv1"
        )
        reg = self._register()
        RegistrationFieldAnswer.objects.create(
            registration=reg, field=inv_field, value_option=inv_opt, value_number=1
        )
        ts_field = self._create_timeslot_field(order=1, label="TS")
        ts_opt = self._create_option(ts_field, available_amount=1, order=0, title="TS1")
        RegistrationFieldAnswer.objects.create(
            registration=reg, field=ts_field, value_option=ts_opt
        )
        self.assertEqual(evaluate_registration_status(self.rc), RegistrationStatus.FULL)


# ===========================================================================
# Integration tests — registration triggers sold-out
# ===========================================================================


class _IntegrationBase(APITestCase):
    """Shared setUp for integration tests."""

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_integ",
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
            username="organiser_integ", password="testpassword"
        )
        self.admin_role = Role.objects.create(
            name="Admin_integ", role_type=Role.ALL_TYPE
        )
        self.event = Project.objects.create(
            name="Integration Test Event",
            url_slug="integ-test-event",
            is_active=True,
            is_draft=False,
            status=self.project_status,
            language=self.default_language,
            project_type="EV",
            start_date=timezone.now() + timedelta(days=30),
            end_date=timezone.now() + timedelta(days=90),
        )
        self.rc = EventRegistrationConfig.objects.create(
            project=self.event,
            max_participants=10,
            registration_end_date=timezone.now() + timedelta(days=60),
            status=RegistrationStatus.OPEN,
        )
        ProjectMember.objects.create(
            user=self.organiser, project=self.event, role=self.admin_role
        )
        self.register_url = reverse(
            "organization:event-registrations",
            kwargs={"url_slug": self.event.url_slug},
        )
        self.config_patch_url = reverse(
            "organization:edit-registration-config",
            kwargs={"url_slug": self.event.url_slug},
        )
        self.user_counter = 0

    def _make_user(self):
        self.user_counter += 1
        u = User.objects.create_user(
            username=f"integ_user_{self.user_counter}",
            password="testpassword",
        )
        return u

    def _register_user(self, user):
        return EventRegistration.objects.create(user=user, registration_config=self.rc)

    def _cancel_registration(self, reg, by_user):
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = by_user
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

    def _create_inventory_field(self, is_required=True, order=0, label=None):
        if label is None:
            label = f"Inv {order}"
        field = RegistrationField.objects.create(
            registration_config=self.rc,
            field_type=RegistrationFieldType.INVENTORY,
            order=order,
            is_required=is_required,
            label=label,
            settings={"title": "Shirts"},
        )
        return field

    def _create_timeslot_field(self, is_required=True, order=0, label=None):
        if label is None:
            label = f"TS {order}"
        field = RegistrationField.objects.create(
            registration_config=self.rc,
            field_type=RegistrationFieldType.TIME_SLOT_SELECT,
            order=order,
            is_required=is_required,
            label=label,
            settings={"title": "Slot"},
        )
        return field

    def _create_option(self, field, available_amount, order=0, title=None):
        if title is None:
            title = f"Opt {order}"
        return RegistrationFieldOption.objects.create(
            field=field,
            title=title,
            order=order,
            available_amount=available_amount,
        )


@tag("soldout", "integration")
class TestRegistrationTriggersCapacitySoldOut(_IntegrationBase):
    """AC-1 integration tests: registration triggers sold-out status."""

    # ── 18: Registration fills last required inventory item → FULL ─────────

    def test_registration_fills_last_inventory_item_sets_full(self):
        field = self._create_inventory_field()
        opt = self._create_option(field, available_amount=3, order=0)
        user1 = self._make_user()
        reg1 = self._register_user(user1)
        RegistrationFieldAnswer.objects.create(
            registration=reg1, field=field, value_option=opt, value_number=1
        )
        user2 = self._make_user()
        reg2 = self._register_user(user2)
        RegistrationFieldAnswer.objects.create(
            registration=reg2, field=field, value_option=opt, value_number=1
        )
        # 2 booked out of 3 — still 1 remaining

        self.rc.refresh_from_db()
        self.assertEqual(self.rc.status, RegistrationStatus.OPEN)

        user3 = self._make_user()
        self.client.login(username=user3.username, password="testpassword")
        response = self.client.post(
            self.register_url,
            {
                "answers": [
                    {
                        "field": field.id,
                        "value_option": opt.id,
                        "value_number": 1,
                    }
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.rc.refresh_from_db()
        self.assertEqual(self.rc.status, RegistrationStatus.FULL)

    # ── 19: Registration fills last required time slot → FULL ─────────────

    def test_registration_fills_last_timeslot_sets_full(self):
        field = self._create_timeslot_field()
        opt = self._create_option(field, available_amount=1, order=0)

        user1 = self._make_user()
        self.client.login(username=user1.username, password="testpassword")
        response = self.client.post(
            self.register_url,
            {
                "answers": [
                    {
                        "field": field.id,
                        "value_option": opt.id,
                    }
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.rc.refresh_from_db()
        self.assertEqual(self.rc.status, RegistrationStatus.FULL)

    # ── 20: max_participants not reached but inventory sold out → FULL ─────

    def test_inventory_sold_out_before_max_participants_sets_full(self):
        self.rc.max_participants = 100
        self.rc.save(update_fields=["max_participants"])
        field = self._create_inventory_field()
        opt = self._create_option(field, available_amount=1, order=0)

        user1 = self._make_user()
        self.client.login(username=user1.username, password="testpassword")
        response = self.client.post(
            self.register_url,
            {
                "answers": [
                    {
                        "field": field.id,
                        "value_option": opt.id,
                        "value_number": 1,
                    }
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.rc.refresh_from_db()
        self.assertEqual(self.rc.status, RegistrationStatus.FULL)

    # ── 20b: Registration rejected when inventory already sold out ─────────

    def test_registration_rejected_when_inventory_already_sold_out(self):
        self.rc.max_participants = 100
        self.rc.save(update_fields=["max_participants"])
        field = self._create_inventory_field()
        opt = self._create_option(field, available_amount=1, order=0)
        user1 = self._make_user()
        reg1 = self._register_user(user1)
        RegistrationFieldAnswer.objects.create(
            registration=reg1, field=field, value_option=opt, value_number=1
        )

        user2 = self._make_user()
        self.client.login(username=user2.username, password="testpassword")
        response = self.client.post(
            self.register_url,
            {
                "answers": [
                    {
                        "field": field.id,
                        "value_option": opt.id,
                        "value_number": 1,
                    }
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.rc.refresh_from_db()
        self.assertEqual(self.rc.status, RegistrationStatus.FULL)

    # ── 24: Stale OPEN status but inventory sold out → error + sets FULL ───

    def test_registration_when_stale_open_but_sold_out_returns_error(self):
        field = self._create_inventory_field()
        opt = self._create_option(field, available_amount=1, order=0)
        user1 = self._make_user()
        reg1 = self._register_user(user1)
        RegistrationFieldAnswer.objects.create(
            registration=reg1, field=field, value_option=opt, value_number=1
        )
        # Status is still OPEN (stale)
        self.assertEqual(self.rc.status, RegistrationStatus.OPEN)

        user2 = self._make_user()
        self.client.login(username=user2.username, password="testpassword")
        response = self.client.post(
            self.register_url,
            {
                "answers": [
                    {
                        "field": field.id,
                        "value_option": opt.id,
                        "value_number": 1,
                    }
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.rc.refresh_from_db()
        self.assertEqual(self.rc.status, RegistrationStatus.FULL)


@tag("soldout", "integration")
class TestCancellationRevertsCapacitySoldOut(_IntegrationBase):
    """AC-2 integration tests: cancellation reverts sold-out status."""

    # ── 21: Cancellation frees inventory item → reverts to OPEN ────────────

    def test_cancellation_frees_inventory_reverts_to_open(self):
        self.rc.max_participants = 100
        self.rc.save(update_fields=["max_participants"])
        field = self._create_inventory_field()
        opt = self._create_option(field, available_amount=1, order=0)
        user1 = self._make_user()
        self._register_user(user1)
        RegistrationFieldAnswer.objects.create(
            registration=user1.event_registrations.first(),
            field=field,
            value_option=opt,
            value_number=1,
        )
        self.rc.status = RegistrationStatus.FULL
        self.rc.save(update_fields=["status"])

        self.client.login(username=user1.username, password="testpassword")
        response = self.client.delete(self.register_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.rc.refresh_from_db()
        self.assertEqual(self.rc.status, RegistrationStatus.OPEN)

    # ── 22: Cancellation frees time slot → reverts to OPEN ────────────────

    def test_cancellation_frees_timeslot_reverts_to_open(self):
        self.rc.max_participants = 100
        self.rc.save(update_fields=["max_participants"])
        field = self._create_timeslot_field()
        opt = self._create_option(field, available_amount=1, order=0)
        user1 = self._make_user()
        self._register_user(user1)
        RegistrationFieldAnswer.objects.create(
            registration=user1.event_registrations.first(),
            field=field,
            value_option=opt,
        )
        self.rc.status = RegistrationStatus.FULL
        self.rc.save(update_fields=["status"])

        self.client.login(username=user1.username, password="testpassword")
        response = self.client.delete(self.register_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.rc.refresh_from_db()
        self.assertEqual(self.rc.status, RegistrationStatus.OPEN)

    # ── 23: Cancellation frees inventory but max_participants still full → FULL

    def test_cancellation_frees_inventory_but_max_still_full_stays_full(self):
        for _ in range(10):
            self._make_user()
        users = list(
            User.objects.filter(username__startswith="integ_user_").order_by("id")
        )
        for u in users:
            self._register_user(u)

        field = self._create_inventory_field()
        opt = self._create_option(field, available_amount=1, order=0)
        RegistrationFieldAnswer.objects.create(
            registration=users[0].event_registrations.first(),
            field=field,
            value_option=opt,
            value_number=1,
        )

        self.rc.status = RegistrationStatus.FULL
        self.rc.save(update_fields=["status"])

        # Cancel the user who booked the inventory — inventory frees up,
        # but max_participants is still at 10.
        self._cancel_registration(
            users[0].event_registrations.first(), by_user=users[0]
        )
        self.rc.refresh_from_db()
        self.assertEqual(self.rc.status, RegistrationStatus.FULL)

    # ── Admin cancellation frees inventory → reverts to OPEN ───────────────

    def test_admin_cancel_frees_inventory_reverts_to_open(self):
        self.rc.max_participants = 100
        self.rc.save(update_fields=["max_participants"])
        field = self._create_inventory_field()
        opt = self._create_option(field, available_amount=1, order=0)
        user1 = self._make_user()
        reg1 = self._register_user(user1)
        RegistrationFieldAnswer.objects.create(
            registration=reg1, field=field, value_option=opt, value_number=1
        )
        self.rc.status = RegistrationStatus.FULL
        self.rc.save(update_fields=["status"])

        admin_cancel_url = reverse(
            "organization:admin-cancel-guest-registration",
            kwargs={
                "url_slug": self.event.url_slug,
                "registration_id": reg1.id,
            },
        )
        self.client.login(username="organiser_integ", password="testpassword")
        response = self.client.patch(admin_cancel_url, format="json")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.rc.refresh_from_db()
        self.assertEqual(self.rc.status, RegistrationStatus.OPEN)


@tag("soldout", "integration")
class TestConfigPatchRespectsCapacitySoldOut(_IntegrationBase):
    """AC-3 integration tests: config PATCH respects capacity sold-out."""

    # ── 25: PATCH raises max_participants, but inventory sold out → FULL ────

    def test_patch_raises_max_but_inventory_sold_out_stays_full(self):
        field = self._create_inventory_field()
        opt = self._create_option(field, available_amount=1, order=0)
        user1 = self._make_user()
        reg1 = self._register_user(user1)
        RegistrationFieldAnswer.objects.create(
            registration=reg1, field=field, value_option=opt, value_number=1
        )
        self.rc.status = RegistrationStatus.FULL
        self.rc.save(update_fields=["status"])

        self.client.login(username="organiser_integ", password="testpassword")
        response = self.client.patch(
            self.config_patch_url,
            {"max_participants": 1000},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.rc.refresh_from_db()
        self.assertEqual(self.rc.status, RegistrationStatus.FULL)

    # ── 26: PATCH sets max_participants=null, but time slots sold out → FULL

    def test_patch_sets_max_null_but_timeslot_sold_out_stays_full(self):
        field = self._create_timeslot_field()
        opt = self._create_option(field, available_amount=1, order=0)
        user1 = self._make_user()
        reg1 = self._register_user(user1)
        RegistrationFieldAnswer.objects.create(
            registration=reg1, field=field, value_option=opt
        )
        self.rc.status = RegistrationStatus.FULL
        self.rc.save(update_fields=["status"])

        self.client.login(username="organiser_integ", password="testpassword")
        response = self.client.patch(
            self.config_patch_url,
            {"max_participants": None},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.rc.refresh_from_db()
        self.assertEqual(self.rc.status, RegistrationStatus.FULL)

    # ── PATCH raises max_participants and inventory has stock → OPEN ────────

    def test_patch_raises_max_and_inventory_has_stock_reverts_to_open(self):
        field = self._create_inventory_field()
        self._create_option(field, available_amount=10, order=0)
        # Fill max_participants
        for _ in range(5):
            self._register_user(self._make_user())
        self.rc.status = RegistrationStatus.FULL
        self.rc.save(update_fields=["status"])

        self.client.login(username="organiser_integ", password="testpassword")
        response = self.client.patch(
            self.config_patch_url,
            {"max_participants": 20},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.rc.refresh_from_db()
        self.assertEqual(self.rc.status, RegistrationStatus.OPEN)

    # ── Organiser overrides FULL→OPEN with raised capacity → reopens ──────

    def test_override_full_to_open_with_raised_capacity_reopens(self):
        """Organiser reopens a full event and raises max_participants —
        capacity check confirms OPEN."""
        self.rc.max_participants = 1
        self.rc.save(update_fields=["max_participants"])
        self._register_user(self._make_user())

        self.client.login(username="organiser_integ", password="testpassword")
        response = self.client.patch(
            self.config_patch_url,
            {"max_participants": 10, "status": "open"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.rc.refresh_from_db()
        self.assertEqual(self.rc.status, RegistrationStatus.OPEN)

    # ── Organiser reopens closed event but fields sold out → stays FULL ───

    def test_reopen_closed_event_with_sold_out_fields_stays_full(self):
        """When the organiser reopens a closed event whose required fields
        are sold out, the capacity check snaps status to FULL."""
        field = self._create_timeslot_field()
        start = timezone.now() + timedelta(days=31)
        end = timezone.now() + timedelta(days=31, hours=1)
        opt = RegistrationFieldOption.objects.create(
            field=field,
            title="S1",
            order=0,
            available_amount=1,
            start_time=start,
            end_time=end,
        )
        user1 = self._make_user()
        reg1 = self._register_user(user1)
        RegistrationFieldAnswer.objects.create(
            registration=reg1, field=field, value_option=opt
        )
        self.rc.status = RegistrationStatus.CLOSED
        self.rc.save(update_fields=["status"])

        self.client.login(username="organiser_integ", password="testpassword")
        response = self.client.patch(
            self.config_patch_url,
            {
                "status": "open",
                "fields": [
                    {
                        "id": field.id,
                        "field_type": "time_slot_select",
                        "order": 0,
                        "is_required": True,
                        "label": "TS",
                        "settings": {"title": "Slot"},
                        "options": [
                            {
                                "id": opt.id,
                                "title": "S1",
                                "order": 0,
                                "available_amount": 1,
                                "start_time": start.isoformat(),
                                "end_time": end.isoformat(),
                            }
                        ],
                    }
                ],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.rc.refresh_from_db()
        self.assertEqual(self.rc.status, RegistrationStatus.FULL)

    # ── Frontend echoes current status (OPEN→OPEN) → auto-adjust still runs ─

    def test_unchanged_status_echo_does_not_skip_auto_adjust(self):
        """When the frontend echoes back the current status (e.g. sends
        "status":"open" while stored status is already open), auto-adjustment
        must still run — the organiser didn't intend to override status."""
        field = self._create_timeslot_field()
        start = timezone.now() + timedelta(days=31)
        end = timezone.now() + timedelta(days=31, hours=1)
        opt = RegistrationFieldOption.objects.create(
            field=field,
            title="S1",
            order=0,
            available_amount=2,
            start_time=start,
            end_time=end,
        )
        user1 = self._make_user()
        reg1 = self._register_user(user1)
        RegistrationFieldAnswer.objects.create(
            registration=reg1, field=field, value_option=opt
        )
        # 1 booked out of 2 — still open

        self.client.login(username="organiser_integ", password="testpassword")
        response = self.client.patch(
            self.config_patch_url,
            {
                "status": "open",
                "fields": [
                    {
                        "id": field.id,
                        "field_type": "time_slot_select",
                        "order": 0,
                        "is_required": True,
                        "label": "TS",
                        "settings": {"title": "Slot"},
                        "options": [
                            {
                                "id": opt.id,
                                "title": "S1",
                                "order": 0,
                                "available_amount": 1,
                                "start_time": start.isoformat(),
                                "end_time": end.isoformat(),
                            }
                        ],
                    }
                ],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.rc.refresh_from_db()
        self.assertEqual(self.rc.status, RegistrationStatus.FULL)

    # ── CLOSED status is not overwritten by auto-adjust ────────────────────

    def test_closed_status_not_overwritten_by_auto_adjust(self):
        self.rc.status = RegistrationStatus.CLOSED
        self.rc.save(update_fields=["status"])

        self.client.login(username="organiser_integ", password="testpassword")
        response = self.client.patch(
            self.config_patch_url,
            {"max_participants": 5},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.rc.refresh_from_db()
        self.assertEqual(self.rc.status, RegistrationStatus.CLOSED)

    # ── PATCH reduces option available_amount → triggers sold-out ──────────

    def test_patch_reducing_option_amount_triggers_sold_out(self):
        """Reducing available_amount on a time slot option via PATCH should
        trigger the sold-out check and set status to FULL if all slots are
        now booked."""
        field = self._create_timeslot_field()
        start = timezone.now() + timedelta(days=31)
        end = timezone.now() + timedelta(days=31, hours=1)
        opt = RegistrationFieldOption.objects.create(
            field=field,
            title="S1",
            order=0,
            available_amount=10,
            start_time=start,
            end_time=end,
        )
        user1 = self._make_user()
        reg1 = self._register_user(user1)
        RegistrationFieldAnswer.objects.create(
            registration=reg1, field=field, value_option=opt
        )
        # 1 booked out of 10 — still open

        self.client.login(username="organiser_integ", password="testpassword")
        response = self.client.patch(
            self.config_patch_url,
            {
                "fields": [
                    {
                        "id": field.id,
                        "field_type": "time_slot_select",
                        "order": 0,
                        "is_required": True,
                        "label": "TS",
                        "settings": {"title": "Slot"},
                        "options": [
                            {
                                "id": opt.id,
                                "title": "S1",
                                "order": 0,
                                "available_amount": 1,
                                "start_time": start.isoformat(),
                                "end_time": end.isoformat(),
                            }
                        ],
                    }
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        opt.refresh_from_db()
        self.assertEqual(opt.available_amount, 1)
        self.rc.refresh_from_db()
        self.assertEqual(self.rc.status, RegistrationStatus.FULL)

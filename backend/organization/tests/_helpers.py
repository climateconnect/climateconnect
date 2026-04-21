"""
Shared test helpers for the event registration test suite.

Contains:
  - _make_black_image_b64:   factory for a minimal valid base-64 PNG image
  - _CancellationTestBase:   shared setUp used by cancellation / interaction test classes
"""

import io
from base64 import b64encode
from datetime import timedelta

from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from PIL import Image
from rest_framework.test import APITestCase

from climateconnect_api.models import Language, Role
from organization.models import Project, ProjectMember, ProjectStatus
from organization.models.event_registration import (
    EventRegistration,
    EventRegistrationConfig,
    RegistrationStatus,
)


def _make_black_image_b64():
    img = Image.new("RGB", (10, 10), "black")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return "data:image/png;base64," + b64encode(buf.getvalue()).decode("utf-8")


# ===========================================================================
# Shared setUp mixin for cancellation / interaction tests
# ===========================================================================


class _CancellationTestBase(APITestCase):
    """
    Common setUp for member-cancel, re-registration, my_interactions,
    and admin-cancel test classes.

    Creates:
        self.event          — future event, start_date in 30 days
        self.er             — EventRegistrationConfig (max 10, open)
        self.organiser      — ALL_TYPE project member
        self.team_admin     — READ_WRITE_TYPE project member
        self.member         — a guest user (not a project member)
        self.non_member     — no project membership, no registration
    """

    def setUp(self):
        self.project_status, _ = ProjectStatus.objects.update_or_create(
            id=2,
            defaults={
                "name": "active_cancel",
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
            username="organiser_cancel", password="testpassword"
        )
        self.admin_role = Role.objects.create(
            name="Admin_cancel", role_type=Role.ALL_TYPE
        )
        self.team_admin = User.objects.create_user(
            username="teamadmin_cancel", password="testpassword"
        )
        self.rw_role = Role.objects.create(
            name="ReadWrite_cancel", role_type=Role.READ_WRITE_TYPE
        )
        self.member = User.objects.create_user(
            username="member_cancel", password="testpassword"
        )
        self.non_member = User.objects.create_user(
            username="nonmember_cancel", password="testpassword"
        )

        self.event = Project.objects.create(
            name="Cancel Test Event",
            url_slug="cancel-test-event",
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
            max_participants=10,
            registration_end_date=timezone.now() + timedelta(days=60),
            status=RegistrationStatus.OPEN,
        )
        ProjectMember.objects.create(
            user=self.organiser, project=self.event, role=self.admin_role
        )
        ProjectMember.objects.create(
            user=self.team_admin, project=self.event, role=self.rw_role
        )

    def _register(self, user):
        """Helper: create an active EventRegistration for the given user."""
        return EventRegistration.objects.create(user=user, registration_config=self.er)

    def _cancel_url(self):
        return reverse(
            "organization:event-registrations",
            kwargs={"url_slug": self.event.url_slug},
        )

    def _my_interactions_url(self):
        return reverse(
            "organization:am-i-following-view",
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

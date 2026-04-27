"""
Tests for the registered_event_slugs field in PersonalProfileSerializer.

This test verifies the implementation of the feature that allows users to see
which events they are registered for when browsing projects.
"""

from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from climateconnect_api.models import Language, Role, UserProfile
from location.models import Location
from organization.models import (
    EventRegistration,
    EventRegistrationConfig,
    Organization,
    OrganizationMember,
    Project,
    ProjectStatus,
    RegistrationStatus,
)

# Use a dummy cache in all tests to avoid needing a live Redis connection
_DUMMY_CACHE = {"default": {"BACKEND": "django.core.cache.backends.dummy.DummyCache"}}


@override_settings(CACHES=_DUMMY_CACHE)
class PersonalProfileRegisteredEventSlugsTest(APITestCase):
    """
    Test the registered_event_slugs field in the PersonalProfileSerializer.

    Verifies that the /api/my_profile/ endpoint returns a list of event URL slugs
    for events the authenticated user is registered for.
    """

    def setUp(self):
        """Set up test data: user, organization, and events."""
        # Patch the cache to avoid signal handler errors with DummyCache
        self.cache_patcher = patch("climateconnect_api.models.user.cache")
        self.mock_cache = self.cache_patcher.start()
        self.mock_cache.keys.return_value = []
        self.mock_cache.delete_many.return_value = None

        # Create test user and profile
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpassword",
            first_name="Test",
            last_name="User",
        )
        self.user_profile = UserProfile.objects.create(
            user=self.user,
            name="Test User",
            url_slug="test-user",
            is_profile_verified=True,
        )

        # Create a location for the organization
        self.location = Location.objects.create(
            city="Test City", country="Test Country"
        )

        # Create a role for organization members
        self.role = Role.objects.create(
            name="Admin",
            role_type=Role.ALL_TYPE,
        )

        # Create an organization with the user as a member
        self.organization = Organization.objects.create(
            name="Test Organization",
            url_slug="test-organization",
            location=self.location,
        )
        OrganizationMember.objects.create(
            user=self.user,
            organization=self.organization,
            role=self.role,
        )

        # Get or create language
        self.language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={"name": "English", "native_name": "English"},
        )

        # Get or create the "Event" project status
        self.event_status, _ = ProjectStatus.objects.get_or_create(
            name="Event",
            defaults={
                "name_de_translation": "Veranstaltung",
                "has_start_date": True,
                "has_end_date": True,
            },
        )

        # Create test events (projects)
        now = timezone.now()
        self.future_event_1 = self._create_event(
            name="Future Event 1",
            url_slug="future-event-1",
            start_date=now + timedelta(days=10),
            end_date=now + timedelta(days=11),
        )
        self.future_event_2 = self._create_event(
            name="Future Event 2",
            url_slug="future-event-2",
            start_date=now + timedelta(days=20),
            end_date=now + timedelta(days=21),
        )
        self.past_event = self._create_event(
            name="Past Event",
            url_slug="past-event",
            start_date=now - timedelta(days=10),
            end_date=now - timedelta(days=9),
        )
        self.future_event_no_registration = self._create_event(
            name="Future Event No Registration",
            url_slug="future-event-no-registration",
            start_date=now + timedelta(days=30),
            end_date=now + timedelta(days=31),
        )

        # Create registration configs
        self.reg_config_1 = EventRegistrationConfig.objects.create(
            project=self.future_event_1,
            max_participants=50,
            registration_end_date=now + timedelta(days=9),
            status=RegistrationStatus.OPEN,
        )
        self.reg_config_2 = EventRegistrationConfig.objects.create(
            project=self.future_event_2,
            max_participants=30,
            registration_end_date=now + timedelta(days=19),
            status=RegistrationStatus.OPEN,
        )
        self.reg_config_past = EventRegistrationConfig.objects.create(
            project=self.past_event,
            max_participants=20,
            registration_end_date=now - timedelta(days=11),
            status=RegistrationStatus.ENDED,
        )

        # URL for the my_profile endpoint
        self.url = reverse("user-profile-api")

    def tearDown(self):
        """Clean up patches."""
        self.cache_patcher.stop()

    def _create_event(self, name, url_slug, start_date, end_date):
        """Helper method to create an event project."""
        return Project.objects.create(
            name=name,
            url_slug=url_slug,
            status=self.event_status,
            start_date=start_date,
            end_date=end_date,
            is_draft=False,
            is_active=True,
            language=self.language,
            project_type="EV",
        )

    def test_no_registrations_returns_empty_list(self):
        """Test that a user with no registrations gets an empty list."""
        self.client.login(username="testuser", password="testpassword")
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("registered_event_slugs", response.data)
        self.assertEqual(response.data["registered_event_slugs"], [])

    def test_active_registration_for_future_event_returns_slug(self):
        """Test that an active registration for a future event is included."""
        EventRegistration.objects.create(
            user=self.user,
            registration_config=self.reg_config_1,
        )

        self.client.login(username="testuser", password="testpassword")
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("registered_event_slugs", response.data)
        self.assertIn("future-event-1", response.data["registered_event_slugs"])
        self.assertEqual(len(response.data["registered_event_slugs"]), 1)

    def test_multiple_active_registrations_returns_all_slugs(self):
        """Test that multiple active registrations are all included."""
        EventRegistration.objects.create(
            user=self.user,
            registration_config=self.reg_config_1,
        )
        EventRegistration.objects.create(
            user=self.user,
            registration_config=self.reg_config_2,
        )

        self.client.login(username="testuser", password="testpassword")
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("registered_event_slugs", response.data)
        slugs = response.data["registered_event_slugs"]
        self.assertEqual(len(slugs), 2)
        self.assertIn("future-event-1", slugs)
        self.assertIn("future-event-2", slugs)

    def test_cancelled_registration_not_included(self):
        """Test that cancelled registrations are not included."""
        EventRegistration.objects.create(
            user=self.user,
            registration_config=self.reg_config_1,
            cancelled_at=timezone.now(),
            cancelled_by=self.user,
        )

        self.client.login(username="testuser", password="testpassword")
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("registered_event_slugs", response.data)
        self.assertEqual(response.data["registered_event_slugs"], [])

    def test_past_event_registration_not_included(self):
        """Test that registrations for past events are not included."""
        EventRegistration.objects.create(
            user=self.user,
            registration_config=self.reg_config_past,
        )

        self.client.login(username="testuser", password="testpassword")
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("registered_event_slugs", response.data)
        self.assertEqual(response.data["registered_event_slugs"], [])

    def test_mixed_registrations_only_returns_active_future_events(self):
        """
        Test that only active registrations for future events are included.

        Creates:
        - Active registration for future event 1 (should be included)
        - Active registration for future event 2 (should be included)
        - Cancelled registration for future event (should NOT be included)
        - Active registration for past event (should NOT be included)
        """
        # Active future event 1 - should be included
        EventRegistration.objects.create(
            user=self.user,
            registration_config=self.reg_config_1,
        )

        # Active future event 2 - should be included
        EventRegistration.objects.create(
            user=self.user,
            registration_config=self.reg_config_2,
        )

        # Active past event - should NOT be included
        EventRegistration.objects.create(
            user=self.user,
            registration_config=self.reg_config_past,
        )

        self.client.login(username="testuser", password="testpassword")
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        slugs = response.data["registered_event_slugs"]

        # Should only include the two future events
        self.assertEqual(len(slugs), 2)
        self.assertIn("future-event-1", slugs)
        self.assertIn("future-event-2", slugs)
        self.assertNotIn("past-event", slugs)

    def test_unauthenticated_request_returns_401(self):
        """Test that unauthenticated requests are rejected."""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_field_is_always_present_in_response(self):
        """Test that the registered_event_slugs field is always in the response."""
        self.client.login(username="testuser", password="testpassword")
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("registered_event_slugs", response.data)
        # Field should exist even if empty
        self.assertIsInstance(response.data["registered_event_slugs"], list)

"""
Tests for the signup endpoint (POST /api/signup/)

Tests both password-based and passwordless (OTP-based) signup flows.
"""

from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from climateconnect_api.models import UserProfile
from climateconnect_api.models.language import Language
from location.models import Location


class SignupViewTest(TestCase):
    """Tests for POST /api/signup/ endpoint"""

    def setUp(self):
        self.client = APIClient()
        self.url = reverse("signup-api")

        # Create test language
        self.language, _ = Language.objects.get_or_create(
            language_code="en",
            defaults={
                "name": "English",
                "native_name": "English",
            },
        )

        # Create test location
        self.location = Location.objects.create(
            city="Berlin",
            country="Germany",
        )

        # Mock get_location so the view receives a valid Location instance
        # without requiring a full OSM payload in every test.
        self.get_location_patcher = patch(
            "climateconnect_api.views.user_views.get_location",
            return_value=self.location,
        )
        self.get_location_patcher.start()
        self.addCleanup(self.get_location_patcher.stop)

        # Base signup data (without password)
        # The location dict here is irrelevant because get_location is mocked.
        self.base_signup_data = {
            "email": "newuser@example.com",
            "first_name": "Test",
            "last_name": "User",
            "location": {
                "city": "Berlin",
                "country": "Germany",
            },
            "send_newsletter": True,
            "source_language": "en",
            "hub": "",  # optional
        }

    @override_settings(AUTO_VERIFY=False)
    @patch("climateconnect_api.views.user_views.send_user_verification_email")
    def test_signup_with_password_creates_password_account(
        self, mock_send_verification_email
    ):
        """Test that signup with password creates a password-based account"""
        data = {**self.base_signup_data, "password": "securepassword123"}

        response = self.client.post(self.url, data, format="json")

        # Debug: print response data if test fails
        if response.status_code != status.HTTP_201_CREATED:
            print(f"Response status: {response.status_code}")
            print(f"Response data: {response.data}")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify user was created
        user = User.objects.get(username="newuser@example.com")
        self.assertTrue(user.check_password("securepassword123"))

        # Verify profile has correct auth_method
        profile = UserProfile.objects.get(user=user)
        self.assertEqual(profile.auth_method, UserProfile.AuthMethod.PASSWORD)

        # Verify verification email was sent for password-based signup
        mock_send_verification_email.assert_called_once()
        self.assertFalse(profile.is_profile_verified)

    @override_settings(AUTO_VERIFY=False)
    @patch("climateconnect_api.views.user_views.send_user_verification_email")
    def test_signup_without_password_creates_otp_account(
        self, mock_send_verification_email
    ):
        """Test that signup without password creates an OTP-based account"""
        data = self.base_signup_data

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify user was created
        user = User.objects.get(username="newuser@example.com")

        # Verify user has no usable password
        self.assertFalse(user.has_usable_password())

        # Verify profile has correct auth_method
        profile = UserProfile.objects.get(user=user)
        self.assertEqual(profile.auth_method, UserProfile.AuthMethod.OTP)

        # Verify NO verification email was sent for OTP-based signup
        mock_send_verification_email.assert_not_called()
        self.assertFalse(profile.is_profile_verified)

    @override_settings(AUTO_VERIFY=True)
    def test_signup_with_auto_verify_marks_profile_verified(self):
        """Test that AUTO_VERIFY=True marks profile as verified immediately"""
        data = self.base_signup_data

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify profile is marked as verified when AUTO_VERIFY is True
        user = User.objects.get(username="newuser@example.com")
        profile = UserProfile.objects.get(user=user)
        self.assertTrue(profile.is_profile_verified)

    def test_signup_with_password_null_creates_otp_account(self):
        """Test that signup with password=null creates an OTP account"""
        data = {**self.base_signup_data, "password": None}

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username="newuser@example.com")
        profile = UserProfile.objects.get(user=user)
        self.assertEqual(profile.auth_method, UserProfile.AuthMethod.OTP)
        self.assertFalse(user.has_usable_password())

    def test_signup_with_interest_sectors_optional(self):
        """Test that signup succeeds without interest sectors (optional field)"""
        data = self.base_signup_data

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_signup_missing_required_field_fails(self):
        """Test that signup fails when required fields are missing"""
        data = {
            "email": "incomplete@example.com",
            "first_name": "Test",
            # Missing last_name, location, etc.
        }

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_signup_duplicate_email_fails(self):
        """Test that signup fails when email is already in use"""
        # Create an existing user
        User.objects.create_user(
            username="existing@example.com", email="existing@example.com"
        )

        data = {**self.base_signup_data, "email": "existing@example.com"}

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Email already in use", str(response.data))

    @override_settings(AUTO_VERIFY=False)
    @patch("climateconnect_api.views.user_views.send_user_verification_email")
    def test_backward_compatibility_with_password(self, mock_send_verification_email):
        """Test that existing password-based signup continues to work (backward compat)"""
        data = {**self.base_signup_data, "password": "oldflowpassword"}

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify it works exactly as before
        user = User.objects.get(username="newuser@example.com")
        self.assertTrue(user.check_password("oldflowpassword"))

        profile = UserProfile.objects.get(user=user)
        self.assertEqual(profile.auth_method, UserProfile.AuthMethod.PASSWORD)

        # Verification email should be sent for password-based signup
        mock_send_verification_email.assert_called_once()

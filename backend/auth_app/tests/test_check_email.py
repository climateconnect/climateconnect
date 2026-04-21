from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase, override_settings
from django.urls import reverse

from climateconnect_api.models import UserProfile

URL = reverse("auth-check-email")


def _make_user(email, auth_method="password"):
    user = User.objects.create_user(username=email, email=email, password="testpass123")
    UserProfile.objects.create(user=user, auth_method=auth_method)
    return user


@override_settings(RATELIMIT_ENABLE=False)
class CheckEmailViewTest(TestCase):
    def test_new_email_returns_new(self):
        response = self.client.post(
            URL, {"email": "new@example.com"}, content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["user_status"], "new")

    def test_existing_user_password_returns_returning_password(self):
        _make_user("password@example.com", auth_method="password")
        response = self.client.post(
            URL, {"email": "password@example.com"}, content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["user_status"], "returning_password")

    def test_existing_user_otp_returns_returning_otp(self):
        _make_user("otp@example.com", auth_method="otp")
        response = self.client.post(
            URL, {"email": "otp@example.com"}, content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["user_status"], "returning_otp")

    def test_missing_email_returns_400(self):
        response = self.client.post(URL, {}, content_type="application/json")
        self.assertEqual(response.status_code, 400)

    def test_malformed_email_returns_400(self):
        response = self.client.post(
            URL, {"email": "notanemail"}, content_type="application/json"
        )
        self.assertEqual(response.status_code, 400)

    def test_case_sensitive_lookup_treats_different_case_as_new(self):
        _make_user("casesensitive@example.com", auth_method="password")
        response = self.client.post(
            URL, {"email": "CASESENSITIVE@example.com"}, content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["user_status"], "new")

    def test_ratelimit_returns_429(self):
        with patch("auth_app.views.is_ratelimited", return_value=True):
            response = self.client.post(
                URL, {"email": "test@example.com"}, content_type="application/json"
            )
        self.assertEqual(response.status_code, 429)
        self.assertEqual(response.headers.get("Retry-After"), "3600")

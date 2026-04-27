from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from rest_framework import status

from climateconnect_api.models import UserProfile

URL = reverse("user-account-settings-api")


def _make_user(email, auth_method="password", password="testpass123"):
    user = User.objects.create_user(username=email, email=email, password=password)
    if password == "":
        user.set_unusable_password()
        user.save()
    UserProfile.objects.create(user=user, auth_method=auth_method)
    return user


class UserAccountSettingsGetTest(TestCase):
    def test_get_includes_auth_method_password(self):
        user = _make_user("password@example.com", auth_method="password")
        self.client.force_login(user)
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["auth_method"], "password")

    def test_get_includes_auth_method_otp(self):
        user = _make_user("otp@example.com", auth_method="otp")
        self.client.force_login(user)
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["auth_method"], "otp")

    def test_get_has_password_true_when_user_has_password(self):
        user = _make_user("haspass@example.com", password="testpass123")
        self.client.force_login(user)
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()["has_password"])

    def test_get_has_password_false_when_user_has_no_password(self):
        user = _make_user("nopass@example.com", password="")
        self.client.force_login(user)
        response = self.client.get(URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.json()["has_password"])


class UserAccountSettingsPostTest(TestCase):
    def test_post_updates_auth_method_to_otp(self):
        user = _make_user("update@example.com", auth_method="password")
        self.client.force_login(user)
        response = self.client.post(
            URL, {"auth_method": "otp"}, content_type="application/json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.user_profile.refresh_from_db()
        self.assertEqual(user.user_profile.auth_method, "otp")

    def test_post_updates_auth_method_to_password_when_user_has_password(self):
        user = _make_user("update@example.com", auth_method="otp")
        self.client.force_login(user)
        response = self.client.post(
            URL, {"auth_method": "password"}, content_type="application/json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.user_profile.refresh_from_db()
        self.assertEqual(user.user_profile.auth_method, "password")

    def test_post_rejects_password_auth_method_when_no_password(self):
        user = _make_user("nopass@example.com", auth_method="otp", password="")
        self.client.force_login(user)
        response = self.client.post(
            URL, {"auth_method": "password"}, content_type="application/json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("no password is set", response.json()["message"])
        user.user_profile.refresh_from_db()
        self.assertEqual(user.user_profile.auth_method, "otp")

    def test_post_rejects_invalid_auth_method(self):
        user = _make_user("invalid@example.com")
        self.client.force_login(user)
        response = self.client.post(
            URL, {"auth_method": "magic"}, content_type="application/json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("auth_method must be either", response.json()["message"])

    def test_post_without_auth_method_leaves_it_unchanged(self):
        user = _make_user("unchanged@example.com", auth_method="otp")
        self.client.force_login(user)
        response = self.client.post(URL, {}, content_type="application/json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.user_profile.refresh_from_db()
        self.assertEqual(user.user_profile.auth_method, "otp")

    def test_post_ignores_has_password_in_payload(self):
        user = _make_user("ignore@example.com")
        self.client.force_login(user)
        response = self.client.post(
            URL, {"has_password": False}, content_type="application/json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.user_profile.refresh_from_db()
        # has_password is computed, so it should still be True
        self.assertTrue(user.has_usable_password())

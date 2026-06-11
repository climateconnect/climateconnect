from django.core.cache import cache
from rest_framework.test import APITestCase
from rest_framework import status

from feature_toggles.models import FeatureToggle


class TestFeatureToggleAPI(APITestCase):
    """Tests for the feature toggle API endpoints."""

    FEATURE_TOGGLES_URL = "/api/feature_toggles/"

    def setUp(self):
        """Clear cache and database before each test to ensure isolation."""
        cache.clear()
        FeatureToggle.objects.all().delete()

    def test_get_feature_toggles_requires_environment(self):
        """Test that the environment query parameter is required."""
        response = self.client.get(self.FEATURE_TOGGLES_URL, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("environment", response.data["error"])

    def test_get_feature_toggles_invalid_environment(self):
        """Test that invalid environment values are rejected."""
        response = self.client.get(
            self.FEATURE_TOGGLES_URL, {"environment": "invalid"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid environment", response.data["error"])

    def test_get_feature_toggles_empty_for_unknown_env(self):
        """Test that unknown environments return empty dict."""
        response = self.client.get(
            self.FEATURE_TOGGLES_URL, {"environment": "production"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {})

    def test_get_feature_toggles_with_active_toggle(self):
        """Test that active toggles are returned correctly."""
        # Create a feature toggle
        FeatureToggle.objects.create(
            name="TEST_FEATURE",
            production_is_active=True,
            staging_is_active=False,
            development_is_active=True,
        )

        # Test production environment
        response = self.client.get(
            self.FEATURE_TOGGLES_URL, {"environment": "production"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["TEST_FEATURE"], True)

    def test_get_feature_toggles_with_inactive_toggle(self):
        """Test that inactive toggles return False."""
        # Create a feature toggle
        FeatureToggle.objects.create(
            name="INACTIVE_FEATURE",
            production_is_active=False,
            staging_is_active=False,
            development_is_active=False,
        )

        response = self.client.get(
            self.FEATURE_TOGGLES_URL, {"environment": "production"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["INACTIVE_FEATURE"], False)

    def test_get_feature_toggles_environment_specific(self):
        """Test that toggles are environment-specific."""
        # Create a feature toggle active only in staging
        FeatureToggle.objects.create(
            name="STAGING_ONLY_FEATURE",
            production_is_active=False,
            staging_is_active=True,
            development_is_active=False,
        )

        # Test production - should be False
        response = self.client.get(
            self.FEATURE_TOGGLES_URL, {"environment": "production"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["STAGING_ONLY_FEATURE"], False)

        # Test staging - should be True
        response = self.client.get(
            self.FEATURE_TOGGLES_URL, {"environment": "staging"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["STAGING_ONLY_FEATURE"], True)

    def test_get_feature_toggles_multiple_toggles(self):
        """Test that multiple toggles are returned correctly."""
        # Create multiple feature toggles
        FeatureToggle.objects.create(
            name="FEATURE_A",
            production_is_active=True,
            staging_is_active=True,
            development_is_active=True,
        )
        FeatureToggle.objects.create(
            name="FEATURE_B",
            production_is_active=False,
            staging_is_active=True,
            development_is_active=False,
        )

        response = self.client.get(
            self.FEATURE_TOGGLES_URL, {"environment": "production"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["FEATURE_A"], True)
        self.assertEqual(response.data["FEATURE_B"], False)

    def test_get_feature_toggles_all_environments(self):
        """Test that all valid environments work."""
        FeatureToggle.objects.create(
            name="ALL_ENV_FEATURE",
            production_is_active=True,
            staging_is_active=True,
            development_is_active=True,
        )

        for env in ["production", "staging", "development"]:
            response = self.client.get(
                self.FEATURE_TOGGLES_URL, {"environment": env}, format="json"
            )
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertEqual(response.data["ALL_ENV_FEATURE"], True)


class TestFeatureToggleModel(APITestCase):
    """Tests for the FeatureToggle model."""

    def test_feature_toggle_creation(self):
        """Test creating a feature toggle."""
        toggle = FeatureToggle.objects.create(
            name="MODEL_TEST_FEATURE",
            description="A test feature",
            production_is_active=True,
            staging_is_active=False,
            development_is_active=True,
        )
        self.assertEqual(toggle.name, "MODEL_TEST_FEATURE")
        self.assertEqual(toggle.production_is_active, True)
        self.assertEqual(toggle.staging_is_active, False)
        self.assertEqual(toggle.development_is_active, True)

    def test_is_active_for_environment_production(self):
        """Test is_active_for_environment for production."""
        toggle = FeatureToggle.objects.create(
            name="ENV_TEST",
            production_is_active=True,
            staging_is_active=False,
            development_is_active=False,
        )
        self.assertTrue(toggle.is_active_for_environment("production"))
        self.assertFalse(toggle.is_active_for_environment("staging"))
        self.assertFalse(toggle.is_active_for_environment("development"))

    def test_is_active_for_environment_staging(self):
        """Test is_active_for_environment for staging."""
        toggle = FeatureToggle.objects.create(
            name="ENV_TEST_2",
            production_is_active=False,
            staging_is_active=True,
            development_is_active=False,
        )
        self.assertFalse(toggle.is_active_for_environment("production"))
        self.assertTrue(toggle.is_active_for_environment("staging"))
        self.assertFalse(toggle.is_active_for_environment("development"))

    def test_is_active_for_environment_development(self):
        """Test is_active_for_environment for development."""
        toggle = FeatureToggle.objects.create(
            name="ENV_TEST_3",
            production_is_active=False,
            staging_is_active=False,
            development_is_active=True,
        )
        self.assertFalse(toggle.is_active_for_environment("production"))
        self.assertFalse(toggle.is_active_for_environment("staging"))
        self.assertTrue(toggle.is_active_for_environment("development"))

    def test_is_active_for_environment_invalid(self):
        """Test is_active_for_environment with invalid environment."""
        toggle = FeatureToggle.objects.create(
            name="INVALID_ENV_TEST",
            production_is_active=True,
            staging_is_active=True,
            development_is_active=True,
        )
        # Should return False for invalid environment
        self.assertFalse(toggle.is_active_for_environment("invalid"))
        self.assertFalse(toggle.is_active_for_environment(""))

    def test_feature_toggle_str_representation(self):
        """Test the string representation of FeatureToggle."""
        toggle = FeatureToggle.objects.create(
            name="STR_TEST",
            production_is_active=True,
            staging_is_active=False,
            development_is_active=True,
        )
        self.assertIn("STR_TEST", str(toggle))
        self.assertIn("True", str(toggle))

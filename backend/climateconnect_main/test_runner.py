from django.test.runner import DiscoverRunner
from climateconnect_api.models import Language


class ClimateConnectTestRunner(DiscoverRunner):
    """Custom test runner that sets up required initial data for all tests."""

    def setup_databases(self, **kwargs):
        """Set up test databases and populate with required initial data."""
        result = super().setup_databases(**kwargs)

        # Create default languages that are referenced throughout the application
        # Order matches LOCALES setting in settings.py (1-based indexing)
        Language.objects.get_or_create(
            id=1,
            defaults={
                "language_code": "en",
                "name": "English",
                "native_name": "English",
            },
        )
        Language.objects.get_or_create(
            id=2,
            defaults={
                "language_code": "de",
                "name": "German",
                "native_name": "Deutsch",
            },
        )

        return result

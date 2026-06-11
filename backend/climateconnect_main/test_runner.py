from django.test.runner import DiscoverRunner

from climateconnect_api.models import Language


class ClimateConnectTestRunner(DiscoverRunner):
    """Custom test runner that sets up required initial data for all tests."""

    def setup_databases(self, **kwargs):
        """Set up test databases and populate with required initial data."""
        result = super().setup_databases(**kwargs)

        # Create default languages that are referenced throughout the application.
        # Use language_code as the unique lookup field and let Django assign IDs.
        Language.objects.get_or_create(
            language_code="en",
            defaults={
                "name": "English",
                "native_name": "English",
            },
        )
        Language.objects.get_or_create(
            language_code="de",
            defaults={
                "name": "German",
                "native_name": "Deutsch",
            },
        )

        return result

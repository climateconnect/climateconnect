from django.apps import AppConfig


class OrganizationConfig(AppConfig):
    name = "organization"
    default_auto_field = "django.db.models.BigAutoField"

    def ready(self):
        """Import signals when app is ready."""
        import organization.signals  # noqa


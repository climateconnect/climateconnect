from django.apps import AppConfig


class LocationConfig(AppConfig):
    name = "location"
    default_auto_field = "django.db.models.BigAutoField"

    # for usage of signals.py
    def ready(self):
        try:
            import location.signals
        except ImportError:
            pass
from django.apps import AppConfig


class FeatureTogglesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "feature_toggles"
    verbose_name = "Feature Toggles"

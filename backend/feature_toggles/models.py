from django.db import models
from django.core.validators import RegexValidator


class FeatureToggle(models.Model):
    """
    Model to store feature toggles with environment-specific states.

    Each toggle can be enabled/disabled per environment (production, staging, development).
    """

    name = models.CharField(
        help_text="Unique name for the feature toggle (e.g., 'NEW_DASHBOARD')",
        verbose_name="Toggle Name",
        max_length=128,
        unique=True,
        validators=[
            RegexValidator(
                regex=r"^[A-Z0-9_]+$",
                message="Name must contain only uppercase letters, numbers, and underscores",
            )
        ],
    )

    description = models.TextField(
        help_text="Description of what this feature toggle controls",
        verbose_name="Description",
        blank=True,
        default="",
    )

    production_is_active = models.BooleanField(
        help_text="Whether the feature is active in production",
        verbose_name="Production Active",
        default=False,
    )

    staging_is_active = models.BooleanField(
        help_text="Whether the feature is active in staging",
        verbose_name="Staging Active",
        default=False,
    )

    development_is_active = models.BooleanField(
        help_text="Whether the feature is active in development",
        verbose_name="Development Active",
        default=False,
    )

    created_at = models.DateTimeField(
        help_text="Time when the feature toggle was created",
        verbose_name="Created at",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="Time when the feature toggle was last updated",
        verbose_name="Updated at",
        auto_now=True,
    )

    class Meta:
        verbose_name = "Feature Toggle"
        verbose_name_plural = "Feature Toggles"
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} (prod: {self.production_is_active}, staging: {self.staging_is_active}, dev: {self.development_is_active})"

    def is_active_for_environment(self, environment: str) -> bool:
        """
        Check if the toggle is active for the given environment.

        Args:
            environment: One of 'production', 'staging', 'development'

        Returns:
            True if the toggle is active for the given environment, False otherwise
        """
        environment_map = {
            "production": self.production_is_active,
            "staging": self.staging_is_active,
            "development": self.development_is_active,
        }
        return environment_map.get(environment, False)

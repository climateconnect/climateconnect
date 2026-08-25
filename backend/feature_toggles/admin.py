import logging
from django.contrib import admin
from feature_toggles.models import FeatureToggle
from feature_toggles.utility import invalidate_all_feature_toggle_caches

# Get logger for feature toggle audit logging
logger = logging.getLogger(__name__)


class FeatureToggleAdmin(admin.ModelAdmin):
    """
    Admin configuration for FeatureToggle model.
    Includes logging for audit trail when toggles are created or modified.
    """

    list_display = [
        "name",
        "production_is_active",
        "staging_is_active",
        "development_is_active",
        "updated_at",
    ]

    list_filter = [
        "production_is_active",
        "staging_is_active",
        "development_is_active",
    ]

    search_fields = [
        "name",
        "description",
    ]

    ordering = ["name"]

    fieldsets = (
        (None, {"fields": ("name", "description")}),
        (
            "Environment States",
            {
                "fields": (
                    (
                        "production_is_active",
                        "staging_is_active",
                        "development_is_active",
                    )
                )
            },
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )

    readonly_fields = ["created_at", "updated_at"]

    def save_model(self, request, obj, form, change):
        """
        Override save_model to log feature toggle changes and invalidate cache.
        """
        if change:
            # This is an update - log the changes
            old_obj = FeatureToggle.objects.get(pk=obj.pk)
            changes = []

            for field in [
                "production_is_active",
                "staging_is_active",
                "development_is_active",
            ]:
                old_value = getattr(old_obj, field)
                new_value = getattr(obj, field)
                if old_value != new_value:
                    changes.append(f"{field}: {old_value} -> {new_value}")

            if changes:
                logger.info(
                    f"Feature Toggle '{obj.name}' modified by {request.user.username}. "
                    f"Changes: {', '.join(changes)}"
                )
            else:
                logger.info(
                    f"Feature Toggle '{obj.name}' saved (no changes) by {request.user.username}"
                )
        else:
            # This is a new creation
            logger.info(
                f"Feature Toggle '{obj.name}' created by {request.user.username}. "
                f"States: prod={obj.production_is_active}, "
                f"staging={obj.staging_is_active}, dev={obj.development_is_active}"
            )

        super().save_model(request, obj, form, change)

        # Invalidate ALL feature toggle caches
        invalidate_all_feature_toggle_caches()
        logger.debug(f"All feature toggle caches invalidated")

    def delete_model(self, request, obj):
        """
        Override delete_model to log feature toggle deletions and invalidate cache.
        """
        logger.info(f"Feature Toggle '{obj.name}' deleted by {request.user.username}")

        # Delete from DB first, then invalidate cache to avoid a brief window
        # where a cache miss would re-populate the cache with the deleted record.
        super().delete_model(request, obj)

        # Invalidate ALL feature toggle caches
        invalidate_all_feature_toggle_caches()
        logger.debug(f"All feature toggle caches invalidated")

    def delete_queryset(self, request, queryset):
        """
        Override delete_queryset to log bulk deletions and invalidate cache.
        """
        toggle_names = list(queryset.values_list("name", flat=True))
        logger.info(
            f"Feature Toggles {toggle_names} deleted by {request.user.username}"
        )

        # Invalidate ALL feature toggle caches
        invalidate_all_feature_toggle_caches()
        logger.debug(f"All feature toggle caches invalidated")

        super().delete_queryset(request, queryset)


admin.site.register(FeatureToggle, FeatureToggleAdmin)

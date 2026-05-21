from django.db import models
from django.utils.translation import gettext_lazy as _

from organization.models.event_registration import EventRegistrationConfig


class RegistrationFieldType(models.TextChoices):
    CHECKBOX = "checkbox", _("Checkbox")
    OPTION_SELECT = "option_select", _("Option Select")
    INVENTORY = "inventory", _("Inventory")


class RegistrationField(models.Model):
    """
    One custom field on an event's registration form.

    field_type discriminates the rendering behaviour and which settings keys
    are valid. settings stores type-specific configuration (e.g. the HTML
    description for checkbox fields). Options for option_select fields live in
    the RegistrationFieldOption table so each choice has an addressable id for
    the future RegistrationFieldAnswer FK.

    The order constraint is DEFERRABLE DEFERRED so the sync logic can update
    all orders in a single atomic transaction without temporary collisions.
    """

    registration_config = models.ForeignKey(
        EventRegistrationConfig,
        on_delete=models.CASCADE,
        related_name="fields",
    )
    field_type = models.CharField(max_length=50, choices=RegistrationFieldType.choices)
    order = models.PositiveIntegerField()
    is_required = models.BooleanField(default=False)
    label = models.CharField(max_length=30)
    settings = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "organization"
        ordering = ["order"]
        constraints = [
            models.UniqueConstraint(
                fields=["registration_config", "order"],
                name="unique_registrationfield_order_per_config",
                deferrable=models.Deferrable.DEFERRED,
            ),
            models.UniqueConstraint(
                fields=["registration_config", "label"],
                name="unique_registrationfield_label_per_config",
            ),
        ]

    def __str__(self):
        return (
            f"{self.label} ({self.field_type}, order={self.order}) "
            f"for config {self.registration_config_id}"
        )


class RegistrationFieldOption(models.Model):
    """
    One selectable choice within an option_select RegistrationField.

    Each option gets its own row so that RegistrationFieldAnswer can store
    a FK to the chosen option (forward-compatible with Phase 4b Inventory type).
    """

    field = models.ForeignKey(
        RegistrationField,
        on_delete=models.CASCADE,
        related_name="options",
    )
    title = models.CharField(max_length=200)
    order = models.PositiveIntegerField()
    available_amount = models.PositiveIntegerField(null=True, blank=True)
    max_amount_per_guest = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        app_label = "organization"
        ordering = ["order"]
        constraints = [
            models.UniqueConstraint(
                fields=["field", "order"],
                name="unique_registrationfieldoption_order_per_field",
                deferrable=models.Deferrable.DEFERRED,
            )
        ]

    def __str__(self):
        return f"{self.title} (order={self.order})"

"""
Back-fill RegistrationField.label for existing rows.

Groups fields by (registration_config, field_type) and assigns
"{type_name} {sequential_number}" labels.
"""

from collections import defaultdict

from django.db import migrations


# Backend-side type names (English) — matching RegistrationFieldType labels.
TYPE_NAMES = {
    "checkbox": "Checkbox",
    "option_select": "Option Select",
    "inventory": "Inventory",
}


def backfill_labels(apps, schema_editor):
    RegistrationField = apps.get_model("organization", "RegistrationField")

    # Group by (config_id, field_type) preserving order.
    groups = defaultdict(list)
    for field in RegistrationField.objects.order_by("registration_config", "field_type", "order"):
        groups[(field.registration_config_id, field.field_type)].append(field)

    for (config_id, field_type), fields in groups.items():
        type_name = TYPE_NAMES.get(field_type, field_type)
        for idx, field in enumerate(fields, start=1):
            field.label = f"{type_name} {idx}"
            field.save(update_fields=["label"])


def reverse_backfill(apps, schema_editor):
    RegistrationField = apps.get_model("organization", "RegistrationField")
    RegistrationField.objects.all().update(label="")


class Migration(migrations.Migration):

    dependencies = [
        ("organization", "0129_registrationfield_label"),
    ]

    operations = [
        migrations.RunPython(backfill_labels, reverse_backfill),
    ]

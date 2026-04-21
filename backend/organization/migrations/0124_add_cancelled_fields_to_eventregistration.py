"""
Additive migration: adds ``cancelled_at`` and ``cancelled_by_id`` columns to
``organization_eventregistration``.

All existing rows default to NULL (i.e. active registrations). No backfill needed.

Record lifecycle:
    Active       — cancelled_at NULL,  cancelled_by_id NULL
    Cancelled    — cancelled_at = timestamp, cancelled_by_id = user who cancelled
    Re-registered — cancelled_at NULL (reset), cancelled_by_id NULL (reset)
"""

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("organization", "0123_rename_eventregistration_models"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="eventregistration",
            name="cancelled_at",
            field=models.DateTimeField(
                blank=True,
                default=None,
                help_text=(
                    "Timestamp when the registration was cancelled. "
                    "NULL means the registration is active. "
                    "Reset to NULL on re-registration."
                ),
                null=True,
                verbose_name="Cancelled At",
            ),
        ),
        migrations.AddField(
            model_name="eventregistration",
            name="cancelled_by",
            field=models.ForeignKey(
                blank=True,
                help_text=(
                    "User who cancelled the registration. "
                    "Set to the guest when they cancel themselves; "
                    "set to the organiser/admin when they cancel on behalf of the guest. "
                    "NULL when the registration is active (reset on re-registration)."
                ),
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="cancelled_registrations",
                to=settings.AUTH_USER_MODEL,
                verbose_name="Cancelled By",
            ),
        ),
    ]


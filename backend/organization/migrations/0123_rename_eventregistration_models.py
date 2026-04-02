"""
Renames EventRegistration → EventRegistrationConfig (settings/config object)
and EventParticipant → EventRegistration (user sign-up record).

Operations in order:
1. RenameModel EventRegistration → EventRegistrationConfig
   (renames table organization_eventregistration → organization_eventregistrationconfig)
2. RenameField on EventParticipant: event_registration → registration_config
   (renames column event_registration_id → registration_config_id before model rename)
3. AlterUniqueTogether to reflect the renamed field
4. RenameModel EventParticipant → EventRegistration
   (renames table organization_eventparticipant → organization_eventregistration)
5. AlterField to update related_names (Django state update only, no SQL)

Note: DB index names idx_ep_event_registration and idx_ep_user are intentionally
kept as-is (cosmetic mismatch accepted per spec decision).
"""

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("organization", "0122_add_eventparticipant"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # ── 1. Rename EventRegistration (config) → EventRegistrationConfig ──────
        migrations.RenameModel(
            old_name="EventRegistration",
            new_name="EventRegistrationConfig",
        ),
        # ── 2. Rename FK column on EventParticipant before renaming that model ──
        migrations.RenameField(
            model_name="EventParticipant",
            old_name="event_registration",
            new_name="registration_config",
        ),
        # ── 3. Update unique_together to reference the renamed field ─────────────
        migrations.AlterUniqueTogether(
            name="eventparticipant",
            unique_together={("user", "registration_config")},
        ),
        # ── 4. Rename EventParticipant → EventRegistration ───────────────────────
        migrations.RenameModel(
            old_name="EventParticipant",
            new_name="EventRegistration",
        ),
        # ── 5. Update related_names (Django state only — no SQL emitted) ─────────
        migrations.AlterField(
            model_name="eventregistrationconfig",
            name="project",
            field=models.OneToOneField(
                help_text="The event project this registration configuration belongs to",
                on_delete=django.db.models.deletion.CASCADE,
                related_name="registration_config",
                to="organization.project",
                verbose_name="Project",
            ),
        ),
        migrations.AlterField(
            model_name="eventregistration",
            name="registration_config",
            field=models.ForeignKey(
                help_text="The event registration config this registration belongs to",
                on_delete=django.db.models.deletion.CASCADE,
                related_name="registrations",
                to="organization.eventregistrationconfig",
                verbose_name="Registration Config",
            ),
        ),
        migrations.AlterField(
            model_name="eventregistration",
            name="user",
            field=models.ForeignKey(
                help_text="The user who registered for the event",
                on_delete=django.db.models.deletion.CASCADE,
                related_name="event_registrations",
                to=settings.AUTH_USER_MODEL,
                verbose_name="User",
            ),
        ),
    ]


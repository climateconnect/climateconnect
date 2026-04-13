from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("organization", "0124_add_cancelled_fields_to_eventregistration"),
    ]

    operations = [
        migrations.AddField(
            model_name="eventregistrationconfig",
            name="notify_admins",
            field=models.BooleanField(
                default=True,
                help_text=(
                    "When True, team admins receive an email notification whenever "
                    "a participant registers or cancels. "
                    "Consumed by the admin notification task (see GitHub issue #1888)."
                ),
                verbose_name="Notify Admins",
            ),
        ),
    ]

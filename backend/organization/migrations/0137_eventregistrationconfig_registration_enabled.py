from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("organization", "0136_eventregistrationconfig_is_draft"),
    ]

    operations = [
        migrations.AddField(
            model_name="eventregistrationconfig",
            name="registration_enabled",
            field=models.BooleanField(
                default=True,
                help_text=(
                    "When False, registration features are hidden for this event. "
                    "The config is preserved and can be re-enabled later. "
                    "Unlike is_draft, this field is reversible."
                ),
                verbose_name="Registration Enabled",
            ),
        ),
    ]

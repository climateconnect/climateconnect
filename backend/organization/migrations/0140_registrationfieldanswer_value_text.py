from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("organization", "0139_eventregistrationconfig_last_guest_email_sent_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="registrationfieldanswer",
            name="value_text",
            field=models.TextField(blank=True, null=True),
        ),
    ]

# Generated by Django 2.2.13 on 2020-07-20 03:32

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("climateconnect_api", "0020_userprofile_has_logged_in"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="verification_key",
            field=models.UUIDField(
                blank=True,
                help_text="On signup create a unique key that will be used for user's profile verification",
                null=True,
                unique=True,
                verbose_name="Verification Key",
            ),
        ),
    ]

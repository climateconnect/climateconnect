# Generated by Django 2.2.13 on 2021-01-28 06:33

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("location", "0004_auto_20210127_1452"),
        ("climateconnect_api", "0044_auto_20210114_1045"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="userprofile",
            name="latitude",
        ),
        migrations.RemoveField(
            model_name="userprofile",
            name="longitude",
        ),
        migrations.AddField(
            model_name="userprofile",
            name="loc",
            field=models.ForeignKey(
                blank=True,
                help_text="Points to the user's location",
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="user_profile_loc",
                to="location.Location",
                verbose_name="Location",
            ),
        ),
    ]

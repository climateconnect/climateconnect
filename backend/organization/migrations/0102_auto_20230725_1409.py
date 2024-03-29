# Generated by Django 3.2.18 on 2023-07-25 14:09

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("organization", "0101_merge_20221115_0740"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="additional_loc_info",
            field=models.CharField(
                blank=True,
                help_text="e.g. Room or other instructions to get to the location",
                max_length=256,
                null=True,
                verbose_name="Additional location info",
            ),
        ),
        migrations.AddField(
            model_name="project",
            name="project_type",
            field=models.CharField(
                choices=[("ID", "Idea"), ("EV", "Event"), ("PR", "Project")],
                default="PR",
                max_length=2,
            ),
        ),
    ]

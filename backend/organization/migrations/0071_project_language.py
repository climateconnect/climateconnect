# Generated by Django 2.2.18 on 2021-04-12 06:07

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("climateconnect_api", "0056_auto_20210408_0541"),
        ("organization", "0070_projectstatus_name_de_translation"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="language",
            field=models.ForeignKey(
                blank=True,
                help_text="Original project language",
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="project_language",
                to="climateconnect_api.Language",
                verbose_name="Language",
            ),
        ),
    ]

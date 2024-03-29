# Generated by Django 2.2.11 on 2020-06-17 12:27

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("organization", "0021_auto_20200617_0758"),
    ]

    operations = [
        migrations.AlterField(
            model_name="project",
            name="skills",
            field=models.ManyToManyField(
                blank=True,
                help_text="Points to all skills project persist or required",
                related_name="project_skills",
                to="climateconnect_api.Skill",
                verbose_name="Skills",
            ),
        ),
    ]

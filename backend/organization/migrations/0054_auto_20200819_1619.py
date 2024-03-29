# Generated by Django 2.2.13 on 2020-08-19 16:19

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("organization", "0053_auto_20200819_1144"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="project",
            options={
                "ordering": ["-rating", "-id"],
                "verbose_name": "Project",
                "verbose_name_plural": "Projects",
            },
        ),
        migrations.AddField(
            model_name="project",
            name="rating",
            field=models.PositiveSmallIntegerField(
                default=100,
                help_text="The larger the number, the more to the top this project will be displayed",
                verbose_name="Rating (1-100)",
            ),
        ),
    ]

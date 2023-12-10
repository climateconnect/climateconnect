# Generated by Django 2.2.13 on 2021-03-11 11:56

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("organization", "0063_organization_thumbnail_image"),
    ]

    operations = [
        migrations.AlterField(
            model_name="project",
            name="description",
            field=models.TextField(
                blank=True,
                help_text="Points to detailed description about the project",
                max_length=4800,
                null=True,
                verbose_name="Description",
            ),
        ),
        migrations.AlterField(
            model_name="project",
            name="short_description",
            field=models.TextField(
                blank=True,
                help_text="Points to short description about the project",
                max_length=240,
                null=True,
                verbose_name="Short Description",
            ),
        ),
    ]

# Generated by Django 2.2.13 on 2020-06-23 10:43

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("climateconnect_api", "0011_auto_20200617_1232"),
    ]

    operations = [
        migrations.AlterField(
            model_name="userprofile",
            name="url_slug",
            field=models.CharField(
                blank=True,
                help_text="slug for user URL",
                max_length=512,
                null=True,
                unique=True,
                verbose_name="URL Slug",
            ),
        ),
    ]

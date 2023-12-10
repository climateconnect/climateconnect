# Generated by Django 2.2.13 on 2020-07-06 14:16

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("organization", "0041_auto_20200706_1416"),
    ]

    operations = [
        migrations.AddField(
            model_name="organizationtags",
            name="additional_info",
            field=django.contrib.postgres.fields.ArrayField(
                base_field=models.CharField(max_length=264),
                blank=True,
                null=True,
                size=5,
            ),
        ),
    ]

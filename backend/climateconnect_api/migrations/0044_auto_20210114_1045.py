# Generated by Django 2.2.13 on 2021-01-14 10:45

from django.contrib.postgres.operations import CreateExtension
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("climateconnect_api", "0043_merge_20201211_0751"),
    ]

    operations = [
        CreateExtension("postgis"),
    ]

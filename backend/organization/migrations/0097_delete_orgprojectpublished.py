# Generated by Django 3.2.15 on 2022-09-29 13:32

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("organization", "0096_organizationfollower_orgprojectpublished"),
    ]

    operations = [
        migrations.DeleteModel(
            name="OrgProjectPublished",
        ),
    ]

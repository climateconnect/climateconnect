# Generated by Django 2.2.13 on 2020-07-09 09:16

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("organization", "0043_auto_20200706_2213"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="projectmember",
            options={
                "ordering": ["id"],
                "verbose_name": "Project Member",
                "verbose_name_plural": "Project Members",
            },
        ),
    ]

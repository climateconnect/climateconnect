# Generated by Django 5.1.2 on 2025-02-04 08:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("hubs", "0034_alter_hub_hub_type"),
        ("organization", "0104_project_related_hubs"),
    ]

    operations = [
        migrations.AddField(
            model_name="organization",
            name="related_hubs",
            field=models.ManyToManyField(
                blank=True,
                help_text="(Custom) hubs that the organization is part of. The organization wil appear in these hubs.",
                related_name="organizations_related_hubs",
                to="hubs.hub",
            ),
        ),
        migrations.AlterField(
            model_name="organization",
            name="hubs",
            field=models.ManyToManyField(
                blank=True,
                help_text="SectorHubs that the organization is active in. These hubs will be displayed on the organization page.",
                related_name="organization_hubs",
                to="hubs.hub",
                verbose_name="Hubs",
            ),
        ),
    ]

# Generated by Django 2.2.13 on 2020-12-22 07:00

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("hubs", "0005_hub_filter_parent_tags"),
    ]

    operations = [
        migrations.AddField(
            model_name="hub",
            name="stat_box_title",
            field=models.CharField(
                blank=True,
                help_text="The text displayed on top of the stat box",
                max_length=1024,
                null=True,
                verbose_name="Stat box title",
            ),
        ),
    ]

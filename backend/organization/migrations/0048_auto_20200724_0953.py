# Generated by Django 2.2.13 on 2020-07-24 09:53

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("organization", "0047_auto_20200715_1149"),
    ]

    operations = [
        migrations.AddField(
            model_name="organization",
            name="website",
            field=models.CharField(
                blank=True,
                help_text="Website",
                max_length=256,
                null=True,
                verbose_name="City",
            ),
        ),
        migrations.AddField(
            model_name="project",
            name="website",
            field=models.CharField(
                blank=True,
                help_text="Website",
                max_length=256,
                null=True,
                verbose_name="City",
            ),
        ),
    ]

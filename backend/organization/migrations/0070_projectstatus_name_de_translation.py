# Generated by Django 2.2.18 on 2021-04-09 06:00

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("organization", "0069_auto_20210409_0559"),
    ]

    operations = [
        migrations.AddField(
            model_name="projectstatus",
            name="name_de_translation",
            field=models.CharField(
                blank=True,
                help_text="Translation of name column",
                max_length=512,
                null=True,
                verbose_name="Name DE translation",
            ),
        ),
    ]

# Generated by Django 2.2.18 on 2021-04-08 05:28

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("climateconnect_api", "0053_auto_20210407_0520"),
    ]

    operations = [
        migrations.AddField(
            model_name="faqsection",
            name="name_de_translation",
            field=models.CharField(
                blank=True,
                help_text="Translation of name field in deutsch",
                max_length=128,
                null=True,
                verbose_name="Name DE translation",
            ),
        ),
    ]

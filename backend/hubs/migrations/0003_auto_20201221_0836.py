# Generated by Django 2.2.13 on 2020-12-21 08:36

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("hubs", "0002_auto_20201218_1122"),
    ]

    operations = [
        migrations.AlterField(
            model_name="hub",
            name="headline",
            field=models.CharField(
                blank=True,
                help_text="Headline",
                max_length=1024,
                null=True,
                verbose_name="headline",
            ),
        ),
        migrations.AlterField(
            model_name="hub",
            name="segway_text",
            field=models.CharField(
                blank=True,
                help_text="Segway text between the info and the solutions",
                max_length=1024,
                null=True,
                verbose_name="Segway text",
            ),
        ),
        migrations.AlterField(
            model_name="hub",
            name="sub_headline",
            field=models.CharField(
                blank=True,
                help_text="Sub headline",
                max_length=1024,
                null=True,
                verbose_name="Sub headline",
            ),
        ),
    ]

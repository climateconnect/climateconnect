# Generated by Django 2.2.11 on 2020-06-17 12:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('organization', '0022_auto_20200617_1227'),
    ]

    operations = [
        migrations.AlterField(
            model_name='project',
            name='url_slug',
            field=models.CharField(help_text='URL slug for project', max_length=1024, unique=True, verbose_name='URL slug'),
        ),
    ]

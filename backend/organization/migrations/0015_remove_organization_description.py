# Generated by Django 2.2.11 on 2020-06-01 11:36

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('organization', '0014_auto_20200601_1136'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='organization',
            name='description',
        ),
    ]

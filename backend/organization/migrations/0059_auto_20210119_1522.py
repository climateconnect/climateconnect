# Generated by Django 2.2.13 on 2021-01-19 15:22

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('organization', '0058_organizationfieldtagging'),
    ]

    operations = [
        migrations.AlterField(
            model_name='organizationfieldtagging',
            name='field_tag',
            field=models.ForeignKey(help_text='Points to the tag', on_delete=django.db.models.deletion.CASCADE, related_name='field_tag', to='organization.ProjectTags', verbose_name='Organization Tag'),
        ),
    ]

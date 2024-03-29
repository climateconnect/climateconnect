# Generated by Django 2.2.11 on 2020-06-17 14:41

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("organization", "0026_auto_20200617_1441"),
    ]

    operations = [
        migrations.AlterField(
            model_name="projectparents",
            name="parent_organization",
            field=models.ForeignKey(
                blank=True,
                help_text="Points to organization",
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="project_parent_org",
                to="organization.Organization",
                verbose_name="Organization",
            ),
        ),
    ]

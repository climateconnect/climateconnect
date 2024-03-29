# Generated by Django 2.2.11 on 2020-05-03 20:46

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("climateconnect_api", "0009_role_role_type"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("organization", "0012_auto_20200418_1631"),
    ]

    operations = [
        migrations.CreateModel(
            name="ProjectMember",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(
                        auto_now_add=True,
                        help_text="Time when project members were created",
                        verbose_name="Created At",
                    ),
                ),
                (
                    "updated_at",
                    models.DateTimeField(
                        auto_now=True,
                        help_text="Time when project members were updated",
                        verbose_name="Updated At",
                    ),
                ),
                (
                    "project",
                    models.ForeignKey(
                        help_text="Points to project table",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="project_member",
                        to="organization.Project",
                        verbose_name="Project",
                    ),
                ),
                (
                    "role",
                    models.ForeignKey(
                        help_text="Points to user role",
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="project_role",
                        to="climateconnect_api.Role",
                        verbose_name="Role",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        help_text="Points to user table",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="project_member",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="User",
                    ),
                ),
            ],
            options={
                "verbose_name": "Project Member",
                "verbose_name_plural": "Project Members",
            },
        ),
        migrations.CreateModel(
            name="OrganizationMember",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "created_at",
                    models.DateTimeField(
                        auto_now_add=True,
                        help_text="Time when organization member was created",
                        verbose_name="Created At",
                    ),
                ),
                (
                    "updated_at",
                    models.DateTimeField(
                        auto_now=True,
                        help_text="Time when organization member was updated",
                        verbose_name="Updated At",
                    ),
                ),
                (
                    "organization",
                    models.ForeignKey(
                        help_text="Points to organization table",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="organization_member",
                        to="organization.Organization",
                        verbose_name="Organization",
                    ),
                ),
                (
                    "role",
                    models.ForeignKey(
                        help_text="Points ot Role table",
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="organization_role",
                        to="climateconnect_api.Role",
                        verbose_name="Role",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        help_text="Point to user table",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="org_member",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="User",
                    ),
                ),
            ],
            options={
                "verbose_name": "Organization Member",
                "verbose_name_plural": "Organization Members",
            },
        ),
    ]

# Generated by Django 2.2.13 on 2020-07-24 14:15

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("organization", "0049_auto_20200724_1010"),
    ]

    operations = [
        migrations.CreateModel(
            name="ProjectFollower",
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
                        help_text="Time when the user followed the project",
                        verbose_name="Created At",
                    ),
                ),
                (
                    "updated_at",
                    models.DateTimeField(
                        auto_now_add=True,
                        help_text="Time when the follower was updated",
                        verbose_name="Updated At",
                    ),
                ),
                (
                    "project",
                    models.ForeignKey(
                        help_text="Points to a project",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="project_following",
                        to="organization.Project",
                        verbose_name="Project",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        help_text="Points to the user following the project",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="follower",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Follower",
                    ),
                ),
            ],
            options={
                "verbose_name": "Project Follower",
                "verbose_name_plural": "Project Followers",
                "ordering": ["-id"],
            },
        ),
    ]

# Generated by Django 2.2.13 on 2020-11-12 20:03

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("climateconnect_api", "0035_userprofile_email_on_new_project_follower"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("chat_messages", "0005_auto_20201001_2008"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="messageparticipants",
            options={
                "ordering": ["-last_message_at", "-created_at"],
                "verbose_name_plural": "Chats",
            },
        ),
        migrations.CreateModel(
            name="Participant",
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
                        help_text="Time when the user joined the chat created",
                        verbose_name="Created At",
                    ),
                ),
                (
                    "updated_at",
                    models.DateTimeField(
                        auto_now=True,
                        help_text="Time when the user's role in the chat updated",
                        verbose_name="Updated At",
                    ),
                ),
                (
                    "chat",
                    models.ForeignKey(
                        blank="False",
                        help_text="Points to the chat that this user is a part of",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="participant_participants",
                        to="chat_messages.MessageParticipants",
                        verbose_name="Chat",
                    ),
                ),
                (
                    "role",
                    models.ForeignKey(
                        help_text="Points to the user's role (creator, admin, member)",
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="participant_role",
                        to="climateconnect_api.Role",
                        verbose_name="Role(permissions)",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        help_text="Points to the user that is part of the chat",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="participant_user",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="User",
                    ),
                ),
            ],
            options={
                "verbose_name": "Chat Participant",
                "verbose_name_plural": "Chat Participants",
                "ordering": ["id"],
                "unique_together": {("user", "chat")},
            },
        ),
    ]

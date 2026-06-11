import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("organization", "0121_add_eventregistration_status"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="EventParticipant",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "registered_at",
                    models.DateTimeField(
                        auto_now_add=True,
                        help_text="When the user registered for the event",
                        verbose_name="Registered At",
                    ),
                ),
                (
                    "event_registration",
                    models.ForeignKey(
                        help_text="The event registration this participant belongs to",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="participants",
                        to="organization.eventregistration",
                        verbose_name="Event Registration",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        help_text="The user who registered for the event",
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="event_participations",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="User",
                    ),
                ),
            ],
            options={
                "verbose_name": "Event Participant",
                "verbose_name_plural": "Event Participants",
            },
        ),
        migrations.AlterUniqueTogether(
            name="eventparticipant",
            unique_together={("user", "event_registration")},
        ),
        migrations.AddIndex(
            model_name="eventparticipant",
            index=models.Index(
                fields=["event_registration"],
                name="idx_ep_event_registration",
            ),
        ),
        migrations.AddIndex(
            model_name="eventparticipant",
            index=models.Index(
                fields=["user"],
                name="idx_ep_user",
            ),
        ),
    ]


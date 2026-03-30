from django.contrib.auth.models import User
from django.db import models

from organization.models.project import Project


class RegistrationStatus(models.TextChoices):
    """
    Explicit lifecycle states for event registration.

    OPEN   — registration is accepting sign-ups (default).
    CLOSED — organiser has manually closed registration ahead of the end date.
    FULL   — the system sets this when max_participants is reached; new sign-ups
             are blocked.  Set in the same DB transaction as the last accepted
             registration (using select_for_update + atomic counter) to avoid
             races.  Automatically transitions back to OPEN if a participant
             cancels and the count drops below max_participants.

    The effective "is registration accepting?" check in the application layer is:
        status == OPEN  AND  now() < registration_end_date
    A separate FULL state (vs. a computed count query) keeps this check O(1)
    without a COUNT(*) on every incoming signup request.

    Edge case — organiser changes max_participants via PATCH:
        • new max > current signup count AND status == FULL  → set status = OPEN
          (capacity has been raised; registration is no longer full)
        • new max < current signup count AND status == OPEN  → set status = FULL
          (capacity has been lowered below existing signups; block new registrations)
        • new max == current signup count AND status == OPEN → set status = FULL
        Both transitions must happen atomically in the same DB transaction as the
        EventRegistration.save() call, using select_for_update() on the
        registration count aggregate to avoid races.
        ⚠️  This logic is deferred until the Registrations feature (signup table)
        is built.  See the PATCH handler in project_views.py for the TODO marker.
    """

    OPEN = "open", "Open"
    CLOSED = "closed", "Closed"
    FULL = "full", "Full"


class EventRegistration(models.Model):
    """
    Stores registration settings for an event project.

    The presence of this record is the source of truth for whether online
    registration is enabled for the associated event — no separate boolean
    flag on Project is needed.

    Timezone handling: registration_end_date is a timezone-aware DateTimeField
    (TIMESTAMPTZ in PostgreSQL), consistent with Project.start_date / end_date.
    USE_TZ=True means all datetimes are stored in UTC. The API accepts ISO 8601
    strings (e.g. "2026-06-01T23:59:00Z"); the browser timezone is used in the
    UI but the backend always stores/compares in UTC.
    """

    project = models.OneToOneField(
        Project,
        on_delete=models.CASCADE,
        related_name="event_registration",
        help_text="The event project this registration configuration belongs to",
        verbose_name="Project",
    )

    max_participants = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text=(
            "Maximum number of participants allowed to register (must be > 0). "
            "May be null while the project is still a draft."
        ),
        verbose_name="Maximum Participants",
    )

    registration_end_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text=(
            "Date and time when registration closes. "
            "Timezone-aware (TIMESTAMPTZ), stored in UTC. "
            "Must be on or before the event's end_date. "
            "May be null while the project is still a draft."
        ),
        verbose_name="Registration End Date",
    )

    status = models.CharField(
        max_length=10,
        choices=RegistrationStatus.choices,
        default=RegistrationStatus.OPEN,
        db_index=True,
        help_text=(
            "Lifecycle state of registration. "
            "'open' — accepting sign-ups (default). "
            "'closed' — organiser manually closed before end date. "
            "'full' — system-set when max_participants reached; "
            "reverts to 'open' if a cancellation drops count below max."
        ),
        verbose_name="Registration Status",
    )

    created_at = models.DateTimeField(
        help_text="When this registration configuration was created",
        verbose_name="Created At",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="When this registration configuration was last updated",
        verbose_name="Updated At",
        auto_now=True,
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Event Registration"
        verbose_name_plural = "Event Registrations"

    def __str__(self):
        max_p = self.max_participants if self.max_participants is not None else "—"
        return f"Registration for '{self.project.name}' (max: {max_p}, status: {self.status})"


class EventParticipant(models.Model):
    """
    Records which users have registered for an event.

    One row per (user, event_registration) pair.  The unique_together constraint
    acts as both a business rule (no duplicate registrations) and a DB-level
    safety net for concurrent requests.

    Seat counting:
        available_seats = event_registration.max_participants
                          - EventParticipant.objects.filter(event_registration=er).count()

    This is computed on-the-fly on the detail endpoint only (see
    EventRegistrationSerializer with ``include_seat_count=True`` context flag).
    No denormalised counter column is used to avoid update-anomaly races.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="event_participations",
        help_text="The user who registered for the event",
        verbose_name="User",
    )
    event_registration = models.ForeignKey(
        EventRegistration,
        on_delete=models.CASCADE,
        related_name="participants",
        help_text="The event registration this participant belongs to",
        verbose_name="Event Registration",
    )
    registered_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When the user registered for the event",
        verbose_name="Registered At",
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Event Participant"
        verbose_name_plural = "Event Participants"
        unique_together = [("user", "event_registration")]
        indexes = [
            models.Index(
                fields=["event_registration"], name="idx_ep_event_registration"
            ),
            models.Index(fields=["user"], name="idx_ep_user"),
        ]

    def __str__(self) -> str:
        return (
            f"{self.user.username} registered for "
            f"'{self.event_registration.project.name}'"
        )

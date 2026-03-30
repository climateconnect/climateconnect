import logging

from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from organization.models import Project
from organization.models.event_registration import (
    EventParticipant,
    EventRegistration,
    RegistrationStatus,
)
from organization.tasks import (
    send_event_registration_confirmation_email as _send_registration_email,
)

logger = logging.getLogger(__name__)


class RegisterForEventView(APIView):
    """
    POST /api/projects/{url_slug}/register/

    Registers the authenticated user for an event that has registration enabled.

    Behaviour:
        - 201 Created  — first-time registration; EventParticipant row created.
        - 200 OK       — idempotent; user was already registered.
        - 400 Bad Request — registration is closed, full, or deadline has passed.
        - 401 Unauthorized — unauthenticated request.
        - 404 Not Found — project or event_registration does not exist.

    Race-condition safety:
        The EventRegistration row is locked with SELECT FOR UPDATE inside an atomic
        transaction.  This serialises concurrent last-seat registrations so that no
        more than max_participants participants can ever be stored.

    Response body (both 200 and 201):
        {
            "registered": true,
            "available_seats": <int | null>
        }
    """

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, url_slug):

        # ── 1. Look up project ──────────────────────────────────────────────
        try:
            project = Project.objects.get(url_slug=url_slug)
        except Project.DoesNotExist:
            return Response(
                {"message": "Project not found: {}".format(url_slug)},
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── 2. Look up EventRegistration (lock row for duration of txn) ─────
        try:
            er = EventRegistration.objects.select_for_update().get(project=project)
        except EventRegistration.DoesNotExist:
            return Response(
                {"message": "This project does not have event registration enabled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 3. Idempotency check — return 200 if already registered ─────────
        already_registered = EventParticipant.objects.filter(
            user=request.user, event_registration=er
        ).exists()
        if already_registered:
            return Response(
                {
                    "registered": True,
                    "available_seats": self._compute_available_seats(er),
                },
                status=status.HTTP_200_OK,
            )

        # ── 4. Validate that registration is currently open ──────────────────
        if er.status != RegistrationStatus.OPEN:
            return Response(
                {
                    "message": (
                        "Registration is currently closed."
                        if er.status == RegistrationStatus.CLOSED
                        else "The event is fully booked."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if er.registration_end_date and timezone.now() >= er.registration_end_date:
            return Response(
                {"message": "The registration deadline has passed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 5. Capacity check (inside the lock) ──────────────────────────────
        if er.max_participants is not None:
            current_count = EventParticipant.objects.filter(
                event_registration=er
            ).count()
            if current_count >= er.max_participants:
                # Ensure status reflects reality even if it was missed earlier.
                er.status = RegistrationStatus.FULL
                er.save(update_fields=["status", "updated_at"])
                return Response(
                    {"message": "Sorry, the event is now fully booked."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # ── 6. Create EventParticipant ────────────────────────────────────────
        EventParticipant.objects.create(
            user=request.user,
            event_registration=er,
        )

        # ── 7. Update status to FULL if last seat was just taken ─────────────
        available_seats = None
        if er.max_participants is not None:
            new_count = EventParticipant.objects.filter(event_registration=er).count()
            available_seats = max(0, er.max_participants - new_count)
            if available_seats == 0:
                er.status = RegistrationStatus.FULL
                er.save(update_fields=["status", "updated_at"])

        logger.info(
            "[EventRegistration] User %s registered for project '%s'",
            request.user.id,
            project.url_slug,
        )

        # ── 8. Dispatch async confirmation email ──────────────────────────────
        # Capture values eagerly — lambda closes over variables by reference, so
        # evaluating request.user.id inside the lambda would run after the
        # transaction commits, at which point DRF may resolve a different user.
        _user_id = request.user.id
        _event_slug = project.url_slug
        transaction.on_commit(
            lambda: _send_registration_email.delay(
                user_id=_user_id,
                event_slug=_event_slug,
            )
        )

        return Response(
            {"registered": True, "available_seats": available_seats},
            status=status.HTTP_201_CREATED,
        )

    @staticmethod
    def _compute_available_seats(er: EventRegistration):
        """Return remaining seats or None for unlimited-capacity events."""
        if er.max_participants is None:
            return None
        count = EventParticipant.objects.filter(event_registration=er).count()
        return max(0, er.max_participants - count)

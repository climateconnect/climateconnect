import logging

from django.contrib.auth.models import User
from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from climateconnect_api.models import Role
from organization.models import Project, ProjectMember
from organization.models.event_registration import (
    EventParticipant,
    EventRegistration,
    RegistrationStatus,
)
from organization.serializers.event_registration import (
    EditEventRegistrationSerializer,
    EventParticipantSerializer,
    SendOrganizerEmailSerializer,
    _compute_effective_status,
)
from organization.tasks import (
    send_event_registration_confirmation_email as _send_registration_email,
    send_organizer_message_to_guests as _send_organizer_email_task,
)
from organization.utility.email import send_organizer_message_to_guest

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
        effective_status = _compute_effective_status(er)
        if effective_status != RegistrationStatus.OPEN:
            _message_map = {
                RegistrationStatus.CLOSED: "Registration is currently closed.",
                RegistrationStatus.FULL: "The event is fully booked.",
                RegistrationStatus.ENDED: "The registration deadline has passed.",
            }
            return Response(
                {
                    "message": _message_map.get(
                        effective_status, "Registration is not available."
                    )
                },
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


class EditEventRegistrationSettingsView(APIView):
    """
    PATCH /api/projects/{url_slug}/registration/

    Allows an event organiser (or team admin) to update registration settings
    for an event that already has EventRegistration enabled.

    Editable fields:
        - max_participants  (positive integer or null for unlimited)
        - registration_end_date  (datetime)
        - status  ("open" or "closed" only — "full" and "ended" are system-managed)

    Status change rules:
        - "open" → "closed"   Organiser manually closes registration.
        - "closed" → "open"   Organiser reopens (permitted unless deadline has passed).
        - "full" → "open"     Organiser overrides the system capacity block.
        - Setting "open" when effective_status == "ended" (deadline has passed)
          returns 400 — extend registration_end_date first, then reopen.
        - "full" and "ended" cannot be set via the API (400 Bad Request).
        - Setting status to its current stored value is idempotent (200 OK).

    Behaviour:
        - 200 OK          — settings updated; returns updated event_registration.
        - 400 Bad Request — validation error (past date, invalid status, etc.).
        - 401 Unauthorized — unauthenticated request.
        - 403 Forbidden    — authenticated user without edit rights on the project.
        - 404 Not Found    — project or EventRegistration does not exist.

    Response body (200 OK):
        {
            "max_participants": 80,
            "registration_end_date": "2026-07-01T18:00:00Z",
            "status": "open" | "closed" | "full" | "ended",
            "available_seats": 75
        }
    """

    permission_classes = [IsAuthenticated]

    def patch(self, request, url_slug):

        # ── 1. Look up project ──────────────────────────────────────────────
        try:
            project = Project.objects.get(url_slug=url_slug)
        except Project.DoesNotExist:
            return Response(
                {"message": "Project not found: {}".format(url_slug)},
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── 2. Check edit rights (after project lookup so 404 takes priority) ─
        has_edit_rights = ProjectMember.objects.filter(
            user=request.user,
            role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE],
            project=project,
        ).exists()
        if not has_edit_rights:
            return Response(
                {"message": "You do not have permission to edit this project."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # ── 3. Look up EventRegistration ────────────────────────────────────
        try:
            er = project.event_registration
        except EventRegistration.DoesNotExist:
            return Response(
                {"message": ("This project does not have event registration enabled.")},
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── 4. Validate and save ─────────────────────────────────────────────
        serializer = EditEventRegistrationSerializer(
            er,
            data=request.data,
            partial=True,
            context={"project": project, "request": request},
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()

        logger.info(
            "[EventRegistration] Organiser %s updated registration settings for '%s'",
            request.user.id,
            url_slug,
        )

        return Response(serializer.data, status=status.HTTP_200_OK)


class ListEventParticipantsView(APIView):
    """
    GET /api/projects/{url_slug}/registrations/

    Returns the full list of active participants for an event.
    Restricted to event organisers and team admins (role_type ALL or READ_WRITE).

    Response: list of EventParticipantSerializer dicts, ordered by registered_at asc.
    No backend pagination — all rows returned in one response; client-side paging
    is handled by the MUI DataGrid in the frontend.

    See spec: doc/spec/20260401_1000_organizer_see_registration_status.md
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, url_slug):

        # ── 1. Look up project ──────────────────────────────────────────────
        try:
            project = Project.objects.get(url_slug=url_slug)
        except Project.DoesNotExist:
            return Response(
                {"message": "Project not found: {}".format(url_slug)},
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── 2. Check organiser/admin permission ─────────────────────────────
        # Inline check — consistent with EditEventRegistrationSettingsView.
        has_edit_rights = ProjectMember.objects.filter(
            user=request.user,
            role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE],
            project=project,
        ).exists()
        if not has_edit_rights:
            return Response(
                {
                    "message": (
                        "You do not have permission to view registrations "
                        "for this project."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ── 3. Look up EventRegistration ────────────────────────────────────
        try:
            er = project.event_registration
        except EventRegistration.DoesNotExist:
            return Response(
                {"message": "This project does not have event registration enabled."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── 4. Query participants ────────────────────────────────────────────
        # select_related avoids N+1 when the serializer reads user.first_name,
        # user.last_name, user.user_profile.url_slug, and
        # user.user_profile.thumbnail_image.
        # TODO #1850: add .filter(cancelled_at__isnull=True) once cancelled_at is added
        participants = (
            EventParticipant.objects.select_related("user__user_profile")
            .filter(event_registration=er)
            .order_by("registered_at")
        )

        serializer = EventParticipantSerializer(
            participants, many=True, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


class SendOrganizerEmailView(APIView):
    """
    POST /api/projects/{url_slug}/registrations/email/

    Sends an organiser-authored plain-text email to all active event guests
    (``is_test=false``) or a single test copy to the authenticated organiser
    (``is_test=true``).

    Always returns ``{"sent_count": <int>}`` — ``1`` for test, ``N`` for bulk.
    Bulk dispatch is asynchronous (Celery task); test dispatch is synchronous.

    The subject is prefixed with ``"[TEST] "`` for test sends so the organiser
    can recognise them in their inbox.

    See spec: doc/spec/20260401_1100_organizer_send_email_to_guests.md
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, url_slug):

        # ── 1. Validate input ────────────────────────────────────────────
        serializer = SendOrganizerEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        subject = serializer.validated_data["subject"]
        message = serializer.validated_data["message"]
        is_test = serializer.validated_data["is_test"]

        # ── 2. Look up project ──────────────────────────────────────────
        try:
            project = (
                Project.objects.select_related("loc", "language")
                .prefetch_related(
                    "translation_project__language",
                    "project_parent__parent_organization__language",
                    "project_parent__parent_organization__translation_org__language",
                    "project_parent__parent_user__user_profile",
                )
                .get(url_slug=url_slug)
            )
        except Project.DoesNotExist:
            return Response(
                {"message": "Project not found: {}".format(url_slug)},
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── 3. Permission check — organiser or team admin ───────────────
        has_edit_rights = ProjectMember.objects.filter(
            user=request.user,
            role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE],
            project=project,
        ).exists()
        if not has_edit_rights:
            return Response(
                {
                    "message": (
                        "You do not have permission to send emails for this event."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ── 4. Look up EventRegistration ────────────────────────────────
        try:
            er = project.event_registration
        except EventRegistration.DoesNotExist:
            return Response(
                {"message": "This project does not have event registration enabled."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if is_test:
            # Synchronous — single email to the organiser themselves.
            # Prepend "[TEST] " so the organiser can identify it in their inbox.
            test_subject = "[TEST] {}".format(subject)
            organiser = User.objects.select_related("user_profile__location").get(
                id=request.user.id
            )
            try:
                send_organizer_message_to_guest(
                    organiser, project, test_subject, message
                )
            except Exception as exc:
                logger.error(
                    "[OrganizerEmail] Test send failed for user %s, event '%s': %s",
                    request.user.id,
                    url_slug,
                    exc,
                )
                return Response(
                    {"message": "Failed to send test email. Please try again."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            return Response({"sent_count": 1}, status=status.HTTP_200_OK)

        # ── 5. Bulk send — count participants, then dispatch async ───────
        # TODO #1850: add .filter(cancelled_at__isnull=True) once cancelled_at is added
        user_ids = list(
            EventParticipant.objects.filter(event_registration=er).values_list(
                "user_id", flat=True
            )
        )
        sent_count = len(user_ids)

        _send_organizer_email_task.delay(
            event_slug=url_slug,
            user_ids=user_ids,
            subject=subject,
            message=message,
        )

        logger.info(
            "[OrganizerEmail] Bulk send dispatched for event '%s': %d recipients",
            url_slug,
            sent_count,
        )

        return Response({"sent_count": sent_count}, status=status.HTTP_200_OK)

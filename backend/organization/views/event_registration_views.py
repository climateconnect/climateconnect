import logging

from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from climateconnect_api.models import Role
from organization.models import Project, ProjectMember
from organization.models.event_registration import (
    EventRegistration,
    EventRegistrationConfig,
    RegistrationStatus,
)
from organization.serializers.event_registration import (
    EditEventRegistrationConfigSerializer,
    EventRegistrationSerializer,
    SendOrganizerEmailSerializer,
    _compute_effective_status,
)
from organization.tasks import (
    notify_admins_of_registration_change as _notify_admins_task,
    send_event_registration_confirmation_email as _send_registration_email,
    send_organizer_message_to_guests as _send_organizer_email_task,
)
from organization.utility.email import (
    send_guest_cancellation_notification,
    send_organizer_message_to_guest,
)

logger = logging.getLogger(__name__)


class EventRegistrationsView(APIView):
    """
    POST /api/projects/{url_slug}/registrations/  — Member registers for the event.
    GET  /api/projects/{url_slug}/registrations/  — Organiser lists all registrations.

    POST behaviour:
        - 201 Created  — first-time registration or re-registration after self-cancellation.
        - 200 OK       — idempotent; user already has an active registration.
        - 400 Bad Request — registration is closed, full, or deadline has passed.
        - 401 Unauthorized — unauthenticated request.
        - 403 Forbidden — user's registration was cancelled by an admin; cannot re-register.
        - 404 Not Found — project or registration_config does not exist.

    GET behaviour (organiser/admin only):
        Returns ALL registrations (active and cancelled) ordered by registered_at asc.
        Includes ``id`` and ``cancelled_at`` on each row so the frontend can
        distinguish active from cancelled and target individual rows for admin-cancellation.
        No backend pagination; client-side paging via MUI DataGrid.

    See spec: doc/spec/20260309_0900_member_register_for_event.md
             doc/spec/20260309_1500_member_cancel_event_registration.md
             doc/spec/20260401_1000_organizer_see_registration_status.md
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

        # ── 2. Look up EventRegistrationConfig (lock row for duration of txn) ─
        try:
            rc = EventRegistrationConfig.objects.select_for_update().get(
                project=project
            )
        except EventRegistrationConfig.DoesNotExist:
            return Response(
                {"message": "This project does not have event registration enabled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 3. Check for an existing record (active OR cancelled) ────────────
        try:
            existing = EventRegistration.objects.select_for_update().get(
                user=request.user, registration_config=rc
            )
        except EventRegistration.DoesNotExist:
            existing = None

        if existing is not None:
            if existing.cancelled_at is None:
                # Already actively registered — idempotent.
                return Response(
                    {
                        "registered": True,
                        "available_seats": self._compute_available_seats(rc),
                    },
                    status=status.HTTP_200_OK,
                )
            else:
                # A cancelled record exists.
                if existing.cancelled_by_id != request.user.id:
                    # Admin-cancelled — member may not self-re-register.
                    return Response(
                        {
                            "message": (
                                "Your registration was cancelled by an administrator. "
                                "You cannot re-register for this event."
                            )
                        },
                        status=status.HTTP_403_FORBIDDEN,
                    )
                # Self-cancelled — fall through to registration-open check,
                # then re-use the existing row.

        # ── 4. Validate that registration is currently open ──────────────────
        effective_status = _compute_effective_status(rc)
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

        # ── 5. Capacity check (inside the lock; active registrations only) ───
        if rc.max_participants is not None:
            current_count = EventRegistration.objects.filter(
                registration_config=rc,
                cancelled_at__isnull=True,
            ).count()
            if current_count >= rc.max_participants:
                # Ensure status reflects reality even if it was missed earlier.
                rc.status = RegistrationStatus.FULL
                rc.save(update_fields=["status", "updated_at"])
                return Response(
                    {"message": "Sorry, the event is now fully booked."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # ── 6. Create or re-activate EventRegistration ───────────────────────
        if existing is not None:
            # Re-registration: reset soft-delete fields on the existing row.
            existing.cancelled_at = None
            existing.cancelled_by = None
            existing.save(update_fields=["cancelled_at", "cancelled_by"])
        else:
            EventRegistration.objects.create(
                user=request.user,
                registration_config=rc,
            )

        # ── 7. Update status to FULL if last seat was just taken ─────────────
        available_seats = None
        if rc.max_participants is not None:
            new_count = EventRegistration.objects.filter(
                registration_config=rc,
                cancelled_at__isnull=True,
            ).count()
            available_seats = max(0, rc.max_participants - new_count)
            if available_seats == 0:
                rc.status = RegistrationStatus.FULL
                rc.save(update_fields=["status", "updated_at"])

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

        # ── 9. Dispatch async admin notification (only when notify_admins=True) ─
        # Re-check is done inside the task to handle flag toggling between
        # dispatch and execution.  No extra DB query here when flag is False.
        if rc.notify_admins:
            _project_id = project.id
            _guest_user_id = request.user.id
            transaction.on_commit(
                lambda: _notify_admins_task.delay(
                    project_id=_project_id,
                    guest_user_id=_guest_user_id,
                    change_type="registered",
                )
            )

        return Response(
            {"registered": True, "available_seats": available_seats},
            status=status.HTTP_201_CREATED,
        )

    @staticmethod
    def _compute_available_seats(rc: EventRegistrationConfig):
        """Return remaining seats or None for unlimited-capacity events.

        Only active (non-cancelled) registrations count against capacity.
        """
        if rc.max_participants is None:
            return None
        count = EventRegistration.objects.filter(
            registration_config=rc,
            cancelled_at__isnull=True,
        ).count()
        return max(0, rc.max_participants - count)

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

        # ── 3. Look up EventRegistrationConfig ───────────────────────────────
        try:
            rc = project.registration_config
        except EventRegistrationConfig.DoesNotExist:
            return Response(
                {"message": "This project does not have event registration enabled."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── 4. Query ALL registrations (active + cancelled) ──────────────────
        # Returns all rows so organisers can see the full history including
        # cancellations. ``id`` and ``cancelled_at`` are included in the response
        # so the frontend can target individual rows for admin-cancellation.
        registrations = (
            EventRegistration.objects.select_related("user__user_profile")
            .filter(registration_config=rc)
            .order_by("registered_at")
        )

        serializer = EventRegistrationSerializer(
            registrations, many=True, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    @transaction.atomic
    def delete(self, request, url_slug):
        """
        DELETE /api/projects/{url_slug}/registrations/

        Allows the authenticated member to cancel their own registration for an
        upcoming event (soft delete: sets ``cancelled_at`` and ``cancelled_by``).

        Response codes:
            204 No Content  — cancellation successful.
            400 Bad Request — event has already started.
            401 Unauthorized — unauthenticated request.
            403 Forbidden   — registration belongs to a different user.
            404 Not Found   — no active registration exists for this user and event.

        See spec: doc/spec/20260309_1500_member_cancel_event_registration.md
        """

        # ── 1. Look up project ──────────────────────────────────────────────
        try:
            project = Project.objects.get(url_slug=url_slug)
        except Project.DoesNotExist:
            return Response(
                {"message": "Project not found: {}".format(url_slug)},
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── 2. Look up EventRegistrationConfig ───────────────────────────────
        try:
            rc = EventRegistrationConfig.objects.select_for_update().get(
                project=project
            )
        except EventRegistrationConfig.DoesNotExist:
            return Response(
                {"message": "This project does not have event registration enabled."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── 3. Look up the registration record for the requesting user ───────
        #       Explicit ownership check gives 403 instead of a silent 404 when a
        #       registration exists for a different user.
        try:
            reg = EventRegistration.objects.select_for_update().get(
                registration_config=rc,
                user=request.user,
            )
        except EventRegistration.DoesNotExist:
            return Response(
                {"message": "You do not have an active registration for this event."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── 4. Ownership check (explicit, per spec) ──────────────────────────
        if reg.user_id != request.user.id:
            return Response(
                {"message": "You do not have permission to cancel this registration."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # ── 5. Check registration is currently active ────────────────────────
        if reg.cancelled_at is not None:
            return Response(
                {"message": "You do not have an active registration for this event."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── 6. Check event has not yet started ───────────────────────────────
        if project.start_date and project.start_date <= timezone.now():
            return Response(
                {
                    "message": "Cannot cancel a registration for an event that has already started."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 7. Soft-delete: set cancelled_at and cancelled_by ────────────────
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = request.user
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

        # ── 8. Revert FULL → OPEN if cancellation freed a seat ──────────────
        if rc.status == RegistrationStatus.FULL and rc.max_participants is not None:
            active_count = EventRegistration.objects.filter(
                registration_config=rc,
                cancelled_at__isnull=True,
            ).count()
            if active_count < rc.max_participants:
                rc.status = RegistrationStatus.OPEN
                rc.save(update_fields=["status", "updated_at"])

        logger.info(
            "[EventRegistration] User %s cancelled registration for project '%s'",
            request.user.id,
            project.url_slug,
        )

        # ── 9. Dispatch async admin notification (only when notify_admins=True) ─
        # This is a self-cancellation, so the admin notification is appropriate.
        # Capture values eagerly before the transaction commits.
        if rc.notify_admins:
            _project_id = project.id
            _guest_user_id = request.user.id
            transaction.on_commit(
                lambda: _notify_admins_task.delay(
                    project_id=_project_id,
                    guest_user_id=_guest_user_id,
                    change_type="cancelled",
                )
            )

        return Response(status=status.HTTP_204_NO_CONTENT)


class EditRegistrationConfigView(APIView):
    """
    PATCH /api/projects/{url_slug}/registration-config/

    Allows an event organiser (or team admin) to update registration settings
    for an event that already has EventRegistrationConfig enabled.

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
        - 200 OK          — settings updated; returns updated registration_config.
        - 400 Bad Request — validation error (past date, invalid status, etc.).
        - 401 Unauthorized — unauthenticated request.
        - 403 Forbidden    — authenticated user without edit rights on the project.
        - 404 Not Found    — project or EventRegistrationConfig does not exist.

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

        # ── 3. Look up EventRegistrationConfig ───────────────────────────────
        try:
            rc = project.registration_config
        except EventRegistrationConfig.DoesNotExist:
            return Response(
                {"message": ("This project does not have event registration enabled.")},
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── 4. Validate and save ─────────────────────────────────────────────
        serializer = EditEventRegistrationConfigSerializer(
            rc,
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


class SendOrganizerEmailView(APIView):
    """
    POST /api/projects/{url_slug}/registrations/email/

    Sends an organiser-authored plain-text email to all active event guests
    **and all team admins** (``is_test=false``), or a single test copy to the
    authenticated organiser (``is_test=true``).

    For bulk sends, the recipient list is the union of active (non-cancelled)
    registered guests and project members with organiser/write-access role.
    A team admin who is also a registered guest receives only one copy.

    Always returns ``{"sent_count": <int>}`` — total unique recipients for bulk,
    ``1`` for test.
    Bulk dispatch is asynchronous (Celery task); test dispatch is synchronous.

    The subject is prefixed with ``"[TEST] "`` for test sends so the organiser
    can recognise them in their inbox.

    See spec: doc/spec/20260414_1300_send_email_to_guests_improvements.md
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

        # ── 4. Look up EventRegistrationConfig ───────────────────────────
        try:
            rc = project.registration_config
        except EventRegistrationConfig.DoesNotExist:
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

        # ── 5. Bulk send — active guests + team admins (deduped) ────────
        guest_user_ids = set(
            EventRegistration.objects.filter(
                registration_config=rc,
                cancelled_at__isnull=True,
            ).values_list("user_id", flat=True)
        )

        # Team admins receive a copy so they have full visibility into
        # communications sent to attendees (#1886).
        admin_user_ids = set(
            ProjectMember.objects.filter(
                project=project,
                role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE],
            ).values_list("user_id", flat=True)
        )

        # A team admin who is also a registered guest must receive only one copy.
        combined_user_ids = list(guest_user_ids | admin_user_ids)
        sent_count = len(combined_user_ids)

        _send_organizer_email_task.delay(
            event_slug=url_slug,
            user_ids=combined_user_ids,
            subject=subject,
            message=message,
        )

        logger.info(
            "[OrganizerEmail] Bulk send dispatched for event '%s': %d recipients "
            "(%d guests, %d admins, %d overlap)",
            url_slug,
            sent_count,
            len(guest_user_ids),
            len(admin_user_ids),
            len(guest_user_ids & admin_user_ids),
        )

        return Response({"sent_count": sent_count}, status=status.HTTP_200_OK)


class AdminCancelRegistrationView(APIView):
    """
    PATCH /api/projects/{url_slug}/registrations/{registration_id}/

    Allows an event organiser or team admin to cancel a specific guest's
    registration (soft delete: sets ``cancelled_at`` and ``cancelled_by``).

    An optional ``message`` field in the request body triggers a cancellation
    notification email to the guest. If absent or empty, no email is sent.

    Response codes:
        204 No Content  — cancellation successful.
        400 Bad Request — registration already cancelled, or message exceeds 1000 chars.
        401 Unauthorized — unauthenticated request.
        403 Forbidden   — authenticated but not an organiser or team admin.
        404 Not Found   — project, registration config, or registration not found.

    See spec: doc/spec/20260407_1000_organizer_cancel_guest_registration.md
    """

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, url_slug, registration_id):

        # ── 1. Look up project ──────────────────────────────────────────────
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

        # ── 2. Organiser/admin permission check ─────────────────────────────
        has_edit_rights = ProjectMember.objects.filter(
            user=request.user,
            role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE],
            project=project,
        ).exists()
        if not has_edit_rights:
            return Response(
                {
                    "message": (
                        "You do not have permission to cancel registrations "
                        "for this project."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ── 3. Look up EventRegistrationConfig ───────────────────────────────
        try:
            rc = EventRegistrationConfig.objects.select_for_update().get(
                project=project
            )
        except EventRegistrationConfig.DoesNotExist:
            return Response(
                {"message": "This project does not have event registration enabled."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── 4. Look up the specific EventRegistration by ID ─────────────────
        try:
            reg = EventRegistration.objects.select_for_update().get(
                id=registration_id,
                registration_config=rc,
            )
        except EventRegistration.DoesNotExist:
            return Response(
                {"message": "Registration not found on this project."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # ── 5. Guard: already cancelled → 400 ───────────────────────────────
        if reg.cancelled_at is not None:
            return Response(
                {"message": "This registration is already cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── 6. Soft-delete: set cancelled_at and cancelled_by ────────────────
        reg.cancelled_at = timezone.now()
        reg.cancelled_by = request.user
        reg.save(update_fields=["cancelled_at", "cancelled_by"])

        # ── 7. Revert FULL → OPEN if cancellation freed a seat ──────────────
        if rc.status == RegistrationStatus.FULL and rc.max_participants is not None:
            active_count = EventRegistration.objects.filter(
                registration_config=rc,
                cancelled_at__isnull=True,
            ).count()
            if active_count < rc.max_participants:
                rc.status = RegistrationStatus.OPEN
                rc.save(update_fields=["status", "updated_at"])

        logger.info(
            "[EventRegistration] Admin %s cancelled registration %s for project '%s'",
            request.user.id,
            registration_id,
            project.url_slug,
        )

        # ── 8. Optional cancellation notification email ──────────────────────
        message = request.data.get("message", "").strip()
        if message and len(message) > 1000:
            return Response(
                {"message": "Message must be 1000 characters or fewer."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if message:
            guest = reg.user
            try:
                # Re-fetch guest with location for email helper.
                guest = User.objects.select_related("user_profile__location").get(
                    id=guest.id
                )
                send_guest_cancellation_notification(guest, project, message)
            except Exception as exc:
                # Log but do not fail the request — cancellation is already committed.
                logger.error(
                    "[AdminCancelRegistration] Email to guest %s failed for event '%s': %s",
                    guest.id,
                    url_slug,
                    exc,
                )

        return Response(status=status.HTTP_204_NO_CONTENT)

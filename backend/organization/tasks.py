"""
Celery tasks for the organization app.

Currently includes:
    - send_event_registration_confirmation_email: async confirmation email
      sent after a successful event registration.
    - send_organizer_message_to_guests: async bulk send of an organiser-authored
      email to all active participants for an event.
    - notify_admins_of_registration_change: async notification emails to all
      team admins when a member registers or self-cancels (gated by
      EventRegistrationConfig.notify_admins).
"""

import logging

from django.contrib.auth.models import User

from climateconnect_main.celery import app

logger = logging.getLogger(__name__)


@app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_event_registration_confirmation_email(self, user_id: int, event_slug: str):
    """
    Send a registration confirmation email to a user who just registered for an event.

    This task is dispatched asynchronously (via .delay()) immediately after the
    EventRegistration row is created, so it never blocks the HTTP response.

    Retries up to 3 times with a 60-second delay on transient failures (e.g. Mailjet
    downtime).  Permanent failures (missing user, missing project) are logged and
    not retried.

    Args:
        user_id: Primary key of the registering User.
        event_slug: URL slug of the event Project.
    """
    from organization.models.project import Project
    from organization.utility.email import (
        send_event_registration_confirmation_to_user,
    )

    try:
        user = User.objects.select_related("user_profile__location").get(id=user_id)
        # add logging
        logger.info(
            "[EventRegistration] Sending confirmation email to user %s for event '%s'",
            user_id,
            event_slug,
        )
    except User.DoesNotExist:
        logger.error(
            "[EventRegistration] Cannot send confirmation: User %s not found", user_id
        )
        return

    try:
        project = (
            Project.objects.select_related("registration_config", "loc", "language")
            .prefetch_related(
                "translation_project__language",
                "project_parent__parent_organization__language",
                "project_parent__parent_organization__translation_org__language",
                "project_parent__parent_user__user_profile",
            )
            .get(url_slug=event_slug)
        )
    except Project.DoesNotExist:
        logger.error(
            "[EventRegistration] Cannot send confirmation: Project '%s' not found",
            event_slug,
        )
        return

    try:
        send_event_registration_confirmation_to_user(user=user, project=project)
    except Exception as exc:
        logger.error(
            "[EventRegistration] Failed to send confirmation email to user %s "
            "for event '%s': %s",
            user_id,
            event_slug,
            exc,
        )
        raise self.retry(exc=exc)


@app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_organizer_message_to_guests(
    self, event_slug: str, user_ids: list, subject: str, message: str
):
    """
    Async bulk send: deliver an organiser-composed email to a list of event guests.

    ``user_ids`` is a pre-computed list of User PKs captured at request time so
    the task operates on a stable snapshot of active participants even if
    cancellations arrive between the HTTP request and task execution.

    Retries up to 3 times with a 60-second delay on transient failure
    (consistent with send_event_registration_confirmation_email).

    Args:
        event_slug: URL slug of the event Project.
        user_ids:   List of User PKs to email.
        subject:    Organiser-provided subject string.
        message:    Organiser-provided plain-text body.
    """
    from organization.models.project import Project
    from organization.utility.email import send_organizer_message_to_guest

    try:
        project = (
            Project.objects.select_related("loc", "language")
            .prefetch_related(
                "translation_project__language",
                "project_parent__parent_organization__language",
                "project_parent__parent_organization__translation_org__language",
                "project_parent__parent_user__user_profile",
            )
            .get(url_slug=event_slug)
        )
    except Project.DoesNotExist:
        logger.error(
            "[OrganizerEmail] Project '%s' not found — aborting bulk send", event_slug
        )
        return

    # TODO #1850: user_ids already captures a snapshot at request time, but once
    # cancelled_at exists the view's queryset should pre-filter cancelled rows
    # so they never enter user_ids in the first place.
    users = User.objects.select_related("user_profile__location").filter(
        id__in=user_ids
    )

    for user in users:
        try:
            send_organizer_message_to_guest(user, project, subject, message)
        except Exception as exc:
            logger.error(
                "[OrganizerEmail] Failed to send to user %s for event '%s': %s",
                user.id,
                event_slug,
                exc,
            )
            raise self.retry(exc=exc)

    logger.info(
        "[OrganizerEmail] Sent organiser email to %d guests for event '%s'",
        len(user_ids),
        event_slug,
    )


@app.task(bind=True, max_retries=3, default_retry_delay=60)
def notify_admins_of_registration_change(
    self, project_id: int, guest_user_id: int, change_type: str
):
    """
    Notify all team admins of a member registration or self-cancellation.

    Dispatched asynchronously (via .delay()) inside a ``transaction.on_commit``
    callback so it only fires after the enclosing DB transaction commits
    successfully.

    The task re-reads ``EventRegistrationConfig.notify_admins`` from the DB
    before doing any work — if the flag has been toggled off between the HTTP
    request and task execution, the task exits early without sending any emails.

    One admin's email failure does not prevent notifications to other admins:
    each send is wrapped in its own try/except.  If any admin's send fails, the
    task retries (up to 3 times, 60-second delay) so the failing admin eventually
    receives their notification.

    Args:
        project_id:    Primary key of the event Project.
        guest_user_id: Primary key of the member who registered or cancelled.
        change_type:   ``"registered"`` or ``"cancelled"``.
    """
    from climateconnect_api.models import Role
    from organization.models.project import Project
    from organization.models.event_registration import EventRegistrationConfig
    from organization.utility.email import send_admin_event_notification

    # ── 1. Look up project ────────────────────────────────────────────────────
    try:
        project = (
            Project.objects.select_related("loc", "language")
            .prefetch_related(
                "translation_project__language",
                "project_parent__parent_organization__language",
                "project_parent__parent_organization__translation_org__language",
                "project_parent__parent_user__user_profile",
            )
            .get(id=project_id)
        )
    except Project.DoesNotExist:
        logger.warning(
            "[AdminNotification] Project %s not found — aborting admin notification",
            project_id,
        )
        return

    # ── 2. Look up guest user ─────────────────────────────────────────────────
    try:
        guest_user = User.objects.select_related("user_profile").get(id=guest_user_id)
    except User.DoesNotExist:
        logger.warning(
            "[AdminNotification] Guest user %s not found — aborting admin notification",
            guest_user_id,
        )
        return

    # ── 3. Re-check notify_admins flag (may have been toggled since dispatch) ─
    try:
        rc = EventRegistrationConfig.objects.get(project=project)
    except EventRegistrationConfig.DoesNotExist:
        logger.warning(
            "[AdminNotification] No EventRegistrationConfig for project %s — aborting",
            project_id,
        )
        return

    if not rc.notify_admins:
        logger.info(
            "[AdminNotification] notify_admins=False for project %s — skipping",
            project_id,
        )
        return

    # ── 4. Fetch all team admins (organiser + write-access project members) ───
    # ProjectMember.user has related_name="project_member_user" (see organization/models/members.py)
    admin_users = User.objects.select_related("user_profile__location").filter(
        project_member_user__project=project,
        project_member_user__role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE],
    )

    if not admin_users.exists():
        logger.info(
            "[AdminNotification] No team admins found for project %s — nothing to send",
            project_id,
        )
        return

    # ── 5. Send notification to each admin; failures are isolated ─────────────
    failed = False
    for admin in admin_users:
        try:
            send_admin_event_notification(
                admin_user=admin,
                project=project,
                guest_user=guest_user,
                change_type=change_type,
            )
            logger.info(
                "[AdminNotification] Sent %s notification to admin %s for project %s",
                change_type,
                admin.id,
                project_id,
            )
        except Exception as exc:
            logger.error(
                "[AdminNotification] Failed to send %s notification to admin %s "
                "for project %s: %s",
                change_type,
                admin.id,
                project_id,
                exc,
            )
            failed = True

    if failed:
        raise self.retry(
            exc=Exception(
                f"[AdminNotification] One or more admin notifications failed for project {project_id}"
            )
        )

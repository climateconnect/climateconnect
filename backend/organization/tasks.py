"""
Celery tasks for the organization app.

Currently includes:
    - send_event_registration_confirmation_email: async confirmation email
      sent after a successful event registration.
    - send_organizer_message_to_guests: async bulk send of an organiser-authored
      email to all active participants for an event.
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

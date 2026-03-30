"""
Celery tasks for the organization app.

Currently includes:
    - send_event_registration_confirmation_email: async confirmation email
      sent after a successful event registration.
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
    EventParticipant row is created, so it never blocks the HTTP response.

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
            Project.objects.select_related("event_registration", "loc", "language")
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


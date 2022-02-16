import logging
from typing import List

from climateconnect_main.celery import app
from django.conf import settings
from django.contrib.auth.models import User

from climateconnect_api.models import UserNotification
from climateconnect_api.utility.email_setup import \
    send_email_reminder_for_unread_notifications 

logger = logging.getLogger(__name__)


@app.task
def add(a, b):
    logger.info(f"testing.... {a+b}")


@app.task
def schedule_automated_reminder_for_user_notifications():
    # Get all user_ids for people who have not checked their notification
    all_user_ids = list(UserNotification.objects.filter(
        read_at__isnull=True
        ).values_list('user_id', flat=True).distinct()
    )
    for i in range(0, len(all_user_ids), settings.USER_CHUNK_SIZE):
        user_ids = [
            u_ids for u_ids in all_user_ids[i: i + settings.USER_CHUNK_SIZE]
        ]
        send_email_notifications.apply_async((user_ids,))


@app.task(bind=True)
def send_email_notifications(self, user_ids: List):
    for u_id in user_ids:
        try:
            user = User.objects.get(user_id=u_id)
        except User.DoesNotExist:
            logger.info(f"User profile does not exists for user {u_id}")
            continue

        unread_user_notifications = UserNotification.objects.filter(
            user_id=u_id, read_at__isnull=True
        )

        if unread_user_notifications.exists():
            send_email_reminder_for_unread_notifications(
                user=user,
                user_notifications=unread_user_notifications
            )

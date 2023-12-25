import logging
from datetime import timedelta
from typing import List
from organization.models.project import Project

from climateconnect_main.celery import app
from django.conf import settings
from django.contrib.auth.models import User
from django.utils import timezone

from climateconnect_api.models import UserNotification, Notification
from climateconnect_api.utility.email_setup import (
    send_email_reminder_for_unread_notifications,
    send_test_mail_to_engineering_email,
)

logger = logging.getLogger(__name__)


@app.task
def testing_task_1():
    send_test_mail_to_engineering_email("task 1", "test")


@app.task
def testing_task_2():
    send_test_mail_to_engineering_email("task 2", "test2")


@app.task
def testing_task_3():
    send_test_mail_to_engineering_email("task 3", "test3")


@app.task
def schedule_automated_reminder_for_user_notifications():
    # Get all user_ids for people who have not checked their notification
    all_user_ids = list(
        UserNotification.objects.filter(
            read_at__isnull=True,
            created_at__lte=(timezone.now() - timedelta(days=2)),
            notification__notification_type=Notification.PRIVATE_MESSAGE,
        )
        .values_list("user_id", flat=True)
        .distinct()
    )
    for i in range(0, len(all_user_ids), settings.USER_CHUNK_SIZE):
        user_ids = [u_ids for u_ids in all_user_ids[i : i + settings.USER_CHUNK_SIZE]]
        send_email_notifications.apply_async((user_ids,))


@app.task(bind=True)
def send_email_notifications(self, user_ids: List):
    for u_id in user_ids:
        try:
            user = User.objects.get(id=u_id)
        except User.DoesNotExist:
            logger.info(f"User profile does not exists for user {u_id}")
            continue

        unread_user_notifications = UserNotification.objects.filter(
            user=user,
            read_at__isnull=True,
            notification__notification_type=Notification.PRIVATE_MESSAGE,
        )

        if (
            unread_user_notifications.exists()
            and user.user_profile
            and user.user_profile.email_on_private_chat_message is True
        ):
            send_email_reminder_for_unread_notifications(
                user=user, user_notifications=unread_user_notifications
            )


@app.task
def schedule_automated_update_to_project_ranks() -> None:
    all_project_ids: List[int] = list(Project.objects.all().values_list('id', flat=True))
    PROJECT_CHUNK_SIZE = 100

    for i in range(0, len(all_project_ids), PROJECT_CHUNK_SIZE):
        project_ids = [p_ids for p_ids in all_project_ids[i: i + PROJECT_CHUNK_SIZE]]
        print(project_ids)
        calculate_project_rankings.apply_async((project_ids,))


@app.task(bind=True)
def calculate_project_rankings(self, project_ids: List[int]) -> None:
    for project_id in project_ids:
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist as ex:
            logger.error(f"[PROJECT_RANKING] Project does not exists for {project_id}.")
            return
        
        logger.info(f'[PROJECT_RANKING] calculate ranking for project {project.id}')
        project.ranking


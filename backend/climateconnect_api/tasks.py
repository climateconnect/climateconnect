from asyncio.windows_events import NULL
import logging
from datetime import timedelta
from typing import List

from climateconnect_main.celery import app
from django.conf import settings
from django.contrib.auth.models import User
from django.utils import timezone

from climateconnect_api.models import UserNotification, Notification
from climateconnect_api.utility.email_setup import \
    send_email_reminder_for_unread_notifications
from django.utils import timezone
from django.conf import settings
from organization.models.organization import Organization
from climateconnect_api.models.user import UserProfile
from climateconnect_main.celery import app
from climateconnect_api.utility.email_setup import (send_weekly_personalized_recommendations_email, create_variables_for_weekly_recommendations)
from organization.models.project import Project
from hubs.models.hub import Hub
from ideas.models.ideas import Idea
from location.models import Location
from django.contrib.auth.models import User
from django.db.models import Count
from typing import List

logger = logging.getLogger(__name__)


@app.task
def schedule_automated_reminder_for_user_notifications():
    # Get all user_ids for people who have not checked their notification
    all_user_ids = list(
        UserNotification.objects.filter(
            read_at__isnull=True,
            created_at__lte=(timezone.now() - timedelta(days=2)),
            notification__notification_type=Notification.PRIVATE_MESSAGE
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
            user_id=u_id,
            read_at__isnull=True,
            notification__notification_type=Notification.PRIVATE_MESSAGE
        )

        if unread_user_notifications.exists() and user.user_profile \
            and user.user_profile.email_on_private_chat_message is True:
            send_email_reminder_for_unread_notifications(
                user=user,
                user_notifications=unread_user_notifications
            )
def add(a, b):
    logger.info(f"testing.... {a+b}")
def schedule_weekly_international_recommendations_email():
    # for users not in hubs

    max_entities = 3

    new_international_orgs = Organization.objects.filter(created_at__gt=(timezone.now() - timedelta(days=7)),).values_list('id', flat = True)[:1:1]
    max_international_projects = max_entities - len(new_international_orgs)
    new_international_projects = Project.objects.filter(created_at__gt=(timezone.now() - timedelta(days=7)),).annotate(count_likes=Count('project_liked')).order_by('-count_likes').values_list('id', flat = True)[:max_international_projects:1]  
    

    if (new_international_projects or new_international_orgs):
        all_users_outside_of_hub = list(UserProfile.objects.filter(send_newsletter = True).exclude(location__isnull=False, location__hub_location__hub_type = 1).values_list('user', flat=True))

        for i in range(0, len(all_users_outside_of_hub), settings.USER_CHUNK_SIZE):
            user_ids = [
                u_ids for u_ids in all_users_outside_of_hub[i: i + settings.USER_CHUNK_SIZE]
            ]
            dispatch_weekly_recommendations_email.apply_async(user_ids, new_international_projects, new_international_orgs)


@app.task
def schedule_weekly_local_recommendations_email():
    # for users in hubs

    max_entities = 3

    all_locations_in_hubs = list(Location.objects.filter(hub_location__hub_type=1).values_list('id', flat = True).distinct())

    for location_id in all_locations_in_hubs:
        new_orgs = Organization.objects.filter(hubs__location__id=location_id, hubs__hub_type=1, created_at__gt=(timezone.now() - timedelta(days=7)),).values_list('id', flat = True)[:1:1]
        new_ideas = Idea.objects.filter(hub_shared_in__location__id=location_id, hub_shared_in__hub_type=1, created_at__gt=(timezone.now() - timedelta(days=7)),).values_list('id', flat = True)[:1:1]
        max_projects = max_entities - (len(new_orgs) + len(new_ideas))
        new_projects = Project.objects.filter(loc__id=location_id, created_at__gt=(timezone.now() - timedelta(days=7)),).annotate(count_likes=Count('project_liked')).order_by('-count_likes').values_list('id', flat = True)[:max_projects:1]

        if (new_projects or new_orgs or new_ideas):
            all_users_in_hub = list(UserProfile.objects.filter(send_newsletter=True, location__id = location_id).values_list('user', flat=True))

            for i in range(0, len(all_users_in_hub), settings.USER_CHUNK_SIZE):
                user_ids = [
                    u_ids for u_ids in all_users_in_hub[i: i + settings.USER_CHUNK_SIZE]
                ]
                dispatch_weekly_recommendations_email.apply_async(user_ids,  new_projects, new_orgs, new_ideas, isInHub = True)


@app.task(bind=True)
def dispatch_weekly_recommendations_email(self, user_ids: List, project_ids: List = [], organization_ids: List = [], idea_ids: List = [], isInHub: bool = False):
    for user_id in user_ids:
        user = User.objects.get(id=user_id)
        send_weekly_personalized_recommendations_email(user, project_ids, organization_ids, idea_ids, isInHub)


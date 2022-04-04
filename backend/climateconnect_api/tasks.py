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
from climateconnect_api.utility.email_setup import (create_global_variables_for_weekly_recommendations, create_messages_for_weekly_recommendations, send_weekly_recommendations_email)
from organization.models.project import Project
from climateconnect_api.models.language import Language
from ideas.models.ideas import Idea
from location.models import Location
from django.contrib.auth.models import User
from django.db.models import Count
from typing import List
from django.db.models import Q

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
    timespan = timezone.now() - timedelta(days=7)

    new_international_orgs = Organization.objects.filter(created_at__gt=timespan,).values_list('id', flat = True)[:1:1]
    max_international_projects = max_entities - len(new_international_orgs)
    new_international_projects = Project.objects.filter(created_at__gt=timespan,).annotate(count_likes=Count('project_liked')).order_by('-count_likes').values_list('id', flat = True)[:max_international_projects:1]  
    
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
    timespan = timezone.now() - timedelta(days=7)

    all_locations_in_hubs = list(Location.objects.filter(hub_location__hub_type=1).values_list('id', flat = True).distinct())
    for location_id in all_locations_in_hubs:
        new_orgs = Organization.objects.filter(hubs__location__id=location_id, hubs__hub_type=1, created_at__gt=timespan,).values_list('id', flat = True)[:1:1]
        new_ideas = Idea.objects.filter(hub_shared_in__location__id=location_id, hub_shared_in__hub_type=1, created_at__gt=timespan,).values_list('id', flat = True)[:1:1]
        max_projects = max_entities - (len(new_orgs) + len(new_ideas))
        new_projects = Project.objects.filter(loc__id=location_id, created_at__gt=timespan,).annotate(count_likes=Count('project_liked')).order_by('-count_likes').values_list('id', flat = True)[:max_projects:1]

        if (new_projects or new_orgs or new_ideas):
            # for english users or users with no language set, default to english
            all_users_query = UserProfile.objects.filter(send_newsletter=True, location__id=location_id)
            all_en_users_query = list(all_users_query.filter(Q(language__isnull=True) | Q(language__language_code="en")).values_list('user', flat=True))
            for i in range(0, len(all_en_users_query), settings.USER_CHUNK_SIZE):
                user_ids = [
                    u_ids for u_ids in all_en_users_query[i: i + settings.USER_CHUNK_SIZE]
                ]
                dispatch_weekly_recommendations_email.apply_async(user_ids, "en", new_projects, new_orgs, new_ideas, isInHub = True)

            # for all languages
            languages = list(Language.objects.exclude(language_code="en").values_list("id", "language_code").distinct())
            for (language_id, lang_code) in languages:
                all_users = list(UserProfile.objects.filter(send_newsletter=True, location__id = location_id, language__id = language_id).values_list('user', flat=True))

                for i in range(0, len(all_users), settings.USER_CHUNK_SIZE):
                    user_ids = [
                        u_ids for u_ids in all_users[i: i + settings.USER_CHUNK_SIZE]
                    ]
                    dispatch_weekly_recommendations_email.apply_async(user_ids, lang_code, new_projects, new_orgs, new_ideas, isInHub = True)


@app.task(bind=True)
def dispatch_weekly_recommendations_email(self, user_ids: List, lang_code: str = "en", project_ids: List = [], organization_ids: List = [], idea_ids: List = [], isInHub: bool = False):
    send_weekly_recommendations_email(user_ids, lang_code, project_ids, organization_ids, idea_ids, isInHub)










# refactoring 

#@app.task
def schedule_weekly_recommendations_email():
    max_entities = 3
    timespan = timezone.now() - timedelta(days=7)
    # fetch_local_entities_and_send_weekly_recommendations.apply_async(max_entities, timespan)
    # fetch_international_entities_and_send_weekly_recommendations.apply_async(max_entities, timespan)
    # debugging
    fetch_local_entities_and_send_weekly_recommendations(max_entities, timespan)
    fetch_international_entities_and_send_weekly_recommendations(max_entities, timespan)


# @app.task(bind=True)
# def fetch_local_entities_and_send_weekly_recommendations(self, max_entities, timespan):
# debugging
def fetch_local_entities_and_send_weekly_recommendations(max_entities, timespan):
    all_locations_in_hubs = list(Location.objects.filter(hub_location__hub_type=1).values_list('id', flat = True).distinct())
    for location_id in all_locations_in_hubs:
        new_orgs = Organization.objects.filter(hubs__location__id=location_id, hubs__hub_type=1, created_at__gt=timespan,).values_list('id', flat = True)[:1:1]
        new_ideas = Idea.objects.filter(hub_shared_in__location__id=location_id, hub_shared_in__hub_type=1, created_at__gt=timespan,).values_list('id', flat = True)[:1:1]
        max_projects = max_entities - (len(new_orgs) + len(new_ideas))
        new_projects = Project.objects.filter(loc__id=location_id, created_at__gt=timespan,).annotate(count_likes=Count('project_liked')).order_by('-count_likes').values_list('id', flat = True)[:max_projects:1]
        
        mailjet_global_vars = create_global_variables_for_weekly_recommendations(new_projects, new_orgs, new_ideas, isInHub=True)
        if (mailjet_global_vars):
            #fetch_user_info_and_send_weekly_recommendations.apply_async(mailjet_global_vars, location_id)
            # debugging
            fetch_user_info_and_send_weekly_recommendations(mailjet_global_vars, location_id)


# @app.task(bind=True)
# def fetch_international_entities_and_send_weekly_recommendations(self, max_entities, timespan):
# debugging
def fetch_international_entities_and_send_weekly_recommendations(max_entities, timespan):
    
    new_international_orgs = Organization.objects.filter(created_at__gt=timespan,).values_list('id', flat = True)[:1:1]
    max_international_projects = max_entities - len(new_international_orgs)
    new_international_projects = Project.objects.filter(created_at__gt=timespan,).annotate(count_likes=Count('project_liked')).order_by('-count_likes').values_list('id', flat = True)[:max_international_projects:1]  
    mailjet_global_vars = create_global_variables_for_weekly_recommendations(new_international_projects, new_international_orgs, isInHub=False)
    if mailjet_global_vars:
        # fetch_user_info_and_send_weekly_recommendations.apply_async(mailjet_global_vars) 
        # debugging
        fetch_user_info_and_send_weekly_recommendations(mailjet_global_vars) 


# @app.task(bind=True)
# def fetch_user_info_and_send_weekly_recommendations(self, mailjet_global_vars: List, location_id: int = None):
# debugging:
def fetch_user_info_and_send_weekly_recommendations(mailjet_global_vars: List, location_id: int = None):
    
    all_users_query = UserProfile.objects.filter(send_newsletter=True).values_list("user__email", "user__first_name", "user__last_name")

    if location_id is not None:
        all_users_query = all_users_query.filter(location__id=location_id)
        isInHub = True
    else:
        all_users_query = all_users_query.exclude(location__isnull=False, location__hub_location__hub_type = 1)
        isInHub = False

    # all english users and users with no language set, defaulting to english
    all_en_users_query = all_users_query.filter(Q(language__isnull=True) | Q(language__language_code="en"))
    for i in range(0, len(all_en_users_query), settings.USER_CHUNK_SIZE):
        chunked_user_query = all_en_users_query[i: i + settings.USER_CHUNK_SIZE]
        # process_user_info_and_send_weekly_recommendations.apply_async(chunked_user_query, mailjet_global_vars, "en", isInHub)
        # debugging
        process_user_info_and_send_weekly_recommendations(chunked_user_query, mailjet_global_vars, "en", isInHub)
    
# include english

    # for all other languages
    languages = list(Language.objects.exclude(language_code="en").values_list("id", "language_code").distinct())
    for (language_id, lang_code) in languages:
        all_users_by_language_query = all_users_query.filter(language__id = language_id)
        for i in range(0, len(all_users_by_language_query), settings.USER_CHUNK_SIZE):
            chunked_user_query = all_users_by_language_query[i: i + settings.USER_CHUNK_SIZE]
            #process_user_info_and_send_weekly_recommendations.apply_async(chunked_user_query, mailjet_global_vars, lang_code, isInHub)
            # debugging
            process_user_info_and_send_weekly_recommendations(chunked_user_query, mailjet_global_vars, lang_code, isInHub)


#@app.task(bind=True)
#def process_user_info_and_send_weekly_recommendations(self, chunked_user_query, mailjet_global_vars, lang_code, isInHub):
#debugging
def process_user_info_and_send_weekly_recommendations(chunked_user_query, mailjet_global_vars, lang_code, isInHub):
    messages = create_messages_for_weekly_recommendations(chunked_user_query)
    send_weekly_recommendations_email(messages, mailjet_global_vars, lang_code, isInHub)


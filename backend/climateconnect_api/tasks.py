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
from copy import deepcopy
from climateconnect_api.utility.email_setup import (
    create_global_variables_for_weekly_recommendations,
    create_messages_for_weekly_recommendations,
    send_weekly_recommendations_email,
)
from organization.models.organization import Organization
from climateconnect_api.models.user import UserProfile
from organization.models.project import Project
from climateconnect_api.models.language import Language
from ideas.models.ideas import Idea
from hubs.models.hub import Hub
from location.models import Location
from django.db.models import Count
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

    # for users not in hubs
# @app.task
# def schedule_weekly_international_recommendations_email():
#     # for users not in hubs

#     max_entities = 3
#     timespan = timezone.now() - timedelta(days=7)

#     new_international_orgs = Organization.objects.filter(created_at__gt=timespan,).values_list('id', flat = True)[:1:1]
#     max_international_projects = max_entities - len(new_international_orgs)
#     new_international_projects = Project.objects.filter(created_at__gt=timespan,).annotate(count_likes=Count('project_liked')).order_by('-count_likes').values_list('id', flat = True)[:max_international_projects:1]  
    
#     if (new_international_projects or new_international_orgs):
#         all_users_outside_of_hub = list(UserProfile.objects.filter(send_newsletter = True).exclude(location__isnull=False, location__hub_location__hub_type = 1).values_list('user', flat=True))

#         for i in range(0, len(all_users_outside_of_hub), settings.USER_CHUNK_SIZE):
#             user_ids = [
#                 u_ids for u_ids in all_users_outside_of_hub[i: i + settings.USER_CHUNK_SIZE]
#             ]
#             dispatch_weekly_recommendations_email.apply_async(user_ids, new_international_projects, new_international_orgs)


# @app.task
# def schedule_weekly_local_recommendations_email():
#     # for users in hubs

#     max_entities = 3
#     timespan = timezone.now() - timedelta(days=7)

#     all_locations_in_hubs = list(Location.objects.filter(hub_location__hub_type=1).values_list('id', flat = True).distinct())
#     for location_id in all_locations_in_hubs:
#         new_orgs = Organization.objects.filter(hubs__location__id=location_id, hubs__hub_type=1, created_at__gt=timespan,).values_list('id', flat = True)[:1:1]
#         new_ideas = Idea.objects.filter(hub_shared_in__location__id=location_id, hub_shared_in__hub_type=1, created_at__gt=timespan,).values_list('id', flat = True)[:1:1]
#         max_projects = max_entities - (len(new_orgs) + len(new_ideas))
#         new_projects = Project.objects.filter(loc__id=location_id, created_at__gt=timespan,).annotate(count_likes=Count('project_liked')).order_by('-count_likes').values_list('id', flat = True)[:max_projects:1]

#         if (new_projects or new_orgs or new_ideas):
#             # for english users or users with no language set, default to english
#             user_query_by_language = UserProfile.objects.filter(send_newsletter=True, location__id=location_id)
#             all_en_users_user_query_by_language = list(user_query_by_language.filter(Q(language__isnull=True) | Q(language__language_code="en")).values_list('user', flat=True))
#             for i in range(0, len(all_en_users_user_query_by_language), settings.USER_CHUNK_SIZE):
#                 user_ids = [
#                     u_ids for u_ids in all_en_users_user_query_by_language[i: i + settings.USER_CHUNK_SIZE]
#                 ]
#                 dispatch_weekly_recommendations_email.apply_async(user_ids, "en", new_projects, new_orgs, new_ideas, isInHub = True)

#             # for all languages
#             languages = list(Language.objects.exclude(language_code="en").values_list("id", "language_code").distinct())
#             for (language_id, lang_code) in languages:
#                 all_users = list(UserProfile.objects.filter(send_newsletter=True, location__id = location_id, language__id = language_id).values_list('user', flat=True))

#                 for i in range(0, len(all_users), settings.USER_CHUNK_SIZE):
#                     user_ids = [
#                         u_ids for u_ids in all_users[i: i + settings.USER_CHUNK_SIZE]
#                     ]
#                     dispatch_weekly_recommendations_email.apply_async(user_ids, lang_code, new_projects, new_orgs, new_ideas, isInHub = True)


# @app.task(bind=True)
# def dispatch_weekly_recommendations_email(self, user_ids: List, lang_code: str = "en", project_ids: List = [], organization_ids: List = [], idea_ids: List = [], isInHub: bool = False):
#     send_weekly_recommendations_email(user_ids, lang_code, project_ids, organization_ids, idea_ids, isInHub)



@app.task
def schedule_weekly_recommendations_email():
    max_entities = 3
    timespan_start = timezone.now() - timedelta(days=7)

    all_locations_in_hubs = list(
        Location.objects.filter(hub_location__hub_type=Hub.LOCATION_HUB_TYPE)
        .values_list("id", flat=True)
        .distinct()
    )
    # "0" acts as a flag for the international recommendations email
    all_locations_in_hubs.append(0)
    for location_id in all_locations_in_hubs:

        is_in_hub = location_id != 0

        mailjet_global_vars = fetch_and_create_globals_for_weekly_recommendations(
            max_entities, timespan_start, location_id, is_in_hub
        )
        user_queries_by_language = fetch_user_info_for_weekly_recommendations(
            location_id, is_in_hub
        )

        # check if there are any new entities otherwise mailjet_global_vars will be an empty list
        if mailjet_global_vars:
            for lang_code, user_query_by_language in user_queries_by_language.items():
                for i in range(
                    0, len(user_query_by_language), settings.USER_CHUNK_SIZE
                ):
                    user_ids = list(
                        user_query_by_language[i : i + settings.USER_CHUNK_SIZE]
                    )
                    # maybe apply_async here?
                    # process_user_info_and_send_weekly_recommendations.apply_async((chunked_user_info, mailjet_global_vars, lang_code, is_in_hub))
                    process_user_info_and_send_weekly_recommendations(
                        user_ids, mailjet_global_vars, lang_code, is_in_hub
                    )


def fetch_and_create_globals_for_weekly_recommendations(
    max_entities, timespan_start, location_id, is_in_hub
):
    [project_ids, org_ids, idea_ids] = fetch_entities_for_weekly_recommendations(
        max_entities, timespan_start, location_id, is_in_hub
    )
    mailjet_global_vars = create_global_variables_for_weekly_recommendations(
        project_ids, org_ids, idea_ids, is_in_hub
    )
    return mailjet_global_vars


def fetch_entities_for_weekly_recommendations(
    max_entities, timespan_start, location_id, is_in_hub
):
    new_projects = Project.objects.filter(created_at__gt=timespan_start)
    new_orgs = Organization.objects.filter(created_at__gt=timespan_start)

    # max_entities is considered to be a variable that can be changed in the future
    # so this is just a safeguard if max_entities is set to 0 to have consistent behaviour
    max_orgs = 1 if max_entities >= 1 else 0
    # recommendations for hubs
    if is_in_hub and location_id:
        new_projects = new_projects.filter(loc__id=location_id)
        org_ids = list(
            new_orgs.filter(location__id=location_id).values_list("id", flat=True)[
                :max_orgs
            ]
        )
        # safeguard to have consistent behaviour when changing max_entities
        max_ideas = 1 if (max_entities - len(org_ids)) >= 1 else 0
        idea_ids = list(
            Idea.objects.filter(
                created_at__gt=timespan_start, hub_shared_in__location__id=location_id
            ).values_list("id", flat=True)[:max_ideas]
        )
    # international recommendations
    else:
        org_ids = list(new_orgs.values_list("id", flat=True)[:max_orgs])
        idea_ids = list()

    max_projects = max_entities - (len(org_ids) + len(idea_ids))
    project_ids = list(
        new_projects.annotate(count_likes=Count("project_liked"))
        .order_by("-count_likes")
        .values_list("id", flat=True)[:max_projects]
    )

    return [project_ids, org_ids, idea_ids]


def fetch_user_info_for_weekly_recommendations(location_id: int, is_in_hub: bool):
    user_queries_by_language = {}

    user_query = UserProfile.objects.filter(send_newsletter=True).values_list(
        "user__id", flat=True
    )
    if location_id and is_in_hub:
        user_query = user_query.filter(location__id=location_id)
    else:
        user_query = user_query.exclude(
            location__isnull=False,
            location__hub_location__hub_type=Hub.LOCATION_HUB_TYPE,
        )

    languages = list(Language.objects.values_list("id", "language_code").distinct())
    for (language_id, lang_code) in languages:
        user_query_by_language = deepcopy(user_query)
        # all users that havent specified a language are fetched together with english users
        if lang_code == "en":
            user_query_by_language = user_query_by_language.filter(
                Q(language__isnull=True) | Q(language__id=language_id)
            )
        else:
            user_query_by_language = user_query_by_language.filter(
                language__id=language_id
            )

        user_queries_by_language[lang_code] = user_query_by_language
    return user_queries_by_language


@app.task
def process_user_info_and_send_weekly_recommendations(
    chunked_user_user_query_by_language,
    mailjet_global_vars,
    lang_code,
    isInHub,
    sandbox_mode=False,
):
    messages = create_messages_for_weekly_recommendations(
        chunked_user_user_query_by_language
    )
    return send_weekly_recommendations_email(
        messages, mailjet_global_vars, lang_code, isInHub, sandbox_mode
    )


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
            user = User.objects.get(user_id=u_id)
        except User.DoesNotExist:
            logger.info(f"User profile does not exists for user {u_id}")
            continue

        unread_user_notifications = UserNotification.objects.filter(
            user_id=u_id,
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

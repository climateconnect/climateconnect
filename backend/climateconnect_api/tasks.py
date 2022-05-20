import logging
from datetime import timedelta
from typing import List

from climateconnect_main.celery import app
from django.conf import settings
from django.contrib.auth.models import User
from django.utils import timezone

from climateconnect_api.models import UserNotification, Notification
from climateconnect_api.utility.email_setup import (
    send_email_reminder_for_unread_notifications,
)
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


@app.task
def schedule_weekly_recommendations_email():
    """This function acts as the main function for weekly recommendation emails. It handles the main control flow, gathers all necessary information and hands it over to (async) celery workers to send the emails. It is called by the celery scheduler every week"""
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

        entity_ids = fetch_entities_for_weekly_recommendations(
            max_entities, timespan_start, location_id, is_in_hub
        )

        # check if there are any new entities otherwise entity_ids will be an empty list
        if entity_ids:
            user_queries_by_language = fetch_user_info_for_weekly_recommendations(
                location_id, is_in_hub
            )
            for lang_code, user_query_by_language in user_queries_by_language.items():
                mailjet_global_vars = (
                    create_global_variables_for_weekly_recommendations(
                        entity_ids, lang_code, is_in_hub
                    )
                )
                for i in range(
                    0, len(user_query_by_language), settings.USER_CHUNK_SIZE
                ):
                    user_ids = list(
                        user_query_by_language[i : i + settings.USER_CHUNK_SIZE]
                    )
                    # maybe apply_async here?
                    # process_user_info_and_send_weekly_recommendations.apply_async((user_ids, mailjet_global_vars, lang_code, is_in_hub))
                    process_user_info_and_send_weekly_recommendations(
                        user_ids, mailjet_global_vars, lang_code, is_in_hub
                    )


def fetch_entities_for_weekly_recommendations(
    max_entities, timespan_start, location_id, is_in_hub
):
    """This function gathers the correct project, organization or idea ids based on location hub aswell as for international newsletter. Output is a dictionary with the type of entity as key (project, organization or idea) and a list of IDs as value."""
    entity_ids = {}

    new_projects = Project.objects.filter(created_at__gt=timespan_start)
    new_orgs = Organization.objects.filter(created_at__gt=timespan_start)

    # max_entities is considered to be a variable that can be changed in the future
    # so this is just a safeguard if max_entities is set to 0 to have consistent behaviour
    max_orgs = 1 if max_entities >= 1 else 0
    # recommendations for hubs
    if is_in_hub and location_id:
        new_projects = new_projects.filter(loc__id=location_id)
        entity_ids["organization"] = list(
            new_orgs.filter(location__id=location_id).values_list("id", flat=True)[
                :max_orgs
            ]
        )
        # safeguard to have consistent behaviour when changing max_entities
        max_ideas = 1 if (max_entities - len(entity_ids["organization"])) >= 1 else 0
        entity_ids["idea"] = list(
            Idea.objects.filter(
                created_at__gt=timespan_start, hub_shared_in__location__id=location_id
            ).values_list("id", flat=True)[:max_ideas]
        )
    # international recommendations
    else:
        entity_ids["organization"] = list(
            new_orgs.values_list("id", flat=True)[:max_orgs]
        )
        entity_ids["idea"] = list()

    max_projects = max_entities - (
        len(entity_ids["organization"]) + len(entity_ids["idea"])
    )
    entity_ids["project"] = list(
        new_projects.annotate(count_likes=Count("project_liked"))
        .order_by("-count_likes")
        .values_list("id", flat=True)[:max_projects]
    )

    return entity_ids


def fetch_user_info_for_weekly_recommendations(location_id: int, is_in_hub: bool):
    """This function gathers the correct user ids as queries based on location and sorts them based on their language"""
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
        # user queries get stored as values in a dictionary with the language code as keys
        user_queries_by_language[lang_code] = user_query_by_language
    return user_queries_by_language


@app.task
def process_user_info_and_send_weekly_recommendations(
    chunked_user_user_query_by_language,
    mailjet_global_vars,
    lang_code,
    is_in_hub,
    sandbox_mode: bool = False,
):
    """This function fetches user information for batch processing and hands all information fetched from the database over to the email sending function"""
    messages = create_messages_for_weekly_recommendations(
        chunked_user_user_query_by_language
    )
    return send_weekly_recommendations_email(
        messages, mailjet_global_vars, lang_code, is_in_hub, sandbox_mode
    )

# Python imports
from ideas.models.ideas import Idea
from typing import Optional
import uuid
from datetime import datetime, timedelta

# Django/Django REST imports
from django.contrib.auth.models import User
from django.db.models import QuerySet

from climateconnect_api.models import UserProfile, Role, Notification, UserNotification
from chat_messages.models import MessageParticipants, Participant, MessageReceiver

# Logging
import logging

logger = logging.getLogger(__name__)


def set_read(messages, user, is_private_message):
    if not messages:
        return None
    unread_receivers = MessageReceiver.objects.filter(
        message__in=messages, receiver=user, read_at=None
    )
    for receiver in unread_receivers:
        receiver.read_at = datetime.now()
        receiver.save()
    # Here we are assuming that all messages passed to this function are from the same chat
    message_notifications = Notification.objects.filter(
        chat=messages[0].message_participant
    )
    if message_notifications.exists():
        try:
            unread_user_notification = UserNotification.objects.get(
                notification__in=message_notifications, read_at=None, user=user
            )
            user_notification = unread_user_notification
            user_notification.read_at = datetime.now()
            user_notification.save()
        except UserNotification.DoesNotExist:
            logger.error("there is no user notification for " + user.first_name)


def create_private_or_group_chat(
    creator: User,
    group_chat_name: str,
    participants: Optional[QuerySet] = None,
    related_idea: Optional[Idea] = None,
) -> None:
    chat = MessageParticipants.objects.create(
        chat_uuid=uuid.uuid4(), name=group_chat_name, created_by=creator
    )
    if related_idea:
        chat.related_idea = related_idea
        chat.is_public = True
        chat.save()
    creator_role = Role.objects.get(role_type=Role.ALL_TYPE)
    member_role = Role.objects.get(role_type=Role.READ_ONLY_TYPE)
    # Adding creator to the group chat.
    Participant.objects.create(user=creator, chat=chat, role=creator_role)
    logger.info(f"NewChat: Creator {creator.id} added to chat {chat.id}")
    if participants:
        for participant in participants:
            Participant.objects.create(user=participant, chat=chat, role=member_role)
            logger.info(
                f"NewChat: Participant {participant.id} added to chat {chat.id}"
            )

def check_can_start_chat(user_profile: UserProfile) -> bool:
    if user_profile.restricted_profile:
        print("forbidden because user profile is restricted")
        return "User profile restricted"
    
    # You can only start up to 3 chats within a 180 minute timeframe
    cooldown_minutes_for_starting_chats = 180
    max_new_chats_per_timeframe = 3

    cutoff_date = datetime.now() - timedelta(minutes=cooldown_minutes_for_starting_chats)
    print(cutoff_date)
    print(user_profile.user)
    # Find all chats started by the user after cutoff date (aka in the last 3 hours)
    affected_chats = MessageParticipants.objects.filter(
        created_by=user_profile.user, created_at__gte=cutoff_date
    )
    if(affected_chats.count() >= max_new_chats_per_timeframe):
        print("too many chats started: " + str(affected_chats.count()))
        return "Too many chats"
    print(affected_chats.count())
    print(affected_chats)
    return True
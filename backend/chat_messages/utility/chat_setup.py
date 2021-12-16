# Python imports
from ideas.models.ideas import Idea
from typing import Optional
import uuid
from datetime import datetime

# Django/Django REST imports
from django.contrib.auth.models import User
from django.db.models import QuerySet

from climateconnect_api.models import Role, Notification, UserNotification
from chat_messages.models import MessageParticipants, Participant, MessageReceiver

# Logging
import logging
logger = logging.getLogger(__name__)


def set_read(messages, user, is_private_message):
    if not messages:
        return None
    unread_receivers = MessageReceiver.objects.filter(message__in=messages, receiver=user, read_at=None)
    for receiver in unread_receivers:
        receiver.read_at = datetime.now()
        receiver.save()
    # Here we are assuming that all messages passed to this function are from the same chat
    message_notifications = Notification.objects.filter(chat=messages[0].message_participant)
    if message_notifications.exists():
        try:
            unread_user_notification = UserNotification.objects.get(
                notification__in=message_notifications,
                read_at=None,
                user=user
            )
            user_notification = unread_user_notification
            user_notification.read_at = datetime.now()
            user_notification.save()
        except UserNotification.DoesNotExist:
            logger.error("there is no user notification for "+user.first_name)


def create_private_or_group_chat(
    creator: User, group_chat_name: str,
    participants: Optional[QuerySet] = None,
    related_idea: Optional[Idea] = None
) -> None:
    chat = MessageParticipants.objects.create(
        chat_uuid=uuid.uuid4(),
        name=group_chat_name
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
            logger.info(f"NewChat: Participant {participant.id} added to chat {chat.id}")

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
from django.utils.translation import gettext as _
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count
from uuid import uuid4
from rest_framework.exceptions import NotFound
from chat_messages.models import Message
from chat_messages.utility.notification import create_chat_message_notification
from climateconnect_api.utility.notification import (
    create_email_notification,
    create_user_notification,
)
from django.utils import timezone
from constants import NUM_OF_WORDS_REQUIRED_FOR_FIRST_MESSAGE

# Logging
import logging

logger = logging.getLogger(__name__)


def get_or_create_private_chat(initiating_user, invited_user_profile):
    # Check if the user was manually banned by us or is spamming
    can_start_chat = check_can_start_chat(initiating_user.user_profile)
    # TO DO: return this in the view
    if can_start_chat is not True:
        return Response({"message": can_start_chat}, status=status.HTTP_403_FORBIDDEN)

    chatting_partner_user = invited_user_profile.user
    participants = [initiating_user, chatting_partner_user]

    # Check if there is already a private chat with the two users
    chats_with_creator = Participant.objects.filter(
        user=initiating_user, is_active=True
    ).values_list("chat", flat=True)
    chats_with_both_users = Participant.objects.filter(
        user=chatting_partner_user, chat__in=chats_with_creator, is_active=True
    ).values_list("chat", flat=True)
    private_chat_with_both_users = MessageParticipants.objects.annotate(
        num_participants=Count("participant_participants")
    ).filter(
        id__in=chats_with_both_users, num_participants=2, related_idea=None, name=""
    )

    if private_chat_with_both_users.exists():
        private_chat = private_chat_with_both_users[0]
    else:
        private_chat = MessageParticipants.objects.create(
            chat_uuid=str(uuid4()), created_by=initiating_user
        )
        basic_role = Role.objects.get(role_type=0)
        for participant in participants:
            Participant.objects.create(
                user=participant, chat=private_chat, role=basic_role
            )
    return private_chat


def send_chat_message(chat_uuid, user, message_content):
    try:
        chat = MessageParticipants.objects.get(chat_uuid=chat_uuid)
        Participant.objects.get(user=user, chat=chat, is_active=True)
    except Participant.DoesNotExist:
        raise NotFound("You are not a participant of this chat.")
    if chat:
        # Check if this is a first message and restrict sending a message
        # if its a cold-message.
        message_count = Message.objects.filter(message_participant=chat).count()
        num_of_words_on_a_message = len(message_content.split())

        if (
            message_count == 0
            and num_of_words_on_a_message < NUM_OF_WORDS_REQUIRED_FOR_FIRST_MESSAGE
        ):
            raise ValueError(f"Dear {user.user_profile.name}, This is your first"
                f" interaction with a member on the platform. Please introduce yourself and the reason for"
                f" your outreach in {NUM_OF_WORDS_REQUIRED_FOR_FIRST_MESSAGE} or more words.")
        receiver_user_ids = Participant.objects.filter(
            chat=chat, is_active=True
        ).values_list("user", flat=True)
        receiver_users = User.objects.filter(id__in=receiver_user_ids)
        message = Message.objects.create(
            content=message_content,
            sender=user,
            message_participant=chat,
            sent_at=timezone.now(),
        )
        chat.last_message_at = timezone.now()
        chat.save()
        notification = create_chat_message_notification(chat)
        for receiver in receiver_users:
            if not receiver.id == user.id:
                MessageReceiver.objects.create(receiver=receiver, message=message)
                create_email_notification(
                    receiver,
                    chat,
                    message_content,
                    user,
                    notification,
                )
                create_user_notification(receiver, notification)
    return


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


def create_group_chat(
    creator: User,
    group_chat_name: str,
    participants: Optional[QuerySet] = None,
    related_idea: Optional[Idea] = None,
) -> MessageParticipants:
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
    return chat


def check_can_start_chat(user_profile: UserProfile) -> bool:
    if user_profile.restricted_profile:
        print("forbidden because user profile is restricted")
        return "User profile restricted"
    # Users with special permissions aren't restricted
    if user_profile.user.has_perm("chat_messages.create_unlimited_messageparticipants"):
        return True
    # You can only start up to 4 chats within a 180 minute timeframe
    cooldown_minutes_for_starting_chats = 180
    max_new_chats_per_timeframe = 4

    cutoff_date = datetime.now() - timedelta(
        minutes=cooldown_minutes_for_starting_chats
    )
    # Find all chats started by the user after cutoff date (aka in the last 3 hours)
    affected_chats = MessageParticipants.objects.filter(
        created_by=user_profile.user, created_at__gte=cutoff_date
    ).order_by("-created_at")
    if affected_chats.count() >= max_new_chats_per_timeframe:
        minutes_since_last_chat = (
            datetime.now() - affected_chats[0].created_at.replace(tzinfo=None)
        ).total_seconds() / 60
        print("too many chats started: " + str(affected_chats.count()))
        return _(
            "Currently you can only contact %(max_chats_per_timeframe)d new people within %(hours)d hours. You can start a new chat in %(minutes)d minutes."
        ) % {
            "max_chats_per_timeframe": max_new_chats_per_timeframe,
            "hours": cooldown_minutes_for_starting_chats / 60,
            "minutes": cooldown_minutes_for_starting_chats - minutes_since_last_chat,
        }

    return True

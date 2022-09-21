from climateconnect_api.models.notification import Notification
from chat_messages.models import Participant


def create_chat_message_notification(chat):
    number_of_participants = Participant.objects.filter(
        chat=chat, is_active=True
    ).count()
    is_group_chat = number_of_participants > 2
    old_notification = Notification.objects.filter(
        notification_type=8 if is_group_chat else 1, chat=chat
    )
    if old_notification.exists():
        return old_notification[0]
    else:
        notification = Notification.objects.create(
            notification_type=8 if is_group_chat else 1, chat=chat
        )
        return notification

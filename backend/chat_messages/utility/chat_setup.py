from datetime import datetime
from climateconnect_api.models.notification import UserNotification, Notification
from chat_messages.models.message import MessageReceiver

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
        unread_user_notifications = UserNotification.objects.filter(
            notification__in=message_notifications,
            read_at=None,
            user=user
        )
        if unread_user_notifications.exists():
            user_notification = unread_user_notifications[0]
            user_notification.read_at = datetime.now()
            user_notification.save()
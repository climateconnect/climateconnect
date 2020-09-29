from datetime import datetime
from climateconnect_api.models.notification import UserNotification, Notification

def set_read(messages, user, is_private_message):
    unread_messages = messages.filter(read_at=None)
    for message in unread_messages:
        message.read_at = datetime.now()
        message.save()
    # Here we are assuming that all messages passed to this function are from the same chat
    if is_private_message:
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
from climateconnect_api.models.notification import Notification

def create_chat_message_notification(chat):
    is_group_chat = chat.participants.count() > 2
    old_notification = Notification.objects.filter(
        notification_type = 8 if is_group_chat else 1, 
        chat=chat
    )
    if old_notification.exists():
        return old_notification[0]
    else:
        notification = Notification.objects.create(
            notification_type = 8 if is_group_chat else 1, chat=chat
        )
        return notification
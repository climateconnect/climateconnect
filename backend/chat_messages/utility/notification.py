from climateconnect_api.models.notification import Notification
from climateconnect_api.utility.notification import create_user_notification

def create_private_message_notification(chat, sender, content):
    if chat.participant_one == sender:
        receiver = chat.participant_two
    else:
        receiver = chat.participant_one
    
    old_notification = Notification.objects.filter(
        notification_type=1, 
        chat=chat, 
        chat_message_sender=sender
    )
    if old_notification.exists():
        create_user_notification(receiver, old_notification[0])
    else:
        notification = Notification.objects.create(
            notification_type=1, chat=chat, chat_message_sender=sender
        )
        create_user_notification(receiver, notification)
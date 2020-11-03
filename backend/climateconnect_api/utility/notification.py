from climateconnect_api.models.user import UserProfile
from climateconnect_api.models.notification import UserNotification, EmailNotification
from chat_messages.utility.email import send_group_chat_message_notification_email, send_private_chat_message_notification_email
from datetime import datetime, timedelta

def create_user_notification(user, notification):
    old_notification_object = UserNotification.objects.filter(
        user=user, 
        notification=notification
    )
    if not old_notification_object.exists():
        UserNotification.objects.create(
            user=user, notification=notification
        )
    else :
        if not old_notification_object[0].read_at == None:
            old_notification = old_notification_object[0]
            old_notification.read_at = None
            old_notification.save()

def create_email_notification(receiver, chat, message_content, sender, notification):
    three_hours_ago = datetime.now() - timedelta(hours=3)
    sender_name = sender.first_name + " " + sender.last_name
    email_notification_object = EmailNotification.objects.filter(
        user=receiver,
        created_at__gte=three_hours_ago
    )
    email_settings = UserProfile.objects.filter(user=receiver).values(
        'email_on_private_chat_message',
        'email_on_group_chat_message'
    )[0]
    if not email_notification_object.exists():
        is_group_chat = chat.participants.count() > 2
        if is_group_chat:
            if email_settings['email_on_group_chat_message'] == True:
                send_group_chat_message_notification_email(receiver, message_content, chat.chat_uuid, sender_name, chat.name)
                email_notification = EmailNotification.objects.create(
                    user=receiver, 
                    created_at=datetime.now(),
                    notification=notification
                )
        else:
            if email_settings['email_on_private_chat_message'] == True:
                send_private_chat_message_notification_email(receiver, message_content, chat.chat_uuid, sender_name)
                email_notification = EmailNotification.objects.create(
                    user=receiver, 
                    created_at=datetime.now(),
                    notification=notification
                )
        return email_notification
    else:
        print("can't send because we recently sent a notification")
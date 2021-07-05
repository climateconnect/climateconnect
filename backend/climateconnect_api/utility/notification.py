from ideas.models.support import IdeaSupporter
from organization.models.members import ProjectMember
from organization.models.content import ProjectComment
from ideas.serializers.comment import IdeaCommentSerializer
from organization.serializers.content import ProjectCommentSerializer
from organization.utility.email import send_idea_comment_email, send_idea_comment_reply_email, send_project_comment_email, send_project_comment_reply_email
from django.contrib.auth.models import User
from ideas.models.comment import IdeaComment
from django.conf import settings
from django.db.models.query_utils import Q

from climateconnect_api.models.user import UserProfile
from climateconnect_api.models.notification import Notification, UserNotification, EmailNotification
from chat_messages.models import Participant
from chat_messages.utility.email import send_group_chat_message_notification_email, send_private_chat_message_notification_email
from datetime import datetime, timedelta
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
channel_layer = get_channel_layer()

@async_to_sync
async def send_out_live_notification(user_id):
    await channel_layer.group_send(
        'user-'+str(user_id),
        {
            'type': 'notification'
        }
    )

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
        number_of_participants = Participant.objects.filter(chat=chat, is_active=True).count()
        is_group_chat = number_of_participants > 2
        if is_group_chat:
            if email_settings['email_on_group_chat_message'] == True and settings.GROUP_MESSAGE_TEMPLATE_ID is not None:
                send_group_chat_message_notification_email(receiver, message_content, chat.chat_uuid, sender_name, chat.name)
                email_notification = EmailNotification.objects.create(
                    user=receiver, 
                    created_at=datetime.now(),
                    notification=notification
                )
            else:
                return
        else:
            if email_settings['email_on_private_chat_message'] == True and settings.PRIVATE_MESSAGE_TEMPLATE_ID is not None:
                send_private_chat_message_notification_email(receiver, message_content, chat.chat_uuid, sender_name)
                email_notification = EmailNotification.objects.create(
                    user=receiver, 
                    created_at=datetime.now(),
                    notification=notification
                )
            else:
                return
        return email_notification
    else:
        print("can't send because we recently sent a notification")

def send_comment_notification(is_reply, notification_type, comment, sender, comment_model, comment_object_name, object_commented_on):
    notification = Notification.objects.create(
        notification_type = notification_type
    )
    setattr(notification, comment_object_name, comment)
    notification.save()
    users_notification_sent = []
    if is_reply:
        comments_in_thread = comment_model.objects.filter(
            Q(id=comment.parent_comment.id) | Q(parent_comment=comment.parent_comment.id)
        ).distinct('author_user').values('author_user')       

        for thread_comment in comments_in_thread :
            if not thread_comment['author_user'] == sender.id:
                user = User.objects.filter(id=thread_comment['author_user'])[0]
                create_user_notification(user, notification)
                send_out_live_notification(user.id)
                send_comment_email_notification(
                    user=user, 
                    notification_type_id=notification_type, 
                    object_commented_on=object_commented_on, 
                    comment=comment, 
                    sender=sender, 
                    notification=notification
                )
                users_notification_sent.append(user.id)
    team = []
    if comment_model == ProjectComment:
        team = ProjectMember.objects.filter(project=object_commented_on).values('user')
    if comment_model == IdeaComment:
        team = IdeaSupporter.objects.filter(idea=object_commented_on).values('user')
    for member in team:
        if not member['user'] == sender.id and not member['user'] in users_notification_sent:
            user = User.objects.filter(id=member['user'])[0]
            create_user_notification(user, notification)      
            send_out_live_notification(user.id)      
            send_comment_email_notification(
                user=user, 
                notification_type_id=notification_type, 
                object_commented_on=object_commented_on, 
                comment=comment, 
                sender=sender, 
                notification=notification
            )
    return notification

def check_send_email_notification(user):
    three_hours_ago = datetime.now() - timedelta(hours=3)
    recent_email_notification = EmailNotification.objects.filter(
        user=user, 
        created_at__gte=three_hours_ago
    )
    return not recent_email_notification.exists()

def send_comment_email_notification(user, notification_type_id, object_commented_on, comment, sender, notification):
    properties_by_type = {
        'project_comment': {
            'email_setting': 'email_on_comment_on_your_project',
            'send_email_function': send_project_comment_email,
            'serializer': ProjectCommentSerializer
        },
        'project_comment_reply': {
            'email_setting': 'email_on_reply_to_your_comment',
            'send_email_function': send_project_comment_reply_email,
            'serializer': ProjectCommentSerializer
        },
        'idea_comment': {
            'email_setting': 'email_on_comment_on_your_idea',
            'send_email_function': send_idea_comment_email,
            'serializer': IdeaCommentSerializer
        },
        'reply_to_idea_comment': {
            'email_setting': 'email_on_reply_to_your_comment',
            'send_email_function': send_idea_comment_reply_email,
            'serializer': IdeaCommentSerializer
        }
    }
    # Get notificatoin_type (e.g. "project_comment") from the notification type id (e.g. 2). These can be found in the Notification model
    notification_type = [v for i, v in enumerate(Notification.NOTIFICATION_TYPES) if v[0] == notification_type_id][0][1]
    type_props = properties_by_type[notification_type]
    should_send_email_notification = check_send_email_notification(user)
    comment_serializer = type_props['serializer'](comment)
    email_settings = UserProfile.objects.filter(user=user).values(
        'email_on_comment_on_your_project',
        'email_on_reply_to_your_comment',
        'email_on_comment_on_your_idea',
        'email_on_reply_to_your_comment'
    )[0]
    if should_send_email_notification:    
        if email_settings[type_props['email_setting']] == True:
            type_props['send_email_function'](user, object_commented_on, comment_serializer.data["content"], sender)
            EmailNotification.objects.create(
                user=user,
                created_at=datetime.now(),
                notification=notification
            )
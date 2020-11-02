from climateconnect_api.models.notification import Notification, EmailNotification, UserNotification
from climateconnect_api.utility.notification import create_user_notification, create_email_notification
from organization.models import Comment, ProjectMember
from django.db.models import Q
from datetime import datetime, timedelta
from django.contrib.auth.models import User
from organization.utility.email import (send_project_comment_email, send_project_comment_reply_email)
from organization.serializers.content import ProjectCommentSerializer

def create_project_comment_reply_notification(project, comment, sender):
    notification = Notification.objects.create(
        notification_type = 3, project_comment=comment
    )
    comments_in_thread = Comment.objects.filter(
        Q(id=comment.parent_comment.id) | Q(parent_comment=comment.parent_comment.id)
    ).distinct('author_user').values('author_user')

    users_notification_sent = []

    for thread_comment in comments_in_thread :
        if not thread_comment['author_user'] == sender.id:
            user = User.objects.filter(id=thread_comment['author_user'])[0]
            create_user_notification(user, notification)
            send_email_notification(user, "project_comment_reply", project, comment, sender, notification)
            users_notification_sent.append(user.id)
    
    project_team = ProjectMember.objects.filter(project=project).values('user')
    for member in project_team:
        if not member['user'] == sender.id and not member['user'] in users_notification_sent:
            user = User.objects.filter(id=member['user'])[0]
            create_user_notification(user, notification)            
            send_email_notification(user, "project_comment_reply", project, comment, sender, notification)
    return notification
    
def create_project_comment_notification(project, comment, sender):
    notification = Notification.objects.create(
        notification_type = 2, project_comment=comment
    )
    project_team = ProjectMember.objects.filter(project=project).values('user')
    for member in project_team:
        if not member['user'] == sender.id:
            user = User.objects.filter(id=member['user'])[0]
            create_user_notification(user, notification)
            send_email_notification(user, "project_comment", project, comment, sender, notification)
    return notification

def check_send_email_notification(user):
    three_hours_ago = datetime.now() - timedelta(hours=3)
    recent_email_notification = EmailNotification.objects.filter(
        user=user, 
        created_at__gte=three_hours_ago
    )
    return not recent_email_notification.exists()

def send_email_notification(user, notification_type, project, comment, sender, notification):
    should_send_email_notification = check_send_email_notification(user)
    comment_serializer = ProjectCommentSerializer(comment)
    if should_send_email_notification:
        if notification_type == "project_comment":
            send_project_comment_email(user, project, comment_serializer.data["content"], sender)
        if notification_type == "project_comment_reply":
            send_project_comment_reply_email(user, project, comment_serializer.data["content"], sender)
        EmailNotification.objects.create(
            user=user,
            created_at=datetime.now(),
            notification=notification
        )
from climateconnect_api.utility.notification import create_user_notification, send_comment_notification
from organization.models.content import ProjectComment
from climateconnect_api.models.notification import Notification, EmailNotification, UserNotification
from climateconnect_api.models import UserProfile
from organization.models import Comment, ProjectMember
from django.db.models import Q
from datetime import datetime, timedelta
from django.contrib.auth.models import User
from organization.utility.email import (send_project_comment_email, send_project_comment_reply_email, send_project_follower_email)
from organization.serializers.content import ProjectCommentSerializer

def create_project_comment_reply_notification(project, comment, sender):
    notification = send_comment_notification(
        is_reply=True,
        notification_type=Notification.REPLY_TO_PROJECT_COMMENT,
        comment=comment,
        sender=sender,
        comment_model=ProjectComment,
        comment_object_name="project_comment",
        object_commented_on=project
    )

    return notification
    
def create_project_comment_notification(project, comment, sender):
    notification = send_comment_notification(
        is_reply=False,
        notification_type=Notification.PROJECT_COMMENT,
        comment=comment,
        sender=sender,
        comment_model=ProjectComment,
        comment_object_name="project_comment",
        object_commented_on=project
    )
    return notification

def create_project_follower_notification(project_follower):
    notification = Notification.objects.create(
        notification_type = 4, project_follower=project_follower
    )
    project_team = ProjectMember.objects.filter(project=project_follower.project).values('user')
    for member in project_team:
        if not member['user'] == project_follower.user.id:
            user = User.objects.filter(id=member['user'])[0]
            create_user_notification(user, notification)
            send_project_follower_email(user, project_follower, notification)


def create_project_join_request_notification(requester,project_admins,project):
    """
    Creates a notification about a joining request from a requester to a project admin. 
    :param requester: UserProfile object of the user who's sent the request 
    :type requester: UserProfile
    :param project_admin: Iterable UserProfile object of the project administrators
    :type project_admin: List(UserProfile)
    
    """
    requester_name = UserProfile.objects.filter(user=requester).first().name
    notification = Notification.objects.create(
        notification_type=9,
        text=f"{requester_name} wants to join your project {project.name}!"
            )
    for project_admin in project_admins:
        create_user_notification(project_admin, notification)
    return

def create_project_join_request_approval_notification(requester,project):
    """
    Creates a notification about an approved request to join a project to the requester.
    :param requester: UserProfile object of the user who's sent the request 
    :type requester: UserProfile
    :param project: Iterable UserProfile object of the project administrators
    :type project: List(UserProfile)
    
    """

    notification = Notification.objects.create(
        notification_type=10,
        text=f"Your request to join the project {project.name} has been approved!"
            )
    create_user_notification(requester, notification)

    return
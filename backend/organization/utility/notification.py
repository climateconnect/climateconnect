import re
from datetime import datetime, timedelta

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from organization.utility.email import (
    send_mention_email, send_project_follower_email,
    send_project_like_email)
from climateconnect_api.models import UserProfile
from climateconnect_api.models.notification import (EmailNotification,
                                                    Notification,
                                                    UserNotification)
from climateconnect_api.utility.notification import (
    create_email_notification, create_user_notification,
    send_comment_notification, send_out_live_notification)
from django.contrib.auth.models import User
from django.db.models import Q

from organization.models import Comment, ProjectMember
from organization.models.content import ProjectComment
from organization.serializers.content import ProjectCommentSerializer


def create_project_comment_reply_notification(
    project,
    comment,
    sender,
    user_url_slugs_to_ignore
):
    notification = send_comment_notification(
        is_reply=True,
        notification_type=Notification.REPLY_TO_PROJECT_COMMENT,
        comment=comment,
        sender=sender,
        user_url_slugs_to_ignore=user_url_slugs_to_ignore,
        comment_model=ProjectComment,
        comment_object_name="project_comment",
        object_commented_on=project
    )

    return notification


def create_project_comment_notification(
    project,
    comment,
    sender,
    user_url_slugs_to_ignore
):
    notification = send_comment_notification(
        is_reply=False,
        notification_type=Notification.PROJECT_COMMENT,
        comment=comment,
        sender=sender,
        user_url_slugs_to_ignore=user_url_slugs_to_ignore,
        comment_model=ProjectComment,
        comment_object_name="project_comment",
        object_commented_on=project
    )
    return notification


def get_mentions(text, url_slugs_only):
    r = re.compile(
        '(@@@__(?P<url_slug>[^\^]*)\^\^__(?P<display>[^\@]*)@@@\^\^\^)'
    )
    matches = re.findall(r, text)
    if url_slugs_only:
        return list(map((lambda m: m[1]), matches))
    return matches


def create_comment_mention_notification(entity_type, entity, comment, sender):
    if entity_type == "project":
        notification = Notification.objects.create(
            notification_type=9,
            project_comment=comment
        )

    if entity_type == "idea":
        notification = Notification.objects.create(
            notification_type=9,
            idea_comment=comment
        )
    matches = get_mentions(
        text=comment.content,
        url_slugs_only=False
    )
    sender_url_slug = UserProfile.objects.get(user=sender).url_slug

    for m in matches:
        _, url_slug, _ = m[0], m[1], m[2]
        if not url_slug == sender_url_slug:
            user = UserProfile.objects.filter(url_slug=url_slug)[0].user
            create_user_notification(user, notification)
            send_out_live_notification(user.id)
            send_mention_email(
                user=user,
                entity_type=entity_type,
                entity=entity,
                comment=comment.content,
                sender=sender,
                notification=notification
            )
    return notification


def create_project_follower_notification(project_follower):
    notification = Notification.objects.create(
        notification_type=4, project_follower=project_follower
    )
    project_team = ProjectMember.objects.filter(
        project=project_follower.project).values('user')
    for member in project_team:
        if not member['user'] == project_follower.user.id:
            user = User.objects.filter(id=member['user'])[0]
            create_user_notification(user, notification)
            send_project_follower_email(user, project_follower, notification)


def create_project_join_request_notification(requester,project_admins,project):
    """
    Creates a notification about a joining request from a requester to a project admin.
    :param requester: UserProfile object of the user who's sent the request
    :type requester: User
    :param project_admin: Iterable UserProfile object of the project administrators
    :type project_admin: List(UserProfile)

    """
    requester_name = requester.first_name + " " + requester.last_name
    notification = Notification.objects.create(
        notification_type=9,
        text=f"{requester_name} wants to join your project {project.name}!"
    )

    for project_admin in project_admins:
        create_user_notification(project_admin, notification)

    return

def create_project_join_request_approval_notification(requester, project):
    """
    Creates a notification about an approved request to join a project to the requester.
    :param requester: UserProfile object of the user who's sent the request
    :type requester: UserProfile
    :param project: Iterable UserProfile object of the project administrators
    :type project: List(UserProfile)
    """
    notification = Notification.objects.create(notification_type=10)
    create_user_notification(requester, notification)

def create_project_like_notification(project_like):
    notification = Notification.objects.create(
        notification_type=Notification.PROJECT_LIKE, project_like=project_like
    )
    project_team = ProjectMember.objects.filter(
        project=project_like.project).values('user')

    for member in project_team:
        if not member['user'] == project_like.user.id:
            user = User.objects.get(id=member['user'])
            create_user_notification(user, notification)
            send_project_like_email(user, project_like, notification)


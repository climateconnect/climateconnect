import re
from datetime import datetime, timedelta

from asgiref.sync import async_to_sync

from organization.models.organization_project_published import OrgProjectPublished
from organization.models.members import MembershipRequests, OrganizationMember
from channels.layers import get_channel_layer
from organization.utility.email import (
    send_join_project_request_email,
    send_mention_email,
    send_org_project_published_email,
    send_project_like_email,
)
from climateconnect_api.models import UserProfile
from climateconnect_api.models.notification import (
    Notification,
)
from climateconnect_api.utility.notification import (
    create_user_notification,
    send_comment_notification,
    send_out_live_notification,
    create_follower_notification,
)
from django.contrib.auth.models import User
from organization.models import ProjectMember
from organization.models.content import ProjectComment


def create_project_comment_reply_notification(
    project, comment, sender, user_url_slugs_to_ignore
):
    notification = send_comment_notification(
        is_reply=True,
        notification_type=Notification.REPLY_TO_PROJECT_COMMENT,
        comment=comment,
        sender=sender,
        user_url_slugs_to_ignore=user_url_slugs_to_ignore,
        comment_model=ProjectComment,
        comment_object_name="project_comment",
        object_commented_on=project,
    )

    return notification


def create_project_comment_notification(
    project, comment, sender, user_url_slugs_to_ignore
):
    notification = send_comment_notification(
        is_reply=False,
        notification_type=Notification.PROJECT_COMMENT,
        comment=comment,
        sender=sender,
        user_url_slugs_to_ignore=user_url_slugs_to_ignore,
        comment_model=ProjectComment,
        comment_object_name="project_comment",
        object_commented_on=project,
    )
    return notification


def get_mentions(text, url_slugs_only):
    r = re.compile("(@@@__(?P<url_slug>[^\^]*)\^\^__(?P<display>[^\@]*)@@@\^\^\^)")
    matches = re.findall(r, text)
    if url_slugs_only:
        return list(map((lambda m: m[1]), matches))
    return matches


def create_comment_mention_notification(entity_type, entity, comment, sender):
    if entity_type == "project":
        notification = Notification.objects.create(
            notification_type=11, project_comment=comment
        )

    if entity_type == "idea":
        notification = Notification.objects.create(
            notification_type=11, idea_comment=comment
        )
    matches = get_mentions(text=comment.content, url_slugs_only=False)
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
                notification=notification,
            )
    return notification


def create_project_follower_notification(project_follower):
    create_follower_notification(
        4,
        "project_follower",
        "project",
        ProjectMember,
        project_follower,
        project_follower.project,
        project_follower.user.id,
    )


def create_organization_follower_notification(organization_follower):
    create_follower_notification(
        16,
        "organization_follower",
        "organization",
        OrganizationMember,
        organization_follower,
        organization_follower.organization,
        organization_follower.user.id,
    )


def create_organization_project_published_notification(
    followers, organization, project
):

    for follower in followers:
        org_project_published = OrgProjectPublished.objects.create(
            organization=organization, project=project, user=follower.user
        )
        notification = Notification.objects.create(
            notification_type=17, org_project_published=org_project_published
        )
        create_user_notification(org_project_published.user, notification)
        send_org_project_published_email(
            org_project_published.user, org_project_published, notification
        )


def create_project_join_request_notification(
    requester, project_admins, project, request
):
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
        text=f"{requester_name} wants to join your project {project.name}!",
        membership_request=request,
    )

    for project_admin in project_admins:
        create_user_notification(project_admin, notification)
        send_join_project_request_email(project_admin, request, requester, notification)

    return


def create_project_join_request_approval_notification(request_id):
    """
    Creates a notification about an approved request to join a project to the requester.
    :param request_id: Id of the request of the approved MembershipRequest
    :type request_id: int
    """
    request = MembershipRequests.objects.get(id=request_id)
    notification = Notification.objects.create(
        notification_type=10, membership_request=request
    )
    create_user_notification(request.user, notification)


def create_project_like_notification(project_like):
    notification = Notification.objects.create(
        notification_type=Notification.PROJECT_LIKE, project_like=project_like
    )
    project_team = ProjectMember.objects.filter(project=project_like.project).values(
        "user"
    )

    for member in project_team:
        if not member["user"] == project_like.user.id:
            user = User.objects.get(id=member["user"])
            create_user_notification(user, notification)
            send_project_like_email(user, project_like, notification)

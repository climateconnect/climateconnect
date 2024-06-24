from organization.models.members import MembershipRequests
from chat_messages.models.message import MessageParticipants
from django.contrib.auth.models import User
from django.db import models
from ideas.models.comment import IdeaComment
from ideas.models.support import IdeaSupporter
from organization.models.content import Post, PostComment, ProjectComment
from organization.models.followers import ProjectFollower, OrganizationFollower
from organization.models.organization_project_published import OrgProjectPublished

from organization.models.likes import ProjectLike


class Notification(models.Model):
    # When editing this: make sure all entries are still at the correct index afterwards
    # After making a change here you'll also have to update NOTIFICATION_TYPES in frontend/src/components/communication/notifications/Notification.js
    BROADCAST = 0
    PRIVATE_MESSAGE = 1
    PROJECT_COMMENT = 2
    REPLY_TO_PROJECT_COMMENT = 3
    PROJECT_FOLLOWER = 4
    PROJECT_UPDATE_POST = 5
    POST_COMMENT = 6
    REPLY_TO_POST_COMMENT = 7
    GROUP_MESSAGE = 8
    JOIN_PROJECT_REQUEST = 9
    PROJECT_JOIN_REQUEST_APPROVED = 10
    MENTION = 11
    PROJECT_LIKE = 12
    IDEA_COMMENT = 13
    REPLY_TO_IDEA_COMMENT = 14
    PERSON_JOINED_IDEA = 15
    ORGANIZATION_FOLLOWER = 16
    ORG_PROJECT_PUBLISHED = 17
    NOTIFICATION_TYPES = (
        (BROADCAST, "broadcast"),
        (PRIVATE_MESSAGE, "private_message"),
        (PROJECT_COMMENT, "project_comment"),
        (REPLY_TO_PROJECT_COMMENT, "reply_to_project_comment"),
        (PROJECT_FOLLOWER, "project_follower"),
        (PROJECT_UPDATE_POST, "project_update_post"),
        (POST_COMMENT, "post_comment"),
        (REPLY_TO_POST_COMMENT, "reply_to_post_comment"),
        (GROUP_MESSAGE, "group_message"),
        (JOIN_PROJECT_REQUEST, "join_project_request"),
        (PROJECT_JOIN_REQUEST_APPROVED, "project_join_request_approved"),
        (MENTION, "mention"),
        (PROJECT_LIKE, "project_like"),
        (IDEA_COMMENT, "idea_comment"),
        (REPLY_TO_IDEA_COMMENT, "reply_to_idea_comment"),
        (PERSON_JOINED_IDEA, "person_joined_idea"),
        (ORGANIZATION_FOLLOWER, "organization_follower"),
        (ORG_PROJECT_PUBLISHED, "org_project_published"),
    )

    notification_type = models.IntegerField(
        help_text="type of notification",
        verbose_name="Notification type",
        choices=NOTIFICATION_TYPES,
        default=BROADCAST,
    )

    text = models.CharField(
        help_text="Text to be displayed in Notification",
        verbose_name="Text",
        max_length=280,
        null=True,
        blank=True,
    )

    chat = models.ForeignKey(
        MessageParticipants,
        related_name="notification_chat",
        help_text="Points to chat for notifications of type 'private_message'",
        verbose_name="Chat",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    project_comment = models.ForeignKey(
        ProjectComment,
        related_name="notification_project_comment",
        verbose_name="Project comment",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    post_comment = models.ForeignKey(
        PostComment,
        related_name="notification_post_comment",
        verbose_name="Post comment",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    idea_comment = models.ForeignKey(
        IdeaComment,
        related_name="notification_idea_comment",
        verbose_name="Idea Comment",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    idea_supporter = models.ForeignKey(
        IdeaSupporter,
        related_name="notification_idea_supporter",
        verbose_name="Idea Supporter",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    project_follower = models.ForeignKey(
        ProjectFollower,
        related_name="notification_project_follower",
        verbose_name="Project Follower",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    project_like = models.ForeignKey(
        ProjectLike,
        related_name="notification_project_like",
        verbose_name="Project Like",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    project_update_post = models.ForeignKey(
        Post,
        related_name="notification_project_update_post",
        verbose_name="Project Post",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    membership_request = models.ForeignKey(
        MembershipRequests,
        related_name="notification_membership_request",
        verbose_name="Membership Request",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        help_text="Time when participants started a messaging",
        verbose_name="Created at",
        auto_now_add=True,
    )

    organization_follower = models.ForeignKey(
        OrganizationFollower,
        related_name="notification_organization_follower",
        verbose_name="Organization Follower",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    org_project_published = models.ForeignKey(
        OrgProjectPublished,
        related_name="notification_org_project_published",
        verbose_name="Org Project Published",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name_plural = "Notifications"
        ordering = ["-created_at"]

    def __str__(self):
        return "%s-Notification %d" % (
            self.NOTIFICATION_TYPES[self.notification_type][1],
            self.id,
        )


class UserNotification(models.Model):
    user = models.ForeignKey(
        User,
        related_name="user_notification_user",
        verbose_name="User",
        on_delete=models.CASCADE,
    )

    notification = models.ForeignKey(
        Notification,
        related_name="user_notification_notification",
        verbose_name="Notification",
        on_delete=models.CASCADE,
    )

    read_at = models.DateTimeField(
        help_text="Time when the user has read the notification",
        verbose_name="Read at",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        help_text="Time when the notification was sent to the user",
        verbose_name="Created at",
        auto_now_add=True,
    )

    class Meta:
        verbose_name_plural = "User notifications"

    def __str__(self):
        return "Notified %s %s about Notification %d of type %s at %s" % (
            self.user.first_name,
            self.user.last_name,
            self.notification.id,
            self.notification.NOTIFICATION_TYPES[self.notification.notification_type][
                1
            ],
            self.notification.created_at,
        )


class EmailNotification(models.Model):
    user = models.ForeignKey(
        User,
        related_name="email_notification_user",
        verbose_name="User",
        on_delete=models.CASCADE,
    )

    notification = models.ForeignKey(
        Notification,
        related_name="email_notification_notification",
        verbose_name="Notification",
        on_delete=models.CASCADE,
    )

    created_at = models.DateTimeField(
        help_text="Time when the email was sent",
        verbose_name="Created at",
        auto_now_add=True,
    )

    class Meta:
        verbose_name_plural = "Email Notifications"

    def __str__(self):
        return "Notified %s %s about Notification %d at %s" % (
            self.user.first_name,
            self.user.last_name,
            self.notification.id,
            self.notification.created_at,
        )

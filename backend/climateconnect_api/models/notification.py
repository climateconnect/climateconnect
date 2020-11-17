from django.db import models
from chat_messages.models.message import MessageParticipants, MessageReceiver
from organization.models.content import (ProjectComment, PostComment, Post)
from organization.models.followers import ProjectFollower
from organization.models.project import Project
from django.contrib.auth.models import User

class Notification(models.Model):
    BROADCAST = 0
    PRIVATE_MESSAGE = 1
    PROJECT_COMMENT = 2
    REPLY_TO_PROJECT_COMMENT = 3
    PROJECT_FOLLOWER = 4
    PROJECT_UPDATE_POST = 5
    POST_COMMENT = 6
    REPLY_TO_POST_COMMENT = 7
    GROUP_MESSAGE = 8
    NOTIFICATION_TYPES = (
        (BROADCAST, "broadcast"),
        (PRIVATE_MESSAGE, "private_message"),
        (PROJECT_COMMENT, "project_comment"),
        (REPLY_TO_PROJECT_COMMENT, "reply_to_project_comment"),
        (PROJECT_FOLLOWER, "project_follower"),
        (PROJECT_UPDATE_POST, "project_update_post"),
        (POST_COMMENT, "post_comment"),
        (REPLY_TO_POST_COMMENT, "reply_to_post_comment"),
        (GROUP_MESSAGE, "group_message")
    )

    notification_type = models.IntegerField(
        help_text="type of notification", verbose_name="Notification type",
        choices=NOTIFICATION_TYPES, default=BROADCAST
    )

    text = models.CharField(
        help_text="Text to be displayed in Notification",
        verbose_name="Text", max_length= 280, null=True, blank=True
    )

    chat = models.ForeignKey(
        MessageParticipants, related_name="notification_chat",
        help_text="Points to chat for notifications of type 'private_message'",
        verbose_name="Chat", on_delete=models.CASCADE,
        null=True, blank=True
    )

    project_comment = models.ForeignKey(
        ProjectComment, related_name="notification_project_comment",
        verbose_name="Project comment", on_delete=models.CASCADE,
        null=True, blank=True
    )
    
    post_comment = models.ForeignKey(
        PostComment, related_name="notification_post_comment",
        verbose_name="Post comment", on_delete=models.CASCADE,
        null=True, blank=True
    )

    project_follower = models.ForeignKey(
        ProjectFollower, related_name="notification_project_follower",
        verbose_name="Project Follower", on_delete=models.CASCADE,
        null=True, blank=True
    )

    project_update_post = models.ForeignKey(
        Post, related_name="notification_project_update_post",
        verbose_name="Project Post", on_delete=models.CASCADE,
        null=True, blank=True
    )

    created_at = models.DateTimeField(
        help_text="Time when participants started a messaging",
        verbose_name="Created at", auto_now_add=True
    )

    class Meta:
        verbose_name_plural = "Notifications"
        ordering = ["-id"]

class UserNotification(models.Model):
    user = models.ForeignKey(
        User, related_name="user_notification_user",
        verbose_name="User", on_delete=models.CASCADE
    )

    notification = models.ForeignKey(
        Notification, related_name="user_notification_notification",
        verbose_name="Notification", on_delete=models.CASCADE
    )

    read_at = models.DateTimeField(
        help_text="Time when the user has read the notification",
        verbose_name='Read at', null=True, blank=True
    )

    created_at = models.DateTimeField(
        help_text="Time when the notification was sent to the user",
        verbose_name="Created at", auto_now_add=True
    )

class EmailNotification(models.Model):
    user = models.ForeignKey(
        User, related_name="email_notification_user",
        verbose_name="User", on_delete=models.CASCADE
    )

    notification = models.ForeignKey(
        Notification, related_name="email_notification_notification",
        verbose_name="Notification", on_delete=models.CASCADE
    )

    created_at = models.DateTimeField(
        help_text="Time when the email was sent",
        verbose_name="Created at", auto_now_add=True
    )

    class Meta:
        verbose_name_plural = "Email Notifications"
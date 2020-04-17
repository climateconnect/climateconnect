from django.db import models
from organization.models import Project
from django.contrib.auth.models import User


class Posts(models.Model):
    project = models.ForeignKey(
        Project,
        related_name="post_project",
        verbose_name="Project",
        help_text="Points to the project to which the post belongs",
        on_delete=models.PROTECT
    )

    author_user = models.ForeignKey(
        User,
        related_name="post_author",
        help_text='Points to a user who wrote the post',
        verbose_name="Author",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    content = models.TextField(
        help_text="Content of the post",
        verbose_name="Content"
    )

    created_at = models.DateTimeField(
        help_text="Time when post was created",
        verbose_name="Created at",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when post was updated",
        verbose_name="Updated at",
        auto_now=True
    )

    is_hidden = models.BooleanField(
        help_text="If post has made hidden from public",
        verbose_name="Is hidden?",
        default=False
    )

    deleted_at = models.DateTimeField(
        help_text="Time when post was deleted",
        verbose_name="Deleted at",
        null=True,
        blank=True
    )

    deleted_by_user = models.ForeignKey(
        User,
        help_text="User who deleted the post",
        verbose_name="Deleted by user",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="post_delete"
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Posts"

    def __str__(self):
        return "Post id: %d for project %s" % (self.pk, self.project.name)


class Comments(models.Model):
    post = models.ForeignKey(
        Posts,
        related_name="comments",
        help_text="Points to post a comment was made to",
        verbose_name="Post",
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    author_user = models.ForeignKey(
        User,
        related_name="comment_author",
        help_text="Points to user who made comment",
        verbose_name="Author User",
        on_delete=models.CASCADE
    )

    content = models.TextField(
        help_text="Comment content",
        verbose_name="Content"
    )

    # Note: Added this so website administrator can mark a comment as abusive.
    # Only website administrator can mark comments abusive
    is_abusive = models.BooleanField(
        help_text="If comment is abusive",
        verbose_name="Is abusive?",
        default=False
    )

    created_at = models.DateTimeField(
        help_text="Time when post was created",
        auto_now_add=True,
        verbose_name="Created at"
    )

    updated_at = models.DateTimeField(
        help_text="Time when comment was updated",
        verbose_name="Updated at",
        auto_now=True
    )

    deleted_at = models.DateTimeField(
        help_text="Time when comment was deleted",
        verbose_name="Deleted at",
        null=True,
        blank=True
    )

    deleted_by_user = models.ForeignKey(
        User,
        related_name="comment_delete",
        help_text="Person who deleted the comment",
        verbose_name="Deleted by user",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Post Comments"

    def __str__(self):
        return "Comment %d made to post %d" % (self.pk, self.pk)

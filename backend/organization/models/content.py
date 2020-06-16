from django.db import models
from organization.models import Project
from django.contrib.auth.models import User


class Post(models.Model):
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
        verbose_name = "Post"

    def __str__(self):
        return "Post id: %d for project %s" % (self.pk, self.project.name)


class Comment(models.Model):
    parent_comment = models.ForeignKey(
        'self',
        related_name="comment_parent",
        help_text="Points to parent comment",
        verbose_name="Parent Comment",
        null=True,
        blank=True,
        on_delete=models.CASCADE
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
        verbose_name = "Comment"
        verbose_name_plural = "Comments"

    def __str__(self):
        return "Comment %d: %s" % (self.pk, self.content)


class PostComment(Comment):
    post = models.ForeignKey(
        Post,
        related_name="comment_post",
        help_text="Point to post table",
        verbose_name="Post",
        on_delete=models.CASCADE
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Post Comment"

    def __str__(self):
        return "%d post for project %d" % (self.pk, self.post.pk)


class ProjectComment(Comment):
    project = models.ForeignKey(
        Project,
        related_name="project_comment",
        verbose_name="Project",
        on_delete=models.CASCADE
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Project Comment"
        verbose_name_plural = "Project Comments"

    def __str__(self):
        return "Comment made to project %s" % self.project.name

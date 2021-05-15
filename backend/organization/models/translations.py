from django.db import models
from django.contrib.postgres.fields import ArrayField

from climateconnect_api.models.language import Language
from organization.models import (
    Project, Organization, Post, Comment
)


class ProjectTranslation(models.Model):
    project = models.ForeignKey(
        Project, related_name='translation_project',
        help_text="Point to project table", verbose_name="Project",
        on_delete=models.CASCADE
    )

    language = models.ForeignKey(
        Language, related_name="proj_translation_language",
        help_text="Point to languaage table", verbose_name="Language",
        on_delete=models.CASCADE
    )

    name_translation = models.CharField(
        help_text="Translation of project name",
        verbose_name="Name translation",
        max_length=1024, null=True, blank=True
    )

    short_description_translation = models.TextField(
        help_text="Translation of project's short description",
        verbose_name="Short description translation",
        max_length=560, null=True, blank=True
    )

    description_translation = models.TextField(
        help_text="Translation of project's description",
        verbose_name="Description translation",
        max_length=9000, null=True, blank=True
    )

    helpful_connections_translation = ArrayField(
        models.CharField(max_length=528, blank=True),
        help_text="Translation of project's connections",
        verbose_name="Helpful Connections translation",
        blank=True, null=True,
        size=10,
    )

    is_manual_translation = models.BooleanField(
        help_text="Did the user manually translate this or was it automatically translated with DeepL?",
        verbose_name="Is manual translation?", default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True, help_text="Time when translation object was created",
        verbose_name="Created at", null=True, blank=True
    )

    updated_at = models.DateTimeField(
        auto_now=True, help_text="Time when translation object was updated",
        verbose_name="Updated at", null=True, blank=True
    )

    class Meta:
        verbose_name = "Project translation"
        verbose_name_plural = "Project translations"
        unique_together = [['project', 'language']]
    
    def __str__(self):
        return "{}: {} translation for project {}".format(
            self.id, self.language.name, self.project.name
        )


class OrganizationTranslation(models.Model):
    organization = models.ForeignKey(
        Organization, related_name="translation_org",
        help_text="Points to organization table", verbose_name="Organization",
        on_delete=models.CASCADE
    )

    language = models.ForeignKey(
        Language, related_name="org_translation_language",
        help_text="Points to language organization needed to be translated to",
        verbose_name="Language",
        on_delete=models.CASCADE
    )

    name_translation = models.CharField(
        help_text="Translation of organization name",
        verbose_name="Name translation",
        max_length=1024, null=True, blank=True
    )

    about_translation = models.TextField(
        help_text="Translation of about section in organization page",
        verbose_name="About section translation",
        null=True, blank=True
    )

    short_description_translation = models.TextField(
        help_text="Translation of short description",
        verbose_name="Short description translation",
        max_length=560, null=True, blank=True
    )

    school_translation = models.CharField(
        help_text="Translation of school name",
        verbose_name="School translation",
        max_length=512, null=True, blank=True
    )

    organ_translation = models.CharField(
        help_text="Translation of gov organization",
        verbose_name="Organ translation", max_length=512, null=True, blank=True
    )

    is_manual_translation = models.BooleanField(
        help_text="Did the user manually translate this or was it automatically translated with DeepL?",
        verbose_name="Is manual translation?", default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True, help_text="Time when translation object was created",
        verbose_name="Created at", null=True, blank=True
    )

    updated_at = models.DateTimeField(
        auto_now=True, help_text="Time when translation object was updated",
        verbose_name="Updated at", null=True, blank=True
    )

    class Meta:
        verbose_name = "Organization translation"
        verbose_name_plural = "Organization translations"
        app_label = "organization"
    
    def __str__(self):
        return "{}: {} translation for organizaton {}".format(
            self.id, self.language.name, self.organization.name
        )


class PostTranslation(models.Model):
    post = models.ForeignKey(
        Post,
        related_name="translate_post",
        help_text="Points to post table",
        verbose_name="Post",
        on_delete=models.CASCADE
    )

    language = models.ForeignKey(
        Language,
        related_name="post_translation_lang",
        help_text="Points to language table",
        verbose_name="Language",
        on_delete=models.CASCADE
    )

    content_translation = models.TextField(
        help_text="Translation of content column",
        verbose_name="Content translation",
        null=True,
        blank=True
    )

    is_manual_translation = models.BooleanField(
        help_text="Did the user manually translate this or was it automatically translated with DeepL?",
        verbose_name="Is manual translation?", default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True, help_text="Time when translation object was created",
        verbose_name="Created at", null=True, blank=True
    )

    updated_at = models.DateTimeField(
        auto_now=True, help_text="Time when translation object was updated",
        verbose_name="Updated at", null=True, blank=True
    )

    class Meta:
        verbose_name = "Post translation"
        verbose_name_plural = "Post translations"
        unique_together = [['post', 'language']]
    
    def __str__(self):
        return "{} translation for post id {}".format(
            self.language.name, self.post.id
        )


class CommentTranslation(models.Model):
    comment = models.ForeignKey(
        Comment,
        related_name="translate_comment",
        help_text="Point to comment table",
        verbose_name="Comment",
        on_delete=models.CASCADE
    )

    language = models.ForeignKey(
        Language,
        related_name="comment_translation_lang",
        help_text="Points to language table",
        verbose_name="Language",
        on_delete=models.CASCADE
    )

    content_translation = models.TextField(
        help_text="Translation of content column",
        verbose_name="Content translation",
        null=True,
        blank=True
    )

    is_manual_translation = models.BooleanField(
        help_text="Did the user manually translate this or was it automatically translated with DeepL?",
        verbose_name="Is manual translation?", default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True, help_text="Time when translation object was created",
        verbose_name="Created at", null=True, blank=True
    )

    updated_at = models.DateTimeField(
        auto_now=True, help_text="Time when translation object was updated",
        verbose_name="Updated at", null=True, blank=True
    )

    class Meta:
        verbose_name = "Comment translation"
        verbose_name_plural = "Comment translations"
        unique_together = [['comment', 'language']]
    
    def __str__(self):
        return "{} translation of comment id {}".format(
            self.language.name, self.comment.id
        )

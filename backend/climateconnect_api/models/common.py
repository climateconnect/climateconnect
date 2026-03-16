from django.db import models
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User


class Feedback(models.Model):
    user = models.ForeignKey(
        User,
        related_name="feedback_user",
        verbose_name="feedback_user",
        help_text="Points to the user who gave the feedback",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    email = models.EmailField(
        help_text="The email to which we should send the reply",
        verbose_name="User Email",
        null=True,
        blank=True,
    )

    text = models.TextField(
        help_text="The text the user wrote", verbose_name="Feedback"
    )

    send_response = models.BooleanField(
        help_text="Checks whether we should response to this user",
        verbose_name="User requested response",
        default=False,
    )

    user_agent = models.TextField(
        help_text="The user agent of the browser when feedback was submitted",
        verbose_name="User Agent",
        null=True,
        blank=True,
    )

    path = models.TextField(
        help_text="The URL path (including query string) where feedback was submitted",
        verbose_name="Path",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        help_text="Time when feedback was created",
        verbose_name="Created At",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="Time when feedback was updated",
        verbose_name="Updated At",
        auto_now=True,
    )

    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "Feedback"
        verbose_name_plural = "Feedback_Messages"
        db_table = "climateconnect_feedback"
        ordering = ["-id"]

    def __str__(self):
        return "Feedback: %d" % (self.id)


class Availability(models.Model):
    name = models.CharField(
        help_text="Full text of user's availability to work on a project",
        verbose_name="Name",
        max_length=512,
    )

    name_de_translation = models.CharField(
        help_text="German translation of user's availability",
        verbose_name="Name DE translation",
        max_length=512,
        null=True,
        blank=True,
    )

    key = models.CharField(
        help_text="Key for user' availability", verbose_name="Key", max_length=100
    )

    created_at = models.DateTimeField(
        help_text="Time when object was created",
        verbose_name="Created At",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="Time when object was updated",
        verbose_name="Updated At",
        auto_now=True,
    )

    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "Availability"
        verbose_name_plural = "Availabilities"
        db_table = "climateconnect_availability"
        ordering = ["id"]

    def __str__(self):
        return "%s" % self.name


class Skill(models.Model):
    name = models.CharField(
        help_text="Name of the skill", verbose_name="Name", max_length=512
    )

    name_de_translation = models.CharField(
        help_text="Deutsch translation of name column",
        verbose_name="Name DE translation",
        max_length=512,
        null=True,
        blank=True,
    )

    # Skill name has spaces and we use skill filters for projects and users.
    # This would help us for filters.
    key = models.CharField(
        help_text="Key of a skill",
        verbose_name="Key",
        max_length=512,
        null=True,
        blank=True,
    )

    parent_skill = models.ForeignKey(
        "self",
        related_name="skill_parent",
        verbose_name="Parent Skill",
        help_text="Points to the parent skill",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
    )

    created_at = models.DateTimeField(
        help_text="Time when skill was created",
        verbose_name="Created At",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="Time when skill was updated",
        verbose_name="Updated At",
        auto_now=True,
    )

    details = models.CharField(
        help_text="Additional details about the skill",
        verbose_name="Details",
        max_length=128,
        null=True,
        blank=True,
    )

    details_de_translation = models.CharField(
        help_text="Deutsch translation for details columns",
        verbose_name="Details DE translation",
        max_length=128,
        null=True,
        blank=True,
    )

    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "Skill"
        verbose_name_plural = "Skills"
        db_table = "climateconnect_skill"
        ordering = ["id"]

    def __str__(self):
        return "%s" % self.name


@receiver(pre_save, sender=Skill)
def save_skills_key(sender, instance, **kwargs):
    instance.key = instance.name.replace(" ", "").lower()

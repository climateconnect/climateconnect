from django.db import models


class Availability(models.Model):
    name = models.CharField(
        help_text="Full text of user's availability to work on a project",
        verbose_name="Name",
        max_length=512
    )

    key = models.CharField(
        help_text="Key for user' availability",
        verbose_name="Key",
        max_length=100
    )

    created_at = models.DateTimeField(
        help_text="Time when object was created",
        verbose_name="Created At",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when object was updated",
        verbose_name="Updated At",
        auto_now=True
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
        help_text="Name of the skill",
        verbose_name="Name",
        max_length=512
    )

    parent_skill = models.ForeignKey(
        'self',
        related_name="skill_parent",
        verbose_name="Parent Skill",
        help_text="Points to the parent skill",
        null=True,
        blank=True,
        on_delete=models.PROTECT
    )

    created_at = models.DateTimeField(
        help_text="Time when skill was created",
        verbose_name="Created At",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when skill was updated",
        verbose_name="Updated At",
        auto_now=True
    )

    details = models.CharField(
        help_text="Additional details about the skill",
        verbose_name="Details",
        max_length=128,
        null=True,
        blank=True
    )

    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "Skill"
        verbose_name_plural = "Skills"
        db_table = "climateconnect_skill"
        ordering = ["id"]

    def __str__(self):
        return "%s" % self.name

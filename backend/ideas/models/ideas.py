from climateconnect_api.models.language import Language
from django.db import models
from django.contrib.auth.models import User
from organization.models.organization import Organization
from hubs.models.hub import Hub
from location.models import Location


def idea_image_path(instance, filename):
    return "ideas/{}/image/{}".format(instance.id, filename)


class Idea(models.Model):
    name = models.CharField(
        help_text="Name of an idea", verbose_name="Name", max_length=256
    )

    url_slug = models.CharField(
        help_text="URL slug for an idea",
        verbose_name="URL Slug",
        max_length=1024,
        null=True,
        blank=True,
        unique=True,
    )

    short_description = models.CharField(
        help_text="Summary of an idea", verbose_name="Summary", max_length=2048
    )

    image = models.ImageField(
        help_text="Image of an idea",
        verbose_name="Image",
        upload_to=idea_image_path,
        null=True,
        blank=True,
    )

    thumbnail_image = models.ImageField(
        help_text="Image shown in idea cards",
        verbose_name="Thumbnail image",
        upload_to=idea_image_path,
        null=True,
        blank=True,
    )

    user = models.ForeignKey(
        User,
        help_text="Points to user who created the idea",
        verbose_name="User",
        related_name="idea_user",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    organization = models.ForeignKey(
        Organization,
        help_text="Points to organization the idea is under",
        verbose_name="Organization",
        related_name="idea_organization",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    hub = models.ForeignKey(
        Hub,
        help_text="Points to hub the idea is under",
        verbose_name="Hub",
        related_name="idea_hub",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    hub_shared_in = models.ForeignKey(
        Hub,
        help_text="Points to the (location)hub the idea was shared in",
        verbose_name="(Location-)Hub where idea was shared",
        related_name="idea_hub_shared_in",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    location = models.ForeignKey(
        Location,
        help_text="Points to location of the idea",
        verbose_name="Location",
        related_name="idea_location",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    language = models.ForeignKey(
        Language,
        help_text="Points to language in which the idea was submitted",
        verbose_name="Language",
        related_name="idea_language",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        help_text="Time when idea was created",
        verbose_name="Created at",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="Time when idea was last updated",
        verbose_name="Update at",
        auto_now=True,
    )

    class Meta:
        verbose_name = "Idea"
        verbose_name_plural = "Ideas"
        ordering = ["-id"]

    def __str__(self):
        return "{}: {}".format(self.id, self.name)

from django.db import models

from organization.models.organization import Organization
from hubs.models.hub import Hub


class Idea(models.Model):
    name = models.CharField(
        help_text="Name of an idea",
        verbose_name="Name",
        max_length=256
    )

    summary = models.CharField(
        help_text="Summary of an idea",
        verbose_name="Summary",
        max_length=1024
    )

    description = models.TextField(
        help_text="Detailed description of an idea",
        verbose_name="Description",
        null=True,
        blank=True
    )

    organization = models.ForeignKey(
        Organization,
        help_text="Points to organization the idea is under",
        verbose_name="Organization",
        related_name="idea_organization",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    hub = models.ForeignKey(
        Hub,
        help_text="Points to hub the idea is under",
        verbose_name="Hub",
        related_name="idea_hub",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    created_at = models.DateTimeField(
        help_text="Time when idea was created",
        verbose_name="Created at",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when idea was last updated",
        verbose_name="Update at",
        auto_now=True
    )

    class Meta:
        verbose_name = "Idea"
        verbose_name_plural = "Ideas"
    
    def __str__(self):
        return "{}: {}".format(self.id, self.name)

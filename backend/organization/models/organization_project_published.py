from organization.models.followers import OrganizationFollower
from organization.models.project import  Project
from django.db import models
from organization.models.organization import Organization
from django.contrib.auth.models import User


class OrgProjectPublished(models.Model):
    organization = models.ForeignKey(
        Organization,
        related_name="organization_that_published",
        verbose_name="Organization that published a project",
        help_text="Points to an organization",
        on_delete=models.CASCADE,
    )
    project = models.ForeignKey(
        Project,
        related_name="project_published_by_org",
        verbose_name="Project that was published by org",
        help_text="Points to a project",
        on_delete=models.CASCADE,
    )
    user = models.ForeignKey(
        User,
        related_name="receiving_organization_follower",
        verbose_name="Organization Follower that will receive notification",
        on_delete=models.CASCADE,
         
    )
    created_at = models.DateTimeField(
        help_text="Time when organization was created",
        verbose_name="Created At",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="Time when organization object was updated",
        verbose_name="Updated At",
        auto_now=True,
    )
    class Meta:
        app_label = "organization"
        verbose_name = "Organization Project Published"
        ordering = ["-id"]

    def __str__(self):
        return "%s %s (%d)" % (self.project.name, "project published", self.pk)

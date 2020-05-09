from django.db import models
from django.contrib.auth.models import User
from organization.models import (Project, Organization)
from climateconnect_api.models import (Role,)


class ProjectMember(models.Model):
    user = models.ForeignKey(
        User, related_name="project_member",
        help_text="Points to user table", verbose_name="User",
        on_delete=models.CASCADE
    )

    project = models.ForeignKey(
        Project, related_name="project_member",
        help_text="Points to project table", verbose_name="Project",
        on_delete=models.CASCADE
    )

    role = models.ForeignKey(
        Role, related_name="project_role",
        verbose_name="Role", help_text="Points to user role",
        on_delete=models.PROTECT
    )

    created_at = models.DateTimeField(
        help_text="Time when project members were created", verbose_name="Created At",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when project members were updated", verbose_name="Updated At",
        auto_now=True
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Project Member"
        verbose_name_plural = "Project Members"

    def __str__(self):
        return "User %d member for Project %s" % (self.user.id, self.project.name)


class OrganizationMember(models.Model):
    user = models.ForeignKey(
        User, related_name="org_member",
        help_text="Point to user table", verbose_name="User",
        on_delete=models.CASCADE
    )

    organization = models.ForeignKey(
        Organization, related_name="organization_member",
        help_text="Points to organization table", verbose_name="Organization",
        on_delete=models.CASCADE
    )

    role = models.ForeignKey(
        Role, related_name="organization_role",
        help_text="Points ot Role table", verbose_name="Role",
        on_delete=models.PROTECT
    )

    created_at = models.DateTimeField(
        help_text="Time when organization member was created", verbose_name="Created At",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when organization member was updated", verbose_name="Updated At",
        auto_now=True
    )

    class Meta:
        app_label = "organization"
        verbose_name = 'Organization Member'
        verbose_name_plural = 'Organization Members'

    def __str__(self):
        return "User %d member for organization %s" % (self.user.id, self.organization.name)

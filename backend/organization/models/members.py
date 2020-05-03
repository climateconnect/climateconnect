from django.db import models
from django.contrib.auth.models import User
from organization.models import (Project, Orgranization)


class ProjectMember(models.Model):
    users = models.ForeignKey(
        User, related_name="project_member",
        help_text="Points to user table", verbose_name="User"
    )

    project = models.ForeignKey(
        Project, related_name="project_member",
        help_text="Points to projec table", verbose_name="Project"
    )

    role = models.ForeignKey(
        Role, related_name="project_role",
        verbose_name="Role", help_text="Points to user role"
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
        app_label = "climateconnect_api"
        verbose_name = "Project Member"
        verbose_name_plural = "Project Members"

    def __str__(self):
        return "Project %s for role %s" % (self.project.name, self.role.name)

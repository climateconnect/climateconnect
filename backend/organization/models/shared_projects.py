from django.db import models
from organization.models.project import Project
from django.contrib.auth.models import User

class ProjectsShared(models.Model):
    project = models.ForeignKey(
        Project,
        related_name="project_shared",
        verbose_name="Project",
        help_text="Points to a project",
        on_delete=models.CASCADE
    )

    user = models.ForeignKey(
        User,
        related_name="sharing_user",
        verbose_name="Sharing User",
        help_text="Points to the user who shared the project",
        on_delete=models.CASCADE,
        default="non-logged-in user"
    )

    created_at = models.DateTimeField(
        help_text="Time when the user shared the project",
        verbose_name="Created At",
        auto_now_add=True
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Project Shared"
        verbose_name_plural = "Projects Shared"
        ordering = ["-id"]

    def __str__(self):
        return "%s shared %s " % (self.user, self.project.name)
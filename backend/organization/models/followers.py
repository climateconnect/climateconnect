from django.db import models
from organization.models.project import Project
from django.contrib.auth.models import User


class ProjectFollower(models.Model):
    project = models.ForeignKey(
        Project,
        related_name="project_following",
        verbose_name="Project",
        help_text="Points to a project",
        on_delete=models.CASCADE
    )

    user = models.ForeignKey(
        User,
        related_name="follower",
        verbose_name="Follower",
        help_text="Points to the user following the project",
        on_delete=models.CASCADE
    )

    created_at = models.DateTimeField(
        help_text="Time when the user followed the project",
        verbose_name="Created At",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when the follower was updated",
        verbose_name="Updated At",
        auto_now_add=True
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Project Follower"
        verbose_name_plural = "Project Followers"
        ordering = ["-id"]

    def __str__(self):
        return "%s follows %s " % (self.user, self.project.name)

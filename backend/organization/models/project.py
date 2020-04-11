from django.db import models

from organization.models import (Organization,)


def project_image_path(instance, filename):
    return "projects/{}/{}".format(instance.id, filename)


class Project(models.Model):
    name = models.CharField(
        help_text="Points to project name",
        verbose_name="Name",
        max_length=1024
    )

    slug = models.CharField(
        help_text="URL slug for project",
        verbose_name="Slug",
        unique=True,
        null=True,
        blank=True,
        max_length=1024
    )

    image = models.ImageField(
        help_text="Project image",
        verbose_name="Image",
        null=True,
        blank=True,
        upload_to=project_image_path
    )

    PROJECT_IDEA = "idea"
    PROJECT_IN_PROGRESS = "in_progress"
    PROJECT_FINISHED = "finished"
    PROJECT_CANCELLED = "cancelled"
    PROJECT_RECURRING = "recurring"

    PROJECT_STATUSES = (
        (PROJECT_IDEA, "Idea"),
        (PROJECT_IN_PROGRESS, "In Progress"),
        (PROJECT_FINISHED, "Finished"),
        (PROJECT_CANCELLED, "Cancelled"),
        (PROJECT_RECURRING, "Recurring")
    )

    status = models.CharField(
        help_text="Points to status of the project",
        verbose_name="Status",
        max_length=64,
        choices=PROJECT_STATUSES,
        default=PROJECT_IDEA
    )

    start_date = models.DateTimeField(
        help_text="Points to start date of the project",
        verbose_name="Start Date",
        null=True,
        blank=True
    )

    end_date = models.DateTimeField(
        help_text="Points to end date of the project",
        verbose_name="End Date",
        null=True,
        blank=True
    )

    # created_at value automatically added when new project is created

    created_at = models.DateTimeField(
        help_text="Points to creation date of the project",
        verbose_name="Created At",
        auto_now_add=True
    )

    # updated_at value automatically changes every time there is change in project object.
    updated_at = models.DateTimeField(
        help_text="Points to time when project was updated",
        verbose_name="Updated At",
        auto_now=True
    )

    short_description = models.TextField(
        help_text="Points to short description about the project",
        verbose_name="Short Description",
        null=True,
        blank=True
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Project"
        verbose_name_plural = "Projects"

    def __str__(self):
        return "(%d) %s" % (self.pk, self.name)


class ProjectParents(models.Model):
    project = models.ForeignKey(
        Project,
        help_text="Points to organizations's project",
        verbose_name="Project",
        related_name="org_project",
        on_delete=models.CASCADE
    )

    parent_organization = models.ForeignKey(
        Organization,
        help_text="Points to organization",
        verbose_name="Organization",
        related_name="project_parent_org",
        on_delete=models.CASCADE
    )

    parent_user = models.ForeignKey(
        'auth.User',
        verbose_name="Points to user who created a project",
        related_name="project_parent_user",
        null=True,
        blank=True,
        on_delete=models.PROTECT
    )

    order = models.IntegerField(
        help_text="Order in which project should be listed",
        verbose_name="Order"
    )

    created_at = models.DateTimeField(
        help_text="Time when project was linked to an organization",
        verbose_name="Created At",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when project was updated. i.e.: Order change etc.",
        verbose_name="Updated At",
        auto_now=True
    )

    class Meta:
        app_label = 'organization'
        verbose_name = "Project Parents"
        unique_together = [['project', 'order']]

    def __str__(self):
        return "Project %s of organization %s" % (self.project.name, self.parent_organization.name)

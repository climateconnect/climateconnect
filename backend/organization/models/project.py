from django.db import models
from django.contrib.postgres.fields import ArrayField

from organization.models import (Organization,)
from climateconnect_api.models import (Skill,)


def project_image_path(instance, filename):
    return "projects/{}/{}".format(instance.id, filename)


class Project(models.Model):
    name = models.CharField(
        help_text="Points to project name",
        verbose_name="Name",
        max_length=1024
    )

    url_slug = models.CharField(
        help_text="URL slug for project",
        verbose_name="URL slug",
        unique=True,
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

    PROJECT_STATUS_LIST = [
        PROJECT_IDEA, PROJECT_IN_PROGRESS, PROJECT_FINISHED,
        PROJECT_CANCELLED, PROJECT_RECURRING
    ]

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

    short_description = models.CharField(
        help_text="Points to short description about the project",
        verbose_name="Short Description",
        null=True,
        blank=True,
        max_length=240
    )

    description = models.CharField(
        help_text="Points to detailed description about the project",
        verbose_name="Description",
        null=True,
        blank=True,
        max_length=4800
    )

    country = models.CharField(
        help_text="Points to a country of the project",
        verbose_name="Country",
        max_length=512,
        null=True,
        blank=True
    )

    city = models.CharField(
        help_text="Points to a city of the project",
        verbose_name="City",
        max_length=512,
        null=True,
        blank=True
    )

    collaborators_welcome = models.BooleanField(
        help_text="If collaborators are welcome or not for the project",
        verbose_name="Collaborators welcome",
        default=False
    )

    skills = models.ManyToManyField(
        Skill,
        related_name="project_skills",
        help_text="Points to all skills project persist or required",
        verbose_name="Skills",
        blank=True
    )

    helpful_connections = ArrayField(
        models.CharField(max_length=264),
        blank=True,
        null=True,
        size=5
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Project"
        verbose_name_plural = "Projects"
        ordering = ['-id']

    def __str__(self):
        return "(%d) %s" % (self.pk, self.name)


class ProjectParents(models.Model):
    project = models.ForeignKey(
        Project,
        help_text="Points to organizations's project",
        verbose_name="Project",
        related_name="project_parent",
        on_delete=models.CASCADE
    )

    parent_organization = models.ForeignKey(
        Organization,
        help_text="Points to organization",
        verbose_name="Organization",
        related_name="project_parent_org",
        on_delete=models.CASCADE,
        null=True, 
        blank=True
    )

    parent_user = models.ForeignKey(
        'auth.User',
        verbose_name="Points to user who created a project",
        related_name="project_parent_user",
        null=True,
        blank=True,
        on_delete=models.PROTECT
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
        verbose_name_plural = "Project Parents"

    def __str__(self):
        return "Project %s of organization %s" % (self.project.name, self.parent_organization.name)

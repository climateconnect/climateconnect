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
        verbose_name="Role(permissions)", help_text="Points to user role",
        on_delete=models.PROTECT
    )

    role_in_project = models.CharField(
        help_text="Points to the role of the person in the project, e.g. 'project manager'",
        verbose_name="Role in project",
        max_length=1024,
        null=True,
        blank=True
    )

    # TODO: use availability table
    NOT_SPECIFIED = "not_specified"
    ONE_TO_TWO = "1-2"
    THREE_TO_FIVE = "3-5"
    SIX_TO_TEN = "6-10"
    ELEVEN_TO_FIFTEEN = "11-15"
    SIXTEEN_TO_TWENTY = "16-20"
    TWENTYONE_TO_TWENTYFIVE = "21-25"
    TWENTYSIX_TO_THIRTY = "26-30"
    THIRTYONE_TOT_THIRTYFIVE = "31-35"
    THIRTYSIX_TO_FOURTY = "36-40"
    OVER_FOURTY = "over_40"

    TIME_PER_WEEK_OPTIONS = (
        (NOT_SPECIFIED, "Not specified"),
        (ONE_TO_TWO, "1-2"),
        (THREE_TO_FIVE, "3-5"),
        (SIX_TO_TEN, "6-10"),
        (ELEVEN_TO_FIFTEEN, "11-15"),
        (SIXTEEN_TO_TWENTY, "16-20"),
        (TWENTYONE_TO_TWENTYFIVE, "21-25"),
        (TWENTYSIX_TO_THIRTY, "26-30"),
        (THIRTYONE_TOT_THIRTYFIVE, "31-35"),
        (THIRTYSIX_TO_FOURTY, "36-40"),
        (OVER_FOURTY, "More than 40")
    )

    time_per_week = models.CharField(
        help_text="Shows how many hours per week the user is putting into this specific project.",
        verbose_name="Time per week",
        max_length=64,
        choices=TIME_PER_WEEK_OPTIONS,
        default=NOT_SPECIFIED
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

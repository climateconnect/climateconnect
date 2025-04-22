from django.db import models

from organization.models import Organization
from organization.models.project import Project


# Add Icon and image (copy from sector hub)
class Sector(models.Model):
    name = models.CharField(
        help_text="Name of the sector",
        verbose_name="Name",
        max_length=256,
    )

    name_de_translation = models.CharField(
        help_text="German traslation of the name column",
        verbose_name="Name DE translation",
        max_length=256,
        null=True,
        blank=True,
    )

    # Adding this because we use project tags to filter project and its not possible to filter Name because
    # it contains spaces.
    key = models.CharField(
        help_text="unique search key of the sector. Example: `Student organization` becomes studentorganization",
        verbose_name="Key",
        max_length=256,
        unique=True,
    )

    created_at = models.DateTimeField(
        help_text="Time when sector was created",
        verbose_name="Created at",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="Time when sector was updated",
        verbose_name="Updated at",
        auto_now=True,
    )

    # Option 1: Parent Hubs
    # - Scottland hub
    #   - Climate Caffe
    # this solution is too complicated for now

    # Option 2: Sector
    # - do not show specific sectors everywhere (e.g. importance -> don't show if importance == 0)
    # n to m: hub to sectors: which sectors can I select while being on the hub

    # For this PR: Add importance field, sort by importance and filter out importance == 0 in serializer

    class Meta:
        app_label = "organization"
        verbose_name = "Sector"
        ordering = ["id"]

    def __str__(self):
        return "%s" % self.name


class ProjectSectorMapping(models.Model):
    sector = models.ForeignKey(Sector, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)

    created_at = models.DateTimeField(
        help_text="Time when mapping was created",
        verbose_name="Created At",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="Time when mapping was updated",
        verbose_name="Updated At",
        auto_now=True,
    )

    order = models.PositiveSmallIntegerField(
        help_text="The bigger the number, the more to the top this sector will be displayed",
        verbose_name="Position of tag",
        default=0,
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Project Sector Mapping"
        ordering = ["id"]

    def __str__(self):
        return f"{self.sector.name}--{self.project.name}"


class OrganizationSectorMapping(models.Model):
    sector = models.ForeignKey(Sector, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)

    created_at = models.DateTimeField(
        help_text="Time when mapping was created",
        verbose_name="Created At",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="Time when mapping was updated",
        verbose_name="Updated At",
        auto_now=True,
    )

    order = models.PositiveSmallIntegerField(
        help_text="The bigger the number, the more to the top this sector will be displayed",
        verbose_name="Position of tag",
        default=0,
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Organization Sector Mapping"
        ordering = ["id"]

    #
    def __str__(self):
        return f"{self.sector.name}--{self.organization.name}"

from django.db import models

from organization.models import Organization
from organization.models.project import Project


def sector_image_path(instance, filename):
    return "sector/{}/{}".format(instance.id, filename)


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
        help_text="unique search key of the sector. Example: 'Food & Agriculture' becomes foodagriculture",
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

    image_attribution = models.CharField(
        help_text="This is incase we have to attribute somebody or a website for using their image",
        verbose_name="Image attribution",
        max_length=1024,
        null=True,
        blank=True,
    )

    image = models.ImageField(
        help_text="Sector image",
        verbose_name="Image",
        null=True,
        blank=True,
        upload_to=sector_image_path,
    )

    icon = models.FileField(
        help_text="The icon representing the hub in the small sector preview cards",
        verbose_name="Icon",
        null=True,
        blank=True,
        upload_to=sector_image_path,
    )

    thumbnail_image = models.ImageField(
        help_text="Image to show on sector card",
        verbose_name="Thumbnail image",
        null=True,
        blank=True,
        upload_to=sector_image_path,
    )

    # Option 1:
    # TODO: when adding a sector, then also add the relates_to_sector
    # TODO: when deleting a sector, then also delete the relates_to_sector

    # TODO: Edge Case
    # what, if both the related sector and the sector are used in a hub?
    # E.g. Climate Cafe and Education in Perth:
    # - user selects only Climate Cafe >> but sees Education as well
    # - user selects both Education and Climate Cafe and then later deletes Climate Cafe >> but this deletes Education as well

    # this will not work, because, if filters stays like this, both sectors have to be selected in any case.
    # > no redundancy and go with option 2: extending the filter by sector feature.

    # Option 2:
    # filter by sector: sector__key__in=... or sector__relates_to_sector__key__in=...
    # >> but now, when serializing, I need to know which sector to use ...

    # Went with option 2

    # browse --> share project for location perth
    # general sectors
    # >> education

    # /hubs/perth/browse
    #

    # > Hubs.specific_sectors: Zero Waste (>), Education, Climate Cafe (>Education), transport (>mobility)

    default_sector = models.BooleanField(
        help_text="If this sector is a default sector, it will be used if no specific sector is selected.",
        verbose_name="Default sector",
        default=True,
        blank=False,
        null=False,
    )

    # climate cafe -> sector: education
    relates_to_sector = models.ForeignKey(
        "Sector",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="hub_specific_sector",
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Sector"
        ordering = ["id"]

    def __str__(self):
        return "%s" % self.name


class ProjectSectorMapping(models.Model):
    sector = models.ForeignKey(
        Sector, on_delete=models.CASCADE, related_name="project_sector_mapping"
    )
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="project_sector_mapping"
    )

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
        unique_together = ("sector", "project")

    def __str__(self):
        return f"{self.sector.name}--{self.project.name}"


class OrganizationSectorMapping(models.Model):
    sector = models.ForeignKey(
        Sector, on_delete=models.CASCADE, related_name="organization_sector_mapping"
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="organization_sector_mapping",
    )

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
        unique_together = ("sector", "organization")

    #
    def __str__(self):
        return f"{self.sector.name}--{self.organization.name}"

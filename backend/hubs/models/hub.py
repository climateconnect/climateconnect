from organization.models.tags import ProjectTags
from django.db import models

def hub_image_path(instance, filename):
    return "hubs/{}/{}".format(instance.id, filename)

class HubStat(models.Model):
    name = models.CharField(
        help_text="Points to stat name",
        verbose_name="Name",
        max_length=1024
    )

    value = models.CharField(
        help_text="Value of the stat that is being highlighted in the stat box (e.g. '75%')",
        verbose_name="Stat Value",
        max_length=128,
        null=True,
        blank=True
    )

    value_description = models.CharField(
        help_text="Explains what the value describes (e.g. 'of global ghg emissions')",
        verbose_name="Value description",
        max_length=1024,
        null=True,
        blank=True
    )

    description = models.CharField(
        help_text="Description that is shown in the stat box",
        verbose_name="Stat box description",
        max_length=1024,
        null=True,
        blank=True
    )

    source_link = models.CharField(
        help_text="Link to the source of the stat",
        verbose_name="Source link",
        max_length=1024,
        null=True,
        blank=True
    ) 

    source_name = models.CharField(
        help_text="Name of the source",
        verbose_name="Source Name",
        max_length=1024,
        null=True,
        blank=True
    ) 

    class Meta:
        app_label = "hubs"
        verbose_name = "HubStat"
        verbose_name_plural = "HubStats"
    def __str__(self):
        return "%s" % (self.name)    

class Hub(models.Model):
    name = models.CharField(
        help_text="Points to hub name",
        verbose_name="Name",
        max_length=1024
    )

    url_slug = models.CharField(
        help_text="URL slug for hub",
        verbose_name="URL slug",
        unique=True,
        max_length=1024,
        null=True,
        blank=True
    )

    headline = models.CharField(
        help_text="Headline",
        verbose_name="headline",
        max_length=1024,
        null=True,
        blank=True
    )

    sub_headline = models.CharField(
        help_text="Sub headline",
        verbose_name="Sub headline",
        max_length=1024,
        null=True,
        blank=True
    )

    segway_text = models.TextField(
        help_text="Segway text between the info and the solutions",
        verbose_name="Segway text"
    )

    image = models.ImageField(
        help_text="Hub image",
        verbose_name="Image",
        null=True,
        blank=True,
        upload_to=hub_image_path
    )

    thumbnail_image = models.ImageField(
        help_text="Image to show on hub card",
        verbose_name="Thumbnail image",
        null=True,
        blank=True,
        upload_to=hub_image_path
    )

    quick_info = models.TextField(
        help_text="Text that is shown when the hub info is not expanded",
        verbose_name="Quick info about the hub (non-expanded text)"
    )

    stats = models.ManyToManyField(
        HubStat,
        related_name="hub_stats",
        help_text="points to the stats for the hubs",
        verbose_name="Hub Stats",
        blank=True
    )

    importance = models.PositiveSmallIntegerField(
        help_text="The larger the number, the more to the top this hub will be displayed on the hubs overview page",
        verbose_name="Importance (1-100)",
        default=100
    )

    filter_parent_tags = models.ManyToManyField(
        ProjectTags,
        related_name="hub_parent_tags",
        help_text="Only project with these parent tags will be shown in the hub",
        verbose_name="Hub categories",
        blank=True
    )

    stat_box_title = models.CharField(
        help_text="The text displayed on top of the stat box",
        verbose_name="Stat box title",
        max_length=1024,
        null=True,
        blank=True
    )

    class Meta:
        app_label = "hubs"
        verbose_name = "Hub"
        verbose_name_plural = "Hubs"
        ordering = ['-importance']
    def __str__(self):
        return "%s" % (self.name)
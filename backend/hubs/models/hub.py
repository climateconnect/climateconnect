from climateconnect_api.models.language import Language
from location.models import Location
from organization.models.tags import ProjectTags
from django.db import models
from django.contrib.auth.models import User
from organization.models.organization import Organization


def hub_image_path(instance, filename):
    return "hubs/{}/{}".format(instance.id, filename)


def hub_footer_image_path(instance, filename):
    return "hub_footers/{}/{}".format(instance.id, filename)


def hub_supporter_logo_path(instance, filename):
    return "hub_supporter_logo/{}/{}".format(instance.id, filename)


class HubStat(models.Model):
    name = models.CharField(
        help_text="Points to stat name", verbose_name="Name", max_length=1024
    )

    value = models.CharField(
        help_text="Value of the stat that is being highlighted in the stat box (e.g. '75%')",
        verbose_name="Stat Value",
        max_length=128,
        null=True,
        blank=True,
    )

    value_description = models.CharField(
        help_text="Explains what the value describes (e.g. 'of global ghg emissions')",
        verbose_name="Value description",
        max_length=1024,
        null=True,
        blank=True,
    )

    description = models.CharField(
        help_text="Description that is shown in the stat box",
        verbose_name="Stat box description",
        max_length=1024,
        null=True,
        blank=True,
    )

    source_link = models.CharField(
        help_text="Link to the source of the stat",
        verbose_name="Source link",
        max_length=1024,
        null=True,
        blank=True,
    )

    source_name = models.CharField(
        help_text="Name of the source",
        verbose_name="Source Name",
        max_length=1024,
        null=True,
        blank=True,
    )

    language = models.ForeignKey(
        Language,
        related_name="hub_stat_language",
        help_text="The original language of the hub stat",
        verbose_name="Language",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    class Meta:
        app_label = "hubs"
        verbose_name = "HubStat"
        verbose_name_plural = "HubStats"

    def __str__(self):
        return "%s" % (self.name)


class Hub(models.Model):
    name = models.CharField(
        help_text="Points to hub name", verbose_name="Name", max_length=1024
    )

    url_slug = models.CharField(
        help_text="URL slug for hub",
        verbose_name="URL slug",
        unique=True,
        max_length=1024,
        null=True,
        blank=True,
    )

    headline = models.CharField(
        help_text="Headline",
        verbose_name="headline",
        max_length=1024,
        null=True,
        blank=True,
    )

    sub_headline = models.CharField(
        help_text="Sub headline",
        verbose_name="Sub headline",
        max_length=1024,
        null=True,
        blank=True,
    )

    welcome_message_logged_in = models.CharField(
        help_text='Displayed on the dashboard on location hubs when logged in. Starts with "Hi $user.name"',
        verbose_name="Welcome message (logged in)",
        max_length=2048,
        null=True,
        blank=True,
    )

    welcome_message_logged_out = models.CharField(
        help_text="Displayed on the dashboard on location hubs when logged out.",
        verbose_name="Welcome message (logged out)",
        max_length=2048,
        null=True,
        blank=True,
    )

    SECTOR_HUB_TYPE = 0
    LOCATION_HUB_TYPE = 1  # User can read and write to project or organization.
    HUB_TYPES = ((SECTOR_HUB_TYPE, "sector hub"), (LOCATION_HUB_TYPE, "location hub"))

    hub_type = models.IntegerField(
        help_text="Type of hub",
        verbose_name="Hub Type",
        choices=HUB_TYPES,
        default=SECTOR_HUB_TYPE,
    )

    segway_text = models.TextField(
        help_text="Segway text between the info and the solutions",
        verbose_name="Segway text",
    )

    image_attribution = models.CharField(
        help_text="This is incase we have to attribute somebody or a website for using their image",
        verbose_name="Image attribution",
        max_length=1024,
        null=True,
        blank=True,
    )

    image = models.ImageField(
        help_text="Hub image",
        verbose_name="Image",
        null=True,
        blank=True,
        upload_to=hub_image_path,
    )

    icon = models.FileField(
        help_text="The icon representing the hub in the small hub preview cards",
        verbose_name="Icon",
        null=True,
        blank=True,
        upload_to=hub_image_path,
    )

    thumbnail_image = models.ImageField(
        help_text="Image to show on hub card",
        verbose_name="Thumbnail image",
        null=True,
        blank=True,
        upload_to=hub_image_path,
    )

    quick_info = models.TextField(
        help_text="Text that is shown when the hub info is not expanded",
        verbose_name="Quick info about the hub (non-expanded text)",
    )

    stats = models.ManyToManyField(
        HubStat,
        related_name="hub_stats",
        help_text="points to the stats for the hubs",
        verbose_name="Hub Stats",
        blank=True,
    )

    importance = models.PositiveSmallIntegerField(
        help_text="The larger the number, the more to the top this hub will be displayed on the hubs overview page.(Putting importance to 0 will hide the hub)",
        verbose_name="Importance (0-100)",
        default=100,
    )

    filter_parent_tags = models.ManyToManyField(
        ProjectTags,
        related_name="hub_parent_tags",
        help_text="Only project with these parent tags will be shown in the hub",
        verbose_name="Hub categories",
        blank=True,
    )

    stat_box_title = models.CharField(
        help_text="The text displayed on top of the stat box",
        verbose_name="Stat box title",
        max_length=1024,
        null=True,
        blank=True,
    )

    location = models.ManyToManyField(
        Location,
        related_name="hub_location",
        help_text="For city hubs: for which locations is the ClimateHub",
        verbose_name="Location",
        blank=True,
    )

    language = models.ForeignKey(
        Language,
        related_name="hub_language",
        help_text="The original language of the hub",
        verbose_name="Language",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    custom_footer_image = models.ImageField(
        help_text="Custom image to show in the footer of this specific hub, e.g. to display a grant to financed the start of the hub",
        verbose_name="Custom footer image",
        null=True,
        blank=True,
        upload_to=hub_footer_image_path,
    )

    class Meta:
        app_label = "hubs"
        verbose_name = "Hub"
        verbose_name_plural = "Hubs"
        ordering = ["-importance"]

    def __str__(self):
        return "%s" % (self.name)


class HubAmbassador(models.Model):
    title = models.CharField(
        help_text="Ambassador title",
        verbose_name="Ambassador title",
        max_length=1024,
        null=True,
        blank=True,
    )
    title_de = models.CharField(
        help_text="The german translation of the ambassador's title",
        verbose_name="Ambassador title german",
        max_length=1024,
        null=True,
        blank=True,
    )
    custom_message = models.CharField(
        help_text="Custom message motivating users to contact the ambassador",
        verbose_name="Custom message",
        max_length=240,
        null=True,
        blank=True,
    )
    custom_message_de = models.CharField(
        help_text="German translation of the custom message",
        verbose_name="Custom message german",
        max_length=240,
        null=True,
        blank=True,
    )
    user = models.ForeignKey(
        User,
        help_text="Points to user who is ambassador of the hub",
        verbose_name="User",
        related_name="ambassador_user",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    hub = models.ForeignKey(
        Hub,
        help_text="Points to hub the user is ambassador of",
        verbose_name="Hub",
        related_name="ambassador_hub",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )

    class Meta:
        app_label = "hubs"
        verbose_name = "Hub Ambassador"
        verbose_name_plural = "Hub Ambassadors"

    def __str__(self):
        return "%s is ambassador for %s" % (
            self.user.first_name + " " + self.user.last_name,
            self.title,
        )


class HubSupporter(models.Model):
    name = models.CharField(
        help_text="Supporter name",
        verbose_name="Supporter name",
        max_length=1024,
        null=True,
        blank=True,
    )
    subtitle = models.CharField(
        help_text="Supporter subtitle",
        verbose_name="subtitle",
        max_length=1024,
        null=True,
        blank=True,
    )
    logo = models.ImageField(
        help_text="Supporter logo",
        verbose_name="Logo",
        null=True,
        blank=True,
        upload_to=hub_supporter_logo_path,
    )
    hub = models.ForeignKey(
        Hub,
        help_text="Supported Hub by the Supporter",
        verbose_name="Hub",
        related_name="supporter_hub",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    importance = models.PositiveSmallIntegerField(
        help_text="The larger the number, the more to the top this hub will be displayed on the hubs overview page. (Putting importance to 0 will hide the supporter)",
        verbose_name="Importance (0-100)",
        default=100,
    )
    organization = models.ForeignKey(
        Organization,
        help_text="Points to the supporter's organization",
        verbose_name="Organization",
        related_name="supporter_organization",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
    )
    language = models.ForeignKey(
        Language,
        related_name="supporter_language",
        help_text="The original language of the supporter",
        verbose_name="Language",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    class Meta:
        app_label = "hubs"
        verbose_name = "Hub Supporter"
        verbose_name_plural = "Hub Supporter"
        ordering = ["-importance"]

    def __str__(self):
        return "%s" % (self.name)


class HubThemeColor(models.Model):
    main = models.CharField(
        help_text="main color",
        verbose_name="main color",
        max_length=200,
        null=True,
        blank=True,
    )
    light = models.CharField(
        help_text="light color",
        verbose_name="light color",
        max_length=200,
        null=True,
        blank=True,
    )
    extraLight = models.CharField(
        help_text="extraLight color",
        verbose_name="extraLight color",
        max_length=200,
        null=True,
        blank=True,
    )
    contrastText = models.CharField(
        help_text="contrastText color",
        verbose_name="contrastText color",
        max_length=200,
        null=True,
        blank=True,
    )
    class Meta:
        app_label = "hubs"
        verbose_name = "Hub Theme Color"
        verbose_name_plural = "Hub Theme Color"

    def __str__(self):
        return f"ThemeColor {self.id} - Main: {self.main}"


class HubTheme(models.Model):
    hub = models.OneToOneField(
        Hub,
        related_name="hub_theme",
        help_text="The theme for the hub",
        verbose_name="hub_theme",
        on_delete=models.CASCADE,
        max_length=1024,
        null=True,
        blank=True,
    )
    primary = models.ForeignKey(
        HubThemeColor,
        related_name="primary",
        help_text="primary_color",
        verbose_name="primary_color",
        on_delete=models.CASCADE,
        max_length=1024,
        null=True,
        blank=True,
    )
    secondary = models.ForeignKey(
        HubThemeColor,
        related_name="secondary",
        help_text="secondary_color",
        verbose_name="secondary_color",
        on_delete=models.CASCADE,
        max_length=1024,
        null=True,
        blank=True,
    )
    background_default = models.ForeignKey(
        HubThemeColor,
        related_name="background_default",
        help_text="default background color",
        verbose_name="default background color",
        on_delete=models.CASCADE,
        max_length=1024,
        null=True,
        blank=True,
    )
    background_paper = models.ForeignKey(
        HubThemeColor,
        related_name="background_paper",
        help_text="paper background color",
        verbose_name="paper background color",
        on_delete=models.CASCADE,
        max_length=1024,
        null=True,
        blank=True,
    )
    class Meta:
        app_label = "hubs"
        verbose_name = "Hub Theme"
        verbose_name_plural = "Hub Theme"

    def __str__(self):
        return f"Theme for Hub {self.hub.name}"

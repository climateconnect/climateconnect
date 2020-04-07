from django.db import models


class OrganizationType(models.Model):
    name = models.CharField(
        help_text="Points to name of the type. e.g: NGO",
        verbose_name="Name",
        max_length=512
    )

    key = models.CharField(
        help_text="Points to key of the type.",
        verbose_name="Key",
        max_length=512,
        null=True,
        blank=True
    )

    # TODO (Dip): Confirm about additional info column.

    created_at = models.DateTimeField(
        help_text="Time when org type was created",
        verbose_name="Created At",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when org type was updated",
        verbose_name="Updated At",
        auto_now=True
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Organization Type"
        verbose_name_plural = "Organization Types"

    def __str__(self):
        return "%s (%d)" % (self.name, self.id)


def organization_image_path(instance, filename):
    return "organization_images/{}/profile/{}".format(
        instance.id, filename
    )


def organization_background_image_path(instance, filename):
    return "organization_images/{}/background/{}".format(
        instance.id, filename
    )


class Organization(models.Model):
    name = models.CharField(
        help_text="Points to name of the organization",
        verbose_name="Organization",
        max_length=1024
    )

    url_slug = models.CharField(
        help_text="Points to organization url slug",
        verbose_name="URL Slug",
        max_length=1024,
        null=True,
        blank=True
    )

    organization_image = models.ImageField(
        help_text="Organization image",
        verbose_name="Organization Image",
        upload_to=organization_image_path,
        null=True,
        blank=True
    )

    background_image = models.ImageField(
        help_text="Points to background image of an organization",
        verbose_name="Background image",
        upload_to=organization_background_image_path,
        null=True,
        blank=True
    )

    parent_organization = models.ForeignKey(
        'self',
        related_name="organization_parent",
        help_text="Points to parent organization",
        verbose_name="Parent Organization",
        null=True,
        blank=True,
        on_delete=models.CASCADE
    )

    created_at = models.DateTimeField(
        help_text="Time when organization was created",
        verbose_name="Created At",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when organization object was updated",
        verbose_name="Updated At",
        auto_now=True
    )

    types = models.ManyToManyField(
        OrganizationType,
        related_name="organization_types",
        help_text="Points to type of organization.",
        blank=True
    )

    country = models.CharField(
        help_text="Points to what country the organization is located.",
        verbose_name="Country",
        max_length=512,
        null=True,
        blank=True
    )

    state = models.CharField(
        help_text="Points to what state the organization is located.",
        verbose_name="State",
        max_length=512,
        null=True,
        blank=True
    )

    city = models.CharField(
        help_text="Points to what city the organization is located",
        verbose_name="City",
        max_length=1024,  # Keeping higher len because city name in some countries are pretty long
        null=True,
        blank=True
    )

    short_description = models.TextField(
        help_text="Short description about an organization",
        verbose_name="Short Description",
        null=True,
        blank=True
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Organization"
        verbose_name_plural = "Organizations"

    def __str__(self):
        return "%s (%d)" % (self.name, self.id)

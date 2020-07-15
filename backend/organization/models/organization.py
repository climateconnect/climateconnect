from django.db import models


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
        unique=True,
        null=True,
        blank=True
    )

    image = models.ImageField(
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

    school = models.CharField(
        help_text="Points to a school if the organization is school org",
        verbose_name="School",
        null=True,
        blank=True,
        max_length=512
    )

    organ = models.CharField(
        help_text="Used for organization who is gov organization",
        verbose_name="Organ",
        null=True,
        blank=True,
        max_length=512
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Organization"
        verbose_name_plural = "Organizations"
        ordering = ["-id"]

    def __str__(self):
        return "%s (%d)" % (self.name, self.pk)

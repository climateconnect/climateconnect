from django.db import models
from django.db.models.fields import DurationField
from django.core.validators import FileExtensionValidator


def badge_image_path(instance, filename):
    return "badge_images/{}/{}".format(instance.id, filename)


class Badge(models.Model):
    name = models.CharField(
        help_text="The name of the badge",
        verbose_name="Name",
        max_length=256,
        null=True,
        blank=True
    )

    name_de = models.CharField(
        help_text="The name of the badge in german",
        verbose_name="Name DE",
        max_length=256,
        null=True,
        blank=True
    )

    image = models.FileField(
        help_text="Points to the image of the badge",
        verbose_name="Badge Image",
        upload_to=badge_image_path,
        validators=[FileExtensionValidator(['svg'])],
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        help_text="Time when post was created",
        auto_now_add=True,
        verbose_name="Created at"
    )

    updated_at = models.DateTimeField(
        help_text="Time when comment was updated",
        verbose_name="Updated at",
        auto_now=True
    )

    is_active = models.BooleanField(
        help_text="Should Badge be shown publically?",
        verbose_name="Is active?",
        default=False
    )

    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "Badge"
        verbose_name_plural = "Badges"
        ordering = ["-id"]

    def __str__(self):
        return "Badge %s" % (self.name)


class DonorBadge(Badge):
    regular_donor_minimum_duration = DurationField(
        help_text="",
        verbose_name="Minimum donation duration for regular donors",
        null=True,
        blank=True
    )

    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "Donor Badge"
        verbose_name_plural = "Donor Badges"
        ordering = ["-id"]

    def __str__(self):
        return "Badge %s acquired after %s" % (self.name, self.regular_donor_minimum_duration)

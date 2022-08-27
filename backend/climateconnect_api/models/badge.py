from django.db import models
from django.db.models.fields import DurationField
from django.core.validators import FileExtensionValidator
from django.contrib.auth.models import User


def badge_image_path(instance, filename):
    return "badge_images/{}/{}".format(instance.id, filename)


class Badge(models.Model):
    name = models.CharField(
        help_text="The name of the badge",
        verbose_name="Name",
        max_length=256,
        null=True,
        blank=True,
    )

    step = models.PositiveSmallIntegerField(
        help_text="Which step on the way to the best badge is this? This will determine the size in the donor's forest (Leave empty for non-donor-forest badges)",
        verbose_name="Step",
        null=True,
        blank=True,
    )

    name_de = models.CharField(
        help_text="The name of the badge in german",
        verbose_name="Name DE",
        max_length=256,
        null=True,
        blank=True,
    )

    image = models.FileField(
        help_text="Points to the image of the badge",
        verbose_name="Badge Image",
        upload_to=badge_image_path,
        validators=[FileExtensionValidator(["svg"])],
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        help_text="Time when post was created",
        auto_now_add=True,
        verbose_name="Created at",
    )

    updated_at = models.DateTimeField(
        help_text="Time when comment was updated",
        verbose_name="Updated at",
        auto_now=True,
    )

    is_active = models.BooleanField(
        help_text="Should Badge be shown publically?",
        verbose_name="Is active?",
        default=False,
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
        blank=True,
    )

    instantly_awarded_over_amount = models.PositiveIntegerField(
        help_text="You instantly get this badge if you've donated more than this amount in your current streak",
        verbose_name="Instantly awarded over amount",
        null=True,
        blank=True,
    )

    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "Donor Badge"
        verbose_name_plural = "Donor Badges"
        ordering = ["-id"]

    def __str__(self):
        return "Badge %s acquired after %s" % (
            self.name,
            self.regular_donor_minimum_duration,
        )


class UserBadge(models.Model):
    user = models.ForeignKey(
        User,
        related_name="userbadge_user",
        verbose_name="User",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    badge = models.ForeignKey(
        Badge,
        related_name="userbadge_badge",
        verbose_name="Badge",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        help_text="Time when donation was created",
        verbose_name="Created At",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="Time when donation was updated",
        verbose_name="Updated At",
        auto_now=True,
    )

    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "Custom User Badge"
        verbose_name_plural = "Custom User Badges"
        ordering = ["-id"]

    def __str__(self):
        return "Badge %s awarded to user after %s" % (
            self.badge.name,
            self.user.first_name + " " + self.user.last_name,
        )

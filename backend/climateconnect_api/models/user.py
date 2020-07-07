from django.db import models
from climateconnect_api.models.common import (
    Availability, Skill
)


def profile_image_path(instance, filename):
    return "profile_pictures/{}/{}".format(instance.id, filename)


def background_image_path(instance, filename):
    return "background_images/{}/{}".format(instance.id, filename)


class UserProfile(models.Model):
    user = models.OneToOneField(
        "auth.User",
        help_text="Points to user table",
        on_delete=models.CASCADE,
        verbose_name="User",
        related_name="user_profile"
    )

    name = models.CharField(
        help_text="user.first_name+' '+user.last_name",
        verbose_name="Full name",
        max_length=256,
        null=True,
        blank=True
    )

    url_slug = models.CharField(
        help_text="slug for user URL",
        verbose_name="URL Slug",
        max_length=512,
        unique=True,
        null=True,
        blank=True
    )

    # Keeping this column blank. User may not want to upload their profile picture.
    image = models.ImageField(
        help_text="Points to user's profile picture",
        verbose_name="Profile Image",
        upload_to=profile_image_path,
        null=True,
        blank=True
    )

    background_image = models.ImageField(
        help_text="Points to user's background image",
        verbose_name="Background Image",
        upload_to=background_image_path,
        null=True,
        blank=True
    )

    country = models.CharField(
        help_text="User's country",
        verbose_name="Country",
        max_length=256,
        blank=True,
        null=True
    )

    state = models.CharField(
        help_text="User's state",
        verbose_name="State",
        max_length=512,
        null=True,
        blank=True
    )

    city = models.CharField(
        help_text="User's city",
        verbose_name="City",
        max_length=512,
        null=True,
        blank=True
    )

    biography = models.TextField(
        help_text="Points to user's bio",
        verbose_name="bio",
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        help_text="Time when object first created",
        verbose_name="Created At",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when profile was updated",
        verbose_name="Update at",
        auto_now=True
    )

    is_profile_verified = models.BooleanField(
        help_text="Checks whether user's profile is verfied or not",
        verbose_name="Is profile verified",
        default=False
    )

    availability = models.ForeignKey(
        Availability,
        help_text="Points to user's availability for a work",
        verbose_name="Availability",
        null=True,
        blank=True,
        related_name="user_availability",
        on_delete=models.PROTECT
    )

    skills = models.ManyToManyField(
        Skill,
        help_text="Points to user's skills",
        verbose_name="Skills",
        related_name="user_skills",
        blank=True
    )

    email_updates_on_projects = models.BooleanField(
        help_text="Check if user wants to receive emails for projects they follow",
        verbose_name="Email updates on Project", null=True, blank=True,
        default=True
    )

    email_project_suggestions = models.BooleanField(
        help_text="Check if user wants to receive emails for projects they might like",
        verbose_name="Email project suggestions", null=True, blank=True, default=True
    )

    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
        db_table = "climateconnect_user_profile"

    def __str__(self):
        return "%s %s [profile id: %d]" % (
            self.user.first_name, self.user.last_name, self.id
        )

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

    location = models.CharField(
        help_text='Location of user',
        verbose_name='Location',
        max_length=2048,
        null=True,
        blank=True
    )

    latitude = models.CharField(
        help_text="Latitude of user's location",
        verbose_name="Latitude",
        max_length=512,
        null=True,
        blank=True
    )

    longitude = models.CharField(
        help_text="Longitude of user's location",
        verbose_name="Longitude",
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

    verification_key = models.UUIDField(
        help_text="On signup create a unique key that will be used for user's profile verification",
        verbose_name="Verification Key", null=True, blank=True, unique=True
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

    send_newsletter = models.BooleanField(
        help_text="Check if user wants to receive our newsletter",
        verbose_name="Send newsletter", null=True, blank=True,
        default=True
    )

    email_on_private_chat_message = models.BooleanField(
        help_text="Check if user wants to receive emails when they receive a private chat message",
        verbose_name="Email on private chat message", null=True, blank=True, default=True
    )

    email_on_group_chat_message = models.BooleanField(
        help_text="Check if user wants to receive emails when they receive a group chat message",
        verbose_name="Email on group chat message", null=True, blank=True, default=True
    )

    email_on_comment_on_your_project = models.BooleanField(
        help_text="Check if user wants to receive emails when they receive a comment on a project they're a member of",
        verbose_name="Email on project comment", null=True, blank=True, default=True
    )

    email_on_reply_to_your_comment = models.BooleanField(
        help_text="Check if user wants to receive emails when somebody answers to their comment on a project",
        verbose_name="Email on comment reply", null=True, blank=True, default=True
    )

    email_on_new_project_follower = models.BooleanField(
        help_text="Check if user wants to receive emails when somebody follows their project",
        verbose_name="Email on new project follower", null=True, blank=True, default=True
    )

    has_logged_in = models.PositiveSmallIntegerField(
        help_text="Check if the user should be redirected to the edit profile page. Shows the number of logins up to 2",
        verbose_name="Number of logins up to 2",
        default=0
    )

    pending_new_email = models.EmailField(
        help_text="If the user is in the process of changing their email, this field will show the potential new email",
        verbose_name="Potential new E-Mail address",
        null=True,
        blank=True
    )

    password_reset_key = models.UUIDField(
        help_text="key for resetting your password",
        verbose_name="Password reset key", null=True, blank=True, unique=True
    )

    password_reset_timeout = models.DateTimeField(
        help_text="Time when the password reset times out",
        verbose_name="Password reset timeout",
        auto_now_add=True
    )

    website = models.CharField(
        help_text="Website",
        verbose_name="User's Website",
        max_length=256,
        null=True,
        blank=True
    )

    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
        db_table = "climateconnect_user_profile"
        ordering = ["-id"]

    def __str__(self):
        return "%s %s [profile id: %d]" % (
            self.user.first_name, self.user.last_name, self.id
        )

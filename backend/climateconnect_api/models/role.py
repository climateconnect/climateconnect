from django.db import models


class Role(models.Model):
    name = models.CharField(
        help_text="Name of the role",
        verbose_name="Name", max_length=128
    )

    explanation = models.CharField(
        help_text="Explanation of the role's permissions for the user",
        verbose_name="Explanation", max_length=256,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        help_text="Time when role was created",
        verbose_name="Created At", auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when role was updated",
        verbose_name="Updated At", auto_now=True
    )

    READ_ONLY_TYPE = 0
    READ_WRITE_TYPE = 1  # User can read and write to project or organization.
    ALL_TYPE = 2  # User can perform all actions. i.e.: Administrator type.
    ROLE_TYPES = (
        (READ_ONLY_TYPE, 'read only'), (READ_WRITE_TYPE, 'read write'),
        (ALL_TYPE, 'all')
    )

    role_type = models.IntegerField(
        help_text="Type of role", verbose_name="Role Type",
        choices=ROLE_TYPES, default=READ_ONLY_TYPE
    )

    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "Role"
        verbose_name_plural = "Roles"
        ordering=["id"]

    def __str__(self):
        return "Role: %s" % self.name

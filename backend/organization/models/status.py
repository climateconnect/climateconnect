from django.db import models


class ProjectStatus(models.Model):
    name = models.CharField(
        help_text="Name of the project status",
        verbose_name="Name",
        max_length=512,
        null=True,
        blank=True
    )

    name_de_translation = models.CharField(
        help_text="Translation of name column",
        verbose_name="Name DE translation",
        max_length=512,
        null=True,
        blank=True
    )

    IDEA_TYPE = 0
    IN_PROGRESS_TYPE = 1  # User can read and write to project or organization.
    FINISHED_TYPE = 2  # User can perform all actions. i.e.: Administrator type.
    CANCELLED_TYPE = 3
    RECURRING_TYPE = 4
    PROJECT_STATUS_TYPES = (
        (IDEA_TYPE, 'idea'), (IN_PROGRESS_TYPE, 'inprogress'),
        (FINISHED_TYPE, 'finished'), (CANCELLED_TYPE, 'cancelled'),
        (RECURRING_TYPE, 'recurring')
    )

    status_type = models.IntegerField(
        help_text="Type of the status. Used as unique identifier", verbose_name="Status Type",
        choices=PROJECT_STATUS_TYPES, null=True, blank=True
    )

    has_end_date = models.BooleanField(
        help_text="Checks whether projects with this status have an end date",
        verbose_name="Has end date"
    )

    has_start_date = models.BooleanField(
        help_text="Checks whether projects with this status have a start date",
        verbose_name="Has start date"
    )

    created_at = models.DateTimeField(
        help_text="Time when project was linked to an organization",
        verbose_name="Created At",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when project was updated. i.e.: Order change etc.",
        verbose_name="Updated At",
        auto_now=True
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Project Status"
        verbose_name_plural = "Project Statuses"
        ordering = ['id']

    def __str__(self):
        return "Project status  %s" % (self.name)
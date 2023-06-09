from django.db import models


class ProjectStatus(models.Model):
    name = models.CharField(
        help_text="Name of the project status",
        verbose_name="Name",
        max_length=512,
        null=True,
        blank=True,
    )

    name_de_translation = models.CharField(
        help_text="Translation of name column",
        verbose_name="Name DE translation",
        max_length=512,
        null=True,
        blank=True,
    )

    IDEA_TYPE = 0
    IN_PROGRESS_TYPE = 1
    FINISHED_TYPE = 2
    CANCELLED_TYPE = 3
    RECURRING_TYPE = 4
    DEFAULT_TYPE = 1000  # This type was just added to make sure the backend doesn't break locally for people who used the old script to generate test data
    PROJECT_STATUS_TYPES = (
        (IDEA_TYPE, "idea"),
        (IN_PROGRESS_TYPE, "inprogress"),
        (FINISHED_TYPE, "finished"),
        (CANCELLED_TYPE, "cancelled"),
        (RECURRING_TYPE, "recurring"),
        (DEFAULT_TYPE, "default"),
    )

    status_type = models.IntegerField(
        help_text="Type of the status. Used as unique identifier",
        verbose_name="Status Type",
        choices=PROJECT_STATUS_TYPES,
        default=DEFAULT_TYPE,
    )

    has_end_date = models.BooleanField(
        help_text="Checks whether projects with this status have an end date",
        verbose_name="Has end date",
    )

    has_start_date = models.BooleanField(
        help_text="Checks whether projects with this status have a start date",
        verbose_name="Has start date",
    )

    created_at = models.DateTimeField(
        help_text="Time when project was linked to an organization",
        verbose_name="Created At",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="Time when project was updated. i.e.: Order change etc.",
        verbose_name="Updated At",
        auto_now=True,
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Project Status"
        verbose_name_plural = "Project Statuses"
        ordering = ["id"]

    def __str__(self):
        return "Project status  %s" % (self.name)


def project_type_image_path(instance, filename):
    return "project_type_icons/{}/{}".format(instance.id, filename)


class ProjectTypes(models.Model):
    name = models.CharField(
        help_text="Name of the project type",
        verbose_name="Name",
        max_length=512,
    )

    name_de_translation = models.CharField(
        help_text="Translation of name column",
        verbose_name="Name DE translation",
        max_length=512,
    )

    help_text = models.TextField(
        help_text="Small helper text that is shown under the name in the shrae project interface",
        verbose_name="Helptext",
        max_length=512,
    )

    help_text_de_translation = models.TextField(
        help_text="Translation of help_text column",
        verbose_name="Helptext DE translation",
        max_length=512,
    )

    icon = models.FileField(
        help_text="The icon representing the project type in the share project interface",
        verbose_name="Icon",
        null=True,
        blank=True,
        upload_to=project_type_image_path,
    )

    PROJECT_PROJECT_TYPE = 0
    IDEA_PROJECT_TYPE = 1
    EVENT_PROJECT_TYPE = 2
    POSSIBLE_PROJECT_TYPES = (
        (PROJECT_PROJECT_TYPE, "project"),
        (IDEA_PROJECT_TYPE, "idea"),
        (EVENT_PROJECT_TYPE, "event"),
    )

    type_id = models.IntegerField(
        help_text="Type of the status. Used as unique identifier",
        verbose_name="Status Type",
        choices=POSSIBLE_PROJECT_TYPES,
        default=PROJECT_PROJECT_TYPE,
    )

    created_at = models.DateTimeField(
        help_text="Time when project was linked to an organization",
        verbose_name="Created At",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="Time when project was updated. i.e.: Order change etc.",
        verbose_name="Updated At",
        auto_now=True,
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Project Type"
        verbose_name_plural = "Project Types"
        ordering = ["id"]

    def __str__(self):
        return 'Project type  "%s"' % (self.name)

    @classmethod
    def get_default_pk(cls):
        project_type, created = cls.objects.get_or_create(
            name="Project",
            defaults=dict(name_de_translation="Projekt", type_id=0),
        )
        return project_type.pk

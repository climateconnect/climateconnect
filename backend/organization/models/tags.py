from django.db import models
from django.contrib.postgres.fields import ArrayField

from organization.models import Organization
from organization.models.project import Project


class OrganizationTags(models.Model):
    name = models.CharField(
        help_text="Tag name",
        verbose_name="Name",
        max_length=256
    )
    
    parent_tag = models.ForeignKey(
        'self',
        related_name="organization_tag_parent",
        verbose_name="Parent Tag",
        help_text="Points to the parent tag",
        null=True,
        blank=True,
        on_delete=models.PROTECT
    )

    created_at = models.DateTimeField(
        help_text="Time when tag was created",
        verbose_name="Created At",
        auto_now_add=True
    )

    additional_info  = ArrayField(
        models.CharField(max_length=264),
        null=True,
        blank=True,
        size=5
    )

    updated_at = models.DateTimeField(
        help_text="Time when tag was updated",
        verbose_name="Updated At",
        auto_now=True
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Organization Tags"

    def __str__(self):
        return "%s (%d)" % (self.name, self.id)


class OrganizationTagging(models.Model):
    organization = models.ForeignKey(
        Organization,
        related_name="tag_organization",
        verbose_name="Organization",
        help_text="Points to an organization",
        on_delete=models.CASCADE
    )

    organization_tag = models.ForeignKey(
        OrganizationTags,
        related_name="tag_organization",
        verbose_name="Organization Tag",
        help_text="Points to the tag",
        on_delete=models.CASCADE
    )

    created_at = models.DateTimeField(
        help_text="Time when organization tag was created",
        verbose_name="Created At",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when organization tag was updated",
        verbose_name="Updated At",
        auto_now=True
    )

    # TODO (Dip): Add additional data field when ready

    class Meta:
        app_label = "organization"
        verbose_name = "Organization Tagging"
        verbose_name_plural = "Organization Taggings"
        unique_together = ('organization', 'organization_tag')

    def __str__(self):
        return "%s => %s" % (self.organization_tag.name, self.organization.name)


class ProjectTags(models.Model):
    name = models.CharField(
        help_text="Points to name of the project tag",
        verbose_name="Name",
        max_length=256
    )

    parent_tag = models.ForeignKey(
        'self',
        related_name="project_tag_parent",
        verbose_name="Parent Tag",
        help_text="Points to the parent tag",
        null=True,
        blank=True,
        on_delete=models.PROTECT
    )

    created_at = models.DateTimeField(
        help_text="Time when tag was created",
        verbose_name="Created at",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when tag was updated",
        verbose_name="Updated at",
        auto_now=True
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Project Tags"
        ordering = ["id"]

    def __str__(self):
        return "%s" % self.name


class ProjectTagging(models.Model):
    project = models.ForeignKey(
        Project,
        help_text="Points to project",
        verbose_name="Project",
        related_name="tag_project",
        on_delete=models.CASCADE
    )

    project_tag = models.ForeignKey(
        ProjectTags,
        verbose_name="Project tag",
        help_text="Points to project tag",
        related_name="tag_project",
        on_delete=models.CASCADE
    )

    created_at = models.DateTimeField(
        help_text="Time when project tag was created",
        verbose_name="Created At",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when project tag was updated",
        verbose_name="Updated At",
        auto_now=True
    )

    class Meta:
        app_label = "organization"
        verbose_name = "Project Tagging"
        verbose_name_plural = "Project Taggings"
        unique_together = ('project', 'project_tag')

    def __str__(self):
        return "Tag %s => Project %s" % (self.project.name, self.project_tag.name)

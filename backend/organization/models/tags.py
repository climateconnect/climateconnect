from django.db import models

from organization.models import Organization


class OrganizationTags(models.Model):
    name = models.CharField(
        help_text="Tag name",
        verbose_name="Name",
        max_length=256
    )

    created_at = models.DateTimeField(
        help_text="Time when tag was created",
        verbose_name="Created At",
        auto_now_add=True
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

    def __str__(self):
        return "%s => %s" % (self.organization_tag.name, self.organization.name)

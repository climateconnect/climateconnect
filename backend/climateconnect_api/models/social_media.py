from tabnanny import verbose
from django.db import models

from organization.models.organization import Organization

class SocialMediaChannel(models.Model):
    social_media_name= models.CharField(
        help_text="Link of the social media",
        verbose_name="Social Media Channel",
        max_length=256,
        default="",
    )

    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "Social Media Channel"
        verbose_name_plural = "Social Media Channels"
        ordering = ["-id"]

    def __str__(self):
        return "%s (%d)" % (self.social_media_name, self.pk)
   

class SocialMediaLink(models.Model):
    organization = models.ForeignKey(
        Organization,
        related_name="social_media_link_to_organization",
        verbose_name="Organization for social media",
        help_text="Points to the organization",
        on_delete=models.CASCADE,
        
    )
    social_media_channel = models.ForeignKey(
        SocialMediaChannel,
        related_name="social_media_link_to_channel",
        verbose_name="Social Media Channel",
        help_text="Points to the social media channel",
        on_delete=models.CASCADE,
    )


    created_at = models.DateTimeField(
        help_text="Time when social media link was created",
        verbose_name="Created At",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="Time when social media link was updated",
        verbose_name="Updated At",
        auto_now=True,
    )
    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "Social Media Link"
        verbose_name_plural = "Social Media Links"
        unique_together = ("organization", "social_media_channel")

    def __str__(self):
        return "%s => %s" % (self.social_media_channel.social_media_name, self.organization.name)
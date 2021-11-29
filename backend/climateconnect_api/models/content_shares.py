from django.db import models
from organization.models.project import Project
from django.contrib.auth.models import User

# Note: Clicking on a specific share button/copying the link or opening a device's native share dialog counts as sharing, 
# but we don't know whether the user follows through with it.
class ContentShares(models.Model):
    project = models.ForeignKey(
        Project,
        related_name="shared_project",
        verbose_name="Project",
        help_text="Points to a project",
        on_delete=models.CASCADE,
        null=True
    )

    user = models.ForeignKey(
        User,
        related_name="sharing_user",
        verbose_name="Sharing User",
        help_text="Points to the user who shared the content",
        on_delete=models.CASCADE,
        null=True
    )

    FACEBOOK = 0
    FB_MESSENGER = 1
    TWITTER = 2
    WHATSAPP = 3
    LINKEDIN = 4
    REDDIT = 5
    TELEGRAM = 6
    MAIL = 7
    LINK = 8
    DEVICE_NATIVE = 9
    SHARE_OPTIONS = (
        (FACEBOOK, 'facebook'),
        (FB_MESSENGER, 'fb_messenger'),
        (TWITTER, 'twitter'),
        (WHATSAPP, 'whatsapp'),
        (LINKEDIN, 'linkedin'),
        (REDDIT, 'reddit'),
        (TELEGRAM, 'telegram'),
        (MAIL, 'e_mail'),
        (LINK, 'link'),
        (DEVICE_NATIVE, 'native_share_dialog_of_device'),
    )

    shared_via = models.IntegerField(
        help_text="Way in which the content was shared",
        verbose_name="Shared Via",
        choices=SHARE_OPTIONS,
        default=LINK
    )

    created_at = models.DateTimeField(
        help_text="Time when the user shared the content",
        verbose_name="Created At",
        auto_now_add=True
    )

    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "Shared Content"
        verbose_name_plural = "Shared Content"
        ordering = ["-id"]

    def __str__(self):
        return "%s shared %s " % (self.user, self.project.name)
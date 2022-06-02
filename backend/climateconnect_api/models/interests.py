from django.db import models
from django.contrib.auth.models import User

from hubs.models.hub import Hub

class UserInterests(models.Model):
    user = models.ForeignKey(
        User, related_name="user_interests",
        help_text="Points to user object", verbose_name="User",
        on_delete=models.CASCADE
    )

    hub_interested_in = models.ForeignKey(
        Hub, related_name="profile_interests",
        help_text="Points to (sector) hub", verbose_name="(sector) hub",
        on_delete=models.CASCADE
    )

    description = models.CharField(
        help_text="Description why user is interested in this hub",
        verbose_name="Description about the Interest",
        max_length=256,
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = "User interest"
        index_together = [["user", "hub_interested_in"]]

    def __str__(self):
        return "User {} is interested in sector hub {}".format(self.user.get_full_name(), self.hub_interested_in.name)
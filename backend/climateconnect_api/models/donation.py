from django.db import models
from django.contrib.auth.models import User


class DonationGoal(models.Model):
    name = models.CharField(
        help_text="Goal name, e.g. 'December goal'",
        verbose_name="Goal name",
        max_length=512,
    )

    name_de_translation = models.CharField(
        help_text="German translation of the goal name",
        verbose_name="Goal name (DE)",
        max_length=512,
        null=True,
        blank=True,
    )

    description = models.CharField(
        help_text="The description of the goal",
        verbose_name="Goal description",
        max_length=2048,
    )

    start_date = models.DateTimeField(
        help_text="Date and time when the goal starts", verbose_name="Start date"
    )

    end_date = models.DateTimeField(
        help_text="Date and time when the goal ends", verbose_name="End date"
    )

    amount = models.PositiveIntegerField(
        help_text="The donated amount in € we want to reach with this goal between start data and end date",
        verbose_name="Goal Amount",
    )

    created_at = models.DateTimeField(
        help_text="Time when donation was created",
        verbose_name="Created At",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="Time when donation was updated",
        verbose_name="Updated At",
        auto_now=True,
    )

    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "DonationGoal"
        verbose_name_plural = "DonationGoals"
        ordering = ["-id"]

    def __str__(self):
        return "DonationGoal %s" % (self.name)


class Donation(models.Model):
    user = models.ForeignKey(
        User,
        related_name="donation_user",
        verbose_name="User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    donor_name = models.CharField(
        help_text="Donor name",
        verbose_name="Donor Name",
        max_length=512,
        null=True,
        blank=True,
    )

    donation_amount = models.FloatField(
        help_text="Amount donated in €",
        verbose_name="Donation amount in €",
        default=0.0,
    )

    is_recurring = models.BooleanField(
        help_text="Check if the donation is recurring monthly",
        verbose_name="Donation recurring monthly",
        null=True,
        blank=True,
        default=False,
    )

    date_first_received = models.DateTimeField(
        help_text="Date and time when the donation was first received",
        verbose_name="Date first received",
    )

    date_cancelled = models.DateTimeField(
        help_text="Date and time when the donation was cancelled (only for recurring donations)",
        verbose_name="Date cancelled",
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        help_text="Time when donation was created",
        verbose_name="Created At",
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        help_text="Time when donation was updated",
        verbose_name="Updated At",
        auto_now=True,
    )

    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "Donation"
        verbose_name_plural = "Donations"
        ordering = ["-id"]

    def __str__(self):
        return "%s %s from %s (%s%s)" % (
            "One time donation: " if not self.is_recurring else "Regular donation: ",
            str(self.donation_amount) + "€",
            "" if not self.user else self.user.first_name + " " + self.user.last_name,
            self.date_first_received,
            ", cancelled " + str(self.date_cancelled) if self.date_cancelled else "",
        )

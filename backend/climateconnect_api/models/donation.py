from django.db import models

class DonationGoal(models.Model):
    name = models.CharField(
        help_text="Goal name, e.g. 'December goal'",
        verbose_name="Goal name",
        max_length=512
    )

    description = models.CharField(
        help_text="The description of the goal",
        verbose_name="Goal description",
        max_length=2048
    )

    start_date = models.DateTimeField(
        help_text="Date and time when the goal starts",
        verbose_name="Start date"
    )

    end_date = models.DateTimeField(
        help_text="Date and time when the goal ends",
        verbose_name="End date"
    )

    amount = models.PositiveIntegerField(
        help_text="The donated amount in € we want to reach with this goal between start data and end date",
        verbose_name="Goal Amount"
    )

    created_at = models.DateTimeField(
        help_text="Time when donation was created",
        verbose_name="Created At",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when donation was updated",
        verbose_name="Updated At",
        auto_now=True
    )

    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "DonationGoal"
        verbose_name_plural = "DonationGoals"
        ordering = ["-id"]
    
    def __str__(self):
        return "DonationGoal %s" % (
            self.name
        )

class Donation(models.Model):
    donor_name = models.CharField(
        help_text="Donor name",
        verbose_name="Donor Name",
        max_length=512,
        null=True,
        blank=True
    )

    donation_amount = models.FloatField(
        help_text="Amount donated in €",
        verbose_name="Donation amount in €",
        default=0.0
    )

    is_recurring = models.BooleanField(
        help_text="Check if the donation is recurring monthly",
        verbose_name="Donation recurring monthly", null=True, blank=True, default=False
    )

    date_first_received = models.DateTimeField(
        help_text="Date and time when the donation was first received",
        verbose_name="Date first received"
    )

    created_at = models.DateTimeField(
        help_text="Time when donation was created",
        verbose_name="Created At",
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        help_text="Time when donation was updated",
        verbose_name="Updated At",
        auto_now=True
    )

    class Meta:
        app_label = "climateconnect_api"
        verbose_name = "Donation"
        verbose_name_plural = "Donations"
        ordering = ["-id"]
    
    def __str__(self):
        return "Donation from : %s" % (
            self.date_first_received
        )
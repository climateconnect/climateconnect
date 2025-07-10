from django.utils.translation import get_language
from organization.utility.donationgoal import get_donationgoal_name
from rest_framework import serializers
from climateconnect_api.models import DonationGoal, Donation
from django.db.models import Sum
import datetime


class DonationGoalSerializer(serializers.ModelSerializer):
    current_amount = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = DonationGoal
        fields = ("name", "start_date", "end_date", "amount", "current_amount")

    def get_current_amount(self, obj):
        today = datetime.date.today()
        one_time_donations = Donation.objects.filter(
            is_recurring=False,
            date_first_received__gte=obj.start_date,
            date_first_received__lte=obj.end_date,
        ).aggregate(Sum("donation_amount"))
        if one_time_donations["donation_amount__sum"] is None:
            total_one_time = 0
        else:
            total_one_time = one_time_donations["donation_amount__sum"]
        recurring_donations = Donation.objects.filter(
            is_recurring=True,
            date_first_received__day__gte=obj.start_date.day,
            date_first_received__day__lte=today.day,
        ).aggregate(Sum("donation_amount"))
        if recurring_donations["donation_amount__sum"] is None:
            total_recurring = 0
        else:
            total_recurring = recurring_donations["donation_amount__sum"]

        return total_one_time + total_recurring

    def get_name(self, obj):
        return get_donationgoal_name(obj, get_language())

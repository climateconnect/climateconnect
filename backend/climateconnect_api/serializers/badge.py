from django.utils.translation import get_language
from climateconnect_api.models.badge import DonorBadge
from climateconnect_api.utility.badges import get_badge_name
from rest_framework import serializers


class DonorBadgeSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    min_days_donated = serializers.SerializerMethodField()

    class Meta:
        model = DonorBadge
        fields = (
            "name",
            "image",
            "created_at",
            "min_days_donated",
            "step",
            "instantly_awarded_over_amount",
        )

    def get_name(self, obj):
        return get_badge_name(obj, get_language())

    def get_min_days_donated(self, obj):
        return obj.regular_donor_minimum_duration.days

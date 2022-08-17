from django.utils.translation import get_language
from climateconnect_api.utility.translation import get_attribute_in_correct_language
from climateconnect_api.models.badge import Badge, DonorBadge
from rest_framework import serializers


class BadgeSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    def get_serializer_class(self):
        if self.model == DonorBadge:
            return DonorBadgeSerializer
        else:
            return self

    class Meta:
        model = Badge
        fields = ("name", "image", "created_at")

    def get_name(self, obj):
        return get_attribute_in_correct_language(obj, "name", get_language())


class DonorBadgeSerializer(BadgeSerializer):
    min_days_donated = serializers.SerializerMethodField()
    is_donor_forest_badge = serializers.SerializerMethodField()

    class Meta:
        model = DonorBadge
        fields = (
            "min_days_donated",
            "step",
            "instantly_awarded_over_amount",
            "is_donor_forest_badge",
        )

    def get_min_days_donated(self, obj):
        print(obj)
        return obj.regular_donor_minimum_duration.days

    def get_is_donor_forest_badge(self, obj):
        return True

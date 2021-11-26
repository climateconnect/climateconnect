from django.utils.translation import get_language
from climateconnect_api.models.badge import DonorBadge
from climateconnect_api.utility.badges import get_badge_name
from rest_framework import serializers


class DonorBadgeSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = DonorBadge
        fields = ('name', 'image', 'created_at')

    def get_name(self, obj):
        return get_badge_name(obj, get_language())

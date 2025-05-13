from django.utils.translation import get_language
from rest_framework import serializers

from organization.utility.sector import get_sector_name
from organization.models import Sector


class SectorSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    original_name = serializers.SerializerMethodField()

    class Meta:
        model = Sector
        fields = ("id", "name", "original_name", "key")

    def get_name(self, obj):
        return get_sector_name(obj, get_language())

    def get_original_name(self, obj):
        return obj.name

from django.utils.translation import get_language
from rest_framework import serializers

from organization.models.sector import OrganizationSectorMapping
from organization.utility.sector import get_sector_name
from organization.models import Sector, ProjectSectorMapping


class SectorSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    original_name = serializers.SerializerMethodField()

    class Meta:
        model = Sector
        fields = (
            "id",
            "name",
            "original_name",
            "key",
            "image",
            "icon"
        )

    def get_name(self, obj):
        return get_sector_name(obj, get_language())

    def get_original_name(self, obj):
        return obj.name


class ProjectSectorMappingSerializer(serializers.ModelSerializer):
    sector = serializers.SerializerMethodField()
    # project = serializers.SerializerMethodField()

    class Meta:
        model = ProjectSectorMapping
        fields = ("sector", "order")

    def get_sector(self, obj):
        serializer = SectorSerializer(obj.sector)
        return serializer.data


class OrganizationSectorMappingSerializer(serializers.ModelSerializer):
    sector = serializers.SerializerMethodField()

    # project = serializers.SerializerMethodField()
    class Meta:
        model = OrganizationSectorMapping
        fields = ("sector", "order")

    def get_sector(self, obj):
        serializer = SectorSerializer(obj.sector)
        return serializer.data

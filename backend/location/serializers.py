from rest_framework import serializers

from location.models import Location
from location.utility import (
    get_language_code_from_context,
    get_translated_location_name,
)


class LocationStubSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = (
            "name",
            "city",
            "state",
            "country",
            "place_id",
            "osm_id",
            "osm_type",
            "osm_class",
            "osm_class_type",
            "display_name",
        )

    def get_name(self, obj):
        return get_translated_location_name(
            obj, get_language_code_from_context(self.context)
        )


class LocationSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = (
            "name",
            "city",
            "state",
            "country",
            "place_id",
            "osm_id",
            "osm_type",
            "osm_class",
            "osm_class_type",
            "display_name",
            "multi_polygon",
            "centre_point",
        )

    def get_name(self, obj):
        return get_translated_location_name(
            obj, get_language_code_from_context(self.context)
        )

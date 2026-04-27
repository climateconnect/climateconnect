from rest_framework import serializers

from location.models import Location


class LocationStubSerializer(serializers.ModelSerializer):
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


class LocationSerializer(serializers.ModelSerializer):
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

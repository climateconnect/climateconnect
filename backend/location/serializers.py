from rest_framework import serializers
from location.models import Location

class LocationStubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = (
            'name', 'city',
            'state', 'country'
        )

class LocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Location
        fields = (
            'name', 'city',
            'state', 'country',
            'place_id', 'osm_id',
            'multi_polygon', 'centre_point'
        )
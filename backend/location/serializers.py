from rest_framework import serializers
from location.models import Location

class LocationStubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = (
            'name', 'city',
            'state', 'country'
        )
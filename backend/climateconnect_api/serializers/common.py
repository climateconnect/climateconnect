from rest_framework import serializers

from climateconnect_api.models import (
    Availability, Skill
)


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        # We can change this later
        fields = '__all__'


class UserSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = '__all__'

    def to_representation(self, instance):
        return instance.name

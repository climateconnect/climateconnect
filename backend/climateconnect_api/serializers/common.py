from climateconnect_api.utility.common import get_skill_name
from django.utils.translation import get_language
from rest_framework import serializers

from climateconnect_api.models import (
    Availability, Skill
)


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ('id', 'key', 'name')


class SkillSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    class Meta:
        model = Skill
        fields = ('id', 'name', 'parent_skill')

    def get_name(self, obj):
        return get_skill_name(obj, get_language())

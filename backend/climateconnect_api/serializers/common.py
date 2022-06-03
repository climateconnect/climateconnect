from climateconnect_api.utility.common import get_skill_name
from django.utils.translation import get_language
from rest_framework import serializers

from climateconnect_api.models import (
    Availability, Skill
)
from climateconnect_api.models.interests import UserInterests
from hubs.serializers.hub import HubStubSerializer




class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ('id', 'key', 'name')


class SkillSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    original_name = serializers.SerializerMethodField()
    class Meta:
        model = Skill
        fields = ('id', 'name', 'original_name', 'parent_skill')

    def get_name(self, obj):
        return get_skill_name(obj, get_language())
    
    def get_original_name(self, obj):
        return obj.name


class UserInterestsSerializer(serializers.ModelSerializer):
    description = serializers.SerializerMethodField(required=False)
    hub = serializers.SerializerMethodField()

    class Meta:
        model = UserInterests
        fields = ['hub', 'description']


    def get_hub(self, obj):
        # language 
        return HubStubSerializer(obj.hub).data

    def get_description(self, obj):
        # language
        return obj.description

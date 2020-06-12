from rest_framework import serializers

from climateconnect_api.models import UserProfile
from climateconnect_api.serializers.common import (
    AvailabilitySerializer, SkillSerializer
)


class PersonalProfileSerializer(serializers.ModelSerializer):
    email = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    availability = AvailabilitySerializer()
    skills = SkillSerializer(many=True)

    class Meta:
        model = UserProfile
        fields = (
            'email', 'first_name', 'last_name',
            'url_slug', 'image', 'background_image',
            'country', 'state', 'city', 'biography', 'is_profile_verified',
            'availability', 'skills'
        )

    def get_email(self, obj):
        return obj.user.email

    def get_first_name(self, obj):
        return obj.user.first_name

    def get_last_name(self, obj):
        return obj.user.last_name


class UserProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    availability = AvailabilitySerializer()
    skills = SkillSerializer(many=True)

    class Meta:
        model = UserProfile
        fields = (
            'first_name', 'last_name',
            'url_slug', 'image', 'background_image',
            'country', 'state', 'city', 'biography', 'is_profile_verified',
            'availability', 'skills'
        )

    def get_email(self, obj):
        return obj.user.email

    def get_first_name(self, obj):
        return obj.user.first_name

    def get_last_name(self, obj):
        return obj.user.last_name


class UserProfileStubSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = (
            'first_name', 'last_name',
            'url_slug', 'image', 'background_image',
            'country', 'state', 'city', 'is_profile_verified'
        )

    def get_email(self, obj):
        return obj.user.email

    def get_first_name(self, obj):
        return obj.user.first_name

    def get_last_name(self, obj):
        return obj.user.last_name

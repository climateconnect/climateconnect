from rest_framework import serializers

from climateconnect_api.models import UserProfile
from climateconnect_api.serializers.common import (
    AvailabilitySerializer, SkillSerializer
)


class PersonalProfileSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    availability = AvailabilitySerializer()
    skills = SkillSerializer(many=True)

    class Meta:
        model = UserProfile
        fields = (
            'id', 'email', 'first_name', 'last_name',
            'url_slug', 'image', 'background_image',
            'country', 'state', 'city', 'biography', 'is_profile_verified',
            'availability', 'skills'
        )

    def get_id(self, obj):
        return obj.user.id

    def get_email(self, obj):
        return obj.user.email

    def get_first_name(self, obj):
        return obj.user.first_name

    def get_last_name(self, obj):
        return obj.user.last_name


class UserProfileSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    availability = AvailabilitySerializer()
    skills = SkillSerializer(many=True)

    class Meta:
        model = UserProfile
        fields = (
            'id', 'first_name', 'last_name',
            'url_slug', 'image', 'background_image',
            'country', 'state', 'city', 'biography', 'is_profile_verified',
            'availability', 'skills'
        )

    def get_id(self, obj):
        return obj.user.id

    def get_first_name(self, obj):
        return obj.user.first_name

    def get_last_name(self, obj):
        return obj.user.last_name


class UserProfileMinimalSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    id = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = (
            'id', 'first_name', 'last_name',
            'url_slug', 'image', 'background_image',
            'country', 'state', 'city'
        )

    def get_id(self, obj):
        return obj.user.id

    def get_first_name(self, obj):
        return obj.user.first_name

    def get_last_name(self, obj):
        return obj.user.last_name

class UserProfileStubSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = (
            'id', 'first_name', 'last_name',
            'url_slug', 'image', 'country', 'city'
        )

    def get_id(self, obj):
        return obj.user.id

    def get_first_name(self, obj):
        return obj.user.first_name

    def get_last_name(self, obj):
        return obj.user.last_name

class UserAccountSettingsSerializer(serializers.ModelSerializer):
    email = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ('email', 'email_updates_on_projects', 'email_project_suggestions', 'url_slug')

    def get_email(self, obj):
        return obj.user.email

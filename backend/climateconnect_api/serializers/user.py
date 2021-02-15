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
            'availability', 'skills', 'has_logged_in', 'website'
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
            'availability', 'skills', 'website'
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
            'country', 'state', 'city', 'website'
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
        fields = (
            'email', 'send_newsletter', 
            'url_slug', 'email_on_private_chat_message', 'email_on_group_chat_message',
            'email_on_comment_on_your_project', 'email_on_reply_to_your_comment',
            'email_on_new_project_follower'
        )

    def get_email(self, obj):
        return obj.user.email

class UserProfileSitemapEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('url_slug', 'updated_at')
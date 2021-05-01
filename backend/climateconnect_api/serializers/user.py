from rest_framework.fields import SerializerMethodField
from climateconnect_api.utility.user import get_user_profile_biography
from django.utils.translation import get_language
from climateconnect_api.serializers.translation import UserProfileTranslationSerializer
from climateconnect_api.models.user import UserProfileTranslation
from rest_framework import serializers
from django.conf import settings

from climateconnect_api.models import UserProfile
from climateconnect_api.serializers.common import (
    AvailabilitySerializer, SkillSerializer
)


class PersonalProfileSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    availability = AvailabilitySerializer()
    skills = SkillSerializer(many=True)

    class Meta:
        model = UserProfile
        fields = (
            'id', 'email', 'first_name', 'last_name',
            'url_slug', 'image', 'background_image',
            'location', 'biography', 'is_profile_verified',
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

    def get_location(self, obj):
        if obj.location == None:
            return None
        return obj.location.name


class UserProfileSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    availability = AvailabilitySerializer()
    skills = SkillSerializer(many=True)
    language = serializers.SerializerMethodField()
    biography = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = (
            'id', 'first_name', 'last_name',
            'url_slug', 'image', 'background_image',
            'biography', 'is_profile_verified',
            'availability', 'skills', 'website', 'location',
            'language'
        )

    def get_id(self, obj):
        return obj.user.id

    def get_first_name(self, obj):
        return obj.user.first_name

    def get_last_name(self, obj):
        return obj.user.last_name
    
    def get_location(self, obj):
        if obj.location == None:
            return None
        return obj.location.name

    def get_language(self, obj):
        return obj.language.language_code

    def get_biography(self, obj):
        return get_user_profile_biography(obj, get_language())

class EditUserProfileSerializer(UserProfileSerializer):
    location = serializers.SerializerMethodField()
    translations = serializers.SerializerMethodField()
    biography = serializers.SerializerMethodField()
    def get_location(self, obj):
        if settings.ENABLE_LEGACY_LOCATION_FORMAT == "True":
            return {
                "city": obj.location.city,
                "country": obj.location.country
            }
        else:
            if obj.location == None:
                return None
            return obj.location.name
    
    def get_translations(self, obj):
        translations = UserProfileTranslation.objects.filter(user_profile=obj)
        if translations.exists():
            serializer = UserProfileTranslationSerializer(translations, many=True)
            return serializer.data
        else:
            return {}

    def get_biography(self, obj):
        return obj.biography
    class Meta(UserProfileSerializer.Meta):
        fields = UserProfileSerializer.Meta.fields + ('location', 'translations')


class UserProfileMinimalSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    id = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = (
            'id', 'first_name', 'last_name',
            'url_slug', 'image', 'background_image',
            'location', 'website'
        )

    def get_id(self, obj):
        return obj.user.id

    def get_first_name(self, obj):
        return obj.user.first_name

    def get_last_name(self, obj):
        return obj.user.last_name

    def get_location(self, obj):
        if obj.location == None:
            return None
        return obj.location.name


class UserProfileStubSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = (
            'id', 'first_name', 'last_name',
            'url_slug', 'thumbnail_image', 'location'
        )

    def get_id(self, obj):
        return obj.user.id

    def get_first_name(self, obj):
        return obj.user.first_name

    def get_last_name(self, obj):
        return obj.user.last_name

    def get_location(self, obj):
        if obj.location == None:
            return None
        return obj.location.name

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
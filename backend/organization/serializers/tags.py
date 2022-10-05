from organization.utility.organization import get_organizationtag_name
from django.utils.translation import get_language
from organization.utility.project import get_projecttag_name
from rest_framework import serializers
from climateconnect_api.models.social_media import SocialMediaChannel, SocialMediaLink

from organization.models import (
    ProjectTagging,
    ProjectTags,
    OrganizationTagging,
    OrganizationTags,
)


class ProjectTaggingSerializer(serializers.ModelSerializer):
    project_tag = serializers.SerializerMethodField()

    class Meta:
        model = ProjectTagging
        fields = ("project_tag",)

    def get_project_tag(self, obj):
        serializer = ProjectTagsSerializer(obj.project_tag)
        return serializer.data


class ProjectTagsSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    original_name = serializers.SerializerMethodField()

    class Meta:
        model = ProjectTags
        fields = ("id", "name", "original_name", "parent_tag")

    def get_name(self, obj):
        return get_projecttag_name(obj, get_language())

    def get_original_name(self, obj):
        return obj.name


class OrganizationTaggingSerializer(serializers.ModelSerializer):
    organization_tag = serializers.SerializerMethodField()

    class Meta:
        model = OrganizationTagging
        fields = ("organization_tag",)

    def get_organization_tag(self, obj):
        serializer = OrganizationTagsSerializer(obj.organization_tag)
        return serializer.data


class OrganizationTagsSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    original_name = serializers.SerializerMethodField()

    class Meta:
        model = OrganizationTags
        fields = ("id", "name", "original_name", "parent_tag", "additional_info")

    def get_name(self, obj):
        return get_organizationtag_name(obj, get_language())

    def get_original_name(self, obj):
        return obj.name


class OrganizationSocialMediaLinkSerializer(serializers.ModelSerializer):
    social_media_channel = serializers.SerializerMethodField()

    class Meta:
        model = SocialMediaLink
        fields = ("social_media_channel",)

    def get_social_media_channel(self, obj):
        serializer = OrganizationSocialMediaChannelSerializer(obj.social_media_channel)
        return serializer.data



class OrganizationSocialMediaChannelSerializer(serializers.ModelSerializer):
    social_media_name = serializers.SerializerMethodField()
    
    class Meta:
        model = OrganizationTags
        fields = ("id", "social_media_name")

    def get_social_media_name(self, obj):
        return obj.social_media_name

   

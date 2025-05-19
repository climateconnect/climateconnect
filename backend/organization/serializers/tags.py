from organization.utility.organization import get_organizationtag_name
from django.utils.translation import get_language
from organization.utility.project import get_projecttag_name
from rest_framework import serializers

from organization.models import (
    ProjectTagging,
    ProjectTags,
    OrganizationTagging,
    OrganizationTags,
)


# TODO (Karol): remove ProjectTags
class ProjectTaggingSerializer(serializers.ModelSerializer):
    project_tag = serializers.SerializerMethodField()

    class Meta:
        model = ProjectTagging
        fields = ("project_tag",)

    def get_project_tag(self, obj):
        serializer = ProjectTagsSerializer(obj.project_tag)
        return serializer.data


# TODO (Karol): remove ProjectTags
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
        fields = (
            "id",
            "name",
            "hide_get_involved",
            "original_name",
            "parent_tag",
            "additional_info",
        )

    def get_name(self, obj):
        return get_organizationtag_name(obj, get_language())

    def get_original_name(self, obj):
        return obj.name

from rest_framework import serializers

from organization.models import (ProjectTagging, ProjectTags, OrganizationTagging, OrganizationTags)

class ProjectTaggingSerializer(serializers.ModelSerializer):
  project_tag = serializers.SerializerMethodField()

  class Meta:
    model = ProjectTagging
    fields = ('project_tag',)

  def get_project_tag(self, obj):
    serializer = ProjectTagsSerializer(obj.project_tag)
    return serializer.data

class ProjectTagsSerializer(serializers.ModelSerializer):
  class Meta:
    model = ProjectTags
    fields = ('id', 'name', 'parent_tag')

class OrganizationTaggingSerializer(serializers.ModelSerializer):
  organization_tag = serializers.SerializerMethodField()

  class Meta:
    model = OrganizationTagging
    fields = ('organization_tag',)

  def get_organization_tag(self, obj):
    serializer = OrganizationTagsSerializer(obj.organization_tag)
    return serializer.data

class OrganizationTagsSerializer(serializers.ModelSerializer):
  class Meta:
    model = OrganizationTags
    fields = ('id', 'name', 'parent_tag', 'additional_info')
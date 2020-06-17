from rest_framework import serializers

from organization.models import (ProjectTagging, ProjectTags)

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
    fields = ('name',)
  


from rest_framework import serializers

from organization.models import ProjectStatus

class ProjectStatusSerializer(serializers.ModelSerializer):
  class Meta: 
    model = ProjectStatus
    fields = ('id', 'name', 'has_end_date', 'has_start_date')
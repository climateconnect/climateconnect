from organization.utility.status import get_project_status
from django.utils.translation import get_language
from rest_framework import serializers

from organization.models import ProjectStatus

class ProjectStatusSerializer(serializers.ModelSerializer):
  name = serializers.SerializerMethodField()
  class Meta: 
    model = ProjectStatus
    fields = ('id', 'name', 'has_end_date', 'has_start_date')

  def get_name(self, obj):
    return get_project_status(obj, get_language())
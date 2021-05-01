from organization.utility.status import get_project_status
from django.utils.translation import get_language
from rest_framework import serializers

from organization.models import ProjectStatus

class ProjectStatusSerializer(serializers.ModelSerializer):
  name = serializers.SerializerMethodField()
  status_type = serializers.SerializerMethodField()
  class Meta: 
    model = ProjectStatus
    fields = ('id', 'name', 'has_end_date', 'has_start_date', 'status_type')

  def get_name(self, obj):    
    return get_project_status(obj, get_language())
  
  def get_status_type(self, obj):
    return ProjectStatus.PROJECT_STATUS_TYPES[obj.status_type][1]

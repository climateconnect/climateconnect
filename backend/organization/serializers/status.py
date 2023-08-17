from organization.utility.status import get_project_status
from django.utils.translation import get_language
from rest_framework import serializers

from organization.models import ProjectStatus


class ProjectStatusSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    original_name = serializers.SerializerMethodField()
    status_type = serializers.SerializerMethodField()

    class Meta:
        model = ProjectStatus
        fields = (
            "id",
            "name",
            "original_name",
            "has_end_date",
            "has_start_date",
            "status_type",
        )

    def get_name(self, obj):
        return get_project_status(obj, get_language())

    def get_original_name(self, obj):
        return obj.name

    def get_status_type(self, obj):
        project_status_name = list(
            filter(
                lambda x: x[0] == obj.status_type, ProjectStatus.PROJECT_STATUS_TYPES
            )
        )[0][1]
        return project_status_name

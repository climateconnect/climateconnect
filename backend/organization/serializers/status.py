from organization.utility.status import (
    get_project_status,
    get_project_type_name,
    get_project_type_helptext,
)
from django.utils.translation import get_language
from rest_framework import serializers

from organization.models.status import ProjectStatus


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


class ProjectTypesSerializer(serializers.Serializer):
    name = serializers.SerializerMethodField()
    original_name = serializers.SerializerMethodField()
    help_text = serializers.SerializerMethodField()
    icon = serializers.CharField()
    type_id = serializers.CharField()

    def get_name(self, obj):
        return get_project_type_name(obj, get_language())

    def get_original_name(self, obj):
        return obj.name

    def get_type_id(self, obj):
        return obj.type_id

    def get_help_text(self, obj):
        return get_project_type_helptext(obj, get_language())

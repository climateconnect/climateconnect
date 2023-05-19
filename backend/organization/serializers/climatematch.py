from organization.models.project import Project
from organization.serializers.organization import OrganizationSerializer
from organization.serializers.project import ProjectSuggestionSerializer
from rest_framework import serializers


class OrganizationSuggestionSerializer(OrganizationSerializer):
    projects = serializers.SerializerMethodField()

    class Meta(OrganizationSerializer.Meta):
        fields = OrganizationSerializer.Meta.fields + ("projects",)#type: ignore

    def get_projects(self, obj):
        project_ids = obj.project_parent_org.all().values_list("project", flat=True)
        projects = Project.objects.filter(id__in=project_ids)
        serializer = ProjectSuggestionSerializer(projects, many=True)
        return serializer.data

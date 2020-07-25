from rest_framework import serializers

from climateconnect_api.models import UserProfile
from organization.models import (Project, ProjectMember, ProjectParents, ProjectCollaborators)
from climateconnect_api.serializers.common import (SkillSerializer, AvailabilitySerializer)
from climateconnect_api.serializers.user import UserProfileStubSerializer
from climateconnect_api.serializers.role import RoleSerializer
from organization.serializers.organization import OrganizationStubSerializer
from organization.serializers.tags import ProjectTaggingSerializer


class ProjectSerializer(serializers.ModelSerializer):
    skills = serializers.SerializerMethodField()
    project_parents = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    status = serializers.CharField(source='status.name', read_only=True)
    collaborating_organizations = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            'id', 'name', 'url_slug',
            'image', 'status',
            'start_date', 'end_date',
            'short_description', 'description',
            'country', 'city',
            'collaborators_welcome', 
            'skills', 'helpful_connections',
            'project_parents', 'tags', 
            'created_at', 'collaborating_organizations', 'is_draft',
            'website'
        )
        read_only_fields = ['url_slug']

    def get_collaborating_organizations(self, obj):
        serializer = ProjectCollaboratorsSerializer(obj.project_collaborator, many=True)
        return serializer.data

    def get_skills(self, obj):
        serializer = SkillSerializer(obj.skills, many=True)
        return serializer.data
    
    def get_project_parents(self, obj):
        serializer = ProjectParentsSerializer(obj.project_parent, many=True)
        return serializer.data

    def get_tags(self, obj):
        serializer = ProjectTaggingSerializer(obj.tag_project, many=True)
        return serializer.data


class ProjectParentsSerializer(serializers.ModelSerializer):
    parent_organization = serializers.SerializerMethodField()
    parent_user = serializers.SerializerMethodField()

    class Meta:
        model = ProjectParents
        fields = (
            'parent_organization', 'parent_user',
            'created_at'
        )

    def get_parent_organization(self, obj):
        if obj.parent_organization:
            return OrganizationStubSerializer(obj.parent_organization).data

    def get_parent_user(self, obj):
        if obj.parent_user:
            return UserProfileStubSerializer(obj.parent_user.user_profile).data


class ProjectMinimalSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True)
    project_parents = serializers.SerializerMethodField()
    status = serializers.CharField(source='status.name', read_only=True)

    class Meta:
        model = Project
        fields = (
            'name', 'url_slug', 
            'skills', 'image', 
            'status', 'country', 
            'city', 'project_parents', 'is_draft','website'
        )
    
    def get_project_parents(self, obj):
        serializer = ProjectParentsSerializer(obj.project_parent, many=True)
        return serializer.data


class ProjectStubSerializer(serializers.ModelSerializer):
    project_parents = serializers.SerializerMethodField()
    status = serializers.CharField(source='status.name', read_only=True)
    
    class Meta:
        model = Project
        fields = (
            'id', 'name', 'url_slug', 
            'image', 'country', 
            'city', 'status',
            'project_parents', 'collaborators_welcome',
            'is_draft'
        )
    
    def get_project_parents(self, obj):
        serializer = ProjectParentsSerializer(obj.project_parent, many=True)
        return serializer.data


class ProjectMemberSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    role = RoleSerializer()
    availability = AvailabilitySerializer()

    class Meta:
        model = ProjectMember
        fields = ('id', 'user', 'role', 'role_in_project', 'availability')

    def get_user(self, obj):
        return UserProfileStubSerializer(UserProfile.objects.filter(user=obj.user)[0]).data


class InsertProjectMemberSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProjectMember
        fields = ('id', 'user', 'role', 'role_in_project', 'availability')


class ProjectCollaboratorsSerializer(serializers.ModelSerializer):
    collaborating_organization = serializers.SerializerMethodField()

    class Meta:
        model = ProjectCollaborators
        fields = ['collaborating_organization']
    
    def get_collaborating_organization(self, obj):
        serializer = OrganizationStubSerializer(obj.collaborating_organization)
        return serializer.data

class ProjectFromProjectParentsSerializer(serializers.ModelSerializer):
    project = serializers.SerializerMethodField()

    class Meta:
        model = ProjectParents
        fields = ('project',)

    def get_project(self, obj):
        serializer = ProjectStubSerializer(obj.project)
        return serializer.data

class ProjectFromProjectMemberSerializer(serializers.ModelSerializer):
    project = serializers.SerializerMethodField()

    class Meta:
        model = ProjectMember
        fields = ('project',)

    def get_project(self, obj):
        serializer = ProjectStubSerializer(obj.project)
        return serializer.data
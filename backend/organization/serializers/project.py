from location.models import Location
from location.serializers import LocationStubSerializer
from rest_framework import serializers

from climateconnect_api.models import UserProfile
from organization.models import (Project, ProjectFollower, ProjectMember, ProjectParents, ProjectCollaborators)
from climateconnect_api.serializers.common import (SkillSerializer, AvailabilitySerializer)
from climateconnect_api.serializers.user import UserProfileStubSerializer
from climateconnect_api.serializers.role import RoleSerializer
from organization.serializers.organization import OrganizationStubSerializer
from organization.serializers.tags import ProjectTaggingSerializer, OrganizationTagging

class ProjectSerializer(serializers.ModelSerializer):
    skills = serializers.SerializerMethodField()
    project_parents = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    status = serializers.CharField(source='status.name', read_only=True)
    collaborating_organizations = serializers.SerializerMethodField()
    number_of_followers = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    loc = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            'id', 'name', 'url_slug',
            'image', 'status',
            'start_date', 'end_date',
            'short_description', 'description',
            'loc', 'location',
            'collaborators_welcome', 
            'skills', 'helpful_connections',
            'project_parents', 'tags', 
            'created_at', 'collaborating_organizations', 'is_draft',
            'website', 'number_of_followers'
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

    def get_number_of_followers(self, obj):
        return obj.project_following.count()

    def get_loc(self, obj):
        if obj.loc == None:
            return None
        return obj.loc.name
    
    def get_location(self, obj):
        if obj.loc == None:
            return None
        return obj.loc.name


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
    location = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            'name', 'url_slug', 
            'skills', 'image', 
            'status', 'location', 'project_parents', 'is_draft','website'
        )
    
    def get_project_parents(self, obj):
        serializer = ProjectParentsSerializer(obj.project_parent, many=True)
        return serializer.data
    
    def get_location(self, obj):
        if obj.loc == None:
            return None
        return obj.loc.name


class ProjectStubSerializer(serializers.ModelSerializer):
    project_parents = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    status = serializers.CharField(source='status.name', read_only=True)
    image = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = (
            'id', 'name', 'url_slug', 
            'image', 'location', 'status',
            'project_parents', 'tags',
            'is_draft', 'short_description'
        )
    
    def get_project_parents(self, obj):        
        serializer = ProjectParentsSerializer(obj.project_parent, many=True)
        return serializer.data
    
    def get_tags(self, obj):
        serializer = ProjectTaggingSerializer(obj.tag_project, many=True)
        return serializer.data
    
    def get_image(self, obj):
        if obj.thumbnail_image:
            return obj.thumbnail_image.url
        if obj.image:            
            return obj.image.url
        else:
            return None
    
    def get_location(self, obj):
        if obj.loc == None:
            return None
        return obj.loc.name


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

class ProjectSitemapEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('url_slug', 'updated_at')

class ProjectFollowerSerializer(serializers.ModelSerializer):
    user_profile = serializers.SerializerMethodField()
    class Meta:
        model = ProjectFollower
        fields = ('user_profile', 'created_at')
    
    def get_user_profile(self, obj):
        user_profile = UserProfile.objects.get(user=obj.user)
        serializer = UserProfileStubSerializer(user_profile)
        return serializer.data
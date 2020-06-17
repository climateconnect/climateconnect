from rest_framework import serializers

from organization.models import (Project, ProjectMember, ProjectParents)
from climateconnect_api.serializers.common import SkillSerializer
from climateconnect_api.serializers.user import UserProfileStubSerializer
from climateconnect_api.serializers.role import RoleSerializer
from organization.serializers.organization import OrganizationStubSerializer
from organization.serializers.content import (PostSerializer, ProjectCommentSerializer)
from organization.serializers.tags import ProjectTaggingSerializer

class ProjectSerializer(serializers.ModelSerializer):
    skills = serializers.SerializerMethodField()
    project_parents = serializers.SerializerMethodField()
    project_posts = serializers.SerializerMethodField()
    comments = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()

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
            'project_parents', 'project_posts',
            'comments', 'tags',
            'created_at'
        )
        read_only_fields = ['url_slug']

    def get_skills(self, obj):
        serializer = SkillSerializer(obj.skills, many=True)
        return serializer.data
    
    def get_project_parents(self, obj):
        serializer = ProjectParentsSerializer(obj.project_parent, many=True)
        return serializer.data
    
    def get_project_posts(self, obj):
        serializer = PostSerializer(obj.post_project, many=True)
        return serializer.data
    
    def get_comments(self, obj):
        top_level_comments = obj.project_comment.exclude(parent_comment_id__isnull=False)
        serializer = ProjectCommentSerializer(top_level_comments, many=True)
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
        return OrganizationStubSerializer(obj.parent_organization).data

    def get_parent_user(self, obj):
        return UserProfileStubSerializer(obj.parent_user.user_profile).data

class ProjectMinimalSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True)
    project_parents = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            'name', 'url_slug', 
            'skills', 'image', 
            'status', 'country', 
            'city', 'project_parents'
        )
    
    def get_project_parents(self, obj):
        serializer = ProjectParentsSerializer(obj.project_parent, many=True)
        return serializer.data

class ProjectStubSerializer(serializers.ModelSerializer):
    project_parents = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = (
            'name', 'url_slug', 
            'image', 'country', 
            'city', 'status',
            'project_parents'
        )
    
    def get_project_parents(self, obj):
        serializer = ProjectParentsSerializer(obj.project_parent, many=True)
        return serializer.data


class ProjectMemberSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    role = RoleSerializer()

    class Meta:
        model = ProjectMember
        exclude = ('created_at', 'updated_at', 'project')

    def get_user(self, obj):
        return UserProfileStubSerializer(obj.user.user_profile).data

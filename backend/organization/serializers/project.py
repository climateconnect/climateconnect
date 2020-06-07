from rest_framework import serializers

from organization.models import (Project, ProjectMember)
from climateconnect_api.serializers.common import SkillSerializer
from climateconnect_api.serializers.user import UserProfileStubSerializer
from climateconnect_api.serializers.role import RoleSerializer


class ProjectSerializer(serializers.ModelSerializer):
    skills = serializers.SerializerMethodField()

    class Meta:
        model = Project
        exclude = ['created_at', 'updated_at']
        read_only_fields = ['url_slug']

    def get_skills(self, obj):
        serializer = SkillSerializer(obj.skills, many=True)
        return serializer.data


class ProjectMinimalSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True)

    class Meta:
        model = Project
        fields = ('name', 'url_slug', 'skills', 'image', 'status')


class ProjectMemberSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    project = ProjectSerializer()
    role = RoleSerializer()

    class Meta:
        model = ProjectMember
        exclude = ('created_at', 'updated_at')

    def get_user(self, obj):
        return UserProfileStubSerializer(obj.user.user_profile).data

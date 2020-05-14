from rest_framework import serializers

from organization.models import Project
from climateconnect_api.serializers.common import SkillSerializer


class ProjectSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True)

    class Meta:
        model = Project
        exclude = ('created_at', 'updated_at')


class ProjectMinimalSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True)

    class Meta:
        model = Project
        fields = ('name', 'url_slug', 'skills', 'image', 'status')

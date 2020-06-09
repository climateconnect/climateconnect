from organization.models import Organization

from rest_framework import serializers


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        exclude = ('created_at', 'updated_at')


class OrganizationMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ('name', 'url_slug', 'image', 'background_image', 'country', 'state', 'city')

from organization.models import Organization, OrganizationMember
from climateconnect_api.serializers.user import UserProfileSerializer

from rest_framework import serializers


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        exclude = ('created_at', 'updated_at')


class OrganizationMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ('name', 'url_slug', 'image', 'short_description', 'background_image', 'country', 'state', 'city')


class OrganizationMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationMember
        fields = ('id', 'user', 'role', 'time_per_week', 'role_in_organization', 'organization')

    def to_representation(self, instance):
        user_profile = None if not instance.user.user_profile else\
            UserProfileSerializer(instance.user.user_profile).data
        return {
            'id': instance.id,
            'user': user_profile,
            'permission': instance.role.name,
            'organization': instance.organization.name,
            'time_per_week': None if not instance.time_per_week else instance.time_per_week.name,
            'role_in_organization': instance.role_in_organization
        }

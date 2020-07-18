from organization.models import Organization, OrganizationMember
from climateconnect_api.serializers.user import UserProfileStubSerializer
from climateconnect_api.serializers.role import RoleSerializer
from organization.serializers.tags import OrganizationTaggingSerializer

from rest_framework import serializers


class OrganizationSerializer(serializers.ModelSerializer):
    types = serializers.SerializerMethodField()
    parent_organization = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = ('id', 'types', 'name', 'url_slug', 'image', 'background_image', 'parent_organization', 'country', 'state', 'city', 'short_description', 'organ', 'school')

    def get_types(self, obj):
        serializer = OrganizationTaggingSerializer(obj.tag_organization, many=True)
        return serializer.data
    
    def get_parent_organization(self, obj):
        serializer = OrganizationStubSerializer(obj.parent_organization)
        return serializer.data

class OrganizationMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ('id', 'name', 'url_slug', 'image', 'short_description', 'background_image', 'country', 'state', 'city')

class OrganizationCardSerializer(serializers.ModelSerializer):
    types = serializers.SerializerMethodField()
    class Meta:
        model = Organization
        fields = ('id', 'name', 'url_slug', 'image', 'city', 'country', 'types')

    def get_types(self, obj):
        serializer = OrganizationTaggingSerializer(obj.tag_organization, many=True)
        return serializer.data

class OrganizationStubSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ('id', 'name', 'url_slug', 'image')


class OrganizationMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationMember
        fields = ('id', 'user', 'role', 'role_in_organization', 'organization')

    def to_representation(self, instance):
        user_profile = None if not instance.user.user_profile else\
            UserProfileStubSerializer(instance.user.user_profile).data
        permission = RoleSerializer(instance.role).data
        return {
            'id': instance.id,
            'user': user_profile,
            'permission': permission,
            'organization': instance.organization.name,
            'time_per_week': None if not instance.time_per_week else instance.time_per_week.name,
            'role_in_organization': instance.role_in_organization
        }

class UserOrganizationSerializer(serializers.ModelSerializer):
    organization = serializers.SerializerMethodField()
    class Meta: 
        model = OrganizationMember
        fields = ('organization',)
    
    def get_organization(self, obj):
        return OrganizationStubSerializer(obj.organization).data

class OrganizationsFromProjectMember(serializers.ModelSerializer):
    organization = serializers.SerializerMethodField()
    class Meta: 
        model = OrganizationMember
        fields = ('organization',)
    
    def get_organization(self, obj):
        return OrganizationCardSerializer(obj.organization).data

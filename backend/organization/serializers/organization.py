from organization.models import Organization, OrganizationMember
from climateconnect_api.serializers.user import UserProfileStubSerializer
from climateconnect_api.serializers.role import RoleSerializer
from organization.serializers.tags import OrganizationTaggingSerializer
from django.conf import settings

from rest_framework import serializers


class OrganizationSerializer(serializers.ModelSerializer):
    types = serializers.SerializerMethodField()
    parent_organization = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = ('id', 'types', 'name', 'url_slug', 'image', 
            'background_image', 'parent_organization', 'location',
            'short_description', 'organ', 'school', 'website'
        )

    def get_types(self, obj):
        serializer = OrganizationTaggingSerializer(obj.tag_organization, many=True)
        return serializer.data
    
    def get_parent_organization(self, obj):
        serializer = OrganizationStubSerializer(obj.parent_organization)
        return serializer.data
    
    def get_location(self, obj):
        if obj.location == None:
            return None
        return obj.location.name

class EditOrganizationSerializer(OrganizationSerializer):
    location = serializers.SerializerMethodField()
    def get_location(self, obj):
        if settings.ENABLE_LEGACY_LOCATION_FORMAT == "True":
            return {
                "city": obj.location.city,
                "country": obj.location.country
            }
        else:
            if obj.location == None:
                return None
            return obj.location.name
    class Meta(OrganizationSerializer.Meta):
        fields = OrganizationSerializer.Meta.fields + ('location',)


class OrganizationMinimalSerializer(serializers.ModelSerializer):
    location = serializers.SerializerMethodField()
    class Meta:
        model = Organization
        fields = (
            'id', 'name', 'url_slug', 'image', 'short_description', 
            'background_image', 'location', 'website'
        )
    
    def get_location(self, obj):
        if obj.location == None:
            return None
        return obj.location.name


class OrganizationCardSerializer(serializers.ModelSerializer):
    types = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    class Meta:
        model = Organization
        fields = (
            'id', 'name', 'url_slug', 'thumbnail_image', 'location', 'types'
        )
    
    def get_location(self, obj):
        if obj.location == None:
            return None
        return obj.location.name

    def get_types(self, obj):
        serializer = OrganizationTaggingSerializer(obj.tag_organization, many=True)
        return serializer.data


class OrganizationStubSerializer(serializers.ModelSerializer):
    location = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = ('id', 'name', 'url_slug', 'thumbnail_image', 'location')

    def get_location(self, obj):
        if obj.location == None:
            return None
        return obj.location.name


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


class OrganizationSitemapEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ('url_slug', 'updated_at')

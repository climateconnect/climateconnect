from organization.serializers.translation import OrganizationTranslationSerializer
from climateconnect_api.serializers.role import RoleSerializer
from climateconnect_api.serializers.user import UserProfileStubSerializer
from django.conf import settings
from django.utils.translation import get_language
from rest_framework import serializers

from organization.models import Organization, OrganizationMember, OrganizationTranslation
from organization.serializers.tags import OrganizationTaggingSerializer
from organization.utility.organization import (
    get_organization_name, get_organization_short_description)


class OrganizationSerializer(serializers.ModelSerializer):
    types = serializers.SerializerMethodField()
    parent_organization = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()
    language = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = ('id', 'types', 'name', 'url_slug', 'image', 
            'background_image', 'parent_organization', 'location',
            'short_description', 'organ', 'school', 'website', 'language'
        )

    def get_name(self, obj):
        return get_organization_name(obj, get_language())
    
    def get_short_description(self, obj):
        return get_organization_short_description(obj, get_language())

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

    def get_language(self, obj):
        return obj.language.language_code


class EditOrganizationSerializer(OrganizationSerializer):
    location = serializers.SerializerMethodField()
    translations = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()
    organ = serializers.SerializerMethodField()
    school = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
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

    def get_translations(self, obj):
        translations = OrganizationTranslation.objects.filter(organization=obj)
        if translations.exists():
            serializer = OrganizationTranslationSerializer(translations, many=True)
            return serializer.data
        else:
            return {}
    def get_short_description(self, obj):
        return obj.short_description
    def get_organ(self, obj):
        return obj.organ
    def get_school(self, obj):
        return obj.school
    def get_name(self, obj):
        return obj.name
    class Meta(OrganizationSerializer.Meta):
        fields = OrganizationSerializer.Meta.fields + ('location', 'translations')


class OrganizationMinimalSerializer(serializers.ModelSerializer):
    location = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    class Meta:
        model = Organization
        fields = (
            'id', 'name', 'url_slug', 'image', 'short_description', 
            'background_image', 'location', 'website'
        )
    
    def get_name(self, obj):
        return get_organization_name(obj, get_language())

    def get_location(self, obj):
        if obj.location == None:
            return None
        return obj.location.name


class OrganizationCardSerializer(serializers.ModelSerializer):
    types = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    class Meta:
        model = Organization
        fields = (
            'id', 'name', 'url_slug', 'thumbnail_image', 'location', 'types'
        )
    
    def get_name(self, obj):
        return get_organization_name(obj, get_language())

    def get_location(self, obj):
        if obj.location == None:
            return None
        return obj.location.name

    def get_types(self, obj):
        serializer = OrganizationTaggingSerializer(obj.tag_organization, many=True)
        return serializer.data


class OrganizationStubSerializer(serializers.ModelSerializer):
    location = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = ('id', 'name', 'url_slug', 'thumbnail_image', 'location')

    def get_name(self, obj):
        return get_organization_name(obj, get_language())

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
        return OrganizationStubSerializer(
            obj.organization, 
            context={'language_code': self.context['language_code']}
        ).data


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

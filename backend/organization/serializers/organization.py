from climateconnect_api.models.role import Role
from climateconnect_api.models.user import UserProfile
from climateconnect_api.serializers.role import RoleSerializer
from climateconnect_api.serializers.user import UserProfileStubSerializer
from django.conf import settings
from django.utils.translation import get_language
from hubs.serializers.hub import HubStubSerializer
from rest_framework import serializers

from organization.models import (Organization, OrganizationMember,
                                 OrganizationTranslation)
from organization.models.project import Project, ProjectParents
from organization.serializers.tags import OrganizationTaggingSerializer
from organization.serializers.translation import \
    OrganizationTranslationSerializer
from organization.utility.organization import (
    get_organization_about_section, get_organization_name,
    get_organization_short_description)


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

class OrganizationSerializer(serializers.ModelSerializer):
    types = serializers.SerializerMethodField()
    parent_organization = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()
    about = serializers.SerializerMethodField()
    language = serializers.SerializerMethodField()
    hubs = serializers.SerializerMethodField()
    creator = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = ('id', 'types', 'name', 'url_slug', 'image', 
            'background_image', 'parent_organization', 'location',
            'short_description', 'organ', 'school', 'website', 
            'language', 'about', 'organization_size',
            'hubs', 'creator'
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
        if obj.location is None:
            return None
        return obj.location.name

    def get_language(self, obj):
        if obj.language:
            return obj.language.language_code

    def get_about(self, obj):
        return get_organization_about_section(obj, get_language())

    def get_hubs(self, obj):
        serializer = HubStubSerializer(obj.hubs, many=True)
        return serializer.data

    def get_creator(self, obj):
        try:
            creator = OrganizationMember.objects.get(
                organization=obj.id,
                role__role_type=Role.ALL_TYPE
            )
            creator_profile = UserProfile.objects.get(user_id=creator.user_id)
            creator_data = (UserProfileStubSerializer(creator_profile)).data
            creator_data['role'] = creator.role_in_organization
            return creator_data
        except (OrganizationMember.DoesNotExist, UserProfile.DoesNotExist):
            print("No creator!")


class EditOrganizationSerializer(OrganizationSerializer):
    location = serializers.SerializerMethodField()
    translations = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()
    about = serializers.SerializerMethodField()
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
    def get_about(self, obj):
        return obj.about
    def get_organ(self, obj):
        return obj.organ
    def get_school(self, obj):
        return obj.school
    def get_name(self, obj):
        return obj.name
    class Meta(OrganizationSerializer.Meta):
        fields = OrganizationSerializer.Meta.fields + ('location', 'translations')


class OrganizationCardSerializer(serializers.ModelSerializer):
    types = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    projects_count = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = (
            'id', 'name', 'url_slug', 'thumbnail_image', 'location', 'types', 'short_description', 'members_count',
            'projects_count'
        )
    
    def get_name(self, obj):
        return get_organization_name(obj, get_language())

    def get_location(self, obj):
        if obj.location == None:
            return None
        return obj.location.name

    def get_short_description(self, obj):
        return get_organization_short_description(obj, get_language())

    def get_types(self, obj):
        serializer = OrganizationTaggingSerializer(obj.tag_organization, many=True)
        return serializer.data

    def get_members_count(self, obj):
        return OrganizationMember.objects.filter(organization=obj.id).count()

    def get_projects_count(self, obj):
        return ProjectParents.objects.filter(parent_organization__id=obj.id, project__is_draft=False).count()

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


class OrganizationsFromOrganizationMember(serializers.ModelSerializer):
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

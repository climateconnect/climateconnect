from climateconnect_api.models import UserProfile
from climateconnect_api.serializers.common import (AvailabilitySerializer,
                                                   SkillSerializer)
from climateconnect_api.serializers.role import RoleSerializer
from climateconnect_api.serializers.user import UserProfileStubSerializer
from django.conf import settings
from django.utils.translation import get_language
from location.models import Location
from location.serializers import LocationStubSerializer
from rest_framework import serializers
from rest_framework.fields import SerializerMethodField

from organization.models import (Project, ProjectCollaborators,
                                 ProjectFollower, ProjectMember,
                                 ProjectParents)
from organization.models.translations import ProjectTranslation
from organization.serializers.organization import OrganizationStubSerializer
from organization.serializers.status import ProjectStatusSerializer
from organization.serializers.tags import (OrganizationTagging,
                                           ProjectTaggingSerializer)
from organization.serializers.translation import ProjectTranslationSerializer
from organization.utility.project import (get_project_description,
                                          get_project_helpful_connections,
                                          get_project_name,
                                          get_project_short_description)
from organization.utility.status import get_project_status


class ProjectSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()
    project_parents = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    collaborating_organizations = serializers.SerializerMethodField()
    number_of_followers = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    loc = serializers.SerializerMethodField()
    helpful_connections = serializers.SerializerMethodField()
    language = serializers.SerializerMethodField()

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
            'website', 'number_of_followers', 'language'
        )
        read_only_fields = ['url_slug']

    def get_name(self, obj):
        return get_project_name(obj, get_language())

    def get_short_description(self, obj):
        return get_project_short_description(obj, get_language())

    def get_description(self, obj):
        return get_project_description(obj, get_language())

    def get_collaborating_organizations(self, obj):
        serializer = ProjectCollaboratorsSerializer(
            obj.project_collaborator, many=True)
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

    def get_helpful_connections(self, obj):
        return get_project_helpful_connections(obj, get_language())

    def get_status(self, obj):
        serializer = ProjectStatusSerializer(obj.status, many=False)
        return serializer.data['name']

    def get_language(self, obj):
        return obj.language.language_code


class EditProjectSerializer(ProjectSerializer):
    loc = serializers.SerializerMethodField()
    translations = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()
    helpful_connections = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()

    def get_loc(self, obj):
        if settings.ENABLE_LEGACY_LOCATION_FORMAT == "True":
            return {
                "city": obj.loc.city,
                "country": obj.loc.country
            }
        else:
            if obj.loc == None:
                return None
            return obj.loc.name

    def get_translations(self, obj):
        translations = ProjectTranslation.objects.filter(project=obj)
        if translations.exists():
            serializer = ProjectTranslationSerializer(translations, many=True)
            return serializer.data
        else:
            return {}

    def get_name(self, obj):
        return obj.name

    def get_short_description(self, obj):
        return obj.short_description

    def get_description(self, obj):
        return obj.description

    def get_helpful_connections(self, obj):
        return obj.helpful_connections

    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + ('loc', 'translations')


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
            try:
                return UserProfileStubSerializer(obj.parent_user.user_profile).data
            except Exception:
                print(obj.parent_user)


class ProjectMinimalSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True)
    project_parents = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            'name', 'url_slug',
            'skills', 'image',
            'status', 'location', 'project_parents', 'is_draft', 'website'
        )

    def get_name(self, obj):
        return get_project_name(obj, get_language())

    def get_project_parents(self, obj):
        serializer = ProjectParentsSerializer(obj.project_parent, many=True)
        return serializer.data

    def get_location(self, obj):
        if obj.loc == None:
            return None
        return obj.loc.name

    def get_status(self, obj):
        serializer = ProjectStatusSerializer(obj.status, many=False)
        return serializer.data['name']


class ProjectStubSerializer(serializers.ModelSerializer):
    project_parents = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    status = SerializerMethodField()
    image = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()
    print(get_language())

    class Meta:
        model = Project
        fields = (
            'id', 'name', 'url_slug',
            'image', 'location', 'status',
            'project_parents', 'tags',
            'is_draft', 'short_description'
        )

    def get_name(self, obj):
        return get_project_name(obj, get_language())

    def get_short_description(self, obj):
        return get_project_short_description(obj, get_language())

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

    def get_status(self, obj):
        serializer = ProjectStatusSerializer(obj.status, many=False)
        return serializer.data['name']


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

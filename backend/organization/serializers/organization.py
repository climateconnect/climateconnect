from organization.utility.sector import (
    get_sectors_based_on_hub,
)
from climateconnect_api.models.role import Role
from climateconnect_api.models.user import UserProfile
from climateconnect_api.serializers.role import RoleSerializer
from climateconnect_api.serializers.user import UserProfileStubSerializer
from django.conf import settings
from django.utils.translation import get_language
from rest_framework import serializers

from organization.models import (
    Organization,
    OrganizationMember,
    OrganizationTranslation,
    OrganizationFollower,
)
from organization.models.project import ProjectParents
from organization.serializers.sector import OrganizationSectorMappingSerializer
from organization.serializers.tags import OrganizationTaggingSerializer
from organization.serializers.translation import OrganizationTranslationSerializer
from organization.utility.organization import (
    get_organization_about_section,
    get_organization_name,
    get_organization_short_description,
    get_organization_get_involved,
)


class OrganizationStubSerializer(serializers.ModelSerializer):
    location = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = ("id", "name", "url_slug", "thumbnail_image", "location")

    def get_name(self, obj):
        return get_organization_name(obj, get_language())

    def get_location(self, obj):
        if obj.location is None:
            return None
        return obj.location.name


class OrganizationSerializer(serializers.ModelSerializer):
    sectors = serializers.SerializerMethodField()
    types = serializers.SerializerMethodField()
    parent_organization = serializers.SerializerMethodField()
    child_organizations = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()
    about = serializers.SerializerMethodField()
    language = serializers.SerializerMethodField()
    creator = serializers.SerializerMethodField()
    number_of_followers = serializers.SerializerMethodField()
    get_involved = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = (
            "id",
            "sectors",
            "types",
            "name",
            "url_slug",
            "image",
            "background_image",
            "parent_organization",
            "child_organizations",
            "location",
            "short_description",
            "organ",
            "school",
            "website",
            "language",
            "about",
            "organization_size",
            "hubs",
            "creator",
            "number_of_followers",
            "get_involved",
        )

    def get_name(self, obj):
        return get_organization_name(obj, get_language())

    def get_short_description(self, obj):
        return get_organization_short_description(obj, get_language())

    def get_sectors(self, obj):
        hub = self.context.get("hub")

        sector_mappings = get_sectors_based_on_hub(
            obj.organization_sector_mapping.all(), hub
        )

        serializer = OrganizationSectorMappingSerializer(sector_mappings, many=True)
        return serializer.data

    def get_types(self, obj):
        serializer = OrganizationTaggingSerializer(obj.tag_organization, many=True)
        return serializer.data

    def get_parent_organization(self, obj):
        serializer = OrganizationStubSerializer(obj.parent_organization)
        return serializer.data

    def get_child_organizations(self, obj):
        """Get all child organizations (organizations that have this org as parent)"""
        child_orgs = obj.organization_parent.all().order_by("name")
        serializer = OrganizationStubSerializer(child_orgs, many=True)
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

    def get_get_involved(self, obj):
        return get_organization_get_involved(obj, get_language())

    def get_creator(self, obj):
        try:
            creator = OrganizationMember.objects.get(
                organization=obj.id, role__role_type=Role.ALL_TYPE
            )
            creator_profile = UserProfile.objects.get(user_id=creator.user_id)
            creator_data = (UserProfileStubSerializer(creator_profile)).data
            creator_data["role"] = creator.role_in_organization
            return creator_data
        except (OrganizationMember.DoesNotExist, UserProfile.DoesNotExist):
            print("No creator!")

    def get_number_of_followers(self, obj):
        return obj.organization_following.count()


class OrganizationFollowerSerializer(serializers.ModelSerializer):
    user_profile = serializers.SerializerMethodField()

    class Meta:
        model = OrganizationFollower
        fields = ("user_profile", "created_at")

    def get_user_profile(self, obj):
        user_profile = UserProfile.objects.get(user=obj.user)
        serializer = UserProfileStubSerializer(user_profile)
        return serializer.data


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
            return {"city": obj.location.city, "country": obj.location.country}
        else:
            if obj.location is None:
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
        return get_organization_short_description(obj, get_language())

    def get_about(self, obj):
        return get_organization_about_section(obj, get_language())

    def get_organ(self, obj):
        return obj.organ

    def get_school(self, obj):
        return obj.school

    def get_name(self, obj):
        return get_organization_name(obj, get_language())

    # Override the get_sectors method to use the hub-specific sectors
    def get_sectors(self, obj):
        serializer = OrganizationSectorMappingSerializer(
            obj.organization_sector_mapping.all(), many=True
        )
        return serializer.data

    class Meta(OrganizationSerializer.Meta):
        fields = OrganizationSerializer.Meta.fields + ("location", "translations")


class OrganizationCardSerializer(serializers.ModelSerializer):
    sectors = serializers.SerializerMethodField()
    types = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    projects_count = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()
    short_description = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = (
            "id",
            "name",
            "url_slug",
            "thumbnail_image",
            "location",
            "types",
            "sectors",
            "short_description",
            "members_count",
            "projects_count",
        )

    def get_name(self, obj):
        return get_organization_name(obj, get_language())

    def get_location(self, obj):
        if obj.location is None:
            return None
        return obj.location.name

    def get_short_description(self, obj):
        return get_organization_short_description(obj, get_language())

    def get_types(self, obj):
        serializer = OrganizationTaggingSerializer(obj.tag_organization, many=True)
        return serializer.data

    def get_sectors(self, obj):
        hub = self.context.get("hub")

        sector_mappings = get_sectors_based_on_hub(
            obj.organization_sector_mapping.all(), hub
        )

        serializer = OrganizationSectorMappingSerializer(sector_mappings, many=True)
        return serializer.data

    def get_members_count(self, obj):
        return OrganizationMember.objects.filter(organization=obj.id).count()

    def get_projects_count(self, obj):
        return ProjectParents.objects.filter(
            parent_organization__id=obj.id, project__is_draft=False
        ).count()


class OrganizationMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationMember
        fields = ("id", "user", "role", "role_in_organization", "organization")

    def to_representation(self, instance):
        user_profile = (
            None
            if not instance.user.user_profile
            else UserProfileStubSerializer(instance.user.user_profile).data
        )
        permission = RoleSerializer(instance.role).data
        return {
            "id": instance.id,
            "user": user_profile,
            "permission": permission,
            "organization": instance.organization.name,
            "time_per_week": (
                None if not instance.time_per_week else instance.time_per_week.name
            ),
            "role_in_organization": instance.role_in_organization,
        }


class UserOrganizationSerializer(serializers.ModelSerializer):
    organization = serializers.SerializerMethodField()

    class Meta:
        model = OrganizationMember
        fields = ("organization",)

    def get_organization(self, obj):
        return OrganizationStubSerializer(
            obj.organization, context={"language_code": self.context["language_code"]}
        ).data


class OrganizationsFromOrganizationMember(serializers.ModelSerializer):
    organization = serializers.SerializerMethodField()

    class Meta:
        model = OrganizationMember
        fields = ("organization",)

    def get_organization(self, obj):
        return OrganizationCardSerializer(obj.organization).data


class OrganizationSitemapEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ("url_slug", "updated_at")


class OrganizationNotificationSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = ("name", "url_slug")

    def get_name(self, obj):
        return get_organization_name(obj, get_language())

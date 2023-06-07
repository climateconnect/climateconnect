import logging
from organization.utility.follow import (
    check_if_user_follows_organization,
    get_list_of_organization_followers,
    set_user_following_organization,
)

# Backend app imports
from climateconnect_api.models import Role, UserProfile
from climateconnect_api.models.language import Language
from climateconnect_api.pagination import MembersPagination
from climateconnect_api.utility.translation import (
    edit_translations,
    get_translations,
)
from climateconnect_api.utility.content_shares import save_content_shared
from climateconnect_main.utility.general import get_image_from_data_url
from climateconnect_api.utility.common import create_unique_slug


# Django imports
from django.contrib.auth.models import User
from django.contrib.gis.db.models.functions import Distance
from django.db.models import Q, Prefetch
from django.utils.translation import gettext as _
from django_filters.rest_framework import DjangoFilterBackend
from hubs.models.hub import Hub
from location.utility import get_location, get_location_with_range
from organization.models import (
    Organization,
    OrganizationMember,
    OrganizationTagging,
    OrganizationTags,
    ProjectParents,
)
from organization.models.tags import ProjectTags
from organization.models.translations import OrganizationTranslation
from organization.pagination import OrganizationsPagination, ProjectsPagination
from organization.permissions import (
    AddOrganizationMemberPermission,
    ChangeOrganizationCreatorPermission,
    OrganizationMemberReadWritePermission,
    OrganizationReadWritePermission,
)
from organization.serializers.organization import (
    EditOrganizationSerializer,
    OrganizationCardSerializer,
    OrganizationMemberSerializer,
    OrganizationSerializer,
    OrganizationSitemapEntrySerializer,
    UserOrganizationSerializer,
    OrganizationFollowerSerializer,
)
from organization.serializers.project import ProjectFromProjectParentsSerializer
from organization.serializers.tags import OrganizationTagsSerializer
from organization.utility.organization import (
    check_create_existing_name,
    check_edit_exisiting_name,
    check_existing_name,
    check_existing_name_translation,
    create_organization_translation,
    get_existing_name_message,
    is_valid_organization_size,
)
from rest_framework import status
from rest_framework.filters import SearchFilter
from rest_framework.generics import (
    ListAPIView,
    RetrieveUpdateDestroyAPIView,
)

# REST imports
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound


logger = logging.getLogger(__name__)


class ListOrganizationFollowersView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationFollowerSerializer

    def get_queryset(self):
        return get_list_of_organization_followers(self)


class IsUserFollowing(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, url_slug):
        return check_if_user_follows_organization(request.user, url_slug)


class SetFollowView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, url_slug):
        # probably a better way -> .mo / po files todo

        return set_user_following_organization(request, url_slug)


class ListOrganizationsAPIView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter, DjangoFilterBackend]
    pagination_class = OrganizationsPagination
    search_fields = ["name"]

    def get_serializer_class(self):
        return OrganizationCardSerializer

    def get_serializer_context(self):
        return {"language_code": self.request.LANGUAGE_CODE}

    def get_queryset(self):
        organizations = (
            Organization.objects.all()
            .prefetch_related(
                Prefetch(
                    "tag_organization",
                    queryset=OrganizationTagging.objects.select_related(
                        "organization_tag"
                    ),
                ),
                "organization_member",
            )
            .select_related("language", "location")
        )

        if "hub" in self.request.query_params:
            hub = Hub.objects.filter(url_slug=self.request.query_params["hub"])
            if hub.exists():
                if hub.first().hub_type == Hub.SECTOR_HUB_TYPE:
                    project_category = hub.first().filter_parent_tags.all()
                    project_category_ids = list(map(lambda c: c.id, project_category))
                    project_tags = ProjectTags.objects.filter(
                        id__in=project_category_ids
                    )
                    project_tags_with_children = ProjectTags.objects.filter(
                        Q(parent_tag__in=project_tags) | Q(id__in=project_tags)
                    )
                    organizations = organizations.filter(
                        Q(
                            project_parent_org__project__tag_project__project_tag__in=project_tags_with_children
                        )
                        | Q(
                            field_tag_organization__field_tag__in=project_tags_with_children
                        )
                    ).distinct()
                elif hub.first().hub_type == Hub.LOCATION_HUB_TYPE:
                    location = hub.first().location.first()
                    organizations = organizations.filter(
                        Q(location__country=location.country)
                        & (
                            Q(
                                location__multi_polygon__coveredby=(
                                    location.multi_polygon
                                )
                            )
                            | Q(
                                location__centre_point__coveredby=(
                                    location.multi_polygon
                                )
                            )
                        )
                    ).annotate(
                        distance=Distance(
                            "location__centre_point", location.multi_polygon
                        )
                    )

        if "organization_type" in self.request.query_params:
            organization_type_names = self.request.query_params.get(
                "organization_type"
            ).split(",")
            organization_types = OrganizationTags.objects.filter(
                name__in=organization_type_names
            )
            organization_taggings = OrganizationTagging.objects.filter(
                organization_tag__in=organization_types
            )
            organizations = organizations.filter(
                tag_organization__in=organization_taggings
            ).distinct()

        if "place" in self.request.query_params and "osm" in self.request.query_params:
            location_data = get_location_with_range(self.request.query_params)
            organizations = (
                organizations.filter(
                    Q(location__country=location_data["country"])
                    & (
                        Q(
                            location__multi_polygon__distance_lte=(
                                location_data["location"],
                                location_data["radius"],
                            )
                        )
                        | Q(
                            location__centre_point__distance_lte=(
                                location_data["location"],
                                location_data["radius"],
                            )
                        )
                    )
                )
                .annotate(
                    distance=Distance(
                        "location__centre_point", location_data["location"]
                    )
                )
                .order_by("distance")
            )

        if "country" and "city" in self.request.query_params:
            organizations = organizations.filter(
                location__country=self.request.query_params.get("country"),
                location__city=self.request.query_params.get("city"),
            )

        if (
            "city" in self.request.query_params
            and "country" not in self.request.query_params
        ):
            organizations = organizations.filter(
                location__city=self.request.query_params.get("city")
            )

        if (
            "country" in self.request.query_params
            and "city" not in self.request.query_params
        ):
            organizations = organizations.filter(
                location__country=self.request.query_params.get("country")
            )

        return organizations


class CreateOrganizationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        required_params = [
            "name",
            "team_members",
            "location",
            "image",
            "organization_tags",
            "translations",
            "source_language",
            "short_description",
        ]
        for param in required_params:
            if param not in request.data:
                return Response(
                    {"message": "Required parameter missing: {}".format(param)},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if check_create_existing_name(request.data["name"]):
            message = get_existing_name_message(request.data["name"])
            existing_org = Organization.objects.get(name__iexact=request.data["name"])
            return Response(
                {
                    "message": message,
                    "url_slug": existing_org.url_slug,
                    "existing_name": existing_org.name,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        texts = {
            "name": request.data["name"].strip()
        }  # remove leading and trailing spaces

        if "short_description" in request.data:
            texts["short_description"] = request.data["short_description"]
        if "about" in request.data:
            texts["about"] = request.data["about"]
        if "get_involved" in request.data:
            texts["get_involved"] = request.data["get_involved"]
        try:
            translations = get_translations(
                texts,
                request.data["translations"],
                request.data["source_language"],
                ["name"],
            )
        except ValueError as ve:
            translations = None
            logger.error("TranslationFailed: Error translating texts, {}".format(ve))
        organization, created = Organization.objects.get_or_create(
            name=request.data["name"].strip()  ## remove leading and trailing spaces
        )
        if created:
            organization.url_slug = create_unique_slug(
                organization.name, organization.id, Organization.objects
            )
            # Add primary language to organization table.
            source_language = Language.objects.get(
                language_code=request.data["source_language"]
            )
            organization.language = source_language

            if "image" in request.data:
                organization.image = get_image_from_data_url(request.data["image"])[0]
            if "thumbnail_image" in request.data:
                organization.thumbnail_image = get_image_from_data_url(
                    request.data["thumbnail_image"]
                )[0]
            if "background_image" in request.data:
                organization.background_image = get_image_from_data_url(
                    request.data["background_image"]
                )[0]

            if "parent_organization" in request.data:
                try:
                    parent_org = Organization.objects.get(
                        id=int(request.data["parent_organization"])
                    )
                except Organization.DoesNotExist:
                    return Response(
                        {"message": "Parent organization not found."},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                organization.parent_organization = parent_org

            # Get accurate location from google maps.
            if "location" in request.data:
                organization.location = get_location(request.data["location"])
            if "short_description" in request.data:
                organization.short_description = request.data["short_description"]
            if "about" in request.data:
                organization.about = request.data["about"]
            if "website" in request.data:
                organization.website = request.data["website"]
            if "organization_size" in request.data and is_valid_organization_size(
                request.data["organization_size"]
            ):
                organization.organization_size = request.data["organization_size"]
            if "get_involved" in request.data:
                organization.get_involved = request.data["get_involved"]
            if "hubs" in request.data:
                hubs = []
                for hub_url_slug in request.data["hubs"]:
                    try:
                        hub = Hub.objects.get(url_slug=hub_url_slug)
                        hubs.append(hub)
                    except Hub.DoesNotExist:
                        logger.error("Passed hub url_slug {} does not exists")
                organization.hubs.set(hubs)
            organization.save()
            # Create organization translation
            if translations:
                for key in translations["translations"]:
                    if not key == "is_manual_translation":
                        language_code = key
                        texts = translations["translations"][language_code]
                        language = Language.objects.get(language_code=language_code)
                        if language_code in request.data["translations"]:
                            is_manual_translation = request.data["translations"][
                                language_code
                            ]["is_manual_translation"]
                        else:
                            is_manual_translation = False
                        create_organization_translation(
                            organization, language, texts, is_manual_translation
                        )
            roles = Role.objects.all()
            for member in request.data["team_members"]:
                user_role = roles.filter(id=int(member["permission_type_id"])).first()
                try:
                    user = User.objects.get(id=int(member["user_id"]))
                except User.DoesNotExist:
                    logger.error(
                        "Passed user id {} does not exists".format(member["user_id"])
                    )
                    continue

                if user:
                    OrganizationMember.objects.create(
                        user=user, organization=organization, role=user_role
                    )
                    logger.info("Organization member created {}".format(user.id))

            if "organization_tags" in request.data:
                for organization_tag in request.data["organization_tags"]:
                    try:
                        organization_tag = OrganizationTags.objects.get(
                            id=int(organization_tag["key"])
                        )
                    except OrganizationTags.DoesNotExist:
                        logger.error(
                            "Passed organization tag ID {} does not exists".format(
                                organization_tag
                            )
                        )
                        continue
                    if organization_tag:
                        OrganizationTagging.objects.create(
                            organization=organization, organization_tag=organization_tag
                        )
                        logger.info(
                            "Organization tagging created for organization {}".format(
                                organization.id
                            )
                        )

            return Response(
                {
                    "message": "Organization {} successfully created".format(
                        organization.name
                    ),
                    "url_slug": organization.url_slug,
                },
                status=status.HTTP_201_CREATED,
            )


class LookUpOrganizationAPIView(APIView):
    def get(self, *args, **kwargs):
        query = self.request.query_params.get("search")
        message = get_existing_name_message(query)
        if check_existing_name(query):
            organization = Organization.objects.filter(name__iexact=query)
            return Response(
                {
                    "message": message,
                    "url": organization[0].url_slug,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if check_existing_name_translation(query):
            organization_translation = OrganizationTranslation.objects.filter(
                name_translation__iexact=query
            )
            return Response(
                {
                    "message": message,
                    "url": organization_translation[0].organization.url_slug,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_200_OK)


class OrganizationAPIView(APIView):
    permission_classes = [OrganizationReadWritePermission]
    lookup_field = "url_slug"

    def get(self, request, url_slug, format=None):
        try:
            organization = Organization.objects.get(url_slug=str(url_slug))
        except Organization.DoesNotExist:
            return Response(
                {"message": _("Organization not found:") + url_slug},
                status=status.HTTP_404_NOT_FOUND,
            )
        if "edit_view" in request.query_params:
            serializer = EditOrganizationSerializer(
                organization,
                many=False,
                context={"language_code": request.LANGUAGE_CODE},
            )
        else:
            serializer = OrganizationSerializer(
                organization,
                many=False,
                context={"language_code": request.LANGUAGE_CODE},
            )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, url_slug, format=None):
        try:
            organization = Organization.objects.get(url_slug=str(url_slug))
        except Organization.DoesNotExist:
            return Response(
                {"message": _("Organization not found:") + url_slug},
                status=status.HTTP_404_NOT_FOUND,
            )
        pass_through_params = [
            "name",
            "short_description",
            "about",
            "school",
            "organ",
            "website",
            "organization_size",
            "get_involved",
        ]
        if "name" in request.data:
            if check_edit_exisiting_name(organization, request.data["name"]):
                message = get_existing_name_message(request.data["name"])
                existing_org = Organization.objects.get(
                    name__iexact=request.data["name"]
                )
                return Response(
                    {
                        "message": message,
                        "url_slug": existing_org.url_slug,
                        "existing_name": existing_org.name,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        for param in pass_through_params:
            if param in request.data:
                setattr(organization, param, request.data[param])
        if "location" in request.data:
            organization.location = get_location(request.data["location"])
        if "language" in request.data:
            language = Language.objects.filter(language_code=request.data["language"])
            if language.exists():
                organization.language = language[0]
        if "image" in request.data:
            organization.image = get_image_from_data_url(request.data["image"])[0]
        if "thumbnail_image" in request.data:
            organization.thumbnail_image = get_image_from_data_url(
                request.data["thumbnail_image"]
            )[0]
        if "background_image" in request.data:
            if request.data["background_image"] is not None:
                organization.background_image = get_image_from_data_url(
                    request.data["background_image"]
                )[0]

            elif request.data["background_image"] is None:
                organization.background_image = None

        if "hubs" in request.data:
            for hub in organization.hubs.all():
                if hub.url_slug not in request.data["hubs"]:
                    organization.hubs.remove(hub)
            for hub_url_slug in request.data["hubs"]:
                try:
                    hub = Hub.objects.get(url_slug=hub_url_slug)
                    organization.hubs.add(hub)
                except Hub.DoesNotExist:
                    logger.error("Passed hub url_slug {} does not exists")
        if "parent_organization" in request.data:
            if (
                "has_parent_organization" in request.data
                and request.data["has_parent_organization"] is False
            ):
                organization.parent_organization = None
            else:
                try:
                    parent_organization = Organization.objects.get(
                        id=request.data["parent_organization"]
                    )
                except Organization.DoesNotExist:
                    return Response(
                        {
                            "message": _(
                                "Parent organization not found for organization"
                            )
                            + url_slug
                        },
                        status=status.HTTP_404_NOT_FOUND,
                    )
                organization.parent_organization = parent_organization

        items_to_translate = [
            {"key": "name", "translation_key": "name_translation"},
            {
                "key": "short_description",
                "translation_key": "short_description_translation",
            },
            {"key": "about", "translation_key": "about_translation"},
            {"key": "school", "translation_key": "school_translation"},
            {"key": "organ", "translation_key": "organ_translation"},
            {"key": "get_involved", "translation_key": "get_involved_translation"},
        ]

        edit_translations(
            items_to_translate, request.data, organization, "organization"
        )

        old_organization_taggings = OrganizationTagging.objects.filter(
            organization=organization
        ).values("organization_tag")
        if "types" in request.data:
            for tag in old_organization_taggings:
                if tag["organization_tag"] not in request.data["types"]:
                    tag_to_delete = OrganizationTags.objects.get(
                        id=tag["organization_tag"]
                    )
                    OrganizationTagging.objects.filter(
                        organization=organization, organization_tag=tag_to_delete
                    ).delete()
            for tag in request.data["types"]:
                if not old_organization_taggings.filter(
                    organization_tag=tag["key"]
                ).exists():
                    try:
                        tag = OrganizationTags.objects.get(id=tag["key"])
                        OrganizationTagging.objects.create(
                            organization_tag=tag, organization=organization
                        )
                    except OrganizationTags.DoesNotExist:
                        logger.error(
                            _("Passed organization tag id does not exists: ")
                            + tag["key"]
                        )

        organization.save()
        return Response(
            {"message": _("Successfully updated organization.")},
            status=status.HTTP_200_OK,
        )


class UpdateOrganizationMemberView(RetrieveUpdateDestroyAPIView):
    permission_classes = [OrganizationMemberReadWritePermission]
    serializer_class = OrganizationMemberSerializer

    def get_queryset(self):
        organization = Organization.objects.get(url_slug=str(self.kwargs["url_slug"]))
        return OrganizationMember.objects.filter(
            id=int(self.kwargs["pk"]), organization=organization
        )

    def perform_destroy(self, instance):
        instance.delete()
        return "Organization Member successfully deleted."

    def perform_update(self, serializer):
        serializer.save()
        return serializer.data


class AddOrganizationMembersView(APIView):
    permission_classes = [AddOrganizationMemberPermission]

    def post(self, request, url_slug):
        organization = Organization.objects.get(url_slug=url_slug)

        roles = Role.objects.all()
        if "organization_members" not in request.data:
            return Response(
                {"message": "Missing required parameters"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for member in request.data["organization_members"]:
            try:
                user = User.objects.get(id=int(member["id"]))
            except User.DoesNotExist:
                logger.error(
                    "[AddOrganizationMembersView] Passed user id {} does not exists".format(
                        int(member["id"])
                    )
                )
                continue
            if "permission_type_id" not in member:
                logger.error(
                    "[AddOrganizationMembersView] Not permissions passed for user id {}.".format(
                        int(member["id"])
                    )
                )
                continue
            user_role = roles.filter(id=int(member["permission_type_id"])).first()
            if user:
                OrganizationMember.objects.create(
                    organization=organization,
                    user=user,
                    role=user_role,
                    role_in_organization=member["role_in_organization"],
                )

                logger.info("Organization member created for user {}".format(user.id))

        return Response(
            {"message": "Member added to the organization"},
            status=status.HTTP_201_CREATED,
        )


class ChangeOrganizationCreator(APIView):
    permission_classes = [ChangeOrganizationCreatorPermission]

    def post(self, request, url_slug):
        if "user" not in request.data:
            return Response(
                {"message": "Missing required parameters"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            new_creator_user = User.objects.get(id=int(request.data["user"]))
        except User.DoesNotExist:
            raise NotFound(detail="Profile not found.", code=status.HTTP_404_NOT_FOUND)

        if request.user.id == new_creator_user.id:
            return Response(
                {"message": "Missing required parameters"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        organization = Organization.objects.get(url_slug=url_slug)
        roles = Role.objects.all()
        if OrganizationMember.objects.filter(
            user=new_creator_user, organization=organization
        ).exists():
            # update old creator profile and new creator profile
            new_creator = OrganizationMember.objects.filter(
                user=request.data["user"],
                organization=organization,
                id=request.data["id"],
            )[0]
            new_creator.role = roles.filter(role_type=Role.ALL_TYPE)[0]
            if "role_in_organization" in request.data:
                new_creator.role_in_organization = request.data["role_in_organization"]
            new_creator.save()
        else:
            # create new creator profile and update old creator profile
            new_creator = OrganizationMember.objects.create(
                role=roles.filter(role_type=Role.ALL_TYPE)[0],
                organization=organization,
                user=new_creator_user,
            )
            if "role_in_organization" in request.data:
                new_creator.role_in_organization = request.data["role_in_organization"]
            new_creator.save()
        old_creator = OrganizationMember.objects.filter(
            user=request.user,
            organization=organization,
        )[0]
        old_creator.role = roles.filter(role_type=Role.READ_WRITE_TYPE)[0]
        old_creator.save()

        return Response(
            {"message": "Changed organization creator"}, status=status.HTTP_200_OK
        )


class PersonalOrganizationsView(ListAPIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        if not UserProfile.objects.filter(user=request.user).exists():
            raise NotFound(detail="Profile not found.", code=status.HTTP_404_NOT_FOUND)
        user_organization_members = OrganizationMember.objects.filter(user=request.user)
        serializer = UserOrganizationSerializer(
            user_organization_members,
            many=True,
            context={"language_code": request.LANGUAGE_CODE},
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


class ListOrganizationProjectsAPIView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ["parent_organization__url_slug"]
    pagination_class = ProjectsPagination
    serializer_class = ProjectFromProjectParentsSerializer

    def get_queryset(self):
        return ProjectParents.objects.filter(
            parent_organization__url_slug=self.kwargs["url_slug"],
            project__is_draft=False,
        ).order_by("id")


class ListOrganizationMembersAPIView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ["organization__url_slug"]
    serializer_class = OrganizationMemberSerializer
    pagination_class = MembersPagination

    def get_queryset(self):
        return OrganizationMember.objects.filter(
            organization__url_slug=self.kwargs["url_slug"],
        ).order_by("id")


class ListOrganizationTags(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = OrganizationTagsSerializer

    def get_queryset(self):
        return OrganizationTags.objects.all()


class ListFeaturedOrganizations(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = OrganizationCardSerializer

    def get_serializer_context(self):
        return {"language_code": self.request.LANGUAGE_CODE}

    def get_queryset(self):
        return Organization.objects.filter(rating__lte=99)[0:4]


class ListOrganizationsForSitemap(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = OrganizationSitemapEntrySerializer

    def get_queryset(self):
        return Organization.objects.all()


class SetOrganisationSharedView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, url_slug):
        try:
            organization = Organization.objects.get(url_slug=url_slug)
        except Organization.DoesNotExist:
            raise NotFound(
                detail="Organization not found.", code=status.HTTP_404_NOT_FOUND
            )
        save_content_shared(request, organization)
        return Response(status=status.HTTP_201_CREATED)

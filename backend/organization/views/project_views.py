import logging
import traceback
from organization.utility.follow import (
    get_list_of_project_followers,
    set_user_following_project,
)
from organization.serializers.project import ProjectRequesterSerializer

from climateconnect_api.models import (
    Availability,
    Role,
    Skill,
    UserProfile,
)
from climateconnect_api.models.language import Language
from climateconnect_api.utility.translation import (
    edit_translations,
)
from climateconnect_api.utility.content_shares import save_content_shared
from climateconnect_main.utility.general import get_image_from_data_url

from dateutil.parser import parse

from django.contrib.auth.models import User
from django.contrib.gis.db.models.functions import Distance
from django.db import transaction
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend, OrderingFilter

from hubs.models.hub import Hub
from location.models import Location
from location.utility import get_location, get_location_with_range

# Organization models
from organization.models import (
    Organization,
    OrganizationTagging,
    OrganizationTags,
    Post,
    Project,
    ProjectCollaborators,
    ProjectComment,
    ProjectFollower,
    ProjectMember,
    ProjectParents,
    ProjectStatus,
    ProjectTagging,
    ProjectTags,
    ProjectLike,
    OrganizationFollower,
)

from organization.models.type import PROJECT_TYPES
from organization.serializers.status import ProjectTypesSerializer

from organization.models.members import MembershipRequests
from organization.models.translations import ProjectTranslation

from organization.pagination import (
    MembersPagination,
    ProjectPostPagination,
    ProjectsPagination,
    ProjectsSitemapPagination,
)
from organization.permissions import (
    AddProjectMemberPermission,
    ChangeProjectCreatorPermission,
    ProjectMemberReadWritePermission,
    ProjectReadWritePermission,
    ReadWriteSensibleProjectDataPermission,
)
from organization.serializers.content import PostSerializer, ProjectCommentSerializer
from organization.serializers.project import (
    EditProjectSerializer,
    InsertProjectMemberSerializer,
    ProjectFollowerSerializer,
    ProjectMemberSerializer,
    ProjectSerializer,
    ProjectSitemapEntrySerializer,
    ProjectStubSerializer,
    ProjectLikeSerializer,
)
from organization.serializers.status import ProjectStatusSerializer
from organization.serializers.tags import ProjectTagsSerializer
from organization.utility.notification import (
    create_comment_mention_notification,
    create_organization_project_published_notification,
    create_project_comment_notification,
    create_project_comment_reply_notification,
    create_project_join_request_approval_notification,
    create_project_join_request_notification,
    create_project_like_notification,
    get_mentions,
)

from organization.utility.organization import check_organization
from organization.utility.project import (
    create_new_project,
    get_project_translations,
    get_project_admin_creators,
    get_similar_projects,
)
from rest_framework import status
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.filters import SearchFilter
from rest_framework.generics import (
    ListAPIView,
    RetrieveUpdateAPIView,
    RetrieveUpdateDestroyAPIView,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from organization.utility.requests import MembershipRequestsManager
from organization.utility import MembershipTarget
from organization.models.type import ProjectTypesChoices

logger = logging.getLogger(__name__)


class ProjectsOrderingFilter(OrderingFilter):
    def filter_queryset(self, request, queryset, view):
        ordering = request.query_params.get("sort_by")
        if ordering is not None:
            if ordering == "newest":
                queryset = queryset.order_by("-id")
            elif ordering == "oldest":
                queryset = queryset.order_by("id")
        return queryset


class ListProjectsView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter, DjangoFilterBackend, ProjectsOrderingFilter]
    search_fields = ["name", "translation_project__name_translation"]
    filterset_fields = ["collaborators_welcome"]
    pagination_class = ProjectsPagination
    serializer_class = ProjectStubSerializer

    def get_queryset(self):
        projects = Project.objects.filter(is_draft=False, is_active=True)
        if "hub" in self.request.query_params:
            hub = Hub.objects.filter(url_slug=self.request.query_params["hub"])
            if hub.exists():
                if hub[0].hub_type == Hub.SECTOR_HUB_TYPE:
                    project_category = Hub.objects.get(
                        url_slug=self.request.query_params.get("hub")
                    ).filter_parent_tags.all()
                    project_category_ids = list(map(lambda c: c.id, project_category))
                    project_tags = ProjectTags.objects.filter(
                        id__in=project_category_ids
                    )
                    project_tags_with_children = ProjectTags.objects.filter(
                        Q(parent_tag__in=project_tags) | Q(id__in=project_tags)
                    )
                    projects = projects.filter(
                        tag_project__project_tag__in=project_tags_with_children
                    ).distinct()
                elif hub[0].hub_type == Hub.LOCATION_HUB_TYPE:
                    location = hub[0].location.all()[0]
                    projects = projects.filter(
                        Q(loc__country=location.country)
                        & (
                            Q(loc__multi_polygon__coveredby=(location.multi_polygon))
                            | Q(loc__centre_point__coveredby=(location.multi_polygon))
                        )
                    ).annotate(
                        distance=Distance("loc__centre_point", location.multi_polygon)
                    )

        if "collaboration" in self.request.query_params:
            collaborators_welcome = self.request.query_params.get("collaboration")
            if collaborators_welcome == "yes":
                projects = projects.filter(collaborators_welcome=True)
            if collaborators_welcome == "no":
                projects = projects.filter(collaborators_welcome=False)

        if "category" in self.request.query_params:
            project_category = self.request.query_params.get("category").split(",")
            project_tags = ProjectTags.objects.filter(name__in=project_category)
            # Use .distinct to dedupe selected rows.
            # https://docs.djangoproject.com/en/dev/ref/models/querysets/#django.db.models.query.QuerySet.distinct
            # We then sort by rating, to show most relevant results
            projects = projects.filter(
                tag_project__project_tag__in=project_tags, is_active=True
            ).distinct()

        if "status" in self.request.query_params:
            statuses = self.request.query_params.get("status").split(",")
            projects = projects.filter(status__name__in=statuses)

        if "skills" in self.request.query_params:
            skill_names = self.request.query_params.get("skills").split(",")
            skills = Skill.objects.filter(name__in=skill_names)
            # Use .distinct to dedupe selected rows.
            # https://docs.djangoproject.com/en/dev/ref/models/querysets/#django.db.models.query.QuerySet.distinct
            # We then sort by rating, to show most relevant results
            projects = projects.filter(skills__in=skills).distinct()

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
            project_parents = ProjectParents.objects.filter(
                parent_organization__tag_organization__in=organization_taggings
            )
            projects = projects.filter(project_parent__in=project_parents)

        if "place" in self.request.query_params and "osm" in self.request.query_params:
            location_data = get_location_with_range(self.request.query_params)
            projects = (
                projects.filter(
                    Q(loc__country=location_data["country"])
                    & (
                        Q(
                            loc__multi_polygon__distance_lte=(
                                location_data["location"],
                                location_data["radius"],
                            )
                        )
                        | Q(
                            loc__centre_point__distance_lte=(
                                location_data["location"],
                                location_data["radius"],
                            )
                        )
                    )
                )
                .annotate(
                    distance=Distance("loc__centre_point", location_data["location"])
                )
                .order_by("distance")
            )

        if "country" and "city" in self.request.query_params:
            location_ids = Location.objects.filter(
                country=self.request.query_params.get("country"),
                city=self.request.query_params.get("city"),
            )
            projects = projects.filter(loc__in=location_ids)

        if (
            "city" in self.request.query_params
            and "country" not in self.request.query_params
        ):
            location_ids = Location.objects.filter(
                city=self.request.query_params.get("city")
            )
            projects = projects.filter(loc__in=location_ids)

        if (
            "country" in self.request.query_params
            and "city" not in self.request.query_params
        ):
            location_ids = Location.objects.filter(
                country=self.request.query_params.get("country")
            )
            projects = projects.filter(loc__in=location_ids)
        return projects


class CreateProjectView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic()
    def post(self, request):
        if "parent_organization" in request.data:
            organization = check_organization(int(request.data["parent_organization"]))
        else:
            organization = None

        required_params = [
            "name",
            "status",
            "short_description",
            "collaborators_welcome",
            "team_members",
            "project_tags",
            "loc",
            "image",
            "source_language",
            "translations",
        ]
        for param in required_params:
            if param not in request.data:
                logger.error(
                    "Missing required information to create project:{}".format(param)
                )
                return Response(
                    {
                        "message": "Missing required information to create project:"
                        + param
                        + " Please contact administrator"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        try:
            ProjectStatus.objects.get(id=int(request.data["status"]))
        except ProjectStatus.DoesNotExist:
            return Response(
                {
                    "message": "Passed status {} does not exist".format(
                        request.data["status"]
                    )
                }
            )
        translations_failed = False

        translations_object = None
        try:
            translations_object = get_project_translations(request.data)
        except ValueError:
            translations_failed = True

        # If we still don't have a translations object, then skip this
        if not translations_object:
            translations_failed = True

        source_language = None
        translations = None
        if translations_object:
            source_language = Language.objects.get(
                language_code=translations_object["source_language"]
            )
            translations = translations_object["translations"]

        project = create_new_project(request.data, source_language)

        if not translations_failed:
            for language in translations:
                if not language == source_language.language_code:
                    texts = translations[language]
                    try:
                        language_object = Language.objects.get(language_code=language)
                        translation = ProjectTranslation.objects.create(
                            project=project,
                            language=language_object,
                            name_translation=texts["name"],
                            short_description_translation=texts["short_description"],
                        )
                        if "description" in texts:
                            translation.description_translation = texts["description"]
                        if "helpful_connections" in texts:
                            translation.helpful_connections_translation = texts[
                                "helpful_connections"
                            ]
                        translation.save()
                    except Language.DoesNotExist:
                        logger.error(
                            "A language with language_code {} does not exist".format(
                                language
                            )
                        )

        project_parents = ProjectParents.objects.create(
            project=project, parent_user=request.user
        )

        if organization:
            project_parents.parent_organization = organization
            project_parents.save()

        if "collaborating_organizations" in request.data:
            for organization_id in request.data["collaborating_organizations"]:
                try:
                    collaborating_organization = Organization.objects.get(
                        id=int(organization_id)
                    )
                    ProjectCollaborators.objects.create(
                        project=project,
                        collaborating_organization=collaborating_organization,
                    )
                except Organization.DoesNotExist:
                    logger.error(
                        "Passed collaborating organization id {} does not exist.".format(
                            organization_id
                        )
                    )

        # There are only certain roles user can have. So get all the roles first.
        roles = Role.objects.all()
        team_members = request.data["team_members"]

        if "project_tags" in request.data:
            order = len(request.data["project_tags"])
            for project_tag_id in request.data["project_tags"]:
                try:
                    project_tag = ProjectTags.objects.get(id=int(project_tag_id))
                except ProjectTags.DoesNotExist:
                    logger.error(
                        "Passed project tag ID {} does not exists".format(
                            project_tag_id
                        )
                    )
                    continue
                if project_tag:
                    ProjectTagging.objects.create(
                        project=project, project_tag=project_tag, order=order
                    )
                    order = order - 1
                    logger.info(
                        "Project tagging created for project {}".format(project.id)
                    )

        #TODO: completely remove availability
        for member in team_members:
            user_role = roles.filter(id=int(member["role"])).first()
            try:
                user_availability = None
                if "availability" in member.keys():
                    user_availability = Availability.objects.filter(
                        id=int(member["availability"])
                    ).first()
            except Availability.DoesNotExist:
                raise NotFound(
                    detail="Availability not found.", code=status.HTTP_404_NOT_FOUND
                )
            try:
                user = User.objects.get(id=int(member["id"]))
            except User.DoesNotExist:
                for user in User.objects.all():
                    logger.error(user.id)
                logger.error(
                    "[CreateProjectView]Passed user id {} does not exists".format(
                        int(member["id"])
                    )
                )
                continue
            if user:
                ProjectMember.objects.create(
                    project=project,
                    user=user,
                    role=user_role,
                    availability=user_availability,
                    role_in_project=member["role_in_project"],
                )
                logger.info("Project member created for user {}".format(user.id))
        # handle new project from org creation
        if organization is not None:
            followers_of_org = OrganizationFollower.objects.filter(
                organization__name=organization.name
            )

            create_organization_project_published_notification(
                followers_of_org, organization, project
            )

        return Response(
            {
                "message": "Project {} successfully created".format(project.name),
                "url_slug": project.url_slug,
            },
            status=status.HTTP_201_CREATED,
        )


class ProjectAPIView(APIView):
    permission_classes = [ProjectReadWritePermission]

    def get(self, request, url_slug, format=None):
        try:
            project = Project.objects.get(url_slug=str(url_slug))
        except Project.DoesNotExist:
            return Response(
                {"message": "Project not found: {}".format(url_slug)},
                status=status.HTTP_404_NOT_FOUND,
            )
        if "edit_view" in request.query_params:
            serializer = EditProjectSerializer(project, many=False)
        else:
            serializer = ProjectSerializer(project, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, url_slug, format=None):
        try:
            project = Project.objects.get(url_slug=url_slug)
        except Project.DoesNotExist:
            return Response(
                {"message": "Project not found: {}".format(url_slug)},
                status=status.HTTP_404_NOT_FOUND,
            )
        # Author: Dip
        # Code formatting here. So fields are just pass through so combing them and using setattr method insted.
        pass_through_params = [
            "collaborators_welcome",
            "additional_loc_info",
            "description",
            "helpful_connections",
            "short_description",
            "website",
        ]
        for param in pass_through_params:
            if param in request.data:
                setattr(project, param, request.data[param])

        if "name" in request.data and request.data["name"] != project.name:
            project.name = request.data["name"]

        if "project_type" in request.data:
            project.project_type = ProjectTypesChoices[request.data["project_type"]]

        if "skills" in request.data:
            for skill in project.skills.all():
                if skill.id not in request.data["skills"]:
                    logger.error("this skill needs to be deleted: " + skill.name)
                    project.skills.remove(skill)
            for skill_id in request.data["skills"]:
                try:
                    skill = Skill.objects.get(id=skill_id)
                    project.skills.add(skill)
                except Skill.DoesNotExist:
                    logger.error("Passed skill id {} does not exists")

        old_project_taggings = ProjectTagging.objects.filter(project=project)
        old_project_tags = old_project_taggings.values("project_tag")
        if "project_tags" in request.data:
            order = len(request.data["project_tags"])
            for tag in old_project_tags:
                if tag["project_tag"] not in request.data["project_tags"]:
                    tag_to_delete = ProjectTags.objects.get(id=tag["project_tag"])
                    ProjectTagging.objects.filter(
                        project=project, project_tag=tag_to_delete
                    ).delete()
            for tag_id in request.data["project_tags"]:
                old_taggings = old_project_taggings.filter(project_tag=tag_id)
                if not old_taggings.exists():
                    try:
                        tag = ProjectTags.objects.get(id=tag_id)
                        ProjectTagging.objects.create(
                            project_tag=tag, project=project, order=order
                        )
                    except ProjectTags.DoesNotExist:
                        logger.error("Passed proj tag id {} does not exists")
                else:
                    old_tagging = old_taggings[0]
                    if not old_tagging.order == order:
                        old_tagging.order = int(order)
                        old_tagging.save()
                order = order - 1
        if "image" in request.data:
            project.image = get_image_from_data_url(request.data["image"])[0]
        if "thumbnail_image" in request.data:
            project.thumbnail_image = get_image_from_data_url(
                request.data["thumbnail_image"]
            )[0]
        if "status" in request.data:
            try:
                project_status = ProjectStatus.objects.get(
                    id=int(request.data["status"])
                )
            except ProjectStatus.DoesNotExist:
                raise NotFound("Project status not found.")
            project.status = project_status
        if "start_date" in request.data:
            project.start_date = parse(request.data["start_date"])
        if "end_date" in request.data:
            project.end_date = parse(request.data["end_date"])
        if "location" in request.data:
            project.location = request.data["location"]
        if "loc" in request.data:
            location = get_location(request.data["loc"])
            project.loc = location
        if "is_draft" in request.data:
            project.is_draft = False
        if "is_personal_project" in request.data:
            if request.data["is_personal_project"] is True:
                project_parents = ProjectParents.objects.get(project=project)
                project_parents.parent_organization = None
                project_parents.save()
        if "parent_organization" in request.data:
            project_parents = ProjectParents.objects.get(project=project)
            try:
                organization = Organization.objects.get(
                    id=request.data["parent_organization"]
                )
            except Organization.DoesNotExist:
                organization = None
                logger.error("Passed parent organization id {} does not exist")

            project_parents.parent_organization = organization
            project_parents.save()

        project.save()

        items_to_translate = [
            {"key": "name", "translation_key": "name_translation"},
            {
                "key": "short_description",
                "translation_key": "short_description_translation",
            },
            {"key": "description", "translation_key": "description_translation"},
            {
                "key": "helpful_connections",
                "translation_key": "helpful_connections_translation",
            },
        ]

        if "translations" in request.data:
            edit_translations(items_to_translate, request.data, project, "project")

        return Response(
            {
                "message": "Project {} successfully updated".format(project.name),
                "url_slug": project.url_slug,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, url_slug, format=None):
        try:
            project = Project.objects.get(url_slug=str(url_slug))
        except Project.DoesNotExist:
            return Response(
                {"message": "Project not found: {}".format(url_slug)},
                status=status.HTTP_404_NOT_FOUND,
            )
        project.delete()
        return Response(
            {
                "message": "Project {} successfully deleted".format(project.name),
                "url_slug": project.url_slug,
            },
            status=status.HTTP_200_OK,
        )


class ListProjectPostsView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ["project__url_slug"]
    pagination_class = ProjectPostPagination
    serializer_class = PostSerializer

    def get_queryset(self):
        return Post.objects.filter(
            project__url_slug=self.kwargs["url_slug"],
        ).order_by("id")


class ListProjectCommentsView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ["project__url_slug"]
    pagination_class = ProjectPostPagination
    serializer_class = ProjectCommentSerializer

    def get_queryset(self):
        return ProjectComment.objects.filter(
            project__url_slug=self.kwargs["url_slug"],
        )


class AddProjectMembersView(APIView):
    permission_classes = [AddProjectMemberPermission]

    def post(self, request, url_slug):
        project = Project.objects.get(url_slug=url_slug)

        roles = Role.objects.all()
        if "team_members" not in request.data:
            return Response(
                {"message": "Missing required parameters"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for member in request.data["team_members"]:
            try:
                user = User.objects.get(id=int(member["id"]))
                user_inactive = (
                    True
                    if ProjectMember.objects.filter(
                        user=user, project=project, is_active=False
                    ).count()
                    == 1
                    else False
                )
            except User.DoesNotExist:
                logger.error(
                    "[AddProjectMembersView] Passed user id {} does not exists".format(
                        int(member["id"])
                    )
                )
                continue
            if "permission_type_id" not in member:
                logger.error(
                    "[AddProjectMembersView] Not permissions passed for user id {}.".format(
                        int(member["id"])
                    )
                )
                continue
            user_role = roles.filter(id=int(member["permission_type_id"])).first()
            try:
                user_availability = Availability.objects.filter(
                    id=int(member["availability"])
                ).first()
            except Availability.DoesNotExist:
                raise NotFound(
                    detail="Availability not found.", code=status.HTTP_404_NOT_FOUND
                )
            if user and not (user_inactive):
                ProjectMember.objects.create(
                    project=project,
                    user=user,
                    role=user_role,
                    role_in_project=member["role_in_project"],
                    availability=user_availability,
                )
                logger.info("Project member created for user {}".format(user.id))
            elif user and user_inactive:
                record = ProjectMember.objects.get(project=project, user=user)
                record.is_active = True
                record.save()
                logger.info("Project member reactivated for user {}".format(user.id))

                logger.info("Project member created for user {}".format(user.id))

        return Response(
            {"message": "Member added to the project"}, status=status.HTTP_201_CREATED
        )


class UpdateProjectMemberView(RetrieveUpdateDestroyAPIView):
    permission_classes = [ProjectMemberReadWritePermission]
    serializer_class = InsertProjectMemberSerializer

    def get_queryset(self):
        project = Project.objects.get(url_slug=str(self.kwargs["url_slug"]))
        return ProjectMember.objects.filter(id=int(self.kwargs["pk"]), project=project)

    def perform_destroy(self, instance):
        instance.delete()
        return "Project Member successfully deleted."

    def perform_update(self, serializer):
        serializer.save()
        return serializer.data


class ChangeProjectCreator(APIView):
    permission_classes = [ChangeProjectCreatorPermission]

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

        project = Project.objects.get(url_slug=url_slug)
        roles = Role.objects.all()

        if ProjectMember.objects.filter(
            user=new_creator_user, project=project
        ).exists():
            # update old creator profile and new creator profile
            new_creator = ProjectMember.objects.filter(
                user=request.data["user"], project=project, id=request.data["id"]
            )[0]
            new_creator.role = roles.filter(role_type=Role.ALL_TYPE)[0]
            if "role_in_project" in request.data:
                new_creator.role_in_project = request.data["role_in_project"]
            if "availability" in request.data:
                try:
                    Availability.objects.filter(
                        id=int(request.data["availability"])
                    ).first()
                except Availability.DoesNotExist:
                    raise NotFound(
                        detail="Availability not found.", code=status.HTTP_404_NOT_FOUND
                    )
                new_creator.user_availability = request.data["availability"]
            new_creator.save()
        else:
            # create new creator profile and update old creator profile
            new_creator = ProjectMember.objects.create(
                role=roles.filter(role_type=Role.ALL_TYPE)[0],
                project=project,
                user=new_creator_user,
            )
            if "role_in_project" in request.data:
                new_creator.role_in_project = request.data["role_in_project"]
            new_creator.save()
        old_creator = ProjectMember.objects.filter(user=request.user, project=project)[
            0
        ]
        old_creator.role = roles.filter(role_type=Role.READ_WRITE_TYPE)[0]
        old_creator.save()

        return Response(
            {"message": "Changed project creator"}, status=status.HTTP_200_OK
        )


class ListProjectMembersView(ListAPIView):
    lookup_field = "url_slug"
    serializer_class = ProjectMemberSerializer
    pagination_class = MembersPagination
    permission_classes = [AllowAny]

    def get_queryset(self):
        project = Project.objects.get(url_slug=self.kwargs["url_slug"])

        return project.project_member_project.filter(is_active=True)


class ListProjectTags(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProjectTagsSerializer

    def get_queryset(self):
        if "hub" in self.request.query_params:
            try:
                hub = Hub.objects.get(url_slug=self.request.query_params["hub"])
                if hub.hub_type == Hub.SECTOR_HUB_TYPE:
                    parent_tag = hub.filter_parent_tags.all()[0]
                    return ProjectTags.objects.filter(parent_tag=parent_tag)
                if hub.hub_type == Hub.LOCATION_HUB_TYPE:
                    return ProjectTags.objects.all()
            except Hub.DoesNotExist:
                return ProjectTags.objects.all()
        else:
            return ProjectTags.objects.all()


class ListProjectStatus(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProjectStatusSerializer

    def get_queryset(self):
        return ProjectStatus.objects.all()


class ListProjectTypeOptions(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        project_type_values = [type for type in PROJECT_TYPES.values()]
        serializer = ProjectTypesSerializer(project_type_values, many=True) 
        return Response(serializer.data, status=status.HTTP_200_OK)


class SetFollowView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, url_slug):
        # probably a better way -> .mo / po files todo

        return set_user_following_project(request, url_slug)


class SetLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, url_slug):
        if "liking" not in request.data:
            return Response(
                {"message": "Missing required parameters"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            project = Project.objects.get(url_slug=url_slug)
        except Project.DoesNotExist:
            raise NotFound(detail="Project not found.", code=status.HTTP_404_NOT_FOUND)

        if request.data["liking"] is True:
            if ProjectLike.objects.filter(user=request.user, project=project).exists():
                raise ValidationError("You've already liked this project.")
            else:
                project_like = ProjectLike.objects.create(
                    user=request.user, project=project
                )
                create_project_like_notification(project_like)
                return Response(
                    {"message": "You have liked this project.", "liking": True},
                    status=status.HTTP_201_CREATED,
                )
        if request.data["liking"] is False:
            try:
                liking_user_object = ProjectLike.objects.get(
                    user=request.user, project=project
                )
            except ProjectLike.DoesNotExist:
                raise NotFound(
                    detail="You haven't been liking this project.",
                    code=status.HTTP_404_NOT_FOUND,
                )
            liking_user_object.delete()
            return Response(
                {"message": "You do not like this project anymore.", "liking": False},
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(
                {"message": 'Invalid value for variable "liking"'},
                status=status.HTTP_400_BAD_REQUEST,
            )


class GetUserInteractionsWithProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, url_slug):
        try:
            project = Project.objects.get(url_slug=url_slug)
        except Project.DoesNotExist:
            raise NotFound(
                detail="Project not found:" + url_slug, code=status.HTTP_404_NOT_FOUND
            )

        is_liking = ProjectLike.objects.filter(
            user=request.user, project=project
        ).exists()

        is_following = ProjectFollower.objects.filter(
            user=request.user, project=project
        ).exists()

        has_open_membership_request = MembershipRequests.objects.filter(
            target_project=project,
            rejected_at=None,
            approved_at=None,
            user=self.request.user,
        ).exists()

        return Response(
            {
                "liking": is_liking,
                "following": is_following,
                "has_requested_to_join": has_open_membership_request,
            },
            status=status.HTTP_200_OK,
        )


class ProjectCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, url_slug):
        try:
            project = Project.objects.get(url_slug=url_slug)
        except Project.DoesNotExist:
            raise NotFound(
                detail="Project not found:" + url_slug, code=status.HTTP_404_NOT_FOUND
            )
        if "content" not in request.data:
            return Response(
                {"message": "Missing required parameters"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        comment = ProjectComment.objects.create(
            author_user=request.user, content=request.data["content"], project=project
        )
        if "parent_comment" in request.data:
            try:
                parent_comment = ProjectComment.objects.get(
                    id=request.data["parent_comment"]
                )
            except ProjectComment.DoesNotExist:
                raise NotFound(
                    detail="Parent comment not found:" + request.data["parent_comment"],
                    code=status.HTTP_404_NOT_FOUND,
                )
            comment.parent_comment = parent_comment
        comment.save()
        mentioned_users = get_mentions(text=comment.content, url_slugs_only=True)
        if len(mentioned_users) > 0:
            create_comment_mention_notification(
                entity_type="project",
                entity=project,
                comment=comment,
                sender=request.user,
            )
        if comment.parent_comment:
            create_project_comment_reply_notification(
                project=project,
                comment=comment,
                sender=request.user,
                user_url_slugs_to_ignore=mentioned_users,
            )
        else:
            create_project_comment_notification(
                project=project,
                comment=comment,
                sender=request.user,
                user_url_slugs_to_ignore=mentioned_users,
            )
        return Response(
            {"comment": ProjectCommentSerializer(comment).data},
            status=status.HTTP_200_OK,
        )

    def delete(self, request, url_slug, comment_id):
        try:
            project = Project.objects.get(url_slug=url_slug)
        except Project.DoesNotExist:
            raise NotFound(
                detail="Project not found:" + url_slug, code=status.HTTP_404_NOT_FOUND
            )
        try:
            comment = ProjectComment.objects.get(
                project=project, id=comment_id, author_user=request.user
            )
        except ProjectComment.DoesNotExist:
            raise NotFound(
                detail="Project comment not found. Project:"
                + url_slug
                + " Comment:"
                + comment_id,
                code=status.HTTP_404_NOT_FOUND,
            )
        comment.delete()
        return Response(status=status.HTTP_200_OK)


class ListFeaturedProjects(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProjectStubSerializer

    def get_queryset(self):
        return Project.objects.filter(rating__lte=99, is_draft=False, is_active=True)[
            0:4
        ]


class ListProjectsForSitemap(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProjectSitemapEntrySerializer
    pagination_class = ProjectsSitemapPagination

    def get_queryset(self):
        return Project.objects.filter(is_draft=False, is_active=True)


class ListProjectFollowersView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectFollowerSerializer

    def get_queryset(self):
        return get_list_of_project_followers(self)


class ListProjectRequestersView(ListAPIView):
    permission_classes = [ReadWriteSensibleProjectDataPermission]
    """This is the endpoint view to return a list of users
    who have requested membership for a specific project, including their request IDs."""

    serializer_class = ProjectRequesterSerializer

    def get_queryset(self):
        try:
            project = Project.objects.get(url_slug=self.kwargs["url_slug"])
        except Project.DoesNotExist:
            return Response(
                data={"message": f"Project does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Only show requests that are currently open, as
        # in they haven't been approved nor rejected.
        open_membership_requests = MembershipRequests.objects.filter(
            target_project=project,
            rejected_at=None,
            approved_at=None,
        )

        print(
            f"Total number of OPEN membership requests for this project: {len(open_membership_requests)}"
        )

        return open_membership_requests


class ListProjectLikesView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProjectLikeSerializer

    def get_queryset(self):
        try:
            project = Project.objects.get(url_slug=self.kwargs["url_slug"])
        except Project.DoesNotExist:
            return None

        likes = ProjectLike.objects.filter(project=project)
        return likes


class LeaveProject(RetrieveUpdateAPIView):
    """
    A view that enables a user to unsubscribe from a project
    """

    permission_classes = (IsAuthenticated,)

    def post(self, request, url_slug):
        updatable_records = list()
        try:
            project = Project.objects.get(url_slug=url_slug)
            project_member_record = ProjectMember.objects.get(
                user=self.request.user, project=project, is_active=True
            )
            active_members_in_project = ProjectMember.objects.filter(
                project=project, is_active=True
            ).count()

            if project_member_record.role.name == "Creator":
                if active_members_in_project > 1:
                    return Response(
                        data={"message": f"A new creator needs to be assigned first"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                if active_members_in_project == 1:
                    # deactivate project
                    project.is_active = False
                    updatable_records.append(project)

            project_member_record.is_active = False
            updatable_records.append(project_member_record)
            for updatable_record in updatable_records:
                updatable_record.save()
            return Response(
                data={"message": f"Left project {url_slug} successfully"},
                status=status.HTTP_200_OK,
            )

        except ProjectMember.DoesNotExist:
            return Response(
                data={"message": f"User and/or Project not found "},
                status=status.HTTP_404_NOT_FOUND,
            )

        except ProjectMember.MultipleObjectsReturned:
            # Multiple records for the same user/ project id. Duplicate records.
            # TODO: Implement a signal to send dev a message
            return Response(
                data={"message": f"We ran into some issues processing your request."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception:
            # Send E to dev
            # send to dev logs E= traceback.format_exc()
            return Response(
                data={"message": f"We ran into some issues processing your request."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class RequestJoinProject(RetrieveUpdateAPIView):
    """
    A view that enables a user to request to join a project
    """

    permission_classes = (IsAuthenticated,)

    def post(self, request, user_slug, url_slug):
        required_params = ["user_availability", "message"]
        missing_param = any([param not in request.data for param in required_params])
        if missing_param:
            return Response(
                {"message": f"Missing required parameters. Need {required_params}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # To avoid spoofing
        user = request.user
        user_profile_slug = UserProfile.objects.get(user=user).url_slug
        if user_profile_slug != user_slug:
            return Response(
                {
                    "message": f"Unauthorized. The provided user slug {user_slug} does not match the user {user_profile_slug}"
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            project = Project.objects.get(url_slug=url_slug)
        except Project.DoesNotExist:
            return Response(
                {"message": "Requested project does not exist"},
                status=status.HTTP_404_NOT_FOUND,
            )

        user_availability = Availability.objects.filter(
            id=request.data["user_availability"]
        ).first()

        request_manager = MembershipRequestsManager(
            user=user,
            membership_target=MembershipTarget.PROJECT,
            user_availability=user_availability,
            project=project,
            organization=None,
            message=request.data["message"],
        )

        exists = request_manager.duplicate_request
        if exists:
            return Response(
                {"message": "Request already exists to join project"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            request = request_manager.create_membership_request()
            project_admins = get_project_admin_creators(project)
            create_project_join_request_notification(
                requester=user,
                project_admins=project_admins,
                project=project,
                request=request,
            )

            # Now pass the requestId back to the client.
            return Response({"requestId": request.id}, status=status.HTTP_200_OK)
        except Exception:
            logging.error(traceback.format_exc())
            return Response(
                {"message": f"Internal Server Error {traceback.format_exc()}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# class ManageJoinProjectView(RetrieveUpdateAPIView):
class ManageJoinProjectView(RetrieveUpdateDestroyAPIView):
    """
    A view that enables a user to request to join a project.
    """

    # This class attribute needed to be added for the project join
    # feature.
    #
    # Note that authentication always runs at the very start of the view,
    # before the permission and throttling checks occur, and before any other code is
    # allowed to proceed. If the request to join the project isn't authenticated
    # (HTTP 401), then the remainder of this View code will not execute. See
    # https://www.django-rest-framework.org/api-guide/authentication/
    #
    # Keep in mind that when we redefine class attributes at the View level,
    # we're overwriting the default permission and authentication classes
    # that're defined within settings.py.
    permission_classes = [ReadWriteSensibleProjectDataPermission]

    serializer_class = ProjectMemberSerializer

    lookup_field = "url_slug"

    def post(self, request, url_slug, request_action, request_id):
        try:
            project = Project.objects.filter(url_slug=url_slug).first()
        except Exception:
            return Response(
                {"message": "Project Does Not Exist"}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            request_manager = MembershipRequestsManager(
                membership_request_id=request_id,
                project=project,
                membership_target=MembershipTarget.PROJECT,
            )
            if request_manager.corrupt_membership_request_id:
                return Response(
                    {"message": "Request Does Not Exist"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if request_manager.validation_failed:
                return Response(
                    {
                        f"message': 'Operation failed. Errors: {' | '.join(request_manager.errors)}"
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if request_action == "approve":
                request_manager.approve_request()
                create_project_join_request_approval_notification(request_id=request_id)
            elif request_action == "reject":
                request_manager.reject_request()
            else:
                raise NotImplementedError(
                    f"membership request action <{request_action}> is not implemented"
                )

            return Response(
                data={"message": "Operation succeeded"}, status=status.HTTP_200_OK
            )
        except Exception:
            return Response(
                {"message": f"Internal Server Error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def get_queryset(self):
        membership_requests = MembershipRequests.objects.all()
        return membership_requests


class SetProjectSharedView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, url_slug):
        try:
            project = Project.objects.get(url_slug=url_slug)
        except Project.DoesNotExist:
            raise NotFound(detail="Project not found.", code=status.HTTP_404_NOT_FOUND)
        save_content_shared(request, project)
        return Response(status=status.HTTP_201_CREATED)


class SimilarProjects(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProjectStubSerializer

    def get_queryset(self):
        similar_projects_url_slugs = get_similar_projects(
            url_slug=self.kwargs["url_slug"]
        )
        return Project.objects.filter(
            url_slug__in=similar_projects_url_slugs,
            is_draft=False,
            rating__gte=49,
            is_active=True,
        )

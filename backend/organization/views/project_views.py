from dateutil.parser import parse
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from organization.models import Project, Organization, ProjectParents, ProjectMember
from organization.serializers.project import (
    ProjectSerializer, ProjectMinimalSerializer, ProjectMemberSerializer
)
from organization.utility.project import (
    create_new_project, project_creation_pre_checks
)
from organization.permissions import OrganizationProjectCreationPermission
from organization.utility.organization import (
    check_organization,
)
from climateconnect_api.models import Role, Skill
import logging
logger = logging.getLogger(__name__)


class ListProjectsView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ['url_slug']
    pagination_class = PageNumberPagination
    serializer_class = ProjectSerializer
    queryset = Project.objects.all()

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return ProjectSerializer
        return ProjectMinimalSerializer


"""
Note: I am splitting organization project creation and personal project creation into
two separate APIs. It makes more sense do two APIs so that we can manage user accessibility
by project or organization member roles.
"""


class OrganizationProjectsView(APIView):
    permission_classes = [OrganizationProjectCreationPermission]

    def post(self, request, organization_id):
        organization = check_organization(organization_id)
        if not organization:
            return Response({
                'message': 'Organization not found'
            }, status=status.HTTP_404_NOT_FOUND)
        project_creation_pre_checks(request.data)
        project = create_new_project(request.data)

        if 'order' in request.data:
            order = request.data['order']
            ProjectParents.objects.create(
                project=project, parent_organization=organization,
                parent_user=request.user, order=order
            )

        serializer = ProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CreateProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        project_creation_pre_checks(request.data)
        project = create_new_project(request.data)
        if 'order' in request.data:
            order = request.data['order']
            ProjectParents.objects.create(
                project=project, parent_user=request.user, order=order
            )

        # Here a user is creating an individual project so we will be adding them as a project member
        role = Role.objects.get(name="Project Administrator")
        ProjectMember.objects.create(
            project=project, user=request.user, role=role
        )
        serializer = ProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProjectAPIView(APIView):
    permission_classes = [OrganizationProjectCreationPermission]

    def get(self, request, pk, format=None):
        try:
            project = Project.objects.get(id=int(pk))
        except Project.DoesNotExist:
            return Response({'message': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProjectSerializer(project, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk, format=None):
        try:
            project = Project.objects.get(id=int(pk))
        except Project.DoesNotExist:
            return Response({'message': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

        if request.data['name'] != project.name:
            project.name = request.data['name']
            project.url_slug = request.data['name'] + str(project.id)

        if request.data['skills']:
            for skill_name in request.data['skills']:
                try:
                    skill = Skill.objects.get(name=skill_name)
                    project.skills.add(skill)
                except Skill.DoesNotExist:
                    logger.error("Passed skill name {} does not exists")

        project.image = request.data["image"]
        project.status = request.data["status"]
        project.start_date = parse(request.data['start_date']) if request.data['start_date'] else None
        project.end_date = parse(request.data['end_date']) if request.data['end_date'] else None
        project.short_description = request.data['short_description']
        project.description = request.data['description']
        project.country = request.data['country']
        project.city = request.data['city']
        project.collaborators_welcome = request.data['collaborators_welcome']
        project.helpful_connections = request.data['helpful_connections']

        project.save()

        return Response({
            'message': 'Project {} successfully updated'.format(project.name)
        }, status=status.HTTP_200_OK)


class ListProjectMembersView(ListAPIView):
    lookup_field = 'pk'
    serializer_class = ProjectMemberSerializer
    pagination_class = PageNumberPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project = Project.objects.get(id=int(self.kwargs['pk']))

        return project.project_member.all()


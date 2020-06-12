from dateutil.parser import parse
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.models import User

from organization.models import Project, Organization, ProjectParents, ProjectMember
from organization.serializers.project import (
    ProjectSerializer, ProjectMinimalSerializer, ProjectMemberSerializer
)
from organization.utility.project import create_new_project
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


class CreateProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        organization = check_organization(int(request.data['organization_id']))
        required_params = [
            'name', 'status', 'start_date', 'short_description',
            'collaborators_welcome', 'project_order'
        ]
        for param in required_params:
            if param not in request.data:
                return Response({
                    'message': 'Missing required information to create project.'
                               'Please contact administrator'
                }, status=status.HTTP_400_BAD_REQUEST)

        project_status = request.data['status']
        if project_status not in Project.PROJECT_STATUS_LIST:
            return Response({
                'message': 'Invalid project status'
            }, status=status.HTTP_404_NOT_FOUND)

        project = create_new_project(request.data)

        order = request.data['project_order']
        project_parents = ProjectParents.objects.create(
            project=project, parent_user=request.user, order=order
        )
        if organization:
            project_parents.organization = organization
            project_parents.save()

        # There are only certain roles user can have. So get all the roles first.
        roles = Role.objects.all()

        team_members = request.data['team_members']
        for member in team_members:
            user_role = roles.filter(role_type=int(member['permission_type'])).first()
            try:
                user = User.objects.get(id=int(member['user_id']))
            except User.DoesNotExist:
                logger.error("Passed user id {} does not exists".format(member['user_id']))
                continue
            if user:
                ProjectMember.objects.create(
                    project=project, user=user, role=user_role
                )
                logger.info("Project member created for user {}".format(user.id))

        return Response({
            'message': 'Project {} successfully created'.format(project.name)
        }, status=status.HTTP_201_CREATED)


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


class AddProjectMembersView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        try:
            project = Project.objects.get(id=int(project_id))
        except Project.DoesNotExist:
            return Response({'message': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

        roles = Role.objects.all()
        if 'team_members' not in request.data:
            return Response({
                'message': 'Missing required parameters'
            }, status=status.HTTP_400_BAD_REQUEST)

        for member in request.data['team_members']:
            try:
                user = User.objects.get(id=int(member['user_id']))
            except User.DoesNotExist:
                logger.error("Passed user id {} does not exists".format(member['user_id']))
                continue

            user_role = roles.filter(role_type=int(member['permission_type'])).first()
            if user:
                ProjectMember.objects.create(
                    project=project, user=user, role=user_role
                )
                logger.info("Project member created for user {}".format(user.id))

        return Response({'message': 'Member added to the project'}, status=status.HTTP_201_CREATED)


class ListProjectMembersView(ListAPIView):
    lookup_field = 'pk'
    serializer_class = ProjectMemberSerializer
    pagination_class = PageNumberPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project = Project.objects.get(id=int(self.kwargs['pk']))

        return project.project_member.all()


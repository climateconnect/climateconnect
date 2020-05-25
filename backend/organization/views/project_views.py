from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from organization.models import Project, Organization, ProjectParents
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
    # TODO: Add permission class
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
    # TODO: Add permission class
    permission_classes = [IsAuthenticated]

    def post(self, request):
        project_creation_pre_checks(request.data)
        project = create_new_project(request.data)
        serializer = ProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ProjectAPIView(ListAPIView):
    lookup_field = 'pk'
    serializer_class = ProjectSerializer
    pagination_class = None
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(id=int(self.kwargs['pk']))


class ListProjectMembersView(ListAPIView):
    lookup_field = 'pk'
    serializer_class = ProjectMemberSerializer
    pagination_class = PageNumberPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project = Project.objects.get(id=int(self.kwargs['pk']))

        return project.project_member.all()


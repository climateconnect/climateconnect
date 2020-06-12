from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter

from organization.models import Project
from organization.serializers.project import (
    ProjectSerializer, ProjectMinimalSerializer, ProjectMemberSerializer
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


class ProjectAPIView(ListAPIView):
    lookup_field = 'url_slug'
    serializer_class = ProjectSerializer
    pagination_class = None
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(url_slug=self.kwargs['pk'])


class ListProjectMembersView(ListAPIView):
    lookup_field = 'url_slug'
    serializer_class = ProjectMemberSerializer
    pagination_class = PageNumberPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project = Project.objects.get(url_slug=self.kwargs['pk'])

        return project.project_member.all()


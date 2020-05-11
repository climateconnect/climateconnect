from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter

from organization.models import Project
from organization.serializers.project import ProjectSerializer


class ListProjectsView(ListAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    search_fields = ['^name']
    pagination_class = PageNumberPagination
    serializer_class = ProjectSerializer
    queryset = Project.objects.all()


class ProjectAPIView(ListAPIView):
    lookup_field = 'pk'
    serializer_class = ProjectSerializer
    pagination_class = None

    def get_queryset(self):
        return Project.objects.filter(id=int(self.kwargs['pk']))

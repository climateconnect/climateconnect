from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import ListAPIView
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination

from organization.serializers.organization import OrganizationSerializer
from organization.models import Organization


class OrganizationAPIView(ListAPIView):
    permission_classes = [IsAuthenticated]
    filter_backends = [SearchFilter]
    pagination_class = PageNumberPagination
    # `^` is for startswith method. User can search organization by name.
    search_fields = ['^name']
    serializer_class = OrganizationSerializer
    queryset = Organization.objects.all()

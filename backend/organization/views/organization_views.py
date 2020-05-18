from rest_framework.permissions import AllowAny
from rest_framework.generics import ListAPIView
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination

from organization.serializers.organization import (
    OrganizationSerializer, OrganizationMinimalSerializer
)
from organization.models import Organization


class OrganizationAPIView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    pagination_class = PageNumberPagination
    search_fields = ['url_slug']
    queryset = Organization.objects.all()

    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return OrganizationSerializer

        return OrganizationMinimalSerializer

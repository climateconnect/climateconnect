from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView, ListCreateAPIView
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound

from django.contrib.auth.models import User
from organization.serializers.organization import (
    OrganizationSerializer, OrganizationMinimalSerializer, OrganizationMemberSerializer, UserOrganizationSerializer, OrganizationCardSerializer
)
from organization.serializers.project import (ProjectFromProjectParentsSerializer,)
from climateconnect_api.serializers.user import UserProfileStubSerializer
from organization.models import Organization, OrganizationMember, ProjectParents
from climateconnect_api.models.user import UserProfile
from organization.permissions import OrganizationReadWritePermission
from climateconnect_api.models import Role
from organization.pagination import (OrganizationsPagination, ProjectsPagination)
from climateconnect_api.pagination import MembersPagination
import logging
logger = logging.getLogger(__name__)


class ListOrganizationsAPIView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    pagination_class = OrganizationsPagination
    search_fields = ['name']
    queryset = Organization.objects.all()

    def get_serializer_class(self):
        return OrganizationCardSerializer


class CreateOrganizationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        required_params = ['name', 'team_members']
        for param in required_params:
            if param not in request.data:
                return Response({
                    'message': 'Required parameter missing: {}'.format(param)
                }, status=status.HTTP_400_BAD_REQUEST)

        organization, created = Organization.objects.get_or_create(name=request.data['name'])

        if created:
            organization.url_slug = organization.name.replace(" ", "") + str(organization.id)

            if 'image' in request.data:
                organization.image = request.data['image']
            if 'background_image' in request.data:
                organization.background_image = request.data['background_image']

            if 'parent_organization' in request.data:
                try:
                    parent_org = Organization.objects.get(id=int(request.data['parent_organization']))
                except Organization.DoesNotExist:
                    return Response({
                        'message': 'Parent organization not found.'
                    }, status=status.HTTP_404_NOT_FOUND)

                organization.parent_organization = parent_org

            if 'country' in request.data:
                organization.country = request.data['country']
            if 'state' in request.data:
                organization.state = request.data['state']
            if 'city' in request.data:
                organization.city = request.data['city']
            if 'short_description' in request.data:
                organization.short_description = request.data['short_description']
            organization.save()

            roles = Role.objects.all()
            for member in request.data['team_members']:
                user_role = roles.filter(id=int(member['permission_type_id'])).first()
                try:
                    user = User.objects.get(id=int(member['user_id']))
                except User.DoesNotExist:
                    logger.error("Passed user id {} does not exists".format(member['user_id']))
                    continue

                if user:
                    OrganizationMember.objects.create(
                        user=user, organization=organization, role=user_role
                    )
                    logger.info("Organization member created {}".format(user.id))

            return Response({
                'message': 'Organization {} successfully created'.format(organization.name)
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'message': 'Organization with name {} already exists'.format(request.data['name'])
            }, status=status.HTTP_400_BAD_REQUEST)


class OrganizationAPIView(RetrieveUpdateDestroyAPIView):
    permission_classes = [OrganizationReadWritePermission]
    serializer_class = OrganizationSerializer
    lookup_field = 'url_slug'

    def get_queryset(self):
        return Organization.objects.filter(url_slug=str(self.kwargs['url_slug']))

    def perform_update(self, serializer):
        serializer.save()
        return serializer

    def perform_destroy(self, instance):
        instance.delete()
        return "Organization successfully deleted."


class ListCreateOrganizationMemberView(ListCreateAPIView):
    permission_classes = [OrganizationReadWritePermission]
    serializer_class = OrganizationMemberSerializer
    pagination_class = PageNumberPagination
    filter_backends = [SearchFilter]
    search_fields = ['user__username', 'user__first_name', 'user__last_name']

    def get_queryset(self):
        try:
            organization = Organization.objects.get(url_slug=str(self.kwargs['url_slug']))
        except Organization.DoesNotExist:
            raise NotFound('Organization not found')

        return OrganizationMember.objects.filter(organization=organization)

    def perform_create(self, serializer):
        serializer.save()
        return serializer.data


class UpdateOrganizationMemberView(RetrieveUpdateDestroyAPIView):
    permission_classes = [OrganizationReadWritePermission]
    serializer_class = OrganizationMemberSerializer

    def get_queryset(self):
        try:
            organization = Organization.objects.get(url_slug=str(self.kwargs['url_slug']))
        except Organization.DoesNotExist:
            raise NotFound('Organization not found')

        return OrganizationMember.objects.filter(id=int(self.kwargs['pk']), organization=organization)

    def perform_destroy(self, instance):
        instance.delete()
        return "Organization Member successfully deleted."

    def perform_update(self, serializer):
        serializer.save()
        return serializer.data

class PersonalOrganizationsView(ListAPIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        if not UserProfile.objects.filter(user=request.user).exists():
            raise NotFound(detail="Profile not found.", code=status.HTTP_404_NOT_FOUND)
        user_organization_members= OrganizationMember.objects.filter(user=request.user)
        serializer = UserOrganizationSerializer(user_organization_members, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ListOrganizationProjectsAPIView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ['parent_organization__url_slug']
    pagination_class = ProjectsPagination
    serializer_class = ProjectFromProjectParentsSerializer

    def get_queryset(self):
        return ProjectParents.objects.filter(
            parent_organization__url_slug=self.kwargs['url_slug'],
        ).order_by('id')

class ListOrganizationMembersAPIView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ['organization__url_slug']
    pagination_class = MembersPagination
    serializer_class = OrganizationMemberSerializer

    def get_queryset(self):
        return OrganizationMember.objects.filter(
            organization__url_slug=self.kwargs['url_slug'],
        ).order_by('id')
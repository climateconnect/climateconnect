from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import ListAPIView, RetrieveUpdateDestroyAPIView, ListCreateAPIView
from rest_framework.filters import SearchFilter
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from django_filters.rest_framework import DjangoFilterBackend

from django.contrib.auth.models import User
from organization.serializers.organization import (
    OrganizationSerializer, OrganizationMinimalSerializer, OrganizationMemberSerializer, UserOrganizationSerializer, OrganizationCardSerializer
)
from organization.serializers.project import (ProjectFromProjectParentsSerializer,)
from organization.serializers.tags import (OrganizationTagsSerializer)
from climateconnect_api.serializers.user import UserProfileStubSerializer
from organization.models import Organization, OrganizationMember, ProjectParents, OrganizationTags, OrganizationTagging
from organization.permissions import (OrganizationReadWritePermission, OrganizationReadWritePermission, OrganizationMemberReadWritePermission, AddOrganizationMemberPermission, ChangeOrganizationCreatorPermission)
from climateconnect_api.models import Role, UserProfile
from organization.pagination import (OrganizationsPagination, ProjectsPagination)
from climateconnect_api.pagination import MembersPagination
from climateconnect_main.utility.general import get_image_from_data_url
from climateconnect_api.models import Role
import logging
logger = logging.getLogger(__name__)


class ListOrganizationsAPIView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter, DjangoFilterBackend]
    pagination_class = OrganizationsPagination
    search_fields = ['name']
    filterset_fields = ['city', 'country']

    def get_serializer_class(self):
        return OrganizationCardSerializer

    def get_queryset(self):
        organizations = Organization.objects.all()
        if 'organization_type' in self.request.query_params:
            organization_type_names = self.request.query_params.get('organization_type').split(',')
            organization_types = OrganizationTags.objects.filter(name__in=organization_type_names)
            organization_taggings = OrganizationTagging.objects.filter(organization_tag__in=organization_types)
            organizations = organizations.filter(tag_organization__in=organization_taggings).distinct('id')

        return organizations


class CreateOrganizationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        required_params = ['name', 'team_members', 'city', 'country', 'image', 'organization_tags']
        for param in required_params:
            if param not in request.data:
                logger.error('Required parameter missing: {}'.format(param))
                return Response({
                    'message': 'Required parameter missing: {}'.format(param)
                }, status=status.HTTP_400_BAD_REQUEST)

        organization, created = Organization.objects.get_or_create(name=request.data['name'])

        if created:
            organization.url_slug = organization.name.replace(" ", "") + str(organization.id)

            if 'image' in request.data:
                organization.image = get_image_from_data_url(request.data['image'])[0]
            if 'background_image' in request.data:
                organization.background_image = get_image_from_data_url(request.data['background_image'])[0]

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
            if 'website' in request.data:
                organization.website = request.data['website']
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

            if 'organization_tags' in request.data:
                for organization_tag_id in request.data['organization_tags']:
                    try:
                        organization_tag = OrganizationTags.objects.get(id=int(organization_tag_id))
                    except OrganizationTags.DoesNotExist:
                        logger.error("Passed organization tag ID {} does not exists".format(organization_tag_id))
                        continue
                    if organization_tag:
                        OrganizationTagging.objects.create(
                            organization=organization, organization_tag=organization_tag
                        )
                        logger.info("Organization tagging created for organization {}".format(organization.id))
            
            return Response({
                'message': 'Organization {} successfully created'.format(organization.name),
                'url_slug': organization.url_slug
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'message': 'Organization with name {} already exists'.format(request.data['name'])
            }, status=status.HTTP_400_BAD_REQUEST)


class OrganizationAPIView(APIView):
    permission_classes = [OrganizationReadWritePermission]
    lookup_field = 'url_slug'

    def get(self, request, url_slug, format=None):
        try:
            organization = Organization.objects.get(url_slug=str(url_slug))            
        except Organization.DoesNotExist:
            return Response({'message': 'Project not found: {}'.format(url_slug)}, status=status.HTTP_404_NOT_FOUND)
        serializer = OrganizationSerializer(organization, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, url_slug, format=None):
        try:
            organization = Organization.objects.get(url_slug=str(url_slug))            
        except Organization.DoesNotExist:
            return Response({'message': 'Organization not found: {}'.format(url_slug)}, status=status.HTTP_404_NOT_FOUND)
        pass_through_params = ['name', 'state', 'city', 'country', 'short_description', 'school', 'organ', 'website']
        for param in pass_through_params:
            if param in request.data:
                setattr(organization, param, request.data[param])
        if 'image' in request.data:
            organization.image = get_image_from_data_url(request.data['image'])[0]
        if 'background_image' in request.data:
            organization.background_image = get_image_from_data_url(request.data['background_image'])[0]
        if 'parent_organization' in request.data:
            if 'has_parent_organization' in request.data and request.data['has_parent_organization'] == False:
                organization.parent_organization = None
            else:
                try:
                    parent_organization = Organization.objects.get(id=request.data['parent_organization'])
                except Organization.DoesNotExist:
                    return Response({'message': 'Parent org not found for organization {}'.format(url_slug)}, status=status.HTTP_404_NOT_FOUND)
                organization.parent_organization = parent_organization
        old_organization_taggings = OrganizationTagging.objects.filter(organization=organization).values('organization_tag')
        if 'types' in request.data:
            for tag in old_organization_taggings:
                if not tag['organization_tag'] in request.data['types']:
                    tag_to_delete = OrganizationTags.objects.get(id=tag['organization_tag'])
                    OrganizationTagging.objects.filter(organization=organization, organization_tag=tag_to_delete).delete()
            for tag_id in request.data['types']:
                if not old_organization_taggings.filter(organization_tag=tag_id).exists():
                    try:
                        tag = OrganizationTags.objects.get(id=tag_id)
                        OrganizationTagging.objects.create(
                            organization_tag=tag, organization=organization
                        )
                    except OrganizationTags.DoesNotExist:
                        logger.error("Passed org tag id {} does not exists")
            

        organization.save()
        return Response({'message': 'Successfully updated organization.'}, status=status.HTTP_200_OK)


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
    permission_classes = [OrganizationMemberReadWritePermission]
    serializer_class = OrganizationMemberSerializer

    def get_queryset(self):
        logger.error("updating organization members")
        organization = Organization.objects.get(url_slug=str(self.kwargs['url_slug']))
        logger.error(OrganizationMember.objects.filter(id=int(self.kwargs['pk']), organization=organization))
        return OrganizationMember.objects.filter(id=int(self.kwargs['pk']), organization=organization)

    def perform_destroy(self, instance):
        instance.delete()
        return "Organization Member successfully deleted."

    def perform_update(self, serializer):
        logger.error("performing update!")
        serializer.save()
        return serializer.data

class AddOrganizationMembersView(APIView):
    permission_classes = [AddOrganizationMemberPermission]

    def post(self, request, url_slug):
        organization = Organization.objects.get(url_slug=url_slug)

        roles = Role.objects.all()
        if 'organization_members' not in request.data:
            return Response({
                'message': 'Missing required parameters'
            }, status=status.HTTP_400_BAD_REQUEST)

        for member in request.data['organization_members']:
            try:
                user = User.objects.get(id=int(member['id']))
            except User.DoesNotExist:
                logger.error("[AddOrganizationMembersView] Passed user id {} does not exists".format(int(member['id'])))
                continue
            if 'permission_type_id' not in member:
                logger.error("[AddOrganizationMembersView] Not permissions passed for user id {}.".format(int(member['id'])))
                continue
            user_role = roles.filter(id=int(member['permission_type_id'])).first()
            if user:
                OrganizationMember.objects.create(
                    organization=organization, user=user, role=user_role, role_in_organization=member['role_in_organization']
                )
                    
                logger.info("Organization member created for user {}".format(user.id))

        return Response({'message': 'Member added to the organization'}, status=status.HTTP_201_CREATED)

class ChangeOrganizationCreator(APIView):
    permission_classes = [ChangeOrganizationCreatorPermission]

    def post(self, request, url_slug):
        if 'user' not in request.data:
            return Response({
                'message': 'Missing required parameters'
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            new_creator_user = User.objects.get(id=int(request.data['user']))
        except User.DoesNotExist:
            raise NotFound(detail="Profile not found.", code=status.HTTP_404_NOT_FOUND)   
        
        if request.user.id == new_creator_user.id:
            return Response({
                'message': 'Missing required parameters'
            }, status=status.HTTP_400_BAD_REQUEST)

        organization = Organization.objects.get(url_slug=url_slug)
        roles = Role.objects.all()     
        if OrganizationMember.objects.filter(user=new_creator_user, organization = organization).exists():
            # update old creator profile and new creator profile
            logger.error('updating new creator')
            new_creator = OrganizationMember.objects.filter(user=request.data['user'], organization = organization, id = request.data['id'])[0]
            new_creator.role = roles.filter(role_type=Role.ALL_TYPE)[0]
            if('role_in_organization' in request.data):
                new_creator.role_in_organization = request.data['role_in_organization']
            new_creator.save()
        else:
            # create new creator profile and update old creator profile
            logger.error('adding new creator')
            new_creator = OrganizationMember.objects.create(
                role = roles.filter(role_type=Role.ALL_TYPE)[0],
                organization = organization,
                user = new_creator_user
            )
            if('role_in_organization' in request.data):
                new_creator.role_in_organization = request.data['role_in_organization']
            new_creator.save()
        old_creator = OrganizationMember.objects.filter(user=request.user, organization = organization,)[0]
        old_creator.role = roles.filter(role_type=Role.READ_WRITE_TYPE)[0]
        old_creator.save()

        return Response({'message': 'Changed organization creator'}, status=status.HTTP_200_OK)


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
            project__is_draft=False
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

class ListOrganizationTags(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = OrganizationTagsSerializer

    def get_queryset(self):
        return OrganizationTags.objects.all()
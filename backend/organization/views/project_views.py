from dateutil.parser import parse
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.filters import SearchFilter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.contrib.auth.models import User

from organization.models import Project, Organization, ProjectParents, ProjectMember, Post, ProjectComment, ProjectTags, ProjectTagging, ProjectStatus, ProjectCollaborators
from organization.serializers.project import (
    ProjectSerializer, ProjectMinimalSerializer, ProjectStubSerializer, ProjectMemberSerializer
)
from organization.serializers.status import ProjectStatusSerializer
from organization.serializers.content import (PostSerializer, ProjectCommentSerializer)
from organization.serializers.tags import (ProjectTagsSerializer)
from organization.utility.project import create_new_project
from organization.permissions import (OrganizationProjectCreationPermission, ProjectReadWritePermission)
from organization.pagination import (ProjectsPagination, MembersPagination, ProjectPostPagination, ProjectCommentPagination)
from organization.utility.organization import (
    check_organization,
)
from climateconnect_main.utility.general import get_image_from_data_url
from climateconnect_api.models import Role, Skill, Availability
import logging
logger = logging.getLogger(__name__)


class ListProjectsView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ['url_slug']
    pagination_class = ProjectsPagination
    serializer_class = ProjectSerializer
    queryset = Project.objects.all()

    def get_serializer_class(self):
        return ProjectStubSerializer
    
    def get_queryset(self):
        return Project.objects.filter(is_draft=False)



class CreateProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if 'parent_organization' in request.data:
            organization = check_organization(int(request.data['parent_organization']))
        else:
            organization = None

        required_params = [
            'name', 'status', 'short_description',
            'collaborators_welcome', 'team_members', 
            'project_tags', 'city', 'country', 'image'
        ]
        for param in required_params:
            if param not in request.data:
                logger.error("Missing required information to create project:{}".format(param))
                return Response({
                    'message': 'Missing required information to create project:'+param+' Please contact administrator'
                }, status=status.HTTP_400_BAD_REQUEST)
        try:
            project_status = ProjectStatus.objects.get(id=int(request.data["status"]))
        except ProjectStatus.DoesNotExist:
            return Response({
                'message': "Passed status {} does not exist".format(request.data["status"])
            })

        project = create_new_project(request.data)

        project_parents = ProjectParents.objects.create(
            project=project, parent_user=request.user
        )

        if organization:
            project_parents.parent_organization = organization
            project_parents.save()
        
        if 'collaborating_organizations' in request.data:
            for organization_id in request.data['collaborating_organizations']:
                try:
                    collaborating_organization = Organization.objects.get(id=int(organization_id))
                    ProjectCollaborators.objects.create(project=project, collaborating_organization=collaborating_organization)
                except Organization.DoesNotExist:
                    logger.error("Passed collaborating organization id {} does not exist.".format(organization_id))


        # There are only certain roles user can have. So get all the roles first.
        roles = Role.objects.all()
        availabilities = Availability.objects.all()
        team_members = request.data['team_members']
            
        if 'project_tags' in request.data:
            for project_tag_id in request.data['project_tags']:
                try:
                    project_tag = ProjectTags.objects.get(id=int(project_tag_id))
                except ProjectTags.DoesNotExist:
                    logger.error("Passed project tag ID {} does not exists".format(project_tag_id))
                    continue
                if project_tag:
                    ProjectTagging.objects.create(
                        project=project, project_tag=project_tag
                    )
                    logger.info("Project tagging created for project {}".format(project.id))

        for member in team_members:
            user_role = roles.filter(id=int(member['role'])).first()
            user_availability = availabilities.filter(id=int(member['availability'])).first()
            try:
                user = User.objects.get(id=int(member['id']))
            except User.DoesNotExist:
                for user in User.objects.all():
                    logger.error(user.id)
                logger.error("[CreateProjectView]Passed user id {} does not exists".format(int(member['id'])))
                continue
            if user:
                ProjectMember.objects.create(
                    project=project, user=user, role=user_role, 
                    availability=user_availability, role_in_project=member['role_in_project']
                )
                logger.info("Project member created for user {}".format(user.id))

        return Response({
            'message': 'Project {} successfully created'.format(project.name),
            'url_slug': project.url_slug
        }, status=status.HTTP_201_CREATED)


class ProjectAPIView(APIView):
    permission_classes = [ProjectReadWritePermission]

    def get(self, request, url_slug, format=None):
        try:
            project = Project.objects.get(url_slug=str(url_slug))            
        except Project.DoesNotExist:
            return Response({'message': 'Project not found: {}'.format(url_slug)}, status=status.HTTP_404_NOT_FOUND)
        #TODO: get number of followers

        serializer = ProjectSerializer(project, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, url_slug, format=None):
        try:
            project = Project.objects.get(url_slug=url_slug)
        except Project.DoesNotExist:
            return Response({'message': 'Project not found: {}'.format(url_slug)}, status=status.HTTP_404_NOT_FOUND)

        if 'name' in request.data and request.data['name'] != project.name:
            project.name = request.data['name']
            project.url_slug = request.data['name'] + str(project.id)

        if 'skills' in request.data:
            for skill in project.skills.all():
                if not skill.id in request.data['skills']:
                    logger.error("this skill needs to be deleted: "+skill.name)
                    project.skills.remove(skill)
            for skill_id in request.data['skills']:
                try:
                    skill = Skill.objects.get(id=skill_id)
                    project.skills.add(skill)
                except Skill.DoesNotExist:
                    logger.error("Passed skill id {} does not exists")
        
        old_project_taggings = ProjectTagging.objects.filter(project=project).values('project_tag')
        if 'project_tags' in request.data:
            for tag in old_project_taggings:
                if not tag['project_tag'] in request.data['project_tags']:
                    logger.error("this tag needs to be deleted: "+str(tag['project_tag']))
                    tag_to_delete = ProjectTags.objects.get(id=tag['project_tag'])
                    ProjectTagging.objects.filter(project=project, project_tag=tag_to_delete).delete()
            for tag_id in request.data['project_tags']:
                if not old_project_taggings.filter(project_tag=tag_id).exists():
                    try:
                        tag = ProjectTags.objects.get(id=tag_id)
                        ProjectTagging.objects.create(
                            project_tag=tag, project=project
                        )
                    except ProjectTags.DoesNotExist:
                        logger.error("Passed tag id {} does not exists")


        if 'image' in request.data:
            project.image = get_image_from_data_url(request.data['image'])[0]
        if 'status' in request.data:
            try:
                project_status = ProjectStatus.objects.get(id=int(request.data['status']))
            except ProjectStatus.DoesNotExist:
                raise NotFound('Project status not found.')
            project.status = project_status
        if 'start_date' in request.data:
            project.start_date = parse(request.data['start_date'])
        if 'end_date' in request.data:
            project.end_date = parse(request.data['end_date'])
        if 'short_description' in request.data:
            project.short_description = request.data['short_description']
        if 'description' in request.data:
            project.description = request.data['description']
        if 'country' in request.data:
            project.country = request.data['country']
        if 'city' in request.data:
            project.city = request.data['city']
        if 'collaborators_welcome' in request.data:
            project.collaborators_welcome = request.data['collaborators_welcome']
        if 'helpful_connections' in request.data:
            project.helpful_connections = request.data['helpful_connections']
        if 'is_personal_project' in request.data:
            if request.data['is_personal_project'] == True:
                project_parents = ProjectParents.objects.get(project=project)
                project_parents.parent_organization = None
                project_parents.save()
        if 'parent_organization' in request.data:
            project_parents = ProjectParents.objects.get(project=project)
            try:
                organization = Organization.objects.get(id=request.data['parent_organization'])
            except Organization.DoesNotExist:
                logger.error("Passed parent organization id {} does not exist")
            project_parents.parent_organization = organization
            project_parents.save()

        project.save()

        return Response({
            'message': 'Project {} successfully updated'.format(project.name),
            'url_slug': project.url_slug
        }, status=status.HTTP_200_OK)

class ListProjectPostsView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ['project__url_slug']
    pagination_class = ProjectPostPagination
    serializer_class = PostSerializer
    
    def get_queryset(self):
        return Post.objects.filter(
            project__url_slug=self.kwargs['url_slug'],
        ).order_by('id')

class ListProjectCommentsView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ['project__url_slug']
    pagination_class = ProjectPostPagination
    serializer_class = ProjectCommentSerializer
    
    def get_queryset(self):
        return ProjectComment.objects.filter(
            project__url_slug=self.kwargs['url_slug'],
        ).order_by('id')
    
class AddProjectMembersView(APIView):
    #TODO: update permission: only admins or creators should be able to call this route
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
                logger.error("[AddProjectMembersView] Passed user id {} does not exists".format(int(member['user_id'])))
                continue

            user_role = roles.filter(id=int(member['permission_type_id'])).first()
            if user:
                ProjectMember.objects.create(
                    project=project, user=user, role=user_role
                )
                logger.info("Project member created for user {}".format(user.id))

        return Response({'message': 'Member added to the project'}, status=status.HTTP_201_CREATED)


class UpdateProjectMemberView(APIView):
    permission_classes = [IsAuthenticated]

    def confirm_project_and_members(self, project_id, member_id):
        if not Project.objects.filter(id=int(project_id)).exists():
            return Response({'message': 'Project not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            project_member = ProjectMember.objects.get(id=int(member_id))
        except ProjectMember.DoesNotExist:
            return Response({
                'message': 'Member not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        return project_member

    def get(self, request, project_id, member_id):
        project_member = self.confirm_project_and_members(project_id, member_id)
        serializer = ProjectMemberSerializer(project_member, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, project_id, member_id):
        project_member = self.confirm_project_and_members(project_id, member_id)
        roles = Role.objects.all()
        # Update user role.
        user_role = roles.filter(id=int(request.data['permission_type_id'])).first()
        project_member.role = user_role
        project_member.save()
        return Response({'message': 'Member updated'}, status=status.HTTP_200_OK)

    def delete(self, request, project_id, member_id):
        project_member = self.confirm_project_and_members(project_id, member_id)
        project_member.delete()
        return Response({'message': 'Member deleted'}, status=status.HTTP_200_OK)


class ListProjectMembersView(ListAPIView):
    lookup_field = 'url_slug'
    serializer_class = ProjectMemberSerializer
    pagination_class = MembersPagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        project = Project.objects.get(url_slug=self.kwargs['url_slug'])

        return project.project_member.all()


class ListProjectTags(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProjectTagsSerializer

    def get_queryset(self):
        return ProjectTags.objects.all()


class ListProjectStatus(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProjectStatusSerializer

    def get_queryset(self):
        return ProjectStatus.objects.all()
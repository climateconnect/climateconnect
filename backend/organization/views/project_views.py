from dateutil.parser import parse
from rest_framework.generics import ListAPIView,RetrieveUpdateDestroyAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.filters import SearchFilter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django_filters.rest_framework import DjangoFilterBackend, OrderingFilter

from django.contrib.auth.models import User

from organization.models import (
    Project, Organization, ProjectParents, ProjectMember, Post, ProjectComment, ProjectTags, ProjectTagging, 
    ProjectStatus, ProjectCollaborators, ProjectFollower, OrganizationTags, OrganizationTagging
)
from organization.serializers.project import (
    ProjectSerializer, ProjectMinimalSerializer, ProjectStubSerializer, ProjectMemberSerializer, 
    InsertProjectMemberSerializer
)
from organization.serializers.status import ProjectStatusSerializer
from organization.serializers.content import (PostSerializer, ProjectCommentSerializer)
from organization.serializers.tags import (ProjectTagsSerializer)
from organization.utility.project import create_new_project
from organization.permissions import (OrganizationProjectCreationPermission, ProjectReadWritePermission, AddProjectMemberPermission, ProjectMemberReadWritePermission, ChangeProjectCreatorPermission)
from organization.pagination import (
    ProjectsPagination, MembersPagination, ProjectPostPagination, ProjectCommentPagination
)
from organization.utility.organization import (
    check_organization,
)
from rest_framework.exceptions import ValidationError, NotFound
from climateconnect_main.utility.general import get_image_from_data_url
from climateconnect_api.models import Role, Skill, Availability
import logging
logger = logging.getLogger(__name__)


class ProjectsOrderingFilter(OrderingFilter):
    def filter_queryset(self, request, queryset, view):
        ordering = request.query_params.get('sort_by')
        print(ordering)
        if ordering is not None:
            if ordering == 'newest':
                queryset = queryset.order_by('-id')
            elif ordering == 'oldest':                
                queryset = queryset.order_by('id')
            else:                
                queryset = queryset.order_by('rating')
        return queryset

class ListProjectsView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter, DjangoFilterBackend, ProjectsOrderingFilter]
    search_fields = ['url_slug']
    filterset_fields = ['collaborators_welcome', 'country', 'city']    
    pagination_class = ProjectsPagination
    serializer_class = ProjectStubSerializer
    queryset = Project.objects.filter(is_draft=False)

    def get_serializer_class(self):
        return ProjectStubSerializer
    
    def get_queryset(self):
        projects = Project.objects.filter(is_draft=False)
        if 'collaboration' in self.request.query_params:
            collaborators_welcome = self.request.query_params.get('collaboration')
            if collaborators_welcome == 'yes':
                projects = projects.filter(collaborators_welcome=True)
            if collaborators_welcome == 'no':
                projects = projects.filter(collaborators_welcome=False)              

        if 'category' in self.request.query_params:
            project_category = self.request.query_params.get('category').split(',')
            project_tags = ProjectTags.objects.filter(name__in=project_category)
            projects = projects.filter(
                tag_project__project_tag__in=project_tags
            ).distinct('id')

        if 'status' in self.request.query_params:
            statuses = self.request.query_params.get('status').split(',')
            projects = projects.filter(status__name__in=statuses)

        if 'skills' in self.request.query_params:
            skill_names = self.request.query_params.get('skills').split(',')
            skills = Skill.objects.filter(name__in=skill_names)
            projects = projects.filter(skills__in=skills).distinct('id')

        if 'organization_type' in self.request.query_params:
            organization_type_names = self.request.query_params.get('organization_type').split(',')
            organization_types = OrganizationTags.objects.filter(name__in=organization_type_names)
            organization_taggings = OrganizationTagging.objects.filter(organization_tag__in=organization_types)
            project_parents = ProjectParents.objects.filter(parent_organization__tag_organization__in=organization_taggings)
            projects = projects.filter(project_parent__in=project_parents)
        return projects


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
            ProjectStatus.objects.get(id=int(request.data["status"]))
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
        team_members = request.data['team_members']
            
        if 'project_tags' in request.data:
            order = len(request.data['project_tags'])
            for project_tag_id in request.data['project_tags']:
                try:
                    project_tag = ProjectTags.objects.get(id=int(project_tag_id))
                except ProjectTags.DoesNotExist:
                    logger.error("Passed project tag ID {} does not exists".format(project_tag_id))
                    continue
                if project_tag:
                    ProjectTagging.objects.create(
                        project=project, project_tag=project_tag, order = order
                    )
                    order = order - 1
                    logger.info("Project tagging created for project {}".format(project.id))

        for member in team_members:
            user_role = roles.filter(id=int(member['role'])).first()
            try:
                user_availability = Availability.objects.filter(id=int(member['availability'])).first()
            except Availability.DoesNotExist:
                raise NotFound(detail="Availability not found.", code=status.HTTP_404_NOT_FOUND)
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
        if project.is_draft:
            try:
                ProjectMember.objects.get(user=self.request.user, project=project, role__role_type__in=[Role.ALL_TYPE, Role.READ_ONLY_TYPE])
            except ProjectMember.DoesNotExist:
                return Response({'message': 'Project not found: {}'.format(url_slug)}, status=status.HTTP_404_NOT_FOUND)
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
        
        old_project_taggings = ProjectTagging.objects.filter(project=project)
        old_project_tags = old_project_taggings.values('project_tag')
        if 'project_tags' in request.data:
            order = len(request.data['project_tags'])
            for tag in old_project_tags:
                if not tag['project_tag'] in request.data['project_tags']:
                    logger.error("this tag needs to be deleted: "+str(tag['project_tag']))
                    tag_to_delete = ProjectTags.objects.get(id=tag['project_tag'])
                    ProjectTagging.objects.filter(project=project, project_tag=tag_to_delete).delete()
            for tag_id in request.data['project_tags']:
                old_taggings = old_project_taggings.filter(project_tag=tag_id)
                if not old_taggings.exists():
                    try:
                        tag = ProjectTags.objects.get(id=tag_id)
                        ProjectTagging.objects.create(
                            project_tag=tag, project=project, order = order
                        )
                    except ProjectTags.DoesNotExist:
                        logger.error("Passed proj tag id {} does not exists")
                else:
                    old_tagging = old_taggings[0]
                    logger.error(order)
                    logger.error(old_tagging.order)
                    logger.error(old_tagging)
                    if not old_tagging.order == order:
                        old_tagging.order = int(order)
                        logger.error(old_tagging.order)
                        old_tagging.save()
                order = order - 1
        if 'image' in request.data:
            project.image = get_image_from_data_url(request.data['image'])[0]
        if 'thumbnail_image' in request.data:
            project.thumbnail_image = get_image_from_data_url(request.data['thumbnail_image'])[0]
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
        if 'is_draft' in request.data:
            project.is_draft = False
        if 'website' in request.data:
            project.website = request.data['website']
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
    
    def delete(self, request, url_slug, format=None):
        try:
            project = Project.objects.get(url_slug=str(url_slug))            
        except Project.DoesNotExist:
            return Response({'message': 'Project not found: {}'.format(url_slug)}, status=status.HTTP_404_NOT_FOUND)
        project.delete()
        return Response({
            'message': 'Project {} successfully deleted'.format(project.name),
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
        )
    
class AddProjectMembersView(APIView):
    permission_classes = [AddProjectMemberPermission]

    def post(self, request, url_slug):
        project = Project.objects.get(url_slug=url_slug)

        roles = Role.objects.all()
        if 'team_members' not in request.data:
            return Response({
                'message': 'Missing required parameters'
            }, status=status.HTTP_400_BAD_REQUEST)

        for member in request.data['team_members']:
            try:
                user = User.objects.get(id=int(member['id']))
            except User.DoesNotExist:
                logger.error("[AddProjectMembersView] Passed user id {} does not exists".format(int(member['id'])))
                continue
            if 'permission_type_id' not in member:
                logger.error("[AddProjectMembersView] Not permissions passed for user id {}.".format(int(member['id'])))
                continue
            user_role = roles.filter(id=int(member['permission_type_id'])).first()
            try:
                user_availability = Availability.objects.filter(id=int(member['availability'])).first()
            except Availability.DoesNotExist:
                raise NotFound(detail="Availability not found.", code=status.HTTP_404_NOT_FOUND)
            if user:
                ProjectMember.objects.create(
                    project=project, user=user, role=user_role, role_in_project=member['role_in_project'], availability=user_availability
                )
                logger.info("Project member created for user {}".format(user.id))

        return Response({'message': 'Member added to the project'}, status=status.HTTP_201_CREATED)


class UpdateProjectMemberView(RetrieveUpdateDestroyAPIView):
    permission_classes = [ProjectMemberReadWritePermission]
    serializer_class = InsertProjectMemberSerializer

    def get_queryset(self):
        project = Project.objects.get(url_slug=str(self.kwargs['url_slug']))
        return ProjectMember.objects.filter(id=int(self.kwargs['pk']), project=project)

    def perform_destroy(self, instance):
        instance.delete()
        return "Project Member successfully deleted."

    def perform_update(self, serializer):
        serializer.save()
        return serializer.data

class ChangeProjectCreator(APIView):
    permission_classes = [ChangeProjectCreatorPermission]

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

        project = Project.objects.get(url_slug=url_slug)
        roles = Role.objects.all()   

        if ProjectMember.objects.filter(user=new_creator_user, project = project).exists():
            # update old creator profile and new creator profile
            logger.error('updating new creator')
            new_creator = ProjectMember.objects.filter(user=request.data['user'], project = project, id = request.data['id'])[0]
            new_creator.role = roles.filter(role_type=Role.ALL_TYPE)[0]
            if('role_in_project' in request.data):
                new_creator.role_in_project = request.data['role_in_project']
            if('availability' in request.data):
                try:
                    user_availability = Availability.objects.filter(id=int(request.data['availability'])).first()
                except Availability.DoesNotExist:
                    raise NotFound(detail="Availability not found.", code=status.HTTP_404_NOT_FOUND)
                new_creator.user_availability = request.data['availability']
            new_creator.save()
        else:
            # create new creator profile and update old creator profile
            logger.error('adding new creator')
            new_creator = ProjectMember.objects.create(
                role = roles.filter(role_type=Role.ALL_TYPE)[0],
                project = project,
                user = new_creator_user
            )
            if('role_in_project' in request.data):
                new_creator.role_in_project = request.data['role_in_project']
            new_creator.save()
        old_creator = ProjectMember.objects.filter(user=request.user, project = project)[0]
        old_creator.role = roles.filter(role_type=Role.READ_WRITE_TYPE)[0]
        old_creator.save()

        return Response({'message': 'Changed project creator'}, status=status.HTTP_200_OK)


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

class SetFollowView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, url_slug):
        if 'following' not in request.data:
            return Response({
                'message': 'Missing required parameters'
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            project = Project.objects.get(url_slug=url_slug)
        except Project.DoesNotExist:
            raise NotFound(detail="Project not found.", code=status.HTTP_404_NOT_FOUND)

        if request.data['following']==True:
            if ProjectFollower.objects.filter(user=request.user, project=project).exists():
                raise ValidationError("You're already following this project.")
            else:
                ProjectFollower.objects.create(user=request.user, project=project)
                return Response({
                    'message': 'You are now following this project. You will be notified when they post an update!',
                    'following': True
                }, status=status.HTTP_200_OK)
        if request.data['following']==False:
            try:
                follower_object = ProjectFollower.objects.get(user=request.user, project=project)
            except ProjectFollower.DoesNotExist:
                raise NotFound(detail="You weren't following this project.", code=status.HTTP_404_NOT_FOUND)
            follower_object.delete()
            return Response({'message': 'You are not following this project anymore.', 'following': False}, status=status.HTTP_200_OK)
        else:
            return Response({
                'message': 'Invalid value for variable "following"'
            }, status=status.HTTP_400_BAD_REQUEST)

class IsUserFollowing(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, url_slug):
        try:
            project = Project.objects.get(url_slug=url_slug)
        except Project.DoesNotExist:
            raise NotFound(detail="Project not found:"+url_slug, code=status.HTTP_404_NOT_FOUND)
        is_following = ProjectFollower.objects.filter(user=request.user, project=project).exists()
        return Response({'is_following': is_following}, status=status.HTTP_200_OK)

class ProjectCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, url_slug):
        try:
            project = Project.objects.get(url_slug=url_slug)
        except Project.DoesNotExist:
            raise NotFound(detail="Project not found:"+url_slug, code=status.HTTP_404_NOT_FOUND)
        if 'content' not in request.data:
            return Response({
                'message': 'Missing required parameters'
            }, status=status.HTTP_400_BAD_REQUEST)
        comment = ProjectComment.objects.create(
            author_user = request.user, content=request.data['content'], project=project
        )
        if 'parent_comment' in request.data:
            try:
                parent_comment = ProjectComment.objects.get(id=request.data['parent_comment'])
            except ProjectComment.DoesNotExist:
                raise NotFound(detail="Parent comment not found:"+request.data['parent_comment'], code=status.HTTP_404_NOT_FOUND)
            comment.parent_comment = parent_comment
        comment.save()
        return Response({'comment': ProjectCommentSerializer(comment).data}, status=status.HTTP_200_OK)

    def delete(self, request, url_slug, comment_id):
        try:
            project = Project.objects.get(url_slug=url_slug)
        except Project.DoesNotExist:
            raise NotFound(detail="Project not found:"+url_slug, code=status.HTTP_404_NOT_FOUND)
        try:
            comment = ProjectComment.objects.get(project=project, id=comment_id, author_user=request.user)
        except ProjectComment.DoesNotExist:
            raise NotFound(
                detail="Project comment not found. Project:"+url_slug+" Comment:"+comment_id, 
                code=status.HTTP_404_NOT_FOUND
            )
        comment.delete()
        return Response(status=status.HTTP_200_OK)

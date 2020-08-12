import uuid
from django.contrib.auth import (authenticate, login)
import datetime
from django.utils import timezone
from datetime import datetime, timedelta

# Rest imports
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveUpdateAPIView
from rest_framework.exceptions import NotFound
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter

from rest_framework.exceptions import ValidationError
from knox.views import LoginView as KnowLoginView
from climateconnect_api.pagination import MembersPagination

# Database imports
from django.contrib.auth.models import User
from organization.models.members import (ProjectMember, OrganizationMember)
from climateconnect_api.models import UserProfile, Availability, Skill

# Serializer imports
from climateconnect_api.serializers.user import (
    UserProfileSerializer, PersonalProfileSerializer, UserProfileStubSerializer, UserProfileMinimalSerializer
)
from organization.serializers.project import ProjectFromProjectMemberSerializer
from organization.serializers.organization import OrganizationsFromProjectMember

from climateconnect_main.utility.general import get_image_from_data_url
from climateconnect_api.permissions import UserPermission
from climateconnect_api.utility.email_setup import send_user_verification_email
from climateconnect_api.utility.email_setup import send_password_link
from django.conf import settings
import logging
logger = logging.getLogger(__name__)


class LoginView(KnowLoginView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        if 'username' and 'password' not in request.data:
            message = "Must include 'username' and 'password'"
            return Response({'message': message}, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=request.data['username'], password=request.data['password'])
        if user:            
            logger.error("authenticating "+request.data['username'])
            user_profile = UserProfile.objects.filter(user = user)[0]
            if not user_profile.is_profile_verified:
                message = "You first have to activate your account by clicking the link we sent to your E-Mail."
                return Response({'message': message, 'type': 'not_verified'}, status=status.HTTP_400_BAD_REQUEST)
            login(request, user)
            if user_profile.has_logged_in<2:
                user_profile.has_logged_in = user_profile.has_logged_in +1 
                user_profile.save()
            return super(LoginView, self).post(request, format=None)
        else:
            if not User.objects.filter(username=request.data['username']).exists():
                return Response({
                    'message': 'Username does not exist. Have you signed up yet?'
                }, status=status.HTTP_401_UNAUTHORIZED)
            return Response({
                'message': 'Invalid password.'
            }, status=status.HTTP_401_UNAUTHORIZED)


class SignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        required_params = [
            'email', 'password', 'first_name', 'last_name',
            'country', 'city', 'email_project_suggestions', 'email_updates_on_projects'
        ]
        for param in required_params:
            if param not in request.data:
                raise ValidationError('Required parameter is missing')

        if User.objects.filter(username=request.data['email']).exists():
            raise ValidationError("Email already in use.")

        user = User.objects.create(
            username=request.data['email'],
            email=request.data['email'], first_name=request.data['first_name'],
            last_name=request.data['last_name'], is_active=True
        )

        user.set_password(request.data['password'])
        user.save()

        url_slug = (user.first_name + user.last_name).lower() + str(user.id)

        user_profile = UserProfile.objects.create(
            user=user, country=request.data['country'],
            city=request.data['city'],
            url_slug=url_slug, name=request.data['first_name']+" "+request.data['last_name'],
            verification_key=uuid.uuid4(),
            email_project_suggestions=request.data['email_project_suggestions'],
            email_updates_on_projects=request.data['email_updates_on_projects']
        )

        if settings.AUTO_VERIFY == True:
            user_profile.is_profile_verified = True
            user_profile.save()
            message = "Congratulations! Your account has been created"
        else:
            send_user_verification_email(user, user_profile.verification_key)
            message = "You're almost done! We have sent an email with a confirmation link to {}. Finish creating your account by clicking the link.".format(user.email)  # NOQA
        

        return Response({'success': message}, status=status.HTTP_201_CREATED)


class PersonalProfileView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        # TODO: Add filters
        user = request.user
        if not UserProfile.objects.filter(user=user).exists():
            raise NotFound(detail="Profile not found.", code=status.HTTP_404_NOT_FOUND)

        user_profile = UserProfile.objects.get(user=self.request.user)
        serializer = PersonalProfileSerializer(user_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ListMemberProfilesView(ListAPIView):
    permission_classes = [AllowAny]
    pagination_class = MembersPagination
    filter_backends = [SearchFilter, DjangoFilterBackend]
    filterset_fields = ['name', 'country', 'city']
    search_fields = ['name']

    def get_serializer_class(self):
        return UserProfileStubSerializer

    def get_queryset(self):
        user_profiles = UserProfile.objects.filter(is_profile_verified=True)
        if 'skills' in self.request.query_params:
            skill_names = self.request.query_params.get('skills').split(',')
            skills = Skill.objects.filter(name__in=skill_names)
            user_profiles = user_profiles.filter(skills__in=skills).distinct('id')
        return user_profiles


class MemberProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, url_slug, format=None):
        try:
            profile = UserProfile.objects.get(url_slug=str(url_slug))
        except UserProfile.DoesNotExist:
            return Response({'message': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        if self.request.user.is_authenticated:
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            serializer = UserProfileMinimalSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)


class ListMemberProjectsView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ['parent_organization__url_slug']
    pagination_class = MembersPagination
    serializer_class = ProjectFromProjectMemberSerializer

    def get_queryset(self):
        searched_user = UserProfile.objects.get(url_slug=self.kwargs['url_slug']).user
        if self.request.user == searched_user:     
            return ProjectMember.objects.filter(
                user=searched_user
            ).order_by('-id')
        else:
            return ProjectMember.objects.filter(
                user=searched_user,
                project__is_draft=False
            ).order_by('-id')


class ListMemberOrganizationsView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ['parent_organization__url_slug']
    pagination_class = MembersPagination
    serializer_class = OrganizationsFromProjectMember

    def get_queryset(self):
        return OrganizationMember.objects.filter(
            user=UserProfile.objects.get(url_slug=self.kwargs['url_slug']).user,
        ).order_by('id')


class EditUserProfile(APIView):
    permission_classes = [UserPermission]

    def get(self, request):
        try:
            user_profile = UserProfile.objects.get(user=self.request.user)
        except UserProfile.DoesNotExist:
            raise NotFound('User not found.')

        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            user_profile = UserProfile.objects.get(user=self.request.user)
        except UserProfile.DoesNotExist:
            raise NotFound('User not found.')
        user = user_profile.user
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']

        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        user_profile.name = user.first_name + ' ' + user.last_name
        user_profile.url_slug = (user.first_name + user.last_name).lower() + str(user.id)
        user.save()
        logger.error("starting to save image")
        if 'image' in request.data:
            user_profile.image = get_image_from_data_url(request.data['image'])[0]
        logger.error("done with image")
        if 'background_image' in request.data:
            user_profile.background_image = get_image_from_data_url(request.data['background_image'], True, 1280)[0]
        logger.error("done with background image")
        if 'country' in request.data:
            user_profile.country = request.data['country']

        if 'state' in request.data:
            user_profile.state = request.data['state']
        if 'city' in request.data:
            user_profile.city = request.data['city']
        if 'biography' in request.data:
            user_profile.biography = request.data['biography']
        if 'website' in request.data:
            user_profile.website = request.data['website']

        if 'availability' in request.data:
            try:
                availability = Availability.objects.get(id=int(request.data['availability']))
            except Availability.DoesNotExist:
                raise NotFound('Availability not found.')

            user_profile.availability = availability

        if 'skills' in request.data:
            for skill in user_profile.skills.all():
                if not skill.id in request.data['skills']:
                    logger.error("this skill needs to be deleted: "+skill.name)
                    user_profile.skills.remove(skill)
            for skill_id in request.data['skills']:
                try:
                    skill = Skill.objects.get(id=int(skill_id))
                    user_profile.skills.add(skill)
                except Skill.DoesNotExist:
                    logger.error("Passed skill id {} does not exists")
        user_profile.save()
        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserEmailVerificationLinkView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        if 'uuid' not in request.data:
            return Response({'message': 'Required parameters are missing.'}, status=status.HTTP_400_BAD_REQUEST)

        # convert verification string
        print(request.data)
        verification_key = request.data['uuid'].replace('%2D', '-')
        try:
            user_profile = UserProfile.objects.get(verification_key=verification_key)
        except User.DoesNotExist:
            return Response({'message': 'Bad request'}, status=status.HTTP_400_BAD_REQUEST)
        if user_profile:
            if user_profile.is_profile_verified:
                return Response({
                    'message': 'Account already verified. Please contact us if you are having trouble signing in.'
                }, status=status.HTTP_204_NO_CONTENT)
            else:
                user_profile.is_profile_verified = True
                user_profile.save()
                return Response({"message": "Your profile is successfully verified"}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Permission Denied'}, status=status.HTTP_403_FORBIDDEN)

class SendResetPasswordEmail(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        if 'email' not in request.data:
            return Response({'message': 'Required parameters are missing.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user_profile = UserProfile.objects.get(user__username=request.data['email'])
        except UserProfile.DoesNotExist:
            return Response({'message': 'There is no profile with this email address.'}, status=status.HTTP_400_BAD_REQUEST)
        user_profile.password_reset_key = uuid.uuid4()
        timeout = datetime.now(timezone.utc) + timedelta(minutes=15)
        user_profile.password_reset_timeout = timeout
        send_password_link(user_profile.user, user_profile.password_reset_key)
        user_profile.save()

        return Response({"message": "We have sent you an email with your new password. It may take up to 5 minutes to arrive."}, status=status.HTTP_200_OK)

class ResendVerificationEmail(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        if 'email' not in request.data:
            return Response({'message': 'Required parameters are missing.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user_profile = UserProfile.objects.get(user__username=request.data['email'])
        except UserProfile.DoesNotExist:
            return Response({'message': 'There is no profile with this email address. Try entering the correct email address or signing up again.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if user_profile.is_profile_verified:
            return Response({'message': 'Your profile is already verified. You can not log in with your account.'}, status=status.HTTP_400_BAD_REQUEST)
        
        send_user_verification_email(user_profile.user, user_profile.verification_key)

        return Response({"message": "We have send you your verification email again. It may take up to 5 minutes to arrive. Make sure to also check your junk or spam folder."}, status=status.HTTP_200_OK)

class SetNewPassword(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        if 'password_reset_key' not in request.data or 'new_password' not in request.data:
            return Response({'message': 'Required parameters are missing.'}, status=status.HTTP_400_BAD_REQUEST)
        password_reset_key = request.data['password_reset_key'].replace('%2D', '-')
        try:
            user_profile = UserProfile.objects.get(password_reset_key=password_reset_key)
        except UserProfile.DoesNotExist:
            logger.error(password_reset_key)
            return Response({'message': 'Profile not found.', 'type': 'not_found'}, status=status.HTTP_400_BAD_REQUEST)
        if user_profile.password_reset_timeout > datetime.now(timezone.utc):
            user_profile.user.set_password(request.data['new_password'])
            user_profile.password_reset_timeout = datetime.now(timezone.utc)
            user_profile.user.save()
            user_profile.save()
            logger.error("reset password for user "+user_profile.url_slug)
        else:
            return Response({"message": "This link has expired. Please reset your password again.", "type": "link_timed_out"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "You have successfully set a new password. You may now log in with your new password."}, status=status.HTTP_200_OK)
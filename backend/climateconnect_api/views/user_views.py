from django.contrib.auth import (authenticate, login)

# Rest imports
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter

from rest_framework.exceptions import ValidationError
from knox.views import LoginView as KnowLoginView

# Database imports
from django.contrib.auth.models import User
from climateconnect_api.models.user import UserProfile

# Serializer imports
from climateconnect_api.serializers.user import (
    UserProfileSerializer, PersonalProfileSerializer, UserProfileStubSerializer
)


class LoginView(KnowLoginView):
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        if 'username' and 'password' not in request.data:
            message = "Must include 'username' and 'password'"
            return Response({'message': message}, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=request.data['username'], password=request.data['password'])
        if user:
            login(request, user)
            return super(LoginView, self).post(request, format=None)
        else:
            return Response({
                'message': 'Invalid password or username.'
            }, status=status.HTTP_401_UNAUTHORIZED)


class SignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        required_params = [
            'email', 'password', 'first_name', 'last_name',
            'country', 'city'
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

        url_slug = (user.first_name + user.last_name).lower() + user.id

        UserProfile.objects.create(
            user=user, country=request.data['country'],
            state=request.data['state'], city=request.data['city'],
            url_slug=url_slug
        )

        # TODO: Call a function that sends an email to user.

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


class MemberProfilesView(ListAPIView):
    permission_classes = [AllowAny]
    pagination_class = PageNumberPagination
    filter_backends = [SearchFilter]
    search_fields = ['url_slug']

    def get_queryset(self):
        user_profiles = UserProfile.objects.filter(is_profile_verified=True)
        if self.request.user.is_authenticated: 
            serializer = UserProfileSerializer(user_profiles)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            serializer = UserProfileStubSerializer(user_profiles)
            return Response(serializer.data, status=status.HTTP_200_OK)

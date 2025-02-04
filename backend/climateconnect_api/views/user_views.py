import logging
import uuid
from datetime import datetime, timedelta

from climateconnect_api.models import Availability, Skill, UserProfile
from climateconnect_api.models.language import Language
from climateconnect_api.pagination import MembersPagination, MembersSitemapPagination
from climateconnect_api.permissions import UserPermission
from climateconnect_api.serializers.user import (
    EditUserProfileSerializer,
    PersonalProfileSerializer,
    UserProfileMinimalSerializer,
    UserProfileSerializer,
    UserProfileSitemapEntrySerializer,
    UserProfileStubSerializer,
)
from climateconnect_api.utility.email_setup import (
    send_password_link,
    send_user_verification_email,
)
from climateconnect_api.utility.translation import edit_translations
from climateconnect_main.utility.general import get_image_from_data_url
from django.conf import settings
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.contrib.gis.db.models.functions import Distance
from django.db.models import Count, Q
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.utils.translation import gettext as _
from climateconnect_api.utility.common import create_unique_slug

from django.views.decorators.cache import cache_page
from django_filters.rest_framework import DjangoFilterBackend
from hubs.models.hub import Hub
from ideas.models.support import IdeaSupporter
from ideas.serializers.idea import IdeaFromIdeaSupporterSerializer
from knox.views import LoginView as KnoxLoginView
from location.models import Location
from location.utility import get_location, get_location_with_range
from organization.models.members import OrganizationMember, ProjectMember
from organization.serializers.organization import OrganizationsFromOrganizationMember
from organization.serializers.project import ProjectFromProjectMemberSerializer
from rest_framework import status
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.filters import SearchFilter
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)


class LoginView(KnoxLoginView):
    permission_classes = [AllowAny]

    # Tries to log the user in with the provided
    # credentials (username and password).
    def post(self, request, format=None):
        if "username" and "password" not in request.data:
            message = "Must include 'username' and 'password'"
            return Response({"message": message}, status=status.HTTP_400_BAD_REQUEST)

        # First, authenticate the user
        user = authenticate(
            username=request.data["username"], password=request.data["password"]
        )

        if user:
            user_profile = UserProfile.objects.filter(user=user)[0]
            if not user_profile.is_profile_verified:
                message = "You first have to activate your account by clicking the link we sent to your E-Mail."
                return Response(
                    {"message": message, "type": "not_verified"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if user.is_authenticated:
                print("User is authenticated")

            # Then, log in the user to attach them to the current Django session,
            # and ensure we have a valid User object (instead of AnonymousUser).
            # See more: https://docs.djangoproject.com/en/4.0/topics/auth/default/#how-to-log-a-user-in
            login(request, user)

            if user_profile.has_logged_in < 2:
                user_profile.has_logged_in = user_profile.has_logged_in + 1
                user_profile.save()

            return super(LoginView, self).post(request, format=None)
        else:
            return Response(
                {"message": _("Invalid email or password")},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return Response(
            {"message": "Invalid password."}, status=status.HTTP_401_UNAUTHORIZED
        )


class SignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        required_params = [
            "email",
            "password",
            "first_name",
            "last_name",
            "location",
            "send_newsletter",
            "source_language",
        ]
        for param in required_params:
            if param not in request.data:
                raise ValidationError("Required parameter is missing")

        if User.objects.filter(username=request.data["email"]).exists():
            raise ValidationError("Email already in use.")

        location = get_location(request.data["location"])

        user = User.objects.create(
            username=request.data["email"],
            email=request.data["email"],
            first_name=request.data["first_name"],
            last_name=request.data["last_name"],
            is_active=True,
        )

        user.set_password(request.data["password"])
        user.save()

        full_name = user.first_name + "-" + user.last_name
        url_slug = create_unique_slug(full_name, user.id, UserProfile.objects)
        # Get location
        source_language = Language.objects.get(
            language_code=request.data["source_language"]
        )
        user_profile = UserProfile.objects.create(
            user=user,
            location=location,
            url_slug=url_slug,
            name=request.data["first_name"] + " " + request.data["last_name"],
            verification_key=uuid.uuid4(),
            send_newsletter=request.data["send_newsletter"],
            language=source_language,
        )
        if "is_activist" in request.data:
            user_profile.is_activist = request.data["is_activist"]
        # if "last_completed_tutorial_step" in request.data:
        #     user_profile.last_completed_tutorial_step = request.data[
        #         "last_completed_tutorial_step"
        #     ]

        hub = Hub.objects.filter(url_slug=request.data["hub"]).first()
        if hub:
            user_profile.related_hubs.add(hub)

        if settings.AUTO_VERIFY is True:
            user_profile.is_profile_verified = True
            message = "Congratulations! Your account has been created"
        else:
            send_user_verification_email(user, user_profile.verification_key)
            message = "You're almost done! We have sent an email with a confirmation link to {}. Finish creating your account by clicking the link.".format(
                user.email
            )  # NOQA
        user_profile.save()

        return Response({"success": message}, status=status.HTTP_201_CREATED)


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
    filterset_fields = ["name"]
    search_fields = ["name"]
    serializer_class = UserProfileStubSerializer

    @method_decorator(
        cache_page(settings.DEFAULT_CACHE_TIMEOUT, key_prefix="LIST_MEMBERS")
    )
    def dispatch(self, *args, **kwargs):
        return super(ListMemberProfilesView, self).dispatch(*args, **kwargs)

    def get_queryset(self):
        user_profiles = (
            UserProfile.objects.filter(is_profile_verified=True)
            .prefetch_related("user", "location")
            .annotate(is_image_null=Count("image", filter=Q(image="")))
            .order_by("is_image_null", "-id")
        )

        if "hub" in self.request.query_params:
            hubs = Hub.objects.filter(url_slug=self.request.query_params["hub"])
            if hubs.exists():
                hub = hubs[0]
                if hub.hub_type == Hub.LOCATION_HUB_TYPE:
                    location = hub[0].location.all()[0]
                    user_profiles = user_profiles.filter(
                        Q(location__country=location.country)
                        & (
                            Q(
                                location__multi_polygon__coveredby=(
                                    location.multi_polygon
                                )
                            )
                            | Q(
                                location__centre_point__coveredby=(
                                    location.multi_polygon
                                )
                            )
                        )
                    ).annotate(
                        distance=Distance(
                            "location__centre_point", location.multi_polygon
                        )
                    )
            elif hub.hub_type == Hub.CUSTOM_HUB_TYPE:
                    user_profiles = user_profiles.filter(related_hubs=hub)

        if "skills" in self.request.query_params:
            skill_names = self.request.query_params.get("skills").split(",")
            skills = Skill.objects.filter(name__in=skill_names)
            user_profiles = user_profiles.filter(skills__in=skills).distinct()
            # user_profiles = user_profiles.filter(id__in=user_profiles.filter(skills__in=skills).values('id'))

        if "place" in self.request.query_params and "osm" in self.request.query_params:
            location_data = get_location_with_range(self.request.query_params)
            user_profiles = (
                user_profiles.filter(
                    Q(location__country=location_data["country"])
                    & (
                        Q(
                            location__multi_polygon__distance_lte=(
                                location_data["location"],
                                location_data["radius"],
                            )
                        )
                        | Q(
                            location__centre_point__distance_lte=(
                                location_data["location"],
                                location_data["radius"],
                            )
                        )
                    )
                )
                .annotate(
                    distance=Distance(
                        "location__centre_point", location_data["location"]
                    )
                )
                .order_by("distance")
            )

        if "country" and "city" in self.request.query_params:
            location_ids = Location.objects.filter(
                country=self.request.query_params.get("country"),
                city=self.request.query_params.get("city"),
            )
            user_profiles = user_profiles.filter(location__in=location_ids)

        if (
            "city" in self.request.query_params
            and "country" not in self.request.query_params
        ):
            location_ids = Location.objects.filter(
                city=self.request.query_params.get("city")
            )
            user_profiles = user_profiles.filter(location__in=location_ids)

        if (
            "country" in self.request.query_params
            and "city" not in self.request.query_params
        ):
            location_ids = Location.objects.filter(
                country=self.request.query_params.get("country")
            )
            user_profiles = user_profiles.filter(location__in=location_ids)

        return user_profiles


class MemberProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, url_slug, format=None):
        try:
            profile = UserProfile.objects.get(url_slug=str(url_slug))
        except UserProfile.DoesNotExist:
            return Response(
                {"message": "Profile not found."}, status=status.HTTP_404_NOT_FOUND
            )

        if self.request.user.is_authenticated:
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            serializer = UserProfileMinimalSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)


class ListMemberProjectsView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ["parent_organization__url_slug"]
    pagination_class = MembersPagination
    serializer_class = ProjectFromProjectMemberSerializer

    def get_queryset(self):
        searched_user = UserProfile.objects.get(url_slug=self.kwargs["url_slug"]).user
        if self.request.user == searched_user:
            return ProjectMember.objects.filter(
                user=searched_user, is_active=True
            ).order_by("-id")
        else:
            return ProjectMember.objects.filter(
                user=searched_user, project__is_draft=False, is_active=True
            ).order_by("-id")


class ListMemberIdeasView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ["parent_organization__url_slug"]
    pagination_class = MembersPagination
    serializer_class = IdeaFromIdeaSupporterSerializer

    def get_queryset(self):
        searched_user = UserProfile.objects.get(url_slug=self.kwargs["url_slug"]).user
        return IdeaSupporter.objects.filter(user=searched_user).order_by("-id")


class ListMemberOrganizationsView(ListAPIView):
    permission_classes = [AllowAny]
    filter_backends = [SearchFilter]
    search_fields = ["parent_organization__url_slug"]
    pagination_class = MembersPagination
    serializer_class = OrganizationsFromOrganizationMember

    def get_queryset(self):
        return OrganizationMember.objects.filter(
            user=UserProfile.objects.get(url_slug=self.kwargs["url_slug"]).user,
        ).order_by("id")


class EditUserProfile(APIView):
    permission_classes = [UserPermission]

    def get(self, request):
        try:
            user_profile = UserProfile.objects.get(user=self.request.user)
        except UserProfile.DoesNotExist:
            raise NotFound("User not found.")

        serializer = EditUserProfileSerializer(user_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            user_profile = UserProfile.objects.get(user=self.request.user)
        except UserProfile.DoesNotExist:
            raise NotFound("User not found.")
        user = user_profile.user
        if "first_name" in request.data:
            user.first_name = request.data["first_name"]

        if "last_name" in request.data:
            user.last_name = request.data["last_name"]
        user_profile.name = user.first_name + " " + user.last_name
        user.save()

        if "image" in request.data:
            if request.data["image"] is not None:
                user_profile.image = get_image_from_data_url(request.data["image"])[0]
            elif request.data["image"] is None:
                user_profile.image = None

        if "thumbnail_image" in request.data:
            if request.data["thumbnail_image"] is not None:
                user_profile.thumbnail_image = get_image_from_data_url(
                    request.data["thumbnail_image"]
                )[0]
            elif request.data["thumbnail_image"] is None:
                user_profile.thumbnail_image = None

        if "background_image" in request.data:
            if request.data["background_image"] is not None:
                user_profile.background_image = get_image_from_data_url(
                    request.data["background_image"], True, 1280
                )[0]

            elif request.data["background_image"] is None:
                user_profile.background_image = None

        if "location" in request.data:
            geo_location = get_location(request.data["location"])
            user_profile.location = geo_location

        if "biography" in request.data:
            user_profile.biography = request.data["biography"]
        if "website" in request.data:
            user_profile.website = request.data["website"]
        if "language" in request.data:
            language = Language.objects.filter(language_code=request.data["language"])
            if language.exists():
                user_profile.language = language[0]

        if "availability" in request.data:
            try:
                availability = Availability.objects.get(
                    id=int(request.data["availability"])
                )
            except Availability.DoesNotExist:
                raise NotFound("Availability not found.")

            user_profile.availability = availability

        if "skills" in request.data:
            for skill in user_profile.skills.all():
                if skill.id not in request.data["skills"]:
                    user_profile.skills.remove(skill)
            for skill_id in request.data["skills"]:
                try:
                    skill = Skill.objects.get(id=int(skill_id))
                    user_profile.skills.add(skill)
                except Skill.DoesNotExist:
                    logger.error("Passed skill id {} does not exists")

        user_profile.save()

        items_to_translate = [
            {"key": "biography", "translation_key": "biography_translation"},
        ]
        if "translations" not in request.data:
            request.data["translations"] = {}
        edit_translations(
            items_to_translate, request.data, user_profile, "user_profile"
        )

        serializer = UserProfileSerializer(user_profile)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserEmailVerificationLinkView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        if "uuid" not in request.data:
            return Response(
                {"message": _("Required parameters are missing.")},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # convert verification string
        verification_key = request.data["uuid"].replace("%2D", "-")
        try:
            user_profile = UserProfile.objects.get(verification_key=verification_key)
        except UserProfile.DoesNotExist:
            return Response(
                {
                    "message": _("User profile not found.")
                    + " "
                    + _(
                        "Contact contact@climateconnect.earth if you repeatedly experience problems."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if user_profile:
            if user_profile.is_profile_verified:
                return Response(
                    {
                        "message": _(
                            "Account already verified. Please contact us if you are having trouble signing in."
                        )
                    },
                    status=status.HTTP_204_NO_CONTENT,
                )
            else:
                user_profile.is_profile_verified = True
                user_profile.save()
                return Response(
                    {"message": _("Your profile is successfully verified")},
                    status=status.HTTP_200_OK,
                )
        else:
            return Response(
                {"message": _("Permission Denied")}, status=status.HTTP_403_FORBIDDEN
            )


class SendResetPasswordEmail(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        if "email" not in request.data:
            return Response(
                {"message": "Required parameters are missing."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user_profile = UserProfile.objects.get(user__username=request.data["email"])
        except UserProfile.DoesNotExist:
            return Response(
                {"message": "There is no profile with this email address."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user_profile.password_reset_key = uuid.uuid4()
        timeout = datetime.now(timezone.utc) + timedelta(minutes=15)
        user_profile.password_reset_timeout = timeout
        send_password_link(user_profile.user, user_profile.password_reset_key)
        user_profile.save()

        return Response(
            {
                "message": "We have sent you an email with your new password. It may take up to 5 minutes to arrive."
            },
            status=status.HTTP_200_OK,
        )


class ResendVerificationEmail(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        if "email" not in request.data:
            return Response(
                {"message": "Required parameters are missing."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user_profile = UserProfile.objects.get(user__username=request.data["email"])
        except UserProfile.DoesNotExist:
            return Response(
                {
                    "message": "There is no profile with this email address. Try entering the correct email address or signing up again."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user_profile.is_profile_verified:
            return Response(
                {
                    "message": "Your profile is already verified. You now log in with your account."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        send_user_verification_email(user_profile.user, user_profile.verification_key)

        return Response(
            {
                "message": "We have send you your verification email again. It may take up to 5 minutes to arrive. Make sure to also check your junk or spam folder."
            },
            status=status.HTTP_200_OK,
        )


class SetNewPassword(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        if (
            "password_reset_key" not in request.data
            or "new_password" not in request.data
        ):
            return Response(
                {"message": "Required parameters are missing."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        password_reset_key = request.data["password_reset_key"].replace("%2D", "-")
        try:
            user_profile = UserProfile.objects.get(
                password_reset_key=password_reset_key
            )
        except UserProfile.DoesNotExist:
            return Response(
                {"message": "Profile not found.", "type": "not_found"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if user_profile.password_reset_timeout > datetime.now(timezone.utc):
            user_profile.user.set_password(request.data["new_password"])
            user_profile.password_reset_timeout = datetime.now(timezone.utc)
            user_profile.user.save()
            user_profile.save()
            logger.error("reset password for user " + user_profile.url_slug)
        else:
            return Response(
                {
                    "message": "This link has expired. Please reset your password again.",
                    "type": "link_timed_out",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "You have successfully set a new password. You may now log in with your new password."
            },
            status=status.HTTP_200_OK,
        )


class ListMembersForSitemap(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = UserProfileSitemapEntrySerializer
    pagination_class = MembersSitemapPagination

    def get_queryset(self):
        return UserProfile.objects.filter(is_profile_verified=True)

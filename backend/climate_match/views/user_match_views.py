import logging

from climate_match.models.user import UserQuestionAnswer
from climate_match.utility.sort_resources import sort_user_resource_preferences
from climateconnect_api.models import UserProfile
from hubs.models.hub import Hub
from hubs.serializers.hub import HubClimateMatchSerializer
from ideas.models import Idea
from ideas.serializers.idea import IdeaMinimalSerializer
from organization.models import Organization, Project
from organization.serializers.climatematch import OrganizationSuggestionSerializer
from organization.serializers.project import ProjectSuggestionSerializer
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger(__name__)


class UserResourcesMatchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        """
        params required in URL: `range_start` and `range_end`. example: range_start=0&range_end=10
        """
        is_logged_in = request.user.is_authenticated
        if is_logged_in:
            try:
                # TODO: fix this assignment or remove this try block
                pass
                # user_profile = UserProfile.objects.get(user=request.user)
            except UserProfile.DoesNotExist:
                return Response(
                    {"message": "Profile not found"}, status=status.HTTP_404_NOT_FOUND
                )
        elif "climatematch_token" not in request.query_params:
            return Response(
                {
                    "message": "You seem to not be logged in or not have not done the ClimateMatch before"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get offset number from frontend to return range of data instead of returning the entire list
        # This range start from 0 to
        if (
            "range_start" not in request.query_params
            or "range_end" not in request.query_params
        ):
            return Response(
                {"message": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST
            )
        range_start = int(request.query_params.get("range_start"))
        range_end = int(request.query_params.get("range_end"))
        LOGGER_PREFIX = "ResourceNotFound"
        climatematch_token = request.query_params.get("climatematch_token")
        # Fall back to Erlangen hub if no hub is passed
        FALLBACK_HUB_URL_SLUG = "erlangen"

        if request.user.is_authenticated:
            uqa = UserQuestionAnswer.objects.filter(user=request.user)
        else:
            uqa = UserQuestionAnswer.objects.filter(token=climatematch_token)

        # If the user passes a hub in the query string use that hub
        # This could also mean showing results in a hub where this user has never done the ClimateMatch
        # If there are ever different questions in different hubs this logic will need to be changed
        if request.query_params.get("hub"):
            try:
                hub = Hub.objects.get(url_slug=request.query_params.get("hub"))
            except Hub.DoesNotExist:
                if uqa.exists() and uqa[0].hub:
                    hub = uqa[0].hub
        else:
            if uqa.exists() and uqa[0].hub:
                hub = uqa[0].hub
            hub = Hub.objects.get(url_slug=FALLBACK_HUB_URL_SLUG)
        user_resources = sort_user_resource_preferences(
            user=request.user, climatematch_token=climatematch_token, hub_id=hub.id
        )
        total_resources = len(user_resources)
        user_matched_resources = []
        for resource in user_resources[range_start:range_end]:
            resource_id = resource["resource_id"]
            table_name = resource["table_name"]
            if table_name == "project":
                try:
                    project = Project.objects.get(id=resource_id)
                except Project.DoesNotExist:
                    logger.info(
                        f"{LOGGER_PREFIX} Project not found for resource id {resource_id}"
                    )
                    continue
                resource_data = ProjectSuggestionSerializer(project).data
            elif table_name == "idea":
                try:
                    idea = Idea.objects.get(id=resource_id)
                except Idea.DoesNotExist:
                    logger.info(
                        f"{LOGGER_PREFIX} Idea not found for resource id {resource_id}"
                    )
                    continue
                resource_data = IdeaMinimalSerializer(idea).data
            elif table_name == "organization":
                try:
                    organization = Organization.objects.get(id=resource_id)
                except Organization.DoesNotExist:
                    logger.info(
                        f"{LOGGER_PREFIX} Organization not found for resource id {resource_id}"
                    )
                    continue
                resource_data = OrganizationSuggestionSerializer(organization).data
            else:
                logger.info(f"{LOGGER_PREFIX} Unknown table name {table_name}")
                continue
            resource_data["ressource_type"] = table_name
            user_matched_resources.append(resource_data)
        return Response(
            {
                "current_range_start": range_start,
                "current_range_end": range_end,
                "total_resources": total_resources,
                "matched_resources": user_matched_resources,
                "hub": (HubClimateMatchSerializer(hub)).data,
                "has_more": len(user_resources) > range_end + 1,
            },
            status=status.HTTP_200_OK,
        )

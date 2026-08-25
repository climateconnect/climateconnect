import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from feature_toggles.utility import get_all_toggles_for_environment

logger = logging.getLogger(__name__)


class FeatureToggleListView(APIView):
    """
    API view to retrieve feature toggles for a specific environment.

    GET /api/feature_toggles/?environment=<env>

    The environment parameter is required. Valid values are:
    - production
    - staging
    - development

    Returns a dictionary of toggle names to boolean states.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        """
        Get all feature toggles for the specified environment.

        Query parameters:
        - environment: The environment to get toggles for (required)

        Returns:
        - 200: Dictionary of toggle names to boolean states
        - 400: Missing or invalid environment parameter
        """
        # Get environment from query parameters
        environment = request.query_params.get("environment")

        if not environment:
            return Response(
                {"error": "The 'environment' query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate environment
        valid_environments = ["production", "staging", "development"]
        if environment not in valid_environments:
            return Response(
                {
                    "error": f"Invalid environment '{environment}'. "
                    f"Must be one of: {', '.join(valid_environments)}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get toggles for the environment
        toggles = get_all_toggles_for_environment(environment)

        logger.debug(
            f"Retrieved {len(toggles)} feature toggles for environment '{environment}'"
        )

        return Response(toggles, status=status.HTTP_200_OK)

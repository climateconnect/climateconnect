import json
import logging

import requests
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from location.models import Location
from location.serializers import LocationStubSerializer
from location.utility import format_location, get_location

logger = logging.getLogger("django")


def _osm_type_char(v):
    if v is None:
        return None
    mapping = {"relation": "R", "way": "W", "node": "N", "r": "R", "w": "W", "n": "N"}
    return mapping.get(str(v).lower())


class GetLocationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        osm_id = request.data.get("osm_id")
        osm_type = request.data.get("osm_type")
        osm_class = request.data.get("osm_class")
        place_id = request.data.get("place_id")

        location = None

        # OSM composite key has precedence over place_id.
        osm_lookup_type = osm_type 
        osm_type_char = _osm_type_char(osm_lookup_type)
        if osm_id is not None and osm_type_char and osm_class:
            location = (
                Location.objects.filter(
                    osm_id=osm_id,
                    osm_type=osm_type_char,
                    osm_class=osm_class,
                )
                .order_by("-id")
                .first()
            )

        if location is None and osm_id is not None and osm_type_char:
            # Backward-compatible fallback when osm_class is not available yet.
            location = (
                Location.objects.filter(
                    osm_id=osm_id,
                    osm_type=osm_type_char,
                )
                .order_by("-id")
                .first()
            )

        if location is None and place_id is not None:
            logger.warning(
                "Using deprecated place_id lookup in /api/get_location/. place_id=%s",
                place_id,
            )
            location = Location.objects.filter(place_id=place_id).order_by("-id").first()

        if location is not None:
            serializer = LocationStubSerializer(location)
            return Response(serializer.data, status=status.HTTP_200_OK)

        if osm_id is None or not osm_type_char:
            return Response(
                {
                    "message": "Required parameters missing: either (osm_id and osm_type) or place_id"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        url_root = settings.LOCATION_SERVICE_BASE_URL + "/lookup?osm_ids="
        osm_id_param = osm_type_char + str(osm_id)
        params = "&format=json&addressdetails=1&polygon_geojson=1&accept-language=en-US,en;q=0.9&polygon_threshold=0.001"
        url = url_root + osm_id_param + params
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        response = requests.get(url, headers=headers)
        location_object = json.loads(response.text)[0]
        location = get_location(format_location(location_object, False))
        serializer = LocationStubSerializer(location)
        return Response(serializer.data, status=status.HTTP_200_OK)

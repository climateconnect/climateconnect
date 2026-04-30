import json
import logging

import requests
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from location.serializers import LocationStubSerializer
from location.utility import (
    _get_newest_location_by_osm_composite,
    _get_newest_location_by_osm_id_and_type,
    _get_newest_location_by_place_id,
    _osm_type_char,
    format_location,
    get_location,
    get_translated_location_name,
)

logger = logging.getLogger("django")


class GetLocationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        osm_id = request.data.get("osm_id")
        osm_type = request.data.get("osm_type")
        osm_class = request.data.get("osm_class")
        place_id = request.data.get("place_id")

        location = None

        # OSM composite key has precedence over place_id.
        if osm_id is not None and osm_type is not None and osm_class:
            location = _get_newest_location_by_osm_composite(
                osm_id, osm_type, osm_class
            )

        if location is None and osm_id is not None and osm_type is not None:
            # Backward-compatible fallback when osm_class is not available yet.
            location = _get_newest_location_by_osm_id_and_type(osm_id, osm_type)

        if location is None and place_id is not None:
            logger.warning(
                "Using deprecated place_id lookup in /api/get_location/. place_id=%s",
                place_id,
            )
            location = _get_newest_location_by_place_id(place_id)

        if location is not None:
            # Prefetch translations to avoid N+1 queries in the locale-aware serializer
            from location.models import Location as LocationModel
            location = (
                LocationModel.objects.prefetch_related("translate_location__language")
                .get(pk=location.pk)
            )
            serializer = LocationStubSerializer(location, context={"request": request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        osm_type_char = _osm_type_char(osm_type)
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
            "User-Agent": settings.CUSTOM_USER_AGENT,
        }

        try:
            response = requests.get(url, headers=headers, timeout=5)
        except requests.RequestException as exc:
            logger.error(
                "Error calling location service for url %s: %s", url, exc, exc_info=True
            )
            return Response(
                {"message": "Upstream location service is unavailable."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        if response.status_code != 200:
            logger.warning(
                "Location service returned non-200 status for url %s: %s",
                url,
                response.status_code,
            )
            return Response(
                {
                    "message": "Upstream location service returned an error.",
                    "upstream_status": response.status_code,
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )
        try:
            data = json.loads(response.text)
        except ValueError:
            logger.error(
                "Invalid JSON from location service for url %s", url, exc_info=True
            )
            return Response(
                {"message": "Invalid response from upstream location service."},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        if not isinstance(data, list) or not data:
            logger.info(
                "Location not found in upstream service for osm_id=%s, osm_type=%s",
                osm_id,
                osm_type_char,
            )
            return Response(
                {"message": "Location not found for the given identifiers."},
                status=status.HTTP_404_NOT_FOUND,
            )
        location_object = data[0]
        location = get_location(format_location(location_object, False))
        from location.models import Location as LocationModel
        location = (
            LocationModel.objects.prefetch_related("translate_location__language")
            .get(pk=location.pk)
        )
        serializer = LocationStubSerializer(location, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

import json
import logging
import time

import requests
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from location.serializers import LocationStubSerializer
from location.models import (
    Location as LocationModel,
    NominatimPeriodStats,
    NominatimRequestLog,
)
from location.utility import (
    _get_newest_location_by_osm_composite,
    _get_newest_location_by_osm_id_and_type,
    _get_newest_location_by_place_id,
    _osm_type_char,
    format_location,
    get_location,
)

logger = logging.getLogger("django")


class NominatimTrackThrottle(AnonRateThrottle):
    rate = "60/min"


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
            location = LocationModel.objects.prefetch_related(
                "translate_location__language"
            ).get(pk=location.pk)
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
        location = LocationModel.objects.prefetch_related(
            "translate_location__language"
        ).get(pk=location.pk)
        serializer = LocationStubSerializer(location, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Nominatim autocomplete request tracking (log + Celery aggregation)
# ---------------------------------------------------------------------------


class TrackNominatimRequestView(APIView):
    """
    POST /api/nominatim_request_count/

    Called fire-and-forget by the frontend every time it fires a Nominatim
    autocomplete request.  Simply logs the request — aggregation into
    NominatimPeriodStats is handled by a periodic Celery task.
    """

    permission_classes = [AllowAny]
    throttle_classes = [NominatimTrackThrottle]

    def post(self, request):
        minute_key = int(time.time()) // 60
        NominatimRequestLog.objects.create(minute_key=minute_key)
        return Response(status=status.HTTP_204_NO_CONTENT)


class NominatimStatsView(APIView):
    """
    GET /api/nominatim_stats/

    Returns persistent day/week/month Nominatim request stats.

    Without query params: returns the current day, week, and month stats.

    With ``?period_type=<type>&limit=<N>``: returns up to N rows for the
    given period type, ordered by period_key descending (most recent first).

    Requires Django staff / admin access.
    """

    permission_classes = [IsAdminUser]

    VALID_PERIOD_TYPES = {"day", "week", "month"}

    def get(self, request):
        try:
            period_type = request.query_params.get("period_type")

            raw_limit = request.query_params.get("limit", "1")
            try:
                limit = min(int(raw_limit), 365)
            except (ValueError, TypeError):
                return Response(
                    {"detail": "Invalid 'limit' parameter — must be an integer."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if period_type:
                if period_type not in self.VALID_PERIOD_TYPES:
                    return Response(
                        {
                            "detail": (
                                f"Invalid period_type '{period_type}'. "
                                f"Must be one of: {', '.join(sorted(self.VALID_PERIOD_TYPES))}"
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                rows = NominatimPeriodStats.objects.filter(
                    period_type=period_type
                ).order_by("-period_key")[:limit]
                return Response(
                    {
                        "period_type": period_type,
                        "periods": [
                            {
                                "period_key": r.period_key,
                                "total_requests": r.total_requests,
                                "avg_req_per_second": round(r.avg_req_per_second, 5),
                                "peak_req_per_second": r.peak_req_per_second,
                            }
                            for r in rows
                        ],
                    }
                )

            # Default: return the latest day, week, and month.
            result = {}
            for pt in ("day", "week", "month"):
                row = (
                    NominatimPeriodStats.objects.filter(period_type=pt)
                    .order_by("-period_key")
                    .first()
                )
                if row:
                    result[pt] = {
                        "period_key": row.period_key,
                        "total_requests": row.total_requests,
                        "avg_req_per_second": round(row.avg_req_per_second, 5),
                        "peak_req_per_second": row.peak_req_per_second,
                    }
                else:
                    result[pt] = None

            return Response(result)

        except Exception as exc:
            logger.error(
                "Failed to retrieve Nominatim stats from database: %s",
                exc,
                exc_info=True,
            )
            return Response(
                {"detail": "Stats temporarily unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

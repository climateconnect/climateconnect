import json
import logging
import time

import requests
from django.conf import settings
from django_redis import get_redis_connection
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from location.serializers import LocationStubSerializer
from location.models import Location as LocationModel
from location.utility import (
    _get_newest_location_by_osm_composite,
    _get_newest_location_by_osm_id_and_type,
    _get_newest_location_by_place_id,
    _osm_type_char,
    format_location,
    get_location,
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
# Nominatim autocomplete request tracking
# ---------------------------------------------------------------------------

_NOMINATIM_SECOND_TTL = (
    60 * 60 * 2
)  # 2 hours to cover the rolling 1-minute window and allow for some clock skew
_NOMINATIM_MINUTE_TTL = 60 * 60 * 24 * 35  # 35 days to cover the 30-day stats window
_NOMINATIM_DAY_TTL = 60 * 60 * 24 * 400  # 400 days to cover 13 months of daily buckets


def _increment_nominatim_counters() -> None:
    """
    Atomically increment all three time-bucket counters in Redis for a
    single Nominatim autocomplete request fired from the frontend.

    Key schema
    ----------
    ``nominatim:s:{epoch_seconds}``   – one bucket per calendar second
    ``nominatim:m:{epoch_minutes}``   – one bucket per calendar minute
    ``nominatim:d:{epoch_days}``      – one bucket per UTC day
    """
    try:
        redis = get_redis_connection("default")
        now = int(time.time())

        second_key = f"nominatim:s:{now}"
        minute_key = f"nominatim:m:{now // 60}"
        day_key = f"nominatim:d:{now // 86400}"

        # Use a pipeline so all six commands are sent in one round-trip.
        # INCR creates the key with value 1 if it does not exist yet;
        # EXPIRE refreshes (or sets) the TTL on every call – acceptable
        # since each bucket only receives writes during its own time window.
        pipe = redis.pipeline(transaction=False)
        pipe.incr(second_key)
        pipe.expire(second_key, _NOMINATIM_SECOND_TTL)
        pipe.incr(minute_key)
        pipe.expire(minute_key, _NOMINATIM_MINUTE_TTL)
        pipe.incr(day_key)
        pipe.expire(day_key, _NOMINATIM_DAY_TTL)
        pipe.execute()
    except Exception as exc:
        logger.warning("Failed to track Nominatim request in Redis: %s", exc)


class TrackNominatimRequestView(APIView):
    """
    POST /api/nominatim_request_count/

    Called fire-and-forget by the frontend every time it fires a Nominatim
    autocomplete request.  No authentication required – we want to count
    anonymous searches too.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        _increment_nominatim_counters()
        return Response(status=status.HTTP_204_NO_CONTENT)


class NominatimStatsView(APIView):
    """
    GET /api/nominatim_stats/

    Returns aggregated Nominatim autocomplete request statistics read from
    Redis.  Requires Django staff / admin access.

    Response shape::

        {
          "req_current_second":              <int>,   # requests in the current second bucket
          "req_last_minute":                 <int>,   # requests in the last 60 s (rolling)
          "req_last_hour":                   <int>,   # requests in the last 60 min (rolling)
          "req_today":                       <int>,   # requests since start of UTC day
          "req_last_7_days":                 <int>,   # requests over the last 7 day buckets
          "req_last_30_days":                <int>,   # requests over the last 30 day buckets
          "avg_req_per_second_last_minute":  <float>, # = req_last_minute / 60
          "avg_req_per_second_last_7_days":  <float>, # = req_last_7_days / (7 x 86400)
          "avg_req_per_second_last_30_days": <float>, # = req_last_30_days / (30 x 86400)
          "max_req_per_second_last_7_days":  <float>, # peak avg rate in any 1 min – last 7 d
          "max_req_per_second_last_30_days": <float>, # peak avg rate in any 1 min – last 30 d
        }

    Rolling windows vs. calendar windows
    -------------------------------------
    Second/minute-level stats use *rolling* windows so numbers are always
    current.  Daily stats use UTC day buckets so "today" resets at midnight.

    Max req/s approximation
    -----------------------
    ``max_req_per_second_last_*`` is computed as ``max(minute_bucket_count) / 60``
    over the relevant time window.  This is the highest *average* rate observed
    within any single minute – not a true per-second peak, but a memory-efficient
    proxy that avoids storing ~2.6 M second-level keys for a 30-day window.
    """

    permission_classes = [IsAdminUser]

    def get(self, request):
        try:
            redis = get_redis_connection("default")
            now = int(time.time())
            current_second = now
            current_minute = now // 60
            current_day = now // 86400

            _MINUTES_7D = 7 * 24 * 60  # 10 080
            _MINUTES_30D = 30 * 24 * 60  # 43 200

            # Build key lists.  We fetch 30 days of minute buckets so we can
            # compute the per-second peak over both 7-day and 30-day windows.
            second_keys = [f"nominatim:s:{current_second - i}" for i in range(60)]
            minute_keys = [
                f"nominatim:m:{current_minute - i}" for i in range(_MINUTES_30D)
            ]
            day_keys = [f"nominatim:d:{current_day - i}" for i in range(30)]

            # Single MGET round-trip (60 + 43 200 + 30 = 43 290 keys).
            raw = redis.mget(second_keys + minute_keys + day_keys)

            def _to_int(v) -> int:
                return int(v) if v is not None else 0

            second_vals = [_to_int(v) for v in raw[:60]]
            minute_vals = [_to_int(v) for v in raw[60 : 60 + _MINUTES_30D]]
            day_vals = [_to_int(v) for v in raw[60 + _MINUTES_30D :]]

            req_last_minute = sum(second_vals)
            req_last_7_days = sum(day_vals[:7])
            req_last_30_days = sum(day_vals)

            # max req/s: peak of (minute_bucket / 60) – see class docstring.
            max_s_7d = max(minute_vals[:_MINUTES_7D], default=0)
            max_s_30d = max(minute_vals, default=0)

            return Response(
                {
                    "req_current_second": second_vals[0],
                    "req_last_minute": req_last_minute,
                    "req_last_hour": sum(minute_vals[:60]),
                    "req_today": day_vals[0],
                    "req_last_7_days": req_last_7_days,
                    "req_last_30_days": req_last_30_days,
                    "avg_req_per_second_last_minute": round(req_last_minute / 60, 3),
                    "avg_req_per_second_last_7_days": round(
                        req_last_7_days / (7 * 86400), 3
                    ),
                    "avg_req_per_second_last_30_days": round(
                        req_last_30_days / (30 * 86400), 3
                    ),
                    "max_req_per_second_last_7_days": round(max_s_7d / 60, 3),
                    "max_req_per_second_last_30_days": round(max_s_30d / 60, 3),
                }
            )
        except Exception as exc:
            logger.error(
                "Failed to retrieve Nominatim stats from Redis: %s", exc, exc_info=True
            )
            return Response(
                {"detail": "Stats temporarily unavailable."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

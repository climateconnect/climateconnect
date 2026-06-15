import json
import logging
import time
from datetime import datetime

import requests
from django.conf import settings
from django.db.models import F
from django.db.models.functions import Greatest
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
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
# Nominatim autocomplete request tracking (database-based)
# ---------------------------------------------------------------------------


def _increment_nominatim_counters() -> None:
    """
    Atomically track a single Nominatim autocomplete request.

    1. Atomically increment per-minute bucket (for peak-rate detection).
    2. Atomically upsert current day/week/month in NominatimPeriodStats.
    3. Delete per-minute buckets older than the current UTC day.

    All field updates use F() expressions and PostgreSQL GREATEST() — no
    read-then-write patterns, no lost increments under concurrent access.
    """
    try:
        now = int(time.time())
        minute_key = now // 60

        # --- 1. atomic per-minute bucket increment ---
        NominatimRequestLog.objects.get_or_create(
            bucket_key=minute_key,
            defaults={"count": 0},
        )
        NominatimRequestLog.objects.filter(
            bucket_key=minute_key,
        ).update(count=F("count") + 1)

        # Re-read the atomically-incremented count.
        current_minute_count = (
            NominatimRequestLog.objects.filter(bucket_key=minute_key)
            .values_list("count", flat=True)
            .first()
        ) or 1
        current_rate = current_minute_count / 60.0

        # --- 2. atomic period stats upsert ---
        periods = _get_current_period_keys(now)

        for period_type, period_key, period_start in periods:
            elapsed = max(float(now - period_start), 1.0)

            NominatimPeriodStats.objects.get_or_create(
                period_type=period_type,
                period_key=period_key,
                defaults={
                    "total_requests": 0,
                    "avg_req_per_second": 0.0,
                    "peak_req_per_second": 0.0,
                },
            )

            # Single atomic UPDATE — all three fields computed in PostgreSQL.
            NominatimPeriodStats.objects.filter(
                period_type=period_type,
                period_key=period_key,
            ).update(
                total_requests=F("total_requests") + 1,
                peak_req_per_second=Greatest(F("peak_req_per_second"), current_rate),
                avg_req_per_second=(F("total_requests") + 1) / elapsed,
            )

        # --- 3. cleanup old minute buckets (keep current day only) ---
        today_start = (now // 86400) * 86400
        today_start_minute = today_start // 60
        NominatimRequestLog.objects.filter(
            bucket_key__lt=today_start_minute,
        ).delete()

    except Exception as exc:
        logger.warning("Failed to track Nominatim request in database: %s", exc)


def _get_current_period_keys(now_epoch: int):
    """
    Return [(period_type, period_key, start_epoch), ...] for the given
    epoch timestamp — one entry each for day, ISO week, and calendar month.
    """
    dt = datetime.utcfromtimestamp(now_epoch)

    # day
    day_key = dt.strftime("%Y-%m-%d")
    day_start = int(datetime(dt.year, dt.month, dt.day).timestamp())

    # iso week
    iso_year, iso_week, _ = dt.isocalendar()
    week_key = f"{iso_year}-W{iso_week:02d}"
    week_start_dt = datetime.strptime(f"{iso_year}-W{iso_week:02d}-1", "%G-W%V-%u")
    week_start = int(week_start_dt.timestamp())

    # month
    month_key = dt.strftime("%Y-%m")
    month_start = int(datetime(dt.year, dt.month, 1).timestamp())

    return [
        ("day", day_key, day_start),
        ("week", week_key, week_start),
        ("month", month_key, month_start),
    ]


class TrackNominatimRequestView(APIView):
    """
    POST /api/nominatim_request_count/

    Called fire-and-forget by the frontend every time it fires a Nominatim
    autocomplete request.  No authentication required.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        _increment_nominatim_counters()
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

    def get(self, request):
        try:
            period_type = request.query_params.get("period_type")
            limit = min(
                int(request.query_params.get("limit", 1)),
                365,
            )

            if period_type:
                # Return the last N rows for the requested period type.
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
                                "peak_req_per_second": round(r.peak_req_per_second, 3),
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
                        "peak_req_per_second": round(row.peak_req_per_second, 3),
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

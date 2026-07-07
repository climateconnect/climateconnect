import logging
from collections import defaultdict
from datetime import datetime, timedelta, timezone

import requests
from celery import shared_task
from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone as tz

from climateconnect_api.models.language import Language
from location.utility import format_location_name

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=5, rate_limit="1/s")
def fetch_and_create_location_translations(self, loc_id):
    # Lazy import to avoid Circular Import
    from location.models import Location, LocationTranslation

    try:
        instance = Location.objects.get(pk=loc_id)
    except Location.DoesNotExist:
        logger.error(
            f"location with ID {loc_id} does not exist anymore. Aborting task."
        )
        return

    if not instance.osm_id or not instance.osm_type:
        logger.debug(
            f"Location {loc_id} has no osm_id or osm_type. Skipping translation."
        )
        return

    languages = Language.objects.all()
    for language in languages:
        locale = language.language_code
        params = {
            "osm_ids": f"{instance.osm_type[0].upper()}{instance.osm_id}",
            "format": "json",
            "extratags": 1,
            "addressdetails": 1,
            "accept-language": locale,
        }

        headers = {"User-Agent": settings.CUSTOM_USER_AGENT}

        translation_data = {}

        try:
            response = requests.get(
                settings.NOMINATIM_LOOKUP_URL,
                params=params,
                headers=headers,
                timeout=20,
            )
            response.raise_for_status()
            data = response.json()

            if not data or not data[0]:
                logger.debug(
                    f"No Nominatim-Data found for location_id: {loc_id} ({locale})."
                )
                continue

            nominatim_result = data[0]
            address = nominatim_result.get("address", {})
            translation_data["city_translation"] = (
                address.get("city") or address.get("town") or address.get("village")
            )
            translation_data["state_translation"] = address.get("state")
            translation_data["country_translation"] = address.get("country")

        except requests.exceptions.RequestException as e:
            logger.error(
                f"error while retrieving translation data from nominatim for location id {instance.id}: {e}"
            )
            raise self.retry(exc=e, countdown=60 * (self.request.retries + 1))

        formatted_name = format_location_name(nominatim_result).get("name")
        translation_data["name_translation"] = formatted_name or instance.name

        try:
            with transaction.atomic():
                LocationTranslation.objects.create(
                    location=instance,
                    language_id=language.id,
                    name_translation=translation_data["name_translation"],
                    city_translation=translation_data["city_translation"],
                    state_translation=translation_data["state_translation"],
                    country_translation=translation_data["country_translation"],
                )
                logger.info(f"Translation created for {instance.pk} in {locale}.")
        except IntegrityError as e:
            logger.debug(
                f"Translation for ID {loc_id} and {language.id} already exists: {e}"
            )
            continue
        except Exception as e:
            logger.error(
                f"unknown error while saving translation for {instance.pk}/{language.id}: {e}"
            )
            continue


def _get_period_keys_for_dt(dt):
    """
    Return [(period_type, period_key, period_start_dt), ...] for the given
    datetime — one entry each for day, ISO week, and calendar month.
    """
    day_key = dt.strftime("%Y-%m-%d")
    day_start = dt.replace(hour=0, minute=0, second=0, microsecond=0)

    iso_year, iso_week, _ = dt.isocalendar()
    week_key = f"{iso_year}-W{iso_week:02d}"
    week_start_dt = datetime.strptime(f"{iso_year}-W{iso_week:02d}-1", "%G-W%V-%u")
    week_start_dt = week_start_dt.replace(tzinfo=timezone.utc)

    month_key = dt.strftime("%Y-%m")
    month_start = dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    return [
        ("day", day_key, day_start),
        ("week", week_key, week_start_dt),
        ("month", month_key, month_start),
    ]


@shared_task
def aggregate_nominatim_stats():
    """
    Read unprocessed NominatimRequestLog rows, compute day/week/month
    aggregates, upsert into NominatimPeriodStats, and mark rows as processed.
    Rows older than 7 days are cleaned up.

    Scheduled to run every 10 minutes via Celery Beat.
    """
    from location.models import NominatimPeriodStats, NominatimRequestLog

    with transaction.atomic():
        logs = list(
            NominatimRequestLog.objects.select_for_update(skip_locked=True)
            .filter(processed=False)
            .order_by("id")
        )
        if not logs:
            NominatimRequestLog.objects.filter(
                created_at__lt=tz.now() - timedelta(days=7)
            ).delete()
            return

        max_id = logs[-1].id

    now = tz.now()

    period_buckets = defaultdict(
        lambda: {"count": 0, "second_counts": defaultdict(int)}
    )

    for log in logs:
        log_dt = log.created_at
        if log_dt.tzinfo is None:
            log_dt = log_dt.replace(tzinfo=timezone.utc)

        second_key = log_dt.replace(microsecond=0)

        for period_type, period_key, period_start in _get_period_keys_for_dt(log_dt):
            bucket = period_buckets[(period_type, period_key)]
            bucket["count"] += 1
            bucket["second_counts"][second_key] += 1
            bucket["period_start"] = period_start

    for (period_type, period_key), bucket in period_buckets.items():
        total = bucket["count"]
        if total == 0:
            continue

        peak_per_second = (
            max(bucket["second_counts"].values()) if bucket["second_counts"] else 1
        )

        period_start_dt = bucket["period_start"]
        elapsed = max((now - period_start_dt).total_seconds(), 1.0)
        avg_rate = total / elapsed

        obj, created = NominatimPeriodStats.objects.get_or_create(
            period_type=period_type,
            period_key=period_key,
            defaults={
                "total_requests": total,
                "avg_req_per_second": avg_rate,
                "peak_req_per_second": peak_per_second,
            },
        )
        if not created:
            obj.total_requests += total
            obj.peak_req_per_second = max(obj.peak_req_per_second, peak_per_second)
            obj.avg_req_per_second = obj.total_requests / elapsed
            obj.save()

    NominatimRequestLog.objects.filter(id__lte=max_id, processed=False).update(
        processed=True
    )

    deleted_count, _ = NominatimRequestLog.objects.filter(
        created_at__lt=now - timedelta(days=7)
    ).delete()
    logger.info(
        "Aggregated %d Nominatim log rows into %d period stats, cleaned up %d old rows.",
        len(logs),
        len(period_buckets),
        deleted_count,
    )

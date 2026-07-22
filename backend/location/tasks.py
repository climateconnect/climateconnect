import json
import logging

import requests
from celery import shared_task
from django.conf import settings
from django.db import IntegrityError, transaction

from climateconnect_api.models.language import Language
from location.queue import (
    LOCATIONIQ_PENDING_JOBS_KEY,
    _fetch_results,
    _store_result,
    get_redis_conn,
)
from location.utility import format_location_name

logger = logging.getLogger(__name__)


@shared_task(rate_limit=settings.LOCATIONIQ_MAX_RATE)
def fetch_autocomplete(key, job_id, q, countrycodes, accept_language):
    """
    Fetch LocationIQ (with Nominatim fallback) results for one autocomplete
    lookup and write them back into the shared Redis rendezvous key that
    LocationAutocompleteView polls. Rate-limited to LOCATIONIQ_MAX_RATE and
    routed to its own queue/worker (see CELERY_TASK_ROUTES in settings) so
    this is the only thing calling LocationIQ, at the intended global rate.

    No retries: _fetch_results already exhausts both providers internally,
    so a Celery-level retry would just repeat that same double-provider
    attempt at extra quota cost for no benefit on a time-sensitive request.
    """
    redis_conn = get_redis_conn()
    try:
        results, provider = _fetch_results(q, countrycodes, accept_language)
    except Exception:
        logger.exception("fetch_autocomplete failed unexpectedly for %r", q)
        results, provider = None, None

    current = redis_conn.get(key)
    if current and json.loads(current).get("job_id") != job_id:
        # A newer sentinel generation already superseded this one (its TTL
        # expired mid-flight and a fresh lookup was started) — don't clobber
        # the newer job's data with this stale result.
        return

    _store_result(redis_conn, key, job_id, results, provider)
    redis_conn.zrem(LOCATIONIQ_PENDING_JOBS_KEY, key)
    if results is not None:
        from location.location_views import _increment_counters

        _increment_counters(provider)


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

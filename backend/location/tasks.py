import logging

import requests
from celery import shared_task
from django.conf import settings
from django.db import IntegrityError, transaction

logger = logging.getLogger(__name__)

SUPPORTED_LANGUAGES = {1: "de", 2: "en"}
NOMINATIM_DETAILS_URL = "https://nominatim.openstreetmap.org/lookup"
CUSTOM_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"


def create_name_from_translation_data(original_location, translation_data: dict) -> str:

    name = []
    if original_location.place_name:
        name.append(original_location.place_name)

    if original_location.exact_address:
        name.append(original_location.exact_address)

    for key in ["translated_city", "translated_state", "translated_country"]:
        value = translation_data.get(key)
        if value:
            name.append(value)

    return ", ".join(name)


@shared_task(bind=True, max_retries=5)
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
        logger.warning(
            f"Location {loc_id} has no osm_id or osm_type. Skipping translation."
        )
        return

    for language_id, locale in enumerate(settings.LOCALES, 1):
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
                settings.NOMINATIM_DETAILS_URL,
                params=params,
                headers=headers,
                timeout=20,
            )
            response.raise_for_status()
            data = response.json()

            if not data or not data[0]:
                logger.warning(
                    f"No Nominatim-Data found for location_id: {loc_id} ({locale})."
                )
                continue

            address = data[0].get("address", {})
            translation_data["translated_city"] = (
                address.get("city") or address.get("town") or address.get("village")
            )
            translation_data["translated_state"] = address.get("state")
            translation_data["translated_country"] = address.get("country")
            translation_data["translated_name"] = data[0].get("localname")

        except requests.exceptions.RequestException as e:
            logger.error(
                f"error while retrieving translation data from nominatim for location id {instance.id}: {e}"
            )
            raise self.retry(exc=e, countdown=60 * (self.request.retries + 1))

        if not translation_data.get("translated_name"):
            translation_data["translated_name"] = create_name_from_translation_data(
                instance, translation_data
            )
            if not translation_data["translated_name"]:
                translation_data["translated_name"] = instance.name

        try:
            with transaction.atomic():
                LocationTranslation.objects.create(
                    location=instance,
                    language_id=language_id,
                    name_translation=translation_data["translated_name"],
                    city_translation=translation_data["translated_city"],
                    state_translation=translation_data["translated_state"],
                    country_translation=translation_data["translated_country"],
                )
                logger.info(f"Translation created for {instance.pk} in {locale}.")
        except IntegrityError as e:
            logger.warning(
                f"Translation for ID {loc_id} and {language_id} already exists: {e}"
            )
            continue
        except Exception as e:
            logger.error(
                f"unknown error while saving translation for {instance.pk}/{language_id}: {e}"
            )
            continue

import logging

import requests
from django.conf import settings
from django.contrib.gis.db import models

from climateconnect_api.models.language import Language
from location.tasks import create_name_from_translation_data

logger = logging.getLogger(__name__)


class LocationManager(models.Manager):
    @transaction.atomic
    def create_location_with_translations(self, **kwargs):
        osm_id = kwargs.get("osm_id")
        osm_type = kwargs.get("osm_type")
        osm = f"{osm_type[0].upper()}{osm_id}"

        location = super().create(**kwargs)

        # request translation data from nominatim for all configured locales
        for language_id, locale in enumerate(settings.LOCALES, 1):
            params = {
                "osm_ids": osm,
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
                        f"No Nominatim-Translation-Data found for location ID: {location.id} ({locale})."
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
                    f"error while retrieving translation data from nominatim for osm {osm}: {e}"
                )
                continue

            if not translation_data.get("translated_name"):
                translation_data["translated_name"] = create_name_from_translation_data(
                    location, translation_data
                )
                if not translation_data["translated_name"]:
                    translation_data["translated_name"] = location.name

            try:
                LocationTranslation.objects.create(
                    location=location,
                    language_id=language_id,
                    name_translation=translation_data["translated_name"],
                    city_translation=translation_data["translated_city"],
                    state_translation=translation_data["translated_state"],
                    country_translation=translation_data["translated_country"],
                )
            except IntegrityError as e:
                logger.warning(
                    f"Translation for ID {location.id} and '{locale}' already exists: {e}"
                )
                continue

        return location


class Location(models.Model):
    name = models.CharField(
        help_text="Points to the (shortened) name of the location",
        verbose_name="Name",
        max_length=4096,
    )

    place_name = models.CharField(
        help_text="If it is a specific place (e.g. city hall) this contains the name of the place",
        verbose_name="Place Name",
        max_length=1024,
        blank=True,
        null=True,
    )

    display_name = models.CharField(
        help_text="Nominatim's full display name of the location",
        verbose_name="Display Name",
        max_length=1024,
        blank=True,
        null=True,
    )

    exact_address = models.CharField(
        help_text="Points to the exact address the location is on (e.g. 'Silk Road 50')",
        verbose_name="Exact Address",
        max_length=1024,
        blank=True,
        null=True,
    )

    city = models.CharField(
        help_text="Points to location's city name", verbose_name="City", max_length=1024
    )

    state = models.CharField(
        help_text="Points to location's state name",
        verbose_name="State",
        max_length=1024,
        blank=True,
        null=True,
    )

    country = models.CharField(
        help_text="Points to location's country name",
        verbose_name="Country",
        max_length=1024,
    )

    multi_polygon = models.MultiPolygonField(
        geography=True,
        verbose_name="Multi Polygon",
        help_text="The area where the location is located",
        null=True,
        blank=True,
    )

    centre_point = models.PointField(
        verbose_name="Centre point",
        help_text="This is only set if the location is just a point",
        geography=True,
        blank=True,
        null=True,
    )

    osm_id = models.BigIntegerField(
        help_text="The internal id of this location openstreetmaps",
        verbose_name="Osm ID",
        blank=True,
        null=True,
    )

    osm_type = models.CharField(
        help_text="The internal type of this location openstreetmaps",
        verbose_name="Osm Type",
        blank=True,
        null=True,
        choices=[("N", "node"), ("W", "way"), ("R", "relation")],
        max_length=1,
    )

    osm_class = models.CharField(
        help_text="The internal class of this location in openstreetmaps",
        verbose_name="Osm Class",
        blank=True,
        null=True,
        max_length=100,
    )

    osm_class_type = models.CharField(
        help_text="The internal type specifying the osm_class of this location in openstreetmaps",
        verbose_name="Osm Class Type",
        blank=True,
        null=True,
        max_length=100,
    )

    place_id = models.BigIntegerField(
        help_text="Nominatim's place id of this location",
        verbose_name="Place ID",
        blank=True,
        null=True,
    )

    is_stub = models.BooleanField(
        help_text="Check if this location was created without geocoordinates",
        verbose_name="Is Stub?",
        default=False,
    )

    is_formatted = models.BooleanField(
        help_text="helper column after migration inserted wrong languages and location shapes",
        verbose_name="Is Formatted?",
        default=False,
    )

    class Meta:
        verbose_name = "Location"
        verbose_name_plural = "Location"
        app_label = "location"

    def __str__(self):
        return "%s" % (self.name)


class LocationTranslation(models.Model):
    location = models.ForeignKey(
        Location,
        related_name="translate_location",
        help_text="Points to location table",
        verbose_name="Location",
        on_delete=models.CASCADE,
    )

    language = models.ForeignKey(
        Language,
        related_name="location_language",
        help_text="Points to language table",
        verbose_name="Language",
        on_delete=models.CASCADE,
    )

    name_translation = models.CharField(
        help_text="Translation of location name",
        verbose_name="Name DE translation",
        max_length=4096,
        null=True,
        blank=True,
    )

    city_translation = models.CharField(
        help_text="Translation for city column",
        verbose_name="City DE translation",
        max_length=1024,
        null=True,
        blank=True,
    )

    state_translation = models.CharField(
        help_text="Translation for state column",
        verbose_name="State DE translation",
        max_length=1024,
        null=True,
        blank=True,
    )

    country_translation = models.CharField(
        help_text="Translation for country column",
        verbose_name="Country DE translation",
        max_length=1024,
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = "Location translation"
        verbose_name_plural = "Location translations"
        unique_together = [["location", "language"]]
        app_label = "location"

    def __str__(self):
        return "{}: {} of location {}".format(
            self.id, self.language.name, self.location.name
        )

from django.contrib.gis.db import models
from climateconnect_api.models.language import Language


# Create your models here.
class Location(models.Model):
    name = models.CharField(
        help_text="Points to the (shortened) name of the location",
        verbose_name="Name",
        max_length=4096
    )

    city = models.CharField(
        help_text="Points to location's city name",
        verbose_name="City",
        max_length=1024
    )

    state = models.CharField(
        help_text="Points to location's state name",
        verbose_name="State",
        max_length=1024,
        blank=True,
        null=True
    )

    country = models.CharField(
        help_text="Points to location's country name",
        verbose_name="Country",
        max_length=1024
    )

    multi_polygon = models.MultiPolygonField(
        geography=True,
        verbose_name="Multi Polygon",
        help_text="The area where the location is located",
        null=True,
        blank=True
    )

    centre_point = models.PointField(
        verbose_name="Centre point",
        help_text="This is only set if the location is just a point",
        geography=True,
        blank=True,
        null=True
    )

    osm_id = models.BigIntegerField(
        help_text="The internal id of this location openstreetmaps",
        verbose_name="OSM ID",
        blank=True,
        null=True
    )

    place_id = models.BigIntegerField(
        help_text="Nominatim's place id of this location",
        verbose_name="Place ID",
        blank=True,
        null=True
    )

    is_stub = models.BooleanField(
        help_text="Check if this location was created without geocoordinates",
        verbose_name="Is Stub?", default=False
    )

    is_formatted = models.BooleanField(
        help_text="helper column after migration inserted wrong languages and location shapes",
        verbose_name="Is Formatted?", default=False
    )

    class Meta:
        verbose_name = "Location"
        verbose_name_plural = "Location"

    def __str__(self):
        return "%s" % (self.name)


class LocationTranslation(models.Model):
    location = models.ForeignKey(
        Location, related_name="translate_location",
        help_text="Points to location table", verbose_name="Location",
        on_delete=models.CASCADE
    )

    language = models.ForeignKey(
        Language, related_name="location_language",
        help_text="Points to language table", verbose_name="Language",
        on_delete=models.CASCADE
    )

    name_translation = models.CharField(
        help_text="Translation of location name",
        verbose_name="Name DE translation",
        max_length=4096, null=True, blank=True
    )

    city_translation = models.CharField(
        help_text="Translation for city column",
        verbose_name="City DE translation",
        max_length=1024, null=True, blank=True
    )

    state_translation = models.CharField(
        help_text="Translation for state column",
        verbose_name="State DE translation",
        max_length=1024, null=True, blank=True
    )

    country_translation = models.CharField(
        help_text="Translation for country column",
        verbose_name="Country DE translation",
        max_length=1024, null=True, blank=True
    )

    class Meta:
        verbose_name = "Location translation"
        verbose_name_plural = "Location translations"
        unique_together = [['location', 'language']]
    
    def __str__(self):
        return "{}: {} of location {}".format(
            self.id, self.language.name, self.location.name
        )

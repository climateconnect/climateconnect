from django.contrib.gis.db import models

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

    osm_id = models.PositiveIntegerField(
        help_text="The internal id of this location openstreetmaps",
        verbose_name="OSM ID",
        blank=True,
        null=True
    )

    place_id = models.PositiveIntegerField(
        help_text="Nominatim's place id of this location",
        verbose_name="Place ID",
        blank=True,
        null=True
    )

    is_stub = models.BooleanField(
        help_text="Check if this location was created without geocoordinates",
        verbose_name="Is Stub?", default=False
    )

    class Meta:
        verbose_name = "Location"
        verbose_name_plural = "Location"

    def __str__(self):
        return "%s" % (self.name)
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
        verbose_name="Name",
        max_length=1024
    )

    state = models.CharField(
        help_text="Points to location's state name",
        verbose_name="Name",
        max_length=1024,
        blank=True,
        null=True
    )

    country = models.CharField(
        help_text="Points to location's country name",
        verbose_name="Name",
        max_length=1024
    )

    multi_polygon = models.MultiPolygonField(
        geography=True
    )

    main_polygon = models.PolygonField(
        geography=True,
        blank=True,
        null=True
    )

    osm_id = models.PositiveIntegerField(
        help_text="The internal id of this location openstreetmaps",
        verbose_name="OSM ID"
    )

    place_id = models.PositiveIntegerField(
        help_text="Nominatim's place id of this location",
        verbose_name="Place ID"
    )
from django.contrib.gis.db import models

# Create your models here.
class Location(models.Model):
    city = models.CharField(
        help_text="Points to location's city name",
        verbose_name="Name",
        max_length=1024
    )

    state = models.CharField(
        help_text="Points to location's state name",
        verbose_name="Name",
        max_length=1024
    )

    country = models.CharField(
        help_text="Points to location's country name",
        verbose_name="Name",
        max_length=1024
    )

    polygon = models.MultiPolygonField(
        geography=True
    )
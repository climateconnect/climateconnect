from django.db.models.signals import post_save
from django.dispatch import receiver

from location.models import Location
from location.tasks import fetch_and_create_location_translations


@receiver(post_save, sender=Location)
def find_location_translations(sender, instance, created, **kwargs):
    """this functions is triggered whenever a Location is created successfully
    or save() was called successfully."""

    if created:
        fetch_and_create_location_translations.delay(instance.pk)

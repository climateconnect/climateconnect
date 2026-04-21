import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from location.models import Location
from location.tasks import fetch_and_create_location_translations

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Location)
def find_location_translations(sender, instance, created, **kwargs):
    """this functions is triggered whenever a Location is created successfully
    or save() was called successfully."""

    if created:
        try:
            fetch_and_create_location_translations.delay(instance.pk)
        except Exception as e:
            logger.warning(
                f"Could not queue translation task for location {instance.pk}: {e}"
            )

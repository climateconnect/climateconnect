"""
Django signals for the ``climateconnect_api`` app.

Currently handles image-variant generation dispatch for ``UserProfile``
image fields (mirroring the logic in ``organization/signals.py``).
"""

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from climateconnect_main.utility.image_variants import (
    capture_image_field_changes,
    cleanup_orphaned_variants,
    dispatch_image_variant_task,
)


@receiver(pre_save, sender="climateconnect_api.UserProfile")
def _capture_userprofile_image_changes(sender, instance, **kwargs):
    capture_image_field_changes(sender, instance, **kwargs)


@receiver(pre_save, sender="climateconnect_api.UserProfile")
def _cleanup_userprofile_orphaned_variants(sender, instance, **kwargs):
    """Delete old variant files before the image is replaced (post-capture)."""
    cleanup_orphaned_variants(sender, instance, **kwargs)


@receiver(post_save, sender="climateconnect_api.UserProfile")
def _dispatch_userprofile_image_variants(sender, instance, created, **kwargs):
    dispatch_image_variant_task(sender, instance, created, **kwargs)

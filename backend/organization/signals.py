"""
Django signals for maintaining parent/child project relationships.

This module contains signals that keep the has_children denormalized flag
synchronized with the actual child_projects relationships.
"""

from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver


@receiver(post_save, sender='organization.Project')
def update_parent_has_children_on_save(sender, instance, created, **kwargs):
    """
    Update parent's has_children flag when a child is created or modified.

    This signal fires after a Project is saved. If the project has a parent,
    we check if the parent actually has children and update the flag accordingly.
    """
    if instance.parent_project:
        # Check if parent actually has children
        has_children = instance.parent_project.child_projects.exists()

        # Only update if value changed (avoid unnecessary writes)
        if instance.parent_project.has_children != has_children:
            sender.objects.filter(pk=instance.parent_project.pk).update(
                has_children=has_children
            )


@receiver(post_save, sender='organization.Project')
def update_old_parent_has_children_on_parent_change(sender, instance, created, **kwargs):
    """
    Update old parent's has_children flag when a child's parent changes.

    This signal handles the case where a child project is moved from one parent
    to another. We need to update the old parent's has_children flag.
    """
    if not created and instance.pk:
        try:
            # Get the old instance from the database
            old_instance = sender.objects.get(pk=instance.pk)
            old_parent = old_instance.parent_project

            # If parent changed and there was an old parent
            if old_parent and old_parent != instance.parent_project:
                # Check if old parent still has children
                has_children = old_parent.child_projects.exists()

                # Only update if value changed
                if old_parent.has_children != has_children:
                    sender.objects.filter(pk=old_parent.pk).update(
                        has_children=has_children
                    )
        except sender.DoesNotExist:
            # Instance is being created, not updated
            pass


@receiver(pre_delete, sender='organization.Project')
def update_parent_has_children_on_delete(sender, instance, **kwargs):
    """
    Update parent's has_children flag when a child is deleted.

    This signal fires before a Project is deleted. If the project has a parent,
    we check if the parent will still have children after this deletion.
    """
    if instance.parent_project:
        # After deletion, check if parent will still have children
        remaining_children = instance.parent_project.child_projects.exclude(
            pk=instance.pk
        ).exists()

        # Only update if value changed
        if instance.parent_project.has_children != remaining_children:
            sender.objects.filter(pk=instance.parent_project.pk).update(
                has_children=remaining_children
            )


"""
Django Management Command: cleanup_locations

Cleans up the Location database by:
1. Identifying and merging duplicate locations based on OSM identifiers
2. Removing location records that are not referenced by any dependent models
3. Redirecting all foreign key references from deleted duplicates to the retained location

Usage:
    python manage.py cleanup_locations
    python manage.py cleanup_locations --dry-run
"""

import logging
from collections import defaultdict
from typing import NamedTuple

from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from climateconnect_api.models import UserProfile
from hubs.models import Hub
from ideas.models import Idea
from location.models import Location
from organization.models import Organization, Project

logger = logging.getLogger(__name__)


class CleanupStats(NamedTuple):
    """Statistics for the cleanup operation."""

    duplicate_groups_found: int
    duplicates_removed: int
    unused_locations_deleted: int
    fk_updates: dict
    errors: list


class LocationCleanup:
    """
    Handles cleanup of duplicate and unused Locations.

    Duplicates are identified by matching (osm_id, osm_type, osm_class) tuples.
    The newest record (highest id) is retained, and all references are redirected.
    """

    # Models with ForeignKey to Location
    FK_MODELS = [
        {"model": UserProfile, "field": "location"},
        {"model": Organization, "field": "location"},
        {"model": Project, "field": "loc"},
        {"model": Idea, "field": "location"},
    ]

    # Models with ManyToMany to Location
    M2M_MODELS = [
        {"model": Hub, "field": "location"},
    ]

    def __init__(self, dry_run: bool = False, stdout=None):
        self.dry_run = dry_run
        self.stdout = stdout
        self.stats = {
            "duplicate_groups_found": 0,
            "duplicates_removed": 0,
            "unused_locations_deleted": 0,
            "fk_updates": defaultdict(int),
            "m2m_updates": defaultdict(int),
            "errors": [],
        }

    def log(self, message: str, level: str = "info"):
        """Log message to both logger and stdout."""
        log_func = getattr(logger, level, logger.info)
        log_func(message)
        if self.stdout:
            self.stdout.write(message)

    def find_duplicate_groups(self) -> dict:
        """
        Find all Locations with identical OSM identifiers.

        Returns a dict mapping (osm_type, osm_id, osm_class) -> list of Location IDs
        """
        # Only consider locations where all OSM fields are populated
        locations_with_osm = Location.objects.filter(
            osm_id__isnull=False,
            osm_type__isnull=False,
            osm_class__isnull=False,
        ).exclude(Q(osm_type="") | Q(osm_class=""))

        # Group by OSM tuple
        osm_groups = defaultdict(list)
        for loc in locations_with_osm.values("id", "osm_id", "osm_type", "osm_class"):
            key = (loc["osm_type"], loc["osm_id"], loc["osm_class"])
            osm_groups[key].append(loc["id"])

        # Filter to only groups with duplicates (more than 1 record)
        duplicate_groups = {
            key: sorted(ids)  # Sort so highest id is last
            for key, ids in osm_groups.items()
            if len(ids) > 1
        }

        return duplicate_groups

    def get_location_references(self, location_id: int) -> dict:
        """
        Check which models reference a given location.

        Returns a dict with model names and counts.
        """
        references = {}

        for fk_config in self.FK_MODELS:
            model = fk_config["model"]
            field = fk_config["field"]
            count = model.objects.filter(**{field: location_id}).count()
            if count > 0:
                references[f"{model.__name__}.{field} (FK)"] = count

        for m2m_config in self.M2M_MODELS:
            model = m2m_config["model"]
            field = m2m_config["field"]
            count = model.objects.filter(**{field: location_id}).count()
            if count > 0:
                references[f"{model.__name__}.{field} (M2M)"] = count

        return references

    def is_location_used(self, location_id: int) -> bool:
        """Check if a location is referenced by any dependent model."""
        return bool(self.get_location_references(location_id))

    def redirect_fk_references(self, from_location_id: int, to_location_id: int):
        """
        Redirect all ForeignKey references from one location to another.
        """
        for fk_config in self.FK_MODELS:
            model = fk_config["model"]
            field = fk_config["field"]
            filter_kwargs = {field: from_location_id}
            update_kwargs = {field: to_location_id}

            count = model.objects.filter(**filter_kwargs).count()
            if count > 0:
                self.log(
                    f"  Redirecting {count} {model.__name__}.{field} "
                    f"references: {from_location_id} -> {to_location_id}"
                )
                if not self.dry_run:
                    model.objects.filter(**filter_kwargs).update(**update_kwargs)
                self.stats["fk_updates"][f"{model.__name__}.{field}"] += count

    def redirect_m2m_references(self, from_location_id: int, to_location_id: int):
        """
        Redirect all ManyToMany references from one location to another.
        """
        for m2m_config in self.M2M_MODELS:
            model = m2m_config["model"]
            field = m2m_config["field"]

            # Find all instances that have the old location in their M2M
            instances_with_old = model.objects.filter(**{field: from_location_id})

            for instance in instances_with_old:
                m2m_manager = getattr(instance, field)

                self.log(
                    f"  Updating M2M {model.__name__}.{field} on instance {instance.id}: "
                    f"removing {from_location_id}, adding {to_location_id}"
                )

                if not self.dry_run:
                    # Check if target location already exists to avoid duplicates
                    if not m2m_manager.filter(id=to_location_id).exists():
                        m2m_manager.add(to_location_id)
                    m2m_manager.remove(from_location_id)

                self.stats["m2m_updates"][f"{model.__name__}.{field}"] += 1

    def delete_location(self, location_id: int):
        """Delete a location record."""
        if not self.dry_run:
            try:
                Location.objects.filter(id=location_id).delete()
            except Exception as e:
                self.stats["errors"].append(
                    f"Failed to delete location {location_id}: {e}"
                )
                logger.error(f"Failed to delete location {location_id}: {e}")

    def merge_duplicates(self, duplicate_groups: dict):
        """
        Merge duplicate location groups by keeping the newest record.
        """
        self.stats["duplicate_groups_found"] = len(duplicate_groups)

        for osm_key, location_ids in duplicate_groups.items():
            osm_type, osm_id, osm_class = osm_key
            # Keep the newest (highest id)
            retained_id = max(location_ids)
            duplicates_to_remove = [lid for lid in location_ids if lid != retained_id]

            self.log(
                f"\n--- Duplicate Group: OSM Type={osm_type}, ID={osm_id}, Class={osm_class} ---"
            )
            self.log(f"  Retaining Location ID: {retained_id}")
            self.log(f"  Removing Location IDs: {duplicates_to_remove}")

            for dup_id in duplicates_to_remove:
                refs = self.get_location_references(dup_id)
                if refs:
                    self.log(f"  Location {dup_id} has references: {refs}")
                    # Redirect all references to the retained location
                    self.redirect_fk_references(dup_id, retained_id)
                    self.redirect_m2m_references(dup_id, retained_id)

                self.log(f"  Deleting Location ID: {dup_id}")
                self.delete_location(dup_id)
                self.stats["duplicates_removed"] += 1

    def find_unused_locations(self) -> list:
        """
        Find all Location records that have no references from any dependent model.
        """
        all_location_ids = set(Location.objects.values_list("id", flat=True))
        used_location_ids = set()

        # Collect IDs used in ForeignKey relations
        for fk_config in self.FK_MODELS:
            model = fk_config["model"]
            field = fk_config["field"]
            field_lookup = f"{field}_id"
            ids = set(
                model.objects.exclude(**{f"{field}__isnull": True})
                .values_list(field_lookup, flat=True)
                .distinct()
            )
            used_location_ids.update(ids)

        # Collect IDs used in ManyToMany relations
        for m2m_config in self.M2M_MODELS:
            model = m2m_config["model"]
            field = m2m_config["field"]
            for instance in model.objects.prefetch_related(field):
                m2m_manager = getattr(instance, field)
                ids = set(m2m_manager.values_list("id", flat=True))
                used_location_ids.update(ids)

        unused_ids = all_location_ids - used_location_ids
        return list(unused_ids)

    def delete_unused_locations(self, unused_ids: list):
        """Delete all unused location records."""
        if unused_ids:
            self.log(f"\n--- Unused Locations ---")
            self.log(f"  Found {len(unused_ids)} unused locations to delete")

            if not self.dry_run:
                deleted_count, _ = Location.objects.filter(id__in=unused_ids).delete()
                self.stats["unused_locations_deleted"] = deleted_count
            else:
                self.stats["unused_locations_deleted"] = len(unused_ids)

    def run(self) -> dict:
        """
        Execute the full cleanup process.

        Returns statistics about the cleanup operation.
        """
        start_time = timezone.now()
        mode = "DRY-RUN" if self.dry_run else "ACTUAL"

        self.log("=" * 50)
        self.log("Location Cleanup Report")
        self.log("=" * 50)
        self.log(f"Execution Mode: {mode}")
        self.log(f"Timestamp: {start_time.strftime('%Y-%m-%d %H:%M:%S %Z')}")

        try:
            with transaction.atomic():
                # Step 1: Find and merge duplicates
                self.log("\n--- DUPLICATE LOCATIONS ANALYSIS ---")
                duplicate_groups = self.find_duplicate_groups()
                self.log(f"Total duplicate groups found: {len(duplicate_groups)}")

                if duplicate_groups:
                    self.log("Merging duplicate locations...")
                    self.merge_duplicates(duplicate_groups)
                else:
                    self.log("No duplicate locations found.")

                # Step 2: Find and delete unused locations
                self.log("\n--- UNUSED LOCATIONS ANALYSIS ---")
                unused_ids = self.find_unused_locations()
                self.log(f"Total unused locations found: {len(unused_ids)}")

                if unused_ids:
                    self.log("Deleting unused locations...")
                    self.delete_unused_locations(unused_ids)
                else:
                    self.log("No unused locations found.")

                # If dry-run, rollback all changes
                if self.dry_run:
                    transaction.set_rollback(True)
                    self.log("\n[DRY-RUN] All changes have been rolled back.")

        except Exception as e:
            self.stats["errors"].append(f"Cleanup failed: {e}")
            logger.exception("Cleanup failed with exception")
            raise

        end_time = timezone.now()
        duration = end_time - start_time

        # Print summary
        self.log("\n--- SUMMARY ---")
        self.log(f"Duration: {duration}")
        self.log(f"Duplicate groups found: {self.stats['duplicate_groups_found']}")
        self.log(f"Duplicates removed: {self.stats['duplicates_removed']}")
        self.log(f"Unused locations deleted: {self.stats['unused_locations_deleted']}")

        if self.stats["fk_updates"]:
            self.log("ForeignKey updates:")
            for key, count in self.stats["fk_updates"].items():
                self.log(f"  - {key}: {count}")

        if self.stats["m2m_updates"]:
            self.log("ManyToMany updates:")
            for key, count in self.stats["m2m_updates"].items():
                self.log(f"  - {key}: {count}")

        if self.stats["errors"]:
            self.log("Errors encountered:")
            for error in self.stats["errors"]:
                self.log(f"  - {error}")
        else:
            self.log("✓ No errors encountered")

        self.log("=" * 50)

        return self.stats


class Command(BaseCommand):
    help = "Clean up unused and duplicate locations from the database"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Simulate the cleanup process without making any changes",
        )

    def handle(self, *args, **options):
        dry_run = options.get("dry_run", False)

        cleanup = LocationCleanup(dry_run=dry_run, stdout=self.stdout)
        stats = cleanup.run()

        if stats["errors"]:
            self.stderr.write(
                self.style.ERROR(
                    f"Cleanup completed with {len(stats['errors'])} errors"
                )
            )
        else:
            self.stdout.write(self.style.SUCCESS("Cleanup completed successfully"))

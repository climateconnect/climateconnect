import logging

from django.core.management.base import BaseCommand

from organization.models import Project
from organization.utility.legacy_description_to_tiptap import (
    legacy_description_to_tiptap_html,
)

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Migrate legacy plain-text project descriptions to Tiptap-compatible HTML"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Print a sample of before/after pairs and the count without saving",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=500,
            help="Number of projects to process per batch (default: 500)",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        batch_size = options["batch_size"]

        projects = Project.objects.filter(
            description__isnull=False,
            description_html__isnull=True,
        ).exclude(description="")

        total = projects.count()

        if total == 0:
            self.stdout.write(
                "No projects to migrate — all descriptions already have HTML."
            )
            return

        if dry_run:
            self.stdout.write(f"DRY RUN: {total} projects would be migrated.")
            sample = projects[:3]
            for proj in sample:
                before = proj.description
                after = legacy_description_to_tiptap_html(proj.description)
                self.stdout.write(f"\n--- Project {proj.id} ({proj.url_slug}) ---")
                self.stdout.write(f"BEFORE:\n{before[:200]}...")
                self.stdout.write(f"AFTER:\n{after[:500]}...")
            return

        migrated = 0
        for start in range(0, total, batch_size):
            batch = projects[start : start + batch_size]
            for proj in batch:
                proj.description_html = legacy_description_to_tiptap_html(
                    proj.description
                )

            Project.objects.bulk_update(
                batch, ["description_html"], batch_size=batch_size
            )
            migrated += len(batch)
            self.stdout.write(f"Processed {migrated}/{total}...")

        logger.info("Migrated %d descriptions", migrated)
        self.stdout.write(self.style.SUCCESS(f"Migrated {migrated} descriptions"))

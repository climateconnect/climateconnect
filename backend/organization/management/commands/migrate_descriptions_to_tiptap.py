import logging

from django.core.management.base import BaseCommand

from organization.models import Project
from organization.models.translations import ProjectTranslation
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
        else:
            if dry_run:
                self.stdout.write(f"DRY RUN: {total} projects would be migrated.")
                sample = projects[:3]
                for proj in sample:
                    before = proj.description
                    after = legacy_description_to_tiptap_html(proj.description)
                    self.stdout.write(f"\n--- Project {proj.id} ({proj.url_slug}) ---")
                    self.stdout.write(f"BEFORE:\n{before[:200]}...")
                    self.stdout.write(f"AFTER:\n{after[:500]}...")
            else:
                migrated = 0
                while True:
                    # Always re-query from 0 — saved projects drop out of the
                    # queryset because description_html__isnull becomes False.
                    batch = list(projects[:batch_size])
                    if not batch:
                        break
                    for proj in batch:
                        proj.description_html = legacy_description_to_tiptap_html(
                            proj.description
                        )
                    Project.objects.bulk_update(
                        batch, ["description_html"], batch_size=batch_size
                    )
                    migrated += len(batch)
                    self.stdout.write(f"Processed {migrated}...")

                logger.info("Migrated %d project descriptions", migrated)
                self.stdout.write(
                    self.style.SUCCESS(f"Migrated {migrated} project descriptions")
                )

        # Migrate ProjectTranslation.description_translation → description_html_translation
        translations = ProjectTranslation.objects.filter(
            description_translation__isnull=False,
            description_html_translation__isnull=True,
        ).exclude(description_translation="")

        trans_total = translations.count()

        if trans_total == 0:
            self.stdout.write("No translations to migrate — all already have HTML.")
        else:
            if dry_run:
                self.stdout.write(
                    f"DRY RUN: {trans_total} translations would be migrated."
                )
                sample = translations[:3]
                for t in sample:
                    self.stdout.write(
                        f"\n--- Translation id={t.id} project={t.project_id} lang={t.language_id} ---"
                    )
                    self.stdout.write(f"BEFORE: {t.description_translation[:200]}...")
                    after = legacy_description_to_tiptap_html(t.description_translation)
                    self.stdout.write(f"AFTER:  {after[:500]}...")
            else:
                migrated_trans = 0
                while True:
                    batch = list(translations[:batch_size])
                    if not batch:
                        break
                    for t in batch:
                        t.description_html_translation = (
                            legacy_description_to_tiptap_html(t.description_translation)
                        )
                    ProjectTranslation.objects.bulk_update(
                        batch,
                        ["description_html_translation"],
                        batch_size=batch_size,
                    )
                    migrated_trans += len(batch)
                    self.stdout.write(f"Processed {migrated_trans} translations...")

                logger.info("Migrated %d translation descriptions", migrated_trans)
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Migrated {migrated_trans} translation descriptions"
                    )
                )

"""
Management command to reconcile has_children flags with actual child_projects relationships.

This command serves as a safety net to fix any discrepancies between the has_children
denormalized flag and the actual presence of child projects. While Django signals
should keep these in sync, this command can be run periodically (e.g., weekly) or
after bulk operations to ensure data consistency.

Usage:
    python manage.py reconcile_has_children          # Fix discrepancies
    python manage.py reconcile_has_children --dry-run # Show what would be fixed
"""

from django.core.management.base import BaseCommand
from django.db.models import Exists, OuterRef
from organization.models import Project


class Command(BaseCommand):
    help = "Reconcile has_children flags with actual child_projects relationships"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be updated without making changes",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]

        if dry_run:
            self.stdout.write(
                self.style.WARNING("DRY RUN MODE - No changes will be made")
            )

        # Find projects with children that have has_children=False
        should_be_true = Project.objects.annotate(
            has_child_projects=Exists(
                Project.objects.filter(parent_project=OuterRef("pk"))
            )
        ).filter(has_child_projects=True, has_children=False)

        # Find projects without children that have has_children=True
        should_be_false = Project.objects.annotate(
            has_child_projects=Exists(
                Project.objects.filter(parent_project=OuterRef("pk"))
            )
        ).filter(has_child_projects=False, has_children=True)

        count_true = should_be_true.count()
        count_false = should_be_false.count()

        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f"Would set has_children=True for {count_true} projects"
                )
            )
            if count_true > 0:
                self.stdout.write("  Projects:")
                for project in should_be_true[:10]:  # Show first 10
                    child_count = project.child_projects.count()
                    self.stdout.write(
                        f"    - {project.name} (ID: {project.id}, "
                        f"{child_count} children)"
                    )
                if count_true > 10:
                    self.stdout.write(f"    ... and {count_true - 10} more")

            self.stdout.write(
                self.style.WARNING(
                    f"Would set has_children=False for {count_false} projects"
                )
            )
            if count_false > 0:
                self.stdout.write("  Projects:")
                for project in should_be_false[:10]:  # Show first 10
                    self.stdout.write(f"    - {project.name} (ID: {project.id})")
                if count_false > 10:
                    self.stdout.write(f"    ... and {count_false - 10} more")

        else:
            updated_true = should_be_true.update(has_children=True)
            updated_false = should_be_false.update(has_children=False)

            if updated_true > 0:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Updated {updated_true} projects to has_children=True"
                    )
                )

            if updated_false > 0:
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Updated {updated_false} projects to has_children=False"
                    )
                )

            if updated_true == 0 and updated_false == 0:
                self.stdout.write(
                    self.style.SUCCESS("All has_children flags are correct!")
                )

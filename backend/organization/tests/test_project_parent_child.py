"""
Tests for parent/child project relationships feature.

This module contains comprehensive tests for:
1. Model validation (circular references, depth limits)
2. Database integrity (CASCADE, SET_NULL behavior)
3. Django signals (has_children flag synchronization)
4. Management command (reconciliation)
5. API serialization (list vs detail serializers)
6. API filtering (by parent ID, parent slug, has_children)
7. Performance (browse page, detail page)
"""

from django.test import TestCase
from django.core.exceptions import ValidationError
from django.core.management import call_command
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

from organization.models import Project, ProjectStatus
from location.models import Location


class ProjectParentChildModelTests(TestCase):
    """Test parent/child relationship model validations and database behavior."""

    def setUp(self):
        """Set up test fixtures."""
        self.status = ProjectStatus.objects.create(
            name="In Progress",
            name_de_translation="In Bearbeitung",
            has_end_date=True,
            has_start_date=True,
        )
        self.location = Location.objects.create(city="Berlin", country="Germany")
        self.user = User.objects.create_user(
            username="testuser", email="test@example.com", password="testpass123"
        )

    def test_parent_project_field_exists(self):
        """Test that parent_project field exists on Project model."""
        project = Project.objects.create(
            name="Test Project", url_slug="test-project", status=self.status
        )
        self.assertIsNone(project.parent_project)

    def test_has_children_field_exists(self):
        """Test that has_children field exists and defaults to False."""
        project = Project.objects.create(
            name="Test Project", url_slug="test-project", status=self.status
        )
        self.assertFalse(project.has_children)

    def test_create_parent_child_relationship(self):
        """Test creating a valid parent/child relationship."""
        parent = Project.objects.create(
            name="Festival 2026", url_slug="festival-2026", status=self.status
        )
        child = Project.objects.create(
            name="Workshop 1",
            url_slug="workshop-1",
            status=self.status,
            parent_project=parent,
        )

        self.assertEqual(child.parent_project, parent)
        self.assertIn(child, parent.child_projects.all())

    def test_prevent_self_reference(self):
        """Test that a project cannot be its own parent."""
        project = Project.objects.create(
            name="Test Project", url_slug="test-project", status=self.status
        )
        project.parent_project = project

        with self.assertRaises(ValidationError) as context:
            project.full_clean()

        self.assertIn("cannot be its own parent", str(context.exception))

    def test_prevent_circular_reference(self):
        """Test prevention of circular references (A->B->A)."""
        parent = Project.objects.create(
            name="Project A", url_slug="project-a", status=self.status
        )
        child = Project.objects.create(
            name="Project B",
            url_slug="project-b",
            status=self.status,
            parent_project=parent,
        )

        # Try to make parent a child of child (circular reference)
        parent.parent_project = child

        with self.assertRaises(ValidationError) as context:
            parent.full_clean()

        # This should fail the depth limit check (child already has a parent)
        self.assertIn("one level deep", str(context.exception))

    def test_enforce_max_depth_one_level(self):
        """Test that nesting is limited to one level (grandparent->parent->child not allowed)."""
        grandparent = Project.objects.create(
            name="Grandparent Project", url_slug="grandparent", status=self.status
        )
        parent = Project.objects.create(
            name="Parent Project",
            url_slug="parent",
            status=self.status,
            parent_project=grandparent,
        )
        child = Project.objects.create(
            name="Child Project", url_slug="child", status=self.status
        )

        # Try to set child's parent to parent (which already has a parent)
        child.parent_project = parent

        with self.assertRaises(ValidationError) as context:
            child.full_clean()

        self.assertIn("one level deep", str(context.exception))

    def test_prevent_parent_with_existing_children(self):
        """Test that a project with children cannot have a parent."""
        parent = Project.objects.create(
            name="Parent Project", url_slug="parent", status=self.status
        )
        child = Project.objects.create(
            name="Child Project",
            url_slug="child",
            status=self.status,
            parent_project=parent,
        )

        # Try to give the parent a parent
        grandparent = Project.objects.create(
            name="Grandparent Project", url_slug="grandparent", status=self.status
        )
        parent.parent_project = grandparent

        with self.assertRaises(ValidationError) as context:
            parent.full_clean()

        self.assertIn(
            "with child projects cannot have a parent", str(context.exception)
        )

    def test_deletion_behavior_set_null(self):
        """Test that deleting parent sets child's parent_project to NULL."""
        parent = Project.objects.create(
            name="Festival 2026", url_slug="festival-2026", status=self.status
        )
        child = Project.objects.create(
            name="Workshop 1",
            url_slug="workshop-1",
            status=self.status,
            parent_project=parent,
        )

        parent_id = parent.id
        parent.delete()

        # Child should still exist with NULL parent
        child.refresh_from_db()
        self.assertIsNone(child.parent_project)
        self.assertFalse(Project.objects.filter(id=parent_id).exists())


class ProjectHasChildrenSignalTests(TestCase):
    """Test Django signals that keep has_children field synchronized."""

    def setUp(self):
        """Set up test fixtures."""
        self.status = ProjectStatus.objects.create(
            name="In Progress",
            name_de_translation="In Bearbeitung",
            has_end_date=True,
            has_start_date=True,
        )

    def test_has_children_flag_on_child_creation(self):
        """Test that has_children flag is set to True when child is created."""
        parent = Project.objects.create(
            name="Festival", url_slug="festival-2026", status=self.status
        )
        self.assertFalse(parent.has_children)

        child = Project.objects.create(
            name="Workshop",
            url_slug="workshop-1",
            status=self.status,
            parent_project=parent,
        )

        parent.refresh_from_db()
        self.assertTrue(parent.has_children)

    def test_has_children_flag_on_last_child_deletion(self):
        """Test that has_children flag is cleared when last child is deleted."""
        parent = Project.objects.create(
            name="Festival", url_slug="festival-2026", status=self.status
        )
        child = Project.objects.create(
            name="Workshop",
            url_slug="workshop-1",
            status=self.status,
            parent_project=parent,
        )

        parent.refresh_from_db()
        self.assertTrue(parent.has_children)

        child.delete()

        parent.refresh_from_db()
        self.assertFalse(parent.has_children)

    def test_has_children_flag_remains_with_multiple_children(self):
        """Test that has_children remains True when one child is deleted but others remain."""
        parent = Project.objects.create(
            name="Festival", url_slug="festival-2026", status=self.status
        )
        child1 = Project.objects.create(
            name="Workshop 1",
            url_slug="workshop-1",
            status=self.status,
            parent_project=parent,
        )
        child2 = Project.objects.create(
            name="Workshop 2",
            url_slug="workshop-2",
            status=self.status,
            parent_project=parent,
        )

        parent.refresh_from_db()
        self.assertTrue(parent.has_children)

        # Delete one child
        child1.delete()

        parent.refresh_from_db()
        self.assertTrue(parent.has_children)  # Still has child2

    def test_has_children_flag_on_parent_change(self):
        """Test that has_children is updated when child's parent changes."""
        parent1 = Project.objects.create(
            name="Festival 1", url_slug="festival-1", status=self.status
        )
        parent2 = Project.objects.create(
            name="Festival 2", url_slug="festival-2", status=self.status
        )
        child = Project.objects.create(
            name="Workshop",
            url_slug="workshop-1",
            status=self.status,
            parent_project=parent1,
        )

        parent1.refresh_from_db()
        parent2.refresh_from_db()
        self.assertTrue(parent1.has_children)
        self.assertFalse(parent2.has_children)

        # Change child's parent
        child.parent_project = parent2
        child.save()

        parent1.refresh_from_db()
        parent2.refresh_from_db()
        self.assertFalse(parent1.has_children)  # Lost its child
        self.assertTrue(parent2.has_children)  # Gained a child

    def test_has_children_flag_on_parent_removal(self):
        """Test that has_children is cleared when child's parent is removed."""
        parent = Project.objects.create(
            name="Festival", url_slug="festival-2026", status=self.status
        )
        child = Project.objects.create(
            name="Workshop",
            url_slug="workshop-1",
            status=self.status,
            parent_project=parent,
        )

        parent.refresh_from_db()
        self.assertTrue(parent.has_children)

        # Remove parent relationship
        child.parent_project = None
        child.save()

        parent.refresh_from_db()
        self.assertFalse(parent.has_children)


class ProjectReconcileHasChildrenCommandTests(TestCase):
    """Test the management command that reconciles has_children flags."""

    def setUp(self):
        """Set up test fixtures."""
        self.status = ProjectStatus.objects.create(
            name="In Progress",
            name_de_translation="In Bearbeitung",
            has_end_date=True,
            has_start_date=True,
        )

    def test_reconcile_finds_and_fixes_discrepancy_false_to_true(self):
        """Test that command fixes has_children=False when children exist."""
        parent = Project.objects.create(
            name="Festival",
            url_slug="festival-2026",
            status=self.status,
            has_children=False,
        )
        child = Project.objects.create(
            name="Workshop",
            url_slug="workshop-1",
            status=self.status,
            parent_project=parent,
        )

        # Manually break the flag (simulate direct DB update bypassing signals)
        Project.objects.filter(pk=parent.pk).update(has_children=False)

        parent.refresh_from_db()
        self.assertFalse(parent.has_children)  # Broken state

        # Run reconciliation command
        call_command("reconcile_has_children")

        parent.refresh_from_db()
        self.assertTrue(parent.has_children)  # Fixed!

    def test_reconcile_finds_and_fixes_discrepancy_true_to_false(self):
        """Test that command fixes has_children=True when no children exist."""
        parent = Project.objects.create(
            name="Festival", url_slug="festival-2026", status=self.status
        )

        # Manually set broken flag
        Project.objects.filter(pk=parent.pk).update(has_children=True)

        parent.refresh_from_db()
        self.assertTrue(parent.has_children)  # Broken state (no children)

        # Run reconciliation command
        call_command("reconcile_has_children")

        parent.refresh_from_db()
        self.assertFalse(parent.has_children)  # Fixed!

    def test_reconcile_dry_run_does_not_modify(self):
        """Test that --dry-run option doesn't modify data."""
        parent = Project.objects.create(
            name="Festival", url_slug="festival-2026", status=self.status
        )

        # Manually set broken flag
        Project.objects.filter(pk=parent.pk).update(has_children=True)

        parent.refresh_from_db()
        self.assertTrue(parent.has_children)

        # Run dry-run
        call_command("reconcile_has_children", dry_run=True)

        parent.refresh_from_db()
        self.assertTrue(parent.has_children)  # Still broken (dry-run doesn't fix)


class ProjectParentChildAPITests(TestCase):
    """Test API serialization and filtering for parent/child relationships."""

    def setUp(self):
        """Set up test fixtures."""
        self.client = APIClient()
        self.status = ProjectStatus.objects.create(
            name="In Progress",
            name_de_translation="In Bearbeitung",
            has_end_date=True,
            has_start_date=True,
        )
        self.location = Location.objects.create(city="Berlin", country="Germany")

    def test_list_serializer_includes_parent_id_and_has_children(self):
        """Test that list endpoint includes parent_project_id and has_children (no JOIN)."""
        parent = Project.objects.create(
            name="Festival 2026", url_slug="festival-2026", status=self.status
        )
        child = Project.objects.create(
            name="Workshop 1",
            url_slug="workshop-1",
            status=self.status,
            parent_project=parent,
        )

        response = self.client.get("/api/projects/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Find parent in response
        parent_data = next(
            (p for p in response.data["results"] if p["url_slug"] == "festival-2026"),
            None,
        )
        self.assertIsNotNone(parent_data)
        self.assertTrue(parent_data["has_children"])
        self.assertIsNone(parent_data.get("parent_project_id"))

        # Find child in response
        child_data = next(
            (p for p in response.data["results"] if p["url_slug"] == "workshop-1"), None
        )
        self.assertIsNotNone(child_data)
        self.assertFalse(child_data["has_children"])
        self.assertEqual(child_data["parent_project_id"], parent.id)

    def test_list_serializer_excludes_child_count(self):
        """Test that list endpoint does NOT include child_projects_count (performance)."""
        parent = Project.objects.create(
            name="Festival 2026", url_slug="festival-2026", status=self.status
        )

        response = self.client.get("/api/projects/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        parent_data = next(
            (p for p in response.data["results"] if p["url_slug"] == "festival-2026"),
            None,
        )

        # child_projects_count should NOT be in list view
        self.assertNotIn("child_projects_count", parent_data)

    def test_detail_serializer_includes_full_parent_info(self):
        """Test that detail endpoint includes parent_project_name, parent_project_slug."""
        parent = Project.objects.create(
            name="Festival 2026", url_slug="festival-2026", status=self.status
        )
        child = Project.objects.create(
            name="Workshop 1",
            url_slug="workshop-1",
            status=self.status,
            parent_project=parent,
        )

        response = self.client.get(f"/api/projects/{child.url_slug}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["parent_project_id"], parent.id)
        self.assertEqual(response.data["parent_project_name"], "Festival 2026")
        self.assertEqual(response.data["parent_project_slug"], "festival-2026")
        self.assertFalse(response.data["has_children"])

    def test_detail_serializer_includes_child_count(self):
        """Test that detail endpoint includes child_projects_count."""
        parent = Project.objects.create(
            name="Festival 2026", url_slug="festival-2026", status=self.status
        )
        Project.objects.create(
            name="Workshop 1",
            url_slug="workshop-1",
            status=self.status,
            parent_project=parent,
        )
        Project.objects.create(
            name="Workshop 2",
            url_slug="workshop-2",
            status=self.status,
            parent_project=parent,
        )

        response = self.client.get(f"/api/projects/{parent.url_slug}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["has_children"])
        self.assertEqual(response.data["child_projects_count"], 2)

    def test_filter_by_parent_project_id(self):
        """Test filtering projects by parent ID."""
        parent = Project.objects.create(
            name="Festival 2026", url_slug="festival-2026", status=self.status
        )
        child1 = Project.objects.create(
            name="Workshop 1",
            url_slug="workshop-1",
            status=self.status,
            parent_project=parent,
        )
        child2 = Project.objects.create(
            name="Workshop 2",
            url_slug="workshop-2",
            status=self.status,
            parent_project=parent,
        )
        standalone = Project.objects.create(
            name="Standalone", url_slug="standalone", status=self.status
        )

        response = self.client.get(f"/api/projects/?parent_project={parent.id}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)

        slugs = [p["url_slug"] for p in response.data["results"]]
        self.assertIn("workshop-1", slugs)
        self.assertIn("workshop-2", slugs)
        self.assertNotIn("standalone", slugs)
        self.assertNotIn("festival-2026", slugs)

    def test_filter_by_parent_project_slug(self):
        """Test filtering projects by parent slug (preferred Climate Connect pattern)."""
        parent = Project.objects.create(
            name="Festival 2026", url_slug="festival-2026", status=self.status
        )
        child1 = Project.objects.create(
            name="Workshop 1",
            url_slug="workshop-1",
            status=self.status,
            parent_project=parent,
        )
        child2 = Project.objects.create(
            name="Workshop 2",
            url_slug="workshop-2",
            status=self.status,
            parent_project=parent,
        )

        response = self.client.get("/api/projects/?parent_project_slug=festival-2026")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)

        # Verify all results have correct parent slug
        for project in response.data["results"]:
            self.assertEqual(project["parent_project_slug"], "festival-2026")
            self.assertFalse(project["has_children"])

    def test_filter_by_has_children(self):
        """Test filtering to find all parent events."""
        parent1 = Project.objects.create(
            name="Festival 1", url_slug="festival-1", status=self.status
        )
        parent2 = Project.objects.create(
            name="Festival 2", url_slug="festival-2", status=self.status
        )
        standalone = Project.objects.create(
            name="Workshop", url_slug="workshop", status=self.status
        )

        Project.objects.create(
            name="Sub 1", url_slug="sub-1", status=self.status, parent_project=parent1
        )
        Project.objects.create(
            name="Sub 2", url_slug="sub-2", status=self.status, parent_project=parent2
        )

        response = self.client.get("/api/projects/?has_children=true")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)

        # Verify all results have has_children=True
        for project in response.data["results"]:
            self.assertTrue(project["has_children"])

        slugs = [p["url_slug"] for p in response.data["results"]]
        self.assertIn("festival-1", slugs)
        self.assertIn("festival-2", slugs)
        self.assertNotIn("workshop", slugs)


class ProjectParentChildPerformanceTests(TestCase):
    """Test performance impact of parent/child relationships."""

    def setUp(self):
        """Set up test fixtures with multiple projects."""
        self.client = APIClient()
        self.status = ProjectStatus.objects.create(
            name="In Progress",
            name_de_translation="In Bearbeitung",
            has_end_date=True,
            has_start_date=True,
        )

        # Create 100 projects to simulate realistic load
        for i in range(100):
            Project.objects.create(
                name=f"Project {i}", url_slug=f"project-{i}", status=self.status
            )

    def test_list_endpoint_query_count(self):
        """Test that list endpoint doesn't have N+1 query problems."""
        from django.db import connection
        from django.test.utils import CaptureQueriesContext

        with CaptureQueriesContext(connection) as context:
            response = self.client.get("/api/projects/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Should have minimal queries (no JOIN for parent_project, no COUNT for children)
        # Exact number depends on other optimizations, but should be low
        query_count = len(context.captured_queries)

        # This is a baseline - we're checking it doesn't explode with N+1
        # Typically should be < 10 queries for list view
        self.assertLess(
            query_count, 15, f"List view has {query_count} queries, expected < 15"
        )

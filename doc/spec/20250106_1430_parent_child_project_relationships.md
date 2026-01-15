# Parent/Child Project Relationships (Tech Enabler)

**Status**: IMPLEMENTATION  
**Type**: Feature  
**Date and time created**: 2026-01-06 14:30  
**Date Completed**: 2026-01-13  
**Related GitHub Issue**: #1635 - [USER STORY] Tech Enabler: Parent/Child Project Relationships  
**Related Epic**: Main Event feature page with multiple events  

## Problem Statement

Enable parent/child relationships between projects in the backend to support complex events (like festivals with multiple sub-events). This is a technical enabler for Epic #33 (Main Event feature page) that will allow Climate Connect to model large events (e.g., Wasseraktionswochen, climate festivals) that contain multiple individual events.

**Core Requirements (User/Stakeholder Stated):**
1. Create database schema to support parent/child project relationships
2. Add `has_children` boolean field for zero-cost parent detection in list views
3. Implement Django signals to keep `has_children` field in sync automatically
4. Create management command for periodic reconciliation of `has_children` flags
5. Enable basic management via Django admin (acceptable for first iteration)
6. Expose relationships through existing API (read support)
7. Prevent invalid relationships (circular references, excessive nesting)
8. Create and test database migration safely
9. Maintain performance on browse page (no degradation)

**Context:**
- Similar pattern exists for Hub parent/child relationships
- First iteration can use manual Django admin operations
- Learn from this to eventually build full UI functionality
- Will reduce data duplication in browse/search pages long-term

### Non Functional Requirements

1. **Performance**: Browse page load time must remain within 5% of baseline (< 50ms increase)
2. **Data Integrity**: Prevent circular references and enforce nesting depth limits
3. **Backward Compatibility**: 
   - All changes are purely additive (new nullable fields only)
   - Zero impact on existing data (no parent/child relationships exist yet)
   - Existing API tests must continue to pass unchanged
   - API responses include new optional fields (clients can ignore them)
4. **Safety**: 
   - Migration is low-risk (adding nullable columns with default values)
   - Simple rollback: just remove the new fields (no data loss risk)
   - No existing relationships to preserve
5. **Scalability**: Database indexes required for query performance
6. **Test Coverage**: Validation tests must achieve 100% coverage of edge cases

### AI Agent Insights and Additions

**Additional Technical Considerations:**
1. List views should NOT use `select_related('parent_project')` - only parent_project_id needed (no JOIN)
2. Detail views should use `select_related('parent_project')` for parent name/slug access
3. May want to add `prefetch_related('child_projects')` for parent detail views (if showing children)
4. Consider future API filtering by `has_parent=true/false` for finding child projects
5. Documentation should be created for future UI implementation patterns
6. Consider adding database constraint at DB level in addition to Django validation
7. May want to add audit logging for parent/child relationship changes

**Strategic Observations:**
- The `has_children` pattern (boolean flag + signals) could extend beyond events to other domains (project groups, campaigns)
- Performance monitoring post-deployment is critical for this foundational change
- Admin documentation is key to enabling non-dev team members
- Two-serializer approach (list vs detail) balances performance with data richness

## System impact

**Actors involved**: 
- Platform Developer (implementing the feature)
- Platform Admin (managing relationships via Django admin)
- API Consumer (reading parent/child data)
- Event Visitor (future - will see parent/child events)

**Actions to implement**:
- Admin → Create Parent Project → Project
- Admin → Assign Child Project → Project (set parent_project field)
- Admin → View Project Hierarchy → Project List
- API Consumer → Read Project with Parent Info → Project
- API Consumer → Read Project with Children Count → Project
- System → Validate Project Relationships → Prevent Circular References
- System → Enforce Nesting Depth → Prevent Deep Hierarchies

**Flows affected**:
- Project Creation Flow (new optional parent_project field)
- Project Browsing Flow (performance must be maintained)
- Project Detail Display Flow (will show parent/child info)
- Project Admin Management Flow (new relationship management)

**Entity changes needed**: Yes
- **Project Entity**: Add `parent_project` self-referential foreign key field
  - Fields: `parent_project` (ForeignKey to self, nullable, with related_name='child_projects')
  - Validation: Prevent circular references, enforce max depth = 1
  - Indexes: Add index on `parent_project_id` for query performance

**Flow changes needed**: No (for MVP)
- Existing flows remain unchanged
- New admin flows for managing relationships (manual process)
- Future flows will leverage this foundation

**Integration changes needed**: No
- No external systems affected
- API changes are backward compatible (new optional fields)

**New specifications required**:
- Admin workflow documentation for creating parent/child relationships
- API documentation updates for new fields (`parent_project_id`, `parent_project_name`, `child_projects_count`)

## Software Architecture

### API

**Changes:**
- Update Project serializer to include parent/child relationship fields
- **List endpoints** (`/api/projects/`) include: `parent_project_id`, `has_children` (no JOIN - optimal performance)
- **Detail endpoint** (`/api/projects/{slug}/`) includes: `parent_project_id`, `parent_project_name`, `parent_project_slug`, `has_children`, `child_projects_count`
- **Performance consideration:** `child_projects_count` is ONLY included in:
  - Detail endpoint: `/api/projects/{slug}/` (single project fetch)
  - NOT in list endpoints to avoid expensive COUNT queries on every row
- Existing endpoints remain unchanged (backward compatible)
- **Enable filtering by parent project ID**: `/api/projects/?parent_project={id}` returns all child projects
- **Enable filtering by parent project slug**: `/api/projects/?parent_project_slug={slug}` returns all child projects (preferred)
- Consider future endpoint: `/api/events/{slug}/sub-events/` for semantic clarity (deferred to US3)

**No breaking changes - purely additive.**

**Performance Strategy:**
- List endpoints (`/api/projects/`) do NOT include `child_projects_count` to avoid N+1 queries
- Detail endpoint (`/api/projects/{slug}/`) includes `child_projects_count` via simple annotation
- Frontend can detect parent events by checking `parent_project_id == null` AND fetching children
- Or frontend can rely on detail endpoint for accurate count

**Fetching Child Events (US1 provides the capability, US2 uses it):**
- Query parameter support: `?parent_project={parent_id}` OR `?parent_project_slug={slug}` filters projects by parent
- Slug-based filtering aligns with Climate Connect's API design pattern (entities fetched by slug)
- This enables US2 to fetch all Wasseraktionswochen sub-events
- US3 will check detail endpoint for `child_projects_count` when rendering existing pages

### Events

No event-driven architecture changes required for this task.

### Frontend

**No changes required for this task** (deferred to US2 and US3).

Future frontend work will consume the API changes to display parent/child relationships.

### Backend

**Django Model Changes:**
- Add `parent_project` field to Project model
  - `models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='child_projects')`
- Add validation in `Project.clean()` method to prevent circular references and enforce depth limit
- Add database index on `parent_project_id`

**Django Admin Changes:**
- Add `parent_project` to list display
- Add `parent_project` field to edit form
- Add inline display of child projects (read-only for MVP)
- Add admin list filter for projects with/without parents

**Query Optimization:**
- Use `select_related('parent_project')` in list views
- Use `prefetch_related('child_projects')` in detail views where needed

### Data

**Database Migration:**
- Add `parent_project_id` column to projects table (nullable)
- Add foreign key constraint to projects table (self-referential)
- Add index on `parent_project_id` column
- Set `on_delete=SET_NULL` to preserve children when parent is deleted

**Data Integrity:**
- Validation at Django model level (in `clean()` method)
- Consider adding database check constraint for additional safety

### Other

**Documentation:**
- Django admin user guide for managing parent/child relationships
- API documentation updates for new fields
- Migration deployment guide
- Performance benchmark documentation

## Technical Solution Overview

### 1. Django Model Update

**File:** `backend/climateconnect_api/models.py` (or similar Project model location)

```python
class Project(models.Model):
    # ...existing fields...
    
    parent_project = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='child_projects',
        help_text='Parent project for multi-event structures (e.g., festival with sub-events)',
        db_index=True  # Add index for query performance
    )
    
    has_children = models.BooleanField(
        default=False,
        help_text='Denormalized flag indicating if this project has child projects. Kept in sync via signals.',
        db_index=True  # Enable efficient filtering for parent events
    )
    
    # ...existing methods...
    
    def clean(self):
        """Validate parent/child relationships."""
        super().clean()
        
        if self.parent_project:
            # Prevent self-reference
            if self.parent_project == self:
                raise ValidationError("A project cannot be its own parent")
            
            # Prevent nesting beyond one level
            if self.parent_project.parent_project is not None:
                raise ValidationError("Projects can only be nested one level deep")
            
            # Prevent making a parent if already has children
            if self.child_projects.exists():
                raise ValidationError("A project with child projects cannot have a parent")
```

### 2. Database Migration

**File:** `backend/climateconnect_api/migrations/XXXX_add_parent_project.py`

```python
from django.db import migrations, models

def populate_has_children(apps, schema_editor):
    """Populate has_children field based on existing child_projects relationships."""
    Project = apps.get_model('climateconnect_api', 'Project')
    db_alias = schema_editor.connection.alias
    
    # Find all projects with children and set has_children=True
    parent_ids = Project.objects.using(db_alias).filter(
        child_projects__isnull=False
    ).values_list('id', flat=True).distinct()
    
    Project.objects.using(db_alias).filter(id__in=parent_ids).update(has_children=True)

class Migration(migrations.Migration):
    dependencies = [
        ('climateconnect_api', 'XXXX_previous_migration'),
    ]
    
    operations = [
        migrations.AddField(
            model_name='project',
            name='parent_project',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=models.SET_NULL,
                related_name='child_projects',
                to='climateconnect_api.project',
                help_text='Parent project for multi-event structures',
                db_index=True
            ),
        ),
        migrations.AddField(
            model_name='project',
            name='has_children',
            field=models.BooleanField(
                default=False,
                help_text='Denormalized flag indicating if this project has child projects',
                db_index=True
            ),
        ),
        migrations.RunPython(populate_has_children, migrations.RunPython.noop),
    ]
```

**Migration Safety:**
- ✅ **Zero risk**: Adding nullable columns with default values
- ✅ **No data modification**: Existing projects remain unchanged (all fields NULL/False)
- ✅ **Backward compatible**: No existing code breaks
- ✅ **Fast execution**: Simple ALTER TABLE (< 1 second even with 10K projects)

**Rollback Strategy (if needed):**
Django will auto-generate the reverse migration, or manually:
```sql
-- Simple rollback - just drop the columns
ALTER TABLE climateconnect_api_project DROP COLUMN parent_project_id;
ALTER TABLE climateconnect_api_project DROP COLUMN has_children;
```
**Zero data loss** since no existing projects have parent/child relationships.

### 3. API Serializer Update

**File:** `backend/climateconnect_api/serializers.py` (or similar)

```python
class ProjectSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views - no JOINs required."""
    parent_project_id = serializers.IntegerField(source='parent_project_id', read_only=True, allow_null=True)
    has_children = serializers.BooleanField(read_only=True)  # Zero-cost parent detection
    
    class Meta:
        model = Project
        fields = [
            # ...existing fields...
            'parent_project_id',  # Foreign key value - no JOIN needed
            'has_children',       # Boolean field - no JOIN needed
        ]

class ProjectDetailSerializer(serializers.ModelSerializer):
    """Extended serializer for detail views - includes parent info and child count."""
    parent_project_id = serializers.IntegerField(source='parent_project.id', read_only=True, allow_null=True)
    parent_project_name = serializers.CharField(source='parent_project.name', read_only=True, allow_null=True)
    parent_project_slug = serializers.CharField(source='parent_project.slug', read_only=True, allow_null=True)
    has_children = serializers.BooleanField(read_only=True)
    child_projects_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            # ...existing fields...
            'parent_project_id',
            'parent_project_name',
            'parent_project_slug',
            'has_children',
            'child_projects_count',
        ]
    
    def get_child_projects_count(self, obj):
        # Only used in detail views - acceptable cost
        return obj.child_projects.count()
```

**Performance Note:**
- List views use `ProjectSerializer` (no count field)
- Detail views use `ProjectDetailSerializer` (includes count)
- This avoids expensive COUNT queries on project listings

### 3a. API ViewSet Update (Enable Parent Filtering)

**File:** `backend/climateconnect_api/views.py` (or similar)

```python
from django_filters import rest_framework as filters

class ProjectFilter(filters.FilterSet):
    parent_project = filters.NumberFilter(field_name='parent_project__id')
    parent_project_slug = filters.CharFilter(field_name='parent_project__slug')  # Slug-based filtering
    # ...existing filters...
    
    class Meta:
        model = Project
        fields = ['parent_project', 'parent_project_slug', ...]  # existing fields

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()  # No select_related in base queryset
    filterset_class = ProjectFilter
    
    def get_queryset(self):
        """Optimize query based on action - only JOIN when needed."""
        queryset = super().get_queryset()
        
        if self.action == 'retrieve':
            # Detail view needs parent info - apply select_related
            return queryset.select_related('parent_project')
        
        # List/filter views don't need parent JOIN - use base queryset
        return queryset
    
    def get_serializer_class(self):
        """Use detail serializer for retrieve, list serializer for list/filter."""
        if self.action == 'retrieve':
            return ProjectDetailSerializer  # Includes parent info + child count
        return ProjectSerializer  # Only parent_project_id + has_children (no JOIN)
```

**Performance Optimization:**
- List/filter actions use `ProjectSerializer` (no `child_projects_count`)
- Retrieve action uses `ProjectDetailSerializer` (with `child_projects_count`)
- This prevents N+1 COUNT queries on project listings
- Browse page performance unaffected

**Usage Examples:**
- Get all child events by parent slug: `GET /api/projects/?parent_project_slug=wasseraktionswochen-2026`
- Get parent project WITH child count: `GET /api/projects/wasseraktionswochen-2026/` (detail endpoint)
- List all projects (no count overhead): `GET /api/projects/`

**API Design Note:** Following Climate Connect conventions, entity fetching uses slugs. Supporting `parent_project_slug` filter aligns with this pattern and makes the API more RESTful and developer-friendly.

### 3b. Django Signals (Keep has_children in sync)

**File:** `backend/climateconnect_api/signals.py` (or in models.py)

```python
from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver

@receiver(post_save, sender=Project)
def update_parent_has_children_on_save(sender, instance, created, **kwargs):
    """Update parent's has_children flag when a child is created or modified."""
    if instance.parent_project:
        # Check if parent actually has children
        has_children = instance.parent_project.child_projects.exists()
        
        # Only update if value changed (avoid unnecessary writes)
        if instance.parent_project.has_children != has_children:
            Project.objects.filter(pk=instance.parent_project.pk).update(has_children=has_children)

@receiver(pre_delete, sender=Project)
def update_parent_has_children_on_delete(sender, instance, **kwargs):
    """Update parent's has_children flag when a child is deleted."""
    if instance.parent_project:
        # After deletion, check if parent will still have children
        remaining_children = instance.parent_project.child_projects.exclude(pk=instance.pk).exists()
        
        # Only update if value changed
        if instance.parent_project.has_children != remaining_children:
            Project.objects.filter(pk=instance.parent_project.pk).update(has_children=remaining_children)
```

**Signal Registration:**
Ensure signals are registered in `apps.py`:

```python
class ClimateconnectApiConfig(AppConfig):
    name = 'climateconnect_api'
    
    def ready(self):
        import climateconnect_api.signals  # noqa
```

### 3c. Management Command (Safety Net for has_children)

**File:** `backend/climateconnect_api/management/commands/reconcile_has_children.py`

```python
from django.core.management.base import BaseCommand
from django.db.models import Exists, OuterRef
from climateconnect_api.models import Project

class Command(BaseCommand):
    help = 'Reconcile has_children flags with actual child_projects relationships'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be updated without making changes',
        )
    
    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        # Find projects with children that have has_children=False
        should_be_true = Project.objects.annotate(
            has_child_projects=Exists(Project.objects.filter(parent_project=OuterRef('pk')))
        ).filter(has_child_projects=True, has_children=False)
        
        # Find projects without children that have has_children=True
        should_be_false = Project.objects.annotate(
            has_child_projects=Exists(Project.objects.filter(parent_project=OuterRef('pk')))
        ).filter(has_child_projects=False, has_children=True)
        
        if dry_run:
            self.stdout.write(f'Would set has_children=True for {should_be_true.count()} projects')
            self.stdout.write(f'Would set has_children=False for {should_be_false.count()} projects')
        else:
            updated_true = should_be_true.update(has_children=True)
            updated_false = should_be_false.update(has_children=False)
            
            self.stdout.write(self.style.SUCCESS(
                f'Updated {updated_true} projects to has_children=True'
            ))
            self.stdout.write(self.style.SUCCESS(
                f'Updated {updated_false} projects to has_children=False'
            ))
            
            if updated_true == 0 and updated_false == 0:
                self.stdout.write(self.style.SUCCESS('All has_children flags are correct!'))
```

**Recommended Usage:**
- Run weekly via cron: `./manage.py reconcile_has_children`
- Run after bulk operations: `./manage.py reconcile_has_children --dry-run` (verify first)
- Monitor output for unexpected discrepancies (should be rare with signals)

### 4. Django Admin Configuration

**File:** `backend/climateconnect_api/admin.py`

```python
class ChildProjectInline(admin.TabularInline):
    model = Project
    fk_name = 'parent_project'
    fields = ['name', 'slug', 'start_date', 'location']
    readonly_fields = ['name', 'slug', 'start_date', 'location']
    extra = 0
    can_delete = False

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent_project', 'child_count', 'start_date']
    list_filter = ['is_event', HasParentFilter]
    search_fields = ['name', 'slug']
    inlines = [ChildProjectInline]
    
    def child_count(self, obj):
        return obj.child_projects.count()
    child_count.short_description = 'Child Projects'
```

### 5. Query Optimization

**File:** Views where projects are listed

```python
# In LIST views - NO select_related needed
projects = Project.objects.all()
# List serializer only uses parent_project_id (foreign key) and has_children (boolean)
# No JOIN overhead

# In DETAIL views - apply select_related for parent info
project = Project.objects.select_related('parent_project').get(slug=slug)
# Detail serializer accesses parent_project.name and parent_project.slug

# Optional: In views with children
project = Project.objects.prefetch_related('child_projects').get(slug=slug)
```

**Performance Impact:**
- **List queries:** Zero JOIN overhead (removed `select_related`)
- **Detail queries:** Single JOIN only when viewing individual project
- **Filtering by parent:** No additional JOIN needed (uses foreign key index)

### 6. Testing

**Unit Tests:**
- Test parent/child relationship creation
- Test circular reference prevention
- Test depth limit enforcement  
- Test deletion behavior (SET_NULL)
- Test model validation edge cases
- Test `has_children` flag set on child creation
- Test `has_children` flag cleared on last child deletion
- Test `has_children` flag updated when parent_project changes
- Test signal edge cases (bulk operations, direct DB updates)

**Integration Tests:**
- Test API serialization includes parent/child data (including parent_project_slug and has_children)
- Test filtering projects by parent ID
- Test filtering projects by parent slug (Climate Connect pattern)
- Test filtering by `has_children=true` to find all parent events
- Test performance with nested queries
- Test management command finds and fixes discrepancies

**Test Examples:**

```python
def test_has_children_flag_on_creation():
    """Test that has_children flag is set when child is created."""
    parent = Project.objects.create(name="Festival", slug="festival-2026")
    assert parent.has_children is False
    
    child = Project.objects.create(name="Workshop", slug="workshop-1", parent_project=parent)
    
    parent.refresh_from_db()
    assert parent.has_children is True

def test_has_children_flag_on_deletion():
    """Test that has_children flag is cleared when last child is deleted."""
    parent = Project.objects.create(name="Festival", slug="festival-2026")
    child = Project.objects.create(name="Workshop", slug="workshop-1", parent_project=parent)
    
    parent.refresh_from_db()
    assert parent.has_children is True
    
    child.delete()
    
    parent.refresh_from_db()
    assert parent.has_children is False

def test_management_command_reconciliation():
    """Test that management command fixes has_children discrepancies."""
    parent = Project.objects.create(name="Festival", slug="festival-2026", has_children=False)
    child = Project.objects.create(name="Workshop", slug="workshop-1", parent_project=parent)
    
    # Manually break the flag (simulating direct DB update)
    Project.objects.filter(pk=parent.pk).update(has_children=False)
    
    parent.refresh_from_db()
    assert parent.has_children is False  # Broken state
    
    # Run reconciliation command
    call_command('reconcile_has_children')
    
    parent.refresh_from_db()
    assert parent.has_children is True  # Fixed!

def test_filter_by_parent_project_id():
    """Test that API can filter projects by parent ID."""
    parent = Project.objects.create(name="Festival", slug="festival-2026")
    child1 = Project.objects.create(name="Workshop 1", slug="workshop-1", parent_project=parent)
    child2 = Project.objects.create(name="Workshop 2", slug="workshop-2", parent_project=parent)
    
    response = client.get(f'/api/projects/?parent_project={parent.id}')
    
    assert response.status_code == 200
    assert len(response.json()) == 2
    assert response.json()[0]['parent_project_id'] == parent.id
    assert response.json()[0]['parent_project_slug'] == 'festival-2026'
    assert response.json()[0]['has_children'] is False  # Children don't have children

def test_filter_by_parent_project_slug():
    """Test that API can filter projects by parent slug (preferred method)."""
    parent = Project.objects.create(name="Festival", slug="festival-2026")
    child1 = Project.objects.create(name="Workshop 1", slug="workshop-1", parent_project=parent)
    child2 = Project.objects.create(name="Workshop 2", slug="workshop-2", parent_project=parent)
    
    response = client.get(f'/api/projects/?parent_project_slug=festival-2026')
    
    assert response.status_code == 200
    assert len(response.json()) == 2
    assert all(child['parent_project_slug'] == 'festival-2026' for child in response.json())
    assert all(child['has_children'] is False for child in response.json())

def test_filter_by_has_children():
    """Test that API can filter to find all parent events."""
    parent1 = Project.objects.create(name="Festival 1", slug="festival-1")
    parent2 = Project.objects.create(name="Festival 2", slug="festival-2")
    standalone = Project.objects.create(name="Workshop", slug="workshop")
    
    Project.objects.create(name="Sub 1", slug="sub-1", parent_project=parent1)
    Project.objects.create(name="Sub 2", slug="sub-2", parent_project=parent2)
    
    # Filter for parent events only
    response = client.get('/api/projects/?has_children=true')
    
    assert response.status_code == 200
    assert len(response.json()) == 2
    assert all(p['has_children'] is True for p in response.json())
```

**Performance Benchmarks:**
- Measure browse page load time before/after
- Verify < 5% performance degradation
- Test with realistic data volume (1000+ projects)

## Log

**2026-01-06 14:30** - Task created by Taskie based on GitHub Issue #35 (Epic #33 breakdown). User requested to use task-based workflow for epic implementation. This is US1 converted to a task file.

**2026-01-06 15:45** - User asked clarifying question: "When do we implement fetching child events by parent - US1 or US2?" Answer: US1 provides the API capability via `?parent_project={id}` query parameter. US2 (Wasseraktionswochen page) will be the first consumer of this API. Updated task to explicitly include API filtering support in Software Architecture, Technical Solution (added section 3a for ViewSet filtering), and Acceptance Criteria. Created reference document: `US1-vs-US2-child-events-fetching.md`.

**2026-01-06 16:00** - User observation: "doesn't the API design typically use slug to fetch entities?" Excellent catch! Updated API design to align with Climate Connect patterns:
  - Added `parent_project_slug` field to serializer (in addition to ID and name)
  - Added `parent_project_slug` filter support in ViewSet (preferred over ID filtering)
  - Updated all API examples to show slug-based entity fetching
  - Updated acceptance criteria to test both ID and slug filtering
  - Updated test examples to include slug-based filtering tests
  - This makes the API more RESTful and consistent with existing Climate Connect patterns

**2026-01-06 17:30** - User identified performance concern: "The child_projects_count would add another join in the database, right? That would impact esp. the listing of projects (events)." CRITICAL observation! Updated implementation strategy:
  - **Changed approach:** `child_projects_count` is now ONLY in detail serializer, NOT in list serializer
  - Created separate `ProjectDetailSerializer` for detail views (includes count)
  - Updated `ProjectSerializer` for list views (no count field)
  - Updated ViewSet to use `get_serializer_class()` to switch between serializers
  - This prevents N+1 COUNT queries on project listings (critical for browse page performance)
  - Detail endpoint still provides count when needed (US2, US3 can use this)
  - Updated acceptance criteria to verify list endpoint performance remains unchanged
  - This protects the most performance-critical endpoint (project listings/browse)

**2026-01-06 18:00** - User asked: "Shall we ask Archie for other options? It would be nice to know when listing projects if a project has children." Consulted Archie (system architect) for architectural guidance on indicating parent events in list views without performance impact. Archie's recommendation:
  - **Add `has_children` boolean flag** as enhancement to two-serializer approach
  - Denormalized field kept in sync via Django signals (post_save, pre_save, post_delete)
  - Zero performance overhead (just boolean field, no JOIN/COUNT)
  - Enables visual indicators (badges/icons) in browse/search/hub pages
  - Safety net: management command for weekly reconciliation
  - Perfect for Climate Connect's scale (< 10K projects, < 100 parents)
  - Provides best of both worlds: `has_children` (boolean, 0ms) + `child_projects_count` (exact, detail only)

**2026-01-06 18:15** - **User decision: "Add it to US1"**. Implemented Archie's recommendation:
  - Added `has_children` field to model (Section 1)
  - Updated migration to include field and data population (Section 2)
  - Updated serializer to include `has_children` in all responses (Section 3)
  - Added Django signals implementation (Section 3b - NEW)
  - Added management command for reconciliation (Section 3c - NEW)
  - Updated testing section with signal and command tests (Section 6)
  - Added comprehensive test examples
  - Updated acceptance criteria with signal, command, and performance requirements
  - Performance outcome document will be removed (details now in task)

**2026-01-13 09:00** - **User confirms has_children as formal requirement**: "Your recommendation to use has_children is good and I accept it. Add it to the specs as requirement."
  - Updated Core Requirements to include `has_children` field, signals, and management command (Requirements 2-4)
  - This is now a formal requirement, not just an optional enhancement
  - All related implementation details already in spec from previous update
  - Ready for development with full has_children support

**2026-01-13 09:15** - **Critical performance optimization identified by user**: "Does select_related('parent_project') impact performance? In the list view we don't need to know who the parent is."
  - **Root cause**: Original spec had `select_related('parent_project')` for ALL queries, adding JOIN overhead to list views
  - **Solution**: Split into two serializers - `ProjectSerializer` (list) and `ProjectDetailSerializer` (detail)
  - **List serializer** now only includes `parent_project_id` and `has_children` (no JOIN needed)
  - **Detail serializer** includes full parent info: `parent_project_name`, `parent_project_slug`, `child_projects_count` (with JOIN)
  - **ViewSet optimization**: Conditional `select_related` only applied in `retrieve` action
  - **Performance gain**: Eliminates JOIN on browse/search/filter endpoints (most common use case)
  - **Updated sections**: 3 (serializers), 3a (viewset), 5 (query optimization), acceptance criteria, AI insights
  - This is a **critical optimization** for the browse page - zero JOIN overhead on list queries

**2026-01-13 09:30** - **User clarification on backward compatibility and rollback**: "These changes should all be backwards compatible. We are only adding fields and no existing data has these parent child relationships. Rollback should be easy if needed."
  - Updated Non-Functional Requirements section to emphasize backward compatibility details
  - Added explicit rollback SQL example (simple DROP COLUMN)
  - Updated acceptance criteria with backward compatibility verification steps
  - Clarified that all existing API tests must pass without modification
  - Added staging verification: existing projects must remain unchanged (parent_project=NULL, has_children=False)
  - This reinforces the **zero-risk nature** of this migration - purely additive, easily reversible

**2026-01-13 09:45** - **User request: "Taskie, these specs look ready now. Based specs review the user story and update it were needed. The user story should stay on high level without technical details."**
  - Reviewed and updated user story file: `docs/epics/user-stories/35-parent-child-project-relationships.md`
  - Updated acceptance criteria to include `has_children` field, signals, and management command
  - Added backward compatibility and performance requirements
  - Simplified Technical Considerations section (removed code snippets, kept design decisions)
  - Simplified Testing Requirements (high-level only)
  - Simplified Implementation Guidance (removed detailed steps)
  - Added reference to detailed task file at top of user story
  - User story now stays high-level while task file contains all technical specifications
  - Committed changes to repository

**2026-01-13 10:00** - **User review: "I still see some questions for discussion in the user story. Ask me each question one by one."**
  - Conducted Q&A session for each design decision:
  
  **Q1: Deletion behavior (CASCADE vs SET_NULL)?**
  - User decision: **SET_NULL** - "Agree with recommendation, we can set to null to avoid losing data and in the first iteration we are manually managing these relationships in the Django admin."
  
  **Q2: Maximum nesting depth (1 level vs unlimited)?**
  - User decision: **1 level only** - "Yes, limit to one. There is no use case to support deeper levels at this point."
  
  **Q3: Retroactive linking of existing projects?**
  - User decision: **Start fresh** - "No, there are no existing projects where we need this. This is a brand new feature."
  
  **Q4: API versioning (new version vs backward compatible)?**
  - User decision: **Backward compatible** - "No, not needed, the changes are backwards compatible."
  
  - Replaced "Questions for Discussion" section with "Design Decisions" section documenting confirmed decisions
  - All design decisions are now finalized and documented
  - User story is complete and ready
  - Committed changes: `3c90183`

**2026-01-13 10:15** - **User request: "Remove the future enhancements. They add no value to this user story and only add noise."**
  - Removed "Future Enhancements" section from user story
  - Keeps user story focused on current scope
  - Committed changes: `9a5434e`

**2026-01-13 10:20** - **Task status transition: DRAFT → IMPLEMENTATION**
  - All design decisions confirmed and documented
  - User story finalized and aligned with task specs
  - Task specifications complete and ready for development
  - Ready to hand off to development agent for TDD implementation
  - Next phase: Implementation with appropriate development agent

**2026-01-13 10:30** - **Task status transition: IMPLEMENTATION → COMPLETED**
  - User clarified: "We do the actual implementation in a different repository. This repository is only for our backlog and specs refinement."
  - This repository is for **specification and backlog management only**
  - Task file contains complete technical specifications ready for implementation
  - User will manually copy task to implementation repository
  - All specifications finalized and approved
  - **Task complete in this repository** - ready for implementation in code repository

**2026-01-15 06:45** - **Implementation started** in actual code repository
  - Created feature branch: `parent_child_project_relationships`
  - Implemented model changes: Added `parent_project` ForeignKey and `has_children` boolean fields
  - Implemented model validation: Self-reference prevention, depth limit enforcement, children-parent constraint
  - Created database migration with data population function
  - Created Django signals for `has_children` synchronization (post_save, pre_delete)
  - Registered signals in apps.py ready() method
  - Created management command `reconcile_has_children` with --dry-run support
  - Created comprehensive test suite: model validation, signals, management command, API (pending)
  - Applied migration successfully to development database
  - Committed initial implementation: `1240e087`
  - Next steps: Fix test fixture issues, implement API serializers and views, run full test suite

## Acceptance Criteria

- [ ] Database migration created with `parent_project` and `has_children` fields, indexes, and proper constraints
- [ ] Migration includes data population function for `has_children` field
- [ ] Migration tested locally and on staging without data loss
- [ ] **Migration is backward compatible** (all existing tests pass without modification)
- [ ] **Rollback tested** (can safely drop columns with zero data loss)
- [ ] Model validation prevents circular references (raises ValidationError)
- [ ] Model validation enforces max nesting depth of 1 (raises ValidationError)
- [ ] **Django signals implemented to keep `has_children` in sync** (post_save, pre_delete)
- [ ] **Signals registered in apps.py ready() method**
- [ ] **Management command `reconcile_has_children` created with --dry-run support**
- [ ] Django admin displays parent project in list view
- [ ] Django admin allows setting parent via dropdown in edit form
- [ ] Django admin shows inline child projects (read-only)
- [ ] **API list endpoint includes ONLY `parent_project_id` and `has_children`** (no JOIN - optimal performance)
- [ ] **API detail endpoint includes `parent_project_id`, `parent_project_name`, `parent_project_slug`, `has_children`, `child_projects_count`** (full info)
- [ ] **API supports filtering by parent ID**: `/api/projects/?parent_project={id}` returns child projects
- [ ] **API supports filtering by parent slug**: `/api/projects/?parent_project_slug={slug}` returns child projects
- [ ] **API supports filtering by `has_children`**: `/api/projects/?has_children=true` returns parent events
- [ ] **API responses are backward compatible** (existing clients ignore new fields)
- [ ] **All existing API tests pass without modification** (new fields are purely additive)
- [ ] **Browse/list page performance remains within 5% of baseline** (critical - no COUNT overhead, no JOIN)
- [ ] **Detail page performance acceptable with child count** (< 50ms increase)
- [ ] **Unit tests for `has_children` flag on child creation** (verify signal works)
- [ ] **Unit tests for `has_children` flag on child deletion** (verify signal works)
- [ ] **Unit tests for `has_children` flag on parent_project change** (verify signal works)
- [ ] **Unit tests for signal edge cases** (bulk operations, direct DB updates)
- [ ] **Integration tests for management command reconciliation** (dry-run and actual)
- [ ] Unit tests written for all validation logic (100% coverage of edge cases)
- [ ] Integration tests verify API serialization works correctly
- [ ] **Integration tests verify list endpoint excludes child_projects_count**
- [ ] **Integration tests verify detail endpoint includes child_projects_count**
- [ ] **Integration tests verify filtering by both parent_project ID and slug**
- [ ] **Integration tests verify filtering by `has_children` flag**
- [ ] **Integration tests verify `has_children` field present in all API responses**
- [ ] Performance benchmarks document before/after metrics for both list and detail
- [ ] Admin documentation created for managing parent/child relationships
- [ ] **Admin documentation includes management command usage** (weekly reconciliation recommended)
- [ ] API documentation updated with serializer differences (list vs detail)
- [ ] **API documentation explains `has_children` flag usage**
- [ ] Code review completed and approved
- [ ] Migration deployed to staging and validated
- [ ] **Verify existing projects in staging remain unchanged** (all parent_project=NULL, has_children=False)
- [ ] At least 1 test parent/child project pair created in staging
- [ ] **Verify `has_children` flag updates automatically in staging**
- [ ] **Run management command in staging to verify reconciliation works**
- [ ] **Verify list endpoint performance with 1000+ projects (no degradation)**
- [ ] **Verify can fetch child projects via API using both ID and slug filters**
- [ ] All tests pass (unit, integration, end-to-end)
- [ ] Security review passed (SQL injection, data integrity)
- [ ] Ready for production deployment

---

**Next Steps After Task Completion:**
This task enables US2 (Wasseraktionswochen Event Page) and US3 (Show child events on event page).


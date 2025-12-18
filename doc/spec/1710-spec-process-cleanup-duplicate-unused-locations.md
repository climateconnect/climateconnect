---
title: Location Database Cleanup Process - Remove Duplicates and Unused Records
version: 1.0
date_created: 2025-12-18
last_updated: 2025-12-18
owner: Climate Connect Development Team
tags: [process, data-cleanup, django-command, database, locations]
---

# Introduction

This specification defines the process and implementation requirements for cleaning up the Location database by removing duplicate location records and unused location references. The cleanup process will be implemented as a Django management command that can be manually executed in both development and production environments to maintain database integrity and optimize storage.

---

## 1. Purpose & Scope

**Purpose:**
To provide a safe, auditable mechanism for identifying and removing redundant location data from the Climate Connect database while preserving referential integrity across all dependent models in order to improve data quality and reduce table size..

**Scope:**
- Identify and merge duplicate locations based on OpenStreetMap (OSM) identifiers
- Remove location records that are not referenced by any dependent models
- Automatically redirect all foreign key references from deleted duplicate locations to the retained (newest) location record
- Implement as a Django management command (`cleanup_locations`) for manual execution
- Provide detailed logging and optional dry-run capability for testing

---

## 2. Definitions

| Term | Definition |
|------|-----------|
| **Location** | Django model representing geographic locations with OSM metadata (OpenStreetMap) |
| **OSM ID** | OpenStreetMap unique identifier for a geographic entity |
| **OSM Type** | OpenStreetMap entity type: 'N' (node), 'W' (way), 'R' (relation) |
| **OSM Class** | OpenStreetMap classification/category for a location (e.g., 'place', 'amenity', 'boundary') |
| **Duplicate Location** | Two or more Location records with identical OSM ID, OSM Type, and OSM Class values |
| **Unused Location** | A Location record not referenced by any dependent model via foreign key or many-to-many relationship |
| **Dependent Model** | Any Django model that has a relationship (FK, O2O, M2M) to the Location model |
| **Referential Integrity** | Consistency of foreign key references; no orphaned references to deleted records |
| **Dry-run Mode** | Simulation mode that identifies changes without applying them to the database |
| **Idempotent** | The command can be run multiple times with the same results |

---

## 3. Requirements, Constraints & Guidelines

### Functional Requirements

- **REQ-001**: Command must identify all Location records with identical `osm_id`, `osm_type`, and `osm_class` tuples
- **REQ-002**: When duplicates are found, the newest record (highest `id` value) must be retained
- **REQ-003**: All foreign key relationships pointing to duplicate locations must be updated to reference the retained location
- **REQ-004**: Command must identify Location records that have no references from any dependent model
- **REQ-005**: Unused locations must be safely deleted after confirming no dependent models reference them
- **REQ-006**: Command must support a `--dry-run` flag to simulate execution without modifying data
- **REQ-007**: Command output must provide statistics: duplicates found, duplicates merged, locations deleted
- **REQ-008**: Command must be idempotent (safe to run multiple times)
- **REQ-009**: Command must log all operations with timestamps and details for audit trail

### Dependent Models

The following models have relationships to the Location model:

| Model | Relationship Type | Field Name | Behavior |
|-------|-------------------|-----------|----------|
| `UserProfile` | ForeignKey | `location` | `SET_NULL` - allows null, safe to delete |
| `Organization` | ForeignKey | `location` | `SET_NULL` - allows null, safe to delete |
| `Project` | ForeignKey | `loc` | `SET_NULL` - allows null, safe to delete |
| `Idea` | ForeignKey | `location` | `SET_NULL` - allows null, safe to delete |
| `Hub` | ManyToMany | `location` | Through table `hubs_hub_location` - can be safely removed |

### Security & Data Protection Constraints

- **CON-001**: No user data other than Location references should be modified
- **CON-002**: Command must only be executable by users with `is_staff` privilege
- **CON-003**: Changes must be logged with the command execution timestamp and operator information

### Data Integrity Constraints

- **CON-004**: No location can be deleted if it still has active references (foreign key validation)
- **CON-005**: All FK updates must succeed before deletion to prevent orphaned references
- **CON-006**: Deletion must be performed in correct dependency order

### Operational Constraints

- **CON-007**: Command must be manually invoked (not automatic)
- **CON-008**: Dry-run mode must not modify any data
- **CON-009**: Output must be human-readable for review before execution

---

## 4. Interfaces & Data Contracts

### Command Interface

```bash
python manage.py cleanup_locations [OPTIONS]
```

### Command Options

```
--dry-run              Simulate execution without modifying data (optional)
```

### Output Format

The command must output structured information:  

Example
```
========================================
Location Cleanup Report
========================================
Execution Mode: DRY-RUN (actual: actual) | (dry)
Timestamp: 2025-12-18 10:30:45 UTC
Duration: 2m 34s

--- DUPLICATE LOCATIONS ANALYSIS ---
Total duplicate groups found: 42
Total duplicate records to be removed: 156
  - Group 1: 4 duplicates (OSM ID: 123456, Type: N, Class: place)
    Retaining: Location #5678 (id=5678)
    Redirecting references from: #5670, #5671, #5672
    
--- UPDATE OPERATIONS ---
ForeignKey updates completed: 156
  - UserProfile.location: 45 updated
  - Organization.location: 38 updated
  - Project.loc: 52 updated
  - Idea.location: 21 updated
  - Hub.location (M2M): 0 removed

--- DELETION OPERATIONS ---
Total locations to delete: 42
Successfully deleted: 42

--- SUMMARY ---
✓ Duplicates merged: 156 → 42 consolidated
✓ Unused locations deleted: 0
✓ Total locations removed: 198
✓ Referential integrity maintained
✓ No errors encountered

========================================
```

### Exit Codes

| Exit Code | Meaning |
|-----------|---------|
| 0 | Success - cleanup completed |
| 1 | General error - check logs for details |
| 2 | User cancelled execution |
| 3 | Database connection error |
| 4 | Permission denied (not staff user) |
| 5 | Dry-run identified errors that would prevent execution |

---

## 5. Acceptance Criteria

### Functional Acceptance Criteria

- **AC-001**: Given duplicate locations with the same OSM identifiers, When the command runs, Then the newest record (highest id) is retained and older duplicates are deleted
- **AC-002**: Given multiple foreign key references to duplicate locations, When the command runs, Then all FK references are updated to point to the retained location
- **AC-003**: Given a location with no dependent model references, When the command runs with default options, Then the unused location is identified and deleted
- **AC-004**: Given the command is run with `--dry-run` flag, When execution completes, Then no database changes are made and a report is displayed
- **AC-005**: Given invalid command options, When the command runs, Then appropriate error messages are displayed
- **AC-006**: Given the command runs successfully, When complete, Then all referential integrity constraints are satisfied

### Data Integrity Acceptance Criteria

- **AC-007**: When duplicates are merged, Then all referring records maintain valid references (no broken foreign keys)
- **AC-008**: When locations are deleted, Then no orphaned foreign key references exist in dependent tables
- **AC-009**: When the command completes, Then the database schema constraints are satisfied

### Operational Acceptance Criteria

- **AC-010**: Given the command completes successfully, When logs are reviewed, Then all operations are documented with timestamps
- **AC-011**: Given the command encounters an error, When logs are reviewed, Then the error details and context are available for debugging

---

## 6. Test Automation Strategy

### Test Levels

1. **Unit Tests**: Test individual component functions in isolation
2. **Integration Tests**: Test command interaction with Django models and database
3. **End-to-End Tests**: Test complete cleanup workflow with various data scenarios

### Test Scenarios

#### Duplicate Location Tests
- **Test**: Multiple duplicates (3+ records) with same OSM identifiers
  - Expected: Newest record retained, others deleted, all references updated
- **Test**: Duplicates where newest record has no references but older ones do
  - Expected: References are updated before deletion
- **Test**: Partial duplicates (only some fields matching)
  - Expected: Only records with all three OSM fields matching are considered duplicates

#### Unused Location Tests
- **Test**: Location with no dependent references
  - Expected: Location is identified as unused and deleted
- **Test**: Location with null foreign keys across all dependent models
  - Expected: Location is identified as unused and deleted
- **Test**: Location with reference in one model and null in others
  - Expected: Location is NOT marked as unused

#### Dry-Run Mode Tests
- **Test**: Execute with `--dry-run` flag
  - Expected: No database modifications, report generated
- **Test**: Run with dry-run, then without - verify changes now applied
  - Expected: Second run applies the changes that dry-run identified

#### Referential Integrity Tests
- **Test**: Update foreign key before deletion
  - Expected: No constraint violations, all updates succeed atomically
- **Test**: ManyToMany cleanup (Hub.location)
  - Expected: Through table records are properly cleaned

#### Edge Cases
- **Test**: Location with all OSM fields null
  - Expected: Not considered in duplicate detection
- **Test**: Location with only one or two OSM fields populated
  - Expected: Not considered duplicate unless all three match

```

---

## 7. Rationale & Context

### Why This Approach?

1. **Manual Command Pattern**: Rather than automatic cleanup, manual execution allows:
   - Review before data deletion
   - Control over execution timing
   - Ability to rollback via database backup

2. **Dry-run Capability**: Essential for:
   - Testing in production-like environments
   - Auditing changes before application
   - Understanding impact before execution

4. **OSM Tuple as Identifier**: Using `(osm_id, osm_type, osm_class)` as composite key for duplicate detection because:
   - These fields come from OpenStreetMap (external authoritative source)
   - Combination uniquely identifies geographic features

5. **Preserve Newest Record**: Keeping highest `id` ensures:
   - Newer data is more likely to be accurate (added later)
   - `id` correlates with `created_at` in practice
   - Simple, deterministic selection criterion

### Business Context

Climate Connect stores user and organization locations. Over time, unusaed and duplicates accumulate from:
- Location data from OSM changing over time and using the place identifier which is not suited for unique identification
- Location records also come from browse filtering 
- Changes of the implementation over time

### Technical Decisions

1. **ManyToMany vs ForeignKey Handling**: Hub uses ManyToMany so cleanup is different (through table)

---

## 8. Dependencies & External Integrations

### Django Framework Dependencies
- **PLT-001**: Django 3.2+ with ORM QuerySet API
- **PLT-002**: Django management command framework (django.core.management)

### Database Dependencies
- **DAT-001**: PostgreSQL database with foreign key constraint support

### Model Dependencies
- **MOD-001**: `location.models.Location` - the model being cleaned
- **MOD-002**: `climateconnect_api.models.UserProfile` - has FK to Location
- **MOD-003**: `organization.models.Organization` - has FK to Location
- **MOD-004**: `organization.models.Project` - has FK to Location
- **MOD-005**: `ideas.models.Idea` - has FK to Location
- **MOD-006**: `hubs.models.Hub` - has M2M to Location

### Documentation Dependencies
- **DOC-001**: Readable command help text (`--help` output)
- **DOC-002**: Clear error messages for debugging

---

## 9. Examples & Edge Cases

### Example 1: Basic Duplicate Cleanup

```python
# Database state before:
Location(id=10, osm_id=123, osm_type='N', osm_class='place', city='Berlin')
Location(id=11, osm_id=123, osm_type='N', osm_class='place', city='Berlin')
Location(id=12, osm_id=123, osm_type='N', osm_class='place', city='Berlin')

UserProfile(id=1, location_id=10)
Project(id=1, loc_id=11)
Organization(id=1, location_id=12)

# Command execution:
$ python manage.py cleanup_locations --dry-run

# Output (dry-run):
Found 1 duplicate group: 3 records with OSM (123, N, place)
Retaining: Location #12 (highest id)
Updating references: #10 → #12 (1 UserProfile), #11 → #12 (1 Project)
Would delete: Locations #10, #11

# After running without --dry-run:
Location(id=12, osm_id=123, osm_type='N', osm_class='place', city='Berlin')

UserProfile(id=1, location_id=12)
Project(id=1, loc_id=12)
Organization(id=1, location_id=12)
```

### Example 2: Unused Location Cleanup

```python
# Database state before:
Location(id=20, name='Paris', city='Paris', country='France')  # No references
Location(id=21, name='London', city='London', country='UK')    # Referenced

UserProfile(id=2, location_id=21)

# Command identifies:
Location #20 as unused (no FK references exist)

# After cleanup:
Location #20 deleted
Location #21 remains
```

### Example 3: ManyToMany (Hub) Cleanup

```python
# Database state before:
Location(id=30, osm_id=456, osm_type='R', osm_class='boundary')
Location(id=31, osm_id=456, osm_type='R', osm_class='boundary')

Hub(id=1, name='Berlin Hub')
Hub.location.add(30, 31)  # Both duplicates referenced

# After cleanup:
Hub.location = [31]  # Only newest retained
Locations 30 deleted
```

### Edge Case 1: Locations with NULL OSM Fields

```python
# These are NOT considered duplicates even if other fields match:
Location(id=1, osm_id=None, osm_type='N', osm_class='place')
Location(id=2, osm_id=None, osm_type='N', osm_class='place')
Location(id=3, osm_id=100, osm_type=None, osm_class='place')
Location(id=4, osm_id=100, osm_type='R', osm_class=None)

# Reason: Must have ALL THREE fields to identify unique OSM entity
```

### Edge Case 2: Partial Reference Update

```python
# Location referenced by multiple models:
Location(id=50, osm_id=789, osm_type='W', osm_class='amenity')
Location(id=51, osm_id=789, osm_type='W', osm_class='amenity')

UserProfile(location_id=50)
Project(loc_id=50)
Idea(location_id=51)
Hub.location = [50, 51]

# Cleanup must:
# 1. Update UserProfile.location: 50 → 51
# 2. Update Project.loc: 50 → 51
# 3. Keep Idea.location: 51 (already correct)
# 4. Update Hub.location: remove 50, keep 51 only
# 5. Delete Locations 50
```

### Edge Case 3: Command Re-run (Idempotency)

```bash
# First run
$ python manage.py cleanup_locations
# Processes duplicates and unused locations
# Changes: 156 duplicate merges, 42 locations deleted

# Second run (same data state)
$ python manage.py cleanup_locations
# Should report: No duplicates found, no unused locations found
# Changes: 0

# This ensures the command is safe to re-run
```

---

## 10. Validation Criteria

### Pre-Execution Validation

- [ ] User is staff member (`User.is_staff == True`)
- [ ] Database connection is accessible and writable
- [ ] All dependent models are correctly loaded
- [ ] Dry-run mode specified (recommended before actual run)

### Post-Execution Validation

- [ ] All duplicate locations have been merged
- [ ] All references updated to retained locations
- [ ] All unused locations deleted
- [ ] Database referential integrity constraints satisfied
- [ ] No orphaned foreign keys exist
- [ ] Command exit code is 0 (success)
- [ ] Execution log contains all operation details

### Automated Validation Queries

After cleanup, these queries should return empty results:

```python
# No invalid foreign keys should exist
from django.db import connection

# Check UserProfile.location references non-existent Location
invalid = UserProfile.objects.filter(
    location__isnull=False
).exclude(
    location_id__in=Location.objects.values_list('id')
)
assert not invalid.exists(), "Invalid UserProfile.location references"

# Check Project.loc references non-existent Location
invalid = Project.objects.filter(
    loc__isnull=False
).exclude(
    loc_id__in=Location.objects.values_list('id')
)
assert not invalid.exists(), "Invalid Project.loc references"

# ... similar checks for all dependent models

# Verify duplicates are gone
duplicates = Location.objects.filter(
    osm_id__isnull=False,
    osm_type__isnull=False,
    osm_class__isnull=False
).values('osm_id', 'osm_type', 'osm_class').annotate(
    count=Count('id')
).filter(count__gt=1)
assert not duplicates.exists(), "Duplicates still exist"
```

---

## 11. Related Specifications / Further Reading

- [Location Model Documentation](../domain-entities.md)
- [Django Management Commands](https://docs.djangoproject.com/en/3.2/howto/custom-management-commands/)
- [Django Database Transactions](https://docs.djangoproject.com/en/3.2/topics/db/transactions/)
- [OpenStreetMap Data Structure](https://wiki.openstreetmap.org/wiki/Elements)
- [Climate Connect Backend Architecture](../architecture.md)
- [Django ORM Query Optimization](https://docs.djangoproject.com/en/3.2/topics/db/optimization/)


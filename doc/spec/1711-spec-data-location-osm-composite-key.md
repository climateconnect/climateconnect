---
title: Location Identifier Migration from place_id to OSM Composite Key
version: 1.1
date_created: 2025-12-18
last_updated: 2025-12-18
owner: Backend Team
tags: [data, process, location, osm, migration]
---

# Introduction

This specification defines the requirements for migrating location lookup logic from Nominatim's `place_id` to a composite identifier consisting of OpenStreetMap (OSM) ID, OSM Type, and OSM Class. The `place_id` from Nominatim is not stable and does not uniquely identify locations in the OSM database, making it unsuitable as a primary identifier. This migration will update the application logic to prefer OSM-based lookups while maintaining backward compatibility with existing `place_id` usage.

## 1. Purpose & Scope

**Purpose**: Transitioning location lookup and identification logic from `place_id` to a composite key of OSM ID, OSM Type, and OSM Class to ensure stable, reliable location identification.

**Scope**: This specification covers:
- Updates to location lookup and creation logic in the backend
- Handling of duplicate location records (selecting newest by ID)
- Impact on API endpoints that query or filter by location
- Frontend adjustments to location selection and filtering to use OSM parameters
- Backward compatibility strategy for `place_id` during transition period

**Assumptions**:
- The Location model already has the OSM fields (`osm_id`, `osm_type`, `osm_class`, `osm_class_type`) defined and populated
- Most existing location records have OSM fields populated (from previous migrations 0013, 0014, 0015)
- Multiple location records may exist with the same OSM composite key (no unique constraint)
- The Django backend is the primary system impacted; frontend changes are needed for OSM parameter usage
- Nominatim API responses include OSM ID, OSM Type, and OSM Class data

**Out of Scope**:
- Adding or modifying database schema fields (OSM fields already exist)
- Adding unique constraints to the database
- Deduplication or cleanup of existing duplicate location records (task #1710)
- Changes to coordinate storage format
- Modifications to geospatial query logic (PostGIS operations)
- Changes to location translation functionality

## 2. Definitions

- **place_id**: Nominatim's internal identifier for a location result; not stable across different Nominatim instances or database rebuilds
- **OSM ID** (`osm_id`): OpenStreetMap's unique identifier for a geographic feature within its type
- **OSM Type** (`osm_type`): The OpenStreetMap element type - Node (N), Way (W), or Relation (R)
- **OSM Class** (`osm_class`): The primary category of a location in OSM (e.g., "boundary", "place", "building")
- **OSM Class Type** (`osm_class_type`): The sub-category within the OSM Class (e.g., "administrative", "city", "town")
- **Composite Key**: A unique identifier composed of multiple fields; in this case: osm_id + osm_type + osm_class
- **Nominatim**: OpenStreetMap's geocoding service that translates addresses to coordinates and vice versa
- **Legacy Location**: Locations created with only city and country fields (when `ENABLE_LEGACY_LOCATION_FORMAT=True`)
- **Stub Location**: A location created without complete geocoordinate data (marked with `is_stub=True`)

## 3. Requirements, Constraints & Guidelines

### Location Lookup Logic Requirements

- **REQ-001**: The system MUST query for existing locations using the OSM composite key (osm_id, osm_type, osm_class) as the primary lookup method instead of place_id

- **REQ-002**: When multiple location records match the same OSM composite key, the system MUST return the newest record (highest `id` value)

- **REQ-003**: The `place_id` field MUST be retained for backward compatibility and MAY continue to be stored, but MUST NOT be used as the primary identifier for location lookups

- **REQ-004**: The `place_id` field is considered DEPRECATED and may be removed in a future version after successful migration and transition period

- **REQ-005**: When creating a new location, the system SHOULD validate that OSM composite key fields (osm_id, osm_type, osm_class) are present and non-null for standard locations

- **REQ-006**: The system MUST handle special cases where OSM data may be missing or invalid:
  - "Global" location with synthetic identifiers
  - Stub locations marked with `is_stub=True`
  - Legacy locations when `ENABLE_LEGACY_LOCATION_FORMAT=True` (TO BE DISCUSSED)

- **REQ-007**: Legacy location format (city + country only) MUST continue to function when `ENABLE_LEGACY_LOCATION_FORMAT=True`  (TO BE DISCUSSED)

### API Endpoint Requirements

- **REQ-008**: The `/api/get_location/` endpoint MUST accept OSM parameters (osm_id, osm_type, osm_class) in addition to place_id for backward compatibility

- **REQ-009**: When both OSM parameters and place_id are provided, the system MUST prioritize OSM composite key lookup

- **REQ-010**: API endpoints MUST continue to accept place_id during the transition period

- **REQ-011**: Location filtering in project and user search endpoints MUST support both OSM composite key and place_id lookups

- **REQ-012**: Location queries for geospatial filtering MUST use OSM composite key for location identification

- **REQ-013**: API responses that include location data MUST include all OSM fields (osm_id, osm_type, osm_class, osm_class_type) to support frontend requirements

### Frontend Requirements

- **REQ-019**: The frontend location selection component (`LocationSearchBar.tsx`) MUST pass OSM fields (osm_id, osm_type, osm_class) when creating or selecting locations

- **REQ-020**: Location filtering in URL parameters MUST include OSM-based identification (osm, loc_type, osm_class parameters)

- **REQ-021**: Location filtering functionality MUST use OSM parameters for location retrieval

- **REQ-022**: Frontend location display and serialization MUST include OSM fields in the location object structure

- **REQ-023**: If frontend components currently only pass place_id, they MUST be updated to also include OSM parameters to support the backend migration

### Constraints

- **CON-001**: The migration MUST NOT break existing functionality during the transition period

- **CON-002**: The migration MUST be reversible in case issues are discovered post-deployment

- **CON-003**: Performance of location lookups MUST NOT degrade after implementing OSM composite key lookups

- **CON-004**: When multiple records exist with the same OSM composite key, the newest (highest ID) MUST always be selected

### Guidelines

- **GUD-001**: Developers SHOULD consider adding database indexes on (osm_id, osm_type, osm_class) as a composite for improved query performance

- **GUD-002**: Error handling SHOULD provide clear messages when OSM data is missing or invalid

- **GUD-003**: Logging SHOULD capture location lookup attempts using both old (place_id) and new (OSM composite) methods during the transition

- **GUD-004**: Code comments SHOULD be added to explain the transition from place_id to OSM composite key and the rationale for selecting newest by ID

- **GUD-005**: Tests SHOULD verify that the newest location is returned when multiple records match the same OSM composite key


## 4. Interfaces & Data Contracts

### Location Model Schema (Current)

The Location model includes the following relevant fields (already present in database):

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | AutoField | No | Primary key |
| osm_id | BigIntegerField | Yes | OpenStreetMap identifier |
| osm_type | CharField(1) | Yes | OSM element type: N/W/R |
| osm_class | CharField(100) | Yes | OSM classification |
| osm_class_type | CharField(100) | Yes | OSM sub-classification |
| place_id | BigIntegerField | Yes | Legacy Nominatim identifier (deprecated) |
| name | CharField(4096) | No | Display name |
| country | CharField(1024) | No | Country name |
| city | CharField(1024) | No | City name |

**Note**: No unique constraints exist on OSM fields. Multiple records may have the same OSM composite key. When looking up, always select the newest record (highest ID).

## 5. Acceptance Criteria

- **AC-001**: Given a location with valid OSM data (osm_id, osm_type, osm_class), When the location is queried by these fields, Then the system returns the newest existing location (by ID) without creating a duplicate

- **AC-002**: Given multiple location records with the same OSM composite key, When a lookup is performed, Then the system returns the record with the highest ID value

- **AC-003**: Given a new location with OSM data that doesn't exist in the database, When the location is created, Then the system successfully saves it with the OSM composite key

- **AC-004**: Given a location lookup request with place_id (legacy), When backward compatibility is required, Then the system can still retrieve the location but logs a deprecation warning

- **AC-005**: Given a user filters projects by location using OSM parameters, When the filter is applied, Then results are correctly scoped to the specified location using the newest matching record

- **AC-006**: Given the frontend sends location data with OSM fields, When the backend processes this data, Then the location is correctly identified or created using the OSM composite key

- **AC-007**: Given the "Global" special location, When it is queried or created, Then it is handled correctly with appropriate OSM values

- **AC-008**: Given location query performance before the migration, When queries are executed after migration using OSM composite key, Then performance is equal to or better than before

- **AC-009**: Given API endpoints that accept both place_id and OSM parameters, When both are provided, Then OSM parameters take precedence for location lookup

## 7. Rationale & Context

### Problem Statement

The current implementation uses Nominatim's `place_id` as the primary identifier for locations. However, `place_id` has several critical limitations:

1. **Not Stable**: `place_id` values can change when Nominatim's database is rebuilt or updated
2. **Instance-Specific**: Different Nominatim instances (e.g., different servers or versions) may assign different `place_id` values to the same geographic feature
3. **Not OSM Native**: `place_id` is a Nominatim construct, not part of OpenStreetMap's core data model
4. **Duplicate Risk**: The lack of a reliable unique identifier leads to duplicate location records in the database

### Why OSM Composite Key?

The combination of OSM ID, OSM Type, and OSM Class provides:

1. **Stability**: OSM IDs are permanent and consistent across all OSM data consumers
2. **Uniqueness**: The combination uniquely identifies a geographic feature in OSM
3. **Source of Truth**: Aligns with OpenStreetMap's canonical data model
4. **Interoperability**: Compatible with other OSM-based tools and services

### Why Include OSM Class?

While `osm_id` + `osm_type` might seem sufficient, including `osm_class` is necessary because:

1. Different classes can share the same OSM ID and type (e.g., a building and an administrative boundary)
2. It provides additional context for location disambiguation
3. It supports future filtering and categorization requirements

### Current System Context

The Climate Connect platform:
- Uses Nominatim for geocoding location searches
- Stores location references in Organizations, Projects, User Profiles, Ideas, and Hubs
- Supports both legacy (city/country) and modern (full OSM) location formats
- Already captures OSM fields in most location records (added in previous migrations)
- Uses PostGIS for geospatial queries and range filtering

## 8. Dependencies & External Integrations

### External Systems

- **EXT-001**: OpenStreetMap (OSM) Database - Source of truth for geographic features and their identifiers (OSM ID, Type, Class)

### Third-Party Services

- **SVC-001**: Nominatim Geocoding API - Required for:
  - Converting search queries to OSM-identified locations
  - Enriching existing locations with missing OSM data
  - Providing geojson, coordinates, and display names

### Infrastructure Dependencies

- **INF-001**: PostgreSQL with PostGIS Extension - Required for:
  - Storing location data with geospatial fields
  - Supporting unique constraints on composite keys
  - Geospatial queries (range filtering, polygon containment)
  - Version: PostgreSQL 12+ with PostGIS 3.0+

- **INF-002**: Database Indexes - Required for:
  - Composite index on (osm_id, osm_type, osm_class) for lookup performance
  - Individual indexes on osm_id and place_id for migration queries

### Technology Platform Dependencies

- **PLT-001**: Django Web Framework - Required for:
  - ORM for database operations
  - Migration framework for data migrations
  - Query optimization capabilities
  - Minimum version: Django 3.2+

### Integration Points

The following components have direct dependencies on location identification:

1. **Backend Components**:
   - Location utility functions - Core location lookup and creation logic
   - Location API endpoints - API endpoints for location retrieval
   - Project views - Project filtering by location
   - User profile views - User profile filtering by location

2. **Frontend Components**:
   - Location search bar - Location selection interface
   - Location operations - Location data formatting and API calls

3. **Database Relations**:
   - Organization model - References Location
   - Project model - References Location
   - UserProfile model - References Location
   - Idea model - References Location
   - Hub model - References Location


## 9. Validation Criteria

The implementation must satisfy the following validation criteria:

- **VAL-001**: Location lookup by OSM composite key returns the newest record (highest ID) when multiple matches exist

- **VAL-002**: API endpoints accept both legacy (place_id) and new (OSM composite) parameters during transition period

- **VAL-003**: When both place_id and OSM parameters are provided, OSM parameters take precedence for lookups

- **VAL-004**: Frontend location selection passes all required OSM fields (osm_id, osm_type, osm_class) to the backend

- **VAL-005**: Location filtering in project and user searches produces correct results using OSM-based lookups

- **VAL-006**: All automated tests pass, including new tests for OSM composite key functionality and multiple record handling

- **VAL-007**: Manual testing confirms location creation, retrieval, and filtering work end-to-end

- **VAL-008**: Database indexes on OSM fields are created and utilized

- **VAL-009**: Special locations (Global, stub locations) are handled correctly without errors

- **VAL-010**: No increase in error rates or performance degradation in production monitoring after deployment

- **VAL-011**: API response format includes all necessary OSM fields for frontend compatibility

- **VAL-012**: Documentation is updated to reflect the new location identification approach

## 10. Related Specifications / Further Reading

### Internal Documentation

- [Architecture Overview](../mosy/architecture_overview.md) - System architecture and design patterns
- [Domain Entities](../domain-entities.md) - Data model relationships and entity definitions
- [Environment Variables](../environment-variables.md) - Configuration for Nominatim API and location services

### External Documentation

- [OpenStreetMap Wiki - Elements](https://wiki.openstreetmap.org/wiki/Elements) - OSM data model (nodes, ways, relations)
- [Nominatim API Documentation](https://nominatim.org/release-docs/latest/api/Overview/) - Geocoding API reference
- [OSM Wiki - Map Features](https://wiki.openstreetmap.org/wiki/Map_Features) - OSM class and type taxonomy
- [Django UniqueConstraint](https://docs.djangoproject.com/en/3.2/ref/models/constraints/#uniqueconstraint) - Django constraints documentation
- [PostGIS Documentation](https://postgis.net/documentation/) - Geospatial database features

### Code References

- `backend/location/models.py` - Location model definition
- `backend/location/utility.py` - Location creation and lookup functions
- `backend/location/location_views.py` - Location API endpoints
- `frontend/src/components/search/LocationSearchBar.tsx` - Location selection UI
- `frontend/public/lib/locationOperations.ts` - Location data formatting

### Migration History

- Migration 0013 - Added OSM type field and populated existing locations
- Migration 0014 - Added OSM class, class_type, and display_name fields
- Migration 0015 - Filled missing OSM data for existing locations
- Upcoming: Logic migration to use OSM composite key for location lookups


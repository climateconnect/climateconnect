---
title: Remove ENABLE_LEGACY_LOCATION_FORMAT Support from Backend
version: 1.0
date_created: 2025-12-18
last_updated: 2025-12-18
owner: Backend Team
tags: [process, backend, technical-debt, location, cleanup]
---

# Introduction

This specification defines the requirements for removing the `ENABLE_LEGACY_LOCATION_FORMAT` environment variable and its associated legacy location handling code from the Climate Connect backend. This is a technical debt cleanup initiative to simplify the codebase and improve maintainability by removing a development-only feature that is no longer needed in production.

## 1. Purpose & Scope

**Purpose**: Remove the `ENABLE_LEGACY_LOCATION_FORMAT` feature flag and all related legacy location handling logic from the backend to reduce technical debt, simplify location handling code, and improve maintainability.

**Scope**: This specification covers:
- Removal of the `ENABLE_LEGACY_LOCATION_FORMAT` environment variable from backend settings
- Removal of legacy location handling logic that creates locations using only city and country fields
- Removal of conditional logic that switches between legacy and OSM-based location formats
- Cleanup of related test code that tests legacy location behavior
- Updates to documentation referencing the legacy location format
- Backend-only changes (frontend cleanup is a separate task)

**Assumptions**:
- The legacy location format has not been used in production environments
- The legacy location format was only used for local development to bypass external geocoding API requirements
- All production location data uses the full OSM-based location format with proper geocoding
- The frontend does not need to maintain compatibility with the legacy format after this change
- The OSM-based location handling (as specified in spec-data-location-osm-composite-key.md) is the current standard and will remain

**Out of Scope**:
- Frontend changes to remove `ENABLE_LEGACY_LOCATION_FORMAT` references (separate task)
- Changes to the core OSM-based location handling logic
- Migration of any existing legacy location data (none exists in production)
- Changes to the location model schema or database structure
- Updates to geocoding API integration logic
- Changes to location filtering or search functionality beyond removing legacy conditionals

## 2. Definitions

- **Legacy Location Format**: A simplified location representation using only city and country text fields, without OSM identifiers, coordinates, or full geocoding data
- **OSM-based Location Format**: The current standard location format using OpenStreetMap data including osm_id, osm_type, osm_class, coordinates, and full location metadata from Nominatim geocoding API
- **ENABLE_LEGACY_LOCATION_FORMAT**: Environment variable (boolean string) that enabled legacy location format when set to "True", bypassing geocoding API calls
- **Technical Debt**: Code complexity and maintenance burden from supporting outdated or unnecessary features
- **Feature Flag**: Configuration variable that enables or disables specific functionality

## 3. Requirements, Constraints & Guidelines

### Removal Requirements

- **REQ-001**: The `ENABLE_LEGACY_LOCATION_FORMAT` environment variable MUST be removed from backend settings configuration

- **REQ-002**: The `get_legacy_location()` function in `backend/location/utility.py` MUST be removed as it only supports legacy location creation

- **REQ-003**: All conditional logic checking `settings.ENABLE_LEGACY_LOCATION_FORMAT` MUST be removed from backend code

- **REQ-004**: The code paths that previously executed when legacy format was enabled MUST be removed entirely

- **REQ-005**: The code paths for OSM-based location handling MUST remain as the single, standard implementation

- **REQ-006**: Test cases specifically testing legacy location format behavior (decorated with `@override_settings(ENABLE_LEGACY_LOCATION_FORMAT="True")`) MUST be removed

- **REQ-007**: Test cases for OSM-based location handling MUST be retained and updated to remove unnecessary settings overrides

- **REQ-008**: The system MUST exclusively use the full OSM-based location format with geocoding API integration after this change

### Documentation Requirements

- **REQ-009**: References to `ENABLE_LEGACY_LOCATION_FORMAT` MUST be removed from environment variable documentation

- **REQ-010**: References to legacy location format MUST be removed from local environment setup documentation

- **REQ-011**: Specification documents (such as spec-data-location-osm-composite-key.md) MUST be updated to remove mentions of legacy location compatibility

- **REQ-012**: The initial development setup script MUST be updated to remove `ENABLE_LEGACY_LOCATION_FORMAT` configuration

### Code Quality Guidelines

- **GUD-001**: Removing conditional branches SHOULD simplify the code and improve readability

- **GUD-002**: The resulting location handling code SHOULD have a single, clear code path for all location operations

- **GUD-003**: Error messages and validation logic SHOULD be updated to reflect that OSM fields are always required (except for special cases like stub locations)

- **GUD-004**: Code comments referencing legacy location format SHOULD be removed or updated

### Constraints

- **CON-001**: This change MUST NOT affect production environments as they do not use legacy location format

- **CON-002**: This change MUST NOT break existing location data that uses OSM-based format

- **CON-003**: Developers setting up new local environments MUST have proper geocoding API configuration (OpenStreetMap Nominatim) to create locations

- **CON-004**: This change SHOULD NOT modify the location model schema or database structure

- **CON-005**: This change MUST NOT affect the core location functionality for users, organizations, or projects

## 4. Interfaces & Data Contracts

### Affected Backend Files

The following backend files contain references to `ENABLE_LEGACY_LOCATION_FORMAT`:

- `backend/climateconnect_main/settings.py` - Settings configuration
- `backend/location/utility.py` - Location utility functions
- `backend/location/tests/test_utility.py` - Location utility tests
- `backend/climateconnect_api/serializers/user.py` - User profile serializer
- `backend/local-env-setup.md` - Local environment documentation

### Affected Documentation Files

- `doc/environment-variables.md` - Environment variable reference
- `doc/spec/1711-spec-data-location-osm-composite-key.md` - Location OSM specification
- `initial_dev_setup.sh` - Development setup script

### API Behavior Change

**Current Behavior** (with legacy format enabled):
- Location creation accepts minimal data: `{city: "Berlin", country: "Germany"}`
- Location serialization returns: `{city: "Berlin", country: "Germany"}`
- No geocoding API calls made

**Future Behavior** (legacy format removed):
- Location creation requires full OSM data from geocoding API
- All location operations require valid geocoding API configuration

## 5. Acceptance Criteria

### Code Removal Acceptance Criteria

- **AC-001**: Given the backend codebase, When searching for `ENABLE_LEGACY_LOCATION_FORMAT`, Then zero results are found in backend Python files

- **AC-002**: Given the `location/utility.py` file, When examining the `get_location()` function, Then it contains no conditional branches checking for legacy format

- **AC-003**: Given the `location/utility.py` file, When searching for `get_legacy_location()` function, Then the function does not exist

- **AC-004**: Given the user profile serializer, When examining the `get_location()` method, Then it returns only OSM-based location data without conditional logic

- **AC-005**: Given the test suite in `location/tests/test_utility.py`, When running tests, Then no tests use `@override_settings(ENABLE_LEGACY_LOCATION_FORMAT="True")` decorator

### Functional Acceptance Criteria

- **AC-006**: Given a developer setting up a local environment, When creating a location, Then the system requires full geocoding API integration and OSM data

- **AC-007**: Given an existing production environment, When this change is deployed, Then all location operations continue to function identically as before

- **AC-008**: Given the backend test suite, When running all tests, Then all location-related tests pass without legacy format configuration

### Documentation Acceptance Criteria

- **AC-009**: Given the environment variables documentation, When searching for `ENABLE_LEGACY_LOCATION_FORMAT`, Then the section is removed

- **AC-010**: Given the local environment setup documentation, When reading the file, Then no references to legacy location format exist

- **AC-011**: Given the OSM location specification document, When reviewing requirements, Then all mentions of legacy format compatibility are removed

- **AC-012**: Given the initial dev setup script, When examining the file, Then the `ENABLE_LEGACY_LOCATION_FORMAT` variable is not set

## 6. Rationale & Context

### Why Remove This Feature?

**Technical Debt Reduction**: The legacy location format was introduced as a temporary workaround to allow local development without configuring external geocoding APIs. It was never intended for production use and adds unnecessary complexity to the codebase.

**Simplified Codebase**: Supporting two different location formats requires conditional logic throughout the location handling code, making it harder to understand, maintain, and extend. Removing this feature will result in cleaner, more maintainable code with a single clear code path.

**No Production Impact**: Since the legacy format is not being used in production and is only a development convenience, removing it has zero impact on production environments and existing data.

**Better Development Practices**: Modern development practices favor consistency between development and production environments. Requiring proper geocoding API configuration in development ensures that developers test with production-like data and catch issues earlier.

**OSM Migration Complete**: The platform has completed its migration to OSM-based location identifiers (as documented in spec-data-location-osm-composite-key.md). The legacy format predates this migration and is incompatible with the current location architecture.

### Historical Context

The `ENABLE_LEGACY_LOCATION_FORMAT` feature was likely introduced early in the project's development to allow developers to work on location-related features without needing to configure external API access to OpenStreetMap's Nominatim geocoding service. This was useful when:
- Developers had limited or no internet connectivity
- The geocoding API had rate limits that impacted development
- The location model was simpler and didn't require OSM identifiers

However, with the current architecture requiring OSM composite keys (osm_id, osm_type, osm_class) for proper location identification, the legacy format is no longer viable and creates incompatibilities.

### Alternative Considered

**Keep the Feature**: We could keep the legacy format for development convenience. However:
- It creates divergence between development and production environments
- It requires maintaining parallel code paths and test cases
- It's incompatible with OSM-based location lookups

## 7. Dependencies & External Integrations

### External Systems
- **EXT-001**: OpenStreetMap Nominatim API - Required for all location geocoding operations after removal

## 8. Validation Criteria

### Code Review Validation

- **VAL-001**: All Python files in backend directory have been searched for `ENABLE_LEGACY_LOCATION_FORMAT` references
- **VAL-002**: The `get_legacy_location()` function has been removed from `location/utility.py`
- **VAL-003**: No conditional branches checking legacy format setting remain in location handling code
- **VAL-004**: All test decorators referencing legacy format have been removed
- **VAL-005**: Code follows existing code style and formatting standards (Black formatter)

### Testing Validation

- **VAL-006**: All existing location-related tests pass after legacy code removal
- **VAL-007**: Test coverage for location functionality is maintained or improved
- **VAL-008**: No tests fail due to missing legacy format configuration
- **VAL-009**: Location creation tests use full OSM data and geocoding

### Documentation Validation

- **VAL-010**: Environment variables documentation has no references to `ENABLE_LEGACY_LOCATION_FORMAT`
- **VAL-011**: Local setup documentation has been updated to require geocoding API configuration
- **VAL-012**: Developer onboarding documentation reflects the simplified location handling
- **VAL-013**: Related specification documents have been updated to remove legacy format mentions

### Functional Validation

- **VAL-014**: Location creation works correctly in development environment with Nominatim API
- **VAL-015**: User profile location serialization returns correct format 
- **VAL-016**: Organization and project location handling functions identically
- **VAL-017**: Location search and filtering continue to work as expected

## 9. Related Specifications / Further Reading

- [spec-data-location-osm-composite-key.md](./1711-spec-data-location-osm-composite-key.md) - Current OSM-based location architecture
- [environment-variables.md](../environment-variables.md) - Environment variable documentation
- [Architecture Overview](../mosy/architecture_overview.md) - Overall system architecture
- OpenStreetMap Nominatim API Documentation - https://nominatim.org/release-docs/develop/api/Overview/
- Django Settings Best Practices - https://docs.djangoproject.com/en/3.2/topics/settings/

---

**Migration Path**: This change is a cleanup operation with no migration requirements. It removes unused code and simplifies the codebase. Developers will need to ensure their local environments have proper Nominatim API access, which is freely available without API keys.


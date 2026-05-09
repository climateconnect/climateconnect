# Implement Location Name Consistency Fix

**Status**: DRAFT  
**Type**: Bug Fix  
**Date and time created**: 2026-05-09 09:53 UTC  
**Date Completed**: N/A  
**Related GitHub Issue**: N/A  

**Upstream Dependencies / References**:  
- None  

## Problem Statement
The frontend generates location display names differently based on entity type: exact names (with place details and addresses) for projects, general names for organizations and users. However, the backend only uses general logic for location names and translations, leading to inconsistencies between stored names and asynchronously generated translated names. This affects user experience when viewing locations in different contexts and languages, as names don't match expectations.

The exact display name is also context-dependent: the same `Location` record can be referenced by a project (needing an exact venue name) and by an organisation or user (needing a general area name), so the display name cannot be stored on the shared `Location` or `LocationTranslation` models without contaminating the other entity types.

**Business/User Reason**: Ensures consistent and accurate location display across the platform, improving trust and usability for climate activists collaborating on projects with specific locations.

## Acceptance Criteria
- [ ] `format_exact_location_name` utility mirrors frontend `buildLocationName` output for exact locations
- [ ] `Project.exact_location_name` and `ProjectTranslation.exact_location_name_translation` fields exist and are populated on project save
- [ ] Project serializers return `exact_location_name` (or its translation) for projects with exact locations
- [ ] On save, both `Project.exact_location_name` and all `ProjectTranslation.exact_location_name_translation` rows are written synchronously, following the existing hub-and-spoke translation pattern
- [ ] Management command populates `exact_location_name` and translations for all existing exact-location projects
- [ ] Project location names display correctly in all supported languages
- [ ] Organizations and users continue using `Location.name` / `LocationTranslation.name_translation` unchanged
- [ ] No changes to `Location` or `LocationTranslation` models
- [ ] No performance regression in project list queries

## Constraints and Non-Negotiable Requirements
- No changes to frontend location parsing logic
- Organizations and users must retain current behavior (general names via shared location)
- Exact locations only apply to projects
- Must support translations for project location names without breaking existing translation workflows
- Backwards compatible with existing data
- Avoid frequent Nominatim refetches for performance

## Domain Context
- Locations are stored in shared `Location` model with geospatial data
- Projects, organizations, users have FK to `Location`
- Translations handled via separate models (`ProjectTranslation`, `LocationTranslation`)
- Frontend uses `parseLocation` with `is_exact_location` flag for name generation
- Backend uses `format_location_name` for general logic

## AI Insights
**Key Observations**:
- The Location model already stores all fields needed to reconstruct the exact display name: `place_name`, `exact_address`, `city`, `state`, `country`. No additional raw Nominatim data needs to be stored.
- The exact display name is context-dependent: the same Location record means different things for a project (exact venue) vs. an organisation or user (general area). The display name must therefore live on the entity that has this context — the Project — not on the shared Location or LocationTranslation.
- Translating exact display names is simpler than it appears: `place_name` and `exact_address` are language-neutral; only the geographic tail (`city`, `state`, `country`) requires translation, and those translations already exist in `LocationTranslation`. No Nominatim refetch is needed.
- Detecting an exact location is already possible from `bool(location.place_name or location.exact_address)`. A dedicated `is_exact_location` boolean flag on Location would be redundant.
- Project translations follow a hub-and-spoke pattern: `Project` stores content in the project's own language (not necessarily English); `ProjectTranslation` stores one row per other language. Both tables are written synchronously on every create/update — not via an async task. `exact_location_name` must follow this same pattern.

## Implementation Plan

### Overview
Add an `exact_location_name` field to the `Project` model and a corresponding `exact_location_name_translation` field to `ProjectTranslation`. The "exact" prefix is intentional — it distinguishes this field from Nominatim's `display_name` (verbose full string stored on Location) and from the general-format name used by organisations and users, avoiding the same naming ambiguity that contributed to this bug. Following the existing hub-and-spoke translation pattern, both tables are written synchronously on every project create/update: `Project.exact_location_name` is generated in the project's own language, and `ProjectTranslation.exact_location_name_translation` is generated for every other supported language — all composed from already-stored Location fields and existing `LocationTranslation` data. No changes to `Location`, `LocationTranslation`, or the organisation/user flows.

### Step 1 — Backend utility function
Add `format_exact_location_name(place_name, exact_address, city, state, country)` to `location/utility.py`, mirroring the frontend's `buildLocationName(place_name, exact_address, city+", "+country)` logic including `CUSTOM_NAME_MAPPINGS` and `MAP_STATE_AS_COUNTRY_CODES` handling.

### Step 2 — Model and migration
- Add `exact_location_name` (CharField, optional) to `Project`.
- Add `exact_location_name_translation` (CharField, optional) to `ProjectTranslation`.
- Generate and apply the migration.

### Step 3 — Save logic (both tables, synchronous)
On project create/update, if `loc.place_name or loc.exact_address`:

1. Resolve the LocationTranslation for the project's own language (fall back to `loc.city/state/country` if none exists). Generate and store `project.exact_location_name`:
```
project.exact_location_name = format_exact_location_name(
    place_name    = project.loc.place_name,
    exact_address = project.loc.exact_address,
    city          = lt_own.city_translation or loc.city,
    state         = lt_own.state_translation or loc.state,
    country       = lt_own.country_translation or loc.country,
)
```

2. Loop through all other supported languages, look up their `LocationTranslation`, and write `ProjectTranslation.exact_location_name_translation` — creating or updating the row, following the same pattern as the existing `edit_translations` utility:
```
exact_location_name_translation = format_exact_location_name(
    place_name    = project.loc.place_name,      # language-neutral
    exact_address = project.loc.exact_address,   # language-neutral
    city          = lt.city_translation or loc.city,
    state         = lt.state_translation or loc.state,
    country       = lt.country_translation or loc.country,
)
```

### Step 4 — Serializer read logic
Update project serializers (`ProjectSerializer`, `ProjectMinimalSerializer`, `ProjectStubSerializer`) to return `project.exact_location_name` (or `ProjectTranslation.exact_location_name_translation` for non-original languages) instead of `get_translated_location_name()` when `exact_location_name` is set. Follow the existing `get_project_name` pattern: check requested language vs. `project.language`, fall back to `project.exact_location_name` if no translation exists.

### Step 5 — Management command
Populate `exact_location_name` and `exact_location_name_translation` for all existing projects where `loc.place_name or loc.exact_address` is set, using the same logic as Step 3. Since `LocationTranslation` is already fully populated for all existing locations, no external API calls are needed.

### Step 6 — Testing and verification
- Unit tests for `format_exact_location_name` covering: place+address+city+country, place+city only, address+city only, `MAP_STATE_AS_COUNTRY_CODES` edge case, `CUSTOM_NAME_MAPPINGS` override.
- Integration tests: project create/update writes both `Project.exact_location_name` and all `ProjectTranslation.exact_location_name_translation` rows; serializer returns exact name for projects and general name for orgs/users sharing the same Location.
- Management command test on a staging dataset.

## Implementation Notes
- No changes to `Location`, `LocationTranslation`, organisation or user flows.
- `format_exact_location_name` should be kept in `location/utility.py` alongside `format_location_name` for discoverability.
- The `MAP_STATE_AS_COUNTRY_CODES` edge case (US, CA, AU) needs careful handling since `country_code` is not stored on Location — verify whether the stored `country` field is sufficient or if `country_code` needs to be added to Location as a lightweight addition.
- Translations are composed entirely from existing data; no external API calls are introduced.

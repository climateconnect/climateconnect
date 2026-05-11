# Implement Location Name Consistency Fix

**Status**: DRAFT  
**Type**: Bug Fix  
**Date and time created**: 2026-05-09 09:53 UTC  
**Date Completed**: N/A  
**Related GitHub Issue**: N/A  

**Upstream Dependencies / References**:  
- None  

## Problem Statement
The frontend generates location display names differently based on entity type: exact names (with place details and addresses) for projects, general names for organizations and users. However, the backend only uses general logic for location names and translations, leading to inconsistencies between stored names and translated names. This affects user experience when viewing project locations in different languages.

The exact display name is context-dependent: the same `Location` record can be referenced by a project (needing an exact venue name) and by an organisation or user (needing a general area name), so the display logic must be scoped to the entity that has this context.

**Business/User Reason**: Ensures consistent and accurate location display across the platform, improving trust and usability for climate activists collaborating on projects with specific locations.

## Acceptance Criteria
- [ ] `format_exact_location_name` utility mirrors frontend `buildLocationName` output for exact locations
- [ ] Project serializers return the exact-format name when `location.place_name or location.exact_address` is set, general-format name otherwise
- [ ] Translated exact names are composed correctly from existing `LocationTranslation` data
- [ ] Organizations and users continue using `Location.name` / `LocationTranslation.name_translation` unchanged
- [ ] No schema migrations required
- [ ] No performance regression in project list queries

## Constraints and Non-Negotiable Requirements
- No changes to frontend location parsing logic
- Organizations and users must retain current behavior (general names via shared location)
- Exact locations only apply to projects
- Backwards compatible with existing data
- No Nominatim refetches

## Domain Context
- Locations are stored in shared `Location` model with geospatial data
- Projects, organizations, users have FK to `Location`
- Translations handled via separate models (`ProjectTranslation`, `LocationTranslation`)
- Frontend uses `parseLocation` with `isConcretePlace=true` for projects, setting `place_name` and `exact_address` on the Location when present
- Backend uses `format_location_name` for general logic; project serializers already load `Location` and `LocationTranslation`

## AI Insights
**Key Observations**:
- The Location model already stores all fields needed to reconstruct the exact display name: `place_name`, `exact_address`, `city`, `state`, `country`. No additional data needs to be stored.
- The exact display name only needs to be computed when `location.place_name or location.exact_address` is set — these fields are only populated for project exact locations.
- Project serializers already load both `Location` and `LocationTranslation`, so the exact name can be computed on the fly at read time with negligible overhead — no storage or backfill needed.
- `place_name` and `exact_address` are language-neutral; only the geographic tail (`city`, `state`, `country`) requires translation, and those translations already exist in `LocationTranslation`.
- Scoping the exact logic to project serializers only ensures organisations and users are unaffected, even if they theoretically reference the same Location FK.

**Rejected Approaches**:
- Storing `exact_location_name` on `Project`/`ProjectTranslation`: unnecessary overhead — the data is already available at read time in the serializer context.
- `full_address` JSONField on Location: unnecessary — all required data is already stored in individual fields.
- Fixing translations in `LocationTranslation`: would contaminate shared records and produce wrong names for organisations/users referencing the same Location FK.
- Duplicating Location records per project: creates stale-divergence risk and is solved more cleanly at the serializer level.

## Implementation Plan

### Overview
A minimal two-step change: add a backend utility function mirroring the frontend's exact location name logic, then call it from project serializers when the location has `place_name` or `exact_address` set. No schema changes, no migration, no management command, no backfill — existing projects are fixed on the next request.

### Step 1 — Backend utility function
Add `format_exact_location_name(place_name, exact_address, city, state, country)` to `location/utility.py`, mirroring the frontend's `buildLocationName(place_name, exact_address, city+", "+country)` logic including `CUSTOM_NAME_MAPPINGS` and `MAP_STATE_AS_COUNTRY_CODES` handling.

### Step 2 — Project serializer update
In project serializers (`ProjectSerializer`, `ProjectMinimalSerializer`, `ProjectStubSerializer`), replace the call to `get_translated_location_name()` with conditional logic:

- If `location.place_name or location.exact_address`: call `format_exact_location_name` using the already-loaded `Location` and `LocationTranslation` fields:
```
format_exact_location_name(
    place_name    = location.place_name,               # language-neutral
    exact_address = location.exact_address,            # language-neutral
    city          = lt.city_translation or location.city,
    state         = lt.state_translation or location.state,
    country       = lt.country_translation or location.country,
)
```
- Otherwise: continue using `get_translated_location_name()` as before.

Organisation and user serializers are not touched.

### Step 3 — Testing and verification
- Unit tests for `format_exact_location_name` covering: place+address+city+country, place+city only, address+city only, `MAP_STATE_AS_COUNTRY_CODES` edge case, `CUSTOM_NAME_MAPPINGS` override.
- Integration tests: project serializer returns exact-format name for projects with exact locations; org/user serializers return general-format name for the same Location.

## Implementation Notes
- `format_exact_location_name` should live in `location/utility.py` alongside `format_location_name` for discoverability.
- The `MAP_STATE_AS_COUNTRY_CODES` edge case (US, CA, AU) uses `country_code`, which is not stored on Location — verify whether the stored `country` field is sufficient or if this edge case can be handled from the available data.
- No external API calls, no data migrations, no management commands required.

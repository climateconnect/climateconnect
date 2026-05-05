# Remove ENABLE_LEGACY_LOCATION_FORMAT Feature Flag from Frontend

**Status**: DRAFT
**Type**: Cleanup / Technical Debt
**Date and time created**: 2026-05-05 09:00 UTC
**Date Completed**: TBD
**Related GitHub Issue**: https://github.com/climateconnect/climateconnect/issues/1932
**Related Specs**:
- [`doc/spec/1712-spec-process-remove-legacy-location-format.md`](1712-spec-process-remove-legacy-location-format.md) (backend counterpart, completed)
- [`doc/mosy/architecture_overview.md`](../mosy/architecture_overview.md)

---

## Problem Statement

The frontend codebase contains a feature flag `ENABLE_LEGACY_LOCATION_FORMAT` and conditional logic that was introduced to maintain backwards compatibility with the old location data format — a simplified city/country-only representation that bypassed geocoding. The backend equivalent was removed in issue #1712. Since the backend no longer serves or accepts the legacy format, all frontend code paths guarded by this flag are now dead.

Retaining this dead code:
- Increases cognitive overhead for developers reading location-related code
- Creates risk of the legacy path being accidentally re-enabled
- Makes location handling harder to understand, test, and maintain

The goal is to delete the flag, its environment variable declaration, and all conditional logic that branches on it, leaving a single, clean OSM-based location code path throughout the frontend.

**Core Requirements (User/Stakeholder Stated):**

1. Remove the `ENABLE_LEGACY_LOCATION_FORMAT` environment variable from all frontend env files and from `next.config.js`
2. Remove all conditional branches guarded by `process.env.ENABLE_LEGACY_LOCATION_FORMAT` in the frontend source
3. Remove any helper functions or handlers that existed solely to support the legacy format (e.g. `handleChangeLegacyLocationElement`, `handleChangeLegacyLocation`)
4. Remove legacy-specific test cases in `locationOperations.test.ts` that set/unset this env variable
5. The application must continue to display and handle location data correctly after the cleanup
6. All existing linting and TypeScript checks must pass (`yarn lint`)

### Non-Functional Requirements

- No new dependencies introduced
- No behaviour changes — this is deletion only
- Manual regression check on pages that render or filter by location: browse (projects, orgs, profiles), edit project, edit org, edit profile, create org, edit account

### AI Agent Insights and Additions

- The affected files identified at spec creation time are:
  - `frontend/public/lib/locationOperations.ts` (5 occurrences)
  - `frontend/public/lib/locationOperations.test.ts` (legacy test cases)
  - `frontend/public/data/possibleFilters.ts`
  - `frontend/next.config.js` (env variable declaration)
  - `frontend/src/components/browse/BrowseContent.tsx`
  - `frontend/src/components/profile/EditProfileRoot.tsx`
  - `frontend/src/components/organization/EditOrganizationRoot.tsx`
  - `frontend/src/components/editProject/EditProjectOverview.tsx`
  - `frontend/src/components/account/EditAccountPage.tsx`
  - `frontend/pages/createorganization.tsx`
- The backend spec (1712) is the authoritative reference for what the "new" (OSM-based) location format looks like — confirm the non-legacy code path is already correct before deleting the legacy branches.
- Any `.env.example`, `.env.local.example`, or docker-compose files referencing this variable should also be cleaned up.

---

## Log

| Date | Note |
|------|------|
| 2026-05-05 | Task created from GitHub issue #1932. Backend counterpart completed in #1712. |

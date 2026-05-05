# Display Locations in the User's Locale

**Status**: SYSTEM_IMPACT_ANALYZED  
**Branch**: `display_locations_in_user_locale`  
**Created**: 2026-04-28 12:00 UTC  

---

## Problem Statement

Location names on the platform are currently always displayed in English, regardless of the language the user has selected (e.g. German). The platform already stores translated location names via the `LocationTranslation` model (populated during earlier work). These translations are never surfaced to the user.

Users who have selected German as their language expect to see location names in German (e.g. "München" instead of "Munich", "Köln" instead of "Cologne"). Displaying locations in the user's locale makes the platform feel native and consistent for non-English users.

This affects every place a location is shown: the location search bar, project pages and previews, organization pages and previews, user profile pages, and any future surface.

---

## Acceptance Criteria

1. A user with German locale selected sees German location names everywhere a location is displayed (project pages, project previews, organization pages, organization previews, profile pages, location search bar).
2. A user with English locale sees English location names (current behavior preserved).
3. If a translation for the user's locale does not exist for a given location, the English name is shown as a fallback — no blank or broken display.
4. Adding support for a new language requires no code changes — only adding `LocationTranslation` rows for that language code is sufficient.
5. The location search bar searches and returns results in the user's locale where translations exist.
6. SSR-rendered pages (e.g. a project page loaded directly by URL) also render the correct locale — not just client-side navigations.
7. No regression: existing location data (coordinates, country, city slug, etc.) is unaffected.
8. API consumers that do not send a locale signal continue to receive English names (backwards compatible).

---

## Constraints

- The locale signal sent to the backend must come from the same source that drives the rest of the UI language (the user's locale cookie/setting) — not a separate mechanism.
- The English name remains the canonical fallback and must always be present and valid.
- Must not break existing `LocationTranslation` data already stored in the database.

---

## Domain Context

### Existing data model
- `Location` model holds the canonical (English) name and geospatial data.
- `LocationTranslation` model already exists and holds translated names keyed by `language` code (e.g. `"de"`, `"en"`) and linked to a `Location` instance. This model was populated during the `remove_legacy_format_from_backend` work.

### Locale on the frontend
- The user's selected language is stored as a locale cookie and is already used throughout the frontend to drive UI translations via `next-i18next`.
- The current locale is accessible in components via `useTranslation()` → `i18n.language`, and in `getServerSideProps` via `context.locale` (Next.js i18n routing is configured).
- API requests are made via Axios helpers in `frontend/src/utils/apiRequests.js`. The locale is not currently forwarded to the backend on location-related requests.

### Location serializer
- `backend/location/serializers/location_serializer.py` is the central place where location data is shaped for API responses. It currently returns the English name unconditionally.
- All entity serializers (project, organization, user profile) embed location data through this serializer, making it the single place to change for all surfaces.

### Location search
- The location search/autocomplete endpoint in `backend/location/views.py` queries and returns location names; it also needs locale-aware output.

### Adding a new language
- A new language must work automatically once `LocationTranslation` rows exist for that language code. No code changes should be required.

---

## Requirements (promoted from insights)

### Locale transport: `Accept-Language` header
The locale must be conveyed from frontend to backend via the standard HTTP `Accept-Language` header. Django already exposes this via `request.LANGUAGE_CODE` after its locale middleware processes the request. This avoids a custom query parameter and keeps the mechanism consistent with HTTP conventions.

### SSR must forward locale
SSR pages using `getServerSideProps` must extract the locale from the incoming Next.js request context (`context.locale`) and forward it as the `Accept-Language` header on any backend API calls made server-side. Client-side calls must also include the header. Both paths must behave consistently.

### Backend: shared locale-resolution utility
A single backend utility function must resolve "best name for this locale, with English fallback" for a `Location` instance. All serializers and views must use this utility — logic must not be duplicated across callsites. This is the mechanism that makes adding a new language purely a data operation.

### Backend: query efficiency
The location serializer and search view must retrieve translations without N+1 queries. Translation data must be fetched via `select_related` or `prefetch_related` alongside the location queryset.

### Frontend: locale forwarding utility
A shared frontend utility must be responsible for attaching the current locale as the `Accept-Language` header on location-related API calls. All location request callsites must use this utility so that future changes (e.g. adding a language, changing the header name) have a single point of modification.

---

## System Impact

### Actors involved
- **Member** (authenticated user): sees their chosen locale's location names on their profile, projects they manage, and organizations they belong to.
- **Guest** (unauthenticated visitor): sees location names in whatever locale the browser/platform default resolves to; English fallback applies.
- **System** (Django backend): resolves the correct translated name per request based on `Accept-Language` header.

### Actions → Entities

| Actor | Action | Entity |
|-------|--------|--------|
| Member / Guest | View project | `Project` → `Location` → `LocationTranslation` [read] |
| Member / Guest | View organization | `Organization` → `Location` → `LocationTranslation` [read] |
| Member / Guest | View user profile | `UserProfile` → `Location` → `LocationTranslation` [read] |
| Member / Guest | Search locations | `Location` → `LocationTranslation` [read] |

### Flows affected
- **ViewProject** — location name in project detail and preview now locale-aware
- **ViewOrganization** — location name in organization detail and preview now locale-aware
- **ViewUserProfile** — location name on profile now locale-aware
- **SearchLocations** (location search/autocomplete) — results returned in user locale

### Backend changes

#### ✅ `LocaleMiddleware` — already present, no change needed
Confirmed via git history: `django.middleware.locale.LocaleMiddleware` is already in `MIDDLEWARE` in `dev_settings.py` (and `prod_settings.py`). `USE_I18N = True` is set. `request.LANGUAGE_CODE` is therefore already populated from the `Accept-Language` header on every request. No settings changes required.

To add a new language in future: add it to the `LANGUAGES` list in settings (one line) plus add `LocationTranslation` rows — zero code changes.

#### New utility function: `backend/location/utility.py`
Add `get_translated_location_name(location, language_code) -> str`:
- Looks up `LocationTranslation` for the given `language_code` on the `location`.
- Falls back to `location.name` (English) if no translation found.
- Expects translations to be pre-fetched (no extra query if caller uses `prefetch_related`).
- This is the single source of truth for locale resolution.

#### Changed serializer: `backend/location/serializers/location_serializer.py`
- `LocationSerializer` reads `language_code` from `self.context["request"].LANGUAGE_CODE`.
- The `name` / `display_name` field calls `get_translated_location_name(location, language_code)`.
- Querysets feeding this serializer must `prefetch_related("translations")` to avoid N+1.
- Because all entity serializers (project, org, profile) use `LocationSerializer`, all surfaces are fixed here with no changes to those serializers.

#### Changed view: `backend/location/views.py`
- Location search/autocomplete view reads `request.LANGUAGE_CODE`.
- Adds `prefetch_related("translations")` on the queryset.
- Calls `get_translated_location_name` for each result.

#### No migration needed
`LocationTranslation` model already exists and is populated. No schema changes required.

### Frontend changes

#### New/extended utility: `frontend/src/utils/locationUtils.ts`
Add `getLocaleHeader(locale: string): Record<string, string>`:
- Returns `{ "Accept-Language": locale }`.
- Single place to change if header name or format ever evolves.

#### Changed component: `frontend/src/components/general/LocationSearchBar.tsx`
- Read current locale via `useTranslation()` → `i18n.language`.
- Pass `Accept-Language` header on the location search API call using `getLocaleHeader`.

#### Changed SSR pages
All pages that fetch location-bearing entities via `getServerSideProps` must forward `context.locale` as the `Accept-Language` header. Affected pages include (not exhaustive — implementer should search for all location-bearing entity fetches):
- `frontend/pages/projects/[projectId].js`
- Organization detail page
- User profile page
- Any page using `getInitialData` or a dedicated project/org/profile fetch helper that returns location data

Because the backend `LocationSerializer` handles translation centrally, no changes are needed to display components — they already render whatever name the API returns.

### API contract
No new endpoints. No response shape change — the `name` field in the location object already exists; it will contain the translated value instead of always English. Backwards compatible: requests without `Accept-Language` → Django defaults `request.LANGUAGE_CODE` to `"en"` → English name returned as today.

### Cross-cutting concerns

| Concern | Impact | Mitigation |
|---------|--------|------------|
| **Caching** | If location search results are cached (Redis), cache keys must include `language_code` to prevent locale bleed-through between users. | Verify at implementation time; if cached, update cache key to include locale. |
| **SSR hydration mismatch** | If SSR renders with locale A but client re-fetches with locale B after a language switch, location names may briefly be stale. | After language switch, pages with location names should trigger re-fetch or full navigation — consistent with existing behavior for other translated content. |
| **New language rollout** | New language requires: (1) `LocationTranslation` rows in DB, (2) one-line addition to Django `LANGUAGES` setting. Zero code changes. | Document in developer onboarding notes. |

---

## Mosy Specification Updates

### `doc/mosy/flows/core-flows.md`
Add locale-resolution step to ViewProject, ViewOrganization, ViewUserProfile, and SearchLocations flows: `LocationSerializer` and search view are now locale-aware via `request.LANGUAGE_CODE`.

### `doc/mosy/entities/system-entities.md`
No entity changes. Confirm `Location → LocationTranslation (1:N, keyed by language_code)` relationship is present in the diagram.

### `doc/mosy/architecture_overview.md`
Add note to Location component: "Location names are resolved to the user's locale via `Accept-Language` header using the `LocationTranslation` table. English is the canonical fallback."

---


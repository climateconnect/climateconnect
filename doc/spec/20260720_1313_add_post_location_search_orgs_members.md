# Support POST location-body search on organizations & members list endpoints

**Status:** COMPLETED
**Branch:** `add_post_location_search_orgs_members`
**Created:** 2026-07-20

---

## Problem Statement (What & Why)

The frontend browse pages for **organizations** (`/api/organizations/`) and
**members** (`/api/members/`) perform location-based search by sending a
**POST** request whose body carries the location object (`place_id` + `geojson`,
OSM identifiers, etc.) — matching the pattern already used on the projects
browse page.

On the backend, the two list views
(`ListOrganizationsAPIView`, `ListMemberProfilesView`) currently only implement
`GET`. They inherit `ListAPIView`'s default behavior, which does **not** accept
POST. When the frontend sends the location search as a POST, the request is
rejected (Django/DRF returns `405 Method Not Allowed`), so **location search on
the organizations and members browse pages is broken**.

This is a regression/bug: the projects endpoint already supports this exact
POST-with-location-body flow (used as a fallback that can lazily create a
`Location` when the upstream OSM service can't resolve it), but the
organizations and members endpoints were never given the same treatment.

---

## Goals / Scope

- Make `ListOrganizationsAPIView` and `ListMemberProfilesView` accept **POST**
  requests for location search, mirroring the existing `ListProjectsView.post()`
  behavior.
- The POST handler should accept the location object in the request body and,
  when present (`place_id` + `geojson`), inject it into `request.query_params`
  so the existing `get_queryset()` location-filtering logic
  (`get_location_with_range`) works unchanged.
- Preserve all existing GET behavior and filters (hub, sectors,
  organization_type, country/city, search, pagination, ordering).
- Preserve the `Location` creation fallback that `get_location_with_range` /
  `get_location` already provide when falling back to the client-supplied body
  (same as projects).

Out of scope:
- Changing the location-filtering logic itself, response shape, or serializers.
- Adding POST support to any endpoints other than these two list views.
- Frontend changes (the frontend already sends the POST request; the bug is
  server-side).

---

## Acceptance Criteria (observable outcomes)

1. `POST /api/organizations/` with a JSON body containing `place_id` and
   `geojson` returns a `200` paginated list of organizations filtered by the
   supplied location (no `405`).
2. `POST /api/members/` with the same location body returns a `200` paginated
   list of member profiles filtered by location (no `405`).
3. `GET /api/organizations/` and `GET /api/members/` continue to work exactly as
   before, including all existing query-string filters and pagination.
4. When the location is supplied via POST body (and the upstream OSM lookup
   fails), the backend falls back to the client-supplied location object and, if
   needed, lazily creates the `Location` row — identical to the projects
   endpoint behavior.
5. Existing GET-only location search (query-string `place_id` / `osm_id` /
   `osm_type`) still works on both endpoints.
6. The `cache_page` decorator on `ListMemberProfilesView` remains effective for
   GET responses and is not broken by the POST path.

---

## Constraints / Non-Negotiables

- Follow the **exact same pattern** as `ListProjectsView.post()` in
  `organization/views/project_views.py` (override `post`, copy
  `request.query_params`, inject `query_params["location"]` only when `place_id`
  and `geojson` are present, then call `self.list(...)`).
- Do **not** alter `get_location_with_range` / `get_location` — they already
  support the POST fallback and Location creation; reuse them as-is.
- `ListMemberProfilesView` has `@cache_page(...)` on `dispatch`. The injected
  `request._request.GET` mutation must happen **only** within the POST method,
  not globally, so GET caching is unaffected.
- Keep permission classes `AllowAny` (consistent with the projects endpoint and
  current GET behavior).
- Do **not** introduce new response formats or change serializer classes.

---

## Domain Context

- **Projects reference implementation:** `ListProjectsView` in
  `backend/organization/views/project_views.py` (lines ~166–191) defines
  `post()` that reads `request.data`, and if `place_id` + `geojson` are present
  sets `request._request.GET = query_params` then calls `self.list(...)`.
- **Organizations list view:** `ListOrganizationsAPIView` in
  `backend/organization/views/organization_views.py` (lines ~114–305). Route
  `api/organizations/` → `list-organizations-api-view` (organization/urls.py
  line 14). `get_queryset()` already calls `get_location_with_range` for
  location filtering (lines 249–278).
- **Members list view:** `ListMemberProfilesView` in
  `backend/climateconnect_api/views/user_views.py` (lines ~278–416). Route
  `api/members/` → `member-profiles-api` (climateconnect_main/urls.py line 90).
  `get_queryset()` also calls `get_location_with_range` (lines 357–386) and is
  decorated with `@cache_page` on `dispatch` (lines 286–290).
- **Shared utility:** `get_location_with_range` /
  `get_location` in `backend/location/utility.py` read location from
  `query_params`; when the upstream OSM service fails and a `location` key is
  present in query params, they fall back to the client body and may create a
  `Location` via `Location.objects.create`.
- **Frontend:** browse pages already send POST with the location body (this is
  the existing, intended integration contract — same as projects).

---

## AI Insights (hints & trade-off notes)

- **Minimal change:** both target views already call `get_location_with_range`
  inside `get_queryset`, so adding a `post()` that injects the body into
  `query_params["location"]` is sufficient — no queryset changes needed.
- **`cache_page` caveat on members:** the `@cache_page` decorator wraps
  `dispatch`. POST requests are not served from the GET page cache, so adding a
  `post()` method is safe, but be careful not to move the `request._request.GET`
  mutation into `dispatch` or `get_queryset` (it must stay in `post` only).
- **Consistency risk:** the projects `post()` only sets `query_params["location"]`
  when BOTH `place_id` and `geojson` are present. Mirror that guard exactly so
  behavior stays consistent across the three endpoints.
- **`request._request.GET` mutation** is a known hack also used by projects; keep
  it for parity rather than introducing a divergent mechanism.
- **Tests:** add tests that (a) POST with a location body returns 200 + filtered
  results, and (b) GET still works. These views require PostgreSQL + Redis
  running (see AGENTS.md); do not work around infra failures.

---

## Next Steps (workflow)

1. **User review** of this problem statement.
2. **System impact analysis** (handoff to architect) — confirm POST injection
   pattern is safe for both views and confirm no URL/routing changes are needed.
3. Transition to **IMPLEMENTATION** with the backend agent (mirror
   `ListProjectsView.post()` in both views, add tests).
4. **INTEGRATION_TESTING** → **CODE_REVIEW** → **VALIDATION** → **COMPLETED**.

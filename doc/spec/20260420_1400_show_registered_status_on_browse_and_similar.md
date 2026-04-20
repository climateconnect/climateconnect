# Show Registration Status on Browse and Similar Projects

**Status**: READY FOR IMPLEMENTATION (Reference: [`task-based-development.md`](../for-agents/guides/task-based-development.md))
**Type**: Feature
**Date and time created**: 2026-04-20 14:00
**Date Completed**: TBD
**GitHub Issue**: [#1901](https://github.com/climateconnect/climateconnect/issues/1901)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)  
**Related Specs**:
- [`docs/mosy/architecture_overview.md`](../mosy/architecture_overview.md)
- [`20260309_0900_member_register_for_event.md`](./20260309_0900_member_register_for_event.md) ← depends on this task (registration button UI)
- [`20260309_1100_member_see_registered_events.md`](./20260309_1100_member_see_registered_events.md) ← depends on this task (`GET /api/members/me/registered-events/`)

## Problem Statement

A logged-in member browsing projects or viewing similar projects on an event page can see at a glance which events they have already registered for, without needing to click into each event. This improves user experience by preventing duplicate registrations and helping members quickly identify their commitments.

**Core Requirements (User/Stakeholder Stated):**

- On the **project browse page** (`/browse`, `/hubs/{hubUrl}/browse`), when showing events with registration enabled:
  - If the logged-in user is already registered for an event, show **"Registered ✓"** instead of "Register now" button.
  - The "Registered ✓" button should be disabled (same as on the individual event page).
  - If the user is not registered, show the appropriate registration button state ("Register now", "Booked out", "Registration closed") as already implemented.
  
- On the **similar projects sidebar** (shown on individual event pages):
  - Apply the same "Registered ✓" indicator for events the user is registered for.
  - This provides context when browsing related events.

- **Performance requirement**: The browse query must not be slowed down by fetching registration data per project. The solution must avoid N+1 queries or per-row registration checks.

**Explicitly Out of Scope (this iteration):**
- Showing registration status to unauthenticated users (not applicable — you must be logged in to register).
- Showing how many events a user is registered for (aggregate count).
- Real-time updates when registration status changes (acceptable for the user to refresh the page).

### Non Functional Requirements

- **Performance**: The browse page must not add per-project database queries to determine registration status. The solution must fetch all registered event IDs for the current user in a single query, then match them client-side.
- **Pagination-aware**: The browse page is paginated. The registration status check must work correctly regardless of which page the user is viewing. The solution should fetch the user's registered event IDs once and cache them client-side (not just for the current page).
- **No breaking changes**: The existing browse and similar projects APIs must remain unchanged. This is a frontend-only enhancement that uses existing data endpoints.
- **Feature toggle**: The feature must respect the `EVENT_REGISTRATION` toggle. When the toggle is disabled, no registration buttons or status indicators should appear.

### AI Agent Insights and Additions

- The existing `GET /api/members/me/registered-events/` endpoint (introduced in issue #1849) returns all upcoming registered events for the current user. This endpoint is designed for the profile page but can be reused here.
- The endpoint returns project preview objects (full project data). For performance, we only need the event URL slugs or IDs. The implementation should extract just the identifiers from the response, not store full project objects.
- The `ProjectMetaData.tsx` component already accepts an `isUserRegistered` prop and renders the correct button state. The implementation only needs to determine and pass this prop from the browse/similar projects containers.

## System impact

- **Actors involved**:
  - `Member`: Browses projects and sees which events they're registered for.
  - `System`: Returns registered event list; frontend matches against displayed projects.
- **Actions to implement**:
  - `Member` → `Browse Projects` → `System` returns projects + member's registered event IDs → UI displays "Registered ✓" on matching events.
- **Flows affected**:
  - **Browse Projects Flow** (extended): Load projects → when authenticated, fetch registered event IDs → render cards with registration status.
  - **View Similar Projects Flow** (extended): Display similar projects → mark those the user is registered for.
- **Entity changes needed**: No new entities.
- **Flow changes needed**: Yes — existing browse flow is extended to fetch and display registration status.
- **Integration changes needed**: No.
- **New specifications required**: None.

## Software Architecture

### API

**No new API endpoints.** Reuses existing endpoints:

**Registered events for current user (existing)**
```
GET /api/members/me/registered-events/
```
- Already implemented (issue #1849).
- Returns: array of project preview objects for upcoming registered events.
- Auth required (401 if unauthenticated).
- Used here to extract registered event identifiers (URL slugs or IDs).

**Project list (existing)**
```
GET /api/projects/
```
- Already returns `registration_config` per project (when present).
- No changes needed.

**User interactions (existing)**
```
GET /api/projects/{slug}/my_interactions/
```
- Already returns `is_registered` for individual events.
- Used on event detail pages; not used here (too expensive to call per card in a list).

### Events

None. This is a read-only feature.

### Frontend

**1. Browse Page (`/pages/browse.tsx`, `/pages/hubs/[hubUrl]/browse.tsx`)**

- On page load, if user is authenticated **and** `EVENT_REGISTRATION` feature toggle is enabled:
  - Fetch `GET /api/members/me/registered-events/` once.
  - Extract a Set of registered event identifiers (use `url_slug` for O(1) lookup).
  - Store in component state (e.g. `registeredEventSlugs`).
  
- Pass this Set down to `<BrowseContent>` → `<ProjectPreviews>` → `<ProjectPreview>` → `<ProjectMetaData>`.

- In `ProjectMetaData.tsx` (already accepts `isUserRegistered` prop):
  - Check if `project.url_slug` is in the `registeredEventSlugs` Set.
  - Pass `isUserRegistered={registeredEventSlugs.has(project.url_slug)}` to the registration button logic.
  - The existing `getRegisterButtonText()` and `isRegisterButtonDisabled()` helpers already handle the "Registered ✓" state.

**2. Similar Projects Sidebar (`ProjectSideBar.tsx` → `ProjectPreviews.tsx` → `ProjectPreview.tsx`)**

- On the event detail page (`/pages/projects/[projectId]/index.tsx`):
  - Fetch `GET /api/members/me/registered-events/` once (when authenticated + toggle enabled).
  - Store registered event slugs in state.
  - Pass down to `<ProjectSideBar>` → `<ProjectPreviews>` → `<ProjectPreview>` → `<ProjectMetaData>`.

- Same client-side matching logic as the browse page.

**3. Performance Optimization**

- **Single fetch per page load**: Call `GET /api/members/me/registered-events/` once when the page mounts, not per component or per card.
- **Client-side Set lookup**: Use a JavaScript Set for O(1) lookup per card.
- **Pagination handling**: The registered events endpoint returns all upcoming events (max 12 by default, but can be extended). For most users this is sufficient. If a user has registered for >12 events, only the first 12 will show "Registered ✓" status. This is acceptable for the initial implementation — a future enhancement could fetch all pages or increase the limit.
  - **Recommendation**: Use `?page_size=100` or remove pagination on this endpoint when called from browse pages, since we need all registered events for matching. This should be documented in the Technical Solution Overview during implementation.

**4. Error Handling**

- If `GET /api/members/me/registered-events/` fails (network error, 401, etc.):
  - Log the error silently.
  - Set `registeredEventSlugs` to an empty Set.
  - The browse page still works; registration status just won't show (degrades gracefully).
  - Do not block page render or show an error to the user.

**5. Component Changes Summary**

| Component | Change |
|-----------|--------|
| `/pages/browse.tsx` | Add `useEffect` to fetch registered events; store Set in state; pass to `<BrowseContent>` |
| `/pages/hubs/[hubUrl]/browse.tsx` | Same as above |
| `/pages/projects/[projectId]/index.tsx` | Add `useEffect` to fetch registered events; pass to `<ProjectSideBar>` |
| `BrowseContent.tsx` | Accept `registeredEventSlugs` prop; pass to `<ProjectPreviews>` |
| `ProjectPreviews.tsx` | Accept `registeredEventSlugs` prop; pass to each `<ProjectPreview>` |
| `ProjectPreview.tsx` | Accept `registeredEventSlugs` prop; compute `isUserRegistered = registeredEventSlugs?.has(project.url_slug)`; pass to `<ProjectMetaData>` |
| `ProjectMetaData.tsx` | **No changes needed** — already accepts and uses `isUserRegistered` prop |
| `ProjectSideBar.tsx` | Accept `registeredEventSlugs` prop; pass to `<ProjectPreviews>` |

### Backend

**No backend changes required.** All necessary endpoints already exist.

### Data

No schema changes. Reads from existing `projects_eventregistration` table via the `/api/members/me/registered-events/` endpoint.

### Other

- **Empty state**: If the user has no registered events, `GET /api/members/me/registered-events/` returns an empty array. The browse page still works normally; no "Registered ✓" buttons appear.
- **Feature toggle check**: Wrap the fetch logic in `if (isEnabled("EVENT_REGISTRATION"))` to ensure it respects the toggle.

## Technical Solution Overview

*To be filled by a development agent during the IMPLEMENTATION phase.*

### Implementation Steps (Guidance)

1. **Add registered events fetch to browse pages**:
   - In `/pages/browse.tsx` and `/pages/hubs/[hubUrl]/browse.tsx`, add a `useEffect` hook that:
     - Checks if user is authenticated (token exists).
     - Checks if `EVENT_REGISTRATION` toggle is enabled.
     - Calls `GET /api/members/me/registered-events/?page_size=100` (increase page size to get all events).
     - Extracts `url_slug` from each result into a Set.
     - Stores the Set in component state.
   
2. **Thread registered slugs through component tree**:
   - Pass `registeredEventSlugs` from browse pages → `BrowseContent` → `ProjectPreviews` → `ProjectPreview` → `ProjectMetaData`.
   - Add TypeScript/PropTypes for the new prop at each level.

3. **Add registered events fetch to event detail page** (for similar projects):
   - In `/pages/projects/[projectId]/index.tsx`, add the same `useEffect` logic.
   - Pass `registeredEventSlugs` to `ProjectPageRoot` → `ProjectSideBar` → `ProjectPreviews`.

4. **Update ProjectPreview to compute isUserRegistered**:
   - In `ProjectPreview.tsx`, calculate:
     ```tsx
     const isUserRegistered = registeredEventSlugs?.has(project.url_slug) ?? false;
     ```
   - Pass to `ProjectMetaData` (which already uses this prop).

5. **Handle edge cases**:
   - Unauthenticated users: Skip the fetch; `registeredEventSlugs` remains undefined/null.
   - Feature toggle disabled: Skip the fetch.
   - API error: Log error, set to empty Set, continue rendering.

6. **Test**:
   - Register for an event.
   - Navigate to `/browse` — verify "Registered ✓" appears on that event's card.
   - Navigate to a different event's page — verify "Registered ✓" appears on the similar project if applicable.
   - Test with pagination (browse multiple pages) — verify status shows correctly on all pages.
   - Test with unauthenticated user — verify no errors, no unexpected requests.
   - Test with toggle disabled — verify no registration buttons appear.

## Acceptance Criteria

- [ ] On the `/browse` page, when a logged-in user views events they are registered for, the card shows **"Registered ✓"** button (disabled) instead of "Register now".
- [ ] On hub browse pages (`/hubs/{hubUrl}/browse`), the same "Registered ✓" indicator appears for registered events.
- [ ] On the similar projects sidebar (on event detail pages), events the user is registered for show "Registered ✓".
- [ ] The browse page does **not** make per-project API calls to determine registration status — only a single `GET /api/members/me/registered-events/` call is made on page load.
- [ ] The feature respects the `EVENT_REGISTRATION` feature toggle — when disabled, no registration status is shown.
- [ ] For unauthenticated users, no registration status is shown (same behavior as before — they see "Register now" if the event is open).
- [ ] If the `GET /api/members/me/registered-events/` call fails, the page still renders normally without registration status (graceful degradation).
- [ ] Pagination on the browse page works correctly — registration status shows on all pages, not just the first page.
- [ ] The "Registered ✓" button on browse cards links to the event detail page (or is not clickable, matching the behavior on event detail pages).
- [ ] All existing tests pass, and no console errors appear when browsing projects.
- [ ] Code review approved.
- [ ] Documentation updated if needed.

## Log

- 2026-04-20 14:00 — Task created from GitHub issue #1901. Depends on tasks #1845 (registration button UI), #1849 (`/api/members/me/registered-events/` endpoint), and the `EVENT_REGISTRATION` feature toggle. Decision: reuse existing endpoint rather than adding a lightweight `/api/members/me/registered-event-ids/` endpoint (YAGNI — the existing endpoint is already fast enough for typical users with <100 registered events). Performance optimization: increase page size to 100 on the browse page call to ensure all registered events are fetched.
- 2026-04-20 14:15 — Confirmed: no backend changes needed. Frontend-only implementation using client-side Set-based matching. Graceful degradation if API call fails. Feature toggle respected.
- 2026-04-20 14:30 — Specs approved. Status promoted to READY FOR IMPLEMENTATION.


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
  - If the user is not registered, show the appropriate registration button state ("Register now", "Booked out") as already implemented.
  
- On the **similar projects sidebar** (shown on individual event pages):
  - Apply the same "Registered ✓" indicator for events the user is registered for.
  - This provides context when browsing related events.

- **Performance requirement**: The browse query must not be slowed down by fetching registration data per project. The solution must avoid N+1 queries or per-row registration checks.

### Non Functional Requirements

- **Performance**: The browse page must not add per-project database queries to determine registration status. The solution must include all registered event IDs in the user's profile data, fetched once and cached client-side.
- **Pagination-aware**: The browse page is paginated. The registration status check must work correctly regardless of which page the user is viewing. The solution should include the user's registered event IDs in the profile data fetched on page load and cache them client-side (not just for the current page).
- **Minimal breaking changes**: The `/api/my_profile/` endpoint will be extended to include registered event identifiers. This is additive and backward-compatible.
- **Feature toggle**: The feature must respect the `EVENT_REGISTRATION` toggle. When the toggle is disabled, no registration buttons or status indicators should appear.

### AI Agent Insights and Additions

- The `/api/my_profile/` endpoint is called on every page load for authenticated users and is already cached globally in the application. This makes it the ideal location to include registered event identifiers.
- The profile response should include a new field `registered_event_slugs` (array of strings) containing the URL slugs of all events the user is registered for. This avoids returning full project objects and minimizes payload size.
- The `ProjectMetaData.tsx` component already accepts an `isUserRegistered` prop and renders the correct button state. The implementation only needs to determine and pass this prop from the browse/similar projects containers.

## System impact

- **Actors involved**:
  - `Member`: Browses projects and sees which events they're registered for.
  - `System`: Returns user profile including registered event slugs; frontend matches against displayed projects.
- **Actions to implement**:
  - `Member` → `Browse Projects` → `System` returns projects + user profile with registered event slugs → UI displays "Registered ✓" on matching events.
- **Flows affected**:
  - **Browse Projects Flow** (extended): Load projects → when authenticated, fetch registered event IDs → render cards with registration status.
  - **View Similar Projects Flow** (extended): Display similar projects → mark those the user is registered for.
- **Entity changes needed**: No new entities.
- **Flow changes needed**: Yes — existing browse flow is extended to fetch and display registration status.
- **Integration changes needed**: No.
- **New specifications required**: None.

## Software Architecture

### API

**Modified endpoint:**

**User profile (extended)**
```
GET /api/my_profile/
```
- **Change**: Add `registered_event_slugs` field to the response.
- **Type**: Array of strings (event URL slugs).
- **Content**: All upcoming events the user is registered for (no pagination needed — typically <100 events).
- **Performance**: Single database query with `select_related` to fetch registrations efficiently.
- **Auth**: Required (401 if unauthenticated).
- **Backward compatibility**: Additive field, existing clients ignore it.

**Example response (new field only):**
```json
{
  "id": 123,
  "first_name": "Jane",
  "last_name": "Doe",
  ...,
  "registered_event_slugs": ["climate-hackathon-zurich", "sustainability-workshop-berlin"]
}
```

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
  - Read `registered_event_slugs` from the user profile (already fetched globally via `/api/my_profile/`).
  - Convert to a Set for O(1) lookup.
  - Store in component state (e.g. `registeredEventSlugs`).
  
- Pass this Set down to `<BrowseContent>` → `<ProjectPreviews>` → `<ProjectPreview>` → `<ProjectMetaData>`.

- In `ProjectMetaData.tsx` (already accepts `isUserRegistered` prop):
  - Check if `project.url_slug` is in the `registeredEventSlugs` Set.
  - Pass `isUserRegistered={registeredEventSlugs.has(project.url_slug)}` to the registration button logic.
  - The existing `getRegisterButtonText()` and `isRegisterButtonDisabled()` helpers already handle the "Registered ✓" state.

**2. Similar Projects Sidebar (`ProjectSideBar.tsx` → `ProjectPreviews.tsx` → `ProjectPreview.tsx`)**

- On the event detail page (`/pages/projects/[projectId]/index.tsx`):
  - Read `registered_event_slugs` from the user profile (already available globally).
  - Convert to a Set and store in component state.
  - Pass down to `<ProjectSideBar>` → `<ProjectPreviews>` → `<ProjectPreview>` → `<ProjectMetaData>`.

- Same client-side matching logic as the browse page.

**3. Performance Optimization**

- **No additional API calls**: The profile data is already fetched on page load and cached globally. No new network requests are needed.
- **Client-side Set lookup**: Use a JavaScript Set for O(1) lookup per card.
- **No pagination concerns**: The backend returns all registered event slugs in the profile response (typically <100 events, minimal payload impact).

**4. Error Handling**

- If the user profile data fails to load or doesn't include `registered_event_slugs`:
  - Set `registeredEventSlugs` to an empty Set.
  - The browse page still works; registration status just won't show (degrades gracefully).
  - Do not block page render or show an error to the user.

**5. Component Changes Summary**

| Component | Change |
|-----------|--------|
| `/pages/browse.tsx` | Read `registered_event_slugs` from user profile; convert to Set; pass to `<BrowseContent>` |
| `/pages/hubs/[hubUrl]/browse.tsx` | Same as above |
| `/pages/projects/[projectId]/index.tsx` | Read `registered_event_slugs` from user profile; convert to Set; pass to `<ProjectSideBar>` |
| `BrowseContent.tsx` | Accept `registeredEventSlugs` prop; pass to `<ProjectPreviews>` |
| `ProjectPreviews.tsx` | Accept `registeredEventSlugs` prop; pass to each `<ProjectPreview>` |
| `ProjectPreview.tsx` | Accept `registeredEventSlugs` prop; compute `isUserRegistered = registeredEventSlugs?.has(project.url_slug)`; pass to `<ProjectMetaData>` |
| `ProjectMetaData.tsx` | **No changes needed** — already accepts and uses `isUserRegistered` prop |
| `ProjectSideBar.tsx` | Accept `registeredEventSlugs` prop; pass to `<ProjectPreviews>` |

### Backend

**Changes required:**

1. **Extend UserProfile serializer** (likely in `climateconnect_api/serializers/`):
   - Add `registered_event_slugs` field to the profile serializer used by `/api/my_profile/`.
   - Use `SerializerMethodField` to compute the list of event slugs.
   - Query: Fetch all `EventRegistration` records for the user where the event's end date is in the future (upcoming events only).
   - Use `select_related('project')` for efficient querying.
   - Extract and return `project.url_slug` for each registration.

2. **Implementation details**:
   ```python
   class UserProfileSerializer(serializers.ModelSerializer):
       registered_event_slugs = serializers.SerializerMethodField()
       
       def get_registered_event_slugs(self, obj):
           # Fetch upcoming event registrations for this user
           from django.utils import timezone
           from organization.models import Project
           
           registrations = EventRegistration.objects.filter(
               user=obj.user,
               project__event__end_date__gte=timezone.now().date()
           ).select_related('project').values_list('project__url_slug', flat=True)
           
           return list(registrations)
   ```

3. **Performance**: Add database index on `event__end_date` if not already present (should exist from previous event registration work).

### Data

No schema changes. Reads from existing `projects_eventregistration` table. May add index on `event__end_date` for query performance if not already present.

### Other

- **Empty state**: If the user has no registered events, `registered_event_slugs` is an empty array. The browse page still works normally; no "Registered ✓" buttons appear.
- **Feature toggle check**: The backend should only include `registered_event_slugs` if the `EVENT_REGISTRATION` feature toggle is enabled. The frontend should check the toggle before processing this field.

## Technical Solution Overview

*To be filled by a development agent during the IMPLEMENTATION phase.*

### Implementation Steps (Guidance)

1. **Backend: Extend UserProfile serializer**:
   - Locate the serializer used by `/api/my_profile/` (likely `UserProfileSerializer` in `climateconnect_api/serializers/`).
   - Add `registered_event_slugs = serializers.SerializerMethodField()`.
   - Implement `get_registered_event_slugs(self, obj)` method:
     - Check if `EVENT_REGISTRATION` feature toggle is enabled; if not, return `[]`.
     - Query `EventRegistration.objects.filter(user=obj.user, project__event__end_date__gte=timezone.now().date())`.
     - Use `.select_related('project').values_list('project__url_slug', flat=True)`.
     - Return as list.
   - Test the endpoint: `GET /api/my_profile/` should include the new field.

2. **Frontend: Read registered slugs from profile**:
   - In `/pages/browse.tsx` and `/pages/hubs/[hubUrl]/browse.tsx`:
     - Access the user profile data (already loaded globally, typically via `useAuth()` or similar context).
     - Extract `registered_event_slugs` from the profile.
     - Convert to a Set: `const registeredEventSlugs = new Set(userProfile?.registered_event_slugs || [])`.
     - Store in component state if needed, or pass directly to child components.
   
3. **Frontend: Thread registered slugs through component tree**:
   - Pass `registeredEventSlugs` from browse pages → `BrowseContent` → `ProjectPreviews` → `ProjectPreview` → `ProjectMetaData`.
   - Add TypeScript/PropTypes for the new prop at each level.

4. **Frontend: Add to event detail page** (for similar projects):
   - In `/pages/projects/[projectId]/index.tsx`, repeat step 2.
   - Pass `registeredEventSlugs` to `ProjectPageRoot` → `ProjectSideBar` → `ProjectPreviews`.

5. **Frontend: Update ProjectPreview to compute isUserRegistered**:
   - In `ProjectPreview.tsx`, calculate:
     ```tsx
     const isUserRegistered = registeredEventSlugs?.has(project.url_slug) ?? false;
     ```
   - Pass to `ProjectMetaData` (which already uses this prop).

6. **Handle edge cases**:
   - Unauthenticated users: Profile data is null; `registeredEventSlugs` is empty Set.
   - Feature toggle disabled: Backend returns empty array; frontend gracefully handles.
   - Profile load error: Set to empty Set, continue rendering.

7. **Test**:
   - Register for an event.
   - Verify `/api/my_profile/` includes the event slug in `registered_event_slugs`.
   - Navigate to `/browse` — verify "Registered ✓" appears on that event's card.
   - Navigate to a different event's page — verify "Registered ✓" appears on the similar project if applicable.
   - Test with pagination (browse multiple pages) — verify status shows correctly on all pages.
   - Test with unauthenticated user — verify no errors, no unexpected requests.
   - Test with toggle disabled — verify no registration buttons appear and backend returns empty array.

## Acceptance Criteria

- [ ] Backend: `/api/my_profile/` includes `registered_event_slugs` field (array of strings) when `EVENT_REGISTRATION` toggle is enabled.
- [ ] Backend: `registered_event_slugs` only includes upcoming events (end date >= today).
- [ ] Backend: The profile query is performant (uses `select_related` to avoid N+1 queries).
- [ ] On the `/browse` page, when a logged-in user views events they are registered for, the card shows **"Registered ✓"** button (disabled) instead of "Register now".
- [ ] On hub browse pages (`/hubs/{hubUrl}/browse`), the same "Registered ✓" indicator appears for registered events.
- [ ] On the similar projects sidebar (on event detail pages), events the user is registered for show "Registered ✓".
- [ ] The browse page does **not** make additional API calls to determine registration status — it uses data already in the user profile.
- [ ] The feature respects the `EVENT_REGISTRATION` feature toggle — when disabled, backend returns empty array and no registration status is shown.
- [ ] For unauthenticated users, no registration status is shown (same behavior as before — they see "Register now" if the event is open).
- [ ] If the user profile data doesn't include `registered_event_slugs`, the page still renders normally without registration status (graceful degradation).
- [ ] Pagination on the browse page works correctly — registration status shows on all pages, not just the first page.
- [ ] The "Registered ✓" button on browse cards links to the event detail page (or is not clickable, matching the behavior on event detail pages).
- [ ] All existing tests pass, and no console errors appear when browsing projects.
- [ ] Backend tests added for the new serializer field.
- [ ] Code review approved.
- [ ] Documentation updated if needed.

## Log

- 2026-04-20 14:00 — Task created from GitHub issue #1901. Depends on tasks #1845 (registration button UI), #1849 (`/api/members/me/registered-events/` endpoint), and the `EVENT_REGISTRATION` feature toggle.
- 2026-04-20 14:30 — Specs approved. Status promoted to READY FOR IMPLEMENTATION.
- 2026-04-21 — **Breaking change decision**: Instead of calling a separate `/api/members/me/registered-events/` endpoint, the registered event slugs will be included in the `/api/my_profile/` response. This eliminates an additional network request since the profile is already loaded on every page for authenticated users. The new field `registered_event_slugs` (array of strings) is additive and backward-compatible. Updated terminology: using "Booked out" instead of "Registration closed". Backend changes required: extend UserProfileSerializer to include registered_event_slugs. Frontend changes: read from profile data instead of making separate API call.


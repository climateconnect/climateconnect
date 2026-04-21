# Member Can See the Events They Registered For

**Status**: READY FOR IMPLEMENTATION (Reference: [`task-based-development.md`](../for-agents/guides/task-based-development.md))
**Type**: Feature
**Date and time created**: 2026-03-09 11:00
**Date Completed**: TBD
**GitHub Issue**: [#1849](https://github.com/climateconnect/climateconnect/issues/1849)
**Epic**: [EPIC_event_registration.md](./EPIC_event_registration.md)
**Related Specs**:
- [`docs/mosy/architecture_overview.md`](../mosy/architecture_overview.md)
- [`docs/mosy/entities/system-entities.md`](../mosy/entities/system-entities.md)
- [`docs/mosy/flows/core-flows.md`](../mosy/flows/core-flows.md)
- [`docs/tasks/20260309_0900_member_register_for_event.md`](./20260309_0900_member_register_for_event.md) ← depends on this task (introduces `EventParticipant`)

## Problem Statement

A logged-in member can see an overview of upcoming events they have registered for, on their own profile page. On an event page, a registered member can see that they are already registered.

**Core Requirements (User/Stakeholder Stated):**

- On the user profile page (`/profiles/[user-slug]`), a new section shows all upcoming events the member has registered for.
  - The section is **only visible to the logged-in user themselves** — not to other visitors of the profile page.
  - Events are displayed in a **grid with project preview cards**, consistent with the existing "My Projects" grid on the same page.
  - If the member has no upcoming registered events, an empty state text is shown (same behaviour as the empty state for "My Projects").
  - A maximum of **12 upcoming events** are shown — consistent with the default page size used for the "My Projects" and "My Organisations" grids on the same page. No pagination for this iteration.
  - Events are ordered by **event start date ascending**, starting from the current date.
  - **Past events are not shown** (events whose start date is before today are excluded).
- On an **event detail page**, if the logged-in member is already registered for the event, a **"You are registered" badge** is shown alongside the Register button. The button itself is kept in place (it will become an "Unregister" button in a future task) but is disabled in this iteration.

**Explicitly Out of Scope (this iteration):**
- Viewing past registered events.
- iCal / calendar feed export.
- Pagination beyond 12 events.
- Other users seeing someone else's registered events.

### Non Functional Requirements

- The registered events list requires a **new dedicated API endpoint** — the existing projects endpoint (used by the browse page) is not suitable due to its complex filtering and ranking logic.
- The new endpoint must be **authenticated** — unauthenticated requests must return `401 Unauthorized`.
- The endpoint must only return events registered by the **currently authenticated user** — no user ID parameter that could be exploited to fetch another user's registrations.
- Filtering to upcoming events (start date ≥ today) and sorting by start date ascending must be applied **server-side**.
- The cap of 12 results is the standard backend page size already used for the "My Projects" and "My Organisations" endpoints on the same profile page — the new endpoint must use the same pagination mechanism for consistency.

### AI Agent Insights and Additions

- The "already registered" indicator on the event detail page can reuse the `GET /api/projects/{slug}/` response: the existing task #44 spec already extends this endpoint to include `event_registration`. A `is_registered: boolean` field should be added to this payload (only meaningful when the user is authenticated), avoiding a separate API call.

## System impact

- **Actors involved**:
  - `Member`: Views their registered events on their profile page and on individual event pages.
  - `System`: Filters and returns upcoming registered events for the authenticated user.
- **Actions to implement**:
  - `Member` → `View Registered Events` → `EventParticipant` + `Project` (read, filtered to upcoming, max 12)
  - `System` → `Check Registration Status` → `EventParticipant` (read, per event, per user — to show "already registered" indicator)
- **Flows affected**:
  - **New flow — View Registered Events Flow**: Member navigates to their profile → system fetches upcoming registered events → displayed in grid.
- **Entity changes needed**: No new entities. `EventParticipant` (introduced in task #44) is read here.
- **Flow changes needed**: Yes — new flow added.
- **Integration changes needed**: No.
- **New specifications required**: New flow spec for the View Registered Events Flow.

## Software Architecture

### API

**New endpoint — registered events for current user**
```
GET /api/members/me/registered-events/
```
- Auth required (`401` if unauthenticated).
- Returns only events registered by the currently authenticated user.
- Filters: `start_date >= today` (upcoming only), excludes past events.
- Ordering: `start_date` ascending.
- Page size: standard backend default (same as "My Projects" / "My Organisations" endpoints) — effectively 12 for this iteration.
- Response: array of project preview objects (same shape as existing project list items, so the frontend can reuse the existing project preview card component).

**Extended event detail endpoint (existing)**
```
GET /api/projects/{slug}/
```
- When the requesting user is authenticated, add `"is_registered": true|false` to the `event_registration` object in the response.
- When unauthenticated, `is_registered` is omitted or `false`.
- No breaking change — additive field only.

### Events

None. This is a read-only feature.

### Frontend

- **User profile page** (`/profiles/[user-slug]`):
  - Add a new **"My Registered Events"** section (grid), rendered only when the viewing user is the logged-in user (`viewingOwnProfile === true`).
  - Fetch data from `GET /api/members/me/registered-events/` on page load (only when `viewingOwnProfile`).
  - Render results using the **existing project preview card component** — no new card component needed.
  - Empty state: show a text message (e.g. *"You haven't registered for any upcoming events yet."*) consistent with the existing "My Projects" empty state behaviour.
  - The new section sits alongside the existing "My Projects" and "My Organisations" grids. Layout unchanged — three grids stacked as today.

- **Event detail page**:
  - When the logged-in user has `is_registered: true` in the `event_registration` response:
    - Show a **"You are registered" badge** next to the Register button.
    - The Register button remains visible but is **disabled** (the button space is preserved for the future "Unregister" action, to be implemented in a separate task).
  - This check only applies to authenticated users; no change for unauthenticated users.

### Backend

- **New view** `RegisteredEventsView` (e.g. `GET /api/members/me/registered-events/`):
  - Requires `IsAuthenticated` permission.
  - Queries `EventParticipant.objects.filter(user=request.user).select_related("event_registration__project")`.
  - Filters: `project.start_date >= today`, `project` is not `None`.
  - Orders by `project.start_date` ascending.
  - Uses the **standard paginator** (same class/page size used by the "My Projects" and "My Organisations" endpoints) — no custom slice.
  - Serializes using existing project preview serializer (or a lightweight variant).

- **`ProjectSerializer` / event detail serializer** (extend existing):
  - Add `is_registered` computed field: `True` if `request.user` has an `EventParticipant` record for this event's `EventRegistration`, `False` otherwise. Must short-circuit to `False` (not error) for unauthenticated requests.

### Data

No schema changes. Reads from `projects_eventparticipant` and `projects_project` (both introduced in prior tasks).

### Other

- Empty state copy for the registered events grid: *"You haven't registered for any upcoming events yet."*

## Technical Solution Overview

*To be filled by a development agent during the IMPLEMENTATION phase.*

## Log

- 2026-03-09 11:00 — Task created from GitHub issue #46. Depends on task `20260309_0900_member_register_for_event.md` (issue #44) for the `EventParticipant` entity. Decisions from issue comments incorporated: past events not shown, layout kept as-is (three grids), 12-event cap with no pagination, section visible to logged-in user only.
- 2026-03-09 11:15 — Confirmed: event detail page shows a "You are registered" badge alongside a disabled Register button (button space preserved for the future Unregister task). Empty state copy confirmed: *"You haven't registered for any upcoming events yet."* 12-event cap clarified as standard backend page size, consistent with "My Projects" and "My Organisations" on the same page.
- 2026-03-09 11:30 — Specs approved. Status promoted to READY FOR IMPLEMENTATION.

## Acceptance Criteria

- [ ] On the user profile page, a "My Registered Events" section is shown **only** to the logged-in user viewing their own profile. Other visitors do not see this section.
- [ ] The section displays upcoming registered events (start date ≥ today) in a grid using the existing project preview card component.
- [ ] Events are ordered by start date ascending.
- [ ] Past events (start date before today) are not shown.
- [ ] A maximum of 12 events are shown; no pagination is required for this iteration.
- [ ] When the member has no upcoming registered events, an empty state message is displayed (consistent with the "My Projects" empty state).
- [ ] The registered events endpoint returns `401 Unauthorized` for unauthenticated requests.
- [ ] The endpoint only returns events for the currently authenticated user — no cross-user data leakage.
- [ ] On an event detail page, a logged-in member who is already registered sees a **"You are registered" badge** alongside the Register button, and the Register button is disabled (preserving the button space for the future Unregister action).
- [ ] The `is_registered` field is additive — no breaking changes to the existing project/event API contract.
- [ ] All tests pass (unit, integration, end-to-end).
- [ ] Code review approved.
- [ ] Documentation updated and current.


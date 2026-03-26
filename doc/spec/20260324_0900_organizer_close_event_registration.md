# Event Organizer Can Close Registration Before the End Date

**Status**: IMPLEMENTATION (Reference: [`task-based-development.md`](../for-agents/guides/task-based-development.md))
**Type**: Feature
**Date and time created**: 2026-03-24 09:00
**Date Completed**: TBD
**GitHub Issue**: [#1851](https://github.com/climateconnect/climateconnect/issues/1851)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)  
**Related Specs**:
- [`docs/mosy/architecture_overview.md`](../mosy/architecture_overview.md)
- [`docs/mosy/entities/system-entities.md`](../mosy/entities/system-entities.md)
- [`docs/mosy/flows/core-flows.md`](../mosy/flows/core-flows.md)
- [`docs/tasks/20260305_1000_create_event_with_basic_registration.md`](./20260305_1000_create_event_with_basic_registration.md) ← introduces `EventRegistration`
- [`docs/tasks/20260309_0900_member_register_for_event.md`](./20260309_0900_member_register_for_event.md) ← introduces `is_registration_open` computation and `POST /register/` endpoint

## Problem Statement

An event organizer or team admin can manually close the registration for their event before the original `registration_end_date` — for example in response to changed circumstances that do not allow new registrations. A manually closed registration can also be reopened again. This feature is available from the event detail page and from the event edit page.

**Core Requirements (User/Stakeholder Stated):**

- An event organizer or team admin can **close the event registration** from:
  - The event detail page.
  - The event edit page.
- Once registration is manually closed, members **cannot register** for the event, regardless of whether the `registration_end_date` has not yet been reached or seats are still available.
- A manually closed registration can be **reopened** by the event organizer or team admin.
- When registration is reopened (and `registration_end_date` has not yet passed and seats are still available), members can register again.

**Explicitly Out of Scope (this iteration):**
- Notifying already-registered participants when registration is closed or reopened.
- Organizer visibility of cancellations triggered by a manual close.
- The member-facing "Registration closed" disabled button state is already implemented in [#1845](https://github.com/climateconnect/climateconnect/issues/1845) — this task provides the backend mechanism that drives it for the manual case.

### Non Functional Requirements

- Only the **event organizer or a team admin** of the event may close or reopen registration. Regular team members and unauthenticated users must receive `403 Forbidden` and `401 Unauthorized` respectively.
- `RegistrationStatus` is extended with an `ended` value (see AI Insights). With this addition, `status` becomes the single source of truth for all registration states. `is_registration_open` is **removed from the API** — consumers use `status` directly and can display contextual messaging per value (`"full"` → "Booked out", `"ended"` → "Registration period ended", `"closed"` → "Registration closed by organizer").
- `ended` is **never stored in the database**. It is computed lazily in the serializer: when `stored_status == "open" AND registration_end_date <= now`, the API returns `status: "ended"`. This avoids a Celery Beat scheduled job. No additional schema migration is required.
- The close/reopen action must be **idempotent** — closing an already-closed registration returns `200 OK` (no error, no state change); same for reopening.
- No breaking changes to existing API contracts. The `status` field exposure is additive.
- **No schema migration needed**: `RegistrationStatus` enum (`open`/`closed`/`full`) and the `status` field were already added to `EventRegistration` in [#1820](https://github.com/climateconnect/climateconnect/issues/1820) (migration `0121_add_eventregistration_status.py`). This task only exposes `status` to organizers via the API and adds the organizer UI.
- `full` cannot be set via the API — it is reserved for system use (set atomically when the last seat is taken). `EventRegistrationSerializer.validate_status()` must enforce this.

### AI Agent Insights and Additions

- **`RegistrationStatus` already exists** from [#1820](https://github.com/climateconnect/climateconnect/issues/1820) (migration `0121_add_eventregistration_status.py`) with values `open`, `closed`, and `full`. The `closed` value is exactly the mechanism for this feature — no new field or migration is required.
- **`ended` status (new, lazy)**: a fourth status value is added to `RegistrationStatus` to represent a registration whose deadline has passed naturally. It is **never stored** — the serializer computes it lazily: `if stored_status == "open" AND registration_end_date <= now → return "ended"`. No DB schema change or Celery Beat job required. With `ended` in place, `status` unambiguously describes all possible states.
- **`is_registration_open` removed from the API**: consumers no longer need a separate boolean — `status == "open"` answers the same question, and the other status values provide the *reason* registration is unavailable (enabling contextual UI messaging). This has a ripple effect on prior tasks:
  - `POST /api/projects/{slug}/register/` ([#1845](https://github.com/climateconnect/climateconnect/issues/1845)): guard changes from `is_registration_open` check to `effective_status != "open"`.
  - Event detail `GET /api/projects/{slug}/` ([#1845](https://github.com/climateconnect/climateconnect/issues/1845)): remove `is_registration_open` from `event_registration` response payload. ⚠️ Breaking change if [#1845](https://github.com/climateconnect/climateconnect/issues/1845) is already deployed — coordinate with the [#1845](https://github.com/climateconnect/climateconnect/issues/1845) spec update.
  - Event list `GET /api/projects/` ([#1845](https://github.com/climateconnect/climateconnect/issues/1845)): same removal.
  - Member profile registered events list ([#1849](https://github.com/climateconnect/climateconnect/issues/1849)): frontend registration-open indicator switches from `is_registration_open` boolean to `status == "open"` check.
- `full` cannot be set via the API — `EventRegistrationSerializer.validate_status()` must reject it. Only `open` and `closed` are organizer-settable.
- A **`IsEventOrganizerOrAdmin` permission class** is needed to guard the close/reopen endpoints. Check whether an equivalent already exists in the codebase before creating a new one.

## System impact

- **Actors involved**:
  - `Member` (acting as event organizer or team admin): Manually closes or reopens registration for their event.
  - `System`: Updates `EventRegistration.status`; `status` is the single source of truth for all consumers.
- **Actions to implement**:
  - `Organizer` → `Close Event Registration` → `EventRegistration` (set `status = "closed"`)
  - `Organizer` → `Reopen Event Registration` → `EventRegistration` (set `status = "open"`)
- **Flows affected**:
  - **New flow — Manage Event Registration Status Flow**: Organizer opens event detail or edit page → triggers close/reopen action → system updates `EventRegistration.status` → all consumers read `status` directly.
  - **Member Event Registration Flow** ([#1845](https://github.com/climateconnect/climateconnect/issues/1845)): registration guard and frontend logic switch from `is_registration_open` boolean to `status == "open"` check.
- **Entity changes needed**: Minimal — `RegistrationStatus` enum gains `ended` as a Python-side value (never stored in DB; computed lazily in the serializer). No new entities, no DB migration.
- **Flow changes needed**: Yes — new Manage Event Registration Status Flow added; existing Member Event Registration Flow updated.
- **Integration changes needed**: No.
- **New specifications required**: New flow for Manage Event Registration Status. `EventRegistration` entity updated in system entities.

## Software Architecture

### API

Two dedicated action endpoints for close and reopen.

**Close registration (new)**
```
POST /api/projects/{slug}/registration/close/
```
- Auth required (`401` if unauthenticated).
- Requires organizer or team admin role on the project (`403` otherwise).
- `404 Not Found` if no `EventRegistration` exists for this event.
- Idempotent: if `status` is already `"closed"`, returns `200 OK` without changing state.
- Sets `EventRegistration.status = "closed"`.
- Returns `200 OK` with the updated `event_registration` object (including `status: "closed"`).

**Reopen registration (new)**
```
POST /api/projects/{slug}/registration/reopen/
```
- Auth required (`401` if unauthenticated).
- Requires organizer or team admin role on the project (`403` otherwise).
- `404 Not Found` if no `EventRegistration` exists for this event.
- `400 Bad Request` if `effective_status == "ended"` (registration deadline has already passed — organizer must extend `registration_end_date` via the event edit flow first).
- Idempotent: if `status` is already `"open"`, returns `200 OK` without changing state.
- Sets `EventRegistration.status = "open"` (only permitted when deadline has not yet passed).
- Returns `200 OK` with the updated `event_registration` object (including `status: "open"`).
- Note: `full` → `open` transition is permitted (organizer overrides the system-set capacity block).

**Extended event detail endpoint (existing)**
```
GET /api/projects/{slug}/
```
- `event_registration.status: "open" | "closed" | "full" | "ended"` added to the response payload. `ended` is computed lazily (never stored): returned when `stored_status == "open" AND registration_end_date <= now`.
- `event_registration.is_registration_open` **removed** — consumers use `status` directly. `status == "open"` means registration is active; any other value means it is not, and the value itself explains why.
- ⚠️ Removing `is_registration_open` is a breaking change if [#1845](https://github.com/climateconnect/climateconnect/issues/1845) is already deployed. Coordinate with the [#1845](https://github.com/climateconnect/climateconnect/issues/1845) spec and any deployed frontend before releasing.

**Event list (existing)**
```
GET /api/projects/
```
- `is_registration_open` per list item **removed** — replaced by `status`. Frontend uses `status == "open"` for the "Registration open" badge and can display `"full"` as "Booked out" etc.

### Events

None. Close/reopen is synchronous. No async side-effects in this iteration (participant notifications are out of scope).

### Frontend

- **Event detail page** (organizer/admin view):
  - When the viewing user is the event organizer or a team admin and the event has `event_registration` present, show a management action below or alongside the registration status block:
    - If `status == "open"`: a **"Close registration"** button (e.g. outlined / secondary style).
    - If `status == "closed"` or `"full"`: a **"Reopen registration"** button.
    - If `status == "ended"`: no close/reopen action — show an informational label (e.g. *"Registration period has ended"*). The organizer must edit the event's `registration_end_date` to reopen.
  - Clicking "Close registration" calls `POST /api/projects/{slug}/registration/close/` and updates the local state:
    - The management button switches to "Reopen registration".
    - Members now see the contextual disabled button state driven by `status: "closed"` (see Member view below).
  - Clicking "Reopen registration" calls `POST /api/projects/{slug}/registration/reopen/` and mirrors the above in reverse.
  - On error: show an inline error message near the button.
  - Regular members do not see the close/reopen action — only the `is_registration_open`-driven button state (existing behaviour from [#1845](https://github.com/climateconnect/climateconnect/issues/1845)).

- **Event edit page** (organizer/admin view):
  - If the event has `event_registration` present, display a registration status section with the same close/reopen toggle behaviour as the event detail page.
  - Uses the same `POST /api/projects/{slug}/registration/close|reopen/` endpoints.

- **Member view** — the existing "Registration closed" disabled button state ([#1845](https://github.com/climateconnect/climateconnect/issues/1845)) must be updated to use `status` instead of the removed `is_registration_open` boolean. The frontend can now show contextual messaging based on the status value:
  - `status == "open"`: show the "Register" button (active).
  - `status == "closed"`: show disabled button labelled **"Registration closed"**.
  - `status == "full"`: show disabled button labelled **"Booked out"**.
  - `status == "ended"`: show disabled button labelled **"Registration period ended"**.

### Backend

- **`EventRegistration` model**: no changes — `status` field and `RegistrationStatus` enum already exist from [#1820](https://github.com/climateconnect/climateconnect/issues/1820) (migration `0121_add_eventregistration_status.py`). Default is `open`.

- **`RegistrationStatus` enum** (extend Python-side only):
  - Add `ENDED = "ended"` — never stored in the DB; used only as a return value from the serializer's effective status computation. No migration required.

- **`EventRegistrationSerializer`** (extend existing):
  - Add `get_effective_status()` method — single place where the lazy `ended` logic lives:
    ```python
    def get_effective_status(self, obj):
        if obj.status == RegistrationStatus.OPEN and obj.registration_end_date <= timezone.now():
            return RegistrationStatus.ENDED
        return obj.status
    ```
  - `status` serializer field uses `get_effective_status()` as its source — consumers always receive the effective value.
  - `validate_status()` must reject `full` and `ended` as organizer-supplied values — only `open` and `closed` are writable via the API.
  - `is_registration_open` field **removed** from the serializer — not returned in any API response.

- **`EventRegistrationViewSet`** (extend existing, introduced in [#1845](https://github.com/climateconnect/climateconnect/issues/1845)):
  - Add `close` action:
    ```python
    @action(detail=False, methods=["post"], url_path="close",
            permission_classes=[IsAuthenticated, IsEventOrganizerOrAdmin])
    def close(self, request, slug=None):
        registration = get_object_or_404(EventRegistration, project__slug=slug)
        if registration.status != RegistrationStatus.CLOSED:
            registration.status = RegistrationStatus.CLOSED
            registration.save(update_fields=["status"])
        return Response(EventRegistrationSerializer(registration, context={"request": request}).data)
    ```
  - Add `reopen` action — sets `status = RegistrationStatus.OPEN`, but guards against `ended`:
    ```python
    @action(detail=False, methods=["post"], url_path="reopen",
            permission_classes=[IsAuthenticated, IsEventOrganizerOrAdmin])
    def reopen(self, request, slug=None):
        registration = get_object_or_404(EventRegistration, project__slug=slug)
        serializer = EventRegistrationSerializer(registration, context={"request": request})
        if serializer.get_effective_status(registration) == RegistrationStatus.ENDED:
            return Response(
                {"detail": "Cannot reopen: registration deadline has passed. Please extend the registration end date first."},
                status=400
            )
        if registration.status != RegistrationStatus.OPEN:
            registration.status = RegistrationStatus.OPEN
            registration.save(update_fields=["status"])
        return Response(serializer.data)
    ```
  - `register()` action ([#1845](https://github.com/climateconnect/climateconnect/issues/1845)): update guard to `effective_status != RegistrationStatus.OPEN` — this covers `closed`, `full`, and `ended` with a single check.

- **`IsEventOrganizerOrAdmin` permission class** (new or reuse existing): checks that `request.user` is the project owner or holds an admin role in the project team. Verify whether an equivalent already exists before creating a new one.

- **No Django migration needed** — `status` column already exists from migration `0121_add_eventregistration_status.py`. `ended` is a Python-side enum value only.

### Data

No schema changes. `projects_eventregistration.status` column already exists (VARCHAR/Enum, NOT NULL, DEFAULT `'open'`) from [#1820](https://github.com/climateconnect/climateconnect/issues/1820) (migration `0121_add_eventregistration_status.py`). The `ended` value is never written to the database — it is a Python-side enum value returned by the serializer's `get_effective_status()` method only. `is_registration_open` is no longer exposed in any API response.

### Other

None.

## Technical Solution Overview

*To be filled by a development agent during the IMPLEMENTATION phase.*

## Log

- 2026-03-24 09:00 — Task created from GitHub issue #1851. Depends on [#1820](https://github.com/climateconnect/climateconnect/issues/1820) for the `EventRegistration` entity and [#1845](https://github.com/climateconnect/climateconnect/issues/1845) for the `is_registration_open` computation and `POST /register/` endpoint.
- 2026-03-24 09:30 — System impact analysis complete. New Manage Event Registration Status Flow defined. `is_registration_open` ripple effect documented across [#1845](https://github.com/climateconnect/climateconnect/issues/1845) and [#1849](https://github.com/climateconnect/climateconnect/issues/1849). System entities and core flows updated. Status set to IMPLEMENTATION.
- 2026-03-24 10:00 — Spec revised: `is_closed: Boolean` approach replaced by the `RegistrationStatus` enum (`open`/`closed`/`full`) already implemented in [#1820](https://github.com/climateconnect/climateconnect/issues/1820) (migration `0121_add_eventregistration_status.py`). No schema migration needed. `is_registration_open` updated to `status == "open" AND registration_end_date > now`. `full` confirmed as system-only (not organizer-settable via API). Open question from original spec resolved.
- 2026-03-24 10:30 — `ended` status added (Python-side, never stored). Lazy computation in serializer: `stored_status == "open" AND registration_end_date <= now → effective "ended"`. `is_registration_open` now simplifies to `effective_status == "open"` — `status` becomes the single source of truth for all states. `reopen` endpoint guards against `ended` (returns `400`). System entities and core flows updated.
- 2026-03-24 11:00 — `is_registration_open` removed from the API entirely. `status` covers all cases and provides richer information for contextual UI messaging (`open` → Register, `closed` → "Registration closed", `full` → "Booked out", `ended` → "Registration period ended"). Ripple effect: [#1845](https://github.com/climateconnect/climateconnect/issues/1845) and [#1849](https://github.com/climateconnect/climateconnect/issues/1849) specs must be updated to remove `is_registration_open` from their API response documentation.
- 2026-03-26 — GitHub issue #1851 created in the code repository. Spec updated: `/api/events/` URLs corrected to `/api/projects/`; all product-backlog task number references replaced with code repo issue numbers.

## Acceptance Criteria

- [ ] An event organizer or team admin can close the event registration from the **event detail page**.
- [ ] An event organizer or team admin can close the event registration from the **event edit page**.
- [ ] Once registration is manually closed (`status = "closed"`), members cannot register — `POST /register/` returns `400 Bad Request`.
- [ ] A manually closed registration can be **reopened** by the event organizer or team admin (if the deadline has not passed).
- [ ] After reopening (`status = "open"`), members can register again.
- [ ] `POST /api/projects/{slug}/registration/close/` is idempotent — calling it when `status` is already `"closed"` returns `200 OK`.
- [ ] `POST /api/projects/{slug}/registration/reopen/` is idempotent — calling it when `status` is already `"open"` returns `200 OK`.
- [ ] `POST /api/projects/{slug}/registration/reopen/` returns `400 Bad Request` when `effective_status == "ended"` (deadline has passed), with a message directing the organizer to extend the registration end date first.
- [ ] The organizer can reopen a `"full"` registration (`full` → `open` transition is permitted).
- [ ] `full` and `ended` cannot be set via either endpoint — `EventRegistrationSerializer.validate_status()` rejects them with `400 Bad Request`.
- [ ] Both endpoints return `401 Unauthorized` for unauthenticated requests.
- [ ] Both endpoints return `403 Forbidden` for users who are not the event organizer or a team admin.
- [ ] Both endpoints return `404 Not Found` when no `EventRegistration` exists for the event.
- [ ] `event_registration.status: "open" | "closed" | "full" | "ended"` is returned by `GET /api/projects/{slug}/` and `GET /api/projects/`. `"ended"` is computed lazily (never stored in DB).
- [ ] `is_registration_open` is **not present** in any API response — removed from `EventRegistrationSerializer` and all endpoint payloads.
- [ ] The member-facing button on the event detail page uses `status` for both gating and contextual labelling:
  - `status == "open"`: active "Register" button.
  - `status == "closed"`: disabled button labelled **"Registration closed"**.
  - `status == "full"`: disabled button labelled **"Booked out"**.
  - `status == "ended"`: disabled button labelled **"Registration period ended"**.
- [ ] The organizer/admin UI on the event detail page shows:
  - **"Close registration"** when `status == "open"`.
  - **"Reopen registration"** when `status == "closed"` or `"full"`.
  - Informational label **"Registration period has ended"** when `status == "ended"` (no action button shown).
- [ ] The organizer/admin UI on the event edit page includes the same close/reopen/ended behaviour.
- [ ] Regular members do not see the close/reopen action.
- [ ] No Django migration is required — `status` column already exists from [#1820](https://github.com/climateconnect/climateconnect/issues/1820) migration `0121_add_eventregistration_status.py`. `ended` is a Python-side enum value only.
- [ ] All tests pass (unit, integration, end-to-end).
- [ ] Code review approved.
- [ ] Documentation updated and current.


# Event Organizer Can Close Registration Before the End Date

**Status**: IN PROGRESS — Backend complete; frontend pending (Reference: [`task-based-development.md`](../for-agents/guides/task-based-development.md))
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

**Update event registration (extend existing)**
```
PATCH /api/projects/{slug}/registration/
```
- Existing endpoint extended to allow organizer status changes.
- Auth required (`401` if unauthenticated).
- Requires organizer or team admin role on the project (`403` otherwise).
- `404 Not Found` if no `EventRegistration` exists for this event.
- Accepts `status` in the request body — only `"open"` and `"closed"` are permitted values for organizer updates.
- `validate_status()` must reject `"full"` and `"ended"` with `400 Bad Request` — these values are system-managed only.
- Idempotent: setting `status` to its current value returns `200 OK` without changes.
- When setting `status = "open"` and `effective_status == "ended"` (registration deadline has already passed), returns `400 Bad Request` with message directing organizer to extend `registration_end_date` first.
- `full` → `open` transition is only permitted when `max_participants` is **also increased in the same request** to a value greater than the current participant count (i.e. at least one seat becomes available). Without a capacity increase, returns `400 Bad Request`: *"Cannot reopen: the event is fully booked. Please increase the maximum participants first."* The check uses the new `max_participants` value from the PATCH body, so a single combined request (`status=open` + `max_participants=<new value>`) is sufficient.
- Returns `200 OK` with the updated `event_registration` object (including the new `status`).

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

- **Event edit page** (organizer/admin view):
  - The existing event registration edit form is extended to include a **status** field.
  - Status is displayed as a select/radio group with two options: **"Open"** and **"Closed"**.
  - The form submits to `PATCH /api/projects/{slug}/registration/` including the `status` field.
  - If `effective_status == "ended"` and the organizer attempts to set `status = "open"`, the backend returns `400 Bad Request` — the frontend should display the error message directing the organizer to extend `registration_end_date` first.
  - `"full"` and `"ended"` statuses are not selectable options — they are system-managed. The form displays the current status as read-only text when it is `"full"` or `"ended"`.
  - **Capacity guard (status `"full"`)**: when the current status is `"full"`, the **"Open"** option in the status selector must be **disabled**. An inline hint is displayed: *"Registration is fully booked. Increase the maximum participants to reopen."* The "Open" option becomes selectable only once the organizer has changed `max_participants` to a value strictly greater than the current participant count (i.e. at least one seat opens up). The organizer may set both `max_participants` and `status = "open"` in a single form submission — the backend accepts this as one atomic operation.
  - On success: the form updates with the new status value and any other changed fields.
  - On error: show an inline error message in the form.

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
  - `partial_update()` method (handles `PATCH`) must allow `status` updates from organizers/admins.
  - Permission class for `PATCH` must be `IsAuthenticated` and `IsEventOrganizerOrAdmin`.
  - `validate_status()` in the serializer enforces:
    - Only `"open"` and `"closed"` are accepted from the frontend.
    - If organizer attempts to set `status = "open"` when `effective_status == "ended"`, raise `ValidationError` with message: *"Cannot reopen: registration deadline has passed. Please extend the registration end date first."*
    - Reject `"full"` and `"ended"` with `ValidationError`: *"Status can only be set to 'open' or 'closed'. 'full' and 'ended' are system-managed."*
  - Backend automatically sets `status = "full"` when the last seat is taken (existing behaviour from prior specs).
  - Backend automatically computes `effective_status = "ended"` in the serializer when `status == "open"` and `registration_end_date <= now` (lazy computation, never stored).
  - `register()` action ([#1845](https://github.com/climateconnect/climateconnect/issues/1845)): update guard to `effective_status != RegistrationStatus.OPEN` — this covers `closed`, `full`, and `ended` with a single check.

- **`IsEventOrganizerOrAdmin` permission class** (new or reuse existing): checks that `request.user` is the project owner or holds an admin role in the project team. Verify whether an equivalent already exists before creating a new one.

- **No Django migration needed** — `status` column already exists from migration `0121_add_eventregistration_status.py`. `ended` is a Python-side enum value only.

### Data

No schema changes. `projects_eventregistration.status` column already exists (VARCHAR/Enum, NOT NULL, DEFAULT `'open'`) from [#1820](https://github.com/climateconnect/climateconnect/issues/1820) (migration `0121_add_eventregistration_status.py`). The `ended` value is never written to the database — it is a Python-side enum value returned by the serializer's `get_effective_status()` method only. `is_registration_open` is no longer exposed in any API response.

### Other

None.

## Technical Solution Overview

**Backend — completed 2026-03-31.**

### Models (`organization/models/event_registration.py`)
- `RegistrationStatus` extended with `ENDED = "ended", "Ended"` as a Python-side-only computed constant. It is **never stored in the DB** — `validate_status()` rejects it on any write. The `status` field `help_text` was updated to document this.

### Serializers (`organization/serializers/event_registration.py`)
- `_compute_effective_status(obj)` — module-level helper used by both the read path (serializer `to_representation`) and the view's write guard. Returns `RegistrationStatus.ENDED` constant (not the raw string) when `stored_status == OPEN` and `registration_end_date <= now()`.
- `EventRegistrationSerializer.validate_status()` — rejects both `FULL` and `ENDED` with a unified message: *"Status can only be set to 'open' or 'closed'. 'full' and 'ended' are system-managed."*
- `EditEventRegistrationSerializer`:
  - Removed `status` from `read_only_fields` — it is now writable.
  - `validate_status()` — same rejection of `FULL` and `ENDED`.
  - `validate()` — reopen guard: when `new_status == OPEN` and `_compute_effective_status(self.instance) == ENDED`, raises a field-level `ValidationError` directing the organiser to extend `registration_end_date` first.
  - `update()` — explicit-status-priority pattern: reads `explicit_status = validated_data.get("status")`. The existing `max_participants` auto-adjustment only runs when `explicit_status is None` — organiser's explicit intent always wins.

### Views (`organization/views/event_registration_views.py`)
- `RegisterForEventView.post()` — two-step guard (`er.status != OPEN` + deadline check) replaced by a single `_compute_effective_status(er) != OPEN` check. A `_message_map` dict provides status-specific error messages (`closed` → "Registration is currently closed.", `full` → "The event is fully booked.", `ended` → "The registration deadline has passed.").

### Tests (`organization/tests/test_event_registration.py`)
- Updated `test_status_in_request_body_is_ignored` → `test_status_closed_in_request_body_is_applied` (status IS now writable).
- Added `TestEditEventRegistrationStatusChange` — 14 tests covering all permitted/rejected transitions, idempotent patches, reopen guard, auto-adjustment override, 401/403 authz, and end-to-end close-blocks/reopen-allows signup flows.

### No migration required
`RegistrationStatus.ENDED` is Python-side only. The `status` column already exists from migration `0121_add_eventregistration_status.py`.

**Frontend — pending.** See acceptance criteria for required UI changes.

## Log

- 2026-03-24 09:00 — Task created from GitHub issue #1851. Depends on [#1820](https://github.com/climateconnect/climateconnect/issues/1820) for the `EventRegistration` entity and [#1845](https://github.com/climateconnect/climateconnect/issues/1845) for the `is_registration_open` computation and `POST /register/` endpoint.
- 2026-03-24 09:30 — System impact analysis complete. New Manage Event Registration Status Flow defined. `is_registration_open` ripple effect documented across [#1845](https://github.com/climateconnect/climateconnect/issues/1845) and [#1849](https://github.com/climateconnect/climateconnect/issues/1849). System entities and core flows updated. Status set to IMPLEMENTATION.
- 2026-03-24 10:00 — Spec revised: `is_closed: Boolean` approach replaced by the `RegistrationStatus` enum (`open`/`closed`/`full`) already implemented in [#1820](https://github.com/climateconnect/climateconnect/issues/1820) (migration `0121_add_eventregistration_status.py`). No schema migration needed. `is_registration_open` updated to `status == "open" AND registration_end_date > now`. `full` confirmed as system-only (not organizer-settable via API). Open question from original spec resolved.
- 2026-03-24 10:30 — `ended` status added (Python-side, never stored). Lazy computation in serializer: `stored_status == "open" AND registration_end_date <= now → effective "ended"`. `is_registration_open` now simplifies to `effective_status == "open"` — `status` becomes the single source of truth for all states. `reopen` endpoint guards against `ended` (returns `400`). System entities and core flows updated.
- 2026-03-24 11:00 — `is_registration_open` removed from the API entirely. `status` covers all cases and provides richer information for contextual UI messaging (`open` → Register, `closed` → "Registration closed", `full` → "Booked out", `ended` → "Registration period ended"). Ripple effect: [#1845](https://github.com/climateconnect/climateconnect/issues/1845) and [#1849](https://github.com/climateconnect/climateconnect/issues/1849) specs must be updated to remove `is_registration_open` from their API response documentation.
- 2026-03-26 — GitHub issue #1851 created in the code repository. Spec updated: `/api/events/` URLs corrected to `/api/projects/`; all product-backlog task number references replaced with code repo issue numbers.
- 2026-03-31 — Spec revised: removed separate `POST /close/` and `POST /reopen/` endpoints. Status changes are now handled via the existing `PATCH /api/projects/{slug}/registration/` endpoint as part of the registration edit form. Only `"open"` and `"closed"` are user-settable; `"full"` and `"ended"` remain system-managed. Backend automatically handles status transitions based on registration count and deadline. Frontend shows status as a select field in the edit form with "Open" and "Closed" options, displaying "full" and "ended" as read-only when applicable.
- 2026-03-31 — Capacity guard added. `full → open` is now **blocked** at the API level unless `max_participants` is increased above the current participant count in the same PATCH request. Frontend must enforce this proactively: when `status == "full"`, the "Open" option is disabled until `max_participants` is set to a value that creates at least one free seat. A single combined `status=open` + `max_participants=<new value>` submission is accepted as one atomic operation by the backend.

## Acceptance Criteria

- [ ] An event organizer or team admin can change registration status between **"open"** and **"closed"** from the **event edit page** via the registration edit form.
- [ ] The registration edit form includes a status field with **"Open"** and **"Closed"** as selectable options.
- [ ] When `status = "full"` or `"ended"`, the form displays the current status as read-only text (not selectable).
- [ ] Once registration is manually closed (`status = "closed"`), members cannot register — `POST /register/` returns `400 Bad Request`.
- [ ] A manually closed registration can be **reopened** by the event organizer or team admin via the form (if the deadline has not passed).
- [ ] After reopening (`status = "open"`), members can register again.
- [ ] `PATCH /api/projects/{slug}/registration/` accepts `status` in the request body and updates it.
- [ ] `PATCH` is idempotent — setting `status` to its current value returns `200 OK` without changes.
- [ ] `PATCH` returns `400 Bad Request` when `effective_status == "ended"` and organizer attempts to set `status = "open"`, with a message directing the organizer to extend the registration end date first.
- [ ] `PATCH` returns `400 Bad Request` when the event is at capacity (`participant_count >= max_participants`) and the organizer attempts to set `status = "open"` without also increasing `max_participants` — error message: *"Cannot reopen: the event is fully booked. Please increase the maximum participants first."*
- [ ] The organizer **can** reopen a `"full"` registration when `max_participants` is increased above the current participant count in the same PATCH request (single atomic `status=open` + `max_participants=<new value>` submission).
- [ ] When `status == "full"`, the "Open" option in the registration status selector on the event edit form is **disabled** with a hint explaining that `max_participants` must be increased first. The option becomes enabled once `max_participants` is set to a value above the current participant count.
- [ ] `full` and `ended` cannot be set via `PATCH` — `EventRegistrationSerializer.validate_status()` rejects them with `400 Bad Request` and message: *"Status can only be set to 'open' or 'closed'. 'full' and 'ended' are system-managed."*
- [ ] `PATCH` returns `401 Unauthorized` for unauthenticated requests.
- [ ] `PATCH` returns `403 Forbidden` for users who are not the event organizer or a team admin.
- [ ] `PATCH` returns `404 Not Found` when no `EventRegistration` exists for the event.
- [ ] `event_registration.status: "open" | "closed" | "full" | "ended"` is returned by `GET /api/projects/{slug}/` and `GET /api/projects/`. `"ended"` is computed lazily (never stored in DB).
- [ ] `is_registration_open` is **not present** in any API response — removed from `EventRegistrationSerializer` and all endpoint payloads.
- [ ] The organizer/admin event registration edit form correctly displays and allows editing of the status field.
- [ ] Regular members do not see the status edit control.
- [ ] No Django migration is required — `status` column already exists from [#1820](https://github.com/climateconnect/climateconnect/issues/1820) migration `0121_add_eventregistration_status.py`. `ended` is a Python-side enum value only.
- [ ] All tests pass (unit, integration, end-to-end).
- [ ] Code review approved.
- [ ] Documentation updated and current.


# Member Can Cancel Their Event Registration

**Status**: READY FOR IMPLEMENTATION (Reference: [`task-based-development.md`](../for-agents/guides/task-based-development.md))
**Type**: Feature
**Date and time created**: 2026-03-09 15:00
**Date Completed**: TBD
**GitHub Issue**: [#1850](https://github.com/climateconnect/climateconnect/issues/1850)
**Epic**: [EPIC_event_registration.md](./EPIC_event_registration.md)
**Related Specs**:
- [`docs/mosy/architecture_overview.md`](../mosy/architecture_overview.md)
- [`docs/mosy/entities/system-entities.md`](../mosy/entities/system-entities.md)
- [`docs/mosy/flows/core-flows.md`](../mosy/flows/core-flows.md)
- [`docs/tasks/20260309_0900_member_register_for_event.md`](./20260309_0900_member_register_for_event.md) ← introduces `EventRegistration` (sign-up record) and the `DELETE /registrations/` endpoint stub
- [`docs/tasks/20260309_1100_member_see_registered_events.md`](./20260309_1100_member_see_registered_events.md) ← introduces "You are registered" badge + disabled button placeholder
- [`docs/tasks/20260402_1500_rename_event_registration_models.md`](./20260402_1500_rename_event_registration_models.md) ← renames `EventParticipant` → `EventRegistration` and `EventRegistration` (settings) → `EventRegistrationConfig`

## Problem Statement

A logged-in member who has registered for an upcoming event can cancel their registration directly from the event detail page. After cancellation, their seat becomes available again and the event is removed from their registered events list on their profile.

**Core Requirements (User/Stakeholder Stated):**

- On the event detail page, a registered member sees a **"Cancel registration"** button instead of the "Register" button.
  - This replaces the disabled Register button + "You are registered" badge introduced in [#1849](https://github.com/climateconnect/climateconnect/issues/1849).
- Clicking "Cancel registration" shows a **confirmation step** before the cancellation is processed (e.g. a confirmation modal or inline prompt: *"Are you sure you want to cancel your registration?"*).
- After confirmed cancellation:
  - The `EventRegistration` record is **soft-deleted**: a `cancelled_at` timestamp is set on the record, and `cancelled_by` is set to the current user. The record is kept for historical purposes (e.g. future organiser visibility of cancellations).
  - The freed seat is immediately available for other members to register.
  - The event no longer appears in the member's registered events list on their profile page.
  - The member can register again for the same event (if registration is still open **and the member cancelled their own registration** — i.e. `cancelled_by == request.user`). Re-registration **reuses the existing `EventRegistration` record**: `cancelled_at` and `cancelled_by` are both reset to `NULL`. No new row is created.
  - If the member's registration was cancelled by a **different user** (e.g. a team admin), the member **cannot re-register**. The API returns `403 Forbidden`. The frontend shows a disabled **"Registration closed"** button for that member, even if the event's registration is still open to other members.
- Once the event's `start_date` has passed, the cancellation button is no longer shown. Instead, the button area shows a non-interactive label **"You attended this event"** to acknowledge the prior registration. This applies to members who had an **active** (non-cancelled) registration when the event started. Members who cancelled their registration before the event started do **not** see this label.
- The member does not receive further notifications or reminders for the event after cancellation. If a reminder feature (issue #50) is implemented before this task, it must respect cancellation. If not yet implemented, the reminder task spec must be updated to exclude cancelled registrations — this task's log must note that dependency.

**Explicitly Out of Scope (this iteration):**
- Notifying the event organiser about cancellations. (different task)
- The organiser being able to see who cancelled — deferred, but the soft-delete approach in this task preserves the historical record so this can be implemented in a future story without a data migration. (different task)
- Cancellation by the organiser on behalf of a member (different task) — however, the `cancelled_by` field introduced here will be reused in that future task.

### Non Functional Requirements

- The cancellation (deletion of `EventRegistration`) must be **atomic** — the seat count must be restored in the same operation, with no window where the seat is neither occupied nor freed.
- The endpoint must verify that the requesting user owns the registration — a member must not be able to cancel another member's registration (`403 Forbidden`).
- Cancellation is only possible while the event has not yet started. Attempting to cancel a past/ongoing event should return `400 Bad Request` (edge case — the UI can hide the button, but the backend must enforce it).
- No breaking changes to existing APIs.

### AI Agent Insights and Additions

- Task [#1849](https://github.com/climateconnect/climateconnect/issues/1849) introduced a disabled "Register" button as a placeholder for this exact feature. This task activates that button space by replacing the badge + disabled button with the "Cancel registration" button. The `is_registered` field already in the event detail API response (nested under `registration_config` in `GET /api/projects/{slug}/`) is sufficient to drive this UI switch — no new API field needed, but `is_registered` must now filter on `cancelled_at IS NULL`.
- The `DELETE /api/projects/{slug}/registrations/` endpoint was explicitly noted as a future task in [#1845](https://github.com/climateconnect/climateconnect/issues/1845). This task implements it fully as a soft delete.
- **Re-registration** reuses the existing `EventRegistration` row: `cancelled_at` and `cancelled_by` are both reset to `NULL`. The `POST /registrations/` endpoint in [#1845](https://github.com/climateconnect/climateconnect/issues/1845) must be updated accordingly — if a soft-deleted record exists for the user/event pair, ownership must be checked first: if `cancelled_by == request.user`, reset the record (re-registration); if `cancelled_by != request.user`, return `403 Forbidden` (admin-cancelled — the member may not self-re-register). The unique constraint `UNIQUE(user, registration_config)` stays intact.
- **Soft delete ripple effect**: any query that counts active participants or checks registration status must add `cancelled_at IS NULL` to its filter. Affected places: `available_seats` count in [#1845](https://github.com/climateconnect/climateconnect/issues/1845), `is_registered` check in [#1849](https://github.com/climateconnect/climateconnect/issues/1849), `GET /api/members/me/registered-events/` in [#1849](https://github.com/climateconnect/climateconnect/issues/1849), and the future reminder query in issue #50.
- Reminder notifications (issue #50) and message from organizer to guests: the Celery Beat query must filter `EventRegistration.objects.filter(cancelled_at__isnull=True)` to exclude cancelled registrations.
- **`cancelled_by` forward compatibility**: this field is set to `request.user` in this task. A future task enabling admin/organiser cancellation on behalf of a member will reuse the same field, setting it to the admin user instead. No schema change will be required at that point.

## System impact

- **Actors involved**:
  - `Member`: Cancels their registration for an upcoming event.
  - `System`: Soft-deletes the `EventRegistration` record (sets `cancelled_at` and `cancelled_by`), restoring the available seat count.
- **Actions to implement**:
  - `Member` → `Cancel Event Registration` → `EventRegistration` (soft delete: set `cancelled_at`, `cancelled_by`) + `EventRegistrationConfig` (available seat count restored — derived from active registrations only)
- **Flows affected**:
  - **New flow — Cancel Event Registration Flow**: Member views event page → clicks "Cancel registration" → confirms → system soft-deletes `EventRegistration` → UI updates.
  - **View Registered Events Flow** ([#1849](https://github.com/climateconnect/climateconnect/issues/1849)): event disappears from the profile grid after cancellation (endpoint must filter `cancelled_at IS NULL`).
- **Entity changes needed**: Yes — `EventRegistration` gains `cancelled_at: DateTimeField (nullable)` and `cancelled_by: ForeignKey to User (nullable)`. No new entities.
- **Flow changes needed**: Yes — new flow added.
- **Integration changes needed**: No.
- **New specifications required**: New flow for cancellation. `EventRegistration` entity updated in system entities.

## Software Architecture

### API

**Cancel registration (implements the endpoint stubbed in [#1845](https://github.com/climateconnect/climateconnect/issues/1845))**
```
DELETE /api/projects/{slug}/registrations/
```
- Auth required (`401` if unauthenticated).
- Verifies an `EventRegistration` record exists for this event (`404` if no record found).
- Verifies `request.user` owns the registration — no cross-user cancellation (`403` otherwise).
- Verifies the registration record is active (`cancelled_at IS NULL`) for this event (`404` if already cancelled).
- Verifies the event has not yet started (`400` if `project.start_date <= now`).
- Sets `cancelled_at = now()` and `cancelled_by = request.user` on the `EventRegistration` record atomically.
- Returns `204 No Content` on success.

**Event detail endpoint (existing) — event-level data only**
```
GET /api/projects/{slug}/
```
- `registration_config.available_seats` count must filter `cancelled_at IS NULL` (only active registrations count against capacity). No other changes to this endpoint — per-user registration state does not belong here (the response is shared/cacheable).

**User interactions endpoint (existing) — per-user registration state**
```
GET /api/projects/{slug}/my_interactions/
```
This is the established codebase pattern for per-user project state (see `GetUserInteractionsWithProjectView`). Extend the response with three new fields:
- `is_registered: boolean` — `true` only when the user has an **active** (`cancelled_at IS NULL`) `EventRegistration` record for this event. Must now filter on `cancelled_at IS NULL` (previously missing this guard). Returns `false` when unauthenticated or not an event.
- `has_attended: boolean` — `true` when `project.start_date <= now` AND the user has an **active** (`cancelled_at IS NULL`) registration record. Returns `false` when the event has not started, the user has no registration record, the user cancelled before the event started, or the user is unauthenticated. Drives the "You attended this event" UI state.
- `admin_cancelled: boolean` — `true` when the user has a cancelled registration record where `cancelled_by` is **not** the requesting user (i.e. cancelled by a different user such as a team admin). Returns `false` when the user has no cancelled record, cancelled their own registration, or is unauthenticated. Drives the "Registration closed" UI state for admin-cancelled members even when the event's registration is otherwise open.

No other API changes.

### Events

None. Cancellation is synchronous. No async side-effects in this iteration (organiser notification is out of scope).

### Frontend

- **Event detail page** — the button area uses data from two sources: event-level settings from `registration_config` (in the project detail response) and per-user state from `my_interactions`. Evaluate conditions in the order listed — `has_attended` takes highest priority:

  | Priority | Condition | Button area |
  |---|---|---|
  | 1 | `has_attended: true` from `my_interactions` (event started, user had active registration at start time) | Non-interactive label **"You attended this event"** |
  | 2 | `is_registered: true` from `my_interactions` + event not yet started | **"Cancel registration"** button (active) |
  | 3 | `admin_cancelled: true` from `my_interactions` | Disabled **"Registration closed"** button (admin-cancelled — re-registration blocked regardless of event registration state) |
  | 4 | `is_registered: false` + `admin_cancelled: false` (both from `my_interactions`) + registration open | **"Register"** button (existing behaviour) |
  | 5 | `is_registered: false` + `admin_cancelled: false` (both from `my_interactions`) + registration closed | Disabled **"Registration closed"** button (existing behaviour) |

  Note: `has_attended: true` and `is_registered: true` can coexist in the `my_interactions` response (the user is still actively registered when the event starts). Always check `has_attended` first. `admin_cancelled: true` and `is_registered: true` are mutually exclusive (a cancelled record cannot also be active).
  - Clicking "Cancel registration" opens a **confirmation modal**:
    - Message: *"Are you sure you want to cancel your registration for [event title]?"*
    - Two buttons: **"Yes, cancel registration"** (calls `DELETE /api/projects/{slug}/registrations/`) and **"Keep registration"** (dismisses modal).
  - On successful cancellation (`204`):
    - Close the modal.
    - Update the button area to show "Register" (if registration still open) or "Registration closed".
    - The available seat count increments by 1.
  - On error: show an inline error message inside the modal.

### Backend

- **`EventRegistrationViewSet`** (extend existing, introduced in [#1845](https://github.com/climateconnect/climateconnect/issues/1845)):
  - Implement `destroy()` action for `DELETE /api/projects/{slug}/registrations/`:
    - Wrap the entire operation in `@transaction.atomic`.
    - Look up the `EventRegistration` for this event without pre-filtering by user, then check ownership explicitly — return `403 Forbidden` if the record exists but belongs to a different user (do not fold the ownership check into the initial query filter, which would silently return `404`).
    - Return `404 Not Found` if no active (`cancelled_at IS NULL`) registration record exists for this user and event.
    - Return `400 Bad Request` if the event has already started (`start_date <= now()`).
    - Set `cancelled_at = now()` and `cancelled_by = request.user`, then save.
    - If the `EventRegistrationConfig.status` was `FULL`, check whether active registrations are now below `max_participants`; if so, revert `status` back to `OPEN`. This is the mirror of the `FULL`-promotion logic in the `POST /registrations/` action and must happen in the same atomic transaction.
    - Return `204 No Content` on success.
  - `available_seats` derivation must be updated everywhere to filter `cancelled_at__isnull=True`.
- **`EventRegistration` model** (extend existing, introduced in [#1845](https://github.com/climateconnect/climateconnect/issues/1845)):
  - Add `cancelled_at = models.DateTimeField(null=True, blank=True, default=None)`.
  - Add `cancelled_by` as a nullable FK to the `User` model — set to `request.user` on cancellation, reset to `NULL` on re-registration.
- **`GetUserInteractionsWithProjectView`** (extend existing — `organization/views/project_views.py`): extend the `GET /api/projects/{slug}/my_interactions/` response with two new fields alongside the existing `is_registered`:
  - `is_registered`: update the existing query to add `cancelled_at__isnull=True` so that soft-deleted (cancelled) registrations no longer return `true`.
  - `has_attended`: add the new derivation — `true` when `project.start_date <= now()` AND an active (`cancelled_at IS NULL`) `EventRegistration` exists for this user/event pair. Return `false` in all other cases (event not yet started, no record, cancelled before start, unauthenticated).
  - `admin_cancelled`: add the new derivation — `true` when a cancelled registration record exists (`cancelled_at IS NOT NULL`) where `cancelled_by` is **not** the requesting user. Return `false` in all other cases.
- **`EventRegistrationViewSet`** — update `create()` / register action ([#1845](https://github.com/climateconnect/climateconnect/issues/1845)) to handle re-registration:
  - If a registration record exists with `cancelled_at IS NOT NULL` for this user/event pair:
    - If `cancelled_by == request.user`: reset `cancelled_at` to `None` and `cancelled_by` to `None` (re-registration). Return `201 Created`.
    - If `cancelled_by != request.user`: the cancellation was performed by a different user (e.g. admin). Return `403 Forbidden` — the member may not self-re-register.
  - If a registration record exists with `cancelled_at IS NULL`: already actively registered — idempotent, return `200 OK`. No change to the record.
  - If no record exists: create a fresh row. Return `201 Created`.
  - The distinction between a new registration and a re-registration from a cancelled state is a backend implementation detail — both allowed paths return `201 Created` to the client.
- **Django migration**: add `cancelled_at` and `cancelled_by_id` columns to `organization_eventregistration`.

### Data

- **`organization_eventregistration`** (extend existing — formerly `organization_eventparticipant`, renamed in [20260402_1500_rename_event_registration_models.md](./20260402_1500_rename_event_registration_models.md)):
  - Add `cancelled_at TIMESTAMPTZ NULL DEFAULT NULL`.
  - Add `cancelled_by_id BIGINT NULL REFERENCES auth_user(id) ON DELETE SET NULL`.
- Migration is additive. All existing rows default to `NULL` (i.e. active registrations). No backfill needed.
- One row per `(user, registration_config)` always. Re-registration updates the existing row in-place — the unique constraint is never relaxed.
- Record lifecycle:

  | State | `cancelled_at` | `cancelled_by_id` |
  |---|---|---|
  | Active registration | `NULL` | `NULL` |
  | Cancelled | `2026-03-10 10:00` | `<user_id>` |
  | Re-registered | `NULL` (reset) | `NULL` (reset) |

- `available_seats` is derived as `max_participants - COUNT(registrations WHERE cancelled_at IS NULL)`.

### Other

- The "Cancel registration" button should use a visually distinct (but not alarming) style — e.g. outlined or secondary, not the same destructive red as a delete action. Exact design TBD with design team.
- The "You attended this event" label is informational only — no interaction. Style TBD with design team.

## Technical Solution Overview

Backend implemented on 2026-04-09 alongside [`20260407_1000_organizer_cancel_guest_registration.md`](./20260407_1000_organizer_cancel_guest_registration.md) to share the soft-delete pattern and `FULL→OPEN` seat-revert logic.

### Model — `organization/models/event_registration.py`
`EventRegistration` gained two nullable fields:
- `cancelled_at = DateTimeField(null=True, blank=True, default=None)` — `NULL` = active registration.
- `cancelled_by = ForeignKey(User, null=True, blank=True, on_delete=SET_NULL, related_name="cancelled_registrations")` — set to `request.user` on self-cancel; set to the admin user on admin-cancel; reset to `NULL` on re-registration. The dual role of this single FK field is the key design choice: `cancelled_by == request.user` → self-cancel (re-registration allowed); `cancelled_by != request.user` → admin-cancel (re-registration blocked, `403`).

### Migration — `organization/migrations/0124_add_cancelled_fields_to_eventregistration.py`
Additive `AddField` operations for both columns. All existing rows default to `NULL` (active). No backfill required.

### `DELETE /api/projects/{url_slug}/registrations/` — `EventRegistrationsView.delete()`
In `organization/views/event_registration_views.py`, added as a `delete()` method on the existing `EventRegistrationsView` class (which already handled `GET` and `POST` for the same URL). Wrapped in `@transaction.atomic`. Guards in order:
1. Project not found → `404`
2. No `EventRegistrationConfig` → `404`
3. No `EventRegistration` for requesting user → `404`
4. Ownership: `reg.user_id != request.user.id` → `403` (explicit check after lookup, as specified)
5. Already cancelled (`cancelled_at IS NOT NULL`) → `404`
6. Event already started (`start_date <= now()`) → `400`
7. Soft-delete: set `cancelled_at = now()`, `cancelled_by = request.user`
8. Revert `EventRegistrationConfig.status` `FULL → OPEN` if active count drops below `max_participants`
Returns `204 No Content`.

### `POST /api/projects/{url_slug}/registrations/` — `EventRegistrationsView.post()`
Updated to handle re-registration before the registration-open validation:
- Existing record, `cancelled_at IS NULL` → already active, idempotent `200 OK`
- Existing record, `cancelled_at IS NOT NULL`, `cancelled_by == request.user` → self-cancelled, fall through to registration-open check then reset fields on the existing row → `201 Created`
- Existing record, `cancelled_at IS NOT NULL`, `cancelled_by != request.user` → admin-cancelled, `403 Forbidden`
- No record → create fresh row → `201 Created`
The unique constraint `UNIQUE(user, registration_config)` is never relaxed; re-registration updates the existing row in place.

### `GET /api/projects/{url_slug}/my_interactions/` — `GetUserInteractionsWithProjectView`
In `organization/views/project_views.py`, the response was extended with three new fields:
- `is_registered`: updated to check `cancelled_at IS NULL`
- `has_attended`: `True` when `project.start_date <= now()` AND the user has an active registration
- `admin_cancelled`: `True` when a cancelled record exists where `cancelled_by_id != request.user.id`

### Serializers — `organization/serializers/event_registration.py`
All `available_seats` derivations updated to filter `cancelled_at__isnull=True`:
- `EventRegistrationConfigBaseSerializer.get_available_seats()`
- `EditEventRegistrationConfigSerializer.update()` — `current_count` query
- `EditEventRegistrationConfigSerializer.validate()` — both `registration_count` queries

### Pending
- Tests for the new `delete()` method on `EventRegistrationsView` and the updated `post()` re-registration paths have not yet been written. See test cases in [`20260407_1000_organizer_cancel_guest_registration.md`](./20260407_1000_organizer_cancel_guest_registration.md) for the combined test suite.

## Log

- 2026-03-09 15:00 — Task created from GitHub issue #1850. Depends on [#1845](https://github.com/climateconnect/climateconnect/issues/1845) (`EventRegistration` entity and `DELETE` endpoint stub) and [#1849](https://github.com/climateconnect/climateconnect/issues/1849) (disabled Register button placeholder replaced here). Organiser cancellation visibility and organiser notification confirmed out of scope for this iteration.
- 2026-03-09 15:30 — Confirmed soft delete over hard delete: `cancelled_at` timestamp added to `EventRegistration`, preserving historical records for future organiser visibility feature. Post-start-date UI state added: "You attended this event" non-interactive label. Soft delete ripple effect documented across [#1845](https://github.com/climateconnect/climateconnect/issues/1845), [#1849](https://github.com/climateconnect/climateconnect/issues/1849), and issue #50.
- 2026-03-09 15:45 — Confirmed re-registration reuses the existing `EventRegistration` row (reset `cancelled_at = NULL`) — no new row created, no extra tracking column. Unique constraint `(user, registration_config)` stays intact. `POST /registrations/` in [#1845](https://github.com/climateconnect/climateconnect/issues/1845) must be updated to handle this via `update_or_create`.
- 2026-04-02 09:57 — Updated specs to reflect recent changes and progress.
- 2026-04-02 11:00 — Spec review completed. Changes applied: (1) Status promoted to READY FOR IMPLEMENTATION. (2) All backend code snippets removed — implementation details left to the developing agent. (3) `has_attended` corrected: only `true` for members with an **active** (non-cancelled) registration once the event starts; members who cancelled before the event do not see "You attended this event". (4) Frontend state table updated with explicit priority order and note about coexistence of `has_attended` and `is_registered`. (5) `destroy()` requirements updated to include `@transaction.atomic`, explicit ownership `403` check (separate from the 404 not-found check), and the missing `FULL → OPEN` status revert when a cancellation frees a seat. (6) Re-registration response codes simplified: `201 Created` for all successful registration operations (new or re-registration from cancelled); `200 OK` for idempotent already-active-registration only.
- 2026-04-07 — Spec updated to reflect model renames from [20260402_1500_rename_event_registration_models.md](./20260402_1500_rename_event_registration_models.md): `EventParticipant` → `EventRegistration`, `EventRegistration` (settings) → `EventRegistrationConfig`, endpoint `/register/` → `/registrations/`, JSON response key `event_registration` → `registration_config`. Added `cancelled_by` FK field to `EventRegistration` to record who performed the cancellation — set to `request.user` in this task; a future admin-cancellation task will reuse the same field without any schema change.
- 2026-04-09 — Added admin-cancellation re-registration restriction: a member whose registration was cancelled by a different user (e.g. a team admin) cannot self-re-register. `POST /registrations/` returns `403 Forbidden` in that case. Per-user fields `is_registered`, `has_attended`, and `admin_cancelled` correctly placed in `GET /api/projects/{slug}/my_interactions/` (established pattern for per-user project state — keeps the project detail response shared/cacheable). `GET /api/projects/{slug}/` retains only the event-level `available_seats` change (filter `cancelled_at IS NULL`). Frontend state table updated to source conditions from `my_interactions` with a dedicated priority-3 row for admin-cancelled members showing a disabled "Registration closed" button.
- 2026-04-09 — **Backend implementation complete.** Migration `0124_add_cancelled_fields_to_eventregistration` applied; `cancelled_at` and `cancelled_by` columns added to `organization_eventregistration`. `DELETE /api/projects/{slug}/registrations/` implemented as `EventRegistrationsView.delete()` with atomic soft-delete, ownership guard, start-date guard, and `FULL→OPEN` revert. `POST /registrations/` updated for re-registration paths (self-cancelled → 201, admin-cancelled → 403, already-active → 200). `GET /my_interactions/` extended with `is_registered` (now filters `cancelled_at IS NULL`), `has_attended`, and `admin_cancelled`. All `available_seats` counts updated to filter `cancelled_at__isnull=True`. Backend for admin-cancel (`AdminCancelRegistrationView`) implemented in the same session — see [`20260407_1000_organizer_cancel_guest_registration.md`](./20260407_1000_organizer_cancel_guest_registration.md). **Frontend implementation and tests are pending.** Frontend spec section reviewed and confirmed accurate — no changes required.

## Acceptance Criteria

- [ ] On the event detail page, a registered member sees a **"Cancel registration"** button (replacing the "You are registered" badge + disabled Register button from [#1849](https://github.com/climateconnect/climateconnect/issues/1849)).
- [ ] Clicking "Cancel registration" opens a confirmation modal with the message *"Are you sure you want to cancel your registration for [event title]?"* and buttons "Yes, cancel registration" and "Keep registration".
- [ ] Confirming cancellation soft-deletes the `EventRegistration` record (sets `cancelled_at` to now and `cancelled_by` to the requesting user — the record is retained in the database).
- [ ] After cancellation, the event detail page reverts to showing the "Register" button (if registration is still open) or "Registration closed" (if not).
- [ ] After cancellation, the available seat count on the event detail page increments by 1.
- [ ] After cancellation, if the event's registration status was `FULL`, it reverts to `OPEN` and new members can register again.
- [ ] After cancellation, the event no longer appears in the member's registered events grid on their profile page.
- [ ] After cancellation (by the member themselves), the member can register again for the same event (if registration is still open); re-registration reuses the existing `EventRegistration` record (`cancelled_at` and `cancelled_by` both reset to `NULL` — no duplicate row created).
- [ ] If a member's registration was cancelled by a different user (e.g. a team admin), the re-registration endpoint (`POST /api/projects/{slug}/registrations/`) returns `403 Forbidden` for that member.
- [ ] On the event detail page, a member whose registration was admin-cancelled sees a disabled **"Registration closed"** button — even if the event's registration is still open to other members.
- [ ] `admin_cancelled: true` is returned in `GET /api/projects/{slug}/my_interactions/` when the requesting user has a cancelled registration record where `cancelled_by` is a different user.
- [ ] Once the event's `start_date` has passed, the button area shows a non-interactive **"You attended this event"** label for members who had an **active** registration when the event started.
- [ ] Members who cancelled their registration **before** the event started do **not** see "You attended this event" after the start date passes.
- [ ] The cancellation endpoint returns `403 Forbidden` if the requesting user tries to cancel another member's registration.
- [ ] The cancellation endpoint returns `404 Not Found` if the member is not registered or has already cancelled.
- [ ] The cancellation endpoint returns `400 Bad Request` if the event has already started.
- [ ] `available_seats` count correctly excludes soft-deleted (cancelled) registrations everywhere it is computed.
- [ ] `cancelled_at` and `cancelled_by_id` columns added to `organization_eventregistration` via an additive, non-destructive migration.
- [ ] No breaking changes to existing API contracts.
- [ ] All tests pass (unit, integration, end-to-end).
- [ ] Code review approved.
- [ ] Documentation updated and current.

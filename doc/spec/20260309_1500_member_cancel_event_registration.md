# Member Can Cancel Their Event Registration

**Status**: DRAFT (Reference: [`task-based-development.md`](../for-agents/guides/task-based-development.md))
**Type**: Feature
**Date and time created**: 2026-03-09 15:00
**Date Completed**: TBD
**GitHub Issue**: [#1850](https://github.com/climateconnect/climateconnect/issues/1850)
**Epic**: [EPIC_event_registration.md](./EPIC_event_registration.md)
**Related Specs**:
- [`docs/mosy/architecture_overview.md`](../mosy/architecture_overview.md)
- [`docs/mosy/entities/system-entities.md`](../mosy/entities/system-entities.md)
- [`docs/mosy/flows/core-flows.md`](../mosy/flows/core-flows.md)
- [`docs/tasks/20260309_0900_member_register_for_event.md`](./20260309_0900_member_register_for_event.md) ← introduces `EventParticipant` and the `DELETE /register/` endpoint stub
- [`docs/tasks/20260309_1100_member_see_registered_events.md`](./20260309_1100_member_see_registered_events.md) ← introduces "You are registered" badge + disabled button placeholder

## Problem Statement

A logged-in member who has registered for an upcoming event can cancel their registration directly from the event detail page. After cancellation, their seat becomes available again and the event is removed from their registered events list on their profile.

**Core Requirements (User/Stakeholder Stated):**

- On the event detail page, a registered member sees a **"Cancel registration"** button instead of the "Register" button.
  - This replaces the disabled Register button + "You are registered" badge introduced in [#1849](https://github.com/climateconnect/climateconnect/issues/1849).
- Clicking "Cancel registration" shows a **confirmation step** before the cancellation is processed (e.g. a confirmation modal or inline prompt: *"Are you sure you want to cancel your registration?"*).
- After confirmed cancellation:
  - The `EventParticipant` record is **soft-deleted**: a `cancelled_at` timestamp is set on the record. The record is kept for historical purposes (e.g. future organiser visibility of cancellations).
  - The freed seat is immediately available for other members to register.
  - The event no longer appears in the member's registered events list on their profile page.
  - The member can register again for the same event (if registration is still open). Re-registration **reuses the existing `EventParticipant` record**: `cancelled_at` is reset to `NULL`. No new row is created.
- Once the event's `start_date` has passed, the cancellation button is no longer shown. Instead, the button area shows a non-interactive label **"You attended this event"** to acknowledge the prior registration. This applies to all registered members regardless of whether they actually attended.
- The member does not receive further notifications or reminders for the event after cancellation. If a reminder feature (issue #50) is implemented before this task, it must respect cancellation. If not yet implemented, the reminder task spec must be updated to exclude cancelled registrations — this task's log must note that dependency.

**Explicitly Out of Scope (this iteration):**
- Notifying the event organiser about cancellations.
- The organiser being able to see who cancelled — deferred, but the soft-delete approach in this task preserves the historical record so this can be implemented in a future story without a data migration.
- Cancellation by the organiser on behalf of a member.

### Non Functional Requirements

- The cancellation (deletion of `EventParticipant`) must be **atomic** — the seat count must be restored in the same operation, with no window where the seat is neither occupied nor freed.
- The endpoint must verify that the requesting user owns the registration — a member must not be able to cancel another member's registration (`403 Forbidden`).
- Cancellation is only possible while the event has not yet started. Attempting to cancel a past/ongoing event should return `400 Bad Request` (edge case — the UI can hide the button, but the backend must enforce it).
- No breaking changes to existing APIs.

### AI Agent Insights and Additions

- Task [#1849](https://github.com/climateconnect/climateconnect/issues/1849) introduced a disabled "Register" button as a placeholder for this exact feature. This task activates that button space by replacing the badge + disabled button with the "Cancel registration" button. The `is_registered` field already in the event detail API response (`GET /api/projects/{slug}/`) is sufficient to drive this UI switch — no new API field needed, but `is_registered` must now filter on `cancelled_at IS NULL`.
- The `DELETE /api/projects/{slug}/register/` endpoint was explicitly noted as a future task in [#1845](https://github.com/climateconnect/climateconnect/issues/1845). This task implements it fully as a soft delete.
- **Re-registration** reuses the existing `EventParticipant` row: `cancelled_at` is reset to `NULL`. The `POST /register/` endpoint in [#1845](https://github.com/climateconnect/climateconnect/issues/1845) must be updated accordingly — if a soft-deleted record exists for the user/event pair, update it instead of creating a new row. The unique constraint `UNIQUE(user, event_registration)` stays intact.
- **Soft delete ripple effect**: any query that counts active participants or checks registration status must add `cancelled_at IS NULL` to its filter. Affected places: `available_seats` count in [#1845](https://github.com/climateconnect/climateconnect/issues/1845), `is_registered` check in [#1849](https://github.com/climateconnect/climateconnect/issues/1849), `GET /api/members/me/registered-events/` in [#1849](https://github.com/climateconnect/climateconnect/issues/1849), and the future reminder query in issue #50.
- Reminder notifications (issue #50): the Celery Beat query must filter `EventParticipant.objects.filter(cancelled_at__isnull=True)` to exclude cancelled registrations.

## System impact

- **Actors involved**:
  - `Member`: Cancels their registration for an upcoming event.
  - `System`: Soft-deletes the `EventParticipant` record (sets `cancelled_at`), restoring the available seat count.
- **Actions to implement**:
  - `Member` → `Cancel Event Registration` → `EventParticipant` (soft delete: set `cancelled_at`) + `EventRegistration` (available seat count restored — derived from active participants only)
- **Flows affected**:
  - **New flow — Cancel Event Registration Flow**: Member views event page → clicks "Cancel registration" → confirms → system soft-deletes `EventParticipant` → UI updates.
  - **View Registered Events Flow** ([#1849](https://github.com/climateconnect/climateconnect/issues/1849)): event disappears from the profile grid after cancellation (endpoint must filter `cancelled_at IS NULL`).
- **Entity changes needed**: Yes — `EventParticipant` gains `cancelled_at: DateTimeField (nullable)`. No new entities.
- **Flow changes needed**: Yes — new flow added.
- **Integration changes needed**: No.
- **New specifications required**: New flow for cancellation. `EventParticipant` entity updated in system entities.

## Software Architecture

### API

**Cancel registration (implements the endpoint stubbed in [#1845](https://github.com/climateconnect/climateconnect/issues/1845))**
```
DELETE /api/projects/{slug}/register/
```
- Auth required (`401` if unauthenticated).
- Verifies `request.user` has an active `EventParticipant` record (`cancelled_at IS NULL`) for this event (`404` if not registered or already cancelled).
- Verifies `request.user` owns the registration — no cross-user cancellation (`403` otherwise).
- Verifies the event has not yet started (`400` if `project.start_date <= now`).
- Sets `cancelled_at = now()` on the `EventParticipant` record atomically.
- Returns `204 No Content` on success.

**Extended event detail endpoint (existing)**
```
GET /api/projects/{slug}/
```
- `event_registration.is_registered` must now reflect `cancelled_at IS NULL` — i.e. `true` only if the participant record exists **and** is not cancelled.
- Add `event_registration.has_attended: boolean` — `true` when `project.start_date <= now` AND the user has an `EventParticipant` record (active or cancelled) for this event. Drives the "You attended this event" UI state.
- `available_seats` count must also filter `cancelled_at IS NULL`.

No other API changes.

### Events

None. Cancellation is synchronous. No async side-effects in this iteration (organiser notification is out of scope).

### Frontend

- **Event detail page** — the button area for registered members now has three states, driven by `event_registration` in the API response:

  | Condition | Button area |
  |---|---|
  | `is_registered: true` + event not yet started | **"Cancel registration"** button (active) |
  | `has_attended: true` (event started, user was/is registered) | Non-interactive label **"You attended this event"** |
  | `is_registered: false` + registration open | **"Register"** button (existing behaviour) |
  | `is_registered: false` + registration closed | Disabled **"Registration closed"** button (existing behaviour) |

  - Clicking "Cancel registration" opens a **confirmation modal**:
    - Message: *"Are you sure you want to cancel your registration for [event title]?"*
    - Two buttons: **"Yes, cancel registration"** (calls `DELETE /api/projects/{slug}/register/`) and **"Keep registration"** (dismisses modal).
  - On successful cancellation (`204`):
    - Close the modal.
    - Update the button area to show "Register" (if registration still open) or "Registration closed".
    - The available seat count increments by 1.
  - On error: show an inline error message inside the modal.

### Backend

- **`EventRegistrationViewSet`** (extend existing, introduced in [#1845](https://github.com/climateconnect/climateconnect/issues/1845)):
  - Implement `destroy()` action for `DELETE /api/projects/{slug}/register/`:
    ```python
    def destroy(self, request, slug=None):
        participant = get_object_or_404(
            EventParticipant,
            event_registration__project__slug=slug,
            user=request.user,
            cancelled_at__isnull=True
        )
        if participant.event_registration.project.start_date <= now():
            return Response(status=400)
        participant.cancelled_at = now()
        participant.save(update_fields=["cancelled_at"])
        return Response(status=204)
    ```
  - `available_seats` derivation must be updated everywhere to filter `cancelled_at__isnull=True`.
- **`EventParticipant` model** (extend existing, introduced in [#1845](https://github.com/climateconnect/climateconnect/issues/1845)):
  - Add `cancelled_at = models.DateTimeField(null=True, blank=True, default=None)`.
- **`EventRegistrationViewSet`** — update `create()` / register action ([#1845](https://github.com/climateconnect/climateconnect/issues/1845)) to handle re-registration:
  ```python
  # Instead of get_or_create, use update_or_create:
  participant, created = EventParticipant.objects.update_or_create(
      user=request.user,
      event_registration=event_registration,
      defaults={"cancelled_at": None}
  )
  ```
  - If the record already exists and `cancelled_at IS NULL`: idempotent, return `200 OK` (already registered).
  - If the record exists and `cancelled_at IS NOT NULL`: reset `cancelled_at = NULL`, return `201 Created`.
  - If no record exists: create fresh, return `201 Created`.
- **Django migration**: add `cancelled_at` column to `projects_eventparticipant`.

### Data

- **`projects_eventparticipant`** (extend existing): add `cancelled_at TIMESTAMPTZ NULL DEFAULT NULL`.
- Migration is additive. All existing rows default to `NULL` (i.e. active registrations). No backfill needed.
- One row per `(user, event_registration)` always. Re-registration updates the existing row in-place — the unique constraint is never relaxed.
- Record lifecycle:

  | State | `cancelled_at` |
  |---|---|
  | Active registration | `NULL` |
  | Cancelled | `2026-03-10 10:00` |
  | Re-registered | `NULL` (reset) |

- `available_seats` is derived as `max_participants - COUNT(participants WHERE cancelled_at IS NULL)`.

### Other

- The "Cancel registration" button should use a visually distinct (but not alarming) style — e.g. outlined or secondary, not the same destructive red as a delete action. Exact design TBD with design team.
- The "You attended this event" label is informational only — no interaction. Style TBD with design team.

## Technical Solution Overview

*To be filled by a development agent during the IMPLEMENTATION phase.*

## Log

- 2026-03-09 15:00 — Task created from GitHub issue #1850. Depends on [#1845](https://github.com/climateconnect/climateconnect/issues/1845) (`EventParticipant` entity and `DELETE` endpoint stub) and [#1849](https://github.com/climateconnect/climateconnect/issues/1849) (disabled Register button placeholder replaced here). Organiser cancellation visibility and organiser notification confirmed out of scope for this iteration.
- 2026-03-09 15:30 — Confirmed soft delete over hard delete: `cancelled_at` timestamp added to `EventParticipant`, preserving historical records for future organiser visibility feature. Post-start-date UI state added: "You attended this event" non-interactive label. Soft delete ripple effect documented across [#1845](https://github.com/climateconnect/climateconnect/issues/1845), [#1849](https://github.com/climateconnect/climateconnect/issues/1849), and issue #50.
- 2026-03-09 15:45 — Confirmed re-registration reuses the existing `EventParticipant` row (reset `cancelled_at = NULL`) — no new row created, no extra tracking column. Unique constraint `(user, event_registration)` stays intact. `POST /register/` in [#1845](https://github.com/climateconnect/climateconnect/issues/1845) must be updated to handle this via `update_or_create`.

## Acceptance Criteria

- [ ] On the event detail page, a registered member sees a **"Cancel registration"** button (replacing the "You are registered" badge + disabled Register button from [#1849](https://github.com/climateconnect/climateconnect/issues/1849)).
- [ ] Clicking "Cancel registration" opens a confirmation modal with the message *"Are you sure you want to cancel your registration for [event title]?"* and buttons "Yes, cancel registration" and "Keep registration".
- [ ] Confirming cancellation soft-deletes the `EventParticipant` record (sets `cancelled_at` to now — the record is retained in the database).
- [ ] After cancellation, the event detail page reverts to showing the "Register" button (if registration is still open) or "Registration closed" (if not).
- [ ] After cancellation, the available seat count on the event detail page increments by 1.
- [ ] After cancellation, the event no longer appears in the member's registered events grid on their profile page.
- [ ] After cancellation, the member can register again for the same event (if registration is still open); re-registration reuses the existing `EventParticipant` record (`cancelled_at` reset to `NULL` — no duplicate row created).
- [ ] Once the event's `start_date` has passed, the button area shows a non-interactive **"You attended this event"** label for members who registered (regardless of whether they subsequently cancelled).
- [ ] The cancellation endpoint returns `403 Forbidden` if the requesting user tries to cancel another member's registration.
- [ ] The cancellation endpoint returns `404 Not Found` if the member is not registered or has already cancelled.
- [ ] The cancellation endpoint returns `400 Bad Request` if the event has already started.
- [ ] `available_seats` count correctly excludes soft-deleted (cancelled) participants everywhere it is computed.
- [ ] `cancelled_at` column added to `projects_eventparticipant` via an additive, non-destructive migration.
- [ ] No breaking changes to existing API contracts.
- [ ] All tests pass (unit, integration, end-to-end).
- [ ] Code review approved.
- [ ] Documentation updated and current.


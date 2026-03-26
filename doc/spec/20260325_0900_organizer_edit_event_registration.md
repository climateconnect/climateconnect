# Event Organizer Can Edit an Event with Basic Registration

**Status**: READY FOR IMPLEMENTATION (Reference: [`task-based-development.md`](../for-agents/guides/task-based-development.md))
**Type**: Feature
**Date and time created**: 2026-03-25 09:00
**Date Completed**: TBD
**GitHub Issue**: [#1848](https://github.com/climateconnect/climateconnect/issues/1848)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)  
**Related Specs**:
- [`docs/mosy/architecture_overview.md`](../mosy/architecture_overview.md)
- [`docs/mosy/entities/system-entities.md`](../mosy/entities/system-entities.md)
- [`docs/mosy/flows/core-flows.md`](../mosy/flows/core-flows.md)
- [`docs/tasks/20260305_1000_create_event_with_basic_registration.md`](./20260305_1000_create_event_with_basic_registration.md) ← introduces `EventRegistration` entity and the create flow
- [`docs/tasks/20260309_0900_member_register_for_event.md`](./20260309_0900_member_register_for_event.md) ← introduces `EventParticipant` and registered count
- [`docs/tasks/20260324_0900_organizer_close_event_registration.md`](./20260324_0900_organizer_close_event_registration.md) ← introduces `RegistrationStatus` enum and `status` as single source of truth

## Problem Statement

A user who created an event (or holds an admin role on the event's team) can edit the registration settings of that event after it has been created. In the basic registration scope, only `max_participants` and `registration_end_date` are editable.

**Core Requirements (User/Stakeholder Stated):**

- When editing a project of the **event type** that has registration enabled (`EventRegistration` record exists), the user can see and edit the registration settings.
- Editable fields (basic registration scope):
  - **Maximum number of registrations** (`max_participants`).
  - **Registration end date** (`registration_end_date`).
- The maximum registrations value **cannot be lowered below the number of already-registered guests** (i.e. below the current `EventParticipant` count). This validation is **deferred** — event participant registration (task #44) will not be ready when this task is implemented. A `# TODO` comment must be left in the codebase referencing this requirement.
- The registration end date **cannot be set to a date in the past** and **cannot be set after the event end date**.
- It is **not possible to add event registration** to an event that was created without it. The registration settings section is only shown if `EventRegistration` already exists for the event.
- It is **not possible to completely remove** event registration from an event once it has been enabled.
- **Draft-mode behaviour**: while the project is a draft (`is_draft=true`), **required-field validation and cross-field constraint validation are not enforced** — allowing incomplete registration settings to be saved mid-flow. All validations (`registration_end_date` past-date guard, upper-bound against `end_date`, etc.) are enforced only when the project is published (`is_draft=false`).

**Explicitly Out of Scope (this iteration):**
- Adding registration to an event that was not created with registration.
- Removing/disabling event registration entirely from an existing event.
- Editing the registration status (`open` / `closed`) from the edit page — that is handled by the close/reopen action introduced in task #56.
- Editing registration-related fields beyond `max_participants` and `registration_end_date` (e.g. registration form fields, confirmation email copy).
- Changing the project type from event to another type with special handling for the registration record.

### Non Functional Requirements

- Only a user with **edit rights** on the project (event organizer or team admin) may update registration settings. Regular team members and unauthenticated users must receive `403 Forbidden` and `401 Unauthorized` respectively.
- `registration_end_date` validation must be **timezone-aligned** with `Project.end_date` and `Project.start_date` — consistent with the approach documented in task #43.
- The `max_participants` lower-bound validation (≥ current participant count) is **deferred** to a future task — `EventParticipant` (task #44) will not be available when this task is implemented. The implementation must include a `# TODO` comment in the relevant serializer method, referencing task #44 and this requirement, so it can be activated once task #44 is deployed.
- All cross-field and required-field validations are **skipped when the project is a draft (`is_draft=true`)**. Validations are fully enforced when the project is published (`is_draft=false`). This is consistent with the draft-mode behaviour established in task #43.
- No breaking changes to existing API contracts. Changes to `PATCH /api/projects/{slug}/` are strictly additive (updating a nested `event_registration` object that was already readable).
- The `status` field of `EventRegistration` must **not** be updatable through the edit endpoint — it is managed exclusively via the close/reopen endpoints (task #56).

### AI Agent Insights and Additions

- **No new model or migration needed**: `EventRegistration` (with `max_participants`, `registration_end_date`, and `status`) already exists. This task only adds writable support to the existing `PATCH /api/projects/{slug}/` endpoint for the `event_registration` nested object.
- **`registration_end_date` past-date guard**: the edit endpoint must reject a `registration_end_date` that is ≤ `now()` — unlike the create flow (where the date is in the future by definition), an organizer could accidentally set a past date during an edit.
- **`status` field write-protection**: `EventRegistrationSerializer.update()` must strip or ignore any incoming `status` value — managed exclusively by the close/reopen actions (task #56). Enforced via `read_only_fields` or explicit exclusion in `validate()`.
- **Corner case — project type change**: if a user changes the project `type` from `event` to another type during an edit, the existing `EventRegistration` record should be left intact (not deleted). The frontend should hide the registration settings section for non-event types, matching the create flow behaviour.

## System impact

*To be filled by Archie (mosy-system-architect) during system impact analysis.*

## Software Architecture

### API

**Extended project edit endpoint (existing)**
```
PATCH /api/projects/{slug}/
```
- Auth required (`401` if unauthenticated).
- Requires edit rights on the project (`403` otherwise).
- `event_registration` nested object is now **writable** for event-type projects that already have an `EventRegistration` record:
  ```json
  "event_registration": {
    "max_participants": 80,
    "registration_end_date": "2026-07-01T18:00:00Z"
  }
  ```
- Behaviour:
  - If the project does **not** have an `EventRegistration` record, `event_registration` in the request body is **ignored** (no creation — out of scope).
  - If the project is **not** of type `event`, `event_registration` is ignored.
  - `status` included in `event_registration` payload is silently ignored (read-only via this endpoint).
  - `max_participants` must be ≥ current `EventParticipant` count (if feature available); otherwise `400 Bad Request`.
  - `registration_end_date` must be > `now()` and ≤ `project.end_date`; otherwise `400 Bad Request`.
  - When the project is a draft (`is_draft=true`), cross-field and past-date validations are skipped.
  - Returns `200 OK` with the full updated project payload including the updated `event_registration` object.

**Response shape (no change)**  
`GET /api/projects/{slug}/` already returns `event_registration` (including `status`) — no changes needed for reading.

### Events

None. Registration setting edits are synchronous. No notifications to participants triggered by changes to `max_participants` or `registration_end_date` in this iteration.

### Frontend

- **Event edit page** (organizer/admin view only):
  - The **"Registration settings"** section must only be rendered when **both** of the following are true:
    1. The `EVENT_REGISTRATION` feature toggle is enabled (consistent with the organiser-creation UI in `ShareProjectRoot.tsx` which already checks `isEnabled("EVENT_REGISTRATION")`).
    2. The event project has `event_registration` present (non-null) in the API response.
  - When shown, pre-fill current values:
    - `max_participants` field pre-filled with `event_registration.max_participants`.
    - `registration_end_date` picker pre-filled with `event_registration.registration_end_date`.
  - Validation (client-side, mirrored server-side):
    - `max_participants` must be a positive integer ≥ current participant count (if count is available in the API response; otherwise only enforce > 0).
    - `registration_end_date` must be > today and ≤ event `end_date`.
  - On save, include `event_registration: { max_participants, registration_end_date }` in the `PATCH /api/projects/{slug}/` payload.
  - If `event_registration` is `null` (registration not enabled for this event), **do not render** the registration settings section — and do not provide a way to enable it (out of scope).
  - Corner case: if the user changes the project `type` away from `event`, hide the registration settings section (same behaviour as the create flow). Do not send `event_registration` in the payload when type is not `event`.
  - Error handling: display inline validation errors returned by the backend near the relevant fields.

### Backend

- **`EventRegistration` model**: no changes.

- **`EventRegistrationSerializer`** (extend existing from tasks #43 and #56):
  - Make `max_participants` and `registration_end_date` writable in update context.
  - `status` remains read-only (already enforced from task #56 — verify `validate_status()` or `read_only_fields`).
  - Add/extend `validate()` method:
    ```python
    def validate(self, attrs):
        project = self.instance.project if self.instance else self.context.get("project")
        is_draft = getattr(project, "is_draft", False)

        registration_end_date = attrs.get("registration_end_date", getattr(self.instance, "registration_end_date", None))
        max_participants = attrs.get("max_participants", getattr(self.instance, "max_participants", None))

        if not is_draft:
            # Past-date guard (edit context — on create the date is inherently future)
            if self.instance and registration_end_date and registration_end_date <= timezone.now():
                raise serializers.ValidationError({"registration_end_date": "Registration end date cannot be in the past."})

            # Upper-bound guard: must not exceed event end_date
            project = self.instance.project if self.instance else self.context.get("project")
            if project and registration_end_date and registration_end_date > project.end_date:
                raise serializers.ValidationError({"registration_end_date": "Registration end date must be on or before the event end date."})

        # TODO (task #59 / task #44): once EventParticipant is deployed, enable the lower-bound guard below.
        # participant_count = EventParticipant.objects.filter(event_registration=self.instance).count()
        # if max_participants and max_participants < participant_count:
        #     raise serializers.ValidationError({"max_participants": f"Cannot be lower than the current number of registrations ({participant_count})."})

        return attrs
    ```

- **`ProjectSerializer`** (extend existing):
  - `update()` method: when `event_registration` data is present in validated data and the project already has an `EventRegistration` record, call `EventRegistrationSerializer(instance.event_registration, data=event_registration_data, partial=True, context=context).save()` rather than creating a new record.
  - If no `EventRegistration` exists on the project, silently skip the `event_registration` update (no creation).
  - `status` must not be passed into the `EventRegistrationSerializer` update call — strip it from `event_registration_data` before delegating.
  - Draft-mode skip: when the project is a draft (`is_draft=true`), skip all `event_registration` cross-field validations (consistent with task #43).

- **No Django migration needed** — all columns already exist.

### Data

No schema changes. All relevant columns (`max_participants`, `registration_end_date`, `status`) already exist in `projects_eventregistration` from tasks #43 and #56.

### Other

None.

## Technical Solution Overview

*To be filled by a development agent during the IMPLEMENTATION phase.*

## Log

- 2026-03-25 09:00 — Task created from GitHub issue #59. Builds on task `20260305_1000_create_event_with_basic_registration.md` (issue #43) for the `EventRegistration` entity and edit API patterns. Depends on task `20260309_0900_member_register_for_event.md` (issue #44) for `EventParticipant` count validation and task `20260324_0900_organizer_close_event_registration.md` (issue #56) for `RegistrationStatus` and `status` write-protection. Status: DRAFT — pending user review of problem statement and insights.
- 2026-03-25 09:30 — User confirmed: (1) `max_participants` lower-bound validation is explicitly deferred — task #44 will not be ready; leave `# TODO` comment only. (2) Draft-mode behaviour confirmed as core requirement: all validations skipped when `is_draft=true`, fully enforced on publish (`is_draft=false`). Draft-mode promoted from AI insights to core requirements. Problem statement approved.
- 2026-03-25 09:45 — Specs approved. Status promoted to READY FOR IMPLEMENTATION.
- 2026-03-26 — Frontend section updated: "Registration settings" section in the edit form now explicitly requires the `EVENT_REGISTRATION` feature toggle to be enabled (consistent with `ShareProjectRoot.tsx` pattern and with the member-facing registration UI in task #44). Corresponding acceptance criterion added.

## Acceptance Criteria

- [ ] The "Registration settings" section in the edit form is only rendered when the `EVENT_REGISTRATION` feature toggle is enabled **and** `event_registration` is non-null in the API response.
- [ ] When editing an event with registration enabled, the organizer sees a pre-filled "Registration settings" section showing the current `max_participants` and `registration_end_date`.
- [ ] The organizer can update `max_participants` to any positive integer ≥ the current number of registered participants (if count is available; otherwise ≥ 1).
- [ ] Attempting to set `max_participants` below the current participant count returns `400 Bad Request` with a descriptive error message (conditional on task #44 availability).
- [ ] The organizer can update `registration_end_date` to any future datetime ≤ the event's `end_date`.
- [ ] Attempting to set a `registration_end_date` in the past returns `400 Bad Request`.
- [ ] Attempting to set a `registration_end_date` after the event's `end_date` returns `400 Bad Request`.
- [ ] Saving changes calls `PATCH /api/projects/{slug}/` with an `event_registration` nested object and returns `200 OK` with updated values.
- [ ] The `status` field of `EventRegistration` is **not** modifiable via the edit endpoint — it is ignored if included in the payload.
- [ ] Events that were created **without** registration do not show a registration settings section in the edit form — and no `EventRegistration` record is created via this endpoint.
- [ ] If the project type is changed to a non-event type, the registration settings section is hidden in the frontend and `event_registration` is not submitted in the payload.
- [ ] When the project is a draft (`is_draft=true`), past-date and cross-field validations are skipped (consistent with task #43 draft-mode behaviour).
- [ ] `PATCH /api/projects/{slug}/` returns `401 Unauthorized` for unauthenticated requests.
- [ ] `PATCH /api/projects/{slug}/` returns `403 Forbidden` for users without edit rights on the project.
- [ ] No new Django migration is required — all columns already exist from prior tasks.
- [ ] No breaking changes to existing API contracts.
- [ ] All tests pass (unit, integration, end-to-end).
- [ ] Code review approved.
- [ ] Documentation updated and current.


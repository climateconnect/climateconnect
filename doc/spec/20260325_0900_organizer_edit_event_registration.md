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

- A user who created an event (or holds an admin role on the event's team) can **edit the registration settings of that event via a modal dialog** — not embedded in the edit project form. The modal can be opened from:
  1. The **project detail page**, via an "Edit registration settings" button shown for event-type projects that have `EventRegistration` enabled.
  2. The **registration results page** (future spec — no spec document yet), which provides a dedicated view for registration data.
- The **create project flow** continues to include registration settings inline — this modal approach applies to post-creation editing only.
- Editable fields (basic registration scope):
  - **Maximum number of registrations** (`max_participants`).
  - **Registration end date** (`registration_end_date`).
- The maximum registrations value **cannot be lowered below the number of already-registered guests** (i.e. below the current `EventParticipant` count). This validation is **deferred** — event participant registration ([#1845](https://github.com/climateconnect/climateconnect/issues/1845)) will not be ready when this task is implemented. A `# TODO` comment must be left in the codebase referencing this requirement.
- The registration end date **cannot be set to a date in the past** and **cannot be set after the event end date**.
- It is **not possible to add event registration** to an event that was created without it. The "Edit registration settings" button and modal are only shown if `EventRegistration` already exists for the event.
- It is **not possible to completely remove** event registration from an event once it has been enabled.
- **Draft-mode behaviour**: while the project is a draft (`is_draft=true`), **required-field validation and cross-field constraint validation are not enforced** — allowing incomplete registration settings to be saved mid-flow. All validations (`registration_end_date` past-date guard, upper-bound against `end_date`, etc.) are enforced only when the project is published (`is_draft=false`).

**Explicitly Out of Scope (this iteration):**
- Adding registration to an event that was not created with registration.
- Removing/disabling event registration entirely from an existing event.
- Editing the registration status (`open` / `closed`) via this modal — that is handled by the close/reopen action introduced in [#1851](https://github.com/climateconnect/climateconnect/issues/1851).
- Editing registration-related fields beyond `max_participants` and `registration_end_date` (e.g. registration form fields, confirmation email copy).
- Embedding registration settings editing in the **edit project form** — settings are edited via this dedicated modal and its own endpoint. The create flow (inline in the create form) is unaffected.
- The registration results page (the second modal entry point above) — no spec yet; only the project detail page entry point is in scope for this task.

### Non Functional Requirements

- Only a user with **edit rights** on the project (event organizer or team admin) may update registration settings. Regular team members and unauthenticated users must receive `403 Forbidden` and `401 Unauthorized` respectively.
- `registration_end_date` validation must be **timezone-aligned** with `Project.end_date` and `Project.start_date` — consistent with the approach documented in [#1820](https://github.com/climateconnect/climateconnect/issues/1820).
- The `max_participants` lower-bound validation (≥ current participant count) is **deferred** to a future task — `EventParticipant` ([#1845](https://github.com/climateconnect/climateconnect/issues/1845)) will not be available when this task is implemented. The implementation must include a `# TODO` comment in the relevant serializer method, referencing [#1845](https://github.com/climateconnect/climateconnect/issues/1845) and this requirement, so it can be activated once [#1845](https://github.com/climateconnect/climateconnect/issues/1845) is deployed.
- All cross-field and required-field validations are **skipped when the project is a draft (`is_draft=true`)**. Validations are fully enforced when the project is published (`is_draft=false`). This is consistent with the draft-mode behaviour established in [#1820](https://github.com/climateconnect/climateconnect/issues/1820).
- This task introduces a **new dedicated endpoint** (`PATCH /api/projects/{slug}/registration/`). Existing endpoints are not modified — no breaking changes to any existing API contract.
- The `status` field of `EventRegistration` must **not** be updatable through this endpoint — it is managed exclusively via the close/reopen endpoints ([#1851](https://github.com/climateconnect/climateconnect/issues/1851)).

### AI Agent Insights and Additions

- **No new model or migration needed**: `EventRegistration` (with `max_participants`, `registration_end_date`, and `status`) already exists. This task introduces a new dedicated `PATCH /api/projects/{slug}/registration/` endpoint that operates directly on the `EventRegistration` object — no changes to the project PATCH endpoint.
- **`registration_end_date` past-date guard**: the edit endpoint must reject a `registration_end_date` that is ≤ `now()` — unlike the create flow (where the date is in the future by definition), an organizer could accidentally set a past date during an edit.
- **`status` field write-protection**: `EventRegistrationSerializer.update()` must strip or ignore any incoming `status` value — managed exclusively by the close/reopen actions ([#1851](https://github.com/climateconnect/climateconnect/issues/1851)). Enforced via `read_only_fields` or explicit exclusion in `validate()`.
- **Corner case — project type change**: if a user changes the project `type` from `event` to another type via the edit form, the existing `EventRegistration` record should be left intact (not deleted). The "Edit registration settings" button on the detail page should not be shown for non-event type projects.

## System impact

*To be filled by Archie (mosy-system-architect) during system impact analysis.*

## Software Architecture

### API

**New dedicated registration settings endpoint**
```
PATCH /api/projects/{slug}/registration/
```
- Auth required (`401` if unauthenticated).
- Requires edit rights on the project (`403` otherwise).
- Updates `max_participants` and/or `registration_end_date` on the existing `EventRegistration` record.
- Request body:
  ```json
  {
    "max_participants": 80,
    "registration_end_date": "2026-07-01T18:00:00Z"
  }
  ```
- Behaviour:
  - If the project does **not** have an `EventRegistration` record, returns `404 Not Found`.
  - `status` included in the request body is silently ignored (read-only via this endpoint).
  - `max_participants` must be ≥ current `EventParticipant` count (if feature available); otherwise `400 Bad Request`.
  - `registration_end_date` must be > `now()` and ≤ `project.end_date`; otherwise `400 Bad Request`.
  - When the project is a draft (`is_draft=true`), cross-field and past-date validations are skipped.
  - Returns `200 OK` with the updated `event_registration` object.

**Response shape**
```json
{
  "max_participants": 80,
  "registration_end_date": "2026-07-01T18:00:00Z",
  "status": "open"
}
```

**Existing endpoints — no changes**
`GET /api/projects/{slug}/` already returns `event_registration` (including `status`) and is unchanged. `PATCH /api/projects/{slug}/` is unchanged — `event_registration` remains read-only within the project payload (create flow is handled separately).

### Events

None. Registration setting edits are synchronous. No notifications to participants triggered by changes to `max_participants` or `registration_end_date` in this iteration.

### Frontend

- **"Edit registration settings" button** — shown on the **project detail page** only when **all** of the following are true:
  1. The `EVENT_REGISTRATION` feature toggle is enabled (`isEnabled("EVENT_REGISTRATION")` — consistent with `ShareProjectRoot.tsx`).
  2. The project is of event type.
  3. The project has `event_registration` present (non-null) in the API response.
  4. The viewing user has edit rights (organizer or team admin).
  - Clicking the button opens the **Edit Registration Settings modal**.
  - *(Future)* The same button will also be accessible from the registration results page — no spec for that page yet.

- **Edit Registration Settings modal**:
  - Pre-fill current values on open:
    - `max_participants` field pre-filled with `event_registration.max_participants`.
    - `registration_end_date` picker pre-filled with `event_registration.registration_end_date`.
  - Editable fields: `max_participants` (positive integer) and `registration_end_date` (datetime picker).
  - Client-side validation (mirrored server-side):
    - `max_participants` must be a positive integer ≥ current participant count (if count is available; otherwise > 0).
    - `registration_end_date` must be > today and ≤ event `end_date`.
  - On save, call `PATCH /api/projects/{slug}/registration/` with `{ max_participants, registration_end_date }`.
  - On success (`200 OK`): close modal, update the displayed registration settings on the detail page.
  - On error: display inline validation errors near the relevant fields without closing the modal.
  - Cancel / close dismisses the modal without saving.

### Backend

- **`EventRegistration` model**: no changes.

- **`EventRegistrationSerializer`** (extend existing from [#1820](https://github.com/climateconnect/climateconnect/issues/1820) and [#1851](https://github.com/climateconnect/climateconnect/issues/1851)):
  - Make `max_participants` and `registration_end_date` writable in update context.
  - `status` remains read-only (already enforced from [#1851](https://github.com/climateconnect/climateconnect/issues/1851) — verify `validate_status()` or `read_only_fields`).
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

        # TODO ([#1848](https://github.com/climateconnect/climateconnect/issues/1848) / [#1845](https://github.com/climateconnect/climateconnect/issues/1845)): once EventParticipant is deployed, enable the lower-bound guard below.
        # participant_count = EventParticipant.objects.filter(event_registration=self.instance).count()
        # if max_participants and max_participants < participant_count:
        #     raise serializers.ValidationError({"max_participants": f"Cannot be lower than the current number of registrations ({participant_count})."})

        return attrs
    ```

- **New view — `EventRegistrationSettingsView`** (or a `partial_update` action on `EventRegistrationViewSet`):
  - Handles `PATCH /api/projects/{slug}/registration/`.
  - Looks up the project by `slug`, then accesses `project.event_registration`.
  - Returns `404` if `event_registration` does not exist.
  - Applies `IsProjectEditor` (or equivalent) permission class.
  - Delegates to `EventRegistrationSerializer(instance, data=request.data, partial=True, context={...}).save()`.

- **`organization/urls.py`**: add URL pattern for `PATCH /api/projects/{slug}/registration/`.

- **`ProjectSerializer`**: no changes — `event_registration` remains read-only within the project payload.

- **No Django migration needed** — all columns already exist.

### Data

No schema changes. All relevant columns (`max_participants`, `registration_end_date`, `status`) already exist in `projects_eventregistration` from [#1820](https://github.com/climateconnect/climateconnect/issues/1820) and [#1851](https://github.com/climateconnect/climateconnect/issues/1851).

### Other

None.

## Technical Solution Overview

*To be filled by a development agent during the IMPLEMENTATION phase.*

## Log

- 2026-03-25 09:00 — Task created from GitHub issue [#1848](https://github.com/climateconnect/climateconnect/issues/1848). Builds on [#1820](https://github.com/climateconnect/climateconnect/issues/1820) for the `EventRegistration` entity and edit API patterns. Depends on [#1845](https://github.com/climateconnect/climateconnect/issues/1845) for `EventParticipant` count validation and [#1851](https://github.com/climateconnect/climateconnect/issues/1851) for `RegistrationStatus` and `status` write-protection. Status: DRAFT — pending user review of problem statement and insights.
- 2026-03-25 09:30 — User confirmed: (1) `max_participants` lower-bound validation is explicitly deferred — [#1845](https://github.com/climateconnect/climateconnect/issues/1845) will not be ready; leave `# TODO` comment only. (2) Draft-mode behaviour confirmed as core requirement: all validations skipped when `is_draft=true`, fully enforced on publish (`is_draft=false`). Draft-mode promoted from AI insights to core requirements. Problem statement approved.
- 2026-03-25 09:45 — Specs approved. Status promoted to READY FOR IMPLEMENTATION.
- 2026-03-26 — Frontend section updated: "Registration settings" section in the edit form now explicitly requires the `EVENT_REGISTRATION` feature toggle to be enabled (consistent with `ShareProjectRoot.tsx` pattern and with the member-facing registration UI in [#1845](https://github.com/climateconnect/climateconnect/issues/1845)). Corresponding acceptance criterion added.
- 2026-03-26 — Architectural refinement: registration settings editing moved out of the edit project form into a **dedicated modal**. Entry points: (1) project detail page button (event type + registration enabled), (2) registration results page (future — no spec yet). A new dedicated `PATCH /api/projects/{slug}/registration/` endpoint introduced; `PATCH /api/projects/{slug}/` is no longer modified by this task. `ProjectSerializer` changes removed. Create flow (inline in create form) unchanged. Spec sections updated: Core Requirements, Out of Scope, NFRs, AI Insights, API, Frontend, Backend, Data, Acceptance Criteria.

## Acceptance Criteria

- [ ] On the project detail page, an **"Edit registration settings"** button is shown only when the `EVENT_REGISTRATION` feature toggle is enabled, the project is of event type, `event_registration` is non-null in the API response, and the user has edit rights.
- [ ] Clicking the button opens a modal pre-filled with the current `max_participants` and `registration_end_date` values.
- [ ] The organizer can update `max_participants` to any positive integer ≥ the current number of registered participants (if count is available; otherwise ≥ 1).
- [ ] Attempting to set `max_participants` below the current participant count returns `400 Bad Request` with a descriptive error message (conditional on [#1845](https://github.com/climateconnect/climateconnect/issues/1845) availability).
- [ ] The organizer can update `registration_end_date` to any future datetime ≤ the event's `end_date`.
- [ ] Attempting to set a `registration_end_date` in the past returns `400 Bad Request`.
- [ ] Attempting to set a `registration_end_date` after the event's `end_date` returns `400 Bad Request`.
- [ ] Saving changes calls `PATCH /api/projects/{slug}/registration/` and returns `200 OK` with updated `event_registration` values; the modal closes and the detail page reflects the new values.
- [ ] On error, inline validation errors are shown near the relevant fields without closing the modal.
- [ ] The `status` field of `EventRegistration` is **not** modifiable via this endpoint — it is ignored if included in the payload.
- [ ] Events created **without** registration do not show the "Edit registration settings" button — and no `EventRegistration` record is created via this endpoint.
- [ ] `PATCH /api/projects/{slug}/registration/` returns `404 Not Found` when no `EventRegistration` record exists for the project.
- [ ] When the project is a draft (`is_draft=true`), past-date and cross-field validations are skipped (consistent with [#1820](https://github.com/climateconnect/climateconnect/issues/1820) draft-mode behaviour).
- [ ] `PATCH /api/projects/{slug}/registration/` returns `401 Unauthorized` for unauthenticated requests.
- [ ] `PATCH /api/projects/{slug}/registration/` returns `403 Forbidden` for users without edit rights on the project.
- [ ] `PATCH /api/projects/{slug}/` (existing project endpoint) behaviour is unchanged — no breaking changes.
- [ ] No new Django migration is required — all columns already exist from prior tasks.
- [ ] All tests pass (unit, integration, end-to-end).
- [ ] Code review approved.
- [ ] Documentation updated and current.


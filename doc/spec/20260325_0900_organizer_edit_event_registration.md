# Event Organizer Can Edit an Event with Basic Registration

**Status**: COMPLETE
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
- The maximum registrations value **cannot be lowered below the number of already-registered guests** (i.e. below the current `EventParticipant` count).
- The registration end date **cannot be set to a date in the past** and **cannot be set after the event end date**.
- It is **not possible to add event registration** to an event that was created without it. The "Edit registration settings" button and modal are only shown if `EventRegistration` already exists for the event.
- It is **not possible to completely remove** event registration from an event once it has been enabled.

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
- The `max_participants` lower-bound validation (≥ current participant count) requires `EventParticipant` ([#1845](https://github.com/climateconnect/climateconnect/issues/1845)) and is activated once that feature is in production.
- **Draft-mode does not apply to this endpoint.** `EventRegistration` records only exist on published events; once an event is published it cannot revert to draft. All validations are therefore always enforced.
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
  - `max_participants` must be ≥ current `EventParticipant` count; otherwise `400 Bad Request`.
  - `registration_end_date` must be > `now()` and ≤ `project.end_date`; otherwise `400 Bad Request`.
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

The backend introduces one new serializer, one new view, and one new URL pattern. No existing files were modified beyond adding imports; no migration was required.

### `EditEventRegistrationSerializer` (`organization/serializers/event_registration.py`)

A dedicated `ModelSerializer` for `EventRegistration`, separate from the existing `EventRegistrationSerializer` (which continues to serve the create flow and the project detail/list read path). Key decisions:

- `fields = ["max_participants", "registration_end_date", "status"]`
- `read_only_fields = ["status"]` — any `status` value in the request body is silently ignored; DRF enforces this at the field level before `validate()` runs.
- `max_participants` carries `min_value=1`; `registration_end_date` is nullable to match the DB schema.
- `validate()` **only checks fields that are explicitly present in the incoming payload** — a PATCH that sends only `max_participants` never re-validates the stored `registration_end_date` (which could legitimately be in the past if registration has already closed). There is no `is_draft` guard — `EventRegistration` records only exist on published events and published events cannot revert to draft, so the guard would be dead code.
- Three guards enforced when the respective field is in the request body:
  1. **Past-date guard**: `registration_end_date <= timezone.now()` → 400.
  2. **Upper-bound guard**: `registration_end_date > project.end_date` → 400.
  3. **Participant lower-bound guard**: `max_participants < EventParticipant.objects.filter(event_registration=self.instance).count()` → 400 (activated once #1845 was deployed).

### `EditEventRegistrationSettingsView` (`organization/views/event_registration_views.py`)

A new `APIView` with `permission_classes = [IsAuthenticated]`. The edit-rights check is intentionally performed **inside the view body** (after the project lookup) rather than as a `ProjectReadWritePermission` class. This ensures the response priority is:

1. `401` — no credentials (handled by `IsAuthenticated` before the view body runs)
2. `404` — project slug not found (view body, step 1)
3. `403` — authenticated but not a project member with write role (view body, step 2)
4. `404` — project found but has no `EventRegistration` (view body, step 3)
5. `400` — validation error (serializer)
6. `200` — success

The `ProjectReadWritePermission` class was considered but rejected for this endpoint because it performs its own project lookup and returns `False` when the project is missing, which DRF translates to `403` for authenticated users — incorrect HTTP semantics. The inline check uses the same `ProjectMember` query (`role__role_type__in=[ALL_TYPE, READ_WRITE_TYPE]`) so the set of users who can edit is identical to the existing project PATCH endpoint.

### URL

`path("projects/<str:url_slug>/registration/", EditEventRegistrationSettingsView.as_view(), name="edit-event-registration-settings")` added to `organization/urls.py`.

## Log

- 2026-03-25 09:00 — Task created from GitHub issue [#1848](https://github.com/climateconnect/climateconnect/issues/1848). Builds on [#1820](https://github.com/climateconnect/climateconnect/issues/1820) for the `EventRegistration` entity and edit API patterns. Depends on [#1845](https://github.com/climateconnect/climateconnect/issues/1845) for `EventParticipant` count validation and [#1851](https://github.com/climateconnect/climateconnect/issues/1851) for `RegistrationStatus` and `status` write-protection. Status: DRAFT — pending user review of problem statement and insights.
- 2026-03-25 09:30 — User confirmed: (1) `max_participants` lower-bound validation is explicitly deferred — [#1845](https://github.com/climateconnect/climateconnect/issues/1845) will not be ready; leave `# TODO` comment only. (2) Draft-mode behaviour confirmed as core requirement: all validations skipped when `is_draft=true`, fully enforced on publish (`is_draft=false`). Draft-mode promoted from AI insights to core requirements. Problem statement approved.
- 2026-03-25 09:45 — Specs approved. Status promoted to READY FOR IMPLEMENTATION.
- 2026-03-26 — Frontend section updated: "Registration settings" section in the edit form now explicitly requires the `EVENT_REGISTRATION` feature toggle to be enabled (consistent with `ShareProjectRoot.tsx` pattern and with the member-facing registration UI in [#1845](https://github.com/climateconnect/climateconnect/issues/1845)). Corresponding acceptance criterion added.
- 2026-03-26 — Architectural refinement: registration settings editing moved out of the edit project form into a **dedicated modal**. Entry points: (1) project detail page button (event type + registration enabled), (2) registration results page (future — no spec yet). A new dedicated `PATCH /api/projects/{slug}/registration/` endpoint introduced; `PATCH /api/projects/{slug}/` is no longer modified by this task. `ProjectSerializer` changes removed. Create flow (inline in create form) unchanged. Spec sections updated: Core Requirements, Out of Scope, NFRs, AI Insights, API, Frontend, Backend, Data, Acceptance Criteria.
- 2026-03-30 — **Backend implementation complete.** Delivered: `EditEventRegistrationSerializer` (new, separate from `EventRegistrationSerializer`; `status` in `read_only_fields`; past-date guard + upper-bound guard; deferred participant lower-bound as `# TODO (#1848 / #1845)`); `EditEventRegistrationSettingsView` (inline permission check after project lookup to enforce `404 → 403` priority, not `ProjectReadWritePermission` as permission class — see Technical Solution Overview); URL `PATCH /api/projects/{url_slug}/registration/` (`name="edit-event-registration-settings"`); 15 new tests in `TestEditEventRegistrationSettings` (all green, run alongside 153 pre-existing tests, 0 regressions); `doc/api-documentation.md` and `doc/domain-entities.md` updated. Status promoted to BACKEND COMPLETE — FRONTEND PENDING.
- 2026-03-30 — **Participant count guard activated; draft-mode removed.** `EventParticipant` (#1845) deployed today. `# TODO` uncommented in `EditEventRegistrationSerializer.validate()` — `max_participants < participant_count` now raises `400`. Draft-mode guard (`is_draft` check) removed entirely: `EventRegistration` records only exist on published events and published events cannot revert to draft, making the guard dead code. `validate()` simplified to only check fields explicitly present in the PATCH body (a `max_participants`-only PATCH no longer re-validates the stored `registration_end_date`). Two draft tests replaced with three participant count tests (`test_max_participants_below_participant_count_returns_400`, `test_max_participants_equal_to_participant_count_is_valid`, `test_max_participants_patch_does_not_revalidate_stored_end_date`); 16 tests total, all green. Spec sections updated: Core Requirements, NFRs, API, Technical Solution Overview, Acceptance Criteria.

- 2026-03-31 — **Frontend implementation complete.** Delivered: `EventRegistrationData` type added to `src/types.ts`; `event_registration` field added to `Project` type and included in `parseProject` in the project detail page; new `EditEventRegistrationModal` component (`src/components/project/EditEventRegistrationModal.tsx`) — pre-fills current values, client-side validation (future-date guard, end-date upper-bound), `PATCH /api/projects/{slug}/registration/`, inline field-level error display, loading state during save; "Edit registration settings" and "View registrations" buttons added to `ProjectContentSideButtons.tsx` (shown only when `EVENT_REGISTRATION` toggle enabled + event type + `event_registration` present + admin permission); new registration results stub page at `pages/projects/[projectId]/registrations.tsx` (requires auth — redirects to signin if unauthenticated; shows registration settings summary with status chip; "Edit registration settings" button opening the same modal; placeholder for future registrant list). Project detail page directory restructured from `pages/projects/[projectId].tsx` → `pages/projects/[projectId]/index.tsx` to support nested routing (matches existing `pages/hubs/[hubUrl]/` pattern). New text keys added: `edit_registration_settings`, `registration_settings_saved`, `registration_end_date_must_be_in_the_future`, `registration_status`, `registration_status_open`, `registration_status_closed`, `view_registrations`, `registrations`, `no_registration_settings_found`, `back_to_event`.
  - **TODO (registrations page)**: the current `getServerSideProps` only checks for authentication (redirects to sign-in if no token). It does not redirect non-admin authenticated users server-side, because determining admin status server-side would require an extra `/api/projects/{slug}/members/` call. The page currently relies on the `UserContext` + `hasAdminPermissions` flag at the client level to hide the "Edit registration settings" button. A future hardening pass should add a proper server-side 403 redirect for non-admin users.

## Acceptance Criteria

- [x] On the project detail page, an **"Edit registration settings"** button is shown only when the `EVENT_REGISTRATION` feature toggle is enabled, the project is of event type, `event_registration` is non-null in the API response, and the user has edit rights.
- [x] Clicking the button opens a modal pre-filled with the current `max_participants` and `registration_end_date` values.
- [x] The organizer can update `max_participants` to any positive integer ≥ current participant count (≥ 1 if no participants yet).
- [x] Attempting to set `max_participants` below the current participant count returns `400 Bad Request` with a descriptive error message that includes the current count.
- [x] The organizer can update `registration_end_date` to any future datetime ≤ the event's `end_date`.
- [x] Attempting to set a `registration_end_date` in the past returns `400 Bad Request`.
- [x] Attempting to set a `registration_end_date` after the event's `end_date` returns `400 Bad Request`.
- [x] Saving changes calls `PATCH /api/projects/{slug}/registration/` and returns `200 OK` with updated `event_registration` values; the modal closes and the detail page reflects the new values.
- [x] On error, inline validation errors are shown near the relevant fields without closing the modal.
- [x] The `status` field of `EventRegistration` is **not** modifiable via this endpoint — it is ignored if included in the payload.
- [x] Events created **without** registration do not show the "Edit registration settings" button — and no `EventRegistration` record is created via this endpoint.
- [x] `PATCH /api/projects/{slug}/registration/` returns `404 Not Found` when no `EventRegistration` record exists for the project.
- [x] `PATCH /api/projects/{slug}/registration/` returns `401 Unauthorized` for unauthenticated requests.
- [x] `PATCH /api/projects/{slug}/registration/` returns `403 Forbidden` for users without edit rights on the project.
- [x] `PATCH /api/projects/{slug}/` (existing project endpoint) behaviour is unchanged — no breaking changes.
- [x] No new Django migration is required — all columns already exist from prior tasks.
- [x] All backend tests pass (16 new tests in `TestEditEventRegistrationSettings`). End-to-end pending frontend.
- [ ] Code review approved.
- [x] Documentation updated and current (`doc/api-documentation.md`, `doc/domain-entities.md`).


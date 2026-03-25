# Create an Event with Basic Registration

**Status**: IMPLEMENTATION (Reference: [`task-based-development.md`](../guides/task-based-development.md))
**Type**: Feature
**Date and time created**: 2026-03-05 10:00
**Date Completed**: TBD
**Related GitHub Issue**: #43 - [STORY] Create an event with basic registration
**Related Specs**:
- [`docs/mosy/architecture_overview.md`](../mosy/architecture_overview.md)
- [`docs/mosy/entities/system-entities.md`](../mosy/entities/system-entities.md)
- [`docs/mosy/flows/core-flows.md`](../mosy/flows/core-flows.md)

## Problem Statement

When creating a new event on the platform, a member should be able to enable basic online registration for that event. This allows Climate Connect users to sign up for events directly on the platform.

**Core Requirements (User/Stakeholder Stated):**

- In the project create flow (event type only), there is a new dedicated step called **"Registration"** where the user can toggle event registration on or off.
  - The toggle is presented as a switch with the label: *"Allow members to register online for the event"*.
  - When the toggle is **enabled**, a help text is shown: *"In the next step you can configure the event registration."*.
- On the **Details step**, below the website section, a new **"Registration settings"** section is added (visible when registration is enabled), containing:
  - A **required** field for the **maximum number of guests** (number field, value must be > 0).
  - A **required** field for the **end of registration** using a date-time picker (consistent with the existing end-of-event date-time picker).
- Registration opens when the event is published — no optional start date for registration in this iteration (noted as nice-to-have/future improvement).
- Changes to the event creation notification (e.g. highlighting that registration is available) are **explicitly out of scope** for this story.
- Editing registration settings on an existing event is **explicitly out of scope** — this will be handled in a separate task.

### Non Functional Requirements

- The new `EventRegistration` (or equivalent) settings must be persisted in the database linked to the `Project` of type event.
- The API must expose the registration settings (max guests, end of registration) as part of the event project data.
- All new API fields must be additive — no breaking changes to the existing project API contract.
- The date-time picker for end of registration must be consistent with the existing end-of-event date-time picker (shared component or same design/behaviour).
- The registration step and settings section must only appear for projects of type **event** — not for projects of type project or idea.
- The end-of-registration date must be validated to be before or equal to the event's end date.
- When the registration toggle is disabled (after having been enabled), any values entered in the registration settings fields are discarded — the fields are cleared and not submitted.
- Align `registration_end_date` timezone handling with how `Project.start_date` / `end_date` are currently stored and handled (timezone-aware TIMESTAMPTZ vs. naive datetime). The date-time picker UI and the `≤ end_date` validation must be consistent with the existing event date fields. Document the outcome in the Technical Solution Overview. (browser uses timezone of the vistor, backend stores in UTC)
- Implement behind a feature toggle in the frontend to allow gradual rollout along with related features and testing.

### AI Agent Insights and Additions

None.

## System impact

- **Actors involved**:
  - `Member` / `Organization`: Creates a new event and optionally enables registration settings.
- **Actions to implement**:
  - `Member` → `Create Event` → `Project` + `EventRegistration` *(new: submit registration settings when toggle is on)*
- **Flows affected**:
  - **Flow 2 — Project/Event/Idea Creation Flow**: Extended for event type only. A new "Registration" step is inserted before "Details". When registration is enabled, the Details step gains a "Registration settings" section. On submit, an `EventRegistration` record is created alongside the `Project`.
- **Entity changes needed**: Yes
  - `EventRegistration` (new entity): `max_participants: Integer`, `registration_end_date: DateTime`, linked 1-to-1 to `Project`. Presence of this record is the source of truth for whether registration is enabled — no separate boolean flag on `Project` is needed.
- **Flow changes needed**: Yes — Flow 2 extended as described above.
- **Integration changes needed**: No.
- **New specifications required**: None — changes are confined to existing flow and one new entity.

## Software Architecture

### API

Extended existing project create endpoint only. No new endpoints.

- `POST /api/projects/` — request body gains an optional nested `event_registration` object:
  ```json
  "event_registration": {
    "max_participants": 100,
    "registration_end_date": "2026-06-01T23:59:00Z"
  }
  ```
  - Only valid when project `type` is `event`. Must be ignored (or rejected with 400) for other project types.
  - When `event_registration` is present, both `max_participants` and `registration_end_date` are required.
  - `registration_end_date` must be ≤ `end_date` of the project (validated server-side).
  - When `event_registration` is absent (toggle off), no `EventRegistration` record is created.
- `GET /api/projects/{slug}/` — response gains `event_registration: object | null` in the project payload.
- `GET /api/projects/` (list) — `event_registration` included in each item (null for non-events or events without registration).

No breaking changes. All additions are additive.

### Events

None. No async events are triggered by this change.

### Frontend

- **Create form (event type only)**:
  - Insert a new **"Registration"** step in the create flow wizard (between existing steps) when selected type is 'event'.
  - Step contains a MUI `Switch` labelled *"Allow members to register online for the event"*.
  - When switch is on: show help text *"In the next step you can configure the event registration."*; set local state `registrationEnabled = true`.
  - When switch is toggled off after being on: clear `maxParticipants` and `registrationEndDate` from form state — do not submit these values.
  - On the **Details step**, when `registrationEnabled === true`, render a "Registration settings" section below the website field:
    - Number input for max. guests (required, min value 1).
    - Date-time picker for end of registration (required; reuse existing end-of-event date-time picker component; validate ≤ event end date — client-side + server-side).
  - On form submit, include `event_registration` payload only when `registrationEnabled === true`.
  - The Registration step and settings section must not render for project or idea types.
  - When using the feature toggle, keep the old implementation fully functional and only enable the new implementation when the feature is enabled. Some code duplication for the limited time period that the toggle is being used is acceptable.

### Backend

- **`EventRegistration` model** (new):
  ```python
  class EventRegistration(models.Model):
      project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name="event_registration")
      max_participants = models.PositiveIntegerField()
      registration_end_date = models.DateTimeField()
  ```
- **`EventRegistrationSerializer`** (new): serializes `max_participants` and `registration_end_date`.
- **`ProjectSerializer`**: include `event_registration` as a nested serializer field (read/write); handle creation of `EventRegistration` in `create()`.
- **Validation**: In `ProjectSerializer.validate()`, when `event_registration` is present: assert `project.type == "event"` and `registration_end_date <= project.end_date`.
- **Django migration**: create `projects_eventregistration` table.

### Data

- **New table**: `projects_eventregistration`
  - `id`: SERIAL PRIMARY KEY
  - `project_id`: INTEGER NOT NULL UNIQUE — FK → `projects_project.id` ON DELETE CASCADE
  - `max_participants`: INTEGER NOT NULL CHECK (max_participants > 0)
  - `registration_end_date`: TIMESTAMPTZ NOT NULL
  - ⚠️ **Note**: use TIMESTAMPTZ only if `Project.end_date` is also timezone-aware. Developer must verify and align with the existing schema before implementing the migration.
- Migration is additive and non-destructive. Existing projects are unaffected (no backfill needed).

### Other

None.

## Technical Solution Overview
[To be filled by a development agent]

## Log
- 2026-03-05 10:00 - Task created from GitHub issue #43. Branch: `create_event_with_basic_registration`. Handing off for system impact analysis.
- 2026-03-05 10:15 - Problem statement reviewed and approved. Validation (end-of-registration ≤ event end date) and toggle-discard behaviour promoted to NFRs. Edit form and registration count tracking confirmed out of scope. Handing off to Archie for system impact analysis.
- 2026-03-05 10:30 - Archie: System impact analysis complete. New `EventRegistration` entity (1-to-1 with `Project`) chosen over nullable fields on `Project`. Nested `event_registration` object on existing project API (no new endpoints). Flow 2 extended for event type. Entity model and core-flows updated. Awaiting user review before updating system specs.
- 2026-03-05 10:45 - Timezone handling not documented in system specs. Open question added to NFRs, Data section, and acceptance criteria — developer to align `registration_end_date` with existing `Project.end_date` timezone approach and document the outcome.
- 2026-03-05 11:00 - Task approved. Status promoted to IMPLEMENTATION.

## Acceptance Criteria

- [ ] When creating a new project of type **event**, the create flow includes a new step called "Registration".
- [ ] The Registration step contains a switch labelled *"Allow members to register online for the event"*.
- [ ] When the switch is enabled, a help text reads *"In the next step you can configure the event registration."*
- [ ] On the Details step, when registration is enabled, a "Registration settings" section appears below the website section.
- [ ] The "Registration settings" section contains a required number field for max. number of guests (value > 0).
- [ ] The "Registration settings" section contains a required date-time picker for end of registration (consistent with the end-of-event date-time picker).
- [ ] Both registration settings fields are validated as required before the form can be submitted.
- [ ] The end-of-registration date is validated to be before or equal to the event's end date.
- [ ] ⚠️ Timezone handling for `registration_end_date` is aligned with `Project.end_date` — approach documented in the Technical Solution Overview.
- [ ] When the registration toggle is disabled after values have been entered, those values are discarded and the fields are cleared.
- [ ] The Registration step and settings are only shown for event type projects, not for other project types.
- [ ] The registration configuration is persisted in the database and returned via the project/event API.
- [ ] No breaking changes to the existing project API contract.
- [ ] Notification for event creation is not changed (explicitly out of scope).
- [ ] All tests pass (unit, integration, end-to-end)
- [ ] Code review approved
- [ ] Documentation updated and current
- [ ] The feature is hidden behind a feature toggle and can be tested locally and on staging.


# Member Registers for an Event with Custom Fields (Phase 4a — Registrant)

**Status**: COMPLETED
**Type**: Feature
**Date and time created**: 2026-05-12 10:15
**GitHub Issue**: [#1960](https://github.com/climateconnect/climateconnect/issues/1960)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260416_1000_event_registration_custom_fields.md`](./20260416_1000_event_registration_custom_fields.md) ← create-side custom field definitions and organiser UI
- [`20260512_0725_edit_event_registration_custom_fields.md`](./20260512_0725_edit_event_registration_custom_fields.md) ← edit-side follow-up; depends on answer storage introduced here
- [`20260430_0936_guest_event_registration_auth_integration.md`](./20260430_0936_guest_event_registration_auth_integration.md) ← existing modal auth flow reused here
- [`20260415_0900_improve_event_registration_ux.md`](./20260415_0900_improve_event_registration_ux.md) ← current modal UX baseline
- [`doc/mosy/architecture_overview.md`](../mosy/architecture_overview.md)
- [`doc/mosy/entities/system-entities.md`](../mosy/entities/system-entities.md)
- [`doc/mosy/flows/core-flows.md`](../mosy/flows/core-flows.md)

**Unblocks**:
- [#1961](https://github.com/climateconnect/climateconnect/issues/1961) — edit custom fields after registrations exist
- [#1962](https://github.com/climateconnect/climateconnect/issues/1962) — export registration results with custom field data
- [#1963](https://github.com/climateconnect/climateconnect/issues/1963) — display custom field answers in organiser registration views

---

## Problem Statement

The organiser-side custom-field builder already lets event organisers define up to 5 custom registration fields on an event (checkbox and single-select option fields). However, the public registration flow still only supports a bare confirmation step. Registrants cannot see those fields, cannot provide the requested information, and the platform cannot persist it.

This task completes Phase 4a of the event registration custom-fields rollout by extending the existing event registration flow so a member can answer the configured custom fields when registering for an event. It builds on the current `EventRegistrationModal` and the existing `POST /api/projects/{slug}/registrations/` endpoint rather than introducing a parallel form flow.

The key requirements from issue [#1960](https://github.com/climateconnect/climateconnect/issues/1960) are:

- When registering for an event, the user can enter values for additional custom fields configured on that event.
- The fields are shown in the order defined in the event registration configuration.
- A maximum of 5 custom fields are shown.
- Required custom fields are validated before submission.
- On successful registration, the submitted values are stored in the platform together with the registration.
- Phase 4a field types are:
  - **Checkbox** with formatted rich-text description and a required flag.
  - **Single select option** with a title, ordered options, and a required flag.
- If the modal becomes too small, it may scroll; action buttons should remain visible and sticky at the bottom.

This task is the registrant-side counterpart to [#1880](https://github.com/climateconnect/climateconnect/issues/1880). It introduces answer storage and wires the existing frontend registration modal to render and submit answers.

**Explicitly Out of Scope (this task):**

- Editing submitted answers after registration.
- New field types beyond checkbox and single-select option.
- Export/reporting UI for answers (covered by [#1962](https://github.com/climateconnect/climateconnect/issues/1962)).
- Organiser-side display of answers in the registrations list (covered by [#1963](https://github.com/climateconnect/climateconnect/issues/1963)).
- Registration form templates and reusable field sets.
- Guest-auth flow changes beyond rendering the fields after the existing auth flow completes.

### Non-Functional Requirements

- **Backward-compatible API**: `POST /api/projects/{slug}/registrations/` must remain valid for events without custom fields. Existing payload-less clients must continue to work.
- **Atomic persistence**: registration creation/re-activation and answer storage must happen in the same database transaction as the seat-allocation logic.
- **Server-side validation**: required fields and option ownership must be validated on the backend; frontend validation is advisory only.
- **Idempotency preserved**: if the user already has an active registration, the endpoint still returns `200 OK` and does not create duplicate registrations or duplicate answers.
- **Feature toggle**: all registrant-side custom field UI must be gated behind `REGISTRATION_CUSTOM_FIELDS`, in addition to the existing `EVENT_REGISTRATION` flow.
- **Accessible modal layout**: the registration modal must remain usable on mobile and keyboard-accessible when custom fields cause vertical overflow.
- **No unsanitized HTML rendering**: checkbox descriptions are already sanitized on organiser write; the registrant-side renderer must only render stored sanitized HTML and must not accept raw HTML input from registrants.

### AI Agent Insights and Additions

- **Reuse the existing read contract**: `GET /api/projects/{slug}/` already returns `event_registration_config.fields` in configured order. The registrant flow should consume that payload directly instead of introducing a dedicated "registration form schema" endpoint.
- **Extend the existing registration POST endpoint**: `EventRegistrationsView.post()` currently accepts an empty payload. This task should extend it with an optional `answers` array so events without custom fields keep using the same endpoint and tests remain valid.
- **Introduce a dedicated answer model**: organiser-side field definitions exist, but there is no place to store per-registration answers. This task should add `RegistrationFieldAnswer` tied to `EventRegistration` and `RegistrationField`, with separate nullable columns for boolean and selected option values. This is the storage foundation required by [#1961](https://github.com/climateconnect/climateconnect/issues/1961), [#1962](https://github.com/climateconnect/climateconnect/issues/1962), and [#1963](https://github.com/climateconnect/climateconnect/issues/1963).
- **Required checkbox semantics must be explicit**: for a checkbox field marked `is_required=true`, a missing value or `false` must be rejected. "Required" means the checkbox is checked, not merely present in the payload.
- **Render custom fields only in the authenticated confirmation step**: the current modal already handles unauthenticated users via `AuthEmailStep`, `AuthPasswordLogin`, `AuthOtp`, and `AuthSignupStep`. After auth succeeds and `user` is present, the modal should render the custom-field form above the final confirm button. This avoids duplicating the auth flow.
- **Preserve idempotent re-registration semantics**: if an active registration already exists, return `200 OK` without mutating stored answers. If a previously self-cancelled registration is being reactivated, the endpoint should sync the provided answers into the reactivated registration record.
- **Sticky action row for overflow**: `EventRegistrationModal` already uses `GenericDialog`. The dialog content should become scrollable when fields exceed viewport height, while the primary action row remains sticky so the submit button is always reachable.

---

## System Impact

- **Actors involved**:
  - `Member` — already authenticated and registering for an event.
  - `Guest` — completes the existing auth flow inside `EventRegistrationModal`, then answers custom fields before confirming registration.
  - `System` — validates answers, persists them atomically with the registration, and exposes them for later organiser-side read/export tasks.

- **Entities added**:
  - `RegistrationFieldAnswer` — one answer per `(registration, field)` pair.

- **Entities changed**:
  - `EventRegistration` — gains a reverse relation to `RegistrationFieldAnswer`.
  - `RegistrationField` — becomes answerable by registrants; reverse relation to `RegistrationFieldAnswer`.
  - `RegistrationFieldOption` — may be referenced by a stored answer; deleting an option must cascade-delete dependent answers.

- **Flows added**:
  - **Register for event with custom fields** — user opens event registration modal, authenticates if needed, answers configured custom fields, confirms registration, sees success state.

- **Flows changed**:
  - **Member Event Registration Flow** — authenticated confirmation step now conditionally includes custom fields.
  - **Guest Event Registration with Auth Integration** — after auth succeeds, the modal transitions into the same custom-field-enabled confirmation step.

- **Integration changes**:
  - No new external integrations.
  - New backend migration for answer storage.
  - Existing organiser-side custom fields toggle `REGISTRATION_CUSTOM_FIELDS` now gates both organiser and registrant surfaces.

- **Migrations required**:
  - New table: `organization_registrationfieldanswer`

---

## Software Architecture

### Data Model

**`RegistrationFieldAnswer`** — add to `organization/models/event_registration.py`

| Field | Type | Notes |
|-------|------|-------|
| `registration` | FK → `EventRegistration` (`CASCADE`) | `related_name="field_answers"` |
| `field` | FK → `RegistrationField` (`CASCADE`) | `related_name="answers"` |
| `value_boolean` | BooleanField, nullable | Used for checkbox answers |
| `value_option` | FK → `RegistrationFieldOption` (`CASCADE`, nullable) | Used for single-select option answers |
| `created_at` | DateTimeField (`auto_now_add=True`) | |
| `updated_at` | DateTimeField (`auto_now=True`) | |

Constraints:

- `unique_together = [("registration", "field")]` — one stored answer per field per registration.
- Validation rule: exactly one of `value_boolean` or `value_option` is used depending on `field.field_type`.
- Validation rule: `value_option.field_id == field.id` for option-select answers.
- Deleting a field or option cascades to delete dependent answers. This is required by the edit-side spec [#1961](https://github.com/climateconnect/climateconnect/issues/1961).

### API

**Existing endpoint extended**:

```
POST /api/projects/{slug}/registrations/
```

Request body becomes:

```json
{
  "answers": [
    { "field": 12, "value_boolean": true },
    { "field": 13, "value_option": 44 }
  ]
}
```

Contract:

- `answers` is optional.
- For events with no custom fields, callers may continue sending `{}` or no payload.
- For events with configured fields:
  - Checkbox field answer uses `value_boolean`.
  - Option-select field answer uses `value_option` (option row ID).
  - Unknown field IDs, duplicate answers for the same field, or options belonging to a different field return `400 Bad Request`.

Response remains backward-compatible:

```json
{
  "registered": true,
  "available_seats": 9
}
```

No answer payload is returned from this endpoint in Phase 4a.

**Validation rules**:

- Field must belong to the target event's `registration_config`.
- At most one answer per configured field.
- Missing optional fields are allowed.
- Missing required fields are rejected.
- Required checkbox must be `true`.
- Required option-select must include a selected option.
- For checkbox fields, `value_option` must be null/omitted.
- For option-select fields, `value_boolean` must be null/omitted.
- Fields absent from the event's current config are rejected.

**Idempotency / re-registration semantics**:

- Existing active registration → return `200 OK`; do not alter stored answers.
- Existing self-cancelled registration → reactivate the existing row and sync the submitted answers.
- Existing admin-cancelled registration → unchanged; still returns `403 Forbidden`.

### Backend

#### View Layer

- **`organization/views/event_registration_views.py`**
  - Extend `EventRegistrationsView.post()` to validate the optional `answers` payload before creating or reactivating the registration.
  - Keep the existing lock ordering and seat-allocation logic.
  - Persist answers in the same transaction as registration creation/reactivation.
  - On validation failure, return `400 Bad Request` before any registration row is created or reactivated.

#### Serializer Layer

- **Add a dedicated write serializer** in `organization/serializers/event_registration_answers.py` or extend `organization/serializers/event_registration.py` with:
  - `RegistrationFieldAnswerInputSerializer` — validates one submitted answer row.
  - `EventRegistrationSubmissionSerializer` — validates the top-level `answers` array against the target `EventRegistrationConfig`.

Recommended validation strategy:

- Build a map of configured fields from `registration_config.fields.prefetch_related("options")`.
- Validate payload field IDs against that map.
- Enforce per-type value shape and required-field presence in one place.
- Normalize the validated answer list into a simple internal format used by the view to create/update `RegistrationFieldAnswer` rows.

#### Persistence Logic

- On first registration:
  - Create `EventRegistration`.
  - Bulk-create one `RegistrationFieldAnswer` row per submitted answer.
- On self re-registration:
  - Clear the cancelled flags on the existing `EventRegistration` row.
  - Sync answers so the active registration reflects the newly submitted values.
- On active idempotent re-registration:
  - No changes to answers.

Recommended sync behaviour for re-registration:

- Submitted answer for existing field → update existing answer row.
- New submitted answer → create answer row.
- Old answer for a field omitted in the new payload → delete that old answer row.

This keeps the answer set aligned with the registration submission the user just confirmed.

### Frontend

#### Modal Rendering

- **`frontend/src/components/project/EventRegistrationModal.tsx`**
  - Extend the authenticated confirmation step to render a custom-field form when:
    - `EVENT_REGISTRATION` is enabled,
    - `REGISTRATION_CUSTOM_FIELDS` is enabled, and
    - `project.registration_config?.fields` contains one or more fields.
  - Keep the existing auth steps unchanged.
  - Render fields in ascending `order`.
  - Place the custom-field form between the profile preview / confirmation copy and the confirm button.

#### UI Components

Recommended new components:

- `RegistrationFieldAnswersForm.tsx` — orchestrates rendering, local state, validation display, and payload shaping.
- `RegistrationCheckboxField.tsx` — renders sanitized rich-text description plus a checkbox control.
- `RegistrationOptionSelectField.tsx` — renders field title and a radio-group or select control for the ordered options.

Key UI rules:

- Checkbox description renders sanitized HTML from organiser-defined settings.
- Option-select field shows `settings.title` as the question label.
- Required fields display an asterisk or helper text.
- Inline validation errors appear below the relevant control.
- The primary button remains disabled during submission, not during normal incomplete entry; validation occurs on submit and optionally on blur/change.

#### Modal Layout / Scrolling

- When one or more custom fields cause the modal body to exceed available height:
  - Dialog content becomes scrollable.
  - The action row with the confirm button remains sticky at the bottom.
  - Focus order and keyboard scrolling must continue to work.

#### Frontend Data Types

- Extend the `Project` and event registration config types in `frontend/src/types.ts` so `fields` and option data are typed and available to the modal.
- Add a lightweight answer-state type for local form state:

```ts
type RegistrationFieldAnswerValue = {
  fieldId: number;
  valueBoolean?: boolean;
  valueOption?: number;
};
```

### Files to Change

#### Backend

| File | Change |
|------|--------|
| `organization/models/event_registration.py` | Add `RegistrationFieldAnswer` model |
| `organization/models/__init__.py` | Export the new model |
| `organization/serializers/event_registration.py` or new `organization/serializers/event_registration_answers.py` | Add answer input serializers and validation |
| `organization/views/event_registration_views.py` | Validate and persist answers in `POST /registrations/` |
| `organization/tests/test_event_participant.py` | Extend registration endpoint tests for custom field submission |
| `organization/tests/test_event_registration_custom_fields.py` | Add answer-storage and cross-feature tests as needed |
| `organization/migrations/` | Create migration for `RegistrationFieldAnswer` |

#### Frontend

| File | Change |
|------|--------|
| `src/components/project/EventRegistrationModal.tsx` | Render custom fields in authenticated confirmation step; include answers in POST payload; handle inline errors and scrollable layout |
| `src/components/project/EventRegistrationModal.test.tsx` | Add custom-field rendering and submission tests |
| `src/types.ts` | Add field-definition typing needed by the modal |
| `public/texts/project_texts.tsx` | Add validation and helper copy if new text keys are required |

---

## Test Cases

### Backend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | Register for an event with no custom fields and empty payload | Existing `201 Created` behaviour preserved |
| 2 | Register for an event with required checkbox + required option and valid answers | `201 Created`; registration row and 2 answer rows created |
| 3 | Submit no answer for a required checkbox | `400 Bad Request` |
| 4 | Submit `value_boolean=false` for a required checkbox | `400 Bad Request` |
| 5 | Submit no answer for a required option-select field | `400 Bad Request` |
| 6 | Submit option ID that belongs to another field | `400 Bad Request` |
| 7 | Submit answer for a field not on this event | `400 Bad Request` |
| 8 | Submit duplicate answers for the same field | `400 Bad Request` |
| 9 | Re-register while already active, with answers payload | `200 OK`; no duplicate registration and no answer mutation |
| 10 | Re-register after self-cancellation with answers payload | Existing row reactivated; answers synced |
| 11 | Re-register after admin cancellation with answers payload | `403 Forbidden` |
| 12 | Last available seat with valid answers | Registration succeeds; status transitions to `FULL`; answers persist |
| 13 | Validation failure on answers when one seat remains | `400 Bad Request`; no registration row created and seat count unchanged |

### Frontend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | Event has no custom fields | Modal behaves as it does today |
| 2 | Authenticated user opens modal for event with custom fields | Fields render in configured order above confirm button |
| 3 | Guest completes auth for event with custom fields | Modal transitions into same field-enabled confirmation step |
| 4 | Required checkbox left unchecked | Inline validation shown; POST not sent |
| 5 | Required option-select left empty | Inline validation shown; POST not sent |
| 6 | Backend returns field-specific validation error | Error is mapped to the relevant field control |
| 7 | Many fields/options make modal content tall | Modal body scrolls; action row remains visible |
| 8 | Feature toggle disabled | Custom-field UI not rendered; existing registration flow preserved |

---

## Dependency Notes

- **Depends on** [#1880](https://github.com/climateconnect/climateconnect/issues/1880): organiser-side field definitions, serializers, and project detail read contract must already exist.
- **Depends on** the existing event registration modal/auth flow described in [`20260430_0936_guest_event_registration_auth_integration.md`](./20260430_0936_guest_event_registration_auth_integration.md): this task reuses that flow rather than replacing it.
- **Required before shipping edit/export/display tasks**: this task creates the answer-storage foundation consumed by [#1961](https://github.com/climateconnect/climateconnect/issues/1961), [#1962](https://github.com/climateconnect/climateconnect/issues/1962), and [#1963](https://github.com/climateconnect/climateconnect/issues/1963).

---

## Acceptance Criteria

- [ ] A registrant sees up to 5 configured custom fields in the event registration modal, in the organiser-defined order.
- [ ] Supported Phase 4a field types are checkbox and single-select option.
- [ ] Checkbox fields render the organiser-defined rich-text description safely.
- [ ] Option-select fields render the organiser-defined title and ordered options.
- [ ] Required custom fields are validated before registration is submitted.
- [ ] For required checkbox fields, the checkbox must be checked to proceed.
- [ ] Submitted answers are stored in the platform together with the event registration.
- [ ] `POST /api/projects/{slug}/registrations/` remains backward-compatible for events without custom fields.
- [ ] Validation failures do not create or reactivate a registration row.
- [ ] Existing active registration requests remain idempotent and do not create duplicate answers.
- [ ] Self re-registration after cancellation reuses the existing registration row and syncs the new answers.
- [ ] Deleting a field or option later cascades to delete dependent answers.
- [ ] The modal remains usable on mobile, including scrollable content with visible action buttons.
- [ ] All registrant-side custom-field UI is gated behind `REGISTRATION_CUSTOM_FIELDS`.
- [ ] All tests pass.

---

## Log

- 2026-05-12 10:15 — Task created from GitHub issue [#1960](https://github.com/climateconnect/climateconnect/issues/1960). Anchored to the existing `EventRegistrationModal` and `POST /api/projects/{slug}/registrations/` flow rather than introducing a second registration endpoint. Reuses organiser-defined custom fields from [#1880](https://github.com/climateconnect/climateconnect/issues/1880) and adds `RegistrationFieldAnswer` storage so later organiser-facing tasks can read, edit around, and export captured answers.

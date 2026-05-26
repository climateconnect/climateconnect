# Time Slot Field Type for Event Registration

**Status**: DRAFT
**Type**: Feature
**Date and time created**: 2026-05-26 11:00
**GitHub Issue**: [#2006](https://github.com/climateconnect/climateconnect/issues/2006)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260416_1000_event_registration_custom_fields.md`](./20260416_1000_event_registration_custom_fields.md) ← foundational custom fields spec (Phase 4a)
- [`20260519_1328_inventory_field_type_event_registration.md`](./20260519_1328_inventory_field_type_event_registration.md) ← inventory field type (Phase 4b) — closest structural analogue
- [`20260512_0725_edit_event_registration_custom_fields.md`](./20260512_0725_edit_event_registration_custom_fields.md) ← edit flow spec
- [`20260521_0923_custom_field_label.md`](./20260521_0923_custom_field_label.md) ← custom field label spec

---

## Problem Statement

Event organisers running events that span multiple time windows — such as "Balkonien" solar module pickup events, workshop sessions, courses, or volunteer shifts — need to let registrants pick a preferred time slot during registration. Without this capability, organisers must manage slot allocation manually (external forms, follow-up emails, spreadsheets), which is fragmented, error-prone, and does not scale.

This task delivers the **time slot select** custom field type. It extends the existing custom fields infrastructure (checkbox, option select, inventory) with a new field type where each option represents a **time window** with a start time, end time, and optional per-slot capacity. The organiser defines the available slots; the registrant picks one.

**This task covers the organiser side only: field definition (create/edit).** The registrant-side flow (rendering time slot fields on the registration form, capturing the selected slot, and enforcing capacity) is **out of scope** and will be delivered in a dedicated follow-up task.

**Core Requirements (User/Stakeholder Stated):**

- The **time slot select** field type is available alongside the existing checkbox, option_select, and inventory types when an organiser creates or edits an event's registration form.
- Each time slot field has the following **settings**:
  - `title` — string, max. 100 characters, required. Displayed as the question label (e.g. "Pick your preferred time slot").
  - `description` — plain text, max. 200 characters, optional. Displayed below the title as helper text.
  - `required` — boolean. When true, the registrant must select a time slot.
- Each time slot field has **1 or more options**. Every option has:
  - `start_time` — date-time, required. Must be before `end_time`. Must be in the future (at publish time). Timezone-aware (TIMESTAMPTZ).
  - `end_time` — date-time, required. Must be after `start_time`. Must be in the future (at publish time). Timezone-aware (TIMESTAMPTZ).
  - `available_amount` — positive integer, optional. The total capacity (number of registrants) for this time slot across all guests. When null, the slot has unlimited capacity.
  - `order` — positive integer, required. Controls display order within the field.
- **No per-option `title`**: unlike option_select and inventory, time slot options do not have a title. The option is identified by its time window. The frontend auto-generates a display string from `start_time`/`end_time` (e.g. "Mon 15 Jun, 10:00–12:00"). The existing `title` column on `RegistrationFieldOption` is left empty for time slot options.
- **Registration value** stored per guest: the `id` of the selected time slot option (same as option_select).
- **Capacity enforcement** (follow-up task): when `available_amount` is set, the system must prevent a guest from selecting a slot that is fully booked. If a slot is fully booked, it must appear as unavailable to subsequent registrants.
- The UI for creating and editing time slot fields follows the example of the **inventory field type editor**, with different option inputs (start/end datetime pickers instead of title + numeric capacity fields, plus optional capacity).
- When editing a time slot field, the same **answer-lock rules** apply as for option_select and inventory:
  - If the field has registrant answers, the field `title` is read-only.
  - If an individual option has registrant answers, the option's `start_time` and `end_time` are read-only.
  - Options may still be reordered, deleted (with confirmation), and new options may be added regardless of answers.
  - The `available_amount` value remains editable even when answers exist.
- The feature is **gated behind the existing `REGISTRATION_CUSTOM_FIELDS` feature toggle** — no new toggle is required.

**Explicitly Out of Scope (this task):**

- **Registrant-side rendering and answer submission** — a separate follow-up task will handle displaying time slot fields on the registration form, capturing the selected slot, and submitting answers. This task delivers the organiser-side definition only.
- **Capacity enforcement at registration time** — the actual enforcement of `remaining_amount >= 1` at the `POST /registrations/` endpoint is out of scope for this task and will be specified in the registrant-side follow-up spec.
- **Overlapping slot validation** — the system does not validate that time slots within a field do not overlap. The organiser is responsible for defining non-overlapping windows. A future enhancement could add a warning, but blocking is out of scope.
- **Free text, number, or date** field types (Phase 4c+).
- **Registration form templates** (reuse across events).
- **Waiting list or over-booking** handling — if a slot is full, registration for that slot is simply blocked.

### Non-Functional Requirements

- **Maximum 5 fields**: the time slot type counts toward the same 5-field limit enforced server-side. Attempting to add a 6th field returns `400 Bad Request`.
- **Forward-compatible storage**: the answer storage model must accommodate a time slot selection without breaking the existing schema for checkbox, option_select, and inventory answers. The time slot answer uses `value_option` (FK to the selected `RegistrationFieldOption`), same as option_select. No new column is needed for the basic case (slot selection without quantity). If a future enhancement needs per-guest quantity for time slots, the existing `value_number` column (from the inventory field) can be reused.
- **Validation on publish**: when `is_draft=false`, all time slot field settings and option properties must be validated. Draft events skip full validation — consistent with the draft-mode contract established in [#1820](https://github.com/climateconnect/climateconnect/issues/1820).
- **No breaking changes** to existing API contracts. The `fields` array in project detail responses gains a new possible `field_type` value; existing consumers that do not recognise it should ignore the field gracefully.
- **Capacity race safety** (follow-up task): when two guests simultaneously register for the last seats of the same time slot, the system must not over-sell. The registration endpoint must use an atomic check-and-set pattern (e.g. `select_for_update` on the option or config row) to ensure exactly `available_amount` registrants are allocated per slot.
- **Toggle gate**: all new frontend UI must be gated behind `REGISTRATION_CUSTOM_FIELDS`. The toggle state is: dev ✅, staging ✅, production ❌.

### AI Agent Insights and Additions

- **Model — extend `RegistrationFieldOption` with datetime columns**: add `start_time` (DateTimeField, nullable, TIMESTAMPTZ) and `end_time` (DateTimeField, nullable, TIMESTAMPTZ) to `RegistrationFieldOption`. Both are nullable so that existing checkbox, option_select, and inventory options (which do not use time windows) do not require back-fill data. For time slot fields, both columns are required at the application level (enforced in the settings serializer and publish validation). No new table is needed. The existing `available_amount` column (added for inventory) is reused for per-slot capacity — no additional column needed.

- **Settings serializer — `TimeSlotSettingsSerializer`**: validates `title` (CharField, max_length=100, required) and `description` (CharField, max_length=200, allow_blank=True, required=False). Register it in `FIELD_TYPE_SETTINGS_VALIDATORS` alongside the existing entries. Unknown keys are stripped. This is identical in shape to `InventorySettingsSerializer`.

- **Option serializer — per-type validation**: `RegistrationFieldOptionSerializer` currently validates `title`, `order`, `available_amount`, and `max_amount_per_guest`. For time slot options, the serializer must also accept and validate `start_time` and `end_time` as ISO 8601 datetime strings. The cleanest approach is to add these fields as always-accepted nullable DateTimeFields in the serializer (they are ignored for non-time-slot types) and enforce their presence in `RegistrationFieldSerializer.validate()` when `field_type == TIME_SLOT_SELECT`. The `title` field is not used for time slot options — the option is identified solely by its time window. The frontend auto-generates a display string (e.g. "Mon 15 Jun, 10:00–12:00") from `start_time`/`end_time`. The backend does not require or validate `title` for time slot options.

- **Answer storage — reuses `value_option`**: a time slot answer row sets `value_option = <selected time slot option>` and leaves `value_boolean`, `value_number` as null. This is identical to how option_select answers work. No schema change to `RegistrationFieldAnswer` is needed. The registrant-side follow-up task may optionally use `value_number` for a per-guest quantity if the product decides time slots can have multi-booking (e.g. "book 3 seats at the 10:00 workshop"), but this is not part of the current requirements.

- **Capacity check at registration time** (follow-up task, same pattern as inventory): when a registrant submits a time slot answer, the view must:
  1. Lock the `RegistrationFieldOption` row with `select_for_update()`.
  2. Compute `booked = COUNT(registrations)` from all `RegistrationFieldAnswer` rows where `value_option = <selected option>` (and the parent `EventRegistration.cancelled_at IS NULL`).
  3. Reject with `400 Bad Request` if `available_amount IS NOT NULL AND booked >= available_amount`.
  4. The option's `remaining_amount` is computed in the API response: `available_amount - COUNT(booked)` (null when `available_amount` is null).

- **Available-seats display**: for time slot fields, "available seats" is per-option (per-slot), not per-event. The project detail response should include, for each time slot option, a computed `remaining_amount` so the frontend can disable fully-booked slots. When `available_amount` is null, `remaining_amount` is also null (unlimited). This is additive and does not affect the event-level `available_seats` computation.

- **UI — extend existing inventory editor pattern**: `InventoryFieldEditor` is the reference pattern. The time slot variant replaces the option title input with two datetime picker inputs (`start_time`, `end_time`) per option row — no title input. The display label for each option row is auto-generated from the time range (e.g. "Mon 15 Jun, 10:00–12:00"). The `available_amount` numeric input is retained as optional (organiser may leave it blank for unlimited capacity). The `max_amount_per_guest` input is **not** present for time slots (not in requirements). Reuse the same add/remove/reorder controls. The frontend type `RegistrationFieldOption` gains `start_time?: string | null` and `end_time?: string | null`.

- **Edit guard — datetime values locked with answers**: unlike `available_amount` (always mutable), the `start_time` and `end_time` of a time slot option are **locked** when the option has answers, same as how `title` is locked for option_select/inventory options. Changing a time slot's window after registrants have selected it would invalidate their choice.

- **No new toggle**: reuses `REGISTRATION_CUSTOM_FIELDS`. The time slot field type should only appear in the "Add field" type picker when the toggle is enabled — same pattern as checkbox, option_select, and inventory.

- **Migration**: a single migration adds `start_time` and `end_time` to `RegistrationFieldOption` as nullable DateTimeFields with `TIMESTAMPTZ` storage.

---

## System Impact

- **Actors involved**:
  - `Organiser / Team Admin` — creates or edits an event with time slot fields; defines time windows and optional per-slot capacity.
  - `System` — enforces the 5-field limit, validates field settings on publish, persists option time/capacity data, and will enforce per-slot capacity at registration time (follow-up task).

- **Entities added**: None.

- **Entities changed**:
  - `RegistrationFieldOption` — gains `start_time` (DateTimeField, nullable, TIMESTAMPTZ) and `end_time` (DateTimeField, nullable, TIMESTAMPTZ).
  - `RegistrationFieldType` — gains `TIME_SLOT_SELECT` choice.

- **Flows added**:
  - **Create/Edit Time Slot Field** — Organiser adds a time slot field to an event's registration form, defines options with time windows and optional capacity, and saves.

- **Flows changed**:
  - **Custom Field Builder** (`RegistrationFieldList`, `RegistrationFieldEditor`) — extended to support the `time_slot_select` type in the type picker and to render a time-slot-specific editor.
  - **Project Detail Response** — `event_registration_config.fields` array may now contain `field_type: "time_slot_select"` items with option objects that include `start_time`, `end_time`, and `available_amount`.

- **Integration changes**:
  - No new toggle — reuses `REGISTRATION_CUSTOM_FIELDS`.

- **Migrations required**:
  - One migration on `organization.RegistrationFieldOption` to add `start_time` and `end_time` as nullable DateTimeFields (TIMESTAMPTZ).

---

## Software Architecture

### Data Model

**`RegistrationFieldOption` (extended)**

| Field | Type | Notes |
|-------|------|-------|
| `field` | FK → `RegistrationField` | Existing |
| `title` | CharField(max_length=200) | Existing; **not used** for time slot options (left empty); display string is auto-generated by frontend from time range |
| `order` | PositiveIntegerField | Existing |
| `available_amount` | PositiveIntegerField, **nullable** | Existing (from inventory); reused for per-slot capacity. Null = unlimited. |
| `max_amount_per_guest` | PositiveIntegerField, **nullable** | Existing (from inventory); not used for time slot options (left null) |
| `start_time` | DateTimeField, **nullable**, TIMESTAMPTZ | **New**. Required at app level for time slot options; null for checkbox/option_select/inventory options |
| `end_time` | DateTimeField, **nullable**, TIMESTAMPTZ | **New**. Required at app level for time slot options; null for checkbox/option_select/inventory options |

**`RegistrationFieldType` (extended)**

| Value | Label |
|-------|-------|
| `checkbox` | Checkbox |
| `option_select` | Option Select |
| `inventory` | Inventory |
| `time_slot_select` | Time Slot Select *(new)* |

**`RegistrationFieldAnswer` — no change**

A time slot answer row uses `value_option = <selected time slot option>`, `value_boolean = NULL`, `value_number = NULL`. Same pattern as option_select. No schema migration needed.

### API

**Read — project detail**

`GET /api/projects/{slug}/` → `event_registration_config.fields` array.

Time slot field object shape (additive):

```json
{
  "id": 5,
  "field_type": "time_slot_select",
  "order": 2,
  "is_required": true,
  "label": "Pickup slot",
  "settings": {
    "title": "Pick your preferred time slot",
    "description": "Choose when you'd like to pick up your solar modules."
  },
  "has_answers": false,
  "options": [
    {
      "id": 30,
      "title": "",
      "order": 0,
      "has_answers": false,
      "start_time": "2026-06-15T10:00:00Z",
      "end_time": "2026-06-15T12:00:00Z",
      "available_amount": 20,
      "max_amount_per_guest": null,
      "remaining_amount": 18
    },
    {
      "id": 31,
      "title": "",
      "order": 1,
      "has_answers": false,
      "start_time": "2026-06-15T14:00:00Z",
      "end_time": "2026-06-15T16:00:00Z",
      "available_amount": null,
      "max_amount_per_guest": null,
      "remaining_amount": null
    }
  ]
}
```

`title` on each option is always `""` (empty) for time slot options — the frontend renders a human-readable time range (e.g. "Mon 15 Jun, 10:00–12:00") from `start_time`/`end_time`.

**Write — create event with time slot fields**

`POST /api/projects/` → `event_registration_config.fields` array accepts time slot fields same as checkbox/option_select/inventory.

```json
{
  "field_type": "time_slot_select",
  "order": 0,
  "is_required": true,
  "label": "Pickup slot",
  "settings": {
    "title": "Pick your preferred time slot",
    "description": "Choose when to pick up your modules."
  },
  "options": [
    {
      "order": 0,
      "start_time": "2026-06-15T10:00:00Z",
      "end_time": "2026-06-15T12:00:00Z",
      "available_amount": 20
    },
    {
      "order": 1,
      "start_time": "2026-06-15T14:00:00Z",
      "end_time": "2026-06-15T16:00:00Z"
    }
  ]
}
```

**Write — edit registration config with time slot fields**

`PATCH /api/projects/{slug}/registration-config/` → `fields` array accepts time slot fields using the same full-sync pattern as existing types.

Sync rules remain unchanged:
- Item with `id` → update existing field and sync its options.
- Item without `id` → create new field and options.
- Existing field absent from the array → delete (CASCADE on answers).

**Validation (publish, `is_draft=false`)**:

| Rule | Applies to | Details |
|------|-----------|---------|
| `settings.title` non-empty | time_slot_select field | ≤ 100 chars |
| `settings.description` length | time_slot_select field | ≤ 200 chars (optional) |
| At least one option | time_slot_select field | Reject if 0 options |
| `start_time` non-empty | time_slot_select option | Must be a valid ISO 8601 datetime |
| `end_time` non-empty | time_slot_select option | Must be a valid ISO 8601 datetime |
| `end_time > start_time` | time_slot_select option | End must be after start |
| `start_time` in the future | time_slot_select option | Must be > `now()` at publish time |
| `available_amount` ≥ 1 (if set) | time_slot_select option | Optional; null = unlimited |

**Validation (draft)**: all publish validations are skipped.

**Answer-lock validation** (applies on any PATCH touching an existing time slot field/option):

| Locked property | Condition | Rationale |
|----------------|-----------|-----------|
| `settings.title` | field `has_answers=true` | Changing the question label invalidates the context of existing answers |
| `start_time` | option `has_answers=true` | Changing the time window invalidates the registrant's slot selection |
| `end_time` | option `has_answers=true` | Same as above |
| `available_amount` | **always mutable** | Organiser manages capacity; system does not guard against oversell |
| `settings.description` | **always mutable** | Helper text; does not affect answer integrity |

**Error responses**:

| Status | Condition |
|--------|-----------|
| `400` | 6th field; time slot with 0 options on publish; missing/invalid title, start_time, end_time; end_time ≤ start_time; start_time in the past; available_amount < 1; nested field validation error; attempt to change a locked property on a field or option that has answers |
| `401` | Unauthenticated |
| `403` | Not organiser or team admin |
| `404` | Project not found or no registration config |

### Backend

- **`organization/models/registration_field.py`** — add `TIME_SLOT_SELECT` to `RegistrationFieldType`; add `start_time` and `end_time` to `RegistrationFieldOption` as nullable DateTimeFields.
- **`organization/serializers/registration_field.py`** — add `TimeSlotSettingsSerializer` to the settings registry; extend `RegistrationFieldOptionSerializer` to accept and return `start_time` and `end_time`; extend `RegistrationFieldSerializer.validate()` with time-slot-specific publish validation (title required, options required, start/end times required and valid, end > start, start in future) and answer-lock guards (lock start_time and end_time on options with answers).
- **`organization/serializers/event_registration.py`** — no direct changes required if the nested `fields` sync already delegates to `RegistrationFieldSerializer` and `sync_fields()`.
- **`organization/views/event_registration_views.py`** — no changes for the organiser-side task. The capacity-enforcement logic will be added in the follow-up registrant-side task.
- **Migration**: `organization/migrations/0XXN_registrationfieldoption_timeslot.py`.

### Frontend

- **`src/types.ts`** — extend types:
  - `RegistrationField.field_type` union gains `"time_slot_select"`.
  - `RegistrationFieldOption` gains `start_time?: string | null` and `end_time?: string | null`.
- **`src/components/shareProject/RegistrationFieldList.tsx`** — extend the "Add field" menu to include `time_slot_select` when `REGISTRATION_CUSTOM_FIELDS` is enabled. Add a `ScheduleIcon` (or `AccessTimeIcon`) for the menu item.
- **`src/components/shareProject/RegistrationFieldEditor.tsx`** — add a `time_slot_select` branch that renders the new time slot editor.
- **`src/components/shareProject/TimeSlotFieldEditor.tsx`** *(new)* — organiser-side editor for time slot fields. Based on `InventoryFieldEditor` but each option row has:
  - `start_time` datetime picker (required)
  - `end_time` datetime picker (required)
  - `available_amount` numeric input (optional; null = unlimited)
  - **No title input** per option — the display label is auto-generated from the time range
  - add / delete / reorder controls (same as inventory)
  - `start_time` and `end_time` are read-only when `option.has_answers === true`
  - field-level `title` and `description` inputs at the top of the editor (same pattern as inventory)
- **`public/texts/project_texts.tsx`** — add translations for time slot field labels (e.g. "Time Slot Select", "Start time", "End time", "Available amount (optional)").

---

## Definition of Done

- [ ] Migration adds `start_time` and `end_time` to `RegistrationFieldOption` as nullable DateTimeFields (TIMESTAMPTZ).
- [ ] `RegistrationFieldType.TIME_SLOT_SELECT` exists and is accepted by the backend.
- [ ] Organiser can create and edit an event with up to 5 custom fields including time slot fields.
- [ ] Time slot field settings (`title`, `description`) and options (`start_time`, `end_time`, `available_amount`, `order`) are validated on publish and skipped in draft mode.
- [ ] Publish validation enforces: `end_time > start_time`, `start_time` in the future, at least one option, `title` non-empty.
- [ ] Time slot options are returned in project detail responses with `start_time`, `end_time`, `available_amount`, and `remaining_amount`.
- [ ] Answer-lock guards prevent changing `title` on time slot fields and `start_time`/`end_time` on options that have existing answers.
- [ ] `available_amount` remains editable on options with answers (not locked).
- [ ] Frontend "Add field" menu includes "Time Slot Select" when `REGISTRATION_CUSTOM_FIELDS` toggle is enabled.
- [ ] Frontend time slot editor allows organiser to define options with datetime windows and optional capacity (no title input per option; display label auto-generated from time range).
- [ ] Backend returns `400 Bad Request` with clear field-level error messages for all validation failures.
- [ ] Existing checkbox, option_select, and inventory fields continue to work unchanged (regression tests pass).
- [ ] Toggle check `isEnabled("REGISTRATION_CUSTOM_FIELDS")` gates all new UI.
- [ ] `make format` passes on backend; `yarn lint` passes on frontend.
- [ ] Backend tests cover time slot field creation, validation, and answer-lock guards.

---

## Test Plan

### Backend Tests

| Test | Module | What it verifies |
|------|--------|-----------------|
| Create event with time slot field | `organization.tests.test_event_registration` | `POST /api/projects/` accepts `time_slot_select` nested in `event_registration_config.fields`; options persist with `start_time` and `end_time` |
| Time slot field validation on publish | `organization.tests.test_event_registration` | `is_draft=false` rejects missing title, 0 options, missing start_time, missing end_time, end_time ≤ start_time, start_time in the past, available_amount < 1 |
| Time slot field draft skip | `organization.tests.test_event_registration` | `is_draft=true` accepts a time slot field with 0 options and missing datetime fields |
| Edit time slot field | `organization.tests.test_event_registration` | `PATCH /api/projects/{slug}/registration-config/` updates time slot settings and options; sync creates/updates/deletes correctly |
| Answer-lock on time slot title | `organization.tests.test_event_registration` | PATCH that changes `settings.title` on a time slot field with answers returns 400 |
| Answer-lock on time slot option times | `organization.tests.test_event_registration` | PATCH that changes `start_time` or `end_time` on a time slot option with answers returns 400 |
| Capacity values mutable with answers | `organization.tests.test_event_registration` | PATCH that changes `available_amount` on a time slot option with answers succeeds |
| 5-field limit includes time slot | `organization.tests.test_event_registration` | Attempting to add a 6th field (any type) returns 400 |
| Read response shape | `organization.tests.test_event_registration` | `GET /api/projects/{slug}/` returns time slot fields with all new columns and `remaining_amount` |
| Invalid time range rejected | `organization.tests.test_event_registration` | `end_time < start_time` returns 400 on publish |
| Past start_time rejected on publish | `organization.tests.test_event_registration` | `start_time` in the past returns 400 when `is_draft=false` |
| Past start_time accepted on draft | `organization.tests.test_event_registration` | `start_time` in the past is accepted when `is_draft=true` |
| Null available_amount accepted | `organization.tests.test_event_registration` | Time slot option with `available_amount=null` (unlimited capacity) is accepted |

### Frontend Tests

| Test | Module | What it verifies |
|------|--------|-----------------|
| Time slot appears in add menu | `RegistrationFieldList.test.tsx` | When toggle is on, the "Add field" menu contains a "Time Slot Select" item |
| Time slot editor renders | `TimeSlotFieldEditor.test.tsx` *(new)* | Given a time slot field, the editor shows title input, description input, and option rows with datetime pickers and optional capacity input |
| Option datetime inputs validate | `TimeSlotFieldEditor.test.tsx` | Entering end_time before start_time shows a form-level error (or is passed to backend) |
| Read-only option times with answers | `TimeSlotFieldEditor.test.tsx` | Start and end time inputs are disabled when `has_answers=true` |
| Read-only field title with answers | `TimeSlotFieldEditor.test.tsx` | Field title input is disabled when `has_answers=true` |
| Capacity input optional | `TimeSlotFieldEditor.test.tsx` | Organiser can leave available_amount blank (unlimited capacity) |

---

## Files Changed

### Backend

| File | Change |
|------|--------|
| `organization/models/registration_field.py` | Add `TIME_SLOT_SELECT` to `RegistrationFieldType`; add `start_time` and `end_time` to `RegistrationFieldOption` |
| `organization/serializers/registration_field.py` | Add `TimeSlotSettingsSerializer`; extend option serializer with `start_time`/`end_time`; add time slot validation and answer-lock guards |
| `organization/serializers/event_registration.py` | May need minor extension if the field-sync logic needs time-slot-specific handling (likely none) |
| `organization/tests/test_event_registration.py` | Add time slot field tests |
| `organization/migrations/` | New migration for `RegistrationFieldOption` time slot columns |

### Frontend

| File | Change |
|------|--------|
| `src/types.ts` | Extend `RegistrationField.field_type` union and `RegistrationFieldOption` with `start_time`/`end_time` |
| `src/components/shareProject/RegistrationFieldList.tsx` | Add `time_slot_select` to add-menu type picker |
| `src/components/shareProject/RegistrationFieldEditor.tsx` | Add `time_slot_select` branch |
| `src/components/shareProject/TimeSlotFieldEditor.tsx` | New component for time slot field editing |
| `public/texts/project_texts.tsx` | Add time slot field labels |

---

## Notes and Open Questions

1. **Overlapping time slots**: the system does not validate that time slots within a field do not overlap. The organiser is responsible for defining non-overlapping windows. A future enhancement could surface a warning in the organiser UI, but blocking is out of scope.
2. **`title` on time slot options**: not used. Unlike option_select where `title` is the primary identifier, time slot options are identified by their time window. The `title` column on `RegistrationFieldOption` is left empty. The frontend auto-generates a display string from `start_time`/`end_time` (e.g. "Mon 15 Jun, 10:00–12:00") using the viewer's locale and timezone. The backend does not require or validate `title` for time slot options.
3. **`available_amount` null = unlimited**: when the organiser does not set an `available_amount` for a time slot, the slot has unlimited capacity. The frontend should clearly communicate this (e.g. placeholder text "Unlimited" or a toggle).
4. **Registration-time capacity logic** (follow-up task): the actual enforcement of `remaining_amount >= 1` at the `POST /api/projects/{slug}/register/` endpoint is **out of scope for this task** and will be specified in the registrant-side follow-up spec. The pattern is identical to inventory capacity enforcement.
5. **`max_amount_per_guest` not used**: the inventory field has `max_amount_per_guest` for multi-quantity booking. Time slot selection is a single-slot choice (one slot per registrant), so `max_amount_per_guest` is not relevant. If a future requirement needs multi-booking per slot (e.g. "book 3 seats at 10:00"), the existing `value_number` column on `RegistrationFieldAnswer` can be used without schema changes.
6. **Future enhancement — "all that apply" multi-select**: the current requirements specify single-select (pick one time slot). A future enhancement could allow multi-select (pick all applicable slots), but this is out of scope and would be a new field type (`time_slot_multi_select`) rather than a modification of this one.
7. **Timezone handling**: `start_time` and `end_time` are stored as TIMESTAMPTZ (same as `registration_end_date` and `project.end_date`). The frontend must send timezone-aware ISO 8601 strings. The organiser's browser timezone is used for input, converted to UTC for storage. Display is in the viewer's local timezone.

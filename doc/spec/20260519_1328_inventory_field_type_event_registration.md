# Inventory Field Type for Event Registration (Phase 4b)

**Status**: COMPLETED
**Type**: Feature
**Date and time created**: 2026-05-19 13:28
**GitHub Issue**: [#1995](https://github.com/climateconnect/climateconnect/issues/1995)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260416_1000_event_registration_custom_fields.md`](./20260416_1000_event_registration_custom_fields.md) ← foundational custom fields spec (Phase 4a)
- [`20260512_0725_edit_event_registration_custom_fields.md`](./20260512_0725_edit_event_registration_custom_fields.md) ← edit flow spec
- [`doc/mosy/architecture_overview.md`](../mosy/architecture_overview.md)
- [`doc/mosy/entities/system-entities.md`](../mosy/entities/system-entities.md)
- [`doc/mosy/flows/core-flows.md`](../mosy/flows/core-flows.md)

---

## Problem Statement

Event organisers running events with material needs — such as meal-planning events, workshop sessions with limited kits, or shuttle services with seat caps — need to collect not just a participant's choice, but **how many units** of that choice they need. Without this capability, organisers must track inventory manually (spreadsheets, follow-up emails), which is error-prone and does not scale.

This task delivers the **inventory** custom field type as Phase 4b of the Event Registration epic. It extends the existing custom fields infrastructure (checkbox, option select) with a new field type where each option carries a **stock limit** and a **per-guest maximum**. The system tracks remaining availability per option and prevents over-booking at registration time.

**Core Requirements (User/Stakeholder Stated):**

- The **inventory** field type is available alongside the existing checkbox and option_select types when an organiser creates or edits an event's registration form.
- Each inventory field has the following **settings**:
  - `title` — string, max. 100 characters, required. Displayed as the question label (e.g. "How many meals do you need?").
  - `description` — plain text, max. 200 characters, optional. Displayed below the title as helper text.
  - `required` — boolean. When true, the registrant must select at least one unit from one option.
- Each inventory field has **1 or more options**. Every option has:
  - `title` — string, max. 100 characters, required (e.g. "Vegetarian", "Standard").
  - `available_amount` — positive integer, required. The total stock / capacity for this option across all guests.
  - `max_amount_per_guest` — positive integer, required. The maximum quantity a single guest may select for this option.
  - `order` — positive integer, required. Controls display order within the field.
- **Registration value** stored per guest: `(selected option id, quantity)` — the guest picks one option and a quantity. The quantity must be ≥ 1 and ≤ the option's `max_amount_per_guest`.
- **Capacity enforcement**: the system must prevent a guest from selecting a quantity that would cause the total booked amount for that option to exceed its `available_amount`. If an option is fully booked, it must appear as unavailable (disabled or hidden) to subsequent registrants.
- **Organiser-side UI**: the create/edit flow for inventory fields follows the same pattern as option_select (ordered list of options with add/remove/reorder), but each option row exposes two additional numeric inputs: "Available amount" and "Max per guest".
- **Edit rules**: when editing an inventory field, the same answer-aware guard rules apply as for option_select:
  - If the field has registrant answers, the field `title` and `description` are read-only.
  - If an individual option has registrant answers, the option `title` is read-only.
  - Options may still be reordered, deleted (with confirmation), and new options may be added regardless of answers.
  - The `available_amount` and `max_amount_per_guest` values remain editable even when answers exist — the organiser is responsible for managing capacity changes.
- The feature is **gated behind the existing `REGISTRATION_CUSTOM_FIELDS` toggle** — no new toggle is required.

**Explicitly Out of Scope (this task):**
- **Registrant-side rendering and answer submission** — a separate follow-up task will handle displaying inventory fields on the public registration form, capturing the quantity input, and submitting answers. This task delivers the organiser-side definition only.
- **Time slot select** field type (future phase).
- **Free text, number, or date** field types (Phase 4c+).
- **Registration form templates** (reuse across events).
- **Per-option analytics or reporting** beyond basic capacity counts.
- **Waiting list or over-booking** handling — if an option is full, registration for that option is simply blocked.

### Non-Functional Requirements

- **Maximum 5 fields**: the inventory type counts toward the same 5-field limit enforced server-side. Attempting to add a 6th field returns `400 Bad Request`.
- **Forward-compatible storage**: the answer storage model must accommodate a numeric quantity without breaking the existing schema for checkbox and option_select answers. The recommended approach (to be implemented in the follow-up registrant-side task) is adding a `value_number` (PositiveInteger, nullable) column to `RegistrationFieldAnswer` for inventory quantities, keeping `value_boolean` and `value_option` for the existing types.
- **Validation on publish**: when `is_draft=false`, all inventory field settings and option properties must be validated. Draft events skip full validation — consistent with the draft-mode contract established in [#1820](https://github.com/climateconnect/climateconnect/issues/1820).
- **No breaking changes** to existing API contracts. The `fields` array in project detail responses gains a new possible `field_type` value; existing consumers that do not recognise it should ignore the field gracefully.
- **Capacity race safety**: when two guests simultaneously register for the last seats of the same option, the system must not over-sell. The registration endpoint must use an atomic check-and-set pattern (e.g. `select_for_update` on the option or config row) to ensure exactly `available_amount` total units are allocated.
- **Toggle gate**: all new frontend UI must be gated behind `REGISTRATION_CUSTOM_FIELDS`. The toggle state is: dev ✅, staging ✅, production ❌.

### AI Agent Insights and Additions

- **Model — extend `RegistrationFieldOption` with capacity columns**: add `available_amount` (PositiveInteger, nullable) and `max_amount_per_guest` (PositiveInteger, nullable). Both are nullable so that existing checkbox and option_select options (which do not use capacity) do not require back-fill data. For inventory fields, both columns are required at the application level (enforced in the settings serializer and publish validation). No new table is needed.

- **Settings serializer — `InventorySettingsSerializer`**: validates `title` (CharField, max_length=100, required) and `description` (CharField, max_length=200, allow_blank=True, required=False). Register it in `FIELD_TYPE_SETTINGS_VALIDATORS` alongside `CheckboxSettingsSerializer` and `OptionSelectSettingsSerializer`. Unknown keys are stripped.

- **Option serializer — per-type validation**: `RegistrationFieldOptionSerializer` currently validates `title` (max 200) and `order`. For inventory options, the serializer must also validate `available_amount` and `max_amount_per_guest` as positive integers. The cleanest approach is to make these fields always accepted in the serializer (they are ignored for non-inventory types) and enforce their presence in `RegistrationFieldSerializer.validate()` when `field_type == INVENTORY`. This avoids a per-type option serializer subclass.

- **Answer storage — `value_number`**: the recommended approach for storing inventory answers is adding `value_number` (PositiveInteger, nullable) to `RegistrationFieldAnswer`. A single inventory answer row would set `value_option = <selected option>` and `value_number = <quantity>`. This keeps the schema simple, makes `SUM(value_number)` queries fast, and does not affect checkbox or option_select answers which continue to use `value_boolean` and `value_option` respectively. The actual column and migration are out of scope for this organiser-side task; they will be delivered with the follow-up registrant-side spec.

- **Capacity check at registration time** (to be implemented in the follow-up registrant-side task, but the backend guard must be designed now):
  - When a registrant submits an inventory answer, the view must:
  1. Lock the `RegistrationFieldOption` row with `select_for_update()`.
  2. Compute `booked = SUM(value_number)` from all `RegistrationFieldAnswer` rows where `value_option = <selected option>`.
  3. Reject with `400 Bad Request` if `booked + requested_quantity > available_amount`.
  4. Reject with `400 Bad Request` if `requested_quantity > max_amount_per_guest`.
  - Using a dedicated `value_number` column makes the SUM query fast and index-friendly. The follow-up task may alternatively choose to denormalise a `booked_quantity` counter on `RegistrationFieldOption`, but this requires an atomic update and introduces a counter that must stay in sync with `RegistrationFieldAnswer`. The SUM-on-column approach is simpler and race-safe with `select_for_update` on the option row; it should be the default unless performance testing proves otherwise.

- **Available-seats display**: for inventory fields, "available seats" is per-option, not per-event. The project detail response should include, for each inventory option, a computed `remaining_amount` so the frontend can disable fully-booked options. This is additive and does not affect the event-level `available_seats` computation.

- **UI — extend existing option-select editor**: `OptionSelectFieldEditor` is the reference pattern. The inventory variant adds two numeric input columns per option row (`available_amount`, `max_amount_per_guest`). The organiser enters these values when creating the field. Reuse the same add/remove/reorder controls. The frontend type `RegistrationFieldOption` gains `available_amount?: number` and `max_amount_per_guest?: number`.

- **Edit guard — capacity values remain mutable**: unlike text properties (title, description), the organiser may change `available_amount` and `max_amount_per_guest` even when answers exist. The backend does not guard these values. The organiser accepts responsibility for any resulting inconsistencies (e.g. lowering `available_amount` below already-booked quantity). A future enhancement could warn the organiser, but blocking is out of scope.

- **No new toggle**: reuses `REGISTRATION_CUSTOM_FIELDS`. The inventory field type should only appear in the "Add field" type picker when the toggle is enabled — same pattern as checkbox and option_select.

- **Migration**: a single migration adds `available_amount` and `max_amount_per_guest` to `RegistrationFieldOption` as nullable PositiveIntegerFields.

---

## System Impact

- **Actors involved**:
  - `Organiser / Team Admin` — creates or edits an event with inventory fields; defines options, stock limits, and per-guest caps.
  - `System` — enforces the 5-field limit, validates field settings on publish, persists option capacity data, and will enforce per-option capacity at registration time (follow-up task).

- **Entities added**: None.

- **Entities changed**:
  - `RegistrationFieldOption` — gains `available_amount` (PositiveInteger, nullable) and `max_amount_per_guest` (PositiveInteger, nullable).
  - `RegistrationFieldType` — gains `INVENTORY` choice.

- **Flows added**:
  - **Create/Edit Inventory Field** — Organiser adds an inventory field to an event's registration form, defines options with capacity settings, and saves.

- **Flows changed**:
  - **Custom Field Builder** (`RegistrationFieldList`, `RegistrationFieldEditor`) — extended to support the `inventory` type in the type picker and to render an inventory-specific editor.
  - **Project Detail Response** — `event_registration_config.fields` array may now contain `field_type: "inventory"` items with option objects that include `available_amount` and `max_amount_per_guest`.

- **Integration changes**:
  - No new toggle — reuses `REGISTRATION_CUSTOM_FIELDS`.

- **Migrations required**:
  - One migration on `organization.RegistrationFieldOption` to add `available_amount` and `max_amount_per_guest` as nullable PositiveIntegerFields.

---

## Software Architecture

### Data Model

**`RegistrationFieldOption` (extended)**

| Field | Type | Notes |
|-------|------|-------|
| `field` | FK → `RegistrationField` | Existing |
| `title` | CharField(max_length=200) | Existing; inventory uses max 100 at app level |
| `order` | PositiveIntegerField | Existing |
| `available_amount` | PositiveIntegerField, **nullable** | New. Required at app level for inventory options; null for checkbox/option_select options |
| `max_amount_per_guest` | PositiveIntegerField, **nullable** | New. Required at app level for inventory options; null for checkbox/option_select options |

**`RegistrationFieldType` (extended)**

| Value | Label |
|-------|-------|
| `checkbox` | Checkbox |
| `option_select` | Option Select |
| `inventory` | Inventory *(new)* |

**`RegistrationFieldAnswer` (recommended extension for follow-up task)**

| Field | Type | Notes |
|-------|------|-------|
| `value_number` | PositiveIntegerField, **nullable** | New. Stores the quantity for inventory answers; null for checkbox and option_select answers. To be added by the follow-up registrant-side task. |

An inventory answer row would set `value_option = <selected option>` and `value_number = <quantity>`.

### API

**Read — project detail**

`GET /api/projects/{slug}/` → `event_registration_config.fields` array.

Inventory field object shape (additive):

```json
{
  "id": 3,
  "field_type": "inventory",
  "order": 2,
  "is_required": true,
  "settings": {
    "title": "Meal tickets",
    "description": "Select your meal preference and quantity."
  },
  "has_answers": false,
  "options": [
    {
      "id": 20,
      "title": "Vegetarian",
      "order": 0,
      "has_answers": false,
      "available_amount": 50,
      "max_amount_per_guest": 2,
      "remaining_amount": 48
    }
  ]
}
```

`remaining_amount` is a computed read-only field on each inventory option: `available_amount - SUM(booked quantities)`. For non-inventory options it is omitted (or null).

**Write — create event with inventory fields**

`POST /api/projects/` → `event_registration_config.fields` array accepts inventory fields same as checkbox/option_select.

```json
{
  "field_type": "inventory",
  "order": 0,
  "is_required": true,
  "settings": {
    "title": "Meal tickets",
    "description": "How many meals do you need?"
  },
  "options": [
    {
      "title": "Vegetarian",
      "order": 0,
      "available_amount": 50,
      "max_amount_per_guest": 2
    }
  ]
}
```

**Write — edit registration config with inventory fields**

`PATCH /api/projects/{slug}/registration-config/` → `fields` array accepts inventory fields using the same full-sync pattern as existing types.

Sync rules remain unchanged:
- Item with `id` → update existing field and sync its options.
- Item without `id` → create new field and options.
- Existing field absent from the array → delete (CASCADE on answers).

**Validation (publish, `is_draft=false`)**:
- Inventory field: `settings.title` must be non-empty, ≤ 100 chars.
- Inventory field: `settings.description` if present must be ≤ 200 chars.
- Inventory field: must have at least one option.
- Inventory option: `title` non-empty, ≤ 100 chars.
- Inventory option: `available_amount` ≥ 1.
- Inventory option: `max_amount_per_guest` ≥ 1.
- Inventory option: `max_amount_per_guest` ≤ `available_amount` (optional sanity check — can be relaxed if organiser wants per-guest limit higher than total stock, though logically unusual).

**Validation (draft)**: all publish validations are skipped.

**Answer-lock validation** (applies on any PATCH touching an existing inventory field/option):
- Inventory field with `has_answers=true`: reject if submitted `settings.title` differs from stored value.
- Inventory field with `has_answers=true`: `settings.description` changes are **allowed** (description is soft/helper text that does not affect answer integrity).
- Inventory option with `has_answers=true`: reject if submitted `title` differs from stored value.
- `available_amount` and `max_amount_per_guest` are always mutable, even with answers.

**Error responses**:

| Status | Condition |
|--------|-----------|
| `400` | 6th field; inventory with 0 options on publish; missing/invalid title, description, available_amount, max_amount_per_guest; nested field validation error; attempt to change a locked text property on a field or option that has answers |
| `401` | Unauthenticated |
| `403` | Not organiser or team admin |
| `404` | Project not found or no registration config |

### Backend

- **`organization/models/registration_field.py`** — add `INVENTORY` to `RegistrationFieldType`; add `available_amount` and `max_amount_per_guest` to `RegistrationFieldOption`.
- **`organization/serializers/registration_field.py`** — add `InventorySettingsSerializer` to the settings registry; extend `RegistrationFieldOptionSerializer` to accept and return `available_amount` and `max_amount_per_guest`; extend `RegistrationFieldSerializer.validate()` with inventory-specific publish validation and answer-lock guards.
- **`organization/serializers/event_registration.py`** — no direct changes required if the nested `fields` sync already delegates to `RegistrationFieldSerializer` and `sync_fields()`.
- **`organization/views/event_registration_views.py`** — no changes for the organiser-side task. The capacity-enforcement logic will be added in the follow-up registrant-side task.
- **Migration**: `organization/migrations/01XX_registrationfieldoption_capacity.py`.

### Frontend

- **`src/types.ts`** — extend `RegistrationField` type:
  - `field_type` union gains `"inventory"`.
  - `RegistrationFieldOption` gains `available_amount?: number` and `max_amount_per_guest?: number`.
- **`src/components/shareProject/RegistrationFieldList.tsx`** — extend the "Add field" menu to include `inventory` when `REGISTRATION_CUSTOM_FIELDS` is enabled.
- **`src/components/shareProject/RegistrationFieldEditor.tsx`** — add an `inventory` branch that renders the new inventory editor.
- **`src/components/shareProject/InventoryFieldEditor.tsx`** *(new)* — organiser-side editor for inventory fields. Based on `OptionSelectFieldEditor` but each option row has:
  - `title` input (string, required)
  - `available_amount` numeric input (positive integer, required)
  - `max_amount_per_guest` numeric input (positive integer, required)
  - add / delete / reorder controls (same as option_select)
  - option title is read-only when `option.has_answers === true`
  - field-level `title` and `description` inputs at the top of the editor (same pattern as option_select title)
- **`public/texts/project_texts.tsx`** — add translations for inventory field labels (e.g. "Inventory", "Available amount", "Max per guest").

---

## Definition of Done

- [ ] Migration adds `available_amount` and `max_amount_per_guest` to `RegistrationFieldOption` as nullable PositiveIntegerFields.
- [ ] `RegistrationFieldType.INVENTORY` exists and is accepted by the backend.
- [ ] Organiser can create and edit an event with up to 5 custom fields including inventory fields.
- [ ] Inventory field settings (`title`, `description`) and options (`title`, `available_amount`, `max_amount_per_guest`, `order`) are validated on publish and skipped in draft mode.
- [ ] Inventory options are returned in project detail responses with `available_amount`, `max_amount_per_guest`, and `remaining_amount`.
- [ ] Answer-lock guards prevent changing `title` on inventory fields and options that have existing answers.
- [ ] Frontend "Add field" menu includes "Inventory" when `REGISTRATION_CUSTOM_FIELDS` toggle is enabled.
- [ ] Frontend inventory editor allows organiser to define options with capacity and per-guest limits.
- [ ] Backend returns `400 Bad Request` with clear field-level error messages for all validation failures.
- [ ] Existing checkbox and option_select fields continue to work unchanged (regression tests pass).
- [ ] Toggle check `isEnabled("REGISTRATION_CUSTOM_FIELDS")` gates all new UI.
- [ ] `make format` passes on backend; `yarn lint` passes on frontend.
- [ ] Backend tests cover inventory field creation, validation, and answer-lock guards.

---

## Test Plan

### Backend Tests

| Test | Module | What it verifies |
|------|--------|-----------------|
| Create event with inventory field | `organization.tests.test_event_registration` | `POST /api/projects/` accepts inventory nested in `event_registration_config.fields`; options persist with `available_amount` and `max_amount_per_guest` |
| Inventory field validation on publish | `organization.tests.test_event_registration` | `is_draft=false` rejects missing title, 0 options, missing available_amount, or max_amount_per_guest=0 |
| Inventory field draft skip | `organization.tests.test_event_registration` | `is_draft=true` accepts an inventory field with 0 options and missing numeric fields |
| Edit inventory field | `organization.tests.test_event_registration` | `PATCH /api/projects/{slug}/registration-config/` updates inventory settings and options; sync creates/updates/deletes correctly |
| Answer-lock on inventory title | `organization.tests.test_event_registration` | PATCH that changes `settings.title` on an inventory field with answers returns 400 |
| Answer-lock on inventory option title | `organization.tests.test_event_registration` | PATCH that changes `title` on an inventory option with answers returns 400 |
| Capacity values mutable with answers | `organization.tests.test_event_registration` | PATCH that changes `available_amount` or `max_amount_per_guest` on an option with answers succeeds |
| 5-field limit includes inventory | `organization.tests.test_event_registration` | Attempting to add a 6th field (any type) returns 400 |
| Read response shape | `organization.tests.test_event_registration` | `GET /api/projects/{slug}/` returns inventory fields with all new columns and `remaining_amount` |

### Frontend Tests

| Test | Module | What it verifies |
|------|--------|-----------------|
| Inventory appears in add menu | `RegistrationFieldList.test.tsx` | When toggle is on, the "Add field" menu contains an "Inventory" item |
| Inventory editor renders | `InventoryFieldEditor.test.tsx` *(new)* | Given an inventory field, the editor shows title input, description input, and option rows with numeric inputs |
| Option capacity inputs validate | `InventoryFieldEditor.test.tsx` | Entering 0 or negative numbers in available_amount is rejected at the form level (or passed to backend) |
| Read-only option title with answers | `InventoryFieldEditor.test.tsx` | Option title input is disabled when `has_answers=true` |
| Read-only field title with answers | `InventoryFieldEditor.test.tsx` | Field title input is disabled when `has_answers=true` |

---

## Files Changed

### Backend

| File | Change |
|------|--------|
| `organization/models/registration_field.py` | Add `INVENTORY` to `RegistrationFieldType`; add `available_amount` and `max_amount_per_guest` to `RegistrationFieldOption` |
| `organization/serializers/registration_field.py` | Add `InventorySettingsSerializer`; extend option serializer with new fields; add inventory validation and answer-lock guards |
| `organization/serializers/event_registration.py` | May need minor extension if the field-sync logic needs inventory-specific handling (likely none) |
| `organization/tests/test_event_registration.py` | Add inventory field tests |
| `organization/migrations/` | New migration for `RegistrationFieldOption` capacity columns |

### Frontend

| File | Change |
|------|--------|
| `src/types.ts` | Extend `RegistrationField` and `RegistrationFieldOption` types |
| `src/components/shareProject/RegistrationFieldList.tsx` | Add `inventory` to add-menu type picker |
| `src/components/shareProject/RegistrationFieldEditor.tsx` | Add `inventory` branch |
| `src/components/shareProject/InventoryFieldEditor.tsx` | New component for inventory field editing |
| `public/texts/project_texts.tsx` | Add inventory field labels |
| `src/components/shareProject/RegistrationFieldList.test.tsx` | Update tests to cover inventory in menu |

---

## Notes and Open Questions

1. **Capacity oversell edge case**: if an organiser lowers `available_amount` below the already-booked total, the system will be in an over-sold state. This is acceptable for Phase 4b — the organiser is responsible. A future enhancement could surface a warning banner in the organiser UI.
2. **Per-guest max > available amount**: the validation may permit `max_amount_per_guest > available_amount` because the organiser might want to allow a guest to claim the entire stock. This is functionally equivalent to `max_amount_per_guest = available_amount`; no backend guard is needed unless product decides otherwise.
3. **Registration-time capacity logic** (follow-up task): the actual enforcement of `remaining_amount >= requested_quantity` and `requested_quantity <= max_amount_per_guest` at the `POST /api/projects/{slug}/register/` endpoint is **out of scope for this task** and will be specified in the registrant-side follow-up spec.
4. **Answer storage migration**: a migration adding `value_number` to `RegistrationFieldAnswer` will be delivered with the follow-up registrant-side task. The organiser-side task (this spec) does not create or modify `RegistrationFieldAnswer`.
5. **Remaining amount computation**: `remaining_amount` in the API read response is computed as `available_amount - SUM(value_number)` from `RegistrationFieldAnswer` rows linked to the option via `value_option`. A database index on `value_option` is advisable to keep this aggregation fast.

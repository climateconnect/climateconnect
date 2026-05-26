# Add Inventory Field to Event Registration (Phase 4b — Registrant)

**Status**: DRAFT
**Type**: Feature
**Date and time created**: 2026-05-26 13:47
**GitHub Issue**: [#2004](https://github.com/climateconnect/climateconnect/issues/2004)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260519_1328_inventory_field_type_event_registration.md`](./20260519_1328_inventory_field_type_event_registration.md) ← organiser-side field definition (#1995)
- [`20260512_1015_register_for_event_with_extra_fields.md`](./20260512_1015_register_for_event_with_extra_fields.md) ← existing registrant-side answer storage (#1960)
- [`20260416_1000_event_registration_custom_fields.md`](./20260416_1000_event_registration_custom_fields.md) ← foundational custom fields spec (#1880)

**Depends on**: [#1995](https://github.com/climateconnect/climateconnect/issues/1995) (organiser-side inventory field definition must be merged first)

---

## Problem Statement

Event organisers can already define inventory fields on their event registration form (delivered in #1995) — fields where each option has a stock limit and a per-guest maximum. However, when a guest registers for such an event, the registration form does not display these inventory fields. Guests cannot select an inventory option or specify a quantity, and the platform cannot persist inventory answers.

This task completes the registrant side of the Phase 4b inventory field type. It extends the existing event registration flow so a guest can:

1. See available inventory options with their remaining capacity.
2. Select one option and enter a quantity.
3. Submit the answer, which the system validates and stores atomically with the registration.

The system must enforce per-option capacity at submission time — preventing over-booking even under concurrent registrations.

**Core Requirements (from #2004):**

- When an event has an inventory field, the registration form shows all options with their remaining available amount.
- The guest selects one option, then enters a quantity.
- The quantity must be ≤ `max_amount_per_guest` for the selected option.
- Corner case: when `remaining_amount < max_amount_per_guest`, the guest can only select up to `remaining_amount`.
- If an option is fully booked (`remaining_amount = 0`), it must appear disabled or unavailable.
- On submit, the system stores the selected option and quantity. It validates atomically that the requested amount is still available.
- Required inventory fields must have both an option selected and a quantity ≥ 1.

**Explicitly Out of Scope:**

- Organiser-side field definition ([#1995](https://github.com/climateconnect/climateconnect/issues/1995) — already delivered).
- Multi-option selection (guest picks ONE option per inventory field).
- Editing answers after registration (future task).
- Export/reporting of inventory answers (future task).
- Waiting list or over-booking handling.

### Non-Functional Requirements

- **Backward-compatible API**: `POST /api/projects/{slug}/registrations/` must remain valid for events without inventory fields. Existing payload-less clients continue to work.
- **Atomic persistence**: answer storage must happen in the same database transaction as registration creation and seat allocation.
- **Race-safe capacity enforcement**: two guests registering simultaneously for the same inventory option must not over-book. The system must use an atomic check-and-set pattern (`select_for_update()` on the option row + `SUM(value_number)`).
- **Server-side validation**: capacity constraints, required fields, and option ownership must be validated on the backend. Frontend validation is advisory only.
- **No feature toggle on registrant side**: the guest registration form renders any configured custom fields regardless of the `REGISTRATION_CUSTOM_FIELDS` toggle state. The toggle only gates the organiser-side create/edit of custom fields. This allows the team to create events with custom fields in a controlled way (e.g. staging, specific events) and have guests use them immediately, without enabling custom field creation for all organisers. The existing `REGISTRATION_CUSTOM_FIELDS` check in `EventRegistrationModal.tsx` should be removed as part of this task — the modal should render fields whenever `project.registration_config.fields` is non-empty.

### AI Agent Insights and Additions

- **Add `value_number` to `RegistrationFieldAnswer`**: a `PositiveIntegerField(null=True, blank=True)` column. An inventory answer sets `value_option = <selected option>` and `value_number = <quantity>`. Existing checkbox (`value_boolean`) and option_select (`value_option` only) answers are unaffected. A single migration adds the column.

- **Add `remaining_amount` to `RegistrationFieldOptionSerializer`**: a `SerializerMethodField` that computes `available_amount - SUM(value_number)` from active `RegistrationFieldAnswer` rows (where `registration.cancelled_at IS NULL`). Returns `null` when `available_amount` is null (unlimited). Only meaningful for inventory options; returns `null` for other types. This field is read-only and computed per-request — no denormalised counter to keep in sync.

- **Extend `RegistrationFieldAnswerInputSerializer`**: add optional `value_number` (IntegerField, min_value=1, allow_null=True). The existing validation that enforces "exactly one of value_boolean or value_option" must be updated to allow both `value_option` AND `value_number` for inventory answers.

- **Extend `EventRegistrationSubmissionSerializer.validate()`**: add `INVENTORY` branch:
  - Requires both `value_option` and `value_number`.
  - `value_number` must be ≥ 1 and ≤ `max_amount_per_guest` for the selected option.
  - `value_option` must be a valid option belonging to the field.
  - Capacity check (`booked + requested ≤ available_amount`) is NOT done in the serializer — it's done in the view with `select_for_update()` to be race-safe.

- **Capacity enforcement in the view**: after the existing event-level capacity check and answer validation, add per-option capacity checks for inventory answers:
  1. Collect all inventory answer option IDs from the validated payload.
  2. Lock those option rows in a single query: `RegistrationFieldOption.objects.filter(id__in=option_ids).select_for_update().order_by('id')`. Ordering by `id` prevents deadlocks when a registration includes multiple inventory fields.
  3. For each inventory answer, compute `booked = SUM(value_number)` from `RegistrationFieldAnswer` rows where `value_option = option` AND `registration.cancelled_at IS NULL`.
  4. If `booked + requested_quantity > available_amount`, reject with a field-specific error indicating how many are actually remaining.
  5. This runs within the existing transaction (after config lock, before registration row creation).

- **Frontend — `RegistrationInventoryField` component**: new component rendered by `RegistrationFieldAnswersForm` for `field_type === "inventory"`. Displays:
  - Field title (`field.settings.title`) as question label.
  - Field description (`field.settings.description`) as helper text (if present).
  - Options as a **dropdown** (`SelectField`), each option label showing `{title} ({remaining_amount} available)`. Dropdown is mobile-friendly and fits the modal layout. Options with `remaining_amount === 0` are disabled.
  - When an option is selected, a numeric quantity input appears **empty** (no default value; user must enter explicitly) with `min=1`, `max=min(max_amount_per_guest, remaining_amount)`.
  - Required field validation: error if no option selected or quantity is 0 or missing.
  - On capacity conflict (backend rejects), the field-specific error is displayed inline — no auto-refresh of remaining amounts (rare corner case; user can retry).

- **Frontend state**: extend `RegistrationFieldAnswersForm` with `inventoryValues: Record<number, { optionId: number; quantity: number }>` keyed by field ID. The `validate()` function checks inventory fields. The answer builder outputs `{ field, value_option, value_number }` for each inventory answer.

- **Frontend types**: extend `RegistrationFieldAnswerValue` with `valueNumber?: number`. The `RegistrationFieldOption` type already has `remaining_amount?: number`.

---

## System Impact

- **Actors involved**:
  - `Guest / Member` — sees inventory fields on the registration form, selects an option, enters a quantity, submits.
  - `System` — validates answers, enforces per-option capacity atomically, persists answers with the registration.

- **Entities changed**:
  - `RegistrationFieldAnswer` — gains `value_number` (PositiveIntegerField, nullable).

- **Flows changed**:
  - **Member Event Registration Flow** — authenticated confirmation step now renders inventory fields and collects option + quantity.
  - **Registration API** — `POST /registrations/` accepts and validates inventory answers; enforces per-option capacity.

- **Migrations required**:
  - One migration adding `value_number` to `RegistrationFieldAnswer`.

---

## Software Architecture

### Data Model

**`RegistrationFieldAnswer` (extended)**

| Field | Type | Notes |
|-------|------|-------|
| `registration` | FK → `EventRegistration` | Existing |
| `field` | FK → `RegistrationField` | Existing |
| `value_boolean` | BooleanField, nullable | Existing — checkbox |
| `value_option` | FK → `RegistrationFieldOption`, nullable | Existing — option_select and inventory |
| `value_number` | PositiveIntegerField, **nullable** | **New** — inventory quantity. Null for checkbox and option_select answers. |
| `created_at` | DateTimeField | Existing |
| `updated_at` | DateTimeField | Existing |

An inventory answer row: `value_option = <selected option>`, `value_number = <quantity>`, `value_boolean = NULL`.

**`RegistrationFieldOption` — no schema change**

`available_amount` and `max_amount_per_guest` already exist (added by [#1995](https://github.com/climateconnect/climateconnect/issues/1995)). `remaining_amount` is a computed serializer field, not a database column.

### API

**Read — project detail (extended)**

`GET /api/projects/{slug}/` → `event_registration_config.fields[].options[]` now includes `remaining_amount` for inventory options:

```json
{
  "id": 20,
  "title": "Vegetarian",
  "order": 0,
  "has_answers": false,
  "available_amount": 50,
  "max_amount_per_guest": 2,
  "remaining_amount": 48
}
```

`remaining_amount` computation: `available_amount - SUM(value_number)` from `RegistrationFieldAnswer` rows where `value_option = this option` AND `registration.cancelled_at IS NULL`. Returns `null` when `available_amount` is null (unlimited capacity).

**Write — registration with inventory answers**

`POST /api/projects/{slug}/registrations/` — request body extended:

```json
{
  "answers": [
    { "field": 1, "value_boolean": true },
    { "field": 2, "value_option": 44 },
    { "field": 3, "value_option": 20, "value_number": 2 }
  ]
}
```

Inventory answer contract:
- Both `value_option` and `value_number` are required for inventory fields.
- `value_option` must be a valid option ID belonging to the field.
- `value_number` must be ≥ 1.
- `value_number` must be ≤ `max_amount_per_guest` for the selected option.
- Capacity enforcement (`booked + value_number ≤ available_amount`) is validated in the view with row-level locking.

**Validation rules (inventory-specific)**:

| Rule | Where | Details |
|------|-------|---------|
| `value_option` required | Serializer | Inventory answer must include a selected option |
| `value_number` required | Serializer | Inventory answer must include a quantity |
| `value_number ≥ 1` | Serializer | Quantity must be at least 1 |
| `value_number ≤ max_amount_per_guest` | Serializer | Quantity must not exceed per-guest limit |
| `value_option` belongs to field | Serializer | Option must be a valid option for this field |
| `booked + value_number ≤ available_amount` | View (with lock) | Atomic capacity check — race-safe |
| Required field present | Serializer | Required inventory field must have both option and quantity |

**Error responses**:

| Status | Condition |
|--------|-----------|
| `400` | Missing `value_option` or `value_number`; `value_number` < 1; `value_number` > `max_amount_per_guest`; option belongs to different field; capacity exceeded |
| `401` | Unauthenticated |
| `403` | Registration closed/full or admin-cancelled |
| `404` | Project not found |

Field-specific errors returned as:
```json
{
  "field_errors": {
    "3": "Only 2 items remaining for the selected option."
  }
}
```

**Idempotency / re-registration semantics** — unchanged from [#1960](https://github.com/climateconnect/climateconnect/issues/1960):
- Active registration → `200 OK`; no answer mutation.
- Self-cancelled → reactivate and sync answers (including inventory).
- Admin-cancelled → `403 Forbidden`.

### Backend

- **`organization/models/event_registration.py`** — add `value_number = PositiveIntegerField(null=True, blank=True)` to `RegistrationFieldAnswer`.
- **`organization/serializers/registration_field.py`** — add `remaining_amount` SerializerMethodField to `RegistrationFieldOptionSerializer`.
- **`organization/serializers/event_registration.py`**:
  - Extend `RegistrationFieldAnswerInputSerializer` to accept optional `value_number`.
  - Update `EventRegistrationSubmissionSerializer.validate()` to handle `INVENTORY` type.
  - Update `EventRegistrationSerializer` to include `value_number` in `field_answers` read output.
- **`organization/views/event_registration_views.py`** — add per-option capacity enforcement after answer validation: lock option rows with `select_for_update().order_by('id')`, compute booked amounts, reject if insufficient.
- **`organization/tests/test_event_registration.py`** — add tests for inventory answer submission, capacity enforcement, and edge cases.
- **Migration**: `organization/migrations/0XXX_registrationfieldanswer_value_number.py`.

### Frontend

- **`src/types.ts`** — extend `RegistrationFieldAnswerValue` with `valueNumber?: number`.
- **`src/components/project/RegistrationInventoryField.tsx`** *(new)* — renders inventory field during registration:
  - Field title as question label.
  - Field description as helper text (if present).
  - Options as **dropdown** (`SelectField`), each showing title + remaining amount. Options with `remaining_amount === 0` disabled.
  - When option selected, shows numeric quantity input (empty default).
  - Required field validation.
- **`src/components/project/RegistrationFieldAnswersForm.tsx`** — extend to:
  - Add `inventoryValues: Record<number, { optionId: number; quantity: number }>` state.
  - Dispatch to `RegistrationInventoryField` for `field_type === "inventory"`.
  - Update `validate()` to check inventory fields.
  - Update answer payload construction to include `value_option` + `value_number`.
- **`src/components/project/EventRegistrationModal.tsx`** — remove the `REGISTRATION_CUSTOM_FIELDS` toggle check from the authenticated confirmation step. Custom fields should render whenever `project.registration_config.fields` is non-empty, regardless of toggle state. The `EVENT_REGISTRATION` toggle check remains.
- **`public/texts/project_texts.tsx`** — add text keys for inventory field labels.

---

## Test Plan

### Backend Tests

| Test | What it verifies |
|------|-----------------|
| Register with inventory answer (valid) | `POST /registrations/` accepts `value_option` + `value_number`; answer stored correctly |
| Register without inventory answer for required field | `400` — required field missing |
| Register with `value_number = 0` | `400` — quantity must be ≥ 1 |
| Register with `value_number > max_amount_per_guest` | `400` — exceeds per-guest limit |
| Register with `value_option` from different field | `400` — option ownership check |
| Register when option is fully booked | `400` — capacity exceeded with field-specific error |
| Concurrent registrations for same option | No over-booking — race-safe enforcement |
| Remaining amount computation | `GET /projects/{slug}/` returns correct `remaining_amount` per option |
| Remaining amount with cancelled registrations | Cancelled registrations don't count toward booked amount |
| Re-register (active, idempotent) | `200 OK`; no answer mutation |
| Re-register (self-cancelled) | Reactivated; inventory answer synced |
| Register for event with no inventory fields | Existing behaviour preserved (backward-compatible) |

### Frontend Tests

| Test | What it verifies |
|------|-----------------|
| Inventory field renders as dropdown with remaining amounts | Options shown in dropdown with correct labels and availability |
| Fully booked option is disabled | Option with `remaining_amount === 0` cannot be selected in dropdown |
| Quantity input starts empty | No default value; user must enter explicitly |
| Quantity input max capped by remaining | When `remaining_amount < max_amount_per_guest`, max = remaining |
| Required field validation | Error shown if no option selected or quantity is empty/0 |
| Capacity conflict error displayed inline | Backend rejection message shown on the field; no auto-refresh |
| Fields render without toggle check | Custom fields render when `REGISTRATION_CUSTOM_FIELDS` is disabled but event has fields configured |
| Payload includes value_option and value_number | POST body correct |

---

## Files Changed

### Backend

| File | Change |
|------|--------|
| `organization/models/event_registration.py` | Add `value_number` to `RegistrationFieldAnswer` |
| `organization/serializers/registration_field.py` | Add `remaining_amount` to `RegistrationFieldOptionSerializer` |
| `organization/serializers/event_registration.py` | Extend input serializer and submission validation for inventory; include `value_number` in read output |
| `organization/views/event_registration_views.py` | Add per-option capacity enforcement with `select_for_update()` |
| `organization/tests/test_event_registration.py` | Add inventory answer and capacity tests |
| `organization/migrations/` | New migration for `value_number` column |

### Frontend

| File | Change |
|------|--------|
| `src/types.ts` | Extend `RegistrationFieldAnswerValue` with `valueNumber` |
| `src/components/project/RegistrationInventoryField.tsx` | New component for inventory field rendering |
| `src/components/project/RegistrationFieldAnswersForm.tsx` | Add inventory state, dispatch, validation, and payload |
| `src/components/project/EventRegistrationModal.tsx` | Remove `REGISTRATION_CUSTOM_FIELDS` toggle check from authenticated confirmation step |
| `public/texts/project_texts.tsx` | Add inventory field text keys |

---

## Definition of Done

- [ ] `value_number` column added to `RegistrationFieldAnswer` via migration.
- [ ] `remaining_amount` computed field on `RegistrationFieldOptionSerializer` returns correct values.
- [ ] `POST /registrations/` accepts inventory answers with `value_option` + `value_number`.
- [ ] Per-option capacity enforced atomically — no over-booking under concurrent load.
- [ ] `max_amount_per_guest` validated in the serializer.
- [ ] Required inventory fields validated (option + quantity both present).
- [ ] Field-specific error messages returned for capacity and validation failures.
- [ ] Frontend renders inventory fields with remaining amounts in the registration form.
- [ ] Options with `remaining_amount === 0` are disabled in the UI.
- [ ] Quantity input capped at `min(max_amount_per_guest, remaining_amount)`.
- [ ] Existing checkbox and option_select registration flows unaffected (regression tests pass).
- [ ] `REGISTRATION_CUSTOM_FIELDS` toggle check removed from `EventRegistrationModal.tsx` — fields render when present regardless of toggle.
- [ ] `make format` passes on backend; `yarn lint` passes on frontend.
- [ ] Backend tests cover inventory answer submission, capacity enforcement, and edge cases.

---

## Notes and Open Questions

1. **Dropdown, not radio group**: option selection uses a dropdown (`SelectField`) rather than radio buttons. Decision rationale: mobile-friendly, fits the modal layout. Each dropdown option label includes the remaining amount (e.g. "Vegetarian (48 available)").
2. **Empty quantity default**: the quantity input starts empty — no pre-filled value. The user must explicitly enter a number. This prevents accidental over-booking from accepting a default.
3. **Simple error on capacity conflict**: when a submission fails due to insufficient capacity (another guest booked in the meantime), the field-specific error is displayed inline. No auto-refresh of remaining amounts — the user can retry. This is a rare corner case.
4. **No toggle on registrant side**: the `REGISTRATION_CUSTOM_FIELDS` toggle gates only the organiser-side create/edit of custom fields. The guest registration form renders any configured fields regardless of toggle state. This allows controlled rollout: create events with custom fields in a selective way (e.g. staging, specific orgs) and have guests use them immediately, without enabling custom field creation for all organisers. The existing toggle check in `EventRegistrationModal.tsx` is removed as part of this task.
5. **Capacity oversell on option edit**: if an organiser lowers `available_amount` below already-booked quantity (via [#1995](https://github.com/climateconnect/climateconnect/issues/1995) edit flow), the system enters an over-sold state. This is acceptable — the organiser is responsible. Does not affect #2004.
5. **Multi-option selection**: current requirements specify single-select (one option per inventory field). A future enhancement could allow multi-select but would require a different answer schema (multiple rows per field) — out of scope.
6. **Remaining amount on list endpoint**: `remaining_amount` is only computed for the detail endpoint (`GET /projects/{slug}/`). The list endpoint does not include field-level option data. Consistent with existing pattern where `available_seats` is excluded from list responses.
7. **Re-registration with different option**: if a guest re-registers after self-cancellation with a different inventory option, the existing answer row is updated in place via the `unique_together = (registration, field)` constraint. The sync function sets `value_option` and `value_number` to the new values.
8. **`remaining_amount` depends on `value_number`**: this field can only be computed correctly once `value_number` exists on `RegistrationFieldAnswer`. Before #2004, all inventory options would appear to have full availability (SUM returns 0). This is acceptable — the organiser-side task (#1995) does not need `remaining_amount` because it does not display it.

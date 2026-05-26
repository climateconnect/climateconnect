# Add Time Slot Field to Event Registration (Phase 4c — Registrant)

**Status**: DRAFT
**Type**: Feature
**Date and time created**: 2026-05-26 15:30
**GitHub Issue**: [#2007](https://github.com/climateconnect/climateconnect/issues/2007)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260526_1100_time_slot_field_type_event_registration.md`](./20260526_1100_time_slot_field_type_event_registration.md) ← organiser-side field definition (#2006)
- [`20260526_1347_add_inventory_field_to_event_registration.md`](./20260526_1347_add_inventory_field_to_event_registration.md) ← registrant-side inventory field (#2004) — closest structural analogue
- [`20260512_1015_register_for_event_with_extra_fields.md`](./20260512_1015_register_for_event_with_extra_fields.md) ← existing registrant-side answer storage (#1960)
- [`20260416_1000_event_registration_custom_fields.md`](./20260416_1000_event_registration_custom_fields.md) ← foundational custom fields spec (#1880)

**Depends on**: [#2006](https://github.com/climateconnect/climateconnect/issues/2006) (organiser-side time slot field definition must be merged first)

---

## Problem Statement

Event organisers can already define time slot fields on their event registration form (delivered in #2006) — fields where each option represents a time window with a start time, end time, and optional per-slot capacity. However, when a guest registers for such an event, the registration form does not display these time slot fields. Guests cannot select a time slot, and the platform cannot persist their slot selection.

This task completes the registrant side of the Phase 4c time slot field type. It extends the existing event registration flow so a guest can:

1. See available time slots with their remaining capacity.
2. Select one slot.
3. Submit the answer, which the system validates and stores atomically with the registration.

The system must enforce per-slot capacity at submission time — preventing over-booking even under concurrent registrations.

**Core Requirements (from #2007):**

- When an event has one or more time slot fields, the registration form shows the field with its title and optional description.
- It offers a single-select control that displays the time slots and the available number of seats per slot.
- If no seats are left for a time slot, that option is disabled.
- On submit, the system stores the guest's chosen time slot. The system double-checks that the seat was still available upon submit (atomic capacity enforcement).
- Entering values for this field is not gated by a feature toggle. If the event has registration fields of this type, show the input.

**Explicitly Out of Scope:**

- Organiser-side field definition ([#2006](https://github.com/climateconnect/climateconnect/issues/2006) — already delivered).
- Multi-slot selection (guest picks ONE time slot per time slot field).
- Editing answers after registration (future task).
- Export/reporting of time slot answers (future task).
- Waiting list or over-booking handling.

### Non-Functional Requirements

- **Backward-compatible API**: `POST /api/projects/{slug}/registrations/` must remain valid for events without time slot fields. Existing payload-less clients continue to work.
- **Atomic persistence**: answer storage must happen in the same database transaction as registration creation and seat allocation.
- **Race-safe capacity enforcement**: two guests registering simultaneously for the last seats of the same time slot must not over-book. The system must use an atomic check-and-set pattern (`select_for_update()` on the option row + COUNT of active registrations for that option).
- **Server-side validation**: capacity constraints, required fields, and option ownership must be validated on the backend. Frontend validation is advisory only.
- **No feature toggle on registrant side**: the guest registration form renders any configured custom fields regardless of the `REGISTRATION_CUSTOM_FIELDS` toggle state. This is consistent with the inventory field registrant-side approach (#2004) — the toggle only gates the organiser-side create/edit of custom fields.

### AI Agent Insights and Additions

- **Answer storage — reuses `value_option`**: a time slot answer row sets `value_option = <selected time slot option>` and leaves `value_boolean` and `value_number` as null. This is identical to how option_select answers work. No schema change to `RegistrationFieldAnswer` is needed. The `value_number` column (added for inventory in #2004) is available if a future enhancement needs per-guest quantity for time slots (e.g. "book 3 seats at the 10:00 workshop"), but the current requirements specify single-slot selection.

- **`remaining_amount` already computed**: the `RegistrationFieldOptionSerializer` (from #2004) already includes a `remaining_amount` SerializerMethodField that computes `available_amount - COUNT(active answers)` for options where `available_amount IS NOT NULL`. For time slot options this works identically — `remaining_amount = available_amount - COUNT(RegistrationFieldAnswer rows where value_option = this option AND registration.cancelled_at IS NULL)`. When `available_amount` is null (unlimited capacity), `remaining_amount` returns null. No serializer changes needed.

- **Extend `EventRegistrationSubmissionSerializer.validate()`**: add a `TIME_SLOT_SELECT` branch:
  - Requires `value_option` (the selected time slot option ID).
  - `value_number` and `value_boolean` must be null/omitted.
  - `value_option` must be a valid option belonging to the field.
  - Capacity check (`booked < available_amount`) is NOT done in the serializer — it's done in the view with `select_for_update()` to be race-safe.

- **Capacity enforcement in the view**: after the existing event-level capacity check and answer validation, add per-option capacity checks for time slot answers. The pattern is identical to inventory capacity enforcement (#2004):
  1. Collect all time slot answer option IDs from the validated payload.
  2. Lock those option rows in a single query: `RegistrationFieldOption.objects.filter(id__in=option_ids).select_for_update().order_by('id')`. Ordering by `id` prevents deadlocks when a registration includes multiple time slot or inventory fields.
  3. For each time slot answer, compute `booked = COUNT(registrations)` from `RegistrationFieldAnswer` rows where `value_option = option` AND `registration.cancelled_at IS NULL`.
  4. If `available_amount IS NOT NULL AND booked >= available_amount`, reject with a field-specific error indicating the slot is full.
  5. This runs within the existing transaction (after config lock, before registration row creation).

- **Frontend — `RegistrationTimeSlotField` component**: new component rendered by `RegistrationFieldAnswersForm` for `field_type === "time_slot_select"`. Displays:
  - Field title (`field.settings.title`) as question label. Note: the `label` property on `RegistrationField` is the organiser-facing admin label (Phase 4x / #1997) and is NOT used for end-user views — consistent with checkbox, option_select, and inventory.
  - Field description (`field.settings.description`) as helper text (if present).
  - Options as a **native HTML `<select>` element** (same as inventory), each option label showing a human-readable time range (auto-generated from `start_time`/`end_time`) plus the remaining capacity (e.g. "(18 seats available)"). Native `<select>` is more mobile-friendly than a custom dropdown and matches the inventory field approach. When `available_amount` is null (unlimited), omit the seat count from the label. Options with `remaining_amount === 0` are disabled.
  - Required field validation: error if no slot selected.
  - On capacity conflict (backend rejects), the field-specific error is displayed inline — no auto-refresh of remaining amounts (rare corner case; user can retry).

- **Frontend time range display**: the frontend auto-generates a human-readable label from `start_time`/`end_time` using the viewer's **browser locale** and timezone (via `Intl.DateTimeFormat` or equivalent). The format must be fully localized — date and time format, day/month names, and AM/PM vs 24h all follow the user's locale settings. The label should be concise enough for a `<select>` option while being unambiguous about date and time. Example for en-US: "Mon, Jun 15, 10:00 AM – 12:00 PM". Example for de-DE: "Mo., 15. Juni, 10:00–12:00".

- **Frontend state**: extend `RegistrationFieldAnswersForm` (already exists from #2004) with `timeSlotValues: Record<number, number>` keyed by field ID, storing the selected option ID. The `validate()` function checks time slot fields. The answer builder outputs `{ field, value_option }` for each time slot answer.

- **Frontend types**: no type changes needed. `RegistrationFieldOption` already has `start_time`, `end_time`, `available_amount`, and `remaining_amount` from #2006 and #2004. `RegistrationFieldAnswerValue` already has `valueOption?: number` from #1960.

---

## System Impact

- **Actors involved**:
  - `Guest / Member` — sees time slot fields on the registration form, selects a slot, submits.
  - `System` — validates answers, enforces per-slot capacity atomically, persists answers with the registration.

- **Entities changed**: None (no schema changes).

- **Flows changed**:
  - **Member Event Registration Flow** — authenticated confirmation step now renders time slot fields and collects the selected slot.
  - **Registration API** — `POST /registrations/` accepts and validates time slot answers; enforces per-slot capacity.

- **Migrations required**: None. All necessary columns (`start_time`, `end_time`, `available_amount` on `RegistrationFieldOption`; `value_option` on `RegistrationFieldAnswer`) already exist.

---

## Software Architecture

### Data Model

No schema changes. Time slot answers use the existing `RegistrationFieldAnswer` columns:

| Field | Value for time slot answer | Notes |
|-------|---------------------------|-------|
| `value_option` | FK to selected `RegistrationFieldOption` | The chosen time slot |
| `value_boolean` | `NULL` | Not used |
| `value_number` | `NULL` | Not used (single-slot selection; no quantity) |

### API

**Read — project detail (already working)**

`GET /api/projects/{slug}/` → `event_registration_config.fields[]` already returns time slot fields with `start_time`, `end_time`, `available_amount`, and `remaining_amount` per option (delivered in #2006). No changes needed.

**Write — registration with time slot answers**

`POST /api/projects/{slug}/registrations/` — request body extended:

```json
{
  "answers": [
    { "field": 1, "value_boolean": true },
    { "field": 2, "value_option": 44 },
    { "field": 3, "value_option": 20, "value_number": 2 },
    { "field": 5, "value_option": 30 }
  ]
}
```

Field 5 is a time slot answer: `value_option` points to the selected time slot option. No `value_number` or `value_boolean`.

Time slot answer contract:
- `value_option` is required for time slot fields.
- `value_number` and `value_boolean` must be null/omitted.
- `value_option` must be a valid option ID belonging to the field.
- Capacity enforcement (`booked < available_amount`) is validated in the view with row-level locking.

**Validation rules (time slot-specific)**:

| Rule | Where | Details |
|------|-------|---------|
| `value_option` required | Serializer | Time slot answer must include a selected option |
| `value_number` omitted | Serializer | Must be null/omitted for time slot answers |
| `value_boolean` omitted | Serializer | Must be null/omitted for time slot answers |
| `value_option` belongs to field | Serializer | Option must be a valid option for this field |
| `booked < available_amount` | View (with lock) | Atomic capacity check — race-safe. Only checked when `available_amount` is not null |
| Required field present | Serializer | Required time slot field must have an option selected |

**Error responses**:

| Status | Condition |
|--------|-----------|
| `400` | Missing `value_option`; `value_number` or `value_boolean` provided; option belongs to different field; capacity exceeded (slot full) |
| `401` | Unauthenticated |
| `403` | Registration closed/full or admin-cancelled |
| `404` | Project not found |

Field-specific errors returned as:
```json
{
  "field_errors": {
    "5": "This time slot is fully booked. Please select a different slot."
  }
}
```

**Idempotency / re-registration semantics** — unchanged from #1960 and #2004:
- Active registration → `200 OK`; no answer mutation.
- Self-cancelled → reactivate and sync answers (including time slot).
- Admin-cancelled → `403 Forbidden`.

### Backend

- **`organization/serializers/event_registration.py`**:
  - Extend `EventRegistrationSubmissionSerializer.validate()` to handle `TIME_SLOT_SELECT` type: require `value_option`, reject `value_number` and `value_boolean`, validate option belongs to field.
  - No changes to `RegistrationFieldAnswerInputSerializer` — `value_option` is already accepted.
  - No changes to `RegistrationFieldOptionSerializer` — `remaining_amount` already computed for all options with `available_amount`.
- **`organization/views/event_registration_views.py`** — extend per-option capacity enforcement to include time slot options alongside inventory options. The `select_for_update()` locking pattern is identical; merge the option ID collection to include both inventory and time slot option IDs.
- **`organization/tests/test_event_registration.py`** — add tests for time slot answer submission, capacity enforcement, and edge cases.

### Frontend

- **`src/components/project/RegistrationTimeSlotField.tsx`** *(new)* — renders time slot field during registration:
  - Field title (`field.settings.title`) as question label (not `label` — that is admin-only).
  - Field description (`field.settings.description`) as helper text (if present).
  - Options as **native `<select>` element**, each showing a localized human-readable time range (auto-generated from `start_time`/`end_time` via `Intl.DateTimeFormat`) plus remaining capacity when applicable. Options with `remaining_amount === 0` disabled.
  - Required field validation.
- **`src/components/project/RegistrationFieldAnswersForm.tsx`** — extend to:
  - Add `timeSlotValues: Record<number, number>` state (field ID → selected option ID).
  - Dispatch to `RegistrationTimeSlotField` for `field_type === "time_slot_select"`.
  - Update `validate()` to check time slot fields.
  - Update answer payload construction to include `value_option` for time slot answers.
- **`public/texts/project_texts.tsx`** — add text keys for time slot field labels (e.g. "Select a time slot", "Seats available", "This time slot is fully booked").

---

## Test Plan

### Backend Tests

| Test | What it verifies |
|------|-----------------|
| Register with time slot answer (valid) | `POST /registrations/` accepts `value_option` for time slot field; answer stored correctly |
| Register without time slot answer for required field | `400` — required field missing |
| Register with `value_number` for time slot field | `400` — time slot answers must not include value_number |
| Register with `value_boolean` for time slot field | `400` — time slot answers must not include value_boolean |
| Register with `value_option` from different field | `400` — option ownership check |
| Register when time slot is fully booked | `400` — capacity exceeded with field-specific error |
| Concurrent registrations for same time slot | No over-booking — race-safe enforcement |
| Remaining amount computation for time slots | `GET /projects/{slug}/` returns correct `remaining_amount` per time slot option |
| Remaining amount with cancelled registrations | Cancelled registrations don't count toward booked amount |
| Unlimited capacity time slot (available_amount=null) | Registration succeeds; remaining_amount is null |
| Re-register (active, idempotent) | `200 OK`; no answer mutation |
| Re-register (self-cancelled) | Reactivated; time slot answer synced |
| Register for event with no time slot fields | Existing behaviour preserved (backward-compatible) |
| Register with mixed field types (checkbox + time slot + inventory) | All answers stored correctly in single submission |

### Frontend Tests

| Test | What it verifies |
|------|-----------------|
| Time slot field renders as native select with time ranges | Options shown in `<select>` with auto-generated localized time range labels |
| Remaining capacity shown when available_amount is set | Dropdown labels include "(N seats available)" or similar |
| Unlimited capacity omits seat count | Dropdown labels show only time range when available_amount is null |
| Fully booked option is disabled | Option with `remaining_amount === 0` cannot be selected in dropdown |
| Required field validation | Error shown if no slot selected |
| Capacity conflict error displayed inline | Backend rejection message shown on the field; no auto-refresh |
| Fields render without toggle check | Custom fields render when `REGISTRATION_CUSTOM_FIELDS` is disabled but event has fields configured |
| Payload includes value_option only | POST body correct — no value_number or value_boolean for time slot |

---

## Definition of Done

- [ ] `POST /registrations/` accepts time slot answers with `value_option`.
- [ ] Per-slot capacity enforced atomically — no over-booking under concurrent load.
- [ ] Required time slot fields validated (option must be selected).
- [ ] `value_number` and `value_boolean` rejected for time slot answers.
- [ ] Field-specific error messages returned for capacity and validation failures.
- [ ] Frontend renders time slot fields with localized time range labels and remaining capacity in the registration form.
- [ ] Options with `remaining_amount === 0` are disabled in the UI.
- [ ] Existing checkbox, option_select, inventory, and time slot organiser-side flows unaffected (regression tests pass).
- [ ] `make format` passes on backend; `yarn lint` passes on frontend.
- [ ] Backend tests cover time slot answer submission, capacity enforcement, and edge cases.

---

## Files Changed

### Backend

| File | Change |
|------|--------|
| `organization/serializers/event_registration.py` | Extend submission validation for `TIME_SLOT_SELECT` type |
| `organization/views/event_registration_views.py` | Extend per-option capacity enforcement to include time slot options |
| `organization/tests/test_event_registration.py` | Add time slot answer and capacity tests |

### Frontend

| File | Change |
|------|--------|
| `src/components/project/RegistrationTimeSlotField.tsx` | New component for time slot field rendering |
| `src/components/project/RegistrationFieldAnswersForm.tsx` | Add time slot state, dispatch, validation, and payload |
| `public/texts/project_texts.tsx` | Add time slot field text keys |

---

## Notes and Open Questions

1. **Native `<select>`, not custom dropdown**: option selection uses a native HTML `<select>` element, consistent with the inventory field approach (#2004). More mobile-friendly and accessible than a custom dropdown component.
2. **Localized time range display**: the frontend auto-generates a concise label from `start_time`/`end_time` using the viewer's browser locale and timezone via `Intl.DateTimeFormat`. Date format, time format (12h/24h), day/month names, and separators all follow the user's locale. If all slots are on the same day, the date prefix could be shown once in the field description rather than repeated per option — a UX refinement the developer should consider.
3. **`label` vs `settings.title`**: the `label` property on `RegistrationField` is the organiser-facing admin label (Phase 4x / #1997) used in export/print/overview views. It is NOT used for end-user-facing views. The registration form uses `settings.title` as the question label — consistent with checkbox, option_select, and inventory fields.
4. **No toggle on registrant side**: consistent with #2004 — the `REGISTRATION_CUSTOM_FIELDS` toggle gates only the organiser-side create/edit of custom fields. The guest registration form renders any configured fields regardless of toggle state.
5. **Capacity oversell on option edit**: if an organiser lowers `available_amount` below already-booked count, the system enters an over-sold state. This is acceptable — the organiser is responsible. Does not affect #2007.
6. **Remaining amount computation**: `remaining_amount` already works correctly for time slot options via the existing `RegistrationFieldOptionSerializer.remaining_amount` method from #2004. The COUNT query uses `value_option` to find active answers, which works for both inventory and time slot answers.
7. **Re-registration with different slot**: if a guest re-registers after self-cancellation with a different time slot, the existing answer row is updated in place via the `unique_together = (registration, field)` constraint. The sync function sets `value_option` to the new option.
8. **Mockup reference**: the issue includes a mockup showing a dropdown-style selector for time slots with seat availability displayed. The implementation should follow this visual direction.
9. **Single-slot selection only**: current requirements specify single-select (pick one time slot). Multi-select (pick all applicable slots) is out of scope and would be a different field type.

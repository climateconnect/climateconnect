# Close Event for Registration When Required Capacity-Limited Fields Are Sold Out

**Date**: 2026-06-15  
**Status**: DRAFT  
**Type**: Backend — enhancement  
**GitHub Issue**: [#2058](https://github.com/climateconnect/climateconnect/issues/2058)

---

## Problem Statement

An event has a max number of registrations and one or more capacity-limited fields (inventory and time slot). The system already sets the event registration status to `full` when `max_participants` is reached. However, there is a corner case: an event can run out of all items in a **required** inventory field, or all slots in a **required** time slot field, before `max_participants` is reached. When this happens, the registration stays `open` but no guest can actually complete registration — they hit a validation error on the field check.

### Why it matters

- **Dead-end UX**: Guests arrive at the registration form, fill it out, and get an error they cannot resolve. The event looks open but is functionally closed.
- **No organiser visibility**: The organiser sees the event as "open" even though no one can register. They may not understand why registrations stopped.
- **Inconsistency**: The system already handles the `max_participants` sold-out case — inventory and time slot sold-out should be treated the same way.

### Current state

- `EventRegistrationConfig.status` tracks registration state: `open`, `closed`, `full` (see `RegistrationStatus` in `backend/organization/models/event_registration.py`).
- `RegistrationStatus.FULL` is set automatically when `max_participants` is reached (line 268 of `backend/organization/views/event_registration_views.py`).
- `RegistrationStatus.FULL` is reverted to `OPEN` when a cancellation frees capacity (lines 466–474 and 947–955 of the same file).
- **The "is the event full?" logic is duplicated inline at 5 separate call sites** (post-registration, registration validation guard, self-cancellation, admin cancellation, config PATCH serializer). There is no single utility that determines the correct status. Each site independently queries `max_participants` against active registration count and decides whether to set or revert `FULL`. Adding the inventory/timeslot check to each inline site would worsen this duplication.
- `RegistrationField` has `is_required` (boolean) and `field_type` (including `inventory` and `time_slot_select`). `RegistrationFieldOption` has `available_amount` (nullable integer — null means unlimited).
- At registration time, the view checks inventory availability and rejects the request if stock is insufficient (lines 206–222 of `event_registration_views.py`). But this only blocks the individual registration — it does not update the event status.
- The remaining capacity is computed differently by field type: inventory fields use `available_amount - SUM(value_number of active answers)` (quantity-based), while time slot fields use `available_amount - COUNT(active answers)` (one seat per person).

---

## Scope

### In scope

1. After a successful registration, check whether all required capacity-limited fields (inventory and time slot) have exhausted all their options. If so, set the event registration status to `full`.
2. After a cancellation (self or admin), check whether the event was set to `full` due to capacity-limited fields. If a required field now has available capacity again, revert to `open` — but only if `max_participants` also allows it.
3. The same check when `max_participants` is PATCHed via the config serializer (mirroring the existing auto-adjustment logic at `serializers/event_registration.py:769–791`).

### Out of scope (for now)

- Frontend changes — the `full` status is already handled by the frontend (shown as "Sold out" / "Ausgebucht").
- Email notifications to the organiser about inventory/timeslot-based sold-out (could be a follow-up).
- Non-required inventory and time slot fields — the issue explicitly states these do not block registration.
- `checkbox` and `option_select` field types — these do not have a capacity concept (`available_amount` is not used for them).

---

## Acceptance Criteria

### AC-1: Registration triggers capacity sold-out check

After a successful registration is saved, the system checks all required capacity-limited fields (inventory and time slot) on the event. If **every option** across **all required inventory fields** has `remaining_amount == 0`, OR **every option** across **all required time slot fields** has `remaining_amount == 0`, the event registration status is set to `full`.

- "Every option" means: for each required field, all its `RegistrationFieldOption` entries have zero remaining capacity.
- A field with **no options** is considered non-blocking (cannot be sold out).
- **Inventory remaining**: `available_amount - SUM(value_number of active answers for that option)`. Quantity-based.
- **Time slot remaining**: `available_amount - COUNT(active answers for that option)`. One seat per person.
- Options with `available_amount = null` are unlimited and never sold out.

### AC-2: Cancellation reverts capacity sold-out

When a registration is cancelled (by guest or admin) and the event's status is `full`, the system checks whether any required capacity-limited field now has at least one option with `remaining_amount > 0`. If so, and the event also has available participant seats (`max_participants` is null or `active_count < max_participants`), the status reverts to `open`.

- This mirrors the existing `max_participants` revert logic exactly.
- The revert is gated on **both** conditions: capacity available AND seats available. An event that is full due to `max_participants` should not reopen just because inventory freed up.

### AC-3: Config PATCH respects capacity sold-out

When an organiser PATCHes `EventRegistrationConfig` (e.g. changes `max_participants`), the existing auto-adjustment logic (lines 769–791 of `serializers/event_registration.py`) is extended to also consider capacity-limited field availability. If the new `max_participants` would allow registrations but all required inventory and/or time slot fields are fully sold out, the status stays `full`.

### AC-4: No false positives

- Events with **no** required inventory or time slot fields behave exactly as before (only `max_participants` triggers sold-out).
- Events where required capacity-limited fields have at least one option with remaining capacity are not affected.
- Non-required fields do not influence the sold-out check regardless of their stock levels.
- Unlimited options (`available_amount = null`) never count as sold out.

---

## Constraints

- **Backend only** — no frontend changes. The `full` status and its UI treatment already exist.
- **Consolidate into a single utility** — instead of adding the inventory/timeslot check to each of the 5 existing inline sites, create one utility function that determines the correct registration status considering `max_participants`, required inventory fields, and required time slot fields. All call sites call this utility. This also eliminates the existing `max_participants` duplication.
- **No new models or migrations** — this is a logic-only change. No schema changes needed.
- **No new dependencies** — uses existing ORM queries and aggregation.
- **Performance** — the capacity check queries `RegistrationFieldAnswer` with aggregation per option. For typical events with a handful of fields and options, this is negligible. No caching needed.

---

## Domain Context

### Required capacity-limited field semantics

A `RegistrationField` with `is_required = True` and a capacity-limited `field_type` (`inventory` or `time_slot_select`) means the guest **must** select at least one option from this field to complete registration. When all options in such a field have zero remaining capacity, no new guest can register — the registration view's validation (lines 206–222) will reject them.

A capacity-limited field with `is_required = False` does not block registration. Guests can skip it. So even if all its options are sold out, the event should remain open.

The two field types differ in how capacity is consumed:
- **Inventory** (`field_type = "inventory"`): quantity-based. Each answer has a `value_number` (e.g. "2 t-shirts"). Remaining = `available_amount - SUM(value_number of active answers)`.
- **Time slot** (`field_type = "time_slot_select"`): seat-based. Each answer consumes one slot. Remaining = `available_amount - COUNT(active answers)`.

### How remaining capacity is computed

For a given `RegistrationFieldOption`:

**Inventory fields:**
```
remaining = available_amount - SUM(value_number WHERE registration is active)
```

**Time slot fields:**
```
remaining = available_amount - COUNT(registration WHERE registration is active)
```

- `available_amount = null` → unlimited (remaining is always "enough").
- Active registration = `cancelled_at IS NULL`.
- `value_number` is the quantity the guest selected (e.g. "2 t-shirts") — only relevant for inventory fields.

This computation already exists in `RegistrationFieldOptionSerializer.get_remaining_amount()` (in `serializers/registration_field.py:134–148`) and in the view's validation (lines 206–222). The sold-out check reuses the same aggregation pattern, with the field-type-dependent calculation.

### Existing sold-out flow (max_participants) — duplicated inline

The current "is the event full?" check is copy-pasted at 5 sites, each with slightly different shape but the same core logic (count active registrations vs `max_participants`):

1. **Post-registration** (step 8, line 259): inline count → if equals `max_participants`, set `status = FULL`.
2. **Registration validation guard** (step 5, line 151): inline count → if already at capacity, set `status = FULL` and return error.
3. **Self-cancellation** (step 8, line 466): inline count → if `FULL` and count < `max_participants`, revert to `OPEN`.
4. **Admin cancellation** (step 7, line 947): identical copy of #3.
5. **Config PATCH** (serializer, line 769): inline count → auto-adjust status when `max_participants` changes.

Adding the inventory/timeslot check to each of these as additional inline code would compound the duplication. Instead, a single utility replaces all 5 inline checks.

### When multiple conditions can trigger sold-out

An event can be `FULL` due to:
- `max_participants` reached, or
- all required inventory fields sold out, or
- all required time slot fields sold out, or
- any combination of the above.

On revert (cancellation), the status should only return to `OPEN` when **all** conditions allow it: seats available AND inventory available AND time slots available. This means:
- If the event was full due to inventory, and a cancellation frees inventory, but `max_participants` is reached → stay `full`.
- If the event was full due to `max_participants`, and a cancellation frees a seat, but inventory is still sold out → stay `full`.
- If the event was full due to time slots, and a cancellation frees a slot, but inventory is sold out → stay `full`.
- If all conditions are resolved → revert to `open`.

---

## AI Agent Insights

### Why consolidate into one utility

The existing codebase has 5 inline copies of the "is the event at capacity?" check. Each was written independently and they've drifted slightly in shape (some check `max_participants is not None` explicitly, some wrap the count in a helper). Adding the inventory check to each would mean 5 more inline code blocks, all of which must stay in sync. A single `evaluate_registration_status()` function means:
- One place to change when a new sold-out condition is added in the future.
- One place to test the decision logic.
- Call sites become simpler: they just ask "what should the status be?" and apply the result.

The existing `_compute_available_seats` helper (line 311) is retained as-is — it serves a different purpose (returning the numeric value for the API response) and is not a replacement for status evaluation.

### Simplification: aggregate across all required capacity-limited fields

Rather than checking each field independently, the check can aggregate across all required capacity-limited fields in a single query. The logic is:

```python
# Pseudocode — not a prescription
required_fields = rc.fields.filter(
    field_type__in=["inventory", "time_slot_select"], is_required=True
)
for field in required_fields:
    has_available_option = False
    for option in field.options.all():
        if option.available_amount is None:
            has_available_option = True
            break
        if field.field_type == "inventory":
            booked = (
                RegistrationFieldAnswer.objects.filter(
                    value_option=option,
                    registration__cancelled_at__isnull=True,
                ).aggregate(total=Sum("value_number"))["total"]
                or 0
            )
        else:  # time_slot_select
            booked = RegistrationFieldAnswer.objects.filter(
                value_option=option,
                registration__cancelled_at__isnull=True,
            ).count()
        if option.available_amount - booked > 0:
            has_available_option = True
            break
    if not has_available_option:
        # This required field is fully sold out
        continue
    else:
        return  # At least one required field has capacity — not sold out
# All required fields sold out → set FULL
```

This is a short-circuit: as soon as one required field has capacity, we stop. No unnecessary queries.

### Edge case: no required capacity-limited fields

If there are no required inventory or time slot fields, the check trivially passes (no field is sold out), and the event stays in whatever status the `max_participants` check determined. The function should early-return when `required_fields` is empty.

### Edge case: required field with no options

A required capacity-limited field that has zero `RegistrationFieldOption` entries cannot be "sold out" (there's nothing to sell). The check should skip such fields.

### Why not cache or denormalize

The capacity sold-out check runs only on registration and cancellation — two infrequent operations. The aggregation is lightweight (a few SUM/COUNT queries on indexed columns). Adding a denormalized `is_sold_out` flag would add complexity (keeping it in sync on every answer create/delete) for no measurable performance gain.

### Interaction with the registration validation guard

The existing registration validation guard (step 5, line 151) catches stale `FULL` status. By using `evaluate_registration_status()` here too, the inventory/timeslot check is automatically included: if the status was somehow left as `OPEN` but capacity-limited fields are actually sold out, the validation guard catches it before the guest gets a confusing field-level validation error. This makes the system self-healing.

### The serializer call site

The config PATCH serializer (line 769) currently has its own inline auto-adjustment. After consolidation, the serializer calls `evaluate_registration_status()` instead. One nuance: the serializer only auto-adjusts when no explicit `status` was passed in the request AND the current status is auto-managed (i.e. not `CLOSED` — an organiser-set status). This existing guard is preserved. The utility function itself does not need to know about `CLOSED` or `ENDED` — it returns what the status *should* be based on capacity and field availability, and the caller decides whether to apply it.

---

## Implementation Notes

### Core utility: `evaluate_registration_status`

Create a single function that replaces all 5 inline `max_participants` checks and adds the inventory check. It takes an `EventRegistrationConfig` and returns the status that the event **should** have based on current capacity and inventory.

**Location**: `backend/organization/utility/event_registration.py` (new file). Placed in `utility/` rather than as a view method because it is also called from the serializer (which lives in a different module). A static method on the view would create a circular import.

**Signature**:
```python
def evaluate_registration_status(rc: EventRegistrationConfig) -> str:
    """Return the registration status the event should have right now.

    Considers max_participants, required-inventory availability, and
    required time-slot availability.
    Returns RegistrationStatus.FULL or RegistrationStatus.OPEN.
    Does NOT consider CLOSED or ENDED — those are set by other mechanisms
    (manual close, deadline) and are preserved by the caller.
    """
```

**Return value semantics**:
- Returns `RegistrationStatus.FULL` if any of:
  - `max_participants` is set and active registrations >= `max_participants`, OR
  - all required inventory fields are fully sold out (every option at zero remaining), OR
  - all required time slot fields are fully sold out (every option at zero remaining).
- Returns `RegistrationStatus.OPEN` otherwise.
- Returns `RegistrationStatus.OPEN` if there are no required capacity-limited fields and `max_participants` is not set (unlimited everything).

**Caller responsibility**: The caller checks whether the current status is one that should be auto-managed (i.e. not `CLOSED` or `ENDED`). If the event is currently `OPEN` or `FULL`, the caller applies the utility's result. If the event is `CLOSED` or `ENDED`, the caller leaves the status untouched.

### Capacity sold-out sub-logic: `_are_required_fields_sold_out`

A helper function (private to the utility module) that takes an `EventRegistrationConfig` and returns `True` if all required capacity-limited fields (inventory and time slot) are sold out. Called by `evaluate_registration_status`.

```python
def _are_required_fields_sold_out(rc: EventRegistrationConfig) -> bool:
    """True if every required inventory and time slot field has zero remaining capacity across all options."""
```

**Logic** (short-circuit):
1. Fetch required inventory and time slot fields with their options (`prefetch_related`).
2. If no required capacity-limited fields → return `False` (nothing can be sold out).
3. For each field:
   a. If the field has no options → skip (can't be sold out).
   b. If any option has `available_amount is None` → the field is not sold out (unlimited).
   c. Otherwise, compute remaining capacity per option:
      - Inventory: `SUM(value_number)` for active answers.
      - Time slot: `COUNT(active answers)`.
   d. If any option has remaining > 0 → the field is not sold out.
   e. If all options are at zero → this field is sold out, continue to next field.
4. If every required field is sold out → return `True`.

This is a short-circuit: as soon as one required field has capacity, the function returns `False`. No unnecessary queries.

### Integration points — replacing inline logic

Each call site replaces its inline `max_participants` check with a call to `evaluate_registration_status`:

| Location | File | Before | After |
|----------|------|--------|-------|
| `EventRegistrationsView.post()` — step 5 (line 151) | `views/event_registration_views.py` | Inline count vs `max_participants` → set `FULL` + error | Call `evaluate_registration_status(rc)`. If `FULL`, set status and return error. |
| `EventRegistrationsView.post()` — step 8 (line 259) | `views/event_registration_views.py` | Inline count vs `max_participants` → set `FULL` | Call `evaluate_registration_status(rc)`. If `FULL`, set status. |
| `EventRegistrationsView.delete()` — step 8 (line 466) | `views/event_registration_views.py` | Inline count < `max_participants` → revert to `OPEN` | Call `evaluate_registration_status(rc)`. If `OPEN`, set status. Only acts when current status is `FULL`. |
| `AdminCancelRegistrationView.patch()` — step 7 (line 947) | `views/event_registration_views.py` | Identical inline count → revert to `OPEN` | Same as self-cancellation. |
| `EditEventRegistrationConfigSerializer.update()` (line 769) | `serializers/event_registration.py` | Inline count → auto-adjust | Call `evaluate_registration_status(rc)`. Apply result (but only when no explicit `status` was passed and current status is auto-managed). |

### No new tests framework needed

Tests should use the existing Django test framework with Factory Boy. Test cases:

**`evaluate_registration_status` unit tests** (isolated from views):
1. No `max_participants`, no required capacity-limited fields → returns `OPEN`.
2. `max_participants=10`, 5 active registrations → returns `OPEN`.
3. `max_participants=10`, 10 active registrations → returns `FULL`.
4. Required inventory field, all options have stock → returns `OPEN`.
5. Required inventory field, all options sold out → returns `FULL`.
6. Two required inventory fields, one sold out, one with stock → returns `OPEN`.
7. Required inventory field with `available_amount=null` option → returns `OPEN` (unlimited never sold out).
8. Required inventory field with zero options → returns `OPEN` (can't be sold out).
9. Non-required inventory field, all sold out → returns `OPEN` (non-required doesn't count).
10. `max_participants=10` at capacity AND required inventory sold out → returns `FULL`.
11. `max_participants=10` at capacity but inventory has stock → returns `FULL`.
12. Required time slot field, all options sold out → returns `FULL`.
13. Required time slot field, one option has remaining seats → returns `OPEN`.
14. Required time slot field with `available_amount=null` option → returns `OPEN`.
15. Non-required time slot field, all sold out → returns `OPEN`.
16. Both required inventory and required time slot, inventory sold out but time slots available → returns `OPEN`.
17. Both required inventory and required time slot, both sold out → returns `FULL`.

**Integration tests** (through views):
18. Registration fills last required inventory item → status becomes `full`.
19. Registration fills last required time slot → status becomes `full`.
20. Registration when `max_participants` not reached but inventory sold out → status becomes `full`.
21. Cancellation frees inventory item → status reverts to `open` (if seats also available).
22. Cancellation frees time slot → status reverts to `open` (if seats also available).
23. Cancellation frees inventory but `max_participants` still full → status stays `full`.
24. Registration on event with stale `open` status but inventory sold out → returns error and sets `full`.
25. Config PATCH raises `max_participants` above current count, but inventory sold out → status stays `full`.
26. Config PATCH sets `max_participants=null`, but time slots sold out → status stays `full`.

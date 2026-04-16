# Organiser Creates Event with Custom Registration Fields (Phase 4a)

**Status**: DRAFT
**Type**: Feature
**Date and time created**: 2026-04-16 10:00
**GitHub Issue**: [#1880](https://github.com/climateconnect/climateconnect/issues/1880)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`doc/mosy/architecture_overview.md`](../mosy/architecture_overview.md)
- [`doc/mosy/entities/system-entities.md`](../mosy/entities/system-entities.md)
- [`doc/mosy/flows/core-flows.md`](../mosy/flows/core-flows.md)
- [`20260407_1000_organizer_cancel_guest_registration.md`](./20260407_1000_organizer_cancel_guest_registration.md) ← most recent completed task — introduces `EventRegistration`, `EventRegistrationConfig`, current model and serializer state
- [`20260402_1500_rename_event_registration_models.md`](./20260402_1500_rename_event_registration_models.md) ← model naming used in this spec (`EventRegistrationConfig`, `EventRegistration`, `/registrations/`)

---

## Problem Statement

Event organisers need to collect additional, event-specific information from registrants beyond name and email — for example, confirming a code of conduct, selecting a meal preference, or choosing a workshop track. Without this capability, organisers must manage this data collection separately (e.g. follow-up emails, external forms), which is fragmented and error-prone.

This task delivers **Phase 4a** of the Event Registration epic: the foundational custom fields infrastructure. Organisers can define up to **5 extra fields** on their event's registration form. Phase 4a supports two field types:

- **Checkbox** — a boolean field with a rich-text description (bold + links). Typical use: consent checkbox, RSVP confirmation.
- **Option select (single select)** — a single-choice dropdown with a title and an ordered list of options. Typical use: meal choice, session track, t-shirt size.

Organisers control field order and can mark each field as required. When a registrant submits the registration form, their responses to the custom fields are captured alongside their registration record.

**This task covers both sides of the feature:**
1. **Organiser side** — UI and API to create, edit, and order custom fields when creating or editing an event with registration.
2. **Registrant side** — UI and API to display and submit the custom fields when registering for the event.

**Core Requirements (User/Stakeholder Stated):**

- When creating or editing an event, the organiser can add up to **5 custom fields** to the registration form.
- Each field has a **type** (checkbox or option select) chosen from a picker/selector.
- The organiser can **reorder fields** (drag-and-drop or up/down controls).
- Each field can be marked as **required**.
- **Checkbox field settings**: description (rich text, supports bold and links; required), required flag.
- **Option select field settings**: title (string; required), 1 or more options (each with a title and an integer order; required), required flag. There is no upper limit on the number of options, but options must have unique order values within a field.
- **Registrant flow**: when a member opens the registration form, they see the custom fields rendered in the configured order. Required fields must be filled before submission. The registrant's answers are persisted against their registration record.
- A maximum of **5 custom fields** per event (across all field types combined).

**Field type specifications:**

| Field type | Registration value stored | Key settings |
|------------|--------------------------|--------------|
| Checkbox | Boolean (`true`/`false`) | Description (rich text — bold + links); required flag |
| Option select (single) | ID of the selected option | Title; 1–N ordered options (each: title + order); required flag |

**Explicitly Out of Scope (this iteration):**
- Time slot select field type (Phase 4b or later).
- Inventory / capacity field type (Phase 4b — defined in the epic but not implemented here).
- Free text, number, or date field types (Phase 4c+).
- Registration form templates (reuse across events) — forward-compatible architecture is required, but the template feature itself is not implemented here.
- Editing or deleting custom fields after registrations have been collected (behaviour TBD — defer to a follow-up task).
- Per-field analytics or reporting (future).

### Non-Functional Requirements

- **Maximum 5 fields**: enforced server-side (not just in the UI). Attempts to add a 6th field must return `400 Bad Request`.
- **Forward-compatible storage**: the response storage model for field answers must accommodate future field types that require more than a single scalar value (specifically the Inventory type which needs `(selected_option_id, quantity)`). The schema must not preclude this.
- **Atomic registration**: persisting the field answers and the `EventRegistration` row must happen in the same database transaction. A partial save (registration created but answers missing, or vice versa) must not be possible.
- **Validation on publish**: when `is_draft=false`, all required field settings (e.g. option select with zero options, missing titles) must be validated. Draft events skip full validation — consistent with the draft-mode contract established in [#1820](https://github.com/climateconnect/climateconnect/issues/1820).
- **No breaking changes** to existing API contracts.
- **Toggle gate**: all new frontend UI must be gated behind `isEnabled("EVENT_REGISTRATION")` — consistent with the epic's toggle strategy.

### AI Agent Insights and Additions

- **Schema design — polymorphic fields**: the custom field definition needs to support multiple field types with different settings (checkbox has a description; option select has a title and child options). Consider a polymorphic approach: a single `RegistrationField` table with a `field_type` discriminator and a JSONB `settings` column, or separate per-type tables linked from a base `RegistrationField` row. Either approach is valid — choose the one that best fits Django's ORM and the forward-compatibility constraints. Note that the Inventory type (Phase 4b) requires per-option capacity tracking and per-registration `(option_id, quantity)` storage — the schema must support this without a full rewrite.

- **Schema design — answer storage**: the registrant's answers need to be associated with their `EventRegistration` row. A `RegistrationFieldAnswer` table with FK to `EventRegistration` and FK to `RegistrationField` (or field option) is the natural shape. The answer value column must accommodate future types: consider storing the value as JSONB or using a `value_text` + `value_integer` + `value_option_id` pattern. The Inventory type will need `(option_id, quantity)` per answer — the schema must not require a migration to add that.

- **Field ordering**: the `order` field on `RegistrationField` must be unique within a given `EventRegistrationConfig`. Reordering all fields at once (e.g. a `PATCH /api/projects/{slug}/registration/fields/reorder/` bulk endpoint) is simpler than individual up/down moves at the API level. Alternatively, reordering can be handled as part of the event edit `PATCH` payload if the fields are sent as an ordered array. Either approach is acceptable — the implementing agent should choose based on the existing edit flow.

- **Option select child options**: the `RegistrationFieldOption` (or equivalent) rows are child entities of a `RegistrationField`. They need a `title` and an `order`. Consider whether deleting a field should cascade-delete its options (yes — options have no meaning without the parent field).

- **Registration form rendering**: when a registrant loads the registration page (`/projects/{slug}/register`), the `GET /api/projects/{slug}/` response (or a dedicated fields endpoint) must return the field definitions in order, with enough data to render each field type correctly. The registrant's existing answers (if re-registering or editing) should also be returned if possible.

- **Registrant answer submission**: the `POST /api/projects/{slug}/registrations/` endpoint (member registration) must accept the field answers in the request body alongside the registration. Server-side validation must check that all required fields have a non-null answer and that option-select answers reference a valid option ID belonging to this event's registration config.

- **Rich text for checkbox description**: the description supports bold and links (a subset of rich text). Consider whether to store as HTML, Markdown, or a structured format (e.g. a limited ProseMirror/Tiptap JSON). The frontend already uses a rich text editor in other parts of the platform — be consistent with the existing pattern.

- **Forward-compatibility hint — registration form templates**: the spec explicitly defers templates, but the schema should not make it hard to add them later. A `RegistrationFormTemplate` entity could reference a set of `RegistrationField` rows — keeping field definitions decoupled from `EventRegistrationConfig` (e.g. via a through/join table or a `template_id` FK) would make templates easier to add later.

- **UI — field builder**: the organiser's field builder UI is a new section within the event creation / edit flow (likely inside `EditEventRegistrationModal` or the `ShareProjectRoot` form). It needs to support: add field (type picker), edit field settings (per-type form), reorder fields, mark as required, and remove a field (with a guard if registrations already exist). This is likely the most complex UI component in this task — consider breaking it into sub-components (e.g. `RegistrationFieldList`, `RegistrationFieldEditor`, `OptionSelectFieldEditor`, `CheckboxFieldEditor`).

- **Admin notification emails**: the admin notification email introduced in [#1888](https://github.com/climateconnect/climateconnect/issues/1888) does not need to include custom field answers in Phase 4a — that is a future enhancement.

---

## System Impact

> ⚠️ **This section is to be filled in by the system architect (Archie) before implementation begins.**

- **Actors involved**: _TBD_
- **Entities added or changed**: _TBD_
- **Flows added or changed**: _TBD_
- **Integration changes**: _TBD_
- **Migrations required**: _TBD_

---

## Software Architecture

> ⚠️ **This section is to be filled in during or after system impact analysis. The implementing agent (backend + frontend developer) owns the "how".**

### API

_TBD — to be defined during implementation, guided by the system impact analysis above._

Key endpoints expected (non-prescriptive — exact shape TBD by implementing agent):

- CRUD for registration field definitions, scoped to a project's registration config
- Bulk reorder endpoint or reorder-via-edit PATCH (implementing agent to choose)
- Extended `POST /api/projects/{slug}/registrations/` to accept field answers
- Registration field definitions returned as part of the event detail or a dedicated endpoint (for registrant form rendering)

### Frontend

_TBD — to be defined during implementation._

Key UI areas:
- Organiser: field builder within event create/edit flow
- Registrant: custom fields rendered on the registration form (`/projects/{slug}/register`)

### Backend

_TBD — to be defined during implementation._

### Data / Migrations

_TBD — new tables required for field definitions, field options, and field answers. Exact schema is the implementing agent's decision, subject to forward-compatibility constraints above._

---

## Files to Change

> ⚠️ **To be filled in during implementation.**

---

## Test Cases

> ⚠️ **To be expanded during implementation. Initial scope below.**

### Backend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | Create event with 5 custom fields (mix of checkbox and option select) | Fields saved; returned in order on event detail |
| 2 | Attempt to add a 6th field | `400 Bad Request` |
| 3 | Option select with zero options on publish | `400 Bad Request` |
| 4 | Option select with zero options on draft save | Accepted |
| 5 | Register with all required fields answered | `201 Created`; answers persisted |
| 6 | Register with a required field left blank | `400 Bad Request` |
| 7 | Register with an invalid option ID (option from a different event) | `400 Bad Request` |
| 8 | Register without any custom field payload when no required fields exist | `201 Created` |
| 9 | Reorder fields | New order reflected in API response |
| 10 | Delete a field | Field and its options removed; no orphaned answer rows |
| 11 | Unauthenticated field management request | `401 Unauthorized` |
| 12 | Non-organiser attempts to manage fields | `403 Forbidden` |

### Frontend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | Organiser opens event edit — no custom fields yet | Field builder UI shows empty state with "Add field" button |
| 2 | Add a checkbox field | Field appears in list with description editor and required toggle |
| 3 | Add an option select field | Field appears with title input and option list |
| 4 | Add a 6th field | "Add field" button disabled or shows error (max 5 reached) |
| 5 | Reorder fields | Order reflected in preview and saved correctly |
| 6 | Registrant opens event registration page | Custom fields rendered in configured order |
| 7 | Registrant submits without answering a required checkbox | Validation error shown; submission blocked |
| 8 | Registrant submits without selecting a required option | Validation error shown; submission blocked |
| 9 | Registrant submits with all required fields answered | Registration succeeds; answers saved |
| 10 | Feature toggle disabled | Field builder UI not rendered |

---

## Dependency Notes

- **Depends on** [#1820](https://github.com/climateconnect/climateconnect/issues/1820): `EventRegistrationConfig` entity must exist.
- **Depends on** [#1845](https://github.com/climateconnect/climateconnect/issues/1845): `EventRegistration` (participant record) must exist — field answers are linked to it.
- **Does not depend on** Phase 3 (guest registration) — Phase 4a can be developed and deployed behind the feature toggle in parallel.
- **Enables** Phase 4b (Inventory / capacity options): the field definition and answer storage schema introduced here must support the Inventory type's `(option_id, quantity)` answer shape without a full schema redesign.
- **Enables** future registration form templates: field definitions should be architected to allow eventual reuse across events.

---

## Acceptance Criteria

- [ ] An organiser can add up to 5 custom fields to an event's registration form (checkbox and/or option select).
- [ ] The organiser can reorder fields; the order is preserved and returned by the API.
- [ ] Each field can be marked as required.
- [ ] **Checkbox**: has a rich-text description field supporting bold and links.
- [ ] **Option select**: has a title and at least one option; each option has a title and an order value.
- [ ] Attempting to add a 6th field is rejected server-side with `400 Bad Request`.
- [ ] An option select with zero options is rejected server-side on publish (`is_draft=false`); accepted on draft save.
- [ ] The custom field definitions are returned as part of the event API response, in configured order, with enough data to render the registration form.
- [ ] When a registrant opens the registration form, the custom fields are displayed in the configured order.
- [ ] A registrant's answers to the custom fields are persisted atomically with their `EventRegistration` row.
- [ ] Required fields with no answer are rejected server-side with `400 Bad Request`.
- [ ] Option select answers with an invalid or foreign option ID are rejected server-side.
- [ ] All new frontend UI is gated behind `isEnabled("EVENT_REGISTRATION")`.
- [ ] No breaking changes to existing API contracts.
- [ ] Migrations provided for all new tables.
- [ ] All tests pass.
- [ ] Code review approved.

---

## Log

- 2026-04-16 10:00 — Task created from GitHub issue [#1880](https://github.com/climateconnect/climateconnect/issues/1880). Phase 4a of the Event Registration epic — foundational custom fields infrastructure (checkbox + option select). Both organiser-side (field builder) and registrant-side (form rendering + answer submission) are in scope. Forward-compatibility constraints for Inventory (Phase 4b) and registration form templates must be respected in the schema design. Awaiting system impact analysis from Archie before implementation begins.


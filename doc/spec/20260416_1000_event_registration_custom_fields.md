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

This task is the **enabler task** for Phase 4a of the Event Registration epic: it delivers the foundational custom fields infrastructure — the data model, API, and organiser-side UI for defining custom fields. A separate follow-up task will cover the registrant-side flow (rendering the fields on the registration form and capturing answers).

Organisers can define up to **5 extra fields** on their event's registration form. Phase 4a supports two field types:

- **Checkbox** — a boolean field with a rich-text description (bold + links). Typical use: consent checkbox, RSVP confirmation.
- **Option select (single select)** — a single-choice dropdown with a title and an ordered list of options. Typical use: meal choice, session track, t-shirt size.

Organisers control field order and can mark each field as required. When a registrant submits the registration form, their responses to the custom fields are captured alongside their registration record.

**This task covers the organiser side only:**
- UI and API to create, edit, order, and delete custom fields when creating or editing an event with registration.
- The data model and API surface that will be used by the follow-up registrant-side task.

The registrant-side flow (rendering fields on the registration form, capturing and storing answers) is **out of scope** and will be delivered in a dedicated follow-up task.

**Core Requirements (User/Stakeholder Stated):**

- When creating or editing an event, the organiser can add up to **5 custom fields** to the registration form.
- Each field has a **type** (checkbox or option select) chosen from a picker/selector.
- The organiser can **reorder fields** (drag-and-drop or up/down controls — Google Forms is a good reference for the UX pattern, and since Material Design is also used there, it serves as a guiding example).
- Each field can be marked as **required**.
- **Checkbox field settings**: description (rich text, supports bold and links; required), required flag.
- **Option select field settings**: title (string; required), 1 or more options (each with a title and an integer order; required), required flag. There is no upper limit on the number of options, but options must have unique order values within a field.
- A maximum of **5 custom fields** per event (across all field types combined).

**Field type specifications:**

| Field type | Registration value stored (future) | Key settings |
|------------|-----------------------------------|--------------|
| Checkbox | Boolean (`true`/`false`) | Description (rich text — bold + links); required flag |
| Option select (single) | ID of the selected option | Title; 1–N ordered options (each: title + order); required flag |

**Explicitly Out of Scope (this task):**
- **Registrant-side flow** — rendering custom fields on the registration form and capturing answers — delivered in a separate follow-up task.
- Time slot select field type (Phase 4b or later).
- Inventory / capacity field type (Phase 4b — defined in the epic but not implemented here).
- Free text, number, or date field types (Phase 4c+).
- Registration form templates (reuse across events) — forward-compatible architecture is required, but the template feature itself is not implemented here.
- Editing or deleting custom fields after registrations have been collected (behaviour TBD — defer to a follow-up task).
- Per-field analytics or reporting (future).

### Non-Functional Requirements

- **Maximum 5 fields**: enforced server-side (not just in the UI). Attempts to add a 6th field must return `400 Bad Request`.
- **Forward-compatible storage**: the field definition schema and the future answer storage model must accommodate field types that require more than a single scalar value per answer (specifically the Inventory type which needs `(selected_option_id, quantity)`). The schema must not preclude this even if answer storage itself is out of scope for this task.
- **Validation on publish**: when `is_draft=false`, all required field settings (e.g. option select with zero options, missing titles) must be validated. Draft events skip full validation — consistent with the draft-mode contract established in [#1820](https://github.com/climateconnect/climateconnect/issues/1820).
- **No breaking changes** to existing API contracts.
- **Toggle gate**: all new frontend UI must be gated behind a feature toggle. Since the Event Registration feature may go live before custom fields are ready, this task may require its **own dedicated toggle** (separate from `EVENT_REGISTRATION`) — to be confirmed during system impact analysis. All four tasks that together constitute Phase 4a (organiser create/edit, organiser view, and the registrant-side follow-up tasks) must be live simultaneously before the custom fields toggle is flipped. The implementing agent should clarify toggle requirements with the team before beginning frontend work.

### AI Agent Insights and Additions

- **Schema design — polymorphic fields**: the custom field definition needs to support multiple field types with different settings (checkbox has a description; option select has a title and child options). Consider a polymorphic approach: a single `RegistrationField` table with a `field_type` discriminator and a JSONB `settings` column, or separate per-type tables linked from a base `RegistrationField` row. Either approach is valid — choose the one that best fits Django's ORM and the forward-compatibility constraints. Note that the Inventory type (Phase 4b) requires per-option capacity tracking and per-registration `(option_id, quantity)` storage — the schema must support this without a full rewrite.

- **Schema design — answer storage (forward-compatible, not implemented here)**: although answer capture is out of scope for this task, the field definition schema should not force a redesign when that task arrives. A `RegistrationFieldAnswer` table with FK to `EventRegistration` and FK to `RegistrationField` is the natural shape. The answer value column should be able to accommodate future types — consider storing as JSONB or with a `value_text` + `value_integer` + `value_option_id` pattern so the Inventory type's `(option_id, quantity)` answer does not require a migration later.

- **Field ordering**: the `order` field on `RegistrationField` must be unique within a given `EventRegistrationConfig`. Reordering all fields at once (e.g. a bulk reorder endpoint) is simpler than individual up/down moves at the API level. Alternatively, reordering can be handled as part of the event edit `PATCH` payload if the fields are sent as an ordered array. Either approach is acceptable — the implementing agent should choose based on the existing edit flow.

- **Option select child options**: the `RegistrationFieldOption` (or equivalent) rows are child entities of a `RegistrationField`. They need a `title` and an `order`. Deleting a field should cascade-delete its options (options have no meaning without the parent field).

- **Rich text for checkbox description**: the description supports bold and links (a subset of rich text). Store in a format consistent with how other rich-text fields are handled elsewhere on the platform (check existing usage before choosing HTML, Markdown, or a structured editor format).

- **Forward-compatibility hint — registration form templates**: the spec explicitly defers templates, but the schema should not make them hard to add later. Keeping field definitions decoupled from `EventRegistrationConfig` (e.g. via a through/join table or a `template_id` FK) would make templates easier to introduce without a schema rewrite.

- **UI — field builder**: the organiser's field builder UI is a new section within the event creation / edit flow (likely inside `EditEventRegistrationModal` or the `ShareProjectRoot` form). Google Forms is a strong UX reference — it shares Material Design and handles the same interaction patterns (type picker, per-field settings panel, drag-to-reorder, required toggle, delete). Consider breaking the implementation into focused sub-components (e.g. `RegistrationFieldList`, `RegistrationFieldEditor`, `OptionSelectFieldEditor`, `CheckboxFieldEditor`) to keep each one manageable.

- **Toggle strategy**: since `EVENT_REGISTRATION` may be flipped to production before Phase 4a is ready, a separate `REGISTRATION_CUSTOM_FIELDS` toggle (or equivalent) is likely needed. All four Phase 4a tasks (organiser create/edit fields, organiser view fields on event detail, and the two registrant-side follow-up tasks) need to be complete and validated before that toggle is flipped. Confirm the toggle name and strategy with the team early — it affects every frontend component in this task.

- **Admin notification emails**: the admin notification email introduced in [#1888](https://github.com/climateconnect/climateconnect/issues/1888) does not need to include custom field definitions or answers in Phase 4a — that is a future enhancement.

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
- Registration field definitions returned as part of the event detail or a dedicated endpoint

### Frontend

_TBD — to be defined during implementation._

Key UI area: field builder within event create/edit flow (organiser only).

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
| 5 | Reorder fields | New order reflected in API response |
| 6 | Delete a field | Field and its options removed |
| 7 | Unauthenticated field management request | `401 Unauthorized` |
| 8 | Non-organiser attempts to manage fields | `403 Forbidden` |

### Frontend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | Organiser opens event edit — no custom fields yet | Field builder UI shows empty state with "Add field" button |
| 2 | Add a checkbox field | Field appears in list with rich-text description editor and required toggle |
| 3 | Add an option select field | Field appears with title input and option list |
| 4 | Add a 6th field | "Add field" button disabled or shows error (max 5 reached) |
| 5 | Reorder fields | Order reflected in preview and saved correctly |
| 6 | Feature toggle disabled | Field builder UI not rendered |

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
- [ ] The custom field definitions are returned as part of the event API response, in configured order, with enough data for the future registrant-side task to render the form.
- [ ] All new frontend UI is gated behind the appropriate feature toggle (separate from `EVENT_REGISTRATION` — to be confirmed with team).
- [ ] No breaking changes to existing API contracts.
- [ ] Migrations provided for all new tables.
- [ ] All tests pass.
- [ ] Code review approved.

---

## Log

- 2026-04-16 10:00 — Task created from GitHub issue [#1880](https://github.com/climateconnect/climateconnect/issues/1880). Phase 4a enabler task — foundational custom fields infrastructure (checkbox + option select), organiser side only. Registrant-side flow (form rendering + answer submission) is out of scope and will be delivered in a separate follow-up task. Forward-compatibility constraints for Inventory (Phase 4b) and registration form templates must be respected in the schema design. A dedicated feature toggle separate from `EVENT_REGISTRATION` is likely needed (all four Phase 4a tasks must go live together). Google Forms cited as UX reference for the field builder. Awaiting system impact analysis from Archie before implementation begins.


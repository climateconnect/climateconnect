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

- **Schema — single `RegistrationField` table with `settings` JSONField (JSONB)**: chosen over per-type tables. Django's `JSONField` is first-class on PostgreSQL. Adding Phase 4b field types means adding a new `field_type` choice — no new tables or migrations to the field definition layer. Options for `option_select` are stored as separate `RegistrationFieldOption` rows (not inside `settings`) so each option has an addressable `id` for the future answer FK.

- **Settings validation — type-settings registry pattern**: each `field_type` has a companion DRF `Serializer` subclass that declares the exact expected keys for `settings`. A registry dict (`FIELD_TYPE_SETTINGS_VALIDATORS`) maps `field_type` → settings serializer class. `RegistrationFieldSerializer.validate()` dispatches to the right one. Benefits: unknown keys are stripped on write; adding a new field type in Phase 4b only requires a new settings serializer + one registry entry. The registry lives in `organization/serializers/registration_field.py` alongside the main serializer.

  ```
  CheckboxSettingsSerializer      → { description: CharField(allow_blank=True) }
  OptionSelectSettingsSerializer  → {}  (no settings yet; options are in RegistrationFieldOption rows)

  FIELD_TYPE_SETTINGS_VALIDATORS = {
      RegistrationFieldType.CHECKBOX:       CheckboxSettingsSerializer,
      RegistrationFieldType.OPTION_SELECT:  OptionSelectSettingsSerializer,
  }
  ```

  Publish-time non-empty check for `description` is a separate guard in the outer `validate()` using `is_draft` from context — same pattern as `EventRegistrationConfigSerializer`.

- **Rich text — MUI-tiptap, stored as HTML**: the checkbox description uses MUI-tiptap (being integrated on a separate branch, not yet merged). Tiptap's default output is HTML via `getHTML()`. The toolbar is restricted to **Bold** and **Link** only — no other formatting. The `Link` extension allows the organiser to set custom link text (e.g. "Terms of Service"), which is why plain text + auto-linkify is insufficient. The HTML string is stored in `settings.description` and rendered safely in the registrant-side task (follow-up).

- **Answer storage shape (forward-compatible, implemented in follow-up task)**: `RegistrationFieldAnswer` with `value_boolean` (nullable), `value_option` FK nullable → `RegistrationFieldOption`, and `value_json` JSONField nullable for Inventory's `(option_id, quantity)` and future types. This schema requires no migration when Phase 4b arrives.

- **Reorder via the PATCH payload, not a separate endpoint**: fields are sent as a full ordered array on every save. The `order` value on each item is the source of truth. No separate reorder endpoint is needed — the frontend manages local order state and sends the full desired state on save, same pattern as other nested data in this codebase.

- **Fields as nested array in the config payload — full sync on save**: the UI manages fields as local state (add, edit, reorder, delete — all in memory before saving). On save, the full `fields` array is sent as part of the registration config payload. The backend syncs: items with an `id` are updated, items without an `id` are created, existing fields whose `id` is absent from the array are deleted. All in one atomic transaction. This matches the "send the desired state" pattern and avoids partial saves. Separate `/fields/` CRUD endpoints are **not** needed for the UI flow.

  - **On create** (`POST /api/projects/`): `event_registration_config.fields` is accepted as a nested array. The view creates the config and all fields atomically.
  - **On edit** (`PATCH /api/projects/{slug}/registration-config/`): `fields` is accepted alongside the existing config fields. The serializer syncs the field set. Guard: a field whose `id` is absent from the array is only deleted if it has no answers yet (enforced in this task; the follow-up registrant task will set the answer-guard behaviour).

- **Fields in project detail response**: field definitions are included in `GET /api/projects/{slug}/` (read path) as a nested array on `event_registration_config`. No extra round-trip for the registrant-side task. Additive — no breaking change.

- **Feature toggle — `REGISTRATION_CUSTOM_FIELDS`**: a separate toggle from `EVENT_REGISTRATION` is required. `EVENT_REGISTRATION` will be flipped to production once Phase 3 is validated; Phase 4a may not be ready at that point. The new toggle is: dev ✅, staging ✅, production ❌. Flip condition: all Phase 4a tasks (this task + organiser view + registrant-side follow-up tasks) validated on staging simultaneously.

- **UI — field builder sub-components**: `RegistrationFieldList` (ordered list, drag handle, delete), `RegistrationFieldEditor` (wrapper with type-specific inner form), `CheckboxFieldEditor` (MUI-tiptap + required toggle), `OptionSelectFieldEditor` (title input + options list with add/remove/reorder). Keep each component focused.

- **Admin notification emails**: not affected by this task — no field answers are captured here.

---

## System Impact

- **Actors involved**:
  - `Organiser / Team Admin` — creates, edits, reorders, and deletes custom registration fields on an event they manage.
  - `System` — enforces the 5-field limit, validates field settings on publish, persists field definitions and options.

- **Entities added**:
  - `RegistrationField` (new) — one custom field on an event's registration form. FK → `EventRegistrationConfig`. Fields: `field_type` (discriminator), `order` (unique within config), `is_required`, `settings` (JSONField/JSONB).
  - `RegistrationFieldOption` (new) — one selectable option within an `option_select` field. FK → `RegistrationField` (CASCADE). Fields: `title`, `order`.

- **Entities changed**:
  - `EventRegistrationConfig` — no schema change; gains a `fields` reverse relation. The serializer gains a nested `fields` array in read responses.

- **Future entity (not created here, must be schema-compatible)**:
  - `RegistrationFieldAnswer` — registrant's answer to a custom field. Will have: FK → `EventRegistration`, FK → `RegistrationField`, `value_boolean` (nullable), `value_option` FK → `RegistrationFieldOption` (nullable), `value_json` JSONField (nullable, for Inventory and future types).

- **Flows added**:
  - **Manage Registration Fields** — Organiser opens event create/edit → adds/edits/reorders/deletes custom fields → saves event. Fields are validated on publish.

- **Flows changed**:
  - **Create/Edit Event** — extended: the event form gains a "Registration fields" section (gated behind `REGISTRATION_CUSTOM_FIELDS` toggle). No change to the existing registration config save path.
  - **View Event Detail** — extended: `GET /api/projects/{slug}/` response gains a `fields` array nested inside `event_registration_config`. Additive — no breaking change.

- **Integration changes**:
  - New feature toggle `REGISTRATION_CUSTOM_FIELDS` — data migration required (new `FeatureToggle` row).
  - MUI-tiptap dependency (from separate branch, not yet in `main`) — must be merged before this task ships to production.

- **Migrations required**:
  - New table: `organization_registrationfield`
  - New table: `organization_registrationfieldoption`
  - New `FeatureToggle` row: `REGISTRATION_CUSTOM_FIELDS` (dev ✅, staging ✅, production ❌)

---

## Software Architecture

### Data Model

**`RegistrationField`** — `organization/models/registration_field.py` (new)

| Field | Type | Notes |
|-------|------|-------|
| `registration_config` | FK → `EventRegistrationConfig` (CASCADE) | `related_name="fields"` |
| `field_type` | CharField (choices: `checkbox`, `option_select`) | Discriminator |
| `order` | PositiveIntegerField | Position in the form. Unique together with `registration_config`. |
| `is_required` | BooleanField | Default `False` |
| `settings` | JSONField | Type-specific settings. Checkbox: `{"description": "<html>"}`. Option select: `{}` (reserved for future metadata). |
| `created_at` | DateTimeField (auto_now_add) | |
| `updated_at` | DateTimeField (auto_now) | |

Constraints: `unique_together = [("registration_config", "order")]`. Max 5 fields per config enforced in serializer `validate()`.

**`RegistrationFieldOption`** — `organization/models/registration_field.py` (new, same file)

| Field | Type | Notes |
|-------|------|-------|
| `field` | FK → `RegistrationField` (CASCADE) | `related_name="options"` |
| `title` | CharField (max 200) | Display label |
| `order` | PositiveIntegerField | Sort order within this field |

Constraints: `unique_together = [("field", "order")]`.

**Forward-compatible answer storage shape** (not implemented here — for reference only):

```
RegistrationFieldAnswer
  registration  → FK EventRegistration
  field         → FK RegistrationField
  value_boolean   BooleanField, nullable          (checkbox)
  value_option  → FK RegistrationFieldOption, nullable  (option_select)
  value_json      JSONField, nullable              (Inventory: {option_id, quantity}, future)
```

### API

**Fields are managed via the existing create and edit endpoints — no new standalone field endpoints.**

**Create event with fields** (existing endpoint, extended):

```
POST /api/projects/
body: {
  ...project fields...,
  event_registration_config: {
    max_participants: 100,
    registration_end_date: "...",
    fields: [
      { field_type: "checkbox", order: 0, is_required: true,
        settings: { description: "<p>I agree to the <a href=\"...\">Terms</a></p>" } },
      { field_type: "option_select", order: 1, is_required: false, settings: {},
        options: [{ title: "Vegetarian", order: 0 }, { title: "Vegan", order: 1 }] }
    ]
  }
}
```

All fields are created atomically with the project. No `id` on create items (they don't exist yet).

**Edit registration config with fields** (existing endpoint, extended):

```
PATCH /api/projects/{slug}/registration-config/
body: {
  max_participants: 120,
  fields: [
    { id: 1, order: 0, settings: { description: "<p>Updated text</p>" } },  ← update
    { id: 2, order: 1, options: [{ id: 10 }, { title: "New option", order: 2 }] },  ← update field + add option
    { field_type: "checkbox", order: 2, is_required: true, settings: {} }  ← create (no id)
    ← field id: 3 absent from array → deleted (only if no answers exist)
  ]
}
```

Sync rules (applied atomically in one transaction):
- Item **with `id`** → update that field (and sync its `options` the same way)
- Item **without `id`** → create as new field
- Existing field **absent from the array** → delete if no answers exist; `400 Bad Request` if answers exist (guarded in this task; answer-guard behaviour finalised in the registrant-side follow-up task)

**Read — fields in project detail** (existing endpoint, additive change):

`GET /api/projects/{slug}/` → `event_registration_config.fields` array added, ordered by `order`. Each element:

```json
{
  "id": 1,
  "field_type": "checkbox",
  "order": 0,
  "is_required": true,
  "settings": { "description": "<p>I agree to the <a href=\"...\">Terms</a></p>" },
  "options": []
}
```

For `option_select`, `options` is a non-empty array of `{ "id": 10, "title": "Vegetarian", "order": 0 }`.

**Validation (publish, `is_draft=false`)**:
- Checkbox: `settings.description` must be non-empty and non-whitespace HTML.
- Option select: must have at least one option with a non-empty `title`.
- All types: `order` values must be unique within the config; max 5 fields total.

**Validation (draft)**: all publish validations are skipped — consistent with existing draft-mode contract.

**Error responses**:

| Status | Condition |
|--------|-----------|
| `400` | 6th field; option select with 0 options on publish; missing required settings; delete attempted on field with existing answers |
| `401` | Unauthenticated |
| `403` | Not organiser or team admin |
| `404` | Project not found or no registration config |

### Backend

- **New file**: `organization/models/registration_field.py` — `RegistrationField` and `RegistrationFieldOption` models; `RegistrationFieldType` choices enum.
- **`organization/models/__init__.py`** — export new models.
- **New file**: `organization/serializers/registration_field.py` — contains:
  - `CheckboxSettingsSerializer` — declares `description` (CharField); strips unknown keys on write.
  - `OptionSelectSettingsSerializer` — empty for now; reserved for future per-type metadata.
  - `FIELD_TYPE_SETTINGS_VALIDATORS` registry dict — maps `field_type` → settings serializer class.
  - `RegistrationFieldOptionSerializer` — `id` (optional on write), `title`, `order`.
  - `RegistrationFieldSerializer` — writable nested serializer with `options`; dispatches `settings` validation via the registry; applies publish-time non-empty check on `description` using `is_draft` from context; handles create/update/delete sync in `update()`.
- **`organization/serializers/event_registration.py`** — extend `EventRegistrationConfigSerializer` and `EditEventRegistrationConfigSerializer` to accept a writable `fields` array; on read, return `fields` ordered by `order`; sync logic delegated to `RegistrationFieldSerializer`.
- **`organization/views/project_views.py`** — ensure the project create view passes `is_draft` context to the nested config serializer (already present; verify it flows through to field validation).
- **`organization/views/event_registration_views.py`** — ensure `EditRegistrationConfigView` passes `is_draft` context when calling the serializer.
- **No new view file and no new URL patterns** — fields are handled inside the existing serializer layer.
- **Migrations**: two new tables + `FeatureToggle` data migration.

### Frontend

- **New section in `EventRegistrationSection.tsx`** (or a new `RegistrationFieldsSection.tsx` extracted from it) — field builder, gated behind `isEnabled("REGISTRATION_CUSTOM_FIELDS")`.
- **New components** (all in `src/components/shareProject/` or `src/components/project/`):
  - `RegistrationFieldList.tsx` — ordered list with drag-handle (MUI drag-and-drop or simple up/down arrows), delete button per row.
  - `RegistrationFieldEditor.tsx` — wrapper that renders `CheckboxFieldEditor` or `OptionSelectFieldEditor` based on `field_type`.
  - `CheckboxFieldEditor.tsx` — MUI-tiptap editor (Bold + Link toolbar only) + required toggle.
  - `OptionSelectFieldEditor.tsx` — title `TextField` + ordered options list (add / remove / reorder options inline).
- **Field type picker** — a `Select` or button group to choose `checkbox` or `option_select` when adding a new field.
- **MUI-tiptap dependency** — must be available (merged from the parallel branch) before this component ships. The `CheckboxFieldEditor` depends on it.
- **Text keys** — new keys in `public/texts/project_texts.tsx` for all UI labels (EN + DE).
- **Toggle check** — `isEnabled("REGISTRATION_CUSTOM_FIELDS")` wraps the entire field builder section.

### Data / Migrations

1. `organization/migrations/0NNN_add_registrationfield.py` — creates `organization_registrationfield` and `organization_registrationfieldoption` tables.
2. `feature_toggles/migrations/0003_add_registration_custom_fields_toggle.py` — creates `REGISTRATION_CUSTOM_FIELDS` toggle row (dev ✅, staging ✅, production ❌).

---

## Files to Change

### Backend

| File | Change |
|------|--------|
| `organization/models/registration_field.py` | **New** — `RegistrationField`, `RegistrationFieldOption`, `RegistrationFieldType` enum |
| `organization/models/__init__.py` | Export new models |
| `organization/serializers/registration_field.py` | **New** — settings serializers, registry, `RegistrationFieldSerializer`, `RegistrationFieldOptionSerializer` |
| `organization/serializers/event_registration.py` | Extend `EventRegistrationConfigSerializer` and `EditEventRegistrationConfigSerializer` with writable `fields` array + read-time ordering |
| `organization/views/event_registration_views.py` | Verify `is_draft` context flows to the serializer in `EditRegistrationConfigView` |
| `organization/views/project_views.py` | Verify `is_draft` context flows through to nested config serializer on create |
| `organization/migrations/0NNN_add_registrationfield.py` | **New** — creates both new tables |
| `feature_toggles/migrations/0003_add_registration_custom_fields_toggle.py` | **New** — creates `REGISTRATION_CUSTOM_FIELDS` toggle row |
| `organization/tests/test_event_registration.py` | Add tests for field create/edit/sync, validation, and settings registry |

### Frontend

| File | Change |
|------|--------|
| `src/components/shareProject/EventRegistrationSection.tsx` | Add `REGISTRATION_CUSTOM_FIELDS` toggle-gated field builder section |
| `src/components/shareProject/RegistrationFieldList.tsx` | **New** — ordered field list with drag/reorder and delete |
| `src/components/shareProject/RegistrationFieldEditor.tsx` | **New** — type-dispatching wrapper |
| `src/components/shareProject/CheckboxFieldEditor.tsx` | **New** — MUI-tiptap (Bold + Link) + required toggle |
| `src/components/shareProject/OptionSelectFieldEditor.tsx` | **New** — title input + options list |
| `public/texts/project_texts.tsx` | Add new text keys (EN + DE) for all field builder labels |

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
| 9 | Checkbox with unknown key in `settings` (e.g. `{"description": "...", "rogue": "x"}`) | `rogue` stripped; only `description` persisted |
| 10 | Checkbox `settings.description` empty on publish | `400 Bad Request` |
| 11 | Checkbox `settings.description` empty on draft save | Accepted |
| 12 | Option select `settings` contains arbitrary keys | All stripped; `{}` persisted |

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
- 2026-04-16 — System impact analysis complete (Archie). Decisions: single `RegistrationField` table + `settings` JSONField (JSONB); `RegistrationFieldOption` rows for option select choices; type-settings registry pattern for `settings` validation; answer storage deferred but schema forward-compatible (`value_boolean` + `value_option` FK + `value_json`). Rich text: MUI-tiptap (Bold + Link only), HTML stored in `settings.description` — MUI-tiptap branch not yet merged, must land before this ships. New `REGISTRATION_CUSTOM_FIELDS` toggle (dev ✅, staging ✅, prod ❌). Fields nested in `GET /api/projects/{slug}/` detail response (additive).
- 2026-04-16 — API design revised: separate `/fields/` CRUD endpoints dropped in favour of fields as a nested writable array on the existing create (`POST /api/projects/`) and edit (`PATCH /api/projects/{slug}/registration-config/`) endpoints. Backend does a full sync (create/update/delete) atomically on save — items with `id` are updated, items without `id` are created, absent IDs are deleted (guarded against existing answers). No new URL patterns or view files required — all logic lives in the serializer layer. Matches the actual UI save pattern. Ready for implementation.


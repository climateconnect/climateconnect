# Organiser Edits Event Registration Custom Fields (Phase 4a — Edit)

**Status**: DRAFT
**Type**: Feature
**Date and time created**: 2026-05-12 07:25
**GitHub Issue**: [#1961](https://github.com/climateconnect/climateconnect/issues/1961)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260416_1000_event_registration_custom_fields.md`](./20260416_1000_event_registration_custom_fields.md) ← create-side spec; data model, API pattern, and toggle definition
- [`doc/mosy/architecture_overview.md`](../mosy/architecture_overview.md)
- [`doc/mosy/entities/system-entities.md`](../mosy/entities/system-entities.md)
- [`doc/mosy/flows/core-flows.md`](../mosy/flows/core-flows.md)

---

## Problem Statement

Event organisers already have the ability to define custom registration fields when **creating** an event (delivered in [#1880](https://github.com/climateconnect/climateconnect/issues/1880)). However, after an event is live, organisers frequently need to adjust those fields — for example, correcting a typo in a consent checkbox description, adding a new meal option, or reordering questions based on feedback. Without an edit path, organisers are forced to delete and recreate the entire event, or manage changes through external channels.

This task extends the organiser-side custom fields infrastructure to the **edit** flow. It reuses the data model and API patterns established in the create task, and wires them into the existing event registration settings UI — specifically the **EditEventRegistrationModal** where organisers already manage registration configuration (max participants, end date, status, notify admins). The custom field builder is not added to the full project edit page, because registration settings (including custom fields) are managed separately from core project settings.

**Core Requirements (User/Stakeholder Stated):**

- When **editing** an event, the organiser can view, add, edit, reorder, and delete the custom fields that were previously defined on the registration form.
- The same field types, limits, and validation rules apply as on creation:
  - Up to **5 custom fields** total.
  - **Checkbox** — rich-text description (bold + links), required flag.
  - **Option select** — title, 1+ ordered options, required flag.
  - Fields can be **reordered** via up/down controls.
- Changes are saved through the existing edit endpoints, gated behind the same feature toggle (`REGISTRATION_CUSTOM_FIELDS`).
- Deleting a field that already has registrant answers must be handled safely (see guard rules below).

**Explicitly Out of Scope (this task):**
- **Registrant-side flow** — rendering custom fields on the public registration form and capturing answers — remains out of scope and is covered by a separate follow-up task.
- Time slot select, Inventory, free-text, number, or date field types (Phase 4b+).
- Registration form templates.
- Per-field analytics or reporting.

### Non-Functional Requirements

- **Maximum 5 fields**: enforced server-side (same as create). Attempts to add a 6th field must return `400 Bad Request`.
- **Forward-compatible storage**: the edit path must not break the schema's ability to support future field types (Inventory, etc.).
- **Validation on publish**: when `is_draft=false`, all required field settings must be validated. Draft events skip full validation — consistent with the draft-mode contract established in [#1820](https://github.com/climateconnect/climateconnect/issues/1820).
- **No breaking changes** to existing API contracts.
- **Toggle gate**: all new frontend UI must be gated behind `REGISTRATION_CUSTOM_FIELDS`. This toggle is separate from `EVENT_REGISTRATION` (dev ✅, staging ✅, production ❌). All four Phase 4a tasks (create, edit, organiser view, registrant-side follow-up) must be validated on staging together before the toggle is flipped.
- **Delete guard**: deletion of fields and options is **allowed** even when registrant answers exist. The backend must cascade-delete related `RegistrationFieldAnswer` rows (introduced in [#1960](https://github.com/climateconnect/climateconnect/issues/1960)) when a field or option is removed. The frontend must show a **confirmation dialog** before deleting a field or an option that has data. If #1960 is not yet merged, the cascade is a no-op (no answers exist), but the code must be wired to use `CASCADE` on the `RegistrationFieldAnswer` FKs so it activates automatically when #1960 lands.
- **Required flag guard**: a field can be changed from **required → not required** at any time (even with existing answers), but changing from **not required → required** is only allowed if all existing registrations have provided an answer for that field. If any registration is missing an answer, the backend returns `400 Bad Request` with a clear error message. The frontend should disable the "required" toggle or show a warning when the field has existing answers and the user attempts to make it required.

### AI Agent Insights and Additions

- **Reuse the nested full-sync pattern from the create spec**: the edit API already accepts a nested `fields` array on `PATCH /api/projects/{slug}/registration-config/`. The backend syncs by `id` (update), absence of `id` (create), and absence from the array (delete, guarded). No new endpoints or URL patterns are required.
- **EditEventRegistrationConfigSerializer extension**: the existing `EditEventRegistrationConfigSerializer` (lines 278–466 of `organization/serializers/event_registration.py`) must accept a writable `fields` array. The same `RegistrationFieldSerializer` and sync logic used on create can be imported and reused.
- **Context propagation**: the `EditRegistrationConfigView` (lines 393–480 of `organization/views/event_registration_views.py`) must pass `is_draft` context to the serializer so that publish-time validation (e.g. non-empty checkbox description, option select with ≥1 option) fires correctly. Currently the view passes `project` and `request`; `is_draft` must be derived from `project.is_draft` and added to context.
- **Frontend — single edit surface**: the custom field builder is added to the **dedicated registration settings modal** (`EditEventRegistrationModal.tsx`), not the full project edit page. The full project edit page (`/editProject/[projectUrl].tsx`) is reserved for core project settings (name, description, dates, team members, collaborators). Registration settings — including custom fields — are managed separately via the modal that `PATCH`es `/api/projects/{slug}/registration-config/`. This mirrors the create flow where `EventRegistrationSection` lives inside `EnterDetails.tsx` (the broader share-project form), but on edit the equivalent scope is the registration modal.
- **Modal state management**: `EditEventRegistrationModal` uses local form state (useState for each field) and constructs a flat payload object for the PATCH. To support nested `fields`, the modal must:
  - Load existing `fields` from `eventRegistration.fields` (already returned by `GET /api/projects/{slug}/`) into local state.
  - Manage add/edit/reorder/delete of field items in memory.
  - Include the full `fields` array in the PATCH payload.
  - Handle backend validation errors mapped to individual field items (e.g. `fields[0].settings.description`).
- **Error handling**: DRF nested serializer errors return keys like `fields[0][settings][description]`. The modal's error parser must flatten these into a usable structure for the UI. The existing modal already handles flat field-level errors (`max_participants`, `registration_end_date`, `status`, `general`); it should be extended to parse nested `fields` errors and pass them down to the field builder components.
- **Component reuse**: the same sub-components planned for the create flow (`RegistrationFieldList`, `RegistrationFieldEditor`, `CheckboxFieldEditor`, `OptionSelectFieldEditor`) should be reused. They must accept a controlled `fields` array and an `onChange` callback so they can be dropped into both `EnterDetails.tsx` (create) and `EditEventRegistrationModal.tsx` (edit).
- **MUI-tiptap dependency**: same as create task — the rich-text editor for checkbox descriptions requires MUI-tiptap. If the create task has already added the dependency, the edit task simply consumes it.
- **No new migrations** (assuming create task already created `organization_registrationfield` and `organization_registrationfieldoption` tables). If the create task is not yet merged, this task depends on it.

---

## System Impact

- **Actors involved**:
  - `Organiser / Team Admin` — edits custom registration fields on an existing event they manage.
  - `System` — enforces the 5-field limit, validates field settings on publish, persists changes, and guards deletion of fields that have answers.

- **Entities added**: None — reuses `RegistrationField` and `RegistrationFieldOption` from the create task.

- **Entities changed**:
  - `EventRegistrationConfig` — gains writable nested `fields` on the edit serializer (same read relation already added by create task).

- **Flows added**:
  - **Edit Registration Fields** — Organiser opens event → clicks "Edit registration settings" → modal opens with existing fields pre-loaded → organiser adds/edits/reorders/deletes fields → saves.

- **Flows changed**:
  - **Edit Event Registration Settings** (`EditEventRegistrationModal`) — extended with a "Custom fields" section (toggle-gated). No change to the existing save path; the PATCH payload simply gains a `fields` key.
  - **View Event Detail** — no change; `fields` already returned in `GET /api/projects/{slug}/` by the create task.

- **Integration changes**:
  - No new toggle required — reuses `REGISTRATION_CUSTOM_FIELDS` from the create task.

- **Migrations required**: None (assuming create task migrations are already applied).

---

## Software Architecture

### Data Model

No new models — reuses `RegistrationField` and `RegistrationFieldOption` defined in the create spec.

### API

**Edit registration config with fields** (existing endpoint, extended):

```
PATCH /api/projects/{slug}/registration-config/
body: {
  max_participants: 120,
  registration_end_date: "2026-07-01T18:00:00Z",
  status: "open",
  notify_admins: true,
  fields: [
    { id: 1, order: 0, settings: { description: "<p>Updated text</p>" } },  ← update
    { id: 2, order: 1, options: [{ id: 10 }, { title: "New option", order: 2 }] },  ← update field + add option
    { field_type: "checkbox", order: 2, is_required: true, settings: {} }  ← create (no id)
    ← field id: 3 absent from array → deleted (only if no answers exist)
  ]
}
```

Sync rules (applied atomically in one transaction by `RegistrationFieldSerializer`):
- Item **with `id`** → update that field (and sync its `options` the same way)
- Item **without `id`** → create as new field
- Existing field **absent from the array** → delete if no answers exist; `400 Bad Request` if answers exist

**Read — fields in project detail** (existing endpoint, additive change already handled by create task):

`GET /api/projects/{slug}/` → `event_registration_config.fields` array added, ordered by `order`.

**Validation (publish, `is_draft=false`)**:
- Checkbox: `settings.description` must be non-empty and non-whitespace HTML.
- Option select: must have at least one option with a non-empty `title`.
- All types: `order` values must be unique within the config; max 5 fields total.

**Validation (draft)**: all publish validations are skipped.

**Error responses**:

| Status | Condition |
|--------|-----------|
| `400` | 6th field; option select with 0 options on publish; missing required settings; delete attempted on field with existing answers; nested field validation error |
| `401` | Unauthenticated |
| `403` | Not organiser or team admin |
| `404` | Project not found or no registration config |

### Backend

- **`organization/serializers/event_registration.py`** — extend `EditEventRegistrationConfigSerializer` to accept a writable `fields` array. Import and delegate to `RegistrationFieldSerializer` (from the create task) for the nested sync logic. Ensure `validate()` passes `is_draft` context down to the nested field serializer so publish-time checks fire.
- **`organization/views/event_registration_views.py`** — in `EditRegistrationConfigView.patch()`, derive `is_draft` from `project.is_draft` and include it in the serializer context alongside `project` and `request`.
- **No new view file and no new URL patterns** — fields are handled inside the existing serializer layer.

### Frontend

- **`src/components/project/EditEventRegistrationModal.tsx`** — extend the modal with:
  - Local state for `fields` (loaded from `eventRegistration.fields` on open).
  - Render `RegistrationFieldList` (toggle-gated behind `isEnabled("REGISTRATION_CUSTOM_FIELDS")`) below the existing max_participants / end_date / status / notify_admins fields.
  - Include `fields` in the PATCH payload sent to `/api/projects/{slug}/registration-config/`.
  - Parse nested `fields` errors from the backend response and pass them to the field builder components.
- **Reused components** (all created in the create task; this task wires them into the edit modal):
  - `RegistrationFieldList.tsx`
  - `RegistrationFieldEditor.tsx`
  - `CheckboxFieldEditor.tsx`
  - `OptionSelectFieldEditor.tsx`
- **Text keys** — add any edit-specific labels (e.g. "Edit custom fields", "No custom fields yet") in `public/texts/project_texts.tsx` (EN + DE).
- **Toggle check** — `isEnabled("REGISTRATION_CUSTOM_FIELDS")` wraps the entire field builder section in the modal.

### Data / Migrations

None — relies on migrations from the create task (`20260416_1000_event_registration_custom_fields.md`).

---

## Files to Change

### Backend

| File | Change |
|------|--------|
| `organization/serializers/event_registration.py` | Extend `EditEventRegistrationConfigSerializer` with writable `fields` array + read-time ordering; import `RegistrationFieldSerializer` from create task |
| `organization/views/event_registration_views.py` | Pass `is_draft` context in `EditRegistrationConfigView.patch()` |
| `organization/tests/test_event_registration.py` | Add tests for field edit/sync, validation, delete guard, and error responses |

### Frontend

| File | Change |
|------|--------|
| `src/components/project/EditEventRegistrationModal.tsx` | Add toggle-gated field builder section; manage `fields` local state; include `fields` in PATCH payload; parse nested field errors |
| `public/texts/project_texts.tsx` | Add new text keys (EN + DE) for edit-specific labels |

---

## Test Cases

> ⚠️ **To be expanded during implementation. Initial scope below.**

### Backend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | PATCH registration config with 5 custom fields (mix of checkbox and option select) | Fields updated/created; returned in order on subsequent GET |
| 2 | Attempt to add a 6th field via PATCH | `400 Bad Request` |
| 3 | Option select with zero options on publish (`is_draft=false`) | `400 Bad Request` |
| 4 | Option select with zero options on draft save | Accepted |
| 5 | Reorder fields via PATCH | New order reflected in API response |
| 6 | Delete a field that has no answers | Field and its options removed |
| 7 | Delete a field that has answers (cascade delete; requires #1960) | Field, options, and related answers removed; frontend shows confirmation dialog |
| 7b | Delete an option that has answers (cascade delete; requires #1960) | Option and related answers removed; frontend shows confirmation dialog |
| 7c | Make a field required when existing registrations lack answers | `400 Bad Request` |
| 7d | Make a field not required when it has existing answers | Accepted |
| 8 | Unauthenticated PATCH | `401 Unauthorized` |
| 9 | Non-organiser attempts PATCH | `403 Forbidden` |
| 10 | Checkbox `settings.description` empty on publish | `400 Bad Request` |
| 11 | Checkbox `settings.description` empty on draft save | Accepted |
| 12 | Unknown key in `settings` (e.g. `{"rogue": "x"}`) | Stripped; only allowed keys persisted |
| 13 | HTML sanitization — disallowed tags in description | Script tag stripped; safe HTML stored |

### Frontend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | Organiser opens "Edit registration settings" modal — no custom fields yet | Field builder UI shows empty state with "Add field" button |
| 2 | Modal opens with existing checkbox field | Pre-loaded description and required toggle shown |
| 3 | Modal opens with existing option select field | Pre-loaded title and options shown |
| 4 | Add a 6th field in the modal | "Add field" button disabled or shows error (max 5 reached) |
| 5 | Reorder fields in the modal | Order reflected in preview and saved correctly |
| 6 | Save modal with invalid field (e.g. empty checkbox description on publish) | Inline error shown on the field; modal stays open |
| 7 | Feature toggle disabled | Field builder UI not rendered in modal |

---

## Dependency Notes

- **Depends on** [#1880](https://github.com/climateconnect/climateconnect/issues/1880) (create task): `RegistrationField`, `RegistrationFieldOption`, `RegistrationFieldSerializer`, `sanitize_html`, `bleach`, and `REGISTRATION_CUSTOM_FIELDS` toggle must already exist. This task extends the create infrastructure to the edit flow.
- **Depends on** [#1960](https://github.com/climateconnect/climateconnect/issues/1960) (registrant-side answer storage): `RegistrationFieldAnswer` model must exist so the backend can cascade-delete answers when fields or options are removed, and so the required-flag guard can check existing answers. If #1960 is not yet merged, this task should still be implemented but with the cascade and guard wired to no-ops until #1960 lands.

---

## Acceptance Criteria

- [ ] An organiser can view and edit up to 5 custom fields on an existing event's registration form (checkbox and/or option select).
- [ ] The organiser can reorder fields; the order is preserved and returned by the API.
- [ ] Each field can be marked as required.
- [ ] **Checkbox**: has a rich-text description field supporting bold and links.
- [ ] **Option select**: has a title and at least one option; each option has a title and an order value.
- [ ] Attempting to add a 6th field is rejected server-side with `400 Bad Request`.
- [ ] An option select with zero options is rejected server-side on publish (`is_draft=false`); accepted on draft save.
- [ ] Deleting a field or option cascades to delete related registrant answers (requires #1960). The frontend shows a confirmation dialog before deleting a field or option that has data.
- [ ] Making a field **required** when existing registrations lack an answer for it is rejected server-side with `400 Bad Request`. Making a field **not required** is always allowed.
- [ ] The custom field definitions are returned as part of the event API response, in configured order, with enough data for the future registrant-side task to render the form.
- [ ] All new frontend UI is gated behind the `REGISTRATION_CUSTOM_FIELDS` feature toggle.
- [ ] No breaking changes to existing API contracts.
- [ ] All tests pass.
- [ ] Code review approved.

---

## Log

- 2026-05-12 07:25 — Task created from GitHub issue [#1961](https://github.com/climateconnect/climateconnect/issues/1961). This is the edit-side follow-up to the create-side custom fields task ([#1880](https://github.com/climateconnect/climateconnect/issues/1880)). Reuses the same data model, API pattern (nested full-sync `fields` array on PATCH), and feature toggle (`REGISTRATION_CUSTOM_FIELDS`). Frontend integration targets the existing `EditEventRegistrationModal.tsx` rather than the full project edit page, because organisers already manage registration settings there. Backend changes are limited to extending `EditEventRegistrationConfigSerializer` and passing `is_draft` context in `EditRegistrationConfigView`.

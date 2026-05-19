# Organiser Edits Event Registration Custom Fields (Phase 4a — Edit)

**Status**: READY FOR IMPLEMENTATION
**Type**: Feature
**Date and time created**: 2026-05-12 07:25
**Date and time updated**: 2026-05-19 07:30
**GitHub Issue**: [#1961](https://github.com/climateconnect/climateconnect/issues/1961)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260416_1000_event_registration_custom_fields.md`](./20260416_1000_event_registration_custom_fields.md) ← create-side spec; data model, API pattern, and toggle definition
- [`20260512_1015_register_for_event_with_extra_fields.md`](./20260512_1015_register_for_event_with_extra_fields.md) ← registrant-side answer storage (#1960, now merged)
- [`doc/mosy/architecture_overview.md`](../mosy/architecture_overview.md)
- [`doc/mosy/entities/system-entities.md`](../mosy/entities/system-entities.md)
- [`doc/mosy/flows/core-flows.md`](../mosy/flows/core-flows.md)

---

## Problem Statement

Event organisers already have the ability to define custom registration fields when **creating** an event (delivered in [#1880](https://github.com/climateconnect/climateconnect/issues/1880)), and registrants can now submit answers for those fields (delivered in [#1960](https://github.com/climateconnect/climateconnect/issues/1960)). However, after an event is live, organisers frequently need to adjust those fields — for example, correcting a typo in a consent checkbox description, adding a new meal option, or reordering questions based on feedback. Without an edit path, organisers are forced to delete and recreate the entire event, or manage changes through external channels.

This task extends the organiser-side custom fields infrastructure to the **edit** flow. It reuses the data model, API patterns, and frontend components established in the create task, adds answer-aware guard logic now that `RegistrationFieldAnswer` exists, and wires the field builder into the existing event registration settings UI — specifically the **EditEventRegistrationModal** where organisers already manage registration configuration (max participants, end date, status, notify admins). The custom field builder is not added to the full project edit page, because registration settings (including custom fields) are managed separately from core project settings.

**Core Requirements (User/Stakeholder Stated):**

- When **editing** an event, the organiser can view, add, edit, reorder, and delete the custom fields that were previously defined on the registration form.
- The same field types, limits, and validation rules apply as on creation:
  - Up to **5 custom fields** total.
  - **Checkbox** — rich-text description (bold + links), required flag.
  - **Option select** — title, 1+ ordered options, required flag.
  - Fields can be **reordered** via up/down controls.
- Changes are saved through the existing edit endpoints, gated behind the same feature toggle (`REGISTRATION_CUSTOM_FIELDS`).
- Deleting a field or option that already has registrant answers must be handled safely: the backend cascades the deletion, and the frontend warns the organiser with a confirmation dialog.

**Explicitly Out of Scope (this task):**
- **Registrant-side flow** — rendering custom fields on the public registration form and capturing answers — delivered in [#1960](https://github.com/climateconnect/climateconnect/issues/1960).
- Time slot select, Inventory, free-text, number, or date field types (Phase 4b+).
- Registration form templates.
- Per-field analytics or reporting.

### Non-Functional Requirements

- **Maximum 5 fields**: enforced server-side (same as create). Attempts to add a 6th field must return `400 Bad Request`.
- **Forward-compatible storage**: the edit path must not break the schema's ability to support future field types (Inventory, etc.).
- **Validation on publish**: when `is_draft=false`, all required field settings must be validated. Draft events skip full validation — consistent with the draft-mode contract established in [#1820](https://github.com/climateconnect/climateconnect/issues/1820).
- **No breaking changes** to existing API contracts.
- **Toggle gate**: all new frontend UI must be gated behind `REGISTRATION_CUSTOM_FIELDS`. This toggle is separate from `EVENT_REGISTRATION` (dev ✅, staging ✅, production ❌). All four Phase 4a tasks (create, edit, organiser view, registrant-side follow-up) must be validated on staging together before the toggle is flipped.
- **Delete guard**: deletion of fields and options is **allowed** even when registrant answers exist because the `RegistrationFieldAnswer` model already uses `CASCADE` on both `field` and `value_option` foreign keys. The backend simply performs the deletion and the database cascade removes dependent answers automatically. The frontend must show a **confirmation dialog** before deleting a field or an option that was previously saved (has an `id`).
- **Required flag**: a field can be changed from **required → not required** and from **not required → required** at any time, regardless of existing registrations or answers. The organiser accepts responsibility for any incomplete data; the backend does not block this change.

### AI Agent Insights and Additions

- **Backend already partially implemented**: `EditEventRegistrationConfigSerializer` and `EditRegistrationConfigView` already support reading and writing nested `fields` (the create task wired them in). What remains is adding the **answer-aware guard logic** inside `EditEventRegistrationConfigSerializer.validate()` and updating `sync_fields()` / `_sync_options()` to remove their Phase-4a-only placeholder comments.
- **Frontend — single edit surface**: the custom field builder is added to the **dedicated registration settings modal** (`EditEventRegistrationModal.tsx`), not the full project edit page. The full project edit page (`/editProject/[projectUrl].tsx`) is reserved for core project settings (name, description, dates, team members, collaborators). Registration settings — including custom fields — are managed separately via the modal that `PATCH`es `/api/projects/{slug}/registration-config/`.
- **Modal state management**: `EditEventRegistrationModal` uses local form state (useState for each field) and constructs a flat payload object for the PATCH. To support nested `fields`, the modal must:
  - Load existing `fields` from `eventRegistration.fields` (already returned by `GET /api/projects/{slug}/`) into local state.
  - Manage add/edit/reorder/delete of field items in memory.
  - Include the full `fields` array in the PATCH payload.
  - Handle backend validation errors mapped to individual field items (e.g. `fields[0].settings.description`).
- **Error handling**: DRF nested serializer errors return keys like `fields[0][settings][description]`. The modal's error parser must flatten these into a usable structure for the UI. The existing modal already handles flat field-level errors (`max_participants`, `registration_end_date`, `status`, `general`); it should be extended to parse nested `fields` errors and pass them down to the field builder components.
- **Component reuse**: the same sub-components created for the create flow (`RegistrationFieldList`, `RegistrationFieldEditor`, `CheckboxFieldEditor`, `OptionSelectFieldEditor`) should be reused. They already accept a controlled `fields` array and an `onChange` callback, so they can be dropped into `EditEventRegistrationModal.tsx` without modification.
- **Confirmation dialog strategy**: the frontend does not need a `has_answers` flag from the API. Any field or option that has an `id` (i.e., it was previously persisted) might have answers. The simplest reliable guard is to show a confirmation dialog whenever the user attempts to delete a persisted field or option. The dialog copy should warn that existing registrant data will be lost.
- **No new migrations**: `RegistrationField`, `RegistrationFieldOption`, and `RegistrationFieldAnswer` tables all exist from prior tasks.

---

## System Impact

- **Actors involved**:
  - `Organiser / Team Admin` — edits custom registration fields on an existing event they manage.
  - `System` — enforces the 5-field limit, validates field settings on publish, persists changes, guards required-flag changes when answers are missing, and cascades deleted field/option answers automatically.

- **Entities added**: None — reuses `RegistrationField`, `RegistrationFieldOption`, and `RegistrationFieldAnswer` from prior tasks.

- **Entities changed**:
  - `EventRegistrationConfig` — edit serializer already supports writable nested `fields` (create task added this). This task only adds the **required-flag guard** in `validate()`.

- **Flows added**:
  - **Edit Registration Fields** — Organiser opens event → clicks "Edit registration settings" → modal opens with existing fields pre-loaded → organiser adds/edits/reorders/deletes fields → saves.

- **Flows changed**:
  - **Edit Event Registration Settings** (`EditEventRegistrationModal`) — extended with a "Custom fields" section (toggle-gated). No change to the existing save path; the PATCH payload simply gains a `fields` key.
  - **View Event Detail** — no change; `fields` already returned in `GET /api/projects/{slug}/` by the create task.

- **Integration changes**:
  - No new toggle required — reuses `REGISTRATION_CUSTOM_FIELDS` from the create task.

- **Migrations required**: None.

---

## Software Architecture

### Data Model

No new models — reuses `RegistrationField`, `RegistrationFieldOption`, and `RegistrationFieldAnswer` from prior tasks.

### API

**Edit registration config with fields** (existing endpoint, already supports `fields`; this task adds guard logic):

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
    ← field id: 3 absent from array → deleted (answers cascade-deleted automatically)
  ]
}
```

Sync rules (applied atomically in one transaction by `sync_fields()`):
- Item **with `id`** → update that field (and sync its options the same way)
- Item **without `id`** → create as new field
- Existing field **absent from the array** → delete (with `CASCADE` on `RegistrationFieldAnswer` via DB FK)

**Read — fields in project detail** (already handled by create task):

`GET /api/projects/{slug}/` → `event_registration_config.fields` array returned, ordered by `order`.

**Validation (publish, `is_draft=false`)**:
- Checkbox: `settings.description` must be non-empty and non-whitespace HTML.
- Option select: must have at least one option with a non-empty `title`.
- All types: `order` values must be unique within the config; max 5 fields total.

**Validation (draft)**: all publish validations are skipped.

**Error responses**:

| Status | Condition |
|--------|-----------|
| `400` | 6th field; option select with 0 options on publish; missing required settings; nested field validation error |
| `401` | Unauthenticated |
| `403` | Not organiser or team admin |
| `404` | Project not found or no registration config |

### Backend

- **`organization/serializers/event_registration.py`** — remove the placeholder comment in `sync_fields()` that says "RegistrationFieldAnswer does not exist yet" — no code change needed there because the DB `CASCADE` already handles answer deletion. No other backend changes are required; `is_required` may be toggled freely at any time.
- **`organization/serializers/registration_field.py`** — optionally clean up the `_sync_options()` and `sync_fields()` docstrings to remove Phase-4a-only placeholders. No functional change needed because `CASCADE` on the `RegistrationFieldAnswer` FKs is already configured in the model.
- **`organization/views/event_registration_views.py`** — change `EditRegistrationConfigView.patch()` to derive `is_draft` from `project.is_draft` instead of reading it from the request body. The backend already knows the project's draft state, so the frontend does not need to send `is_draft` explicitly. This ensures draft events skip publish-time field validation (e.g. empty checkbox description) without requiring the modal to pass extra state.
- **No new view file and no new URL patterns**.

### Frontend

- **`src/components/project/EditEventRegistrationModal.tsx`** — extend the modal with:
  - Local state for `fields` (loaded from `eventRegistration.fields` on open).
  - Render `RegistrationFieldList` (toggle-gated behind `isEnabled("REGISTRATION_CUSTOM_FIELDS")`) below the existing max_participants / end_date / status / notify_admins fields.
  - Include `fields` in the PATCH payload sent to `/api/projects/{slug}/registration-config/`.
  - Parse nested `fields` errors from the backend response and pass them to the field builder components.
  - Show a **confirmation dialog** when the user attempts to delete a field or option that has an `id` (i.e., was previously saved). The dialog warns that existing registrant answers will be permanently deleted.
- **Reused components** (all created in the create task; this task wires them into the edit modal):
  - `RegistrationFieldList.tsx`
  - `RegistrationFieldEditor.tsx`
  - `CheckboxFieldEditor.tsx`
  - `OptionSelectFieldEditor.tsx`
- **Text keys** — add any edit-specific labels (e.g. "Edit custom fields", "No custom fields yet", delete confirmation copy) in `public/texts/project_texts.tsx` (EN + DE).
- **Toggle check** — `isEnabled("REGISTRATION_CUSTOM_FIELDS")` wraps the entire field builder section in the modal.

### Data / Migrations

None.

---

## Files to Change

### Backend

| File | Change |
|------|--------|
| `organization/serializers/event_registration.py` | Clean up placeholder comments about answer storage (no functional change) |
| `organization/serializers/registration_field.py` | Clean up docstring placeholders that say "RegistrationFieldAnswer does not exist yet" (no functional change) |
| `organization/views/event_registration_views.py` | Derive `is_draft` from `project.is_draft` instead of `request.data.get("is_draft")` |
| `organization/tests/test_event_registration.py` | Add tests for field edit/sync and error responses |

### Frontend

| File | Change |
|------|--------|
| `src/components/project/EditEventRegistrationModal.tsx` | Add toggle-gated field builder section; manage `fields` local state; include `fields` in PATCH payload; parse nested field errors; add confirmation dialog for delete |
| `public/texts/project_texts.tsx` | Add new text keys (EN + DE) for edit-specific labels and delete confirmation copy |

---

## Test Cases

### Backend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | PATCH registration config with 5 custom fields (mix of checkbox and option select) | Fields updated/created; returned in order on subsequent GET |
| 2 | Attempt to add a 6th field via PATCH | `400 Bad Request` |
| 3 | Option select with zero options on publish (`is_draft=false`) | `400 Bad Request` |
| 4 | Option select with zero options on draft save | Accepted |
| 5 | Reorder fields via PATCH | New order reflected in API response |
| 6 | Delete a field that has no answers | Field and its options removed |
| 7 | Delete a field that has answers | Field, options, and related answers removed via DB `CASCADE`; no backend error |
| 7b | Delete an option that has answers | Option and related answers removed via DB `CASCADE`; no backend error |
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
| 8 | Delete a previously saved field | Confirmation dialog shown; on confirm, field removed from UI and PATCH sent without it |
| 9 | Delete a previously saved option within an option-select field | Confirmation dialog shown; on confirm, option removed from UI |
| 11 | Reorder then delete a field | Order indices recalculated correctly before PATCH |

---

## Dependency Notes

- **Depends on** [#1880](https://github.com/climateconnect/climateconnect/issues/1880) (create task): `RegistrationField`, `RegistrationFieldOption`, `RegistrationFieldSerializer`, `sanitize_html`, `bleach`, and `REGISTRATION_CUSTOM_FIELDS` toggle must already exist. This task extends the create infrastructure to the edit flow.
- **Depends on** [#1960](https://github.com/climateconnect/climateconnect/issues/1960) (registrant-side answer storage): `RegistrationFieldAnswer` model must exist so the backend can enforce the required-flag guard and so the frontend confirmation dialog has real data to protect. This dependency is now satisfied.

---

## Acceptance Criteria

- [ ] An organiser can view and edit up to 5 custom fields on an existing event's registration form (checkbox and/or option select).
- [ ] The organiser can reorder fields; the order is preserved and returned by the API.
- [ ] Each field can be marked as required.
- [ ] **Checkbox**: has a rich-text description field supporting bold and links.
- [ ] **Option select**: has a title and at least one option; each option has a title and an order value.
- [ ] Attempting to add a 6th field is rejected server-side with `400 Bad Request`.
- [ ] An option select with zero options is rejected server-side on publish (`is_draft=false`); accepted on draft save.
- [ ] Deleting a field or option cascades to delete related registrant answers automatically via the existing DB `CASCADE` constraint. The frontend shows a confirmation dialog before deleting a previously saved field or option.
- [ ] The `is_required` flag on a field may be toggled freely at any time (required ↔ not required), regardless of existing registrations or answers.
- [ ] The custom field definitions are returned as part of the event API response, in configured order, with enough data for the registrant-side task to render the form.
- [ ] All new frontend UI is gated behind the `REGISTRATION_CUSTOM_FIELDS` feature toggle.
- [ ] No breaking changes to existing API contracts.
- [ ] All tests pass.
- [ ] Code review approved.

---

## Log

- 2026-05-12 07:25 — Task created from GitHub issue [#1961](https://github.com/climateconnect/climateconnect/issues/1961). DRAFT spec written assuming #1960 was not yet merged.
- 2026-05-19 07:30 — Spec updated to READY FOR IMPLEMENTATION. #1960 (answer storage) is now merged. Backend serializer and view already support nested `fields` on PATCH (create task wired them in). Remaining work: (1) wire existing field-builder components into `EditEventRegistrationModal.tsx`, (2) add frontend confirmation dialogs for delete, (3) add tests. No backend guard logic needed; `is_required` may be toggled freely.

# Organiser Edits Event Registration Custom Fields (Phase 4a — Edit)

**Status**: COMPLETED (see Log 2026-05-19 #2)
**Type**: Feature
**Date and time created**: 2026-05-12 07:25
**Date and time updated**: 2026-05-19
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
- **Answer-aware edit restrictions** — once a field has at least one registrant answer, certain text properties become immutable (to preserve answer integrity):
  - **Checkbox**: `settings.description` is read-only; cannot be changed via the editor or accepted by the backend.
  - **Option select**: `settings.title` (the question label) is read-only.
  - **Option select — existing options**: individual option `title` values are read-only. Options may still be reordered or deleted (with confirmation), and new options may be added.
  - These restrictions apply **only when answers exist**. If no registrant has yet answered a field/option, all text properties remain freely editable.
  - The `is_required` flag remains freely editable regardless of answers (see note in Non-Functional Requirements).

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
- **Delete guard**: deletion of fields and options is **allowed** even when registrant answers exist because the `RegistrationFieldAnswer` model already uses `CASCADE` on both `field` and `value_option` foreign keys. The backend simply performs the deletion and the database cascade removes dependent answers automatically. The frontend must show a **confirmation dialog** before deleting a field or option that has `has_answers: true`.
- **Edit guard (text properties)**: when `has_answers: true` on a field or option, the backend must reject modifications to protected text properties and the frontend must show them as read-only. See the `has_answers` surface in the API section.
- **Required flag**: a field can be changed from **required → not required** and from **not required → required** at any time, regardless of existing registrations or answers. The organiser accepts responsibility for any incomplete data; the backend does not block this change.

### AI Agent Insights and Additions

- **Backend `has_answers` flag required**: `RegistrationFieldSerializer` must expose a read-only `has_answers: bool` on each field (True if any `RegistrationFieldAnswer` row references that field). `RegistrationFieldOptionSerializer` must expose `has_answers: bool` on each option (True if any `RegistrationFieldAnswer` row references that option's `value_option`). These flags are included in `GET /api/projects/{slug}/` and in the `EditEventRegistrationConfigSerializer` PATCH response.
- **Backend write guard for text properties**: `sync_fields()` / `_sync_options()` (or a pre-save validation step in `EditEventRegistrationConfigSerializer.validate()`) must enforce that when a field or option has existing answers, the protected text properties are not changed. Specifically:
  - Checkbox field with answers: reject if the submitted `settings.description` differs from the stored value.
  - Option select field with answers: reject if the submitted `settings.title` differs from the stored value.
  - Option with answers: reject if the submitted `title` differs from the stored value.
  Return `400 Bad Request` with a field-level error message. (Changing `is_required` and `order` is always permitted.)
- **Frontend — single edit surface**: the custom field builder is added to the **dedicated registration settings modal** (`EditEventRegistrationModal.tsx`), not the full project edit page. The full project edit page (`/editProject/[projectUrl].tsx`) is reserved for core project settings (name, description, dates, team members, collaborators). Registration settings — including custom fields — are managed separately via the modal that `PATCH`es `/api/projects/{slug}/registration-config/`.
- **Modal state management**: `EditEventRegistrationModal` uses local form state (useState for each field) and constructs a flat payload object for the PATCH. To support nested `fields`, the modal must:
  - Load existing `fields` from `eventRegistration.fields` (already returned by `GET /api/projects/{slug}/`) into local state.
  - Manage add/edit/reorder/delete of field items in memory.
  - Include the full `fields` array in the PATCH payload.
  - Handle backend validation errors mapped to individual field items (e.g. `fields[0].settings.description`).
- **Error handling**: DRF nested serializer errors return keys like `fields[0][settings][description]`. The modal's error parser must flatten these into a usable structure for the UI. The existing modal already handles flat field-level errors (`max_participants`, `registration_end_date`, `status`, `general`); it should be extended to parse nested `fields` errors and pass them down to the field builder components.
- **Component reuse with read-only support**: the sub-components (`RegistrationFieldList`, `RegistrationFieldEditor`, `CheckboxFieldEditor`, `OptionSelectFieldEditor`) need minor extension to accept a `readOnly` signal for answer-locked text properties. `CheckboxFieldEditor` must disable its description input when `has_answers=true`. `OptionSelectFieldEditor` must disable the title input when the field `has_answers=true` and disable individual option title inputs when the option `has_answers=true`.
- **Confirmation dialog strategy** (revised): show a confirmation dialog when the user attempts to delete a field or option where `has_answers=true`. For fields/options without answers (`has_answers=false`), delete immediately without confirmation, even if the item is persisted (has an `id`).
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

**Read — fields in project detail** (already handled by create task; this task adds `has_answers`):

`GET /api/projects/{slug}/` → `event_registration_config.fields` array returned, ordered by `order`.

Each field object now includes:

```json
{
  "id": 1,
  "field_type": "checkbox",
  "order": 0,
  "is_required": true,
  "settings": { "description": "<p>I agree to the terms.</p>" },
  "has_answers": true,
  "options": []
}
```

Each option object (for option_select fields) now includes:

```json
{
  "id": 10,
  "title": "Vegetarian",
  "order": 0,
  "has_answers": false
}
```

`has_answers: true` on a **field** means at least one `RegistrationFieldAnswer` row references that field.
`has_answers: true` on an **option** means at least one `RegistrationFieldAnswer` row has `value_option` pointing to that option.

**Validation (publish, `is_draft=false`)**:
- Checkbox: `settings.description` must be non-empty and non-whitespace HTML.
- Option select: must have at least one option with a non-empty `title`.
- All types: `order` values must be unique within the config; max 5 fields total.

**Validation (draft)**: all publish validations are skipped.

**Answer-lock validation** (applies regardless of draft state, on any PATCH that touches an existing field/option):
- Checkbox field with `has_answers=true`: reject if submitted `settings.description` differs from the stored value.
- Option select field with `has_answers=true`: reject if submitted `settings.title` differs from the stored value.
- Option with `has_answers=true`: reject if submitted `title` differs from the stored value.

**Error responses**:

| Status | Condition |
|--------|-----------|
| `400` | 6th field; option select with 0 options on publish; missing required settings; nested field validation error; attempt to change a locked text property on a field or option that has answers |
| `401` | Unauthenticated |
| `403` | Not organiser or team admin |
| `404` | Project not found or no registration config |

### Backend

- **`organization/serializers/event_registration.py`** — ✅ done (placeholder comment removed).
- **`organization/serializers/registration_field.py`** — needs the following changes (not yet implemented):
  - `RegistrationFieldSerializer`: add read-only `has_answers` `SerializerMethodField` — `True` if `RegistrationFieldAnswer.objects.filter(field=instance).exists()`.
  - `RegistrationFieldOptionSerializer`: add read-only `has_answers` `SerializerMethodField` — `True` if `RegistrationFieldAnswer.objects.filter(value_option=instance).exists()`.
  - `_sync_options()`: before updating an option that has answers, check if `title` changed; raise `ValidationError` if so.
  - `sync_fields()`: before updating a field that has answers, check if the locked text property changed (`description` for checkbox, `title` in settings for option_select); raise `ValidationError` if so.
- **`organization/views/event_registration_views.py`** — ✅ done (`is_draft` now derived from `project.is_draft`).
- **No new view file and no new URL patterns**.

### Frontend

- **`src/components/shareProject/CheckboxFieldEditor.tsx`** — add optional `disabled?: boolean` prop; disable the TipTap editor when `true`.
- **`src/components/shareProject/OptionSelectFieldEditor.tsx`** — add optional `titleDisabled?: boolean` prop (disables the title TextField when the field has answers). Option rows: disable the title TextField for options where `option.has_answers === true`. *(`onRequestDeleteOption` prop already added in the partial implementation.)*
- **`src/components/shareProject/RegistrationFieldEditor.tsx`** — pass `disabled`/`titleDisabled` down to the appropriate sub-editor based on `field.has_answers`.
- **`src/components/shareProject/RegistrationFieldList.tsx`** — pass `has_answers`-based read-only signals through `RegistrationFieldEditor`. *(`onRequestDeleteField`/`onRequestDeleteOption` props already added in the partial implementation.)*
- **`src/components/project/EditEventRegistrationModal.tsx`** — ✅ partially done (fields state, RegistrationFieldList, confirmation dialogs, PATCH payload). Still needed:
  - Change confirmation dialog trigger: show only when `field.has_answers === true` (not for all persisted fields).
  - Pass `has_answers` through to sub-editors so locked text fields render as read-only.
- **`src/types.ts`** — add `has_answers?: boolean` to `RegistrationField` and `RegistrationFieldOption` types.
- **`public/texts/project_texts.tsx`** — ✅ done (delete confirmation copy added in EN + DE).
- **Toggle check** — `isEnabled("REGISTRATION_CUSTOM_FIELDS")` wraps the entire field builder section in the modal. ✅ done.

### Data / Migrations

None.

---

## Files to Change

### Backend

| File | Change | Status |
|------|--------|--------|
| `organization/serializers/event_registration.py` | Clean up placeholder comments about answer storage (no functional change) | ✅ done |
| `organization/serializers/registration_field.py` | (1) Add `has_answers` SerializerMethodField to `RegistrationFieldSerializer` and `RegistrationFieldOptionSerializer`; (2) enforce answer-lock in `sync_fields()` / `_sync_options()` | ⬜ not yet implemented |
| `organization/views/event_registration_views.py` | Derive `is_draft` from `project.is_draft` instead of `request.data.get("is_draft")` | ✅ done |
| `organization/tests/test_event_registration_custom_fields.py` | Add tests for field edit/sync, cascade deletes, and answer-lock violations | ✅ partially done — answer-lock tests still needed |

### Frontend

| File | Change | Status |
|------|--------|--------|
| `src/types.ts` | Add `has_answers?: boolean` to `RegistrationField` and `RegistrationFieldOption` | ⬜ not yet implemented |
| `src/components/shareProject/CheckboxFieldEditor.tsx` | Add `disabled?: boolean` prop; disable editor when true | ⬜ not yet implemented |
| `src/components/shareProject/OptionSelectFieldEditor.tsx` | Add `titleDisabled?: boolean` prop; disable option title inputs for `has_answers` options | ⬜ not yet implemented (`onRequestDeleteOption` ✅ done) |
| `src/components/shareProject/RegistrationFieldEditor.tsx` | Pass `disabled`/`titleDisabled` to sub-editors based on `field.has_answers` | ⬜ not yet implemented (`onRequestDeleteOption` pass-through ✅ done) |
| `src/components/shareProject/RegistrationFieldList.tsx` | Pass has_answers-based read-only signals through | ⬜ not yet implemented (`onRequestDeleteField`/`onRequestDeleteOption` ✅ done) |
| `src/components/project/EditEventRegistrationModal.tsx` | Add toggle-gated field builder section; manage `fields` local state; include `fields` in PATCH payload; parse nested field errors; confirmation dialogs; pass `has_answers` to sub-editors | ✅ partially done — `has_answers`-based read-only and corrected delete-confirmation trigger not yet implemented |
| `public/texts/project_texts.tsx` | Add new text keys (EN + DE) for edit-specific labels and delete confirmation copy | ✅ done |

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
| 14 | PATCH attempts to change checkbox description when field has answers | `400 Bad Request` |
| 15 | PATCH attempts to change option select title when field has answers | `400 Bad Request` |
| 16 | PATCH attempts to change option title when option has answers | `400 Bad Request` |
| 17 | PATCH changes `is_required` on a field that has answers | `200 OK`; flag updated |
| 18 | PATCH changes `order` on a field that has answers | `200 OK`; order updated |
| 19 | GET field with answers — `has_answers` flag on field and option | `has_answers: true` returned for field; `has_answers: true` returned for answered option, `false` for unanswered option |

### Frontend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | Organiser opens "Edit registration settings" modal — no custom fields yet | Field builder UI shows empty state with "Add field" button |
| 2 | Modal opens with existing checkbox field (no answers) | Pre-loaded description and required toggle shown; description editor is editable |
| 3 | Modal opens with existing checkbox field (`has_answers=true`) | Description editor is disabled/read-only |
| 4 | Modal opens with existing option select field (no answers) | Title and option titles are editable |
| 5 | Modal opens with existing option select field (`has_answers=true` on field) | Title input is disabled; options with `has_answers=true` have their title disabled |
| 6 | Add a 6th field in the modal | "Add field" button disabled or shows error (max 5 reached) |
| 7 | Reorder fields in the modal | Order reflected in preview and saved correctly |
| 8 | Save modal with invalid field (e.g. empty checkbox description on publish) | Inline error shown on the field; modal stays open |
| 9 | Feature toggle disabled | Field builder UI not rendered in modal |
| 10 | Delete a field with `has_answers=true` | Confirmation dialog shown; on confirm, field removed from UI and PATCH sent without it |
| 11 | Delete a field with `has_answers=false` (or new unsaved field) | Field removed immediately with no confirmation dialog |
| 12 | Delete an option with `has_answers=true` | Confirmation dialog shown; on confirm, option removed |
| 13 | Delete an option with `has_answers=false` | Option removed immediately with no confirmation dialog |
| 14 | Reorder then delete a field | Order indices recalculated correctly before PATCH |

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
- [ ] Deleting a field or option cascades to delete related registrant answers automatically via the existing DB `CASCADE` constraint. The frontend shows a confirmation dialog before deleting a field or option where `has_answers=true`.
- [ ] The `is_required` flag on a field may be toggled freely at any time (required ↔ not required), regardless of existing registrations or answers.
- [ ] The custom field definitions are returned as part of the event API response, in configured order, with `has_answers` flags on fields and options so the UI can enforce read-only constraints.
- [ ] All new frontend UI is gated behind the `REGISTRATION_CUSTOM_FIELDS` feature toggle.
- [ ] No breaking changes to existing API contracts.
- [ ] All tests pass.
- [ ] Code review approved.

---

## Log

- 2026-05-12 07:25 — Task created from GitHub issue [#1961](https://github.com/climateconnect/climateconnect/issues/1961). DRAFT spec written assuming #1960 was not yet merged.
- 2026-05-19 07:30 — Spec updated to READY FOR IMPLEMENTATION. #1960 (answer storage) is now merged. Backend serializer and view already support nested `fields` on PATCH (create task wired them in). Remaining work: (1) wire existing field-builder components into `EditEventRegistrationModal.tsx`, (2) add frontend confirmation dialogs for delete, (3) add tests. No backend guard logic needed; `is_required` may be toggled freely.
- 2026-05-19 (this session) — Partial implementation completed: backend comment cleanup ✅, `is_draft` derivation fix ✅, confirmation dialogs ✅, `RegistrationFieldList`/`RegistrationFieldEditor`/`OptionSelectFieldEditor` delete-intercept props ✅, text keys ✅, `EditEventRegistrationModal` field builder section ✅. **Spec gap identified** by comparing #1961 issue text vs. spec: the issue requires answer-aware read-only restrictions on text properties (checkbox description, option select title, option titles) when answers exist. This was missing from the spec and not implemented. See updated Core Requirements, API, Backend, and Frontend sections above. Remaining work: (1) `has_answers` flag on `RegistrationFieldSerializer` and `RegistrationFieldOptionSerializer`; (2) answer-lock enforcement in `sync_fields()`/`_sync_options()`; (3) `has_answers` type additions and read-only UI in frontend field editor components; (4) update delete-confirmation trigger to `has_answers` rather than "has id"; (5) additional backend and frontend tests (test cases 14–19).

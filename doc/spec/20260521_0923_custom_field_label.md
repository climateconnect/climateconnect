# Custom Registration Field Label for Event Registration

**Status**: COMPLETED
**Type**: Feature
**Date and time created**: 2026-05-21 09:23
**GitHub Issue**: [#1997](https://github.com/climateconnect/climateconnect/issues/1997)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260416_1000_event_registration_custom_fields.md`](./20260416_1000_event_registration_custom_fields.md) ← foundational custom fields spec (Phase 4a)
- [`20260512_0725_edit_event_registration_custom_fields.md`](./20260512_0725_edit_event_registration_custom_fields.md) ← edit flow spec
- [`20260519_1328_inventory_field_type_event_registration.md`](./20260519_1328_inventory_field_type_event_registration.md) ← inventory field type
- [`20260520_0750_display_custom_field_answers_in_organiser_views.md`](./20260520_0750_display_custom_field_answers_in_organiser_views.md) ← organiser export/print views
- [`20260520_1334_improve_custom_field_editor_ui.md`](./20260520_1334_improve_custom_field_editor_ui.md) ← field editor UI polish

---

## Problem Statement

When an organiser creates or edits custom registration fields for an event, each field has a type-specific display element — `settings.description` (rich text) for checkbox fields, `settings.title` (plain text) for option_select and inventory fields. These serve as the **registrant-facing question text** and are rendered on the public registration form.

However, there is no **organiser-facing label** to identify fields in contexts where the registrant-facing text is not suitable or not available:

- **Printed guest lists** — the organiser exports or prints registrations. Column headers derived from rich-text HTML (checkbox descriptions) are unreadable in a spreadsheet or on paper.
- **Organiser registration overview** — when reviewing registrations, the organiser sees field IDs or raw settings keys rather than a human-readable identifier.
- **Multi-field disambiguation** — an event may have two checkbox fields with similar descriptions. A short, organiser-defined label would let the organiser distinguish them at a glance (e.g. "Dietary needs" vs. "Accessibility").

This task adds a short, plain-text **label** (max 30 characters, required, unique per event) to each custom registration field. A sensible default is generated automatically (localised field type + sequential number), and the organiser can customise it via an inline edit (pencil icon). The label is purely for organiser identification — it does **not** replace or duplicate the registrant-facing question text in `settings`.

**Core Requirements (User/Stakeholder Stated):**

1. When a custom field is added in the create or edit event registration form, it receives a **default label** composed of: the localised field type name + a sequential number (e.g. "Checkbox 1", "Single choice 2", "Inventory 1"). The number is per-type and counts existing fields of the same type in the current form (including the new one).
2. The organiser can **edit the generated label** inline. A pencil icon is displayed next to the label; clicking it turns the label into an editable text input. Clicking away or pressing Enter saves the change. The text input is **not** shown by default — only the pencil icon triggers edit mode.
3. The label is **max 30 characters**.
4. The label is **required and must not be blank**. The organiser cannot delete it or leave it empty — the frontend always auto-generates a default, and the backend rejects empty values.
5. The label must be **unique within a registration configuration** (i.e. per event). Two fields on the same event cannot share the same label.
6. The label is persisted to the database and returned in API responses. It is used in the organiser's registration export, print, and overview views as the column header or identifier for the field.

**Explicitly Out of Scope (this task):**

- Changes to the registrant-facing registration form (the label is not shown to registrants).
- Changes to the `settings.title` or `settings.description` fields.
- Changes to the export/print logic itself — the export views will be updated to *use* the label as a column header, but the export feature's structure is not modified.
- Any new feature toggles — reuses the existing `REGISTRATION_CUSTOM_FIELDS` toggle.
- Changes to the `RegistrationFieldOption` model or option-level labels.

### Non-Functional Requirements

- **No breaking changes** to existing API contracts. The `fields` array in project detail and registration list responses gains a new `label` property; existing consumers that do not recognise it should ignore it gracefully.
- **Default label generation is client-side** — the frontend computes the default when the organiser adds a field and sends it in the payload. The backend does not auto-generate labels, but enforces that `label` is non-empty on every write.
- **Max length enforcement** — both frontend (input `maxLength` attribute) and backend (serializer validation) enforce the 30-character limit.
- **Non-empty enforcement** — the backend rejects empty or blank `label` values with `400 Bad Request`. The frontend prevents the organiser from clearing the label (the inline edit does not allow saving an empty value).
- **Uniqueness enforcement** — labels must be unique within a registration configuration. The backend validates this on write and returns `400` on duplicate. The frontend should show a validation error if the organiser enters a label that conflicts with another field in the same form.
- **Toggle gate** — all new frontend UI is gated behind `isEnabled("REGISTRATION_CUSTOM_FIELDS")`. No new toggle required.
- **Accessibility** — the pencil icon button must have an `aria-label` (e.g. "Edit field label"). The inline text input must have an appropriate `aria-label` as well.

### AI Agent Insights and Additions

- **Why a dedicated `label` column, not inside `settings`?** The `settings` JSONField is type-specific — its schema differs per field type (checkbox has `description`, option_select has `title`, inventory has `title` + `description`). The label is a **universal, cross-type property** with the same semantics and constraints regardless of field type. A dedicated column keeps the schema clean, avoids duplicating validation logic across three settings serializers, and makes the label queryable/indexable if needed in the future.

- **Default label generation algorithm (frontend)**:
  1. When the organiser adds a new field, the frontend counts how many fields of the same `field_type` already exist in the form (including the new one).
  2. The default label is `{localised_type_name} {count}`.
  3. Localised type names are already defined in `project_texts.tsx`:
     - `texts.field_type_checkbox` → EN: "Checkbox", DE: "Checkbox"
     - `texts.field_type_option_select` → EN: "Single choice", DE: "Einfachauswahl"
     - `texts.field_type_inventory` → EN: "Inventory", DE: "Inventar"
  4. Example: if the form already has 1 checkbox field and the organiser adds a second, the default label is "Checkbox 2" (EN) / "Checkbox 2" (DE).

- **Inline edit UX pattern**: In the field card header, the label replaces the type text (e.g. "Single choice") while the type icon remains visible. The label is displayed as a `<Typography>` by default. A small pencil `IconButton` sits next to it. On click, the Typography is replaced by a controlled `<TextField size="small" inputProps={{ maxLength: 30 }}>`. On blur or Enter key, the TextField is replaced back by Typography. The pencil icon is hidden while the TextField is active. This is a common inline-edit pattern — no modal, no separate form.

- **Where in the field card header**: The current `RegistrationFieldList.tsx` renders each field's header with `icon + type label` on the left, and `up/down arrow buttons` on the right. The label **replaces** the type text label (e.g. "Checkbox", "Single choice", "Inventory") — the type icon remains as the visual type indicator. The header becomes: `[type icon] [label] [pencil icon] [up/down arrows]`. This keeps the layout compact and avoids adding a second line.

- **Backend label field**: `CharField(max_length=30)`. No `blank=True`, no `default=""` — the label is always required. The data migration back-fills existing fields with auto-generated defaults.

- **Uniqueness constraint**: A `UniqueConstraint(fields=["registration_config", "label"], name="unique_registrationfield_label_per_config")` is added. This is a standard (non-deferred) constraint — unlike `order`, labels are not reordered in bulk within a transaction, so deferred is not needed. The serializer catches the `IntegrityError` and returns a user-friendly `400` message.

- **API shape**: The `label` field is added to `RegistrationFieldSerializer` as `CharField(max_length=30, required=True, allow_blank=False)`. On read, it is always returned. On write, it is required — omitting it returns `400`.

- **Export/print integration**: Since `label` is now always populated (required field, back-filled by data migration), export views use `label` directly as column headers — no fallback logic needed.

- **Answer-lock**: The label is **always mutable** — it is an organiser-facing display name and does not affect registrant answers. Changing the label after answers exist is safe and requires no guard.

---

## System Impact

- **Actors involved**:
  - `Organiser / Team Admin` — sets a custom label when creating or editing registration fields; sees labels in the field editor, registration overview, export, and print views.
  - `System` — validates label length, stores it, returns it in API responses.

- **Entities added**: None.

- **Entities changed**:
  - `RegistrationField` — gains `label` (CharField, max_length=30, required, unique per config).

- **Flows changed**:
  - **Custom Field Builder** (`RegistrationFieldList`, `RegistrationFieldEditor`) — the field card header type text is replaced by an inline-editable label (type icon remains as the visual type indicator).
  - **Project Detail Response** — `event_registration_config.fields[].label` is added to the response shape.
  - **Registration List Response** — `event_registration_config.fields[].label` is included.
  - **Export / Print Views** — column headers use `label` directly (always populated).

- **Migrations required**:
  - **Schema migration** on `organization.RegistrationField` to add `label` as `CharField(max_length=30)` with a `UniqueConstraint` on `(registration_config, label)`.
  - **Data migration** to back-fill `label` on all existing `RegistrationField` rows using the auto-generated default pattern (`{localised type name} {sequential number per type per config}`).

---

## Software Architecture

### Data Model

**`RegistrationField` (extended)**

| Field | Type | Notes |
|-------|------|-------|
| `label` | CharField(max_length=30) | **New.** Required. Organiser-facing field identifier for exports, prints, and overview. Unique per registration configuration. |

**New constraint**: `UniqueConstraint(fields=["registration_config", "label"], name="unique_registrationfield_label_per_config")` — ensures labels are unique within an event's registration form.

No changes to `RegistrationFieldOption`, `RegistrationFieldAnswer`, or any other model.

### API

**Read — project detail and registration list**

`GET /api/projects/{slug}/` and `GET /api/projects/{slug}/registrations/`

The `fields` array items gain a `label` property:

```json
{
  "id": 3,
  "field_type": "option_select",
  "order": 2,
  "is_required": true,
  "label": "Meal preference",
  "settings": {
    "title": "What would you like to eat?"
  },
  "has_answers": false,
  "options": [...]
}
```

`label` is always present in the response. It is never empty.

**Write — create event with fields**

`POST /api/projects/` → `event_registration_config.fields[]` requires `label`:

```json
{
  "field_type": "option_select",
  "order": 0,
  "is_required": true,
  "label": "Meal preference",
  "settings": { "title": "What would you like to eat?" },
  "options": [...]
}
```

If `label` is omitted or blank, the API returns `400`.

**Write — edit registration config**

`PATCH /api/projects/{slug}/registration-config/` → same `label` handling. The label is synced along with other field properties. Required on every field in the array.

**Validation**:
- `label` must be non-empty.
- `label` must be ≤ 30 characters.
- `label` must be unique within the registration configuration (no two fields on the same event may share a label).
- `label` is **not answer-locked** — it can be changed at any time, even after answers exist.

**Error responses**:

| Status | Condition |
|--------|-----------|
| `400` | `label` is missing, blank, exceeds 30 characters, or duplicates another field's label in the same config |
| `401` | Unauthenticated |
| `403` | Not organiser or team admin |
| `404` | Project not found or no registration config |

### Backend

- **`organization/models/registration_field.py`** — add `label = models.CharField(max_length=30)` to `RegistrationField`. Add `UniqueConstraint(fields=["registration_config", "label"], name="unique_registrationfield_label_per_config")` to `Meta.constraints`.
- **`organization/serializers/registration_field.py`** — add `label` to `RegistrationFieldSerializer.fields` list and `Meta.fields`. Define as `CharField(max_length=30, required=True, allow_blank=False)`. Add uniqueness validation in `validate_label()` or `validate()` that checks for duplicate labels within the same config (catch `IntegrityError` from the DB constraint and return a user-friendly error).
- **`organization/serializers/event_registration.py`** — no changes needed; the nested `fields` sync already delegates to `RegistrationFieldSerializer` and `sync_fields()`.
- **`organization/views/event_registration_views.py`** — no changes needed for label itself. Export/print views may need minor updates to use `label` as column header.
- **Schema migration**: `organization/migrations/01XX_registrationfield_label.py` — adds `label` to `RegistrationField` and the unique constraint.
- **Data migration**: `organization/migrations/01XX_registrationfield_label_backfill.py` — iterates all existing `RegistrationField` rows grouped by `registration_config` and `field_type`, assigns `{localised_type_name} {sequential_number}` to each. Uses `RegistrationFieldType` labels for the localised names (backend-side: "Checkbox", "Option Select", "Inventory").

### Frontend

- **`src/types.ts`** — add `label: string` (required, not optional) to `RegistrationField` type.
- **`src/components/shareProject/RegistrationFieldList.tsx`**:
  - Update `handleAddField` to compute a default label: `{localised_type_name} {count_of_same_type_in_form + 1}`. The label is always set — the field is never created without one.
  - Add a new inline-editable label component in the field card header (below the type icon+label line). Display mode: `<Typography>` + pencil `<IconButton>`. Edit mode: `<TextField size="small" inputProps={{ maxLength: 30 }}>`.
  - Inline edit validation: prevent saving an empty value (if the user clears the field and blurs, restore the previous value). Also validate uniqueness against other fields in the form — if a duplicate is entered, show a small error message and restore the previous value on blur.
  - Pass `label` changes up via `handleFieldChange`.
- **`src/components/shareProject/RegistrationFieldEditor.tsx`** — no changes needed; the label editing stays entirely in `RegistrationFieldList`.
- **`public/texts/project_texts.tsx`** — add text keys:
  - `edit_field_label` — EN: "Edit label", DE: "Bezeichnung bearbeiten"
  - `field_label_placeholder` — EN: "Field label", DE: "Feldbezeichnung"
  - `field_label_duplicate_error` — EN: "Label already used by another field", DE: "Bezeichnung wird bereits von einem anderen Feld verwendet"
- **Export/print views** (referenced in `20260520_0750_...`) — use `field.label` as column header (always populated, no fallback needed).

---

## Definition of Done

- [ ] Schema migration adds `label` (CharField, max_length=30) and `UniqueConstraint(registration_config, label)` to `RegistrationField`.
- [ ] Data migration back-fills `label` on all existing `RegistrationField` rows with auto-generated defaults (`{type name} {N}`).
- [ ] `RegistrationFieldSerializer` accepts and returns `label`; rejects blank, > 30 chars, and duplicate values.
- [ ] `label` is always mutable — no answer-lock guard applies.
- [ ] `GET /api/projects/{slug}/` returns `label` in the `fields` array (never empty).
- [ ] Frontend `handleAddField` computes a default label: `{localised type name} {sequential number}`.
- [ ] The field card header in `RegistrationFieldList` shows the type icon followed by the label (replacing the type text), with a pencil icon for inline editing.
- [ ] Clicking the pencil icon turns the label into a text input (max 30 chars). Blur or Enter saves. Empty input is rejected (restores previous value).
- [ ] Duplicate label input is rejected with a visible error message.
- [ ] The label is sent in create and edit payloads.
- [ ] Export/print views use `label` as column header.
- [ ] Existing checkbox, option_select, and inventory fields continue to work unchanged (regression tests pass).
- [ ] Text keys for EN and DE are added to `project_texts.tsx`.
- [ ] Toggle check `isEnabled("REGISTRATION_CUSTOM_FIELDS")` gates all new UI.
- [ ] `make format` passes on backend; `yarn lint` passes on frontend.
- [ ] Backend tests cover label creation, validation (max length, non-empty, uniqueness), and read/write round-trip.

---

## Test Plan

### Backend Tests

| Test | Module | What it verifies |
|------|--------|-----------------|
| Create field with label | `organization.tests.test_event_registration` | `POST /api/projects/` accepts `label` in nested field; persists correctly |
| Create field without label | `organization.tests.test_event_registration` | Omitting `label` returns `400` |
| Empty label rejected | `organization.tests.test_event_registration` | Sending `label: ""` returns `400` |
| Label max length enforced | `organization.tests.test_event_registration` | Sending `label` > 30 chars returns `400` |
| Label uniqueness enforced | `organization.tests.test_event_registration` | Two fields with the same `label` in one config returns `400` |
| Label round-trip | `organization.tests.test_event_registration` | `GET /api/projects/{slug}/` returns the same `label` that was sent on create |
| Edit field label | `organization.tests.test_event_registration` | `PATCH /api/projects/{slug}/registration-config/` updates `label` on an existing field |
| Label mutable with answers | `organization.tests.test_event_registration` | Changing `label` on a field that has registrant answers succeeds (no answer-lock) |
| Data migration backfill | `organization.tests.test_event_registration` | After migration, all existing fields have non-empty labels matching `{type name} {N}` pattern |

### Frontend Tests

| Test | Module | What it verifies |
|------|--------|-----------------|
| Default label on add | `RegistrationFieldList.test.tsx` | Adding a checkbox field generates default label "Checkbox 1"; adding a second generates "Checkbox 2" |
| Default label per type | `RegistrationFieldList.test.tsx` | Adding an option_select field when 2 checkbox fields exist generates "Single choice 1" (numbering is per-type) |
| Inline edit mode | `RegistrationFieldList.test.tsx` | The type text (e.g. "Single choice") is replaced by the label; the type icon remains visible. Clicking the pencil icon replaces the label Typography with a TextField |
| Label max length | `RegistrationFieldList.test.tsx` | The TextField has `maxLength=30` |
| Save on blur | `RegistrationFieldList.test.tsx` | Blurring the TextField saves the new label and switches back to Typography |
| Save on Enter | `RegistrationFieldList.test.tsx` | Pressing Enter in the TextField saves and exits edit mode |
| Empty input rejected | `RegistrationFieldList.test.tsx` | Clearing the TextField and blurring restores the previous label value |
| Duplicate label rejected | `RegistrationFieldList.test.tsx` | Entering a label that matches another field's label shows an error and restores the previous value |
| Localised defaults | `RegistrationFieldList.test.tsx` | With German locale, default labels use "Einfachauswahl" and "Inventar" |

---

## Files to Change

### Backend

| File | Change |
|------|--------|
| `organization/models/registration_field.py` | Add `label = models.CharField(max_length=30)` to `RegistrationField`; add `UniqueConstraint(fields=["registration_config", "label"])` |
| `organization/serializers/registration_field.py` | Add `label` to `RegistrationFieldSerializer`; enforce required, max_length=30, non-blank, uniqueness validation |
| `organization/tests/test_event_registration.py` | Add tests for label creation, validation (max length, non-empty, uniqueness), round-trip, edit, answer-ignoring, and data migration |
| `organization/migrations/` | Schema migration for `RegistrationField.label` + unique constraint; data migration to back-fill existing rows |

### Frontend

| File | Change |
|------|--------|
| `src/types.ts` | Add `label: string` (required) to `RegistrationField` type |
| `src/components/shareProject/RegistrationFieldList.tsx` | Compute default label on `handleAddField`; replace type text in field header with inline-editable label (icon stays); validate uniqueness and non-empty |
| `public/texts/project_texts.tsx` | Add `edit_field_label`, `field_label_placeholder`, `field_label_duplicate_error` text keys (EN + DE) |

---

## Notes and Open Questions

1. **Export/print view changes**: Since `label` is always populated (required field, back-filled by migration), export views use `label` directly as column headers. No fallback chain needed.

2. **Label uniqueness**: Labels must be unique within a registration configuration. Enforced by a `UniqueConstraint` on `(registration_config, label)` and by frontend validation. This prevents ambiguity in exports and organiser views.

3. **Retroactive default labels**: A data migration back-fills all existing `RegistrationField` rows with auto-generated labels (`{type name} {N}`). Since the `REGISTRATION_CUSTOM_FIELDS` toggle is not yet live in production, the existing data is test-only and small. The migration uses `RegistrationFieldType` labels for the type names: "Checkbox", "Option Select", "Inventory".

4. **Label in the guest answer export CSV**: Column headers always use the `label` value (never empty).

5. **Data migration localised names**: The data migration runs server-side and uses the backend's `RegistrationFieldType` display labels ("Checkbox", "Option Select", "Inventory") rather than the frontend's localised texts ("Single choice", "Inventar"). This is acceptable because: (a) the toggle is not live in production so only test data is affected, and (b) the organiser can edit the label after the migration if they prefer a different wording. If fully localised defaults are needed in the future, a more sophisticated migration using Django's translation framework could be written.

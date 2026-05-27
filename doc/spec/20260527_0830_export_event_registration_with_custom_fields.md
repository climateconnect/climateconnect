# Export Event Registration Results with Custom Field Data

**Status**: DRAFT
**Type**: Feature
**Date and time created**: 2026-05-27 08:30
**GitHub Issue**: [#1962](https://github.com/climateconnect/climateconnect/issues/1962)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260416_1000_event_registration_custom_fields.md`](./20260416_1000_event_registration_custom_fields.md) ← organiser-side custom field definitions (#1880)
- [`20260512_1015_register_for_event_with_extra_fields.md`](./20260512_1015_register_for_event_with_extra_fields.md) ← registrant-side answer storage (#1960)
- [`20260519_1328_inventory_field_type_event_registration.md`](./20260519_1328_inventory_field_type_event_registration.md) ← inventory field type (#1995)
- [`20260526_1347_add_inventory_field_to_event_registration.md`](./20260526_1347_add_inventory_field_to_event_registration.md) ← inventory registrant-side (#2004)
- [`20260526_1100_time_slot_field_type_event_registration.md`](./20260526_1100_time_slot_field_type_event_registration.md) ← time slot field type (#2006)
- [`20260526_1530_add_time_slot_field_to_event_registration.md`](./20260526_1530_add_time_slot_field_to_event_registration.md) ← time slot registrant-side (#2007)
- [`20260521_0923_custom_field_label.md`](./20260521_0923_custom_field_label.md) ← field label feature (#1997)

**Depends on**: [#1960](https://github.com/climateconnect/climateconnect/issues/1960) (registrant-side answer storage must be merged), [#1997](https://github.com/climateconnect/climateconnect/issues/1997) (field labels), and all Phase 4 field-type stories that store answers (#2004, #2007)

---

## Problem Statement

Event organisers can already see a list of registered guests in a MUI DataGrid and export that list as CSV (delivered in #1863). However, the CSV export only includes basic registration metadata: first name, last name, registration date, and cancellation status. When an event has custom registration fields (checkbox, option select, inventory, time slot), the answers guests submitted during registration are **not included** in the exported CSV.

Organisers who configure custom fields — for example meal preference, workshop selection, shuttle seat booking, or pickup time slot — currently have no way to bulk-download the answers. They must view each guest's answers individually via the "view answers" modal, which is impractical for events with many registrants.

This task extends the existing client-side CSV and print export in `ProjectRegistrationsContent.tsx` so that custom field answer columns are included alongside the standard registration columns. The CSV columns use the organiser-defined field label as the header.

**Core Requirements (from #1962):**

- When an event registration has custom fields, the CSV export includes one column per field (or two columns for inventory fields).
- Column headers use the field's `label` value.
- Field columns are ordered by `field.order` (same order as specified in the registration configuration).
- Per-field-type value formatting:
  - **Checkbox**: value = `TRUE` or `FALSE`.
  - **Option select**: value = selected option's `title`.
  - **Inventory**: two columns — `{label}-item` (selected option title) and `{label}-amount` (selected quantity).
  - **Time slot select**: value = localized time range string (same format as shown in the registration form options menu — e.g. "Mon, May 26, 2:00 PM – 4:00 PM").
- When a registrant has no answer for a field, the cell is empty.
- The print export includes the same custom field columns.

**Explicitly Out of Scope:**

- Backend changes — the `GET /api/projects/{slug}/registrations/` endpoint already returns `field_answers` with all needed data. Value resolution (option titles, time ranges) is done client-side.
- New export endpoints or server-side CSV generation.
- PDF export.
- Filtering registrations by custom field answers.
- Editing answers via the export view.

### Non-Functional Requirements

- **No backend changes required**: all data needed for export is already available via the existing `GET /registrations/` response and the project detail `event_registration_config.fields` array.
- **Backward-compatible**: events without custom fields export exactly as they do today.
- **Performance**: custom field columns are resolved client-side from already-fetched data. No additional API calls on export.
- **Feature toggle**: custom field columns are only added when `REGISTRATION_CUSTOM_FIELDS` is enabled and the event has configured fields.
- **Consistent formatting**: exported values use the same human-readable format as the UI. Time slots reuse the same `formatTimeRange()` helper as the registration form.

### AI Agent Insights and Additions

- **The export is entirely client-side**: MUI DataGrid's `GridToolbarExport` generates CSV from the `columns` array, filtered by the `csvFields` allowlist (line 623 of `ProjectRegistrationsContent.tsx`). A column must exist in the `columns` array for `GridToolbarExport` to include it — even if it is hidden from the grid view.
- **Hidden columns pattern already established**: `registered_at_iso` and `cancelled_at_iso` are defined in the `columns` array but hidden from the grid (`columnVisibilityModel: { ... false }`, `width: 0`, not sortable/filterable) and included only in `csvFields`. Custom field columns follow the same pattern — they must be added to `columns` (hidden) and to `csvFields` for export. Per-row answer viewing is already handled by the existing "View answers" modal (`ViewRegistrationAnswersModal.tsx`).
- **Field/option resolution is already done client-side**: `ViewRegistrationAnswersModal.tsx` (lines 120-124) builds a `Map<fieldId, answer>` and resolves option titles from `field.options`. The same logic should be extracted into a shared helper to avoid duplication.
- **Inventory answers use TWO value columns**: `RegistrationFieldAnswer` stores inventory as `value_option` (FK to option) + `value_number` (quantity). The export must expand each inventory field into two CSV columns: `{label}-item` and `{label}-amount`.
- **Time slot localization**: the `formatTimeRange()` helper in `RegistrationTimeSlotField.tsx` formats `start_time`/`end_time` into a localized string (e.g. "Mon, May 26, 2:00 PM – 4:00 PM"). For CSV export, use the same localized format — the time slot string is an identifier for the selected option (like an option title), not a machine-parseable date. Use the organiser's current locale.
- **`field_answers` are already prefetched**: the `GET /registrations/` view uses `prefetch_related("field_answers__field", "field_answers__value_option")`, so the data is available without N+1 queries.

---

## System Impact

- **Actors involved**:
  - `Organiser` — exports CSV/print of guest list including custom field answers.

- **Entities changed**: None (no model or migration changes).

- **Flows changed**:
  - **Export registrations** — CSV and print exports now include dynamic custom field columns.

- **Integration changes**:
  - No backend changes.
  - Frontend: `ProjectRegistrationsContent.tsx` dynamically generates custom field columns from `eventRegistration.fields` and `field_answers`.
  - Frontend: new shared helper to resolve answer values to human-readable strings.

- **Migrations required**: None.

---

## Software Architecture

### Data Model

No changes. The existing `RegistrationFieldAnswer` model and `RegistrationField` / `RegistrationFieldOption` models already store all data needed for export.

**Answer storage recap** (for reference — not changed by this task):

| Field type | `value_boolean` | `value_option` (FK) | `value_number` |
|------------|----------------|---------------------|----------------|
| Checkbox | `true` / `false` | `null` | `null` |
| Option select | `null` | selected option PK | `null` |
| Inventory | `null` | selected option PK | quantity (≥ 1) |
| Time slot select | `null` | selected option PK | `null` |

### API

No changes. The existing `GET /api/projects/{slug}/registrations/` response already includes `field_answers` per registration row:

```json
{
  "id": 42,
  "user_first_name": "Jane",
  "user_last_name": "Doe",
  "registered_at": "2026-05-20T14:30:00Z",
  "cancelled_at": null,
  "field_answers": [
    { "field": 12, "value_boolean": true, "value_option": null, "value_number": null },
    { "field": 13, "value_boolean": null, "value_option": 44, "value_number": null },
    { "field": 14, "value_boolean": null, "value_option": 51, "value_number": 3 },
    { "field": 15, "value_boolean": null, "value_option": 60, "value_number": null }
  ]
}
```

Field definitions (including `label`, `field_type`, `options[].title`, `options[].start_time`, `options[].end_time`) are available from the project detail response: `project.event_registration_config.fields`.

### Frontend

#### Answer Value Resolution Helper

**New file**: `frontend/src/utils/resolveRegistrationFieldAnswer.ts`

Extract the answer-to-string resolution logic into a reusable helper. This is used by both the export columns and the existing `ViewRegistrationAnswersModal` (which can optionally be refactored to use it, but that is not required).

```ts
/**
 * Resolves a single RegistrationFieldAnswer to a human-readable string
 * for export/display purposes.
 *
 * @param field - The RegistrationField definition (includes options)
 * @param answer - The RegistrationFieldAnswer from the API (or undefined if no answer)
 * @param locale - Current locale string (e.g. "en", "de") for time formatting
 * @returns Object with one or two key-value pairs for the export column(s)
 */
function resolveAnswerToStrings(
  field: RegistrationField,
  answer: RegistrationFieldAnswer | undefined,
  locale: string
): { columnSuffix: string; value: string }[]
```

Resolution rules per field type:

| `field_type` | Return | Logic |
|--------------|--------|-------|
| `checkbox` | `[{ columnSuffix: "", value: "TRUE"/"FALSE"/"" }]` | `answer.value_boolean === true` → `"TRUE"`, `false` → `"FALSE"`, absent → `""` |
| `option_select` | `[{ columnSuffix: "", value: "<option title>"/"" }]` | Look up `answer.value_option` in `field.options`, return `option.title`; absent → `""` |
| `inventory` | `[{ columnSuffix: "-item", value: "<option title>"/"" }, { columnSuffix: "-amount", value: "<number>"/"" }]` | Look up `answer.value_option` in `field.options`, return `option.title`; `answer.value_number` → string; absent → `""` |
| `time_slot_select` | `[{ columnSuffix: "", value: "<localized time range>"/"" }]` | Look up `answer.value_option` in `field.options`, format `option.start_time`/`option.end_time` using the same `formatTimeRange()` helper as `RegistrationTimeSlotField.tsx` (localized `Intl.DateTimeFormat`); absent → `""` |

#### Dynamic Column Generation in `ProjectRegistrationsContent.tsx`

Add hidden custom field columns to the `columns` array when:
- `isCustomFieldsEnabled` is true (already checked in this component), AND
- `eventRegistration?.fields` has one or more entries.

These columns follow the same pattern as `registered_at_iso` and `cancelled_at_iso`: defined in `columns` but hidden from the grid view, included only in `csvFields` for export.

**Column generation logic** (pseudocode):

```
for each field in eventRegistration.fields (sorted by order):
  for each { columnSuffix, value } from resolveAnswerToStrings(field, answer, locale):
    add to columns array:
      field: `custom_field_${field.id}${columnSuffix}`
      headerName: `${field.label}${columnSuffix}`
      width: 0
      sortable: false
      filterable: false
      disableColumnMenu: true
      valueGetter: (params) => resolveAnswerToStrings(field, getAnswerForField(params.row, field.id), locale)[index].value
```

Add the generated field names to `columnVisibilityModel: { ... false }` to hide them from the grid.

#### CSV Field Allowlist Update

Update `csvFields` (line 623) to include all dynamically generated custom field column field names:

```ts
csvFields: [
  "user_first_name",
  "user_last_name",
  "registered_at_iso",
  "cancelled_at",
  "cancelled_at_iso",
  ...customFieldColumnNames,  // e.g. ["custom_field_12", "custom_field_13", "custom_field_14-item", "custom_field_14-amount", "custom_field_15"]
],
```

#### Print Field Allowlist Update

Update `printFields` (line 630) to include custom field columns:

```ts
printFields: [
  "user_first_name",
  "user_last_name",
  ...customFieldColumnNames,
],
```

#### Text Keys

Add to `public/texts/project_texts.tsx`:

| Key | EN | DE |
|-----|----|----|
| `registration_answer_true` | `TRUE` | `TRUE` |
| `registration_answer_false` | `FALSE` | `FALSE` |
| `registration_answer_no_selection` | *(already exists)* | *(already exists)* |

No other text keys needed — column headers come from the organiser-defined `field.label`.

---

## Files to Change

### Backend

None.

### Frontend

| File | Change |
|------|--------|
| `src/utils/resolveRegistrationFieldAnswer.ts` *(new)* | Answer-to-string resolution helper for all 4 field types |
| `src/components/project/ProjectRegistrationsContent.tsx` | Add hidden custom field columns to `columns` array; update `csvFields` and `printFields` allowlists with dynamic custom field column names; add custom field column names to `columnVisibilityModel: false` |
| `public/texts/project_texts.tsx` | Add `registration_answer_true` / `registration_answer_false` text keys |

**Optional refactor** (not required for this task):
| File | Change |
|------|--------|
| `src/components/project/ViewRegistrationAnswersModal.tsx` | Refactor to use `resolveRegistrationFieldAnswer` helper instead of inline resolution logic |

---

## Test Cases

### Frontend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | Export CSV for event with no custom fields | CSV contains only standard columns (first name, last name, registration date, status, cancellation date) — identical to current behaviour |
| 2 | Export CSV for event with 1 checkbox field | CSV includes one column with header = field label; values are `TRUE`, `FALSE`, or empty |
| 3 | Export CSV for event with 1 option-select field | CSV includes one column with header = field label; values are option titles or empty |
| 4 | Export CSV for event with 1 inventory field | CSV includes two columns: `{label}-item` (option titles) and `{label}-amount` (quantities) |
| 5 | Export CSV for event with 1 time-slot-select field | CSV includes one column with header = field label; values are localized time range strings (identical to the format shown in the registration form dropdown) |
| 6 | Export CSV for event with mixed field types | CSV includes columns in field order; inventory expands to two columns in place |
| 7 | Export CSV where some registrants have no answer for a field | Empty cells for missing answers; other columns unaffected |
| 8 | Export CSV where a registrant has no answers at all (registered before fields were added) | All custom field columns are empty for that row |
| 9 | Custom field columns do not appear in the visible DataGrid | Columns are hidden (`width: 0`, `columnVisibilityModel: false`); grid appearance unchanged from current behaviour |
| 10 | Print export includes custom field columns | Printed table includes the same custom field columns as the CSV |
| 11 | `REGISTRATION_CUSTOM_FIELDS` toggle disabled | No custom field columns in grid, CSV, or print |
| 12 | Custom field column headers use organiser-defined labels | Header matches `field.label` exactly (e.g. "Meal pref" not "Custom field 1") |
| 13 | Inventory columns use `{label}-item` and `{label}-amount` suffixes | Matches issue #1962 specification exactly |
| 14 | Time slot value format matches registration form | Localized string from `formatTimeRange()` — identical to what the guest sees in the registration form dropdown |

---

## Dependency Notes

- **Depends on** [#1960](https://github.com/climateconnect/climateconnect/issues/1960): answer storage must exist before answers can be exported.
- **Depends on** [#1997](https://github.com/climateconnect/climateconnect/issues/1997): field labels must be available for column headers.
- **Depends on** [#2004](https://github.com/climateconnect/climateconnect/issues/2004): inventory answer storage (value_option + value_number).
- **Depends on** [#2007](https://github.com/climateconnect/climateconnect/issues/2007): time slot answer storage.
- **Blocked by**: all Phase 4 field-type stories must have answer storage merged before this task is complete, since the export must handle all field types.
- **Unblocks**: nothing directly — this is a standalone organiser UX improvement.

---

## Acceptance Criteria

- [ ] CSV export for an event with custom registration fields includes one column per field (two for inventory), in field order.
- [ ] Column headers use the organiser-defined `field.label`.
- [ ] Checkbox field values export as `TRUE` or `FALSE`.
- [ ] Option-select field values export as the selected option's `title`.
- [ ] Inventory field exports as two columns: `{label}-item` (option title) and `{label}-amount` (quantity).
- [ ] Time-slot-select field values export as a localized time range string, identical to the format shown in the registration form.
- [ ] Missing answers produce empty cells.
- [ ] Events without custom fields export identically to current behaviour.
- [ ] Print export includes the same custom field columns.
- [ ] Custom field columns are added as hidden columns in the DataGrid (`width: 0`, `columnVisibilityModel: false`) and their field names are included in the `csvFields` and `printFields` allowlists.
- [ ] All custom field UI is gated behind `REGISTRATION_CUSTOM_FIELDS` feature toggle.
- [ ] `csvFields` and `printFields` allowlists are dynamically updated with custom field column names.
- [ ] No backend changes required.
- [ ] All tests pass.

---

## Log

- 2026-05-27 08:30 — Task created from GitHub issue [#1962](https://github.com/climateconnect/climateconnect/issues/1962). Frontend-only change extending the existing MUI DataGrid CSV/print export with dynamically generated hidden custom field columns. Answer value resolution is extracted into a shared helper. No backend changes needed — all data is already available from the existing API responses. Corrected: custom field columns are hidden in the grid (same pattern as ISO timestamp columns) and included via `csvFields`/`printFields` allowlists for export only.

# Display Custom Field Answers in Organiser Registration Views (Phase 4a — Organiser Display)

**Status**: DRAFT
**Type**: Feature
**Date and time created**: 2026-05-20 07:50
**GitHub Issue**: [#1963](https://github.com/climateconnect/climateconnect/issues/1963)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260512_1015_register_for_event_with_extra_fields.md`](./20260512_1015_register_for_event_with_extra_fields.md) ← introduces `RegistrationFieldAnswer` storage and answer capture on registration
- [`20260416_1000_event_registration_custom_fields.md`](./20260416_1000_event_registration_custom_fields.md) ← organiser-side field definitions
- [`20260512_0725_edit_event_registration_custom_fields.md`](./20260512_0725_edit_event_registration_custom_fields.md) ← edit-side follow-up
- [`20260401_1000_organizer_see_registration_status.md`](./20260401_1000_organizer_see_registration_status.md) ← original organiser list view spec
- [`doc/mosy/architecture_overview.md`](../mosy/architecture_overview.md)
- [`doc/mosy/entities/system-entities.md`](../mosy/entities/system-entities.md)

**Unblocks**:
- Phase 4b (Inventory field type) — organiser view needs to display inventory answers
- Phase 5 (templates, check-in) — organiser visibility into registration data

---

## Problem Statement

The organiser-side custom-field builder already lets event organisers define up to 5 custom registration fields on an event (checkbox and single-select option fields). The registrant-side flow already captures and stores answers in `RegistrationFieldAnswer`. However, the organiser's registration list view (`ProjectRegistrationsContent`) does not display those answers. Organisers cannot see what registrants submitted — they only see name, registration date, and status.

This task completes the organiser-side display loop for Phase 4a: when viewing the guest list for an event with custom fields, organisers can see each registrant's answers inline in the DataGrid.

The key requirements from issue [#1963](https://github.com/climateconnect/climateconnect/issues/1963) are:

- The organiser's registration list view shows custom field answers for each registrant.
- Answers are displayed in a way that is scannable — organisers can quickly see who submitted what.
- The CSV export includes custom field answers so organisers can work with the data offline.
- Cancelled registrations still show their answers (historical record).
- Phase 4a field types are:
  - **Checkbox** — display the field title/description and the boolean answer (checked/unchecked).
  - **Single select option** — display the field title and the selected option title.

**Explicitly Out of Scope (this task):**

- Editing submitted answers (covered by [#1961](https://github.com/climateconnect/climateconnect/issues/1961)).
- New field types beyond checkbox and single-select option.
- Inventory / capacity field type display (Phase 4b — forward-compatible schema but not rendered here).
- Registration form templates.
- Any changes to the registration capture flow — answers are already stored by [#1960](https://github.com/climateconnect/climateconnect/issues/1960).

### Non-Functional Requirements

- **Backward-compatible API**: `GET /api/projects/{slug}/registrations/` must remain valid for events without custom fields. Existing clients that do not expect answers must not break.
- **Query performance**: the organiser list view already returns ALL registrations. Adding answers must not introduce N+1 queries. Use `prefetch_related` to load answers and their related options in a single query.
- **Feature toggle**: all organiser-side custom field display UI must be gated behind `REGISTRATION_CUSTOM_FIELDS`, in addition to the existing `EVENT_REGISTRATION` flow.
- **CSV export parity**: custom field answers must be included in the CSV export with one column per field, using the field title (or a truncated version) as the column header.
- **No unsanitized HTML rendering**: checkbox descriptions were sanitized on organiser write; the organiser-side answer display must render them safely.

### AI Agent Insights and Additions

- **Extend the existing GET endpoint**: `EventRegistrationsView.get()` already returns all registrations. The `EventRegistrationSerializer` should be extended to include a `field_answers` array. No new endpoint needed.
- **Use `prefetch_related` for answers**: the queryset in `EventRegistrationsView.get()` should prefetch `field_answers` and `field_answers__value_option` to avoid N+1 queries. The queryset should also prefetch `registration_config__fields` and `registration_config__fields__options` so the serializer can resolve field titles without additional queries.
- **Answer response shape**: each answer should include the field ID, field type, field title (from settings or option title), and the resolved answer value. This lets the frontend render answers without needing a separate field-definition lookup.
- **DataGrid expandable rows**: the MUI X DataGrid in `ProjectRegistrationsContent` should use expandable rows (or a detail panel) to show custom field answers without cluttering the main column layout. The default view remains name + date + status; answers appear on expand.
- **CSV export**: the `csvFields` array in `RegistrationsToolbar` should be extended dynamically when custom fields exist. Each field becomes a column in the export.

---

## System Impact

- **Actors involved**:
  - `Organiser / Team Admin` — views the guest list and sees custom field answers for each registrant.
  - `System` — resolves answer values and field metadata in the API response.

- **Entities added**: none — `RegistrationFieldAnswer` already exists.

- **Entities changed**:
  - `EventRegistrationSerializer` — gains `field_answers` in the response.
  - `EventRegistrationsView.get()` — queryset gains `prefetch_related` for answers and field definitions.
  - `ProjectRegistrationsContent` — DataGrid gains expandable answer display; CSV export gains answer columns.

- **Flows added**:
  - **View registration answers** — organiser opens guest list → sees answers in expandable rows → exports answers in CSV.

- **Flows changed**:
  - **Organiser sees status of registrations** — extended to include custom field answers in the response and UI.

- **Integration changes**:
  - No new external integrations.
  - Existing `REGISTRATION_CUSTOM_FIELDS` toggle now gates both organiser definition UI and organiser answer display UI.

- **Migrations required**: none.

---

## Software Architecture

### API

**Existing endpoint extended**:

```
GET /api/projects/{slug}/registrations/
```

Response per registration gains `field_answers`:

```json
{
  "id": 42,
  "user_first_name": "Jane",
  "user_last_name": "Doe",
  "user_url_slug": "jane-doe",
  "user_thumbnail_image": "https://...",
  "registered_at": "2026-05-15T10:30:00Z",
  "cancelled_at": null,
  "field_answers": [
    {
      "field_id": 12,
      "field_type": "checkbox",
      "field_label": "I agree to the Code of Conduct",
      "value_boolean": true,
      "value_option_title": null
    },
    {
      "field_id": 13,
      "field_type": "option_select",
      "field_label": "Meal preference",
      "value_boolean": null,
      "value_option_title": "Vegetarian"
    }
  ]
}
```

Contract:

- `field_answers` is always present (empty array `[]` for events with no custom fields or registrations with no answers).
- Answers are ordered by `field.order` (the organiser-defined field order).
- `field_label` is the human-readable label: for checkbox, the `settings.title` if present, otherwise a truncated version of `settings.description` (strip HTML, max 50 chars). For option_select, `settings.title`.
- `value_option_title` is the title of the selected option (for option_select answers), or `null` for checkbox answers.
- For cancelled registrations, answers are still returned (historical record).

**Queryset optimisation**:

```python
registrations = (
    EventRegistration.objects
    .select_related("user__user_profile")
    .prefetch_related(
        "field_answers",
        "field_answers__field",
        "field_answers__value_option",
    )
    .filter(registration_config=rc)
    .order_by("registered_at")
)
```

This resolves all answer data in 3 queries total (registrations, answers+fields, options) regardless of registration count.

### Backend

#### Serializer Layer

- **`organization/serializers/event_registration.py`** — extend `EventRegistrationSerializer`:
  - Add `field_answers` as a `SerializerMethodField`.
  - Implement `get_field_answers()` that:
    - Iterates over `obj.field_answers.all()` (already prefetched).
    - For each answer, resolves the field label and option title.
    - Returns a list of answer dicts ordered by `answer.field.order`.
  - For checkbox fields: `field_label` = `field.settings.get("title", "")` or stripped HTML description (max 50 chars).
  - For option_select fields: `field_label` = `field.settings.get("title", "")`.

#### View Layer

- **`organization/views/event_registration_views.py`** — extend `EventRegistrationsView.get()`:
  - Add `prefetch_related` for `field_answers`, `field_answers__field`, `field_answers__value_option` to the existing queryset.
  - No other changes needed — the serializer handles the rest.

### Frontend

#### DataGrid Display

- **`frontend/src/components/project/ProjectRegistrationsContent.tsx`**:
  - Extend the `EventRegistration` TypeScript type to include `field_answers`.
  - When `eventRegistration.fields` (from the project detail response) contains custom fields, render an expandable detail panel for each row.
  - Use MUI DataGrid's `getRowDetails` or a custom expandable row pattern.
  - The detail panel shows each field label and its answer:
    - Checkbox: render a checkmark icon (green for `true`, grey dash for `false`) + the field label.
    - Option select: render the selected option title.
  - For cancelled rows, the detail panel is still available but rendered with reduced opacity (consistent with the existing cancelled row styling).
  - If a registration has no answers (e.g. registered before custom fields were added), the detail panel shows "No custom field answers submitted."

#### CSV Export

- **`RegistrationsToolbar`** — extend `csvFields` dynamically:
  - When custom fields exist, append one column per field to the `csvFields` array.
  - Column field name: `answer_field_{field_id}`.
  - Column header: the field's `field_label` (truncated to 30 chars if needed).
  - Value: for checkbox, "Yes" / "No"; for option_select, the selected option title; empty string if no answer.
  - The `csvOptions.fileName` already includes the project slug and date — no change needed.

#### Frontend Data Types

Extend the existing `EventRegistration` type:

```ts
type RegistrationFieldAnswer = {
  field_id: number;
  field_type: "checkbox" | "option_select";
  field_label: string;
  value_boolean: boolean | null;
  value_option_title: string | null;
};

type EventRegistration = {
  id: number;
  user_first_name: string;
  user_last_name: string;
  user_url_slug: string;
  user_thumbnail_image: string | null;
  registered_at: string;
  cancelled_at: string | null;
  field_answers: RegistrationFieldAnswer[];
};
```

### Files to Change

#### Backend

| File | Change |
|------|--------|
| `organization/serializers/event_registration.py` | Extend `EventRegistrationSerializer` with `field_answers` SerializerMethodField |
| `organization/views/event_registration_views.py` | Add `prefetch_related` for answers and field definitions to the GET queryset |
| `organization/tests/test_event_registration.py` | Add tests for answer inclusion in GET response, N+1 query verification, cancelled registration answers |

#### Frontend

| File | Change |
|------|--------|
| `src/components/project/ProjectRegistrationsContent.tsx` | Add expandable detail panel for custom field answers; extend CSV export with answer columns |
| `src/types.ts` | Add `RegistrationFieldAnswer` and extend `EventRegistration` type |
| `public/texts/project_texts.tsx` | Add text keys for answer display labels (EN + DE) |

---

## Test Cases

### Backend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | GET registrations for event with custom fields and answers | Each registration includes `field_answers` array with correct values |
| 2 | GET registrations for event with no custom fields | `field_answers` is `[]` for all registrations |
| 3 | GET registrations where some registrants have no answers (registered before fields were added) | Those registrations have `field_answers: []` |
| 4 | GET registrations including cancelled ones | Cancelled registrations still include their stored answers |
| 5 | GET registrations — verify query count | No N+1 queries; answers resolved in constant number of queries regardless of registration count |
| 6 | GET registrations — answer ordering | Answers within each registration are ordered by `field.order` |
| 7 | GET registrations — option_select answer | `value_option_title` contains the selected option's title |
| 8 | GET registrations — checkbox answer | `value_boolean` is `true` or `false`; `value_option_title` is `null` |
| 9 | Unauthenticated request to GET registrations | `401 Unauthorized` |
| 10 | Non-organiser requests GET registrations | `403 Forbidden` |

### Frontend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | Organiser opens guest list for event with custom fields | DataGrid shows expandable rows; expanding reveals field answers |
| 2 | Event has no custom fields | DataGrid behaves as before — no expand button shown |
| 3 | Registration has no answers (registered before fields added) | Expandable panel shows "No custom field answers submitted" |
| 4 | Cancelled registration | Answers still visible in expandable panel with reduced opacity |
| 5 | CSV export for event with custom fields | Export includes one column per custom field with answer values |
| 6 | CSV export for event without custom fields | Export behaves as before — no answer columns |
| 7 | Feature toggle disabled | Answer display UI not rendered; existing guest list preserved |
| 8 | Many custom fields (5) with long labels | Expandable panel scrolls; layout remains usable |

---

## Dependency Notes

- **Depends on** [#1960](https://github.com/climateconnect/climateconnect/issues/1960): `RegistrationFieldAnswer` model and answer capture on registration must already exist.
- **Depends on** [#1880](https://github.com/climateconnect/climateconnect/issues/1880): organiser-side field definitions must exist so field labels can be resolved.
- **Does not depend on** [#1961](https://github.com/climateconnect/climateconnect/issues/1961) (edit answers) — this task is read-only display.
- **Does not depend on** [#1962](https://github.com/climateconnect/climateconnect/issues/1962) (export) — CSV export is included in this task as a natural extension of the display requirement.
- **Enables** Phase 4b (Inventory field type) — the answer display pattern established here extends to inventory answers (option + quantity).

---

## Acceptance Criteria

- [ ] The organiser's registration list view includes custom field answers for each registrant.
- [ ] Answers are displayed in an expandable detail panel without cluttering the main DataGrid columns.
- [ ] Checkbox answers show a clear checked/unchecked indicator.
- [ ] Option-select answers show the selected option title.
- [ ] Answers are ordered by the organiser-defined field order.
- [ ] Cancelled registrations still show their answers (historical record).
- [ ] Registrations with no answers (e.g. registered before fields were added) show an appropriate empty state.
- [ ] The CSV export includes one column per custom field with answer values.
- [ ] No N+1 queries introduced — answer data resolved in constant number of queries.
- [ ] `GET /api/projects/{slug}/registrations/` remains backward-compatible for events without custom fields.
- [ ] All organiser-side custom field display UI is gated behind `REGISTRATION_CUSTOM_FIELDS`.
- [ ] All tests pass.

---

## Log

- 2026-05-20 07:50 — Task created from GitHub issue [#1963](https://github.com/climateconnect/climateconnect/issues/1963). Organiser-side display of custom field answers in the registration list view. Extends existing `EventRegistrationSerializer` and `ProjectRegistrationsContent` DataGrid. No new models or endpoints — purely a read/display task that closes the loop on the Phase 4a custom fields feature.

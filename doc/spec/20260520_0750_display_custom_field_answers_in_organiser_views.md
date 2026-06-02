# Display Custom Field Answers in Organiser Registration Views (Phase 4a — Organiser Display)

**Status**: COMPLETED
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
- **No unsanitized HTML rendering**: checkbox descriptions were sanitized on organiser write; the organiser-side answer display must render them safely.

### AI Agent Insights and Additions

- **Extend the existing GET endpoint**: `EventRegistrationsView.get()` already returns all registrations. The `EventRegistrationSerializer` should be extended to include a `field_answers` array. No new endpoint needed.
- **Use `prefetch_related` for answers**: the queryset in `EventRegistrationsView.get()` should prefetch `field_answers` and `field_answers__value_option` to avoid N+1 queries.
- **Lean answer response shape**: the frontend already has field definitions (titles, types, order, options) from `eventRegistration.fields` in the project detail response. The API only returns answer values keyed by field ID — no redundant labels. The frontend does a client-side join to resolve field labels and option titles.
- **Modal view, not expandable rows**: clicking a "View" icon in the actions column opens a modal that renders the answers in the same visual style as the registration form — checkbox description with a checked/unchecked indicator (not an interactive checkbox), option-select title with the selected option shown as read-only text. This keeps the DataGrid clean and gives organisers a focused view of each guest's submission.
- **Hide the View icon when no answers**: if a registration has no custom field answers (e.g. registered before fields were added), the View icon is not shown for that row.

---

## System Impact

- **Actors involved**:
  - `Organiser / Team Admin` — views the guest list and sees custom field answers for each registrant.
  - `System` — resolves answer values in the API response.

- **Entities added**: none — `RegistrationFieldAnswer` already exists.

- **Entities changed**:
  - `EventRegistrationSerializer` — gains `field_answers` in the response.
  - `EventRegistrationsView.get()` — queryset gains `prefetch_related` for answers and related option.
  - `ProjectRegistrationsContent` — DataGrid gains expandable answer display.

- **Flows added**:
  - **View registration answers** — organiser opens guest list → sees answers in expandable rows.

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

Response per registration gains `field_answers` — a lean array keyed by field ID only. The frontend already has field definitions (titles, types, order, options) from `eventRegistration.fields` in the project detail response, so the API does not repeat them.

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
    { "field": 12, "value_boolean": true, "value_option": null },
    { "field": 13, "value_boolean": null, "value_option": 44 }
  ]
}
```

Contract:

- `field_answers` is always present (empty array `[]` for events with no custom fields or registrations with no answers).
- Each answer contains `field` (the `RegistrationField` PK), `value_boolean` (nullable), and `value_option` (nullable `RegistrationFieldOption` PK).
- The frontend resolves field labels and option titles client-side from `eventRegistration.fields`.
- For cancelled registrations, answers are still returned (historical record).

**Queryset optimisation**:

```python
registrations = (
    EventRegistration.objects
    .select_related("user__user_profile")
    .prefetch_related(
        "field_answers",
        "field_answers__value_option",
    )
    .filter(registration_config=rc)
    .order_by("registered_at")
)
```

This resolves all answer data in 2 queries total (registrations + answers) regardless of registration count.

### Backend

#### Serializer Layer

- **`organization/serializers/event_registration.py`** — extend `EventRegistrationSerializer`:
  - Add `field_answers` as a `SerializerMethodField`.
  - Implement `get_field_answers()` that:
    - Iterates over `obj.field_answers.all()` (already prefetched).
    - Returns a list of answer dicts: `{ "field": <id>, "value_boolean": <bool|null>, "value_option": <id|null> }`.
    - Ordered by `answer.field.order`.

#### View Layer

- **`organization/views/event_registration_views.py`** — extend `EventRegistrationsView.get()`:
  - Add `prefetch_related("field_answers", "field_answers__value_option")` to the existing queryset.
  - No other changes needed — the serializer handles the rest.

### Frontend

#### DataGrid Display

- **`frontend/src/components/project/ProjectRegistrationsContent.tsx`**:
  - Extend the `EventRegistration` TypeScript type to include `field_answers`.
  - Add a "View" icon button to the actions column (alongside the existing three-dot menu for active registrations).
  - The View icon is **only shown** when `field_answers.length > 0` — registrations with no answers have no View button.
  - Clicking the View icon opens a modal (`ViewRegistrationAnswersModal`) that renders the answers in the same visual style as the registration form:
    - The modal receives both `field_answers` (from the registration row) and `eventRegistration.fields` (from the project detail response).
    - For each field in `eventRegistration.fields`, look up the matching answer by `field.id`.
    - **Checkbox**: render the full `field.settings.description` (sanitized HTML) with a checked indicator (green checkmark icon) or unchecked indicator (grey dash). The checkbox is **not interactive** — it's a read-only display.
    - **Option select**: render the `field.settings.title` and the selected option title by looking up `value_option` in `field.options`.
  - Fields are rendered in `field.order` sequence, matching the registration form order.
  - For cancelled rows, the modal still opens and shows answers (historical record), but the modal header indicates the registration was cancelled.

#### Frontend Data Types

Extend the existing `EventRegistration` type:

```ts
type RegistrationFieldAnswer = {
  field: number;
  value_boolean: boolean | null;
  value_option: number | null;
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
| `organization/views/event_registration_views.py` | Add `prefetch_related` for answers and option to the GET queryset |
| `organization/tests/test_event_registration.py` | Add tests for answer inclusion in GET response, N+1 query verification, cancelled registration answers |

#### Frontend

| File | Change |
|------|--------|
| `src/components/project/ProjectRegistrationsContent.tsx` | Add View icon button to actions column; open modal on click |
| `src/components/project/ViewRegistrationAnswersModal.tsx` | **New** — modal component that renders answers in registration-form style (read-only) |
| `src/types.ts` | Add `RegistrationFieldAnswer` and extend `EventRegistration` type |
| `public/texts/project_texts.tsx` | Add text keys for modal labels (EN + DE) |

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
| 7 | GET registrations — option_select answer | `value_option` contains the selected option's PK |
| 8 | GET registrations — checkbox answer | `value_boolean` is `true` or `false`; `value_option` is `null` |
| 9 | Unauthenticated request to GET registrations | `401 Unauthorized` |
| 10 | Non-organiser requests GET registrations | `403 Forbidden` |

### Frontend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | Organiser opens guest list for event with custom fields | DataGrid shows View icon for rows with answers |
| 2 | Event has no custom fields | No View icon shown in any row |
| 3 | Registration has no answers (registered before fields added) | No View icon shown for that row |
| 4 | Click View icon on active registration | Modal opens showing answers in registration-form style |
| 5 | Click View icon on cancelled registration | Modal opens showing answers with cancelled indicator |
| 6 | Checkbox answer in modal | Full description shown with checkmark/dash indicator (not interactive) |
| 7 | Option-select answer in modal | Field title and selected option shown as read-only text |
| 8 | Feature toggle disabled | View icon not rendered; existing guest list preserved |
| 9 | Many custom fields (5) with long descriptions | Modal scrolls; layout remains usable |
| 10 | Frontend joins answers to field definitions | Checkbox shows checkmark/dash; option-select shows option title |

---

## Dependency Notes

- **Depends on** [#1960](https://github.com/climateconnect/climateconnect/issues/1960): `RegistrationFieldAnswer` model and answer capture on registration must already exist.
- **Depends on** [#1880](https://github.com/climateconnect/climateconnect/issues/1880): organiser-side field definitions must exist so field labels can be resolved.
- **Does not depend on** [#1961](https://github.com/climateconnect/climateconnect/issues/1961) (edit answers) — this task is read-only display.
- **Does not depend on** [#1962](https://github.com/climateconnect/climateconnect/issues/1962) (export) — CSV export is included in this task as a natural extension of the display requirement.
- **Enables** Phase 4b (Inventory field type) — the answer display pattern established here extends to inventory answers (option + quantity).

---

## Acceptance Criteria

- [ ] The organiser's registration list view includes a View icon for each registrant with custom field answers.
- [ ] The View icon is only shown when the registration has at least one answer.
- [ ] Clicking the View icon opens a modal showing the answers.
- [ ] Answers are rendered in the same visual style as the registration form (read-only).
- [ ] Checkbox answers show the full description with a checked/unchecked indicator (not interactive).
- [ ] Option-select answers show the field title and selected option as read-only text.
- [ ] Fields are rendered in organiser-defined order.
- [ ] Cancelled registrations still show their answers in the modal (historical record).
- [ ] No N+1 queries introduced — answer data resolved in constant number of queries.
- [ ] `GET /api/projects/{slug}/registrations/` remains backward-compatible for events without custom fields.
- [ ] All organiser-side custom field display UI is gated behind `REGISTRATION_CUSTOM_FIELDS`.
- [ ] All tests pass.

---

## Log

- 2026-05-20 07:50 — Task created from GitHub issue [#1963](https://github.com/climateconnect/climateconnect/issues/1963). Organiser-side display of custom field answers in the registration list view. Extends existing `EventRegistrationSerializer` and `ProjectRegistrationsContent` DataGrid. No new models or endpoints — purely a read/display task that closes the loop on the Phase 4a custom fields feature.

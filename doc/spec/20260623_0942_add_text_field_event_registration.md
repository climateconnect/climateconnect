# Add a Text Field as Custom Field Type for Event Registration

**Date**: 2026-06-23
**Status**: DRAFT
**Type**: Backend + Frontend — new feature
**GitHub Issue**: [#2083](https://github.com/climateconnect/climateconnect/issues/2083)

---

## Problem Statement

Event organisers who enable registration on their project can currently collect only **structured** answers from guests: checkboxes, option selections, inventory counts, and time-slot picks. This covers "yes/no" and "pick one" interactions, but a large class of useful pre-event information is **free-form** — dietary requirements, accessibility needs, topics the guest wants to discuss, project ideas, "how did you hear about us?", questions for the speaker.

Without a text input, organisers either:

- Stuff unstructured info into a checkbox (lossy, ugly, can't capture a sentence).
- Move the conversation to email (loses the single-source-of-truth guest list, breaks CSV export, breaks the confirmation email answer recap).
- Skip the question entirely (event runs blind).

Adding a **text custom field type** closes this gap. It is the most-requested extension of the current four-type field system and is the natural next type in the same registry pattern.

### Why it matters

- **Common real-world need**: Most real event registrations need at least one open-ended question (e.g. "dietary requirements", "what do you hope to learn?"). The current system forces awkward workarounds.
- **Single source of truth**: Keeping the answer in the registration flow keeps the guest list complete and CSV-complete — no follow-up emails to chase.
- **Parity with existing types**: Email recap, organiser display, and CSV export should work out-of-the-box, matching the experience of the other four field types.

### Current state

- Four field types exist: `checkbox`, `option_select`, `inventory`, `time_slot_select`.
- Each type has its own `*SettingsSerializer` registered in `FIELD_TYPE_SETTINGS_VALIDATORS`.
- `RegistrationFieldAnswer` stores per-type values in dedicated columns (`value_boolean`, `value_option`, `value_number`). There is no `value_text`.
- The answer-lock logic in `EditEventRegistrationConfigSerializer` rejects changes to type-specific `settings.*` keys once registrants have answered.

---

## Scope

### In scope

1. **Backend foundation** — new `TEXT` enum value, migration for `value_text`, settings serializer, submission/sync/answer serializers updated, email renderers updated, answer-lock rules added.
2. **Admin config UI** — types update, new `TextFieldEditor`, integration into `RegistrationFieldList` / `RegistrationFieldEditor` / `validateRegistrationFields`, i18n keys.
3. **Public registration form** — new `RegistrationTextField` component, integration into `RegistrationFieldAnswersForm` (state, validation, answer assembly).
4. **Admin display & export** — text answer rendered in `ViewRegistrationAnswersModal` with line breaks, one DataGrid column per text field in `ProjectRegistrationsContent`, CSV export, confirmation email recap (backend-driven).

### Out of scope

- Rich text / formatting (we store plaintext with `\n` line breaks; no rich text).
- File uploads or images.
- Conditional logic (show text field only if another field has value X).
- Character limits other than the 300-char global cap.
- Removing or renaming any of the four existing field types.
- Changing the global 5-fields-per-event cap (`MAX_FIELDS = 5`).

---

## System Impact

### Actors Involved

- **Backend Developer** (Phase 1): Model + migration + serializers + email renderers + answer-lock + tests.
- **Frontend Developer** (Phases 2–4): Types + admin editor + public form component + organiser display + CSV/email verification.

### Entities Changed

| Layer | File | Change |
|-------|------|--------|
| Backend model | `backend/organization/models/registration_field.py` | Add `TEXT = "text", _("Text")` to `RegistrationFieldType` |
| Backend migration | `backend/organization/migrations/0139_*` (new) | Add nullable `value_text = TextField(null=True, blank=True)` to `RegistrationFieldAnswer` |
| Backend serializer | `backend/organization/serializers/registration_field.py` | Add `TextFieldSettingsSerializer`; register in `FIELD_TYPE_SETTINGS_VALIDATORS`; add publish-time validation in `RegistrationFieldSerializer.validate` |
| Backend serializer | `backend/organization/serializers/event_registration.py` | Add `value_text` to `RegistrationFieldAnswerInputSerializer`; add TEXT branch in `EventRegistrationSubmissionSerializer.validate`; update `sync_registration_answers` to persist `value_text`; add `value_text` to `EventRegistrationSerializer.get_field_answers`; add answer-lock branch for `settings.title` in `EditEventRegistrationConfigSerializer.validate` |
| Backend email util | `backend/organization/utility/email.py` | Add TEXT branches in `_build_field_answers_html` (uses `linebreaksbr`) and `_build_field_answers_text` (preserves `\n`) |
| Backend tests | `backend/organization/tests/test_event_registration*.py` | New test cases for text field lifecycle, validation, answer-lock, email renderers |
| Frontend types | `frontend/src/types.ts` | Add `"text"` to `RegistrationField.field_type` union; add `is_multiline` to `settings`; add `valueText` to `RegistrationFieldAnswerValue`; add `value_text` to `RegistrationFieldAnswer` |
| Frontend component (new) | `frontend/src/components/shareProject/TextFieldEditor.tsx` | Per-type admin editor (title, description, multi-line toggle) |
| Frontend component | `frontend/src/components/shareProject/RegistrationFieldList.tsx` | Add `"text"` to `FIELD_TYPE_LABEL_KEYS`; default factory in `handleAddField`; new `MenuItem` in "Add field" menu; `text` branch in `getFieldIcon` |
| Frontend component | `frontend/src/components/shareProject/RegistrationFieldEditor.tsx` | Add `field.field_type === "text"` branch |
| Frontend component (new) | `frontend/src/components/project/RegistrationTextField.tsx` | Per-type public form input (single-line or multi-line, 300-char cap, optional counter) |
| Frontend component | `frontend/src/components/project/RegistrationFieldAnswersForm.tsx` | Add `textValues` state; add TEXT branches in `validate` and answer assembly; render dispatch branch |
| Frontend component | `frontend/src/components/project/ViewRegistrationAnswersModal.tsx` | Add TEXT render branch with `whiteSpace: "pre-wrap"` for line breaks |
| Frontend component | `frontend/src/components/project/ProjectRegistrationsContent.tsx` | Build one DataGrid column per text field via `customFieldColumns`; route text to CSV export |
| Frontend util | `frontend/src/utils/resolveRegistrationFieldAnswer.ts` | Add TEXT branch returning `[answer.value_text ?? ""]` |
| Frontend util | `frontend/src/utils/eventRegistrationHelpers.ts` | Add text validation branch in `validateRegistrationFields` |
| Frontend i18n | `frontend/public/texts/project_texts.tsx` | Add English + German text keys (see AC-2.7) |
| Frontend tests | `frontend/src/components/**/*.test.tsx` | New tests per per-type editor / public-field pattern |

### Flows not affected

- Existing four field types — no change to their behaviour.
- Guest-list DataGrid columns for inventory/time_slot/checkbox/option_select — no change.
- Mailjet template variables — no template changes (text answer is rendered server-side into existing `FieldAnswersHtml` / `FieldAnswersText` variables).
- 5-fields-per-event cap remains hard-enforced; a text field counts toward it.

---

## Acceptance Criteria

### AC-1: Backend foundation

**AC-1.1** `RegistrationFieldType` enum gains `TEXT = "text", _("Text")`. Existing rows are unaffected.

**AC-1.2** A new migration adds `value_text = TextField(null=True, blank=True)` to `RegistrationFieldAnswer`. No other model changes.

**AC-1.3** `RegistrationFieldSerializer` accepts a text field with:
- top-level `is_required` (default `false`)
- top-level `label` (1–30 chars, unique per `EventRegistrationConfig`)
- `settings.title` (required, non-empty)
- `settings.description` (optional, plain text)
- `settings.is_multiline` (optional bool, default `false`)
- no `options` (rejected if present)

A text field with `is_required=True` and no `settings.title` is rejected at publish time with a clear 400 error.

**AC-1.4** `EventRegistrationSubmissionSerializer.validate` accepts a text answer payload of the shape `{field, value_text: "..."}` and enforces:
- the field exists, belongs to the registration's config, and has `field_type = "text"`
- if `field.is_required` is true and the value is missing or empty (after strip), reject
- if `len(value_text) > 300`, reject with a 400 error
- normalize CRLF/CR → LF on save

**AC-1.5** `sync_registration_answers` persists `value_text` for text fields and clears it for non-text fields. Updating a registration overwrites prior text answers.

**AC-1.6** `EventRegistrationSerializer.get_field_answers` returns `value_text` (string or `null`) alongside the existing `value_boolean` / `value_option` / `value_number`. The array remains ordered by `field.order`.

**AC-1.7** `EditEventRegistrationConfigSerializer` enforces **answer-lock** for text fields:
- `settings.title` is **immutable** once at least one `RegistrationFieldAnswer` exists for that field. Changing it returns a 400.
- `settings.description`, `settings.is_multiline`, `is_required`, and `label` are **mutable** (changing them does not reinterpret past answers).
- Field deletion is subject to the same "has answers" guard as other types (delegate to existing logic; verify text fields with answers cannot be deleted).

**AC-1.8** `_build_field_answers_html` and `_build_field_answers_text` in `backend/organization/utility/email.py` render a text answer as:
- HTML: the value with `\n` converted to `<br>` via Django's `linebreaksbr` template filter (already used in email rendering elsewhere); escaped on input.
- Plain text: the value as-is, with `\n` preserved.
- Empty/null answers (e.g. optional field not filled) render as a single em-dash `—` matching the existing convention.

The `.ics` DESCRIPTION builder (`generate_event_ics_attachment`) inherits the change automatically because it uses `_build_field_answers_text`.

**AC-1.9** Backend tests cover:
- create / update / sync of a text field via `RegistrationFieldSerializer`
- publish-time validation errors (missing title, with options, required + missing title)
- submission with required-text-empty (rejected), required-text-present (accepted), optional-text-empty (accepted, stored as `""` → `null`), > 300 chars (rejected)
- answer-lock: cannot change `settings.title` after answers exist; can change `settings.description` / `is_multiline` / `is_required` / `label`
- delete-blocked: cannot delete a text field that has answers
- email builders: text answer renders correctly in both HTML (with `<br>`) and plaintext (with `\n`)

### AC-2: Admin config UI

**AC-2.1** `RegistrationField.field_type` union in `frontend/src/types.ts` includes `"text"`. `RegistrationField.settings` type is widened to include `title?: string` and `is_multiline?: boolean`. `RegistrationFieldAnswerValue` includes `valueText?: string`. `RegistrationFieldAnswer` includes `value_text: string | null`.

**AC-2.2** A new `TextFieldEditor.tsx` component lives in `frontend/src/components/shareProject/`. It is structurally a sibling of `CheckboxFieldEditor.tsx` / `OptionSelectFieldEditor.tsx`. It renders, bound to the field's `settings`:
- `<TextField>` for `settings.title` (required, e.g. "Title (shown to guest)")
- `<TextField multiline>` for `settings.description` (optional, e.g. "Description (optional helper text)")
- `<Switch>` for `settings.is_multiline` (label e.g. "Multi-line input")
- Top-level `is_required` and `label` are edited via the shared controls outside this component, as for the other types.

If `settings.title` is empty, show an inline error and signal the field's invalid state in `validateRegistrationFields`.

**AC-2.3** `RegistrationFieldList.tsx`:
- adds `"text"` to `FIELD_TYPE_LABEL_KEYS`
- adds a default `handleAddField("text")` factory that creates `{field_type: "text", is_required: false, label: "", settings: {title: "", description: "", is_multiline: false}, options: []}` with a unique `label` (auto-suggest "Question 1" pattern, falling back to "text-N" only on collision; mirror the existing convention)
- adds a new `MenuItem` "Text" to the "Add field" menu
- adds a `text` branch in `getFieldIcon`

**AC-2.4** `RegistrationFieldEditor.tsx` dispatches the new `TextFieldEditor` for `field.field_type === "text"`.

**AC-2.5** `validateRegistrationFields` in `frontend/src/utils/eventRegistrationHelpers.ts` adds a `field.field_type === "text"` branch: returns an error if `settings.title` is empty. `is_required` and `label` continue to be validated by the shared pre-checks.

**AC-2.6** `formatProjectForRequest` in `ShareProjectRoot.tsx` does not send spurious empty `options: []` for text fields (verify; if it does, gate the strip on `field.options?.length > 0`).

**AC-2.7** `frontend/public/texts/project_texts.tsx` adds the following i18n keys (English + German):

| Key | English | German |
|-----|---------|--------|
| `field_type_text` | Text | Textfeld |
| `registration_text_field_title_label` | Title (shown to guest) | Titel (wird dem Gast angezeigt) |
| `registration_text_field_description_label` | Description (optional) | Beschreibung (optional) |
| `registration_text_field_multiline_label` | Multi-line input | Mehrzeilige Eingabe |
| `registration_text_field_placeholder` | Your answer… | Deine Antwort… |
| `registration_text_field_required_error` | Please answer this question. | Bitte beantworte diese Frage. |
| `registration_text_field_max_length_error` | Maximum 300 characters. | Maximal 300 Zeichen. |

**AC-2.8** Frontend tests:
- `TextFieldEditor.test.tsx` renders and updates `settings.title`, `settings.description`, `settings.is_multiline`.
- `RegistrationFieldList.test.tsx` adds the "Text" menu item and creates a default text field on click.
- `eventRegistrationHelpers.test.ts` covers the text validation branch.

**AC-2.9** Manual: an organiser can add a text field, save the registration config as a draft, and reload the page to see the field still configured. This proves the round-trip Phase 1 ↔ Phase 2 contract.

### AC-3: Public registration form

**AC-3.1** A new `RegistrationTextField.tsx` component lives in `frontend/src/components/project/`. It receives `{field, value, onChange}` (mirror `RegistrationCheckboxField` shape). It renders:
- the field's `settings.title` as the question label (with a `*` if `field.is_required`)
- the field's `settings.description` as helper text below
- either a single-line MUI `<TextField>` or a `<TextField multiline minRows={3}>` depending on `settings.is_multiline`
- `inputProps={{ maxLength: 300 }}` to enforce the cap in the browser
- a live character counter `n / 300` shown **only when `is_multiline` is true**
- calls `onChange(value)` on every keystroke

**AC-3.2** `RegistrationFieldAnswersForm.tsx`:
- adds `textValues: Record<number, string>` local state
- initialises the state from any pre-existing answer on edit (matches the existing per-type state initialisation pattern)
- in `validate()`, adds a `case "text"` branch: if `field.is_required` and `!textValues[field.id]?.trim()`, push an error message using the i18n key from AC-2.7; if `textValues[field.id]?.length > 300`, push the max-length error
- in the answer assembly loop, adds a `case "text"` branch that pushes `{fieldId, valueText: textValues[field.id] ?? ""}`
- in the render dispatch, adds a `case "text"` branch that mounts `<RegistrationTextField field={field} value={textValues[field.id] ?? ""} onChange={(v) => setTextValues((p) => ({...p, [field.id]: v}))} />`

**AC-3.3** When the modal submits, the backend `EventRegistrationSubmissionSerializer` accepts the new payload shape and persists it. Errors from AC-1.4 surface in the modal's error UI alongside the existing field-level error handling. Verify the existing `RegistrationFieldAnswersForm` already handles a 400 with per-field errors keyed by `field` and route text-field errors through it; if not, add a generic `non_field_errors` fallback so the user sees the 300-char / required error.

**AC-3.4** A guest can register with a text field filled in, and `GET /api/projects/{slug}/registrations/` returns the text answer. (No UI consumption of that answer yet — that's Phase 4.)

**AC-3.5** Frontend tests:
- `RegistrationTextField.test.tsx` renders single-line and multi-line variants, updates value via `onChange`, verifies the `maxLength` HTML attribute.
- `RegistrationFieldAnswersForm.test.tsx` covers the new text branch in `validate` and assembly.
- Manual end-to-end: register as a guest, see the answer saved, fetch via API.

### AC-4: Admin display & export

**AC-4.1** `ViewRegistrationAnswersModal.tsx` adds a `case "text"` render branch: displays the `value_text` (or `—` if empty/null) preserving `\n` line breaks. Use `whiteSpace: "pre-wrap"` in a `<Box>` or `<Typography component="div">` with `style={{ whiteSpace: "pre-wrap" }}`.

**AC-4.2** `ProjectRegistrationsContent.tsx`:
- `customFieldColumns` builder: for a text field, produces **one** DataGrid column (since text is a single value, unlike inventory/time_slot that may produce multiple). Column header is the field's `label` (matching existing convention).
- the row resolver uses `resolveAnswerToStrings(field, answer, locale)` to get the value (per AC-4.4).
- `ViewRegistrationAnswersModal` opens for the row and shows the text via the AC-4.1 branch.

**AC-4.3** CSV export (DataGrid `<GridToolbarExport csvOptions>`) emits the text answer in the field's column. The MUI X default CSV serializer writes a string column verbatim. Verify that:
- text with embedded `\n` is quoted (the default serializer in MUI X DataGrid quotes fields containing newlines — confirm in a test).
- text with embedded `,` is quoted (same).
- text with embedded `"` is escaped as `""` (same).

If the default serializer does not do this, switch to a custom `csvOptions.valueFormatter` that returns the answer array — do not roll our own CSV writer.

**AC-4.4** `resolveAnswerToStrings` in `frontend/src/utils/resolveRegistrationFieldAnswer.ts` adds a `case "text"` branch: returns `[answer.value_text ?? ""]`.

**AC-4.5** Confirmation email (sent by Celery task) renders the text answer via the AC-1.8 builder. No additional frontend change is required for this — it is exercised by the backend tests in AC-1.9. Manual: register as a guest, open the confirmation email, confirm the text answer appears with line breaks intact (HTML clients: `<br>` rendered as line breaks, e.g. Gmail, Outlook web; `.ics` attachment: plaintext with `\n`).

**AC-4.6** Frontend tests:
- `ViewRegistrationAnswersModal.test.tsx` covers the text branch with `\n` line breaks.
- `resolveRegistrationFieldAnswer.test.ts` covers the text branch.
- `ProjectRegistrationsContent.test.tsx` (if exists) covers the new column for text fields.
- Manual: open the guest list as the organiser, see the text answer in the cell; click a row to open the modal and see the multi-line answer with line breaks; click "Export CSV" and open the CSV in a spreadsheet, confirm the text is in the correct column, line breaks are preserved, commas and quotes are escaped correctly.

---

## Constraints

- **Backend goes first (Phase 1)**: Frontend cannot be exercised end-to-end without backend changes; Phase 1 must land before Phase 2.
- **Follow the registry pattern**: A new `TextFieldSettingsSerializer` must be registered in `FIELD_TYPE_SETTINGS_VALIDATORS`. No special-cased branches in the main serializer outside this pattern.
- **Follow the per-type dispatch**: New code in `EventRegistrationSubmissionSerializer.validate`, `_build_field_answers_html`, and `_build_field_answers_text` must follow the existing `if field_type == X` dispatch pattern.
- **Max 5 fields per event**: `MAX_FIELDS = 5` constant unchanged. Text fields count toward the cap.
- **Field `label` is admin-only**: Never shown to the guest. `settings.title` is the user-facing prompt. These are two separate things.
- **300-character cap applies to both single-line and multi-line mode**: Enforced server-side (rejects > 300 chars) and client-side (`maxLength: 300`).
- **Plaintext only**: Text is stored as plaintext with `\n` line breaks. Never rendered as HTML anywhere — emails use `linebreaksbr` (which escapes the surrounding text), the modal uses `whiteSpace: "pre-wrap"`, the DataGrid renders the string verbatim, CSV uses the MUI X default serializer.
- **Answer-lock**: Only `settings.title` is immutable once answers exist. `settings.description`, `settings.is_multiline`, `is_required`, and `label` remain mutable.
- **CRLF/CR → LF normalization on save**: Prevents old-Outlook-style line endings from leaking into the email builder.
- **No migration backfill needed**: Adding a nullable column to `RegistrationFieldAnswer` is a non-blocking operation on PostgreSQL.
- **i18n**: English + German translations for all new user-visible strings.

---

## Domain Context

### How the four existing field types work

The current field-type system is built around a small registry pattern:

- **Enum**: `RegistrationFieldType` (`backend/organization/models/registration_field.py`) holds the 4 string constants (`"checkbox"`, `"option_select"`, `"inventory"`, `"time_slot_select"`). Stored on `RegistrationField.field_type` as `CharField(max_length=50, choices=...)`.

- **Settings registry**: `FIELD_TYPE_SETTINGS_VALIDATORS` in `backend/organization/serializers/registration_field.py` maps each enum value to a `*SettingsSerializer` (a plain DRF `Serializer`, not a `ModelSerializer`) that whitelists and validates the per-type `settings` dict. New types slot in by registering a new `TextFieldSettingsSerializer`.

- **Field serializer**: `RegistrationFieldSerializer` uses the registry to validate `settings` and runs publish-time checks per type (e.g. "checkbox needs description", "inventory needs options with `available_amount` and `max_amount_per_guest`").

- **Submission serializer**: `EventRegistrationSubmissionSerializer.validate` (around lines 387–577 in `backend/organization/serializers/event_registration.py`) dispatches per-type validation in an `if/elif` chain on `field.field_type`. **A text branch slots in here.**

- **Sync logic**: `sync_registration_answers` (around line 580) persists per-type values from the validated payload. Text: persist `value_text`.

- **Read serializer**: `EventRegistrationSerializer.get_field_answers` (around line 259) returns answers as `[{field, value_boolean, value_option, value_number}]`. **Add `value_text` here.**

- **Email renderers**: `_build_field_answers_html` and `_build_field_answers_text` in `backend/organization/utility/email.py` dispatch on `field_type` to render each answer. HTML uses `linebreaksbr` for multi-line content; text preserves `\n`. **Add text branches here.**

- **Answer-lock**: `EditEventRegistrationConfigSerializer.validate` (around lines 961+) rejects changes to type-specific `settings.*` keys once registrants have answered. The pattern is: "if this field has answers and the new value of `settings.X` differs from the old, return 400". **Add a text branch that locks only `settings.title`.**

### Per-type admin editor pattern

`RegistrationFieldEditor.tsx` is a dispatcher (around lines 38–112) that mounts a per-type editor based on `field.field_type`. Each per-type editor lives in `frontend/src/components/shareProject/` and is a controlled component that reads/writes `field.settings` and `field.is_required`. New types follow this pattern: write a `TextFieldEditor.tsx`, register it in the dispatcher.

### Per-type public form field pattern

`RegistrationFieldAnswersForm.tsx` is the central dispatcher for the public registration form. It maintains per-type local state (e.g. `booleanValues`, `optionValues`) and dispatches per-type `validate()` and assembly. Each per-type public field component lives in `frontend/src/components/project/` and receives `{field, value, onChange}`. New types follow this pattern: write a `RegistrationTextField.tsx`, register it in the dispatcher.

### Data shape

```
RegistrationField
  field_type: "text"
  label: "Dietary"            # admin-only identifier, CSV header, unique per config
  is_required: true
  settings:
    title: "Any dietary requirements?"   # user-facing prompt
    description: "We'll do our best to accommodate."   # optional helper
    is_multiline: true                    # render textarea vs input
  options: []                             # always empty for text
```

```
RegistrationFieldAnswer
  field: <id>
  value_text: "Vegetarian, no nuts."   # normalized to \n line breaks
  value_boolean: null
  value_option: null
  value_number: null
```

### Form library

The codebase does **not** use React Hook Form or Zod for this surface — registration fields use hand-written local `useState` and a `useImperativeHandle` validate pattern. New code must mirror this; do not introduce RHF/Zod as part of this task.

---

## Open Questions

None — all decisions resolved during pre-spec discussion.

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Multi-line default? | `is_multiline = false` (single-line) |
| 2 | `settings.title` vs `label` | `label` = admin identifier (incl. CSV header), `settings.title` = user-facing prompt — two separate things |
| 3 | 300-char enforcement | Backend hard-rejects; frontend soft-warns via `maxLength` |
| 4 | Sanitization | Plaintext, never rendered as HTML anywhere |
| 5 | Answer-lock | Only `settings.title` is locked; `description` / `is_multiline` / `is_required` / `label` mutable |
| 6 | Phasing | 4 phases — Backend → Admin config → Public form → Admin display |
| 7 | 5-field cap | Unchanged; text field counts toward it |
| 8 | Line breaks | Normalize CRLF/CR → LF; render `\n` in modal and CSV; `linebreaksbr` in HTML email |
| 9 | Branch / filename | `add_text_field_event_registration` / `20260623_0942_add_text_field_event_registration.md` |

---

## Implementation Notes

### Phasing rationale

The 4-phase split mirrors a natural dependency chain:

- **Phase 1 — Backend foundation**: model + migration + serializers + email render + answer-lock. Backend-only PR. No user-visible change yet, but unblocks every later phase.
- **Phase 2 — Admin config UI**: types + `TextFieldEditor` + `RegistrationFieldList` integration + `validateRegistrationFields`. After this PR, organisers can configure text fields in the draft registration flow and the round-trip with Phase 1 is verifiable.
- **Phase 3 — Public registration form**: `RegistrationTextField` + `RegistrationFieldAnswersForm` integration. After this PR, guests can submit text answers end-to-end. Backend has been live since Phase 1, so this PR is purely additive on top.
- **Phase 4 — Admin display & export**: `ViewRegistrationAnswersModal` + DataGrid column + `resolveAnswerToStrings` + CSV verification. Closes the loop — organisers can finally read what guests wrote. Email rendering was already done in Phase 1 (server-driven).

All four phases ship together (milestone V3 has no fixed date), but each PR is independently reviewable.

### Phase 1 — backend, key code paths

- **Model** (`backend/organization/models/registration_field.py`): add one line `TEXT = "text", _("Text")` to `RegistrationFieldType`.
- **Migration**: `backend/organization/migrations/0139_registrationfieldanswer_value_text.py` — adds `value_text = TextField(null=True, blank=True)` on `RegistrationFieldAnswer`. Mirrors the pattern of `0134_registrationfieldanswer_value_number.py`.
- **Settings serializer** (`backend/organization/serializers/registration_field.py`): new `TextFieldSettingsSerializer(serializers.Serializer)` with fields `title = serializers.CharField(max_length=200, allow_blank=False)`, `description = serializers.CharField(max_length=500, required=False, allow_blank=True, default="")`, `is_multiline = serializers.BooleanField(required=False, default=False)`. Register in `FIELD_TYPE_SETTINGS_VALIDATORS`.
- **Field serializer**: in `RegistrationFieldSerializer.validate`, add a `RegistrationFieldType.TEXT` branch that enforces `settings.title` non-empty if `is_required` and rejects any provided `options`.
- **Submission serializer**: in `EventRegistrationSubmissionSerializer.validate`, add `RegistrationFieldType.TEXT` branch — see AC-1.4 for rules. Add `value_text = serializers.CharField(allow_blank=True, required=False, max_length=300)` to `RegistrationFieldAnswerInputSerializer`.
- **Sync**: in `sync_registration_answers`, when `field.field_type == TEXT`, write `normalized_value_text` (CRLF/CR → LF) to `answer.value_text`.
- **Read**: in `EventRegistrationSerializer.get_field_answers`, add `"value_text": a.value_text`.
- **Answer-lock**: in `EditEventRegistrationConfigSerializer.validate`, add a `RegistrationFieldType.TEXT` branch that compares `old.settings.get("title")` to `new_settings.get("title")` when `field.answers.exists()`. Mirror the existing `OPTION_SELECT` lock pattern (lines ~1080).
- **Email**: in `_build_field_answers_html`, add a TEXT branch: `{{ value|default:"—"|linebreaksbr }}`. In `_build_field_answers_text`, add a TEXT branch: `{{ value|default:"—" }}` (no filter — `\n` survives).

### Phase 2 — admin editor

- **Types** (`frontend/src/types.ts`): widen `RegistrationField.field_type` union, widen `RegistrationField.settings` to include `title?: string; is_multiline?: boolean`, add `valueText?: string` to `RegistrationFieldAnswerValue`, add `value_text: string | null` to `RegistrationFieldAnswer`.
- **`TextFieldEditor.tsx`**: mirror `CheckboxFieldEditor.tsx`'s shape (controlled `field` prop, `onChange(field)` callback, internal MUI inputs).
- **`RegistrationFieldList.tsx`**: add `"text"` to `FIELD_TYPE_LABEL_KEYS`; in `handleAddField`, add `case "text"` that returns `{ field_type: "text", is_required: false, label: autoLabel, settings: { title: "", description: "", is_multiline: false }, options: [], order: nextOrder }`; in the "Add field" `Menu`, add a new `MenuItem` "Text"; in `getFieldIcon`, add a `text` case (MUI `ShortTextIcon` or `NotesIcon`).
- **`RegistrationFieldEditor.tsx`**: add `if (field.field_type === "text") return <TextFieldEditor field={field} onChange={onChange} />;`.
- **`eventRegistrationHelpers.ts`**: in `validateRegistrationFields`, add `if (field.field_type === "text" && !field.settings.title?.trim()) errors.push(...)`.
- **i18n**: add the 7 keys from AC-2.7 to `frontend/public/texts/project_texts.tsx` (English + German).

### Phase 3 — public form

- **`RegistrationTextField.tsx`**: receives `{field, value, onChange}`. Renders MUI `<TextField>` (single or `multiline`) with `label={field.settings.title}`, `helperText={renderCounterOrDescription}`, `inputProps={{ maxLength: 300 }}`, `required={field.is_required}`. Counter shown only when `field.settings.is_multiline`.
- **`RegistrationFieldAnswersForm.tsx`**: add `textValues` state. In `validate`, dispatch `case "text"` for required + length. In assembly, dispatch `case "text"` to push `{fieldId, valueText}`. In render dispatch, mount `<RegistrationTextField>`.

### Phase 4 — display & export

- **`ViewRegistrationAnswersModal.tsx`**: add `case "text"` returning a `<Typography component="div" style={{ whiteSpace: "pre-wrap" }}>{answer.value_text ?? "—"}</Typography>`.
- **`ProjectRegistrationsContent.tsx`**: in `customFieldColumns`, handle text: produce one column with `field: 'value_text_${field.id}'`, `headerName: field.label`, `valueGetter` calling `resolveAnswerToStrings(field, params.row.field_answers_by_id[field.id], locale)[0]`. CSV export: verify MUI X default handles `\n`, `,`, `"` correctly — write a unit test that confirms a text answer with `"Hello, "world"\nNext line"` round-trips correctly through the CSV serializer.
- **`resolveRegistrationFieldAnswer.ts`**: add `case "text": return [answer.value_text ?? ""];`.

### Risk: CSV edge cases

MUI X DataGrid's default CSV serializer quotes fields containing newlines, commas, and double-quotes by default. Confirm in a unit test using `unstable_csvOptions` or by extracting the serializer. Locale-specific separators (German Excel uses `;`) — confirm the default works in both `en` and `de` locales; if not, switch to `csvOptions.valueFormatter` rather than disabling CSV.

### Risk: answer-lock refactor

The `EditEventRegistrationConfigSerializer.validate` method is dense (~200 lines of per-type immutability checks). Add a small text-field branch only — do **not** refactor the surrounding per-type code. Keep this PR additive.

### Test files to mirror

- Backend: `backend/organization/tests/test_event_registration_*.py` — new file `test_event_registration_text_field.py`.
- Frontend: per-type `*.test.tsx` next to each new component.

### Documentation updates

- `doc/environment-variables.md`: no change (no new env vars).
- `README` / feature docs: not required by this task.
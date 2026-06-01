# Include Registration Field Answers in Confirmation Email

**Status**: DRAFT
**Type**: Feature
**Date and time created**: 2026-06-01 10:31
**GitHub Issue**: [#2023](https://github.com/climateconnect/climateconnect/issues/2023)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260416_1000_event_registration_custom_fields.md`](./20260416_1000_event_registration_custom_fields.md) ← foundational custom fields spec
- [`20260526_1130_guest_view_modify_registration.md`](./20260526_1130_guest_view_modify_registration.md) ← guest views/modify registration (shows answers in UI)

---

## Problem Statement

When a guest registers for an event with custom registration fields, they receive a confirmation email. The email currently includes event details (title, date, organiser, location) but does **not** include the answers the guest provided for custom fields. The guest can view their answers in the frontend via the `ViewRegistrationAnswersModal`, but the confirmation email does not reflect this information. This means the guest has no email record of what they submitted.

**Core Requirements (User/Stakeholder Stated):**

1. If a registration config has custom fields and the guest provided answers, include those answers in the confirmation email.
2. If there are no custom fields, or if all fields were optional and the guest did not provide any answers, do not add anything to the email.
3. The answers should be presented in a similar style to the frontend `ViewRegistrationAnswersModal` — field label + answer value.
4. The Mailjet template needs to be updated to display the answers, with clear instructions provided.

**Explicitly Out of Scope:**

- Changing the confirmation email subject or other existing template variables.
- Including answers in the admin notification email (separate email, different template).
- Including answers in the organiser message email.
- Adding answers to the cancellation email.
- Changing the `ViewRegistrationAnswersModal` or frontend answer display.

### Non-Functional Requirements

- **No breaking changes**: the existing template variables remain unchanged. The new variable is additive — if the template does not include it, nothing breaks.
- **Graceful degradation**: if the Mailjet template is not updated to include the new variable, the email still sends correctly (the variable is simply ignored).
- **Localization**: field labels and option titles are stored as-is by the organiser (not localised by the system). The email displays them verbatim, same as the frontend export.
- **Performance**: the additional DB queries to fetch field answers and options should be minimal (the answers are already created in the same transaction as the registration).

### AI Agent Insights and Additions

- **Email function**: `send_event_registration_confirmation_to_user()` in `backend/organization/utility/email.py:562` builds the Mailjet template variables and calls `send_email()`. This is the only function that needs to change.

- **Celery task**: `send_event_registration_confirmation_email` in `backend/organization/tasks.py:24` receives `user_id` and `event_slug`. It needs an additional `registration_id` parameter to efficiently fetch the field answers without an extra lookup query. The view dispatches the task at `event_registration_views.py:282`.

- **Answer data model**: `RegistrationFieldAnswer` has three value columns: `value_boolean`, `value_option` (FK → `RegistrationFieldOption`), `value_number`. One row per `(registration, field)`. The `RegistrationField` has `field_type`, `label`, `settings`, and `order`. The `RegistrationFieldOption` has `title`, `start_time`, `end_time`.

- **Answer resolution logic** (mirrors frontend `resolveAnswerToStrings()` in `frontend/src/utils/resolveRegistrationFieldAnswer.ts`):
  - `checkbox`: `value_boolean === true` → show field label (the description is HTML from `settings.description`; strip to plain text for email).
  - `option_select`: look up `value_option` → show `option.title`.
  - `inventory`: look up `value_option` → show `"OptionTitle × value_number"`.
  - `time_slot_select`: look up `value_option` → show formatted time range from `option.start_time`/`option.end_time`, falling back to `option.title`.

- **Mailjet template variable approach**: Pass a single HTML string variable `FieldAnswersHtml` containing the pre-rendered answers. This avoids Mailjet's complex array/loop syntax and gives full control over the HTML. If no answers exist, pass an empty string. The template renders it with `{{{var:FieldAnswersHtml}}}` (triple braces for unescaped HTML in Mailjet's template language).

- **Mailjet template update**: The template needs a conditional section that only renders when `FieldAnswersHtml` is non-empty. Mailjet supports `{{#if var:FieldAnswersHtml}}...{{/if}}` conditional blocks. If the template is not updated, the variable is simply ignored — no breaking change.

- **HTML sanitization**: The checkbox field's `settings.description` can contain HTML (rich text). For the email, strip HTML tags to plain text to avoid rendering issues. Option titles and time slots are plain text.

- **Field ordering**: Answers should be sorted by `field.order` (ascending), matching the frontend display order.

---

## System Impact

### Actors
- **Guest**: receives a confirmation email that now includes their field answers.
- **Organiser**: no change to their workflow.

### Entities Changed
- No model changes. No new entities.

### Flows Changed
- **Registration confirmation email**: now includes field answers when present.

### Integration Changes
- The Celery task signature gains a `registration_id` parameter.
- The Mailjet template variables gain a `FieldAnswersHtml` variable.
- The Mailjet template needs a conditional section for `FieldAnswersHtml`.

---

## Software Architecture

### API — No API Changes

This task only changes the email sending logic. No API endpoints are modified.

### Backend — Celery Task Signature Change

The `send_event_registration_confirmation_email` task in `backend/organization/tasks.py` needs a `registration_id` parameter:

```python
@app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_event_registration_confirmation_email(self, user_id: int, event_slug: str, registration_id: int):
```

The view dispatches it with the new parameter:

```python
transaction.on_commit(
    lambda: _send_registration_email.delay(
        user_id=_user_id,
        event_slug=_event_slug,
        registration_id=_registration_id,
    )
)
```

### Backend — Email Function Changes

In `send_event_registration_confirmation_to_user()`, add a `registration` parameter and build the `FieldAnswersHtml` variable:

```python
def send_event_registration_confirmation_to_user(user, project, registration):
    # ... existing code ...

    field_answers_html = _build_field_answers_html(registration, lang_code)

    variables = {
        # ... existing variables ...
        "FieldAnswersHtml": field_answers_html,
    }
```

The `_build_field_answers_html()` helper:

1. Fetch `RegistrationFieldAnswer` objects for the registration, with `select_related("field", "value_option")`.
2. Filter to only answers that have a non-null value (skip unanswered optional fields).
3. Sort by `field.order`.
4. For each answer, resolve to a display representation:
   - **`checkbox`**: if `value_boolean is True`, render the `field.settings.description` as **plain text** (strip HTML tags) with a `✓` prefix. No label column — the description IS the answer (matches `ViewRegistrationAnswersModal` pattern). Unchecked checkboxes (`value_boolean` is not True) are skipped entirely.
   - **`option_select`**: label = `field.settings.title`, answer = `option.title`.
   - **`inventory`**: label = `field.settings.title`, answer = `"{option.title} × {value_number}"`.
   - **`time_slot_select`**: label = `field.settings.title`, answer = formatted time range from `option.start_time`/`option.end_time`, falling back to `option.title`.
   - Non-checkbox field labels use `field.settings.title` (the user-facing title), **not** `field.label` (the organiser-facing internal label used for export).
5. Render as an HTML snippet with inline styles (no custom CSS classes needed):
   ```html
   <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
     <p style="font-weight: bold; margin-bottom: 10px;">Your registration answers</p>
     <table style="width: 100%; border-collapse: collapse;">
       <!-- Checkbox: single column with ✓ prefix -->
       <tr>
         <td colspan="2" style="padding: 4px 8px;">✓ I agree to the terms</td>
       </tr>
       <!-- Other field types: two columns (label + answer) -->
       <tr>
         <td style="padding: 4px 8px; color: #666;">Preferred workshop</td>
         <td style="padding: 4px 8px;">Solar panel installation</td>
       </tr>
     </table>
   </div>
   ```
   The heading text is localised: EN = "Your registration answers", DE = "Deine Anmeldeantworten" (mirrors the frontend modal header pattern from `registration_answers_modal_title` / `registration_answers_modal_title_self`).
6. If no answers have non-null values, return empty string.

**Plain-text email**: Mailjet auto-generates a plain-text version from the HTML. Table structure will be lost but the text content (field titles, answer values, checkmarks) will appear. The `{{#if}}` conditional also works in text mode. This is acceptable for a first iteration.

### Mailjet Template Update

The Mailjet template needs to include the `FieldAnswersHtml` variable. Instructions:

1. Open the Mailjet template editor for the event registration confirmation template (both EN and DE).
2. In the email body, after the existing event details section, add a conditional block:
   ```
   {{#if var:FieldAnswersHtml}}<br/>
   {{{var:FieldAnswersHtml}}}
   {{/if}}
   ```
3. The triple braces `{{{...}}}` render the HTML unescaped. The `{{#if}}` block ensures the section only appears when answers exist.
4. Save and test with a registration that has custom field answers.

---

## Acceptance Criteria

- [ ] When a guest registers for an event with custom fields and provides answers, the confirmation email includes those answers in a readable format.
- [ ] When a guest registers for an event without custom fields, the confirmation email is unchanged (no extra section).
- [ ] When a guest registers for an event with optional custom fields but provides no answers, the confirmation email is unchanged.
- [ ] Checkbox fields show the description (stripped of HTML) when checked. Unchecked checkboxes are not shown.
- [ ] Option select fields show the field title and selected option title.
- [ ] Inventory fields show the field title, selected option title, and quantity.
- [ ] Time slot fields show the field title and formatted time range.
- [ ] Answers are ordered by field order (matching the frontend display).
- [ ] The Mailjet template renders the answers section only when `FieldAnswersHtml` is non-empty.
- [ ] Both EN and DE Mailjet templates are updated.
- [ ] The existing template variables (`FirstName`, `EventTitle`, etc.) are unchanged.

---

## Test Cases

### Backend Tests

| Scenario | Expected |
|----------|----------|
| Register with checkbox (checked) | Email contains checkbox description |
| Register with checkbox (unchecked) | Email does not contain checkbox section |
| Register with option_select | Email contains field title + selected option title |
| Register with inventory | Email contains field title + option title × quantity |
| Register with time_slot_select | Email contains field title + formatted time range |
| Register with multiple fields | All answers shown, ordered by field.order |
| Register with no custom fields | Email has no FieldAnswersHtml section |
| Register with optional fields, no answers | Email has no FieldAnswersHtml section |
| Register with mix of answered and unanswered optional fields | Only answered fields shown |

### Frontend Tests

No frontend changes required — this is a backend + Mailjet template task.

---

## Files to Change

### Backend

| File | Change |
|------|--------|
| `backend/organization/tasks.py` | Add `registration_id` parameter to `send_event_registration_confirmation_email`; fetch registration with related answers; pass to email function |
| `backend/organization/utility/email.py` | Add `registration` parameter to `send_event_registration_confirmation_to_user`; add `_build_field_answers_html()` helper; add `FieldAnswersHtml` to template variables |
| `backend/organization/views/event_registration_views.py` | Pass `registration_id` to the Celery task dispatch |
| `backend/organization/tests/test_event_registration_*.py` | Add test cases for email with field answers |

### Mailjet Templates (manual update)

| Template | Change |
|----------|--------|
| Event Registration Confirmation (EN) | Add conditional `FieldAnswersHtml` section |
| Event Registration Confirmation (DE) | Add conditional `FieldAnswersHtml` section |

---

## Dependency Notes

- **Depends on**: Custom fields infrastructure (Phase 4a — already complete). Registration confirmation email (already complete).
- **Enables**: Nothing directly, but improves the guest experience.
- **No new migrations required**.
- **No new API endpoints required**.

---

## Log

- 2026-06-01 10:31 — Spec created. Initial draft.
- 2026-06-01 10:51 — Decisions finalized: checkbox → plain text with ✓ prefix (option B), heading → "Your registration answers" / "Deine Anmeldeantworten", non-checkbox labels → `settings.title`, inline styles (no custom CSS), Mailjet plain-text auto-generation accepted.

---

## Notes and Open Questions

1. **HTML stripping for checkbox descriptions**: The checkbox `settings.description` can contain HTML (bold, links). For the email, we strip HTML tags to plain text with a `✓` prefix. This matches the modal's visual pattern (checked icon + description) but in text form. Rich formatting is lost but email rendering is safe.

2. **Mailjet template update**: The spec includes step-by-step instructions for updating the Mailjet template. The key is using `{{{var:FieldAnswersHtml}}}` (triple braces) for unescaped HTML rendering and `{{#if var:FieldAnswersHtml}}` for conditional display. No custom CSS classes are needed — all styling is inline. If the template is not updated, the variable is simply ignored.

3. **Mailjet plain-text version**: Mailjet auto-generates a plain-text version from the HTML. Table structure will be lost but the text content appears. The `{{#if}}` conditional works in text mode. Acceptable for this iteration.

4. **Field label source**: Non-checkbox fields use `field.settings.title` (user-facing) as the label, not `field.label` (organiser-facing internal label for export). This matches the frontend `ViewRegistrationAnswersModal` pattern.

5. **Heading localization**: The section heading "Your registration answers" (EN) / "Deine Anmeldeantworten" (DE) mirrors the frontend modal header pattern. The heading is resolved in the backend based on the user's language, not passed as a template variable.

6. **Future: structured template variables**: If the template needs more control over answer styling (e.g. different styles per field type), the backend could pass structured array variables instead of a single HTML string. This would require Mailjet's `{{#each}}` loop syntax. The current approach (single HTML string) is simpler and sufficient for this iteration.

7. **Future: include answers in admin notification**: The admin notification email (`send_admin_event_notification`) does not include field answers. This could be a future enhancement but is out of scope for this task.

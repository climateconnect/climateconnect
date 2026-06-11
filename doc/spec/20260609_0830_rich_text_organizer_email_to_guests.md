# Rich Text Organizer Email to Event Guests

**Status**: DRAFT  
**Type**: Backend + Frontend — enhancement  
**Epic**: Event Management V3  
**Date created**: 2026-06-09  
**GitHub Issue**: [#1999](https://github.com/climateconnect/climateconnect/issues/1999)  
**Depends on**: Existing "send email to guests" feature (see `doc/spec/20260414_1300_send_email_to_guests_improvements.md`)

---

## Problem Statement

Event organisers can send bulk emails to registered guests via the "Email guests" button on the Registrations tab. Currently, the message body is a **plain-text textarea** — no formatting, no links, no structure.

For simple announcements this is fine, but organisers frequently need to communicate structured information: meeting point instructions with links, multi-step agendas, dietary options in a table, or formatted checklists. Without rich text, organisers resort to wall-of-text messages that are hard to read, or they give up and use an external email tool.

### Why it matters

- **Readability**: Structured text (lists, bold labels, links) is significantly easier to scan than a plain-text block.
- **Reduces support burden**: Organisers currently send follow-up clarification emails because the first message was unclear.
- **Parity with registration fields**: The checkbox field in event registration already uses TipTap for rich text (bold + links). The organiser email should offer at least the same, plus additional formatting for longer-form communication.
- **Copy-paste workflow**: Organisers often prepare event communications in Google Docs or Word. The editor must accept pasted rich text and preserve basic formatting.

---

## Core Requirements

### What we're building

Replace the plain-text message textarea in `SendEmailToGuestsModal` with a TipTap rich-text editor. The editor supports: **bold, italic, bullet lists, ordered lists, text alignment (left/center/right), links, tables, and emoji**. The message is sent as HTML through the existing Mailjet template pipeline.

### Formatting features

| Feature | TipTap extension | mui-tiptap toolbar button | Notes |
|---------|-----------------|--------------------------|-------|
| Bold | `StarterKit` (built-in) | `MenuButtonBold` | |
| Italic | `StarterKit` (built-in) | `MenuButtonItalic` | Enabled in StarterKit config (currently disabled in CheckboxFieldEditor) |
| Bullet list | `StarterKit` (built-in) | `MenuButtonBulletList` | |
| Ordered list | `StarterKit` (built-in) | `MenuButtonOrderedList` | |
| Text alignment | `TextAlign` (`@tiptap/extension-text-align`) | `MenuButtonAlignLeft`, `MenuButtonAlignCenter`, `MenuButtonAlignRight` | New npm dependency required |
| Links | `StarterKit` (built-in) + `LinkBubbleMenuHandler` | `MenuButtonEditLink` + `LinkBubbleMenu` | Same pattern as CheckboxFieldEditor |
| Tables | `Table`, `TableRow`, `TableCell`, `TableHeader` (`@tiptap/extension-table`) | mui-tiptap `MenuButtonAddTable`, `MenuButtonDeleteTable`, table column/row controls | Already installed; needs TableRow/TableCell/TableHeader imports |
| Emoji | `Emoji` (`@tiptap/extension-emoji`) | Emoji picker button via `mui-tiptap` or custom toolbar button | New npm dependency; `:` shortcode autocomplete (like Slack/Discord/GitHub). Emojis are unicode — no backend/Mailjet impact |

**Not included** (no practical use case for email communications):
- Strikethrough, code, code blocks, headings, blockquotes, horizontal rules, images, underline

### Data flow (unchanged structure, content type changes)

```
Organiser types / pastes rich text in TipTap editor (including emoji via : shortcodes)
  → editor.getHTML() produces sanitised HTML (TipTap strips unregistered tags on paste; emoji = unicode)
  → Frontend sends { subject, message: "<p>Hello <strong>guests</strong> 👋...</p>", is_test: false }
  → Backend validates, sanitises HTML via bleach (expanded allowlist; emoji unicode preserved)
  → Celery task passes sanitised HTML as OrganizerMessage template variable
  → Mailjet renders {{{OrganizerMessage}}} (triple-brace = unescaped HTML)
  → Recipient sees formatted email with emoji
```

---

## System Impact

### Actors Involved

- **Frontend Developer**: Replace textarea with TipTap editor component, enlarge modal, add text alignment dependency
- **Backend Developer**: Expand HTML sanitization allowlist, add style attribute filtering, add `max_length` to serializer, update tests
- **Product Team (manual)**: Update Mailjet templates (EN + DE) to use `{{{OrganizerMessage}}}` triple-brace syntax

### Entities Changed

| Layer | File | Change |
|-------|------|--------|
| Frontend component | `frontend/src/components/project/SendEmailToGuestsModal.tsx` | Replace `<TextField multiline>` with TipTap `RichTextEditor`; enlarge modal to `maxWidth="lg"` |
| Frontend component | `frontend/src/components/project/SendEmailToGuestsModal.test.tsx` | Update tests for rich-text editor (query by role/label changes, HTML content assertions) |
| Frontend dependency | `frontend/package.json` | Add `@tiptap/extension-text-align`, `@tiptap/extension-emoji`, `@tiptap/suggestion` |
| Backend serializer | `backend/organization/serializers/event_registration.py` | `SendOrganizerEmailSerializer.message`: add `max_length` |
| Backend view | `backend/organization/views/event_registration_views.py` | `SendOrganizerEmailView.post()`: call `sanitize_html()` with expanded allowlist before passing message to Celery task / test send |
| Backend utility | `backend/climateconnect_api/utility/html.py` | Expand `sanitize_html()` to support CSS style filtering (only `text-align` allowed) |
| Backend tests | `backend/organization/tests/test_event_registration_organiser_email.py` | Add tests for HTML sanitization (XSS stripping, allowed tags preserved, style filtering) |
| Backend docs | `doc/environment-variables.md` | Update `OrganizerMessage` description from "plain-text body" to "HTML body" |
| Mailjet templates | Manual dashboard change | `EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID` (EN + DE): change `{{OrganizerMessage}}` to `{{{OrganizerMessage}}}` |

### Flows **not** affected

- **Cancel guest registration message** (`CancelGuestRegistrationModal.tsx`): Stays plain text. It's a short note to a single guest, not a structured communication.
- **Registration confirmation email**: No change — already sends pre-rendered HTML via `FieldAnswersHtml`.
- **Admin notification email**: No change.

---

## Acceptance Criteria

### AC-1: Rich-text editor in modal

The "Email guests" modal (`SendEmailToGuestsModal`) displays a TipTap rich-text editor instead of a plain `<TextField>` for the message body. The editor toolbar includes controls for: bold, italic, bullet list, ordered list, text alignment (left/center/right), insert/edit link, emoji picker, and table operations (insert table, add/delete rows and columns).

The modal uses `maxWidth="lg"` to provide adequate space for the editor and toolbar.

### AC-2: Formatting preserved in sent email

When an organiser composes a message with bold text, bullet lists, links, tables, and text alignment, the formatting is preserved in the email received by guests. Links are clickable. Tables render as HTML tables in the email client.

### AC-3: Copy-paste support

The organiser can paste rich text from an external source (e.g., Google Docs, Word, web page). TipTap's built-in content filtering handles this automatically: ProseMirror parses the pasted HTML against the editor's schema, preserving tags/attributes that match registered extensions and silently stripping everything else. This means:

- **Preserved**: Bold (`<strong>`), italic (`<em>`), lists (`<ul>/<ol>`), links (`<a>`), tables (`<table>`), paragraph alignment
- **Stripped**: Images, headings, custom fonts/colors, `<span>` with inline styles, `<div>` wrappers, Office-specific markup (`<o:p>`, `mso-*` styles, bookmark anchors)

**Known limitations** (acceptable for now, revisit if users report issues):
- Word sometimes generates lists as `<p>` tags with numbering styles instead of `<ul>/<ol>` — these may paste as plain paragraphs rather than proper list items.
- Google Docs sometimes wraps pasted content in `<b style="font-weight: normal">` — TipTap may interpret this as bold text.

No dedicated paste-cleaning extension is added. Backend `bleach` sanitization is the final safety net for any HTML that slips through. If paste quality becomes a user-reported issue, `@intevation/tiptap-extension-office-paste` (free, MIT) or `@tiptap-pro/extension-paste-handler` (paid) can be evaluated as follow-up.

### AC-4: Backend HTML sanitization

The backend sanitizes the message HTML before passing it to the email pipeline:

- **Allowed tags**: `p`, `strong`, `b`, `em`, `i`, `a`, `br`, `ul`, `ol`, `li`, `table`, `thead`, `tbody`, `tr`, `th`, `td`
- **Allowed attributes**: `a[href, target]`, `p[style]`, `td[style, colspan, rowspan]`, `th[style, colspan, rowspan]`
- **Style filtering**: Only `text-align` (values: `left`, `center`, `right`, `justify`) is permitted in `style` attributes. All other CSS properties are stripped.
- **Link safety**: Every `<a>` tag gets `rel="noopener noreferrer"` forced (existing behavior).
- **XSS prevention**: `<script>`, `<iframe>`, `<img>`, event handlers (`onclick`, `onerror`, etc.), `javascript:` URLs, and all other non-allowed tags/attributes are stripped.

### AC-5: Character count

The editor displays a visible-character count (not counting HTML tags). Limit: 5000 visible characters. The count turns red when the limit is reached. Same limit as the current plain-text field.

### AC-6: Empty validation

When the organiser clicks "Send now" or "Send test to myself" with an empty message (editor contains only `<p></p>` or whitespace), client-side validation shows the "Message is required" error and does not submit.

### AC-7: Existing functionality preserved

All existing behavior is unchanged:
- Subject field remains a plain `<TextField>` (max 200 chars).
- "Send test to myself" sends a single test email with `[TEST]` prefix.
- "Send now" → confirmation step → "Confirm and send" flow is unchanged.
- Bulk send returns `sent_count` and dispatches the Celery task.
- Team admins receive a copy. Deduplication of admin+guest overlap works.
- Test send, API error handling, and close behaviour all work as before.

### AC-8: Mailjet template renders HTML

The `EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID` template (EN and DE) uses `{{{OrganizerMessage}}}` (triple-brace) so that the HTML message body renders as formatted content, not escaped text.

This is a **manual step** in the Mailjet dashboard. The `FieldAnswersHtml` variable in the registration confirmation template already uses this pattern — use it as a reference.

### AC-9: Backend tests

New test cases in `test_event_registration_organiser_email.py`:

1. **HTML message accepted**: POST with valid HTML in `message` → 200 OK, HTML passed through sanitization.
2. **XSS stripped**: POST with `<script>alert(1)</script>` in message → 200 OK, `<script>` tags removed from the sanitised output.
3. **Disallowed tags stripped**: POST with `<img>`, `<iframe>`, `<h1>` in message → 200 OK, those tags removed.
4. **Allowed tags preserved**: POST with `<p>`, `<strong>`, `<a>`, `<ul>`, `<li>`, `<table>` → 200 OK, tags preserved in sanitised output.
5. **Style filtering**: POST with `style="text-align: center"` → preserved. POST with `style="display: none"` or `style="color: red"` → style attribute stripped.
6. **Message max_length**: POST with message exceeding max_length → 400 Bad Request.

### AC-10: Frontend tests

Updated tests in `SendEmailToGuestsModal.test.tsx`:

1. Editor renders with toolbar controls (bold, link, etc.).
2. Empty editor (no visible text) triggers validation error on submit.
3. Subject field validation still works (unchanged).
4. API payload includes HTML message content.
5. Confirmation step, test send, error handling, and close behaviour all pass (queries updated for new editor structure).

---

## Constraints

- **No new Mailjet template IDs**: Reuse the existing `EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID` / `_DE`. Only the template variable syntax changes (double-brace → triple-brace).
- **TipTap, not a new library**: The project already uses TipTap + mui-tiptap. No new rich-text library should be introduced.
- **No paste-cleaning extension**: Rely on TipTap's built-in ProseMirror schema filtering for external paste. No additional dependency for Word/Google Docs paste cleanup. Revisit if users report issues.
- **New npm dependencies**: `@tiptap/extension-text-align`, `@tiptap/extension-emoji`, `@tiptap/suggestion`. All other extensions (Table, TableRow, TableCell, TableHeader) are already installed via `@tiptap/extension-table`.
- **No backend content storage**: The message is not persisted in the database — it flows through the serializer → view → Celery task → email utility → Mailjet. No migration needed.
- **Character limit is visible characters**: TipTap's `CharacterCount` extension counts visible characters (excludes HTML tags). The 5000 limit applies to visible text, matching the current behavior.
- **Cancel registration message stays plain text**: Out of scope. The "message to guest" field in `CancelGuestRegistrationModal` is a short note, not a structured communication.
- **i18n**: No new text keys are needed for the editor itself. The existing `texts.email_message` label can be used as the editor placeholder. mui-tiptap toolbar buttons have built-in tooltips. If tooltip labels should be localised, that can be addressed in a follow-up.

---

## Domain Context

### How the existing CheckboxFieldEditor works

[`frontend/src/components/shareProject/CheckboxFieldEditor.tsx`](frontend/src/components/shareProject/CheckboxFieldEditor.tsx) wraps `mui-tiptap`'s `RichTextEditor` with a minimal configuration:

- **Extensions**: `StarterKit` (with most features disabled — only bold and paragraph), `LinkBubbleMenuHandler`, `CharacterCount` (limit 500)
- **Toolbar**: `MenuButtonBold`, `MenuButtonEditLink`
- **Pattern**: Uses `useRef<RichTextEditorRef>` to access the editor instance. `onUpdate` callback emits HTML via `onChange(html)`. Normalizes `<p></p>` to `""`.

The organizer message editor follows the same pattern but enables more StarterKit features and adds TextAlign + Table extensions.

### How HTML sanitization works today

[`backend/climateconnect_api/utility/html.py`](backend/climateconnect_api/utility/html.py) provides `sanitize_html(html_input, allowed_tags, allowed_attributes)`. It uses `bleach.clean()` with the provided allowlist, then post-processes `<a>` tags to force `rel="noopener noreferrer"`.

Current defaults (checkbox field): tags `["p", "strong", "b", "a", "br"]`, attributes `{"a": ["href", "target"]}`.

For the organizer email, the function will be called with an expanded allowlist. A new post-processing step will filter `style` attributes to only keep `text-align` values.

### How the Mailjet template pipeline works

The `send_email()` function in [`backend/climateconnect_api/utility/email_setup.py`](backend/climateconnect_api/utility/email_setup.py) sends a dict of template variables to Mailjet's v3.1 API. Mailjet renders the template server-side using those variables.

- `{{Variable}}` (double-brace) → HTML-escaped output (safe for plain text)
- `{{{Variable}}}` (triple-brace) → raw HTML output (for pre-rendered HTML content)

The `FieldAnswersHtml` variable in the registration confirmation template already uses triple-brace. The `OrganizerMessage` variable needs the same treatment.

### TipTap table extension

`@tiptap/extension-table` (already installed) exports `Table`, `TableRow`, `TableCell`, and `TableHeader`. These must all be added to the extensions array. mui-tiptap provides table menu buttons for inserting tables and managing rows/columns.

### Text alignment extension

`@tiptap/extension-text-align` (new dependency) adds a `TextAlign` extension that applies `style="text-align: X"` to block nodes (`<p>`, `<td>`, `<th>`). mui-tiptap provides `MenuButtonAlignLeft`, `MenuButtonAlignCenter`, `MenuButtonAlignRight`, and `MenuButtonAlignJustify`.

### Emoji extension

`@tiptap/extension-emoji` (new dependency, MIT, 306K weekly downloads) provides:

- **`:` shortcode autocomplete** — typing `:` opens a dropdown of matching emojis (same UX as Slack, Discord, GitHub)
- **All Unicode 14.1 emojis** included by default; extended `gitHubEmojis` list available as option
- **Inline node rendering** — in the editor, emojis render as `<span>` nodes with optional fallback images for unsupported emojis
- **Unicode output** — `editor.getHTML()` emits emoji unicode characters inside `<span>` wrappers. Backend `bleach` strips the `<span>` (not in allowed tags), leaving pure unicode characters in the email HTML. No backend or Mailjet changes needed for emoji support.
- **Depends on** `@tiptap/suggestion` (peer dependency, provides the dropdown autocomplete UI)

---

## Open Questions

None — all decisions resolved during spec review.

---

## Implementation Notes

### New npm dependencies

```
yarn add @tiptap/extension-text-align @tiptap/extension-emoji @tiptap/suggestion
```

`@tiptap/suggestion` is a peer dependency of `@tiptap/extension-emoji`. All other TipTap extensions are already installed.

### Frontend: Editor component

The rich-text editor can be implemented inline in `SendEmailToGuestsModal.tsx` or extracted into a shared component (e.g., `OrganizerMessageEditor.tsx`). The key decisions:

- **Extensions array** (defined outside the component to avoid re-creation on render):
  - `StarterKit.configure({ ... })` — enable bold, italic, bulletList, orderedList, listItem, link, history. Disable: strike, code, codeBlock, heading, horizontalRule, blockquote.
  - `TextAlign.configure({ types: ["paragraph", "tableCell", "tableHeader"] })`
  - `Table.configure({ resizable: false })` — resizable tables add complexity with no benefit in email
  - `TableRow`, `TableCell`, `TableHeader`
  - `Emoji` — emoji autocomplete via `:` shortcode (all Unicode 14.1 emojis included). Emojis render as unicode characters in `getHTML()` output; the inline `<span>` wrapper is stripped by backend bleach.
  - `LinkBubbleMenuHandler`
  - `CharacterCount.configure({ limit: 5000 })`

- **Toolbar** (`renderControls`):
  - Row 1: `MenuButtonBold`, `MenuButtonItalic`, separator, `MenuButtonBulletList`, `MenuButtonOrderedList`, separator, `MenuButtonAlignLeft`, `MenuButtonAlignCenter`, `MenuButtonAlignRight`, separator, `MenuButtonEditLink`, emoji button
  - Row 2 (or overflow): Table controls — `MenuButtonAddTable`, `MenuButtonDeleteTable`, add/delete column, add/delete row

- **Modal size**: Change `maxWidth="sm"` to `maxWidth="lg"` in the `GenericDialog` props.

- **Content state**: Use `useState<string>` for the HTML content. Initialize to `""`. The `onUpdate` callback sets state to `editor.getHTML()`, normalizing `<p></p>` to `""` (same as CheckboxFieldEditor).

- **Validation**: Strip HTML tags before checking emptiness:
  ```ts
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").trim();
  if (!stripHtml(message)) newErrors.message = texts.email_message_required;
  ```

### Backend: Expanded sanitization

In `SendOrganizerEmailView.post()`, after serializer validation, sanitize the message:

```python
from climateconnect_api.utility.html import sanitize_html

ORGANIZER_EMAIL_ALLOWED_TAGS = [
    "p", "strong", "b", "em", "i", "a", "br",
    "ul", "ol", "li",
    "table", "thead", "tbody", "tr", "th", "td",
]

ORGANIZER_EMAIL_ALLOWED_ATTRIBUTES = {
    "a": ["href", "target"],
    "p": ["style"],
    "td": ["style", "colspan", "rowspan"],
    "th": ["style", "colspan", "rowspan"],
}

message = sanitize_html(
    serializer.validated_data["message"],
    allowed_tags=ORGANIZER_EMAIL_ALLOWED_TAGS,
    allowed_attributes=ORGANIZER_EMAIL_ALLOWED_ATTRIBUTES,
)
```

### Backend: Style attribute filtering

Add a post-processing step to `sanitize_html()` (or a separate helper) that filters `style` attributes:

- Regex match `style="..."` on all tags
- Parse the CSS declarations
- Keep only `text-align` declarations where the value is one of `left`, `center`, `right`, `justify`
- Strip all other CSS properties
- If no valid declarations remain, remove the `style` attribute entirely

This is analogous to the existing `_force_rel` post-processing for `<a>` tags.

### Backend: Serializer max_length

Add `max_length` to `SendOrganizerEmailSerializer.message` to prevent abuse. Since the field now contains HTML markup, the limit should accommodate the tag overhead. A limit of **30000 characters** for the raw HTML is generous enough for 5000 visible characters with formatting markup.

### Mailjet template change (manual)

In the Mailjet dashboard, for both EN and DE versions of the `EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID` template:

1. Find the section where `{{OrganizerMessage}}` is used
2. Change it to `{{{OrganizerMessage}}}` (triple-brace)
3. Verify the surrounding HTML structure still works (the message content is now rendered as HTML, so it should be placed inside a container that allows block-level elements)

Reference: The `{{{FieldAnswersHtml}}}` variable in the registration confirmation template uses the same triple-brace pattern.

### Doc update

Update [`doc/environment-variables.md`](doc/environment-variables.md) line 298:

```
| `OrganizerMessage` | HTML body entered by the organiser (sanitised; rendered with triple-brace in Mailjet template) |
```

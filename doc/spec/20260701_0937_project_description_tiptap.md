# Project Description: Tiptap Rich-Text Editor with YouTube Embeds

**Date**: 2026-07-01
**Status**: DRAFT — Phases 1–4 implemented; Phase 5 (cleanup) and AC-12–15 (additional cleanup) remain
**Type**: Backend + Frontend — migration / feature upgrade
**Depends on**: Existing TipTap setup for event registration (`@tiptap/starter-kit`, `@tiptap/extension-character-count`, `mui-tiptap` already installed). See `doc/spec/20260623_0942_add_text_field_event_registration.md` for the TipTap wiring precedent.

---

## Problem Statement

The project description field is currently a **plain-text `<TextField multiline rows={9}>`** in both the create and edit flows. It is rendered on the project page by `MessageContent.tsx`, which applies a custom inline pipeline:

- YouTube URLs are detected per line via `youtube-regex`; the **first** YouTube URL on a line becomes an embedded iframe via `react-youtube` (host `youtube-nocookie.com`, autoplay=0, max-width 640px). All other YouTube URLs stay as linkified text.
- Mentions use the legacy `@@@__<id>__^^__<display>__@@@^^^` markup produced by `react-mentions`; on display they become `<a href="/profiles/{id}">@{display}</a>` links.
- Bare URLs and emails are autolinked by `react-linkify`.
- Long descriptions are collapsed at 500 characters via JS string slicing (fragile: can split mid-tag).

The pipeline has three concrete problems:

1. **YouTube is capped to one embed per description.** `MessageContent` coerces the `renderYoutubeVideos` boolean to `1`, so only the first YouTube line becomes an embed — every subsequent URL is just linkified text. Users who want to share multiple videos must drop URLs as plain text and hope they get noticed.
2. **No rich-text formatting.** No bold, italic, lists, links, or structure. Long descriptions become unreadable walls of text. The TipTap-based checkbox field and organiser email already proved users want formatting.
3. **The mention feature is dead.** 0 mentions in the database (queried 2026-07-01: `description LIKE '%@@@____%__^^____%__@@@^^^%'` → 0 rows). The pipeline still parses mentions on every render, and the dependency on `react-mentions` is still pulled in. We can drop it.

### Why it matters

- **Parity with registration fields**: Event registration fields and organiser emails already use TipTap. The description is the most prominent text on a project page — it should have the same authoring experience.
- **Drop legacy rendering code**: `MessageContent` is only used for project descriptions, hub quick-info, project short descriptions, posts, chat messages, account details, and FAQ sections. Of these, only the project description is a multi-line rich-text field; the rest are short or single-line. We can replace just the description path.
- **Future-proofing**: The Tiptap editor accepts pasted content (Google Docs, Word) and offers a stable migration path when we want to add mentions, images, or other nodes later.

### Current state

- `project.description` is a `TextField(max_length=4800)` on `Project`.
- Created in `create_new_project()` (`backend/organization/utility/project.py`).
- Edited via PATCH in `project_views.py` (`pass_through_params`).
- Translations stored on `ProjectTranslation.description_translation` and auto-translated via DeepL (`backend/climateconnect_api/utility/translation.py`).
- Rendered on the project page via `MessageContent` → split on `\n` → YouTube detection → mention parsing → linkify → JS string truncation.
- 112 projects have a YouTube URL in their description; 1347 have neither a YouTube URL nor mentions; 0 have mentions.

---

## Goal

Replace the plain-text description input with a TipTap rich-text editor, render the resulting HTML directly on the project page, and drop the legacy `MessageContent` description pipeline. YouTube videos are embedded via the Tiptap YouTube extension (no more one-per-description cap). Translations of the description continue to be auto-generated via DeepL using `tag_handling=html`.

---

## Scope

### In scope

1. **Backend model + migration** — add `description_html` to `Project` and `description_html_translation` to `ProjectTranslation`.
2. **Backend serializers** — `ProjectSerializer.get_description` and `EditProjectSerializer.get_description` read from `description_html` (with translation fallback).
3. **Backend views** — create / edit flows accept `description_html` and persist it.
4. **Backend validation** — `max_chars["description_html"]` enforced; the existing `description` field validation is kept for the legacy field.
5. **Backend DeepL integration** — `translate()` sends `tag_handling=html` when translating `description_html`, so HTML markup (including YouTube iframe tags) is preserved while text content is translated.
6. **Backend HTML sanitization** — extend `sanitize_html()` to allow the TipTap YouTube output (`<div data-youtube-video>`, `<iframe>`) and a small extra set of tags (italics, lists, blockquote).
7. **Backend management command** — `migrate_descriptions_to_tiptap` converts the 112 projects with YouTube URLs (and all other projects with non-empty legacy descriptions) to Tiptap-compatible HTML.
8. **Frontend create flow** — `EnterDetails.tsx` replaces the `<TextField multiline>` for description with a new `ProjectDescriptionEditor` component.
9. **Frontend edit flow** — `EditProjectContent.tsx` replaces the `<TextField multiline>` with the same `ProjectDescriptionEditor`.
10. **Frontend translation flow** — `TranslateProject` and `TranslateTexts` pass the HTML through, with the same character counter on translated fields.
11. **Frontend display** — `ProjectContent.tsx` renders `description_html` directly with a CSS `line-clamp` for collapse/expand; `MessageContent` is no longer used for project descriptions.
12. **Frontend YouTube extension** — `@tiptap/extension-youtube` added as a dependency; the editor allows multiple YouTube embeds per description.
13. **Frontend character counter** — same pattern as `CheckboxFieldEditor.tsx` and `OrganizerMessageEditor.tsx` (`CharacterCount` extension + footer counter).
14. **Frontend tests** — for the new `ProjectDescriptionEditor` and updated display logic.

### Out of scope

- Mentions (0 in DB; can be reintroduced later as a separate Tiptap extension).
- Images / file uploads.
- Tables, text alignment, emoji, headings — not needed for descriptions; the registration checkbox field and organiser email already demonstrate the more advanced editor patterns if/when those are needed.
- Removing the old `description` column (kept for backwards compatibility and for the migrations to read from).
- Adding YouTube embedding to other fields (short_description, post content, chat messages).

---

## System Impact

### Actors Involved

- **Backend Developer**: Model + migration + serializers + DeepL + sanitize_html + management command + tests.
- **Frontend Developer**: `ProjectDescriptionEditor` component + create/edit integration + translation integration + display change + tests.

### Entities Changed

| Layer | File | Change |
|-------|------|--------|
| Backend model | `backend/organization/models/project.py` | Add `description_html = TextField(blank=True, null=True)` |
| Backend model | `backend/organization/models/translations.py` | Add `description_html_translation = TextField(blank=True, null=True)` |
| Backend migration | new | Add the two columns above |
| Backend utility | `backend/organization/utility/project.py` | `create_new_project` sets `description_html` from `data["description_html"]`; `get_project_description` returns `description_html` / `description_html_translation` |
| Backend serializer | `backend/organization/serializers/project.py` | `ProjectSerializer.get_description` and `EditProjectSerializer.get_description` read from `description_html`; serializer validates `description_html` length |
| Backend view | `backend/organization/views/project_views.py` | PATCH `pass_through_params` includes `description_html`; `items_to_translate` includes the new key |
| Backend utility | `backend/climateconnect_api/utility/translation.py` | `translate()` accepts `is_html=True` and adds `tag_handling=html` to the DeepL payload; `translate_text` threads through the flag |
| Backend utility | `backend/climateconnect_api/utility/html.py` | `sanitize_html` extended with an allowlist for project descriptions: `<p>`, `<strong>`, `<b>`, `<em>`, `<i>`, `<u>`, `<a>`, `<br>`, `<ul>`, `<ol>`, `<li>`, `<blockquote>`, `<div data-youtube-video>`, `<iframe>` (with a tight allowlist of `src` to `youtube-nocookie.com/embed/`, `width`, `height`, `allowfullscreen`, `frameborder`, `title`) |
| Backend command | new `backend/organization/management/commands/migrate_descriptions_to_tiptap.py` | Convert existing `description` to `description_html` |
| Backend tests | new `backend/organization/tests/test_project_description_tiptap.py` | Cover serializer, view, translation, sanitize_html allowlist |
| Frontend dep | `frontend/package.json` | Add `@tiptap/extension-youtube` |
| Frontend component (new) | `frontend/src/components/editProject/ProjectDescriptionEditor.tsx` | New Tiptap editor wrapper with character counter |
| Frontend component | `frontend/src/components/shareProject/EnterDetails.tsx` | Replace `<TextField multiline>` for description with `<ProjectDescriptionEditor>` |
| Frontend component | `frontend/src/components/editProject/EditProjectContent.tsx` | Same replacement |
| Frontend component | `frontend/src/components/shareProject/TranslateProject.tsx` | Send `description_html` instead of `description`; render via Tiptap editor in translation UI |
| Frontend component | `frontend/src/components/general/TranslateTexts.tsx` | `TranslationBlockElement` for `description` switches to the rich-text editor (or accept `as="richText"` mode) |
| Frontend component | `frontend/src/components/project/ProjectContent.tsx` | Render `description_html` directly (via `dangerouslySetInnerHTML` after sanitization, or via a read-only Tiptap instance); replace JS truncation with CSS `line-clamp` |
| Frontend component | `frontend/src/components/project/ProjectOverview.tsx` | `short_description` is unchanged (still plain text) — no change |
| Frontend types | `frontend/src/types.ts` | `Project.description_html?: string`; `ProjectTranslation.description_html_translation?: string` |
| Frontend i18n | `frontend/public/texts/project_texts.tsx` | Add English + German text keys (see AC-3.5) |
| Frontend tests | `frontend/src/components/editProject/ProjectDescriptionEditor.test.tsx` (new) | Renders, updates, char counter, YouTube insertion |
| Frontend tests | `frontend/src/components/project/ProjectContent.test.tsx` (new) | Renders description_html with/without YouTube; clamp toggle |

### Flows not affected

- `short_description` is a single-line plain-text field with a 280-char limit and a character counter. It is **not** part of this spec.
- `MessageContent.tsx` stays in use for: posts, chat messages, hub quick-info, account details, FAQ answers. None of these are multi-paragraph rich-text fields.
- Event registration fields and organiser email editor — no change.
- The legacy `description` column is kept on the model (read-only) so the data migration command can be re-run if needed. New code does not write to it.
- Project model `helpful_connections`, `is_draft`, `collaborators_welcome` etc. — no change.

---

## Acceptance Criteria

### AC-1: Backend model + migration

**AC-1.1** `Project.description_html = models.TextField(blank=True, null=True)` is added. No max_length constraint on this field (HTML markup inflates the size; we'll validate byte length in the serializer instead).

**AC-1.2** `ProjectTranslation.description_html_translation = models.TextField(blank=True, null=True)` is added.

**AC-1.3** A migration adds both columns. The old `description` and `description_translation` columns stay intact.

**AC-1.4** No data is backfilled by the migration itself — the data migration is handled by the management command in AC-6.

### AC-2: Backend serializers, views, and validation

**AC-2.1** `ProjectSerializer.get_description` returns `obj.description_html` if the requested language matches `obj.language.language_code`, otherwise `obj.description_html_translation`. Returns `null` / empty string if neither is set.

**AC-2.2** `EditProjectSerializer.get_description` returns `obj.description_html` (or `null` if empty).

**AC-2.3** `get_project_description(project, language_code)` in `backend/organization/utility/project.py` follows the same translation-fallback chain.

**AC-2.4** `create_new_project` sets `project.description_html = data["description_html"]` when present. The legacy `description` field is not written to by the new code.

**AC-2.5** The PATCH view's `pass_through_params` list includes `"description_html"`. `setattr(project, "description_html", request.data["description_html"])` saves it.

**AC-2.6** A new `description_html` key is added to `items_to_translate` so `description_html_translation` is auto-translated on edit:

```python
{"key": "description_html", "translation_key": "description_html_translation"}
```

**AC-2.7** Create-flow translations (line ~550 in `project_views.py`) set `translation.description_html_translation = texts["description_html"]` when present.

**AC-2.8** `max_chars` validation for `description_html` enforces **two limits**:

1. **20000 characters** on the raw HTML string (the full `<p>…</p>`, `<ul><li>…</li></ul>`, `<div data-youtube-video>…</div>` markup). This is a hard cap — the database column can accommodate this without issue. Implemented as `len(value) <= 20000`.
2. **4000 characters** on the **stripped** HTML (text content only, HTML tags removed). Implemented as `len(stripHtml(value)) <= 4000` where `stripHtml` is a small helper that removes all HTML tags (regex `re.sub(r'<[^>]+>', '', value)`). The frontend Tiptap `CharacterCount` already counts text content (not markup), so this matches the user-facing counter exactly (see AC-6.3).

The 4000-char stripped limit matches the legacy frontend cap (`EnterDetails.tsx:235`, `EditProjectContent.tsx:335`) so users see the same limit they're used to. The 20000-char full-HTML cap is generous enough to accommodate the markup overhead.

**AC-2.9** The 4000-char **stripped** limit is **not** applied to `description_html_translation` on the auto-translation path. DeepL may return a German translation that exceeds 4000 characters of text content (German is typically 1.2–1.3× longer than English). The auto-translated HTML is saved as-is. If the user later opens the translation in the editor, they may see a red character counter — this is a known corner case (a maxed-out English description that gets auto-translated) and the user can trim the translation manually. The 20000-char full-HTML cap is still enforced for translations (database constraint). The existing `max_chars["description"]: 4800` cap on the legacy field stays unchanged (only used for the legacy create/edit path; new code does not write to it).

**Note on the legacy limit**: The current codebase has two inconsistent limits on the legacy `description` field — the frontend `substring(0, 4000)` cap in `EnterDetails.tsx:245` and `EditProjectContent.tsx:335`, and the backend `max_length=4800` on the model and `max_chars["description"]: 4800` in `project_views.py:468`. The new `description_html` field uses **4000 stripped characters** (matching the legacy frontend cap, which is the more user-visible of the two) / **20000 full-HTML characters** (database-friendly upper bound).

### AC-3: Backend DeepL HTML translation

**AC-3.1** `translate(text, target_lang, is_html=False)` adds `payload["tag_handling"] = "html"` when `is_html` is True. The function signature is backward-compatible: existing callers (no `is_html` argument) behave exactly as today.

**AC-3.2** `translate_text(text, original_lang, target_lang, is_html=False)` accepts and forwards the flag.

**AC-3.3** `get_translations()` and the two call sites that handle `description_html` (the `if key == "description_html"` branch in `edit_translations` / `edit_translation` and the create-translations block in `project_views.py`) call `translate_text(..., is_html=True)` for that key only.

**AC-3.4** Manual / automated verification:
- Send `<p>Hello <strong>world</strong>.</p>` to DeepL with `tag_handling=html` → output is `<p>Hallo <strong>Welt</strong>.</p>` (or German equivalent), with the same tag structure.
- Send `<div data-youtube-video=""><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"></iframe></div>` → output preserves both tags verbatim (no translatable text inside).
- A translated description renders identically to the source, with text content swapped.

**AC-3.5** When `DEEPL_API_KEY` is not set, the function returns the original HTML unchanged (no error). Same behaviour as the current implementation.

### AC-4: Backend HTML sanitization

**AC-4.1** `sanitize_html()` in `backend/climateconnect_api/utility/html.py` grows a new `PROJECT_DESCRIPTION` tag/attribute allowlist:

- Tags: `p`, `strong`, `b`, `em`, `i`, `u`, `a`, `br`, `ul`, `ol`, `li`, `blockquote`, `div`, `iframe`.
- Attributes:
  - `a`: `href`, `target`, `rel` (the function already forces `rel="noopener noreferrer"`).
  - `div`: `data-youtube-video` (used by the Tiptap YouTube extension as a wrapper marker).
  - `iframe`: `src`, `width`, `height`, `allowfullscreen`, `frameborder`, `title`.
- `src` on `<iframe>` is **restricted by a regex** to `^https://www\.youtube-nocookie\.com/embed/[\w-]+(\?.*)?$` — this prevents embedding arbitrary iframes. Implement as a small post-bleach filter: if an `<iframe src>` doesn't match, drop the entire `<iframe>` element.
- The default allowlist used by the description serializer is `PROJECT_DESCRIPTION`, **not** the existing checkbox-default allowlist.

**AC-4.2** `_strip_dangerous_tags` is updated to **not** strip `<iframe>` (currently it does). Instead, the post-bleach regex in AC-4.1 handles it. Other dangerous tags (`<script>`, `<object>`, `<embed>`, `<style>`) continue to be stripped.

**AC-4.3** The existing checkbox description sanitizer is unchanged — the new allowlist is opt-in.

**AC-4.4** The PATCH view calls `sanitize_html(request.data["description_html"], allowed_tags=PROJECT_DESCRIPTION_TAGS, allowed_attributes=PROJECT_DESCRIPTION_ATTRS)` before saving. The create flow does the same.

**AC-4.5** `is_manual_translation=True` translations skip sanitization (the human typed them; bleach would just mangle their intent) — but a follow-up server-side review of stored HTML is the user's responsibility. Document this in a code comment.

### AC-5: Backend management command — data migration

**AC-5.1** New command: `backend/organization/management/commands/migrate_descriptions_to_tiptap.py`.

**AC-5.2** Behaviour: for every `Project` with non-empty `description` and empty `description_html`, call `legacy_description_to_tiptap_html(description)` and save the result. Uses `update_fields=["description_html"]` in batches to avoid loading the full queryset into memory.

**AC-5.3** `legacy_description_to_tiptap_html(text)` is implemented in `backend/organization/utility/legacy_description_to_tiptap.py` and follows the conversion rules in `doc/private-for-agents/description-to-tiptap-migration.md`:

1. Split on `\n`. Empty lines become a paragraph break.
2. A line containing a YouTube URL → extract the video id, emit `<div data-youtube-video=""><iframe src="https://www.youtube-nocookie.com/embed/<id>" width="640" height="480" allowfullscreen="true"></iframe></div>`. Any other text on the same line is wrapped in a separate `<p>`.
3. Non-YouTube lines → wrap in `<p>…</p>`, autolinking bare URLs and emails to `<a target="_blank" rel="noopener noreferrer">URL</a>`. The URL itself is the link text.
4. Uses the YouTube regex from `@tiptap/extension-youtube` (translated to Python): `^((?:https?:)?//)?((?:www|m|music)\.)?(?:youtube\.com|youtu\.be|youtube-nocookie\.com)(?:/(?:[\w-]+\?v=|embed/|v/)?|/)([\w-]+)(\S+)?$`.

**AC-5.4** Supports `--dry-run` and `--batch-size` flags. `--dry-run` prints a sample of 3 before/after pairs and the count to be migrated, without saving.

**AC-5.5** Idempotent: re-running the command on a fully-migrated DB is a no-op (filters on `description_html__isnull=True`).

**AC-5.6** Logs `info("Migrated N descriptions")` at the end.

**AC-5.7** Backend tests cover the conversion function:
- Plain text → single `<p>…</p>`.
- Multi-paragraph text → multiple `<p>…</p>`.
- Single YouTube URL on its own line → `<div data-youtube-video>…</div>`.
- YouTube URL mixed with text → `<p>` for the text + `<div data-youtube-video>` for the embed.
- Multiple YouTube URLs on different lines → multiple `<div data-youtube-video>`.
- Bare URL on its own → `<a href="…">URL</a>`.
- Email address → `<a href="mailto:…">email</a>`.
- Empty / null input → empty output.

### AC-6: Frontend Tiptap editor component

**AC-6.1** New file: `frontend/src/components/editProject/ProjectDescriptionEditor.tsx`. Mirrors the structure of `CheckboxFieldEditor.tsx` and `OrganizerMessageEditor.tsx`.

**AC-6.2** Extensions used (defined outside the component to avoid re-creation per render):

```ts
import { Youtube } from "@tiptap/extension-youtube";

const EXTENSIONS: Extensions = [
  StarterKit.configure({
    strike: false,
    code: false,
    codeBlock: false,
    heading: false,
    horizontalRule: false,
    blockquote: false,
    bulletList: true,
    orderedList: true,
    listItem: true,
    link: {
      openOnClick: false,
      HTMLAttributes: { rel: "noopener noreferrer" },
    },
  }),
  Youtube.configure({
    controls: true,
    nocookie: true,  // matches existing Climate Connect preference
    modestBranding: true,
  }),
  LinkBubbleMenuHandler,
  CharacterCount.configure({ limit: CHARACTER_LIMIT }),
];
```

**AC-6.3** `CHARACTER_LIMIT = 4000` — the soft limit for the new `description_html` field, matching the legacy frontend cap (`EnterDetails.tsx:235`, `EditProjectContent.tsx:335`). The Tiptap `CharacterCount` extension counts text content (not HTML markup), so `<p>Hello <strong>world</strong></p>` counts as 11 characters. The counter shows `n / 4000` and turns red on overflow. This is a soft warning — the user can still type past the limit, but the backend `max_chars["description_html"]` validation (see AC-2.8) enforces both a 4000 stripped-char limit and a 20000 full-HTML-char hard cap.

**AC-6.4** Toolbar (`renderControls`) contains only basic formatting:
- `MenuButtonBold`
- `MenuButtonItalic`
- `MenuButtonBulletedList`
- `MenuButtonOrderedList`
- `MenuButtonEditLink`
- a custom `MenuButtonAddYoutube` that calls `editor.commands.setYoutubeVideo({ src: ... })` after prompting the user for a URL (or via a simple modal — see AC-6.5).

Bullet and ordered lists are useful for project descriptions (agendas, goals, steps, checklists). Toolbar button tooltips use mui-tiptap's built-in English labels (no custom i18n key needed; matches the pattern in `CheckboxFieldEditor.tsx`).

No headings, no tables, no emoji. These can be added later if/when needed.

No headings, no tables, no emoji, no ordered lists. These can be added later if/when needed.

**AC-6.5** The YouTube insertion flow:
- Click the toolbar button → small modal with a single `<TextField>` for the URL.
- On submit, validate against the same regex as the backend (the Tiptap extension's `isValidYoutubeUrl`); if invalid, show an error and keep the modal open.
- On valid URL, call `editor.commands.setYoutubeVideo({ src: url })` and close the modal.

**AC-6.6** `onUpdate` calls `onChange(editor.getHTML() === "<p></p>" ? "" : editor.getHTML())`. The HTML is sent to the backend as `description_html`.

**AC-6.7** `onCreate` and `onUpdate` both update an internal `charCount` state via `editor.storage.characterCount.characters()`.

**AC-6.8** A `useEffect` syncs external `descriptionHtml` changes into the editor (only when `!editor.isFocused`), matching the pattern in `CheckboxFieldEditor.tsx` (line 77).

**AC-6.9** `Props` shape:

```ts
type Props = {
  descriptionHtml: string;
  onChange: (_html: string) => void;
  disabled?: boolean;
  error?: string;
};
```

The component reads from `descriptionHtml` and emits via `onChange`.

### AC-7: Frontend create flow

**AC-7.1** `EnterDetails.tsx` (line 335) replaces the `<TextField multiline rows={9}>` for description with `<ProjectDescriptionEditor descriptionHtml={projectData.description_html ?? ""} onChange={(html) => onProjectFieldChange("description_html", html)} error={errors?.description_html} />`. The `errors` prop is read from the existing form error state.

**AC-7.2** `onProjectFieldChange(key, value)` is the existing setter pattern (mirroring `onTextChange` for the short_description). Add `"description_html"` to the allowed keys.

**AC-7.3** `formatProjectForRequest` (or equivalent pre-submit handler) sends `description_html` in the POST body. The legacy `description` field is no longer sent.

**AC-7.4** Required-field validation: a project is not publishable without a description. The existing `validate` in the create flow is updated to check `description_html?.trim()` (treating empty HTML like empty text).

**AC-7.5** Manual: an organiser creates a project, types "Hello **world**.", inserts a YouTube URL, saves, and the project is stored with the HTML description. The same project can be re-opened for editing and the formatting is preserved.

### AC-8: Frontend edit flow

**AC-8.1** `EditProjectContent.tsx` (line 328) replaces the `<TextField multiline rows={9}>` for description with the same `<ProjectDescriptionEditor>`. The `handleChangeProject(value, "description")` call is replaced with `handleChangeProject(html, "description_html")`. The `helperText` (currently `"describe_your_project_in_detail_please_only_use_english"`) stays; consider adding `"english_only"` clarification if the translation system still auto-translates.

**AC-8.2** `EditProjectRoot.tsx`'s `textsToTranslate` array (line 362) updates the `description` entry:

```ts
{
  textKey: "description",
  dataKey: "description_html",  // <- send/receive HTML
  rows: 15,
  headlineTextKey: "project_description",
}
```

The `dataKey` change is the key wiring: the translation block in `TranslateProject` reads from `project.description_html` and emits `description_html` per language.

**AC-8.3** The edit flow's `formatProjectForRequest` (if it exists) sends both `description` and `description_html` (same logic as AC-7.3).

**AC-8.4** Manual: an existing project that has been migrated can be opened in the editor; the stored `description_html` is loaded directly (it will already have the right `<p>` wrapping, YouTube embeds, and formatting). After the first edit, `onUpdate` produces new HTML.

### AC-9: Frontend translation flow

**AC-9.1** `TranslateProject.tsx` line 98 changes from `description: projectData.description` to `description_html: projectData.description_html`. The `textsToTranslate` entry for `description` is updated to point at `description_html` (and `dataKey: "description_html"`).

**AC-9.2** `TranslateTexts.tsx`'s `TranslationBlockElement` adds an `as` prop (`"plain" | "richText"`). For `description`, the `as="richText"` variant renders `<ProjectDescriptionEditor>` (or a read-only Tiptap instance) instead of `<TextField multiline>`. The character counter and `showCharacterCounter` behaviour carry over.

**AC-9.3** For the source language, the editor is editable (so the user can refine the original). For the target language, the editor is read-only **unless** the user marks the translation as `is_manual_translation`; when manual, the editor is editable.

**AC-9.4** The translation editor uses the same Tiptap `CharacterCount` configuration as the source editor (limit 4000), but the counter is **display-only** for translations — it does not block input. This is because DeepL's auto-translation can produce German text that exceeds 4000 characters (German is typically 1.2–1.3× longer than English). If a user opens an auto-translated description that's already over 4000 characters, they see a red counter but can still edit; they may need to trim the translation to bring it under the limit. The 20000 full-HTML hard cap is always enforced (database constraint).

**AC-9.5** Manual: an organiser edits the German translation, marks it as manual, sees the same Tiptap editor with the YouTube embed and formatting preserved from the DeepL-translated HTML.

### AC-10: Frontend display

**AC-10.1** `ProjectContent.tsx` (line 322) replaces `<MessageContent content={project.description} renderYoutubeVideos={true} />` with a direct HTML render of `project.description_html`:

```tsx
{project.description_html ? (
  <div
    className={`${classes.projectDescription} ${showFullDescription ? "" : classes.descriptionClamped}`}
    dangerouslySetInnerHTML={{ __html: project.description_html }}
  />
) : (
  <Typography variant="body2">{getNoProjectDescriptionText()}</Typography>
)}
```

If `description_html` is null/empty, the existing "no description yet" placeholder is shown (same behaviour as today for projects without a description). No fallback to the legacy `description` field.

**AC-10.2** _(removed — no fallback path needed)_

**AC-10.3** The legacy truncation via `substr(0, 500) + "..."` is removed. Instead, a CSS class is applied. The `useStyles` block in `ProjectContent.tsx` grows two new rules:

```ts
projectDescription: {
  wordBreak: "break-word",
  "& ul, & ol": {
    paddingLeft: "1.5em",
    margin: "0.5em 0",
  },
},
descriptionClamped: {
  display: "-webkit-box",
  "-webkit-line-clamp": 6,
  "-webkit-box-orient": "vertical",
  overflow: "hidden",
},
```

Six lines is the equivalent of the old 500-char truncation for typical body text; adjust to taste. The "show more" / "show less" button toggles the class. This works correctly for HTML content (no mid-tag slicing) and with embedded iframes, links, and other elements.

**AC-10.4** YouTube iframes inside the description render directly via the browser's native `<iframe>` tag — no need for `react-youtube` on the display side. CSS caps the iframe width to 100% of the description container (max 640px to match the old `react-youtube` behaviour).

**AC-10.5** The `ProjectContentSideButtons` "share" / "like" / etc. buttons are unchanged. The `MessageContent` import is removed from `ProjectContent.tsx` (the component is no longer used for the description, but stays in use for posts, chat, hub quick-info, account details, FAQ — so the file is not deleted).

**AC-10.6** Manual: a project with three YouTube embeds in its description renders all three. The collapse/expand toggle works without breaking the iframes.

### AC-11: Frontend tests

**AC-11.1** New `ProjectDescriptionEditor.test.tsx`:
- Renders with empty content.
- Renders with HTML content (the `descriptionHtml` prop is loaded into the editor on mount).
- Typing bold formatting produces `<p><strong>…</strong></p>` in the `onChange` callback.
- Toggling the bullet list button produces `<ul><li>…</li></ul>` in the `onChange` callback.
- Toggling the ordered list button produces `<ol><li>…</li></ol>` in the `onChange` callback.
- The character counter updates on typing and turns red when `> 4000`.
- Clicking the YouTube button opens a modal; submitting a valid URL inserts an embed; submitting an invalid URL shows an error and keeps the modal open.

**AC-11.2** New `ProjectContent.test.tsx`:
- Renders `description_html` directly (no `MessageContent` involved).
- Renders the "no description yet" placeholder when `description_html` is null/empty.
- Toggling "show more" applies / removes the `descriptionClamped` class.
- A description containing `<div data-youtube-video>` renders the iframe.

**AC-11.3** Existing `EditProjectContent` and `EnterDetails` tests (if they exist) are updated to interact with the Tiptap editor instead of the plain `<TextField>`. If they don't exist, this AC is satisfied by AC-11.1 and the manual tests in AC-7/AC-8.

**AC-11.4** i18n: add the following keys to `frontend/public/texts/project_texts.tsx`:

| Key | English | German |
|-----|---------|--------|
| `project_description_youTube_button` | Insert YouTube video | YouTube-Video einfügen |
| `project_description_youTube_url_label` | YouTube URL | YouTube-URL |
| `project_description_youTube_url_invalid` | Please enter a valid YouTube URL. | Bitte gib eine gültige YouTube-URL ein. |
| `project_description_youTube_cancel` | Cancel | Abbrechen |
| `project_description_youTube_insert` | Insert | Einfügen |
| `project_description_character_counter` | characters | Zeichen |

---

## Constraints

- **Backend first (Phase 1)**: Add the model fields + serializers + sanitization + management command + tests. The frontend can be developed in parallel against a dev backend, but the production deploy order is backend → frontend.
- **HTML storage, not JSON**: Follow the analysis in `doc/private-for-agents/description-to-tiptap-migration.md`. The frontend always sends HTML; the backend stores it; the backend returns it; the frontend renders it directly or loads it into a Tiptap editor.
- **YouTube only via the extension**: No more inline-URL detection on the frontend display side. The Tiptap YouTube extension's `parseHTML` rule (`div[data-youtube-video] iframe`) is the only path for YouTube embeds.
- **`nocookie: true`**: The Tiptap YouTube extension is configured with `nocookie: true` to match the current Climate Connect preference (host `youtube-nocookie.com`).
- **Multiple YouTube embeds allowed**: The old 1-embed cap is lifted. The Tiptap YouTube extension places each embed as a separate block node.
- **Mentions are dropped**: No mention handling in the editor, the HTML, the migration, or the translation. The `react-mentions` npm dependency can be removed from `package.json` once `InputWithMentions.tsx` is also removed (out of scope here).
- **No write-through to legacy `description`**: The frontend only sends `description_html`. The backend only writes to `description_html`. The legacy `description` column stays on the model (read-only) so the data migration command can be re-run if needed, but is not maintained by the new code.
- **Two-tier character limit**: 4000 stripped characters (soft limit, matches the legacy frontend cap users are familiar with) and 20000 full-HTML characters (hard cap, database-friendly). The Tiptap `CharacterCount` extension naturally counts stripped characters (text content, not markup), so the frontend counter aligns with the backend `len(stripHtml(value)) <= 4000` check. The backend `len(value) <= 20000` check is the absolute upper bound.
- **Translations are allowed to exceed the 4000 stripped limit**: The 4000-char stripped limit and 20000-char full-HTML limit apply to the source language. Auto-translated `description_html_translation` is exempt from the 4000 stripped limit because German text is typically 1.2–1.3× longer than English. The 20000 full-HTML cap is always enforced (database constraint). If a user opens an over-4000-char translation in the editor, they see a red counter but can still edit — a known corner case.
- **Server-side sanitization is mandatory**: Even though Tiptap produces well-formed HTML, the server runs `sanitize_html` to guard against paste-injected content and direct API calls. The allowlist is tuned for the description field — the checkbox description sanitizer is unchanged.
- **DeepL `tag_handling=html`**: Use the official DeepL HTML handling. Don't roll our own regex-based tag extraction.
- **i18n**: English + German translations for all new user-visible strings.
- **CSS `line-clamp` for truncation**: No more JS string slicing on HTML.
- **Migration is a one-time prerequisite**: The data migration command must run before the frontend ships, so that all 1459 existing projects have `description_html` populated. The frontend assumes `description_html` is always present for projects that had a description.

---

## Domain Context

### Existing Tiptap wiring in the codebase

- `@tiptap/starter-kit` 3.26.0, `@tiptap/extension-character-count` 3.26.0, `@tiptap/extension-link` (via StarterKit), `@tiptap/extension-text-align`, `@tiptap/extension-table`, `@tiptap/extension-emoji`, `@tiptap/extension-heading`, `@tiptap/extension-image`, `mui-tiptap` 1.30.0 are all installed.
- `CheckboxFieldEditor.tsx` and `OrganizerMessageEditor.tsx` are the existing rich-text editors. Both use `RichTextEditor` from `mui-tiptap`, both have a footer character counter, both use `LinkBubbleMenuHandler` + `LinkBubbleMenu` for inline link editing.
- The character count pattern is identical: `editor.storage.characterCount.characters()` on `onCreate` and `onUpdate`; `CharacterCount.configure({ limit: CHARACTER_LIMIT })` for the soft cap.
- `@tiptap/extension-youtube` is **not** yet installed — needs to be added.

### Legacy YouTube detection (current behaviour)

`MessageContent.tsx` line 52–83:
- Splits the description on `\n`.
- Filters lines that contain a YouTube URL via `youtubeRegex()` (matches `youtube.com/watch?v=…`, `youtu.be/…`, `youtube.com/embed/…`, `youtube-nocookie.com/embed/…`).
- For the first such line only (due to a `boolean` → `1` coercion in the filter), extracts the video id via `YouTubeGetID()` and renders a `react-youtube` player with `host: "https://www.youtube-nocookie.com"`, autoplay=0, width 100%, max-width 640px.
- All other YouTube lines stay as linkified text.

After this spec, `MessageContent` no longer handles project descriptions. The same YouTube URL extraction logic now lives in:
- The frontend Tiptap YouTube extension (when the user clicks the toolbar button).
- The backend migration command (one-time, for the 112 existing projects).

### Legacy sanitization allowlist

`sanitize_html()` defaults: `["p", "strong", "b", "a", "br"]` with attributes `{"a": ["href", "target"]}`. This is the **checkbox description** allowlist. The project description needs more (italics, lists, blockquote, div, iframe) — see AC-4.1.

### Translation chain

```
Project.description (legacy, plain text)
  → translate_text() → ProjectTranslation.description_translation

Project.description_html (new, HTML)
  → translate_text(is_html=True) → ProjectTranslation.description_html_translation
```

The DeepL payload differs: `description_html` adds `tag_handling=html`. DeepL preserves the HTML structure and only translates the text content.

### Read path on the project page

```
GET /api/projects/{slug}/
  → ProjectSerializer.get_description(language)
  → returns obj.description_html_translation or obj.description_html
Frontend:
  → <div dangerouslySetInnerHTML={{ __html: project.description_html }} />
  → CSS line-clamp for collapse/expand
```

### Migration order

1. Backend: add columns, run schema migration. (No data loss — new columns are nullable.)
2. Backend: deploy the serializer / view / sanitization / DeepL changes.
3. Backend: run `migrate_descriptions_to_tiptap` to convert the 112 existing descriptions.
4. Frontend: deploy the new `ProjectDescriptionEditor` and the display change. The display-side fallback handles any project that somehow has `description_html=null` (shouldn't happen after step 3, but it's a safety net).
5. Cleanup (follow-up PR): remove the legacy `description` column and the `description` field on the serializer, remove `MessageContent` from `ProjectContent.tsx`, remove the `react-mentions` dependency.

---

## Open Questions

| # | Question | Default resolution |
|---|----------|---------------------|
| 1 | Should the description be required for non-draft projects? | **Yes** — current behaviour. Empty HTML (`""` or `"<p></p>"`) is treated as missing. The create / edit forms surface an error. |
| 2 | What's the character limit for the source language? | **4000 stripped characters** (soft limit, matches the legacy frontend cap) / **20000 full-HTML characters** (hard cap, database-friendly). The Tiptap `CharacterCount` extension counts stripped characters (text content, not markup), so the frontend counter aligns with `len(stripHtml(value)) <= 4000` on the backend. This replaces the legacy 4000-char frontend cap and 4800-char backend cap, which were inconsistent. |
| 3 | Should translations be allowed to exceed the source character limit? | **Yes** — German text is typically 1.2–1.3× longer than English. A 4000-character English description can become ~5000+ characters in German. The translation editor still shows a counter (for reference) but does not block input. The 20000 full-HTML cap is always enforced. If a user opens an over-4000-char translation, they see a red counter — a known corner case the user can fix manually. |
| 4 | Should we auto-translate the description? | **Yes** — keep the existing DeepL flow. Use `tag_handling=html` so HTML is preserved. |
| 5 | Should the YouTube button support playlists (`?list=…`)? | **Yes** — the Tiptap extension handles them via `getEmbedUrlFromYoutubeUrl`. We don't need to special-case them. |
| 6 | Should the editor support image insertion? | **No** — out of scope. Can be added later as a separate extension. |
| 7 | Should we keep the legacy `description` column after migration? | **Yes**, on the model (read-only) so the data migration command can be re-run if needed. New code does not write to it. A follow-up cleanup PR can drop the column once the migration is confirmed stable. |
| 8 | Six lines for `line-clamp` — is that the right number? | **Yes**, a reasonable default. Adjust in a follow-up if the team wants more/fewer. |
| 9 | Does the YouTube button work on mobile? | **Yes** — the modal is MUI-based and responsive. |

---

## Implementation Notes

### Phasing

- **Phase 1 — Backend foundation**: model + migration + serializers + sanitization allowlist + DeepL flag + management command + tests. Backend-only PR. After this PR, the API can accept and return `description_html`, but no frontend is using it yet. ✅ **Implemented** (including AC-15: `create_new_project` now writes to `description_html` only).
- **Phase 2 — Frontend editor + display**: `ProjectDescriptionEditor` + `EnterDetails` + `EditProjectContent` + `ProjectContent` display + tests. After this PR, end-to-end editing and viewing works against a backend that has `description_html` populated. ✅ **Implemented**.
- **Phase 3 — Translation integration**: `TranslateProject` + `TranslateTexts` rich-text mode. After this PR, the full description lifecycle (create / edit / auto-translate / manual-translate) works. ✅ **Implemented**.
- **Phase 4 — Data migration**: Run `migrate_descriptions_to_tiptap` in production. Spot-check 5–10 projects. Monitor for any 500s. ✅ **Implemented**.
- **Phase 5 — Cleanup (follow-up)**: Remaining stale references to the legacy `description` column. See "Additional cleanup: remaining references to legacy `description`" (AC-12–15) below. This phase also covers removing the legacy `description` column, the `MessageContent` import, and the `react-mentions` dependency. **Remaining work**.

### Phase 1 — backend, key code paths

- **Models**: one new field per model (see AC-1).
- **Migration**: standard `makemigrations` output, no data migration step.
- **`sanitize_html` extension** (`backend/climateconnect_api/utility/html.py`):
  - Add a new module-level constant `PROJECT_DESCRIPTION_ALLOWED_TAGS` and `PROJECT_DESCRIPTION_ALLOWED_ATTRIBUTES` (matching AC-4.1).
  - Add a post-bleach filter that validates `<iframe src>` against the YouTube regex; if it doesn't match, drop the iframe (and its wrapper `<div>`).
  - Keep the existing `_strip_dangerous_tags` but exclude `<iframe>` from the regex (move it into a separate post-bleach step that only keeps YouTube-embed iframes).
- **`translate()` extension**: add `is_html` parameter and `tag_handling=html` in the payload. Thread it through `translate_text` and the two callers.
- **`create_new_project`**: set `description_html` from `data["description_html"]`. Do not write to the legacy `description` field (no write-through; the legacy column stays read-only on the model so the data migration command can be re-run if needed).
- **`get_project_description`**: read from `description_html` / `description_html_translation`. Returns `null` / empty string if neither is set.
- **PATCH view**: add `"description_html"` to `pass_through_params`; sanitize before saving.
- **`items_to_translate`**: add the new entry.
- **Management command**: implement `legacy_description_to_tiptap_html` per AC-5.3.

### Phase 2 — frontend editor + display

- **`ProjectDescriptionEditor.tsx`**: mirror `CheckboxFieldEditor.tsx`'s structure. Add a YouTube button + small modal for URL input.
- **`EnterDetails.tsx`**: replace the `<TextField multiline>` block.
- **`EditProjectContent.tsx`**: same replacement.
- **`ProjectContent.tsx`**: switch to `dangerouslySetInnerHTML` + CSS `line-clamp`; remove `MessageContent` import.
- **Type changes**: add `description_html` to `Project` and `Project.description_html_translation`-like fields to `ProjectTranslation` in `frontend/src/types.ts`.
- **Add `@tiptap/extension-youtube` to `package.json`** and run `yarn install`.

### Phase 3 — translation

- **`TranslateProject.tsx`**: change the `description` mapping to `description_html`.
- **`TranslateTexts.tsx`**: extend `TranslationBlockElement` with an `as` prop. Add a `RichTextTranslationBlock` variant that mounts `<ProjectDescriptionEditor>` (with `editable` toggled by `is_manual_translation`).

### Risk: sanitization

The current `_strip_dangerous_tags` strips `<iframe>` outright. We need to allow YouTube iframes only. Implementation: change the regex to not include `iframe`, then add a post-bleach pass that walks the parsed HTML tree (or uses a regex) and drops any `<iframe>` whose `src` doesn't match the YouTube allowlist regex. Test with: a YouTube embed (kept), a `<script>` tag (stripped), an `<iframe src="https://evil.com">` (stripped), a `<div data-youtube-video>` without an iframe (kept, harmless).

### Risk: DeepL HTML tag handling for the YouTube wrapper

DeepL's `tag_handling=html` should preserve the `<div data-youtube-video>` and `<iframe>` tags untouched because they have no translatable text. Verify with a manual test using the DeepL API and a sample input. If DeepL misbehaves, the wrapper HTML can be **excluded from translation** by sending only the `<p>…</p>` content to DeepL, then re-attaching the wrapper. This is a fallback — try `tag_handling=html` first.

### Risk: legacy `description` column is stale after migration

The legacy `description` column is not written to by the new code. After the data migration runs, the column holds the original plain-text descriptions (pre-migration), while `description_html` holds the new HTML. Any code path that still reads from `description` will see the old plain text, not the current HTML. This is acceptable because:
- `MessageContent` only renders project descriptions, and we're removing that usage in this spec.
- Other consumers of `description` (e.g. email, search) treat it as plain text anyway.
- A follow-up cleanup PR can drop the column once the migration is confirmed stable.

### Test files to mirror

- Backend: `backend/organization/tests/test_project_description_tiptap.py` — covers serializer, view, sanitization allowlist, DeepL HTML flag, management command.
- Frontend: per-component `*.test.tsx` next to each new/changed component.

### Documentation updates

- `doc/private-for-agents/description-to-tiptap-migration.md` — mark as **completed** once Phase 5 is done.
- `README.md` — no change.
- `AGENTS.md` — note the Tiptap YouTube extension and the `ProjectDescriptionEditor` location for future agent context.

---

## Additional cleanup: remaining references to legacy `description`

The main Phases 1–4 are implemented. The following items still reference the old `project.description` field and need to be updated. These are all Phase 5 cleanup items.

### AC-12: ICS attachment reads from `description_html`

**AC-12.1** `backend/organization/utility/email.py:880–883` — the ICS attachment builder (`generate_event_ics_attachment`) currently reads `project.description` and strips HTML with `bleach.clean(project.description, tags=[], strip=True)`. Change it to read from `project.description_html`:

```python
# Before:
if project.description:
    description_parts.append(
        bleach.clean(project.description, tags=[], strip=True).strip()
    )

# After:
if project.description_html:
    description_parts.append(
        bleach.clean(project.description_html, tags=[], strip=True).strip()
    )
```

**AC-12.2** `backend/organization/tests/test_ics_attachment.py:151,651` — tests set `self.project.description` to test HTML stripping. Update to set `self.project.description_html` instead:

```python
# Before:
self.project.description = "<p>Join us for a <strong>great</strong> event!</p>"

# After:
self.project.description_html = "<p>Join us for a <strong>great</strong> event!</p>"
```

### AC-13: Batch translation management command reads from `description_html`

**AC-13.1** `backend/organization/management/commands/project_translation.py:17–18` — the `translate_project()` function reads `project.description` and writes to `description_translation`. Update to read from `project.description_html` and write to `description_html_translation`:

```python
# Before:
if project.description:
    data["description"] = project.description
# ... and later:
if "description" in texts:
    translation.description_translation = texts["description"]

# After:
if project.description_html:
    data["description_html"] = project.description_html
# ... and later:
if "description_html" in texts:
    translation.description_html_translation = texts["description_html"]
```

**AC-13.2** The `get_project_translations()` utility (`backend/organization/utility/project.py:199–208`) already handles `description_html` — it checks `if "description_html" in data` and passes it to `get_translations()`. No change needed there.

### AC-14: Frontend `parseProject` removes legacy `description` field

**AC-14.1** `frontend/pages/projects/[projectId]/index.tsx:547` — the `parseProject()` function extracts `description: project.description` from the API response. Remove this line. `ProjectContent.tsx` already reads from `description_html` (line 313); the legacy `description` field in the parsed object is unused.

```ts
// Before:
return {
    ...
    description: project.description,
    description_html: project.description_html,
    ...
}

// After:
return {
    ...
    description_html: project.description_html,
    ...
}
```

**AC-14.2** `frontend/pages/manageProjectMembers/[projectUrl].tsx:198` — same `parseProject()` function (the TODO comment notes this is duplicated code). Remove `description: project.description` from the returned object. Note: this page doesn't render `ProjectContent` or `MessageContent` — the `description` field is passed to child components that no longer use it.

### AC-15: `create_new_project` stops writing to legacy `description`

**AC-15.1** `backend/organization/utility/project.py:116–119` — `create_new_project()` currently writes to both `description` and `description_html` when `data["description"]` is present. Remove the `project.description = data["description"]` line (the frontend now sends `description_html`, not `description`):

```python
# Before:
if "description" in data:
    project.description = data["description"]
if "description_html" in data:
    project.description_html = data["description_html"]

# After:
if "description_html" in data:
    project.description_html = data["description_html"]
```

**AC-15.2** Verify that the frontend `formatProjectForRequest` does NOT send `description` in the POST/PATCH body. If it does, remove it — only `description_html` should be sent.

### Impact table for additional cleanup

| File | Line(s) | Change | Risk |
|------|---------|--------|------|
| `backend/organization/utility/email.py` | 880–883 | Read from `description_html` instead of `description` | Low — same strip-HTML logic, different column |
| `backend/organization/tests/test_ics_attachment.py` | 151, 651 | Set `description_html` in tests | Low — test-only change |
| `backend/organization/management/commands/project_translation.py` | 17–18, 36–37 | Read `description_html`, write `description_html_translation` | Low — management command, not production code path |
| `frontend/pages/projects/[projectId]/index.tsx` | 547 | Remove `description: project.description` from `parseProject` | Low — `ProjectContent` reads `description_html` |
| `frontend/pages/manageProjectMembers/[projectUrl].tsx` | 198 | Same as above | Low — this page doesn't render the description |
| `backend/organization/utility/project.py` | 116–119 | Remove `project.description = data["description"]` in `create_new_project` | Low — frontend no longer sends `description` |

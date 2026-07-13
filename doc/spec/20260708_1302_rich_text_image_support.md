# Rich Text Image Support

**Status:** DRAFT
**Branch:** `rich_text_image_support`
**Created:** 2026-07-08

---

## Problem Statement (What & Why)

Climate Connect's rich-text content (project and organization descriptions, event
texts, organizer messages) is authored with Tiptap but currently cannot embed
images. Users have expressed a need to include images directly in their
descriptions — for example, documenting a project's progress, illustrating an
event recap, or adding context to a hub page.

Adding image support matters because visual content significantly improves
engagement and the clarity of climate-action collaboration. It is one of the
next planned features for the editor.

We already depend on the MIT-licensed `@tiptap/extension-image` (present in
`frontend/package.json` but not yet imported), so the foundation is in place
without any commercial licensing cost.

---

## Goals / Scope

- Let users **upload** an image through the editor, have it optimized and stored,
  and insert it at the cursor.
- Let users **insert an image by URL** (paste or toolbar prompt).
- Let users add an optional **caption** to an image.
- Let users **resize** an image for layout purposes within the editor.
- Ensure stored images are **optimized for quality and file size** (real
  optimization on the original, not just display scaling).

Out of scope (for this draft, to be confirmed later):
- Image library / media manager UI for browsing previously uploaded images.
- Permissions/quotas on uploads, CDN delivery, and responsive `srcset` serving
  (noted as trade-offs below).

---

## Acceptance Criteria (observable outcomes)

1. A user can upload an image via a toolbar control in the rich-text editor; the
   image is compressed/optimized and persisted, then inserted at the cursor.
2. A user can insert an image by providing a URL through a toolbar control or by
   pasting a Markdown image link.
3. A user can attach an optional caption to an inserted image, and the caption
   is saved with the document and rendered on display.
4. A user can resize an image for layout within the editor, and the chosen
   dimensions persist in the saved document.
5. Uploaded images are optimized (server-side or pre-upload) so stored files are
   appropriately sized for web delivery — the editor's resize does not substitute
   for this optimization.
6. The feature uses the existing MIT `@tiptap/extension-image` and requires **no
   Tiptap Pro / commercial license**.

---

## Constraints / Non-negotiables

- Must use the MIT `@tiptap/extension-image` already in the dependency tree; do
  **not** introduce a commercial Tiptap Pro dependency.
- **Captions are not provided** by the MIT image node (it renders a bare `<img>`
  with no `figure`/`figcaption`). A custom node extension built on `@tiptap/core`
  is required for captions — this is free to implement, not a licensing issue.
- Editor-side resize is **display-only** (writes `width`/`height` attributes); it
  does not re-encode or shrink the file. True optimization must happen on the
  original image (server-side, or pre-upload via the already-present
  `compressorjs`).
- Follow existing project patterns: `compressorjs` for client compression, the
  existing `UploadImageDialog` / image-dialog components, and Django/DRF
  conventions for the storage endpoint.

---

## Domain Context

- **Frontend:** Next.js 14 + MUI v5 + Tiptap v3. The editor currently uses
  `@tiptap/starter-kit` plus several extensions; `@tiptap/extension-image` is
  declared but unused. `compressorjs` is already a dependency.
- **Backend:** Django 4.2 + DRF. There is no general-purpose rich-text image
  storage model/endpoint yet. Existing image handling is limited to
  `project.image` / `thumbnail_image` fields and avatar/project image uploads.
- **Editor surfaces** that will consume this: project description editor
  (`frontend/src/components/editProject/ProjectDescriptionEditor.tsx`),
  organizer message editor, and potentially hub/event rich-text fields.

---

## AI Insights (hints & trade-off notes)

- **Insertion is trivial:** the MIT extension exposes a `setImage({ src, alt,
  title })` command; both upload-insert and URL-import reuse it. A Markdown input
  rule already handles pasted `![alt](url)`.
- **Captions need a custom node:** the MIT image node has no caption support. Two
  free options — (a) extend `Image` to wrap output in `<figure>` + `<figcaption>`,
  or (b) a dedicated `figure` node containing an image child plus an editable
  caption child (more robust, closer to what Tiptap Pro's "Image Block" does).
- **Resize caveat:** the extension's `resize` option provides drag handles but
  only sets display dimensions. For best quality and optimal size, optimize the
  original server-side (or pre-upload). Consider generating a few target widths
  if responsive delivery is desired — note the MIT node supports a single `src`
  only, so `srcset` would require extending the node.
- **Backend shape (for later architect analysis):** likely a new model (e.g.
  `RichTextImage`) with uploader, timestamps, stored URL(s), and possibly
  multiple derived sizes; plus an upload endpoint and serialization. This needs a
  system-impact review before implementation.
- **No licensing risk:** the package is genuinely MIT and a complete
  implementation; the "image is commercial" wording on Tiptap's site refers to the
  enhanced Pro image experience, not the base node.

---

## Next Steps (workflow)

1. **User review** of this problem statement (refine scope, confirm out-of-scope
   items).
2. **System impact analysis** (handoff to architect) — backend model/endpoint
   design, storage, and the custom caption node.
3. Transition to **IMPLEMENTATION** with backend + frontend agents.

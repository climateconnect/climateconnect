# Branch Review: `upgrade-nextjs-to-v15`

## Overview

This branch upgrades **Next.js 14.2 → 15.5.19**, **React 18 → 19.2.7**, **Sentry 7 → 10.57**, and
several other dependencies. It also removes unused packages and fixes some React 19 / Next.js 15
compatibility issues (nested `<a>` tags, React 19 API changes).

## Dependency Changes Summary

| Package                   | Before   | After    | Risk                             |
| ------------------------- | -------- | -------- | -------------------------------- |
| `next`                    | ^14.2.35 | 15.5.19  | **HIGH** — Major breaking change |
| `react` / `react-dom`     | ^18.2.0  | 19.2.7   | **HIGH** — Major breaking change |
| `@sentry/react`           | ^7.46.0  | ^10.57.0 | **MEDIUM** — API changes         |
| `react-avatar-editor`     | 11.0.7   | 15.0.0   | **MEDIUM** — Major version jump  |
| `react-share`             | ^4.4.0   | 5.3.0    | **MEDIUM** — Major version bump  |
| `html-react-parser`       | ^4.0.0   | ^6.1.2   | **MEDIUM** — Major version jump  |
| `react-minimal-pie-chart` | ^8.1.0   | ^9.1.1   | **LOW**                          |
| `@emotion/react`          | ^11.10.6 | ^11.14.0 | **LOW**                          |
| `@emotion/styled`         | ^11.10.6 | ^11.14.1 | **LOW**                          |
| `eslint-config-next`      | ^14.2.35 | 15.5.19  | **LOW**                          |
| `@types/react`            | ^18.0.25 | ^19.0.0  | **LOW**                          |

### Removed Packages

- `react-ga` — replaced by `react-ga4` (already present)
- `react-loader-spinner` — no references found in code
- `react-text-loop` — replaced by deleting `AlternatingText.tsx`
- `@react-google-maps/api` — no references found in code
- `next-compose-plugins` — no references found in code
- `enzyme` / `enzyme-adapter-react-16` — no references found in code

### Not Removed But Should Be

- `prop-types` — still in dependencies but largely superseded by TypeScript interfaces

---

## HIGH Issues (Likely to Cause Problems)

### 1. ~~`next export` script broken~~ ✅ Fixed

`package.json` — The broken `export` (`next export`) and `deploy` (`yarn build && yarn export`)
scripts have been removed. The unused `gcp-build` script (leftover from a pre-Azure deployment
setup) was removed at the same time. Neither script was referenced by any GitHub Actions workflow —
the CI/CD pipelines call `yarn build` directly.

### 2. ~~`@next/bundle-analyzer` version mismatch~~ ✅ Fixed

Updated from `^14.2.35` to `^15.5.19`. `yarn analyze-bundle` (`ANALYZE=true yarn build`) verified
working — reports generated at `.next/analyze/{client,edge,nodejs}.html`.

---

## Note: `ctx.query` / `ctx.params` in `getServerSideProps` are NOT async

A prior version of this review incorrectly flagged `ctx.query` and `ctx.params` in
`getServerSideProps` as requiring `await` in Next.js 15. **This is wrong for the Pages Router.**

The async request API change in Next.js 15 (`params`, `searchParams`, `cookies`, `headers`,
`draftMode`) applies **exclusively to the App Router** (`page.js`, `layout.js`, route handlers,
etc.). This project uses the Pages Router throughout. `getServerSideProps` context remains a plain
synchronous object — no changes are needed to any of the pages.

---

## MEDIUM Issues (Deprecated / Potential Future Breakage)

### 3. `next/legacy/image` with `layout`/`objectFit` props

- `src/components/hub/CustomAuthImage.tsx:3` — imports from `next/legacy/image` with
  `layout="fill"`, `objectFit="contain"`
- `src/components/hub/CustomBackground.tsx:4` — imports from `next/legacy/image` with
  `layout="fill"`

This still works in Next.js 15 Pages Router via the legacy shim but will be removed in a future
version.

**Fix:** Migrate to standard `next/image` with `fill` prop and `style` object:

```tsx
// Before:
import Image from "next/legacy/image";
<Image layout="fill" objectFit="contain" src={src} />;

// After:
import Image from "next/image";
<Image fill style={{ objectFit: "contain" }} src={src} />;
```

### 4. `_document.tsx` custom `getInitialProps`

`pages/_document.tsx:26` — Uses `MyDocument.getInitialProps` with the legacy MUI SSR pattern
(`ctx.renderPage` mutation). This is deprecated in Next.js 15 but still functional.

### 5. `exportPathMap` in `next.config.js`

`next.config.js:43-45` — The `exportPathMap` config option is a no-op (returns `defaultPathMap`). It
should be removed as it's deprecated.

---

## Positive Changes (Well Done)

### React 19 Compatibility Fixes

1. **`ProjectPreview.tsx`** — Removed nested `<a>` inside MUI `<Link>` (React 19 forbids `<a>`
   inside `<a>`). Replaced with a `<div>` with `role="link"`, `tabIndex={0}`, `onClick`, and
   `onKeyDown` handlers — good accessibility pattern with keyboard support.

2. **`Header.tsx`** — Removed all `component="a"` from `<ListItem>` components nested inside MUI
   `<Link>`, preventing nested `<a>` tags. Eight instances fixed across `NarrowScreenLinks` and
   `NarrowScreenDropdownMenu`.

3. **`UploadImageDialog.tsx`** — Replaced `useState` for the `AvatarEditor` ref with `useRef`,
   fixing React 19 strict-mode issues with callback refs. Also added a null check before calling
   `getImage()`.

4. **`FeedbackDialog.tsx`** — Converted from `PropTypes` to TypeScript `interface`
   (`FeedbackDialogProps`). Good cleanup.

5. **`LocationSearchBar.tsx`** — Fixed React 19 key/props spreading pattern for list items by
   extracting `key` before spreading remaining props.

6. **`mentions_markdown.tsx`** — Updated `ReactFragment` to `ReactNode` (removed in React 19 types).

7. **`ConfirmDialog.tsx`** / **`DateDisplay.tsx`** — Added `defaultProps` to avoid React 19 warnings
   about undefined optional props with PropTypes.

8. **`ProjectMetaData.tsx`** — Added `event.stopPropagation()` on button click to prevent card click
   propagation (related to the `ProjectPreview` structural change).

### Sentry v10 Migration

**`_app.tsx`** — Updated from `new Sentry.BrowserTracing()` / `new Sentry.Replay()` to
`Sentry.browserTracingIntegration()` / `Sentry.replayIntegration()`. Correct migration pattern for
Sentry JavaScript SDK v8+.

### Dead Code Removal

- Deleted `AlternatingText.tsx` (depended on removed `react-text-loop`)
- Deleted `LandingTopBox.tsx` (depended on `AlternatingText`)
- Cleaned up `enzyme` and `enzyme-adapter-react-16` dev dependencies (no longer needed with
  `@testing-library/react`)

### `tsconfig.json`

Added `.next` to `exclude` array — prevents TypeScript from picking up build artifacts. Correct.

### `next-env.d.ts`

Updated with `/// <reference path="./.next/types/routes.d.ts" />` — correct for Next.js 15.

---

## Summary

| Severity           | Count | Status                                          |
| ------------------ | ----- | ----------------------------------------------- |
| 🟡 MEDIUM          | 3     | Fix soon / track as tech debt                   |
| ✅ Positive        | 10    | Well-handled changes                            |
| ✅ Fixed in review | 2     | Removed broken scripts, updated bundle-analyzer |

---

## Verdict

**This branch is ready to merge.** The GitHub Actions workflows (`pull_request_frontend.yml` and the
production deploy workflow) both invoke `yarn build` directly and are unaffected by any of the
issues listed above. CI will pass as-is.

The remaining items are all tech debt: `@next/bundle-analyzer` only matters when running bundle
analysis reports, and the MEDIUM items (`next/legacy/image`, `exportPathMap`, `_document.tsx`) are
deprecated but functional. The component-level React 19 fixes, Sentry v10 migration, and dependency
cleanup are all well done. The Pages Router `getServerSideProps` pages require no changes —
`ctx.query`/`ctx.params` remain synchronous in Next.js 15.

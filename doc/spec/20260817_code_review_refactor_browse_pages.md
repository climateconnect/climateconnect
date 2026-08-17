# Code Review: Refactor Browse Pages and Filter

**Reviewed**: 2026-08-17
**Branch**: `refactor-browse-pages-and-filtering`
**Spec**: `doc/spec/20260429_0829_refactor_browse_pages_filter.md`

---

## Summary

The refactor successfully splits the 762-line `BrowseContent` monolith into per-type
content components, extracts hooks for data fetching and URL sync, introduces
`HubPageLayout` for shared hub chrome, moves `BrowseContext.Provider` to `_app.tsx`,
and removes the `tabsWhereFiltersWereApplied` mechanism. The deletion of 1,267 lines
with clean replacements is well-structured.

However, there are several issues ranging from functional bugs to incomplete link
migration that should be addressed before merging.

---

## Severity Legend

- **P0** — Functional bug, will break runtime behavior
- **P1** — Incomplete spec implementation / will cause user-visible issues
- **P2** — Code quality / maintainability / unnecessary perf cost
- **P3** — Minor / nit

---

## P0: Functional Bugs

### 1. `applyFilters` callback ignores FilterContent arguments (organisations + members)

**Files**: `BrowseOrganisationsContent.tsx:109`, `BrowseMembersContent.tsx:109`

`FilterContent` calls `applyFilters({ type, newFilters, closeFilters, nonFilterParams })`
with the **updated** filter values (see `FilterContent.tsx:152`, `206`, `254`). The
projects component correctly destructures and forwards these:

```tsx
// BrowseProjectsContent.tsx:109 — correct
applyFilters={({ type: _type, newFilters, closeFilters, nonFilterParams: _nfp }) =>
  handleApplyNewFilters({ newFilters, closeFilters, filterChoices, hubUrl, initialLocationFilter })
}
```

But organisations and members wrap the callback in a no-arg arrow function, **ignoring**
the arguments from `FilterContent` and instead passing the **stale** `filters` state:

```tsx
// BrowseOrganisationsContent.tsx:109 — broken
applyFilters={() =>
  handleApplyNewFilters({ newFilters: filters, closeFilters: false, filterChoices, hubUrl, initialLocationFilter })
}
```

This means selecting a filter value in the organisations or members panel (e.g. clicking
a multiselect chip, saving a dialog, unselecting a chip, or staging apply on mobile)
will re-apply the **previous** filters instead of the new ones.

**Fix**: Destructure the arguments in all three content components the same way.

---

### 2. `getHubBrowseTypeServerSideProps` uses sub-hub slug for theme

**File**: `getHubBrowseTypeServerSideProps.ts:25-51`

```
let hubUrl = ctx.query.hubUrl ...
if (subHub) hubUrl = subHub;          // ← hubUrl now points to sub-hub
...
getHubTheme(hubUrl)                    // ← fetches theme for sub-hub slug
```

Per the spec's Critical Finding 2, themes are a **parent-hub** concept. The old
`HubBrowsePage` had this same bug. The events page correctly uses `parentHubUrl`.
The new hub browse pages perpetuate the bug.

**Fix**: Pass `ctx.query.hubUrl` (the parent URL, before reassignment) to
`getHubTheme` instead of the potentially-reassigned `hubUrl`.

---

## P1: Incomplete Spec Implementation

### 3. Events pages still navigate via `/browse` hash URLs

**Files**:
- `pages/events.tsx:115-116` — `router.push(\`${base}#${tab}\`)` where `base = "/browse"`
- `pages/events.tsx:126-127` — same pattern in the inline `handleTabChange`
- `pages/hubs/[hubUrl]/events.tsx:138-139,145` — `browsePath` computed as
  `/hubs/${hubUrl}/browse` and navigated with hash fragments

The spec's Phase 4 requires "All internal links updated to new URLs." These should
navigate to `/projects`, `/organisations`, `/members` (and hub equivalents) directly.

**Fix**: Replace `/browse#tab` navigation with direct page navigation + query param
preservation, matching the pattern in the new global/hub page `handleTabChange`.

---

### 4. Many `/browse` references not updated

The spec lists "All internal links updated to new URLs" as an acceptance criterion.
The following files still reference `/browse` and were **not** updated in this changeset.
While the redirect pages handle the global `/browse` → `/projects` redirect for
client-side navigation, some of these are SSR redirects that won't hit the client
redirect, and others are hardcoded navigation targets that will cause unnecessary
redirect hops.

| File | Line(s) | Context |
|------|---------|---------|
| `src/components/header/Header.tsx` | 362 | Logo link: `/hubs/${hubUrl}/browse` |
| `public/lib/headerLinks.ts` | 73, 86 | Header nav "Browse" link + hub about link |
| `public/lib/profileOperations.ts` | 68 | Post-login/signup fallback redirect |
| `src/components/general/PageNotFound.tsx` | 35 | 404 "return to home" link |
| `src/components/general/GoBackButton.tsx` | 80, 83 | Back button targets |
| `pages/activate_email/[uuid].tsx` | 37, 44-51 | Post-activation redirect |
| `pages/login.tsx` | 66 | Post-login redirect (hub variant) |
| `pages/resetpassword.tsx` | 65, 69 | Post-reset redirect |
| `pages/reset_password/[uuid].tsx` | 112, 116 | Post-reset redirect |
| `src/components/account/SettingsPage.tsx` | 287 | Post-settings redirect |
| `public/lib/hubOperations.ts` | 19 | SSR redirect for hub |
| `pages/hubs/[hubUrl]/index.tsx` | 63, 99 | SSR redirect + 404 link |
| `pages/resend_verification_email.tsx` | 59, 63 | Post-verification redirect |
| `src/components/communication/notifications/Notification.tsx` | 270 | Notification link |
| `src/components/communication/notifications/CommentNotifications.tsx` | 43, 55 | Notification links |
| `pages/sitemap/[language_code_dot_xml].tsx` | 32 | Sitemap entry (`/browse`) |
| `public/lib/getHubData.ts` | 64, 66 | Hub URL construction for linked hubs |
| `src/components/hub/HubLinkButton.tsx` | 98-100 | Hub link button URL + hash logic |
| `src/components/project/ProjectSideBar.tsx` | 83 | "Browse all projects" link |

**SSR redirects that bypass client redirect**: `hubOperations.ts:19`,
`hubs/[hubUrl]/index.tsx:63` use `redirect()` in `getServerSideProps`, which returns
an HTTP 302 before the client ever loads JavaScript. The `browse.tsx` redirect page
only works for client-side navigation. These SSR redirects still point to `/browse`,
which will work (the redirect page loads, then JS redirects), but it's a double
redirect.

**Notification links**: `/hubs/${slug}/browse?idea=...#ideas` — the `#ideas` hash
target no longer exists on any page (idea board removed in `722cfe0f`, Feb 2025).
The backend will not generate new idea notifications (ideas cleanup is a separate
task). The 3 dead link paths in `Notification.tsx:270` and `CommentNotifications.tsx:43,55`
plus the stale `#ideas` scroll handler in `ProfileRoot.tsx:207` can be removed in this
refactor.

---

### 5. `getBrowseServerSideProps` helper is dead code

**File**: `src/components/browse/getBrowseServerSideProps.ts`

This SSR helper was created (68 lines) but is never imported by any page. The three
global page files inline their own SSR logic. Either the helper should be used (reducing
duplication in the 3 global pages) or deleted.

---

### 6. Upcoming events band not integrated in `BrowseProjectsContent`

**File**: `src/components/browse/BrowseProjectsContent.tsx`

The old `BrowseContent` rendered `<UpcomingEventsGroup>` between the filter section
and project previews (behind `EVENT_CALENDAR_FEATURE`). The new `BrowseProjectsContent`
does not call `useUpcomingEvents` or render `UpcomingEventsGroup`. The hook was
extracted to `src/hooks/useUpcomingEvents.ts` but never wired into the content
component. `EVENT_CALENDAR_FEATURE` is already enabled on production — this is a live
regression, not a theoretical one.

---

### 7. HubPageLayout hardcodes sub-hub info text for all page types

**File**: `HubPageLayout.tsx:185`

```tsx
<div className={classes.subHubInfoText}>{texts.you_are_seeing_projects_related_to}</div>
```

This always shows "you are seeing projects related to" even on the organisations,
members, and events hub pages. The old events page showed "you are seeing events
related to." The text should be parameterised by the current page type.

---

## P2: Code Quality / Maintainability

### 8. Hardcoded English strings in global page tabs

**Files**: `pages/projects/index.tsx:65`, `pages/organisations/index.tsx:65`,
`pages/members/index.tsx:65`

```tsx
type_names={{
  projects: "Projects",
  organizations: isNarrowScreen ? "Orgs" : "Organizations",
  members: "Members",
}}
```

The old `BrowseContent` used `getTexts()` for i18n. These pages hardcode English.
Should use `texts` from `getTexts({ page: "hub", locale })`.

---

### 9. `useBrowseData` — `getTexts()` called inside hook body breaks memoization

**File**: `useBrowseData.ts:33`

```tsx
const texts = getTexts({ page: "hub", locale: locale });
```

`getTexts()` returns a new object every call. `texts` is included in the `useCallback`
dependency array of `handleApplyNewFilters` (line 74), so the callback is recreated
every render.

**Fix**: Wrap `texts` in `useMemo` or remove it from the dependency array if the
text values used inside the callback are stable (they are — only `texts` reference
changes, not the values used).

---

### 10. `useBrowseUrlSync` — `initializedRef` never reset on client-side navigation

**File**: `useBrowseUrlSync.ts:42`

The `initializedRef.current` guard prevents double-initialization on mount, but the
`reset()` function (line 81) is never called by the content components. If Next.js
client-side navigation mounts a new content component (e.g. switching from
`/projects` to `/organisations`), a fresh hook instance is created with a new ref,
so this is likely fine. However, if the same component type is reused (e.g.
navigating between `/projects?search=a` and `/projects?search=b`), the initialized
guard will prevent URL params from being re-read.

**Mitigation**: Either call `reset()` on route change, or key the content component
on the route path so React unmounts/remounts it.

---

### 11. Unused props in content components

**Files**: `BrowseProjectsContent.tsx:30`, `BrowseOrganisationsContent.tsx:30`,
`BrowseMembersContent.tsx:30`

All three components accept `linkedHubs` and `subHubInfoText` props, but `linkedHubs`
is destructured as `_linkedHubs` (never used). `subHubInfoText` is rendered but
`HubPageLayout` already renders its own sub-hub info text (line 185), so it would
double-render on hub pages. On global pages, it's never passed.

These props should be removed from the content component interfaces.

---

### 12. `getHubBrowseTypeServerSideProps` fetches unnecessary data for members

**File**: `getHubBrowseTypeServerSideProps.ts:43-54`

All filter options (`organization_types`, `skills`, `sectorOptions`, `projectTypes`)
are fetched in a single `Promise.all` regardless of `internalType`. For the "members"
page, `organization_types` and `projectTypes` are fetched but never used (lines 61-68
only add `sectors` and `skills` to `filterChoices`).

**Fix**: Conditionally include only the needed promises, or accept the minor SSR
overhead (one extra API call) for code simplicity.

---

### 13. Global pages inline SSR instead of using `getBrowseServerSideProps`

**Files**: `pages/projects/index.tsx:17-33`, `pages/organisations/index.tsx:22-38`,
`pages/members/index.tsx:18-33`

These duplicate the SSR pattern with slight variations. The `getBrowseServerSideProps`
helper was designed for this. Use it or delete the helper.

Note: the projects page uses dynamic `import()` for `getOptions` (lines 22-24) while
the helper uses static imports. This may be intentional for bundle splitting.

---

### 14. Hub page components don't pass `hubAmbassador`/`hubSupporters` to HubPageLayout

**Files**: `pages/hubs/[hubUrl]/projects.tsx`, `organisations.tsx`, `members.tsx`

The `HubPageLayout` type accepts `hubAmbassador` and `hubSupporters` props and the
component falls back to fetching them client-side if not provided. But none of the
hub browse pages pass these props, meaning every hub page load triggers an
unnecessary client-side API call on mount. The SSR (`getHubBrowseTypeServerSideProps`)
doesn't fetch ambassador/supporter data either.

This is a regression from the old `HubBrowsePage` which also fetched client-side, so
it's not a new problem — but the `HubPageLayout` type suggests it was designed to
accept SSR data. Consider either fetching in SSR or removing the props from the type.

---

## P3: Nits

### 15. `BrowseContext` is misleadingly named and largely vestigial

**File**: `src/components/context/BrowseContext.ts`, `pages/_app.tsx:334`

`BrowseContext` was introduced to share `projectTypes` (an array of
`{type_id, name, ...}`) between the browse page and its tabs. After the refactor,
it has nothing to do with browsing — it only carries `projectTypes` to two leaf
components:

- `ProjectMetaData.tsx:314` — used on project detail pages
- `ProjectPreview.tsx:123` — used on browse and profile pages

**The name is wrong**: it should be `ProjectTypesContext`.

**The data is constant**: there are exactly 3 project types (`idea`, `event`,
`project`), hardcoded in `backend/organization/models/type.py:58-62` as a Python
dict. The `ListProjectTypeOptions` API view (line 1591) just serializes this dict.
They never change at runtime.

**Dead fetches left behind by the refactor**:
- `pages/profiles/[profileUrl].tsx:4,33,44,51,62,76` still fetches `projectTypes`
  in SSR and passes it as a prop, but the page no longer wraps in
  `BrowseContext.Provider` (removed in the refactor). `ProjectPreview` reads from
  the context (which will be `null` from `_app.tsx` default), not from the prop.
  The prop is unused.
- `pages/projects/[projectId]/index.tsx:176,183-184` still has the
  `useState` + `useEffect` client-side fetch for `projectTypes`, but also no
  longer provides via context. The state is set but never read.

**Options** (ordered by simplicity):

1. **Hardcode the 3 project types** in a shared frontend module
   (`frontend/public/data/projectTypes.ts`) with localized name mappings.
   Import directly in `ProjectPreview` and `ProjectMetaData`. Eliminates the
   context, the API call, the SSR fetches, and the provider wrapper entirely.
   This is the simplest option and matches the fact that the data is a constant.

2. **Fetch once in `_app.tsx`'s `getInitialProps`** (the app-level SSR
   already exists at `pages/_app.tsx:362-373` and fetches `hubs` once for the
   entire app — same pattern). Pass via a renamed `ProjectTypesContext` or
   as a prop down the tree. This keeps the backend as source of truth but
   fetches it exactly once per server start.

3. **Rename `BrowseContext` → `ProjectTypesContext`** and leave the current
   per-page SSR fetching in place. Minimal change, but doesn't address the
   fundamental issue of fetching static data from the API.

**Recommended**: Option 1 (hardcode). The 3 types are a constant, the backend
view literally just serializes a hardcoded dict, and the data barely ever
changes. If the backend ever needs to add a 4th type, it's a one-line change
in the shared module and a coordinated deploy — acceptable for data this static.
Option 2 is a reasonable alternative if you want to keep the backend as
authoritative. Either way, eliminate `BrowseContext`.

---

### 16. `BrowseContext.Provider` in `_app.tsx` wraps every page

**File**: `pages/_app.tsx:334`

```tsx
<BrowseContext.Provider value={{ projectTypes: pageProps.projectTypes || null }}>
```

This adds a context provider to every page render, even pages that don't use
`projectTypes`. The value object is recreated every render (no `useMemo`). Harmless
but should be eliminated along with the context itself (see #15).

---

### 17. `handleTabChange` duplication across global pages

The `handleTabChange` function is identical across `projects/index.tsx`,
`organisations/index.tsx`, and `members/index.tsx`. Consider extracting it into a
shared utility that takes the tab-to-path mapping.

---

### 18. Events page `handleTabChange` still has dead code

**File**: `pages/events.tsx:112-117`

The outer `handleTabChange` function (used by `MobileBottomMenu`) navigates via
`/browse#tab`, while the inline handler on `HubTabsNavigation` (line 124-128) does
the same. These should be unified and updated to use the new URLs.

---

## Acceptance Criteria Checklist

| Criterion | Status | Notes |
|-----------|--------|-------|
| Pages at `/projects`, `/organisations`, `/members` | ✅ | |
| Each page loads data independently | ✅ | Via `useBrowseData` hook |
| Filter state preserved when navigating | ⚠️ | Query params are preserved in `handleTabChange` but the `useBrowseUrlSync` guard may prevent re-init (see #9) |
| Filter fields adapt per type | ✅ | Via `possibleFilters` keyed by type |
| `URLSearchParams` API | ✅ | Used in `handleTabChange` |
| Redirects from old URLs | ✅ | Hash-based routing in redirect pages |
| Hub variants | ✅ | 6 hub + 6 sub-hub pages |
| Tab clicks navigate between pages | ✅ | |
| Mobile bottom menu navigates | ✅ | |
| All internal links updated | ❌ | ~20 files still reference `/browse` (see #4) |
| Upcoming events band | ❌ | `useUpcomingEvents` hook extracted but not integrated in `BrowseProjectsContent` — live regression (see note below) |
| Old files deleted | ✅ | `BrowseContent`, `TabContentWrapper`, `HubBrowsePage` deleted |

### Note on upcoming events band

`useUpcomingEvents` is extracted but `BrowseProjectsContent` does not import or use
it. The old `BrowseContent` rendered `<UpcomingEventsGroup>` (line 279) and
integrated upcoming events into the project grid — this is completely absent from
`BrowseProjectsContent`. The hook exists but is dead code until the content component
integrates it. `EVENT_CALENDAR_FEATURE` is already enabled on production, so this is a
live regression — users will no longer see the upcoming events band on the projects page.

---

## Recommended Fix Priority

1. **P0 #1** — Fix `applyFilters` callback in organisations/members (broken filter application)
2. **P0 #2** — Fix `getHubTheme` to use parent hub URL (wrong theme on sub-hubs)
3. **P1 #6** — Wire `useUpcomingEvents` + `UpcomingEventsGroup` into `BrowseProjectsContent` (live regression)
4. **P1 #3** — Update events page tab navigation to use new URLs
5. **P1 #4** — Complete `/browse` → new URL migration across all files
6. **P1 #5** — Remove or use `getBrowseServerSideProps` helper
7. **P1 #7** — Parameterise sub-hub info text in `HubPageLayout`
8. **P2 #15** — Eliminate `BrowseContext` / hardcode 3 project types / remove dead SSR fetches
9. **P2 #8** — Use i18n texts for tab labels in global pages
10. **P2 #9** — Fix `texts` memoization in `useBrowseData`
11. **P2 #10–14, 16–18** — Address remaining quality items

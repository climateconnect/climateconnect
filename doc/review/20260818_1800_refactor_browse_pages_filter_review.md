# Code Review — Refactor Browse Pages and Filter

**Branch**: `refactor-browse-pages-and-filter`
**Spec**: `doc/spec/20260429_0829_refactor_browse_pages_filter.md`
**Reviewer**: automated review
**Date**: 2026-08-18

---

## Summary

The refactor lands its core objectives: a 762-line `BrowseContent` monolith is replaced by three small per-type content components (`BrowseProjectsContent`, `BrowseOrganisationsContent`, `BrowseMembersContent`), a shared `HubPageLayout`, three extracted hooks (`useBrowseData`, `useBrowseUrlSync`, `useUpcomingEvents`), and a centralised `getBrowsePathForType` / `getHubBrowsePathForType` mapping in `urlOperations.ts`. The deleted `BrowseContext` is no longer referenced anywhere (verified with `grep`), the `tabsWhereFiltersWereApplied` mechanism is gone, and `/browse` is a real page with hash-based client-side redirects for `/browse#members` and `/browse#organizations`. The hub-events page was also refactored to use `HubPageLayout`, removing ~100 lines of duplicated chrome boilerplate. Several production bugs are fixed along the way (per-finding section below).

There are **two real regression risks** introduced by this refactor — one high-confidence, one medium — and a handful of lower-priority findings. None block merge, but they should be triaged before the branch goes to staging.

---

## Findings

### Issue 1 — Regression: navigating between hub browse pages does not re-fetch data (HIGH)

**File**: `frontend/pages/hubs/[hubUrl]/browse.tsx:59-62` (same pattern in `organizations.tsx` and `members.tsx`)

The three global pages (`pages/browse.tsx:95`, `pages/members/index.tsx:83`, `pages/organizations/index.tsx:88`) correctly force a remount of the content component when the URL changes by passing `key={router.asPath}`:

```tsx
<BrowseProjectsContent
  key={router.asPath}
  filterChoices={filterChoices}
  initialLocationFilter={initialLocationFilter}
/>
```

The hub pages do **not** have this `key` prop. Combined with how the content component initialises, this produces a stale-data bug:

1. The three new content components each use a local `useState(false)` for `initialized` and gate their initial fetch on a `useEffect` with `deps: [initialized]` (`BrowseProjectsContent.tsx:84-99`).
2. When a user navigates from `/hubs/erlangen/browse` to `/hubs/marburg/browse`, Next.js reuses the same component instance because the route segment `[hubUrl]` changes only as a query string from React's perspective (no `key`). `initialized` stays `true`, the `useEffect` does not re-run, and no initial fetch happens for Marburg.
3. The `FilterProvider` does receive the new `hubUrl` (passed correctly on `hubs/[hubUrl]/browse.tsx:57`), and the next time the user touches a filter, `handleApplyNewFilters` does pick up the new hub from closure. But until the user touches a filter, the grid shows Erlangen data with the new URL — including pagination state.

The global pages dodge this bug by using `key={router.asPath}`. The hub pages should adopt the same pattern. Two ways to fix:

- **Recommended**: add `key={router.asPath}` to the three hub content components, mirroring the global pages. This also resets `filtersExpanded`, scroll position, and the `childrenRenderedRef` — a one-line fix that makes the hub and global pages consistent.
- Alternative: convert the content component to read `hubUrl` from props (not from `useContext(HubContext)`) and add `hubUrl` to the `useEffect` deps. More invasive, less symmetric with the global pages.

**Risk if not fixed**: this is the regression I would most expect to be flagged in QA as "the wrong hub's projects are showing". I would land the `key` fix before merging to staging.

---

### Issue 2 — Dead `setInitialItems` export (LOW)

**File**: `frontend/src/hooks/useBrowseData.ts:142-146, 164`

```ts
const setInitialItems = useCallback((initialData: any[] | undefined) => {
  if (initialData) {
    setItems(initialData);
  }
}, []);
```

`setInitialItems` is exposed in the hook's return value but is never called from any component (`grep -r setInitialItems frontend/src frontend/pages` returns only the hook itself and its unit test). The browse pages rely entirely on `useBrowseUrlSync` + `handleApplyNewFilters` for the initial fetch; there is no SSR data path that would call this. It is also the only reason `setItems` is exposed via this setter.

The test at `useBrowseData.test.tsx:76-82` covers the setter, so removing it will require also dropping that test (or accepting a lower branch-coverage number). Since the helper has no consumer, recommend deleting it along with its test to keep the hook's surface area honest. Low priority — it is harmless today.

---

### Issue 3 — `useEffect` exhaustive-deps suppressed intentionally (LOW)

**Files**: `BrowseProjectsContent.tsx:84-99`, `BrowseOrganisationsContent.tsx:75-90`, `BrowseMembersContent.tsx:75-90`

```ts
useEffect(() => {
  if (!initialized) {
    const result = initializeFromUrl("projects", initialLocationFilter, showFeedbackMessage);
    if (result) {
      setNonFilterParams(result.nonFilterParams);
      handleApplyNewFilters({ newFilters: result.newFilters, ... });
    }
    setInitialized(true);
  }
}, [initialized]);
```

The `[initialized]` dependency array is the correct minimum to make this run exactly once. The `// eslint-disable-next-line` comment (or absence of one) should make that intent explicit. Today there is no disable comment, so a future developer enabling strict eslint could either (a) be tempted to "fix" the deps and accidentally re-run the initializer, or (b) disable the rule at the file level. Recommend either an inline `// eslint-disable-next-line react-hooks/exhaustive-deps` above the effect, or a short comment explaining the deliberate minimal-deps choice and that `useBrowseUrlSync`'s internal `initializedRef` is the safety net for the second-and-later calls. This is also defensive against the bug in Issue 1 — if anyone later adds `hubUrl` to the deps, the `initializedRef` short-circuit prevents double-fetch.

This is also a hint that the dependency wiring is fragile: the effect depends on `filterChoices`, `initialLocationFilter`, `hubUrl`, `showFeedbackMessage`, etc. via closure, and there is no guarantee they are stable across renders. Today this works because the page passes the same object reference on every render, but the design is brittle. Worth a follow-up comment in `BrowseProjectsContent` explaining the invariant ("the page passes the same `filterChoices` reference on every render; do not inline a fresh object literal here").

---

### Issue 4 — `Notification.tsx` idea-notification removal (NOTED, intentional)

**File**: `frontend/src/components/communication/notifications/Notification.tsx:113-128, 170-189, 230-243`

The `Refactor browse and filter` commit (81610005) also removed the `idea_comment`, `reply_to_idea_comment`, and `person_joined_idea` notification branches, dropping the supporting `IdeaCommentNotification` / `IdeaCommentReplyNotification` / `PersonJoinedIdeaNotification` components. The user explicitly instructed this as a deliberate cleanup of obsolete code in the same PR rather than wasting time on it later. No regression expected since the removed code is dead — the `/browse#ideas` mechanism is gone, `useUpcomingEvents` only handles `events` (not `ideas`), and no remaining component references the removed exports (verified via grep).

Recommend adding a brief note to the spec under "Files deleted" or a new "Related cleanup" section so the change is documented in the refactor's history and future bisects can account for it. No code change required.

---

### Issue 5 — Hash-redirect for unknown hash values (NOTED, intentional)

**File**: `frontend/pages/browse.tsx:49-58`

The redirect effect only handles `#members` and `#organizations`. If a user lands on `/browse#ideas` (or any other old hash), the `if` guard silently does nothing and they stay on `/browse` (projects). The user confirmed this is fine and that the old `#ideas` code can be removed entirely. Since ideas are being dropped from the browse page (the `/browse#ideas` mechanism is gone and `useUpcomingEvents` only handles `events`), there is no future value in handling an `#ideas` redirect. The current behaviour of "unknown hash → land on /browse" is acceptable and matches the pre-refactor behaviour. No change required.

The only remaining concern is the SSR/CSR split: the effect only runs on the client, so a JS-enabled user briefly sees the projects page before the redirect fires. The spec acknowledges this is intentional (spec note: "client-side via `window.location.replace`"), and a server-side redirect is not possible because Next.js does not forward hash fragments to the server. The current implementation is the right call. No change required.

---

### Issue 6 — `getBrowsePathForType` for unknown types silently returns `/<type>` (LOW)

**File**: `frontend/public/lib/urlOperations.ts:231`

```ts
const getBrowsePathForType = (type: string): string => `/${BROWSE_TYPE_TO_PATH[type] ?? type}`;
```

If a caller passes a type that is not in `BROWSE_TYPE_TO_PATH` (e.g. `"events"`), the helper returns `/events`. This is the intended behaviour for the events tab (`getHubBrowsePathForType` does the same), but it is surprising at a glance: "this function maps a browse type to a browse path" but unknown types still get a path. If a future developer adds a new type and forgets to add it to the map, the bug is silent.

Recommend one of:

- Throw or `console.warn` for unknown types in dev: `if (!BROWSE_TYPE_TO_PATH[type]) console.warn("getBrowsePathForType: unknown type", type);`
- Document explicitly in the JSDoc that "events" is a valid input that intentionally falls through (since the events tab is shared between browse and event pages).

Same applies to `getHubBrowsePathForType`. The "events" fallback is what makes the events tab work in `BrowseTab` navigation; not a bug, just underdocumented.

---

### Issue 7 — `useUpcomingEvents` refetches on every location change without aborting (LOW)

**File**: `frontend/src/hooks/useUpcomingEvents.ts:29-60`

The effect depends on `stableLocation` and re-fires whenever the location filter changes. There is no `AbortController` or cancellation token passed to `getUpcomingEvents`. If the user types in the location input, each keystroke that causes `filters.location` to change will trigger a new fetch. The hook does not de-duplicate or cancel the previous in-flight request, so a slow network can produce out-of-order `setUpcomingEvents` calls (an earlier-slow request resolving after a later-fast one and overwriting it with stale data).

In practice, the location is normally a `useRef` that only changes when a result is selected, so the risk is small. But it is the same pattern that was in the old `BrowseContent` (which I assume had the same bug). Worth a follow-up: wrap the fetch in a cancellation token, or at minimum add a "latest request" guard via a ref. Not a regression introduced by this PR; flagging for future hardening.

---

### Issue 8 — `hubTheme` for `/hubs/<hub>/<sub>/browse` confirmed fixed (POSITIVE, validates Critical Finding 2)

**File**: `frontend/src/components/hub/getHubBrowseTypeServerSideProps.ts:21-49`

The spec's Critical Finding 2 noted that the old `HubBrowsePage` called `getHubTheme(hubUrl)` (which could be a sub-hub slug) instead of `getHubTheme(parentHubUrl)`. The new helper correctly captures the parent hub URL *before* the `if (subHub) hubUrl = subHub` reassignment and passes the original to `getHubTheme`:

```ts
let hubUrl = ...; // could become sub-hub
const parentHubUrl = hubUrl;  // captured before mutation
const { subHub } = extractHubUrlsFromContext(ctx);
if (subHub) hubUrl = subHub;
// ...
getHubTheme(parentHubUrl)  // always the parent
```

This is the right ordering. Sub-hubs will now correctly inherit the parent hub's theme instead of falling back to the default. ✅ Good.

Note: `getHubBrowseTypeServerSideProps` also computes `subHubUrl: subHub || null` and `subHubSegment: subHubSegment || null`. The pages then pass `subHubSegment` to `getHubBrowsePathForType`, which uses it to build `/hubs/<parent>/<sub>/<type>`. Tracing the flow:

- `getHubBrowseTypeServerSideProps` → `subHub` (from `extractHubUrlsFromContext`, presumably the full sub-hub path or last segment) and `subHubSegment` (last segment of `ctx.query.subHub`).
- `getHubBrowsePathForType(type, hubUrl, subHubSegment)` builds `/hubs/${hubUrl}/${subHubSegment}/${type}`.

If `subHubSegment` is the URL-encoded last segment and `hubUrl` is the parent hub slug, this is correct. But the sub-hub `browse.tsx` re-exports from the parent, which means `ctx.query.subHub` for the sub-hub request will be a string (the last path segment). Verified by reading `pages/hubs/[hubUrl]/[subHub]/browse.tsx` — it is a re-export, so the sub-hub URL is matched by the `[hubUrl]/[subHub]` route, and inside `getHubBrowseTypeServerSideProps` the `subHub` query is a string. OK.

---

### Issue 9 — `BrowseContext` removal is safe (POSITIVE, validates Critical Finding 1)

The spec's Critical Finding 1 worried that `ProjectMetaData` and `ProjectPreview` consume `useContext(BrowseContext)`. Verified by grep:

- `ProjectMetaData.tsx:315`: `const projectTypes = getProjectTypes(locale);` (direct call)
- `ProjectPreview.tsx:123`: `const projectTypes = getProjectTypes(locale);` (direct call)
- No remaining `BrowseContext` references anywhere in the frontend (`grep -r BrowseContext frontend` returns 0 matches).

The new `getProjectTypes` helper in `public/data/projectTypes.ts` is a static lookup (no async, no provider needed), so the contexts are truly redundant. ✅ Clean removal.

---

### Issue 10 — Centralised path mapping prevents future `tab === "projects" ? "/browse"` sprawl (POSITIVE)

`getBrowsePathForType` and `getHubBrowsePathForType` in `urlOperations.ts:221-241` are used in 6+ pages (`browse.tsx`, `members/index.tsx`, `organizations/index.tsx`, `hubs/[hubUrl]/browse.tsx`, `hubs/[hubUrl]/organizations.tsx`, `hubs/[hubUrl]/members.tsx`, `events.tsx`, `hubs/[hubUrl]/events.tsx`). `HubsDropDown.tsx:44-47` and `HubLinks.tsx:38-40` correctly preserve the current browse type when switching between hubs. The hub dropdown now uses `currentBrowseType` to build `/hubs/<other>/<currentBrowseType>` instead of hardcoding `/browse`. ✅ Good.

`HubLinkButton.tsx:98-108` correctly handles backward compat for old API data that still returns `/projects` URLs (`/\/(browse|projects)$/.test(hub.hubUrl)`), and the `activeTab` prop is used to swap the trailing segment based on the current page. Verified by reading the function. ✅ Good.

---

## Things I would not change

- **Per-type content components are nearly identical** (only the preview component, type string, and one prop differ). DRYing this further (e.g. a single `BrowseContent` that takes the preview component as a prop) is tempting but would re-introduce the very coupling the refactor was trying to eliminate. The current duplication is ~80 lines per component, and the differences (events band on projects, `showAdditionalInfo` on members, `organization_types` filter choices for organizations only) are exactly the kind of per-type logic that gets buried in a shared component. Keep as-is.
- **`window.location.replace` for hash redirects** — the spec correctly identifies this as the right choice over `router.replace`. SPA navigation has a known double-redirect issue with `<meta http-equiv="refresh">` fallbacks, and the spec already explains why. ✅
- **US spelling `/organizations`** — the spec notes this changed from the original UK spelling to align with the existing detail page at `/organizations/[slug]`. The `pages/organizations/` directory now contains both `index.tsx` (new list page) and `[organizationUrl].tsx` (existing detail page). Coexistence is clean. ✅
- **The 53 files in the diff** — large for a frontend refactor, but most are straightforward: deletions of `BrowseContent.tsx` (762 lines) and `TabContentWrapper.tsx` (170 lines) account for ~930 lines; `HubPageLayout.tsx` (205 lines) and the 3 content components (~165 lines each) add ~700 lines. The net is in the right direction.

---

## Recommendations (priority order)

1. **Add `key={router.asPath}` to the three hub page content components** (Issue 1) — one-line fix, prevents a likely production regression. This is the only finding I would block on.
2. **Add a note to the spec** documenting the intentional `Notification.tsx` idea-notification removal (Issue 4) — the user confirmed this was deliberate, so just record it in `doc/spec/20260429_0829_refactor_browse_pages_filter.md` under "Files deleted" or a new "Related cleanup" section.
3. **Document the intentional exhaustive-deps suppression** in the three content components (Issue 3) — five-minute change, prevents future "cleanup" from breaking things.
4. **Delete dead `setInitialItems`** (Issue 2) — minor cleanup, do it as a follow-up commit.
5. **Add a console.warn for unknown types in `getBrowsePathForType`** (Issue 6) — defensive, five-minute change.
6. **Add cancellation to `useUpcomingEvents`** (Issue 7) — out of scope for this PR, file a follow-up.

---

## Validation suggestions

Before merging to staging:

- `cd frontend && yarn lint && yarn format`
- `cd frontend && yarn test src/hooks/useBrowseData.test.tsx src/hooks/useBrowseUrlSync.test.ts public/lib/headerLinks.test.ts`
- Manually click through: `/browse` → `/browse?search=foo` → `/hubs/erlangen/browse` → `/hubs/marburg/browse` (this is the Issue 1 repro). With the `key` fix in place, all four should show fresh data scoped to the right hub.
- Manually visit `/browse#members` and `/browse#organizations` in a fresh tab — both should redirect to the new pages with the existing query string preserved.
- Manually visit `/hubs/erlangen` (location hub with sub-hubs) → check that the theme is the parent hub's, not the sub-hub's, on the browse page.

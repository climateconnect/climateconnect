# Refactor Browse Pages and Filter

**Status**: COMPLETED
**Type**: Frontend — architecture / refactor

---

## Problem Statement

The browse functionality (projects, organisations, members) was a single page with tabs sharing one filter component. This caused:
- Empty organisations/members pages when accessed directly (data only loaded for the projects tab)
- Complex cross-tab state management (`tabsWhereFiltersWereApplied` mechanism)
- Fragile URL handling (hash fragments for tab state + query params for filters = two systems)
- A 762-line `BrowseContent` monolith managing state for all three types simultaneously

The fix: split into separate pages at top-level URLs (`/browse`, `/organizations`, `/members`) with per-type page files and per-type content components. This follows the pattern already established by the events calendar page.

## Acceptance Criteria

- [x] Pages exist at `/browse` (projects), `/organizations`, `/members`
- [x] Each page loads its own data independently on access
- [x] Filter state is preserved when navigating between browse pages (URL params carry across)
- [x] Filter fields adapt based on the current data type
- [x] Query params use the platform `URLSearchParams` API (no manual string concatenation)
- [x] Backward compat: `/browse#members` → `/members`, `/browse#organizations` → `/organizations` (client-side redirect)
- [x] Hub variants: `/hubs/[hubUrl]/browse`, `/organizations`, `/members` (and sub-hub variants)
- [x] Tab clicks in `HubTabsNavigation` navigate between pages
- [x] Mobile bottom menu navigates between pages
- [x] All internal links updated to new URLs
- [x] Upcoming events band on projects page still works behind `EVENT_CALENDAR_FEATURE`
- [x] Old `BrowseContent`, `TabContentWrapper`, `HubBrowsePage` deleted

## Constraints

- Frontend-only changes
- No backend API changes
- Backward compatibility via URL redirects
- **US spelling in URLs** (`/organizations`); US spelling in code/API (`organizations`) — changed from spec to align with existing detail page at `/organizations/[slug]`
- `HubBrowsePage` used `getHubTheme(hubUrl)` (a bug — see Critical Finding 2)
- `BrowseContext` cannot be deleted (see Critical Finding 1)

## Final URL Structure

| Type | Global URL | Hub URL | Sub-hub URL |
|------|-----------|---------|-------------|
| Projects (incl. ideas, events) | `/browse` | `/hubs/<hub>/browse` | `/hubs/<hub>/<sub>/browse` |
| Organisations | `/organizations` | `/hubs/<hub>/organizations` | `/hubs/<hub>/<sub>/organizations` |
| Members | `/members` | `/hubs/<hub>/members` | `/hubs/<hub>/<sub>/members` |
| Events | `/events` | `/hubs/<hub>/events` | `/hubs/<hub>/<sub>/events` |

**Key decision**: `/browse` (not `/projects`) is the projects list URL because the page also includes ideas and events, making "projects" misleading. "Browse" matches the existing nav menu label. The mapping `projects → browse` is centralized in `getBrowsePathForType` in `urlOperations.ts`.

**US spelling**: `organizations` (not `organisations`) is used everywhere to align with the existing detail page at `/organizations/[slug]`. The page file is at `pages/organizations/index.tsx` (same directory as `[organizationUrl].tsx`).

## Reference Pattern: Events Calendar Page

The events page (`pages/events.tsx`, `pages/hubs/[hubUrl]/events.tsx`) is already a standalone Next.js page with its own SSR, `HubPageLayout` for hub chrome, and cross-page navigation. The browse pages follow the same pattern.

## Domain Context

### Type-to-URL mapping

The mapping from internal browse type names to URL path segments is centralized in `public/lib/urlOperations.ts`:

```typescript
const BROWSE_TYPE_TO_PATH: Record<string, string> = {
  projects: "browse",
  organizations: "organizations",
  members: "members",
};
```

Use `getBrowsePathForType(type)` and `getHubBrowsePathForType(type, hubUrl, subHubSegment?)` everywhere instead of hardcoding `tab === "projects" ? "/browse" : ...`.

### Architecture (what replaced the old)

```
pages/browse.tsx → WideLayout → FilterProvider → BrowseProjectsContent
pages/organizations/index.tsx → WideLayout → FilterProvider → BrowseOrganisationsContent
pages/members/index.tsx → WideLayout → FilterProvider → BrowseMembersContent

pages/hubs/[hubUrl]/browse.tsx → HubPageLayout → FilterProvider → BrowseProjectsContent
pages/hubs/[hubUrl]/organizations.tsx → HubPageLayout → FilterProvider → BrowseOrganisationsContent
pages/hubs/[hubUrl]/members.tsx → HubPageLayout → FilterProvider → BrowseMembersContent
```

Sub-hub pages re-export from parent hub file (e.g. `pages/hubs/[hubUrl]/[subHub]/browse.tsx` re-exports from `../browse`).

### Current architecture (what was replaced)

```
pages/browse.tsx → WideLayout → FilterProvider → BrowseContent (762 lines)
                                                              ↓
                                           TabContentWrapper × 3
                                           (projects, organizations, members)

pages/hubs/[hubUrl]/browse.tsx → HubBrowsePage (335 lines) → same tree + hub chrome
```

Hub browse page adds: `HubHeaderImage`, `HubContent` (ambassador, supporters, stats), `HubTabsNavigation`, linked hubs, custom theme, `DonationCampaignInformation`, `FabShareButton`.

## Implementation Phases

### Phase 1: Extract hooks from BrowseContent

Three hooks extracted from `BrowseContent.tsx` for reuse in the new components:
- `useBrowseData(type)` — per-type data fetching + pagination
- `useBrowseUrlSync` — URL ↔ filter sync
- `useUpcomingEvents` — upcoming events fetching (projects page only)

### Phase 2: Per-type content components

Three separate content components (no shared base, no `type` prop):
- `BrowseProjectsContent.tsx` → `ProjectPreviews` + upcoming events band
- `BrowseOrganisationsContent.tsx` → `OrganizationPreviews`
- `BrowseMembersContent.tsx` → `ProfilePreviews` (`showAdditionalInfo`)

Each renders: `FilterSection` (mobile only) + `FilterContent` + type-specific preview + `NoItemsFound` + `LoadingSpinner`. Each wraps in `<Container maxWidth="lg" disableGutters>` with `paddingTop` for spacing. Each reads `hubUrl` from `HubContext` for data scoping.

### Phase 3: Page routes + shared hub layout

**Global pages** (3 files):
- `pages/browse.tsx` — projects list (was `pages/projects/index.tsx`, renamed so `/browse` is a real page for backward compat)
- `pages/organizations/index.tsx` — organisations list (US spelling)
- `pages/members/index.tsx` — members list

Each has its own `getServerSideProps` (fetches filter choices + resolves location; no data fetch) and renders: `WideLayout` → `HubTabsNavigation` (with correct active tab) → `FilterProvider` → per-type content component → `MobileBottomMenu`.

**Hub layout** (`HubPageLayout.tsx`): shared hub chrome (WideLayout + theme, HubHeaderImage, HubContent, HubTabsNavigation, linked hubs, MobileBottomMenu, FabShareButton). Receives `children`, `activeTab`, `handleTabChange`, `hubUrl` (parent hub), `subHubSegment` as props.

**Hub pages** (6 files): `pages/hubs/[hubUrl]/browse.tsx`, `organizations.tsx`, `members.tsx` + sub-hub re-exports.

**Also**: `pages/hubs/[hubUrl]/events.tsx` is refactored to use `HubPageLayout`, removing ~100 lines of duplicated hub chrome boilerplate.

### Phase 4: Navigation and link updates

All internal links updated to use the central `getBrowsePathForType` / `getHubBrowsePathForType` utilities. `HubsDropDown` and `HubLinks` detect the current browse type from `router.pathname` (using `knownBrowseTypes = ["browse", "organizations", "members"]`) to preserve the current tab when switching between hubs. `HubLinkButton` uses the `activeTab` prop to construct linked hub URLs that stay in the current tab.

### Phase 5: Backward compat

`/browse` is now a real page (not a redirect), so old links work directly. Hash-based redirects still work for bookmarks:
- `/browse#members` → `/members` (client-side via `window.location.replace`)
- `/browse#organizations` → `/organizations` (client-side via `window.location.replace`)

`window.location.replace` (not `router.replace`) is used so the browser cancels any pending state, avoiding the double-redirect issue that occurs with SPA navigation when meta refresh is also set.

### Phase 6: Cleanup

**Deleted**: `BrowseContent.tsx`, `TabContentWrapper.tsx`, `HubBrowsePage.tsx`, old redirect pages at `pages/browse.tsx`, `pages/hubs/[hubUrl]/browse.tsx`, `pages/hubs/[hubUrl]/[subHub]/browse.tsx`

**Modified**:
- `FilterContext.ts` / `FilterProvider.tsx` — removed `tabsWhereFiltersWereApplied`
- `filterOperations.ts` — removed `getUnaffectedTabs`, simplified `applyNewFilters`
- `urlOperations.ts` — rewrote `encodeQueryParamsFromFilters` and `getFilterUrl` using `URLSearchParams`; added `getBrowsePathForType` and `getHubBrowsePathForType`
- `FilterProvider.tsx` — added `hubUrl` prop for initial data fetch scoping
- `_app.tsx` — added global `BrowseContext.Provider` (see Critical Finding 1)
- `pages/profiles/[profileUrl].tsx` — removed `BrowseContext.Provider`
- `pages/projects/[projectId]/index.tsx` — removed `BrowseContext.Provider`

## System Impact

### New files
- 3 hooks: `useBrowseData`, `useBrowseUrlSync`, `useUpcomingEvents`
- 3 content components: `BrowseProjectsContent`, `BrowseOrganisationsContent`, `BrowseMembersContent`
- 1 hub layout: `HubPageLayout`
- 1 utility: `getBrowsePathForType`, `getHubBrowsePathForType` (in `urlOperations.ts`)
- Page files: 3 global (`browse.tsx`, `organizations/index.tsx`, `members/index.tsx`) + 6 hub/sub-hub
- 1 SSR helper: `getHubBrowseTypeServerSideProps`

### Deleted files
- `BrowseContent.tsx`, `TabContentWrapper.tsx`, `HubBrowsePage.tsx`
- Old redirect pages: `pages/browse.tsx` (was redirect, now real page), `pages/hubs/[hubUrl]/browse.tsx` (was redirect, now real page), `pages/hubs/[hubUrl]/[subHub]/browse.tsx` (was redirect, now re-export)

### Key decisions made during implementation
1. **`/browse` instead of `/projects`**: The projects page includes ideas and events, making "projects" misleading. "Browse" is the existing nav label and preserves backward compat for all old `/browse` links.
2. **US spelling (`/organizations`)**: Changed from the original spec's UK spelling to align with the existing detail page at `/organizations/[slug]`. Coexists in the same directory.
3. **`window.location.replace` over `router.replace`**: Avoids the double-redirect issue with meta refresh fallbacks.
4. **Centralized path mapping**: `getBrowsePathForType` in `urlOperations.ts` prevents scattered `tab === "projects" ? "/browse" : ...` logic across many files.
5. **`HubLinkButton` handles both `/browse` and `/projects`**: Backward compat with old API data that still returns `/projects` URLs for linked hubs.

## Critical Findings

### 1. BrowseContext cannot be deleted

`ProjectMetaData.tsx` and `ProjectPreview.tsx` consume `useContext(BrowseContext)` to get `projectTypes` — they render on project detail pages and browse pages. Deleting `BrowseContext` breaks them.

**Fix**: Move `BrowseContext.Provider` to `_app.tsx` (global). Fetch `projectTypes` once at the app level. Remove providers from individual pages.

### 2. Hub theme: `parentHubUrl` vs `hubUrl`

`HubBrowsePage` called `getHubTheme(hubUrl)` (could be a sub-hub slug). `HubEventsPage` called `getHubTheme(parentHubUrl)`. Themes are a parent-hub concept — the events approach is correct. `HubPageLayout` now receives the **parent** `hubUrl` (not the effective/sub-hub URL), so `getHubTheme` is called correctly. This fixes a latent visual bug for Perth sub-hubs.

## Out of Scope

- Backend API changes
- SSR data fetching for browse pages (client-side remains)
- Events page filter behavior changes
- Browse page response caching (separate spec)
- Renaming `pages/organizations/` to align UK/US spelling (now aligned by using US spelling everywhere)

## Log

- 2026-04-29 — Task created
- 2026-08-17 — Implementation plan added. Key decisions: top-level URLs (no `/browse` prefix), UK spelling in URLs, client-side data fetch, per-type page files, `HubPageLayout` for shared hub chrome, `HubContext` for props drilling, `BrowseContext` moved to `_app.tsx`
- 2026-08-18 — Implementation completed. Major changes from spec:
  - **URL restructure**: `/browse` (not `/projects`) is the projects list URL, preserving backward compat. `/organizations` (US spelling) replaces `/organisations`.
  - **Centralized path mapping**: `getBrowsePathForType` / `getHubBrowsePathForType` in `urlOperations.ts` replaces scattered `tab === "projects" ? ...` logic across 8+ files.
  - **Backward compat**: `/browse` is now a real page (not redirect); only hash-based redirects (`/browse#members`, `/browse#organizations`) need client-side handling.
  - **`window.location.replace` over `router.replace`**: Fixes the double-redirect issue with meta refresh.
  - **Sub-hub fix**: `HubPageLayout` receives parent `hubUrl` (not sub-hub slug), fixing `getHubTheme` and logo/theme for sub-hubs.
  - **Hub chrome fixes**: Logo links, linked hub links, and hub dropdown links now preserve the current browse type (projects/organizations/members) when navigating between hubs.
  - **Data scoping fix**: `FilterProvider` now accepts `hubUrl` prop for initial data fetch scoping (was previously missing `hub` query param on page 1).
  - **Layout fix**: `<Container disableGutters>` in content components prevents double-padding when nested inside `HubPageLayout`.
  - **Sitemap updated**: `/browse` and `/organizations` added; hub browse + event pages included; `/browse` removed from NOT_LISTED.

# Refactor Browse Pages and Filter

**Status**: DRAFT
**Type**: Frontend — architecture / refactor

---

## Problem Statement

The browse functionality (projects, organisations, members) is a single page with tabs sharing one filter component. This causes:
- Empty organisations/members pages when accessed directly (data only loaded for the projects tab)
- Complex cross-tab state management (`tabsWhereFiltersWereApplied` mechanism)
- Fragile URL handling (hash fragments for tab state + query params for filters = two systems)
- A 762-line `BrowseContent` monolith managing state for all three types simultaneously

The fix: split into separate pages at top-level URLs (`/projects`, `/organisations`, `/members`) with per-type page files and per-type content components. This follows the pattern already established by the events calendar page.

## Acceptance Criteria

- [ ] Pages exist at `/projects`, `/organisations`, `/members`
- [ ] Each page loads its own data independently on access
- [ ] Filter state is preserved when navigating between browse pages
- [ ] Filter fields adapt based on the current data type
- [ ] Query params use the platform `URLSearchParams` API (no manual string concatenation)
- [ ] Redirects from old URLs: `/browse` → `/projects`, `/browse#organizations` → `/organisations`, `/browse#members` → `/members`
- [ ] Hub variants: `/hubs/[hubUrl]/projects`, `/organisations`, `/members` (and sub-hub variants)
- [ ] Tab clicks in `HubTabsNavigation` navigate between pages
- [ ] Mobile bottom menu navigates between pages
- [ ] All internal links updated to new URLs
- [ ] Upcoming events band on projects page still works behind `EVENT_CALENDAR_FEATURE`
- [ ] Old `BrowseContent`, `TabContentWrapper`, `HubBrowsePage` deleted

## Constraints

- Frontend-only changes
- No backend API changes
- Backward compatibility via URL redirects
- UK spelling in URLs (`/organisations`); US spelling in code/API (`organizations`)
- `HubBrowsePage` uses `getHubTheme(hubUrl)` (possibly a bug — see Critical Finding 2)
- `BrowseContext` cannot be deleted (see Critical Finding 1)

## Reference Pattern: Events Calendar Page

The events page (`pages/events.tsx`, `pages/hubs/[hubUrl]/events.tsx`) is already a standalone Next.js page with its own SSR, `HubPageLayout` for hub chrome, and cross-page navigation. The browse pages follow the same pattern.

## Domain Context

### UK/US spelling boundary

URL paths use UK English (`/organisations`); internal code and API use US English (`"organizations"`, `/api/organizations/`). Only "organisations"/"organizations" differs; "projects" and "members" map to themselves. A type mapping constant is defined once and used by all page files.

Note: `pages/organisations/` (UK, new) coexists with `pages/organizations/` (US, existing detail page at `/organizations/[slug]`). This naming tension is pre-existing and out of scope.

### Current architecture (what we're replacing)

```
pages/browse.tsx → WideLayout → FilterProvider → BrowseContent (762 lines)
                                                              ↓
                                          TabContentWrapper × 3
                                          (projects, organizations, members)

pages/hubs/[hubUrl]/browse.tsx → HubBrowsePage (335 lines) → same tree + hub chrome
```

Hub browse page adds: `HubHeaderImage`, `HubContent` (ambassador, supporters, stats), `HubTabsNavigation`, linked hubs, custom theme, `DonationCampaignInformation`, `FabShareButton`.

## Implementation Plan

The plan is structured as logical phases, all implemented in one change.

### Phase 1: Extract hooks from BrowseContent

Three hooks extracted from `BrowseContent.tsx` for reuse in the new components:

- **`useBrowseData(type)`** — per-type data fetching + pagination (`items`, `hasMore`, `nextPages`, `loadMore()`)
- **`useBrowseUrlSync`** — URL ↔ filter sync (`initializeFromUrl()`, `syncToUrl()`)
- **`useUpcomingEvents`** — upcoming events fetching (projects page only, behind `EVENT_CALENDAR_FEATURE`)

BrowseContent is refactored to compose these hooks (no behavior change). After the new pages work, BrowseContent is deleted.

### Phase 2: Per-type content components

Three separate content components (no shared base, no `type` prop):

| Component | Preview | Domain features |
|-----------|---------|-----------------|
| `BrowseProjectsContent.tsx` | `ProjectPreviews` | Upcoming events band |
| `BrowseOrganisationsContent.tsx` | `OrganizationPreviews` | — |
| `BrowseMembersContent.tsx` | `ProfilePreviews` (`showAdditionalInfo`) | — |

Each renders: `FilterSection` (search bar + filter toggle) + `FilterContent` (filter panels) + type-specific preview + `NoItemsFound` + `LoadingSpinner`. Each reads `hubUrl` from `HubContext` for data scoping. Each uses the hooks from Phase 1.

The duplication between components is ~20 lines (FilterSection/FilterContent/loading boilerplate). A shared base would add indirection without significant savings.

### Phase 3: Page routes + shared hub layout

**Global pages** (3 new files):
- `pages/projects/index.tsx`
- `pages/organisations/index.tsx`
- `pages/members/index.tsx`

Each has its own `getServerSideProps` (fetches filter choices + resolves location; no data fetch) and renders: `WideLayout` → `FilterProvider` → `HubTabsNavigation` (with correct active tab) → per-type content component → `MobileBottomMenu`.

**Hub layout** (1 new file):
- `HubPageLayout.tsx` — shared hub chrome (WideLayout + theme, HubHeaderImage, HubContent, HubTabsNavigation, linked hubs, MobileBottomMenu, FabShareButton). Reads `hubUrl`/`hubData`/`hubTheme`/`hubs` from `HubContext` (no props drilling). Receives `children`, `activeTab`, `handleTabChange` as props.

**Hub pages** (6 new files):
- `pages/hubs/[hubUrl]/projects.tsx`, `organisations.tsx`, `members.tsx`
- `pages/hubs/[hubUrl]/[subHub]/projects.tsx`, `organisations.tsx`, `members.tsx`

Each composes `HubPageLayout` + per-type content + `FilterProvider`. Sub-hub variants re-export from parent hub file (one directory up).

**Also**: `pages/hubs/[hubUrl]/events.tsx` is refactored to use `HubPageLayout`, removing ~100 lines of duplicated hub chrome boilerplate.

### Phase 4: Navigation and link updates

Update 7 link sources to new URLs (footer, landing pages, hub preview, hub links/dropdown, navigation header). The `HubsDropDown` needs special handling to preserve the current browse type (projects/organisations/members) when switching between hubs.

### Phase 5: Redirects

- `pages/browse.tsx` → client-side redirect reading `window.location.hash` (handles `#projects`/`#organizations`/`#members`)
- `pages/hubs/[hubUrl]/browse.tsx` → same pattern with hub prefix
- `pages/hubs/[hubUrl]/[subHub]/browse.tsx` → same with sub-hub prefix

Use `router.replace` (not `push`) to avoid polluting browser history. Add `<meta http-equiv="refresh">` fallback for crawlers.

### Phase 6: Cleanup

**Deleted**: `BrowseContent.tsx`, `TabContentWrapper.tsx`, `HubBrowsePage.tsx`

**Modified**:
- `FilterContext.ts` / `FilterProvider.tsx` — remove `tabsWhereFiltersWereApplied`
- `filterOperations.ts` — remove `getUnaffectedTabs`, simplify `applyNewFilters`
- `_app.tsx` — add global `BrowseContext.Provider` (see Critical Finding 1)
- `pages/profiles/[profileUrl].tsx` — remove `BrowseContext.Provider` (now global)
- `pages/projects/[projectId]/index.tsx` — same

## System Impact

### New files (18)

- 3 hooks: `useBrowseData`, `useBrowseUrlSync`, `useUpcomingEvents`
- 3 content components: `BrowseProjectsContent`, `BrowseOrganisationsContent`, `BrowseMembersContent`
- 1 hub layout: `HubPageLayout`
- 9 page files: 3 global + 6 hub/sub-hub
- 2 SSR helpers: `getBrowseServerSideProps`, `getHubBrowseTypeServerSideProps`

### Deleted files (3)

- `BrowseContent.tsx`, `TabContentWrapper.tsx`, `HubBrowsePage.tsx`

### Modified files (15)

- 2 context/provider (`FilterContext`, `FilterProvider`)
- 1 lib (`filterOperations`)
- 1 app shell (`_app.tsx`)
- 2 detail pages (remove `BrowseContext.Provider`)
- 3 redirect pages (browse + 2 hub browse)
- 1 events page (use `HubPageLayout`)
- 7 link update files (footer, landing, hub links, navigation)

## Critical Findings

### 1. BrowseContext cannot be deleted

`ProjectMetaData.tsx` and `ProjectPreview.tsx` consume `useContext(BrowseContext)` to get `projectTypes` — they render on project detail pages and browse pages. Deleting `BrowseContext` breaks them.

**Fix**: Move `BrowseContext.Provider` to `_app.tsx` (global). Fetch `projectTypes` once at the app level. Remove providers from individual pages.

### 2. Hub theme: `parentHubUrl` vs `hubUrl`

`HubBrowsePage` calls `getHubTheme(hubUrl)` (may be a sub-hub slug). `HubEventsPage` calls `getHubTheme(parentHubUrl)`. Themes are a parent-hub concept — the events approach is correct. The new `HubPageLayout` must use `parentHubUrl`. This may fix a latent visual bug for Perth sub-hubs.

## Out of Scope

- Backend API changes
- SSR data fetching for browse pages (client-side remains)
- Events page filter behavior changes
- Browse page response caching (separate spec)
- Renaming `pages/organizations/` to align UK/US spelling
- Staged apply on mobile filter UX (already implemented)

## Log

- 2026-04-29 — Task created
- 2026-08-17 — Implementation plan added. Key decisions: top-level URLs (no `/browse` prefix), UK spelling in URLs, client-side data fetch, per-type page files, `HubPageLayout` for shared hub chrome, `HubContext` for props drilling, `BrowseContext` moved to `_app.tsx`

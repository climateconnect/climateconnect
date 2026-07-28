# Paginate Projects (and Organizations) on Member Profile Page

**Date**: 2026-07-28
**Status**: DRAFT
**Type**: Bug — frontend
**Issue**: [climateconnect/climateconnect#1797](https://github.com/climateconnect/climateconnect/issues/1797)
**Related**: #2099 (Improve display of projects of an organisation — already fixed the equivalent problem on the organization page)

---

## Problem Statement

The member profile page (`/profiles/[profileUrl]`) shows a maximum of **12 projects** in the "My projects" / "This user's projects" section, even when the user is a member of more than 12 projects. The remaining projects are silently hidden — there is no "load more" control, no pagination UI, and no visual indication that additional projects exist.

The backend API `/api/member/<url_slug>/projects/` already returns paginated results (`MembersPagination`, `page_size = 12`, `max_page_size = 20`), but the frontend only reads `resp.data.results` from page 1 and discards `resp.data.next`. The same problem applies — to a lesser extent — to the "My organizations" / "This user's organizations" section, which also uses the same pagination (`/api/member/<url_slug>/organizations/`) and the same 12-item cap.

### Reproduction

1. Open a user profile page for a user who is a member of more than 12 projects (~30 such users exist in production).
2. Scroll to the "My projects" section.
3. Observe: only the first 12 projects are shown, with no way to see the rest.

### Expected

The user viewing the profile should be able to reach all of the profile owner's projects (and organizations). The exact UX should match the recently-shipped organization profile page fix (#2099): render the first page server-side, then load subsequent pages on demand via a "Load more" button.

---

## Investigation Findings

### Current frontend flow — profile page

`frontend/pages/profiles/[profileUrl].tsx` (see `getServerSideProps` and `getProjectsByUser`, `getOrganizationsByUser`):

- Calls `/api/member/<url_slug>/projects/` once in `getServerSideProps`.
- Returns only `parseProjectStubs(resp.data.results)` as the `projects` prop.
- **`resp.data.next` is discarded** — the frontend has no way to know whether more pages exist.
- Same pattern for `getOrganizationsByUser` → `resp.data.results` only.

`frontend/src/components/profile/ProfileRoot.tsx`:

- Receives `projects` and `organizations` as static props.
- Renders `<ProjectPreviews projects={projects} hubUrl={hubUrl} />` — without `loadFunc`, `hasMore`, or `parentHandlesGridItems`, so no pagination is enabled.
- Renders `<OrganizationPreviews organizations={organizations} />` — same.

### Current backend

`backend/climateconnect_api/views/user_views.py`:

- `ListMemberProjectsView` (line 466): `pagination_class = MembersPagination`, ordered by `-id`. No changes required.
- `ListMemberOrganizationsView` (line 497): `pagination_class = MembersPagination`, ordered by `id`. No changes required.

`backend/climateconnect_api/pagination.py`:

- `MembersPagination`: `page_size = 12`, `page_size_query_param = "page_size"`, `max_page_size = 20`.
- Standard DRF `PageNumberPagination` — supports `?page=N`. No changes required.

### Reference implementation — organization profile page (already fixed via #2099)

`frontend/pages/organizations/[organizationUrl].tsx`:

- `getServerSideProps` calls `getProjectsByOrganization`, which returns `{ projects, hasMore: !!resp.data.next }`.
- Both `projects` and `projectsHasMore` are passed down as props.
- `OrganizationLayout` holds three pieces of local state: `allProjects` (initialized from the SSR-provided first page), `hasMoreProjects` (initialized from `projectsHasMore`), `nextPage` (initialized to `2`), plus `isLoadingMore` for the button state.
- `handleLoadMoreProjects` calls `GET /api/organizations/<slug>/projects/?page=${nextPage}`, appends the parsed results to `allProjects`, updates `hasMoreProjects` from `resp.data.next`, and increments `nextPage`.
- `<ProjectPreviews projects={allProjects} hubUrl={hubUrl} parentHandlesGridItems />` — pagination is driven by the parent, and `parentHandlesGridItems` prevents the child from managing its own `gridItems` state.
- A `<Button>` labeled `texts.load_more` (falls back to `texts.loading` while a fetch is in flight) is rendered below the grid, gated on `hasMoreProjects`.

The same pattern must be replicated on the member profile page.

---

## Acceptance Criteria

### Projects section (primary fix — matches #1797)

- [ ] `getServerSideProps` in `frontend/pages/profiles/[profileUrl].tsx` returns a new prop `projectsHasMore: !!resp.data.next` alongside `projects`. Rename the helper's return shape to `{ projects, hasMore }` (mirror `getProjectsByOrganization`).
- [ ] `ProfilePage` forwards `projectsHasMore` to `ProfileRoot`.
- [ ] `ProfileRoot` holds `allProjects`, `hasMoreProjects`, `nextPage`, and `isLoadingMore` state for the projects list.
- [ ] Clicking "Load more" calls `GET /api/member/${profile.url_slug}/projects/?page=${nextPage}`, appends `parseProjectStubs(resp.data.results)` to `allProjects`, updates `hasMoreProjects` from `!!resp.data.next`, and increments `nextPage`.
- [ ] `<ProjectPreviews projects={allProjects} hubUrl={hubUrl} parentHandlesGridItems />` is used.
- [ ] A `<Button variant="outlined" color="primary" fullWidth sx={{ mt: 2 }}>` is rendered below the grid when `hasMoreProjects` is true. Label is `texts.load_more`, becomes `texts.loading` while `isLoadingMore` is true, and the button is `disabled` while `isLoadingMore`.
- [ ] All existing projects that were visible before the fix remain visible; ordering (`-id`, i.e. newest first) is unchanged.
- [ ] Empty state (`texts.not_involved_in_any_projects_yet`) still renders when the user has zero projects.

### Organizations section (secondary — closes the author's follow-up comment)

- [ ] Same treatment as projects, using `GET /api/member/${profile.url_slug}/organizations/?page=${nextPage}`.
- [ ] `getOrganizationsByUser` returns `{ organizations, hasMore }` and its `hasMore` value is threaded through as `organizationsHasMore`.
- [ ] `parseOrganizationStubs` continues to run on the newly loaded page so its shape matches the SSR-provided list.
- [ ] `<OrganizationPreviews organizations={allOrganizations} parentHandlesGridItems />` is used, with a matching "Load more" button gated on `hasMoreOrganizations`.
- [ ] Ordering (`id` ascending) is unchanged.

### Cross-cutting

- [ ] Load-more requests reuse the visitor's auth token via `apiRequest` with `token: cookies.get("auth_token")` — anonymous visitors must still be able to page through public data (matches SSR behavior: view is `AllowAny`).
- [ ] Requests are made with the current `locale` so translated fields stay consistent across pages.
- [ ] Failed load-more requests reset `isLoadingMore` to `false` in a `finally` block and log the error; the user can retry by clicking the button again.
- [ ] `yarn lint` passes; `yarn format` applied.

---

## Constraints and Non-Negotiable Requirements

- **Do not change the backend.** `ListMemberProjectsView` and `ListMemberOrganizationsView` already paginate correctly. Do not raise `MembersPagination.max_page_size` above 20 to try to fit "everything" in one request — this defeats the point and doesn't scale.
- **Do not switch to infinite scroll here.** The linked issue explicitly rejects infinite scroll for this page ("on this page we can not use infinite scrolling"). The `useInfiniteScroll` machinery inside `ProjectPreviews` / `OrganizationPreviews` must remain unused for this surface, which is why `parentHandlesGridItems` is required (it disables the child's internal grid-state management, and `hasMore` / `loadFunc` are not passed so no scroll observer fires).
- **Do not change `ProjectPreviews` or `OrganizationPreviews`.** The `parentHandlesGridItems` prop already exists specifically to support this pattern; no component-library change is needed.
- **Reuse existing i18n keys.** `texts.load_more` and `texts.loading` already exist (used by the organization page). No new translation keys required.
- **Keep the first page SSR-rendered.** Do not move the initial fetch to a client-side `useEffect` — SEO and initial paint depend on the SSR data.
- **Preserve `#projects` and `#organizations` anchor scroll behavior.** The existing `useEffect` in `ProfileRoot` that scrolls to `projectsRef` / `organizationsRef` on hash matches must still work after the refactor.

---

## Domain Context

### API contract

Both endpoints return the standard DRF `PageNumberPagination` envelope:

```
{
  "count": <int>,
  "next":  <absolute URL or null>,
  "previous": <absolute URL or null>,
  "results": [ ... ]
}
```

The frontend only inspects `results` and `next`. `next` is a URL, but we only use it as a boolean (`hasMore = !!resp.data.next`) and construct the next page URL ourselves with `?page=${nextPage}` — same as the organization page does.

### Why "Load more" (not next/previous or numbered pages)

The issue text speculates about "simple pagination with next/previous below the grid," but PR #2099 shipped a "Load more" button for the equivalent surface. Matching that pattern gives us:

- Visual consistency between the member and organization profile pages.
- No need to preserve URL state (`?page=`) on the profile page, which would otherwise complicate the shared `hubUrl` query string.
- One clear affordance instead of a pager most users will never need (fewer than 30 users are members of more than 12 projects).

### Files to touch

- `frontend/pages/profiles/[profileUrl].tsx`
  - `getProjectsByUser` → return `{ projects, hasMore }`.
  - `getOrganizationsByUser` → return `{ organizations, hasMore }`.
  - `getServerSideProps` → thread the two `hasMore` flags into props.
  - `ProfilePage` → forward props to `ProfileRoot`.
- `frontend/src/components/profile/ProfileRoot.tsx`
  - Accept `projectsHasMore`, `organizationsHasMore`.
  - Add local state and `handleLoadMoreProjects` / `handleLoadMoreOrganizations` handlers.
  - Add "Load more" buttons under each section.
  - Pass `parentHandlesGridItems` to `ProjectPreviews` and `OrganizationPreviews`.

Nothing outside these two files should need to change.

---

## Test Plan

Manual verification is sufficient — this is a pure UI wiring change on top of infrastructure already exercised by the organization page.

1. **User with > 12 projects**: open their profile, verify page 1 renders 12 projects, click "Load more", verify page 2 appends without re-fetching page 1, verify button disappears when `next` becomes `null`.
2. **User with exactly 12 projects**: no "Load more" button appears (backend returns `next: null` on the first page).
3. **User with < 12 projects**: no "Load more" button appears; existing behavior unchanged.
4. **User with 0 projects**: empty-state message renders unchanged.
5. **Repeat 1–4 for organizations.**
6. **Anonymous visitor**: same behavior — the endpoints are `AllowAny`.
7. **Hub context**: open the profile on a custom hub (`?hub=...`), verify subsequent pages still render inside the hub theme (no navigation, no reload).
8. **Anchor scroll**: navigate to `/profiles/<slug>#projects` and confirm the page still auto-scrolls to the projects section on load.
9. **Lint / format**: `yarn lint` and `yarn format` clean.

## Out of Scope

- Backend changes to pagination page size or ordering.
- Adding server-side filtering, sorting, or search to the projects/organizations list on the profile page.
- Applying the same fix to the `#ideas` section — no user has more than 12 supported ideas at the time of writing, and the current issue does not include ideas in scope. Track separately if it becomes a problem.
- Migrating either preview component to a shared "paginated grid" abstraction. That refactor can happen after all three surfaces (org page, member projects, member orgs) have shipped with the same duplicated pattern.

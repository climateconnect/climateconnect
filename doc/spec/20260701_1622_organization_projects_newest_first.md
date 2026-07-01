# Organization Projects: Newest First + Load More

**Date**: 2026-07-01
**Status**: DRAFT
**Type**: Enhancement — full stack

---

## Problem Statement

Two issues with how organization projects are displayed:

1. **Sorting**: The endpoint `GET /api/organizations/{slug}/projects/` returns projects sorted by `ProjectParents.id` ascending — oldest first. Visitors to an organization page expect to see the most recent projects first.

2. **Pagination**: The organization page (`frontend/pages/organizations/[organizationUrl].tsx`) only fetches the first page (12 projects). Pagination metadata (`next`, `count`) is discarded. Organizations with more than 12 projects have the rest silently hidden with no way to access them.

### Current behavior

- Backend view: `ListOrganizationProjectsAPIView` in `backend/organization/views/organization_views.py:960`
- Queryset: `ProjectParents.objects.filter(...).order_by("id")`
- Frontend: `getProjectsByOrganization` in `frontend/pages/organizations/[organizationUrl].tsx:392` — calls the API once server-side, extracts only `resp.data.results`, discards `next`/`count`
- Rendering: `<ProjectPreviews projects={projects} hubUrl={hubUrl} />` — no `loadFunc`/`hasMore`/`isLoading` props passed, so infinite scroll is disabled
- Result: oldest 12 projects shown, rest hidden

### Desired behavior

- Projects sorted by creation date, newest first
- "Load more" / infinite scroll to fetch subsequent pages (20 per page)
- Visitors see recent activity immediately and can browse all projects

---

## Acceptance Criteria

### Sorting
1. `GET /api/organizations/{slug}/projects/` returns projects ordered by their `created_at` descending (newest first)
2. Ordering is consistent across pages and regardless of page size

### Load More
3. Organization page shows the first 12 projects on initial load (unchanged)
4. A "Load More" button is displayed below the project list when more projects exist
5. Clicking the button fetches the next page (12 projects) and appends them to the list
6. Loading indicator shown on the button while fetching
7. Button disappears when all projects are loaded (`next` is null in the API response)
8. No infinite scroll — the page has multiple lists, so a manual button is required

### General
9. No regression: drafts remain excluded, permissions unchanged, pagination backend unchanged

---

## Constraints

- The `created_at` field on `Project` is `auto_now_add=True` and exists on all projects — no migration needed
- The queryset currently operates on `ProjectParents`, so ordering must cross the relation to `project__created_at`
- `ProjectPreviews` already supports `loadFunc`/`hasMore`/`isLoading` props — but uses `useInfiniteScroll` internally. A "Load More" button will need to be placed outside/after the component instead.
- Backend pagination class (`ProjectsPagination`) already returns `next`/`count` — no backend pagination changes needed

---

## AI Insights

- The `Project` model's default ordering (`["-rating", "-id"]`) is not used by this endpoint because the queryset is on `ProjectParents`, not `Project`. Changing the view's `.order_by()` is the correct lever.
- Sorting by `project__created_at` will produce a JOIN on the `Project` table. Since every `ProjectParents` row has a non-null `project` FK (required field), this is safe and performant.
- An index on `Project.created_at` may already exist from Django's `auto_now_add` — worth verifying for pagination performance on large orgs.
- A "Load More" button pattern is simpler than infinite scroll — state tracks `nextPage` (number) and `hasMore` (boolean). Button click calls the API with `?page=nextPage`, appends results, increments page, sets `hasMore` based on `resp.data.next`.
- The API always returns `next` (URL or null) in the paginated response — the frontend just needs to check it to know when to stop loading.

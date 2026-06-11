# Filter Similar Projects by Hub Context

## Overview

Enhance the similar projects recommendation in the project sidebar so that when a user is navigating within a climate hub context, only projects from that same hub are shown — rather than similar projects from the entire platform regardless of hub membership.

## Problem Statement

Currently, the "Similar Projects" sidebar on project detail pages (`GET /api/projects/{slug}/similar/`) returns globally similar projects without considering the user's hub context. When a user is browsing inside a climate hub (e.g., `?hub=berlin`), projects from unrelated cities or sectors appear alongside relevant local ones, diluting the hub-centric discovery experience that the rest of the platform already supports.

This inconsistency is especially noticeable for **location hubs** and **custom hubs**, where users expect to see work relevant to their regional or organizational community.

## User Stories

- As a user browsing a project within the Berlin hub, I want to see similar projects that are also in Berlin so I can discover local climate action.
- As a user browsing a project within a custom hub (e.g., Prio1), I want to see similar projects associated with that hub.
- As a user browsing a project without any hub context, I should continue to see globally similar projects (no behaviour change).

## Proposed Solution

Filter the `GET /api/projects/{slug}/similar/` response by the hub supplied via the `?hub=` query parameter, applying the same hub-location-to-project filtering logic already used by `ListProjectsView`.

The frontend already passes `?hub=` to this endpoint for serializer context purposes, so no frontend code changes are required — the backend simply needs to act on that parameter at the queryset level.

## Key Technical Considerations

### Backend

- The `SimilarProjects` list endpoint lives in `backend/organization/views/project_views.py` (class `SimilarProjects`).
- It currently calls `get_similar_projects(slug)` to obtain candidate URL slugs, then applies a basic project filter (draft, rating, active).
- The `?hub=` query parameter is partially already consumed via `create_context_for_hub_specific_sector(request)` in `get_serializer_context`, but **not** used to filter the queryset itself.
- `ListProjectsView` already contains a well-tested hub-filtering block that handles three hub types:
  1. **SECTOR_HUB_TYPE** — filters by sector assignments
  2. **LOCATION_HUB_TYPE** — filters by hub location geometries (PostGIS `coveredby`, `Union`, geographic containment)
  3. **CUSTOM_HUB_TYPE** — filters by `related_hubs` ManyToMany
- This logic is the canonical reference and should be reused or extracted into a shared helper/mixin to keep the behaviour consistent between list and similar-project endpoints.
- When no matching projects exist within the hub after filtering, the endpoint returns an empty list (no fallback to global results) so the frontend's empty-state messaging can be used.

### Frontend

- No changes are required; the existing `getSimilarProjects` helper in `pages/projects/[projectId]/index.tsx` already forwards `?hub={hubUrl}` when a hub context is present.
- The `ProjectSideBar.tsx` already variant-switches between `siblingProjects` (Wasser-Aktionswochen mode) and `similarProjects`, so an empty `similarProjects` array will render the correct empty state.

### Edge Cases

| Situation | Behaviour |
|---|---|
| Hub URL slug does not map to any `Hub` record | Ignore the `?hub=` param; return unfiltered similar projects (existing behaviour) |
| Hub has no associated locations (location hub) | Return empty list |
| Similar projects computed by algorithm are all outside the hub | Return empty list |
| Parent sub-hub (`hubUrl` points to a sub-hub with `parent_hub`) | Include parent hub projects as well (consistent with `ListProjectsView`) |
| Multiple `?hub=` values or malformed slugs | First valid hub wins, gracefully fall back to unfiltered |

## Acceptance Criteria

1. **Hub-scoped similar projects**: When `?hub=<url_slug>` is provided and resolves to a valid hub, `GET /api/projects/{slug}/similar/` returns only projects that belong to that hub (per the same rules as the projects list endpoint for that hub type).
2. **No-hub fallback**: When `?hub=` is absent or does not resolve to a hub, the endpoint returns globally similar projects exactly as today (no regression).
3. **Sub-hub inheritance**: If the requested `hub` has a `parent_hub`, projects from both the hub and its parent are included in results.
4. **Consistency with list endpoint**: The hub-filtering result matches what a user would see in the projects list under the same hub query.
5. **Frontend unaffected**: The existing `ProjectSideBar` renders without code changes; an empty result shows the "no projects yet" or equivalent empty state.
6. **Performance**: Response time remains within acceptable bounds (the added hub filter uses indexed lookups on `Location` and `related_hubs`).
7. **No breaking changes**: Existing API consumers without `?hub=` continue to receive identical payloads.
8. **Logging/monitoring**: Hub-filtered similar-project calls are observable in existing API request logs (no new instrumentation required).

## Non-Goals

- Modifying the similarity scoring algorithm itself (sector/language/parent weightings remain unchanged for the candidate pool).
- Adding pagination to the similar-projects endpoint (the result set is limited to 5 candidates, which is already small).
- Creating a new API endpoint; the change is confined to the existing `/similar/` ViewSet.

## AI Insights

**Risks and trade-offs:**

- Reusing the `ListProjectsView` hub-filtering block verbatim may introduce tight coupling if the list view's filtering rules evolve independently. A shared `HubProjectFilterMixin` or utility function is the recommended approach.
- Geographic PostGIS queries (`Union`, `coveredby`) can be slow on large location collections. Since similar-project results are capped at 5 candidate slugs first, the filtered queryset is usually small — but profiling is still advised if hubs have many locations.
- Empty results under a hub context are intentional and correct; do not add a silent fallback to global results — this would re-introduce the original problem.

**Hints:**

- The shared filtering logic in `ListProjectsView.get_queryset()` (lines ~252–310 of `project_views.py`) can be extracted into a queryset method on `ProjectQuerySet` or a standalone helper, then called from both `ListProjectsView` and `SimilarProjects`.
- The existing `get_serializer_context` already loads the `Hub` object via `create_context_for_hub_specific_sector`. That object (or the hub's URL slug) can be reused in `get_queryset` to avoid a second DB hit.
- `ProjectStubSerializer` does not need changes since it already handles hub-specific sector labels via context.

## Suggested Scope of Changes

Backend:

1. Refactor hub-filtering logic in `ListProjectsView` into a reusable helper (e.g., `apply_hub_filter(queryset, hub)` on `ProjectQuerySet` or a `HubProjectFilter` utility in `organization/utility/`).
2. Update `SimilarProjects.get_queryset()` to:
   - Load the hub from `?hub=` in the request query parameters.
   - Apply the hub filter to the candidate queryset before evaluating candidate slugs.
   - Fall back to the unfiltered queryset if the hub does not resolve.
3. Consider whether the hub filter should be applied **before** or **after** the candidate-slug filter: applying it before (on `Project.objects`) is more efficient since the DB can short-circuit early.

Frontend:

- None required for this change. If the sidebar's empty state is insufficient, a follow-up spec can improve empty-state messaging.

# Pre-populate related_hubs for Location Hub Projects

## Overview

Denormalize the location-hub-to-project relationship by pre-populating the `related_hubs` ManyToMany field on projects that fall within a location hub's geographic boundaries. This replaces expensive PostGIS geometry queries at read time with a simple indexed M2M lookup, making hub-filtered queries consistently fast across all hub types.

## Problem Statement

Location hub filtering currently relies on real-time PostGIS geometry operations (`Union` of hub locations, `coveredby` checks against project `centre_point` and `multi_polygon`). These spatial queries are expensive compared to the simple `filter(related_hubs=hub)` lookup used by custom hubs.

This affects two endpoints that share the same hub-filtering logic:

- `GET /api/projects/` (project list, including hub pages)
- `GET /api/projects/{slug}/similar/` (similar projects sidebar)

As hub locations accumulate more polygons and project counts grow, the PostGIS aggregation becomes a scaling bottleneck. Custom hubs already use the fast M2M path — location hubs should too.

## User Stories

- As a platform operator, I want hub-filtered project queries to perform consistently regardless of hub type, so that page load times remain predictable as the platform scales.
- As a developer maintaining the hub-filtering code, I want a single filtering path for all hub types, so that I don't have to maintain separate PostGIS and M2M logic branches.
- As a user browsing the global project list (no hub context), I want to see which hub a project belongs to, so I can discover local climate communities and navigate to the hub page.
- As a user viewing a project detail page, I want to see the project's hub membership with a link to the hub, so I can explore the broader hub community.

## Proposed Solution

When a project is created or its location is updated, determine which location hubs cover it (using the existing PostGIS geometry query) and populate `related_hubs` accordingly. When a location hub's boundaries change, re-evaluate and update the `related_hubs` for all affected projects.

After this change, the `LOCATION_HUB_TYPE` branch in `apply_hub_filter` can be simplified to use the same M2M path as `CUSTOM_HUB_TYPE`.

## Key Technical Considerations

### Sync Triggers

Three events require syncing `related_hubs` for location hubs:

1. **Project location changes** (project create or edit with new `loc`): check all location hubs to see which ones cover the project's new location; update `related_hubs` for that project.
2. **Hub location changes** (hub admin adds/removes locations from a hub): re-run the location filter query to find all projects within the updated boundaries; update `related_hubs` for affected projects.
3. **New location hub created**: run the query once to populate `related_hubs` for all matching projects.

### Custom Hub Exception

Custom hubs (`CUSTOM_HUB_TYPE`) must be excluded from automatic sync. Their `related_hubs` entries are manually managed and location-independent — the sync logic must never add or remove custom hub associations.

Sector hubs (`SECTOR_HUB_TYPE`) are legacy and not actively used, but can be included in the sync for completeness if desired.

### Existing Query Reuse

The PostGIS query that determines location hub membership already exists and is well-tested in `ListProjectsView.get_queryset()` and `apply_hub_filter()`. The sync logic should reuse this query rather than reimplementing it.

### Sync Implementation Options

- **Synchronous signal**: update `related_hubs` inside a Django `post_save` signal on `Project` or `Hub`. Simple but adds latency to save operations.
- **Async Celery task**: trigger a background task from the signal or view. Keeps save operations fast but introduces eventual consistency.
- **Periodic batch job**: a Celery Beat task that reconciles all location hub assignments. Catches drift from any source but adds staleness window.

A hybrid approach (async Celery task triggered immediately, with periodic batch as a safety net) balances speed and correctness.

### Data Migration

Existing projects need a one-time backfill to populate `related_hubs` for location hubs. This should be a Django management command that iterates over all location hubs and applies the PostGIS query to populate the M2M.

### Index Considerations

The `related_hubs` M2M table already has indexes on both foreign keys. No additional indexing is needed for the M2M lookup path. The PostGIS indexes on `Location.multi_polygon` and `Location.centre_point` remain needed for the sync queries.

## Acceptance Criteria

1. **Location hub projects have related_hubs set**: After project creation or location edit, the project's `related_hubs` includes all location hubs whose boundaries contain the project's location.
2. **Hub location changes trigger re-sync**: When a hub's locations are modified, all projects within the updated boundaries have their `related_hubs` updated accordingly.
3. **Custom hubs are untouched**: The sync logic never adds or removes `related_hubs` entries for `CUSTOM_HUB_TYPE` hubs.
4. **Query simplification**: The `LOCATION_HUB_TYPE` branch in `apply_hub_filter` uses the same M2M lookup as `CUSTOM_HUB_TYPE`, removing the PostGIS query from the read path.
5. **No regression in ListProjectsView**: The project list endpoint returns identical results for location hub filtering before and after the change.
6. **No regression in SimilarProjects**: The similar projects endpoint returns identical results for location hub filtering before and after the change.
7. **Backfill command exists**: A management command populates `related_hubs` for all existing projects against all location hubs.
8. **Staleness recovery**: A periodic Celery Beat task (or equivalent) catches any drift between actual geometry containment and `related_hubs` entries.

## Non-Goals

- Changing the similarity scoring algorithm.
- Modifying how custom hubs work.
- Removing the PostGIS query entirely (it's still needed for the sync logic and as a fallback).
- Changing the project list or similar projects API contracts.

## Side Effects / Future Opportunities

Once every project has a reliable `related_hubs` entry (including location hubs), the frontend can use this data beyond hub-filtered browsing:

- **Global project list**: show a hub badge/tag on each project card linking to its hub page, even when the user is not in a hub context.
- **Project detail page**: display the project's hub membership prominently (e.g. "Part of the Berlin Climate Hub" with link), giving users a path to discover the broader community.
- **Hub discovery**: users landing on a project from search or social sharing can navigate to the hub, increasing hub engagement.

Currently this is only possible for custom hubs (where `related_hubs` is manually set). With location hubs included, every project that falls within a hub boundary gets this discoverability for free.

## AI Insights

**Risks and trade-offs:**

- **Eventual consistency**: If sync is async (Celery), there's a window where `related_hubs` is stale. This is acceptable for hub pages (a few seconds delay) but should be documented.
- **Sync failure modes**: If the Celery task fails silently, projects may not appear in the correct hub until the periodic batch catches up. Monitoring/alerting on failed sync tasks is important.
- **Write amplification**: A hub with 100 locations touching 1000 projects means updating 1000 M2M rows on each hub location change. Batch updates (`bulk_create` on the through table) mitigate this.
- **Hub location changes are rare**: In practice, hub boundaries change infrequently compared to project creates/edits. Optimizing for the common case (project save) is the right trade-off.

**Hints:**

- The M2M through table for `related_hubs` is `organization_project_related_hubs`. Direct `bulk_create` on this table is faster than calling `.add()` in a loop.
- The `apply_hub_filter` function already returns `queryset.none()` when a location hub has no locations — this edge case must still work after simplification.
- Consider a feature flag to toggle between the old PostGIS read path and the new M2M read path during rollout.

## Suggested Scope of Changes

1. Create a Celery task that syncs `related_hubs` for a given project or hub.
2. Add Django signals (or view hooks) that trigger the sync task on project save and hub location change.
3. Create a management command to backfill `related_hubs` for all existing projects.
4. Add a periodic Celery Beat task for staleness recovery.
5. Simplify the `LOCATION_HUB_TYPE` branch in `apply_hub_filter` to use the M2M path.
6. Remove the PostGIS imports (`GeometryField`, `GISUnion`, `Distance`, `Cast`) from `apply_hub_filter` once the location hub branch is simplified (keep them in the sync utility).

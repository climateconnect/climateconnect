# Add Hub-Related Projects to the Sitemap

## Overview

Expand the sitemap to include hub browse pages (`/hubs/{hubUrl}/browse` and `/hubs/{hubUrl}/{subHub}/browse`) so that search engines can discover projects as they are presented within each hub context — mirroring how users actually browse the site.

## Problem Statement

The current sitemap includes hub landing pages (`/hubs/{hubUrl}`) but does **not** include hub browse pages (`/hubs/{hubUrl}/browse`). These browse pages are the primary content discovery surfaces within hubs: they show projects, organizations, and members filtered to that hub's scope. Without them in the sitemap, search engines cannot index the hub-specific project listings that users interact with daily.

The core design question is whether to:

- **(A)** Add hub browse pages to the sitemap as unique content entry points (recommended).
- **(B)** Duplicate individual project URLs with a `?hub=` query parameter for every hub a project belongs to.
- **(C)** Both.

## Why Option A Is Recommended (Browse Pages Only)

Projects do **not** have hub-scoped URLs. A project always lives at `/projects/{url_slug}` — the same URL regardless of which hub the user arrived from. The hub context is carried by a `?hub={hubUrl}` query parameter, which affects API responses (sector labels, similar projects, theming) but not the canonical page content.

This means:

| Approach | SEO Impact | Content Duplication | Implementation Cost |
|---|---|---|---|
| **A: Browse pages only** | Unique pages with unique content (filtered project lists). No duplication. | None | Low |
| **B: Project URLs with `?hub=`** | Same project page served at N+1 URLs (one global + one per hub). Google treats query-param variants as separate URLs, splitting page authority and risking duplicate-content penalties. | High | Medium (requires canonical tags, per-hub sitemap entries, pagination) |
| **C: Both** | Combines the benefits and risks of both. | High for project URLs | High |

**Option A** is the correct choice because:

1. Hub browse pages are genuinely unique content — each hub shows a different filtered set of projects, organizations, and members.
2. Search engines following hub browse page links will naturally discover individual project URLs through internal linking, without needing those project URLs duplicated in the sitemap.
3. The canonical project URL (`/projects/{url_slug}`) is already in the sitemap via the global projects list. Adding `?hub=` variants would split SEO authority across multiple URLs for the same content.
4. If hub-scoped project URLs are ever needed in the future, `<link rel="canonical">` tags should be added to project pages pointing to the hub-less URL — but that is a separate concern.

## Current State

### What the sitemap already includes

| Content Type | URL Pattern | Source |
|---|---|---|
| Static pages | `/`, `/about`, `/browse`, etc. | `globby` file scan |
| Projects (global) | `/projects/{url_slug}` | `GET /api/sitemap/projects/` |
| Organizations | `/organizations/{url_slug}` | `GET /api/sitemap/organizations/` |
| Members | `/profiles/{url_slug}` | `GET /api/sitemap/members/` |
| Hub landing pages | `/hubs/{url_slug}` | `getAllHubs()` → `GET /api/hubs/` |
| Blog posts | `/post/{url_slug}` | `getAllBlogPosts()` (Webflow) |

### What is missing

| Content Type | URL Pattern | Notes |
|---|---|---|
| Hub browse pages | `/hubs/{hubUrl}/browse` | Primary project discovery surface per hub |
| Sub-hub browse pages | `/hubs/{hubUrl}/{subHub}/browse` | Sub-hub project discovery |

## How Hub Filtering Works (Context for Implementers)

When a user visits `/hubs/berlin/browse`, the frontend makes API calls with `?hub=berlin`. The backend applies one of three filtering strategies based on the hub's `hub_type`:

- **Sector hubs** (`hub_type=0`): Filter projects by the hub's `sectors` M2M relationship via `project_sector_mapping`.
- **Location hubs** (`hub_type=1`): Filter projects using PostGIS spatial containment against the hub's `location` geometries.
- **Custom hubs** (`hub_type=2`): Filter projects by the `related_hubs` M2M field on `Project`.

Sub-hubs (`parent_hub` FK on `Hub`) inherit their parent's filtering scope — e.g., `/hubs/germany/berlin/browse` uses Berlin's hub data but also includes Germany-level results.

The hub browse pages are SSR'd via `getHubBrowseServerSideProps` in `frontend/src/components/hub/HubBrowsePage.tsx`, which fetches hub data, linked hubs, theme, and sector options.

## Acceptance Criteria

1. **Hub browse pages in sitemap**: `/sitemap/en.xml` and `/sitemap/de.xml` include `<url>` entries for each hub's browse page at `/hubs/{url_slug}/browse` (localized as `/{lang}/hubs/{url_slug}/browse`).
2. **Sub-hub browse pages in sitemap**: For hubs with `parent_hub` set, the sitemap includes `/hubs/{parent_slug}/{url_slug}/browse`.
3. **No duplicate project URLs**: Individual project URLs (`/projects/{url_slug}`) appear only once per language in the sitemap (the existing global entry). No `?hub=` variants are added.
4. **Priority and changefreq**: Hub browse pages receive `priority=1` and `changefreq=daily` (matching existing hub landing page treatment).
5. **lastmod field**: The `<lastmod>` for hub browse pages should reflect the most recent `updated_at` of any project associated with that hub (requires a backend endpoint or aggregation). If unavailable, omit `<lastmod>`.
6. **Sitemap index unchanged**: `/sitemapindex.xml` continues to reference `/sitemap/en.xml` and `/sitemap/de.xml` — no structural change needed.
7. **robots.txt unchanged**: Already points to `/sitemapindex.xml`.
8. **No regression**: Existing sitemap entries for hub landing pages, projects, organizations, members, and blog posts remain unchanged.
9. **Performance**: Sitemap generation time increases by no more than 2 seconds (one additional API call for hubs, plus a new endpoint or modification for hub-specific project metadata).

## Key Technical Considerations

### Frontend: Sitemap Generation (`frontend/pages/sitemap/[language_code_dot_xml].tsx`)

The `getEntries` function already handles a `"hubs"` case that calls `getAllHubs(locale)`. A new case (e.g., `"hub_browse_pages"`) or an extension of the existing `"hubs"` case should:

1. Fetch all hubs via `getAllHubs()`.
2. For each hub, generate a browse page URL: `/hubs/{url_slug}/browse`.
3. For sub-hubs (those with a `parent_hub`), generate: `/hubs/{parent_slug}/{url_slug}/browse`.
4. The `parseEntries` function needs a new path for hub browse pages that builds the correct URL structure.

**Sub-hub URL construction**: The `getAllHubs` response from `GET /api/hubs/` returns top-level hubs. Sub-hubs may need to be fetched separately (e.g., via `GET /api/sector_hubs/` or a new endpoint). The `ListHubsView` currently returns only top-level hubs (it filters by `parent_hub__isnull=True`); sub-hubs would need a separate fetch or the filter relaxed.

### Backend: Hub Data for Sitemap

The current hub list endpoint (`GET /api/hubs/`) returns hub objects but does **not** include `updated_at` (the `Hub` model lacks this field). Two options:

1. **Add `updated_at` to the `Hub` model**: Add an `auto_now=True` `DateTimeField`. This requires a migration and means hub `lastmod` reflects hub metadata changes, not project content changes.
2. **Create a dedicated sitemap endpoint for hubs**: `GET /api/sitemap/hubs/` that returns each hub's `url_slug`, `parent_hub.url_slug`, and the `MAX(updated_at)` of its associated projects. This is more accurate for sitemap purposes but requires a new endpoint.

Option 2 is recommended because it provides the most meaningful `lastmod` signal to search engines — the timestamp reflects when the content on that browse page last changed, not when hub metadata was edited.

### URL Pattern Mapping

| Hub Type | URL in Sitemap | Example |
|---|---|---|
| Top-level hub | `/hubs/{url_slug}/browse` | `/hubs/berlin/browse` |
| Sub-hub | `/hubs/{parent_slug}/{url_slug}/browse` | `/hubs/germany/berlin/browse` |
| Localized (non-EN) | `/{lang}/hubs/{url_slug}/browse` | `/de/hubs/berlin/browse` |

### Static Hub Landing Pages

Some hubs have custom static landing pages (e.g., `pages/hubs/em/index.tsx`, `pages/hubs/wuerzburg/index.tsx`). These are already covered by the hub entries in the sitemap. The browse pages are separate dynamic routes and should be added as additional entries.

## Non-Goals

- Adding individual project URLs with `?hub=` query parameters to the sitemap.
- Adding `<link rel="canonical">` tags to project pages (a separate SEO concern).
- Including hub browse page tabs (organizations, members) as separate sitemap entries — the browse page URL covers all tabs.
- Adding paginated browse page URLs (e.g., `/hubs/berlin/browse?page=2`) to the sitemap.

## AI Insights

**Risks and trade-offs:**

- The `Hub` model has no `updated_at` field. Using `MAX(project.updated_at)` for the sitemap's `<lastmod>` is more meaningful but requires either a new endpoint or a database query that could be slow for hubs with many projects. Indexing `updated_at` on `Project` and using a subquery should keep this performant.
- Sub-hubs share URL prefix with their parent (e.g., `/hubs/germany/berlin/browse`). Ensure the sitemap generates these correctly — the `getAllHubs()` response may not include sub-hubs depending on the endpoint's queryset filter. You may need to also call the sector hubs endpoint or add a query param to include sub-hubs.
- If a hub has zero projects (e.g., a newly created hub), its browse page still belongs in the sitemap — it's a valid page with an empty state, and it may gain projects in the future.

**Hints:**

- The existing `parseEntries` function in `[language_code_dot_xml].tsx` maps entry types to URL path segments. Adding a new entry type `"hub_browse"` with a custom path builder that handles parent/child relationships would be the cleanest approach.
- The `getAllHubs()` response already includes `parent_hub` data (as a nested object or slug). Use this to distinguish top-level vs. sub-hubs.
- For the `<lastmod>` backend endpoint, consider a `Hub.objects.annotate(latest_project=Max("projects_related_hubs__updated_at"))` queryset — the `projects_related_hubs` reverse relation is the M2M from `Project.related_hubs`.

## Suggested Scope of Changes

Backend:

1. **New endpoint** `GET /api/sitemap/hubs/` returning: `url_slug`, `parent_hub_url_slug` (nullable), and `latest_project_updated_at` for each hub with `importance > 0`.
2. **New serializer** `HubSitemapEntrySerializer` with those three fields.
3. **URL registration** in `backend/hubs/urls.py`.

Frontend:

4. **Extend `getEntries`** in `frontend/pages/sitemap/[language_code_dot_xml].tsx` to handle hub browse pages — either as a new entry type or by extending the existing `"hubs"` case.
5. **Update `parseEntries`** (or add a new parser) to build the correct browse page URL with parent/child hub hierarchy.
6. **Update `createSitemap`** to include hub browse page entries in the `<urlset>` output.

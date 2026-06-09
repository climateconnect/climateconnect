# Fix `get_similar_projects` KeyError for Unlisted Projects

## Overview

The similar-projects endpoint (`GET /api/projects/{slug}/similar/`) crashes with an unhandled `KeyError` when the source project is not present in the filtered candidate set. This produces a 500 Internal Server Error for any project page where the project is a draft, inactive, or has a rating below 49.

## Problem Statement

The `get_similar_projects()` function (in `backend/organization/utility/project.py`) builds a pandas DataFrame of candidate projects filtered by `is_active=True, is_draft=False, rating__gte=49`. It then attempts to look up the **source** project's attributes (sectors, language, parent) from that same filtered DataFrame using `sectors_df.loc[url_slug]`.

If the source project does not meet the filter criteria — e.g. it is still a draft, has `is_active=False`, or has a rating below 49 — the lookup raises a `KeyError`. This is an unhandled exception that surfaces as a 500 Internal Server Error to the end user.

### Impact

- **Draft project pages**: Any visit to a draft project's detail page triggers the similar-projects request via `getServerSideProps`. The draft project is excluded from the candidate set by `is_draft=False`, so the lookup always fails. This means every draft project page produces a 500 error on the similar-projects sub-request.
- **Low-rated or inactive projects**: Projects with `rating < 49` or `is_active=False` hit the same bug, even if they are published.
- **Post-publish navigation**: After a user publishes a draft project, the frontend redirects to the project page. If the project's rating is still below 49 at that point, the similar-projects request fails, and the user sees an error immediately after publishing — which was reported as "internal server error when publishing."

### Log evidence

Server logs (`error.log`, 2026-06-09T07:18:27) show the traceback:

```
File "backend/organization/utility/project.py", line 249, in get_similar_projects
    source_sectors = sectors_df.loc[url_slug].iloc[0]
KeyError: 'balkonien-26-in-kenzingen'
```

This error occurred on `/api/projects/balkonien-26-in-kenzingen/similar/`. No error was logged for the PATCH publish endpoint itself, suggesting the publish request may have succeeded and the 500 originated from the similar-projects call that followed during page navigation. However, this cannot be confirmed from the available logs alone — the user-reported "error when publishing" may be a separate issue. **Investigation via Sentry or additional log sources is recommended to determine whether the publish endpoint itself also fails.**

## User Stories

- As a user editing a draft project, I want to preview my project page without encountering server errors.
- As a user publishing a draft project, I want the project page to load successfully after publishing, including the similar-projects sidebar (which may be empty if no comparable projects exist yet).
- As a user visiting a low-rated project page, I want the page to load without errors, even if the similar-projects feature cannot find good matches.

## Acceptance Criteria

1. **No 500 on draft project pages**: Visiting a draft project's detail page does not produce a 500 error from the similar-projects endpoint. The endpoint returns an empty list (or gracefully omits the source project from similarity scoring).
2. **No 500 on low-rated/inactive projects**: The same applies to projects with `rating < 49` or `is_active=False`.
3. **Published projects still get recommendations**: For projects that meet the filter criteria, the similar-projects algorithm continues to work exactly as before — no regression in recommendation quality.
4. **Empty results are valid**: When no similar projects can be computed (e.g. the source project is the only one, or is excluded from the candidate set), the endpoint returns an empty results list with a 200 status.
5. **Frontend behaviour unchanged**: The `ProjectSideBar` already handles null/empty `similarProjects` gracefully. No frontend changes should be required.

## Non-Goals

- Changing the similarity scoring algorithm (sector/language/parent weightings).
- Changing the candidate filter criteria (`is_active=True, is_draft=False, rating__gte=49`).
- Adding pagination to the similar-projects endpoint.

## AI Insights

### Risks and trade-offs

- **Separating source project data from candidate set**: The root cause is that the function conflates "source project attributes" with "candidate projects for comparison." The source project's sectors, language, and parent ID should be fetched independently of the filtered candidate set. This is a conceptual fix, not just a try/except wrapper — swallowing the error silently would hide real data issues.
- **Empty DataFrame edge case**: If the candidate set is empty (no projects meet the filter), the function should return an empty list rather than crashing on the subsequent DataFrame operations (e.g. `df.drop(url_slug)` at line 287 would also fail).
- **Pandas performance**: The current approach loads all qualifying projects into a pandas DataFrame for in-memory similarity scoring. This is acceptable at current scale but may need revisiting if the project count grows significantly.

### Hints

- The source project's attributes (sectors, language, parent) are needed at lines 249, 260, and 261. These three lookups all depend on the source project being in the DataFrame. Querying them directly from the DB via `Project.objects.get(url_slug=url_slug)` (or similar) decouples source-project data from the candidate filter.
- The `SimilarProjects` view's `get_queryset()` (line 1790) already has access to `self.kwargs["url_slug"]` and could pass the source project object to `get_similar_projects` to avoid an extra DB query.
- Lines 287 (`df.drop(url_slug)`) would also raise a `KeyError` if the source project is not in the DataFrame — the fix should handle this too.
- The frontend's `getSimilarProjects` helper (`pages/projects/[projectId]/index.tsx`, line 455) already catches errors and returns `null`, so a 200 with empty results is the correct backend behaviour.

## Suggested Scope of Changes

Backend only (no frontend changes expected):

1. In `get_similar_projects()` (`backend/organization/utility/project.py`):
   - Query the source project's attributes (sector IDs, language, parent ID) directly from the database, independently of the filtered candidate DataFrame.
   - Guard against an empty candidate DataFrame — return an empty list early if no candidates exist.
   - When dropping the source project from the similarity DataFrame (line 287), handle the case where it is not present.
2. Consider adding a test case for: calling `get_similar_projects` with a URL slug that is not in the candidate set (draft project, low-rated project).

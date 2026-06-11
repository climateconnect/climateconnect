# Remove Dead `ListFeaturedProjects` Endpoint and Component

**Status**: DRAFT
**Type**: Backend + Frontend — cleanup
**Epic**: Dead Code Removal
**Date created**: 2026-06-09

---

## Problem Statement

The `ListFeaturedProjects` view (`backend/organization/views/project_views.py:1490`) serves the `/api/featured_projects/` endpoint. It returns up to 4 active, non-draft projects with `rating` between 0 and 99.

**This endpoint is dead code.** The frontend stopped calling it in commit `e8c9776a` ("Add webflow landing page (#1497)", March 2025) when the homepage switched to Webflow devlink components. The `<ProjectsSharedBox>` component that consumed the response is no longer imported by any page.

Keeping dead endpoints around creates maintenance burden (e.g. the recent `rating__gte=0` fix applied to this view for no practical benefit) and misleading code for future developers.

---

## Core Requirements

### What We're Removing

| Artifact | Location | Type |
|----------|----------|------|
| `ListFeaturedProjects` view class | `backend/organization/views/project_views.py:1490–1497` | Backend view |
| URL route `featured_projects/` | `backend/organization/urls.py:110–114` | Backend URL conf |
| `ProjectsSharedBox` component | `frontend/src/components/landingPage/ProjectsSharedBox.tsx` | Frontend component |
| Unused i18n text keys | `frontend/public/texts/project_texts.tsx:702–709` | Frontend i18n |

### What Stays

| Artifact | Reason |
|----------|--------|
| `ProjectStubSerializer` | Used by 3 other views (`ListProjects`, `ListSimilarProjects`, `ListUserProjects`) and `ProjectSuggestionSerializer` inherits from it. |
| `FixedPreviewCards` component | Used by `HubsBox.tsx`. |
| `backend/organization/migrations/0088_projectsshared.py` and `0091_delete_projectsshared.py` | Historical migrations — must not be deleted. |
| The `rating` field on `Project` | Still used by the ranking system and other filters. |

---

## System Impact

### Files Affected

| File | Change |
|------|--------|
| `backend/organization/views/project_views.py` | Delete `ListFeaturedProjects` class (lines 1490–1497) |
| `backend/organization/urls.py` | Delete the `featured_projects/` path entry (lines 110–114) |
| `frontend/src/components/landingPage/ProjectsSharedBox.tsx` | Delete entire file |
| `frontend/public/texts/project_texts.tsx` | Delete `climate_action_projects_shared_by_climate_connect_users` and `climate_action_projects_shared_by_climate_connect_users_text` keys (lines 702–709) |

### No Changes Required

| File | Reason |
|------|--------|
| `backend/organization/serializers/project.py` | `ProjectStubSerializer` is used by other views — keep it. |
| `frontend/src/components/landingPage/FixedPreviewCards.tsx` | Used by `HubsBox` — keep it. |
| Any backend migration | No model changes. |

---

## Acceptance Criteria

- [ ] `ListFeaturedProjects` class is removed from `project_views.py`
- [ ] `featured_projects/` URL route is removed from `urls.py`
- [ ] `ProjectsSharedBox.tsx` file is deleted
- [ ] Unused i18n text keys for `climate_action_projects_shared_by_climate_connect_users` and `climate_action_projects_shared_by_climate_connect_users_text` are removed from `project_texts.tsx`
- [ ] No import references to the deleted view remain in `urls.py`
- [ ] No import references to `ProjectsSharedBox` remain in the frontend
- [ ] Backend tests pass with no modifications (`python manage.py test organization --keepdb`)
- [ ] Frontend builds and lints cleanly (`yarn lint`)

---

## Non-Goals

- Removing the `rating` field or changing its type.
- Removing the `ProjectStubSerializer` (used elsewhere).
- Removing the `FixedPreviewCards` component (used by `HubsBox`).
- Cleaning up the old `ProjectsShared` model migrations (historical, must stay).
- Replacing the Webflow landing page with a new implementation.

---

## AI Agent Insights

### Why This Endpoint Became Dead

The homepage originally rendered a `<ProjectsSharedBox>` section showing curated projects. When the landing page migrated to Webflow devlink components (commit `e8c9776a`, PR #1497, March 2025), the `getProjects()` function in `pages/index.tsx` that called `/api/featured_projects/` was removed. The component and endpoint were left behind.

### The `rating__lte=99` Convention Is Unintuitive

The "featured projects" filter used `rating__lte=99` to mean "projects NOT boosted above default." Since the default rating is 100, this excluded all default-rated projects and showed only those explicitly set to ≤99. This is the opposite of what "featured" typically means. The Organization model has the same pattern (`organization_views.py:1004`) with help text confirming: *"organizations with a rating of 99 are being shown as featured."* This convention is worth noting for future developers but is out of scope for this cleanup task.

### No Risk of Breaking External Consumers

The endpoint is public (`AllowAny`) and unauthenticated, so external clients (if any) would receive a 404 after removal. Given it returns a small curated subset with no unique data, this is low risk. If external consumers exist, they would need to switch to `/api/projects/` instead.

---

## Implementation Notes

### Backend Removal

1. Delete the `ListFeaturedProjects` class from `project_views.py` (lines 1490–1497).
2. Delete the corresponding `path(...)` entry from `urls.py` (lines 110–114).

### Frontend Removal

1. Delete `frontend/src/components/landingPage/ProjectsSharedBox.tsx`.
2. Remove the two i18n text keys from `frontend/public/texts/project_texts.tsx` (lines 702–709). Ensure no other code references these keys (confirmed: only `ProjectsSharedBox.tsx` uses them).
3. Run `yarn lint` to verify no dangling imports or references.

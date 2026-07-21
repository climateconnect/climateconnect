# Super-admin Can Delete an Organisation

**Date**: 2026-07-13
**Status**: DRAFT
**Type**: Feature — full stack
**Issue**: [#2104](https://github.com/climateconnect/climateconnect/issues/2104)

---

## Problem Statement

Organisation super-admins have no way to delete their own organisation from the UI. Deletion can only be done by platform support staff via the Django admin panel, creating an unnecessary dependency. The desired outcome is self-service deletion with appropriate guardrails.

### User story

> As a super-admin of an organisation I want to be able to delete the organisation so that I can clean up without depending on support.

### Current behaviour

`OrganizationAPIView` in `backend/organization/views/organization_views.py` only implements `GET` and `PATCH`. The `DELETE` HTTP method returns 405. The edit page (`frontend/src/components/organization/EditOrganizationRoot.tsx`) has no delete button or confirmation dialog.

### Desired behaviour

1. A "Delete organisation" button is visible to super-admins on the organisation edit page.
2. Clicking it first checks the organisation's visible project count using the same filtered project set shown on the organisation page.
3. If visible projects exist, the dialog opens as a warning with the project count already shown and only a Cancel action.
4. If no visible projects exist, the dialog opens as a normal confirmation. Confirming deletes the organisation, cascades cleanup of members/followers/likes automatically, and redirects to the organisations listing with a success message.
5. Draft and inactive projects are not part of the blocking check and are deleted together with the organisation.

---

## Acceptance Criteria

### Backend
1. `DELETE /api/organizations/<url_slug>/` is implemented in `OrganizationAPIView`.
2. Only a user with `Role.ALL_TYPE` (super-admin) on the organisation can invoke it — enforced by the existing `OrganizationReadWritePermission` class (already handles `DELETE`; no changes needed there).
3. If the organisation has visible projects in the same filtered set used by the organisation projects page, the endpoint returns `HTTP 400` with: *"The organisation has X projects. Please first delete these projects or assign them to other organisations or users."* (where X is the visible-project count, not the raw total).
4. Draft and inactive projects are excluded from that blocking check and are deleted together with the organisation.
5. If no visible projects exist, `org.delete()` is called. Django's `CASCADE` on `OrganizationMember`, `OrganizationFollower`, and related models handles cleanup automatically.
6. On success, returns `HTTP 200` with `{"message": "Organisation {name} successfully deleted."}`.

### Frontend
6. A "Delete organisation" button (`color="error"`) is rendered on the edit page, visible only to super-admins.
7. Clicking the button first fetches the visible-project count using the same organisation projects data shown on the organisation page.
8. If the visible-project count is greater than zero, a `ConfirmDialog` opens with the warning text already populated and only a Cancel action.
9. If the visible-project count is zero, the `ConfirmDialog` opens as a normal delete confirmation.
10. On confirm, a `DELETE` request is sent to `/api/organizations/{url_slug}/`.
11. On `HTTP 200`: redirect to `/organizations` with a success query message consumed by `FeedbackContext.showFeedbackMessage()`.
12. On `HTTP 400` from a stale count/race condition: display the backend error message in the dialog or via `FeedbackContext.showFeedbackMessage()`.
13. New text keys are added to `frontend/public/texts/organization_texts.tsx` in both `en` and `de`.

---

## Technical Design

### Backend — `OrganizationAPIView.delete()`

**File**: `backend/organization/views/organization_views.py`

Add a `delete()` method to the existing `OrganizationAPIView` class (after `patch()`, ~line 821). Pattern mirrors `ProjectAPIView.delete()` in `backend/organization/views/project_views.py:1267`.

Logic:
1. Fetch org by `url_slug` → `HTTP 404` if not found.
2. Count the same visible project set used by `ListOrganizationProjectsAPIView` on the organisation page. This should exclude draft and inactive projects.
3. If the visible count is > 0, return `HTTP 400` with the parameterised warning message.
4. Call `org.delete()`.
5. Return `HTTP 200` with success message.

No URL change needed — `DELETE /api/organizations/<url_slug>/` is already routed via
`path("organizations/<str:url_slug>/", OrganizationAPIView.as_view(), ...)` in `backend/organization/urls.py`.

No permission change needed — `OrganizationReadWritePermission` already allows `DELETE` for `Role.ALL_TYPE` members (`backend/organization/permissions.py`).

### Frontend — Delete button and dialog

**File**: `frontend/src/components/organization/EditOrganizationRoot.tsx`

1. Add `deleteDialogOpen` state (`useState(false)`).
2. Add a visible-project count lookup for the organisation, using the same data source as the organisation projects page. If the count is greater than zero, open the dialog in warning mode before any delete request is sent.
3. Add `handleDeleteOrganization()` async function:
   - Calls `apiRequest({ method: "delete", url: "/api/organizations/" + encodeURI(organization.url_slug) + "/" ... })`.
   - On success: `router.push({ pathname: "/organizations", query: { message: texts.you_have_successfully_deleted_your_organization } })` — same redirect pattern as `saveChanges()`.
   - On error: read `error.response.data.message` and call `showFeedbackMessage({ message: ..., isError: true })`.
4. Add `handleDeleteDialogClose(confirmed)` (same pattern as `EditProjectRoot.tsx:215`): if confirmed and the visible-project count is zero → call `handleDeleteOrganization()`; always → `setDeleteDialogOpen(false)`.
5. Add a delete `Button` (`color="error"`, `variant="contained"`) below the `<EditAccountPage>` component in the JSX return — avoids modifying the shared `EditAccountPage` props. Guard visibility with the current user's role check (`role_type === ROLE_TYPES.all_type`).
6. Add a `<ConfirmDialog open={deleteDialogOpen} onClose={handleDeleteDialogClose} ... />` that uses a Cancel action only when visible projects exist, and a normal confirmation action when the visible-project count is zero.

**Note**: `EditAccountPage` does not accept `additionalButtons` or `onClickDelete` props. Placing the button **outside** `<EditAccountPage>` avoids modifying the shared component.

**File**: `frontend/public/texts/organization_texts.tsx`

| Key | English |
|---|---|
| `delete_organization` | "Delete organisation" |
| `do_you_really_want_to_delete_your_organization` | "Do you really want to delete your organisation?" |
| `deleting_organization_is_irreversible` | "This action is irreversible. All members, followers, draft projects, inactive projects, and related data will be removed." |
| `you_have_successfully_deleted_your_organization` | "You have successfully deleted your organisation." |
| `organization_has_projects_cannot_delete` | "The organisation has {count} projects. Please first delete these projects or assign them to other organisations or users." |

---

## Affected Files

| File | Change |
|---|---|
| `backend/organization/views/organization_views.py` | Add `delete()` method to `OrganizationAPIView` (~line 821) |
| `frontend/src/components/organization/EditOrganizationRoot.tsx` | Add delete state, handler, button, and `ConfirmDialog` |
| `frontend/public/texts/organization_texts.tsx` | Add 5 new text keys (`en` + `de`) |

No migration needed. No new models. No URL changes. No permission changes.

---

## Constraints & Assumptions

- **Visible projects block deletion**: published/active projects must be removed or reassigned first.
- **Draft and inactive projects** do not block organisation deletion and can be removed with the organisation.
- **Child organisations**: `parent_organization` FK uses `on_delete=SET_NULL`, so child orgs become top-level orgs after parent deletion — no special handling required.
- **Media files** (Azure Blob): `org.delete()` does not remove blob files. Out of scope — consistent with project deletion today.
- Redirect after delete goes to `/organizations` (the organisations listing tab), matching the issue requirement "goes back to the organisation tab."

---

## Out of Scope

- Cascade-deleting projects alongside the organisation.
- Django admin deletion path (already works).
- Email notifications on deletion.
- Bulk deletion.

---

## Verification

### Automated
1. `cd backend && pdm run python manage.py test organization --keepdb` — all existing tests pass.
2. New tests in `backend/organization/tests/`:
   - Super-admin deletes org with no projects → `HTTP 200`, org absent from DB.
   - Super-admin deletes org with projects → `HTTP 400`, org still in DB.
   - Editor (`READ_WRITE_TYPE`) attempts delete → `HTTP 403`.
   - Unauthenticated request → `HTTP 403`.

### Manual
3. Super-admin, org **without visible projects**: edit page → delete button visible → confirm → redirect to `/organizations` → success toast.
4. Super-admin, org **with visible projects**: edit page → delete button visible → warning appears before confirm, dialog shows only Cancel, org not deleted.
5. Org editor (not super-admin): edit page → delete button **not rendered**.
6. Post-deletion: org URL returns 404, org absent from search, former members no longer see it.
7. Org with only draft or inactive projects can still be deleted successfully.

---

## AI Insights

- `OrganizationReadWritePermission` was already written to handle `DELETE` even though no view method existed — intentional forward-planning; no permission changes needed.
- `project_parent_org` uses `on_delete=CASCADE`; without the 400 guard the view would silently delete all the org's projects. The guard is essential.
- `EditAccountPage` is a shared component used for both user profiles and org editing. Adding org-specific delete logic inside it would be inappropriate coupling — placing the button outside is the cleaner design.
- Redirect to `/organizations` matches the issue requirement "goes back to the organisation tab."

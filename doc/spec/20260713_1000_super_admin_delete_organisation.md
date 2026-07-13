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
2. Clicking it opens a confirmation dialog.
3. If the organisation has linked projects the backend returns an error and the frontend shows a warning message — deletion is blocked.
4. If there are no linked projects, confirming deletes the organisation, cascades cleanup of members/followers/likes automatically, and redirects to the organisations listing with a success message.

---

## Acceptance Criteria

### Backend
1. `DELETE /api/organizations/<url_slug>/` is implemented in `OrganizationAPIView`.
2. Only a user with `Role.ALL_TYPE` (super-admin) on the organisation can invoke it — enforced by the existing `OrganizationReadWritePermission` class (already handles `DELETE`; no changes needed there).
3. If `org.project_parent_org.exists()` is `True`, the endpoint returns `HTTP 400` with: *"The organisation has X projects. Please first delete these projects or assign them to other organisations or users."* (where X is the actual count).
4. If no projects exist, `org.delete()` is called. Django's `CASCADE` on `OrganizationMember`, `OrganizationFollower`, and related models handles cleanup automatically.
5. On success, returns `HTTP 200` with `{"message": "Organisation {name} successfully deleted."}`.

### Frontend
6. A "Delete organisation" button (`color="error"`) is rendered on the edit page, visible only to super-admins.
7. Clicking the button opens a `ConfirmDialog` asking the user to confirm.
8. On confirm, a `DELETE` request is sent to `/api/organizations/{url_slug}/`.
9. On `HTTP 200`: redirect to `/organizations` with a success query message consumed by `FeedbackContext.showFeedbackMessage()`.
10. On `HTTP 400` (projects exist): display the backend error message via `FeedbackContext.showFeedbackMessage()`.
11. New text keys are added to `frontend/public/texts/organization_texts.tsx` in both `en` and `de`.

---

## Technical Design

### Backend — `OrganizationAPIView.delete()`

**File**: `backend/organization/views/organization_views.py`

Add a `delete()` method to the existing `OrganizationAPIView` class (after `patch()`, ~line 821). Pattern mirrors `ProjectAPIView.delete()` in `backend/organization/views/project_views.py:1267`.

Logic:
1. Fetch org by `url_slug` → `HTTP 404` if not found.
2. Count `org.project_parent_org.count()` → if > 0, return `HTTP 400` with the parameterised warning message.
3. Call `org.delete()`.
4. Return `HTTP 200` with success message.

No URL change needed — `DELETE /api/organizations/<url_slug>/` is already routed via
`path("organizations/<str:url_slug>/", OrganizationAPIView.as_view(), ...)` in `backend/organization/urls.py`.

No permission change needed — `OrganizationReadWritePermission` already allows `DELETE` for `Role.ALL_TYPE` members (`backend/organization/permissions.py`).

### Frontend — Delete button and dialog

**File**: `frontend/src/components/organization/EditOrganizationRoot.tsx`

1. Add `deleteDialogOpen` state (`useState(false)`).
2. Add `handleDeleteOrganization()` async function:
   - Calls `apiRequest({ method: "delete", url: "/api/organizations/" + encodeURI(organization.url_slug) + "/" ... })`.
   - On success: `router.push({ pathname: "/organizations", query: { message: texts.you_have_successfully_deleted_your_organization } })` — same redirect pattern as `saveChanges()`.
   - On error: read `error.response.data.message` and call `showFeedbackMessage({ message: ..., isError: true })`.
3. Add `handleDeleteDialogClose(confirmed)` (same pattern as `EditProjectRoot.tsx:215`): if confirmed → call `handleDeleteOrganization()`; always → `setDeleteDialogOpen(false)`.
4. Add a delete `Button` (`color="error"`, `variant="contained"`) below the `<EditAccountPage>` component in the JSX return — avoids modifying the shared `EditAccountPage` props. Guard visibility with the current user's role check (`role_type === ROLE_TYPES.all_type`).
5. Add a `<ConfirmDialog open={deleteDialogOpen} onClose={handleDeleteDialogClose} ... />`.

**Note**: `EditAccountPage` does not accept `additionalButtons` or `onClickDelete` props. Placing the button **outside** `<EditAccountPage>` avoids modifying the shared component.

**File**: `frontend/public/texts/organization_texts.tsx`

| Key | English |
|---|---|
| `delete_organization` | "Delete organisation" |
| `do_you_really_want_to_delete_your_organization` | "Do you really want to delete your organisation?" |
| `deleting_organization_is_irreversible` | "This action is irreversible. All members, followers, and related data will be removed." |
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

- **Projects block deletion** (not cascade-delete): projects must be removed or reassigned first.
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
3. Super-admin, org **without projects**: edit page → delete button visible → confirm → redirect to `/organizations` → success toast.
4. Super-admin, org **with projects**: confirm → warning feedback, dialog closes, org not deleted.
5. Org editor (not super-admin): edit page → delete button **not rendered**.
6. Post-deletion: org URL returns 404, org absent from search, former members no longer see it.

---

## AI Insights

- `OrganizationReadWritePermission` was already written to handle `DELETE` even though no view method existed — intentional forward-planning; no permission changes needed.
- `project_parent_org` uses `on_delete=CASCADE`; without the 400 guard the view would silently delete all the org's projects. The guard is essential.
- `EditAccountPage` is a shared component used for both user profiles and org editing. Adding org-specific delete logic inside it would be inappropriate coupling — placing the button outside is the cleaner design.
- Redirect to `/organizations` matches the issue requirement "goes back to the organisation tab."

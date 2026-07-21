# Code Review — Super-admin Can Delete an Organisation

**Branch**: `delete-organization-by-supper-admin`
**Spec**: `doc/spec/20260713_1000_super_admin_delete_organisation.md`
**Reviewer**: automated review
**Date**: 2026-07-15

---

## Summary

The branch delivers a working end-to-end feature: a `DELETE` endpoint that blocks deletion when projects exist, plus a frontend delete button + confirmation dialog. The backend is solid and well-tested. The **frontend diverges from the spec in two ways**, neither of which blocks normal usage:

1. **Visibility is based on "is the creator" rather than "is a super-admin"** (`EditOrganizationRoot.tsx:269`). The spec (AC #6) and backend (`OrganizationReadWritePermission` requires `Role.ALL_TYPE`) use super-admin. In practice this works, because the member-management UI enforces exactly one super-admin (who *is* `organization.creator`), so the check is effectively equivalent. It is fragile, though — it relies on an invariant enforced only on the frontend (see Issue 1). Recommendation: harden to `user_role.role_type === ROLE_TYPES.all_type`, mirroring `EditProjectRoot`'s project-delete flow.
2. **Redirect target differs from the spec, but is an improvement.** The implementation redirects to the user's profile page (`#organizations`) rather than `/organizations`. On review this is beneficial (user directly sees the org is gone; `hubUrl` keeps hub context). See Issue 2 — no change required.

Both are discussed in detail below with recommendations.

---

## Backend

### `OrganizationAPIView.delete()` — `backend/organization/views/organization_views.py:821`

Works as intended and mirrors `ProjectAPIView.delete()`. Findings:

- **Good**: fetches by `url_slug` (404 if missing), counts `project_parent_org`, returns `HTTP 400` when projects exist, otherwise `org.delete()` and `HTTP 200` with a success message. Permission is enforced by `OrganizationReadWritePermission` (DELETE requires `Role.ALL_TYPE`) — correct.
- **Dead 404 branch (minor)**: Because `OrganizationReadWritePermission.has_permission` returns `False` (→ 403) whenever the org slug is not found, the view's own 404 `Response` is effectively unreachable for unauthenticated / non-member / unknown-slug requests. The 404 path only matters if the org exists but permission is denied, which can't happen. Harmless, but the 404 code is currently dead. The new test `test_delete_nonexistent_org_returns_404` already acknowledges this (accepts 403 or 404).
- **Project-count message wording**: Spec wording is *"The organisation has X projects. Please first delete these projects…"* The implementation returns *"The organisation has %(count)d project(s). Please first delete these projects…"* The `project(s)` form is an intentional, pragmatic way to handle singular/plural without maintaining two separate strings (confirmed acceptable during review). The backend builds its own `gettext` string and does **not** use the unused `organization_has_projects_cannot_delete` frontend key — fine, since the message is server-generated. No change needed.
- **Success message**: Spec: *"Organisation {name} successfully deleted."* Implementation: *"Organisation %(name)s successfully deleted."* ✅ Correct — the trailing `s` in `%(name)s` is the Python string-format **type specifier** (named string substitution), not a literal character, so the rendered output is exactly `Organisation <name> successfully deleted.`, matching the spec. No bug.

### `backend/organization/permissions.py` — unauthenticated guard (lines 92–93)

The branch added:
```python
if not request.user or not request.user.is_authenticated:
    return False
```
This is a **positive deviation** from "no permission changes needed." Without it, an unauthenticated `PUT`/`PATCH`/`POST`/`DELETE` to any org endpoint would pass `AnonymousUser` into a `ForeignKey` filter and raise `TypeError` → `HTTP 500` (the existing `ProjectReadWritePermission` already had this exact guard, see `permissions.py:40`). The change makes the org write endpoints behave consistently and returns a clean `403`. **Recommend keeping it**, but note it is a broader fix than just the delete feature and could be split out / called out in the PR description.

### Tests — `backend/organization/tests/test_delete_organization.py` (new, 190 lines)

Excellent coverage and matches the spec's Verification section:
- Super-admin deletes org with no projects → 200, org gone. ✅
- Super-admin deletes org with projects → 400, org remains, message contains count. ✅
- Editor (`READ_WRITE_TYPE`) → 403. ✅
- Unrelated user → 403. ✅
- Unauthenticated → 401/403. ✅
- Not-found → 403/404 (documents the dead-404 nuance). ✅

These tests are correct and should be kept.

---

## Frontend

### `frontend/src/components/organization/EditOrganizationRoot.tsx`

#### 🟡 Issue 1 — Visibility uses "is creator" rather than "is super-admin" (fragile, not a functional bug in practice)

```tsx
// line 269
const canDeleteOrganization =
  !!user && !!organization?.creator && organization?.creator?.url_slug === user?.url_slug;
```

The spec says the button is visible **only to super-admins** (`role_type === ROLE_TYPES.all_type`), and the backend enforces exactly that (`Role.ALL_TYPE`). This implementation instead checks whether the current user **is the recorded creator** of the organisation (`OrganizationSerializer.get_creator` returns the single `OrganizationMember` with `role__role_type=Role.ALL_TYPE`).

**Does it work?** In normal UI usage, **yes**. The frontend member-management UI prevents creating a second super-admin: when a super-admin edits another member, the role dropdown is filtered to `getRoleWeight(r.role_type) < getRoleWeight(user_role.role_type)` (`ManageMembers.tsx:209-214`), which excludes `all_type` (highest weight), and `verifyInput` enforces exactly one `all_type` member (`ManageOrganizationMembers.tsx:98-106`). So an org always has exactly one super-admin, and that super-admin *is* `organization.creator`. Hence `organization.creator.url_slug === user.url_slug` is effectively equivalent to "is the super-admin" — manual testing should pass.

**Why it's still worth fixing (robustness/clarity, not a blocker):**
- The single-super-admin invariant is enforced **only on the frontend**, not by the DB (`unique_together` is just `(user, organization)`, `models/members.py:146`) or backend. The **PATCH** member-promotion path (`UpdateOrganizationMemberView` + `OrganizationMemberSerializer`, no role validation) can still create a second `ALL_TYPE` member via a direct API call (curl/Postman). If that ever happens, `get_creator`'s `.get()` raises `MultipleObjectsReturned` and **500s the whole org edit page** (pre-existing serializer bug, see recommendation #5).
- The check couples the delete button to the *creator* concept rather than the *permission* concept, which is confusing and diverges from the spec and from `EditProjectRoot`, which correctly gates on `user_role.role_type === ROLE_TYPES.all_type` (`EditProjectRoot.tsx:245`).

**Recommendation**: For robustness and clarity, determine the current user's role in the org the same way `EditProjectRoot` does — in `frontend/pages/editOrganization/[organizationUrl].tsx`, compute `user_role` from the org's member list (`members.find(m => m.user && m.user.id === user.id).role`) and pass it as a prop to `EditOrganizationRoot`, then gate the button on `user_role.role_type === ROLE_TYPES.all_type`. This matches the backend/spec and removes the implicit coupling. Not a functional blocker given the current UI constraints.

#### 🟢 Issue 2 — Redirect target: intentional improvement (not a problem)

```tsx
// lines 169–184
const profileUrlSlug = user?.url_slug || organization?.creator?.url_slug;
const query = new URLSearchParams({
  message: texts.you_have_successfully_deleted_your_organization,
  ...(hubUrl ? { hub: hubUrl } : {}),
});
router.push(`/profiles/${profileUrlSlug}?${query.toString()}#organizations`);
```

The spec (AC #9, Constraints, AI Insights) and the issue say to redirect to **`/organizations`**. The implementation redirects to the user's **profile page** anchored at `#organizations` instead.

On review this is a **beneficial deviation**, not a defect:
- Going to the user's profile org section lets the user *directly see* the organisation is gone, which is more visible than the `/organizations` listing.
- The `hubUrl` query param is also correct: if the deletion happened inside a hub context, the user should stay in that hub context.

No change required. The spec/issue could be updated to reflect the intended behaviour, but that's documentation only.

#### 🟢 Good parts

- Delete button (`color="error"`, `variant="contained"`, `DeleteIcon`, `aria-label`) is placed **outside** `<EditAccountPage>`, exactly as the spec recommends, avoiding changes to the shared component. ✅
- `ConfirmDialog` wiring (`open`, `onClose={handleDeleteDialogClose}`, title, text, `yes`/`no` from general texts) mirrors `EditProjectRoot` and is correct. ✅
- Error path reads `error?.response?.data?.message` and falls back to `texts.server_error` (newly added) via `showFeedbackMessage({ isError: true })`, satisfying AC #10. ✅
- `deleteDialogOpen` state + `handleDeleteDialogClose(confirmed)` pattern matches the spec. ✅

### `frontend/public/lib/organizationOperations.ts:15`

Added `creator: organization.creator` to `parseOrganization`. This is only needed to support the (incorrect) creator-based visibility check and the redirect fallback. If Issue 1 is fixed via `user_role`, this line may become unnecessary — reconsider keeping it.

### `frontend/public/texts/organization_texts.tsx`

Added the five required keys (`delete_organization`, `do_you_really_want_to_delete_your_organization`, `deleting_organization_is_irreversible`, `you_have_successfully_deleted_your_organization`, `organization_has_projects_cannot_delete`) **plus** an extra `server_error` key, all in `en` + `de`. ✅ The `de` translations read naturally. (`organization_has_projects_cannot_delete` is currently unused on the frontend since the backend returns its own translated string — it can stay for future use or be removed.)

---

## Spec vs Implementation

| Spec item | Status | Notes |
|---|---|---|
| Backend `DELETE` endpoint | ✅ Done | works, tests pass |
| Only super-admin (Role.ALL_TYPE) | ✅ Backend | frontend gate uses creator; works in practice (UI enforces single super-admin) but fragile — **Issue 1** (non-blocking) |
| 400 when projects exist w/ count | ✅ Done | wording differs slightly (nit) |
| `org.delete()` cascades cleanup | ✅ Done | relies on CASCADE; matches spec |
| 200 + success message | ✅ Done | wording nit |
| Delete button `color="error"` | ✅ Done | |
| ConfirmDialog | ✅ Done | |
| Redirect to `/organizations` w/ success msg | 🟢 Diverged (good) | goes to `/profiles/...#organizations` — **Issue 2** (intentional improvement) |
| 400 shown via FeedbackContext | ✅ Done | |
| 5 text keys en+de | ✅ Done | + extra `server_error` |
| New tests (4 cases) | ✅ Done | 6 tests, exceeds spec; good |
| No permission changes | 🟡 Diverged (positive) | added unauth guard — beneficial, should be called out |
| No migration / URL / model changes | ✅ Done | |

---

## Recommendations

**Actionable (optional hardening, not a blocker):**
1. **Harden the visibility check (Issue 1).** In normal UI usage the feature works because the UI enforces exactly one super-admin (who is `organization.creator`). For robustness/clarity and consistency with `EditProjectRoot`'s project-delete flow, pass `user_role` from the page (like `EditProjectRoot`) and gate on `user_role.role_type === ROLE_TYPES.all_type`. This removes the implicit coupling to the single-admin invariant.

**No action required (noted for awareness):**
- **Redirect (Issue 2):** The profile-page redirect + `hubUrl` is a beneficial deviation — leave as is. Optionally update the spec/issue text to match.
- **permissions.py unauthenticated guard:** Keep it; mention in the PR that it is a small defensive improvement affecting all org write methods (prevents a 500 on unauthenticated writes), not just delete.
- **Minor polish:** Consider removing or documenting the now-dead 404 branch in `delete()`; reconsider the `creator` field in `parseOrganization` once Issue 1 is resolved.
- **Pre-existing bug to track separately (API-only):** `OrganizationSerializer.get_creator` raises `MultipleObjectsReturned` for orgs with >1 super-admin. The normal UI prevents this (the member-edit dropdown excludes `all_type` and `verifyInput` enforces exactly one), so it is only reachable via a direct API call (e.g. PATCH-promoting a member to `ALL_TYPE` through `UpdateOrganizationMemberView`, which has no role validation). This branch's creator-based check depends on the single-admin invariant, so a multi-admin org would 500 the edit page. Independent of this feature, but worth a follow-up fix (e.g. `OrganizationMember.objects.filter(role__role_type=Role.ALL_TYPE).first()`).

---

## Verdict

Backend: **approve**. Frontend: **approve with one optional hardening** — the feature works in normal UI usage. The only outstanding item is the optional robustness improvement to the visibility check (Issue 1): harden `canDeleteOrganization` to `user_role.role_type === ROLE_TYPES.all_type` for consistency with `EditProjectRoot`'s project-delete flow. Issue 2 (profile-page redirect + `hubUrl`) is a beneficial deviation, not a problem. Core functionality is sound and the test suite is strong.

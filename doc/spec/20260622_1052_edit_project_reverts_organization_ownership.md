# Edit Project Reverts Organization Ownership to Personal User

**Date**: 2026-06-22
**Status**: DRAFT — investigation findings, awaiting reproduction
**Type**: Bug — backend + frontend coupling
**Note**: Investigation done in plan mode; an identical copy is kept in `.kilo/plans/1782121189008-.md` for reference.

---

## Problem Statement

When a project is edited by a user who is a project admin but **not** a member of the project's owning organization, the project's `parent_organization` is incorrectly cleared. The project then appears as a personal project of the editing user, even though the user did not change the organization toggle.

### Reproduction (as reported)

1. User A creates a private project, invites User B. User B is a member of organization X. User A is NOT a member of X.
2. User B edits the project and changes it to an organization project of X. Project correctly shows as an organization project of X.
3. User A edits the project again (as admin of the project) without changing the organization toggle.
4. Bug: project reverts to a personal project of User A.

### Expected

The project should remain an organization project of X when User A does not toggle the parent ownership.

### Why it matters

- **Data integrity**: A non-member admin can silently detach a project from an organization they have no relationship with. The org then loses visibility/ownership of a project that was explicitly attached to it.
- **Trust**: The platform's data model conflates "project admin" with "owner of the parent organization." These are distinct roles.
- **Reproducibility**: The bug is reportedly reproducible on demand, but the exact client-side trigger has not been confirmed.

---

## Investigation Findings

### Data model (backend)

Project ownership is stored in `ProjectParents` (one row per project):

- `backend/organization/models/project.py` lines 325–352
- Two nullable FKs: `parent_organization` (the org, if any) and `parent_user` (the user, if any). Exactly one is populated.
- If `parent_organization` is `None`, the project falls back to `parent_user` (the original creator) — which is exactly the reported symptom.

### PATCH endpoint (backend)

`backend/organization/views/project_views.py` `ProjectAPIView.patch` (lines 764–975), gated by `ProjectReadWritePermission` (lines 33–66 in `backend/organization/permissions.py`).

`ProjectReadWritePermission` allows PATCH for any user with `ALL_TYPE` or `READ_WRITE_TYPE` role on the **project**. It does NOT check organization membership — so User A (project admin, non-org-member) is correctly authorized to PATCH.

The PATCH handler's parent-related logic, lines 933–949:

```python
if "is_personal_project" in request.data:
    if request.data["is_personal_project"] is True:
        project_parents = ProjectParents.objects.get(project=project)
        project_parents.parent_organization = None
        project_parents.save()
if "parent_organization" in request.data:
    project_parents = ProjectParents.objects.get(project=project)
    try:
        organization = Organization.objects.get(id=request.data["parent_organization"])
    except Organization.DoesNotExist:
        organization = None
        logger.error("Passed parent organization id {} does not exist")
    project_parents.parent_organization = organization
    project_parents.save()
```

Observations:

- The `is_personal_project: True` branch unconditionally clears `parent_organization`. It does not require a confirming `parent_organization: null` from the client, does not check that the user is a member of the org being detached from, and does not require the user to be staff.
- The `parent_organization` branch silently swallows `Organization.DoesNotExist` (only logs an error), then sets `parent_organization = None`. A stale org id in the payload would also wipe the org silently.
- The two branches have no ordering guarantee that prevents the `is_personal_project: True` branch from clearing org X while `parent_organization` is sent as X (depending on payload shape, the org gets re-attached; depending on absence, the org is lost).

### Edit form data flow (frontend)

**Initial state** — `frontend/pages/editProject/[projectUrl].tsx` lines 234–240 (`parseProject`):

```ts
const parseProject = (project) => ({
  ...project,
  image: getImageUrl(project.image),
  project_parents: project.project_parents[0],
  is_personal_project: !project.project_parents[0].parent_organization,
  sectors: project.sectors.map(...),
});
```

`is_personal_project` is a **derived** client-side flag — it is never round-tripped to or from the server. For an org project it is `false`.

**Switch handler** — `frontend/src/components/editProject/EditProjectContent.tsx` lines 135–150:

```ts
const handleSwitchChange = (event) => {
  if (event.target.checked && !project?.project_parents?.parent_organization && userOrganizations[0]) {
    // flipping ON (org): set parent_organization AND is_personal_project together
    handleSetProject({ ...project, project_parents: { ...project.project_parents, parent_organization: userOrganizations[0] }, is_personal_project: !event.target.checked });
  } else {
    // flipping OFF (personal) OR re-toggling when org is set: only flips is_personal_project
    handleChangeProject(!event.target.checked, "is_personal_project");
  }
};
```

The "off" branch flips `is_personal_project` but **does not clear `project_parents.parent_organization`**. After this call, the client state has `is_personal_project = true` and `parent_organization` still set to org X. The Switch's `checked={!project.is_personal_project}` re-binds and the UI snaps back to "personal mode" — masking the user's click intent.

**Org dropdown** — same file, lines 250–272:

```tsx
<SelectField
  controlled
  controlledValue={
    project?.project_parents?.parent_organization
      ? project?.project_parents?.parent_organization
      : userOrganizations[0]
  }
  onChange={(event) =>
    handleChangeProject(
      {
        ...project.project_parents,
        parent_organization: userOrganizations.find((o) => o.name === event.target.value),
      },
      "project_parents"
    )
  }
  options={userOrganizations}
/>
```

`options` is `userOrganizations` — the list of orgs the current user is a member of (from `/api/my_organizations/`). For User A this does **not** include org X. The `controlledValue` shows org X as the display value (correct), but X is not a valid option, so the dropdown is in a degraded state for a non-member admin.

**Payload builder** — `frontend/src/components/editProject/EditProjectRoot.tsx` lines 458–482:

```ts
const getProjectWithoutRedundancies = (newProject, oldProject) => {
  return Object.keys(newProject).reduce((obj, key) => {
    if (newProject[key] !== oldProject[key]) obj[key] = newProject[key];
    return obj;
  }, {});
};

const parseProjectForRequest = async (project, translationChanges) => {
  const ret = { ...project, translations: translationChanges };
  // ... other fields ...
  if (project.project_parents && project.project_parents.parent_organization)
    ret.parent_organization = project.project_parents.parent_organization.id;
  return ret;
};
```

- `oldProject` is the unparsed server response (line 199 of `pages/editProject/[projectUrl].tsx`) — it does **not** contain `is_personal_project` (the server never returns that field). So `curProject.is_personal_project = false` vs `oldProject.is_personal_project = undefined` is always a diff, and `is_personal_project` is always included in the payload (currently as `false`, which the backend ignores).
- `parseProjectForRequest` does not strip `is_personal_project`. If the Switch flipped it to `true` in client state, the PATCH body contains `is_personal_project: true`.
- `parent_organization` is only added if `project_parents.parent_organization` is truthy. If client state has `parent_organization` still set, `parent_organization: <id>` is also in the payload — the backend's `parent_organization` branch would re-attach the org, masking the bug for that specific case.

---

## Why It Happens — Best Current Hypothesis

The exact client-side trigger has not been empirically confirmed. The most defensible scenario is:

1. User A opens the edit form. `is_personal_project: false` (org mode). Switch shows "org." Dropdown displays org X.
2. `userOrganizations` for User A does NOT contain X (User A is not a member). The dropdown's `options` array is missing X — a degraded state.
3. User A edits some other field (e.g., description) and **accidentally clicks the Switch** (MUI Switches are small and visually similar to the surrounding typography).
4. The Switch's `onChange` fires. The `event.target.checked` is now `false` (turning off "org"). The condition on line 137 (`!project?.project_parents?.parent_organization`) is `false` (org X is still set), so the `else` branch on line 149 runs: `handleChangeProject(true, "is_personal_project")`. This sets `is_personal_project: true` in client state but leaves `project_parents.parent_organization` unchanged.
5. The Switch re-binds to `checked = !true = false` and visually shows "personal." The dropdown also re-renders (line 240 condition is now true: `{project.is_personal_project ? <MiniProfilePreview> : <SelectField>}`), so the user sees the "personal" view of the form.
6. User A continues editing (or just saves). On submit, `getProjectWithoutRedundancies` includes `is_personal_project: true` in the diff (the `oldProject` had no such field, so any client value is a diff). `parseProjectForRequest` does not strip it.
7. **The PATCH body may or may not include `parent_organization`**:
   - If it includes `parent_organization: X.id` (because `project_parents.parent_organization` is still set in client state), the backend's `parent_organization` branch re-attaches X. **No bug visible** — but the user's mental model is now wrong (they think they detached, but the org is back).
   - If it does not include `parent_organization` (e.g., if a re-render normalized `project_parents` to a fresh object and the diff dropped it, or if the `controlledValue` fallback to `userOrganizations[0]` swapped the value), the backend's `is_personal_project: True` branch clears the org. **Bug fires.**

The repro step in the bug report says "User A does not change the organization toggle" — but the toggle can be flipped by an incidental click, and the UI masks the change.

**This hypothesis is not yet confirmed by captured PATCH bodies.** It explains the symptom but the exact payload shape is unknown.

### Other hypotheses considered and rejected (for now)

- **Frontend defaults `is_personal_project` to `true` somewhere on mount.** Searched: `is_personal_project` is set in exactly two places in the entire frontend (`parseProject` on initial load, and the Switch `onChange` handler). No `useEffect` or initial-state code path sets it to `true`. Rejected.
- **Backend defaults `is_personal_project` to `true` for absent values.** Checked: the guard at line 933 requires the key to be present. Absent = no-op. Rejected.
- **Permission class strips the request for non-member admins.** Checked: `ProjectReadWritePermission` (lines 33–66 in `backend/organization/permissions.py`) does not check org membership at all. Project admin is sufficient. Rejected.

---

## Confirmed Backend Footguns (independent of trigger)

Even before the exact trigger is confirmed, the backend's PATCH handler at lines 933–949 has structural problems worth fixing in the same pass:

1. **`is_personal_project: True` is honored unconditionally.** It has no confirmation requirement, no auth gate, and no consistency check with the other parent field.
2. **`Organization.DoesNotExist` is silently swallowed** (lines 944–946) — only logged, then `parent_organization = None` is set. A stale id in the payload wipes the org without user feedback.
3. **No authorization on detach or re-attach.** A project admin (not necessarily a member of any involved org) can detach a project from any org or attach it to any org, as long as they know the org id. This is a pre-existing data-integrity issue not introduced by this bug.

---

## Options for the Fix

### Option A — Frontend-only minimal fix (recommended starting point)

Two surgical changes:

1. **`EditProjectContent.tsx` lines 135–150** — rewrite `handleSwitchChange` so flipping to personal also clears `project_parents.parent_organization` to `null` in client state. The Switch becomes a true "detach" toggle, not just a flag flip.
2. **`EditProjectRoot.tsx` lines 467–482** — add `delete ret.is_personal_project;` in `parseProjectForRequest`. The parent state is communicated to the backend solely via `parent_organization` (id for attach, `null` for detach, absent for no-op).

Diff size: ~10 lines, two files, no backend change.

Trade-offs:

- Does not close the backend footguns listed above. A future client regression (or a malicious request) can still exploit the `is_personal_project: True → wipe org` path.
- Does not address the attach-to-different-org case (a non-member could still attach to any org they know the id of). That is a separate concern, not introduced or worsened by this fix.
- Requires confirming via reproduction that the PATCH body in the bug case contains `is_personal_project: true` (or that fixing the Switch state makes the bug disappear).

### Option B — Combined frontend + backend fix

Apply Option A, plus:

1. **Delete the `is_personal_project` branch** at `project_views.py` lines 933–937. The client no longer sends it (Option A) and the backend no longer honors it.
2. **Harden the `parent_organization` branch** at `project_views.py` lines 938–949:
   - Return 400 (not silent `None`) for `Organization.DoesNotExist`.
   - Treat `parent_organization: null` as an explicit detach request.
   - Treat absent `parent_organization` as a no-op (preserves current behavior).
   - Add authorization: detach requires project admin AND (no current parent, or member of current parent, or staff). Attach to a different org requires project admin AND member of target org (or staff). **No change for "keep" (no parent field change).**

Trade-offs:

- Addresses all three backend footguns.
- More lines changed. Still moderate (~30 lines across both files, no permission class restructuring).
- Attach-to-different-org authorization is a behavior change. May want to ship as a separate PR.

### Option C — Backend-only (NOT recommended)

Strictly delete the `is_personal_project` branch and harden `parent_organization`. Does not work without client changes because the client's `parseProjectForRequest` would still send `parent_organization` as an id, and there is no way for the client to send `parent_organization: null` (the condition on line 479 requires it to be truthy). Detach would become impossible via this client. Rejected.

---

## Policy Decisions Needed

These were discussed with the user and partially resolved:

- **"Keep" case (no parent change by a non-member admin)**: ALLOWED. The user explicitly said "they are admin so that they can make changes, like changing the description" — preserving the no-op edit is the whole point. (Confirmed.)
- **Detach to personal by a non-member admin**: ALLOWED. Treated as a "revert to creator ownership." Project admin authority is sufficient. (Inferred from the user's policy statement; should be confirmed.)
- **Attach to a different org by a non-member admin**: PENDING. Two reasonable choices:
  - (i) Allowed if user is project admin (current behavior, pre-existing gap).
  - (ii) Requires membership in the target org. Safer but a behavior change.
- **Attach to a different org by a non-member of the CURRENT org but member of a target org**: ALLOWED under either policy. (Inferred.)
- **Legacy `is_personal_project` field**: PENDING. Remove from backend, or keep as a deprecated alias mapping to `parent_organization: null`?

---

## Next Steps

1. **Reproduce the bug in a running app.** Required environment: PostgreSQL (5432), Redis (6379), backend, frontend. Follow the four repro steps. Capture the PATCH body from DevTools (Network tab → PATCH `/api/projects/<slug>/`). Determine whether the body contains `is_personal_project: true` and/or `parent_organization`.
2. **Based on the PATCH body, choose the option:**
   - If body contains `is_personal_project: true` → Option A fixes the trigger; consider Option B for hardening.
   - If body contains only `parent_organization: <id>` and the org still gets wiped → there is a different frontend bug; investigate further before patching.
   - If body contains `parent_organization: null` and the org is wiped → frontend is working as designed, but the backend should refuse this for a non-member admin (Option B's auth gate on detach).
3. **Confirm policy decisions** above (detach authorization, attach authorization, legacy field handling).
4. **Write the patch** for the chosen option. Two files for Option A, four files for Option B.
5. **Tests** — write a Django test for the PATCH handler covering: project admin not in org edits with no parent change (org preserved), project admin not in org detaches (allowed under policy), project admin not in org attaches to non-member org (rejected under stricter policy).
6. **Frontend manual smoke test** — re-run repro after patch; confirm org is preserved on no-op edit; confirm detach and re-attach flows still work for in-org users.

---

## Open Questions

1. Is there a code path I missed in the frontend that sets `is_personal_project = true` without a user action? (Best current answer: no, but PATCH body capture will confirm.)
2. Is there a separate "is parent field changeable" permission concept in the codebase that should be reused? (Best current answer: no, the codebase has no such concept.)
3. Should attaching to a different org be open to any project admin, or restricted to members of the target org? (User input needed.)
4. Should the legacy `is_personal_project` field be removed from the backend, or kept for backward compatibility? (User input needed.)
5. Are there other frontend edit flows (e.g., the mobile app, if any) that hit the same PATCH endpoint with the same bug? (Out of scope for this doc; check separately if needed.)

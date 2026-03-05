# Remove Project Tags from the Frontend

**Status**: DRAFT
**Type**: Cleanup / Technical Debt
**Date and time created**: 2026-03-05 10:00 UTC
**Date Completed**: TBD
**Related GitHub Issue**: N/A
**Related Specs**:
- [`doc/mosy/architecture_overview.md`](../mosy/architecture_overview.md)

## Problem Statement

Last year, project tags were replaced by sectors as the mechanism for categorising projects on the platform. However, several frontend files still reference the old `tags` / `project_tags` data structure. This dead code must be removed before the backend team can safely delete the `ProjectTags`, `ProjectTagging`, and `OrganizationFieldTagging` models and the corresponding database tables.

The backend serializer (`ProjectSerializer`) already carries a `# TODO (Karol): Remove this field once the frontend is updated` comment on the `tags` field, confirming that removal is explicitly waiting on the frontend clean-up described here.

**Core Requirements (User/Stakeholder Stated):**

1. Identify and remove all frontend code that reads, transforms, or sends project-tag data.
2. Ensure no regression is introduced in the project create (`/share`), project edit (`/editProject/[projectUrl]`), and manage-members (`/manageProjectMembers/[projectUrl]`) flows.
3. Remove the `tags` property from the `Project` TypeScript type in `src/types.ts`.
4. The clean-up must be verifiable — i.e. after the change, searching the source tree for `project_tag`, `project_tags`, and `\.tags` (on a project object) should return zero hits outside of `OrganizationTagging`-related files (which are unrelated to this task).
5. Produce a clear summary of every file changed so the backend team can confidently proceed with removing the backend models.

### Non Functional Requirements

- No new dependencies introduced.
- All existing ESLint / TypeScript checks must continue to pass (`yarn lint`).
- Manual regression test on the share-project and edit-project flows.

### AI Agent Insights and Additions

**Files identified during investigation that need changes:**

| File | Location | What needs removing |
|------|----------|---------------------|
| `frontend/src/components/editProject/EditProjectRoot.tsx` | Line 417 | `if (project.tags) ret.project_tags = project.tags.map((t) => t.id);` — dead branch that maps old tags to a `project_tags` payload field |
| `frontend/src/components/shareProject/ShareProjectRoot.tsx` | Line 434 | `project_tags: project?.project_tags?.map((s) => s.key),` — sends a `project_tags` array to the API even though project objects are never populated with `project_tags` during the share flow |
| `frontend/pages/editProject/[projectUrl].tsx` | Line 237 | `tags: project.tags.map((t) => t.project_tag),` — the `parseProject` helper maps the API's `tags` array into a local `tags` property on the project state. Once the backend stops returning `tags`, this will throw. Even before that it is dead weight. |
| `frontend/pages/manageProjectMembers/[projectUrl].tsx` | Line 209 | `tags: project.tags.map((t) => t.project_tag.name),` — the `parseProject`-equivalent helper in this page also reads `project.tags`. The resulting `tags` array is set on the component state but never used in the render tree (confirmed by grep — no component in `ManageProjectMembers` or its children reads `project.tags`). |
| `frontend/src/types.ts` | Line 46 | `tags?: any[];` — optional `tags` property on the `Project` type should be removed. |
| `frontend/public/lib/getOptions.ts` | Lines 26–42 | `getProjectTagsOptions()` — a complete exported function that fetches `/api/projecttags/`. It is **never imported anywhere** in the codebase and can be deleted entirely. |

**i18n / translations check:**
No frontend text keys (`public/texts/`) or backend Django `.po` translation strings referencing project tags were found. There is nothing to clean up in i18n.

**Verification step:**
After implementing the changes, run:
```bash
grep -r "project_tag\|\.tags" frontend/src frontend/pages --include="*.ts" --include="*.tsx" --include="*.js"
```
Expected: zero results (or only unrelated `OrganizationTagging` references).

**Backend context (for reference — not changed in this task):**
The backend `ProjectSerializer` in `backend/organization/serializers/project.py` already has two `# TODO (Karol): Remove this field` comments on the `tags` field and its `get_tags` method. After this frontend task is merged, the backend can safely:
- Remove the `tags` field from `ProjectSerializer`
- Remove `ProjectTaggingSerializer` and `ProjectTagsSerializer` from `backend/organization/serializers/tags.py`
- Remove the `ProjectTags`, `ProjectTagging`, and `OrganizationFieldTagging` models from `backend/organization/models/tags.py`
- Remove the corresponding migration

## System impact

- only removing obsolete code

## Technical Solution Overview

[To be filled by the development agent]

### Files to modify

1. **`frontend/src/types.ts`**
   - Remove `tags?: any[];` from the `Project` type.

2. **`frontend/pages/editProject/[projectUrl].tsx`**
   - In `parseProject`, remove the `tags: project.tags.map((t) => t.project_tag),` line.

3. **`frontend/pages/manageProjectMembers/[projectUrl].tsx`**
   - In the project-parsing helper, remove the `tags: project.tags.map((t) => t.project_tag.name),` line.

4. **`frontend/src/components/editProject/EditProjectRoot.tsx`**
   - In `parseProjectForRequest`, remove the line `if (project.tags) ret.project_tags = project.tags.map((t) => t.id);`.

5. **`frontend/src/components/shareProject/ShareProjectRoot.tsx`**
   - In `formatProjectForRequest`, remove the line `project_tags: project?.project_tags?.map((s) => s.key),`.

### Testing

- Run `yarn lint` — must pass with no new errors.
- Manually test the `/share` flow: create a project end-to-end and verify it is published successfully.
- Manually test the `/editProject/[projectUrl]` flow: edit an existing project and save.
- Manually test the `/manageProjectMembers/[projectUrl]` flow: verify the page loads without errors.

## Log

- 2026-03-05 10:00 - Task created. Investigation complete. All affected files identified.

## Acceptance Criteria

- [ ] `tags?: any[]` is removed from the `Project` TypeScript type in `src/types.ts`.
- [ ] `parseProject` in `pages/editProject/[projectUrl].tsx` no longer maps `project.tags`.
- [ ] Project-parse helper in `pages/manageProjectMembers/[projectUrl].tsx` no longer maps `project.tags`.
- [ ] `parseProjectForRequest` in `EditProjectRoot.tsx` no longer sends `project_tags`.
- [ ] `formatProjectForRequest` in `ShareProjectRoot.tsx` no longer sends `project_tags`.
- [ ] `yarn lint` passes with no new errors or warnings.
- [ ] Share-project flow works end-to-end without errors.
- [ ] Edit-project flow works end-to-end without errors.
- [ ] Manage-project-members page loads without errors.
- [ ] Grep for `project_tag` and `\.tags` in frontend source returns zero project-tag-related hits.


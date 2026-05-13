# Hide Collaboration Sections for Events

**Status**: DRAFT
**Type**: Feature
**Date and time created**: 2026-05-13 13:20
**GitHub Issue**: [#1981](https://github.com/climateconnect/climateconnect/issues/1981)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260416_1000_event_registration_custom_fields.md`](./20260416_1000_event_registration_custom_fields.md)

---

## Problem Statement

The collaboration feature ("Are you looking for people to help organizing the event?" toggle on forms, and the "Collaboration" section on the project detail page) is being temporarily hidden across all project types as part of the pre-launch polish. Stakeholders intend to bring these elements back later, so the code must be preserved and only hidden from view. This is distinct from the "in collaboration with" organizations display on the project detail page, which is a separate feature and must remain untouched.

**Core Requirements (User/Stakeholder Stated):**

1. **On the project create form** (`EnterDetails.tsx` / `ShareProject` flow): do not render the `collaborators_welcome` toggle section.
2. **On the project edit form** (`EditProjectContent.tsx` / `EditProjectRoot` flow): do not render the `collaborators_welcome` toggle section.
3. **On the project detail page** (`ProjectContent.tsx`): do not render the entire "Collaboration" content block (lines 352–368).
4. **Do not delete any code** — use conditional rendering (e.g. `{false && <... />}` or a comment guard) so the sections can be restored later with a single change.

> ⚠️ **Important distinction**: the "in collaboration with" organizations line on the project detail page (`ProjectContent.tsx` lines 257–270) is a **separate feature** with a similar name. It must **not** be hidden or modified by this task.

**Explicitly Out of Scope (this task):**
- Removing the `collaborators_welcome` field from the data model or API.
- Hiding or modifying the "in collaboration with" organizations display.
- Any backend changes.

### Non-Functional Requirements

- **No breaking changes** to API contracts or data models.
- **Preserve code**: the JSX and styling for the hidden sections must remain in the source files, guarded by a simple hide flag.
- **Toggle-less change**: this is a temporary product decision, not behind a feature toggle.
- **Accessibility**: if the section is hidden, no focusable elements inside it should be reachable by keyboard navigation.

### AI Agent Insights and Additions

- **Create form location**: in `EnterDetails.tsx`, the collaboration toggle is rendered at lines 338–358 inside a `<div className={classes.block}>`. Wrap this entire block in a conditional that always evaluates to false (e.g. `{false && (...)}`) or comment it out, preserving the code for later restoration.
- **Edit form location**: in `EditProjectContent.tsx`, the collaboration toggle is rendered at lines 250–281 inside a `<div className={classes.block}>`. It also conditionally shows the delete button for narrow screens inside the `collaborators_welcome` block. Since the delete button is being moved out by the parallel "Edit Project Form Button Reorganization" task, you only need to hide the toggle block itself. Wrap lines 250–281 in a conditional that always evaluates to false.
- **Project detail page location**: in `ProjectContent.tsx`, the Collaboration section is the `<div className={classes.contentBlock}>` at lines 352–368. It contains a heading with `texts.collaboration`, the `CollaborateContent` component (when `collaborators_welcome` is true), or a "not looking for collaborators" message. Wrap this entire block in a conditional that always evaluates to false.
- **"In collaboration with" is off-limits**: the organizations display at lines 257–270 (`project.collaborating_organizations`) is a separate feature and must not be touched.
- **Edge case**: existing projects may already have `collaborators_welcome = true`. Hiding the toggle on edit and the section on the detail page does not change the stored value. The backend will continue to return `collaborators_welcome` in the API response, but the UI simply won't display it. This is acceptable because the field is preserved for future use.
- **No tests to remove**: there are no existing tests specifically for the collaboration toggle. If tests assert on the presence of the collaboration section, they will need to be updated to reflect the hidden state.

---

## Acceptance Criteria

- [ ] When creating any project type, the "Are you looking for people to help with the event?" / collaboration toggle does not appear on the details step.
- [ ] When editing any project type, the collaboration toggle does not appear in `EditProjectContent`.
- [ ] When viewing any project detail page, the "Collaboration" section does not appear in `ProjectContent`.
- [ ] The "in collaboration with" organizations display on the project detail page remains visible and unchanged for all project types.
- [ ] The underlying `collaborators_welcome` field in the data model and API is untouched.
- [ ] The JSX code for the hidden sections is preserved in the source files (not deleted).

# Edit Project Form Button Reorganization

**Status**: COMPLETED
**Type**: Feature
**Date and time created**: 2026-05-13 13:10
**GitHub Issue**: [#1981](https://github.com/climateconnect/climateconnect/issues/1981)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260416_1000_event_registration_custom_fields.md`](./20260416_1000_event_registration_custom_fields.md)
- [`20260512_0725_edit_event_registration_custom_fields.md`](./20260512_0725_edit_event_registration_custom_fields.md)

---

## Problem Statement

On the edit project form, the delete project button is currently placed inside the form content area (`EditProjectContent.tsx`), floating to the right near the project type selector. This placement is inconsistent with standard form UX patterns where destructive actions belong in the button group at the top or bottom of the form (alongside Save, Cancel, and Check Translations). Additionally, event organisers who want to adjust registration settings while editing their event must navigate away from the edit form to the project detail page to open the registration config modal. There is no direct path from the edit form to registration settings.

**Core Requirements (User/Stakeholder Stated):**

1. **Move the delete project button** from inside `EditProjectContent` up into the group of form buttons (the `NavigationButtons` bar at the top and bottom of the edit form).
2. **On mobile (narrow screens)**, render the delete button as a trash-can icon instead of a text button, consistent with other icon-based actions in the project UI.
3. **In the place where the delete button was** inside `EditProjectContent` (near the project type selector), add an **edit event registration config button** that opens the existing `EditEventRegistrationModal` (the same modal used on the project detail page).
4. The edit registration config button must only appear when:
   - the project type is `"event"`,
   - the `EVENT_REGISTRATION` feature toggle is enabled,
   - the project has an existing `registration_config`,
   - the current user has admin permissions on the project.

**Explicitly Out of Scope (this task):**
- Changing the delete project backend logic or API endpoint.
- Changing the `EditEventRegistrationModal` internals (the modal itself is already built and tested).
- Adding registration config creation from the edit form (only editing existing config is in scope).
- Any changes to the create project flow.

### Non-Functional Requirements

- **No breaking changes** to existing API contracts.
- **Responsive design**: the trash-can icon must use Material-UI `IconButton` with proper aria-label for accessibility.
- **Toggle gate**: the edit registration config button must respect `isEnabled("EVENT_REGISTRATION")`.
- **Consistent styling**: the moved delete button in the `NavigationButtons` bar should keep its error/contained styling.

### AI Agent Insights and Additions

- **Current delete button placement**: `DeleteProjectButton` is rendered in two places inside `EditProjectContent.tsx`:
  - Line 177–181: non-narrow screens, floated right near the project type selector.
  - Lines 264–279: narrow screens, inside the collaborators section (only when `collaborators_welcome` is true).
  Both of these placements will be removed. The delete button will move to the `NavigationButtons` bar in `EditProjectRoot.tsx`.
- **`NavigationButtons` supports `additionalButtons`**: `EditProjectRoot.tsx` already constructs an `additionalButtons` array (lines 196–212) that is passed to `<NavigationButtons />`. This is the correct place to append the delete button. The `additionalButtons` API supports `text`, `onClick`, `icon`, and `argument` keys.
- **Mobile trash icon**: on narrow screens (`isNarrowScreen`), the delete button should render as an `IconButton` with `DeleteIcon` instead of the standard `Button`. The `NavigationButtons` component handles rendering of additional buttons; you may need to check whether it already supports icon-only mode for narrow screens, or if a conditional wrapper is needed.
- **Edit registration config button**: the existing `EditRegistrationButton` component pattern in `ProjectContentSideButtons.tsx` (lines 194–219) is a good reference. It uses `SettingsIcon` for narrow screens and a text button for desktop. The same pattern can be reused, but placed inside `EditProjectContent` where the desktop delete button used to be (lines 177–181).
- **Modal wiring**: `EditEventRegistrationModal` requires `open`, `onClose`, `onSaved`, `project`, and `eventRegistration` props. In `EditProjectRoot`, the `project` object is available. The `eventRegistration` data can come from `project.registration_config`. The `onSaved` callback should refresh the local `project` state with the updated registration config returned by the modal's PATCH call.
- **State management**: `EditProjectRoot` will need local state for `editRegistrationOpen` (boolean) and a handler to update `project.registration_config` after the modal saves. This mirrors the pattern in `ProjectPageRoot.tsx` (lines 158–160) where `currentEventRegistration` is kept in state.
- **Desktop vs mobile delete in NavigationButtons**: `NavigationButtons` renders the `additionalButtons` array using the `argument` key to decide styling. For the delete button, `argument` can be `"delete"` or similar, and `NavigationButtons` can be extended to render destructive-action buttons with error styling. Alternatively, pass a custom component as an `additionalButton` entry if the existing API is too rigid.
- **Accessibility**: ensure the trash-can icon button has `aria-label={texts.delete_project}` and the edit registration button has `aria-label={texts.edit_registration_settings}`.

---

## Acceptance Criteria

- [ ] The delete project button no longer appears inside `EditProjectContent`.
- [ ] The delete project button appears in the `NavigationButtons` bar (both top and bottom) on the edit project form.
- [ ] On desktop, the delete button in the `NavigationButtons` bar renders as a text button with error/contained styling.
- [ ] On mobile (narrow screens), the delete button in the `NavigationButtons` bar renders as a trash-can `IconButton`.
- [ ] Clicking the delete button still opens the confirm dialog and functions exactly as before.
- [ ] In the place where the desktop delete button used to be in `EditProjectContent`, an "Edit registration settings" button appears for event admins when event registration is enabled and `registration_config` exists.
- [ ] Clicking the edit registration settings button opens the `EditEventRegistrationModal` pre-filled with the current registration config.
- [ ] Saving changes in the modal updates the local project state and persists to the backend via the existing `/api/projects/{slug}/registration-config/` PATCH endpoint.
- [ ] The edit registration settings button does not appear for non-event project types, non-admins, or when the `EVENT_REGISTRATION` toggle is off.

# Fix Page Jump on Create Project Details Step

**Status**: COMPLETED
**Type**: Bugfix
**Date and time created**: 2026-05-13 13:30
**GitHub Issue**: [#1981](https://github.com/climateconnect/climateconnect/issues/1981)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260416_1000_event_registration_custom_fields.md`](./20260416_1000_event_registration_custom_fields.md)

---

## Problem Statement

When an organiser navigates to the "Details" step of the create project flow, the page automatically scrolls down on load, focusing on a form field. This is disorienting because the user has not yet interacted with the form and expects to start at the top of the page. The behavior appears to be an unintended side effect of the existing error-scroll logic: `EnterDetails.tsx` uses a `useEffect` hook that calls `scrollIntoView()` whenever the `errors` object changes. On initial mount, the `errors` state object changes from its default value (empty strings) to the same empty-string values, but React still fires the effect, causing an unnecessary scroll. The intended behavior is to scroll to the error field only after the user attempts to submit and validation actually fails.

**Core Requirements (User/Stakeholder Stated):**

- The create project "Details" step must **not** scroll automatically on initial page load.
- If the user clicks "Next" (submit) and validation fails, the page **must** scroll to the first field with an error so the user sees what needs correction.
- If the user clicks "Save as draft" and draft validation fails, the same scroll-to-error behavior must occur.
- The fix must not break the scroll-to-error behavior for any other step in the create project flow.

**Explicitly Out of Scope (this task):**
- Changing the validation logic or error messages.
- Changing scroll behavior on the edit project form (that is a separate component with its own scroll logic).
- Changing scroll behavior on other create-project steps (e.g. "Select Sectors", "Add Team").
- Any changes to `NavigationButtons` or sticky button bar behavior.

### Non-Functional Requirements

- **No breaking changes** to existing form validation or data flow.
- **Minimal change**: the fix should be a small guard condition, not a refactor of the scroll system.
- **Performance**: no additional renders or state objects.

### AI Agent Insights and Additions

- **Current buggy code**: in `EnterDetails.tsx` (lines 108–113):
  ```tsx
  useEffect(() => {
    if (topRef?.current) {
      topRef.current.scrollIntoView();
    }
  }, [errors]);
  ```
  This effect fires on every `errors` change, including the initial render where `errors` transitions from `undefined` (before first render) to `{ start_date: "", end_date: "", max_participants: "", registration_end_date: "" }`.
- **Root cause**: `scrollIntoView()` on a form element (`<form ref={topRef}>`) does not necessarily scroll to the top of the page; depending on browser behavior and focus state, it may scroll to the first focusable field inside the form. This explains why the page "jumps down" rather than staying at the top.
- **Fix strategy**: introduce a boolean ref or state flag that tracks whether a submit has been attempted. Only call `scrollIntoView()` when:
  1. A submit or draft-save has been attempted (the flag is true), AND
  2. At least one error field has a non-empty string value.
- **Alternative lighter fix**: instead of a flag, change the effect dependency to only scroll when at least one error value is truthy. This avoids scrolling on initial mount because all error strings are empty:
  ```tsx
  useEffect(() => {
    if (topRef?.current && Object.values(errors).some((e) => e)) {
      topRef.current.scrollIntoView();
    }
  }, [errors]);
  ```
  This is the preferred minimal fix because:
  - On initial mount, all errors are empty strings → `Object.values(errors).some((e) => e)` is `false` → no scroll.
  - After submit with validation failure, at least one error will be a non-empty string → condition is `true` → scroll happens.
  - After submit with success, `errors` is typically reset to empty strings → no scroll (which is correct; the user navigates to the next step instead).
- **EditProjectRoot has similar code**: `EditProjectRoot.tsx` (lines 98–103) also has a scroll-to-error effect tied to `errors.start_date || errors.end_date`. That component is **not** in scope for this task, but the same pattern could be applied there in a follow-up if stakeholders report the same issue on edit.
- **Test consideration**: there are no existing tests for `EnterDetails.tsx` scroll behavior. A new test is not strictly required for this bugfix, but if adding one, render the component and assert that `scrollIntoView` is not called during initial mount, then simulate a failed submit and assert it is called.

---

## Acceptance Criteria

- [ ] When navigating to the "Details" step of the create project flow, the page does not automatically scroll down on initial load.
- [ ] When the user clicks "Next Step" and validation fails (e.g. missing image, invalid dates), the page scrolls to the top of the form so the error is visible.
- [ ] When the user clicks "Save as draft" and draft validation fails, the page scrolls to the top of the form so the error is visible.
- [ ] When validation passes and the user proceeds to the next step, no scroll occurs (the step transition handles navigation).
- [ ] The scroll-to-error behavior on the edit project form is unchanged.

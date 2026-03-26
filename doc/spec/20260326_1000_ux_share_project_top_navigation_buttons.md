# UX Improvement: Top Navigation Buttons in Share Project Flow

**Status**: DRAFT
**Type**: UX Improvement / Frontend
**Date and time created**: 2026-03-26 10:00 UTC
**Date Completed**: TBD
**GitHub Issue**: TBD
**Related Specs**:
- [`doc/mosy/architecture_overview.md`](../mosy/architecture_overview.md)

## Problem Statement

The create project ("Share Project") flow is a multi-step form wizard. Each step can contain a significant amount of content, particularly the "Enter Details" step. Currently, the navigation buttons (Previous, Next, Publish) and the "Save as Draft" button are only rendered at the **bottom** of each step page. Users must scroll to the very bottom to navigate between steps, which creates friction and a poor user experience on longer pages.

**Core Requirements (User/Stakeholder Stated):**

1. On every step of the share project flow, the navigation buttons (Previous, Next, Publish) must **also appear at the top** of the step page, in addition to their current position at the bottom.
2. The **"Save as Draft" button** must also appear at the top on the steps where it is currently shown at the bottom (the "Enter Details" step and the "Add Team" step).
3. The top and bottom button groups must be **visually consistent** — same buttons, same enabled/disabled states, same loading indicators.
4. The top buttons must be rendered **above the step content**, directly below the step headline.

**Explicitly Out of Scope (this iteration):**
- Changing the overall layout, step order, or flow structure of the share project wizard.
- Adding navigation buttons to the edit project flow or any page outside the share project wizard.
- Any changes to backend, API, or data model.

### Non Functional Requirements

- The top navigation buttons must mirror the exact same state as the bottom ones: same loading states, same disabled conditions, same handlers.
- No visual regression on the bottom buttons — their existing layout and behaviour must be unchanged.
- All existing `yarn lint` / TypeScript checks must continue to pass.
- The layout must remain responsive (MUI breakpoints) — on small screens the top buttons should not create excessive vertical space.

### AI Agent Insights and Additions

- **`NavigationButtons` already supports `position="top"`**: The component accepts a `position` prop and already has distinct styling for `position="top"` (reduced `marginTop`, adds `marginBottom`). No structural changes to `NavigationButtons` are required — we only need to add a second instance with `position="top"` at the top of each step.
- **Step-by-step breakdown**:
  - `ShareProject` (step 1 — "Basic Info"): Only has a Next button (no Previous, no Draft). A top `NavigationButtons` with `nextStepButtonType` and no `onClickPreviousStep` / `saveAsDraft` should be rendered. However, since this step uses a direct `onClick` handler (not a form submit), `onClickNextStep` must be passed instead of relying on `type="submit"`.
  - `SelectSectors` (step 2 — "Project Category"): Has Previous + Next, no Draft. Uses `onClickNextStep` and `onClickPreviousStep` directly — a top `NavigationButtons` with the same handlers works without changes.
  - `EventRegistrationStep` (step 3, optional — "Registration"): Has Previous + Next, no Draft. Same pattern as `SelectSectors`.
  - `EnterDetails` (step — "Project Details"): Has Previous + Next-as-submit + Save as Draft. Wraps content in a `<form>`. The **top** `NavigationButtons` should be placed **inside the form** (before the content sections) so that the submit button type still triggers form validation. The `saveAsDraft` and `loadingSubmitDraft` props must be passed to the top instance too, mirroring the bottom instance.
  - `AddTeam` (last step — "Add Team"): Has Previous + Publish-or-Next + Save as Draft (conditionally). Same form wrapper pattern. Top buttons must receive the same conditional `saveAsDraft` prop logic.
- **Draft button visibility rule**: In `EnterDetails`, the draft button is only shown when `projectData.name` is non-empty. The same condition must be applied to the top instance. In `AddTeam`, the draft button is always passed when `isLastStep` is true or when `projectData.name` is present (same logic as bottom).
- **No duplicate form submissions risk**: since both top and bottom buttons are inside the same `<form>` element for steps that use a form, both submit buttons will trigger the same form `onSubmit` handler — which is the correct behaviour.
- **`TranslateTexts` step**: the translation step (currently commented out in production) also uses `NavigationButtons`. If/when it is re-enabled, top buttons should be added then as well. No action needed in this task.
- **Styling consideration**: The existing `position="top"` style in `NavigationButtons` applies `marginTop: theme.spacing(6)` which may feel excessive right below the headline. Consider whether the top instance needs a custom `className` override or whether the existing `position="top"` style is sufficient.

## System impact

*To be filled by Archie (mosy-system-architect) during system impact analysis.*

## Software Architecture

*Frontend only — no backend changes.*

### Affected Files

| File | Change |
|---|---|
| `frontend/src/components/shareProject/ShareProject.tsx` | Add top `NavigationButtons` instance |
| `frontend/src/components/shareProject/SelectSectors.tsx` | Add top `NavigationButtons` instance |
| `frontend/src/components/shareProject/EventRegistrationStep.tsx` | Add top `NavigationButtons` instance |
| `frontend/src/components/shareProject/EnterDetails.tsx` | Add top `NavigationButtons` instance (inside `<form>`, with draft props) |
| `frontend/src/components/shareProject/AddTeam.tsx` | Add top `NavigationButtons` instance (inside `<form>`, with draft props) |
| `frontend/src/components/general/NavigationButtons.tsx` | Minor style tuning if needed for top position |

### Implementation Notes

Each step that has bottom navigation buttons needs a mirrored top `NavigationButtons` block. Example for `SelectSectors`:

```tsx
// TOP — added
<NavigationButtons
  onClickPreviousStep={onClickPreviousStep}
  onClickNextStep={onClickNextStep}
  position="top"
/>

{/* ... existing step content ... */}

// BOTTOM — already exists
<NavigationButtons
  className={classes.block}
  onClickPreviousStep={onClickPreviousStep}
  onClickNextStep={onClickNextStep}
/>
```

For `EnterDetails` and `AddTeam` (which use `type="submit"` buttons inside a `<form>`), both top and bottom `NavigationButtons` instances must be placed **inside the `<form>` element** so the submit type triggers the same form `onSubmit` handler.

## Test Plan

### Manual Testing Steps

1. Navigate to `/share` (share project page).
2. Verify each step shows navigation buttons at both the **top** and **bottom** of the page.
3. Scroll to the top of a long step (e.g., "Enter Details") and confirm the top navigation buttons are visible without scrolling.
4. Confirm "Previous" on the top buttons navigates to the previous step.
5. Confirm "Next Step" on the top buttons advances to the next step.
6. On "Enter Details" with a project name filled in, confirm the top "Save as Draft" button saves a draft.
7. On "Add Team" (last step), confirm the top "Publish" button submits the project.
8. Confirm loading spinners on top and bottom buttons are synchronised during submission.
9. Verify responsive layout — check on mobile (< 600px) and tablet (600–960px) that top buttons do not break the layout.
10. Run `yarn lint` — must pass with zero errors.

---

## Task Log

| Timestamp (UTC) | Entry |
|---|---|
| 2026-03-26 10:00 | Task created. Problem statement and AI insights documented. |


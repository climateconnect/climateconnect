# UX Improvement: Sticky Bottom Navigation in Share Project Flow

**Status**: COMPLETED
**Type**: UX Improvement / Frontend
**Date and time created**: 2026-03-26 10:00 UTC
**Date Completed**: 2026-03-26
**GitHub Issue**: TBD
**Related Specs**:
- [`doc/mosy/architecture_overview.md`](../mosy/architecture_overview.md)

## Problem Statement

The create project ("Share Project") flow is a multi-step form wizard. Each step can contain a significant amount of content, particularly the "Enter Details" step. Currently, the navigation buttons (Previous, Next, Publish) and the "Save as Draft" button are only rendered at the **bottom** of each step page. Users must scroll to the very bottom to navigate between steps, which creates friction and a poor user experience on longer pages — especially on mobile.

**Core Requirements (User/Stakeholder Stated):**

1. On every step of the share project flow, the navigation buttons (Previous, Next, Publish) and the "Save as Draft" button must always be **visible without scrolling**.
2. The solution must work well on **both desktop and mobile**.
3. The navigation controls must remain accessible regardless of how far down the user has scrolled.

**Approved solution**: A **sticky bottom navigation bar** — fixed to the bottom of the viewport at all screen sizes — replacing the inline bottom `NavigationButtons` placement on every step. This approach was preferred over a duplicated top-and-bottom button layout because it is always visible without adding layout clutter, and works especially well on mobile.

**Explicitly Out of Scope (this iteration):**
- Changing the overall layout, step order, or flow structure of the share project wizard.
- Adding sticky navigation to the edit project flow or any page outside the share project wizard.
- Any changes to backend, API, or data model.

### Non Functional Requirements

- The sticky bar must be visible at **all screen sizes** (not just mobile).
- All existing button behaviour must be preserved: same handlers, same loading states, same disabled conditions, same form-submit semantics.
- Content must not be hidden behind the sticky bar — a bottom padding spacer must be applied to each step's content area.
- The bar must have a clear visual separation from page content (background + top shadow).
- `yarn lint` and TypeScript checks must pass with zero errors.

### AI Agent Insights and Additions

- **`NavigationButtons` already has `fixedOnMobile`** — a prop that fixes the bar at the bottom on small screens only. The new `sticky` prop extends this concept to all screen sizes by returning a separate CSS object from the JSS style function (avoiding conflicts with the existing media-query-based `fixedOnMobile` path).
- **`justifyContent: flex-end` + `marginRight: auto` pattern**: the sticky bar uses `justifyContent: "flex-end"` so the Next/Publish button is always right-aligned. When a Back button is also present, it receives `marginRight: "auto"` which pushes it to the far left — preserving the expected Back-left / Next-right layout without needing `space-between`.
- **Step 1 (`ShareProject`) special case**: previously used a standalone `<Button>` with `float: right`; replaced with `<NavigationButtons sticky onClickNextStep={...} />` using the direct click handler (not form submit).
- **`EnterDetails` and `AddTeam` form submit**: the sticky `NavigationButtons` is kept **inside the `<form>` element** so that `type="submit"` buttons still trigger form validation via the form's `onSubmit` handler.
- **Bottom padding spacer**: added as a `<div style={{ paddingBottom: 80 }}>` wrapper around all step components in `ShareProjectRoot.tsx`. 80 px comfortably clears the ~52 px tall sticky bar (buttons + padding) on all screen sizes.
- **`onClickCancel` guard on `position="top"`** (defensive fix, kept): `NavigationButtons` previously rendered a `CancelButton` whenever `position="top"` was set, even without an `onClickCancel` handler. The guard `{position === "top" && onClickCancel && <CancelButton />}` was added to prevent a non-functional dialog from appearing. This does not affect the existing `EditProjectRoot` usage which correctly passes `onClickCancel`.

## System impact

*Frontend only — no backend changes.*

## Software Architecture

### Affected Files

| File | Change |
|---|---|
| `frontend/src/components/general/NavigationButtons.tsx` | Add `sticky?: boolean` prop; sticky CSS returns `position: fixed` at all screen sizes with background and top shadow; `flexWrap: "wrap"` for multi-row on narrow screens; `stickyCompact` class reduces button padding on xs; Back button shows `ArrowBackIcon` on xs screens when sticky; add `stickyBackButton` class (`marginRight: auto`); guard `CancelButton` on `position="top"` behind `onClickCancel` check |
| `frontend/src/components/shareProject/ShareProject.tsx` | Replace standalone `<Button>` with `<NavigationButtons sticky onClickNextStep={...} />` |
| `frontend/src/components/shareProject/SelectSectors.tsx` | Convert bottom `NavigationButtons` to `sticky` |
| `frontend/src/components/shareProject/EventRegistrationStep.tsx` | Convert bottom `NavigationButtons` to `sticky` |
| `frontend/src/components/shareProject/EnterDetails.tsx` | Convert bottom `NavigationButtons` to `sticky` (kept inside `<form>`) |
| `frontend/src/components/shareProject/AddTeam.tsx` | Convert both conditional bottom `NavigationButtons` to `sticky` (kept inside `<form>`) |
| `frontend/src/components/shareProject/ShareProjectRoot.tsx` | Wrap all step components in `<div style={{ paddingBottom: 80 }}>` spacer |

### Implementation Notes

#### `NavigationButtons` — `sticky` prop

```tsx
// JSS style function (simplified)
navigationButtonWrapper: (props: any) => {
  if (props.sticky) {
    return {
      position: "fixed",
      bottom: 0, left: 0, right: 0,
      display: "flex", flexWrap: "wrap",      // wraps to 2 rows on narrow screens
      justifyContent: "flex-end", alignItems: "center",
      rowGap: theme.spacing(1),
      padding: `${theme.spacing(1.5)} ${theme.spacing(2)}`,
      background: theme.palette.background.paper,
      boxShadow: "0px -2px 8px rgba(0,0,0,0.12)",
      zIndex: 1100,
    };
  }
  // ... existing non-sticky styles unchanged ...
},
stickyBackButton: { marginRight: "auto" },
stickyCompact: {
  // Reduces MuiButton horizontal padding on xs so Draft + Next fit side-by-side
  [theme.breakpoints.down("sm")]: {
    "& .MuiButton-root": { paddingLeft: theme.spacing(1), paddingRight: theme.spacing(1) },
  },
},
```

Back button — icon on xs screens, text on larger:
```tsx
<Button
  className={`${classes.backButton} ${sticky ? classes.stickyBackButton : ""}`}
  onClick={onClickPreviousStep}
  aria-label={sticky && isMobileScreen ? texts.back : undefined}
>
  {sticky && isMobileScreen ? <ArrowBackIcon /> : texts.back}
</Button>
```

**Responsive layout on narrow screens (< 600 px, 3-button steps):**
```
┌─────────────────────────────────────┐
│  [←]                                │  row 1 — Back icon, left
│           [Entwurf] [Nächster Scht] │  row 2 — Draft + Next, right
└─────────────────────────────────────┘
```

#### Usage in step components (all steps)

```tsx
// All share project steps — single NavigationButtons, always sticky
<NavigationButtons
  onClickPreviousStep={onClickPreviousStep}   // omitted on step 1
  nextStepButtonType="submit"                  // or "publish" on last step
  saveAsDraft={projectData.name ? handleSaveAsDraft : undefined}  // where applicable
  loadingSubmit={loadingSubmit}
  loadingSubmitDraft={loadingSubmitDraft}
  sticky
/>
```

#### Bottom padding spacer in `ShareProjectRoot`

```tsx
<div style={{ paddingBottom: 120 }}>
  {curStep.key === "share" && <ShareProject ... />}
  {curStep.key === "selectSector" && <SelectSectors ... />}
  {/* ... all other steps ... */}
</div>
```

## Test Plan

### Manual Testing Steps

1. Navigate to `/share` (share project page).
2. On every step, confirm the navigation bar is **always visible at the bottom of the viewport** — both when the page fits the screen and when scrolling is required.
3. Scroll partway down a long step ("Enter Details") and confirm the sticky bar remains visible.
4. Confirm "Back" is on the **left** and "Next Step" / "Publish" is on the **right** of the bar.
5. On step 1 ("Basic Info"), confirm there is **no Back button** and the Next button is **right-aligned**.
6. Confirm "Back" navigates to the previous step and "Next Step" advances to the next step.
7. On "Enter Details" with a project name, confirm "Save as Draft" in the sticky bar saves a draft.
8. On "Add Team" (last step), confirm "Publish" submits the project.
9. Confirm loading spinners and disabled states work correctly during submission.
10. Confirm the **last form element on each step is not hidden** behind the sticky bar (120 px padding spacer).
11. On mobile (< 600 px), confirm the Back button shows an **arrow icon** (not text) and has an accessible `aria-label`.
12. Verify on mobile (< 600 px) and tablet (600–960 px) that the bar displays correctly.
13. Run `yarn lint` — must pass with zero errors.

---

## Task Log

| Timestamp (UTC) | Entry |
|---|---|
| 2026-03-26 10:00 | Task created. Problem statement and AI insights documented. Initial approach: duplicate top navigation buttons. |
| 2026-03-26 11:00 | Top navigation approach implemented and reviewed. User feedback: preferred sticky bottom navigation instead. |
| 2026-03-26 11:30 | Pivoted to sticky bottom navigation. Added `sticky` prop to `NavigationButtons`, converted all share project steps, added padding spacer in `ShareProjectRoot`. Fixed right-alignment of Next button when no Back button is present. |
| 2026-03-26 12:00 | Implementation approved by user. Spec updated to reflect final solution. Status set to COMPLETED. |
| 2026-03-26 12:30 | Refinement: Back button replaced with `ArrowBackIcon` on xs screens (< 600 px) when sticky, freeing space for Draft + Next buttons. `aria-label` added for accessibility. Spec updated. |

# Improve Filter UX on Browse and Event Calendar

## Problem Statement

The filter overlay on mobile is currently confusing and partially broken. On the browse pages and the event calendar, the mobile filter is presented as a full-screen dialog with an "Apply" button, but the underlying behavior does not match user expectations:

- The "Apply" button does not gate the application of filter changes. Any change made in the overlay is reflected immediately in the URL/result list, and the dialog is closed, regardless of whether the user pressed "Apply". To combine multiple filters, the user has to re-open the dialog after every single change.
- There is no visual indication that filters are active while the dialog is closed. On desktop, the active filters are visible inline as selected chips and outlined fields, but on mobile there is no equivalent affordance, so users cannot tell whether a filter is currently applied.
- The positioning and styling of the dialog action buttons ("Apply", close) is not consistent with Material UI guidance for full-screen dialogs.

These problems make mobile filtering feel unpredictable and discourage users from combining filters. The desktop experience, where all filter options are visible inline and changes apply live, works well and should not regress.

Additionally, the browse filter state is currently shared across the three browse tabs (projects, organisations, members) with tab-specific fields, while the event calendar filter is independent. A future refactor toward a shared filter context (out of scope for this task) is anticipated, but the present task must not preclude it.

## Acceptance Criteria

- [ ] On mobile (small viewports), the filter overlay behaves as a "staged" filter dialog: changes inside the overlay update only a local/draft filter state and do not affect the URL or the result list until the user explicitly presses "Apply".
- [ ] Pressing "Apply" inside the filter overlay commits the draft filter state to the URL (and therefore the result list) and closes the overlay.
- [ ] Pressing the overlay's close control (X / backdrop) discards the draft state and does not change the applied filter.
- [ ] When one or more filters are active, the filter trigger (e.g. "Filters" button) shows a visual indicator — a colored badge, containing the number of active filters (1, 2, 3, …) when there is more than one.
- [ ] An additional "Reset" / "Clear all" control inside the overlay clears all draft (and, when pressed alongside Apply, applied) filters in one action.
- [ ] The filter dialog on mobile is implemented as a proper MUI full-screen dialog following MUI guidance for action button placement and styling (primary action in a fixed bottom app bar or app bar trailing area, secondary actions in a sensible position). The current full-screen pattern, including the nested multi-level select dialog inside it, is intentionally retained because MUI's full-screen dialog guidelines permit nesting and the topic/category selection needs the available space.
- [ ] Desktop behavior is preserved: on viewports where filters are shown inline, changes still apply live without an Apply button, and the existing active-filter affordances (chips, outlined fields) continue to work.
- [ ] Existing filter persistence behavior (filter state preserved across page switches within the browse section) is preserved.
- [ ] No regressions to the event calendar filter's existing behavior beyond the staged/apply model and active-filter indicator on mobile.
- [ ] The implementation does not preclude a future refactor to share filter state between browse tabs and the event calendar via a filter context.

## Constraints and Non-Negotiable Requirements

- Changes are confined to the frontend (Next.js) codebase. No backend API changes are required.
- The existing FilterContext (used across browse tabs) must remain the source of truth for applied filters; the new "draft" state is an overlay-local concern.
- Desktop UX must not regress: inline filters continue to apply changes immediately on the browse pages and on the event calendar.
- The filter trigger (e.g. "Filters" button) and the event calendar "Filter" button must continue to open the same overlay(s) currently used; only the overlay's internal behavior changes on mobile.
- The active-filter indicator must be accessible (visible without color alone, e.g. icon + number + accessible label) and must be tested on the standard responsive breakpoints.
- Theming must continue to work on the custom hubs (perth, prio1) in addition to the default/light hub variants.
- The implementation must not block a future move of the event calendar filter into a shared filter context.

## Domain Context

Climate Connect is a platform connecting climate activists, organizations, projects, and events. The browse and event calendar pages are the primary discovery surfaces: users narrow down the catalog using filters (location, category, skills, hub, sector, event type, etc.) before exploring individual entries. On desktop, filters are exposed inline and changes take effect immediately, which users have come to expect. On mobile, the same filters are hidden behind an overlay to save space, but the overlay's "Apply" affordance currently lies — it neither gates the change nor communicates a meaningful step. This breaks user trust and reduces the discoverability of the platform's content on small screens, which is the dominant form factor for many climate activists in the global south.

The filter system is shared across the three browse entity types (projects, organisations, members), each with a slightly different set of available fields. The event calendar is currently a separate surface with its own filter set. A future refactor to unify these via a shared filter context is anticipated; the present task is a UX-only improvement that should leave the door open to that refactor.

## AI Insights

### Implementation Hints

- The mobile full-screen dialog already exists (`FilterOverlay` / `GenericDialog` with `fullScreen` + `useApplyButton`). The staged-apply behavior can be implemented by maintaining a local draft copy of the filter values inside the overlay, committing to `FilterContext` only on `onApply`.
- The desktop inline flow already reads from `FilterContext` and writes on every change, so a single "are we in overlay mode on mobile?" branch is sufficient to switch between staged and live update semantics.
- The active-filter count is naturally available from the `FilterContext` `filters` object (count of defined non-empty values) and can be passed down to the trigger button.
- For Material UI guidance on full-screen dialog action placement, the primary action ("Apply") is typically placed in the app bar on the right, with the close (X) on the left; alternatively, a bottom app bar with the primary action is also acceptable per MUI examples.

### Trade-off Notes

- **Staged apply on mobile vs. live apply on desktop**: the two behaviors differ, which adds a small amount of conditional logic, but reflects the underlying UX need — on desktop, filters are visible and changes are reviewable, while on mobile the user cannot see results while the dialog is open, so a confirm step adds value.
- **Active-filter badge with a number**: showing a count inside a small badge is a common pattern (e.g. notification dots with a number) and users are familiar with it. The number is a raw integer, not a localized pluralized phrase, so it sidesteps the lack of plural form support in the current i18n setup. A simple dot (no number) is the baseline when there is exactly one active filter, or as a fallback.
- **Reset button placement**: a dedicated "Reset" button gives parity with desktop (where users can deselect chips individually) and is friendlier to users with many active filters, but adds another control to the dialog.
- **Single-context refactor deferred**: unifying the event calendar filter with the browse filter context is intentionally out of scope to keep this change small and reviewable. The current task should structure overlay state so the future refactor is a context-shape change rather than a rewrite of the dialog component.

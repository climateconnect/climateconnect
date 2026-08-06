# Task: Improve mobile tab navigation

**Issue:** https://github.com/climateconnect/climateconnect/issues/2181
**Branch:** `improve-mobile-tab-navigation`
**Phase:** DRAFT

## Problem & Why

The mobile browse experience currently uses a `Tabs` component pinned to the bottom of the viewport to navigate between Projects, Organisations, Members, and (when the event calendar feature is enabled) Event Calendar. This component was designed for tabbed content, not primary navigation, and on a mobile device it has two problems:

1. **Active state is ambiguous.** The only signal for the active tab is a thin indicator bar at the bottom of the icon. The icon color does not change between active and inactive states, so users — especially on small screens — cannot quickly see where they are.
2. **Icons-only is hard to scan.** The four (soon five with Events) icons sit side by side without text, so the meaning of each icon has to be memorised. This is below the bar for a primary bottom navigation on a phone.

We are about to add the new Event Calendar to the bottom navigation (see issue #2181, milestone "Event Calendar"). Before we do, the bottom navigation itself needs to be brought up to a proper mobile navigation bar standard, so that introducing a fourth/fifth entry does not make an already weak UI worse.

The desktop navigation is **out of scope** for this task and must keep its current labels: "Projects", "Organisations", "Members", "Event Calendar".

## Desired Outcome

A bottom navigation bar on mobile viewports that:

- Follows the Material Design 3 Navigation Bar pattern (https://m3.material.io/components/navigation-bar/overview).
- Always shows both an icon **and** a text label for each destination, with the text label being the primary reading cue and the icon supporting it.
- Clearly and unambiguously highlights the currently active destination — both via a visual treatment of the active item (e.g. a pill / filled indicator behind icon + label) **and** via a different icon/text color for the active item versus inactive items.
- Spans the destinations: **Projects**, **Orgs** (short for Organisations on mobile, matching the existing `texts.orgs` narrow-screen label), **Members**, **Events** (only when the `EVENT_CALENDAR_FEATURE` feature toggle is on; existing behaviour).
- Lives on the same set of pages as the current mobile tab bar: the global `/browse` page, per-hub `/hubs/[hubUrl]/browse` page, the global `/events` page, and the per-hub `/hubs/[hubUrl]/events` page. It should not appear on tablet/desktop viewports.
- Continues to navigate to the same routes the current implementation navigates to (see `BrowseContent.tsx` lines 650–671 for the existing routing logic for each tab).
- Renders a sensible **initial state on the events pages**: when the user lands directly on `/events` or `/hubs/[hubUrl]/events`, the "Events" item in the bar is the visually active one. This matches the current behaviour (see `pages/events.tsx:144-152` and `pages/hubs/[hubUrl]/events.tsx:238` where the bar is rendered with `tabValue={EVENTS_TAB_INDEX}`).
- Respects per-hub theming: icon/label colors, the active-item pill, and the bar's container background must all use the active `theme.palette` so per-hub accent colors continue to work the same way they do today. The hard-coded `#f0f2f5` background of the current bar should become theme-driven (theme background, not a hard-coded gray) so per-hub themes can flow through consistently. The two hubs in production with custom themes today are **Perth** and **Prio1**; the bar must look correct on both of them, not just on the default (ClimateHub Network) theme.

## Acceptance Criteria

A reviewer can verify the task is done by checking the following on a real mobile viewport (< 600 px width) of the running frontend:

1. **Component is a bottom navigation bar, not a tab strip.** The mobile bar is no longer built on MUI's `Tabs`/`Tab` for navigation between top-level destinations. It uses a navigation-bar component (MUI's `BottomNavigation` + `BottomNavigationAction` is the natural fit given MUI v6 is already in use; an equivalent custom implementation that meets the M3 Navigation Bar spec is also acceptable) that is purpose-built for primary mobile navigation.
2. **Every destination has an icon and a label visible at the same time.** Inspecting the bar on a 360 px wide viewport shows, for each rendered destination, the icon and the short text label (e.g. "Projects", "Orgs", "Members", "Events") both visible. The icon is not used as a label substitute. The icons for the four destinations are the same as today: `AssignmentIcon` (Projects), `GroupIcon` (Organisations), `AccountCircleIcon` (Members), and the existing events icon (`DateRangeRoundedIcon`, with the existing TODO to swap to `CalendarMonthRoundedIcon` left as-is — out of scope here).
3. **Active state is unambiguous.** On the active destination the icon and label are visually distinct from the inactive ones. Concretely, the active item must (a) use the hub accent color for its icon and label, and (b) be highlighted with a pill / filled background indicator behind the icon+label (per M3 Navigation Bar "active" treatment). The bar must not rely solely on a bottom indicator line. The bar's container background should be the theme's surface/background color (no hard-coded `#f0f2f5`).
4. **Labels match the issue.** The four labels are exactly: `Projects`, `Orgs`, `Members`, `Events` — derived from the existing `getHubTexts` / `getGeneralTexts` keys (`projects`, `orgs` for the narrow-screen short label, `members`, `event_calendar` for "Events"). The desktop labels "Projects", "Organisations", "Members", "Event Calendar" are **not changed** by this task.
5. **Routing is unchanged.** Tapping a destination navigates to the same URL it does today:
   - Projects → `/browse` or `/hubs/[hubUrl]/browse` with `?types=projects`
   - Orgs → `/browse` or `/hubs/[hubUrl]/browse` with `?types=organizations`
   - Members → `/browse` or `/hubs/[hubUrl]/browse` with `?types=members`
   - Events → `/events` or `/hubs/[hubUrl]/events`
6. **Events entry is feature-flagged.** When `EVENT_CALENDAR_FEATURE` is off, the bar shows only Projects / Orgs / Members (same three as today). When on, it shows the four. This matches the current gating in `BrowseContent.tsx` (lines 650–671) and the events page's `getServerSideProps` 404.
7. **Per-hub theming flows through on the default theme, Perth, and Prio1.** On a per-hub page (e.g. a hub whose `background_default.contrastText` is set to a non-default color via the hub theme), both the active item color and the active-item pill color follow the hub's accent color, just as the active indicator does today. The bar must be visually verified on the **default ClimateHub Network theme**, the **Perth** hub theme, and the **Prio1** hub theme. On all three: the bar background is the theme's background color (not a hard-coded gray), the active pill uses the hub's accent color, and the active icon + label are legible (sufficient contrast) on top of that pill. If any of the three produces a low-contrast or otherwise off-brand result, that must be resolved (e.g. by picking a theme token that gives a readable result on all hubs, or by adjusting the per-hub theme values) before the task is considered done.
8. **Desktop and tablet are unaffected.** At `md` and above (≥ 900 px, the same breakpoint the current `isNarrowScreen` uses) the existing `HubTabsNavigation` tab row is still rendered and the new bar is not shown. The desktop labels and pill styling are unchanged.
9. **No new layout regressions.** The bar continues to be fixed to the bottom of the viewport, has a higher `z-index` than page content, and does not overlap the per-page footer / `ContactAmbassadorButton` in a way that breaks the existing UX. (The current `ContactAmbassadorButton` is rendered inside `MobileBottomMenu`; preserve that placement or move it to a wrapper above the bar — either is acceptable, as long as the button is still reachable on mobile and does not get hidden behind the bar.)
10. **No nested anchor tags.** Per project constraint, where the bar's items are rendered as links (`AppLink` / `<a>`), any child interactive elements use `onClick` + `router.push` + `event.stopPropagation()` and not `href` to avoid invalid nested `<a>` tags.
11. **Linting and formatting pass.** `yarn lint` and `yarn format` run clean on the changed files.

## Constraints & Non-Goals

- **Frontend only.** No backend, API, or schema changes.
- **No new dependencies.** Use components already available in `@mui/material` v6 (the `BottomNavigation` / `BottomNavigationAction` family) or a small in-file custom implementation. Do not add a new icon library or a new navigation library.
- **Desktop navigation is out of scope.** The desktop `HubTabsNavigation` row and its "Event Calendar" link must keep the current "Projects / Organisations / Members / Event Calendar" labels and current pill styling.
- **i18n reuse.** Reuse existing text keys (`texts.projects`, `texts.orgs`, `texts.members`, `texts.event_calendar`) from `getHubTexts` / `getGeneralTexts`. Do not introduce new locale strings for this task; if a destination needs a different short label on mobile, fall back to the existing keys.
- **The icon TODO remains out of scope.** The existing `DateRangeRoundedIcon` → `CalendarMonthRoundedIcon` swap is left as-is and is not part of this task.
- **No state management changes.** Continue to use the existing `tabValue` / `EVENTS_TAB_INDEX` pattern in `BrowseContent.tsx` and the events pages. The active state should be derivable from the current route / `tabValue` the way it is today; do not introduce a new global navigation state.

## Domain Context

- The mobile bar is rendered by `MobileBottomMenu` and consumed from three places: the browse page via `BrowseContent.tsx` (lines 650–671), the global events page (`pages/events.tsx:144-152`), and the per-hub events page (`pages/hubs/[hubUrl]/events.tsx:238`). Any refactor of the bar component must keep these three call sites working.
- The "events" entry is a navigation entry, not a tab in the same sense as the others: it pushes to a different route instead of mutating a `tabValue` on the browse page. The new bar must preserve this distinction.
- The browse page's `BrowseTab` union type already includes `"events"` (`frontend/src/types.ts:176`), so no type change is needed.
- Per-hub theming is delivered through the active `ThemeProvider` theme (see `HubBrowsePage.tsx:176` and `src/themes/transformThemeData.ts`). Components should read colors from `useTheme()` rather than hard-coding them. The two production hubs with non-default themes today are **Perth** (`/hubs/perth/browse`) and **Prio1** (`/hubs/prio1/browse`); these are the reference custom themes to visually verify the new bar against, alongside the default ClimateHub Network theme. We do not currently run any dark-themed hubs, so a dark-mode pass is not required for this task.

## AI Insights (Hints & Trade-offs)

- The most direct path is to switch `MobileBottomMenu` from MUI `Tabs`/`Tab` to MUI `BottomNavigation`/`BottomNavigationAction`, then add the `label` prop to each `BottomNavigationAction` so the short text appears next to the icon, and style the active item with a filled pill (matching the M3 Navigation Bar "active" treatment) using the existing `theme.palette.background.default_contrastText` accent.
- The M3 Navigation Bar uses an "inactive indicator" pill behind the icon, and the active item uses a filled pill that includes the label. A simple, on-brand approximation is: inactive items = icon only in accent color, active item = filled pill (accent color background, contrast text color for icon + label). The exact M3 styling is not required — what matters is that active and inactive are visually distinct and the active item includes its label.
- `BottomNavigationAction` already supports a `label` prop and a `showLabel` prop. Default behavior on MUI v6 shows the label only for the active item when `showLabel` is not set; for this task we want labels visible on **all** items (M3 pattern), so `showLabel` should be set to always show the label. The current implementation hides labels entirely (icon-only), which is the bug.
- The current hard-coded `#f0f2f5` background should be replaced with the theme's background (e.g. `theme.palette.background.paper` or `theme.palette.background.default`) so the bar follows each hub's surface color. Verify on the Perth and Prio1 hubs in particular — if `background.paper` is too close in value to the accent color on either of those hubs, fall back to a different theme token (e.g. `background.default`) or add a small amount of contrast so the pill stands out from the bar background.
- Three call sites need the same component, so the change is a single-component refactor plus a small amount of call-site adjustment (the prop name change from `tabValue` to `value` if the underlying component changes — keeping `tabValue` as the prop name on `MobileBottomMenu` is fine to keep call sites stable).
- Watch out for the `ContactAmbassadorButton` placement: it is currently rendered inside `MobileBottomMenu` between the page and the tabs. If the bar is refactored to MUI `BottomNavigation`, decide whether to keep the button inside the bar container or render it from the call site — either is fine, but the chosen placement should be consistent across the three call sites.
- Edge case: on the events pages, the bar is mounted with `tabValue={EVENTS_TAB_INDEX}` to force the events item to appear active. Make sure the new component continues to support being told the active value from the parent (i.e. it is a controlled component, not driven by the route alone).

## Open Questions

None at spec time. The issue is explicit about labels, the M3 component to use, and that the desktop nav is unchanged.

# Event Calendar v2 Bugfix — Day Tile Colors, Infinite Scroll Jump, Tab Switch Double Render

## Problem Statement

The v2 production iteration (spec `20260721_1348_event_calendar_page_v2.md`, PR #2150) introduced three regressions that need fixing:

1. **Day tile colors wrong**: The v2 replaced the PoC's day tile color scheme with generic semantic palette colors. The PoC used the same colors as `EventDateIndicator.tsx` on the old project cards — these were intentional and theme-aware. The v2 broke this.

2. **Infinite scroll jumps to top**: After loading more events via infinite scroll, the page jumps back to the top instead of staying at the user's scroll position.

3. **Tab switch double render**: Clicking "Projects", "Organisations", or "Members" tabs from the event calendar page causes a visible flash — the browse page briefly renders with the wrong tab before correcting to the right one.

## Acceptance Criteria

### Bug 1: Day Tile Colors

- [ ] **Restore the PoC color scheme** from `EventDateIndicator.tsx` — the day header tiles in `EventCalendarContent.tsx` must use the same background and text colors as the project card date indicator
- [ ] **Past events** (day < today): background = `theme.palette.secondary.extraLight`, text = `theme.palette.secondary.main` on the default theme. On custom hubs (`isCustomHub`): background = `theme.palette.grey.light`, text = `theme.palette.text.primary`
- [ ] **Today's events** (day === today): same styling as upcoming events (no separate "today" tile color — the `Badge` already marks it)
- [ ] **Upcoming events** (day >= today): background = `theme.palette.yellow.main`, text = `theme.palette.background.default_contrastText` on the default theme. On custom hubs (`isCustomHub`): background = `theme.palette.primary.main`, text = `theme.palette.background.default_contrastText`
- [ ] **Restore `CUSTOM_HUB_URLS`** from `UserContext` in `EventCalendarContent.tsx` — it was removed in v2 but is needed for the `isCustomHub` check
- [ ] The `Badge` "Today" marker remains on the day tile when `group.dayStartMs === startOfTodayMs`
- [ ] Verify on `/hubs/perth/events` and `/hubs/prio1/events` that tiles look correct

### Bug 2: Infinite Scroll Jump

- [ ] After loading page 2+ via infinite scroll, the viewport must stay at the user's current scroll position — no jump to top
- [ ] The `useInfiniteScroll` hook's `lastElementRef` must remain stable across re-renders caused by appending events
- [ ] Investigate whether the `loadMore` callback's dependency on `currentPage` causes the `lastElementRef` to be recreated (which disconnects/reconnects the IntersectionObserver and may cause scroll disruption)
- [ ] The sentinel element (last `Box` in the day groups list) must keep its ref attached across state updates

### Bug 3: Tab Switch Double Render

- [ ] Clicking "Projects", "Organisations", or "Members" from the event calendar page must navigate to the browse page with the correct tab active — no visible flash of the wrong tab
- [ ] The fix must work for both `/events` → `/browse#tab` and `/hubs/{hub}/events` → `/hubs/{hub}/browse#tab` navigation
- [ ] The fix must not break the existing tab navigation on the browse page itself (hash-based tab switching within the browse page)
- [ ] The fix should be minimal — a larger refactor (turning tabs into real pages) is planned for later

## Constraints and Non-Negotiable Requirements

- **Do not change `EventCardWide`** — the card component is not part of this fix
- **Do not change `EventDateIndicator.tsx`** — it is the reference implementation for colors, not a target
- **Do not change `useInfiniteScroll` hook** — fix the consumer, not the hook (unless the hook has a clear bug)
- **Do not change `EventCalendarCountsView`** or the calendar picker highlight logic
- **`isCustomHub` branching is intentional** — the default theme uses `yellow.main` for upcoming events, but custom hubs use `primary.main`. This matches `EventDateIndicator.tsx` exactly and must be preserved.
- **The `Badge` "Today" marker stays** — it was added in v2 and is not being reverted

## Domain Context

### Day Tile Colors — Reference Implementation

The correct color scheme already exists in `EventDateIndicator.tsx` (project card date indicators). The event calendar day tiles must mirror this:

```
Default theme:
  Past:   bg = secondary.extraLight (#EBEBEB), text = secondary.main (#484848)
  Future: bg = yellow.main (#FFDE0A),         text = background.default_contrastText (#207178)

Custom hub themes (isCustomHub):
  Past:   bg = grey.light (#F5F5F5),          text = text.primary
  Future: bg = primary.main (from hub theme), text = background.default_contrastText (from hub theme)
```

Note: `theme.palette.yellow.main` is always `#FFDE0A` — custom hub themes never override it (confirmed via `transformThemeData.ts`). `theme.palette.grey.light` is a custom extension mapping to `grey[100]` (#F5F5F5), also never overridden by custom themes.

### Infinite Scroll — Current Pattern

The current implementation in `EventCalendarContent.tsx`:
- `fetchEvents` is a `useCallback` depending on `[search, sectors, selectedDay, hubUrl, locale]`
- `loadMore` is a `useCallback` depending on `[fetchEvents, currentPage]`
- `useInfiniteScroll({ hasMore, isLoading, onLoadMore: loadMore })` returns `lastElementRef`
- `lastElementRef` is attached to the last `Box` in `dayGroups.map()`
- When events are appended, `currentPage` changes → `loadMore` gets a new reference → `lastElementRef` callback is recreated → observer is disconnected and reconnected

Reference pattern in `ProjectPreviews.tsx`:
- `loadMore` is a plain function (not `useCallback`) that calls `loadFunc()` (passed as prop)
- `loadFunc` is stable because it's defined in the parent with proper closure over the page counter
- `lastElementRef` is attached to the last grid item

The key difference: `ProjectPreviews` receives `loadFunc` as a stable prop, while `EventCalendarContent` defines `loadMore` internally with `currentPage` in the dependency array.

### Tab Switch — Root Cause

When clicking a tab from the events page:
1. `handleTabChange` calls `router.push(`${base}#${tab}`)` — a full Next.js page navigation
2. The browse page's `getServerSideProps` runs SSR — but hash fragments are **client-only**, invisible to SSR
3. SSR always renders with `tabValue = 0` (projects tab) because it cannot see the hash
4. Client hydrates → `useEffect` in `BrowseContent` reads `window.location.hash` → corrects the tab
5. The wrong tab is briefly painted before the correction — visible as a flash

The browse page's `BrowseContent` initializes `hash` as `null` via `useState(null)` and only reads the hash in a post-mount `useEffect`. The initial render always uses `tabValue = 0`.

### Custom Hub Theme Pipeline

Custom hub themes are applied via `transformThemeData()` which maps backend `HubTheme` data to a MUI theme. The function overrides `primary`, `secondary`, `background_default`, and `header_background` palettes. It does NOT override `yellow`, `grey`, or `action` — those always come from the default theme.

Backend `HubThemeColor` model has fields: `main`, `light`, `extraLight`, `contrastText` for each color group.

## AI Insights

### Implementation Hints

#### Bug 1: Day Tile Colors

1. **Restore `CUSTOM_HUB_URLS`**: Add `const { locale, CUSTOM_HUB_URLS } = useContext(UserContext);` back in `EventCalendarContent.tsx` (line where `locale` is destructured)
2. **Compute `isCustomHub`**: Add `const isCustomHub = CUSTOM_HUB_URLS?.includes(hubUrl);` after the context hook
3. **Replace tile color logic** (currently lines ~512-519): Replace the `isPast`/`isToday` ternary with the `EventDateIndicator.tsx` pattern:
   - `isPast && !isCustomHub` → bg: `secondary.extraLight`, text: `secondary.main`
   - `isPast && isCustomHub` → bg: `grey.light`, text: `text.primary`
   - `!isPast && isCustomHub` → bg: `primary.main`, text: `background.default_contrastText`
   - `!isPast && !isCustomHub` → bg: `yellow.main`, text: `background.default_contrastText`
4. The "Today" badge (`Badge` component) stays — it overlays the tile regardless of past/future coloring. Today events use the "upcoming" tile color (yellow on default, primary on custom hubs).

#### Bug 2: Infinite Scroll Jump

1. **Root cause**: `loadMore` is a `useCallback` with `currentPage` in its dependency array. Every time events are appended and `currentPage` updates, `loadMore` gets a new reference. This propagates to `useInfiniteScroll`'s `lastElementRef`, which disconnects the old `IntersectionObserver` and creates a new one. During this process, the scroll position may be disrupted.
2. **Fix approach**: Use a `useRef` for `currentPage` instead of `useState`, so `loadMore` doesn't need `currentPage` in its dependency array. The ref is read inside `loadMore` (always current) without causing the callback to be recreated.
   - Replace `const [currentPage, setCurrentPage] = useState(1)` with `const currentPageRef = useRef(1)`
   - In `fetchEvents`, update `currentPageRef.current = page` instead of `setCurrentPage(page)`
   - In `loadMore`, read `currentPageRef.current + 1` instead of `currentPage + 1`
   - Remove `currentPage` from `loadMore`'s dependency array
3. **Alternative**: Remove `useCallback` from `loadMore` and use a plain function with a ref for the page counter (matches `ProjectPreviews` pattern more closely)
4. **Verify**: After fix, scrolling through multiple pages of events must not cause any jump. The observer should stay connected across page loads.

#### Bug 3: Tab Switch Double Render

1. **Root cause**: `router.push(`${base}#${tab}`)` navigates to the browse page. The browse page's `BrowseContent` initializes `hash` as `null` via `useState(null)` and `tabValue` as `0` (since `hash` is always null on first render). The hash is only read in a post-mount `useEffect`, so the first render always shows the projects tab. On direct URL navigation this is unnoticeable (hydration is fast on fresh loads), but on client-side `router.push` from the events page the wrong tab is briefly painted.

2. **Minimal fix — lazy state initializer** (preferred, since tabs will become real pages later):
   - In `BrowseContent.tsx` (line 162), change the `tabValue` initialization from:
     ```tsx
     const [tabValue, setTabValue] = useState(hash ? TYPES_BY_TAB_VALUE.indexOf(hash) : 0);
     ```
     to:
     ```tsx
     const [tabValue, setTabValue] = useState(() => {
       if (typeof window === 'undefined') return 0;
       const h = window.location.hash.replace('#', '');
       return TYPES_BY_TAB_VALUE.indexOf(h) >= 0 ? TYPES_BY_TAB_VALUE.indexOf(h) : 0;
     });
     ```
   - When `router.push('/browse#organizations')` runs from the events page, the hash is already in the URL by the time `BrowseContent` mounts. The lazy initializer reads it and sets the correct `tabValue` on the first render — no flash.
   - The existing `useEffect` that reads the hash and calls `handleApplyNewFilters` still runs. Since `tabValue` is already correct, `setTabValue` is a no-op. `handleApplyNewFilters` fetches data for the correct tab type.
   - SSR still renders with `tabValue = 0` (hash is invisible server-side), but this only affects direct URL navigation which is already unnoticeable.
   - No changes needed to `events.tsx`, `hubs/[hubUrl]/events.tsx`, `browse.tsx`, or the hash-based navigation within the browse page.
   - **Files touched**: Only `frontend/src/components/browse/BrowseContent.tsx`

### Trade-off Notes

- **Day tile colors**: Restoring the `isCustomHub` branching re-introduces theme-specific logic that the v2 tried to eliminate. However, this is the established pattern (`EventDateIndicator.tsx`) and the custom hub themes genuinely need different colors because their palettes are different. The "semantic palette only" approach doesn't work when `yellow.main` is always the default yellow regardless of hub theme.
- **Infinite scroll**: Using a ref for `currentPage` is a minor pattern change but prevents the callback instability that causes the observer to reconnect. This is a well-known React pattern for mutable values that shouldn't trigger re-renders.
- **Tab switch**: The lazy initializer is a single-line fix that reads `window.location.hash` at mount time. It works because `router.push` sets the hash in the URL before the new page component mounts. SSR still renders tab 0, but direct URL navigation (where SSR matters) is already unnoticeable. A full query-param refactor is deferred to the planned tabs-to-pages work.

## System Impact Analysis

### Bug 1 Files

- `frontend/src/components/eventCalendar/EventCalendarContent.tsx` — restore `CUSTOM_HUB_URLS`, `isCustomHub`, and tile color logic

### Bug 2 Files

- `frontend/src/components/eventCalendar/EventCalendarContent.tsx` — change `currentPage` from state to ref, stabilize `loadMore`

### Bug 3 Files

- `frontend/src/components/browse/BrowseContent.tsx` — lazy state initializer for `tabValue` (single line change)

### Cross-Cutting

- No backend changes
- No changes to `EventCardWide`, `EventCalendarCountsView`, `useInfiniteScroll`, `HubTabsNavigation`, or `EventDateIndicator`
- No changes to `events.tsx`, `hubs/[hubUrl]/events.tsx`, `browse.tsx` for Bug 3
- No changes to the v2 pagination/infinite scroll architecture — only the callback stability fix

### Risks & Notes

- **Bug 3 scope**: Minimal — single line change in `BrowseContent.tsx`. The existing `useEffect` hash-reading logic is unchanged and still works for within-page tab switching and direct URL navigation.
- **Custom theme verification**: After fixing day tile colors, verify on prio1 and perth hubs that the tiles look correct. The prio1 theme's `primary.main` and `secondary.extraLight` values are configured in the database (Django admin), not in code.
- **Infinite scroll edge case**: After the ref fix, verify that the observer correctly fires on the last element even after multiple page loads. The ref must be stable across renders.

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-22 | Bugfix spec for v2 regressions: day tile colors, infinite scroll jump, tab switch double render |

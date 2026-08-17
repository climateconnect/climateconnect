# Event Calendar Page (Production Iteration)

## Problem Statement

The Event Calendar page was shipped as a Proof of Concept (PoC) with a fixed 90-day window loaded in a single request. User testing revealed the need for:
- **Infinite scroll** to browse all events chronologically without manual date selection
- **Backend pagination** to handle larger event volumes performantly
- **UI refinements**: remove the "Today" button from the calendar picker, move Reset to filter bottom, add "Today" marker on day headers
- **Navigation highlighting**: the "Event calendar" link in `HubTabsNavigation` should be visually active when on the events page
- **Custom theme styling**: ensure the calendar link and page look correct in custom hub themes (priority: prio1, perth)

This spec defines the production-ready iteration building on the PoC implementation.

## Key Architectural Change: Date Window → Infinite Scroll

The PoC loaded events within a **date window** (selected day + 90 days) in a single unpaginated request. The production version removes this windowed approach entirely:

- **No more `start_date`/`end_date` window params**: The frontend no longer sends date range boundaries. The backend no longer filters by a date window.
- **No more `MAX_WINDOW` cap**: The 6-month hard cap existed to bound payload size on the unpaginated endpoint. With pagination, page size bounds the payload — the cap is unnecessary.
- **Pagination replaces the window**: Events are loaded page-by-page in chronological order (`start_date` ascending), using the same `ProjectsPagination` as the projects browse page.
- **Calendar picker changes meaning**: The date picker is no longer a "window selector" — it becomes a **"jump to date"** filter. Selecting a day sends `start_date=<selected day>` to the API, which returns paginated results starting from that date. The default (and Reset target) is **today** — since events are chronologically ordered, starting at today makes upcoming events immediately visible. Reset returns the picker to today and sends `start_date=<today>`.
- **`end_date` filter removed**: Both frontend and backend drop the `end_date` parameter. It served no purpose outside the windowed approach.

## Acceptance Criteria

### Backend Changes
- [ ] `ListEventsView` uses pagination (same `ProjectsPagination` as `ListProjectsView`) instead of `pagination_class = None`
- [ ] Default page size of 12 events (matching `ProjectsPagination.page_size`)
- [ ] Support `page` and `page_size` query parameters for infinite scroll
- [ ] Remove `end_date` parsing and filtering from `get_queryset()`
- [ ] Remove `MAX_WINDOW` constant and window clamping logic
- [ ] Remove default window fallback (start_date/end_date auto-fill) — when no `start_date` is given, return all events paginated (defensive fallback; frontend always sends `start_date`)
- [ ] When `start_date` is provided: return events with `start_date >= <provided date>`, ordered ascending
- [ ] When `start_date` is omitted: return all events, ordered by `start_date` ascending (defensive fallback — the frontend always sends `start_date` since the default is today)
- [ ] Maintain existing filters: `search`, `sectors`, `hub`
- [ ] Maintain chronological ordering by `start_date` ascending
- [ ] `EventCalendarCountsView` unchanged (still returns per-day counts for calendar picker highlights)
- [ ] **Remove `end_date` parameter** from `EventCalendarCountsView` if present (verify — it may already not accept it)

### Frontend Changes
- [ ] Replace single full-window fetch with **infinite scroll** using existing `useInfiniteScroll` hook
- [ ] Initial load fetches page 1 (12 events); subsequent pages loaded as user scrolls
- [ ] **Remove `end_date`** from all API requests — only `start_date` sent (default: today, timezone-aware)
- [ ] **Repurpose `getDefaultWindowParams`** → `getDefaultStartDateParams` (returns only `start_date`); keep `toOffsetIso` helper
- [ ] **Remove "Today" button** from below the calendar picker (line 443-445 in `EventCalendarContent.tsx`)
- [ ] **Move Reset button** to bottom of filter panel (below Topics list)
- [ ] **Add "Today" marker** on day headers when `group.dayStartMs === startOfTodayMs`
  - Use a simple MUI `Badge` on the day tile — keep it minimal for now, styling can be refined later
- [ ] **Fix navigation highlighting** in `HubTabsNavigation`:
  - The "Event calendar" link should have active styling when on the events page
  - The event calendar is a separate page (not a 4th tab), but it shares the same tab navigation bar. The navigation must still track which tab is active — the page itself defines the active state (unlike the other tabs where the visible component drives it). Use `tabValue` prop: currently `-1` on the events page; keep it that way so no existing tab is incorrectly highlighted, and style the event calendar link itself as active independently.
  - Currently uses `underline={isEventsPage ? "always" : "hover"}` — enhance to visually match the selected tab weight (e.g., background pill or bold highlight) so it reads as "this is where you are"
- [ ] **Verify custom theme styling** for prio1 and perth:
  - Event calendar link in `HubTabsNavigation` uses correct colors in custom themes
  - Day header tiles respect custom theme palette (primary, secondary, etc.)
  - No hardcoded colors that break in custom themes

### Non-Functional
- [ ] All existing filters (search, sectors, date picker as "jump to date", hub scope) continue to work with pagination
- [ ] Changing filters resets to page 1 and re-fetches
- [ ] SSR still provides initial page of events for first paint/SEO
- [ ] Feature toggle `EVENT_CALENDAR_FEATURE` still gates the page and nav link

## Constraints and Non-Negotiable Requirements

- **Reuse existing patterns**: Use `ProjectsPagination` and `useInfiniteScroll` hook — do not invent new pagination/infinite scroll logic
- **Per-day grouping**: Events still grouped by `start_date` day only (no multi-day expansion)
- **Custom themes**: prio1 and perth are configured via `customHubData` + backend `HubTheme`; the calendar must work with both
- **No breaking changes** to `EventCardWide`, `EventCalendarCountsView`, or the date picker highlight logic
- **`end_date` is fully removed**: Not kept as an optional param — it served only the windowed approach which is now gone
- **Default is today**: The frontend always sends `start_date=<today>` (timezone-aware). Reset returns to today. This is because events are chronologically ordered and "today" is the natural starting point for upcoming events.

## Domain Context

### Current PoC Behavior (to be changed)
- Frontend computes `start_date = selectedDay.startOf("day")` and `end_date = selectedDay.add(90, "day").endOf("day")` and sends both as offset-aware ISO strings
- Backend receives both, clamps to `MAX_WINDOW` (6 months), filters `start_date >= X AND start_date <= Y`
- `pagination_class = None` — full result set returned in one response
- Calendar picker has "Today" button next to Reset
- Reset button is in a button group above Topics
- Day headers show month/day/weekday but no "today" indicator
- Nav link uses `underline="always"` when on events page — not visually distinct enough

### New Production Behavior
- Frontend sends `start_date=<today>` by default (timezone-aware, browser local); calendar picker lets user jump to any date
- `ProjectsPagination` — standard paginated response `{ count, next, previous, results }`
- Calendar picker = "jump to date" filter, not window selector
- Reset returns picker to today and re-fetches from today
- No Today button, no end_date, no window cap

### Infinite Scroll Pattern (reference: `ProjectPreviews.tsx`)
- `useInfiniteScroll` hook observes last element via `IntersectionObserver`
- `hasMore` comes from API response `next` field (non-null = more pages)
- `loadMore` calls API with `page=N` and appends results
- SSR provides `initialEvents` (page 1) for first paint

### Custom Hub Themes
- **prio1** (`prio1Config`): Uses `PRIO1_BASE_URL` colors, custom header links
- **perth** (`scottConfig`): Uses `SCOTT_BASE_URL` (climateconnect.scot), Scottish branding
- Both are `CUSTOM_HUB_URLS` in `UserContext` → `isCustomHub` flag in components
- `HubTabsNavigation` receives `hubUrl` and `allHubs`; custom theme applied via `customTheme` prop on `WideLayout`
- Theme colors accessible via `theme.palette.primary.main`, `theme.palette.secondary.main`, etc.

### Navigation Highlighting Reference
- Browse tabs (`Tabs` component) use `Mui-selected` class with custom styling (background = primary.contrastText, text = primary.main, rounded pill)
- Hub links (`HubLinks`) use `classes.link` (white, fontWeight 600)
- Climate Match link uses `classes.climateMatchLink` with padding and hover underline
- The Event Calendar link currently uses `classes.link` + `underline="always"` — needs to match selected tab visual weight
- **Key constraint**: The event calendar is a separate page, not a 4th tab. `tabValue` is set to `-1` on the events page so no browse tab is incorrectly highlighted. The event calendar link's active state is independent of the tab `value` — it's driven by `isEventsPage` (router-based). The existing tab navigation must continue to work unchanged on the browse page.

## AI Insights

### Implementation Hints

#### Backend
1. **Pagination**: Change `ListEventsView.pagination_class = None` → `pagination_class = ProjectsPagination`
2. **Default page size**: Will inherit `page_size = 12` from `ProjectsPagination`
3. **Query params**: DRF `PageNumberPagination` automatically reads `page` and `page_size` from query params
4. **Response format**: Will change from `[]` to `{ "count": N, "next": "...", "previous": "...", "results": [...] }` — frontend must adapt
5. **Remove `end_date`**: Delete the `end_date` parsing and filtering in `get_queryset()`. Keep only `start_date` as `start_date >= value` (jump-to-date).
6. **Remove `MAX_WINDOW`**: Delete the `MAX_WINDOW` constant and the clamping block that caps `end_date`. Pagination handles payload sizing now.
7. **Remove default window fallback**: The current code falls back to a default `start_date`/`end_date` window when neither is provided. With pagination, this is unnecessary — when no `start_date` is given, return all events paginated (defensive fallback; the frontend always sends `start_date` since the default is today).
8. **`start_date` with timezone**: When the frontend sends `start_date` (as an offset-aware ISO string for the selected day), the backend continues to parse it with `dateutil`. This is unchanged from the PoC.

#### Frontend — Infinite Scroll
1. **State changes**:
   - Replace `events` (full array) with accumulated `allEvents` across pages
   - Add `currentPage`, `hasMore` state
   - `fetchEvents(page, append)` — when `append=true`, append to existing list; when `false`, replace
2. **SSR**: `getServerSideProps` fetches page 1 only (`?page=1&page_size=12&start_date=<today offset-aware>`) — default is today
3. **Filter changes** (search, sectors, calendar day selection): Reset `currentPage = 1`, clear `allEvents`, fetch page 1
4. **`useInfiniteScroll`**: Attach `lastElementRef` to last `DayGroup` or a sentinel element after the list
5. **Day grouping**: Still group by `start_date` day; pagination returns flat list → group in frontend over accumulated pages
6. **Repurpose helpers**: Keep `toOffsetIso()` (still needed for `start_date` with browser offset). Rename `getDefaultWindowParams()` → `getDefaultStartDateParams()` returning only `{ start_date }` (plus `hub` for the hub variant).

#### Frontend — UI Changes
1. **Remove Today button**: Delete lines 443-445 in `EventCalendarContent.tsx`
2. **Move Reset**: Move `<Button onClick={handleReset}>` below the Topics `FormControl` (after line 483)
3. **Today marker**: In day header render (lines 503-529), add condition `group.dayStartMs === startOfTodayMs` → render badge
4. **Nav highlighting**: In `HubTabsNavigation`, enhance Event Calendar link styling when `isEventsPage`
   - Style the link as visually active (e.g., background pill or bold highlight matching the selected tab weight)
   - Keep `tabValue={-1}` on the events page — no browse tab should be incorrectly highlighted
   - The event calendar link's active state is independent of the tabs' `value` prop
5. **Calendar picker as jump-to-date**: `selectedDay` state still exists, defaulting to `dayjs()` (today). `onChange` sets it → triggers re-fetch with `start_date=<selected day>`. The `handleReset` clears search, sectors, and resets `selectedDay` to `dayjs()` (today) — re-fetching from today with no other filters. This differs from the browse page Reset (which clears to "all, ranked") because events are chronologically ordered and "today" is the natural starting point.

#### Custom Themes
- Check `EventCalendarContent` day tile colors (lines 506-521): currently uses `theme.palette.secondary.extraLight`, `theme.palette.primary.main`, `theme.palette.yellow.main`
- These may not exist in custom themes → use semantic palette colors (`primary.main`, `secondary.main`, `grey[100]`, etc.)
- `isCustomHub` flag already available — can conditionally adjust

### Trade-off Notes
- **No date window vs. windowed**: The PoC's 90-day window was a performance constraint, not a UX preference. With pagination, users can browse all events naturally via infinite scroll. The calendar picker becomes a convenience "jump to date" rather than the primary navigation.
- **Day grouping with pagination**: Events for a single day may be split across pages. The UI will show partial day groups until all pages load. This is acceptable for infinite scroll UX — users expect content to appear incrementally.
- **SSR with pagination**: Only page 1 is server-rendered. Client hydrates and continues from page 2. This is the same pattern as `ProjectPreviews`.
- **`end_date` removal**: Fully removed, not kept as optional. It added complexity with no user-facing value outside the windowed approach.

## System Impact Analysis

### Backend Impact

**1. `ListEventsView` (backend/organization/views/project_views.py)**
- Change `pagination_class = None` → `pagination_class = ProjectsPagination`
- Remove `MAX_WINDOW` constant
- Remove `end_date` parsing and filtering from `get_queryset()`
- Remove the default window fallback block (lines ~470-475) — when no `start_date` is given, return all events paginated (defensive fallback; frontend always sends `start_date` since default is today)
- Remove the `end_date` clamping block (lines ~478-482)
- Keep `start_date` as optional "jump to date" filter: `start_date__gte=<value>`
- Keep the single-param branch (`start_date` only) for jump-to-date; remove the dead `end_date`-only branch
- Response format changes from `[]` to `{ count, next, previous, results }`
- No changes to `get_serializer_context()`

**2. `EventCalendarCountsView`**
- Verify it doesn't accept `end_date` (it doesn't in current implementation — uses `year`/`month`)
- No changes required

**3. Tests** (`backend/organization/tests/test_event_calendar_view.py`)
- `TestEventCalendarListView`:
  - Add tests for pagination (`page`, `page_size`), verify `next`/`previous` links
  - Add tests for filter + pagination combo
  - Remove/update tests that send `end_date` param
  - Add test: `start_date=<today>` → returns events from today forward, paginated
  - Add test: `start_date` only → returns events from that date forward
  - Add test: no date params → returns all events paginated (defensive fallback)
- `TestEventCalendarCountsView`: Unchanged

**Files touched**: `organization/views/project_views.py`, `organization/tests/test_event_calendar_view.py`

### Frontend Impact

**1. `EventCalendarContent.tsx` (new version)**
- Replace `events` state with `allEvents`, `currentPage`, `hasMore`
- `fetchEvents(page, append)` builds params with `page` and `page_size`; sends `start_date` (from selected day, defaulting to today)
- Use `useInfiniteScroll` with sentinel element after day groups
- Filter changes → reset pagination state → fetch page 1
- Remove Today button (lines 443-445)
- Move Reset button below Topics FormControl
- Add "Today" badge in day header when `group.dayStartMs === startOfTodayMs`
- Remove `end_date` from all `params.set()` calls
- Remove window guard filter (`windowStartMs`/`windowEndMs` on lines 383-387) — no longer needed
- Adapt day grouping to work with incrementally loaded events (append to existing groups)

**2. `pages/events.tsx`**
- Keep `toOffsetIso` helper (still needed to send `start_date` with browser timezone offset)
- `getDefaultWindowParams` → rename/repurpose to `getDefaultStartDateParams`: returns only `{ start_date: toOffsetIso(today_start_of_day) }`
- `getServerSideProps`: Fetch page 1 with default `start_date` (`?page=1&page_size=12&start_date=<today>`)
- Pass `initialEvents` (page 1 `results`) and `initialHasMore` (from `data.next` existence) to component

**3. `pages/hubs/[hubUrl]/events.tsx`**
- Keep `toOffsetIso` helper (still needed to send `start_date` with browser timezone offset)
- `getDefaultWindowParams` → rename/repurpose to `getDefaultStartDateParams`: returns `{ start_date: toOffsetIso(today_start_of_day), hub: hubUrl }`
- `getServerSideProps`: Fetch page 1 with default `start_date` (`?page=1&page_size=12&start_date=<today>&hub=<hubUrl>`)
- Pass `initialEvents` and `initialHasMore` to component

**4. `HubTabsNavigation.tsx`**
- Enhance Event Calendar link active styling when `isEventsPage`
- Verify custom theme colors for prio1/perth

**5. Custom theme verification**
- Test day header tiles in prio1 and perth themes
- Ensure link colors work in both themes

**Files touched**:
- `src/components/eventCalendar/EventCalendarContent.tsx`
- `pages/events.tsx`
- `pages/hubs/[hubUrl]/events.tsx`
- `src/components/hub/HubTabsNavigation.tsx`

### Cross-Cutting / Integrations
- No changes to `ProjectStubSerializer`, `EventCardWide`, `eventSorting.ts`, `FilterSearchBar`
- Feature toggle `EVENT_CALENDAR_FEATURE` unchanged
- Date picker highlight (`EventCalendarCountsView`) unchanged

### Risks & Notes
- **Day grouping across pages**: A single day's events may be split across pages. The UI will show partial day groups until all pages load. This is acceptable for infinite scroll UX.
- **SSR hydration**: Client must not re-fetch page 1 on mount. Use `didInitFetch` pattern from PoC but adapted for pagination.
- **Custom theme palette**: `theme.palette.yellow.main` may not exist in custom themes. Replace with semantic colors.
- **Perth hub**: Note that `perth` in `customHubData` maps to `scottConfig` (climateconnect.scot). The hub URL slug is `perth` but config key is `perth`.
- **`start_date` with offset**: When the calendar picker selects a day and the frontend sends `start_date`, it should still be an offset-aware ISO string (e.g. `2026-07-21T00:00:00+02:00`) so the backend interprets the "start of day" in the viewer's local timezone. This is the same mechanism as the PoC, just without the `end_date` counterpart.

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 (PoC) | 2026-07-07 | Initial Event Calendar with 90-day window, no pagination |
| 2.0 (Production) | 2026-07-21 | Infinite scroll + pagination, remove `end_date`/`MAX_WINDOW`, UI refinements, nav highlighting, custom theme fixes |
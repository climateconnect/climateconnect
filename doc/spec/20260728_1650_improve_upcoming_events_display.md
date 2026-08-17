# Improve Upcoming Events Display on Browse Page

## Problem Statement

The upcoming events section on the browse page has two display issues that create suboptimal user experience:

1. **Uncontrolled wrapping**: When there are multiple upcoming events (currently max 4 from API), they wrap to multiple lines based on screen size. This can create visually unbalanced layouts where events display as 3+1 or 2+2 across rows, making the section appear incomplete or awkwardly spaced.

2. **Wasted space with few events**: When there are fewer upcoming events than the available horizontal space (e.g., 2 events on a large screen that could fit 4), the UpcomingEventsGroup component still renders as a separate section with empty visual space, rather than integrating those events into the main content area.

These issues matter because:
- The browse page is a primary entry point for users discovering content
- Visual consistency and space utilization directly impact user engagement
- Unbalanced layouts make the platform feel less polished and professional
- Wasted space pushes down the project grid, requiring more scrolling to see regular projects

## Acceptance Criteria

- [ ] Upcoming events display in a single horizontal row on desktop/tablet screens (sm breakpoint and up)
- [ ] Number of events in the row is responsive based on available space and screen size:
  - Display 2, 3, or 4 events horizontally in one row depending on screen size
  - Use CSS/JS to calculate available space or use MUI breakpoints to determine count
- [ ] On mobile screens (xs breakpoint, <600px): display maximum 2 events in vertical stack (2 rows)
- [ ] When the number of upcoming events is less than the maximum displayable for the current screen size (e.g., 2 events on a large screen that can fit 4), the events are appended to the top of the project grid instead of showing a separate UpcomingEventsGroup component
- [ ] When events are merged into the project grid:
  - They appear as the first items in the grid (before regular projects)
  - They already display their event type, so no additional visual distinction needed
  - The UpcomingEventsGroup component is not rendered
  - The "Event Calendar" button is not shown (navigation already provides access)
- [ ] Duplication is prevented: **only visible upcoming events** are removed from the projects grid
  - If API returns 4 events but only 2 are displayed (e.g., mobile), the other 2 must remain in the project grid
  - Current deduplication logic removes ALL upcoming events - this must be fixed
- [ ] The solution works on both `/browse` and `/hubs/[hubUrl]/browse` pages
- [ ] Responsive behavior dynamically adjusts on screen size changes (using MUI breakpoints or available space calculation)
- [ ] No "Event Calendar" button when events are merged into grid (only show button when UpcomingEventsGroup component renders)

## Constraints and Non-Negotiable Requirements

- Must maintain the existing `EVENT_CALENDAR_FEATURE` feature toggle behavior
- Events must be fetched in parallel with projects (not sequentially)
- **API returns maximum 4 events** - no change to backend limit needed
- **Desktop/tablet (sm+)**: Events display in a single horizontal row (1 row max, 2-4 events depending on screen size)
- **Mobile (xs, <600px)**: Events display in vertical stack, maximum 2 events (2 rows)
- **Deduplication fix required**: Only visible upcoming events should be removed from projects grid, not all API-returned events
- Must not break the existing deduplication logic - it needs to be modified, not removed
- The "Event Calendar" button only appears when UpcomingEventsGroup component renders (not when events merge into grid)
- Must handle the case where events and projects load asynchronously (events may arrive after projects grid renders)
- Must not increase API calls or create additional network requests
- The solution should be performant and not cause layout shifts during page load
- Responsive behavior must work dynamically on screen size changes

## Domain Context

- Upcoming events are fetched via `/api/events/upcoming/` which currently returns max 4 events (see `backend/organization/views/project_views.py` line 713)
- The `UpcomingEventsGroup` component renders events using `ProjectPreviews` with `parentHandlesGridItems` prop
- Events are displayed above the projects tab content in `TabContentWrapper` via the `eventsContent` prop
- The browse page uses MUI's breakpoint system: `xs` (<600px), `sm` (600-900px), `md` (900-1200px), `lg` (1200-1536px), `xl` (1536px+)
- `ProjectPreviews` component uses a CSS Grid layout with responsive breakpoints
- The current grid implementation in `ProjectPreviews` may need modification to support the max-2-rows constraint

## AI Insights

### Implementation Hints

**Frontend Changes:**

1. **Determine display count per breakpoint**:
   - Create a hook or utility that returns how many events to display based on screen size
   - Use MUI's `useMediaQuery` with breakpoints:
     - `xs` (<600px): display 2 events (vertical stack)
     - `sm` (600-900px): display 2-3 events (horizontal row)
     - `md` (900-1200px): display 3-4 events (horizontal row)
     - `lg+` (1200px+): display 4 events (horizontal row)
   - Or use container query / available space calculation for more precise control

2. **Modify BrowseContent logic for merge decision**:
   - After fetching upcoming events (max 4), determine `displayCount` based on screen size
   - If `upcomingEvents.length < displayCount` (e.g., 2 events on large screen):
     - Merge all events into `projectsForGrid` as first items
     - Set `eventsContent` to `undefined`
   - Else (4 events on large screen, or 3 events on medium screen):
     - Show UpcomingEventsGroup with `events.slice(0, displayCount)` events
     - Keep deduplication for only the visible events

3. **Fix deduplication logic (CRITICAL)**:
   - Current code (line 243-244 in BrowseContent.tsx):
     ```typescript
     const upcomingSlugs = new Set(upcomingEvents.map((e) => e.url_slug));
     return state.items.projects.filter((p) => !upcomingSlugs.has(p.url_slug));
     ```
   - This removes ALL upcoming events from grid - must be fixed to only remove visible ones
   - New logic:
     ```typescript
     const visibleEvents = upcomingEvents.slice(0, displayCount);
     const visibleSlugs = new Set(visibleEvents.map((e) => e.url_slug));
     return state.items.projects.filter((p) => !visibleSlugs.has(p.url_slug));
     ```

4. **Modify UpcomingEventsGroup for responsive display**:
   - Pass `displayCount` prop to limit rendered events
   - Or filter events array in BrowseContent before passing to component
   - Ensure horizontal layout on desktop (CSS Grid/Flexbox with `flex-wrap: nowrap` or appropriate grid columns)
   - Ensure vertical layout on mobile (CSS Flexbox with `flex-direction: column`)

5. **Handle responsive recalculation**:
   - Use `useMediaQuery` hooks to detect breakpoint changes
   - When breakpoint changes, recalculate `displayCount` and adjust:
     - Whether to merge or show separately
     - Which events are "visible" (for deduplication)
   - This may require `useEffect` to update state when breakpoint changes

6. **CSS/Layout for single row on desktop**:
   - Use CSS Grid with `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))` for flexible columns
   - Or use Flexbox with appropriate `flex-basis` and `max-width` to control items per row
   - Ensure `overflow: hidden` or proper containment to prevent wrapping to second row on desktop
   - On mobile: `flex-direction: column` or `grid-template-columns: 1fr` for vertical stack

**No Backend Changes Required:**
- API already returns max 4 events
- No need to increase limit
- No new endpoints needed

### Trade-off Notes

- **Breakpoint vs available space calculation**: Using MUI breakpoints is simpler and more predictable. Available space calculation (container queries) is more precise but requires additional logic and may not be well-supported in all browsers.
- **Merge vs separate section**: Merging events into the grid when few exist creates better space utilization but requires careful deduplication logic. The trade-off is implementation complexity vs UX improvement.
- **Responsive recalculation complexity**: Handling dynamic breakpoint changes adds state management complexity. An alternative is to only calculate on initial load and mount/unmount, but this provides a less dynamic experience.
- **Deduplication fix impact**: The current bug (removing all events from grid) must be fixed. This is a breaking change if not handled carefully - test thoroughly.

### Open Questions

1. **How to handle partial display on mobile**: When API returns 4 events and we're on mobile (max 2 displayed), should we:
   - Show 2 in UpcomingEventsGroup and keep 2 in grid?
   - Or always merge when count < displayCount (so if 3 events on mobile, merge all 3 even though only 2 shown)?
   
2. **Animation/transition**: Should there be a smooth transition when switching between merged and separate display modes on resize?

3. **Hub browse pages**: The same logic should apply to `/hubs/[hubUrl]/browse` - confirm this is the desired behavior (spec already includes this).

## System Impact Analysis

### Frontend Impact

**1. `BrowseContent.tsx`** (PRIMARY CHANGES):
- Add screen size detection using `useMediaQuery` for xs, sm, md, lg breakpoints
- Add logic to determine `displayCount` (how many events to show) based on breakpoint
- **Fix deduplication logic** (lines 239-245):
  - Change from removing ALL upcoming events to only removing VISIBLE events
  - Use `displayCount` to determine which event slugs to exclude from grid
- Modify `eventsContent` memoization:
  - Compare `upcomingEvents.length` to `displayCount`
  - If fewer events than displayable: merge into grid, don't render UpcomingEventsGroup
  - If equal/more: render UpcomingEventsGroup with `upcomingEvents.slice(0, displayCount)`
- Add `useEffect` or state to handle breakpoint changes and recalculate merge/display decision
- Prepend events to `projectsForGrid` when merging

**2. `UpcomingEventsGroup.tsx`** (MINOR CHANGES):
- Potentially accept `maxEvents` prop to limit displayed events
- Or handle limiting in BrowseContent before passing `events` prop
- Ensure horizontal layout on desktop (single row)
- Ensure vertical layout on mobile (stacked)

**3. `ProjectPreviews.tsx`** (POSSIBLE CHANGES):
- May need to handle "events mixed with projects" if special styling needed
- Events already show their type via existing UI, so likely no changes needed
- Ensure grid layout supports single row on desktop (no wrapping)

**4. New utility/hook** (NEW FILE):
- Create `useUpcomingEventsDisplayCount` hook or utility function
- Returns how many events to display based on current breakpoint
- Handles responsive breakpoint detection

### Backend Impact

**No backend changes required**:
- API already returns max 4 events (`[:4]` in `ListUpcomingEventsView`)
- No new endpoints needed
- No changes to existing API logic

### Testing Requirements

- Test at all breakpoints (xs, sm, md, lg, xl) with varying numbers of events (0, 1, 2, 3, 4)
- Test screen resize behavior - dynamically switch between merge and separate display
- Test on both `/browse` and `/hubs/[hubUrl]/browse` pages
- Test with `EVENT_CALENDAR_FEATURE` enabled and disabled
- **Test deduplication fix**: 
  - 4 events returned, 2 displayed on mobile → other 2 should appear in grid
  - 4 events returned, 4 displayed on desktop → none should appear in grid
  - 2 events returned, 4 displayable → events merge into grid, none in separate section
- Test async loading states (events arrive before/after projects)
- Test mobile vertical layout (2 events stacked)
- Test desktop horizontal layout (1 row, 2-4 events)
- Verify "Event Calendar" button only appears with UpcomingEventsGroup, not when merged
- Verify no console errors or warnings during resize transitions

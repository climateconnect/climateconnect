# Upcoming Events on Browse Projects Page (Production Ready)

## Problem Statement

The current proof of concept extracts upcoming events from the ranked projects response in `BrowseContent.tsx`. This approach was a temporary workaround to showcase the possible UI.

We need a dedicated endpoint that returns a small set (max 4) of future events filtered by the current browse context, so the events block can load in parallel with the main projects grid and show truly relevant upcoming events.

## Acceptance Criteria

- [ ] New API endpoint `/api/events/upcoming/` returns events filtered by browse context
- [ ] Endpoint accepts same filters as projects endpoint: `search`, `hub`, `sectors`, and location-based filters (via POST)
- [ ] Only returns events with `start_date` in the future (relative to the timestamp sent by frontend)
- [ ] Returns maximum of 4 events, ordered by `start_date` ascending (chronologically)
- [ ] Response format matches `ProjectStubSerializer` (same as projects endpoint)
- [ ] Frontend `BrowseContent` fetches upcoming events via dedicated endpoint in parallel with projects
- [ ] Upcoming events block appears at top of projects tab when `EVENT_CALENDAR_FEATURE` is enabled
- [ ] Events shown respect current location, search, sector filters
- [ ] Events not shown twice (dedup logic: remove upcoming events from projects grid results)
- [ ] Location filter race condition is handled gracefully

## Constraints and Non-Negotiable Requirements

- Events block hidden when `EVENT_CALENDAR_FEATURE` is disabled
- No changes to existing `ListProjectsView` or its data structure
- Location filter behavior must match existing browse pattern (POST creates location if needed)
- Events shown are from the same filtered scope as the projects grid below
- Maximum 4 events returned (no pagination needed for this small fixed set)
- Frontend sends `start_date` parameter with browser timezone offset (e.g. `2026-07-22T00:00:00+02:00`) to ensure "future" filtering aligns with user's local day
- Timezone handling: backend uses the offset-aware datetime sent by frontend, falling back to UTC if naive

## Domain Context

- `ListEventsView` already exists at `/api/events/` with pagination and `start_date` filtering
- `UpcomingEventsGroup` component already exists, extracting events client-side
- `getClassificationTimestamp` in `eventSorting.ts` determines if an event is upcoming based on `end_date`
- Location filters in browse use POST request to `ListProjectsView.post()` which calls `get_location_with_range()` to create/fetch location

## AI Insights

### Implementation Hints

**Backend:**
- Create a new read-only view `ListUpcomingEventsView` in `backend/organization/views/project_views.py`
- Register at `GET /api/events/upcoming/` (no pagination - always returns max 4 events)
- Reuse `ProjectStubSerializer` for identical response format
- Accept `start_date` query param (ISO datetime with timezone) to filter to events starting from that timestamp forward
- Apply same filters as `ListEventsView`: `search`, `hub`, `sectors`, location (via POST)
- If no `start_date` provided, assume "now" (server time) as the baseline
- Order by `start_date` ascending, limit to 4 results
- Support POST for location filter (mirror `ListProjectsView.post()` behavior)

**Frontend:**
- Replace `getUpcomingEventHighlights()` extraction with dedicated API call
- Fetch upcoming events in parallel with projects in `BrowseContent`
- Use same filter values that were applied to projects grid (including location)
- Remove event-type projects that appear in upcoming events from projects grid (dedup)
- Only fetch when `EVENT_CALENDAR_FEATURE` is enabled

### Trade-off Notes

- **Separate endpoint vs. extraction**: Separate endpoint allows parallel loading and respects filters. The extraction approach was a quick POC workaround.
- **Location filter race condition**: Both endpoints use the same location object. `get_location()` is idempotent - looks up existing or creates new. Race condition is benign.
- **POST vs query params for location**: Must use POST matching `ListProjectsView` behavior since location data is large/structured.

## System Impact Analysis

### Backend Impact

**1. New endpoint `ListUpcomingEventsView`**
- File: `backend/organization/views/project_views.py`
- Returns a plain list (no pagination) with max 4 events
- Shares filtering logic with `ListEventsView` via refactored helper methods
- Supports both GET (query param filters) and POST (location object)
- Uses `ProjectStubSerializer` for identical response format

**2. URL registration**
- File: `backend/organization/urls.py`
- Route: `GET /api/events/upcoming/` using existing `ListUpcomingEventsView`

**3. No changes to existing endpoints**
- `ListProjectsView` unchanged - all extraction logic moves to frontend
- `ListEventsView` remains for the dedicated calendar page

### Frontend Impact

**1. `BrowseContent.tsx`**
- Add parallel fetch for upcoming events alongside projects fetch (when feature enabled)
- Replace `getUpcomingEventHighlights()` extraction with API response
- Deduplicate: remove events returned by upcoming endpoint from projects grid results
- Pass same filter values to upcoming events endpoint (including location via POST)

**2. `UpcomingEventsGroup.tsx`**
- Simplify to only render - remove extraction logic
- Receive events array as prop (unchanged interface)

**3. `getDataOperations.ts`**
- Add `getUpcomingEvents` function for the dedicated endpoint
- Handle location filter via POST matching projects pattern

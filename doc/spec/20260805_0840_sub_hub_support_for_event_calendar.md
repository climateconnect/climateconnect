# Sub-Hub Support for Event Calendar and Upcoming Events

## Problem Statement

Perth is the only location hub that uses sub-hubs (e.g. a "Wasseraktionswochen" sub-hub under the Perth parent hub). On the browse page (`/hubs/perth/zerowaste/browse`), sub-hubs are fully supported: the page resolves the sub-hub slug, fetches data scoped to it, and shows a contextual info text ("You are seeing events related to the topic …"). The backend's `apply_hub_filter` already handles sub-hub slugs correctly — when it receives a sub-hub slug, it includes the parent hub's location in the filter too.

However, the event calendar (`/hubs/[hubUrl]/events`) and the upcoming events on the browse page have no sub-hub awareness on the frontend. There is no `/hubs/[hubUrl]/[subHub]/events` route, the HubTabsNavigation "Event Calendar" link from a sub-hub browse page navigates to the parent hub's events page (losing sub-hub scope), and the events page does not show the contextual info text that the browse page shows for sub-hubs.

## Acceptance Criteria

- [ ] New route `/hubs/[hubUrl]/[subHub]/events` exists and renders the event calendar scoped to the sub-hub
- [ ] SSR on the new route resolves the sub-hub slug (same pattern as `getHubBrowseServerSideProps`) and passes it to the event calendar components
- [ ] `EventCalendarContent` and `EventCalendarEventList` receive the sub-hub slug for their `?hub=` API calls
- [ ] The "Event Calendar" link in `HubTabsNavigation` on a sub-hub browse page navigates to the sub-hub events page (e.g. `/hubs/perth/zerowaste/events`), not the parent hub's events page
- [ ] On the sub-hub events page, `HubTabsNavigation` browse-tab links navigate back to the sub-hub browse page (e.g. `/hubs/perth/zerowaste/browse#projects`), not the parent hub's browse page
- [ ] A contextual info text is shown on the events page when the hub is a sub-hub (same style as the browse page's "You are seeing projects/organisations/members related to …" text, but for events)
- [ ] The upcoming events on the sub-hub browse page already fetch correctly via `hubData?.url_slug` — verify this still works and no regression is introduced
- [ ] All existing hub events pages (`/hubs/[hubUrl]/events`) continue to work unchanged
- [ ] The global events page (`/events`, no hub context) continues to work unchanged

## Constraints and Non-Negotiable Requirements

- **Frontend-only change.** The backend `apply_hub_filter` already handles sub-hub slugs; no backend work is needed.
- Only Perth uses sub-hubs. No other hub type or configuration needs to be considered.
- The sub-hub info text must be translatable (English and German), following the same pattern as the existing browse-page texts in `getHubTexts.ts`.
- The sub-hub events page must behind the `EVENT_CALENDAR_FEATURE` toggle (same as the parent events page).
- Navigation between sub-hub browse and sub-hub events pages must not lose the sub-hub context (the URL must always include the sub-hub segment).

## Domain Context

**How sub-hub routing works today (browse page):**
- Route: `/hubs/[hubUrl]/[subHub]/browse.tsx` — thin re-export of `HubBrowsePage`
- `extractHubUrlsFromContext(ctx)` combines `ctx.query.hubUrl` + `ctx.query.subHub` into a composite slug (e.g. `perth_zerowaste`) used for API calls
- `getHubBrowseServerSideProps` passes both `hubUrl` (parent slug, e.g. `perth`, used for navigation) and `subHubUrl` (composite slug, used for API filtering)
- `hubData` is fetched with the composite sub-hub slug; `hubData.parent_hub` is truthy when on a sub-hub
- `BrowseContent` uses `hubData?.url_slug` (the composite sub-hub slug) for all API calls (projects, orgs, members, upcoming events)
- The info text (`hubData?.parent_hub && <text>`) is shown at the top of each tab

**How the events page works today:**
- Route: `/hubs/[hubUrl]/events.tsx` — no sub-hub variant
- SSR fetches hub data with `ctx.query.hubUrl` (parent slug only)
- Passes `hubUrl` to `EventCalendarContent`, `EventCalendarEventList`, and `ListUpcomingEventsView` calls — all use it as `?hub=` API param
- `HubTabsNavigation` receives `hubUrl` and builds event-calendar link as `/hubs/${hubUrl}/events`

**How `apply_hub_filter` works:**
- Receives a hub slug, looks up the hub
- If the hub has a `parent_hub` (i.e. it IS a sub-hub), adds the parent to the filter set
- Filters by all hubs in the set — so sub-hub queries automatically include the parent hub's geographic scope
- When the parent hub slug is passed, only the parent's scope is used (sub-hubs are NOT aggregated upward)

## AI Insights

### Implementation Hints

**New route file** — Create `frontend/pages/hubs/[hubUrl]/[subHub]/events.tsx` as a thin re-export, mirroring the browse pattern:
- Import the events page component and its `getServerSideProps`
- Re-export both

**Events page SSR refactor** — The current `getServerSideProps` in `pages/hubs/[hubUrl]/events.tsx` needs to become a reusable named export (like `getHubBrowseServerSideProps`), and must be updated to:
- Call `extractHubUrlsFromContext(ctx)` to detect sub-hub context
- When `subHub` is present, use the composite slug for `getHubData`, `getHubTheme`, hub-existence check, and initial event fetch (`?hub=` param)
- Pass `subHubUrl` as an additional prop (null when not on a sub-hub page)
- Pass the raw `ctx.query.hubUrl` (parent slug) for navigation purposes

**Events page component** — Accept new `subHubUrl` prop:
- Pass `subHubUrl || hubUrl` to `EventCalendarContent` and `EventCalendarEventList` as the `hubUrl` prop (so API calls use the sub-hub slug when on a sub-hub page)
- Show info text when `hubData?.parent_hub` is truthy, using a new text key `you_are_seeing_events_related_to`
- Use the raw `hubUrl` (parent slug) combined with `ctx.query.subHub` (raw segment) for navigation paths

**HubTabsNavigation** — Add optional `subHubSegment` prop:
- When present, build event-calendar link as `/hubs/${hubUrl}/${subHubSegment}/events`
- When present, build browse-tab links as `/hubs/${hubUrl}/${subHubSegment}/browse#...`
- The `subHubSegment` is the raw URL segment (e.g. `zerowaste`), not the composite slug
- Both the events page and the browse page must pass this prop when on a sub-hub

**Mobile bottom menu** — The `MobileBottomMenu` in the events page uses `hubUrl` for the events tab link. When on a sub-hub, the events tab should stay on the sub-hub events page (no navigation needed since we're already there), and the browse tab should link to the sub-hub browse page. Verify the existing behavior and adjust if needed.

**Text key** — Add `you_are_seeing_events_related_to` to `getHubTexts.ts`:
- en: `"You are seeing events related to the topic \"${hubName}\""`
- de: `"Du siehst Events zum Thema \"${hubName}\""`

### Trade-off Notes

- **Reuse vs. copy of SSR logic**: The events page SSR could be refactored into a shared helper, but given there are only two consumers (browse and events) and the logic is straightforward, a direct update to the events page SSR is simpler. If a third hub page needs sub-hub support later, extract a shared helper then.
- **subHubSegment prop on HubTabsNavigation**: An alternative is to compute the sub-hub path inside HubTabsNavigation from the current router path, but an explicit prop is clearer and avoids fragile path parsing.
- **Info text reuse**: Could reuse the existing `you_are_seeing_projects_related_to` text (which already mentions "events"), but a dedicated events text is more accurate and avoids confusion when only events are displayed.

## System Impact Analysis

### Backend Impact

None. All three event endpoints (`ListEventsView`, `EventCalendarCountsView`, `ListUpcomingEventsView`) already call `apply_hub_filter` which handles sub-hub slugs correctly.

### Frontend Impact

**1. New route file**
- `frontend/pages/hubs/[hubUrl]/[subHub]/events.tsx`
- Thin re-export of the events page component and `getServerSideProps`

**2. Events page (`frontend/pages/hubs/[hubUrl]/events.tsx`)**
- Refactor `getServerSideProps` into a named export so the sub-hub route can re-export it
- Add `extractHubUrlsFromContext` to detect sub-hub
- Use composite sub-hub slug for hub data, hub theme, sector options, and initial event fetch
- Pass `subHubUrl` (composite slug) and `subHubSegment` (raw URL segment) as new props
- Accept `subHubUrl` in the component and pass it as `hubUrl` to `EventCalendarContent` and `EventCalendarEventList`
- Show info text when `hubData?.parent_hub` is truthy
- Pass `subHubSegment` to `HubTabsNavigation` and `MobileBottomMenu`

**3. HubTabsNavigation (`frontend/src/components/hub/HubTabsNavigation.tsx`)**
- Add optional `subHubSegment` prop
- When present, prefix sub-hub segment into event-calendar and browse-tab link paths

**4. Texts (`frontend/public/texts/getHubTexts.ts`)**
- Add `you_are_seeing_events_related_to` (en + de)

**5. HubBrowsePage (`frontend/src/components/hub/HubBrowsePage.tsx`)**
- Pass `subHubSegment` (raw `ctx.query.subHub`) to `HubTabsNavigation` so the event-calendar link on the sub-hub browse page navigates to the sub-hub events page

**6. Mobile bottom menu**
- Verify that the mobile bottom menu on the events page correctly handles the sub-hub context for navigation links

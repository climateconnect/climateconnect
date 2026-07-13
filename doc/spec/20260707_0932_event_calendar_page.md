# Event Calendar Page (Proof of Concept)

## Problem Statement

On Climate Connect, projects exist in three types: **ideas**, **projects**, and **events**. Today all three are shown together on the Browse page, ordered by a ranking score. This is poor for events: because ranking is not time-based, events can appear out of chronological order, and past events can even rank above upcoming ones. Users have repeatedly asked for a better way to discover and browse events.

We will build a new **Event Calendar** page that lists events in true chronological order, grouped by day, with focused filters (text search, topic, date range) and support for global and per-hub scopes. The page is a standalone route (not a 4th Browse tab), discoverable via a link in the existing tab navigation. It is a **proof of concept** — the goal is to ship a working end-to-end experience to gather first user insights, then iterate.

The feature is gated by a frontend feature toggle `EVENT_CALENDAR_FEATURE`. The backend can ship new API endpoints without toggles.

## Acceptance Criteria

- [ ] A new Event Calendar page exists at a dedicated route (global + per-hub), implemented as a **separate page, not a 4th Browse tab**
- [ ] A link labeled **"Event calendar"** is present in the tab navigation (`HubTabsNavigation`) and routes to the new page
- [ ] The page lists **only event-type projects** (`project_type = event`)
- [ ] Events are ordered **chronologically by start date and time**
  - [ ] The UI groups events **by day**; within a day, events are ordered **by time**
  - [ ] **Multi-day events are shown only on their start date** (the day of `start_date`). They are NOT expanded onto the other days they span (see Revision note below).
  - [ ] Filters are available and functional:
  - [ ] **Text search** (matches event name / translated name)
  - [ ] **Topic** filter — a **multi-select list of checkboxes** (user can select multiple topics at once); maps to the existing `sectors` multiselect filter (sent as comma-separated `sectors` values)
  - [ ] **Date** filter — a single-day **calendar picker** (the user picks one day; the page then shows that day plus the next 90 days). A **"Today"** button returns to the current date.
- [ ] The page supports **hub scoping**: when viewed in a hub context it shows only that hub's events, identical to Browse behavior
- [ ] Non-public projects are **excluded** exactly as on Browse (`is_draft = false` AND `is_active = true`)
- [ ] A **new wide event card component** is created for the calendar (the existing vertical `ProjectPreview` must not be overloaded)
- [ ] The filter section is rendered on the **left side** of the page on desktop
- [ ] The layout is **responsive**: on mobile the topic/date filters collapse into a menu (hamburger), while the **text search bar stays always visible** for quick search — mirroring the Browse page behavior
- [ ] The entire feature (link + page) is hidden unless `EVENT_CALENDAR_FEATURE` is enabled (frontend only)
- [ ] New backend API endpoint(s) return event data with the required filters, hub scoping, and chronological ordering
  - [ ] Default view shows the **current day plus the next 90 days**; picking a different day in the calendar shifts the visible window to that day + 90 days
- [ ] The default window is fetched in a **single request with no pagination** (POC scope); changing the date filters re-fetches the redefined window
- [ ] The POC is functional end-to-end (browse → filter → see chronologically ordered events) so it can be tested with real users

## Constraints and Non-Negotiable Requirements

- The feature toggle `EVENT_CALENDAR_FEATURE` is applied **only in the frontend**. Backend endpoints are always available and require no toggle.
- The Event Calendar is a **separate page/route**, never a 4th Browse tab.
- Reuse existing, proven patterns rather than reinventing them:
  - text search via the existing `search` query param behavior
  - topic filtering via the existing `sectors` filter
  - hub scoping via the existing `hub` query param / hub-filter behavior
  - per-day ordering logic already implemented for Wasseraktionswochen
- Exclusion rules for non-public content must match Browse exactly (`is_draft`, `is_active`).
- A **dedicated wide card component** must be created; the existing card component must not be made more complex.
- Scope is a **POC**: prioritize a working, insight-generating experience over completeness. Known limitations are acceptable and should be documented.

## Domain Context

- **Project types**: A `Project` can be an idea, project, or event. Events carry `start_date` / `end_date` and an all-day convention where all-day events store a `00:00` start time. **Requirement**: events always have both `start_date` and `end_date` set. The model fields are nullable only because they are shared with idea/project types (which may omit them); the calendar relies on the event guarantee. The create/edit event forms already enforce start and end dates, so the calendar can depend on them being present. **Display rule (revised)**: A multi-day event is shown **only on its `start_date` day** — not on every calendar day it spans. This is intentional: in practice multi-day events are not guaranteed to actually hold events on each spanned day, and are often not open to the public on the other days. The `end_date` is therefore used only for informational display (e.g. "Jul 1 – Jul 3"), never for placing the event on multiple calendar days.
- **Browse page**: Currently has three tabs — Browser (projects), Organisations, Members. The code already contains `TODO` markers and a stubbed `events` branch indicating prior intent to add events here; this task deliberately takes the separate-page route instead.
- **Feature toggle system**: Toggles are defined in the backend `FeatureToggle` model and served via `/api/feature_toggles/?environment=...`. The frontend consumes them through `FeatureToggleProvider` and the `isEnabled(name, fallback)` helper (`FeatureToggles` is a `Record<string, boolean>`). The toggle *value* is therefore sourced from the backend, but **gating** happens only in the frontend.
- **Per-day ordering reference**: `WasseraktionswochenEvents.tsx` already implements `compareByStartDate` / `getDisplaySortTimestamp`, which correctly handles three event classes within a day — timed events, all-day events (midnight start, bumped after timed), and ongoing multi-day events (bumped to end of day). This logic should be reused/adapted.
- **Existing card**: `ProjectPreview` is a vertical card (image, name, metadata). The calendar needs a **wide** (horizontal) variant, which does not exist yet.
- **Route collision note**: `/calendar/[projectId].ics` already exists for iCal subscriptions. The new page should use a distinct route (proposed: `/events` globally and `/hubs/[hubUrl]/events` per hub) to mirror the Browse structure and avoid confusion.
- **Ranking vs time**: Browse orders by rank; the calendar must order strictly by `start_date`/`start_time` ascending.
- **UI mockup**: A reference mockup is provided at [`event-calendar-mockup.png`](doc/spec/event-calendar-mockup.png) and defines the visual direction: a full-width **search bar at the top** (always visible), a **left filter panel** with Topic (multi-select checkboxes), a single-day calendar picker (above the topics), and a Reset button, and the event list **grouped by day** with a **calendar-style day header**: a colored tile showing the **month name + day number** (e.g. a "JUL / 1" tile) next to the **weekday** as text (e.g. "Wednesday") — i.e. the day header looks like a small calendar sheet rather than plain "Wednesday, July 1" text. Each event uses a **wide card** (horizontal): image on the left; content on the right with a **topic chip (icon + name) in the top-right corner**, a left-aligned text block (start/end date-time, title, owner with avatar, location), and a **bottom-right row** with status icons + counts (comments, likes) and the optional event-registration button — mirroring the information of the existing `ProjectPreview` (project type omitted, since this page is events-only). This mockup is the source of truth for layout and should be matched during implementation.

## AI Insights

### Implementation Hints
- **Backend data**: A new endpoint should filter to event-type projects, apply the same `is_draft=False, is_active=True` exclusion as `ListProjectsView`, support `search`, `hub`, `sectors`, and a `start_date`/`end_date` range, and order by `start_date` ascending. The existing `ListProjectsView` (`backend/organization/views/project_views.py`) is the reference for search fields, hub filtering, and exclusion — reuse its behavior.
  - **Default window**: The user picks a single day in the calendar; the window is that day through day + 90 days. The default selected day is today, so the initial window is today → today + 90 days. Picking another day shifts the window.
- **Per-day grouping/ordering (simplified)**: Group events by their `start_date` day only — do **not** expand multi-day events onto each spanned day. Within a day, order by `start_date`/`start_time` ascending. The "ongoing multi-day event bumped to end of day" class from `getDisplaySortTimestamp` is no longer needed because each event appears exactly once on its start date; the shared util can drop that branch. The `compareByStartDate` + `getDisplaySortTimestamp` helpers from `WasseraktionswochenEvents.tsx` remain the source for within-day ordering of timed vs all-day (midnight) events.
- **Toggle registration**: `EVENT_CALENDAR_FEATURE` must be registered as a `FeatureToggle` row (so the frontend can read its value per environment). Gating (showing/hiding link + page) is frontend-only via `isEnabled("EVENT_CALENDAR_FEATURE")`.
- **Wide card**: Create a new `EventCardWide` component with a horizontal layout (image on the left, content on the right) that mirrors the **information density of the existing `ProjectPreview`** but omits the project-type (this page is events-only). Reuse the existing building blocks rather than re-implementing them: `ProjectSectorsDisplay` (topic + icon, top-right), `CreatorAndCollaboratorPreviews` (owner with avatar — exported from `ProjectMetaData`), `LocationDisplay` (location), and the registration helpers `shouldShowRegisterButton` / `getRegisterButtonText` / `isRegisterButtonDisabled` for the optional register button. Layout: left = image; right = a top-right topic chip, a left-aligned text block (start/end date-time, title, owner with avatar, location), and a bottom-right row with status icons + counts (comments when >0, likes when >2, same thresholds as `ProjectMetaData`) and the optional register button. The existing vertical `ProjectPreview` is **not** modified.
- **Navigation link**: Add the link inside `HubTabsNavigation` (e.g., in the right-side/link area), not as a `Tab` element, so the three Browse tabs remain unchanged.
- **Route proposal**: `/events` (global) and `/hubs/[hubUrl]/events` (per hub), mirroring how Browse is structured. Confirm during review.
- **Topic mapping**: "Topic" in the request maps to the existing `sectors` multiselect filter used on the projects Browse tab.

### Trade-off Notes
  - **Single-day + 90-day window vs. all-events**: Chose a single-day calendar picker that loads the selected day plus the next 90 days for performance and focused UX; picking another day reaches past/future windows. Alternative (show all chronologically) was rejected for POC simplicity and payload size.
- **Separate page vs. 4th tab**: A separate page keeps the Browse tabs intact, gives the calendar its own URL/filters/state, and avoids the tab-state complexity the Browse refactor aimed to remove. Discoverability is preserved via a nav link.
- **New card component vs. extending `ProjectPreview`**: A new component avoids over-complicating the existing widely-used card. Some visual duplication is acceptable and explicitly desired over entanglement.
- **New backend endpoint vs. extending `ListProjectsView`**: A dedicated endpoint keeps Browse logic clean and lets the calendar own event-specific ordering and date-range filtering. The system architect should finalize the exact endpoint shape (see System Impact Analysis).
- **Frontend-only toggle**: Simpler and sufficient for a POC; backend endpoints stay always-on. The toggle value still originates from the backend `feature_toggles` service.

### Decisions (resolved in review)
- **Route**: `/events` (global) and `/hubs/[hubUrl]/events` (per hub), mirroring the Browse structure and avoiding collision with the iCal route `/calendar/[projectId].ics`.
- **Pagination**: Simple full-window load — the default window is fetched in a single request with no pagination (appropriate for a POC given the bounded 3-month window and modest event volumes). Pagination can be added later if volumes grow.
- **Per-hub nav**: The nav link is hub-aware — on a hub page it points to `/hubs/[hubUrl]/events`, on global Browse to `/events` — using the same `HubTabsNavigation` link, URL derived from the current hub context.
  - **Time window**: Single-day calendar picker; the window is the selected day + next 90 days (default = today). Picking another day shifts the window in either direction (past or future).

## Revision: Multi-Day Event Display (Iteration 1 → 2)

**Why this change**: During iteration 1 we discovered that multi-day events are frequently NOT actually held on every spanned calendar day, and are often not open to the public on the other days. Showing them on every day therefore creates misleading "empty" event days. The agreed simplification: **show a multi-day event only on its `start_date` day**. This removes the multi-day expansion in both the counts endpoint and the frontend day-grouping, and lets us drop the "ongoing multi-day event" ordering branch.

**Impact on the spec**: the Domain Context display rule, Acceptance Criteria, AI Insights hints, and System Impact Analysis (backend §3/§7 and frontend §4b/§5) have been updated in place to reflect start-date-only display and counting. The list endpoint window filter is simplified from overlap-based to `start_date`-within-window.

### Changes required in the first implementation

**Backend**
- `EventCalendarCountsView` (`backend/organization/views/project_views.py`): replace the multi-day "expand onto every spanned day" bucketing with a single bucket per event on its `start_date` (local day in the requested `timezone`). Remove the per-day span loop. Each `{date, count}` now reflects events whose `start_date` local day equals that date.
- `ListEventsView` (`backend/organization/views/project_views.py`): change the window membership filter from overlap semantics (`start_date <= window_end AND end_date >= window_start`) to `start_date >= window_start AND start_date <= window_end`. Events whose `start_date` is outside the window are no longer returned (they would have no day to render on anyway).
- Tests (`backend/organization/tests/test_event_calendar_view.py`):
  - `TestEventCalendarCountsView`: remove/adjust the multi-day-expansion test — a 3-day event must now produce a single `count=1` on its start day, not three days; assert that spanned days are NOT counted.
  - `TestEventListView`: remove/adjust any test that asserted pre-window ongoing (overlap) events are returned.

**Frontend**
- `src/utils/eventSorting.ts` (extracted helpers): drop the "ongoing multi-day event → bumped to end of day" branch in `getDisplaySortTimestamp` (or keep it only in Wasseraktionswochen's copy and not use it for the calendar). Within-day ordering is now simply by `start_date`/`start_time`.
- `src/components/eventCalendar/EventCalendarContent.tsx`: remove the multi-day expansion logic that duplicated each event across the days it spans. Group events by `start_date` day only. Remove the "place ongoing event at end of day" handling. Keep `end_date` only as informational text on the card.
- `src/components/eventCalendar/EventCardWide.tsx`: **no change required.** It already renders a single event once (it never expanded across days — that logic lives in `EventCalendarContent`) and already displays the full `start → end` range as text (lines 199–204, shown at line 266). Just confirm it still looks correct after the parent stops rendering the same event on multiple days. (Optional polish, not required: for multi-day events you could show a date-only end, e.g. `Jul 1, 10:00 – Jul 3`, instead of repeating the time.)
- `DayWithEvents` (calendar highlight slot): no structural change — it reads the `YYYY-MM-DD → count` map and will now simply never receive counts for spanned days, which is the desired behavior. Verify the dot appears only on start days.

**No changes** to routing, the feature toggle, `EventCardWide` layout/mockup, filters (search/sectors/hub), or the `HubTabsNavigation` link — those parts of iteration 1 remain valid.

## System Impact Analysis

This section maps the accepted requirements to concrete backend and frontend changes. It is the architect's handoff for implementation; it does not prescribe code, only structure, files, and contracts.

### Backend Impact

**1. New list endpoint for events**
- Add a new read-only view (e.g. `ListEventsView`, `ListAPIView`) in `backend/organization/views/`. It is always available (no toggle).
- Register a route such as `GET /api/events/` in the organization URL config (`backend/organization/urls.py`, included by `backend/climateconnect_main/urls.py`).
- Reuse the existing `ListProjectsView` building blocks rather than duplicating logic:
  - **Exclusion**: `Project.objects.filter(is_draft=False, is_active=True)` (identical to `project_views.py:198`).
  - **Search**: DRF `SearchFilter` on `name` + `translation_project__name_translation` (identical `search_fields`).
  - **Hub scoping**: call `apply_hub_filter(queryset, hub)` from `backend/organization/utility/project.py:26` when `hub` query param is present.
  - **Sectors (topic)**: reuse the existing `sectors` query-param handling (sanitize + filter on `project_sector_mapping__sector`).

**2. Event-type restriction**
- Filter `project_type=ProjectTypesChoices.event` (stored value `"EV"`, see `backend/organization/models/type.py:70`). This is the only project type returned. Because events are required to have `start_date` (see Domain Context), also filter `start_date__isnull=False` so ordering and day-grouping are well-defined; any event missing `start_date` is excluded defensively (the model field is nullable only because it is shared with idea/project types).

**3. Date-range filtering (new behavior)**
- Accept `start_date` and `end_date` query params (ISO datetime).
  - **Default window**: the frontend sends a single selected day and the backend returns that day plus the next 90 days. The frontend computes `start_date` = selected day 00:00 (local) and `end_date` = selected day + 90 days 23:59:59 (local), so day boundaries are correct. The default selected day is today. If the backend receives no dates at all, it falls back to a UTC default window. Picking a different day shifts the window.
  - **Timezone encoding (critical)**: the `start_date`/`end_date` strings are sent **with the browser timezone offset** (e.g. `2026-07-02T00:00:00+02:00` for Berlin, `2026-07-02T00:00:00+09:00` for Tokyo). The backend parses them with `dateutil` which treats an offset-aware string as that exact instant, so the 90-day window is anchored to the **viewer's local day**, not to UTC. Sending a naive string (no offset) would make `dateutil` assume UTC and shift the window by the viewer's UTC offset — the bug that previously caused "clicking a day shows the wrong events". The SSR `getDefaultWindowParams` in both `pages/events.tsx` and `pages/hubs/[hubUrl]/events.tsx` now also emits offset-aware strings (using the server's local offset, which is UTC in production), and the client `useEffect` re-fetches on mount with the real browser offset, so the first paint is corrected immediately.
- **Maximum window span (hard cap)**: because the calendar loads the full window in a single request with no pagination, the backend clamps the effective range to a maximum of **6 months**. If a caller requests a wider span (or the default would exceed it), `end_date` is capped to `start_date + 6 months`. The platform's event volume is low, so 6 months is safe; the default 3-month window sits well within the cap. This prevents unbounded payloads.
- **Window membership (simplified)**: an event is included if its `start_date` falls within the window:
  `start_date >= window_start AND start_date <= window_end`.
  Because the calendar shows each event only on its start date (see Display rule), there is no longer any need for overlap semantics or the "multi-day event starting before the window but still ongoing" corner case. This also simplifies the query and the per-day counts (which now bucket only by `start_date`).

**4. Ordering**
- Order strictly by `start_date` ascending (`order_by("start_date")`). Within-day time ordering (timed vs all-day vs ongoing) is handled in the frontend (see Frontend Impact), so the backend only guarantees chronological day order.

**5. Serializer**
- Reuse `ProjectStubSerializer` (`backend/organization/serializers/project.py:416`) for the POC — it already exposes `id`, `name`, `url_slug`, `image`, `location`, `project_type`, `sectors`, `start_date`, `end_date`, `short_description`, `is_draft`, `registration_config`, `project_parents`, etc. If the payload proves too heavy later, extract a trimmed `EventCalendarSerializer`; not required for the POC.
- **Locale awareness**: the serializer is already locale-aware — `get_name`/`get_short_description` call `get_project_name(obj, get_language())` / `get_project_short_description(obj, get_language())`. The new view must therefore read the request locale (same mechanism `ListProjectsView` uses) so translated `name`/`short_description` are returned, exactly like the existing project API. This is a non-negotiable requirement, not an optional extra.

**6. Feature toggle registration**
- Add a `FeatureToggle` row named `EVENT_CALENDAR_FEATURE` (via a new migration in `backend/feature_toggles/migrations/`, modeled on `0004_add_registration_custom_fields_toggle.py`). Default `development_is_active=True`, `staging_is_active=True`, `production_is_active=False` for the POC. The frontend reads its value from `/api/feature_toggles/?environment=...`; **no backend gating** of the endpoint.

t**7. Per-day counts endpoint (calendar highlight)**
- Add a new read-only view `EventCalendarCountsView` (`APIView`) in `backend/organization/views/project_views.py`, always available (no toggle), registered at `GET /api/events/calendar/`.
- **Purpose**: let the calendar picker highlight which days have events. The frontend requests the counts for the currently visible month (and the active filter selection) and renders a dot under each day that has at least one event. When the user navigates to another month, the frontend re-fetches that month's counts.
- **Required query params**: `year` (integer, e.g. `2026`) and `month` (integer `1`–`12`). Missing/invalid params → `400 Bad Request`.
- **Timezone handling (critical)**: an optional `timezone` param (IANA name, e.g. `Europe/Berlin`) controls which **local day** each event is counted on. The frontend always sends the viewer's browser timezone (`Intl.DateTimeFormat().resolvedOptions().timeZone`) so the highlighted days line up exactly with the events the frontend groups by the browser's local day (see Frontend §4b). The month window itself is built as explicit **UTC** boundaries (matching how `ListEventsView` interprets the frontend's local date strings as UTC), so the returned event set is identical to the list; only the per-day bucketing is done in the requested timezone. If `timezone` is omitted or invalid, the server timezone is used as a fallback (non-fatal).
- **Optional filter params** (mirror `ListEventsView` so the highlight matches the visible list): `search`, `sectors` (comma-separated), `hub`. The same exclusion (`is_draft=False`, `is_active=True`, `project_type=event`, `start_date__isnull=False`) applies, scoped to the requested month by `start_date` (`start_date >= month_start AND start_date <= month_end`). Because counting is start-date-only, the month scoping is a simple `start_date`-in-month filter (no overlap / no `end_date` check).
- **Response**: a JSON list of `{ "date": "YYYY-MM-DD", "count": <int> }` objects, one per day in the month that has at least one event whose `start_date` falls on that day, **sorted by date ascending**. Days with zero events are omitted. An event is counted on **exactly its `start_date` day only** — multi-day events are NOT counted on the days they span (a 3-day event contributes `count=1` to its single start day only). This is the simplified, single-bucket-per-event behavior that replaces the previous multi-day expansion.
- **Implementation note**: because `APIView` does not auto-apply DRF `SearchFilter`, the `search` param is applied manually with `name__icontains` + `translation_project__name_translation__icontains` (matching `ListEventsView.search_fields`). `sectors`/`hub` reuse the same helpers as the list endpoint.
- **Tests**: `backend/organization/tests/test_event_calendar_view.py::TestEventCalendarCountsView` covers 400-on-missing-params, invalid month, exclusion of draft/inactive/non-events, **single-day (start-date-only) counting with NO multi-day expansion**, sorted output, and `search`/`sectors`/`hub` filtering.

**Files touched (backend)**: `organization/views/project_views.py` (new `ListEventsView` + new `EventCalendarCountsView`), `organization/urls.py` (two routes: `events/`, `events/calendar/`), `organization/serializers/project.py` (reuse, no change), `feature_toggles/migrations/0005_add_event_calendar_toggle.py` (new), `organization/tests/test_event_calendar_view.py` (new `TestEventCalendarListView` + `TestEventCalendarCountsView`).

### Frontend Impact

**1. New routes (separate pages, not tabs)**
- `frontend/pages/events.tsx` — global Event Calendar.
- `frontend/pages/hubs/[hubUrl]/events.tsx` — per-hub Event Calendar.
- Mirror the `browse.tsx` SSR pattern: `getServerSideProps` fetches `filterChoices` (`sectors`, `hubs`) and the initial event window from `/api/events/` (server-side fetch for first paint/SEO, like `WasseraktionswochenPage`), plus `getFeatureTogglesFromRequest` so the page can gate itself. The API request must include the current `locale` (same as the project API) so the backend returns translated content.

**2. New page component**
- Add `EventCalendarContent` (or `EventCalendarPage`) that renders, inside `WideLayout`:
  - `HubTabsNavigation` (receives the same props as Browse; the new events link is added inside it — see #4).
a  - A full-width **search bar at the top** (always visible, matching the mockup), then a two-column layout: **left** = a dedicated filter panel with a **Topic multi-select (single-column list of checkboxes)**, a single-day calendar picker (placed above the topics), a "Today" button, and a Reset action (a custom panel is used rather than `FilterSection` to keep the calendar decoupled from the Browse filter context); **right** = the event list grouped by day. On mobile, the topic/date filters collapse into a hamburger/drawer while the text search bar remains always visible for quick search.
  - The component computes the window as the selected day + 90 days in the user's/local timezone and sends `start_date`/`end_date` to `/api/events/`; it refetches whenever filters or the selected day change (reuse `apiRequest` / the existing data layer). No pagination (full-window load per decision). Day-grouping is also performed in this timezone so boundaries match the requested window.

**3. New wide card component**
- Add `EventCardWide` (horizontal layout matching the mockup: image on the left, content on the right with title, datetime range, location, and a status badge such as "Free" / registration state — no short description required for the POC). Extract shared pieces already in `ProjectPreview` (`EventDateIndicator`, image, title, `ProjectMetaData`) into small shared subcomponents if it reduces duplication without complicating `ProjectPreview`. The existing vertical `ProjectPreview` is **not** modified.

**4. Navigation link (hub-aware, toggle-gated)**
- In `HubTabsNavigation.tsx`, add a `Link` (similar to the existing `climateMatchLink` / `HubLinks` pattern) rendered only when `isEnabled("EVENT_CALENDAR_FEATURE")` is true.
- URL is hub-aware: `/hubs/${hubUrl}/events` when `hubUrl` is present, otherwise `/events`. This keeps the three Browse tabs unchanged.

**4b. Calendar day highlight (per-day counts)**
- The single-day `DateCalendar` picker (above the topics) highlights days that have events. `EventCalendarContent` keeps a `viewMonth` state (the month currently shown in the picker) and fetches `GET /api/events/calendar/?year=&month=&timezone=<browser tz>&search=&sectors=&hub=` whenever `viewMonth`, `search`, `sectors`, or `hubUrl` change. The `timezone` is the browser's IANA zone (`Intl.DateTimeFormat().resolvedOptions().timeZone`) so the returned per-day counts are bucketed in the same local day the event list is grouped by. The response is stored as a `YYYY-MM-DD → count` map.
- A custom `day` slot (`DayWithEvents`) renders the default `PickersDay` plus a small dot (`classes.eventDot`) under any day whose key is present in the map with `count > 0`. Days outside the current month are never dotted. Because counts are now start-date-only, a multi-day event produces a dot on its start day only (matching the list display exactly).
- `onMonthChange` updates `viewMonth` so navigating to another month fetches that month's counts; selecting a day in a different month also updates `viewMonth`. The fetch is debounced (400 ms when typing in search) and failures are non-fatal (the map is cleared, so no dots show).

**5. Per-day grouping & ordering (reuse existing logic — simplified)**
- Reuse `compareByStartDate` / `getDisplaySortTimestamp` from `WasseraktionswochenEvents.tsx` for within-day ordering (timed → all-day). Extract these helpers into a small shared util (e.g. `frontend/src/utils/eventSorting.ts`) so both the calendar and Wasseraktionswochen use one source — avoids coupling the calendar to that component.
- Group events by their `start_date` day in the UI layer. **Each event appears exactly once, on its `start_date` day — multi-day events are NOT expanded onto the days they span** (this is the key simplification from iteration 1). Render a day header, then the wide cards for that day ordered by `start_time` ascending (the "ongoing multi-day bumped to end of day" branch of `getDisplaySortTimestamp` is no longer needed and can be dropped from the shared util for the calendar's use). The `end_date` is shown only as informational text on the card (e.g. "Jul 1 – Jul 3").

**6. Feature-toggle gating**
- Page-level: if `!isEnabled("EVENT_CALENDAR_FEATURE")`, the page returns a 404 / redirect (so the route is inert when off).
- Link-level: hidden in `HubTabsNavigation` when off (see #4).
- Toggle value comes from `FeatureToggleProvider` / `useFeatureToggles` (`isEnabled(name, fallback)`), already wired via `_app.tsx`.

**Files touched (frontend)**: `pages/events.tsx` (new), `pages/hubs/[hubUrl]/events.tsx` (new), `src/components/eventCalendar/EventCalendarContent.tsx` (new), `src/components/eventCalendar/EventCardWide.tsx` (new), `src/utils/eventSorting.ts` (new, extracted), `src/components/hub/HubTabsNavigation.tsx` (add link), `src/components/hub/WasseraktionswochenEvents.tsx` (helpers extracted out, behavior unchanged).

### Cross-Cutting / Integrations
- **No changes** to `ListProjectsView`, `BrowseContent`, `ProjectPreview`, or the existing Browse/Projects APIs — the calendar is additive.
- Feature-toggle value is already served by the backend `feature_toggles` app and consumed frontend-wide; only a new row is added.
- Date inputs in the filter should align with the backend's ISO datetime expectation; consider a shared date-format helper.

### Risks & Notes
- **Timezone for "grouped by day"**: resolved — the frontend owns the window boundaries and day-grouping in the user's/local timezone and sends `start_date`/`end_date` explicitly **with the browser timezone offset** (e.g. `2026-07-02T00:00:00+02:00`); the backend parses them as that exact instant, so the 90-day window is anchored to the viewer's local day. The per-day counts endpoint additionally receives an explicit `timezone` IANA param and buckets in that zone, so highlighted days match the grouped list. No server-side timezone assumption is needed for the list window; the counts window is built in the requested zone then converted to UTC for the DB query.
- **Analytics/metrics — deferred**: the POC is staging-only (feature toggle enabled for stakeholder review, not live), so usage analytics events (impressions, filter applied, card clicks) are out of scope for the first iteration. Stakeholder feedback is the insight mechanism. Revisit if/when the feature goes live.
- **Payload size**: full-window load is bounded by the 6-month hard cap on the requested range (default 3 months); safe given low event volume. Pagination was explicitly deferred — if volume ever grows, add window-based "load more" rather than classic pagination.
- **Start-date windowing**: events are shown only on their `start_date`, so an event whose `start_date` falls inside the requested window is returned and rendered on that single day. There is no longer an overlap / multi-day-boundary edge case (that complexity was removed); the relevant test is now "a multi-day event is counted/rendered only on its start day, not on its spanned days."
- **Toggle rollout**: keep `production_is_active=False` until the POC is validated; enable per environment via the `FeatureToggle` admin/row.

# Event Calendar Page (Proof of Concept)

## Problem Statement

On Climate Connect, projects exist in three types: **ideas**, **projects**, and **events**. Today all three are shown together on the Browse page, ordered by a ranking score. This is poor for events: because ranking is not time-based, events can appear out of chronological order, and past events can even rank above upcoming ones. Users have repeatedly asked for a better way to discover and browse events.

We will build a new **Event Calendar** page that lists events in true chronological order, grouped by day, with focused filters (text search, topic, date range) and support for global and per-hub scopes. The page is a standalone route (not a 4th Browse tab), discoverable via a link in the existing tab navigation. It is a **proof of concept** — the goal is to ship a working end-to-end experience to gather first user insights, then iterate.

The feature is gated by a frontend feature toggle `EVENT_CALENDAR_FEATURE`. The backend can ship new API endpoints without toggles.

## Acceptance Criteria

- [ ] A new Event Calendar page exists at a dedicated route (global + per-hub), implemented as a **separate page, not a 4th Browse tab**
- [ ] A link to the Event Calendar is present in the tab navigation (`HubTabsNavigation`) and routes to the new page
- [ ] The page lists **only event-type projects** (`project_type = event`)
- [ ] Events are ordered **chronologically by start date and time**
- [ ] The UI groups events **by day**; within a day, events are ordered **by time**
- [ ] Filters are available and functional:
  - [ ] **Text search** (matches event name / translated name)
  - [ ] **Topic** filter (maps to the existing `sectors` filter)
  - [ ] **Start date** and **End date** filters
- [ ] The page supports **hub scoping**: when viewed in a hub context it shows only that hub's events, identical to Browse behavior
- [ ] Non-public projects are **excluded** exactly as on Browse (`is_draft = false` AND `is_active = true`)
- [ ] A **new wide event card component** is created for the calendar (the existing vertical `ProjectPreview` must not be overloaded)
- [ ] The filter section is rendered on the **left side** of the page on desktop
- [ ] The layout is **responsive**: on mobile the topic/date filters collapse into a menu (hamburger), while the **text search bar stays always visible** for quick search — mirroring the Browse page behavior
- [ ] The entire feature (link + page) is hidden unless `EVENT_CALENDAR_FEATURE` is enabled (frontend only)
- [ ] New backend API endpoint(s) return event data with the required filters, hub scoping, and chronological ordering
- [ ] Default view shows a **rolling window** of the current month plus the next 2 months; the start/end date filters shift the visible window forward/back
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

- **Project types**: A `Project` can be an idea, project, or event. Events carry `start_date` / `end_date` and an all-day convention where all-day events store a `00:00` start time. **Requirement**: events always have both `start_date` and `end_date` set. The model fields are nullable only because they are shared with idea/project types (which may omit them); the calendar relies on the event guarantee.
- **Browse page**: Currently has three tabs — Browser (projects), Organisations, Members. The code already contains `TODO` markers and a stubbed `events` branch indicating prior intent to add events here; this task deliberately takes the separate-page route instead.
- **Feature toggle system**: Toggles are defined in the backend `FeatureToggle` model and served via `/api/feature_toggles/?environment=...`. The frontend consumes them through `FeatureToggleProvider` and the `isEnabled(name, fallback)` helper (`FeatureToggles` is a `Record<string, boolean>`). The toggle *value* is therefore sourced from the backend, but **gating** happens only in the frontend.
- **Per-day ordering reference**: `WasseraktionswochenEvents.tsx` already implements `compareByStartDate` / `getDisplaySortTimestamp`, which correctly handles three event classes within a day — timed events, all-day events (midnight start, bumped after timed), and ongoing multi-day events (bumped to end of day). This logic should be reused/adapted.
- **Existing card**: `ProjectPreview` is a vertical card (image, name, metadata). The calendar needs a **wide** (horizontal) variant, which does not exist yet.
- **Route collision note**: `/calendar/[projectId].ics` already exists for iCal subscriptions. The new page should use a distinct route (proposed: `/events` globally and `/hubs/[hubUrl]/events` per hub) to mirror the Browse structure and avoid confusion.
- **Ranking vs time**: Browse orders by rank; the calendar must order strictly by `start_date`/`start_time` ascending.

## AI Insights

### Implementation Hints
- **Backend data**: A new endpoint should filter to event-type projects, apply the same `is_draft=False, is_active=True` exclusion as `ListProjectsView`, support `search`, `hub`, `sectors`, and a `start_date`/`end_date` range, and order by `start_date` ascending. The existing `ListProjectsView` (`backend/organization/views/project_views.py`) is the reference for search fields, hub filtering, and exclusion — reuse its behavior.
- **Default window**: When no date filters are supplied, default the window to the current month through two months ahead (≈3 months). Date filters override the window.
- **Per-day grouping/ordering**: Reuse/adapt the `compareByStartDate` + `getDisplaySortTimestamp` helpers from `WasseraktionswochenEvents.tsx` for within-day time ordering; group by calendar day in the UI layer.
- **Toggle registration**: `EVENT_CALENDAR_FEATURE` must be registered as a `FeatureToggle` row (so the frontend can read its value per environment). Gating (showing/hiding link + page) is frontend-only via `isEnabled("EVENT_CALENDAR_FEATURE")`.
- **Wide card**: Create a new `EventCardWide` component. Extract shared pieces (image, title, metadata, date indicator) from `ProjectPreview` into small shared subcomponents if it reduces duplication without complicating `ProjectPreview`.
- **Navigation link**: Add the link inside `HubTabsNavigation` (e.g., in the right-side/link area), not as a `Tab` element, so the three Browse tabs remain unchanged.
- **Route proposal**: `/events` (global) and `/hubs/[hubUrl]/events` (per hub), mirroring how Browse is structured. Confirm during review.
- **Topic mapping**: "Topic" in the request maps to the existing `sectors` multiselect filter used on the projects Browse tab.

### Trade-off Notes
- **Rolling window vs. all-events**: Chose a rolling window (current month + 2 months) for performance and focused UX; date filters let users reach past/future. Alternative (show all chronologically) was rejected for POC simplicity and payload size.
- **Separate page vs. 4th tab**: A separate page keeps the Browse tabs intact, gives the calendar its own URL/filters/state, and avoids the tab-state complexity the Browse refactor aimed to remove. Discoverability is preserved via a nav link.
- **New card component vs. extending `ProjectPreview`**: A new component avoids over-complicating the existing widely-used card. Some visual duplication is acceptable and explicitly desired over entanglement.
- **New backend endpoint vs. extending `ListProjectsView`**: A dedicated endpoint keeps Browse logic clean and lets the calendar own event-specific ordering and date-range filtering. The system architect should finalize the exact endpoint shape (see System Impact Analysis).
- **Frontend-only toggle**: Simpler and sufficient for a POC; backend endpoints stay always-on. The toggle value still originates from the backend `feature_toggles` service.

### Decisions (resolved in review)
- **Route**: `/events` (global) and `/hubs/[hubUrl]/events` (per hub), mirroring the Browse structure and avoiding collision with the iCal route `/calendar/[projectId].ics`.
- **Pagination**: Simple full-window load — the default window is fetched in a single request with no pagination (appropriate for a POC given the bounded 3-month window and modest event volumes). Pagination can be added later if volumes grow.
- **Per-hub nav**: The nav link is hub-aware — on a hub page it points to `/hubs/[hubUrl]/events`, on global Browse to `/events` — using the same `HubTabsNavigation` link, URL derived from the current hub context.
- **Time window**: Rolling window (current month + next 2 months) by default; date filters shift the window in either direction (past or future).

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
- **Default window**: the frontend computes the default rolling window (first day of current month → last day of current month + 2 months) in the user's/local timezone and sends `start_date`/`end_date` explicitly, so day boundaries are correct. If the backend receives no dates at all, it falls back to a UTC default window. Date filters override and may shift the window in either direction.
- **Maximum window span (hard cap)**: because the calendar loads the full window in a single request with no pagination, the backend clamps the effective range to a maximum of **6 months**. If a caller requests a wider span (or the default would exceed it), `end_date` is capped to `start_date + 6 months`. The platform's event volume is low, so 6 months is safe; the default 3-month window sits well within the cap. This prevents unbounded payloads.
- **Overlap semantics**: an event is included if its interval overlaps the window:
  `start_date <= window_end AND (end_date IS NULL OR end_date >= window_start)`.
  This correctly keeps multi-day and ongoing events visible across the window, and explicitly covers the corner case where a multi-day event's `start_date` is **before** `window_start` but it is still ongoing (`end_date >= window_start`) — it must still be returned so the frontend can show it on the days it spans inside the window.

**4. Ordering**
- Order strictly by `start_date` ascending (`order_by("start_date")`). Within-day time ordering (timed vs all-day vs ongoing) is handled in the frontend (see Frontend Impact), so the backend only guarantees chronological day order.

**5. Serializer**
- Reuse `ProjectStubSerializer` (`backend/organization/serializers/project.py:416`) for the POC — it already exposes `id`, `name`, `url_slug`, `image`, `location`, `project_type`, `sectors`, `start_date`, `end_date`, `short_description`, `is_draft`, `registration_config`, `project_parents`, etc. If the payload proves too heavy later, extract a trimmed `EventCalendarSerializer`; not required for the POC.
- **Locale awareness**: the serializer is already locale-aware — `get_name`/`get_short_description` call `get_project_name(obj, get_language())` / `get_project_short_description(obj, get_language())`. The new view must therefore read the request locale (same mechanism `ListProjectsView` uses) so translated `name`/`short_description` are returned, exactly like the existing project API. This is a non-negotiable requirement, not an optional extra.

**6. Feature toggle registration**
- Add a `FeatureToggle` row named `EVENT_CALENDAR_FEATURE` (via a new migration in `backend/feature_toggles/migrations/`, modeled on `0004_add_registration_custom_fields_toggle.py`). Default `development_is_active=True`, `staging_is_active=True`, `production_is_active=False` for the POC. The frontend reads its value from `/api/feature_toggles/?environment=...`; **no backend gating** of the endpoint.

**Files touched (backend)**: `organization/views/project_views.py` (new view), `organization/urls.py` (route), `organization/serializers/project.py` (reuse, no change), `feature_toggles/migrations/0005_add_event_calendar_toggle.py` (new).

### Frontend Impact

**1. New routes (separate pages, not tabs)**
- `frontend/pages/events.tsx` — global Event Calendar.
- `frontend/pages/hubs/[hubUrl]/events.tsx` — per-hub Event Calendar.
- Mirror the `browse.tsx` SSR pattern: `getServerSideProps` fetches `filterChoices` (`sectors`, `hubs`) and the initial event window from `/api/events/` (server-side fetch for first paint/SEO, like `WasseraktionswochenPage`), plus `getFeatureTogglesFromRequest` so the page can gate itself. The API request must include the current `locale` (same as the project API) so the backend returns translated content.

**2. New page component**
- Add `EventCalendarContent` (or `EventCalendarPage`) that renders, inside `WideLayout`:
  - `HubTabsNavigation` (receives the same props as Browse; the new events link is added inside it — see #4).
  - A two-column layout: **left** = `FilterSection` (reuse existing component) configured with text search, `sectors` (topic), and two date inputs (start/end); **right** = the event list grouped by day. On mobile, the topic/date filters collapse into a hamburger/drawer (reuse the Browse page's `MobileBottomMenu` / `filtersExandedOnMobile` pattern) while the text search bar remains always visible for quick search.
- The component computes the default 3-month window in the user's/local timezone and sends `start_date`/`end_date` to `/api/events/`; it refetches whenever filters or the date window change (reuse `apiRequest` / the existing data layer). No pagination (full-window load per decision). Day-grouping is also performed in this timezone so boundaries match the requested window.

**3. New wide card component**
- Add `EventCardWide` (horizontal layout: image left, content right with title, date, location, short description, registration state). Extract shared pieces already in `ProjectPreview` (`EventDateIndicator`, image, title, `ProjectMetaData`) into small shared subcomponents if it reduces duplication without complicating `ProjectPreview`. The existing vertical `ProjectPreview` is **not** modified.

**4. Navigation link (hub-aware, toggle-gated)**
- In `HubTabsNavigation.tsx`, add a `Link` (similar to the existing `climateMatchLink` / `HubLinks` pattern) rendered only when `isEnabled("EVENT_CALENDAR_FEATURE")` is true.
- URL is hub-aware: `/hubs/${hubUrl}/events` when `hubUrl` is present, otherwise `/events`. This keeps the three Browse tabs unchanged.

**5. Per-day grouping & ordering (reuse existing logic)**
- Reuse `compareByStartDate` / `getDisplaySortTimestamp` from `WasseraktionswochenEvents.tsx` for within-day ordering (timed → all-day → ongoing). Extract these helpers into a small shared util (e.g. `frontend/src/utils/eventSorting.ts`) so both the calendar and Wasseraktionswochen use one source — avoids coupling the calendar to that component.
- Group events by calendar day in the UI layer. **Multi-day events are expanded to appear on every day they span** (matching the Wasseraktionswochen behavior): on their first day they are ordered by start time; on each subsequent day they are placed at the end of the day so they don't dominate that day's other events. Reuse the existing `getDisplaySortTimestamp` logic for this. Render a day header then the wide cards for that day, ordered by time.

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
- **Timezone for "grouped by day"**: resolved — the frontend owns the window boundaries and day-grouping in the user's/local timezone and sends `start_date`/`end_date` explicitly; the backend treats them as authoritative (still applying the 6-month cap). No server-side timezone assumption needed.
- **Analytics/metrics — deferred**: the POC is staging-only (feature toggle enabled for stakeholder review, not live), so usage analytics events (impressions, filter applied, card clicks) are out of scope for the first iteration. Stakeholder feedback is the insight mechanism. Revisit if/when the feature goes live.
- **Payload size**: full-window load is bounded by the 6-month hard cap on the requested range (default 3 months); safe given low event volume. Pagination was explicitly deferred — if volume ever grows, add window-based "load more" rather than classic pagination.
- **Overlap edge cases**: multi-day events spanning the window boundary must remain visible — the overlap filter above handles this; add a test.
- **Toggle rollout**: keep `production_is_active=False` until the POC is validated; enable per environment via the `FeatureToggle` admin/row.

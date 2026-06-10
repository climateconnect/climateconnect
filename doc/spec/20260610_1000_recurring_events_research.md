# Recurring Events Research

**Date**: 2026-06-10
**Status**: RESEARCH / ANALYZED — Phased approach defined, awaiting Phase 1 approval

---

## Problem Statement

Events in Climate Connect are stored as Projects with a project_type of `EV`. If we want to support recurring events (e.g., "Weekly climate meetup every Tuesday"), we need to understand how calendar systems handle this pattern — and critically, how to make recurring events work in our **project listing/browse pages** where projects are queried from the database.

---

## How Google Calendar Handles Recurring Events

### Storage Model: Single Master + RRULE

Google Calendar does **NOT** store each occurrence as a separate row. It uses the **iCalendar RFC 5545 recurrence rule (RRULE)** pattern:

```
Event (single row):
├── id
├── title
├── start_time          (anchor date/time of the FIRST occurrence)
├── end_time
├── timezone
├── recurrence_rule     ← "RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=10"
├── recurrence_exception_dates  ← array of excluded dates
└── ...
```

**Key insight**: One row defines infinite occurrences. The `RRULE` string encodes the entire repetition pattern.

### RRULE Syntax (RFC 5545)

| Field | Purpose | Examples |
|-------|---------|----------|
| `FREQ` | Repeat unit | `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY` |
| `INTERVAL` | Every N units | `INTERVAL=2` = every other week |
| `BYDAY` | Which days | `MO,WE,FR` or `-1SU` (last Sunday) |
| `BYMONTH` | Which months | `1,6,7` |
| `BYMONTHDAY` | Which day of month | `15` or `-1` (last day) |
| `COUNT` | Max occurrences | `COUNT=10` |
| `UNTIL` | End date | `UNTIL=20261231T235959Z` |

Examples:
```
"Every weekday"       → RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR
"Monthly on 15th"     → RRULE:FREQ=MONTHLY;BYMONTHDAY=15
"Every 2 weeks"       → RRULE:FREQ=WEEKLY;INTERVAL=2
"Last Friday of month" → RRULE:FREQ=MONTHLY;BYDAY=-1FR
```

### Handling Exceptions: Modified & Deleted Occurrences

Exceptions (modifications/deletions to individual occurrences) are stored as **separate rows**, NOT every occurrence.

| Scenario | Rows Created |
|----------|-------------|
| "Weekly forever" | **1 row** (master with RRULE) |
| User skips July 4th | **1 row** + exdate added to master's array |
| User moves Oct 19 to 3pm | **2 rows** (master + 1 override with `recurrence_id`) |
| User edits "this and all future" from Nov | **2 rows** (original truncated with UNTIL, new master starting Nov) |
| User edits "all events" title | **1 row** (just update master) |

### Display: Lazy Expansion (The Key Pattern)

Occurrences are **never stored**. They are **computed on-the-fly** from the RRULE:

```
User opens Calendar → October 2026
    ↓
Client sends: GET /events?from=2026-10-01&to=2026-10-31
    ↓
Server fetches master events where rrule IS NOT NULL
    ↓
For EACH master event:
    Run RRULE expansion → generate dates within [Oct 1, Oct 31]
    Remove any dates matching exdates[]
    Replace any dates matching an override row's recurrence_id
    ↓
Return flat list of virtual occurrences
```

### Why This Works for Calendars

- "Every day forever" = **1 row** in the database
- The RRULE expansion is a **pure mathematical computation** — no storage needed
- `python-dateutil` (Python) / `rrule.js` (JS) handle the date math

---

## The Climate Connect Challenge: Recurring Events in Project Listings

### Why Google Calendar's Model Doesn't Directly Apply

Google Calendar is a **calendar view** — it shows events for a visible time range. Climate Connect has **project listing/browse pages** that query the `Project` table. This creates a fundamental tension:

1. **Google Calendar approach (single row + RRULE)**: One project row, but the listing page needs to show the "next occurrence" date — this requires RRULE expansion in every list query.
2. **Materialized approach (one row per occurrence)**: Each occurrence is a real `Project` row — listing just works with normal queries, but data grows unboundedly for infinite recurrences.

### Options for Climate Connect

#### Option A: Single Master Row + "Next Occurrence" Field (Recommended)

```
Project (existing table):
├── ... (existing fields)
├── is_recurring          BooleanField (default=False)
├── recurrence_rule       CharField (nullable, RRULE string)
├── next_occurrence_date  DateTimeField (nullable, indexed)
```

- The `next_occurrence_date` is a **materialized/cached field** updated by a periodic Celery task
- The task runs RRULE expansion to find the next upcoming occurrence and writes it to this field
- Browse/list queries simply filter/sort by `next_occurrence_date` — no RRULE expansion at query time
- The event **detail page** shows the full recurrence pattern and all upcoming occurrences (computed on the fly via RRULE expansion)
- When a user "registers" for a recurring event, they register for the **next occurrence** (or a specific one)

**Pros**: Simple queries, no data explosion, one project = one listing entry
**Cons**: Celery task dependency, slight delay in `next_occurrence_date` updates

#### Option B: Materialized Occurrence Rows

- A background task pre-creates individual `Project` rows for each occurrence (e.g., rolling 3-month window)
- Each occurrence is a "child" linking back to a "parent" recurring project
- Listing queries work normally — each occurrence is a real row
- Old occurrences get cleaned up, new ones get generated

**Pros**: Standard queries, each occurrence can have its own registrations/modifications
**Cons**: Data duplication, sync complexity, how to handle "edit all" vs "edit one"

#### Option C: Hybrid — Master Row + Virtual Expansion at Query Time

- Single master row with RRULE
- At query time, expand RRULE for the visible window and inject virtual rows into results
- No materialized field, no background tasks

**Pros**: Always accurate, no background jobs
**Cons**: Complex query logic, can't do standard `ORDER BY` / `OFFSET` pagination easily, performance risk with many recurring events

---

## The Complexity of Individual Occurrence Modifications

The research doc's Google Calendar model shows that individual occurrence modifications (cancelling one date, changing time/location for one instance) require **override rows** linked to the master via `recurrence_id`. This is where the real implementation complexity lives.

### Three Operations Organizers Need

| Operation | What Happens | Example | Complexity |
|-----------|-------------|---------|------------|
| **Edit all** | Update master row fields | Change event title/description | **Low** — just save |
| **Cancel one occurrence** | Mark a specific date as cancelled | Skip July 4th meetup | **Medium** — need exception storage + Celery awareness |
| **Modify one occurrence** | Override time/location for one date | Move Oct 19 to different venue | **High** — need override row + `recurrence_id` + listing exclusion + registration conflict resolution |

### Where Complexity Manifests

**Data model**: Override rows need a `recurrence_id` (DateTimeField — which occurrence date they replace), plus the ability to flag `is_cancelled`. These rows must NOT appear as separate listings — only the master is listed.

**Celery task**: Computing `next_occurrence_date` becomes significantly harder:
1. Expand RRULE to get candidate dates
2. Skip dates matching cancelled occurrences (exception_dates array on master)
3. For dates with an override row, use the override's `start_date` instead of the RRULE-computed date
4. Handle the case where all remaining occurrences are cancelled or exhausted

**Listing page**: Must guarantee override rows never leak into browse results as separate entries. The listing query filters on `is_draft=False, is_active=True` — override rows would need an additional flag like `is_recurrence_override=True` to exclude them.

**Detail page**: The "upcoming occurrences" list must show:
- Normal occurrences from RRULE expansion
- CANCELLED badges on exception dates
- Modified details on override dates (different time/location)

**Registration**: If a user registered for an occurrence that gets cancelled or modified, the system needs notification and handling. Currently `EventRegistration` has no occurrence-level tracking (`unique_together = [("user", "registration_config")]`).

**Existing infrastructure note**: The `parent_project` FK and `has_children` field already exist on Project, but they represent a **different concept** (festival → sub-events, as used by Wasseraktionswochen). Conflating this with recurrence overrides would create confusion. A separate `recurrence_master` FK is needed if override rows are implemented.

### Phased Implementation Strategy

To manage this complexity, the work should be split into three phases:

#### Phase 1: Master Row + RRULE + Next Occurrence (Foundation)

**Scope**: Basic recurring event support. No individual occurrence modifications.

**Model changes** (`backend/organization/models/project.py`):
```python
is_recurring = models.BooleanField(default=False)
recurrence_rule = models.CharField(max_length=500, blank=True, null=True)
# RFC 5545 RRULE string, e.g. "RRULE:FREQ=WEEKLY;BYDAY=TU;COUNT=52"
next_occurrence_date = models.DateTimeField(blank=True, null=True, db_index=True)
# Cached — updated by Celery task. Used for sorting/ranking.
```

**Celery task** (`backend/organization/tasks/recurrence.py`):
- Runs periodically (e.g. every hour via `django-celery-beat`)
- For each `Project` where `is_recurring=True`:
  - Expand RRULE with `python-dateutil.rrule.rrulestr(recurrence_rule, dtstart=start_date)`
  - Find the next occurrence after `now()`
  - Write to `next_occurrence_date`
  - If no more occurrences (UNTIL/COUNT exhausted): set `is_recurring=False`, clear `next_occurrence_date`

**Ranking** (`backend/organization/utility/project_ranking.py`):
- Use `next_occurrence_date` (if set) instead of `start_date` for recurring events
- Recurring events with a future `next_occurrence_date` never score `-99`

**API** (`backend/organization/views/project_views.py`):
- Add `project_type` filter
- Add `sort_by=upcoming` using `Coalesce("next_occurrence_date", "start_date")`

**Serializer** (`backend/organization/serializers/project.py`):
- Add `is_recurring`, `next_occurrence_date` to `ProjectStubSerializer`

**Frontend**:
- Update `EventDateIndicator` to show "Repeats weekly · Next: Jun 16"
- Implement events tab in `BrowseContent` (resolve existing TODO)

**Editing**: Only "edit all" — update the master row. No single-occurrence editing.

**Limitation**: If an organizer needs to cancel or modify a single occurrence, they have no way to do it. They'd have to cancel the entire series and create a new one starting from the next occurrence. This is acceptable for MVP.

#### Phase 2: Cancel Individual Occurrences

**Scope**: Allow organizers to skip/cancel specific dates in a recurring series.

**Additional model fields**:
```python
exception_dates = ArrayField(
    models.DateTimeField(), default=list, blank=True
)
# Dates where this recurring event is cancelled.
# Used by Celery task when computing next_occurrence_date.
```

**Celery task changes**:
- When expanding RRULE, filter out dates present in `exception_dates`
- `next_occurrence_date` = first RRULE date NOT in `exception_dates` and after `now()`

**API changes**:
- New endpoint or action on project detail: `POST /api/projects/{id}/cancel_occurrence/`
  - Body: `{ "date": "2026-07-04T18:00:00Z" }`
  - Adds date to `exception_dates` array
  - Triggers immediate `next_occurrence_date` recalculation

**Frontend changes**:
- Detail page: "Upcoming occurrences" list shows cancelled dates with a strikethrough/badge
- Organizer UI: "Cancel this occurrence" button on each upcoming date

**Registration impact**: If users registered for a cancelled occurrence, they need notification. This requires checking `EventRegistration` records against the cancelled date and sending a notification (email or in-app).

#### Phase 3: Modify Individual Occurrences

**Scope**: Allow organizers to change time, location, or other details for a single occurrence.

**Additional model fields**:
```python
recurrence_id = models.DateTimeField(blank=True, null=True, db_index=True)
# On override rows only. The original occurrence date this row replaces.
recurrence_master = models.ForeignKey(
    "self", on_delete=models.CASCADE, null=True, blank=True,
    related_name="recurrence_overrides",
    help_text="Points to the master recurring event. Only set on override rows."
)
is_recurrence_override = models.BooleanField(default=False)
# True for rows created to override a single occurrence.
# Used to exclude override rows from browse listings.
```

**Why a separate FK from `parent_project`**: The existing `parent_project` represents "festival → sub-events" (Wasseraktionswochen pattern). Recurrence overrides are a different relationship — they replace a specific date in a series, not a child event in a collection. Conflating them would create data integrity issues and confusing semantics.

**Listing query change**:
```python
queryset = queryset.filter(is_recurrence_override=False)
# Or: exclude rows where recurrence_master is not None
```

**Celery task changes**:
- When computing `next_occurrence_date`:
  1. Expand RRULE → candidate dates
  2. Skip dates in `exception_dates` (cancelled)
  3. For dates with an override row (`recurrence_master=self, recurrence_id=date`):
     - Use the override's `start_date` instead of the RRULE-computed date
     - Use the override's other fields (location, title, etc.) for display
  4. First valid date → `next_occurrence_date`

**Detail page changes**:
- "Upcoming occurrences" list becomes a hybrid display:
  - Normal dates from RRULE
  - Cancelled dates with strikethrough
  - Modified dates with override details and a "modified" badge
- Each occurrence gets an organizer action menu: "Edit this occurrence" / "Cancel this occurrence"

**Registration impact**:
- If a user registered for the original time and it changes, notify them
- Consider: does registration transfer to the override, or is it cancelled?
- Recommendation: registration transfers automatically (same occurrence, different details)

**Editing UI**:
- When organizer clicks "Edit" on a recurring event, show a dialog:
  - "Edit all occurrences" → update master row (Phase 1 behavior)
  - "Edit this occurrence only" → create/update override row
- No "edit this and future" in v3 (that requires splitting the RRULE, which is significantly more complex)

---

## Climate Connect Codebase Impact Analysis

### Current Architecture (as of 2026-06-10)

Events (`project_type="EV"`) are stored in the same `Project` table as ideas (`ID`) and projects (`PR`). There is **no recurrence support** — dates are single-instance `DateTimeField` values.

#### Relevant Existing Code

| Component | File | Notes |
|-----------|------|-------|
| **Project model** | `backend/organization/models/project.py` | `start_date`, `end_date` (both nullable `DateTimeField`). Has `parent_project` FK and `has_children` boolean already. |
| **Project types** | `backend/organization/models/type.py` | `ProjectTypesChoices` enum: `ID`, `EV`, `PR` |
| **Event registration** | `backend/organization/models/event_registration.py` | `EventRegistrationConfig` OneToOne on Project with `max_participants`, `registration_end_date`, `status` (open/closed/full/ended) |
| **Listing view** | `backend/organization/views/project_views.py` (line 157) | `ListProjectsView` — filters by `is_draft=False, is_active=True`, paginates 12/page, sorts by ranking score |
| **Project ranking** | `backend/organization/utility/project_ranking.py` (line 168–207) | **Event-specific logic**: past events score `-99` (sink to bottom), future events get 14-day proximity boost |
| **Listing serializer** | `backend/organization/serializers/project.py` (line 407) | `ProjectStubSerializer` exposes `start_date`, `end_date`, `project_type` |
| **Browse page** | `frontend/pages/browse.tsx` | Global browse page |
| **BrowseContent** | `frontend/src/components/browse/BrowseContent.tsx` (line 148) | **Has TODO**: `"TODO: add 'events' here, after implementing event calendar"` — events tab is planned but not built |
| **EventDateIndicator** | `frontend/src/components/project/EventDateIndicator.tsx` | Shows start/end date badge on event cards |
| **Filters** | `frontend/public/data/possibleFilters.ts` | No `project_type` filter exists in the UI. No date-based sort option. |

#### Current Listing API Filters

`GET /api/projects/` supports: `sectors`, `hub`, `collaboration`, `category`, `status`, `organization_type`, `parent_project`, `parent_project_slug`, `has_children`, location (`osm_id`/`osm_type`/`place_id`), `country`, `city`.

**Missing**: No `project_type` filter, no date-range filter, no `sort_by=upcoming` option.

### Why Option A Fits Best

| Criterion | Option A | Option B | Option C |
|-----------|----------|----------|----------|
| Works with `ListProjectsView` pagination | **Yes** — `next_occurrence_date` is a real DB column, standard `ORDER BY`/`OFFSET` | **Yes** — each occurrence is a real row | **No** — virtual rows break `OFFSET/LIMIT` |
| Compatible with `ProjectRanking` | **Yes** — use `next_occurrence_date` instead of `start_date` in ranking formula | **Yes** — each row has its own dates | **No** — virtual rows can't be scored in the DB |
| Works with existing `parent_project` FK | Not needed — single row | Uses it (child → parent) | Not needed |
| Data growth for "weekly forever" | **1 row** | ~52 rows/year (rolling window) | **1 row** |
| Registration system impact | Minimal — register for next occurrence | Each occurrence needs its own registrations | Virtual rows can't hold registrations |
| Frontend `EventDateIndicator` change | Show "Repeats weekly · Next: Jun 16" | Each card shows its own date | Complex — need to render virtual dates |

### Proposed Implementation

See the phased approach above. Phase 1 changes are detailed below. Phases 2 and 3 build incrementally on Phase 1.

#### Phase 1 Changes (Concrete)

##### 1. Model Changes (`backend/organization/models/project.py`)

Add to `Project`:

```python
is_recurring = models.BooleanField(default=False)
recurrence_rule = models.CharField(max_length=500, blank=True, null=True)
# RFC 5545 RRULE string, e.g. "RRULE:FREQ=WEEKLY;BYDAY=TU;COUNT=52"
next_occurrence_date = models.DateTimeField(blank=True, null=True, db_index=True)
# Cached — updated by Celery task. Used for sorting/ranking.
```

Migration: Add columns (non-destructive, all nullable/defaulted).

##### 2. Celery Task (new file: `backend/organization/tasks/recurrence.py`)

Periodic task (e.g. every hour via `django-celery-beat`):

- Query: `Project.objects.filter(is_recurring=True, recurrence_rule__isnull=False)`
- For each project: run `python-dateutil.rrule.rrulestr(recurrence_rule, dtstart=start_date)` to compute the next occurrence after `now()`
- Write result to `next_occurrence_date`
- Handle `UNTIL`/`COUNT` exhaustion: set `is_recurring=False` if no more occurrences

##### 3. Ranking Change (`backend/organization/utility/project_ranking.py`)

Current logic (lines 168–207):
```python
if project.end_date and project.end_date < now:
    return -99  # past event, sink to bottom
```

Change to:
```python
effective_date = project.next_occurrence_date or project.start_date
if project.is_recurring and project.next_occurrence_date:
    # Recurring event — rank by next occurrence, never "past"
    if project.next_occurrence_date < now:
        # Celery hasn't refreshed yet — still treat as upcoming
        pass
elif project.end_date and project.end_date < now:
    return -99  # non-recurring past event
```

##### 4. API Filter Addition (`backend/organization/views/project_views.py`)

Add to `ListProjectsView.get_queryset()`:

```python
# Filter by project type
project_type = self.request.query_params.get("project_type")
if project_type:
    queryset = queryset.filter(project_type=project_type)

# Sort by upcoming (for events tab)
sort_by = self.request.query_params.get("sort_by")
if sort_by == "upcoming":
    queryset = queryset.order_by(
        Coalesce("next_occurrence_date", "start_date")
    )
```

##### 5. Serializer Addition (`backend/organization/serializers/project.py`)

Add to `ProjectStubSerializer.fields`:

```python
"is_recurring", "next_occurrence_date",
```

##### 6. Frontend EventDateIndicator (`frontend/src/components/project/EventDateIndicator.tsx`)

Current: shows `start_date`/`end_date`.

For recurring events: show "Every Tuesday · Next: Jun 16" or "Weekly · Next: Jun 16 at 6pm".

Parse `recurrence_rule` client-side (using `rrule.js`) or just display the `next_occurrence_date` with a "repeats" indicator.

##### 7. Frontend Events Tab (`frontend/src/components/browse/BrowseContent.tsx`)

Resolve the TODO at line 148:
```typescript
const TYPES_BY_TAB_VALUE: BrowseTab[] = hideMembers
  ? ["projects", "organizations", "events"]
  : ["projects", "organizations", "members", "events"];
```

Events tab: calls `GET /api/projects/?project_type=EV&sort_by=upcoming`.

### What Doesn't Need to Change

- **Browse page structure**: `BrowseContent`, `FilterProvider`, pagination — all work as-is
- **Hub filtering**: Sectors, location, org type — unaffected
- **Project detail page**: RRULE expansion happens here on-the-fly to show schedule
- **Admin**: Just add new fields to `list_display`/`list_filter`
- **Registration system**: `EventRegistrationConfig` works unchanged; occurrence-specific registration is a Phase 2/3 consideration

### Existing Infrastructure That Helps

| Existing Component | How It Helps |
|-------------------|-------------|
| `parent_project` FK + `has_children` | Already supports one-level hierarchy with signals. But represents a **different concept** (festival → sub-events). Do NOT reuse for recurrence overrides — add a separate `recurrence_master` FK in Phase 3. |
| `has_children` signals + reconciliation command | Pattern to follow for `is_recurrence_override` exclusion from listings. |
| `EventRegistrationConfig` + `EventRegistration` | Registration system works as-is for Phase 1 (register for master). Phase 2/3 needs occurrence-level handling. |
| `ProjectRanking` event-specific logic | Direct extension point — swap `start_date` for `next_occurrence_date`. |
| `ListProjectsView` filter pattern | Standard pattern to follow for adding `project_type` filter. |
| Wasseraktionswochen parent/child pattern | Reference implementation for how parent/child projects display in frontend (but different relationship semantics). |

---

## Key Design Decisions

These decisions should be made before starting Phase 1. Some can be deferred to Phase 2/3.

### Phase 1 Decisions (Required)

1. **How should recurring events appear in browse pages?**
   - **Decision**: One entry with a "repeats" badge. `next_occurrence_date` keeps it sorted correctly among non-recurring events.
2. **Registration**: Does a user register for the series or a specific occurrence?
   - **Decision (Phase 1)**: Register for the **next occurrence** by default. Aligns with existing `EventRegistrationConfig` (no occurrence-level model needed yet).
3. **How far ahead to show occurrences?**
   - **Decision**: Listing shows **next occurrence only**. Detail page shows **next 3 months** of occurrences (computed via RRULE expansion).
4. **Editing (Phase 1)**: Only "edit all" — update the master row. No single-occurrence editing.
5. **Can non-recurring events become recurring and vice versa?**
   - **Decision**: Yes — toggling `is_recurring` on/off is straightforward. When turning off, clear `recurrence_rule` and `next_occurrence_date`.

### Phase 2/3 Decisions (Can defer)

6. **Cancel occurrence UX**: How does the organizer cancel a single occurrence? (Phase 2)
7. **Notification on cancellation**: How are registered users notified? Email? In-app? (Phase 2)
8. **Override vs. cancel**: Should modifying an occurrence automatically "replace" the original, or should the original be cancelled and a new one created? (Phase 3)
9. **Registration transfer**: If an occurrence's time changes, do existing registrations transfer or get cancelled? (Phase 3)
10. **"Edit this and future"**: Should this be supported? It requires splitting the RRULE at a boundary date, which is significantly more complex. (Phase 3 or later)

---

## Libraries

| Language | Library | Notes |
|----------|---------|-------|
| Python | `python-dateutil` | `rrule`, `rrulestr` — mature, widely used. For Celery task RRULE expansion. |
| JavaScript | `rrule.js` | JS implementation of RFC 5545. For frontend display of recurrence pattern. |
| Python | `icalendar` | Parse/generate full iCal files. Optional — only if we need iCal import/export. |

---

## Next Steps

### Phase 1: Foundation
- [ ] Finalize Phase 1 design decisions (see above)
- [ ] Add `python-dateutil` to backend dependencies (PDM)
- [ ] Implement model changes (3 new fields on Project)
- [ ] Generate and apply migration
- [ ] Implement Celery task for `next_occurrence_date` refresh
- [ ] Register periodic task in `django-celery-beat` schedule
- [ ] Update `ProjectRanking` to use `next_occurrence_date` for recurring events
- [ ] Add `project_type` filter to `ListProjectsView`
- [ ] Add `sort_by=upcoming` to `ListProjectsView`
- [ ] Add `is_recurring`, `next_occurrence_date` to `ProjectStubSerializer`
- [ ] Update `EventDateIndicator` for recurring event display
- [ ] Implement frontend events tab (resolve TODO in `BrowseContent.tsx`)
- [ ] Write backend tests for Celery task, ranking, and API filters
- [ ] Write frontend tests for recurring event display

### Phase 2: Cancel Individual Occurrences
- [ ] Add `exception_dates` ArrayField to Project model
- [ ] Update Celery task to skip exception dates
- [ ] Implement `cancel_occurrence` API action
- [ ] Update detail page to show cancelled occurrences
- [ ] Implement notification for registered users of cancelled occurrences
- [ ] Add organizer UI for "Cancel this occurrence"

### Phase 3: Modify Individual Occurrences
- [ ] Add `recurrence_master` FK, `recurrence_id`, `is_recurrence_override` to Project model
- [ ] Update Celery task to handle override rows
- [ ] Exclude override rows from browse listings
- [ ] Implement "Edit this occurrence" UI flow
- [ ] Update detail page to show modified occurrences
- [ ] Handle registration transfer on occurrence modification
- [ ] Write comprehensive tests for override scenarios

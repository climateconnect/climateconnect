# Event Organiser Can See Status of Registrations

**Status**: IMPLEMENTATION (Reference: [`task-based-development.md`](../for-agents/guides/task-based-development.md))
**Type**: Feature
**Date and time created**: 2026-04-01 10:00
**Date Completed**: TBD
**GitHub Issue**: [product-backlog#48](https://github.com/climateconnect/product-backlog/issues/48)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`docs/mosy/architecture_overview.md`](../mosy/architecture_overview.md)
- [`docs/mosy/entities/system-entities.md`](../mosy/entities/system-entities.md)
- [`docs/mosy/flows/core-flows.md`](../mosy/flows/core-flows.md)
- [`20260309_0900_member_register_for_event.md`](./20260309_0900_member_register_for_event.md) ← introduces `EventParticipant`
- [`20260309_1500_member_cancel_event_registration.md`](./20260309_1500_member_cancel_event_registration.md) ← introduces `cancelled_at` (not yet implemented — see dependency notes)
- [`20260324_0900_organizer_close_event_registration.md`](./20260324_0900_organizer_close_event_registration.md) ← inline organizer-role check pattern

## Problem Statement

An event organiser or team admin can view the full list of members who have signed up for their event. This feature provides organisers with the visibility they need to manage attendance and take actions (e.g. preparing materials, exporting a guest list in a future story).

**Core Requirements (User/Stakeholder Stated):**

- The **event creator** and **team admins** (roles: `all_type`, `read_write_type`) have access to the event registration details section/page. This access is enforced in the API — not only in the frontend.
- On the event's **Registrations tab** (already present via `ProjectRegistrationsContent.tsx`), the organiser can:
  - See the **list of all users who have signed up**.
  - Each row shows:
    - The user's small **avatar** (thumbnail image).
    - The user's **first name** and **last name**.
    - The **registration date** (date and time the user registered).
  - The list can be **sorted** by user name (first name + last name) and registration date.
  - The list can be **searched** by free-text on user first name and last name.

**Explicitly Out of Scope (this iteration):**

- Exporting the guest list (e.g. CSV/PDF) — future story.
- Sending email to all registered guests — future story.
- Organiser cancelling an individual guest registration — future story.
- Showing cancelled registrations in the list. The `cancelled_at` field on `EventParticipant` is introduced in [#1850](https://github.com/climateconnect/climateconnect/issues/1850). Once that story is implemented, only active registrations (`cancelled_at IS NULL`) must be shown. Until then, all participant rows are active.
- Pagination on the backend — the list is loaded in full. Client-side paging is provided by the MUI DataGrid.

### Non Functional Requirements

- Access to the list endpoint **must be enforced server-side** (`403 Forbidden` for users without edit rights, `401 Unauthorized` for unauthenticated requests). The frontend access guard alone is not sufficient.
- The endpoint returns **all participants in a single response** (no `limit`/`offset` params). This simplifies client-side filtering, sorting, and future CSV export. Events with very large numbers of registrations are not expected in Phase 2; this constraint can be revisited in Phase 3.
- The query must use `select_related("user__userprofile")` to avoid N+1 queries when serialising avatar and name fields.
- No breaking changes to existing API contracts.
- The `EVENT_REGISTRATION` feature toggle must be checked in the frontend before rendering the Registrations tab content (already enforced at the tab-visibility level in `ProjectPageRoot.tsx`).

### AI Agent Insights and Additions

- **`cancelled_at` forward-compatibility**: the `EventParticipant` model does not yet have a `cancelled_at` field (added in [#1850](https://github.com/climateconnect/climateconnect/issues/1850)). The list endpoint must be written so that adding `cancelled_at__isnull=True` to the queryset in [#1850](https://github.com/climateconnect/climateconnect/issues/1850) is a one-line change. Add a `# TODO #1850: add .filter(cancelled_at__isnull=True)` comment in the view queryset.
- **MUI DataGrid dependency**: `@mui/x-data-grid` is not currently installed in the frontend. The community edition is free. Install with `yarn add @mui/x-data-grid`. Use the same major version as `@mui/x-date-pickers` (currently v6) for consistency: `yarn add @mui/x-data-grid@6`. Peer dependency `@mui/material` v5 is already satisfied.
- **Avatar rendering in DataGrid**: MUI DataGrid `renderCell` is needed for the avatar column since DataGrid only renders primitives by default. Use `renderCell: (params) => <Avatar src={params.row.user_thumbnail_image} />`.
- **Permission class**: the existing pattern in the codebase (see `EditEventRegistrationSettingsView`) is to perform an inline `ProjectMember.objects.filter(...)` check rather than a dedicated permission class. Follow that pattern for consistency — no new permission class is required.
- **Default sort order**: default to `registered_at` ascending (chronological order) — the most natural order for an organiser reviewing their sign-up list.
- **Name sort**: sorting "by user name" means combined `first_name + ' ' + last_name`. In the DataGrid this can be done by adding a computed `full_name` column or by treating first_name and last_name as two separately sortable columns (simpler). The acceptance criteria say "sorted by user name" — implement as two separate sortable columns (`first_name`, `last_name`) which satisfies the requirement without a computed field.
- **Quick filter scope**: the MUI DataGrid `GridToolbarQuickFilter` searches all columns by default. To restrict search to first and last name only (as per AC), set `quickFilterParser` or define `getApplyQuickFilterFn` only on the name columns. Alternatively, a simpler and more explicit approach is a standalone `TextField` above the grid that filters the `rows` array by `user_first_name.includes(query) || user_last_name.includes(query)` — this is the recommended approach for clarity and control.

## System impact

- **Actors involved**:
  - `Organiser` (event creator or team admin): Views the list of registered participants.
  - `System`: Queries `EventParticipant` rows for the event and returns user details.
- **Actions to implement**:
  - `Organiser` → `View Registration List` → `EventParticipant` (read: list of active participants with user details)
- **Flows affected**:
  - **New read flow — View Event Registration List**: Organiser navigates to the Registrations tab on the event detail page → system fetches the participant list → DataGrid renders the list with search and sort.
- **Entity changes needed**: None. `EventParticipant` already exists with `user`, `event_registration`, `registered_at`. No new fields required for this story.
- **Flow changes needed**: Yes — new read flow added.
- **Integration changes needed**: No.
- **New specifications required**: No additional specs beyond this document.

## Software Architecture

### API

**New endpoint — list event participants**

```
GET /api/projects/{url_slug}/registrations/
```

- Auth required — returns `401 Unauthorized` if not authenticated.
- Requires organiser or team admin role (`role_type` in `["all", "read write"]`) — returns `403 Forbidden` otherwise.
- Returns `404 Not Found` if the project does not exist or does not have `EventRegistration` enabled.
- No query parameters. Returns all active participants in a single response.
- Default ordering: `registered_at` ascending.
- Once [#1850](https://github.com/climateconnect/climateconnect/issues/1850) is implemented, add `cancelled_at__isnull=True` filter (see TODO comment in implementation).

**Request**
```
GET /api/projects/my-event/registrations/
Authorization: Token <token>
```

**Response — 200 OK**
```json
[
  {
    "user_first_name": "Alice",
    "user_last_name": "Smith",
    "user_url_slug": "alice-smith",
    "user_thumbnail_image": "https://.../thumb_alice.jpg",
    "registered_at": "2026-05-10T14:23:00Z"
  },
  ...
]
```

**Response — 403 Forbidden** (not an organiser/admin)
```json
{ "message": "You do not have permission to view registrations for this project." }
```

**Response — 404 Not Found** (project not found or registration not enabled)
```json
{ "message": "Project not found: my-event" }
```
or
```json
{ "message": "This project does not have event registration enabled." }
```

### Events

None. This is a read-only endpoint. No async side-effects.

### Frontend

#### `ProjectRegistrationsContent.tsx`

The existing placeholder section **"Registration list will be shown here in a future release."** is replaced with a fully working guest list.

**Changes:**

1. On component mount, call `GET /api/projects/{project.url_slug}/registrations/` and store the result in component state.
2. Render a `TextField` for search (filters by first name + last name client-side).
3. Render an MUI `DataGrid` (community edition) with the filtered rows.

**DataGrid columns:**

| Column | Field | Sortable | Notes |
|--------|-------|----------|-------|
| Avatar | `user_thumbnail_image` | No | Rendered with `renderCell` → `<Avatar src={...} sx={{ width: 32, height: 32 }} />` |
| First name | `user_first_name` | Yes | |
| Last name | `user_last_name` | Yes | |
| Registration date | `registered_at` | Yes | Format with `dayjs` (same as other date displays in the file) |

**States to handle:**
- Loading: show `CircularProgress` while the API call is in flight.
- Error: show an inline error message (e.g. `<Typography color="error">`).
- Empty (API returns `[]`): DataGrid shows built-in "No rows" state (customise the `localeText` prop if needed).

**Search behaviour:**
- A `TextField` with `InputProps={{ startAdornment: <SearchIcon /> }}` is placed above the DataGrid.
- On every keystroke, filter the local `participants` array: keep rows where `user_first_name` or `user_last_name` contains the search string (case-insensitive).
- Pass the filtered array to the DataGrid's `rows` prop.

**Feature toggle:**
- The Registrations tab is only shown when `isEnabled("EVENT_REGISTRATION")` is true AND the user has admin permissions — this is already enforced in `ProjectPageRoot.tsx` via `showRegistrationsTab`. No additional toggle check is needed inside `ProjectRegistrationsContent.tsx`.

#### New dependency

```
yarn add @mui/x-data-grid@6
```

`@mui/x-data-grid` v6 is the same major as `@mui/x-date-pickers` v6 already installed. Both are MUI X packages.

#### New text keys (`public/texts/project_texts.tsx`)

Add to the `project` page text object:

| Key | EN | DE |
|-----|----|----|
| `registered_guests` | `"Registered guests"` | `"Angemeldete Gäste"` |
| `search_guests` | `"Search by name…"` | `"Nach Name suchen…"` |
| `first_name` | `"First name"` | `"Vorname"` |
| `last_name` | `"Last name"` | `"Nachname"` |
| `registration_date` | `"Registration date"` | `"Anmeldedatum"` |
| `no_registrations_yet` | `"No registrations yet."` | `"Noch keine Anmeldungen."` |
| `loading_registrations` | `"Loading registrations…"` | `"Anmeldungen werden geladen…"` |
| `error_loading_registrations` | `"Failed to load registrations. Please try again."` | `"Anmeldungen konnten nicht geladen werden. Bitte erneut versuchen."` |

### Backend

#### Serializer — `EventParticipantSerializer`

New serializer in `organization/serializers/event_registration.py`.

```python
class EventParticipantSerializer(serializers.ModelSerializer):
    user_first_name = serializers.CharField(source="user.first_name", read_only=True)
    user_last_name = serializers.CharField(source="user.last_name", read_only=True)
    user_url_slug = serializers.SerializerMethodField()
    user_thumbnail_image = serializers.SerializerMethodField()

    class Meta:
        model = EventParticipant
        fields = [
            "user_first_name",
            "user_last_name",
            "user_url_slug",
            "user_thumbnail_image",
            "registered_at",
        ]
        read_only_fields = fields

    def get_user_url_slug(self, obj):
        try:
            return obj.user.userprofile.url_slug
        except AttributeError:
            return None

    def get_user_thumbnail_image(self, obj):
        try:
            profile = obj.user.userprofile
            if profile.thumbnail_image:
                request = self.context.get("request")
                if request:
                    return request.build_absolute_uri(profile.thumbnail_image.url)
                return profile.thumbnail_image.url
        except AttributeError:
            pass
        return None
```

#### View — `ListEventParticipantsView`

New view in `organization/views/event_registration_views.py`.

```python
class ListEventParticipantsView(APIView):
    """
    GET /api/projects/{url_slug}/registrations/

    Returns the full list of active participants for an event.
    Restricted to event organisers and team admins.

    Response: list of EventParticipantSerializer dicts, ordered by registered_at asc.
    No pagination — all rows returned in one response (client-side paging in UI).
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, url_slug):
        # 1. Look up project
        try:
            project = Project.objects.get(url_slug=url_slug)
        except Project.DoesNotExist:
            return Response(
                {"message": f"Project not found: {url_slug}"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # 2. Check organiser/admin permission (inline, consistent with EditEventRegistrationSettingsView)
        has_edit_rights = ProjectMember.objects.filter(
            user=request.user,
            role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE],
            project=project,
        ).exists()
        if not has_edit_rights:
            return Response(
                {"message": "You do not have permission to view registrations for this project."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # 3. Look up EventRegistration
        try:
            er = project.event_registration
        except EventRegistration.DoesNotExist:
            return Response(
                {"message": "This project does not have event registration enabled."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # 4. Query participants — use select_related to avoid N+1 on user/profile fields
        # TODO #1850: add .filter(cancelled_at__isnull=True) once cancelled_at is added
        participants = (
            EventParticipant.objects
            .select_related("user__userprofile")
            .filter(event_registration=er)
            .order_by("registered_at")
        )

        serializer = EventParticipantSerializer(
            participants, many=True, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
```

#### URL

Add to `organization/urls.py`:

```python
path(
    "projects/<str:url_slug>/registrations/",
    event_registration_views.ListEventParticipantsView.as_view(),
    name="list-event-registrations",
),
```

#### No migration required

No new model fields. `EventParticipant` already exists with all fields needed for this story.

### Data

No schema changes. All required fields (`user`, `event_registration`, `registered_at`) already exist on `EventParticipant` from [#1845](https://github.com/climateconnect/climateconnect/issues/1845).

### Other

None.

---

## Files to Change

### Backend

| File | Change |
|------|--------|
| `organization/serializers/event_registration.py` | Add `EventParticipantSerializer` |
| `organization/views/event_registration_views.py` | Add `ListEventParticipantsView` |
| `organization/urls.py` | Add URL pattern for `GET /api/projects/{url_slug}/registrations/` |
| `organization/tests/test_event_registration.py` | Add tests for `ListEventParticipantsView` |

### Frontend

| File | Change |
|------|--------|
| `src/components/project/ProjectRegistrationsContent.tsx` | Replace placeholder with DataGrid + search |
| `public/texts/project_texts.tsx` | Add new text keys (see table above) |
| `package.json` / `yarn.lock` | Add `@mui/x-data-grid@6` dependency |

---

## Test Cases

### Backend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | Unauthenticated request | 401 Unauthorized |
| 2 | Authenticated member without edit rights | 403 Forbidden |
| 3 | Organiser on project without `EventRegistration` | 404 Not Found |
| 4 | Organiser on valid event, no participants yet | 200 OK, empty list `[]` |
| 5 | Organiser on valid event, 3 participants | 200 OK, list of 3 in `registered_at` asc order |
| 6 | Participant with no profile image | 200 OK, `user_thumbnail_image: null` |
| 7 | Team admin (not creator) with `read_write_type` role | 200 OK, list returned |
| 8 | `select_related` is used (query count check) | Only 1 or 2 DB queries regardless of participant count |

### Frontend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | Component mounts, API responds with participants | DataGrid shows all rows |
| 2 | API call in flight | `CircularProgress` shown |
| 3 | API call fails | Error message shown |
| 4 | API returns empty list | DataGrid shows empty state |
| 5 | User types in search box | Rows filtered by first/last name (case-insensitive) |
| 6 | User clicks column header to sort | Rows reorder correctly |
| 7 | User clicks through DataGrid pagination | Correct page shown |
| 8 | User without admin rights | Registrations tab is not rendered (enforced in `ProjectPageRoot.tsx`) |

---

## Dependency Notes

- **Depends on** [#1845](https://github.com/climateconnect/climateconnect/issues/1845): `EventParticipant` entity must exist. Marked READY — can proceed.
- **Forward dependency** [#1850](https://github.com/climateconnect/climateconnect/issues/1850): adds `cancelled_at` to `EventParticipant`. When [#1850](https://github.com/climateconnect/climateconnect/issues/1850) is implemented, the queryset in `ListEventParticipantsView` must be updated to filter `cancelled_at__isnull=True`. The `# TODO #1850` comment in the view marks this location.
- **Update Epic** [`EPIC_event_registration.md`](./EPIC_event_registration.md): change the row "Organiser sees status of registrations (list of guests)" from `⚪ Not started` to `📝 Draft` / `🔵 Ready` after this spec is reviewed.

---

## Log

- 2026-04-01 10:00 — Task created from product-backlog issue #48. Initial problem statement and architecture drafted.
- 2026-04-01 10:30 — Spec reviewed and approved. Transitioning to IMPLEMENTATION. Backend work starting first.


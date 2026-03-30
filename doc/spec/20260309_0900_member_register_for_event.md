# Member Can Register for an Event

**Status**: READY FOR IMPLEMENTATION (Reference: [`task-based-development.md`](../for-agents/guides/task-based-development.md))
**Type**: Feature
**Date and time created**: 2026-03-09 09:00
**Date Completed**: TBD
**GitHub Issue**: [#1845](https://github.com/climateconnect/climateconnect/issues/1845)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)  
**Related Specs**:
- [`docs/mosy/architecture_overview.md`](../mosy/architecture_overview.md)
- [`docs/mosy/entities/system-entities.md`](../mosy/entities/system-entities.md)
- [`docs/mosy/flows/core-flows.md`](../mosy/flows/core-flows.md)
- [`docs/tasks/20260305_1000_create_event_with_basic_registration.md`](./20260305_1000_create_event_with_basic_registration.md) ← depends on this task

## Problem Statement

A logged-in member of the platform can register for an event that has registration enabled (`EventRegistration` record exists). This is the **member-facing** registration flow — the counterpart to the event organiser creation flow (issue #43).

**Core Requirements (User/Stakeholder Stated):**

- A member can see which events on the platform offer registration (in project listings and on the event page).
- On an event page, a **"Register"** button replaces the follow button (especially important for mobile).
- The registration is **open** unless one of the following conditions is true, in which case the button is shown disabled (e.g. labelled "Registration closed"):
  - The event's `registration_end_date` has passed.
  - The event has reached `max_participants` (no seats remaining).
  - Registration was manually closed by the organiser *(management feature — out of scope for this iteration)*.
- **Case 1 — Member is logged in**: clicking "Register" opens a signup/confirmation form directly.
- **Case 2 — Member is not logged in**: the "Register" button on the event page is **enabled** and opens the registration modal. Inside the modal, the "Confirm Registration" button is **disabled**, and a message reads *"To register for this event please login or sign up!"* with two action buttons: **"Log In"** and **"Sign Up"**. Clicking either navigates to the respective page; after successful login or signup the user is returned to the event page with the modal open.
- After the member confirms registration:
  - A success confirmation is shown in the UI.
  - The member receives a confirmation email.
  - The system stores the registration (links the member to the event).
  - The available seat count on the event page is decremented by 1.
- It is possible to **deep-link directly** to the event registration form via `/projects/{slug}/register`. Opening this URL should display the event page with the registration modal/form pre-opened.

**Explicitly Out of Scope (this iteration):**
- Registration for guest users without a platform account.
- Quick signup (one-click registration without a form).
- Registration with additional event-specific information (e.g. dietary preferences, t-shirt size).
- Manually closing registration (organiser management feature — separate story).

### Non Functional Requirements

- Available seat count displayed on the event page must reflect real-time (or near-real-time) registrations to avoid overselling. Race conditions on the last seat must be handled (e.g. database-level constraint or atomic decrement).
- The registration endpoint must be idempotent per user/event pair — re-registering an already-registered member must not create a duplicate record.
- Confirmation email must be sent asynchronously (via Celery + Mailjet) — it must not block the HTTP response.
- The deep-link URL `/projects/{slug}/register` must open the registration modal for both authenticated and unauthenticated users. Unauthenticated users will see the modal's login/signup prompt. If the user then clicks "Log In" or "Sign Up", the `redirect` URL must be set to `/projects/{slug}/register` so the modal re-opens after authentication.
- The `redirect` query parameter support must be **added to `/signup`** as part of this task — the sign-up page currently only redirects to `/` or `/{hub}/browse` and does not yet accept a `redirect` param.
- No breaking changes to existing project/event APIs.

### AI Agent Insights and Additions

- A new `EventParticipant` entity (or equivalent join table) is needed to record *who* registered for an event. This was not explicitly named in the story but is implied by "the platform stores who has signed up."
- The seat count shown in listings is explicitly excluded for performance reasons. For the "is registration accepting?" indicator in listing cards, the frontend derives it from the already-returned `status` and `registration_end_date` fields (`status === "open" AND now() < registration_end_date`). Full seat details (`available_seats`, `max_participants`) are returned on the event detail endpoint only.
- The `/projects/{slug}/register` deep-link needs to handle the post-login redirect carefully: `/projects/{slug}/register` is used as the `redirect` query parameter so the modal opens after authentication.

## System impact

- **Actors involved**:
  - `Member`: Registers for an event.
  - `System`: Validates seat availability, stores registration, sends confirmation email.
  - `Guest` (unauthenticated): Opens the registration modal, sees the login/signup prompt inside it.
- **Actions to implement**:
  - `Member` → `Register for Event` → `EventParticipant` (new record) + `EventRegistration` (decrement available seats)
  - `System` → `Send Registration Confirmation` → `Member` (email via Mailjet/Celery)
- **Flows affected**:
  - **New flow — Member Event Registration Flow**: Member discovers event → clicks Register → authenticates if needed → confirms → system stores registration and sends email.
  - **Flow 2 — Project/Event/Idea Creation Flow** (read-only impact): The `EventRegistration` entity created in this flow is now consumed here.
- **Entity changes needed**: Yes
  - `EventParticipant` (new entity): links `User` ↔ `EventRegistration`; records registration timestamp. Unique constraint on `(user, event_registration)`.
  - `EventRegistration` (existing, read + count): has `status` field (`open` / `closed` / `full`) — already implemented. `available_seats` will be a computed value (`max_participants - COUNT(participants)`) once `EventParticipant` exists; no denormalised counter column. The "is registration open?" check is `status == open AND now() < registration_end_date`.
- **Flow changes needed**: Yes — new flow added.
- **Integration changes needed**: Yes — Mailjet confirmation email (async via Celery, consistent with existing email patterns).
- **New specifications required**: New flow spec + sequence diagram for the Member Event Registration Flow.

## Software Architecture

### API

New endpoints plus extensions to the existing event detail endpoint.

**Register for an event (new)**
```
POST /api/projects/{slug}/register/
```
- Auth required.
- Idempotent: returns `200 OK` (with existing registration) if the member is already registered.
- Returns `201 Created` on first registration.
- Returns `400 Bad Request` if registration is closed (status is `closed` or `full`, or deadline passed).
- Response body: `{ "registered": true, "available_seats": <int | null> }`


**Event detail — extended (existing)**
```
GET /api/projects/{slug}/
```
- Already returns `event_registration` when the project is an event with registration enabled.
  The object shape (as implemented):
  ```json
  "event_registration": {
    "max_participants": 100,
    "registration_end_date": "2026-06-01T23:59:00Z",
    "status": "open" | "closed" | "full"
  }
  ```
- `status` values:
  - `"open"` — registration is accepting sign-ups.
  - `"closed"` — organiser manually closed registration.
  - `"full"` — system-set when `max_participants` is reached; reverts to `"open"` if a cancellation drops the count below `max_participants`.
- **Registration is effectively open when**: `status == "open"` AND `now() < registration_end_date`.
- `available_seats` will be added to this object **on the detail endpoint only** once the `EventParticipant` table is implemented (computed as `max_participants - COUNT(participants)`). It is intentionally excluded from list responses to avoid a COUNT query per row.

**Event list — existing**
```
GET /api/projects/
```
- Already returns the full `event_registration` object per list item (same shape as above, via `ProjectStubSerializer`). No separate `has_registration` boolean flag is needed — its presence signals registration is enabled.
- For the "is registration accepting?" indicator in list cards, the frontend derives it from: `status == "open" AND now() < registration_end_date`. No seat count is returned in list responses for performance (seat count requires `EventParticipant` which is not yet implemented).

### Events

- **`event.registration.confirmed`** (async, internal): published to Celery queue after a successful registration; triggers the confirmation email task.
  - Payload: `{ user_id, event_slug, event_title, event_start_date, registration_timestamp }`

### Frontend

- **Project / event listing cards (preview)**: For events where `event_registration` is present **and the `EVENT_REGISTRATION` feature toggle is enabled**, show a **small button placed next to the project type label, aligned to the right**. The button label and state vary by effective registration status:
  - `open` → **"Register now"** — interactive, links to `/projects/{slug}/register`
  - `full` → **"Booked out"** — disabled, visual indicator only
  - `closed` → **"Registration closed"** — disabled, visual indicator only
  - `ended` → no button shown
  - No seat count is shown in listing cards (seat count requires a COUNT query per row — performance reason).
  - `effective_status` is derived client-side: if `status === "open"` and `registration_end_date <= now()`, treat as `ended`; otherwise use `status` directly.
- **Event detail page**:
  - Replace the Follow button with a **"Register"** button when the event has `event_registration` present **and the `EVENT_REGISTRATION` feature toggle is enabled**.
  - When registration is closed (`status === "closed"` or `status === "full"` or `now >= registration_end_date`): render a disabled grey button labelled "Registration closed".
  - When registration is open (`status === "open"` and `now < registration_end_date`): the "Register" button is **always enabled**, regardless of auth state. Clicking it opens the registration modal. Auth state is handled inside the modal (see below).
  - Show available seat count (e.g. "47 seats remaining") on the event detail page — **deferred until `EventParticipant` is implemented** and `available_seats` is returned by the API.
  - Deep-link support: navigating to `/projects/{slug}/register` auto-opens the modal on page load (for both authenticated and unauthenticated users; unauthenticated users will see the modal's login/signup prompt). Implemented as a new Next.js page at `pages/projects/[projectId]/register.tsx`.
- **Registration modal**:
  - **Authenticated state**: user's name and email are pre-filled (read-only). Single "Confirm Registration" CTA.
    - On success: show a success state ("You're registered! A confirmation email has been sent.").
    - On error (e.g. race condition — last seat taken): show an error state ("Sorry, registration is now full.").
  - **Unauthenticated state**: "Confirm Registration" button is **disabled**. Show the message: *"To register for this event please login or sign up!"* with two buttons: **"Log In"** (links to `/signin?redirect=/projects/{slug}/register`) and **"Sign Up"** (links to `/signup?redirect=/projects/{slug}/register`). After successful authentication the user is returned to `/projects/{slug}/register` and the modal opens.
  - **Signup `redirect` support**: the `/signup` page currently does not accept a `redirect` query parameter. Adding this support is **in scope for this task** — on successful account creation the user must be redirected to the value of `redirect` (consistent with the existing `redirect` param behaviour in `/signin`).

### Backend

- **`EventParticipant` model** (new — to be implemented in this task):
  ```python
  class EventParticipant(models.Model):
      user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="event_participations")
      event_registration = models.ForeignKey(EventRegistration, on_delete=models.CASCADE, related_name="participants")
      registered_at = models.DateTimeField(auto_now_add=True)

      class Meta:
          unique_together = [("user", "event_registration")]
  ```
- **`EventRegistration` model** (already implemented): has `status` field (`open` / `closed` / `full`), `max_participants`, `registration_end_date`. The "is registration open?" check is `status == OPEN AND now() < registration_end_date` — no separate boolean field exists.
- **`EventRegistrationViewSet`** (new): handles `POST /api/projects/{slug}/register/`.
  - `register()` action: validate `status == open AND now() < registration_end_date`, create `EventParticipant` atomically (use `select_for_update` or DB unique constraint to prevent oversell), set `status = FULL` when last seat is taken, publish Celery task.
- **`EventRegistrationSerializer`** (extend existing): add `available_seats` (annotated count: `max_participants - COUNT(participants)`) once `EventParticipant` exists. `status` is already serialized and returned.
  - **`available_seats` must only be included in the detail response, not in list responses** — a COUNT query per row would make the project list endpoint unacceptably slow.
  - Implementation: use a serializer context flag (e.g. `context={"include_seat_count": True}`) passed by `ProjectSerializer.get_event_registration` (detail) but not by `ProjectStubSerializer.get_event_registration` (list). `available_seats` is a `SerializerMethodField` that returns `None` / is omitted when the flag is absent.
- **Celery task** `send_event_registration_confirmation_email`: sends email via Mailjet with event details and a calendar invite / confirmation link.
- **Django migration**: create `projects_eventparticipant` table.

### Data

- **New table**: `projects_eventparticipant`
  - `id`: SERIAL PRIMARY KEY
  - `user_id`: INTEGER NOT NULL — FK → `auth_user.id` ON DELETE CASCADE
  - `event_registration_id`: INTEGER NOT NULL — FK → `projects_eventregistration.id` ON DELETE CASCADE
  - `registered_at`: TIMESTAMPTZ NOT NULL DEFAULT now()
  - UNIQUE(`user_id`, `event_registration_id`)
- Migration is additive. No existing data is affected.
- `available_seats` is computed as `max_participants - COUNT(participants)` — no denormalised counter column needed unless performance testing shows otherwise.

### Other

#### Confirmation email — Mailjet template setup (manual step required)

The backend sending infrastructure is fully implemented:
- Celery task: `organization.tasks.send_event_registration_confirmation_email`
- Sending function: `organization.utility.email.send_event_registration_confirmation_to_user`
- Uses the shared `send_email()` helper with a Mailjet `TemplateID`, consistent with all other transactional emails.

**Two Mailjet transactional templates must be created manually in the Mailjet dashboard before confirmation emails will be sent** — one English template and one German template.

Once created, add the numeric template IDs to `.backend_env`:

```
EVENT_REGISTRATION_CONFIRMATION_TEMPLATE_ID=<EN template ID>
EVENT_REGISTRATION_CONFIRMATION_TEMPLATE_ID_DE=<DE template ID>
```

Both variables have an empty-string default in `settings.py` — without them set, `send_email()` will log an error and silently skip sending (no exception raised to the caller or the Celery task).

**Template variables** — define all of the following in both templates:

| Variable | Type | Content | Notes |
|---|---|---|---|
| `{{var:FirstName}}` | String | Registering user's first name | Falls back to `username` if `first_name` is blank |
| `{{var:EventTitle}}` | String | Display name of the event **in the user's language** | Uses `get_project_name()` — returns the translation if one exists, otherwise the original name |
| `{{var:EventUrl}}` | String | Full, language-aware URL to the event page | e.g. `https://climateconnect.earth/projects/{slug}` (EN) or `.../de/projects/{slug}` (DE) |
| `{{var:StartDate}}` | String | Formatted start date — localised for the user's language and timezone | Timezone resolved from: user's location `centre_point` → project location `centre_point` → UTC. EN British format: `"30 March 2026 at 14:00 (CET)"`. DE format: `"30. März 2026 um 14:00 Uhr (MEZ)"`. Unknown timezone abbreviations shown as-is (e.g. `"EAT"`). `"TBD"` when `start_date` is null |
| `{{var:OrganiserName}}` | String | Organisation name **in the user's language**, or user's full name / username | Uses `get_organization_name()` for org owners. **Can be empty string** if no owner row exists — render conditionally |
| `{{var:LocationName}}` | String | `"Online"` for online events; `Location.name` for in-person | **Can be empty string** if location is not set — render conditionally |

**Conditional rendering guidance** (Mailjet template language):
```
{% if var:OrganiserName != "" %}
  <p>Organised by: {{var:OrganiserName}}</p>
{% endif %}

{% if var:LocationName != "" %}
  <p>Location: {{var:LocationName}}</p>
{% endif %}
```

**Email subject line** (set in code, not in the template — also uses localised project name):
- EN: `"You're registered for {EventTitle}!"`
- DE: `"Du bist für {EventTitle} angemeldet!"`

The organiser name is resolved from `ProjectParents` (org name → user's `UserProfile.name` → `username`). Organisation names are localised via `get_organization_name()`. User names are not translatable. The location name comes from `project.loc.name` for in-person events, or `"Online"` when `project.is_online` is `True`.

**Timezone resolution — important implementation note:**
PostGIS `PointField` values in this codebase are stored with swapped axes (`point.x = latitude`, `point.y = longitude` — documented in `location/admin.py`). The `get_timezone_for_point()` utility handles this correctly by passing `lng=point.y, lat=point.x` to `timezonefinder`. Using the values the wrong way around would resolve to a completely different part of the world and produce a wrong timezone.

- Post-login redirect: `/projects/{slug}/register` is used as the `redirect` query parameter value — verify this is preserved correctly by the login redirect mechanism (`/signin` already supports `params.redirect`; `/signup` redirect support is added in this task).

## Technical Solution Overview

*Backend implemented 2026-03-30. Frontend implementation pending.*

### Backend (implemented)

- **`EventParticipant` model** — `organization/models/event_registration.py`. `unique_together = [("user", "event_registration")]`, two DB indexes (`idx_ep_event_registration`, `idx_ep_user`). Migration `0122_add_eventparticipant`.
- **`POST /api/projects/{slug}/register/`** — `RegisterForEventView` in `organization/views/project_views.py`. Uses `@transaction.atomic` + `select_for_update()` on `EventRegistration` for race-condition safety. Idempotent (200 on re-registration). Promotes `status → FULL` when last seat is taken. Dispatches Celery email task via `transaction.on_commit` with eagerly-captured `user_id` and `event_slug` (avoids Python late-binding closure bug).
- **`available_seats`** — added to `EventRegistrationSerializer` as a `SerializerMethodField`. Only computed when `context["include_seat_count"] is True` (passed by `ProjectSerializer.get_event_registration` on detail; absent on list).
- **Celery task** — `organization/tasks.py`: `send_event_registration_confirmation_email(user_id, event_slug)`. Fetches user with `select_related("user_profile__location")` and project with full translation and location prefetches. Retries up to 3× on transient failures.
- **Email function** — `organization/utility/email.py`: `send_event_registration_confirmation_to_user`. Lives alongside all other project/org emails to avoid circular imports. Passes 6 localised template variables: `FirstName`, `EventTitle`, `EventUrl`, `StartDate`, `OrganiserName`, `LocationName`.
  - `EventTitle` — localised via `get_project_name(project, lang_code)`: returns the translation for the user's language if one exists, otherwise the original.
  - `OrganiserName` — org owners localised via `get_organization_name(org, lang_code)`; user owners use `UserProfile.name` or `username` (not translatable).
  - `EventUrl` — language-aware: `/projects/{slug}` (EN) or `/de/projects/{slug}` (DE).
  - Subject line — also uses the localised project name for both EN and DE variants.
  - `StartDate` — localised via `climateconnect_api/utility/timezone_utils.py` (see below).
- **Timezone utility** — `climateconnect_api/utility/timezone_utils.py`: generic, reusable across any email that needs localised datetime display.
  - `get_timezone_for_point(point)` — reverse-geocodes a PostGIS `PointField` to an IANA timezone using `timezonefinder`. **Important**: `PointField` values in this codebase are stored with swapped axes (`point.x = latitude`, `point.y = longitude`), so the call is `timezone_at(lng=point.y, lat=point.x)`.
  - `get_event_display_timezone(user, project)` — resolves timezone in priority order: user's location → project location → UTC.
  - `format_datetime_localized(dt, lang_code, tz)` — EN British (`"30 March 2026 at 14:00 (CET)"`), DE with German month names and translated timezone abbreviations (`"30. März 2026 um 14:00 Uhr (MEZ)"`), `None` → `"TBD"`.
- **`timezonefinder` dependency** — added to `pyproject.toml` via PDM; installed in the `django4` venv.
- **Env vars** — `EVENT_REGISTRATION_CONFIRMATION_TEMPLATE_ID` and `_DE` added to `settings.py` with empty-string defaults.

### Frontend (pending)

Not yet implemented. See `### Frontend` section above for full requirements.

### Outstanding manual step

**Create both Mailjet templates and set the env vars** — see `### Other` above. Until this is done the backend endpoint works but no confirmation email is sent.

## Log

- 2026-03-09 09:00 — Task created from GitHub issue #44. Depends on task `20260305_1000_create_event_with_basic_registration` (issue #43) for the `EventRegistration` entity.
- 2026-03-09 09:15 — Confirmed: no seat count in event listings (boolean flag only, for performance). Unregister endpoint removed from this task — will be implemented in a separate dedicated task.
- 2026-03-09 09:30 — Confirmed unauthenticated UX for Case 2: "Register" button on the event page is always enabled (when registration is open); the disabled state + login/signup prompt live inside the registration modal, not on the event page. Post-auth `redirect` URL set to `/projects/{slug}/register` for modal re-open.
- 2026-03-09 09:45 — Confirmed deep-link URL pattern: `/projects/{slug}/register` (consistent with existing `/projects/{slug}` routing; implemented as `pages/projects/[projectId]/register.tsx`). Preferred over `?register=true` query param and `#register` fragment for RESTfulness and redirect stability.
- 2026-03-09 10:00 — Specs approved. Status promoted to READY FOR IMPLEMENTATION.
- 2026-03-25 — Spec aligned with actual implementation from task #43: `is_registration_open` boolean replaced throughout by `status` field (`open`/`closed`/`full`); list endpoint already returns full `event_registration` object (no separate `has_registration` flag needed); `available_seats` and `EventParticipant` confirmed as not yet implemented; `EventRegistrationSerializer` already serializes `status`.
- 2026-03-26 — Corrected against actual codebase: (1) API endpoint `POST /api/events/{slug}/register/` → `POST /api/projects/{slug}/register/` (no `/api/events/` prefix exists; all project endpoints live under `/api/projects/`). (2) Deep-link `/{slug}/register` → `/projects/{slug}/register` (Next.js page at `pages/projects/[projectId]/register.tsx`; consistent with existing `/projects/{slug}` routing). (3) Post-auth redirect: `/login?next=` → `/signin?redirect=`, `/signup?next=` → `/signup?redirect=`; `redirect` is the correct param name per `signin.tsx`; adding `redirect` support to `/signup` is now explicitly in scope. (4) `EventParticipant.user` `related_name` `"event_registrations"` → `"event_participations"` (avoids ambiguity with `EventRegistration` model). (5) `EVENT_REGISTRATION` feature toggle added to listing badge, Register button, and modal rendering conditions.
- 2026-03-30 — Backend fully implemented. `EventParticipant` model + migration `0122`. `RegisterForEventView` (`POST /api/projects/{slug}/register/`) with atomic seat locking, idempotency, and FULL-status promotion. `available_seats` added to `EventRegistrationSerializer` (detail only). Celery task + email function using Mailjet template pattern. Env vars `EVENT_REGISTRATION_CONFIRMATION_TEMPLATE_ID` and `_DE` added to `settings.py`. **Email fully localised**: `EventTitle` and `OrganiserName` use `get_project_name()` / `get_organization_name()` to return the translation for the user's language; `EventUrl` is language-aware; `StartDate` is formatted in the user's timezone (resolved via `timezonefinder` from user location → project location → UTC) and language (EN British / DE with German month names and timezone abbreviations). Email function moved to `organization/utility/email.py` alongside all other project/org emails. `timezonefinder` added as a dependency. **Bug fixed**: PostGIS `PointField` stores coordinates as `(lat, lon)` not `(lon, lat)` — `get_timezone_for_point()` correctly passes `lng=point.y, lat=point.x`. **Outstanding**: two Mailjet templates (EN + DE) must be created manually and IDs set in `.backend_env` — see `### Other` for full specification. Frontend implementation not yet started.

## Acceptance Criteria

- [ ] In project/event listing cards (preview), when the `EVENT_REGISTRATION` feature toggle is enabled and `event_registration` is present, a small button is shown next to the project type label, right-aligned, with label and state driven by effective registration status: **"Register now"** (interactive, links to `/projects/{slug}/register`) when `open`; **"Booked out"** (disabled, visual only) when `full`; **"Registration closed"** (disabled, visual only) when `closed`; **no button** when `ended`. No seat count shown in listing cards.
- [ ] On the event detail page, the Follow button is replaced by a "Register" button when the event has registration enabled **and the `EVENT_REGISTRATION` feature toggle is enabled**.
- [ ] When registration is closed (deadline passed, no seats remaining, or manually closed), a disabled "Registration closed" button is shown.
- [ ] A logged-in member can click "Register" and see a confirmation modal with their pre-filled details.
- [ ] An unauthenticated user can click "Register" (button is enabled); inside the modal the "Confirm Registration" button is disabled and the message *"To register for this event please login or sign up!"* is shown with "Log In" and "Sign Up" buttons.
- [ ] After confirming registration, the member sees a success confirmation in the UI.
- [ ] After confirming registration, the member receives a confirmation email (via Mailjet, sent asynchronously).
- [ ] **Email language** — the confirmation email is sent in the user's profile language (set at sign-up). Test with a DE-language user: subject, event title, organiser name (if org has a DE translation), month names, and timezone abbreviation are all in German.
- [ ] **Email content — event title** — `EventTitle` shows the translated name when a translation exists for the user's language; falls back to the original name when no translation exists.
- [ ] **Email content — organiser name** — `OrganiserName` shows the translated organisation name when the organiser is an org with a translation in the user's language; shows the original org name when no translation exists; shows the user's full name (or username) when the organiser is a user.
- [ ] **Email content — start date and timezone** — `StartDate` reflects the correct local time for the event location. Test cases:
  - Event with a location that has GPS coordinates (e.g. a Berlin event): date/time is shown in `Europe/Berlin` time (CET in winter, CEST in summer).
  - User with a location that has GPS coordinates in a different timezone from the event: the **user's** timezone is used (user location takes priority over project location).
  - Online event or event/user with no GPS coordinates: falls back to UTC display.
  - EN user sees British format (`"30 March 2026 at 14:00 (CET)"`); DE user sees German format (`"30. März 2026 um 14:00 Uhr (MEZ)"`).
  - A start date stored at `23:00 UTC` for a CET-timezone event displays as `00:00` the next day (not `01:00` or `02:00`) — verifies the lat/lon coordinate order is handled correctly.
- [ ] **Email content — event URL** — `EventUrl` is language-aware: `/projects/{slug}` for EN users, `/de/projects/{slug}` for DE users.
- [ ] The system stores the registration (new `EventParticipant` record linked to the user and the `EventRegistration`).
- [ ] The available seat count on the event detail page decrements by 1 after a successful registration.
- [ ] Re-registering (same user, same event) does not create a duplicate record — idempotent behaviour.
- [ ] Race conditions on the last seat are handled — no more than `max_participants` registrations can be stored (DB-level constraint or atomic operation).
- [ ] Navigating to `/projects/{slug}/register` opens the registration modal for all users (authenticated and unauthenticated); unauthenticated users see the login/signup prompt inside the modal, and clicking "Log In" links to `/signin?redirect=/projects/{slug}/register` and clicking "Sign Up" links to `/signup?redirect=/projects/{slug}/register` so the modal re-opens after authentication.
- [ ] The `/signup` page accepts a `redirect` query parameter and redirects to it after successful account creation.
- [ ] No breaking changes to existing project/event API contracts.
- [ ] All tests pass (unit, integration, end-to-end).
- [ ] Code review approved.
- [ ] Documentation updated and current.


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

- Confirmation email template (Mailjet): event title, date/time, location, organiser name, and a link back to the event page. Refer to the example design shared in issue #44 comments.
- Post-login redirect: `/projects/{slug}/register` is used as the `redirect` query parameter value — verify this is preserved correctly by the login redirect mechanism (`/signin` already supports `params.redirect`; `/signup` redirect support is added in this task).

## Technical Solution Overview

*To be filled by a development agent during the IMPLEMENTATION phase.*

## Log

- 2026-03-09 09:00 — Task created from GitHub issue #44. Depends on task `20260305_1000_create_event_with_basic_registration` (issue #43) for the `EventRegistration` entity.
- 2026-03-09 09:15 — Confirmed: no seat count in event listings (boolean flag only, for performance). Unregister endpoint removed from this task — will be implemented in a separate dedicated task.
- 2026-03-09 09:30 — Confirmed unauthenticated UX for Case 2: "Register" button on the event page is always enabled (when registration is open); the disabled state + login/signup prompt live inside the registration modal, not on the event page. Post-auth `redirect` URL set to `/projects/{slug}/register` for modal re-open.
- 2026-03-09 09:45 — Confirmed deep-link URL pattern: `/projects/{slug}/register` (consistent with existing `/projects/{slug}` routing; implemented as `pages/projects/[projectId]/register.tsx`). Preferred over `?register=true` query param and `#register` fragment for RESTfulness and redirect stability.
- 2026-03-09 10:00 — Specs approved. Status promoted to READY FOR IMPLEMENTATION.
- 2026-03-25 — Spec aligned with actual implementation from task #43: `is_registration_open` boolean replaced throughout by `status` field (`open`/`closed`/`full`); list endpoint already returns full `event_registration` object (no separate `has_registration` flag needed); `available_seats` and `EventParticipant` confirmed as not yet implemented; `EventRegistrationSerializer` already serializes `status`.
- 2026-03-26 — Corrected against actual codebase: (1) API endpoint `POST /api/events/{slug}/register/` → `POST /api/projects/{slug}/register/` (no `/api/events/` prefix exists; all project endpoints live under `/api/projects/`). (2) Deep-link `/{slug}/register` → `/projects/{slug}/register` (Next.js page at `pages/projects/[projectId]/register.tsx`; consistent with existing `/projects/{slug}` routing). (3) Post-auth redirect: `/login?next=` → `/signin?redirect=`, `/signup?next=` → `/signup?redirect=`; `redirect` is the correct param name per `signin.tsx`; adding `redirect` support to `/signup` is now explicitly in scope. (4) `EventParticipant.user` `related_name` `"event_registrations"` → `"event_participations"` (avoids ambiguity with `EventRegistration` model). (5) `EVENT_REGISTRATION` feature toggle added to listing badge, Register button, and modal rendering conditions.

## Acceptance Criteria

- [ ] In project/event listing cards (preview), when the `EVENT_REGISTRATION` feature toggle is enabled and `event_registration` is present, a small button is shown next to the project type label, right-aligned, with label and state driven by effective registration status: **"Register now"** (interactive, links to `/projects/{slug}/register`) when `open`; **"Booked out"** (disabled, visual only) when `full`; **"Registration closed"** (disabled, visual only) when `closed`; **no button** when `ended`. No seat count shown in listing cards.
- [ ] On the event detail page, the Follow button is replaced by a "Register" button when the event has registration enabled **and the `EVENT_REGISTRATION` feature toggle is enabled**.
- [ ] When registration is closed (deadline passed, no seats remaining, or manually closed), a disabled "Registration closed" button is shown.
- [ ] A logged-in member can click "Register" and see a confirmation modal with their pre-filled details.
- [ ] An unauthenticated user can click "Register" (button is enabled); inside the modal the "Confirm Registration" button is disabled and the message *"To register for this event please login or sign up!"* is shown with "Log In" and "Sign Up" buttons.
- [ ] After confirming registration, the member sees a success confirmation in the UI.
- [ ] After confirming registration, the member receives a confirmation email (via Mailjet, sent asynchronously).
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


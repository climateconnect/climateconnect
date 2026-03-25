1# Member Can Register for an Event

**Status**: READY FOR IMPLEMENTATION (Reference: [`task-based-development.md`](../for-agents/guides/task-based-development.md))
**Type**: Feature
**Date and time created**: 2026-03-09 09:00
**Date Completed**: TBD
**Related GitHub Issue**: #44 - [STORY] Member can register for an event
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
- It is possible to **deep-link directly** to the event registration form via `/{project-slug}/register`. Opening this URL should display the event page with the registration modal/form pre-opened.

**Explicitly Out of Scope (this iteration):**
- Registration for guest users without a platform account.
- Quick signup (one-click registration without a form).
- Registration with additional event-specific information (e.g. dietary preferences, t-shirt size).
- Manually closing registration (organiser management feature — separate story).

### Non Functional Requirements

- Available seat count displayed on the event page must reflect real-time (or near-real-time) registrations to avoid overselling. Race conditions on the last seat must be handled (e.g. database-level constraint or atomic decrement).
- The registration endpoint must be idempotent per user/event pair — re-registering an already-registered member must not create a duplicate record.
- Confirmation email must be sent asynchronously (via Celery + Mailjet) — it must not block the HTTP response.
- The deep-link URL `/{project-slug}/register` must open the registration modal for both authenticated and unauthenticated users. Unauthenticated users will see the modal's login/signup prompt. If the user then clicks "Log In" or "Sign Up", the `next` URL must be set to `/{project-slug}/register` so the modal re-opens after authentication.
- No breaking changes to existing project/event APIs.

### AI Agent Insights and Additions

- A new `EventParticipant` entity (or equivalent join table) is needed to record *who* registered for an event. This was not explicitly named in the story but is implied by "the platform stores who has signed up."
- The seat count shown in listings is explicitly excluded for performance reasons. List endpoints return only a boolean `is_registration_open` flag; full seat details (`available_seats`, `max_participants`) are returned on the event detail endpoint only.
- The `/{project-slug}/register` deep-link needs to handle the post-login redirect carefully: `/{project-slug}/register` is used as the `next` URL so the modal opens after authentication.

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
POST /api/events/{slug}/register/
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

- **Project / event listing cards**: Show a small badge or indicator (e.g. "Registration open") for events where `event_registration` is present and `status === "open"` and `new Date() < registration_end_date`. No seat count for performance reasons (seat count not yet available from the API).
- **Event detail page**:
  - Replace the Follow button with a **"Register"** button when the event has `event_registration` present.
  - When registration is closed (`status === "closed"` or `status === "full"` or `now >= registration_end_date`): render a disabled grey button labelled "Registration closed".
  - When registration is open (`status === "open"` and `now < registration_end_date`): the "Register" button is **always enabled**, regardless of auth state. Clicking it opens the registration modal. Auth state is handled inside the modal (see below).
  - Show available seat count (e.g. "47 seats remaining") on the event detail page — **deferred until `EventParticipant` is implemented** and `available_seats` is returned by the API.
  - Deep-link support: navigating to `/{project-slug}/register` auto-opens the modal on page load (for both authenticated and unauthenticated users; unauthenticated users will see the modal's login/signup prompt).
- **Registration modal**:
  - **Authenticated state**: user's name and email are pre-filled (read-only). Single "Confirm Registration" CTA.
    - On success: show a success state ("You're registered! A confirmation email has been sent.").
    - On error (e.g. race condition — last seat taken): show an error state ("Sorry, registration is now full.").
  - **Unauthenticated state**: "Confirm Registration" button is **disabled**. Show the message: *"To register for this event please login or sign up!"* with two buttons: **"Log In"** (links to `/login?next=/{project-slug}/register`) and **"Sign Up"** (links to `/signup?next=/{project-slug}/register`). After successful authentication the user is returned to `/{project-slug}/register` and the modal opens.

### Backend

- **`EventParticipant` model** (new — to be implemented in this task):
  ```python
  class EventParticipant(models.Model):
      user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="event_registrations")
      event_registration = models.ForeignKey(EventRegistration, on_delete=models.CASCADE, related_name="participants")
      registered_at = models.DateTimeField(auto_now_add=True)

      class Meta:
          unique_together = [("user", "event_registration")]
  ```
- **`EventRegistration` model** (already implemented): has `status` field (`open` / `closed` / `full`), `max_participants`, `registration_end_date`. The "is registration open?" check is `status == OPEN AND now() < registration_end_date` — no separate boolean field exists.
- **`EventRegistrationViewSet`** (new): handles `POST /api/events/{slug}/register/`.
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
- Post-login redirect: `/{project-slug}/register` is used as the `next` URL — verify this is preserved correctly by the existing login redirect mechanism.

## Technical Solution Overview

*To be filled by a development agent during the IMPLEMENTATION phase.*

## Log

- 2026-03-09 09:00 — Task created from GitHub issue #44. Depends on task `20260305_1000_create_event_with_basic_registration` (issue #43) for the `EventRegistration` entity.
- 2026-03-09 09:15 — Confirmed: no seat count in event listings (boolean flag only, for performance). Unregister endpoint removed from this task — will be implemented in a separate dedicated task.
- 2026-03-09 09:30 — Confirmed unauthenticated UX for Case 2: "Register" button on the event page is always enabled (when registration is open); the disabled state + login/signup prompt live inside the registration modal, not on the event page. `next` URL set to `/{project-slug}/register` for post-auth modal re-open.
- 2026-03-09 09:45 — Confirmed deep-link URL pattern: `/{project-slug}/register` (preferred over `?register=true` query param and `#register` fragment for RESTfulness, redirect stability, and alignment with the API route pattern).
- 2026-03-09 10:00 — Specs approved. Status promoted to READY FOR IMPLEMENTATION.
- 2026-03-25 — Spec aligned with actual implementation from task #43: `is_registration_open` boolean replaced throughout by `status` field (`open`/`closed`/`full`); list endpoint already returns full `event_registration` object (no separate `has_registration` flag needed); `available_seats` and `EventParticipant` confirmed as not yet implemented; `EventRegistrationSerializer` already serializes `status`.

## Acceptance Criteria

- [ ] In project/event listing views, events with open registration show a visual indicator (e.g. badge "Registration open"). No seat count shown in listings for performance.
- [ ] On the event detail page, the Follow button is replaced by a "Register" button when the event has registration enabled.
- [ ] When registration is closed (deadline passed, no seats remaining, or manually closed), a disabled "Registration closed" button is shown.
- [ ] A logged-in member can click "Register" and see a confirmation modal with their pre-filled details.
- [ ] An unauthenticated user can click "Register" (button is enabled); inside the modal the "Confirm Registration" button is disabled and the message *"To register for this event please login or sign up!"* is shown with "Log In" and "Sign Up" buttons.
- [ ] After confirming registration, the member sees a success confirmation in the UI.
- [ ] After confirming registration, the member receives a confirmation email (via Mailjet, sent asynchronously).
- [ ] The system stores the registration (new `EventParticipant` record linked to the user and the `EventRegistration`).
- [ ] The available seat count on the event detail page decrements by 1 after a successful registration.
- [ ] Re-registering (same user, same event) does not create a duplicate record — idempotent behaviour.
- [ ] Race conditions on the last seat are handled — no more than `max_participants` registrations can be stored (DB-level constraint or atomic operation).
- [ ] Navigating to `/{project-slug}/register` opens the registration modal for all users (authenticated and unauthenticated); unauthenticated users see the login/signup prompt inside the modal, and clicking "Log In"/"Sign Up" sets `next=/{project-slug}/register` so the modal re-opens after authentication.
- [ ] No breaking changes to existing project/event API contracts.
- [ ] All tests pass (unit, integration, end-to-end).
- [ ] Code review approved.
- [ ] Documentation updated and current.


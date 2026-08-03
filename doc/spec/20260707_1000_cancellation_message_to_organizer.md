# Allow User to Provide a Message When Canceling an Event Registration

**Date**: 2026-07-07
**Status**: DRAFT — implemented on branch `canceling-message-for-an-event` with deviations (see *Implementation Decisions & Deviations*)
**Type**: Backend + Frontend — new feature
**GitHub Issue**: [#2102](https://github.com/climateconnect/climateconnect/issues/2102)

---

## Problem Statement

When a registered attendee cancels their event registration, the organizer receives a notification email
(via `send_admin_event_notification`) but has no insight into *why* the cancellation occurred. Attendees
may want to explain their cancellation — a scheduling conflict, a question, an apology — but there is
currently no mechanism to do so. The organizer cannot see a reason in the guest list, in a chat, or in
a CSV export.

Additionally, chat messages that are initiated from a contextual entry-point (e.g. a project page contact
button) arrive in the inbox with no indication of what the sender's original context was, making it
harder for organisers to triage messages.

### Why it matters

- **Organizer context**: Knowing why a guest cancelled helps organisers manage capacity, plan follow-ups,
  and improve future events.
- **Guest comfort**: Guests benefit from being able to explain themselves or ask a final question as part
  of the same cancellation action, without having to navigate to a separate chat.
- **Auditability**: Storing the reason on the registration row keeps the guest list as the single source
  of truth and makes it available in CSV exports.
- **Reusable context tagging**: The `origin_type` / `origin_id` mechanism proposed in this issue benefits
  all context-initiated chats (project page contact, future hub/organisation outreach, etc.).

### Current state

- `DELETE /api/projects/{slug}/registrations/` performs a soft-delete with no optional body.
- `CancelRegistrationModal` (frontend) shows a simple confirmation dialog with no message input.
- `EventRegistration` has no `cancellation_reason` field.
- `Message` has no `origin_type` / `origin_id` fields; all messages appear in the chat without context.
- The organiser guest list (`ProjectRegistrationsContent`) has no cancellation reason column or export.

---

## Scope

### In scope

1. **Backend**: Add `cancellation_reason` to `EventRegistration` — stored when the user provides a
   message at cancellation time.
2. **Backend**: Add `origin_type` / `origin_id` to the `Message` model for generic context-tagging.
3. **Backend**: Extend `DELETE /api/projects/{slug}/registrations/` to accept an optional `message` body
   field: store it as `cancellation_reason`, then asynchronously send it as a private chat message to the
   event organizer, tagged with the origin fields.
4. **Backend**: Expose `cancellation_reason` through `EventRegistrationSerializer` and
   `origin_type` / `origin_id` through `MessageSerializer`.
5. **Frontend**: Update `CancelRegistrationModal` to include an optional message text area and pass it in
   the DELETE request body.
6. **Frontend**: Render a context banner in the chat view when a message has
   `origin_type = "event_registration"`.
   7. **Frontend**: Include `cancellation_reason` in the organiser's guest list CSV export (via a hidden
    DataGrid column) and surface it in the per-registration detail (`ViewRegistrationAnswersModal`). No
    *visible* grid column is added — see *Implementation Decisions & Deviations*.

### Out of scope

- Sending a chat message when an admin/organiser cancels a guest registration — that flow already has its
  own optional message field (`CancelGuestRegistrationModal`) delivered by email; chat integration for
  that direction is a separate consideration.
- Rich-text formatting in the cancellation message (plain text only, matching existing `Message.content`).
- Translating the chat context banner text on the backend — it is rendered client-side with i18n keys.
- Support for `origin_type` values other than `"event_registration"` in the frontend banner — the other
  values (`"project"`, `"organization"`, `"hub"`) are reserved for future use.
- Any change to the WebSocket consumer (`consumer.py`) for sending messages — the Celery task uses the
  REST path via Django ORM directly.

---

## System Impact

### Actors Involved

- **Backend Developer** (Phases 1–3): model changes, migrations, serializer updates, DELETE view
  extension, Celery task for chat message dispatch.
- **Frontend Developer** (Phases 4–6): `CancelRegistrationModal` update, chat context banner, guest
  list column and CSV.

### Entities Changed

| Layer | File | Change |
|-------|------|--------|
| Backend model | `backend/organization/models/event_registration.py` | Add `cancellation_reason` to `EventRegistration` |
| Backend migration | `backend/organization/migrations/0143_eventregistration_cancellation_reason.py` (new) | Add `cancellation_reason` column |
| Backend model | `backend/chat_messages/models/message.py` | Add `origin_type` and `origin_id` to `Message` |
| Backend migration | `backend/chat_messages/migrations/0019_message_origin_fields.py` (new) | Add `origin_type` and `origin_id` columns |
| Backend view | `backend/organization/views/event_registration_views.py` | Extend `EventRegistrationsView.delete()` to read optional `message`, store `cancellation_reason`, and dispatch Celery task |
| Backend task | `backend/organization/tasks.py` | New `send_cancellation_chat_message` Celery task |
| Backend serializer | `backend/organization/serializers/event_registration.py` | Add `cancellation_reason` to `EventRegistrationSerializer` |
| Backend serializer | `backend/chat_messages/serializers/` | Add `origin_type`, `origin_id` to `MessageSerializer` |
| Backend URL | `backend/climateconnect_main/urls.py` or `backend/chat_messages/urls.py` | New `GET /api/event-registration-origin/{registration_id}/` endpoint |
| Frontend component | `frontend/src/components/project/CancelRegistrationModal.tsx` | Add optional message `<TextField>` and include `message` in DELETE payload |
| Frontend pages/components | `frontend/pages/chat/[chatUUID].tsx` + message rendering component | Render context banner when `origin_type` is set on a message |
| Frontend component | `frontend/src/components/project/ProjectRegistrationsContent.tsx` | Add `cancellation_reason` DataGrid column and CSV field |
| Frontend types | `frontend/src/types.ts` | Add `cancellation_reason` to `EventRegistration` type; add `origin_type`/`origin_id` to message type |
| Frontend i18n | `frontend/public/texts/project_texts.tsx` | New i18n keys (see AC-4.5 and AC-6.4) |
| Frontend i18n | `frontend/public/texts/` (chat texts) | New i18n key for chat context banner (see AC-5.6) |

### Flows not affected

- `CancelGuestRegistrationModal` (admin cancelling a guest) — no change; email delivery path is
  unchanged.
- All existing message creation paths (`SendChatMessage` view, WebSocket consumer) — `origin_type` and
  `origin_id` default to `""` / `NULL` and are never required by existing callers.
- Registration CSV export columns for custom registration fields — only a new `cancellation_reason`
  column is appended; existing column order is unchanged.
- Seat counting, FULL → OPEN revert logic, admin notification emails — no change.

---

## Acceptance Criteria

### AC-1: Backend — `EventRegistration.cancellation_reason`

**AC-1.1** `EventRegistration` gains a new nullable `TextField` named `cancellation_reason` (`null=True`, `blank=True`, `default=None`). Existing rows default to `NULL`. No backfill required.

**AC-1.2** Migration `0143_eventregistration_cancellation_reason` adds the column. It is purely additive
— no other columns are changed.

**AC-1.3** On re-registration (`DELETE` followed by a new `POST`), `cancellation_reason` is **not**
reset. It remains as a permanent record of why the guest last cancelled. If the user re-registers and
then cancels again without a message, `cancellation_reason` keeps the previous value (overwrite only
happens when a new non-empty reason is provided).

---

### AC-2: Backend — `Message` origin-tagging fields

**AC-2.1** `Message` gains two new fields: `origin_type` — a `CharField(max_length=32, blank=True, default="")` whose valid values are `""` (no context), `"project"`, `"event_registration"`, `"organization"`, and `"hub"`; and `origin_id` — a nullable `PositiveIntegerField` holding the PK of the origin entity identified by `origin_type`.

**AC-2.2** Migration `0019_message_origin_fields` adds both columns to `chat_messages_message`.
Existing rows default to `""` / `NULL` — no backfill required.

**AC-2.3** All existing message creation paths (`SendChatMessage`, WebSocket consumer, Celery tasks) are
unaffected. The new fields are optional everywhere.

**AC-2.4** `MessageSerializer` (read path) exposes `origin_type` and `origin_id` so the frontend can
render the context banner. These fields are **read-only** in the serializer — they cannot be set by
unauthenticated callers via the existing `SendChatMessage` endpoint.

---

### AC-3: Backend — DELETE endpoint extension and chat message dispatch

**AC-3.1** `DELETE /api/projects/{url_slug}/registrations/` accepts an optional `message` field in the
request body (plain-text string). If absent or empty after stripping, current behaviour is unchanged.
If `len(message) > 1000`, return **400 Bad Request** with `{"message": "Message must be 1000 characters
or fewer."}` before performing the cancellation.

**AC-3.2** When a non-empty `message` is provided and validation passes:
1. `reg.cancellation_reason` is set to the stripped message text before `reg.save()` (inside the
   `@transaction.atomic` block — stored atomically with the soft-delete).
2. After the transaction commits, `transaction.on_commit` schedules the Celery task
   `send_cancellation_chat_message.delay(guest_user_id, project_url_slug, registration_id, message)`.
3. If Celery dispatch itself raises (e.g. broker unavailable), log the error at `ERROR` level but still
   return **204 No Content** — the cancellation is already committed.

**AC-3.3** New Celery task `send_cancellation_chat_message(guest_user_id, project_url_slug, registration_id, message)` in `backend/organization/tasks.py`, decorated with `@app.task(bind=True, max_retries=3, default_retry_delay=60)`. Steps:
1. Fetch `guest_user`, `project` (with `select_related("loc", "language")` and the standard organiser
   prefetch chain). Return early with a warning log if either is not found.
2. Determine the event organizer using the existing `get_project_admin_creators(project)` utility
   (returns `[User, ...]` ordered by role). Use the **first** result as the organizer. If the list is
   empty, log a warning and return without error.
3. Find or create the private chat between `guest_user` and the organizer. Reuse the exact chat-lookup
   logic from `StartPrivateChat.post()` (extract into a shared utility function if not already done):
   - Look for an existing two-participant private chat (no group name, no `related_idea`) shared by
     both users.
   - If none exists, create a new `MessageParticipants` with `chat_uuid=uuid4()` and
     `Participant` rows for both users using the basic `Role` (role_type=0).
4. Create a `Message` record with `content=message`, `sender=guest_user`, `origin_type="event_registration"`, `origin_id=registration_id`, and `sent_at=timezone.now()`.
5. Create a `MessageReceiver` for the organizer.
6. Call `create_chat_message_notification(chat)` to create the `Notification` record.
7. Call `create_user_notification(organizer, notification)` and
   `create_email_notification(organizer, chat, message, guest_user, notification)` to deliver in-app and
   email notifications.
8. On any unhandled exception, retry via `self.retry(exc=exc)`.

**AC-3.4** New read-only endpoint `GET /api/event-registration-origin/{registration_id}/`:
- Authentication required (401 if unauthenticated).
- Returns `{"event_name": "...", "event_url_slug": "..."}` so the frontend can render the chat banner
  link without embedding project data in the `Message` response.
- Authorization: the requesting user must be a `Participant` of a chat that contains a message with
  `origin_type = "event_registration"` and `origin_id = registration_id` **or** must be a project admin
  of the related event. Return 403 otherwise.
- Returns 404 if the registration ID does not exist.

**AC-3.5** Backend tests cover (use `--keepdb`; set `CELERY_TASK_ALWAYS_EAGER = True` for task tests):
- `DELETE` with no body still cancels and returns 204 — `cancellation_reason` remains `NULL`.
- `DELETE` with `{"message": "..."}` stores `cancellation_reason` on the row.
- `DELETE` with a message exceeding 1 000 chars returns 400; registration is not cancelled.
- `send_cancellation_chat_message` task: a `Message` row is created with correct `origin_type`,
  `origin_id`, `sender`, and `content`.
- `send_cancellation_chat_message` task: existing private chat is reused (no duplicate chat created on
  second invocation).
- `GET /api/event-registration-origin/{id}/` returns correct `event_name`/`event_url_slug` for an
  authorised participant and 403 for an unrelated user.

---

### AC-4: Frontend — `CancelRegistrationModal`

**AC-4.1** `CancelRegistrationModal` is extended with an optional `<TextField multiline rows={3}>` for
the cancellation message, placed between the confirmation text and the action buttons. It is always
rendered (not conditional on any prop), visually separated from the confirmation text by `theme.spacing(2)`.

**AC-4.2** The text field:
- Label / placeholder uses an i18n key (see AC-4.5).
- Is not required — the user may proceed without filling it in.
- Enforces `inputProps={{ maxLength: 1000 }}` to match the backend cap.
- Is disabled while `loading === true`.
- Resets to `""` when the modal is closed or reopened (`useEffect` on `open` prop, matching the pattern
  in `CancelGuestRegistrationModal`).

**AC-4.3** `handleConfirm` sends the DELETE request with `payload: trimmedMessage ? { message: trimmedMessage } : {}` using the existing `apiRequest` utility. No change to the success or error path.

**AC-4.4** Loading and error states, button labels, and `onCancellationSuccess` callback are unchanged.

**AC-4.5** New i18n keys in `frontend/public/texts/project_texts.tsx`:

| Key | English | German |
|-----|---------|--------|
| `cancellation_message_to_organizer_label` | Message to organizer (optional) | Nachricht an den Veranstalter (optional) |
| `cancellation_message_to_organizer_placeholder` | Tell the organizer why you're cancelling… | Erkläre dem Veranstalter, warum du absagst… |

---

### AC-5: Frontend — Chat context banner

**AC-5.1** When a message returned from `GET /api/chat/{uuid}/` has `origin_type = "event_registration"`
and a non-zero `origin_id`, render a small context banner **below** the message bubble content. The
banner:
- Fetches `GET /api/event-registration-origin/{origin_id}/` to resolve the event name and URL slug.
  Fetch on first render; cache the result in component state so it is not re-fetched for the same
  `origin_id` within the same chat session.
- Displays: *"This message is about the registration for [Event Name]"* — where `[Event Name]` is a
  `<Link>` navigating to `/projects/{event_url_slug}`.
- Uses the i18n key from AC-5.6.

**AC-5.2** The banner is shown for **all chat participants** (both sender and recipient). The sender
already knows the context, but showing it keeps the thread self-explanatory if reviewed later.

**AC-5.3** If the fetch to `/api/event-registration-origin/{id}/` fails (404, 403, network error), the
banner is silently omitted — no error is surfaced to the user, and a `console.warn` is emitted.

**AC-5.4** If `origin_type` is set to any other value (e.g. `"project"`, `"organization"`, `"hub"`), the
banner slot is left empty (no rendering, no crash). These origin types are reserved for future use.

**AC-5.5** The banner is styled as:
- MUI `<Typography variant="caption">` inside a `<Box>` with a subtle background
  (`theme.palette.grey[100]`) and `borderRadius: 1`.
- A `<LinkIcon fontSize="inherit">` or `<EventIcon fontSize="inherit">` precedes the text.
- On mobile, the banner wraps correctly and does not overflow the message bubble.

**AC-5.6** New i18n key (add to the chat-specific text file or `project_texts.tsx` as appropriate):

| Key | English | German |
|-----|---------|--------|
| `chat_message_origin_event_registration` | This message is about the registration for {event_name} | Diese Nachricht betrifft die Anmeldung für {event_name} |

---

### AC-6: Frontend — Organiser guest list

**AC-6.1** The organiser's guest list does **not** get a *visible* `Cancellation reason` DataGrid
column. Instead the reason is carried by a **hidden** `cancellation_reason` column that exists purely to
feed the CSV export:
- `field: "cancellation_reason"`, `width: 0`, `sortable: false`, `filterable: false`,
  `disableColumnMenu: true`.
- Hidden by default (`columnVisibilityModel` initial value sets `cancellation_reason` to `false`).
- `valueGetter`: returns `row.cancellation_reason ?? ""`. Null/empty reasons render as an empty cell
  (no `—` placeholder) — the value is only meaningful in the CSV export and the detail modal (AC-6.5).
- The eye/"view answers" icon in the actions column is shown whenever a registration has a
  `cancellation_reason` (in addition to having custom-field answers), so organisers can open the detail
  for cancelled registrations that carry a reason.

**AC-6.2** CSV export includes `cancellation_reason`. The exported column header uses the i18n key from
AC-6.4. An empty / null reason exports as an empty string (not `"null"` or `"undefined"`).

**AC-6.3** `EventRegistrationSerializer` (AC-3 above) already serialises `cancellation_reason`. The frontend `EventRegistration` type in `frontend/src/types.ts` and the local row type in `ProjectRegistrationsContent.tsx` both gain a `cancellation_reason: string | null` field.

**AC-6.4** New i18n keys in `frontend/public/texts/project_texts.tsx`:

| Key | English | German |
|-----|---------|--------|
| `cancellation_reason` | Cancellation reason | Stornierungsgrund |

**AC-6.5** The per-registration detail modal (`ViewRegistrationAnswersModal`) surfaces the reason for
cancelled registrations. When `registration.cancelled_at` is set and `registration.cancellation_reason`
is present, the cancelled-alert shows the reason beneath the existing notice, using the `cancellation_reason`
i18n key as a label (see AC-6.4). This is the primary place an organiser reads *why* a guest cancelled;
the hidden grid column (AC-6.1) only exists to support CSV export. The `ViewRegistrationAnswersModal`
registration type gains an optional `cancellation_reason: string | null` field.

---

## Implementation Decisions & Deviations

This section records decisions made during implementation that differ from the original acceptance
criteria, for traceability. Specs are working documents; these deviations were validated manually.

- **No visible grid column for the cancellation reason (deviation from original AC-6.1).** The original
  spec described a visible `Cancellation reason` DataGrid column at `width: 200` that could be toggled via
  the column-visibility panel and rendered `—` for empty values. During implementation it was decided the
  reason should not be shown inline in the grid. The final behaviour:
  1. A **hidden** `cancellation_reason` column (`width: 0`) exists only to feed the CSV export.
  2. The reason is shown to organisers in the **per-registration detail** (`ViewRegistrationAnswersModal`,
     AC-6.5) when a cancelled registration carries one.
  This keeps the guest list compact while still making the reason available both interactively and via
  export.

- Additional review findings (Celery-retry notification idempotency, `MessageSerializer` read-only
  origin fields, API/domain documentation updates) are tracked separately and discussed after this
  implementation pass.

---

## Documentation to Update

- `doc/api-documentation.md`:
  - Update `DELETE /api/projects/{slug}/registrations/` section to document the optional `message`
    request body field and the 400 error for messages exceeding 1 000 chars.
  - Add a new section for `GET /api/event-registration-origin/{registration_id}/`.
- `doc/domain-entities.md`:
  - Update `EventRegistration` fields table to add `cancellation_reason`.
  - Update `Message` fields table to add `origin_type`, `origin_id`.
- `doc/mosy/entities/system-entities.md`:
  - Update `EventRegistration` and `Message` entries accordingly.

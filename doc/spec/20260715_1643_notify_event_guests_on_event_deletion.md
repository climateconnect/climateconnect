# Notify Event Guests When Event Is Being Deleted

**Date**: 2026-07-15
**Status**: DRAFT
**Type**: Backend + Frontend — new feature
**GitHub Issue**: [#1985](https://github.com/climateconnect/climateconnect/issues/1985)

---

## Problem Statement

When a project admin deletes an event that has registered guests, the project is silently
hard-deleted via `project.delete()` (`ProjectAPIView.delete()` at
`backend/organization/views/project_views.py:1275`). Django CASCADE then removes all
`EventRegistration` rows, `EventRegistrationConfig`, `ProjectMember`, followers, and related
data — with no notification whatsoever to the registered guests.

**Why it matters**:

- **Guest awareness**: Registered guests may have blocked their calendar, arranged travel,
  or made other commitments. A silent deletion leaves them unaware until they try to attend
  a non-existent event.
- **Admin accountability**: Admins should understand the blast radius of deleting an event
  with registrations, rather than unknowingly orphaning N guests.
- **Platform trust**: Users who registered for an event expect the platform to keep them
  informed. Silent deletion erodes trust.

### Current state

- `DELETE /api/projects/{url_slug}/` calls `project.delete()` with zero pre-delete logic.
- The `ConfirmDialog` in `EditProjectRoot.tsx` shows a generic "your project will be lost"
  message with no event-specific context.
- No email template exists for "event deleted" notifications.
- The `pre_delete` signal in `organization/signals.py` only updates the parent's
  `has_children` flag.
- `EventRegistrationConfig` already tracks registrations via the reverse relation
  `registrations` (filterable by `cancelled_at__isnull=True`).
- The `EventRegistrationConfigSerializer` already computes `available_seats` from active
  registration counts, so the infrastructure for counting registrations exists.

---

## Scope

### In scope

1. **Backend**: Return active registration count in the project data so the frontend can
   warn the admin before deletion.
2. **Backend**: Before deleting an event with active registrations, dispatch an async Celery
   task that sends cancellation emails to all active registrants, then performs the hard
   delete.
3. **Backend**: New email utility function and Mailjet template (EN + DE) for "event deleted"
   guest notifications.
4. **Frontend**: Enhanced delete confirmation dialog for events with registered guests,
   showing the registration count and explaining that guests will be notified.
5. **Backend + Frontend**: i18n keys for the warning dialog and email subjects.

### Out of scope

- Soft-delete of projects (the project is still hard-deleted; only the notification
  mechanism is new).
- Notifying project *followers* (only registered event guests are in scope).
- Notifying guests of sub-events when a parent event/festival is deleted (sub-events are
  cascade-deleted by Django; each sub-event's own registrations are not individually
  notified — this is a separate consideration for the sub-event feature).
- Chat messages to guests about the deletion (the notification is email-only, matching the
  existing event email pattern).
- Any change to the project deletion itself beyond sequencing (the project still ends up
  hard-deleted).

---

## System Impact

### Actors Involved

- **Backend Developer** (Phases 1–3): model annotation, Celery task, email utility, delete
  view refactor, Mailjet template settings, tests.
- **Frontend Developer** (Phase 4): enhanced `ConfirmDialog` in `EditProjectRoot`, i18n
  keys, conditional warning rendering.

### Entities Changed

| Layer | File | Change |
|-------|------|--------|
| Backend view | `backend/organization/views/project_views.py` | Refactor `ProjectAPIView.delete()` to check for active registrations, dispatch Celery task, and let the task handle both email + deletion |
| Backend task | `backend/organization/tasks.py` | New `send_event_deletion_notifications_and_delete` Celery task |
| Backend email | `backend/organization/utility/email.py` | New `send_event_deleted_notification_to_guest` function |
| Backend settings | `backend/climateconnect_main/settings.py` | New `EVENT_DELETED_GUEST_NOTIFICATION_TEMPLATE_ID` + `_DE` env vars |
| Backend serializer | `backend/organization/serializers/project.py` | Add `active_registrations_count` field to the project serializer used by the edit page |
| Backend tests | `backend/organization/tests/test_project_views.py` | New tests for the delete-with-registrations flow |
| Backend tests | `backend/organization/tests/test_tasks.py` (new or existing) | Tests for the Celery task |
| Frontend component | `frontend/src/components/editProject/EditProjectRoot.tsx` | Conditional delete warning with registration count |
| Frontend component | `frontend/src/components/dialogs/ConfirmDialog.tsx` | No structural change — `text` prop already accepts `string | object` |
| Frontend i18n | `frontend/public/texts/project_texts.tsx` | New i18n keys for the enhanced delete warning |

### Flows not affected

- Registration self-cancellation (`DELETE /api/projects/{slug}/registrations/`) — no change.
- Admin guest cancellation (`PATCH /api/projects/{slug}/registrations/{id}/`) — no change.
- Registration confirmation email — no change.
- Project create/update flows — no change.
- Browse page, project detail page — no change.
- `pre_delete` signal (parent `has_children` update) — still fires; unaffected.

---

## Domain Context

- **Event registration model**: `EventRegistration` has a FK to `EventRegistrationConfig`
  (which has a OneToOne to `Project`). Active registrations are those with
  `cancelled_at__isnull=True`. The `registration_config` reverse relation from
  `EventRegistrationConfig` provides `registrations` for counting/querying.
- **Project types**: Events are `project_type == "EV"`. Only events can have
  `EventRegistrationConfig`. Non-event projects (ideas, regular projects) have no
  registrations and their deletion flow is unchanged.
- **Email infrastructure**: All event emails use Mailjet templates resolved via
  `get_template_id()` in `email_setup.py`. Template IDs are Django settings loaded from
  environment variables. Every template has an EN and `_DE` variant. The `send_email()`
  utility handles language resolution, Mailjet API call, and `EmailNotification` record
  creation.
- **Celery pattern**: Async email tasks in `organization/tasks.py` use
  `@app.task(bind=True, max_retries=3, default_retry_delay=60)` and are dispatched via
  `.delay()` from views wrapped in `transaction.on_commit()`.
- **Frontend project data**: `EditProjectRoot` loads the full project data including
  `registration_config` via the project detail API. The serializer context includes
  `include_seat_count=True` for the detail path (see `EventRegistrationConfigSerializer`).

---

## Acceptance Criteria

### AC-1: Backend — Expose active registration count

**AC-1.1** The project detail serializer (the one used by the edit page) includes an
`active_registrations_count` field. This field is an integer representing the count of
`EventRegistration` rows where `cancelled_at__isnull=True` for the project's
`registration_config`. For projects without a `registration_config`, the field is `0`.

**AC-1.2** The field is **read-only** and computed (analogous to `available_seats` on
`EventRegistrationConfigSerializer`). It is included on the project detail response so the
edit page can read it without an additional API call.

**AC-1.3** The field is annotated efficiently — a single `Count` annotation or
`prefetch_related`-backed computation, not an N+1 query.

---

### AC-2: Backend — Refactored delete flow with guest notification

**AC-2.1** When the admin sends `DELETE /api/projects/{url_slug}/` and the project is an
event (`project_type == "EV"`) with an `EventRegistrationConfig` that has active
registrations:

1. The view collects the following data **before** scheduling the task:
   - `project_id` (int)
   - A list of `{ user_id, event_name }` for every active registrant. `event_name` is
     resolved per-user in their language via `get_project_name(project, lang_code)`.
     `user_id` is sufficient because the task fetches the full `User` object internally
     (matching the existing `send_organizer_message_to_guests` pattern).
2. The view schedules a Celery task
   `send_event_deletion_notifications_and_delete.delay(project_id, url_slug, guest_data)`
   wrapped in `transaction.on_commit()`.
3. The view returns `202 Accepted` with
   `{"message": "Event deletion initiated. Registered guests will be notified.",
     "url_slug": url_slug, "notified_guests": len(guest_data)}`.
4. The project is **not** deleted in the view — the Celery task handles deletion after
   sending emails.

**AC-2.2** When the project is an event with a `registration_config` but **zero** active
registrations, or when the project is not an event, the current behavior is preserved:
`project.delete()` is called directly and `200 OK` is returned with the existing success
message.

**AC-2.3** If the Celery task fails (broker down, unhandled exception after retries), the
project remains in the database. The admin can retry the delete. A log at `ERROR` level
records the failure.

---

### AC-3: Backend — Celery task for email + deletion

**AC-3.1** New Celery task `send_event_deletion_notifications_and_delete(self, project_id,
url_slug, guest_data)` in `backend/organization/tasks.py`, decorated with
`@app.task(bind=True, max_retries=3, default_retry_delay=60)`.

**AC-3.2** Task steps:
1. For each entry in `guest_data` (list of dicts with `user_id`, `first_name`, `email`,
   `lang_code`, `event_name`):
   a. Build email variables: `FirstName`, `EventTitle`, `EventUrl` (language-aware project
      URL — will 404 after deletion, but the email serves as the notification).
   b. Call `send_event_deleted_notification_to_guest(user, variables)`.
   c. Wrap each email send in try/except; on failure, log a warning and continue to the
      next guest (do not abort the whole batch for one email failure).
2. After all emails are dispatched, attempt `Project.objects.filter(pk=project_id).delete()`.
   If the project was already deleted (e.g. admin retried), log a warning and return.
3. On any unhandled exception in step 2 (not per-email failures), retry via
   `self.retry(exc=exc)`.

**AC-3.3** The task fetches `User` objects inside the loop using `user_id` with
`select_related("user_profile__location")` (matching the pattern of existing email tasks).
The `email` field from `guest_data` is not used for sending (Mailjet uses the `user`
object), but is included for logging/debugging.

**AC-3.4** Backend tests (use `--keepdb`; set `CELERY_TASK_ALWAYS_EAGER = True`):
- Deleting an event with 3 active registrations dispatches the Celery task and returns
  202 with `notified_guests: 3`.
- Deleting an event with no active registrations (or a non-event project) still calls
  `project.delete()` directly and returns 200.
- The Celery task sends an email for each guest (assert via `EmailNotification` count or
  mocked Mailjet call).
- The Celery task deletes the project after emails are sent.
- A guest email failure does not prevent other emails or the project deletion.

---

### AC-4: Backend — Email utility and template

**AC-4.1** New function `send_event_deleted_notification_to_guest(user, variables)` in
`backend/organization/utility/email.py`. Signature follows the pattern of
`send_guest_cancellation_notification`:
- `user`: Django `User` instance (for language resolution and `send_email`).
- `variables`: dict with keys `FirstName`, `EventTitle`, `EventUrl`.
- Calls `send_email()` with `template_key="EVENT_DELETED_GUEST_NOTIFICATION_TEMPLATE_ID"`,
  `should_send_email_setting=""` (always send — this is critical notification),
  `notification=None`.

**AC-4.2** Email subjects by language:
- EN: `"The event {event_name} has been cancelled"`
- DE: `"Die Veranstaltung {event_name} wurde abgesagt"`

**AC-4.3** New environment variables in `backend/climateconnect_main/settings.py`:
```
EVENT_DELETED_GUEST_NOTIFICATION_TEMPLATE_ID = env("EVENT_DELETED_GUEST_NOTIFICATION_TEMPLATE_ID", "")
EVENT_DELETED_GUEST_NOTIFICATION_TEMPLATE_ID_DE = env("EVENT_DELETED_GUEST_NOTIFICATION_TEMPLATE_ID_DE", "")
```

**AC-4.4** New Mailjet templates must be created (EN + DE) with the following variables:
`FirstName`, `EventTitle`, `EventUrl`. The template content should convey that the event
has been cancelled by the organizer and the guest's registration is no longer valid.
Template creation is a manual step (Mailjet dashboard) and is tracked as a prerequisite
for deployment.

---

### AC-5: Frontend — Enhanced delete confirmation for events with registrations

**AC-5.1** In `EditProjectRoot.tsx`, when the project is an event (`project_type.type_id ===
"event"`) and `project.active_registrations_count > 0`, the `ConfirmDialog` uses enhanced
text:

- **Title** (i18n key `delete_event_with_registrations_title`):
  EN: `"Delete event with registered guests?"`
  DE: `"Veranstaltung mit angemeldeten Gästen löschen?"`

- **Body** (i18n key `delete_event_with_registrations_text`):
  EN: `"This event has {count} registered guest(s). If you delete this event, all registered guests will be notified by email that the event has been cancelled. Are you sure?"`
  DE: `"Diese Veranstaltung hat {count} angemeldete Gäst(e). Wenn du diese Veranstaltung löschchst, werden alle angemeldeten Gäste per E-Mail darüber informiert, dass die Veranstaltung abgesagt wurde. Bist du dir sicher?"`

  `{count}` is replaced with `project.active_registrations_count`.

**AC-5.2** When the project is an event but `active_registrations_count === 0`, or when the
project is not an event, the existing generic delete dialog text is shown (no change to
current behavior).

**AC-5.3** The `deleteProject` function handles both response codes:
- `200 OK` (immediate delete, no registrations): current behavior — redirect to profile
  with success toast.
- `202 Accepted` (async delete with notifications): redirect to profile with a different
  success toast (i18n key `event_deleted_guests_notified`):
  EN: `"Your event has been deleted. Registered guests have been notified."`
  DE: `"Deine Veranstaltung wurde gelöscht. Angemeldete Gäste wurden benachrichtigt."`

**AC-5.4** New i18n keys in `frontend/public/texts/project_texts.tsx`:

| Key | English | German |
|-----|---------|--------|
| `delete_event_with_registrations_title` | Delete event with registered guests? | Veranstaltung mit angemeldeten Gästen löschen? |
| `delete_event_with_registrations_text` | This event has {count} registered guest(s). If you delete this event, all registered guests will be notified by email that the event has been cancelled. Are you sure? | Diese Veranstaltung hat {count} angemeldete Gäst(e). Wenn du diese Veranstaltung löschst, werden alle angemeldeten Gäste per E-Mail darüber informiert, dass die Veranstaltung abgesagt wurde. Bist du dir sicher? |
| `event_deleted_guests_notified` | Your event has been deleted. Registered guests have been notified. | Deine Veranstaltung wurde gelöscht. Angemeldete Gäste wurden benachrichtigt. |

---

## AI Insights

### Implementation Hints

- **Pre-captured data for Celery**: The `guest_data` list is built in the view before
  scheduling the task. This avoids a race condition where the task tries to fetch the
  project after it has been deleted. Each entry contains the minimum data needed to
  personalise the email. The `User` object is still fetched inside the task (by `user_id`)
  because `send_email()` requires a full `User` instance for language resolution and
  Mailjet delivery.

- **Serializer field location**: `active_registrations_count` should be added to the
  project serializer that serves the edit page detail view. Check which serializer is used
  by `ProjectAPIView.get()` — it likely uses a "detail" serializer variant (e.g.
  `ProjectStubSerializer` or a full `ProjectSerializer`). The field can be implemented as a
  `SerializerMethodField` or as a `Count` annotation on the queryset in the view's
  `get_object()`. The annotation approach is more efficient (no extra query) but requires
  careful handling of the `registration_config` OneToOne join.

- **`transaction.on_commit` pattern**: The Celery task must be scheduled via
  `transaction.on_commit(lambda: task.delay(...))` to ensure the registration data is
  committed before the task runs. This matches the pattern used by
  `notify_admins_of_registration_change` in `event_registration_views.py`.

- **202 vs 200 response**: Returning 202 Accepted when registrations exist signals to the
  frontend that the deletion is asynchronous. The frontend should handle both status codes
  in the `.then()` callback. The 202 response body includes `notified_guests` count for
  the success toast.

- **Email "from" name**: The `send_email()` utility resolves the `from_name` from the
  project's parent organization (or falls back to "Climate Connect"). Since the project is
  about to be deleted, the organization data must be available at email-send time. The
  Celery task does not need the project for this — the `from_name` is baked into the
  Mailjet payload by `send_email()` using the user's profile context, not the project.
  Verify this during implementation; if `send_email()` requires project context, include
  `from_name` in `guest_data`.

- **Event URL in email**: The `EventUrl` variable points to the event page
  (`/projects/{url_slug}`). After deletion, this URL will 404. This is acceptable — the
  email itself is the notification, and the URL serves as a reference the guest may have
  bookmarked. An alternative (landing page saying "this event was cancelled") is out of
  scope.

### Trade-off Notes

- **Async (Celery) vs synchronous email sending**: Async is chosen because: (a) it matches
  the existing pattern for event emails, (b) the admin should not wait for N emails to
  send, and (c) `send_email()` makes HTTP calls to Mailjet which could be slow. The
  trade-off is that the project is not deleted immediately — it persists until the task
  completes. This is acceptable because the admin sees a success toast and the project is
  effectively "gone" from their perspective (they are redirected).

- **Pre-captured `guest_data` vs task-fetches-registrations**: Pre-capturing in the view
  avoids the race condition (project deleted before task runs). The alternative — keeping
  the project alive until the task fetches registrations, then deleting — would require a
  two-phase commit or a "pending deletion" state on the project, which is over-engineered
  for this feature.

- **New Mailjet template vs reusing `ADMIN_CANCEL_REGISTRATION_TEMPLATE_ID`**: A new
  template is chosen because: (a) the semantics are different ("the event was cancelled"
  vs "an admin cancelled your registration"), (b) the existing template includes an
  `OrganizerMessage` variable which does not apply here, and (c) separate templates allow
  independent content updates. The cost is one additional Mailjet template to create and
  manage.

- **202 Accepted vs 200 OK with deferred delete**: Returning 202 when registrations exist
  is more REST-semantically correct (the action is accepted but not yet completed) and
  allows the frontend to show a different toast message. The alternative (always return 200
  and do the delete asynchronously) is simpler but loses the signal to the frontend.

---

## Implementation Decisions & Deviations

*(This section is empty during DRAFT status. It will be populated during implementation if
any decisions deviate from the spec.)*

---

## Documentation to Update

- `doc/api-documentation.md`:
  - Update `DELETE /api/projects/{slug}/` section to document the 202 response when
    the event has active registrations, the `notified_guests` field in the response, and
    the async deletion behavior.
  - Document `active_registrations_count` on the project detail response.
- `doc/domain-entities.md`:
  - No model changes (no new fields or models). Optionally note the async deletion
    behavior for events with registrations.
- `doc/mosy/entities/system-entities.md`:
  - Update if the project entity description mentions deletion behavior.

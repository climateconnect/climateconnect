# Notify Event Guests When Event Is Being Deleted

**Date**: 2026-07-15
**Status**: IMPLEMENTED
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
2. **Backend**: On delete of an event with active registrations, pre-capture guest data
   and localized event name, delete the project immediately, then dispatch an async Celery
   task that sends cancellation emails from the pre-captured data.
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
| Backend view | `backend/organization/views/project_views.py` | Extend `ProjectAPIView.delete()` to pre-capture guest data and event names, delete immediately, dispatch Celery task for email delivery |
| Backend task | `backend/organization/tasks.py` | New `send_event_deletion_guest_notifications` Celery task |
| Backend email | `backend/organization/utility/email.py` | New `send_event_deleted_notification_to_guest` function |
| Backend settings | `backend/climateconnect_main/settings.py` | New `EVENT_DELETED_GUEST_NOTIFICATION_TEMPLATE_ID` + `_DE` env vars |
| Backend serializer | `backend/organization/serializers/event_registration.py` | Add `active_registrations_count` field to `EventRegistrationConfigSerializer` (gated behind `include_seat_count`, same as `available_seats`) |
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

**AC-1.1** The `EventRegistrationConfigSerializer` includes an `active_registrations_count`
field. This field is an integer representing the count of `EventRegistration` rows where
`cancelled_at__isnull=True` for the config's `registrations` relation. It is gated behind
the existing `include_seat_count` context flag (same gating as `available_seats`), so it is
only populated on detail/edit responses, not on list endpoints.

**AC-1.2** The field is **read-only** and computed via `SerializerMethodField` (analogous to
`available_seats`). It reuses the same `registrations` queryset and does not issue an
additional COUNT query — the active count is derived from the `available_seats` computation
or a single `Count` annotation. For events without `max_participants` (unlimited capacity),
the count is still computed independently.

**AC-1.3** The field lives on `EventRegistrationConfigSerializer` (not on the project
serializer) to avoid polluting the project API for non-event projects. The frontend already
accesses `project.registration_config` for events and can read the count from there.

---

### AC-2: Backend — Delete flow with guest notification

**AC-2.1** When the admin sends `DELETE /api/projects/{url_slug}/` and the project is an
event (`project_type == "EV"`) with an `EventRegistrationConfig` that has active
registrations, the view performs the following steps **inside a single request**:

1. **Pre-capture**: collect `user_ids` (list of `int`) for every active registrant, and
   resolve `event_names` — a dict of `{lang_code: localized_event_name}` for each
   language that at least one registrant speaks (at minimum `{"en": "...", "de": "..."}`).
   Use `get_project_name(project, lang_code)` for each unique language.
2. **Delete immediately**: call `project.delete()`. The project and all cascade-deleted
   data are gone before the response is returned. No guest can see or interact with the
   event after this point.
3. **Dispatch email task**: schedule
   `send_event_deletion_guest_notifications.delay(user_ids, event_names)` via
   `transaction.on_commit()`. The task operates entirely from pre-captured data — it never
   needs to look up the deleted project.
4. **Return 200 OK** with
   `{"message": "Project {name} successfully deleted",
     "url_slug": url_slug,
     "notified_guests": len(user_ids)}`.

The `notified_guests` key is present only when the event had active registrations; it is
absent for non-event projects or events without registrations.

**AC-2.2** When the project is an event with a `registration_config` but **zero** active
registrations, or when the project is not an event, the current behavior is preserved:
`project.delete()` is called directly and `200 OK` is returned with the existing success
message (no `notified_guests` key).

**AC-2.3** The project deletion is **always synchronous and immediate** — it happens in the
view, not in a Celery task. This ensures the event is never visible to guests (or in
browse/search) after the admin confirms deletion.

---

### AC-3: Backend — Celery task for email delivery

**AC-3.1** New Celery task `send_event_deletion_guest_notifications(self, user_ids,
event_names)` in `backend/organization/tasks.py`, decorated with
`@app.task(bind=True, max_retries=3, default_retry_delay=60)`.

Parameters:
- `user_ids`: list of `int` — User PKs of active registrants at deletion time.
- `event_names`: dict of `{lang_code: str}` — localized event name per language (at
  minimum `{"en": "...", "de": "..."}`).

**AC-3.2** Task steps:
1. Fetch all users in one query: `User.objects.select_related("user_profile__location").filter(id__in=user_ids)`.
2. For each user:
   a. Determine `lang_code` via `get_user_lang_code(user)`.
   b. Look up `event_name` from `event_names` using `lang_code` (fall back to `"en"` if
      the user's language is not in the dict).
   c. Call `send_event_deleted_notification_to_guest(user, event_name)`.
   d. Wrap each email send in try/except; on failure, log a warning and **continue** to
      the next guest. Individual email failures do not abort the batch or trigger a task
      retry. This is an improvement over `send_organizer_message_to_guests` which retries
      the entire task on the first failure (re-sending already-delivered emails).
3. After the loop, log a summary: how many emails were attempted, how many failed.

**AC-3.3** The task does **not** look up the `Project` — it operates entirely from
`user_ids` and `event_names`. This is by design: the project is already deleted by the
time the task runs.

**AC-3.4** Backend tests (use `--keepdb`; set `CELERY_TASK_ALWAYS_EAGER = True`):
- Deleting an event with 3 active registrations dispatches the Celery task and returns
  200 with `notified_guests: 3`. The project is deleted before the task runs.
- Deleting an event with no active registrations (or a non-event project) does not
  dispatch the task and returns 200 without `notified_guests`.
- The Celery task sends an email for each guest (assert via `EmailNotification` count or
  mocked Mailjet call).
- The Celery task does not attempt to look up the deleted project.
- A guest email failure does not prevent other emails from being sent (remaining emails
  are delivered; the failure is logged).

---

### AC-4: Backend — Email utility and template

**AC-4.1** New function `send_event_deleted_notification_to_guest(user, event_name)` in
`backend/organization/utility/email.py`:
- `user`: Django `User` instance (for language resolution and `send_email`).
- `event_name`: `str` — the event name localized to the user's language.
- Internally builds `variables = {"FirstName": user.first_name or user.username, "EventTitle": event_name}`.
- Internally builds `subjects_by_language` with at least EN and DE subjects (see AC-4.2).
  The event name in each subject is looked up from the caller's perspective — but since
  the function only receives the already-localized `event_name`, the subject for the
  user's language uses that directly. For the *other* language subjects, the function uses
  the same `event_name` string (acceptable: the subject language is matched to the
  recipient's language by `send_email()`, so only the user's own language subject is ever
  sent).
- Calls `send_email()` with `template_key="EVENT_DELETED_GUEST_NOTIFICATION_TEMPLATE_ID"`,
  `should_send_email_setting=""` (always send — this is a critical notification),
  `notification=None`.

**AC-4.2** Email subjects (the subject matching the user's language is used):
- EN: `"The event {event_name} has been cancelled"`
- DE: `"Die Veranstaltung {event_name} wurde abgesagt"`

**AC-4.3** New environment variables in `backend/climateconnect_main/settings.py`:
```
EVENT_DELETED_GUEST_NOTIFICATION_TEMPLATE_ID = env("EVENT_DELETED_GUEST_NOTIFICATION_TEMPLATE_ID", "")
EVENT_DELETED_GUEST_NOTIFICATION_TEMPLATE_ID_DE = env("EVENT_DELETED_GUEST_NOTIFICATION_TEMPLATE_ID_DE", "")
```

**AC-4.4** New Mailjet templates must be created (EN + DE) with the following variables:
`FirstName`, `EventTitle`. The template content should convey that the event has been
cancelled by the organizer and the guest's registration is no longer valid. No event URL
is included — the event no longer exists, so the URL would 404. Template creation is a
manual step (Mailjet dashboard) and is tracked as a prerequisite for deployment.

---

### AC-5: Frontend — Enhanced delete confirmation for events with registrations

**AC-5.1** In `EditProjectRoot.tsx`, when the project is an event (`project_type.type_id ===
"event"`) and `project.registration_config?.active_registrations_count > 0`, the
`ConfirmDialog` uses enhanced text:

- **Title** (i18n key `delete_event_with_registrations_title`):
  EN: `"Delete event with registered guests?"`
  DE: `"Veranstaltung mit angemeldeten Gästen löschen?"`

- **Body** (i18n key `delete_event_with_registrations_text`):
  EN: `"This event has {count} registered guest(s). If you delete this event, all registered guests will be notified by email that the event has been cancelled. Are you sure?"`
  DE: `"Diese Veranstaltung hat {count} angemeldete Gäst(e). Wenn du diese Veranstaltung löschst, werden alle angemeldeten Gäste per E-Mail darüber informiert, dass die Veranstaltung abgesagt wurde. Bist du dir sicher?"`

  `{count}` is replaced with `project.registration_config.active_registrations_count`.

**AC-5.2** When the project is an event but `registration_config` is absent or
`active_registrations_count === 0`, or when the project is not an event, the existing
generic delete dialog text is shown (no change to current behavior).

**AC-5.3** The `deleteProject` function checks for the `notified_guests` key in the
response. When present and `> 0`, the success toast uses the i18n key
`event_deleted_guests_notified` instead of the generic delete success message:
- EN: `"Your event has been deleted. Registered guests have been notified."`
- DE: `"Deine Veranstaltung wurde gelöscht. Angemeldete Gäste wurden benachrichtigt."`

When `notified_guests` is absent or `0`, the existing generic success toast is shown.

**AC-5.4** New i18n keys in `frontend/public/texts/project_texts.tsx`:

| Key | English | German |
|-----|---------|--------|
| `delete_event_with_registrations_title` | Delete event with registered guests? | Veranstaltung mit angemeldeten Gästen löschen? |
| `delete_event_with_registrations_text` | This event has {count} registered guest(s). If you delete this event, all registered guests will be notified by email that the event has been cancelled. Are you sure? | Diese Veranstaltung hat {count} angemeldete Gäst(e). Wenn du diese Veranstaltung löschst, werden alle angemeldeten Gäste per E-Mail darüber informiert, dass die Veranstaltung abgesagt wurde. Bist du dir sicher? |
| `event_deleted_guests_notified` | Your event has been deleted. Registered guests have been notified. | Deine Veranstaltung wurde gelöscht. Angemeldete Gäste wurden benachrichtigt. |

---

## AI Insights

### Implementation Hints

- **Pre-captured data pattern**: The view captures `user_ids` and `event_names` before
  calling `project.delete()`. This is the same principle used by
  `send_organizer_message_to_guests` (which receives pre-computed `user_ids`), extended
  one step further: the event name is also pre-captured so the task never needs the
  project. The `User` objects are fetched inside the task (by `user_ids`) because
  `send_email()` requires a full `User` instance for email address lookup, language
  resolution, and Mailjet delivery.

- **Serializer field location**: `active_registrations_count` is added to
  `EventRegistrationConfigSerializer` in `backend/organization/serializers/event_registration.py`,
  gated behind the existing `include_seat_count` context flag. This keeps the field out of
  list responses and out of the project serializer for non-event projects. The frontend reads
  it from `project.registration_config.active_registrations_count`.

- **`transaction.on_commit` pattern**: The Celery task must be scheduled via
  `transaction.on_commit(lambda: task.delay(...))` to ensure the deletion (and its
  cascade) is committed before the task runs. This matches the pattern used by
  `notify_admins_of_registration_change` in `event_registration_views.py`.

- **Email "from" name**: Verify during implementation whether `send_email()` resolves
  the "from" name from the project's parent organization. If it does, note that the
  project is already deleted when the task runs. Fallback: `send_email()` uses "Climate
  Connect" as the default from_name when no project context is available. If a different
  from_name is required, capture it in the view and pass it as an additional task
  parameter.

- **Bulk email sending pattern**: Emails are sent **one by one** in a loop, matching the
  existing pattern in `send_organizer_message_to_guests`. Each call to `send_email()` makes
  an individual Mailjet API call. Mailjet supports batch sending (up to 50 recipients per
  call), but the codebase does not use it. One-by-one sending is chosen for consistency and
  simplicity. If email volume ever grows large enough to warrant batching, that is a
  separate optimization.

### Trade-off Notes

- **Immediate delete + async emails vs. async delete**: The project is deleted immediately
  in the view (synchronous), and emails are sent afterwards from pre-captured data. This
  was chosen over the alternative (defer deletion to a Celery task) because:
  - The event must not be visible to guests (or in browse/search) after the admin confirms
    deletion. An async delete would leave a window where the event is still live.
  - Pre-captured data is sufficient for email personalization — `send_email()` needs only
    the `User` object and template variables, not the `Project`.
  - If the email task fails entirely (broker down, all retries exhausted), the project is
    already deleted — which is the correct end state. Guests lose the notification email
    but the event is gone. This is an acceptable trade-off; monitoring via logs catches it.

- **New Mailjet template vs. reusing `ADMIN_CANCEL_REGISTRATION_TEMPLATE_ID`**: A new
  template is chosen because: (a) the semantics are different ("the event was cancelled"
  vs. "an admin cancelled your registration"), (b) the existing template includes an
  `OrganizerMessage` variable which does not apply here, and (c) separate templates allow
  independent content updates. The cost is one additional Mailjet template to create and
  manage.

- **No event URL in email**: The email does not include a link to the event page because
  the project is deleted before emails are sent — the URL would 404. The email itself is
  the notification; no further action is needed from the guest.

---

## Implementation Decisions & Deviations

*(This section is empty during DRAFT status. It will be populated during implementation if
any decisions deviate from the spec.)*

---

## Documentation to Update

- `doc/api-documentation.md`:
  - Update `DELETE /api/projects/{slug}/` section to document the `notified_guests` field
    in the response when the event has active registrations.
  - Document `active_registrations_count` on the `registration_config` object in the
    project detail response.
- `doc/domain-entities.md`:
  - No model changes (no new fields or models). Optionally note the notification behavior
    for events with registrations on deletion.
- `doc/mosy/entities/system-entities.md`:
  - Update if the project entity description mentions deletion behavior.

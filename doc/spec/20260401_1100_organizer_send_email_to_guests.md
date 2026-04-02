# Event Organiser Can Send Email Message to All Guests

**Status**: DONE (Reference: [`task-based-development.md`](../for-agents/guides/task-based-development.md))
**Type**: Feature
**Date and time created**: 2026-04-01 11:00 UTC
**Date Completed**: —
**GitHub Issue**: [#1866](https://github.com/climateconnect/climateconnect/issues/1866)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`docs/mosy/architecture_overview.md`](../mosy/architecture_overview.md)
- [`docs/mosy/entities/system-entities.md`](../mosy/entities/system-entities.md)
- [`docs/mosy/flows/core-flows.md`](../mosy/flows/core-flows.md)
- [`20260309_0900_member_register_for_event.md`](./20260309_0900_member_register_for_event.md) ← introduces `EventParticipant`
- [`20260309_1500_member_cancel_event_registration.md`](./20260309_1500_member_cancel_event_registration.md) ← introduces `cancelled_at`
- [`20260401_1000_organizer_see_registration_status.md`](./20260401_1000_organizer_see_registration_status.md) ← introduces DataGrid and `RegistrationsToolbar`

## Problem Statement

An event organiser or team admin can send a plain-text email to all registered guests directly from the event registration tab. This lets organisers communicate important updates, changes, or reminders to every person who has signed up, without leaving the platform.

**Core Requirements (User/Stakeholder Stated):**

- The **"Send email to guests"** action is available as a button in the **DataGrid toolbar** of the existing `ProjectRegistrationsContent.tsx` registrations tab.
- Clicking the button opens a **simple modal** with two input fields:
  - **Subject** — plain text, single line.
  - **Message** — plain text, multiline body.
- The modal has **two action buttons**:
  - **"Send now"** — sends the email to every registered guest who has **not cancelled** their registration.
  - **"Send test"** — sends a single test email to the **currently logged-in organiser** only.
- After a successful send the modal shows a **confirmation message** in-place (replacing the form):
  - **After "Send now"**: _"Email sent to {N} registered guests."_ — where N is the number of active (non-cancelled) participants at the time of sending.
  - **After "Send test"**: _"Test email sent to {email}."_ — where email is the organiser's own email address.
- The organiser can **close the modal** after reviewing the confirmation.
- By default each email includes, in addition to the organiser-provided subject and body:
  - The **event name** (localised: use the translation for the recipient's language if available, same as the registration confirmation email).
  - A **link to the event page**, language-aware (same pattern as in `send_event_registration_confirmation_to_user`).
- No email is sent to guests whose registration has been **cancelled** (`cancelled_at IS NOT NULL`). _Note: cancellation ([#1850](https://github.com/climateconnect/climateconnect/issues/1850)) is not yet implemented and will likely not be ready when this story ships. For now, all `EventParticipant` rows are treated as active. The filter will be added as a one-line change once #1850 lands._

**Explicitly Out of Scope (this iteration):**

- Rich-text or HTML message bodies — plain text only.
- Scheduling or deferring sends.
- Per-guest unsubscribe handling beyond the existing `cancelled_at` check.
- Sending to guests of a closed / ended / full event (the button is available regardless of status — it is the organiser's responsibility to decide when to send).
- Attachment support.
- Message history / send log visible on the frontend.

### Non Functional Requirements

- Access to the send endpoint **must be enforced server-side** (`403 Forbidden` for non-organiser, `401` for unauthenticated). The button not rendering for non-admins is not sufficient.
- **Bulk send ("Send now") is asynchronous** — dispatched as a Celery task so that the HTTP request returns immediately. The response contains the pre-counted recipient count; actual email dispatch happens in the background.
- **Test send is synchronous** — sends a single email inline in the request. One email, one user, fast enough to handle in-request.
- Participant user relations must be **eagerly loaded** when fetching participants to avoid N+1 queries.
- Subject and message fields must each be **non-empty** — enforced both client-side and server-side (400 Bad Request).
- The `EVENT_REGISTRATION` feature toggle must be active for the tab to render. No additional toggle check inside the modal is needed.
- No breaking changes to existing API contracts.

### AI Agent Insights and Additions

- **`cancelled_at` future reminder**: cancellation ([#1850](https://github.com/climateconnect/climateconnect/issues/1850)) is not yet implemented. The participant queryset in the view and in the Celery task therefore does **not** filter by `cancelled_at` at this time — all `EventParticipant` rows are active. Mark both locations with a `TODO #1850` comment as a reminder to add the filter once cancellation ships, consistent with the pattern in `ListEventParticipantsView`. No further action needed now.
- **Recipient count in response**: count the queryset **before** dispatching the Celery task so the API can return `sent_count` immediately. The Celery task receives a list of participant IDs (not a lazy queryset) to avoid race conditions where registrations change between request time and task execution time.
- **Test send follows the existing email helper pattern**: call the new single-guest email helper synchronously in the view for the test case. No Celery task is needed for the test path.
- **Mailjet template variables**: the new template must accept `OrganizerSubject`, `OrganizerMessage`, `EventTitle`, `EventUrl`, `OrganiserName`, and `FirstName`. `OrganizerSubject` is the organiser-provided subject line; the email's envelope `Subject` header should also be set to `OrganizerSubject` directly (not a default platform subject line). This is consistent with how the user controls the communication.
- **Two Mailjet templates (EN + DE)**: follow the existing `_TEMPLATE_ID` / `_TEMPLATE_ID_DE` naming convention. Add env variables `EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID` and `EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID_DE`.
- **Toolbar button placement**: place the "Email guests" button to the **left** of the existing export button, after the search field spacer. Use an email icon from the existing icons library. The button should only render when the open-modal callback prop is provided — this keeps the toolbar reusable and the button absent when not relevant (e.g. future read-only organisers).
- **Modal send state**: the modal has four internal phases: **idle** (form visible), **sending** (form frozen, spinners shown), **sent_all** (bulk send confirmed, stores recipient count), and **sent_test** (test send confirmed, organiser's email read from user context). These are one-way within a session.
- **Character limit on subject**: enforce a 200-character limit server-side. Surface the limit as a `maxLength` attribute on the input and return a 400 error if exceeded.
- **Character limit on message**: no hard server-side limit for now, but apply a soft 5,000-character limit client-side to protect against accidental paste of very large content.
- **Re-opening the modal resets the form**: when the modal re-opens, reset subject, message, field errors, and send state to their initial (idle) values. Consistent with `EditEventRegistrationModal`.
- **Bulk send participant list isolation**: pass the list of user IDs (not a slug or queryset) to the Celery task so the task operates on exactly the set of users who were active at request time, even if a cancellation arrives between the request and task execution.
- **Bulk send strategy — one-by-one (consistent with existing pattern)**: all existing transactional emails in the codebase send one Mailjet API call per recipient. Events are not expected to have thousands of registrations in Phase 2, so the Celery task follows the same one-by-one loop. If large events become common in Phase 3+, batching multiple recipients per API call would be the natural optimisation.
- **Recipient name in `To` header**: the existing `send_email()` utility automatically sets the recipient's full name in the `To` header. The new email helper inherits this behaviour by delegating to `send_email()` — callers do not need to supply it separately.

## System impact

_To be filled in by Archie._

## Software Architecture

### API

**New endpoint — send organiser email to guests**

`POST /api/projects/{url_slug}/registrations/email/`

- Auth required — returns `401 Unauthorized` if not authenticated.
- Requires organiser or team admin role — returns `403 Forbidden` otherwise.
- Returns `404 Not Found` if the project does not exist or does not have `EventRegistration` enabled.
- Subject and message are required — returns `400 Bad Request` if either is blank.
- Subject max length: 200 characters — returns `400 Bad Request` if exceeded.

**Request payload** (both actions share the same shape):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subject` | string | yes | Organiser-authored email subject, max 200 characters |
| `message` | string | yes | Organiser-authored plain-text email body |
| `is_test` | boolean | no (default: false) | When true, sends only to the authenticated organiser |

**Response — 200 OK**

| Field | Type | Description |
|-------|------|-------------|
| `sent_count` | integer | Number of recipients. Always `1` for test sends. For bulk sends, reflects the number of active participants at the time the task was dispatched — actual delivery is asynchronous. |

The response shape is identical for both bulk and test sends.

**Error responses**

| Status | Body | Condition |
|--------|------|-----------|
| 400 | `{ "subject": ["..."] }` or `{ "message": ["..."] }` | Blank or oversized field |
| 401 | — | Unauthenticated request |
| 403 | `{ "message": "You do not have permission to send emails for this event." }` | Authenticated but not an organiser or team admin |
| 404 | `{ "message": "Project not found: {slug}" }` | Project slug does not exist |
| 404 | `{ "message": "This project does not have event registration enabled." }` | Project exists but has no `EventRegistration` |

### Events

One new async Celery task handles bulk email delivery. It accepts the event slug, a pre-captured snapshot of participant user IDs, a subject, and a message body. The task:

- Fetches the project with all relations required for email rendering (translations, organiser name).
- Fetches only the users whose IDs were passed in the snapshot — not a live queryset — so the set is stable even if cancellations arrive after dispatch.
- Calls the single-guest email helper once per user.
- On transient failure for an individual send, retries up to 3 times with a 60-second delay — consistent with `send_event_registration_confirmation_email`.
- If the project cannot be found, logs an error and exits without retrying (the data snapshot is stale; retrying would not help).
- Marks the location where the `cancelled_at` filter must be added once [#1850](https://github.com/climateconnect/climateconnect/issues/1850) ships (see `TODO #1850` comments).

### Frontend

#### `ProjectRegistrationsContent.tsx`

Add state to control the new modal's open/closed visibility. Wire the toolbar's "Email guests" button to open the modal. Render `SendEmailToGuestsModal` at the bottom of the component, alongside the existing `EditEventRegistrationModal`, passing the project context and the open/close state.

#### `RegistrationsToolbar` (in `ProjectRegistrationsContent.tsx`)

Add an optional open-modal callback prop. When the prop is provided, render an "Email guests" button to the **left of the existing export button**, after the search field spacer. Use an email icon. Apply the `send_email_to_guests` text key as the button label and as an `aria-label` for accessibility. The button must not render when the prop is absent — keeping the toolbar reusable without it.

**Toolbar layout (button placement):**

```
[search input] ─────────────────── [Email guests] [Export ▼]
```

#### New component — `SendEmailToGuestsModal.tsx`

Location: `frontend/src/components/project/SendEmailToGuestsModal.tsx`

**Props:** `open` (boolean), `onClose` (callback), `project` (Project object).

**Send state machine** — four phases, one-way within a session:

| Phase | Description |
|-------|-------------|
| `idle` | Form is visible and interactive |
| `sending` | All buttons disabled; spinners shown |
| `sent_all` | Confirmation shown with bulk recipient count |
| `sent_test` | Confirmation shown with organiser's own email address |

Re-opening the modal always resets to `idle` and clears all field values and errors — consistent with `EditEventRegistrationModal`.

**Form layout (idle / sending):**

```
┌─────────────────────────────────────────────┐
│ Send email to guests                    [×] │
│─────────────────────────────────────────────│
│ Subject *                                   │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Message *                                   │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ │                                         │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [Cancel]         [Send test]  [Send now ▶]  │
└─────────────────────────────────────────────┘
```

During the `sending` phase all buttons are disabled and spinner icons replace button labels.

**Confirmation layout — bulk send (`sent_all`):**

```
┌─────────────────────────────────────────────┐
│ Send email to guests                    [×] │
│─────────────────────────────────────────────│
│                                             │
│  ✓  Email sent to 42 registered guests.     │
│                                             │
│                                    [Close]  │
└─────────────────────────────────────────────┘
```

**Confirmation layout — test send (`sent_test`):**

```
┌─────────────────────────────────────────────┐
│ Send email to guests                    [×] │
│─────────────────────────────────────────────│
│                                             │
│  ✓  Test email sent to you@example.com.     │
│                                             │
│                                    [Close]  │
└─────────────────────────────────────────────┘
```

The organiser's email address shown in the test confirmation is sourced from user context, not from the API response. Use `GenericDialog` as the modal wrapper, consistent with `EditEventRegistrationModal`.

**API integration:** both actions call `POST /api/projects/{url_slug}/registrations/email/` using the project's standard `apiRequest` helper with the appropriate `is_test` flag. On success, transition to `sent_all` (storing the recipient count from `sent_count`) or `sent_test`. On error, surface a general error message below the form — consistent with `EditEventRegistrationModal`.

#### New text keys (`public/texts/project_texts.tsx`)

Add to the `project` page text object:

| Key | EN | DE |
|-----|----|----|
| `send_email_to_guests` | `"Email guests"` | `"Gäste per E-Mail benachrichtigen"` |
| `email_subject` | `"Subject"` | `"Betreff"` |
| `email_message` | `"Message"` | `"Nachricht"` |
| `send_now` | `"Send now"` | `"Jetzt senden"` |
| `send_test_to_myself` | `"Send test to myself"` | `"Testmail an mich senden"` |
| `sending` | `"Sending…"` | `"Wird gesendet…"` |
| `email_sent_to_guests` | `"Email sent to {count} registered guests."` | `"E-Mail an {count} registrierte Gäste gesendet."` |
| `test_email_sent_to` | `"Test email sent to {email}."` | `"Test-E-Mail an {email} gesendet."` |
| `email_subject_required` | `"Subject is required."` | `"Betreff ist erforderlich."` |
| `email_message_required` | `"Message is required."` | `"Nachricht ist erforderlich."` |

> **Interpolation note**: the existing `texts` system uses simple string replacement via helper functions (e.g. `replace_str_with_jsx`). Use the same pattern for `{count}` and `{email}` as done elsewhere in the project texts.

### Backend

#### Serializer

New serializer in `organization/serializers/event_registration.py`. Validates the request payload: `subject` must be a non-blank string with a maximum of 200 characters; `message` must be a non-blank string with no server-side length limit; `is_test` is a boolean defaulting to `false`.

#### Email helper — single guest

New function in `organization/utility/email.py`. Accepts a user, a project, an organiser-authored subject, and a message body. The function:

- Resolves the recipient's preferred language.
- Builds a localised event title and a language-aware event URL — following the same pattern as `send_event_registration_confirmation_to_user`.
- Assembles the Mailjet template variables (see the Mailjet templates section below).
- Delegates to the existing `send_email()` utility, setting the envelope `Subject` header directly to the organiser-provided subject (no platform prefix).

Recipient name in the `To` header is handled automatically by `send_email()` — the helper does not need to set it explicitly.

#### Celery task — bulk send

New task in `organization/tasks.py`. See the [Events](#events) section above for the full behavioural description. Signature: accepts event slug, list of user IDs, subject, and message.

#### View

New `APIView` in `organization/views/event_registration_views.py` for `POST /api/projects/{url_slug}/registrations/email/`.

Request flow:

1. Validate the request payload with the new serializer — return 400 on invalid input.
2. Look up the project by slug with all relations required for email rendering — return 404 if not found.
3. Verify the requesting user has organiser-level (`ALL_TYPE` or `READ_WRITE_TYPE`) membership on the project — return 403 if not. Mirror the permission check pattern used in `ListEventParticipantsView`.
4. Verify the project has an `EventRegistration` — return 404 if not.
5. **Test send** (`is_test=true`): prepend `[TEST] ` to the subject so the organiser can identify test emails in their inbox. Call the email helper synchronously for the requesting user. Return `{"sent_count": 1}`. Return 500 on unexpected failure with a user-friendly message.
6. **Bulk send** (`is_test=false`): fetch all active `EventParticipant` rows with user relations eagerly loaded, capture their user IDs as a snapshot list, dispatch the Celery task asynchronously with that snapshot, and return `{"sent_count": <length of snapshot>}`. Mark the participant queryset with a `TODO #1850` comment where `cancelled_at` filtering belongs.

#### URL

Register the new view for `POST projects/<url_slug>/registrations/email/` in `organization/urls.py`, following the existing URL naming conventions in that file.

#### Settings — new env variables

Add two settings reading from environment variables, placed next to the existing `EVENT_REGISTRATION_CONFIRMATION_TEMPLATE_ID` block in `climateconnect_main/settings.py`:

- `EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID` — Mailjet template ID for the English template.
- `EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID_DE` — Mailjet template ID for the German template.

Add both to `.backend_env` and to the Azure App Service configuration in production.

#### Mailjet templates (action item — not code)

Two new Mailjet templates (EN and DE) must be created before this feature goes to production. Required template variables:

| Variable | Description |
|----------|-------------|
| `FirstName` | Recipient's first name (falls back to username) |
| `EventTitle` | Event name (localised for the recipient) |
| `EventUrl` | Language-aware URL to the event page |
| `OrganiserName` | Localised organisation name, or organiser's full name / username — same logic as the registration confirmation email |
| `OrganizerSubject` | The subject text entered by the organiser |
| `OrganizerMessage` | The plain-text body entered by the organiser |

The email envelope subject must be set directly to the organiser's subject (no wrapping platform prefix).

#### No migration required

No new model fields. All required data (`EventParticipant.user`, `EventParticipant.event_registration`) is already present.

### Data

No schema changes.

### Other

None.

---

## Files to Change

### Backend

| File | Change |
|------|--------|
| `organization/serializers/event_registration.py` | Add `SendOrganizerEmailSerializer` |
| `organization/utility/email.py` | Add single-guest email helper function |
| `organization/tasks.py` | Add bulk-send Celery task |
| `organization/views/event_registration_views.py` | Add `SendOrganizerEmailView` |
| `organization/urls.py` | Add URL pattern for `POST /api/projects/{url_slug}/registrations/email/` |
| `climateconnect_main/settings.py` | Add `EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID` and `EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID_DE` |
| `organization/tests/test_event_registration.py` | Add tests for `SendOrganizerEmailView` |

### Frontend

| File | Change |
|------|--------|
| `src/components/project/ProjectRegistrationsContent.tsx` | Add modal open/close state; wire toolbar button to open the modal; render `SendEmailToGuestsModal` alongside existing modal |
| `src/components/project/SendEmailToGuestsModal.tsx` | **New file** — modal with subject + message form, "Send test" and "Send now" actions, confirmation state |
| `public/texts/project_texts.tsx` | Add new text keys (see table above) |

---

## Test Cases

### Backend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | Unauthenticated request | 401 Unauthorized |
| 2 | Authenticated member without edit rights | 403 Forbidden |
| 3 | Organiser on project without `EventRegistration` | 404 Not Found |
| 4 | Missing `subject` in payload | 400 Bad Request, `subject` error |
| 5 | Missing `message` in payload | 400 Bad Request, `message` error |
| 6 | `subject` > 200 characters | 400 Bad Request |
| 7 | `is_test=false`, 3 active participants | 200 OK, `{"sent_count": 3}`; Celery task dispatched with 3 user IDs |
| 8 | `is_test=false`, 0 active participants | 200 OK, `{"sent_count": 0}`; Celery task dispatched with empty list |
| 9 | `is_test=true` | 200 OK, `{"sent_count": 1}`; email helper called once with organiser user and subject prefixed with `"[TEST] "` |
| 10 | Team admin (not creator) with `read_write_type` role, `is_test=false` | 200 OK |
| 11 | Celery task: project not found | logs error, does not raise |
| 12 | Celery task: mail delivery fails | retries up to 3 times; raises after max retries |
| 13 | Eager loading used in task | query count does not grow with number of recipients |

### Frontend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | Toolbar renders | "Email guests" button visible in DataGrid toolbar |
| 2 | Click "Email guests" button | `SendEmailToGuestsModal` opens |
| 3 | Modal opens | Subject and message fields are empty; form visible |
| 4 | Modal re-opened after previous send | form resets to empty |
| 5 | Click "Send now" with empty subject | subject error shown; no API call |
| 6 | Click "Send now" with empty message | message error shown; no API call |
| 7 | Click "Send now" with valid input | buttons disabled, spinner shown; API called with `is_test: false` |
| 8 | "Send now" succeeds | confirmation "Email sent to 42 registered guests." shown |
| 9 | Click "Send test" with valid input | API called with `is_test: true` |
| 10 | "Send test" succeeds | confirmation "Test email sent to you@example.com." shown — email address sourced from user context, not API response |
| 11 | API returns error | general error message shown below form |
| 12 | Click "Close" after confirmation | modal closes |
| 13 | User without admin rights | "Email guests" button not visible (Registrations tab not shown per `ProjectPageRoot.tsx`) |

---

## Dependency Notes

- **Depends on** [#1845](https://github.com/climateconnect/climateconnect/issues/1845): `EventParticipant` entity must exist.
- **Depends on** [`20260401_1000_organizer_see_registration_status.md`](./20260401_1000_organizer_see_registration_status.md): `ProjectRegistrationsContent.tsx` with `RegistrationsToolbar` must exist (DONE).
- **Future reminder — cancellation [#1850](https://github.com/climateconnect/climateconnect/issues/1850)**: cancellation is not yet implemented and is not a dependency for this story. When [#1850](https://github.com/climateconnect/climateconnect/issues/1850) eventually ships `cancelled_at`, the participant querysets in both the view and the Celery task must be updated to exclude cancelled registrations. The `TODO #1850` comments in the code mark both locations.
- **Action item** (non-code): two Mailjet templates (EN + DE) must be created and their IDs configured in settings before the feature can send real emails. The backend will not error without them — `send_email` logs a warning if the template ID is blank — but no emails will be delivered.
- **Update Epic** [`EPIC_event_registration.md`](./EPIC_event_registration.md): change the row "Organiser sends email to all registered guests" from `⚪ Not started` to `📝 Draft` after this spec is reviewed.

---

## Log

- 2026-04-01 11:00 — Task created from product-backlog issue #55. Problem statement, AI insights, and full software architecture documented.
- 2026-04-01 12:00 — Spec reviewed and approved. Clarified: `cancelled_at` is a future reminder only; consistent `sent_count` API response; `[TEST] ` subject prefix; `OrganiserName` variable added; `sent_test` state simplified (email from user context); view project prefetch corrected. Status updated to IMPLEMENTATION.
- 2026-04-01 13:00 — Removed implementation code examples from Software Architecture section. Spec now describes outcomes and constraints only; implementing agents own the "how".

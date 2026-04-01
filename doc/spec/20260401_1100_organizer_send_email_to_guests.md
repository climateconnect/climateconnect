# Event Organiser Can Send Email Message to All Guests

**Status**: DRAFT (Reference: [`task-based-development.md`](../for-agents/guides/task-based-development.md))
**Type**: Feature
**Date and time created**: 2026-04-01 11:00 UTC
**Date Completed**: —
**GitHub Issue**: [product-backlog#55](https://github.com/climateconnect/product-backlog/issues/55)
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
- `select_related("user__userprofile")` must be used when fetching participant users to avoid N+1 queries.
- Subject and message fields must each be **non-empty** — enforced both client-side and server-side (400 Bad Request).
- The `EVENT_REGISTRATION` feature toggle must be active for the tab to render. No additional toggle check inside the modal is needed.
- No breaking changes to existing API contracts.

### AI Agent Insights and Additions

- **`cancelled_at` future reminder**: cancellation ([#1850](https://github.com/climateconnect/climateconnect/issues/1850)) is not yet implemented and is unlikely to be ready when this story ships. The queryset in the view and in the Celery task therefore does **not** filter by `cancelled_at` at this time — all `EventParticipant` rows are active. Add a `# TODO #1850: add .filter(cancelled_at__isnull=True)` comment in both the view and the task as a reminder, consistent with the pattern in `ListEventParticipantsView`. No further action needed now.
- **Recipient count in response**: count the queryset **before** dispatching the Celery task so the API can return `sent_count` immediately. The Celery task receives the list of participant IDs (not a lazy queryset) to avoid race conditions where registrations change between request time and task execution time.
- **Send test email reuses `send_event_registration_confirmation_to_user` pattern**: call the new `send_organizer_message_to_guest(user, project, subject, message)` helper synchronously in the view for the test case. No Celery task needed for test.
- **Mailjet template variables**: the new template must accept `OrganizerSubject`, `OrganizerMessage`, `EventTitle`, `EventUrl`, and `FirstName`. `OrganizerSubject` is the organiser-provided subject line; the email's envelope `Subject` header should also be set to `OrganizerSubject` directly (not a default platform subject line). This is consistent with how the user controls the communication.
- **Two Mailjet templates (EN + DE)**: follow the existing `_TEMPLATE_ID` / `_TEMPLATE_ID_DE` naming pattern. Add env variables `EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID` and `EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID_DE`.
- **Toolbar button placement**: place the "Email guests" button to the **left** of the existing `GridToolbarExport` button in `RegistrationsToolbar`, after the search field spacer. Use `EmailIcon` from `@mui/icons-material`. The button should only render when the `onSendEmail` callback prop is provided — this keeps the toolbar reusable and the button absent when not relevant (e.g. future read-only organisers).
- **Modal confirmation state**: use a `"sent"` state enum value in the modal (`"idle" | "sending" | "sent_all" | "sent_test"`) rather than two booleans. `"sent_all"` stores `sentCount`, `"sent_test"` stores `sentTo` — both typed in a discriminated union for safety.
- **Character limit on subject**: enforce a 200-character limit on subject server-side (matches `EmailMessage.subject` max length convention). Surface as a `maxLength` attribute on the input and a `400` error if exceeded.
- **Character limit on message**: no hard limit imposed server-side for now, but set `inputProps={{ maxLength: 5000 }}` on the textarea as a soft guardrail to protect against accidental paste of very long content.
- **Re-opening the modal resets the form**: `useEffect` on `open` — same pattern as `EditEventRegistrationModal`. The confirmation state should also reset when the modal is re-opened so the organiser can send another message in the same session.
- **`send_now` participant list isolation**: pass the list of `user_id` values (not a slug or queryset) to the Celery task so the task operates on exactly the set of users who were active at request time, even if a cancellation arrives between the request and task execution.
- **Bulk send strategy — one-by-one (consistent with existing pattern)**: `send_email()` always sends one Mailjet API call per recipient. The Mailjet Send API v3.1 supports batching up to 50 `Messages` objects per call, which would reduce HTTP round-trips for large guest lists. However, all existing transactional emails in the codebase use the one-by-one approach, and events are not expected to have thousands of registrations in Phase 2. The Celery task therefore follows the same one-by-one loop. If large events become common in Phase 3+, batching (50 `Messages` per request) would be the straightforward optimisation.
- **Recipient `Name` in `To` header — handled automatically by `send_email()`**: `send_email()` always sets `"Name": user.first_name + " " + user.last_name` in the `To` header. Callers do not need to supply this separately. The `send_organizer_message_to_guest` helper inherits this behaviour by delegating to `send_email()`.

## System impact

_To be filled in by Archie._

## Software Architecture

### API

**New endpoint — send organiser email to guests**

```
POST /api/projects/{url_slug}/registrations/email/
```

- Auth required — returns `401 Unauthorized` if not authenticated.
- Requires organiser or team admin role — returns `403 Forbidden` otherwise.
- Returns `404 Not Found` if the project does not exist or does not have `EventRegistration` enabled.
- Subject and message are required — returns `400 Bad Request` if either is blank.
- Subject max length: 200 characters — returns `400 Bad Request` if exceeded.

**Request — Send to all guests**
```json
POST /api/projects/my-event/registrations/email/
Authorization: Token <token>
Content-Type: application/json

{
  "subject": "Important update about the event",
  "message": "Hi everyone, we have an important update…",
  "is_test": false
}
```

**Response — 200 OK (Send now)**
```json
{
  "sent_count": 42
}
```
`sent_count` is the number of active (non-cancelled) participants at the time the task was dispatched. Actual delivery is asynchronous.

**Request — Send test to self**
```json
{
  "subject": "Important update about the event",
  "message": "Hi everyone, we have an important update…",
  "is_test": true
}
```

**Response — 200 OK (Test)**
```json
{
  "sent_to": "organiser@example.com"
}
```

**Response — 400 Bad Request**
```json
{ "subject": ["This field may not be blank."] }
```
or
```json
{ "message": ["This field may not be blank."] }
```

**Response — 403 Forbidden**
```json
{ "message": "You do not have permission to send emails for this event." }
```

**Response — 404 Not Found**
```json
{ "message": "Project not found: my-event" }
```
or
```json
{ "message": "This project does not have event registration enabled." }
```

### Events

One new async Celery task:
- `send_organizer_message_to_guests(event_slug, user_ids, subject, message)` — iterates `user_ids`, fetches each `User` with `select_related("user_profile__location")`, calls `send_organizer_message_to_guest(user, project, subject, message)`. Retries up to 3 times on transient failure (same pattern as `send_event_registration_confirmation_email`).

### Frontend

#### `ProjectRegistrationsContent.tsx`

**Changes:**

1. Add a `sendEmailOpen` state (`useState(false)`) to control the new modal.
2. Pass an `onSendEmail` callback prop down to `RegistrationsToolbar` via `slotProps.toolbar`, wiring it to `() => setSendEmailOpen(true)`.
3. Render `<SendEmailToGuestsModal>` at the bottom of the component (next to the existing `EditEventRegistrationModal`), passing `project` and the open/close state.

#### `RegistrationsToolbar` (in `ProjectRegistrationsContent.tsx`)

Add `onSendEmail?: () => void` to `ToolbarProps`.

**New button** in the toolbar (between the spacer `<Box sx={{ flex: 1 }} />` and `<GridToolbarExport />`):

```tsx
{onSendEmail && (
  <Button
    size="small"
    startIcon={<EmailIcon fontSize="small" />}
    onClick={onSendEmail}
    aria-label={texts.send_email_to_guests}
  >
    {texts.send_email_to_guests}
  </Button>
)}
```

#### New component — `SendEmailToGuestsModal.tsx`

Location: `frontend/src/components/project/SendEmailToGuestsModal.tsx`

**Props:**

```tsx
type Props = {
  open: boolean;
  onClose: () => void;
  project: Project;
};
```

**State machine:**

```
"idle" → "sending" → "sent_all" (stores sentCount: number)
                   → "sent_test" (stores sentTo: string)
```

Implemented as:

```tsx
type SendState =
  | { phase: "idle" }
  | { phase: "sending" }
  | { phase: "sent_all"; sentCount: number }
  | { phase: "sent_test"; sentTo: string };
```

**Form reset**: `useEffect` on `open` — when `open` becomes `true`, reset `subject`, `message`, errors, and `sendState` to initial values. Consistent with `EditEventRegistrationModal`.

**Idle/sending phase — form layout:**

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

During `"sending"` phase, all buttons are disabled and `CircularProgress` spinners replace button icons.

**Confirmation phase — `sent_all`:**

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

**Confirmation phase — `sent_test`:**

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

Uses `GenericDialog` (same as `EditEventRegistrationModal`).

**API call (both actions):**

```ts
const resp = await apiRequest({
  method: "post",
  url: `/api/projects/${project.url_slug}/registrations/email/`,
  payload: { subject, message, is_test: isTest },
  token,
  locale,
});
```

On success:
- `is_test: false` → transition to `{ phase: "sent_all", sentCount: resp.data.sent_count }`
- `is_test: true` → transition to `{ phase: "sent_test", sentTo: resp.data.sent_to }`

On error: surface `errors.general` below the form (same pattern as `EditEventRegistrationModal`).

#### New dependency

None — no new packages required. `@mui/icons-material` is already installed.

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

> **Interpolation note**: the existing `texts` system in this project uses simple string replacement via helper functions (e.g. `replace_str_with_jsx`). Use the same pattern for `{count}` and `{email}` interpolation as is done elsewhere in project texts. If the texts system does not support interpolation for this key, produce the string dynamically in the component: `` `${texts.email_sent_to_guests_prefix}${sentCount}${texts.email_sent_to_guests_suffix}` ``.

### Backend

#### Serializer — `SendOrganizerEmailSerializer`

New serializer in `organization/serializers/event_registration.py`.

```python
class SendOrganizerEmailSerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=200, allow_blank=False)
    message = serializers.CharField(allow_blank=False)
    is_test = serializers.BooleanField(default=False)
```

#### Email helper — `send_organizer_message_to_guest`

New function in `organization/utility/email.py`.

```python
def send_organizer_message_to_guest(user, project, subject: str, message: str):
    """
    Send an organiser-composed message to a single event guest.

    **Mailjet template variables**:
        - ``FirstName``         — recipient's first name (falls back to username)
        - ``EventTitle``        — event name, localised to recipient's language
        - ``EventUrl``          — language-aware link to the event page
        - ``OrganizerSubject``  — the subject entered by the organiser
        - ``OrganizerMessage``  — the plain-text body entered by the organiser

    **Required env variables**:
        ``EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID``    — Mailjet template ID (EN)
        ``EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID_DE`` — Mailjet template ID (DE)

    The email envelope ``Subject`` header is set to the organiser-provided
    ``subject`` directly (not a generic platform subject line).
    """
    lang_code = get_user_lang_code(user)
    event_title = get_project_name(project, lang_code)
    event_url = (
        settings.FRONTEND_URL
        + get_user_lang_url(lang_code)
        + "/projects/"
        + project.url_slug
    )

    subjects_by_language = {
        "en": subject,
        "de": subject,  # organiser-authored subject is language-agnostic here
    }

    variables = {
        "FirstName": user.first_name or user.username,
        "EventTitle": event_title,
        "EventUrl": event_url,
        "OrganizerSubject": subject,
        "OrganizerMessage": message,
    }

    send_email(
        user=user,
        variables=variables,
        template_key="EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="",
        notification=None,
    )
```

#### Celery task — `send_organizer_message_to_guests`

New task in `organization/tasks.py`.

```python
@app.task(bind=True, max_retries=3, default_retry_delay=60)
def send_organizer_message_to_guests(
    self, event_slug: str, user_ids: list, subject: str, message: str
):
    """
    Async bulk send: deliver an organiser-composed email to a list of event guests.

    ``user_ids`` is a pre-computed list of User PKs captured at request time so
    the task operates on a stable snapshot of active participants even if
    cancellations arrive between the HTTP request and task execution.

    Retries up to 3 times with a 60-second delay on transient failure
    (consistent with send_event_registration_confirmation_email).
    """
    from organization.models.project import Project
    from organization.utility.email import send_organizer_message_to_guest

    try:
        project = (
            Project.objects.select_related("loc", "language")
            .prefetch_related(
                "translation_project__language",
                "project_parent__parent_organization__language",
                "project_parent__parent_organization__translation_org__language",
                "project_parent__parent_user__user_profile",
            )
            .get(url_slug=event_slug)
        )
    except Project.DoesNotExist:
        logger.error(
            "[OrganizerEmail] Project '%s' not found — aborting bulk send", event_slug
        )
        return

    # TODO #1850: user_ids already captures a snapshot at request time, but once
    # cancelled_at exists the view's queryset should pre-filter cancelled rows
    # so they never enter user_ids in the first place.
    users = (
        User.objects.select_related("user_profile__location")
        .filter(id__in=user_ids)
    )

    for user in users:
        try:
            send_organizer_message_to_guest(user, project, subject, message)
        except Exception as exc:
            logger.error(
                "[OrganizerEmail] Failed to send to user %s for event '%s': %s",
                user.id,
                event_slug,
                exc,
            )
            raise self.retry(exc=exc)

    logger.info(
        "[OrganizerEmail] Sent organiser email to %d guests for event '%s'",
        len(user_ids),
        event_slug,
    )
```

#### View — `SendOrganizerEmailView`

New view in `organization/views/event_registration_views.py`.

```python
class SendOrganizerEmailView(APIView):
    """
    POST /api/projects/{url_slug}/registrations/email/

    Sends an organiser-authored email to all active event guests (is_test=False)
    or a test copy to the authenticated organiser (is_test=True).

    Response for is_test=False: { "sent_count": <int> }
    Response for is_test=True:  { "sent_to": "<email>" }
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, url_slug):
        # 1. Validate input
        serializer = SendOrganizerEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        subject = serializer.validated_data["subject"]
        message = serializer.validated_data["message"]
        is_test = serializer.validated_data["is_test"]

        # 2. Look up project
        try:
            project = Project.objects.get(url_slug=url_slug)
        except Project.DoesNotExist:
            return Response(
                {"message": f"Project not found: {url_slug}"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # 3. Permission check (inline, consistent with ListEventParticipantsView)
        has_edit_rights = ProjectMember.objects.filter(
            user=request.user,
            role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE],
            project=project,
        ).exists()
        if not has_edit_rights:
            return Response(
                {"message": "You do not have permission to send emails for this event."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # 4. Look up EventRegistration
        try:
            er = project.event_registration
        except EventRegistration.DoesNotExist:
            return Response(
                {"message": "This project does not have event registration enabled."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if is_test:
            # Synchronous — single email to the organiser themselves
            organiser = (
                User.objects.select_related("user_profile__location")
                .get(id=request.user.id)
            )
            try:
                send_organizer_message_to_guest(organiser, project, subject, message)
            except Exception as exc:
                logger.error(
                    "[OrganizerEmail] Test send failed for user %s, event '%s': %s",
                    request.user.id,
                    url_slug,
                    exc,
                )
                return Response(
                    {"message": "Failed to send test email. Please try again."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            return Response({"sent_to": request.user.email}, status=status.HTTP_200_OK)

        # Bulk send — count first, then dispatch async
        # TODO #1850: add .filter(cancelled_at__isnull=True) once cancelled_at is added
        participants = (
            EventParticipant.objects
            .select_related("user")
            .filter(event_registration=er)
        )
        user_ids = list(participants.values_list("user_id", flat=True))
        sent_count = len(user_ids)

        send_organizer_message_to_guests.delay(
            event_slug=url_slug,
            user_ids=user_ids,
            subject=subject,
            message=message,
        )

        return Response({"sent_count": sent_count}, status=status.HTTP_200_OK)
```

#### URL

Add to `organization/urls.py`:

```python
path(
    "projects/<str:url_slug>/registrations/email/",
    event_registration_views.SendOrganizerEmailView.as_view(),
    name="send-organizer-email-to-guests",
),
```

#### Settings — new env variables

Add to `climateconnect_main/settings.py` (next to the existing `EVENT_REGISTRATION_CONFIRMATION_TEMPLATE_ID` block):

```python
EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID = env(
    "EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID", ""
)
EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID_DE = env(
    "EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID_DE", ""
)
```

Add to `.backend_env` (and to the Azure App Service configuration in production):
```
EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID=<mailjet-template-id-en>
EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID_DE=<mailjet-template-id-de>
```

#### Mailjet template (action item — not code)

Two new Mailjet templates (EN and DE) must be created before this feature goes to production. Required template variables:

| Variable | Description |
|----------|-------------|
| `FirstName` | Recipient's first name |
| `EventTitle` | Event name (localised for the recipient) |
| `EventUrl` | Language-aware URL to the event page |
| `OrganizerSubject` | The subject text entered by the organiser |
| `OrganizerMessage` | The plain-text body entered by the organiser |

The email envelope subject should be set directly to the organiser's subject (no wrapping platform prefix).

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
| `organization/utility/email.py` | Add `send_organizer_message_to_guest(user, project, subject, message)` helper |
| `organization/tasks.py` | Add `send_organizer_message_to_guests` Celery task |
| `organization/views/event_registration_views.py` | Add `SendOrganizerEmailView` |
| `organization/urls.py` | Add URL pattern for `POST /api/projects/{url_slug}/registrations/email/` |
| `climateconnect_main/settings.py` | Add `EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID` and `EVENT_ORGANIZER_MESSAGE_TEMPLATE_ID_DE` |
| `organization/tests/test_event_registration.py` | Add tests for `SendOrganizerEmailView` |

### Frontend

| File | Change |
|------|--------|
| `src/components/project/ProjectRegistrationsContent.tsx` | Add `sendEmailOpen` state; add `onSendEmail` prop to `RegistrationsToolbar`; add "Email guests" button to toolbar; render `<SendEmailToGuestsModal>` |
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
| 9 | `is_test=true` | 200 OK, `{"sent_to": "<organiser email>"}`; `send_organizer_message_to_guest` called once with organiser user |
| 10 | Team admin (not creator) with `read_write_type` role, `is_test=false` | 200 OK |
| 11 | Celery task: project not found | logs error, does not raise |
| 12 | Celery task: mail delivery fails | retries up to 3 times; raises after max retries |
| 13 | `select_related` used in task | query count does not grow with number of recipients |

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
| 10 | "Send test" succeeds | confirmation "Test email sent to you@example.com." shown |
| 11 | API returns error | general error message shown below form |
| 12 | Click "Close" after confirmation | modal closes |
| 13 | User without admin rights | "Email guests" button not visible (Registrations tab not shown per `ProjectPageRoot.tsx`) |

---

## Dependency Notes

- **Depends on** [#1845](https://github.com/climateconnect/climateconnect/issues/1845): `EventParticipant` entity must exist.
- **Depends on** [`20260401_1000_organizer_see_registration_status.md`](./20260401_1000_organizer_see_registration_status.md): `ProjectRegistrationsContent.tsx` with `RegistrationsToolbar` must exist (DONE).
- **Future reminder — cancellation [#1850](https://github.com/climateconnect/climateconnect/issues/1850)**: cancellation is not yet implemented and is not a dependency for this story. When [#1850](https://github.com/climateconnect/climateconnect/issues/1850) eventually ships `cancelled_at`, the queries in both `SendOrganizerEmailView` and the `send_organizer_message_to_guests` Celery task must be updated to add `.filter(cancelled_at__isnull=True)`. The `# TODO #1850` comments in the code mark both locations.
- **Action item** (non-code): two Mailjet templates (EN + DE) must be created and their IDs configured in `settings.py` before the feature can send real emails. The backend will not error without them — `send_email` logs a warning if the template ID is blank — but no emails will be delivered.
- **Update Epic** [`EPIC_event_registration.md`](./EPIC_event_registration.md): change the row "Organiser sends email to all registered guests" from `⚪ Not started` to `📝 Draft` after this spec is reviewed.

---

## Log

- 2026-04-01 11:00 — Task created from product-backlog issue #55. Problem statement, AI insights, and full software architecture documented.


# Send Event Email Only to New Guests Since Last Message

**Status**: DRAFT — decisions resolved  
**Type**: Backend + Frontend — feature  
**Epic**: Event Management V3  
**Date created**: 2026-06-10  
**GitHub Issue**: [#2042](https://github.com/climateconnect/climateconnect/issues/2042)  
**Depends on**:  
- Rich Text Organizer Email to Guests spec (`doc/spec/20260609_0830_rich_text_organizer_email_to_guests.md`) — the TipTap editor and expanded sanitisation must be in place
- Existing "send email to guests" feature (`SendOrganizerEmailView`, Celery task `send_organizer_message_to_guests`)

---

## Problem Statement

Event organisers can send bulk emails to all registered guests via the "Email guests" button on the Registrations tab. Today, every bulk send goes to **all active guests** — regardless of when they registered.

When an organiser sends a message (e.g. "Bring warm clothes, here is the meeting point"), and ten new guests register afterwards, sending a follow-up message means **everyone** receives it — including guests who already got the first one. This creates:

- **Duplicate information**: Existing guests receive the same (or similar) instructions again, leading to confusion or annoyance.
- **Organiser hesitation**: Organisers avoid sending follow-up messages because they don't want to spam existing guests. Important information goes unsent.
- **No awareness of "who is new"**: The modal shows the total active guest count but gives the organiser no way to target a subset.

### Why it matters

- **Guest experience**: Receiving duplicate event emails erodes trust. Guests may unsubscribe or ignore future messages.
- **Organiser confidence**: Knowing that a message goes only to new signups encourages organisers to send timely, relevant updates.
- **Engagement**: Timely, targeted communication increases event attendance and reduces no-shows.

---

## Core Requirements

### What we're building

Add a **"Send only to new guests"** toggle to the `SendEmailToGuestsModal`. When enabled, the bulk email is sent only to guests who registered **after** the last time the organiser sent a bulk email to this event's guests.

The feature requires:
1. A new `last_guest_email_sent_at` timestamp on `EventRegistrationConfig` — records when the last non-test bulk email was sent.
2. A new `send_to_new_guests_only` boolean parameter in the send-email API.
3. Backend filtering of recipients based on `registered_at > last_guest_email_sent_at`.
4. Frontend toggle with contextual information (date of last send, count of new vs total guests).

### Data flow

```
Organiser opens "Email guests" modal
  → Frontend reads last_guest_email_sent_at from EventRegistrationConfig
  → Computes newGuestCount = registrations where registered_at > last_guest_email_sent_at AND cancelled_at is NULL

  → If last_guest_email_sent_at is NULL (never sent before):
      → Toggle is hidden. "Send to all N active guests" (current behavior)

  → If last_guest_email_sent_at exists AND newGuestCount > 0:
      → Toggle shown: "Send only to new guests (registered since [formatted date])"
      → Toggle OFF (default): "All N active guests will receive this message"
      → Toggle ON: "M of N guests registered since [date] will receive this message"

  → If last_guest_email_sent_at exists AND newGuestCount = 0:
      → Toggle is hidden (nothing to offer — only non-new guests exist)
      → Modal behaves identically to "no prior send" state: send to all N active guests

Organiser composes message and clicks "Send now" → "Confirm and send"
  → POST /api/projects/{slug}/registrations/email/
      { subject, message, is_test: false, send_to_new_guests_only: true/false }
  → Backend validates
  → If send_to_new_guests_only:
      → Filter: EventRegistration.objects.filter(
          registration_config=rc,
          cancelled_at__isnull=True,
          registered_at__gt=rc.last_guest_email_sent_at
        )
  → Else:
      → All active guests (current behavior)
  → Combine with team admins (deduped)
  → Dispatch Celery task
  → Update rc.last_guest_email_sent_at = now()
  → Return { sent_count }
```

---

## System Impact

### Actors Involved

- **Backend Developer**: Add model field, migration, serializer/view changes, Celery task update, tests
- **Frontend Developer**: Add toggle to modal, display date/count info, handle empty-state, API integration
- **Product Team**: No manual steps required (no template changes)

### Entities Changed

| Layer | File | Change |
|-------|------|--------|
| Backend model | `backend/organization/models/event_registration.py` | Add `last_guest_email_sent_at` (`DateTimeField(null=True, blank=True, default=None)`) to `EventRegistrationConfig` |
| Backend migration | `backend/organization/migrations/XXXX_add_last_guest_email_sent_at.py` | Auto-generated migration adding the nullable field (no data backfill needed) |
| Backend serializer | `backend/organization/serializers/event_registration.py` | `SendOrganizerEmailSerializer`: add `send_to_new_guests_only` (BooleanField, default=False). `EventRegistrationConfigSerializer` (or equivalent read serializer): include `last_guest_email_sent_at` |
| Backend view | `backend/organization/views/event_registration_views.py` | `SendOrganizerEmailView.post()`: branch recipient query based on `send_to_new_guests_only`, update `last_guest_email_sent_at` after dispatch |
| Backend tests | `backend/organization/tests/test_event_registration_organiser_email.py` | New test cases for filtered send, timestamp update, edge cases |
| Frontend component | `frontend/src/components/project/SendEmailToGuestsModal.tsx` | Add toggle, date display, new-guest count logic, API payload change |
| Frontend component | `frontend/src/components/project/ProjectRegistrationsContent.tsx` | Pass `lastGuestEmailSentAt` from config to modal |

### Flows **not** affected

- **Test send** (`is_test: true`): Always sends to the organiser only. Does **not** update `last_guest_email_sent_at`.
- **Registration confirmation email**: No change.
- **Admin notification email**: No change.
- **Cancel guest registration message**: No change.
- **Individual registration/cancellation flows**: No change.

---

## Acceptance Criteria

### AC-1: New field on EventRegistrationConfig

`EventRegistrationConfig` has a `last_guest_email_sent_at` field:
- Type: `DateTimeField(null=True, blank=True, default=None)`
- Nullable: Yes — NULL means no bulk email has ever been sent for this event.
- Indexed: Yes — used in query filtering.
- Migration applies cleanly with no data backfill (NULL is the correct default for all existing rows).

### AC-2: Backend filters recipients

When `send_to_new_guests_only` is `True` in the POST request:
- The recipient query adds `registered_at__gt=rc.last_guest_email_sent_at` to the filter.
- Only active guests (cancelled_at is NULL) who registered after the last bulk email send are included.
- Team admins are still included (they always receive a copy, regardless of toggle).
- If `last_guest_email_sent_at` is NULL (never sent before), the backend ignores the flag and sends to all active guests (defensive — the frontend hides the toggle in this case, but the backend must handle a direct API call gracefully).

### AC-3: Timestamp updated after bulk send

After a successful non-test bulk email dispatch:
- `EventRegistrationConfig.last_guest_email_sent_at` is set to `timezone.now()`.
- This happens in the view, after the Celery task is dispatched (same pattern as returning `sent_count`).
- Test sends (`is_test: true`) do **not** update this timestamp.

### AC-4: Frontend toggle with contextual information

The `SendEmailToGuestsModal` shows:
- **When `last_guest_email_sent_at` is NULL**: No toggle is shown. The modal behaves exactly as it does today ("Send to all N active guests").
- **When `last_guest_email_sent_at` has a value AND there are new guests** (`newGuestCount > 0`):
  - A toggle/checkbox: "Send only to new guests (registered since [formatted date])"
  - The date is formatted using the organiser's locale (e.g. "June 5, 2026" or "5. Juni 2026").
  - Below the toggle:
    - **Toggle OFF (default)**: "All N active guests will receive this message"
    - **Toggle ON**: "M of N guests registered since [date] will receive this message"
- **When `last_guest_email_sent_at` has a value AND there are NO new guests** (`newGuestCount = 0`):
  - The toggle is **hidden**. There is nothing to offer — all current guests have already received the last message. The modal behaves as if no prior send exists: organiser can send to all N active guests.
  - UX rationale: only offer choices that are actionable. A visible-but-disabled toggle creates unclear signals; a hidden toggle keeps the interface clean.

### AC-5: Recipient count reflects filtered list

The confirmation step ("You are about to send this message to N people") shows the correct count based on whether the toggle is on or off. The count updates reactively when the toggle changes (no extra API call — the frontend has the registrations list and can compute this client-side).

### AC-6: API request includes new parameter

The POST to `/api/projects/{slug}/registrations/email/` includes `send_to_new_guests_only` (boolean, default `false`). The backend serializer validates it.

### AC-7: Edge case — all guests are new

If `last_guest_email_sent_at` exists but all current active guests registered after that date (`newGuestCount === activeGuestCount`), the toggle ON state shows "All N active guests will receive this message" (same as toggle OFF). The send proceeds normally.

### AC-8: Edge case — no new guests

If `last_guest_email_sent_at` exists and no active guests registered after it (`newGuestCount === 0`):
- The toggle is **not shown**. The modal looks identical to the "never sent before" state.
- The organiser can still send to all active guests (current default behaviour).
- No disabled controls, no confusing messages — the UI simply doesn't offer a choice that has no effect.

### AC-9: Backend tests

New test cases in `test_event_registration_organiser_email.py`:

1. **Filtered send — new guests only**: Create registrations before and after setting `last_guest_email_sent_at`. Send with `send_to_new_guests_only=True`. Assert only newer registrations are included in the Celery task's user_ids.
2. **Filtered send — all guests**: Same setup, send with `send_to_new_guests_only=False`. Assert all active guests are included.
3. **Timestamp update**: After a non-test send, assert `rc.last_guest_email_sent_at` is updated to approximately `now()`.
4. **Test send does NOT update timestamp**: After `is_test=True` send, assert `last_guest_email_sent_at` is unchanged.
5. **First send (NULL timestamp)**: `last_guest_email_sent_at` is NULL. Send with `send_to_new_guests_only=True`. Assert all active guests are included (graceful fallback).
6. **Cancelled guests excluded**: Ensure cancelled registrations are not included even if their `registered_at > last_guest_email_sent_at`.
7. **Admin deduplication still works**: Admin who is also a guest is not emailed twice.

### AC-10: Frontend tests

Updated tests in `SendEmailToGuestsModal.test.tsx`:

1. Toggle hidden when `lastGuestEmailSentAt` is null.
2. Toggle shown with formatted date when `lastGuestEmailSentAt` has a value AND newGuestCount > 0.
3. Toggle hidden when `lastGuestEmailSentAt` has a value BUT newGuestCount === 0.
4. Recipient count updates when toggle is changed.
5. Toggle defaults to OFF.
6. API payload includes `send_to_new_guests_only: true` when toggle is on.
7. API payload includes `send_to_new_guests_only: false` (or omits it) when toggle is off.

---

## Constraints

- **No message history storage**: This spec stores only a single timestamp (`last_guest_email_sent_at`), not the message content or a history of sends. The issue explicitly notes this as the simpler approach. Full message history can be a follow-up if needed.
- **No new Celery tasks**: The existing `send_organizer_message_to_guests` task is reused. The only change is the filtered user_ids list passed to it.
- **Timestamp granularity**: `DateTimeField` stores timezone-aware timestamps. Two sends within the same second are theoretically possible but practically irrelevant for this feature.
- **No retroactive filtering**: The `last_guest_email_sent_at` starts as NULL for all existing events. The first bulk send after this feature ships will go to all guests (current behavior), and subsequent sends can use the toggle. No backfill of historical send dates.
- **Admin recipients are unconditional**: Team admins always receive a copy of every bulk email, regardless of the toggle state. This is the existing behaviour and is preserved.
- **i18n**: The toggle label and info messages must be translated (EN + DE). Date formatting uses the user's locale via the existing i18n infrastructure.

---

## Domain Context

### How `EventRegistrationConfig` is fetched in the frontend

The `ProjectRegistrationsContent.tsx` component fetches the event's registration config (including fields like `status`, `max_participants`, etc.) as part of the registrations page data. The `last_guest_email_sent_at` field will be included in the existing serializer response — no new API endpoint needed.

### How the `SendEmailToGuestsModal` currently receives data

The modal receives `activeGuestCount` as a prop from the parent. For this feature, the parent also passes:
- `lastGuestEmailSentAt: string | null` — the ISO timestamp from the config (null if never sent)
- The full registrations list is available in the parent; the modal can compute the filtered count client-side

### How the Celery task works

`send_organizer_message_to_guests` receives `user_ids` as a list. The view constructs this list by querying `EventRegistration`. The only change is adding `registered_at__gt=rc.last_guest_email_sent_at` to the query when the toggle is on. The Celery task itself requires **no changes** — it just iterates over whatever user_ids it receives.

### The "send to all" default

When `send_to_new_guests_only` is `False` (or absent), the behaviour is identical to the current implementation: all active guests + all team admins, deduplicated. This is the default for the confirmation step and for any caller that doesn't pass the flag.

---

## Open Questions

None — all decisions resolved during spec review:

1. **Toggle default state**: OFF by default. The more common use case is updates for all guests; the toggle is an opt-in for the "new guests only" scenario.
2. **Admin copy on filtered send**: Admins always receive a copy. They need visibility into all outgoing communications.
3. **"No new guests" behaviour**: Hide the toggle entirely when `newGuestCount === 0`. Only offer actionable choices. No disabled controls or confusing messages.

---

## Implementation Notes

### Backend: Model change

File: `backend/organization/models/event_registration.py`

Add to `EventRegistrationConfig`:

```python
last_guest_email_sent_at = models.DateTimeField(
    null=True,
    blank=True,
    default=None,
    help_text="Timestamp of the last bulk email sent to event guests. NULL if no email has been sent.",
)
```

### Backend: Serializer change

File: `backend/organization/serializers/event_registration.py`

In `SendOrganizerEmailSerializer`, add:

```python
send_to_new_guests_only = serializers.BooleanField(default=False, required=False)
```

In the config read serializer (used to expose config data to the frontend), add `last_guest_email_sent_at`.

### Backend: View change

File: `backend/organization/views/event_registration_views.py` — `SendOrganizerEmailView.post()`

After the existing guest query, add conditional filtering:

```python
# Existing query
guest_qs = EventRegistration.objects.filter(
    registration_config=rc,
    cancelled_at__isnull=True,
)

# Apply new-guests-only filter
if serializer.validated_data.get("send_to_new_guests_only") and rc.last_guest_email_sent_at:
    guest_qs = guest_qs.filter(registered_at__gt=rc.last_guest_email_sent_at)

user_ids = guest_qs.values_list("user_id", flat=True)
```

After dispatching the Celery task (non-test only), update the timestamp:

```python
if not is_test:
    rc.last_guest_email_sent_at = timezone.now()
    rc.save(update_fields=["last_guest_email_sent_at"])
```

### Frontend: Modal changes

File: `frontend/src/components/project/SendEmailToGuestsModal.tsx`

- Accept `lastGuestEmailSentAt: string | null` and `registrations: EventRegistration[]` as new props (or derive from existing props).
- Add state: `const [sendToNewGuestsOnly, setSendToNewGuestsOnly] = useState(false)`.
- Compute `newGuestCount` by filtering registrations where `registered_at > lastGuestEmailSentAt && cancelled_at === null`.
- Determine `showToggle = lastGuestEmailSentAt !== null && newGuestCount > 0`.
- Render a `FormControlLabel` with `Switch` or `Checkbox` only when `showToggle` is true.
- Show contextual text based on toggle state and counts.
- Include `send_to_new_guests_only: sendToNewGuestsOnly` in the API request payload.
- When `showToggle` is false, `sendToNewGuestsOnly` remains `false` (send to all — current behaviour).

### Frontend: Parent component

File: `frontend/src/components/project/ProjectRegistrationsContent.tsx`

Pass `lastGuestEmailSentAt` from the registration config data to the modal. The registrations list is already available in this component.

---

## AI Agent Insights and Additions

### Why a single timestamp, not a message log

The issue context explicitly considers both approaches:

1. **Simple**: Store `last_email_sent_at` on the config, filter by `registered_at` comparison.
2. **Extensive**: Store each message (content, timestamp, recipients) in a new model — essentially reusing or extending the platform's existing chat/messaging system.

The simple approach is the right first step because:
- It solves the user problem with minimal complexity (one nullable field, one new API parameter, one UI toggle).
- It avoids building a "messaging system within event registration" (issue context explicitly warns against this).
- It requires no new database tables.
- The extensive approach can be layered on later if message history proves valuable.

### Why `EventRegistrationConfig`, not `EventRegistration`

The timestamp is per-event, not per-guest. It answers: "When did the organiser last email guests for this event?" Storing it on `EventRegistrationConfig` (one per event) is correct. Storing it on `EventRegistration` (one per guest) would be wrong — it would mean different guests have different "last email" timestamps, which doesn't match the semantics.

### Why update the timestamp in the view, not the Celery task

Updating `last_guest_email_sent_at` in the view (after `.delay()`) is consistent with the existing pattern: `sent_count` is also computed in the view, not the task. The Celery task has retry logic, so even if the first attempt fails, it will retry. The timestamp represents "when the organiser initiated the send" not "when the last email was actually delivered" — these are practically identical and the distinction is not worth the added complexity.

### Why not filter admins too

Admins always receive a copy as an audit trail — they need to know what communications go out to their event's guests. Filtering admins based on `registered_at` makes no sense because admins don't "register" for their own events. The deduplication logic (admin who is also a guest) still applies: if an admin registered after the last send, they appear in both sets but are emailed once.

### Computed approach for the "new guest count" in the frontend

The parent component (`ProjectRegistrationsContent`) already loads the full registrations list (active + cancelled). The modal can compute the filtered count client-side without an extra API call:

```ts
const newGuestCount = registrations.filter(
  (r) => r.cancelled_at === null && new Date(r.registered_at) > new Date(lastGuestEmailSentAt)
).length;
```

This is fast (typically tens to low hundreds of registrations) and avoids an extra roundtrip.

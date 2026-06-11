# .ics Attachment in Registration Confirmation Email

**Date**: 2026-06-11  
**Status**: DRAFT  
**Type**: Backend — new feature  
**GitHub Issue**: —  

---

## Problem Statement

When a guest registers for an event, the confirmation email contains no calendar information. The guest must manually create a calendar entry with the event details. This is a friction point that risks guests forgetting about the event or entering incorrect times.

### Why it matters

- **Reduces no-shows**: Calendar reminders are the most reliable way to ensure guests attend.
- **Frictionless one-click add**: Email clients like Apple Mail, Outlook, and Gmail detect .ics attachments and surface a one-click "Add to Calendar" action — no link clicking or file downloading required.
- **Self-contained**: The .ics attachment makes the email fully independent of any website feature. No dependency on frontend endpoints.

### Current state

- The registration confirmation email (`send_event_registration_confirmation_to_user` in `organization/utility/email.py`) sends template variables (FirstName, EventTitle, EventUrl, StartDate, etc.) to a Mailjet template.
- The email currently contains no calendar-related content — no links, no attachments.
- The Mailjet Send API v3.1 (already in use via `mailjet_rest.Client(version="v3.1")`) supports file attachments via the `Attachments` field.
- The Python `icalendar` library will need to be added as a project dependency.
- All event data needed for .ics generation is already fetched in the Celery task.

---

## Scope

### In scope

1. Generate an .ics file for the event in the confirmation email Celery task.
2. Attach the .ics file to the confirmation email via the Mailjet `Attachments` API.
3. Extend the `send_email()` helper to support optional attachments (backwards-compatible).

### Out of scope (for now)

- **Calendar links in the email body** (Google Calendar, Outlook, Apple Calendar URLs). These depend on frontend endpoints covered by a separate task (`20260611_1131_calendar_links_on_event_page.md`). Can be added as a future enhancement once those endpoints exist.
- Personalised .ics with timeslot data (requires per-user auth or signed token URLs).
- .ics attachments in other email types (organiser notifications, admin alerts, etc.).

---

## Acceptance Criteria

### AC-1: .ics attachment in confirmation email

When a guest registers for an event, the confirmation email includes an .ics file as a standard MIME attachment.

**iCal content:**
- `VCALENDAR` with `PRODID`, `VERSION`, and `METHOD:PUBLISH`
- `VEVENT` with:
  - `UID` — `{event_id}@climateconnect.earth` (globally unique)
  - `SUMMARY` — event name, localised for the user's language
  - `DTSTART` / `DTEND` — event's overall `start_date` / `end_date` in UTC
  - `LOCATION` — reuses the `LocationName` value already computed for the email template (see "Location formatting" in Domain Context).
  - `DESCRIPTION` — event description + link back to the event page
  - `URL` — link to the event page
- `METHOD:PUBLISH` — one-way event publication (no RSVP expected; the guest already registered)

**Attachment metadata:**
- Filename: `{event_slug}.ics`
- Content-Type: `text/calendar; method=PUBLISH; charset=utf-8`
- Content: Base64-encoded .ics content

### AC-2: Edge cases

- Online events (`is_online=True`): `LOCATION` is "Online". (Online events do have an associated physical location for hub purposes, but the calendar entry should reflect that the event itself is online.)
- Event with `is_online=True` and a `website` URL: the event URL is included in `DESCRIPTION`.
- Event name or location contains special characters (commas, semicolons, backslashes): properly escaped per RFC 5545. The `icalendar` library handles this automatically.
- Event with no location: `LOCATION` is omitted from the .ics. (The `get_location_name()` function returns an empty string in this case.)

---

## Constraints

- **.ics generation in Python** — uses the `icalendar` library (PyPI). Generates the .ics content in the Celery task, using event data already fetched for the email template variables. No additional database queries.
- **Mailjet attachment format** — the `Attachments` field on the message object accepts `[{"Content-type": "...", "Filename": "...", "Content": "<base64>"}]`. Content must be Base64-encoded.
- **No multiple calendar formats** — `.ics` (iCalendar / RFC 5545) is the only format. Universally supported by all major calendar apps.
- **i18n** — `SUMMARY` and `DESCRIPTION` use the user's language (via `get_user_lang_code`). `LOCATION` reuses the already-translated `LocationName` template variable. Consistent with existing email localisation.
- **Performance** — .ics generation uses data already fetched for the email template. No additional database queries. The `icalendar` library is lightweight.

---

## Domain Context

### Location formatting

The `LOCATION` field in the .ics reuses the same `LocationName` value that is already computed for the email template variable. The `get_location_name(project, lang_code)` function (in `organization/utility/email.py`) returns:

- `"Online"` for online events (`is_online=True`).
- The translated `Location.name` (via `get_translated_location_name()`) when a location exists and a language code is provided. The `LocationTranslation` model stores localised values for `name`, `city`, `state`, and `country`. Falls back to the canonical `Location.name` when no translation exists.
- An empty string when the event has no location.

This is already fetched and computed in the Celery task for the `LocationName` email template variable. The .ics generation reuses the same value — no additional queries or formatting logic needed.

### How emails are sent

Emails are sent from Django via Mailjet transactional templates. The existing `send_email()` helper in `climateconnect_api/utility/email.py` builds a message dict with template variables and calls `mailjet_send_api.send.create(data=data)`.

The `send_email()` function does not currently support attachments. The approach is to add an optional `attachments` parameter:

```python
def send_email(
    user,
    variables,
    template_key,
    subjects_by_language,
    should_send_email_setting,
    notification,
    hub_url=None,
    attachments=None,  # NEW: optional list of attachment dicts
):
```

When `attachments` is provided, it's included in the message dict as `"Attachments": attachments`. Existing callers pass no attachments — fully backwards-compatible.

Alternative: build the Mailjet API call directly in the confirmation email function (like `send_feedback_email` does). But extending `send_email()` is preferred for consistency.

### Mailjet attachment format

```python
"Attachments": [
    {
        "Content-type": "text/calendar; method=PUBLISH; charset=utf-8",
        "Filename": "event-slug.ics",
        "Content": "<base64-encoded .ics content>"
    }
]
```

The `Content` field is a Base64-encoded string. Generated with `base64.b64encode(ics_bytes).decode("ascii")`.

### .ics content structure

The .ics file follows RFC 5545:

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Climate Connect//EN
METHOD:PUBLISH
BEGIN:VEVENT
UID:{event_id}@climateconnect.earth
SUMMARY:{event name}
DTSTART:20260620T090000Z
DTEND:20260620T170000Z
LOCATION:{formatted location string or "Online"}
DESCRIPTION:{event description}\n\n{event URL}
URL:{event URL}
END:VEVENT
END:VCALENDAR
```

- `UID` uses the event's database ID + domain for global uniqueness.
- `DTSTART`/`DTEND` are in UTC (ISO 8601 format). Events always have `start_date` and `end_date` — the fields are nullable in the Django model but validation ensures they are set.
- `LOCATION` reuses the `LocationName` template variable (see "Location formatting" above).
- `DESCRIPTION` includes the event description text and a link back to the event page, separated by `\n\n`.

### Confirmation email Celery task

The .ics generation happens in the `send_event_registration_confirmation_email` Celery task (in `organization/tasks.py`). This task already fetches the event data and builds template variables. The .ics generation uses the same data — no additional queries.

The task is dispatched via `transaction.on_commit` from the registration view.

---

## Open Questions

(none)

---

## Research Notes

### Python `icalendar` library

- **Package**: [`icalendar`](https://pypi.org/project/icalendar/) on PyPI
- **License**: BSD-2-Clause
- **Status**: Production/Stable
- **Maintainer**: Plone Foundation
- **Python**: 3.10+
- **Dependencies**: `python-dateutil`, `tzdata`
- **RFC compliance**: RFC 5545

Usage:

```python
from icalendar import Calendar, Event
import base64
from datetime import datetime, timezone

cal = Calendar()
cal.add("prodid", "-//Climate Connect//EN")
cal.add("version", "2.0")
cal.add("method", "PUBLISH")

event = Event()
event.add("summary", "Climate Action Summit")
event.add("dtstart", datetime(2026, 6, 20, 9, 0, tzinfo=timezone.utc))
event.add("dtend", datetime(2026, 6, 20, 17, 0, tzinfo=timezone.utc))
event.add("location", "Town Hall, Main St 1, Berlin, Germany")
event.add("description", "Join us for...\n\nhttps://climateconnect.earth/projects/summit")
event.add("url", "https://climateconnect.earth/projects/summit")
event.add("uid", "123@climateconnect.earth")

cal.add_component(event)
ics_bytes = cal.to_ical()
ics_base64 = base64.b64encode(ics_bytes).decode("ascii")
```

### Why not generate .ics via the Next.js endpoint?

The Celery task could theoretically call the Next.js `.ical` endpoint to get the .ics content. But this adds an HTTP roundtrip, a dependency on the frontend being available, and complexity for error handling. Generating the .ics directly in Python is simpler, faster, and more reliable. The event data is already available in the task.

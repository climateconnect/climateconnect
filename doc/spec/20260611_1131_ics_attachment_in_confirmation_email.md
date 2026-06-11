# .ics Attachment in Registration Confirmation Email

**Date**: 2026-06-11  
**Status**: IMPLEMENTED  
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
- The Python `icalendar` library has been added as a project dependency.
- All event data needed for .ics generation is already fetched in the Celery task.

---

## Scope

### In scope

1. Generate an .ics file for the event in the confirmation email Celery task.
2. Attach the .ics file to the confirmation email via the Mailjet `Attachments` API.
3. Extend the `send_email()` helper to support optional attachments (backwards-compatible).
4. Include the guest's registration field answers (especially timeslots) as plain text in the iCalendar DESCRIPTION.
5. Use the event's `website` URL as the iCal `URL` property for online events.
6. Generate separate per-timeslot .ics attachments so guests can add individual sessions to their calendar independently.

### Out of scope (for now)

- **Calendar links in the email body** (Google Calendar, Outlook, Apple Calendar URLs). These depend on frontend endpoints covered by a separate task (`20260611_1131_calendar_links_on_event_page.md`). Can be added as a future enhancement once those endpoints exist.
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
  - `DESCRIPTION` — event description (HTML stripped) + plain-text field answers + localised CTA text + link to the event page (see "DESCRIPTION structure" below).
  - `URL` — for online events with a `website` set: the event website URL (e.g. Zoom link). For all other events: the Climate Connect event page URL.
- `METHOD:PUBLISH` — one-way event publication (no RSVP expected; the guest already registered)

**Attachment metadata:**
- Filename: `{event_slug}.ics`
- `ContentType`: `text/calendar; method=PUBLISH; charset=utf-8`
- `Base64Content`: Base64-encoded .ics content

### AC-2: Per-timeslot .ics attachments

When a guest has selected timeslot field answers during registration, a separate .ics file is generated for each timeslot. This allows guests to add individual sessions to their calendar independently of the overall event.

**iCal content (per timeslot):**
- `VCALENDAR` with `PRODID`, `VERSION`, and `METHOD:PUBLISH`
- `VEVENT` with:
  - `UID` — `{registration_id}_{field_id}@climateconnect.earth` (unique per timeslot answer)
  - `SUMMARY` — localised: "My timeslot at {event name}" (EN) / "Mein Zeitfester bei {event name}" (DE)
  - `DTSTART` / `DTEND` — the timeslot option's `start_time` / `end_time`
  - `DESCRIPTION` — localised CTA text + event page URL (no field answers repeated)
  - `URL` — same logic as the main event .ics (online website or event page)

**Attachment metadata:**
- Filename: `{event_slug}_{option-title-slug}.ics` (e.g. `workshop-day_morning-session.ics`)
- `ContentType`: `text/calendar; method=PUBLISH; charset=utf-8`
- `Base64Content`: Base64-encoded .ics content

**Behaviour:**
- Multiple timeslot fields each produce their own .ics files (e.g. "Day 1" and "Day 2" → two files).
- Timeslot options without `start_time` / `end_time` are skipped.
- Non-timeslot field types (checkbox, option select, inventory) are ignored.

### AC-3: Edge cases

- Online events (`is_online=True`): `LOCATION` is "Online". (Online events do have an associated physical location for hub purposes, but the calendar entry should reflect that the event itself is online.)
- Online event with `is_online=True` and a `website` URL: the iCal `URL` property uses the `website` value (typically a Zoom/meeting link). The DESCRIPTION CTA always links back to the Climate Connect event page.
- Event name or location contains special characters (commas, semicolons, backslashes): properly escaped per RFC 5545. The `icalendar` library handles this automatically.
- Event with no location: `LOCATION` is omitted from the .ics. (The `get_location_name()` function returns an empty string in this case.)
- Event with no `start_date` or `end_date`: no .ics attachment is generated (function returns `None`).
- Project description contains HTML: stripped via `bleach.clean(tags=[], strip=True)` before inclusion in DESCRIPTION.
- Per-timeslot .ics files: each timeslot option becomes its own calendar entry with a unique UID and filename.

---

## Constraints

- **.ics generation in Python** — uses the `icalendar` library (PyPI, `>=5.0.0`). Generates the .ics content in `generate_event_ics_attachment()` and `generate_timeslot_ics_attachments()` in `organization/utility/email.py`, using event data already fetched for the email template variables. No additional database queries.
- **Mailjet attachment format** — the `Attachments` field on the message object accepts `[{"ContentType": "...", "Filename": "...", "Base64Content": "<base64>"}]`. Content must be Base64-encoded. Note: Mailjet v3.1 uses `ContentType` and `Base64Content` (not `Content-type` and `Content`).
- **No multiple calendar formats** — `.ics` (iCalendar / RFC 5545) is the only format. Universally supported by all major calendar apps.
- **i18n** — `SUMMARY`, `DESCRIPTION` field answers heading, and CTA text use the user's language (via `get_user_lang_code`). `LOCATION` reuses the already-translated `LocationName` template variable. Consistent with existing email localisation.
- **Performance** — .ics generation uses data already fetched for the email template. No additional database queries. The `icalendar` library is lightweight.
- **Attachment count** — a registration with N timeslot fields produces 1 (main event) + N (timeslot) attachments. Mailjet supports up to 15 MB total per message; text .ics files are negligible in size.

---

## Domain Context

### Location formatting

The `LOCATION` field in the .ics reuses the same `LocationName` value that is already computed for the email template variable. The `get_location_name(project, lang_code)` function (in `organization/utility/email.py`) returns:

- `"Online"` for online events (`is_online=True`).
- The translated `Location.name` (via `get_translated_location_name()`) when a location exists and a language code is provided. The `LocationTranslation` model stores localised values for `name`, `city`, `state`, and `country`. Falls back to the canonical `Location.name` when no translation exists.
- An empty string when the event has no location.

This is already fetched and computed in the Celery task for the `LocationName` email template variable. The .ics generation reuses the same value — no additional queries or formatting logic needed.

### DESCRIPTION structure (main event .ics)

The iCalendar `DESCRIPTION` field is composed of up to four sections, separated by `\n\n`:

1. **Event description** — the project's `description` field, with HTML stripped via `bleach.clean(tags=[], strip=True)`. Omitted if the project has no description.
2. **Registration field answers** — plain-text bullet-point lines (e.g. `• Workshop: Mon, Jun 20, 10:00 – 12:00 (UTC)`) generated by `_build_field_answers_text()`. Only included when a `registration` object is passed to `generate_event_ics_attachment()`. Omitted if the guest has no field answers.
3. **Localised CTA text** — "Visit the following link to see event details or change your registration:" (EN) or "Besuche folgenden Link, um die Details der Veranstaltung zu sehen oder deine Anmeldung zu ändern:" (DE).
4. **Event page URL** — always the Climate Connect event page URL (`{FRONTEND_URL}/projects/{url_slug}`).

Example DESCRIPTION:

```
Join us for a great event!

Your registration answers:
• Workshop: Mon, Jun 20, 10:00 – 12:00 (UTC)
• T-shirt size: Medium

Besuche folgenden Link, um die Details der Veranstaltung zu sehen oder deine Anmeldung zu ändern:
https://climateconnect.earth/projects/event-slug
```

### DESCRIPTION structure (per-timeslot .ics)

Per-timeslot .ics files have a simpler DESCRIPTION with only two sections:

1. **Localised CTA text** — same as the main event .ics.
2. **Event page URL** — always the Climate Connect event page URL.

Field answers are not repeated in the per-timeslot DESCRIPTION since the timeslot itself is the subject of the calendar entry.

### Per-timeslot .ics generation

The `generate_timeslot_ics_attachments()` function produces a separate .ics attachment for each timeslot field answer in the guest's registration. This allows guests to add individual sessions to their calendar independently.

**How it works:**
1. Iterates through `registration.field_answers.all()`.
2. Filters to `TIME_SLOT_SELECT` fields only.
3. Skips answers where the option has no `start_time` or `end_time`.
4. For each valid timeslot, generates a complete iCalendar file with:
   - `SUMMARY`: localised "My timeslot at {event name}" / "Mein Zeitfester bei {event name}"
   - `DTSTART`/`DTEND`: from the option's times
   - `DESCRIPTION`: CTA + event page URL only
   - `URL`: online website if applicable, otherwise event page
   - `UID`: `{registration_id}_{field_id}@climateconnect.earth`
   - `Filename`: `{event_slug}_{option-title-slug}.ics`

**Example:** A guest registers for "Workshop Day" and selects "Morning Session" (10:00–12:00) from the timeslot field. The email includes:
- `workshop-day.ics` — the overall event (9:00–17:00)
- `workshop-day_morning-session.ics` — the individual timeslot (10:00–12:00)

If the event has two timeslot fields (e.g. "Day 1" and "Day 2"), each produces its own .ics file, resulting in 3 attachments total.

### Registration field answers in .ics (main event)

The `_build_field_answers_text()` function produces a plain-text version of the guest's registration field answers for inclusion in the iCalendar DESCRIPTION. It mirrors the logic of `_build_field_answers_html()` (used in the email body) but outputs bullet-point lines instead of HTML table rows.

Supported field types:
- **Checkbox** — shown as `• {description}: ✓` (only checked checkboxes)
- **Option select** — shown as `• {field title}: {option title}`
- **Inventory** — shown as `• {field title}: {option title} × {quantity}`
- **Time slot select** — shown as `• {field title}: {formatted time range}` (localised via `_format_time_range_localized()`)

The heading is localised: "Your registration answers:" (EN) / "Deine Anmeldeantworten:" (DE).

### How emails are sent

Emails are sent from Django via Mailjet transactional templates. The existing `send_email()` helper in `climateconnect_api/utility/email_setup.py` builds a message dict with template variables and calls `mailjet_send_api.send.create(data=data)`.

The `send_email()` function now supports optional attachments via the `attachments` parameter:

```python
def send_email(
    user,
    variables,
    template_key,
    subjects_by_language,
    should_send_email_setting,
    notification,
    hub_url=None,
    attachments=None,  # optional list of attachment dicts
):
```

When `attachments` is provided, it's included in the message dict as `"Attachments": attachments`. Existing callers pass no attachments — fully backwards-compatible.

### Mailjet attachment format

```python
"Attachments": [
    {
        "ContentType": "text/calendar; method=PUBLISH; charset=utf-8",
        "Filename": "event-slug.ics",
        "Base64Content": "<base64-encoded .ics content>"
    }
]
```

The `Base64Content` field is a Base64-encoded string. Generated with `base64.b64encode(ics_bytes).decode("ascii")`.

Note: Mailjet v3.1 uses `ContentType` and `Base64Content` as the field names (not `Content-type` and `Content` as some documentation suggests).

### .ics content structure (main event)

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
DESCRIPTION:{event description}\n\n{field answers}\n\n{CTA text}\n{event page URL}
URL:{event website URL for online events, or event page URL}
END:VEVENT
END:VCALENDAR
```

- `UID` uses the event's database ID + domain for global uniqueness.
- `DTSTART`/`DTEND` are in UTC (ISO 8601 format). Events always have `start_date` and `end_date` — the fields are nullable in the Django model but validation ensures they are set.
- `LOCATION` reuses the `LocationName` template variable (see "Location formatting" above).
- `DESCRIPTION` includes the event description text (HTML stripped), plain-text field answers, a localised CTA, and a link back to the event page, separated by `\n\n`.
- `URL` uses the event's `website` field for online events (`is_online=True` and `website` is set). For all other events, it uses the Climate Connect event page URL.

### .ics content structure (per-timeslot)

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Climate Connect//EN
METHOD:PUBLISH
BEGIN:VEVENT
UID:{registration_id}_{field_id}@climateconnect.earth
SUMMARY:My timeslot at {event name}
DTSTART:20260620T100000Z
DTEND:20260620T120000Z
DESCRIPTION:{CTA text}\n{event page URL}
URL:{event website URL for online events, or event page URL}
END:VEVENT
END:VCALENDAR
```

- `UID` uses the registration ID + field ID for global uniqueness per timeslot answer.
- `SUMMARY` is localised: "My timeslot at {event name}" (EN) / "Mein Zeitfester bei {event name}" (DE).
- `DTSTART`/`DTEND` come from the timeslot option's `start_time`/`end_time`.
- `DESCRIPTION` contains only the CTA text and event page URL (field answers are not repeated).
- `URL` follows the same logic as the main event .ics.

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

### Google Calendar compatibility

The per-timeslot .ics feature was designed with Google Calendar in mind. Google Calendar handles multiple .ics attachments in a single email by surfacing each as a separate "Add to Calendar" action, allowing the guest to selectively add the overall event and/or individual timeslots. Each .ics file has a unique UID so calendar apps treat them as distinct events even if imported together.

### TODO
- Name attachment for timeslot .ical attachement differently. Maybe event-slug + "_timeslot_" + sequence number + ".ics"
- Add the additional information field of the event project if set to the description of the even .ical file as it is intended to provide more information

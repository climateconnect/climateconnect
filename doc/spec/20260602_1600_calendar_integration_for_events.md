# Calendar Integration for Events

**Date**: 2026-06-02  
**Status**: DRAFT  
**Epic**: [Event Registration](./EPIC_event_registration.md) (Phase 5 — iCal support for events)  
**GitHub Issue**: —

---

## Problem Statement

When a visitor views a Climate Connect event, they have no way to add it to their personal calendar. Guests must manually copy event details into Google Calendar, Apple Calendar, Outlook, or another calendar app. This is a friction point that risks guests forgetting about the event or entering incorrect details.

This applies to all events — whether they have registration enabled or not. The feature is also useful in registration confirmation emails, where the guest already has a clear intent to attend.

### Why it matters

- **Reduces no-shows**: Calendar reminders are the most reliable way to ensure guests attend.
- **Improves UX**: Every major event platform (Eventbrite, Luma, Meetup, Lu.ma) offers calendar integration. Its absence feels like a missing feature.
- **Timeslot personalisation** (future): Events with time slot fields (Phase 4c) have per-guest schedules. A generic event .ics file uses overall event times — the guest's *specific* timeslot could be included via a token-based personalised URL (out of scope for this iteration).

### Current state

- No calendar-related features exist anywhere in the codebase.
- The EPIC already lists "iCal support for events" as a Phase 5 nice-to-have.
- Email templates are Mailjet transactional templates with variable injection — calendar links can be added as new template variables.
- All event data needed for calendar generation is available in the Django models: `Project.name`, `start_date`, `end_date`, `Location` (with coordinates), `is_online`, `additional_loc_info`, and `RegistrationFieldOption.start_time` / `.end_time` for timeslots.

---

## Scope

### In scope

1. **Calendar links on the event page** — visible to all visitors on all events (project type `EV`).
2. **Public `.ical` web endpoint** — a Next.js page at `/projects/{slug}.ical` that returns a valid iCalendar file for the event, using the event's overall start/end times.
3. **Google Calendar and Outlook redirect endpoints** — Next.js pages at `/projects/{slug}/add-to-google-calendar` and `/projects/{slug}/add-to-outlook` that redirect to the provider URL scheme with pre-filled event details.
4. **Calendar links in registration confirmation email** — the same three links (Google, Apple, Outlook) added to the existing confirmation email template.

### Out of scope (for now)

- **Personalised .ics with timeslot data** — requires per-user authentication or a signed token URL. Possible future enhancement: unique-token URLs like `/projects/{slug}?token={unguessable_token}.ical` that embed the user's timeslot selection in the `DESCRIPTION` and adjust `DTSTART`/`DTEND` to the slot times.
- Calendar subscription feeds (recurring .ics feeds for all events an org hosts).
- .ics file attachments in emails (links only, as requested).
- Two-way calendar sync (e.g. Google Calendar API integration).

---

## Acceptance Criteria

### AC-1: Calendar links in confirmation email

When a guest registers for an event, the confirmation email contains three clickable links:
- **"Add to Google Calendar"** — links to `FRONTEND_URL/projects/{slug}/add-to-google-calendar`. A Next.js page that fetches event data and redirects (302) to the Google Calendar URL scheme with pre-filled event details.
- **"Add to Apple Calendar"** — links to `FRONTEND_URL/projects/{slug}.ical`. Serves the `.ics` file directly. On iOS/macOS this triggers the native calendar app; on other platforms it downloads the file.
- **"Add to Outlook"** — links to `FRONTEND_URL/projects/{slug}/add-to-outlook`. A Next.js page that fetches event data and redirects (302) to the Outlook URL scheme with pre-filled event details.

All three links are short, clean frontend URLs — no query params, no URL-encoded event data. The actual provider URL construction happens at redirect time in Next.js `getServerSideProps`, which already has the event data from the Django API. This keeps the email text version clean and avoids stale links if event details change after the email is sent.

The links are plain HTML `<a>` tags — no JavaScript required. They work in all email clients.

### AC-2: Calendar links on event page

On every event detail page, all visitors see a minimalistic "Add to Calendar" control near the event date/time display. The control is a small dropdown/select (calendar icon in an outline button) with three options: Google Calendar, Apple Calendar, Outlook. Keeps the UI compact — the page already has many buttons.

**Priority**: The event page UI is a bonus. The primary deliverable is the calendar links in the confirmation email (AC-1) and the `.ical` / redirect endpoints (AC-3). The event page UI can be iterated on after the email integration ships.

### AC-3: Public .ical endpoint (Next.js)

Next.js serves the `.ical` content directly via a page with `getServerSideProps`. The page fetches event data from the Django API and generates the iCal response using the `ical-generator` library.

**URL patterns:**
- `GET /projects/{slug}.ical` — returns a valid iCalendar file for the event.
- `GET /de/projects/{slug}.ical` — same, with German-language `SUMMARY` and `DESCRIPTION` (locale-aware content).
- Accessible to anyone, no authentication required.
- Used in confirmation emails and on the event page for all visitors.

**Response:**
- `Content-Type: text/calendar; charset=utf-8`
- `Content-Disposition: attachment; filename="{slug}.ics"`

**iCal content:**
- `VCALENDAR` with `PRODID` and `VERSION`
- `VEVENT` with `SUMMARY` (event name), `DTSTART`, `DTEND`, `LOCATION`, `DESCRIPTION`, `URL`
- `DTSTART`/`DTEND` use the event's overall `start_date`/`end_date` in UTC (ISO 8601)
- `LOCATION` formatted as: `{place_name}, {exact_address}, {city}, {country}` (or "Online" for online events)
- `DESCRIPTION` includes the event description and a link back to the event page

**Routing**: Next.js already has `.xml` extension routes for sitemaps (`pages/sitemapindex.xml.tsx`, `pages/sitemap/[language_code_dot_xml].tsx`). The same pattern applies for `.ical`. Next.js built-in i18n locale prefix routing handles `/de/projects/{slug}.ical` automatically.

**Data flow**: `getServerSideProps` → `apiRequest()` to Django (`GET /api/projects/{slug}/`) → build iCal object with `ical-generator` → write to `res` with `text/calendar` content type.

### AC-4: Edge cases

- Event with no `start_date` or `end_date`: calendar links are not shown (no valid date to put in calendar).
- Online event with no physical location: `LOCATION` field is omitted or set to "Online".
- Event with `is_online=True` and a `website` URL: the event URL is included in the `DESCRIPTION` field.
- Draft event: calendar endpoints return 404.
- Non-event project types (projects, ideas): calendar links are not shown.

---

## Constraints

- **No .ics attachments in emails** — links only. All calendar links are short Next.js frontend URLs.
- **Email links must work without JavaScript** — plain `<a>` tags with `href` attributes. Google/Outlook links go through Next.js redirect pages; the `.ical` link serves the file directly.
- **Calendar URL construction in Next.js** — Google Calendar and Outlook URL schemes are built at redirect time in `getServerSideProps`, not in the email. The email only contains short frontend URLs.
- **.ics generation in Next.js** — uses `ical-generator` (Node.js). The page's `getServerSideProps` fetches event data from Django API and generates the iCal response.
- **Feature toggle** — calendar UI does NOT require the `EVENT_REGISTRATION` toggle. It applies to all events regardless of registration status. No toggle check needed.
- **i18n** — calendar UI strings ("Add to Calendar", "Add to Google Calendar", etc.) must support English and German. The `.ical` content uses the locale from the URL prefix (`/de/` for German).
- **Performance** — .ics generation happens in `getServerSideProps` (same as existing project page). The data needed is a single Django API call — no additional queries.

---

## Domain Context

### How timeslots work (Phase 4c) — future personalisation

Timeslots are implemented as a field type within the registration field system. A `RegistrationField` with `field_type="time_slot_select"` contains `RegistrationFieldOption` records, each with:
- `start_time` (DateTimeField, nullable)
- `end_time` (DateTimeField, nullable)
- `title` (CharField)

When a guest registers and selects a timeslot, a `RegistrationFieldAnswer` is created with `value_option` pointing to the chosen `RegistrationFieldOption`.

**Future enhancement**: A personalised `.ical` URL (with a unique, unguessable token) could embed the guest's selected timeslot in the `DESCRIPTION` field and adjust `DTSTART`/`DTEND` to the slot times. The iCal `DESCRIPTION` field (RFC 5545) supports plain text with `\n` newlines — timeslot details can be formatted as:
```
Your selected time slot:\nMorning — Sat, Jun 20, 09:00 – 12:00\n\nEvent details:\n...
```
This is deferred because it requires either per-user authentication or a signed-token URL mechanism.

### How emails are sent

Emails are sent from Django via Mailjet transactional templates. The Python code builds a dictionary of template variables and passes them to the Mailjet API. Calendar links are added as new template variables:

- `GoogleCalendarUrl` — `FRONTEND_URL/projects/{url_slug}/add-to-google-calendar`
- `OutlookCalendarUrl` — `FRONTEND_URL/projects/{url_slug}/add-to-outlook`
- `IcsDownloadUrl` — `FRONTEND_URL/projects/{url_slug}.ical`

All three are short, static URLs — the Celery task only needs `FRONTEND_URL` and `url_slug`. No event data is URL-encoded in the email. The actual provider URL construction happens at redirect time in Next.js.

The email sending happens in a Celery task (`send_event_registration_confirmation_email`) dispatched via `transaction.on_commit`. The task fetches the event data and builds template variables.

### Location data structure

The `Location` model has: `name`, `place_name`, `exact_address`, `display_name`, `city`, `state`, `country`, `centre_point` (PostGIS PointField with lat/lon). The `additional_loc_info` field on `Project` stores room numbers or directions.

### Event URL pattern

Event pages are at `FRONTEND_URL/projects/{url_slug}`. The `url_slug` is unique and stable.

Calendar URLs — all served by Next.js:
- `.ical` file: `FRONTEND_URL/projects/{url_slug}.ical` (serves .ics content via `ical-generator`)
- Google Calendar redirect: `FRONTEND_URL/projects/{url_slug}/add-to-google-calendar` (302 → Google Calendar URL scheme)
- Outlook redirect: `FRONTEND_URL/projects/{url_slug}/add-to-outlook` (302 → Outlook URL scheme)

Localized variants (Next.js i18n prefix):
- `FRONTEND_URL/de/projects/{url_slug}.ical`
- `FRONTEND_URL/de/projects/{url_slug}/add-to-google-calendar`
- `FRONTEND_URL/de/projects/{url_slug}/add-to-outlook`

---

## Open Questions

~~1. **Where does the "Add to Calendar" UI live on the event page?**~~ Resolved: near the event date/time display, as a minimalistic calendar icon dropdown.

~~2. **Should we use `add-to-calendar-button-react` for the frontend UI?**~~ Resolved: custom minimalistic UI (calendar icon outline button with dropdown). No new dependency. Can revisit `add-to-calendar-button-react` later if more polish is needed.

---

## Research Notes

### Solutions evaluated

**add-to-calendar-button-react** (`add-to-calendar-button-react` on npm)
- React wrapper around a web component. Renders a dropdown with Apple/Google/Outlook/Yahoo options.
- Client-side only (`'use client'` required). Generates .ics content in the browser.
- Verdict: Optional — for polished event page UI only. Does not solve the email link use case (email links point to Next.js `.ical` URL or Google/Outlook URL schemes directly).

**ical-generator** (`ical-generator` on npm, v10.2.0, 847 stars)
- Node.js library for generating iCalendar (.ics) files. Full control over all iCal properties.
- Works in Node.js (`getServerSideProps`, API routes) and browser. TypeScript support. Zero dependencies.
- Verdict: **Selected** — .ics generation in Next.js `getServerSideProps`. Fetches event data from Django API, builds iCal object, writes to response.

**Python `icalendar` library** (not used)
- Python equivalent of `ical-generator`. Would work in Django directly.
- Not needed — Next.js handles .ics serving. Django only needs to construct the frontend URL for email template variables.

**Direct URL construction** (no library needed)
- Google Calendar: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&dates=.../...&details=...&location=...`
- Outlook: `https://outlook.live.com/calendar/0/action/compose?subject=...&startdt=...&enddt=...&body=...&location=...`
- Apple Calendar: `.ics` download link (points to the Next.js `.ical` URL)
- Verdict: Google/Outlook URLs are constructed at redirect time in Next.js `getServerSideProps`. Not embedded in email — email contains short frontend URLs that redirect.

### Recommendation summary

| Layer | Solution | Rationale |
|-------|----------|-----------|
| .ics generation | `ical-generator` in Next.js `getServerSideProps` | Fetches event data from Django API, generates .ics, writes to response. |
| Google Calendar / Outlook redirect | Next.js `getServerSideProps` redirect pages | Fetches event data, constructs provider URL, issues 302. Keeps email URLs short and always up-to-date. |
| Email template variables | Short frontend URLs only | Celery task uses `FRONTEND_URL` + `url_slug`. No event data in URLs. |
| Event page UI | Custom buttons (MUI) with direct links | Fewer dependencies; consistent with existing UI patterns. Can upgrade to `add-to-calendar-button-react` later. |

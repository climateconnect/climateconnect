# Calendar Links on Event Page

**Date**: 2026-06-11  
**Status**: DRAFT  
**Type**: Frontend + Backend — new feature  
**GitHub Issue**: —  

---

## Problem Statement

When a visitor views a Climate Connect event, they have no way to add it to their personal calendar. Guests must manually copy event details into Google Calendar, Apple Calendar, Outlook, or another calendar app. This is a friction point that risks guests forgetting about the event or entering incorrect details.

This applies to all events — whether they have registration enabled or not.

### Why it matters

- **Reduces no-shows**: Calendar reminders are the most reliable way to ensure guests attend.
- **Improves UX**: Every major event platform (Eventbrite, Luma, Meetup, Lu.ma) offers calendar integration. Its absence feels like a missing feature.
- **Standard feature expectation**: Visitors expect to see "Add to Calendar" on event pages.

### Current state

- No calendar-related features exist anywhere in the codebase.
- All event data needed for calendar generation is available via the Django API: `Project.name`, `start_date`, `end_date`, `Location`, `is_online`, `additional_loc_info`.
- The Node.js `ical-generator` library will need to be added as a frontend dependency.
- The registration confirmation email already has an .ics attachment (separate task: `20260611_1131_ics_attachment_in_confirmation_email.md`). This task adds the website-side calendar features.

---

## Scope

### In scope

1. **Public `.ical` web endpoint** — a Next.js page at `/projects/{slug}.ical` that returns a valid iCalendar file for the event.
2. **Google Calendar redirect endpoint** — a Next.js page at `/projects/{slug}/add-to-google-calendar` that redirects (302) to the Google Calendar URL scheme with pre-filled event details.
3. **Outlook redirect endpoint** — a Next.js page at `/projects/{slug}/add-to-outlook` that redirects (302) to the Outlook URL scheme with pre-filled event details.
4. **"Add to Calendar" modal on event page** — a calendar icon next to the share icon that opens a modal dialog (using `GenericDialog`) with three calendar options (Google, Apple, Outlook) and an optional registration status reminder.

### Out of scope (for now)

- **Calendar links in the registration confirmation email body**. The email already has an .ics attachment (separate task). Links in the body can be added as a future enhancement once these endpoints are live — just add template variables pointing to the new URLs.
- Personalised .ics with timeslot data (requires per-user auth or signed token URLs).
- Calendar subscription feeds (recurring .ics feeds for all events an org hosts).
- Two-way calendar sync (e.g. Google Calendar API integration).

---

## Acceptance Criteria

### AC-1: Public .ical endpoint

Next.js serves the `.ical` content directly via a page with `getServerSideProps`. The page fetches event data from the Django API and generates the iCal response using the `ical-generator` library.

**URL patterns:**
- `GET /projects/{slug}.ical` — returns a valid iCalendar file for the event.
- `GET /de/projects/{slug}.ical` — same, with German-language `SUMMARY` and `DESCRIPTION` (locale-aware content).
- Accessible to anyone, no authentication required.

**Response:**
- `Content-Type: text/calendar; charset=utf-8`
- `Content-Disposition: attachment; filename="{slug}.ics"`

**iCal content:**
- `VCALENDAR` with `PRODID` and `VERSION`
- `VEVENT` with `SUMMARY` (event name), `DTSTART`, `DTEND`, `LOCATION`, `DESCRIPTION`, `URL`
- `DTSTART`/`DTEND` use the event's overall `start_date`/`end_date` in UTC (ISO 8601)
- `LOCATION` — uses the pre-formatted `location` string from the Django API (same as displayed on the frontend). For online events, set to "Online".
- `DESCRIPTION` includes the event description and a link back to the event page

**Routing**: Next.js already has `.xml` extension routes for sitemaps (`pages/sitemapindex.xml.tsx`, `pages/sitemap/[language_code_dot_xml].tsx`). The same pattern applies for `.ical`. Next.js built-in i18n locale prefix routing handles `/de/projects/{slug}.ical` automatically.

**Data flow**: `getServerSideProps` → `apiRequest()` to Django (`GET /api/projects/{slug}/`) → build iCal object with `ical-generator` → write to `res` with `text/calendar` content type.

### AC-2: Google Calendar redirect endpoint

`GET /projects/{slug}/add-to-google-calendar` — a Next.js page with `getServerSideProps` that:
1. Fetches event data from the Django API.
2. Constructs the Google Calendar URL: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&dates=.../...&details=...&location=...`
3. Returns a 302 redirect to that URL.

Localized variant: `GET /de/projects/{slug}/add-to-google-calendar` — same, with German-language event details in the URL.

### AC-3: Outlook redirect endpoint

`GET /projects/{slug}/add-to-outlook` — a Next.js page with `getServerSideProps` that:
1. Fetches event data from the Django API.
2. Constructs the Outlook URL: `https://outlook.live.com/calendar/0/action/compose?subject=...&startdt=...&enddt=...&body=...&location=...`
3. Returns a 302 redirect to that URL.

Localized variant: `GET /de/projects/{slug}/add-to-outlook` — same, with German-language event details.

### AC-4: "Add to Calendar" UI on event page

**Icon placement**: A calendar icon button is placed next to the existing share icon (`ProjectSocialMediaShareButton`):
- **Large screens** (`ProjectPageRoot.tsx`): in the tabs header bar, right-aligned next to the share button.
- **Small screens** (`ProjectOverview.tsx`): in the project image overlay, alongside the share button (bottom-right corner).

The icon uses the same `IconButton` pattern and sizing as the share button. Uses MUI `CalendarToday` or `EventIcon`.

**Modal**: Clicking the icon opens an "Add to Calendar" modal (`AddToCalendarDialog`), using the project's `GenericDialog` component — the same pattern as `SocialMediaShareDialog`. The modal contains:

1. **Three calendar options** as buttons/links:
   - **Google Calendar** — links to `/projects/{slug}/add-to-google-calendar`
   - **Apple Calendar / iCal** — links to `/projects/{slug}.ical` (triggers native calendar app on iOS/macOS, downloads on other platforms; works with any calendar app supporting iCal)
   - **Outlook** — links to `/projects/{slug}/add-to-outlook`

2. **Registration status reminder** (conditional): When the event has registration enabled (`project.registration_config` exists and is not draft) AND the user is logged in, show a small note below the calendar options:
   - If the user **is registered**: a brief confirmation like "You're registered for this event." (green/checkmark styling)
   - If the user **is not registered**: a brief reminder like "Not registered yet — don't forget to sign up!" with a link to the registration flow. Styled as a subtle nudge, not a warning.
   - The registration state is available from `isRegistered` (passed as a prop to `ProjectPageRoot`) and `myEventRegistration` state.
   - This is a soft reminder only — users can still add the event to their calendar regardless of registration status. Registration might be optional, and some users may just want to attend without formally registering.

**Priority**: The event page UI is a bonus. The primary deliverable is the endpoints (AC-1, AC-2, AC-3). The UI can be iterated on after the endpoints ship.

### AC-5: Edge cases

- Online events (`is_online=True`): `LOCATION` is set to "Online". (Online events do have an associated physical location for hub purposes, but the calendar entry should reflect that the event itself is online.)
- Event with `is_online=True` and a `website` URL: the event URL is included in the `DESCRIPTION` field.
- Draft event: calendar endpoints return 404.
- Non-event project types (projects, ideas): calendar links are not shown. Endpoints return 404.
- Events always have `start_date` and `end_date` — the fields are nullable in the Django model but validation ensures they are set. No guard needed for missing dates.
- Registration reminder: only shown when registration is enabled, not draft, and user is logged in. Adding to calendar works regardless of registration status.

---

## Constraints

- **.ics generation in Next.js** — uses `ical-generator` (Node.js). The page's `getServerSideProps` fetches event data from Django API and generates the iCal response.
- **Calendar URL construction in Next.js** — Google Calendar and Outlook URL schemes are built at redirect time in `getServerSideProps`. The URLs are not embedded anywhere externally — they're constructed on-the-fly from event data.
- **Modal requires JavaScript** — the "Add to Calendar" modal is a React component (`GenericDialog`). The calendar links inside the modal are plain `<a>` tags that work without JS if accessed directly (the endpoints themselves are server-rendered). The registration status reminder uses client-side state from `isRegistered` / `myEventRegistration`.
- **No multiple calendar formats** — `.ics` (iCalendar / RFC 5545) is the only format.
- **Feature toggle** — calendar UI does NOT require the `EVENT_REGISTRATION` toggle. It applies to all events regardless of registration status. No toggle check needed.
- **i18n** — calendar UI strings ("Add to Calendar", "Add to Google Calendar", etc.) must support English and German. The `.ical` content uses the locale from the URL prefix (`/de/` for German).
- **Performance** — .ics generation happens in `getServerSideProps`. The data needed is a single Django API call — no additional queries.

---

## Domain Context

### Event URL pattern

Event pages are at `FRONTEND_URL/projects/{url_slug}`. The `url_slug` is unique and stable.

Calendar URLs — all served by Next.js:
- `.ical` file: `FRONTEND_URL/projects/{url_slug}.ical`
- Google Calendar redirect: `FRONTEND_URL/projects/{url_slug}/add-to-google-calendar`
- Outlook redirect: `FRONTEND_URL/projects/{url_slug}/add-to-outlook`

Localized variants (Next.js i18n prefix):
- `FRONTEND_URL/de/projects/{url_slug}.ical`
- `FRONTEND_URL/de/projects/{url_slug}/add-to-google-calendar`
- `FRONTEND_URL/de/projects/{url_slug}/add-to-outlook`

### Share button pattern (reference for calendar icon)

The existing share feature uses a 3-layer component structure that the calendar modal should mirror:

- **`ProjectSocialMediaShareButton`** — project-specific wrapper that computes props (URL, title, etc.) and passes them to the generic button.
- **`SocialMediaShareButton`** — renders an `IconButton` with the `Share` icon. On click, opens the dialog (or uses the Web Share API on small screens with HTTPS).
- **SocialMediaShareDialog`** — uses `GenericDialog` to show social media share buttons + a copy-link text field.

The calendar icon should follow the same layering: a project-specific wrapper (`ProjectAddToCalendarButton`) that renders an `IconButton` with a calendar icon and opens `AddToCalendarDialog` on click.

**Icon placement**:
- **Large screens** (`ProjectPageRoot.tsx`, line 638): inside the tabs container, right-aligned next to `ProjectSocialMediaShareButton`. Both buttons share the `shareButtonContainer` / new `calendarButtonContainer` styling with `paddingRight`.
- **Small screens** (`ProjectOverview.tsx`, line 389): in the image overlay container, alongside the share button. Positioned absolute, bottom-right of the image.

### Location data

The Django API already returns a pre-formatted `project.location` string (the same string displayed on the frontend). The Next.js `.ical` endpoint can use this string directly for the iCal `LOCATION` field — no need to format individual location fields. For online events, the API returns "Online" as the location string.

### Registration state on the event page

The event page already tracks whether the current user is registered:

- `isRegistered` — boolean prop passed to `ProjectPageRoot` from SSR. Indicates whether the user had an active registration at page load time.
- `myEventRegistration` — React state in `ProjectPageRoot` (line 169). Holds the user's own registration object (or `null`). Updated optimistically on registration/cancellation.
- `project.registration_config` — the registration settings object. Present when registration is enabled. Contains `status`, `is_draft`, `registration_end_date`, etc.
- `isUserRegistered` — derived state (line 160) combining `isRegistered` and optimistic updates.

The modal uses these to determine what to show:
- No `registration_config` or `is_draft=true` → don't show registration reminder.
- No user (not logged in) → don't show registration reminder.
- `isUserRegistered=true` → show "You're registered" confirmation.
- `isUserRegistered=false` → show "Not registered yet" reminder with link.

---

## Open Questions

~~1. **Where does the "Add to Calendar" UI live on the event page?**~~ Resolved: icon next to the share icon (tabs header on large screens, image overlay on small screens). Opens a modal dialog.

~~2. **Should we use `add-to-calendar-button-react` for the frontend UI?**~~ Resolved: custom modal using `GenericDialog` (same pattern as `SocialMediaShareDialog`). No new dependency.

---

## Research Notes

### Solutions evaluated

**add-to-calendar-button-react** (`add-to-calendar-button-react` on npm)
- React wrapper around a web component. Renders a dropdown with Apple/Google/Outlook/Yahoo options.
- Client-side only (`'use client'` required). Generates .ics content in the browser.
- Verdict: Optional — for polished event page UI only. Can revisit later.

**ical-generator** (`ical-generator` on npm, v10.2.0, 847 stars)
- Node.js library for generating iCalendar (.ics) files. Full control over all iCal properties.
- Works in Node.js (`getServerSideProps`, API routes) and browser. TypeScript support. Zero dependencies.
- Verdict: **Selected** — .ics generation in Next.js `getServerSideProps`.

**Direct URL construction** (no library needed)
- Google Calendar: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&dates=.../...&details=...&location=...`
- Outlook: `https://outlook.live.com/calendar/0/action/compose?subject=...&startdt=...&enddt=...&body=...&location=...`
- Apple Calendar: `.ics` download link (points to the `.ical` URL)
- Verdict: Google/Outlook URLs are constructed at redirect time in Next.js `getServerSideProps`.

### Recommendation summary

| Layer | Solution | Rationale |
|-------|----------|-----------|
| .ics generation | `ical-generator` in Next.js `getServerSideProps` | Fetches event data from Django API, generates .ics, writes to response. |
| Google Calendar / Outlook redirect | Next.js `getServerSideProps` redirect pages | Fetches event data, constructs provider URL, issues 302. |
| Event page UI | Modal (`GenericDialog`) with calendar links + registration reminder | Same pattern as `SocialMediaShareDialog`. Icon next to share button. No new dependency. |

# Fix: Registration Modal Deep Link Shows Form for Closed Events

**Date**: 2026-06-15  
**Status**: DRAFT  
**Type**: Frontend — bug fix  
**GitHub Issue**: [#2054](https://github.com/climateconnect/climateconnect/issues/2054)  
**Milestone**: Event Management V3

---

## Problem Statement

When an event's registration is closed (status `"full"`, `"closed"`, or `"ended"`), users can still access the registration form by navigating directly to `/projects/{slug}/register`. This deeplink redirects to `/projects/{slug}?openRegistration=true`, which unconditionally opens the `EventRegistrationModal` — bypassing the registration status check.

The user fills in the form, submits, and receives a server-side error (e.g. `"Registration is currently closed."` or `"The event is fully booked."`). This is a poor UX: the form should never have been shown in the first place.

### Why it matters

- **Frustrating UX**: Users do the work of filling in the form (including custom fields), only to get rejected. The error message is the first indication that registration is impossible.
- **Inconsistency**: The event detail page already shows a disabled "Booked Out" button for full/closed events via `RegistrationActionButton`, but the deeplink completely bypasses this logic.
- **Unnecessary auth flow**: Unauthenticated users go through the entire email → password/signup → OTP flow inside the modal, only to be told registration is closed after they finally submit.

### Current state

- **Backend**: The `POST /api/projects/{slug}/registrations/` endpoint correctly rejects registration when status is `"closed"`, `"full"`, or `"ended"` (via `_compute_effective_status()`). The error messages are already defined.
- **Frontend event detail page**: `RegistrationActionButton` uses `getRegistrationUIState()` to show "Booked Out" (disabled) or hide registration entirely when status is not `"open"`. This works correctly.
- **Frontend deeplink handler** (`ProjectPageRoot.tsx`, line 302–308): Only checks `project.registration_config` exists — does NOT check the status. Opens the modal regardless.
- **`EventRegistrationModal`**: Has no status guard. Always renders the confirmation form (or auth flow). Only discovers the error on POST failure.

### Data available at page load

The `project.registration_config` object (returned by `GET /api/projects/{slug}/`) includes:
- `status`: `"open" | "closed" | "full" | "ended"` — **effective status** (computed by `_compute_effective_status()` in the serializer, accounts for expired `registration_end_date`)
- `is_draft`: boolean
- `registration_enabled`: boolean

All of this is already available in `ProjectPageRoot` via the `project` prop. No additional API call is needed.

---

## Scope

### In scope

1. Show an informational message inside the modal (instead of the form) when registration is full, closed, or ended — regardless of how the modal was opened (deeplink or button click).

### Out of scope

- Backend changes — the API already handles rejection correctly.
- Changes to `RegistrationActionButton` — it already works correctly on the event detail page.
- Changes to the browse card register button in `ProjectMetaData.tsx` — it already uses `buttonConfig.disabled` to prevent navigation when closed.
- Deeplink guard in `ProjectPageRoot` — the modal itself handles the closed states, so there is no need for a separate guard layer.

---

## Acceptance Criteria

### AC-1: Modal shows informational message for closed/full/ended registration

When the `EventRegistrationModal` is opened (by any code path — deeplink, button click, or future path), the modal checks two conditions before rendering the form:

**Already-registered check** (takes priority): If the user is authenticated and has an active `my_event_registration` (non-null, `cancelled_at` is null), the modal shows a "You're already registered" message. This handles the deeplink case where an already-registered user navigates to `/register`.

**Closed registration check**: If `project.registration_config.status` is not `"open"`, the modal renders an informational message instead of the registration form or auth flow:

| Status | Icon | Title | Message |
|--------|------|-------|---------|
| `"full"` or `"closed"` | `EventBusyIcon` | "Event is fully booked" | "This event has reached its maximum number of participants. Registration is no longer available." |
| `"ended"` | `EventBusyIcon` | "Registration has ended" | "The registration period for this event has ended. Registration is no longer possible." |

Note: `"closed"` and `"full"` are treated identically — both show "Booked Out" messaging, consistent with the `RegistrationActionButton` on the event detail page.

**Close button**: A single "Close" button dismisses the modal.

**Auth flow skipped**: Unauthenticated users do NOT see the email/password/auth flow. They see the informational message immediately.

**Implementation location**: `EventRegistrationModal.tsx` — add a check at the top of `renderContent()` (before the success/error/auth checks). When `project.registration_config?.status` is `"full"`, `"closed"`, or `"ended"`, return an informational view with the appropriate icon, title, and message. The `renderActions()` function returns a single "Close" button for this state.

### AC-2: i18n

All new user-facing strings must have English and German translations in `project_texts.tsx`.

**New text keys** (suggested):

| Key | English | German |
|-----|---------|--------|
| `event_is_fully_booked` | "Event is fully booked" | "Die Veranstaltung ist ausgebucht" |
| `event_is_fully_booked_message` | "This event has reached its maximum number of participants. Registration is no longer available." | "Diese Veranstaltung hat die maximale Teilnehmerzahl erreicht. Eine Anmeldung ist nicht mehr möglich." |
| `registration_period_has_ended` | "Registration has ended" | "Die Anmeldefrist ist abgelaufen" |
| `registration_period_has_ended_message` | "The registration period for this event has ended. Registration is no longer possible." | "Die Anmeldefrist für diese Veranstaltung ist abgelaufen. Eine Anmeldung ist nicht mehr möglich." |
| `already_registered_for_event` | "You're already registered" | "Du bist bereits angemeldet" |
| `already_registered_for_event_message` | "You have an active registration for this event. You do not need to register again." | "Du hast eine aktive Anmeldung für diese Veranstaltung. Du brauchst dich nicht erneut anzumelden." |

### AC-3: Tests

- **Unit test** for the modal informational state: When `EventRegistrationModal` is rendered with `open=true` and `project.registration_config.status` is `"full"`, the form is not shown; the "fully booked" message is shown instead. Same for `"closed"` (also shows "fully booked") and `"ended"`.
- **Unit test**: Unauthenticated user with closed registration sees the informational message, not the auth flow.
- **Unit test**: User with active `my_event_registration` sees the "already registered" message and not the form.
- **Unit test**: User with cancelled registration (`cancelled_at` is non-null) sees the form, not the "already registered" message.
- Existing tests continue to pass.

---

## Constraints

- **No backend changes required**. The `registration_config.status` field already contains the effective status (computed by `_compute_effective_status()` in `EventRegistrationConfigSerializer`). The frontend already receives this data.
- **No new API calls**. The `project` prop already contains `registration_config` with the status. All decisions are client-side.
- **Single guard location**. The modal itself is the only place that checks registration status before rendering. No separate guard in `ProjectPageRoot` — the modal handles all code paths uniformly.
- **Minimal code changes**. This is a bug fix, not a feature. Keep the diff small and focused.

---

## Domain Context

### Registration status lifecycle

The `EventRegistrationConfig.status` field has four possible values:

| Status | Meaning | How it's set |
|--------|---------|-------------|
| `"open"` | Accepting registrations | Default. Also set when an admin reopens registration. |
| `"closed"` | Organiser manually closed | Admin sets via `EditRegistrationConfigView`. Stored in DB. |
| `"full"` | Max participants reached | System-set when last seat taken. Auto-reverts to `"open"` when a registration is cancelled. Stored in DB. |
| `"ended"` | Registration deadline passed | **Never stored in DB**. Computed at read-time by `_compute_effective_status()` when stored status is `"open"` but `registration_end_date < now()`. |

### Deep-link flow (current → fixed)

**Current** (broken):
```
/projects/{slug}/register
    ↓ (Next.js SSR redirect, 307)
/projects/{slug}?openRegistration=true
    ↓ (ProjectPageRoot useEffect — only checks registration_config exists)
setRegistrationModalOpen(true)
    ↓ (EventRegistrationModal renders — no status check)
Shows form → user submits → POST fails with error
```

**Fixed**:
```
/projects/{slug}/register
    ↓ (Next.js SSR redirect, 307)
/projects/{slug}?openRegistration=true
    ↓ (ProjectPageRoot useEffect — same as before)
setRegistrationModalOpen(true)
    ↓ (EventRegistrationModal renders — checks status first)
status !== "open" → shows informational message (fully booked / closed / ended)
```

### Existing helper functions

- `getRegistrationUIState()` in `eventRegistrationHelpers.ts` — already implements the full status logic including draft, ended, full, closed. Returns `"closed"` for both `"full"` and `"closed"` statuses.
- `shouldShowRegisterButton()` — checks `is_draft`, `registration_config.is_draft`, and `status !== "ended"`.
- `isRegisterButtonDisabled()` — disabled for `"closed"` and `"full"` statuses.

These helpers are used by `RegistrationActionButton` on the event detail page. The modal fix can reuse similar logic (checking `project.registration_config.status` directly) without needing to import these helpers, since the modal's needs are simpler (it just needs to know if status is `"open"` or not).

---

## Implementation Notes

### Where to make changes

| File | Change |
|------|--------|
| `frontend/src/components/project/EventRegistrationModal.tsx` | Add an early return in `renderContent()` that shows an informational message when `project.registration_config.status !== "open"`. Add corresponding "Close" button in `renderActions()`. |
| `frontend/public/texts/project_texts.tsx` | Add new translation keys for the informational messages (6 keys, EN + DE). |
| `frontend/src/components/project/EventRegistrationModal.test.tsx` | Add test cases for closed/full/ended states. |

### No changes needed in `ProjectPageRoot.tsx`

The deeplink handler (`useEffect` at line 302–308) does not need modification. It already passes the full `project` object to the modal, which includes `registration_config.status`. The modal itself handles the status check — no need for a separate guard layer.

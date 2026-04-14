# Improvements to Send Email to All Event Guests

**Status**: READY FOR IMPLEMENTATION  
**Type**: Improvement  
**Date and time created**: 2026-04-14 13:00  
**Date Completed**: TBD  
**GitHub Issue**: [#1886](https://github.com/climateconnect/climateconnect/issues/1886)  
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)  
**Related Specs**:
- [`20260401_1100_organizer_send_email_to_guests.md`](./20260401_1100_organizer_send_email_to_guests.md) ← original feature ([#1866](https://github.com/climateconnect/climateconnect/issues/1866)) this improves on
- [`EPIC_event_registration.md`](./EPIC_event_registration.md) ← shared architecture, `SendOrganizerEmailView`, `SendEmailToGuestsModal`

---

## Problem Statement

The existing "Send email to all guests" flow ([#1866](https://github.com/climateconnect/climateconnect/issues/1866)) allows event organisers to send a plain-text email to all registered (non-cancelled) guests directly from the Registrations tab.

Two gaps remain:

1. **No confirmation before bulk send.** The organiser can accidentally send an email to all guests with a single click. There is no intermediate step to review the recipient count before committing to the send.

2. **Team admins do not receive a copy.** Only registered guests receive the email. Team admins have no visibility into messages sent to guests unless they also happen to be registered as guests. This means the team cannot keep track of what has been communicated to attendees.

**Core Requirements (User/Stakeholder Stated):**

- Before the bulk send is dispatched, the organiser must see a **confirmation step** that clearly states how many people will receive the email. This prevents accidental sends.
- The confirmation step must also inform the organiser that **team admins will receive a copy** of the email.
- On the backend, the bulk send must include all **team admins** (organiser and write-access project members) as additional recipients alongside the registered guests, so that admins have a copy of all outgoing communications.
- The test send (`is_test=true`) is unaffected by these changes — it continues to send a single copy to the organiser only, with no confirmation step.

**Explicitly Out of Scope:**

- Changes to the test-send flow — behaviour and UX remain identical to today.
- Rich-text or HTML email body support.
- Per-admin opt-out from receiving organiser message copies.
- Persisting sent messages to the database.

---

## System Impact

- **Actors involved**: Event Organiser (initiates bulk send), Registered Guests (receive the email), Team Admins (now also receive a copy).
- **Flows affected**:
  - **Organiser sends email to guests**: extended with a confirmation step in the frontend and an additional admin recipient list on the backend.
- **Entity changes needed**: None — no schema changes required.
- **Flow changes needed**: Yes — see below.
- **Integration changes needed**: Minor — the existing Mailjet send-to-guest flow is reused for team admin copies; no new template needed.

---

## Software Architecture

### Frontend

**`SendEmailToGuestsModal.tsx`**

The modal currently moves directly from the compose form to the `sent_all` state when the organiser clicks "Send now". A new **confirmation step** must be inserted between compose and send.

- The confirmation view is shown after the organiser clicks "Send now" and before the API call is made.
- It must display the number of guests who will receive the email.
- It must mention that team admins will also receive a copy.
- It must offer a **"Back"** action (returns to the compose form, preserving subject and message) and a **"Confirm and send"** action (dispatches the API call).
- No changes to the test-send path — clicking "Send test to myself" bypasses the confirmation step entirely.

The recipient count displayed in the confirmation step must reflect the real number of currently active (non-cancelled) registrants. The parent component (`ProjectRegistrationsContent.tsx`) already has the registrations data in its DataGrid — passing the active guest count as a prop to the modal is the most straightforward approach.

**`public/texts/project_texts.tsx`**

New i18n text keys will be needed for the confirmation step copy (e.g. recipient count statement, team admins note, confirmation button label). Follow the established pattern in the file.

### Backend

**`organization/views/event_registration_views.py` — `SendOrganizerEmailView`**

The bulk-send path (step 5 in the view) must be extended to include team admins in the recipient list alongside the active registered guests.

- Collect team admin user IDs (users with `ALL_TYPE` or `READ_WRITE_TYPE` role on the project) in addition to the existing active-guest user IDs.
- Deduplicate the combined list — a team admin who is also a registered guest must not receive two copies.
- Dispatch the combined list to the existing `_send_organizer_email_task`.
- The `sent_count` returned in the response should reflect the **total number of recipients** (guests + team admins, after deduplication). The frontend uses this value in the post-send success screen.

No new endpoint, no new serializer fields, no schema changes.

---

## Files to Change

### Backend

| File | Change |
|------|--------|
| `organization/views/event_registration_views.py` | Extend bulk-send path in `SendOrganizerEmailView.post()` to include team admin user IDs; deduplicate; update `sent_count` accordingly |
| `organization/tests/test_event_registration.py` | Add/extend test cases (see below) |

### Frontend

| File | Change |
|------|--------|
| `frontend/src/components/project/SendEmailToGuestsModal.tsx` | Add confirmation step state and view between compose and send |
| `frontend/public/texts/project_texts.tsx` | Add i18n text keys for confirmation step |
| `frontend/src/components/project/ProjectRegistrationsContent.tsx` | Pass active guest count as prop to `SendEmailToGuestsModal` |

---

## Test Cases

### Backend

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Bulk send; event has 5 active guests and 2 team admins (no overlap) | Task dispatched with 7 unique user IDs; `sent_count` = 7 |
| 2 | Bulk send; a team admin is also a registered guest | That user appears only once; `sent_count` excludes the duplicate |
| 3 | Bulk send; event has 0 active guests, 2 team admins | Task dispatched with 2 user IDs; `sent_count` = 2 |
| 4 | Bulk send; event has 5 guests, 0 team admins | Behaviour unchanged from today; `sent_count` = 5 |
| 5 | Test send (`is_test=true`) | Unchanged — sent to organiser only; team admins not included |

### Frontend

| # | Scenario | Expected |
|---|----------|----------|
| 6 | Organiser fills in form and clicks "Send now" | Confirmation step shown; recipient count visible; back button visible |
| 7 | Organiser clicks "Back" from confirmation step | Returns to compose form with subject and message preserved |
| 8 | Organiser clicks "Confirm and send" | API call dispatched; modal transitions to `sent_all` success state |
| 9 | Organiser clicks "Send test to myself" | No confirmation step; test send proceeds immediately as before |

---

## Dependency Notes

- **Depends on** [#1866](https://github.com/climateconnect/climateconnect/issues/1866): the `SendOrganizerEmailView`, `_send_organizer_email_task`, and `SendEmailToGuestsModal` must be in place. All are complete.
- No other task dependencies.

---

## Log

- 2026-04-14 13:00 — Task created from GitHub issue [#1886](https://github.com/climateconnect/climateconnect/issues/1886). Improvement on [#1866](https://github.com/climateconnect/climateconnect/issues/1866): adds a pre-send confirmation step to the frontend modal (showing recipient count and team admin CC notice) and extends the backend bulk-send to include team admins in the recipient list. No schema changes, no new endpoints, no new Mailjet templates.

---

## Acceptance Criteria

- [ ] When the organiser clicks "Send now" (bulk send), a confirmation step is shown before the email is dispatched.
- [ ] The confirmation step displays the number of active (non-cancelled) guests who will receive the email.
- [ ] The confirmation step informs the organiser that team admins will also receive a copy.
- [ ] The organiser can navigate back from the confirmation step to the compose form; subject and message are preserved.
- [ ] After confirming, the email is sent and the modal shows the success state.
- [ ] The test send path ("Send test to myself") is unaffected — no confirmation step, sends to organiser only.
- [ ] On the backend, active registered guests and team admins all receive the email in the bulk-send path.
- [ ] A team admin who is also a registered guest receives only one copy.
- [ ] `sent_count` in the API response reflects the total number of unique recipients (guests + team admins).
- [ ] All tests pass.


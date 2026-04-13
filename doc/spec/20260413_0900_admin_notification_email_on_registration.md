# Send Admin Notification Emails on Event Registration and Cancellation

**Status**: READY FOR IMPLEMENTATION
**Type**: Feature
**Date and time created**: 2026-04-13 09:00
**Date Completed**: TBD
**GitHub Issue**: [#1888](https://github.com/climateconnect/climateconnect/issues/1888)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260413_0800_admin_notification_on_registration_changes.md`](./20260413_0800_admin_notification_on_registration_changes.md) — [#1882] introduces the `notify_admins` flag that gates this feature
- [`20260309_0900_member_register_for_event.md`](./20260309_0900_member_register_for_event.md) — introduces `EventRegistrationsView.post()` where the notification dispatch is added
- [`20260309_1500_member_cancel_event_registration.md`](./20260309_1500_member_cancel_event_registration.md) — introduces `EventRegistrationsView.delete()` where the notification dispatch is added
- [`20260407_1000_organizer_cancel_guest_registration.md`](./20260407_1000_organizer_cancel_guest_registration.md) — admin-cancel path; does **not** trigger admin notifications
- [`20260402_1500_rename_event_registration_models.md`](./20260402_1500_rename_event_registration_models.md) — model naming reference

---

## Problem Statement

When a platform member registers for or cancels their registration for an event, team admins have no way of being notified in real time. For active events this means admins must manually check the Registrations tab to track sign-ups and cancellations.

This task implements the actual email dispatch: hooking into the registration and self-cancellation flows, reading the `notify_admins` flag introduced in [#1882](https://github.com/climateconnect/climateconnect/issues/1882), and sending notification emails to all team admins asynchronously.

**Core Requirements (User/Stakeholder Stated):**

- When a member registers for an event **and** `EventRegistrationConfig.notify_admins` is `True`: send an email notification to all team admins.
- When a member self-cancels their registration **and** `notify_admins` is `True`: send an email notification to all team admins.
- When `notify_admins` is `False`: send nothing.
- The notification email should include key context: who registered/cancelled, the event name, and a direct link to the Registrations tab so the admin can take immediate action.
- **Use a generic template approach**: rather than separate Mailjet templates per scenario, use a single shared template per locale (EN + DE) where the backend generates all localised text — the subject, the action description, and the body. This avoids template sprawl and keeps localisation in code where it is version-controlled and reviewable.

**Explicitly Out of Scope:**

- Admin-initiated cancellations (`AdminCancelRegistrationView`) — no notification to other admins. The admin performing the action is already aware.
- Per-admin opt-out preferences — the `notify_admins` flag is event-level.
- Any frontend changes — this is a pure backend task.
- The `notify_admins` UI toggle — that is [#1882](https://github.com/climateconnect/climateconnect/issues/1882).

### Non-Functional Requirements

- Admin notifications must be dispatched **asynchronously** via Celery — the member's registration/cancellation HTTP response must not be blocked, regardless of how many admins the event has.
- Notifications must only be dispatched after the enclosing DB transaction commits successfully (`transaction.on_commit`), consistent with the existing registration confirmation email pattern.
- When `notify_admins=False`, no additional DB query should be made on the registration/cancellation path.
- One admin's email failure must not prevent notifications to other admins.
- No breaking changes to existing API contracts.

### AI Agent Insights and Additions

- **Dispatch only after the transaction commits**: the registration and cancellation views both use `@transaction.atomic`. Any admin notification dispatch must only fire after the transaction commits successfully — consistent with how the existing registration confirmation email is dispatched. This is a hard requirement, not an implementation hint.

- **Re-check `notify_admins` inside the async task**: the flag may be toggled between the HTTP request and task execution. Re-reading it from the DB inside the task before sending any emails prevents stale dispatches.

- **Who are "team admins"**: the set of users to notify is every project member with organiser or write-access role — the same permission set already used throughout the event registration views. No new permission concept is needed.

- **Generic Mailjet template**: the issue itself suggests using a single reusable template per locale (EN + DE) where the backend generates all localised text (subject, body, CTA label). This avoids template sprawl and keeps all copy in version-controlled code. The template acts as a styled wrapper only.

- **Admin-cancel path is explicitly excluded**: `AdminCancelRegistrationView` must not dispatch notifications. The admin performing the action already knows.

---

## System Impact

- **Actors involved**:
  - `Member`: Registers or self-cancels; indirectly triggers admin notification.
  - `System`: Checks `notify_admins`, fetches team admins, dispatches Celery task, sends emails.
  - `Team Admin`: Receives notification email; clicks through to Registrations tab.
- **Actions to implement**:
  - `Member` → `Register for Event` → (if `notify_admins=True`) → `System` → `Notify Team Admins` (async, change_type=`"registered"`)
  - `Member` → `Cancel Own Registration` → (if `notify_admins=True`) → `System` → `Notify Team Admins` (async, change_type=`"cancelled"`)
- **Flows affected**:
  - **Member Registration Flow** ([#1845](https://github.com/climateconnect/climateconnect/issues/1845)): extended — sibling `transaction.on_commit` dispatch added in `EventRegistrationsView.post()`.
  - **Member Self-Cancellation Flow** ([#1850](https://github.com/climateconnect/climateconnect/issues/1850)): extended — `transaction.on_commit` dispatch added in `EventRegistrationsView.delete()`.
- **Entity changes needed**: None — `EventRegistrationConfig.notify_admins` already added by [#1882](https://github.com/climateconnect/climateconnect/issues/1882). No schema change in this task.
- **Flow changes needed**: Yes — both member-initiated flows extended with conditional async notification step.
- **Integration changes needed**: Yes — 2 new Mailjet templates (EN + DE generic wrapper) and 2 new settings entries.
- **New specifications required**: None — this spec is sufficient.

---

## Software Architecture

### API

No new or changed endpoints. This task only adds backend side-effects to existing flows.

### Backend

**Registration and cancellation flows** (`organization/views/event_registration_views.py`)

Both the member registration flow and the member self-cancellation flow must dispatch an async admin notification after their transaction commits, but only when `EventRegistrationConfig.notify_admins` is `True`. The dispatch must not block the HTTP response and must not fire if the transaction rolls back.

The admin-cancel flow must not dispatch any notification.

**New async task** (`organization/tasks.py`)

A new Celery task that accepts the project identifier, the guest user identifier, and the change type (`"registered"` or `"cancelled"`). The task:

- Re-reads `notify_admins` from the DB before doing any work — exits early if the flag is now `False`.
- Fetches all team admins (organiser + write-access project members) for the event.
- Sends a notification email to each admin. A failure for one admin must not prevent the others from being notified.

Follow the retry and error-logging patterns established in the existing `send_event_registration_confirmation_email` task.

**New email helper** (`organization/utility/email.py`)

A new function that sends a single admin notification email. It receives the admin user, the project, the guest user, and the change type. It:

- Generates all email content (subject, body, CTA label) in the admin's preferred language — no user-facing text comes from the Mailjet template itself.
- Passes the content to the existing `send_email()` utility via the generic notification template (see Mailjet templates below).

Email content by scenario and language:

| `change_type` | Language | Subject | Body |
|--------------|----------|---------|------|
| `"registered"` | EN | `"{GuestName} registered for {EventTitle}"` | `"{GuestName} has just registered for {EventTitle}. View the updated registrations list."` |
| `"registered"` | DE | `"{GuestName} hat sich für {EventTitle} angemeldet"` | `"{GuestName} hat sich soeben für {EventTitle} angemeldet. Sieh dir die aktualisierte Anmeldeliste an."` |
| `"cancelled"` | EN | `"{GuestName} cancelled their registration for {EventTitle}"` | `"{GuestName} has just cancelled their registration for {EventTitle}. View the updated registrations list."` |
| `"cancelled"` | DE | `"{GuestName} hat seine/ihre Anmeldung für {EventTitle} storniert"` | `"{GuestName} hat soeben seine/ihre Anmeldung für {EventTitle} storniert. Sieh dir die aktualisierte Anmeldeliste an."` |

Template variables passed to Mailjet:

| Variable | Description |
|----------|-------------|
| `AdminFirstName` | Admin recipient's first name (falls back to username) |
| `Subject` | Localised subject string — also used as the email envelope subject |
| `Body` | Localised body text |
| `EventTitle` | Event name localised for the admin's language |
| `EventUrl` | Language-aware URL to the event page |
| `RegistrationsUrl` | Direct link to the event's Registrations tab |
| `CtaLabel` | Localised CTA button label (`"View registrations"` / `"Anmeldeliste ansehen"`) |

**New settings** (`climateconnect_main/settings.py`)

Two new template ID settings, one per locale (EN + DE). Follow the existing naming and `env()` default pattern established by the other event registration template ID settings.

**New Mailjet templates** (action item — not code)

Two generic event-notification templates (EN + DE). Each template is a styled wrapper only — it renders a greeting, the `Body` text, and a CTA button pointing to `RegistrationsUrl`. All scenario-specific copy comes from the backend variables; the template itself contains no hardcoded event or scenario text. This design allows the same two templates to be reused for future notification scenarios.

Add template IDs to `.backend_env` and Azure App Service configuration.

### Data

No schema changes — `EventRegistrationConfig.notify_admins` already exists (added by [#1882](https://github.com/climateconnect/climateconnect/issues/1882)).

---

## Files to Change

### Backend

| File | Change |
|------|--------|
| `organization/views/event_registration_views.py` | Add conditional `transaction.on_commit` dispatch in `EventRegistrationsView.post()` and `EventRegistrationsView.delete()`; import new task |
| `organization/tasks.py` | Add `notify_admins_of_registration_change` Celery task |
| `organization/utility/email.py` | Add `send_admin_event_notification` helper |
| `climateconnect_main/settings.py` | Add `ADMIN_REGISTRATION_NOTIFICATION_TEMPLATE_ID` and `_DE` |
| `organization/tests/test_event_registration.py` | Add test cases (see below) |

No frontend files, no migrations, no serializer changes.

---

## Test Cases

### Backend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | Member registers; `notify_admins=True` | `notify_admins_of_registration_change` task dispatched after commit with `change_type="registered"` |
| 2 | Member registers; `notify_admins=False` | No task dispatched |
| 3 | Member re-registers (idempotent — already active) | No additional task dispatch; idempotent response unchanged |
| 4 | Member re-registers after self-cancellation; `notify_admins=True` | Task dispatched with `change_type="registered"` |
| 5 | Member self-cancels; `notify_admins=True` | Task dispatched after commit with `change_type="cancelled"` |
| 6 | Member self-cancels; `notify_admins=False` | No task dispatched |
| 7 | Admin cancels a guest's registration | No admin notification task dispatched |
| 8 | `notify_admins` toggled off between task dispatch and execution | Task re-checks flag, exits early — no emails sent |
| 9 | Event has 3 team admins; task executes | Email helper called once per admin (3 calls total) |
| 10 | One admin email fails; 2 others succeed | Error logged for failing admin; other 2 receive emails; task retries for the failing one |
| 11 | Event has no team admins | Task runs without error; no emails sent |
| 12 | Non-existent `project_id` passed to task | Task exits gracefully; logs warning; no exception propagated |
| 13 | Non-existent `guest_user_id` passed to task | Task exits gracefully; logs warning; no exception propagated |
| 14 | `change_type="registered"` | Subject contains "registered"; body matches registered template |
| 15 | `change_type="cancelled"` | Subject contains "cancelled"; body matches cancelled template |
| 16 | Admin has DE language preference | Email sent in German; subject and body in German |

---

## Dependency Notes

- **Depends on** [#1882](https://github.com/climateconnect/climateconnect/issues/1882): `EventRegistrationConfig.notify_admins` field must exist. **This task must be implemented after [#1882](https://github.com/climateconnect/climateconnect/issues/1882).**
- **Depends on** [#1845](https://github.com/climateconnect/climateconnect/issues/1845): `EventRegistrationsView.post()` must be implemented (backend complete; frontend pending).
- **Depends on** [#1850](https://github.com/climateconnect/climateconnect/issues/1850): `EventRegistrationsView.delete()` must be implemented (backend complete; frontend pending).
- **No frontend dependency**: this is a pure backend task. The `notify_admins` flag is read from the DB inside the view — no frontend changes needed.
- **Action item** (non-code): two Mailjet templates (EN + DE generic wrapper) must be created and their IDs added to `.backend_env` / Azure App Service before any production emails are delivered. The backend is safe without them — `send_email()` logs a warning and skips silently if the template ID is blank.

---

## Log

- 2026-04-13 09:00 — Task created from GitHub issue [#1888](https://github.com/climateconnect/climateconnect/issues/1888). Implements async Celery notification emails to team admins on member registration and self-cancellation. Gated by `EventRegistrationConfig.notify_admins` (from [#1882](https://github.com/climateconnect/climateconnect/issues/1882)). Generic template approach (1 EN + 1 DE template) — backend generates all localised text. No schema changes, no frontend changes. Depends on [#1882](https://github.com/climateconnect/climateconnect/issues/1882), [#1845](https://github.com/climateconnect/climateconnect/issues/1845), and [#1850](https://github.com/climateconnect/climateconnect/issues/1850).

---

## Acceptance Criteria

- [ ] When a member registers and `notify_admins=True`, all team admins receive a notification email asynchronously after the DB transaction commits.
- [ ] When `notify_admins=False`, no admin notification email is sent on member registration or self-cancellation.
- [ ] When a member self-cancels and `notify_admins=True`, all team admins receive a notification email.
- [ ] Admin-initiated cancellations do **not** trigger admin notification emails.
- [ ] Admin notifications are dispatched only after the DB transaction commits (`transaction.on_commit`).
- [ ] One admin's email failure does not prevent notifications to other admins.
- [ ] If `notify_admins` is toggled off between dispatch and task execution, no emails are sent (task re-checks the flag).
- [ ] The notification email includes: the guest's name, the event title (localised), and a direct link to the Registrations tab.
- [ ] The email is sent in the admin's preferred language (EN or DE).
- [ ] All tests pass.
- [ ] Code review approved.
- [ ] Documentation updated and current.


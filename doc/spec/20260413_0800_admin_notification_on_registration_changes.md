# Add "Notify Admins" Option to Event Registration Settings

**Status**: READY FOR IMPLEMENTATION
**Type**: Feature
**Date and time created**: 2026-04-13 08:00
**Date Completed**: TBD
**GitHub Issue**: [#1882](https://github.com/climateconnect/climateconnect/issues/1882)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260402_1500_rename_event_registration_models.md`](./20260402_1500_rename_event_registration_models.md) — model rename reference; this spec uses current naming throughout
- [`20260413_0900_admin_notification_email_on_registration.md`](./20260413_0900_admin_notification_email_on_registration.md) — [#1888] consumes the `notify_admins` flag introduced here to send the actual notification emails

---

## Problem Statement

Event organisers have no way to control whether they receive email notifications when members register or cancel. The goal of this task is to add the option to the event registration settings so organisers can enable or disable it. The actual email sending is handled separately in [#1888](https://github.com/climateconnect/climateconnect/issues/1888).

**Core Requirements (User/Stakeholder Stated):**

- When creating or editing an event with registration configuration, the organiser can enable or disable an option: **"Send a notification to team admins when someone registers or cancels."**
- This setting is stored per-event as part of `EventRegistrationConfig`.
- The setting is exposed in the API so that [#1888](https://github.com/climateconnect/climateconnect/issues/1888) can read it when deciding whether to dispatch notification emails.

**Explicitly Out of Scope:**

- The actual email sending logic — that is [#1888](https://github.com/climateconnect/climateconnect/issues/1888).
- Any Celery tasks, email helpers, or Mailjet templates.

### Non-Functional Requirements

- Additive schema change only — no existing data or API consumers are affected.
- No breaking changes to existing API contracts.

### AI Agent Insights and Additions

- **Default value `True`**: since the `EVENT_REGISTRATION` feature is not yet live in production and no events with registration exist there, defaulting to `True` is safe and means organisers who don't explicitly configure the option still benefit from notifications once [#1888](https://github.com/climateconnect/climateconnect/issues/1888) is shipped.
- **No frontend feature-toggle guard needed for the checkbox itself**: `EventRegistrationSection` and `EditEventRegistrationModal` are already only rendered when the `EVENT_REGISTRATION` feature toggle is active. No additional guard is required for this new field.

---

## System Impact

- **Actors involved**:
  - `Organiser / Team Admin`: Sets the `notify_admins` preference when creating or editing event registration settings.
- **Actions to implement**:
  - `Organiser` → `Set notify_admins flag` → `EventRegistrationConfig.notify_admins` (new field, persisted)
- **Flows affected**:
  - **Event Creation Flow** (existing): `EventRegistrationSection.tsx` gains a `notify_admins` toggle.
  - **Edit Registration Config Flow** ([#1848](https://github.com/climateconnect/climateconnect/issues/1848)): `EditEventRegistrationModal.tsx` gains the same toggle; `PATCH /api/projects/{slug}/registration-config/` accepts the new field.
- **Entity changes needed**: `EventRegistrationConfig` — new `notify_admins` boolean field (default `True`, not nullable). One new migration.
- **Flow changes needed**: No new flows. Existing creation and edit flows extended with one new field.
- **Integration changes needed**: None in this task.
- **New specifications required**: None — this spec is sufficient for the settings-only scope.

---

## Software Architecture

### API

**Project detail (existing — extended)**

```
GET /api/projects/{slug}/
```

`registration_config` response object gains `notify_admins` (boolean). Needed by the edit modal to pre-populate the toggle.

**Project list (existing — unchanged)**

```
GET /api/projects/
```

`registration_config` in list responses does **not** include `notify_admins`. The list endpoint is called frequently and the flag is irrelevant there — keeping it out avoids unnecessary payload growth.

**Create event with registration (existing — extended)**

```
POST /api/projects/
```

The `registration_config` nested object now accepts an optional `notify_admins` boolean. Omitting it defaults to `True`.

**Edit registration config (existing — extended)**

```
PATCH /api/projects/{slug}/registration-config/
```

Now accepts `notify_admins` in the request body (optional boolean). Persists the value when provided.

No new endpoints are introduced.

### Backend

**`EventRegistrationConfig` model** (`organization/models/event_registration.py`)

New boolean field `notify_admins`, not nullable, default `True`. Help text should reference the email notification behaviour and link to [#1888](https://github.com/climateconnect/climateconnect/issues/1888).

**Django migration**: adds the `notify_admins` column to `organization_eventregistrationconfig`. Single additive migration. No data migration required.

**`EventRegistrationConfigBaseSerializer`** (`organization/serializers/event_registration.py`)

No change. `notify_admins` is intentionally excluded from the base serializer to keep list responses lean.

**`EventRegistrationConfigSerializer`** (detail serializer — `organization/serializers/event_registration.py`)

Expose `notify_admins` as a read-only field so the project detail endpoint returns it and the edit modal can pre-populate the toggle.

**`EditEventRegistrationConfigSerializer`** (`organization/serializers/event_registration.py`)

Add `notify_admins` as a writable field alongside the existing editable fields. No cross-field validation required.

### Frontend

#### `EventRegistrationSection.tsx` (event creation form)

Add a `Switch` (or `Checkbox` + label) control below the existing `max_participants` / `registration_end_date` fields, full-width on all breakpoints.

- Label: uses text key `notify_admins_on_registration` (see below).
- Wired to `projectData.notify_admins` (boolean, default `true`).
- On change: `handleSetProjectData({ notify_admins: value })`.
- No validation required.

#### `EditEventRegistrationModal.tsx` (event detail edit)

Add the same `Switch` control.

- Pre-populated from `eventRegistration.notify_admins`.
- Included in the `PATCH /api/projects/{slug}/registration-config/` payload when changed.
- No additional error handling needed.

#### New text key (`public/texts/project_texts.tsx`)

| Key | EN | DE |
|-----|----|----|
| `notify_admins_on_registration` | `"Send a notification to team admins when someone registers or cancels."` | `"Sende eine Benachrichtigung an Team-Admins, wenn sich jemand an- oder abmeldet."` |

### Data

New column on `organization_eventregistrationconfig`:

| Column | Type | Default | Nullable |
|--------|------|---------|----------|
| `notify_admins` | `BOOLEAN NOT NULL` | `TRUE` | No |

Additive migration. All existing rows receive the default value `TRUE`. No backfill required.

---

## Files to Change

### Backend

| File | Change |
|------|--------|
| `organization/models/event_registration.py` | Add `notify_admins` BooleanField to `EventRegistrationConfig` |
| `organization/serializers/event_registration.py` | Add `notify_admins` (read-only) to `EventRegistrationConfigSerializer` (detail only); add `notify_admins` (writable) to `EditEventRegistrationConfigSerializer` |
| `organization/migrations/XXXX_add_notify_admins_to_eventregistrationconfig.py` | New migration |
| `organization/tests/test_event_registration.py` | Add test cases (see below) |

### Frontend

| File | Change |
|------|--------|
| `src/components/shareProject/EventRegistrationSection.tsx` | Add `notify_admins` Switch toggle |
| `src/components/project/EditEventRegistrationModal.tsx` | Add `notify_admins` Switch toggle; include in PATCH payload; pre-populate from current setting |
| `public/texts/project_texts.tsx` | Add `notify_admins_on_registration` text key (EN + DE) |

---

## Test Cases

### Backend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | `GET /api/projects/{slug}/` | `registration_config.notify_admins` present in detail response |
| 2 | `GET /api/projects/` (list) | `registration_config` does **not** include `notify_admins` |
| 3 | `POST /api/projects/` with `notify_admins: false` in `registration_config` | Config created with `notify_admins=False` |
| 4 | `POST /api/projects/` without `notify_admins` in `registration_config` | Config created with `notify_admins=True` (default) |
| 5 | `PATCH /api/projects/{slug}/registration-config/` with `notify_admins: false` | Field updated to `False`; response includes updated value |
| 6 | `PATCH /api/projects/{slug}/registration-config/` without `notify_admins` | Existing value unchanged |
| 7 | Migration applies cleanly on fresh DB | `notify_admins` column exists with default `True` |
| 8 | Migration applies cleanly on DB with existing `EventRegistrationConfig` rows | All existing rows have `notify_admins=True` |

### Frontend

| # | Scenario | Expected |
|---|----------|---------|
| 1 | Event creation form — registration section renders | `notify_admins` toggle shown, defaulting to checked (on) |
| 2 | Toggle off in creation form | `handleSetProjectData` called with `{ notify_admins: false }` |
| 3 | Toggle on in creation form | `handleSetProjectData` called with `{ notify_admins: true }` |
| 4 | Edit modal opens for event with `notify_admins=false` | Toggle renders in unchecked state |
| 5 | Edit modal opens for event with `notify_admins=true` | Toggle renders in checked state |
| 6 | Edit modal — change toggle and submit | `PATCH` payload includes correct `notify_admins` value |
| 7 | Edit modal — submit without changing toggle | Existing `notify_admins` value preserved in payload |

---

## Dependency Notes

- **Depends on** [#1848](https://github.com/climateconnect/climateconnect/issues/1848): `EditRegistrationConfigView` (`PATCH /registration-config/`) and `EditEventRegistrationModal.tsx` must exist — implemented.
- **Enables** [#1888](https://github.com/climateconnect/climateconnect/issues/1888): the `notify_admins` field introduced here is the gate that [#1888](https://github.com/climateconnect/climateconnect/issues/1888) checks before dispatching admin notification emails. This task should be implemented first.

---

## Log

- 2026-04-13 08:00 — Task created from GitHub issue [#1882](https://github.com/climateconnect/climateconnect/issues/1882). Scoped to settings only: adds `notify_admins` boolean field to `EventRegistrationConfig` and exposes it in the API and creation/edit forms. Actual email sending is handled by [#1888](https://github.com/climateconnect/climateconnect/issues/1888).

---

## Acceptance Criteria

- [ ] `EventRegistrationConfig` has a `notify_admins` boolean field (default `True`, not nullable). Migration applies cleanly on a fresh and an existing database.
- [ ] `GET /api/projects/{slug}/` includes `registration_config.notify_admins` in the detail response.
- [ ] `GET /api/projects/` (list) does **not** include `notify_admins` in `registration_config` items.
- [ ] `POST /api/projects/` with `registration_config.notify_admins=false` creates the config with `notify_admins=False`. Omitting the field defaults to `True`.
- [ ] `PATCH /api/projects/{slug}/registration-config/` accepts and persists `notify_admins`.
- [ ] The event creation form shows a "Send a notification to team admins when someone registers or cancels." toggle, defaulting to on.
- [ ] The edit modal shows the same toggle pre-populated from `registration_config.notify_admins`.
- [ ] Saving the edit modal with a changed toggle value persists the change via `PATCH /registration-config/`.
- [ ] All tests pass.
- [ ] Code review approved.
- [ ] Documentation updated and current.

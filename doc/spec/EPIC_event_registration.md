# EPIC: Event Registration

**Type**: Epic  
**Status**: IN PROGRESS  
**Started**: 2026-03-05  
**GitHub Issues**: [#1820](https://github.com/climateconnect/climateconnect/issues/1820), [#1845](https://github.com/climateconnect/climateconnect/issues/1845), [#1848](https://github.com/climateconnect/climateconnect/issues/1848), [#1849](https://github.com/climateconnect/climateconnect/issues/1849), [#1850](https://github.com/climateconnect/climateconnect/issues/1850), [#1851](https://github.com/climateconnect/climateconnect/issues/1851), [#1863](https://github.com/climateconnect/climateconnect/issues/1863), [#1866](https://github.com/climateconnect/climateconnect/issues/1866), [#1871](https://github.com/climateconnect/climateconnect/issues/1871), [#1872](https://github.com/climateconnect/climateconnect/issues/1872), [#1880](https://github.com/climateconnect/climateconnect/issues/1880), [#1901](https://github.com/climateconnect/climateconnect/issues/1901), [#1962](https://github.com/climateconnect/climateconnect/issues/1962), [#1995](https://github.com/climateconnect/climateconnect/issues/1995), [#1997](https://github.com/climateconnect/climateconnect/issues/1997), [#2004](https://github.com/climateconnect/climateconnect/issues/2004), [#2006](https://github.com/climateconnect/climateconnect/issues/2006), [#2007](https://github.com/climateconnect/climateconnect/issues/2007), [#2003](https://github.com/climateconnect/climateconnect/issues/2003)  
**Owner**: CC

---

## Overview

This epic delivers end-to-end online registration for Climate Connect events. It is part of the larger **[Event management functionality](https://github.com/climateconnect/product-backlog/issues/4)** initiative, which adds signup, notifications, and customisable event-specific information collection to the existing event feature.

The implementation is incremental across multiple phases. **Phase 1 is complete. Phase 2 is nearly complete. Phase 3 (guest registration via unified auth) is the final go-live blocker — the toggle flips to production once Phase 3 is validated on staging. Phase 4 (custom fields) starts in parallel and ships incrementally post-launch.**

### Rollout Strategy: Toggle-First

The `EVENT_REGISTRATION` feature toggle was implemented **before any feature work began** (migration `0002_add_event_registration_toggle.py`). This is the deliberate strategy for this epic:

1. **All tasks** are developed and shipped behind the toggle — production users see nothing until Phase 2 is complete.
2. The toggle allows the team to test incrementally on staging and in development without exposing incomplete flows to production users.
3. When **Phase 3 (guest registration) is complete and validated on staging**, the toggle is flipped to `production_is_active = True`. Phase 2 alone is not sufficient to go live — the guest registration flow (which depends on the Auth Unification epic) must also be ready. Phase 4 work is developed in parallel and continues behind the toggle after the flip.
4. **Every new UI component** in this epic must check `isEnabled("EVENT_REGISTRATION")` before rendering — consistent with `ShareProjectRoot.tsx`. Backend API changes are always additive and do not need to be toggled.

> ⚙️ **Toggle flip procedure**: update `production_is_active = True` on the `EVENT_REGISTRATION` `FeatureToggle` record (via the Django admin panel or a data migration). Coordinate frontend and backend deployments so both are live before flipping.

---

## Phases

### ✅ Phase 1 — Preparation (Complete)

Foundational work done before feature development began. No tasks in this epic's spec folder.

| Task                                                                                                | Status |
| --------------------------------------------------------------------------------------------------- | ------ |
| Feature toggle infrastructure                                                                       | ✅     |
| Remove skills from projects ([#1783](https://github.com/climateconnect/climateconnect/issues/1783)) | ✅     |
| Other preparatory tasks ([#1842](https://github.com/climateconnect/climateconnect/issues/1842))     | ✅     |

### 🎯 Phase 2 — Simple Registration (MVP · current phase)

The complete Phase 2 must be shipped before the toggle is flipped in production. This is the full set of stories agreed for go-live. Stories marked ⚪ do not yet have a spec or implementation issue.

| Story                                                           | GitHub Issue                                                                                                                                | Spec                                                                         | Status        |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------- |
| Organiser creates event with registration                       | [#1820](https://github.com/climateconnect/climateconnect/issues/1820)                                                                       |                                                                              | ✅ Done       |
| Member registers for event                                      | [#1845](https://github.com/climateconnect/climateconnect/issues/1845) [#1885](https://github.com/climateconnect/climateconnect/issues/1885) | [`20260309_0900_...`](./20260309_0900_member_register_for_event.md)          | ⚙️ In proress |
| Member sees their registered events                             | [#1849](https://github.com/climateconnect/climateconnect/issues/1849)                                                                       |                                                                              | ✅ Done       |
| Member cancels a registration                                   | [#1850](https://github.com/climateconnect/climateconnect/issues/1850)                                                                       |                                                                              | ✅ Done       |
| Event organizer can see canceled guests                         | [#1871](https://github.com/climateconnect/climateconnect/issues/1871)                                                                       | delivered by [#1872](./20260407_1000_organizer_cancel_guest_registration.md) | ✅ Done       |
| Organiser sees status of registrations (list of guests)         | [#1863](https://github.com/climateconnect/climateconnect/issues/1863)                                                                       |                                                                              | ✅ Done       |
| Organiser exports / prints registered guests                    | [#1863](https://github.com/climateconnect/climateconnect/issues/1863)                                                                       |                                                                              | ✅ Done       |
| Organiser sends email to all registered guests                  | [#1866](https://github.com/climateconnect/climateconnect/issues/1866) [#1886](https://github.com/climateconnect/climateconnect/issues/1886) |                                                                              | ✅ Done       |
| Organiser closes / reopens registration                         | [#1851](https://github.com/climateconnect/climateconnect/issues/1851)                                                                       |                                                                              | ✅ Done       |
| Organiser cancels an individual guest registration              | [#1872](https://github.com/climateconnect/climateconnect/issues/1872)                                                                       |                                                                              | ✅ Done       |
| Organiser sets admin notification preference for registrations  | [#1882](https://github.com/climateconnect/climateconnect/issues/1882)                                                                       |                                                                              | ✅ Done       |
| Admin notification emails on member registration / cancellation | [#1888](https://github.com/climateconnect/climateconnect/issues/1888)                                                                       |                                                                              | ✅ Done       |

### 🎯 Phase 2b — Pre-launch UX Polish (go-live blockers)

Small frontend improvements required before the `EVENT_REGISTRATION` toggle is flipped to production. Tracked in [#1981](https://github.com/climateconnect/climateconnect/issues/1981).

| Story                                                                  | GitHub Issue                                                 | Spec                                                                                                                     | Status |
| ---------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | -- |
| Auto-set event registration end date on start date change              |   | ✅ Done    |
| Edit project form button reorganization (delete + registration config) | | ✅ Done    |
| Hide collaboration sections for events                                 |   | ✅ Done    |
| Fix page jump on create project details step                           |   | ✅ Done    |

### 🎯 Phase 3 — Guest Registration + UX Polish (go-live blocker)

> **Enabler dependency**: Requires **[EPIC: Auth Unification](./EPIC_auth_unification.md)** (Phase A) to be complete before the guest registration story can ship. The guest registration flow depends on the new combined login/signup and token-based auth that are delivered by that separate epic.
>
> **Toggle flip**: The `EVENT_REGISTRATION` production toggle is flipped **after** this phase is validated on staging — not after Phase 2.

| Story                                                                   | GitHub Issue                                                          | Status                                                                              |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Guest user registers for an event and becomes a platform member         | —                                                                     | [`20260430_0936_...`](./20260430_0936_guest_event_registration_auth_integration.md) |
| Show registration status on project browse and similar projects sidebar | [#1901](https://github.com/climateconnect/climateconnect/issues/1901) | ⚪                                                                                  |

### 🔧 Phase 4 — Custom Registration Fields (incremental)

> **Scheduling**: Development starts **in parallel with Phase 3**. Phase 4 stories are built and deployed behind the `EVENT_REGISTRATION` toggle and ship to production after the toggle flip. Each iteration stands on its own and delivers user value independently.
>
> **Organiser view and management capabilities** (what was previously called "detailed registration status" and "advanced management tasks") grow organically with each iteration — they are not separate stories but are included in the scope of each field-type story.

#### Phase 4a — Select & Checkbox Fields (iteration 1 ✅)

The foundational custom fields story. Organisers can add up to **5 extra fields** — single-select (dropdown) and checkbox (boolean) — to their event's registration form, control field order, and mark fields as required.

| Story                                                                            | GitHub Issue                                                          | Spec                                                                                                       | Status     |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------- |
| Organiser creates/edits event with custom registration fields (select, checkbox) |  | ✅ Done    |
| Member registers with custom fields (select, checkbox)                           | —                                                                     | —                                                                                                          | ✅ Done   |

**#1880 field specs** (detail to be expanded in tech spec):

| Field type             | Registration value | Key settings                                                |
| ---------------------- | ------------------ | ----------------------------------------------------------- |
| Checkbox               | Boolean            | Description (rich text — bold + links); required flag       |
| Option select (single) | Selected option    | Title; 1–N options (each with title + order); required flag |

**Forward-compatibility constraints from #1880** (must be kept in mind during design, not necessarily implemented now):

- Response storage must accommodate a later **Inventory** field type that persists `(selected option, quantity)` — not just a single value.
- Schema should not preclude a **Time slot select** field type with per-slot seat limits.
- Architecture should support future **registration form templates** for reuse across events.

#### Phase 4b — Inventory / Capacity Options

Organisers can define options with **limited availability** — e.g. workshop slots, shuttle seats, meal choices. Each option has a capacity (stock limit). The system tracks remaining availability per option and stores per-guest what they booked (option + quantity). This requires capacity tracking at the option level and a per-participant response record. Guests cannot select an option once it is fully booked.

| Story | GitHub Issue | Spec | Status |
|-------|-------------|------|------|
| Organiser creates/edits event with inventory options (capacity per option) | [#1995](https://github.com/climateconnect/climateconnect/issues/1995) | [`20260519_1328_inventory_field_type_event_registration.md`](./20260519_1328_inventory_field_type_event_registration.md) | ✅ Done  |
| Member selects inventory options when registering; system enforces per-option capacity | [#2004](https://github.com/climateconnect/climateconnect/issues/2004) | [`20260526_1347_add_inventory_field_to_event_registration.md`](./20260526_1347_add_inventory_field_to_event_registration.md) | ✅ Done   |

#### Phase 4c — Time Slot Select

Organisers can define **time slot** options — each with a start time, end time, and optional per-slot capacity. Registrants pick one slot. Use cases: solar module pickup windows, workshop sessions, volunteer shifts, course time slots. Capacity enforcement (preventing over-booking of a full slot) follows the same pattern as inventory.

| Story | GitHub Issue | Spec | Status |
|-------|-------------|------|------|
| Organiser creates/edits event with time slot field | [#2006](https://github.com/climateconnect/climateconnect/issues/2006) | [`20260526_1100_time_slot_field_type_event_registration.md`](./20260526_1100_time_slot_field_type_event_registration.md) | ✅ Done  |
| Member selects time slot when registering; system enforces per-slot capacity | [#2007](https://github.com/climateconnect/climateconnect/issues/2007) | [`20260526_1530_add_time_slot_field_to_event_registration.md`](./20260526_1530_add_time_slot_field_to_event_registration.md) | ✅ Done   |

#### Phase 4x — Custom Field Label & Export (cross-cutting)

An organiser-facing label (max 30 chars) for custom registration fields, used in export/print/overview views. A default label is auto-generated (localised field type + sequential number) and the organiser can edit it inline. Applies to all field types.

| Story                                     | GitHub Issue                                                          | Spec                                                                           | Status |
| ----------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --- |
| Custom field label (default + adjustable) | [#1997](https://github.com/climateconnect/climateconnect/issues/1997) | [`20260521_0923_custom_field_label.md`](./20260521_0923_custom_field_label.md) | ✅ Done     |

#### Phase 4y — Guest registration overview (cross-cutting)

A guest who has registered for an event can open a modal from the project page
to review the values they submitted (including custom field responses). The
existing _Cancel registration_ action moves from the project page into this
modal. The modal component is the same one the organiser uses to view a
guest's registration.

| Story                                             | GitHub Issue                                                          | Spec                                                                                                   | Status |
| ------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----- |
| Guest views and modifies their event registration | [#2003](https://github.com/climateconnect/climateconnect/issues/2003) | [`20260526_1130_guest_view_modify_registration.md`](./20260526_1130_guest_view_modify_registration.md) | ⚪    |
| Story | GitHub Issue | Spec | Status |
|-------|-------------|------|--------|
| Export event registration results with custom field data | [#1962](https://github.com/climateconnect/climateconnect/issues/1962) | [`20260527_0830_export_event_registration_with_custom_fields.md`](./20260527_0830_export_event_registration_with_custom_fields.md) | ✅ Done   |

#### Phase 4z — Registration Email with Field Answers (cross-cutting)

When a guest registers for an event with custom fields, include the provided answers in the confirmation email. If no custom fields exist or no answers were provided, the email is unchanged.

| Story | GitHub Issue | Spec | Status |
|-------|-------------|------|--------|
| Include field answers in registration confirmation email | [#2023](https://github.com/climateconnect/climateconnect/issues/2023) | [`20260601_1031_include_field_answers_in_registration_email.md`](./20260601_1031_include_field_answers_in_registration_email.md) | ⚪ |

#### Phase 4w — Add Registration to Existing Event (cross-cutting)

Organisers can enable or disable online registration for an existing event at any time. When enabled, a draft registration configuration is created that can be published when ready. When disabled, the configuration is preserved but hidden.

| Story | GitHub Issue | Spec | Status |
|-------|-------------|------|--------|
| Allow the user to turn event registration on/off when editing an event | [#2001](https://github.com/climateconnect/climateconnect/issues/2001) | [`20260602_0755_add_registration_to_existing_event.md`](./20260602_0755_add_registration_to_existing_event.md) | ⚪ |

#### Phase 4c+ — Further Field Types (TBD)

Additional field types (e.g. free text, number, date) to be defined based on user feedback after Phase 4a ships.

| Story                                                               | Status |
| ------------------------------------------------------------------- | ------ |
| Further custom field types (scope TBD after Phase 4a user feedback) | ⚪     |

### 🔮 Phase 5 — Templates, Check-in & Nice-to-Haves (future)

| Story                                                             | Status |
| ----------------------------------------------------------------- | ------ |
| Reusable event registration settings (templates)                  | ⚪     |
| Event organizer can checkin attendants                            | ⚪     |
| Member receives event reminder notifications                      | ⚪     |
| Post-event follow ups (survey/feedback,...)                       | ⚪     |
| Enriched messages to guests (e.g. with html, images, attachments) | ⚪     |
| iCal support for events                                           | ⚪     |

---

## Shared Architecture

### Entity: `EventRegistration`

Introduced in [#1820](https://github.com/climateconnect/climateconnect/issues/1820). Present throughout the epic.

| Field                   | Type                                  | Notes                                                                                                                                                                                                                                                                                |
| ----------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `project`               | OneToOneFK → `Project`                | Presence of this record is the sole signal that registration is enabled — no boolean flag on `Project`.                                                                                                                                                                              |
| `max_participants`      | PositiveInteger, nullable             | Required on publish; nullable while draft. Must be > 0.                                                                                                                                                                                                                              |
| `registration_end_date` | DateTimeField (TIMESTAMPTZ), nullable | Required on publish; nullable while draft. Must be ≤ `project.end_date`.                                                                                                                                                                                                             |
| `status`                | CharField (`open`/`closed`/`full`)    | Added in [#1820](https://github.com/climateconnect/climateconnect/issues/1820) (migration `0121`). `open` default. `full` is system-managed only. [#1851](https://github.com/climateconnect/climateconnect/issues/1851) adds `ended` as a Python-side computed value (never stored). |
| `created_at`            | DateTimeField                         | Auto.                                                                                                                                                                                                                                                                                |
| `updated_at`            | DateTimeField                         | Auto.                                                                                                                                                                                                                                                                                |

**"Is registration open?" check** (O(1), no COUNT query):

```
effective_status == "open"
```

Where `effective_status` is computed lazily by `EventRegistrationSerializer`:

- If `stored_status == "open"` AND `registration_end_date <= now()` → return `"ended"` _([#1851](https://github.com/climateconnect/climateconnect/issues/1851))_
- Otherwise → return `stored_status`

### Entity: `EventParticipant` _([#1845](https://github.com/climateconnect/climateconnect/issues/1845) / [#1850](https://github.com/climateconnect/climateconnect/issues/1850) — implemented)_

| Field                | Type                         | Notes                                                                                                                                                                                                                        |
| -------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `user`               | FK → `User`                  | `related_name="event_participations"`                                                                                                                                                                                        |
| `event_registration` | FK → `EventRegistration`     | `related_name="participants"`                                                                                                                                                                                                |
| `registered_at`      | DateTimeField                | Auto.                                                                                                                                                                                                                        |
| `cancelled_at`       | DateTimeField, nullable      | `NULL` = active registration. Set to `now()` on cancellation ([#1850](https://github.com/climateconnect/climateconnect/issues/1850)). Reset to `NULL` on re-registration. Never deleted — row is kept for historical record. |
| UNIQUE               | `(user, event_registration)` | Prevents duplicate registrations. Re-registration updates the existing row in-place.                                                                                                                                         |

### `RegistrationStatus` Enum — Evolution

| Value    | Stored in DB      | Settable via API | Set by                       | Since                                                                                                                                                  |
| -------- | ----------------- | ---------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `open`   | ✅                | ✅ (organiser)   | Default / organiser reopen   | [#1820](https://github.com/climateconnect/climateconnect/issues/1820)                                                                                  |
| `closed` | ✅                | ✅ (organiser)   | Organiser manual close       | [#1820](https://github.com/climateconnect/climateconnect/issues/1820) (UI in [#1851](https://github.com/climateconnect/climateconnect/issues/1851))    |
| `full`   | ✅                | ❌ (system only) | System, when last seat taken | [#1820](https://github.com/climateconnect/climateconnect/issues/1820) (logic in [#1845](https://github.com/climateconnect/climateconnect/issues/1845)) |
| `ended`  | ❌ (never stored) | ❌               | Serializer, lazily computed  | [#1851](https://github.com/climateconnect/climateconnect/issues/1851)                                                                                  |

### API Endpoints — Full Surface

| Endpoint                                                      | Method | Introduced                                                                        | Notes                                                                                                                                                                                              |
| ------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/projects/`                                         | POST   | [#1820](https://github.com/climateconnect/climateconnect/issues/1820)             | Accepts `event_registration` nested object on create                                                                                                                                               |
| `GET /api/projects/{slug}/`                                   | GET    | [#1820](https://github.com/climateconnect/climateconnect/issues/1820)             | Returns `event_registration` object (including `status`)                                                                                                                                           |
| `GET /api/projects/`                                          | GET    | [#1820](https://github.com/climateconnect/climateconnect/issues/1820)             | Returns `event_registration` per list item                                                                                                                                                         |
| `PATCH /api/projects/{slug}/`                                 | PATCH  | [#1820](https://github.com/climateconnect/climateconnect/issues/1820)             | Accepts `event_registration` nested object on create only — read-only in update context                                                                                                            |
| `PATCH /api/projects/{slug}/registration/`                    | PATCH  | [#1848](https://github.com/climateconnect/climateconnect/issues/1848)             | Dedicated endpoint to update `max_participants`, `registration_end_date`, and `status` (close/reopen — organiser sets `status: "closed"` or `"open"`)                                              |
| `POST /api/projects/{slug}/register/`                         | POST   | [#1845](https://github.com/climateconnect/climateconnect/issues/1845)             | Member registers for an event                                                                                                                                                                      |
| `DELETE /api/projects/{slug}/register/`                       | DELETE | [#1850](https://github.com/climateconnect/climateconnect/issues/1850)             | Member cancels registration (soft delete — sets `cancelled_at`)                                                                                                                                    |
| `GET /api/members/me/registered-events/`                      | GET    | [#1849](https://github.com/climateconnect/climateconnect/issues/1849)             | Authenticated member's upcoming registered events                                                                                                                                                  |
| `GET /api/projects/{slug}/registrations/`                     | GET    | [#1863](https://github.com/climateconnect/climateconnect/issues/1863)             | Organiser lists registered guests; extended in [#1872](https://github.com/climateconnect/climateconnect/issues/1872) to return all registrations (active + cancelled) with `id` and `cancelled_at` |
| `POST /api/projects/{slug}/registrations/email/`              | POST   | [product-backlog#55](https://github.com/climateconnect/product-backlog/issues/55) | Organiser sends email to all registered guests (`is_test=true` sends to self only; always returns `{"sent_count": N}`)                                                                             |
| `PATCH /api/projects/{slug}/registrations/{registration_id}/` | PATCH  | [#1872](https://github.com/climateconnect/climateconnect/issues/1872)             | Organiser/admin cancels a specific guest's registration (soft delete); optional `message` body triggers cancellation email to the guest                                                            |

### `event_registration` API Response Shape

```json
{
  "max_participants": 100,
  "registration_end_date": "2026-06-01T23:59:00Z",
  "status": "open" | "closed" | "full" | "ended"
}
```

- `available_seats` will be added to the **detail response only** once `EventParticipant` is implemented ([#1845](https://github.com/climateconnect/climateconnect/issues/1845)). Not in list responses (requires a COUNT query per row). From [#1850](https://github.com/climateconnect/climateconnect/issues/1850) onwards, the count must filter `cancelled_at IS NULL`.

---

## Cross-Cutting Concerns

### Feature Toggle

The `EVENT_REGISTRATION` toggle was created **first**, before any feature work, as the cornerstone of this epic's incremental rollout strategy. Record created by migration `feature_toggles/migrations/0002_add_event_registration_toggle.py`.

> **Frontend toggle cleanup complete.** All `isEnabled("EVENT_REGISTRATION")` checks have been removed from the frontend code. The `FeatureToggle` database record remains and will be deleted manually. See [`20260608_1107_cleanup_feature_toggles.md`](./20260608_1107_cleanup_feature_toggles.md) for details.

### Draft Mode

Consistent across all tasks: when `is_draft=true`, all required-field validation and cross-field constraint validation (e.g. `registration_end_date ≤ project.end_date`, past-date guard) are **skipped**. Full validation is enforced on publish (`is_draft=false`). Established in [#1820](https://github.com/climateconnect/climateconnect/issues/1820).

### Authentication & Permissions

| Action                          | Required Role                              |
| ------------------------------- | ------------------------------------------ |
| View `event_registration`       | None (public)                              |
| Create event with registration  | Authenticated                              |
| Register for event              | Authenticated (member)                     |
| Cancel own registration         | Authenticated (same member who registered) |
| Edit registration settings      | Project organiser or team admin            |
| Close / reopen registration     | Project organiser or team admin            |
| Send email to registered guests | Project organiser or team admin            |
| Cancel a guest's registration   | Project organiser or team admin            |

### Post-Auth Redirect ([#1845](https://github.com/climateconnect/climateconnect/issues/1845))

- Sign-in page: `/signin` (not `/login`)
- Query parameter: `redirect` (not `next`) — confirmed in `pages/signin.tsx` (`params.redirect`)
- Sign-up page: `/signup` needs `redirect` param support **added as part of [#1845](https://github.com/climateconnect/climateconnect/issues/1845)**
- Deep-link URL: `/projects/{slug}/register` (not `/{slug}/register`) — implemented as `pages/projects/[projectId]/register.tsx`

---

## Key Design Decisions

| Decision                             | Choice                                              | Rationale                                                                                        |
| ------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Registration enabled signal          | Presence of `EventRegistration` row                 | No boolean flag on `Project`; row existence is unambiguous                                       |
| `available_seats` storage            | Computed (`max_participants - COUNT(participants)`) | No denormalised counter; avoids update anomalies                                                 |
| `available_seats` in list            | Excluded                                            | COUNT per row makes list endpoint unacceptably slow                                              |
| `full` status                        | System-managed, never writable                      | Set atomically in same transaction as last registration; O(1) read avoids COUNT on every request |
| `ended` status                       | Lazy computation, never stored                      | Avoids Celery Beat scheduled job; serializer returns it when `open AND deadline_passed`          |
| `EventParticipant.user` related_name | `event_participations`                              | Avoids ambiguity with the `EventRegistration` model name                                         |
| Cancellation strategy                | Soft delete (`cancelled_at`)                        | Preserves historical record for future organiser visibility feature; no data migration needed    |
| Re-registration                      | `update_or_create`, reset `cancelled_at = NULL`     | Unique constraint `(user, event_registration)` stays intact; no duplicate rows                   |
| Frontend deep-link                   | `/projects/{slug}/register`                         | Consistent with `/projects/{slug}` routing; clean SSR redirect for unauthenticated users         |

---

## Dependency Graph

```
#1820 Create event with registration   (COMPLETED)
    │
    ├──▶ #1845 Member registers        (READY)   — needs EventParticipant, /register endpoint
    │         │
    │         ├──▶ #1849 Member sees registered events  (READY)   — reads EventParticipant list
    │         │
    │         └──▶ #1850 Member cancels registration    (COMPLETED) — soft delete; adds cancelled_at
    │
    ├──▶ #1851 Organiser closes/reopens (IN PROGRESS) — needs status UI; adds "ended" lazy status
    │
    └──▶ #1848 Organiser edits         (READY)   — dedicated PATCH /registration/ endpoint; modal UI on detail page
```

[#1845](https://github.com/climateconnect/climateconnect/issues/1845), [#1851](https://github.com/climateconnect/climateconnect/issues/1851), and [#1848](https://github.com/climateconnect/climateconnect/issues/1848) each depend only on [#1820](https://github.com/climateconnect/climateconnect/issues/1820). [#1849](https://github.com/climateconnect/climateconnect/issues/1849) and [#1850](https://github.com/climateconnect/climateconnect/issues/1850) depend on [#1845](https://github.com/climateconnect/climateconnect/issues/1845) for the `EventParticipant` entity. Note: [#1850](https://github.com/climateconnect/climateconnect/issues/1850) introduces `cancelled_at` which requires retroactive filtering in [#1845](https://github.com/climateconnect/climateconnect/issues/1845) and [#1849](https://github.com/climateconnect/climateconnect/issues/1849) — it is therefore safest to implement [#1845](https://github.com/climateconnect/climateconnect/issues/1845) and [#1850](https://github.com/climateconnect/climateconnect/issues/1850) together or in immediate sequence.

---

## Files Changed Across This Epic

### Backend
| File | Tasks |
|------|-------|
| `organization/models/event_registration.py` | [#1820](https://github.com/climateconnect/climateconnect/issues/1820), [#1851](https://github.com/climateconnect/climateconnect/issues/1851), [#1882](https://github.com/climateconnect/climateconnect/issues/1882) |
| `organization/models/__init__.py` | [#1820](https://github.com/climateconnect/climateconnect/issues/1820) |
| `organization/serializers/event_registration.py` | [#1820](https://github.com/climateconnect/climateconnect/issues/1820), [#1851](https://github.com/climateconnect/climateconnect/issues/1851), [#1848](https://github.com/climateconnect/climateconnect/issues/1848), [product-backlog#55](https://github.com/climateconnect/product-backlog/issues/55), [#1872](https://github.com/climateconnect/climateconnect/issues/1872) / [#1871](https://github.com/climateconnect/climateconnect/issues/1871), [#1882](https://github.com/climateconnect/climateconnect/issues/1882), [#2007](https://github.com/climateconnect/climateconnect/issues/2007) |
| `organization/serializers/project.py` | [#1820](https://github.com/climateconnect/climateconnect/issues/1820) |
| `organization/views/project_views.py` | [#1820](https://github.com/climateconnect/climateconnect/issues/1820) |
| `organization/views/event_registration_views.py` *(new in #1845 / #1851)* | [#1845](https://github.com/climateconnect/climateconnect/issues/1845), [#1851](https://github.com/climateconnect/climateconnect/issues/1851), [#1848](https://github.com/climateconnect/climateconnect/issues/1848), [#1850](https://github.com/climateconnect/climateconnect/issues/1850), [product-backlog#55](https://github.com/climateconnect/product-backlog/issues/55), [#1872](https://github.com/climateconnect/climateconnect/issues/1872) / [#1871](https://github.com/climateconnect/climateconnect/issues/1871), [#1888](https://github.com/climateconnect/climateconnect/issues/1888), [#2007](https://github.com/climateconnect/climateconnect/issues/2007) |
| `organization/permissions.py` | [#1845](https://github.com/climateconnect/climateconnect/issues/1845), [#1851](https://github.com/climateconnect/climateconnect/issues/1851), [#1850](https://github.com/climateconnect/climateconnect/issues/1850) |
| `organization/urls.py` | [#1845](https://github.com/climateconnect/climateconnect/issues/1845), [#1851](https://github.com/climateconnect/climateconnect/issues/1851), [#1850](https://github.com/climateconnect/climateconnect/issues/1850), [product-backlog#55](https://github.com/climateconnect/product-backlog/issues/55) |
| `organization/models/event_participant.py` *(new in #1845)* | [#1845](https://github.com/climateconnect/climateconnect/issues/1845), [#1850](https://github.com/climateconnect/climateconnect/issues/1850) |
| `organization/utility/email.py` | [product-backlog#55](https://github.com/climateconnect/product-backlog/issues/55), [#1872](https://github.com/climateconnect/climateconnect/issues/1872), [#1888](https://github.com/climateconnect/climateconnect/issues/1888) |
| `organization/tasks.py` | [product-backlog#55](https://github.com/climateconnect/product-backlog/issues/55), [#1888](https://github.com/climateconnect/climateconnect/issues/1888) |
| `climateconnect_main/settings.py` | [product-backlog#55](https://github.com/climateconnect/product-backlog/issues/55), [#1872](https://github.com/climateconnect/climateconnect/issues/1872), [#1888](https://github.com/climateconnect/climateconnect/issues/1888) |
| `organization/tests/test_event_registration.py` | [#1820](https://github.com/climateconnect/climateconnect/issues/1820), [#1845](https://github.com/climateconnect/climateconnect/issues/1845), [#1851](https://github.com/climateconnect/climateconnect/issues/1851), [#1848](https://github.com/climateconnect/climateconnect/issues/1848), [#1849](https://github.com/climateconnect/climateconnect/issues/1849), [#1850](https://github.com/climateconnect/climateconnect/issues/1850), [product-backlog#55](https://github.com/climateconnect/product-backlog/issues/55), [#1872](https://github.com/climateconnect/climateconnect/issues/1872), [#1882](https://github.com/climateconnect/climateconnect/issues/1882), [#1888](https://github.com/climateconnect/climateconnect/issues/1888), [#2007](https://github.com/climateconnect/climateconnect/issues/2007) ← backend tests pending |
| `climateconnect_api/views/` *(or member profile views)* | [#1849](https://github.com/climateconnect/climateconnect/issues/1849) |

### Frontend
| File | Tasks |
|------|-------|
| `pages/projects/[projectId]/register.tsx` | [#1845](https://github.com/climateconnect/climateconnect/issues/1845) |
| `pages/projects/[projectId]/index.tsx` (event detail) | [#1845](https://github.com/climateconnect/climateconnect/issues/1845), [#1849](https://github.com/climateconnect/climateconnect/issues/1849), [#1850](https://github.com/climateconnect/climateconnect/issues/1850) |
| `src/components/project/EventRegistrationButton.js` *(or similar)* | [#1845](https://github.com/climateconnect/climateconnect/issues/1845), [#1850](https://github.com/climateconnect/climateconnect/issues/1850) |
| `src/components/project/ProjectRegistrationsContent.tsx` | [product-backlog#55](https://github.com/climateconnect/product-backlog/issues/55), [#1872](https://github.com/climateconnect/climateconnect/issues/1872) / [#1871](https://github.com/climateconnect/climateconnect/issues/1871), [#1962](https://github.com/climateconnect/climateconnect/issues/1962) |
| `src/components/project/SendEmailToGuestsModal.tsx` *(new)* | [product-backlog#55](https://github.com/climateconnect/product-backlog/issues/55) |
| `src/components/project/CancelGuestRegistrationModal.tsx` *(new)* | [#1872](https://github.com/climateconnect/climateconnect/issues/1872) |
| `public/texts/project_texts.tsx` | [product-backlog#55](https://github.com/climateconnect/product-backlog/issues/55), [#1872](https://github.com/climateconnect/climateconnect/issues/1872), [#1882](https://github.com/climateconnect/climateconnect/issues/1882), [#1962](https://github.com/climateconnect/climateconnect/issues/1962), [#2007](https://github.com/climateconnect/climateconnect/issues/2007) |
| Profile / dashboard page (registered events grid) | [#1849](https://github.com/climateconnect/climateconnect/issues/1849), [#1850](https://github.com/climateconnect/climateconnect/issues/1850) |
| `src/components/shareProject/EventRegistrationSection.tsx` | [#1882](https://github.com/climateconnect/climateconnect/issues/1882) |
| `src/components/project/EditEventRegistrationModal.tsx` | [#1882](https://github.com/climateconnect/climateconnect/issues/1882) |
| `src/components/project/RegistrationTimeSlotField.tsx` *(new)* | [#2007](https://github.com/climateconnect/climateconnect/issues/2007) |
| `src/components/project/RegistrationFieldAnswersForm.tsx` | [#2007](https://github.com/climateconnect/climateconnect/issues/2007) |
| `src/utils/resolveRegistrationFieldAnswer.ts` *(new)* | [#1962](https://github.com/climateconnect/climateconnect/issues/1962) |

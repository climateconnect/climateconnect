# EPIC: Event Registration

**Type**: Epic  
**Status**: IN PROGRESS  
**Started**: 2026-03-05  
**Backlog Issues**: [product-backlog #43](https://github.com/climateconnect/product-backlog/issues/43), [#44](https://github.com/climateconnect/product-backlog/issues/44), [#56](https://github.com/climateconnect/product-backlog/issues/56), [#59](https://github.com/climateconnect/product-backlog/issues/59)  
**Owner**: CC

---

## Overview

This epic delivers end-to-end online registration for Climate Connect events. It covers the full lifecycle — from an organiser enabling and configuring registration when creating an event, through members discovering and registering for events, to organisers managing (editing, closing, reopening) registration after the event is published.

### Rollout Strategy: Toggle-First

The `EVENT_REGISTRATION` feature toggle was implemented **before any feature work began** (migration `0002_add_event_registration_toggle.py`). This is the deliberate strategy for this epic:

1. **All tasks** in this epic are developed and shipped behind the toggle — production users see nothing until the team decides to flip it.
2. The toggle allows the team to **test incrementally** on staging and in development without exposing incomplete flows to production users.
3. When a defined **MVP milestone** is reached, the toggle is flipped to `production_is_active = True` via a data migration (or Django admin). From that point, the live feature continues to be improved through further tasks — still behind the same toggle if needed, or openly in production.
4. **Every new UI component** in this epic must check `isEnabled("EVENT_REGISTRATION")` before rendering — consistent with `ShareProjectRoot.tsx` which already does this. Backend API changes are always additive (non-breaking) and do not need to be toggled.

### MVP Milestone

The **MVP** is the minimum set of tasks that must be complete before the toggle is flipped in production. The proposed MVP is:

| Task | Reason required for MVP |
|------|------------------------|
| ✅ #43 Create event with registration | Foundation — organiser can configure registration |
| #44 Member registers for event | Core user value — without this, registration has no effect for members |
| #56 Organiser closes / reopens registration | Safety valve — organiser must be able to stop registrations if circumstances change |

**Post-MVP** (delivered in production after the toggle is flipped, continuing iterative improvement):

| Task | Notes |
|------|-------|
| #59 Organiser edits registration settings | Useful but not blocking — organiser can work around by recreating the event |
| #46 Member profile: registered events | Convenience feature, not on the critical path |
| Unregister / cancel registration | Explicit out-of-scope for this epic; separate dedicated task |

> ⚙️ **Toggle flip procedure**: update `production_is_active = True` on the `EVENT_REGISTRATION` `FeatureToggle` record (via a data migration or the Django admin panel). Coordinate with a frontend deployment to ensure the new UI is live before flipping.

---

## Task Map

| # | Spec | Backlog Issue | Code Issue | Status | Milestone | Description | Depends On |
|---|------|--------------|-----------|--------|---------|-------------|------------|
| 1 | [`20260305_1000_create_event_with_basic_registration.md`](./20260305_1000_create_event_with_basic_registration.md) | [product-backlog #43](https://github.com/climateconnect/product-backlog/issues/43) | [#1820](https://github.com/climateconnect/climateconnect/issues/1820) | ✅ **COMPLETED** | 🎯 MVP | Organiser enables registration when creating an event. Introduces `EventRegistration` entity. | — |
| 2 | [`20260309_0900_member_register_for_event.md`](./20260309_0900_member_register_for_event.md) | [product-backlog #44](https://github.com/climateconnect/product-backlog/issues/44) | [#1845](https://github.com/climateconnect/climateconnect/issues/1845) | 🔵 **READY** | 🎯 MVP | Member registers for an event. Introduces `EventParticipant` entity, confirmation email, and deep-link. | #43 |
| 3 | [`20260324_0900_organizer_close_event_registration.md`](./20260324_0900_organizer_close_event_registration.md) | [product-backlog #56](https://github.com/climateconnect/product-backlog/issues/56) | — | 🟡 **IN PROGRESS** | 🎯 MVP | Organiser manually closes or reopens registration. Introduces `ended` lazy status. | #43 |
| 4 | [`20260325_0900_organizer_edit_event_registration.md`](./20260325_0900_organizer_edit_event_registration.md) | [product-backlog #59](https://github.com/climateconnect/product-backlog/issues/59) | [#1848](https://github.com/climateconnect/climateconnect/issues/1848) | 🔵 **READY** | 🎯 MVP | Organiser edits `max_participants` and `registration_end_date` on an existing event. | #43 |

**Legend**: ✅ Completed · 🟡 In Progress · 🔵 Ready · ⚪ Not Started · 🎯 MVP · 🔄 Post-MVP

---

## Shared Architecture

### Entity: `EventRegistration`

Introduced in task #43. Present throughout the epic.

| Field | Type | Notes |
|-------|------|-------|
| `project` | OneToOneFK → `Project` | Presence of this record is the sole signal that registration is enabled — no boolean flag on `Project`. |
| `max_participants` | PositiveInteger, nullable | Required on publish; nullable while draft. Must be > 0. |
| `registration_end_date` | DateTimeField (TIMESTAMPTZ), nullable | Required on publish; nullable while draft. Must be ≤ `project.end_date`. |
| `status` | CharField (`open`/`closed`/`full`) | Added in task #43 (migration `0121`). `open` default. `full` is system-managed only. Task #56 adds `ended` as a Python-side computed value (never stored). |
| `created_at` | DateTimeField | Auto. |
| `updated_at` | DateTimeField | Auto. |

**"Is registration open?" check** (O(1), no COUNT query):
```
effective_status == "open"
```
Where `effective_status` is computed lazily by `EventRegistrationSerializer`:
- If `stored_status == "open"` AND `registration_end_date <= now()` → return `"ended"` *(task #56)*
- Otherwise → return `stored_status`

### Entity: `EventParticipant` *(task #44 — not yet implemented)*

| Field | Type | Notes |
|-------|------|-------|
| `user` | FK → `User` | `related_name="event_participations"` |
| `event_registration` | FK → `EventRegistration` | `related_name="participants"` |
| `registered_at` | DateTimeField | Auto. |
| UNIQUE | `(user, event_registration)` | Prevents duplicate registrations. |

### `RegistrationStatus` Enum — Evolution

| Value | Stored in DB | Settable via API | Set by | Since |
|-------|-------------|-----------------|--------|-------|
| `open` | ✅ | ✅ (organiser) | Default / organiser reopen | #43 |
| `closed` | ✅ | ✅ (organiser) | Organiser manual close | #43 (UI in #56) |
| `full` | ✅ | ❌ (system only) | System, when last seat taken | #43 (logic in #44) |
| `ended` | ❌ (never stored) | ❌ | Serializer, lazily computed | #56 |

### API Endpoints — Full Surface

| Endpoint | Method | Introduced | Notes |
|----------|--------|-----------|-------|
| `POST /api/projects/` | POST | #43 | Accepts `event_registration` nested object on create |
| `GET /api/projects/{slug}/` | GET | #43 | Returns `event_registration` object (including `status`) |
| `GET /api/projects/` | GET | #43 | Returns `event_registration` per list item |
| `PATCH /api/projects/{slug}/` | PATCH | #59 | `event_registration` object becomes writable for existing records |
| `POST /api/projects/{slug}/register/` | POST | #44 | Member registers for an event |
| `POST /api/projects/{slug}/registration/close/` | POST | #56 | Organiser closes registration |
| `POST /api/projects/{slug}/registration/reopen/` | POST | #56 | Organiser reopens registration |

> ⚠️ **URL prefix note**: All endpoints use `/api/projects/` — there is no `/api/events/` prefix in this codebase. The organisation app is mounted at `api/` and all project/event URLs follow the `/api/projects/{slug}/` pattern. Task #56 specs contain `/api/events/{slug}/...` which must be corrected to `/api/projects/{slug}/...` before implementation.

### `event_registration` API Response Shape

```json
{
  "max_participants": 100,
  "registration_end_date": "2026-06-01T23:59:00Z",
  "status": "open" | "closed" | "full" | "ended"
}
```

- `available_seats` will be added to the **detail response only** once `EventParticipant` is implemented (task #44). Not in list responses (requires a COUNT query per row).

---

## Cross-Cutting Concerns

### Feature Toggle

The `EVENT_REGISTRATION` toggle was created **first**, before any feature work, as the cornerstone of this epic's incremental rollout strategy. Record created by migration `feature_toggles/migrations/0002_add_event_registration_toggle.py`.

| Environment | Current State | Notes |
|-------------|--------------|-------|
| Development | ✅ Enabled | Always on — full feature visible to developers |
| Staging | ✅ Enabled | Full feature visible for QA and stakeholder review |
| Production | ❌ Disabled | Flipped to `True` at the MVP milestone |

**Rules for every agent working on this epic:**
- All new frontend UI components **must** check `isEnabled("EVENT_REGISTRATION")` before rendering. The check pattern from `ShareProjectRoot.tsx` is the reference: `const isEventRegistrationEnabled = isEnabled("EVENT_REGISTRATION")`.
- Backend API changes are **always additive** and do not need to be gated by the toggle — the new fields and endpoints are harmless to existing consumers even when the UI is hidden.
- Do **not** remove or bypass the toggle check, even if the toggle is enabled in your local environment. The check must stay in place until the team explicitly decides to retire it post-launch.

**Toggle flip at MVP**: when tasks #43, #44, and #56 are all complete and validated on staging, update the `FeatureToggle` record: `production_is_active = True`. This can be done via the Django admin panel or a targeted data migration. Coordinate the backend deployment and frontend deployment so both are live before flipping.

### Draft Mode
Consistent across all tasks: when `is_draft=true`, all required-field validation and cross-field constraint validation (e.g. `registration_end_date ≤ project.end_date`, past-date guard) are **skipped**. Full validation is enforced on publish (`is_draft=false`). Established in task #43.

### Authentication & Permissions
| Action | Required Role |
|--------|--------------|
| View `event_registration` | None (public) |
| Create event with registration | Authenticated |
| Register for event | Authenticated (member) |
| Edit registration settings | Project organiser or team admin |
| Close / reopen registration | Project organiser or team admin |

### Post-Auth Redirect (task #44)
- Sign-in page: `/signin` (not `/login`)
- Query parameter: `redirect` (not `next`) — confirmed in `pages/signin.tsx` (`params.redirect`)
- Sign-up page: `/signup` needs `redirect` param support **added as part of task #44**
- Deep-link URL: `/projects/{slug}/register` (not `/{slug}/register`) — implemented as `pages/projects/[projectId]/register.tsx`

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Registration enabled signal | Presence of `EventRegistration` row | No boolean flag on `Project`; row existence is unambiguous |
| `available_seats` storage | Computed (`max_participants - COUNT(participants)`) | No denormalised counter; avoids update anomalies |
| `available_seats` in list | Excluded | COUNT per row makes list endpoint unacceptably slow |
| `full` status | System-managed, never writable | Set atomically in same transaction as last registration; O(1) read avoids COUNT on every request |
| `ended` status | Lazy computation, never stored | Avoids Celery Beat scheduled job; serializer returns it when `open AND deadline_passed` |
| `EventParticipant.user` related_name | `event_participations` | Avoids ambiguity with the `EventRegistration` model name |
| Frontend deep-link | `/projects/{slug}/register` | Consistent with `/projects/{slug}` routing; clean SSR redirect for unauthenticated users |

---

## Dependency Graph

```
#43 Create event with registration   (COMPLETED)
    │
    ├──▶ #44 Member registers         (READY)   — needs EventParticipant, /register endpoint
    │         │
    │         └──▶ #46 Profile: registered events  (future)
    │
    ├──▶ #56 Organiser closes         (IN PROGRESS) — needs status UI; adds "ended" lazy status
    │
    └──▶ #59 Organiser edits          (READY)   — writable PATCH for max_participants & end_date
```

Tasks #44, #56, and #59 each depend only on #43 and are otherwise independent of each other. They can be implemented in parallel, with the caveat that task #56 introduces the `ended` status value which task #44's frontend should use.

---

## Files Changed Across This Epic

### Backend
| File | Tasks |
|------|-------|
| `organization/models/event_registration.py` | #43, #56 |
| `organization/models/__init__.py` | #43 |
| `organization/serializers/event_registration.py` | #43, #56, #59 |
| `organization/serializers/project.py` | #43 |
| `organization/views/project_views.py` | #43, #59 |
| `organization/views/event_registration_views.py` *(new in #44 / #56)* | #44, #56 |
| `organization/permissions.py` | #44, #56 |
| `organization/urls.py` | #44, #56 |
| `organization/tests/test_event_registration.py` | #43, #44, #56, #59 |
| `organization/migrations/0119_add_event_registration.py` | #43 |
| `organization/migrations/0120_allow_nullable_event_registration_fields.py` | #43 |
| `organization/migrations/0121_add_eventregistration_status.py` | #43 |
| `organization/migrations/0122_add_event_participant.py` *(new in #44)* | #44 |
| `climateconnect_api/tasks.py` | #44 |
| `feature_toggles/migrations/0002_add_event_registration_toggle.py` | #43 |

### Frontend
| File | Tasks |
|------|-------|
| `src/components/shareProject/EventRegistrationSection.tsx` | #43 |
| `src/components/shareProject/EventRegistrationStep.tsx` | #43 |
| `src/components/shareProject/ShareProjectRoot.tsx` | #43 |
| `src/components/editProject/EditProjectRoot.tsx` | #59 |
| `src/components/project/Buttons/ProjectInteractionButtons.tsx` | #44 |
| `src/components/project/ProjectPageRoot.tsx` | #44, #56 |
| `src/components/project/RegistrationModal.tsx` *(new in #44)* | #44 |
| `src/components/project/RegistrationStatusBadge.tsx` *(new in #44)* | #44 |
| `pages/projects/[projectId]/register.tsx` *(new in #44)* | #44 |
| `pages/signup.tsx` | #44 (add `redirect` param support) |
| `public/texts/project_texts.tsx` | #43, #44, #56 |


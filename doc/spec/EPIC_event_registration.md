# EPIC: Event Registration

**Type**: Epic  
**Status**: IN PROGRESS  
**Started**: 2026-03-05  
**GitHub Issues**: [#1820](https://github.com/climateconnect/climateconnect/issues/1820), [#1845](https://github.com/climateconnect/climateconnect/issues/1845), [#1848](https://github.com/climateconnect/climateconnect/issues/1848)  
**Owner**: CC

---

## Overview

This epic delivers end-to-end online registration for Climate Connect events. It is part of the larger **[Event management functionality](https://github.com/climateconnect/product-backlog/issues/4)** initiative, which adds signup, notifications, and customisable event-specific information collection to the existing event feature.

The implementation is incremental across multiple phases. **Phase 1 is complete. Phase 2 is the MVP — the goal is to ship Phase 2 to production and then continue with Phase 3.**

### Rollout Strategy: Toggle-First

The `EVENT_REGISTRATION` feature toggle was implemented **before any feature work began** (migration `0002_add_event_registration_toggle.py`). This is the deliberate strategy for this epic:

1. **All tasks** are developed and shipped behind the toggle — production users see nothing until Phase 2 is complete.
2. The toggle allows the team to test incrementally on staging and in development without exposing incomplete flows to production users.
3. When **Phase 2 is complete**, the toggle is flipped to `production_is_active = True`. From that point, Phase 3 work continues — still behind the same toggle if needed.
4. **Every new UI component** in this epic must check `isEnabled("EVENT_REGISTRATION")` before rendering — consistent with `ShareProjectRoot.tsx`. Backend API changes are always additive and do not need to be toggled.

> ⚙️ **Toggle flip procedure**: update `production_is_active = True` on the `EVENT_REGISTRATION` `FeatureToggle` record (via the Django admin panel or a data migration). Coordinate frontend and backend deployments so both are live before flipping.

---

## Phases

### ✅ Phase 1 — Preparation (Complete)

Foundational work done before feature development began. No tasks in this epic's spec folder.

| Task | Status |
|------|--------|
| Feature toggle infrastructure | ✅ |
| Remove skills from projects ([#1783](https://github.com/climateconnect/climateconnect/issues/1783)) | ✅ |
| Other preparatory tasks ([#1842](https://github.com/climateconnect/climateconnect/issues/1842)) | ✅ |

### 🎯 Phase 2 — Simple Registration (MVP · current phase)

The complete Phase 2 must be shipped before the toggle is flipped in production. This is the full set of stories agreed for go-live. Stories marked ⚪ do not yet have a spec or implementation issue.

| Story | GitHub Issue | Spec | Status |
|-------|-------------|------|--------|
| Organiser creates event with registration | [#1820](https://github.com/climateconnect/climateconnect/issues/1820) | [`20260305_...`](./20260305_1000_create_event_with_basic_registration.md) | ✅ Done |
| Member registers for event | [#1845](https://github.com/climateconnect/climateconnect/issues/1845) | [`20260309_0900_...`](./20260309_0900_member_register_for_event.md) | 🔵 Ready |
| Member sees their registered events | — | — | ⚪ Not started |
| Member cancels a registration | — | — | ⚪ Not started |
| Member receives event reminder notifications | — | — | ⚪ Not started |
| Organiser sees status of registrations (list of guests) | — | — | ⚪ Not started |
| Organiser edits registration settings | [#1848](https://github.com/climateconnect/climateconnect/issues/1848) | [`20260325_0900_...`](./20260325_0900_organizer_edit_event_registration.md) | 🔵 Ready |
| Organiser exports / prints registered guests | — | — | ⚪ Not started |
| Organiser sends email to all registered guests | — | — | ⚪ Not started |
| Organiser closes / reopens registration | — | [`20260324_0900_...`](./20260324_0900_organizer_close_event_registration.md) | 🟡 In progress |
| Organiser cancels an individual guest registration | — | — | ⚪ Not started |

### 🔭 Phase 3 — Advanced Registration (next goal after Phase 2 ships)

| Story | Status |
|-------|--------|
| Guest user registers and becomes a platform member | ⚪ |
| Organiser creates event with custom registration fields | ⚪ |
| Member registers with advanced options (custom fields) | ⚪ |
| Organiser sees detailed registration status | ⚪ |
| Organiser performs advanced management tasks | ⚪ |

### 🔮 Phase 4 — Templates & Check-in (future)

Event check-in and reusable event templates. Not yet broken down into stories.

### 🔮 Phase 5 — Nice to Have (future)

Post-event feedback. Not yet broken down into stories.

---


## Shared Architecture

### Entity: `EventRegistration`

Introduced in [#1820](https://github.com/climateconnect/climateconnect/issues/1820). Present throughout the epic.

| Field | Type | Notes |
|-------|------|-------|
| `project` | OneToOneFK → `Project` | Presence of this record is the sole signal that registration is enabled — no boolean flag on `Project`. |
| `max_participants` | PositiveInteger, nullable | Required on publish; nullable while draft. Must be > 0. |
| `registration_end_date` | DateTimeField (TIMESTAMPTZ), nullable | Required on publish; nullable while draft. Must be ≤ `project.end_date`. |
| `status` | CharField (`open`/`closed`/`full`) | Added in [#1820](https://github.com/climateconnect/climateconnect/issues/1820) (migration `0121`). `open` default. `full` is system-managed only. close-reg adds `ended` as a Python-side computed value (never stored). |
| `created_at` | DateTimeField | Auto. |
| `updated_at` | DateTimeField | Auto. |

**"Is registration open?" check** (O(1), no COUNT query):
```
effective_status == "open"
```
Where `effective_status` is computed lazily by `EventRegistrationSerializer`:
- If `stored_status == "open"` AND `registration_end_date <= now()` → return `"ended"` *(close-reg)*
- Otherwise → return `stored_status`

### Entity: `EventParticipant` *([#1845](https://github.com/climateconnect/climateconnect/issues/1845) — not yet implemented)*

| Field | Type | Notes |
|-------|------|-------|
| `user` | FK → `User` | `related_name="event_participations"` |
| `event_registration` | FK → `EventRegistration` | `related_name="participants"` |
| `registered_at` | DateTimeField | Auto. |
| UNIQUE | `(user, event_registration)` | Prevents duplicate registrations. |

### `RegistrationStatus` Enum — Evolution

| Value | Stored in DB | Settable via API | Set by | Since |
|-------|-------------|-----------------|--------|-------|
| `open` | ✅ | ✅ (organiser) | Default / organiser reopen | [#1820](https://github.com/climateconnect/climateconnect/issues/1820) |
| `closed` | ✅ | ✅ (organiser) | Organiser manual close | [#1820](https://github.com/climateconnect/climateconnect/issues/1820) (UI in close-reg) |
| `full` | ✅ | ❌ (system only) | System, when last seat taken | [#1820](https://github.com/climateconnect/climateconnect/issues/1820) (logic in [#1845](https://github.com/climateconnect/climateconnect/issues/1845)) |
| `ended` | ❌ (never stored) | ❌ | Serializer, lazily computed | close-reg |

### API Endpoints — Full Surface

| Endpoint | Method | Introduced | Notes |
|----------|--------|-----------|-------|
| `POST /api/projects/` | POST | [#1820](https://github.com/climateconnect/climateconnect/issues/1820) | Accepts `event_registration` nested object on create |
| `GET /api/projects/{slug}/` | GET | [#1820](https://github.com/climateconnect/climateconnect/issues/1820) | Returns `event_registration` object (including `status`) |
| `GET /api/projects/` | GET | [#1820](https://github.com/climateconnect/climateconnect/issues/1820) | Returns `event_registration` per list item |
| `PATCH /api/projects/{slug}/` | PATCH | [#1848](https://github.com/climateconnect/climateconnect/issues/1848) | `event_registration` object becomes writable for existing records |
| `POST /api/projects/{slug}/register/` | POST | [#1845](https://github.com/climateconnect/climateconnect/issues/1845) | Member registers for an event |
| `POST /api/projects/{slug}/registration/close/` | POST | close-reg | Organiser closes registration |
| `POST /api/projects/{slug}/registration/reopen/` | POST | close-reg | Organiser reopens registration |

> ⚠️ **URL prefix note**: All endpoints use `/api/projects/` — there is no `/api/events/` prefix in this codebase. The organisation app is mounted at `api/` and all project/event URLs follow the `/api/projects/{slug}/` pattern. The close-reg spec contains `/api/events/{slug}/...` which must be corrected to `/api/projects/{slug}/...` before implementation.

### `event_registration` API Response Shape

```json
{
  "max_participants": 100,
  "registration_end_date": "2026-06-01T23:59:00Z",
  "status": "open" | "closed" | "full" | "ended"
}
```

- `available_seats` will be added to the **detail response only** once `EventParticipant` is implemented ([#1845](https://github.com/climateconnect/climateconnect/issues/1845)). Not in list responses (requires a COUNT query per row).

---

## Cross-Cutting Concerns

### Feature Toggle

The `EVENT_REGISTRATION` toggle was created **first**, before any feature work, as the cornerstone of this epic's incremental rollout strategy. Record created by migration `feature_toggles/migrations/0002_add_event_registration_toggle.py`.

| Environment | Current State | Notes |
|-------------|--------------|-------|
| Development | ✅ Enabled | Always on — full feature visible to developers |
| Staging | ✅ Enabled | Full feature visible for QA and stakeholder review |
| Production | ❌ Disabled | Flipped to `True` when Phase 2 is complete |

**Rules for every agent working on this epic:**
- All new frontend UI components **must** check `isEnabled("EVENT_REGISTRATION")` before rendering. The check pattern from `ShareProjectRoot.tsx` is the reference: `const isEventRegistrationEnabled = isEnabled("EVENT_REGISTRATION")`.
- Backend API changes are **always additive** and do not need to be gated by the toggle — the new fields and endpoints are harmless to existing consumers even when the UI is hidden.
- Do **not** remove or bypass the toggle check, even if the toggle is enabled in your local environment. The check must stay in place until the team explicitly decides to retire it post-launch.

**Toggle flip when Phase 2 is complete**: when all Phase 2 stories are done and validated on staging, update the `FeatureToggle` record: `production_is_active = True`. This can be done via the Django admin panel or a targeted data migration. Coordinate the backend deployment and frontend deployment so both are live before flipping.

### Draft Mode
Consistent across all tasks: when `is_draft=true`, all required-field validation and cross-field constraint validation (e.g. `registration_end_date ≤ project.end_date`, past-date guard) are **skipped**. Full validation is enforced on publish (`is_draft=false`). Established in [#1820](https://github.com/climateconnect/climateconnect/issues/1820).

### Authentication & Permissions
| Action | Required Role |
|--------|--------------|
| View `event_registration` | None (public) |
| Create event with registration | Authenticated |
| Register for event | Authenticated (member) |
| Edit registration settings | Project organiser or team admin |
| Close / reopen registration | Project organiser or team admin |

### Post-Auth Redirect ([#1845](https://github.com/climateconnect/climateconnect/issues/1845))
- Sign-in page: `/signin` (not `/login`)
- Query parameter: `redirect` (not `next`) — confirmed in `pages/signin.tsx` (`params.redirect`)
- Sign-up page: `/signup` needs `redirect` param support **added as part of [#1845](https://github.com/climateconnect/climateconnect/issues/1845)**
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
#1820 Create event with registration   (COMPLETED)
    │
    ├──▶ #1845 Member registers        (READY)   — needs EventParticipant, /register endpoint
    │         │
    │         └──▶ Member profile: registered events  (future)
    │
    ├──▶ close-reg Organiser closes    (IN PROGRESS) — needs status UI; adds "ended" lazy status
    │
    └──▶ #1848 Organiser edits         (READY)   — writable PATCH for max_participants & end_date
```

[#1845](https://github.com/climateconnect/climateconnect/issues/1845), close-reg, and [#1848](https://github.com/climateconnect/climateconnect/issues/1848) each depend only on [#1820](https://github.com/climateconnect/climateconnect/issues/1820) and are otherwise independent of each other. They can be implemented in parallel, with the caveat that close-reg introduces the `ended` status value which [#1845](https://github.com/climateconnect/climateconnect/issues/1845)'s frontend should use.

---

## Files Changed Across This Epic

### Backend
| File | Tasks |
|------|-------|
| `organization/models/event_registration.py` | [#1820](https://github.com/climateconnect/climateconnect/issues/1820), close-reg |
| `organization/models/__init__.py` | [#1820](https://github.com/climateconnect/climateconnect/issues/1820) |
| `organization/serializers/event_registration.py` | [#1820](https://github.com/climateconnect/climateconnect/issues/1820), close-reg, [#1848](https://github.com/climateconnect/climateconnect/issues/1848) |
| `organization/serializers/project.py` | [#1820](https://github.com/climateconnect/climateconnect/issues/1820) |
| `organization/views/project_views.py` | [#1820](https://github.com/climateconnect/climateconnect/issues/1820), [#1848](https://github.com/climateconnect/climateconnect/issues/1848) |
| `organization/views/event_registration_views.py` *(new in #1845 / close-reg)* | [#1845](https://github.com/climateconnect/climateconnect/issues/1845), close-reg |
| `organization/permissions.py` | [#1845](https://github.com/climateconnect/climateconnect/issues/1845), close-reg |
| `organization/urls.py` | [#1845](https://github.com/climateconnect/climateconnect/issues/1845), close-reg |
| `organization/tests/test_event_registration.py` | [#1820](https://github.com/climateconnect/climateconnect/issues/1820), [#1845](https://github.com/climateconnect/climateconnect/issues/1845), close-reg, [#1848](https://github.com/climateconnect/climateconnect/issues

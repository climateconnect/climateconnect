# Rename EventRegistration / EventParticipant Models for Clarity

**Status**: READY FOR IMPLEMENTATION
**Type**: Refactor
**Date and time created**: 2026-04-02 15:00
**Date Completed**: TBD
**GitHub Issue**: —
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`EPIC_event_registration.md`](./EPIC_event_registration.md) — API surface overview must be updated after this task
- All existing specs in the epic reference the old names; see **Spec update checklist** below

---

## Problem Statement

The current naming creates ambiguity because "registration" is overloaded:

| Symbol | What it actually is |
|--------|---------------------|
| `EventRegistration` model | Configuration/settings for registration on an event (max participants, deadline, status) |
| `EventParticipant` model | A user who has signed up — a registration record |
| `/api/projects/{slug}/registration/` | Settings endpoint |
| `/api/projects/{slug}/registrations/` | Participant list endpoint |
| Frontend "Registrations" tab | Shows `EventParticipant` rows |

The two models share a root word but represent completely different concepts. The API has a singular/plural collision (`/registration/` vs `/registrations/`) where both nouns refer to different resources. The frontend already calls participant rows "registrations", which conflicts with the backend model name `EventParticipant`.

**Decision**: align backend names and API URLs with how the domain and frontend actually talk about these things.

---

## Naming Changes

### Models

| Old name | New name | Concept |
|----------|----------|---------|
| `EventRegistration` | `EventRegistrationConfig` | Settings object (max participants, deadline, status). One per event. |
| `EventParticipant` | `EventRegistration` | A user's sign-up record. Many per event. |
| `RegistrationStatus` | unchanged | No change needed. |

### DB Tables (Django migration)

| Old table | New table |
|-----------|-----------|
| `organization_eventregistration` | `organization_eventregistrationconfig` |
| `organization_eventparticipant` | `organization_eventregistration` |

### Model Fields / Related Names

| Location | Old | New |
|----------|-----|-----|
| `EventRegistrationConfig.project` (OneToOneField) | `related_name="event_registration"` | `related_name="registration_config"` |
| `EventRegistration.registration_config` (FK, was `EventParticipant.event_registration`) | field name `event_registration`, `related_name="participants"` | field name `registration_config`, `related_name="registrations"` |
| `EventRegistration.user` (FK) | `related_name="event_participations"` | `related_name="event_registrations"` |

### Serializers

| Old name | New name |
|----------|----------|
| `EventRegistrationBaseSerializer` | `EventRegistrationConfigBaseSerializer` |
| `EventRegistrationSerializer` | `EventRegistrationConfigSerializer` |
| `EditEventRegistrationSerializer` | `EditEventRegistrationConfigSerializer` |
| `EventParticipantSerializer` | `EventRegistrationSerializer` |

### Views

| Old name | New name |
|----------|----------|
| `EditEventRegistrationSettingsView` | `EditRegistrationConfigView` |
| `ListEventParticipantsView` | `ListEventRegistrationsView` |
| `RegisterForEventView` | unchanged |

### API Endpoints

| Old URL | New URL | Method(s) | Notes |
|---------|---------|-----------|-------|
| `/api/projects/{slug}/registration/` | `/api/projects/{slug}/registration-config/` | PATCH | Settings edit (includes status changes for close/reopen) |
| `/api/projects/{slug}/register/` | `/api/projects/{slug}/registrations/` | POST | Member registers (create a registration) |
| `/api/projects/{slug}/register/` | `/api/projects/{slug}/registrations/` | DELETE | Member cancels registration |
| `/api/projects/{slug}/registrations/` | unchanged | GET | Organiser lists registrations |
| `/api/projects/{slug}/registrations/email/` | unchanged | POST | Organiser sends email to guests |

> **Note on POST + DELETE sharing `/registrations/`**: collapsing `POST /register/` and `DELETE /register/` into `POST /registrations/` and `DELETE /registrations/` is cleaner REST. The user is identified from the auth token, so no ID segment is needed on DELETE.

### API JSON Response Key

The nested object embedded in project detail and list responses changes key:

```diff
- "event_registration": { "max_participants": 100, "registration_end_date": "...", "status": "open" }
+ "registration_config": { "max_participants": 100, "registration_end_date": "...", "status": "open" }
```

The entire feature is behind the `EVENT_REGISTRATION` toggle and not yet live in production, so all URL and response key changes are safe to make without coordination.

---

## System Impact

- **Actors involved**: no change to actors or flows — this is a pure rename/refactor.
- **Flows affected**: no functional change. All existing flow specs reference the old names; see spec update checklist below.
- **Entity changes**: model + table renames (see above). No column additions or removals.
- **API breaking changes**: N/A — the entire feature is behind the `EVENT_REGISTRATION` toggle and not live in production. All URL and response key changes can be made freely.
- **Frontend impact**: YES — see Frontend section below.

---

## Software Architecture

### Backend

#### Migration strategy

A single migration with the following operations **in order**:

1. `migrations.RenameModel('EventRegistration', 'EventRegistrationConfig')` — renames class and DB table.
2. `migrations.RenameField('EventParticipant', 'event_registration', 'registration_config')` — renames the FK column (`event_registration_id` → `registration_config_id`) before the model itself is renamed.
3. `migrations.RenameModel('EventParticipant', 'EventRegistration')` — renames class and DB table.
4. `migrations.AlterField(...)` for `related_name` changes on the OneToOneField and FK fields (Django requires these to be explicit migration operations when they change).

> ⚠️ The FK index names on `organization_eventregistration` (was `organization_eventparticipant`) that reference the old column name (`idx_ep_event_registration`) should be renamed too — either in this migration or accepted as a cosmetic mismatch. Renaming DB indexes requires `migrations.RunSQL`. Decide at implementation time whether to include this. -> accept mismatch!

#### Files changed (backend)

| File | Change |
|------|--------|
| `organization/models/event_registration.py` | Rename both model classes, update field name, related_names, `verbose_name`, `Meta.verbose_name_plural` |
| `organization/models/__init__.py` | Update exports |
| `organization/serializers/event_registration.py` | Rename all four serializer classes; update `model =` references and field accesses |
| `organization/views/event_registration_views.py` | Rename two view classes; update all model imports and `.event_registration` field access → `.registration_config`; update queryset filter keyword `event_registration=` → `registration_config=` |
| `organization/views/project_views.py` | Update `event_registration` accessor → `registration_config`; update `EventRegistration` → `EventRegistrationConfig` imports; update `EventParticipant` → `EventRegistration` imports where `is_registered` check is added |
| `organization/serializers/project.py` | Rename serializer field `event_registration` → `registration_config` in `ProjectSerializer` and `ProjectStubSerializer`; update `get_event_registration` method name → `get_registration_config`; update model reference |
| `organization/urls.py` | Rename URL patterns: `/registration/` → `/registration-config/`, `/register/` → `/registrations/` (POST + DELETE); update view class names |
| `organization/tasks.py` | Update any `EventParticipant` / `EventRegistration` imports |
| `organization/tests/test_event_registration.py` | Update all model, serializer, view, and URL name references |
| `organization/migrations/XXXX_rename_event_registration_models.py` | New migration (see above) |

#### Queryset filter keyword argument

Everywhere the code filters by the FK field, the keyword argument changes:

```python
# Old
EventParticipant.objects.filter(event_registration=er)

# New
EventRegistration.objects.filter(registration_config=er)
```

#### `project.event_registration` accessor

Every place that accesses the settings object via the reverse OneToOneField relation:

```python
# Old
project.event_registration          # Python accessor (related_name)
hasattr(project, "event_registration")

# New
project.registration_config
hasattr(project, "registration_config")
```

---

### Frontend

#### JSON key change

All places that read `project.event_registration` or `data.event_registration` must change to `.registration_config`.

#### API endpoint changes

| Old URL string | New URL string |
|----------------|----------------|
| `/api/projects/${slug}/registration/` | `/api/projects/${slug}/registration-config/` |
| `/api/projects/${slug}/register/` | `/api/projects/${slug}/registrations/` |

#### Files to update

| File | Change |
|------|--------|
| `src/types.ts` | Rename `event_registration` field to `registration_config` in project type |
| `src/utils/eventRegistrationHelpers.ts` | Update property access from `.event_registration` to `.registration_config` |
| `src/components/shareProject/EventRegistrationSection.tsx` | Update property access |
| `src/components/shareProject/ShareProjectRoot.tsx` | Update property access |
| `src/components/shareProject/EventRegistrationStep.tsx` | Update property access |
| `src/components/shareProject/EnterDetails.tsx` | Update property access |
| `src/components/project/Buttons/ProjectContentSideButtons.tsx` | Update property access |
| `src/components/project/Buttons/ProjectInteractionButtons.tsx` | Update property access |
| `src/components/project/ProjectOverview.tsx` | Update property access |
| `src/components/project/ProjectMetaData.tsx` | Update property access |
| `src/components/project/ProjectContent.tsx` | Update property access |
| `src/components/project/EventRegistrationModal.tsx` | Update API endpoint call `/register/` → `/registrations/`; update property access |
| `src/components/project/EditEventRegistrationModal.tsx` | Update API endpoint call `/registration/` → `/registration-config/`; update property access |
| `src/components/project/EditEventRegistrationModal.test.tsx` | Update mock URL and property access |
| `src/components/project/ProjectRegistrationsContent.tsx` | Update property access |
| `src/components/project/SendEmailToGuestsModal.tsx` | Update property access |
| `src/components/project/ProjectPageRoot.tsx` | Update property access |
| `pages/projects/[projectId]/index.tsx` | Update API call and property access |

> **Component file names** (e.g. `EditEventRegistrationModal.tsx`, `EventRegistrationModal.tsx`): keep the existing file and component names — renaming component files is cosmetic scope creep, out of scope for this task.

---

### Data

- Two DB table renames (see migration strategy above).
- No data migrations — zero data is moved or transformed.
- FK constraints and unique constraints are preserved; only names change.
- The DB index names `idx_ep_event_registration` and `idx_ep_user` on the old `EventParticipant` table become orphaned cosmetically (they still function correctly). Decision on renaming is left to the implementer.

---

## Spec Update Checklist

After implementation, the following spec files reference the old names and must be updated:

- [ ] `EPIC_event_registration.md` — entity table, API surface table, design decisions table, files changed table
- [ ] `20260305_1000_create_event_with_basic_registration.md` — all `EventRegistration` references
- [ ] `20260309_0900_member_register_for_event.md` — `EventParticipant`, `EventRegistration`, `/register/`, `event_registration` JSON key
- [ ] `20260309_1100_member_see_registered_events.md` — `EventParticipant` references
- [ ] `20260309_1500_member_cancel_event_registration.md` — `EventParticipant`, `/register/` DELETE
- [ ] `20260324_0900_organizer_close_event_registration.md` — `EventRegistration`, `/registration/` URL
- [ ] `20260325_0900_organizer_edit_event_registration.md` — `EventRegistration`, `/registration/` URL
- [ ] `20260401_1000_organizer_see_registration_status.md` — `EventParticipant`, `ListEventParticipantsView`
- [ ] `20260401_1100_organizer_send_email_to_guests.md` — `EventParticipant`, endpoint references
- [ ] `doc/mosy/entities/system-entities.md` — entity names in ER diagram
- [ ] `doc/mosy/flows/core-flows.md` — entity names in flow tables
- [ ] `doc/mosy/architecture_overview.md` — model names

Spec updates can be done as a single follow-up commit after the code is merged.

---

## Acceptance Criteria

- [ ] `EventRegistrationConfig` model exists; `EventRegistration` no longer refers to the settings model anywhere in backend code.
- [ ] `EventRegistration` model (new) exists as the participant/signup record; `EventParticipant` no longer exists anywhere in backend code.
- [ ] DB tables renamed: `organization_eventregistrationconfig` and `organization_eventregistration`.
- [ ] Migration applies cleanly on a fresh database and on a database with existing data (no data loss).
- [ ] `PATCH /api/projects/{slug}/registration-config/` works; old `/registration/` returns 404.
- [ ] `POST /api/projects/{slug}/registrations/` registers the user; old `POST /register/` returns 404.
- [ ] `GET /api/projects/{slug}/registrations/` returns participant list (unchanged).
- [ ] Project detail and list API responses contain `"registration_config"` key; `"event_registration"` key no longer appears.
- [ ] All frontend components read from `registration_config` property; no `event_registration` property access remains.
- [ ] All existing tests pass with no test modifications beyond name updates.
- [ ] `yarn lint` passes.
- [ ] `make format` passes.

---

## Log

- 2026-04-02 15:00 — Task created after brainstorm. Decision: `EventRegistration` (settings) → `EventRegistrationConfig`; `EventParticipant` (sign-up record) → `EventRegistration`. Rationale: aligns backend model names with frontend language ("registrations" = sign-up records) and removes the singular/plural API collision. Option "signup" (Option C) was rejected to avoid confusion with the platform's user signup flow.


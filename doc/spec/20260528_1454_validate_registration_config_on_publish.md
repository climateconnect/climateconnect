# Validate Registration Config on Project Publish

**Status**: DRAFT
**Type**: Feature
**Date and time created**: 2026-05-28 14:54
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260513_1310_edit_project_form_button_reorganization.md`](./20260513_1310_edit_project_form_button_reorganization.md) ← added the "Edit registration settings" button to the edit project form
- [`20260416_1000_event_registration_custom_fields.md`](./20260416_1000_event_registration_custom_fields.md) ← foundational custom fields spec; defines publish-time validation rules for fields

---

## Problem Statement

When an organiser creates a draft event with online registration, both the project details and the registration configuration are allowed to be incomplete — the create validator explicitly relaxes requirements for drafts. However, when the organiser later edits the project and attempts to publish it (draft → published transition), there is **no validation of the registration configuration's completeness or correctness**. This means a published event can have an incomplete or invalid registration configuration (e.g. missing `max_participants`, missing or past `registration_end_date`, `registration_end_date` after the event's `end_date`, or custom fields without required settings).

The root cause is twofold:

1. **Backend**: `ProjectAPIView.patch()` unconditionally sets `is_draft = False` when the `is_draft` key is present in the request, but does not validate the existing `EventRegistrationConfig` against publish-time rules. The `CreateProjectView` does this validation (lines 541–563), but the edit/publish path does not.
2. **Frontend**: `checkIfProjectValid(false)` in `EditProjectRoot.tsx` validates project-level fields (image, location, dates) but does not check registration configuration completeness. The `EditEventRegistrationModal` has its own validation, but it is disconnected from the publish flow — the user can publish without ever opening the modal.

### The State Dependency Challenge

The edit project form and the registration configuration editor are **two separate forms with separate APIs**. When the user edits project details (e.g. changes `end_date`) in the edit project form — **unsaved** — and then opens the `EditEventRegistrationModal`, the modal validates `registration_end_date ≤ end_date` against the unsaved value. But when the modal saves via its own API (`PATCH /registration-config/`), the backend uses the **old** `end_date`. This can fail or create an invalid state.

### Solution: Independent Draft Lifecycles

The registration configuration is treated as a **separate entity** with its own `is_draft` flag, independent of the project's `is_draft`. This eliminates the state dependency by allowing the two entities to have independent lifecycles:

- A project can be published while its registration config is still draft.
- The registration config is completed and published separately.
- Date collision validation (`registration_end_date ≤ end_date`) runs at project publish time for any published registration config, and at config publish time against the current project state.

This approach also naturally supports the upcoming feature to **add registration configuration to an already-published event** — the same draft → publish lifecycle applies.

---

## Core Requirements

1. `EventRegistrationConfig` gains an `is_draft` field. When a draft project is created with registration, the config is also draft. When a published project is created, the config is published (as today).
2. Publishing a project with a **draft** registration config is allowed — the event goes live but registration is not yet visible to visitors. Only a date collision check (`registration_end_date > end_date`) is enforced.
3. Publishing a project with a **published** registration config triggers full publish-time validation (same rules as today).
4. The registration config editor (modal) shows the draft state and offers two actions: "Save as draft" (relaxed validation) and "Publish registration" (full validation).
5. The project detail page does **not** show registration UI (register button, guest count, etc.) when the config is draft — only admins see a setup prompt.
6. The edit project form shows a **soft warning** (not a blocker) when the config is draft at publish time.
7. The registrations tab shows a setup prompt for admins when the config is draft.

**Explicitly Out of Scope:**

- Changing the create project flow (`ShareProjectRoot`) — it already validates registration config on publish. Only the `is_draft` assignment changes.
- Adding the ability to create a registration config from the edit form for events that don't have one yet (future task, but this spec's architecture supports it).
- Changing the `PATCH /registration-config/` endpoint's existing behavior for published configs.

### Non-Functional Requirements

- **No breaking changes** to existing API contracts. The `PATCH /registration-config/` endpoint continues to work for published configs. The `is_draft` field is additive.
- **Toggle gate**: all new frontend UI must be gated behind `isEnabled("EVENT_REGISTRATION")`. No new toggle required.
- **Migration**: a minor migration adds `is_draft` to `EventRegistrationConfig` with `default=False`. Existing published configs remain `is_draft=False`. Existing draft project configs are set to `is_draft=True` via a data migration.
- **Consistent validation rules**: the same `EventRegistrationConfigSerializer` validation logic is reused — it already reads `is_draft` from context. The only change is the source of the flag.

### AI Agent Insights and Additions

- **Current `is_draft` source**: `EventRegistrationConfigSerializer.validate()` reads `is_draft` from `self.context["is_draft"]`. Currently, the context is populated from the project's `is_draft` in both `CreateProjectView` (line 556) and `EditRegistrationConfigView` (line 570). The change is to use the config's own `is_draft` field instead.

- **`shouldShowRegisterButton()`** in `frontend/src/utils/eventRegistrationHelpers.ts` (line 9–18) already checks `!project.is_draft`. It must also check `!project.registration_config.is_draft` (or the config's effective draft state).

- **`getRegistrationUIState()`** in `frontend/src/utils/eventRegistrationHelpers.ts` (line 80–106) returns `"hidden"` when `project.is_draft` is true (line 90). It must also return `"hidden"` when `registration_config.is_draft` is true — unless the viewer is an admin (admins should see a setup prompt instead).

- **`EditEventRegistrationModal`** in `frontend/src/components/project/EditEventRegistrationModal.tsx` (line 96) currently has a single "Save" button (line 540–549). It needs two buttons when the config is draft: "Save as draft" (relaxed validation) and "Publish registration" (full validation). The `isDraft` prop (line 166) is currently derived from `project.is_draft`. It should be derived from the config's own `is_draft` state, OR a new `isConfigDraft` prop should be added.

- **`EditRegistrationConfigView.patch()`** in `backend/organization/views/event_registration_views.py` (line 534) currently derives `is_draft` from `project.is_draft` (line 570). It must: (a) read `is_draft` from the config's own field, (b) accept `is_draft` in the request body to allow the draft → published transition, (c) run full validation when transitioning to published.

- **`ProjectAPIView.patch()`** in `backend/organization/views/project_views.py` (line 961–963): when setting `is_draft = False`, check if the project has a registration config that is **not** draft. If so, validate the config's `registration_end_date` against the project's `end_date` (incoming or existing). If the config is draft, skip this check — the config will be validated when it is published.

- **Create flow**: `CreateProjectView.post()` creates the registration config via `er_serializer.save(project=project)` (line 599). When the project is draft (`is_draft=True`), set `registration_config.is_draft = True` on the created config. When the project is published, `is_draft=False` (as today).

- **Registrations tab**: `ProjectRegistrationsContent.tsx` (line 47) renders the guest list and management UI. When the config is draft, it should show a setup prompt instead: "Registration is not yet set up. [Complete registration setup]" — clicking opens the `EditEventRegistrationModal`.

- **Draft registration config hidden from visitors**: The project detail page checks `project.registration_config` to decide whether to render registration modals and buttons (lines 819, 827, 842 in `ProjectPageRoot.tsx`). When `registration_config.is_draft` is true, these should not render for non-admin users. For admins, a setup prompt should be shown.

---

## System Impact

### Actors
- **Event organiser** (admin role): edits the project, publishes, and separately publishes the registration config.
- **Event visitor/member**: sees registration UI only when the config is published.
- **Backend API**: enforces draft/published state on registration config independently from the project.

### Entities Changed
- `EventRegistrationConfig`: gains `is_draft` BooleanField.
- No new entities.

### Flows Changed
- **Edit project → Publish**: no longer blocked by incomplete registration config. Soft warning shown if config is still draft.
- **Registration config → Publish**: new flow — full validation, sets `is_draft = False`.
- **Project detail page**: registration UI hidden when config is draft (visitors). Setup prompt shown (admins).
- **Registrations tab**: setup prompt when config is draft (admins).

### Integration Changes
- `PATCH /registration-config/` accepts `is_draft` in request body for draft → published transition.
- `PATCH /api/projects/{slug}/` validates date collision when publishing with a published registration config.
- `EventRegistrationConfigSerializer` context uses config's own `is_draft`.

---

## Software Architecture

### Data Model

Add `is_draft` to `EventRegistrationConfig`:

```python
is_draft = models.BooleanField(
    default=False,
    help_text=(
        "When True, the registration configuration is incomplete and not visible "
        "to visitors. The organiser can save partial data and publish later. "
        "May only transition from True to False (one-way)."
    ),
    verbose_name="Is Draft",
)
```

**Migration**: 
1. Schema migration: add `is_draft` with `default=False`.
2. Data migration: set `is_draft=True` for all `EventRegistrationConfig` records whose related `Project.is_draft=True`.

### API — Registration Config PATCH with is_draft

`PATCH /api/projects/{slug}/registration-config/`:

**Request to save as draft** (relaxed validation):
```json
{
  "max_participants": 50,
  "registration_end_date": "2026-06-30T18:00:00Z"
}
```
(`is_draft` is not sent — config stays draft. Validation is relaxed.)

**Request to publish registration** (full validation):
```json
{
  "max_participants": 50,
  "registration_end_date": "2026-06-30T18:00:00Z",
  "is_draft": false
}
```

**Error response** (400, when publishing with incomplete config):
```json
{
  "max_participants": "Required when publishing registration.",
  "registration_end_date": "Required when publishing registration."
}
```

**Error response** (400, date collision):
```json
{
  "registration_end_date": "Registration end date must be on or before the event end date."
}
```

### API — Project Publish with Draft Registration Config

`PATCH /api/projects/{slug}/`:

When `is_draft` transitions to False:
1. If the project has a registration config with `is_draft=True`: allow publish. Only check date collision if `registration_end_date` is set.
2. If the project has a registration config with `is_draft=False`: validate the config is still valid (e.g. `registration_end_date` not in the past, still ≤ `end_date`). If invalid, return 400.
3. If the project has no registration config: no registration validation.

**Error response** (400, published config has date collision after end_date change):
```json
{
  "registration_config": {
    "registration_end_date": "Registration end date must be on or before the event end date. Update the registration settings before publishing."
  }
}
```

### Backend — EditRegistrationConfigView Changes

In `EditRegistrationConfigView.patch()`:

```python
# Current (line 570):
is_draft = project.is_draft

# New:
is_draft = rc.is_draft  # Use config's own draft state

# Additionally: handle is_draft transition in request body
if "is_draft" in request.data and not request.data["is_draft"] and rc.is_draft:
    # Transitioning from draft to published — run full validation
    is_draft = False
    # One-way transition: draft → published, never back
```

### Backend — EventRegistrationConfigSerializer Context

The serializer already reads `is_draft` from context. The change is in what populates the context:

```python
# CreateProjectView (line 556) — change:
"is_draft": is_draft,  # project's is_draft

# To:
"is_draft": is_draft,  # project's is_draft (for create, config inherits project's draft state)
```

```python
# EditRegistrationConfigView (line 570) — change:
is_draft = project.is_draft

# To:
is_draft = rc.is_draft  # config's own is_draft, overridden by request body if transitioning
```

### Backend — ProjectAPIView.patch() Date Collision Check

```python
# After line 963 (project.is_draft = False):
if hasattr(project, 'registration_config'):
    rc = project.registration_config
    if not rc.is_draft and rc.registration_end_date:
        effective_end = (
            parse(request.data["end_date"])
            if "end_date" in request.data
            else project.end_date
        )
        if effective_end and rc.registration_end_date > effective_end:
            return Response(
                {"registration_config": {
                    "registration_end_date": "Registration end date must be on or before the event end date."
                }},
                status=status.HTTP_400_BAD_REQUEST,
            )
```

### Frontend — Registration UI State

`getRegistrationUIState()` in `eventRegistrationHelpers.ts`:

```typescript
// Add after line 90 (project.is_draft check):
if (project.registration_config?.is_draft) return "hidden";
```

`shouldShowRegisterButton()`:

```typescript
// Add to the existing check:
&& !project.registration_config?.is_draft
```

### Frontend — EditEventRegistrationModal

The modal needs to handle the config's draft state:

1. **New prop**: `isConfigDraft?: boolean` (default: derived from `project.is_draft` for backward compatibility).
2. **Draft indicator**: when `isConfigDraft` is true, show a `Chip` or `Alert` at the top: "Registration configuration is in draft mode. Complete the setup and publish to make registration visible to visitors."
3. **Two buttons when draft**:
   - "Save as draft" — calls the existing `PATCH /registration-config/` endpoint without `is_draft: false`. Validation is relaxed.
   - "Publish registration" — calls `PATCH /registration-config/` with `is_draft: false`. Full validation runs. If validation fails, errors are shown inline.
4. **Single button when published**: "Save" — same as today.
5. **`required` prop on fields**: when `isConfigDraft` is true, `max_participants` and `registration_end_date` are NOT required (relaxed). When false, they are required (as today).

### Frontend — Edit Project Form Warning

In `EditProjectRoot.tsx`, extend `checkIfProjectValid(false)`:

```typescript
// After existing checks, before return true:
if (
  project.project_type?.type_id === "event" &&
  project.registration_config?.is_draft &&
  isEnabled("EVENT_REGISTRATION")
) {
  // Soft warning — not a blocker
  setRegistrationConfigWarning(
    texts.registration_config_still_draft_warning
  );
  // Don't return false — allow publish
}
```

In `EditProjectContent.tsx`, show the warning:

- Below the "Edit registration settings" button, display a `Typography` with `color="warning"`: "Registration configuration is not yet complete. You can publish the event now and complete the registration settings later."
- The button itself is NOT highlighted with an error — it's informational.

### Frontend — Registrations Tab Setup Prompt

In `ProjectRegistrationsContent.tsx`, when `registration_config.is_draft` is true and the user is an admin:

- Instead of the guest list, show:
  - A heading: "Registration setup incomplete"
  - A description: "Complete the registration configuration to start accepting sign-ups."
  - A button: "Complete registration setup" → opens `EditEventRegistrationModal`.

### Backend — API Response Filtering for Draft Configs

Two serializers include `registration_config` in project responses:

1. **`ProjectSerializer.get_registration_config()`** (`project.py`, line 223) — detail view, includes seat count.
2. **`ProjectStubSerializer.get_registration_config()`** (`project.py`, line 515) — list/browse view, no seat count.

Both must be updated to return `None` when the config is draft and the viewer is not an admin:

```python
def get_registration_config(self, obj):
    try:
        rc = obj.registration_config
    except EventRegistrationConfig.DoesNotExist:
        return None

    # Draft configs are only visible to project admins.
    if rc.is_draft:
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None
        is_admin = ProjectMember.objects.filter(
            project=obj,
            user=request.user,
            role__role_type__in=[Role.ALL_TYPE, Role.READ_WRITE_TYPE],
        ).exists()
        if not is_admin:
            return None

    return EventRegistrationConfigSerializer(
        rc, context={"include_seat_count": True},
    ).data
```

The same pattern applies to `ProjectStubSerializer.get_registration_config()` (without `include_seat_count`).

Additionally, the `is_draft` field must be added to `EventRegistrationConfigSerializer.Meta.fields` so the frontend can read the draft state from the response.

### Frontend — Project Detail Page Admin Prompt

In `ProjectPageRoot.tsx`, when `registration_config.is_draft` is true and the user is an admin:

- Show a subtle `Alert` or `Chip` near the event header: "Registration is not yet set up. [Set up registration]"
- The "Register" button is NOT shown (already handled by `getRegistrationUIState` returning `"hidden"`).
- The admin's "Edit registration settings" button in `ProjectContentSideButtons.tsx` is always visible (already the case).

---

## Acceptance Criteria

### Model & Migration
- [ ] `EventRegistrationConfig` has an `is_draft` BooleanField with `default=False`.
- [ ] Data migration sets `is_draft=True` for configs belonging to draft projects.

### Backend — Registration Config Publish
- [ ] `PATCH /registration-config/` accepts `is_draft: false` in the request body to transition from draft to published.
- [ ] When transitioning to published, full validation runs (same rules as create with `is_draft=False`).
- [ ] When `is_draft` is not sent (or `is_draft: true`), relaxed validation runs (same as today for draft projects).
- [ ] One-way transition: setting `is_draft: true` on a published config is rejected (400).
- [ ] Date collision check: `registration_end_date ≤ project.end_date` is enforced at config publish time.

### Backend — Project Publish
- [ ] Publishing a project with a **draft** registration config succeeds. No registration validation beyond date collision.
- [ ] Publishing a project with a **published** registration config that has `registration_end_date > new end_date` is rejected (400).
- [ ] Publishing a project without registration config is unaffected.
- [ ] Non-event projects are unaffected.

### Backend — Create Flow
- [ ] Creating a draft project with registration config sets `config.is_draft = True`.
- [ ] Creating a published project with registration config sets `config.is_draft = False` (as today).

### Frontend — Registration Button Visibility
- [ ] Visitors/members do NOT see registration UI when `registration_config.is_draft` is true.
- [ ] Admins see a setup prompt on the project detail page when config is draft.
- [ ] Admins see a setup prompt on the registrations tab when config is draft.

### Frontend — Registration Config Modal
- [ ] When config is draft, the modal shows a draft indicator and two buttons: "Save as draft" and "Publish registration".
- [ ] "Save as draft" saves with relaxed validation (same as today's draft behavior).
- [ ] "Publish registration" runs full validation and sends `is_draft: false`.
- [ ] When config is published, the modal shows a single "Save" button (no change from today).
- [ ] Validation errors are shown inline when "Publish registration" fails.

### Frontend — Edit Project Form
- [ ] When publishing a draft event whose registration config is still draft, a soft warning is displayed (not a blocker).
- [ ] "Save as Draft" continues to work without requiring a published registration config.
- [ ] When publishing a draft event whose registration config is published but has a date collision with the new `end_date`, the publish is blocked with an error.

---

## Test Cases

### Backend Tests

| Scenario | Expected |
|----------|----------|
| Create draft project with registration config | `config.is_draft = True` |
| Create published project with registration config | `config.is_draft = False`, full validation runs |
| PATCH registration config, save as draft (no `is_draft` in body) | 200, config saved, `is_draft` remains True |
| PATCH registration config, publish with complete data | 200, `is_draft` set to False |
| PATCH registration config, publish with missing `max_participants` | 400, error on `max_participants` |
| PATCH registration config, publish with `registration_end_date` after `project.end_date` | 400, date collision error |
| PATCH registration config, set `is_draft: true` on published config | 400, one-way transition rejected |
| Publish project with draft registration config | 200, project published, config stays draft |
| Publish project with published registration config, date collision | 400, error on `registration_config.registration_end_date` |
| Publish project with published registration config, no collision | 200, project published |
| Publish project without registration config | 200, no registration validation |
| Data migration: draft project configs | `is_draft=True` for configs of draft projects |

### Frontend Tests

| Scenario | Expected |
|----------|----------|
| Visitor views event with draft config | No registration button visible |
| Admin views event with draft config | Setup prompt visible, registration button hidden |
| Admin opens registrations tab with draft config | Setup prompt with "Complete setup" button |
| Admin opens modal for draft config | Draft indicator, two buttons (Save as draft / Publish) |
| Admin clicks "Publish registration" with complete data | Config published, modal closes |
| Admin clicks "Publish registration" with missing data | Inline errors shown |
| Admin clicks "Save as draft" with partial data | Config saved as draft |
| Admin opens modal for published config | Single "Save" button (unchanged) |
| Admin publishes project with draft config | Soft warning, publish succeeds |
| Admin publishes project with published config, date collision | Error, publish blocked |
| Admin saves project as draft with draft config | Saves normally |

---

## Files to Change

### Backend

| File | Change |
|------|--------|
| `backend/organization/models/event_registration.py` | Add `is_draft` BooleanField to `EventRegistrationConfig` |
| `backend/organization/migrations/` | New migration: add `is_draft` field + data migration for existing draft configs |
| `backend/organization/views/event_registration_views.py` | `EditRegistrationConfigView.patch()`: use config's `is_draft`, handle `is_draft` transition in request body, full validation on publish |
| `backend/organization/views/project_views.py` | `ProjectAPIView.patch()`: date collision check when publishing with published config. `CreateProjectView.post()`: set `config.is_draft` from project's `is_draft` |
| `backend/organization/serializers/event_registration.py` | `EventRegistrationConfigSerializer`: add `is_draft` to `Meta.fields`. `validate()`: no change needed (already reads `is_draft` from context). `EditEventRegistrationConfigSerializer.validate()`: add `is_draft` transition validation |
| `backend/organization/serializers/project.py` | `ProjectSerializer.get_registration_config()` and `ProjectStubSerializer.get_registration_config()`: return `None` for draft configs when viewer is not an admin |
| `backend/organization/views/test_event_registration_views.py` | Add test cases for draft → published transition |
| `backend/organization/views/test_project_views.py` | Add test cases for project publish with draft/published config |

### Frontend

| File | Change |
|------|--------|
| `frontend/src/utils/eventRegistrationHelpers.ts` | `getRegistrationUIState()`: return `"hidden"` for draft config. `shouldShowRegisterButton()`: check `config.is_draft` |
| `frontend/src/components/project/EditEventRegistrationModal.tsx` | Add `isConfigDraft` prop. Draft indicator. Two buttons when draft. Relaxed `required` when draft |
| `frontend/src/components/project/Buttons/RegistrationActionButton.tsx` | No changes needed (driven by `RegistrationUIState`) |
| `frontend/src/components/project/ProjectPageRoot.tsx` | Admin setup prompt when config is draft |
| `frontend/src/components/project/ProjectRegistrationsContent.tsx` | Setup prompt when config is draft (instead of guest list) |
| `frontend/src/components/project/Buttons/ProjectContentSideButtons.tsx` | Pass `isConfigDraft` to modal |
| `frontend/src/components/editProject/EditProjectRoot.tsx` | Soft warning on publish when config is draft. Date collision check for published config |
| `frontend/src/components/editProject/EditProjectContent.tsx` | Display warning text below registration button when config is draft |
| `frontend/src/components/shareProject/ShareProjectRoot.tsx` | No changes needed (config `is_draft` is set backend-side) |

---

## Dependency Notes

- **Depends on**: `EditEventRegistrationModal` (already built). `EVENT_REGISTRATION` toggle (already exists). `REGISTRATION_CUSTOM_FIELDS` toggle (already exists).
- **Enables**: Future task to add registration config to an already-published event — create a draft config, then publish it. Same flow.
- **Migration**: minor — one field addition + one data migration.

---

## Log

- 2026-05-28 14:54 — Spec created. Initial draft with two approaches.
- 2026-05-28 15:29 — Approach B chosen. Registration config gets its own `is_draft` flag. Spec rewritten.
- 2026-05-28 15:48 — Open questions resolved: `is_draft` boolean (not status enum), draft configs hidden from non-admin API responses, `is_draft` added to serializer fields.

---

## Design Decisions (Resolved)

1. **`is_draft` boolean over status enum**: The `is_draft` field is a separate `BooleanField`, not a new value in the `RegistrationStatus` enum. Rationale: draft/setup state is orthogonal to the registration lifecycle (open → full → ended). Mixing them conflates two concerns with different transition rules (draft is one-way; status is bidirectional). The boolean also follows the existing `Project.is_draft` pattern.

2. **Draft configs excluded from non-admin API responses**: The project detail API omits `registration_config` from the response when `is_draft=True` and the viewer is not an admin. This prevents visitors from seeing incomplete registration data. Admins always see the config (with `is_draft` flag) so they can access the setup prompt.

3. **`is_draft` included in API responses**: The `is_draft` field is included in `EventRegistrationConfigSerializer`'s `fields` list. The frontend needs it to decide whether to show draft UI (setup prompt, draft indicator, etc.).

4. **Registration status display for draft configs**: When the config is draft, admins see "Draft" as the registration status indicator (a computed display value in the frontend, not stored). The actual `status` field stays "open" (default) but is meaningless while draft.

5. **Notification behavior for draft configs**: `notify_admins` is set on the config. When the config is draft, no registration emails should be sent (registration is not possible). This is already implicitly handled since the registration button is hidden and the `POST /registrations/` endpoint requires a non-draft config.

6. **"Add registration to existing event"**: This future feature creates a draft `EventRegistrationConfig` for a published project, then opens the modal. The admin completes the config and publishes it. No additional toggle is needed beyond `EVENT_REGISTRATION`. The UI entry point (e.g. a button on the project detail page) is out of scope for this task.

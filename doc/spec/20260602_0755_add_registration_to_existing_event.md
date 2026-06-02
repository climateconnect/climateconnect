# Allow the User to Turn Event Registration On/Off When Editing an Event

**Status**: DRAFT
**Type**: Feature
**Date and time created**: 2026-06-02 07:55
**GitHub Issue**: [#2001](https://github.com/climateconnect/climateconnect/issues/2001)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260528_1454_validate_registration_config_on_publish.md`](./20260528_1454_validate_registration_config_on_publish.md) ← introduced `is_draft` on `EventRegistrationConfig`, which is a prerequisite for this feature

---

## Problem Statement

Currently, registration configuration can only be added during event creation. If an organiser creates an event without enabling registration, there is **no way to add it later** — the `showEditRegistrationButton` in `EditProjectContent.tsx` requires `!!project.registration_config` to be true, and there is no backend endpoint to create a registration config for an existing project.

Similarly, if an organiser decides to disable registration for an event that already has a config, there is no way to do so without deleting the config entirely (which is not possible through the UI either).

**Core Requirements (from #2001):**

1. On the edit page of a project of type event, add a switch to enable or disable online event registration.
2. When the switch is turned ON, show the button to edit the registration configuration.
3. When the event has a registration configuration, show the switch as ON.
4. When the switch is changed from ON to OFF, hide all event registration features for the event, but **keep the registration configuration** in case the user turns it ON again.
5. When the user turns registration ON for an existing published event, they start with a **draft** registration configuration that can be published when ready.

**Explicitly Out of Scope:**

- Deleting a registration config through the UI (the config is preserved when disabled).
- Changing the create project flow (`ShareProjectRoot`) — it already handles registration enable/disable.
- Changing the project detail page or registrations tab behavior (they already handle draft/disabled configs).
- Changing the registration config modal — it already handles draft/published states.

### Non-Functional Requirements

- **No breaking changes**: existing API contracts are preserved. New endpoints are additive.
- **Toggle gate**: all new frontend UI is gated behind `isEnabled("EVENT_REGISTRATION")`.
- **Preservation**: disabling registration does NOT delete the config or any custom fields. Re-enabling restores the previous state.
- **One-way draft transition**: the existing `is_draft` one-way transition (draft → published) is preserved. Disabling registration is a separate concept from draft/published state.

### AI Agent Insights and Additions

- **Current gap**: `showEditRegistrationButton` in `EditProjectContent.tsx` (line 152) requires `!!project.registration_config`. If no config exists, the button is never shown. There is no "Add registration" button or flow.

- **Current gap**: `EditRegistrationConfigView` (`event_registration_views.py`, line 560) returns 404 if no config exists. There is no POST handler to create a config.

- **Design choice — `registration_enabled` field**: The issue requires hiding registration features while preserving the config. Since `is_draft` is a one-way transition (draft → published), we cannot use it to "unpublish" a config. A separate `registration_enabled` boolean on `EventRegistrationConfig` is the cleanest solution. It is orthogonal to `is_draft`:
  - `is_draft` = config completeness (setup state): incomplete → complete
  - `registration_enabled` = feature active state: on → off → on (reversible)
  - When `registration_enabled=False`: config is hidden from everyone (visitors AND admins). Registration features are disabled.
  - When `registration_enabled=True`: config is visible (subject to `is_draft` and admin permissions as before).

- **When to create the config**: The config should be created **when the user toggles the switch ON** in the edit form. This is the natural point — the user has expressed intent to enable registration. The config starts as `is_draft=True` and `registration_enabled=True`. The user can then configure it via the modal and publish when ready. This mirrors the create flow where the toggle in step 3 enables the registration section in step 4.

- **API approach — POST on the existing endpoint**: Extend `EditRegistrationConfigView` to handle POST (create) in addition to PATCH (update). When POST is called and no config exists, create a draft config with `registration_enabled=True`. When PATCH is called with `registration_enabled=False`, hide the config. This keeps the API surface minimal — one endpoint handles both create and update.

- **Frontend approach — switch in edit form**: Add a `Switch` component in `EditProjectContent.tsx` (similar to the existing status toggle) that controls `registration_enabled`. When toggled ON, POST to create a draft config. When toggled OFF, PATCH to set `registration_enabled=False`. The switch replaces the current `showEditRegistrationButton` condition — the button is shown when the switch is ON.

- **Interaction with existing draft warning**: The existing warning ("Registration configuration is not yet complete") in `EditProjectContent.tsx` is shown when `project.registration_config?.is_draft` is true. This continues to work — when the user toggles ON and creates a draft config, the warning appears automatically.

- **Interaction with project detail page**: The project detail page already handles draft configs (hidden from visitors, setup prompt for admins). When `registration_enabled=False`, the config is hidden from everyone. No changes needed to `ProjectPageRoot.tsx` or `ProjectContentSideButtons.tsx` — they already check for `registration_config` existence.

- **Serializer filtering**: `ProjectSerializer.get_registration_config()` and `ProjectStubSerializer.get_registration_config()` already filter draft configs for non-admins. They must also filter configs where `registration_enabled=False` for everyone (including admins — the config is "disabled", not just "draft").

---

## System Impact

### Actors
- **Event organiser**: toggles registration on/off for an existing event.
- **Event visitor/member**: sees registration UI only when the config exists, is enabled, and is published.
- **Backend API**: creates, enables, and disables registration configs.

### Entities Changed
- `EventRegistrationConfig`: gains `registration_enabled` BooleanField.
- No new entities.

### Flows Changed
- **Edit project → Toggle registration ON**: creates a draft config.
- **Edit project → Toggle registration OFF**: disables the config (preserved in DB).
- **Edit project → Toggle registration ON (again)**: re-enables the existing config.

### Integration Changes
- `POST /api/projects/{slug}/registration-config/`: new endpoint to create a draft config.
- `PATCH /api/projects/{slug}/registration-config/`: accepts `registration_enabled` in request body.
- Project serializers filter `registration_enabled=False` configs from all responses.

---

## Software Architecture

### Data Model

Add `registration_enabled` to `EventRegistrationConfig`:

```python
registration_enabled = models.BooleanField(
    default=True,
    help_text=(
        "When False, registration features are hidden for this event. "
        "The config is preserved and can be re-enabled later. "
        "Unlike is_draft, this field is reversible."
    ),
    verbose_name="Registration Enabled",
)
```

**Migration**:
1. Schema migration: add `registration_enabled` with `default=True`.
2. No data migration needed — existing configs are already enabled (default=True).

### Backend — Create Project Flow

`CreateProjectView.post()` must pass `registration_enabled=True` when creating a config:

```python
er_serializer.save(project=project, is_draft=is_draft, registration_enabled=True)
```

This ensures configs created via the share project flow are enabled by default.

### API — POST to Create Registration Config

`POST /api/projects/{slug}/registration-config/`:

**Request** (empty body — all defaults):
```json
{}
```

**Behavior**:
1. Verify the user is a project admin.
2. Verify the project is an event type.
3. If a config already exists and `registration_enabled=False`, re-enable it (`registration_enabled=True`) and return the existing config.
4. If a config already exists and `registration_enabled=True`, return 409 (already exists).
5. Create a new `EventRegistrationConfig` with `is_draft=True`, `registration_enabled=True`, `status="open"`.
6. Return 201 with the serialized config.

**Response** (201):
```json
{
  "max_participants": null,
  "registration_end_date": null,
  "status": "open",
  "is_draft": true,
  "registration_enabled": true,
  "notify_admins": true,
  "fields": []
}
```

### API — PATCH to Disable Registration Config

`PATCH /api/projects/{slug}/registration-config/`:

**Request** to disable:
```json
{
  "registration_enabled": false
}
```

**Behavior**:
1. Set `registration_enabled=False` on the config.
2. Return 200 with the updated config.

**Request** to re-enable:
```json
{
  "registration_enabled": true
}
```

**Behavior**:
1. Set `registration_enabled=True` on the config.
2. Return 200 with the updated config.

**Validation**: `registration_enabled` is a simple boolean toggle. No other fields are validated when toggling. The existing validation logic is skipped when only `registration_enabled` is in the request body.

### API Response Filtering

`ProjectSerializer.get_registration_config()` and `ProjectStubSerializer.get_registration_config()` must filter configs where `registration_enabled=False` for **all** viewers (including admins):

```python
def get_registration_config(self, obj):
    try:
        rc = obj.registration_config
    except EventRegistrationConfig.DoesNotExist:
        return None

    # Disabled configs are hidden from everyone.
    if not rc.registration_enabled:
        return None

    # Draft configs are only visible to project admins.
    if rc.is_draft:
        # ... existing admin check ...
        pass

    return EventRegistrationConfigSerializer(rc, ...).data
```

### Frontend — Edit Project Form Switch

In `EditProjectContent.tsx`, add a registration toggle switch:

1. **Switch component**: A `Switch` with label "Online registration" (similar to the existing create flow `EventRegistrationStep.tsx`).
2. **Initial state**: `!!project.registration_config && project.registration_config.registration_enabled !== false`.
3. **Toggle ON**:
   - If `project.registration_config` exists but `registration_enabled === false`, PATCH `{registration_enabled: true}`.
   - If `project.registration_config` does not exist, POST to create a new draft config.
   - On success, update `project.registration_config` in local state.
4. **Toggle OFF**:
   - PATCH `{registration_enabled: false}`.
   - On success, set `project.registration_config` to `null` in local state (or set `registration_enabled: false`).
5. **When switch is ON**: Show the "Edit registration settings" button and the draft warning (if applicable).
6. **When switch is OFF**: Hide the button and warning.

### Frontend — Registration Config Modal (no changes)

The `EditEventRegistrationModal` does not need changes. It already handles draft/published states and receives `eventRegistration` as a prop. When the user toggles ON and creates a draft config, the modal works as before.

### Frontend — Project Detail Page (no changes)

`ProjectPageRoot.tsx` and `ProjectContentSideButtons.tsx` already handle the case where `registration_config` is null (no registration features shown). The serializer filtering ensures disabled configs are never returned.

---

## Acceptance Criteria

### Model & Migration
- [ ] `EventRegistrationConfig` has a `registration_enabled` BooleanField with `default=True`.
- [ ] No data migration needed (existing configs default to enabled).

### Backend — Create Config

- [ ] `POST /api/projects/{slug}/registration-config/` creates a draft config for the event.
- [ ] Only project admins can create a config.
- [ ] Returns 409 if a config already exists and is enabled.
- [ ] Re-enables an existing disabled config if one exists.
- [ ] Returns 201 with the serialized config.
- [ ] `CreateProjectView.post()` sets `registration_enabled=True` when creating a config via the share project flow.

### Backend — Disable/Enable Config
- [ ] `PATCH /registration-config/` accepts `registration_enabled: false` to disable.
- [ ] `PATCH /registration-config/` accepts `registration_enabled: true` to re-enable.
- [ ] Disabling does not delete the config or custom fields.
- [ ] Re-enabling restores the config to its previous state (draft or published).

### Backend — API Response Filtering
- [ ] Disabled configs (`registration_enabled=False`) are excluded from all project API responses (detail and list).
- [ ] This applies to all viewers, including admins.

### Frontend — Edit Project Form
- [ ] A toggle switch for "Online registration" is shown on the edit form for event projects.
- [ ] When the event has an enabled registration config, the switch is ON.
- [ ] When the event has no config or a disabled config, the switch is OFF.
- [ ] Toggling ON creates/enables the config and shows the "Edit registration settings" button.
- [ ] Toggling OFF disables the config and hides the button.
- [ ] The draft warning is shown when the config is draft (existing behavior).

### Frontend — Project Detail Page
- [ ] No changes needed — disabled configs are filtered out by the serializer.

---

## Test Cases

### Backend Tests

| Scenario | Expected |
|----------|----------|
| POST to create config for event without config | 201, config created with `is_draft=True`, `registration_enabled=True` |
| POST when config already exists and enabled | 409 |
| POST when config exists but disabled | 200, config re-enabled (`registration_enabled=True`) |
| POST by non-admin | 403 |
| POST for non-event project | 400 |
| PATCH to disable enabled config | 200, `registration_enabled=False` |
| PATCH to re-enable disabled config | 200, `registration_enabled=True` |
| Disabled config excluded from project detail response | `registration_config: null` |
| Disabled config excluded from project list response | `registration_config: null` |
| Disabled config with custom fields preserved | Fields still in DB after re-enable |
| PATCH to disable published config | 200, config disabled (status preserved) |

### Frontend Tests

| Scenario | Expected |
|----------|----------|
| Edit form shows switch ON for event with enabled config | Switch checked |
| Edit form shows switch OFF for event without config | Switch unchecked |
| Toggle ON creates draft config, shows button | Config created, button visible |
| Toggle OFF disables config, hides button | Config disabled, button hidden |
| Toggle ON (re-enable) shows existing config | Previous config restored |
| Draft warning shown when config is draft | Warning visible below button |

---

## Files to Change

### Backend

| File | Change |
|------|--------|
| `backend/organization/models/event_registration.py` | Add `registration_enabled` BooleanField to `EventRegistrationConfig` |
| `backend/organization/migrations/` | New migration: add `registration_enabled` field |
| `backend/organization/views/event_registration_views.py` | Add POST handler to `EditRegistrationConfigView` (create config). Add `registration_enabled` toggle handling in PATCH. |
| `backend/organization/views/project_views.py` | `CreateProjectView.post()`: pass `registration_enabled=True` when creating config via share project flow. |
| `backend/organization/serializers/project.py` | `ProjectSerializer.get_registration_config()` and `ProjectStubSerializer.get_registration_config()`: filter `registration_enabled=False` configs |
| `backend/organization/tests/` | Add test cases for create, disable, re-enable, and API filtering |

### Frontend

| File | Change |
|------|--------|
| `frontend/src/components/editProject/EditProjectContent.tsx` | Add registration toggle switch. Handle create/enable/disable via API. Show/hide button based on switch state. |
| `frontend/src/components/editProject/EditProjectRoot.tsx` | Pass updated registration config state to EditProjectContent |
| `frontend/src/types.ts` | Add `registration_enabled` to `EventRegistrationData` |
| `frontend/public/texts/project_texts.tsx` | Add localized text for the toggle switch |

---

## Dependency Notes

- **Depends on**: `is_draft` on `EventRegistrationConfig` (already implemented). `EditEventRegistrationModal` (already built). `EVENT_REGISTRATION` toggle (already exists).
- **Enables**: Organisers can add registration to events after creation. This is the natural next step after the `is_draft` feature.
- **Migration**: minor — one field addition with `default=True`.

---

## Log

- 2026-06-02 07:55 — Spec created. Initial draft.
- 2026-06-02 08:03 — Added `registration_enabled=True` to create project flow (`CreateProjectView.post()`).

---

## Design Decisions (Resolved)

1. **`registration_enabled` boolean (not delete)**: Disabling registration does NOT delete the config. The config is preserved in the database and can be re-enabled later. This matches the issue requirement: "keep the event registration configuration in case the user turns it on again."

2. **Separate from `is_draft`**: `registration_enabled` is orthogonal to `is_draft`. `is_draft` tracks config completeness (one-way: draft → published). `registration_enabled` tracks feature active state (reversible: on → off → on). A config can be in any combination of these states.

3. **Create on toggle ON**: The config is created when the user toggles the switch ON in the edit form. This is the natural point of intent. The config starts as `is_draft=True` and `registration_enabled=True`.

4. **Re-enable on toggle ON (when disabled config exists)**: If the user toggles ON and a disabled config already exists, we re-enable it rather than creating a new one. This preserves the existing configuration.

5. **POST on existing endpoint**: The `EditRegistrationConfigView` is extended to handle POST (create) in addition to PATCH (update). This keeps the API surface minimal.

6. **Disabled configs hidden from everyone**: When `registration_enabled=False`, the config is excluded from all API responses, including admin views. The switch in the edit form is the only way to see that registration exists but is disabled.

7. **Serializer filtering**: `ProjectSerializer.get_registration_config()` and `ProjectStubSerializer.get_registration_config()` filter `registration_enabled=False` configs. This ensures disabled configs are never exposed to any frontend component.

---

## Notes and Open Questions

1. **Switch vs checkbox**: The create flow uses a `Switch` component for the registration toggle. The edit form should use the same component for consistency.

2. **Switch placement in edit form**: The switch should be placed near the "Edit registration settings" button — either above it (as a group) or in the same section. The button appears only when the switch is ON.

3. **Confirmation dialog on disable**: Should we show a confirmation dialog when the user toggles OFF? The config is preserved, so no data is lost. But the user might not realize that registration will be hidden from visitors. Recommend: no confirmation dialog for this iteration — the switch is easily reversible.

4. **Impact on active registrations**: If the user disables registration while guests are already registered, the registrations are preserved. The registrations tab will no longer be visible (since the config is filtered out), but the data is still in the database. If the user re-enables registration, the registrations become visible again. This is acceptable behavior.

5. **Status preserved on disable/re-enable**: When a config is disabled, its `status` (open/closed/full) is preserved. When re-enabled, it returns to its previous status. This is intentional — the organiser might want to re-enable with the same status.

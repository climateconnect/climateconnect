# Auto-Set Event Registration End Date on Start Date Change

**Status**: COMPLETED
**Type**: Feature
**Date and time created**: 2026-05-13 13:00
**GitHub Issue**: [#1981](https://github.com/climateconnect/climateconnect/issues/1981)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)
**Related Specs**:
- [`20260416_1000_event_registration_custom_fields.md`](./20260416_1000_event_registration_custom_fields.md)

---

## Problem Statement

When an organiser creates an event-type project with registration enabled, they must manually set both the event start date and the event registration end date. Currently, the event end date is automatically set to one hour after the start date when the start date is first chosen (provided no end date was already set). Organisers expect the registration end date to behave the same way — defaulting to the event start date when the start date is set and the registration end date is still blank. Without this auto-fill, organisers frequently forget to set the registration deadline, causing validation errors on publish or leaving events without a clear cutoff for registrations.

**Core Requirements (User/Stakeholder Stated):**

- When creating an event-type project with registration enabled, after the organiser sets the event start date, the registration end date must automatically be set to the event start date **if it was blank**.
- The behavior must mirror the existing auto-set pattern for the event end date (see `ProjectDateSection.tsx` lines 43–62).
- The auto-set must only trigger when the registration end date is blank (null/undefined/empty); if the user has already entered a value, it must not be overwritten.
- If the event start date changes again later, the registration end date must **not** be overwritten again (same one-time auto-fill behavior as the event end date).

**Explicitly Out of Scope (this task):**
- Changing the auto-set logic for the event end date (that behavior stays as-is).
- Backend validation changes (the existing registration end date validation is sufficient).
- Edit project form behavior (this task covers the create flow only; the edit flow is addressed separately if needed).
- Any changes to how the registration end date is displayed or validated after initial entry.

### Non-Functional Requirements

- **No breaking changes** to existing API contracts or data models.
- **Consistent UX**: the auto-set must feel identical to the event end date auto-set (same timing, same conditions).
- **Performance**: no additional API calls; purely client-side state update.

### AI Agent Insights and Additions

- **Implementation location**: the `ProjectDateSection` component already handles the `start_date` → `end_date` auto-set via `handleDateChange`. The cleanest approach is to extend this same handler (or a closely related one) to also check `registration_end_date` and set it when the start date changes.
- **Data shape**: `projectData.registration_end_date` is a Dayjs-compatible date object (or null). The `handleSetProjectData` callback accepts a partial object to merge into project state.
- **Guard conditions**: the auto-set must fire only when:
  1. `prop === "start_date"` (user just changed the start date),
  2. `projectData.registrationEnabled === true` (registration is toggled on),
  3. `projectData.project_type.type_id === "event"` (it's an event),
  4. `!projectData.registration_end_date` (registration end date is blank).
- **One-time fill**: the check must happen at the moment the start date is set. If the user later clears the start date and re-sets it, the registration end date should only be auto-filled if it's still blank (preserving any manual edit the user made).
- **Event registration section dependency**: `EventRegistrationSection` is rendered conditionally inside `EnterDetails.tsx` (lines 326–337) only when `registrationEnabled && type_id === "event"`. The `ProjectDateSection` does not have direct access to registration state, so the check must use `projectData` props.

---

## Acceptance Criteria

- [ ] When creating a new event with registration enabled, selecting a start date automatically fills the registration end date with the same value if the registration end date was previously blank.
- [ ] If the registration end date already has a value, changing the start date does **not** overwrite it.
- [ ] If registration is not enabled, changing the start date does **not** set the registration end date.
- [ ] If the project type is not "event", changing the start date does **not** set the registration end date.
- [ ] Existing end-date auto-set behavior (one hour after start) remains unchanged.

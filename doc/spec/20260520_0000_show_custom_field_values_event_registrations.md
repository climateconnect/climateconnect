# Show Custom Field Values in Event Registrations (Admin View)

**Status**: DRAFT  
**GitHub Issue**: https://github.com/climateconnect/climateconnect/issues/1963  
**Branch**: `show_custom_field_values_event_registrations`

---

## Problem Statement

### Core Requirements (User)

Project admins (creators/editors) who run events with registration forms that include additional custom fields currently cannot see the values guests entered for those custom fields when reviewing the registration list. This makes it impossible for admins to plan their event based on guest-provided data (e.g. dietary requirements, t-shirt sizes, session preferences).

The registration grid view does not have enough space to display up to 5 additional custom fields inline. A modal must be opened per guest to display their entered values. A visual indicator in the grid row should signal to the admin that a guest has submitted custom field data, and clicking it opens the modal.

A follow-up task will show the same custom field values to the guest who registered. The component built in this task must be reusable for that purpose.

### AI Agent Insights and Additions

- Consider that registration lists for popular events may be large; fetching custom field values must not degrade list performance — backend should load values efficiently alongside registrations
- The modal component should avoid hard-coupling to the admin context so it can be embedded in the guest-facing registration view in the follow-up task
- The icon/indicator in the grid should only appear for rows where the guest actually submitted at least one custom field value; rows without custom field data should not show the indicator

---

## System Impact

### Entities Affected

- **EventRegistration** — existing; custom field values must be surfaced alongside registration data for admin view
- **CustomField / CustomFieldResponse** (or equivalent) — existing; no schema changes expected; relation must be efficiently loaded for list queries
- **Project / Event** — no changes; context provider only

### API / Backend

- The event registrations list endpoint (used in the admin registration view) must include each registration's custom field values in the response
- Serializer for registrations must nest custom field label + value pairs; use `prefetch_related` to avoid N+1 on large registration lists
- Permission check: only users with creator/editor role on the project may see custom field values

### Frontend Components

- **Registration grid** — add visual indicator per row when a guest has custom field values; indicator must be actionable (click → opens modal)
- **Custom field values modal** — new component showing all field labels and entered values for a specific guest; designed for reuse in the guest-facing view (follow-up task)
- No new pages; changes are scoped to the existing event admin registration view

### Flows Affected

- **View event registrations (admin)** — extended to include custom field data and modal interaction

---

## Acceptance Criteria

- [ ] Admin opens the registration list for an event that has custom fields; guests who submitted values show a visible indicator in the grid row
- [ ] Clicking the indicator opens a modal displaying each custom field label alongside the value the guest entered
- [ ] Guests who did not submit any custom field values do not show an indicator
- [ ] The modal component is structured so it can be reused in a guest-facing context without modification to its core display logic
- [ ] The registration list does not exhibit performance regression for events with large guest counts
- [ ] Only project creators/editors can access the custom field values; other users cannot

---

## Constraints & Non-Negotiables

- **Reusability**: modal component must be generic enough for the follow-up guest-facing task
- **Performance**: custom field data must not cause N+1 queries or slow down the registration list
- **Permissions**: guest-facing display of custom field values is out of scope for this task
- **No schema changes** expected; work within existing models

---

## Log

- 2026-05-20 — Task spec created based on GitHub issue #1963

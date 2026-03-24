# Allow Online as Location for a Project

**Status**: IMPLEMENTATION (Reference: [`task-based-development.md`](../guides/task-based-development.md))
**Type**: Feature
**Date and time created**: 2026-03-05 08:00
**Date Completed**: TBD
**Related GitHub Issue**: #42 - [STORY] Allow online as location for a project
**Related Specs**:
- [`docs/mosy/architecture_overview.md`](../mosy/architecture_overview.md)
- [`docs/mosy/entities/system-entities.md`](../mosy/entities/system-entities.md)
- [`docs/mosy/flows/core-flows.md`](../mosy/flows/core-flows.md)

## Problem Statement

When creating or editing a project (all three types: project, event, idea), the user can select "online" as an additional attribute to indicate that the project/event takes place online. A physical location remains required for all project types — the "online" flag is stored as a separate boolean field on the project.

**Core Requirements (User/Stakeholder Stated):**
- When creating or editing any project type (project, event, idea), the user can select a checkbox to mark it as "online".
- The label of the location input field is changed to 'Location' when type is event.
- A new sub-header is added to the location section of the form to group the location form fields. It uses the type plus location, e.g. 'Event location' or 'Idea location'
- The additional info field placeholder/helper text is changed to: "Additional info (e.g. room, meeting link, ...)".
- A physical location field remains required for all project types regardless of the online flag (no changes to existing location validation).
- When previewing a project in a project card, it shows "Online" if the online checkbox was selected.
- On the project detail page, for the location section it shows "Online" plus the physical location when the online flag is set.
- No special filter or search query for online projects in this iteration (future improvement).

### Non Functional Requirements

- The `is_online` field must be persisted and exposed via the existing project API without breaking changes.
- The `is_online` boolean field on the `Project` entity defaults to `false` to preserve backwards compatibility with existing projects.
- The API serializer for `Project` must include `is_online` in both read and write operations (GET/POST/PATCH).
- A database migration is required to add the `is_online` column to the project table with a default of `false`.
- The change must be applied consistently across all project types (project, event, idea) in both create and edit forms.
- The edit form (which visually differs from the create form) must also support the online checkbox — design for the edit form is still pending (see issue comments).

### AI Agent Insights and Additions

None.

## System impact
- **Actors involved**:
  - `Member` / `Organization`: Creates or edits a project and toggles the online flag.
  - `Guest` / `Member`: Views a project card or detail page and sees the online indicator.
- **Actions to implement**:
  - `Member` → `Create Project` → `Project` *(extended: set `is_online`)*
  - `Member` → `Edit Project` → `Project` *(extended: update `is_online`)*
  - `Guest/Member` → `View Project Card` → `Project` *(extended: render online indicator)*
  - `Guest/Member` → `View Project Detail` → `Project` *(extended: render "Online" + location)*
- **Flows affected**:
  - **Flow 2 — Project/Event/Idea Creation Flow**: Extended. Step 2 gains an "online" checkbox; form label and helper text change conditionally; `is_online` is submitted and persisted.
  - **Flow 2 — Project/Event/Idea Edit Flow** *(implicit sub-flow)*: Same extension applies; design for the edit form is a pending dependency.
- **Entity changes needed**: Yes
  - `Project`: add `is_online: Boolean (default: false)`.
- **Flow changes needed**: Yes — Flow 2 updated as described above.
- **Integration changes needed**: No external system changes required.
- **New specifications required**: None — changes are confined to existing flow and entity.

## Software Architecture
[To be filled by Archie - @mosy-system-architect]

### API

The existing project REST endpoints are extended — no new endpoints required.

- `POST /api/projects/` — request body gains `is_online: boolean (optional, default false)`
- `PATCH /api/projects/{slug}/` — request body gains `is_online: boolean (optional)`
- `GET /api/projects/{slug}/` — response gains `is_online: boolean`
- `GET /api/projects/` *(list/search)* — response items gain `is_online: boolean`

No breaking changes. All additions are additive and optional on write.

### Events

None. No async events are triggered by this change.

### Frontend

- **Create form**: Add `is_online` switch toggle (MUI) to the location section above the location component. Add a sub-header to the location section grouping those fields, labelled by project type (e.g. "Event location", "Idea location") and update the additional info helper text.
- **Edit form**: Same checkbox and conditional behaviour. Initialise from the saved `is_online` value. ⚠️ Edit form design is a pending dependency — implementation must wait for design sign-off.
- **Project card component**: Display "Online" as location when `is_online === true` instead of the location name.
- **Project detail page**: In the location section, render "Online" followed by the physical location when `is_online === true`.

### Backend

- **`Project` model**: Add `is_online = models.BooleanField(default=False)`.
- **Project serializer**: Include `is_online` as a readable and writable field.
- **Django migration**: Add `is_online` column with `DEFAULT FALSE` — no data backfill required.

### Data

- **Table**: `projects_project` (or equivalent) gains column `is_online BOOLEAN NOT NULL DEFAULT FALSE`.
- **Migration**: additive, non-destructive, safe to run on production without downtime.

### Other

None.

## Technical Solution Overview
[To be filled by a development agent]

## Log
- 2026-03-05 08:00 - Task created from GitHub issue #42. Branch: `allow_online_location_for_project`. Handing off for system impact analysis.
- 2026-03-05 09:00 - System impact analysis complete. `Project` entity extended with `is_online: Boolean (default: false)`. Flow 2 updated in `core-flows.md`. Existing project REST endpoints extended additively — no new endpoints, no breaking changes. Edit form implementation blocked on pending design.
- 2026-03-09 11:21 - Implemented backend changes. 

## Acceptance Criteria

- [ ] When creating any project type (project, event, idea), the user can switch a toggle to mark the project as "online".
- [ ] When editing any project type, the online checkbox is present and reflects the saved state.
- [ ] The physical location field remains required for all project types regardless of the online checkbox state.
- [ ] A project card shows "Online" when `is_online` is true on all pages that show the project card.
- [ ] The project detail page shows "Online" plus the physical location when `is_online` is true.
- [ ] The `is_online` field is persisted in the database and returned via the project API.
- [ ] Existing projects without the field set default to `is_online = false` (no data migration required beyond the schema default).
- [ ] No breaking changes to the existing project API contract.
- [ ] All tests pass (unit, integration, end-to-end)
- [ ] Code review approved
- [ ] Documentation updated and current


# Project Special Page URL

**Status**: DRAFT
**Type**: Feature
**Date and time created**: 2026-05-26 09:59

---

## Problem Statement

Some projects need a custom landing page instead of the standard project detail view. The current approach (exemplified by the Wasseraktionswochen event series) requires hardcoded constants scattered across 6+ files — a config file with slugs and paths, feature flags, and conditional checks in the project detail page, sidebar, back button, header links, and browse page. Every new special page would duplicate this pattern.

The goal is to replace this with a generic mechanism: a URL field on the Project model that points to a custom page. When set, the project detail page renders the custom page content instead of the normal project overview. The project tabs (project overview, team, discussion) must remain functional via hash-based routing (`#team`, `#comments`).

**Core Requirements:**

- Add a `special_page_url` field to the Project model that stores the default (English) URL path of a custom page (e.g., `/projects/wasseraktionswochen`).
- When a user visits the project detail page (`/projects/[projectId]`) for a project that has `special_page_url` set, the custom page content is shown instead of the normal `ProjectOverview` hero section.
- The locale prefix (`/de`) is applied automatically at render time based on the user's locale — only the default English path is stored.
- The project tabs (`#project`, `#team`, `#comments`, and `#registrations` when applicable) continue to function normally below the custom content. Hash-based deep-linking and tab switching remain unchanged.
- Other project routes (e.g., `/projects/[projectId]/register`) continue to work and are not affected by the `special_page_url` field.
- When `special_page_url` is not set, the project detail page behaves exactly as it does today — no changes to existing project pages.

**Explicitly Out of Scope:**

- A dynamic component registry or auto-generated component lookup system.
- Migration of existing Wasseraktionswochen hardcoded references to the new mechanism (that can be a follow-up task).
- Changes to how the project browse or sidebar pages link to special pages.

### Non-Functional Requirements

- **No breaking changes** to existing API contracts or data models. The new field is nullable and optional.
- **Backward compatible**: projects without `special_page_url` behave identically to today.
- **Locale handling**: the stored path is always the default (English) path. The `/de` prefix is applied at render time using the existing `getLocalePrefix` utility.

### AI Agent Insights and Additions

- **Tab architecture**: `ProjectPageRoot` renders `ProjectOverview` at the top, followed by `Tabs` and `TabContent` components. The tabs use `window.location.hash` (values: `project`, `registrations`, `team`, `comments`) to sync state with the URL. The custom page content should replace `ProjectOverview` (the hero section above the tabs), not the entire `ProjectPageRoot`. This preserves the tab navigation and all tab content (project details, team list, discussion) below the custom content.
- **Rendering approach**: The project detail page already receives the full project object via `getServerSideProps`. The `special_page_url` field (included in the serialized project data) determines whether to render the normal `ProjectOverview` or the custom page content. The custom page component can be imported directly (e.g., `import Wasseraktionswochen from "../../../devlink/Wasseraktionswochen"`) — this is the manual page approach, acceptable for 1-2 occurrences per quarter.
- **Back button**: `GoBackFromProjectPageButton` currently has hardcoded Wasseraktionswochen logic (checking `document.referrer` against `WASSERAKTIONSWOCHEN_PATH`). This can be generalized by checking if the project has a `special_page_url` and if the referrer matches it. This is out of scope for this task but noted for a follow-up cleanup.
- **Sidebar**: `ProjectSideBar` has hardcoded Wasseraktionswochen sibling project logic. Same as above — out of scope but noted. Wasseraktionswochen was a proejct series with siblings. That does not apply to other projects.
- **API serialization**: The project serializer (`organization/serializers/project.py`) needs to include `special_page_url` in its fields. The field should be included in both the list and detail serializer views so that linking logic (browse page, sidebar) can check it.
- **Admin UX**: The field should be editable in the Django admin. No custom frontend form is needed — the Django admin's default CharField widget is sufficient.

---

## Acceptance Criteria

- [ ] The Project model has a `special_page_url` field (CharField, max_length=256, nullable, blank).
- [ ] A Django migration is generated and applies cleanly.
- [ ] The project API serializer includes `special_page_url` in its output.
- [ ] When `special_page_url` is set on a project and a user visits `/projects/[projectId]`, the page renders the custom content referenced by the URL instead of the normal `ProjectOverview` hero section.
- [ ] When `special_page_url` is set, the project tabs (`#project`, `#team`, `#comments`) still function — clicking a tab switches content, and deep-linking via hash URL works.
- [ ] When `special_page_url` is set, the `/de` locale prefix is applied automatically based on the user's locale.
- [ ] When `special_page_url` is not set on a project, the project detail page renders identically to the current behavior (no regression).
- [ ] Other project routes (e.g., `/projects/[projectId]/register`) are not affected by the field.
- [ ] The field is editable in the Django admin for projects.

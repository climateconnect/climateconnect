# Wasseraktionswochen Hub Child Events Page

**Status**: DRAFT  
**Type**: Feature  
**Date and time created**: 2026-01-21 14:13 UTC  
**Date Completed**: N/A  
**Related GitHub Issue**: [#1747 - Wasseraktionswochen Event Page with Webflow Integration](https://github.com/climateconnect/climateconnect/issues/1747)

**Upstream Dependencies / References**:  
- `doc/spec/20250106_1430_parent_child_project_relationships.md` (parent/child projects API enabler)

## Problem Statement

Create a dedicated event page for Wasseraktionswochen within the Emmendingen Climate Hub that showcases all related sub-events, enabling visitors to easily discover and participate in specific events within the larger campaign. This leverages the parent/child event relationships from #1735 and integrates Webflow/Devlink for content management.

**Core Requirements (User/Stakeholder Stated):**

1. **Event Grid Display**
   - Display sub-events as cards in a grid layout
   - Parent event (`wasseraktionswochen-143-2932026`) can be hardcoded for this special page
   - Sort events by date in ascending order: upcoming events (>= current day) first, past events at the end
   - Use infinite scroll pattern from browse page (no manual filtering needed)
   - Fetch child events using the API filter by parent project slug

2. **Webflow Integration**
   - Event page has designated area for a Webflow component (to be determined later)
   - Use a placeholder component until Webflow component is available

3. **Climate Hub Theming & Navigation**
   - Apply Emmendingen Climate Hub (slug: `em`) branding with hub logo
   - Main navigation shows: About Us (link to hub landing page), Donations, Language Selector, Notifications, Profile/Login
   - Use hub theming consistent with other hub pages (wideLayout enabled)

4. **Feature Toggle & Redirect**
   - During the event period, redirect from the default Wasseraktionswochen project detail page (e.g., `/de/projects/wasseraktionswochen-143-2932026?hub=em`) to this special event page
   - Simple feature toggle to enable/disable this redirect behavior
   - On the Emmendingen Hub 2nd level navigation, add a highlighted menu item for Wasseraktionswochen
   - This menu item links to the special event page and is enabled by the same feature toggle

5. **Optional: Contact Button**
   - Nice to have: Contact button similar to the project detail page

6. **SEO & Metadata**
   - Include SEO-friendly metadata (title, description) per locale (de/en)
   - Follow patterns from other hub pages for consistency

7. **Technical Constraints**
   - Use legacy pages router (not app router) - add page under `frontend/pages/hubs/em/wasseraktionswochen.tsx`
   - Support both `/de/hubs/em/wasseraktionswochen` and `/en/hubs/em/wasseraktionswochen` routes
   - Must not affect existing pages or introduce regressions

### Non Functional Requirements

1. **Performance**: 
   - Data fetch and render should not noticeably degrade page load versus comparable pages
   - Reuse existing infinite scroll implementation from browse page
   - Optimize API calls with proper pagination

2. **i18n**: 
   - Support both `de` and `en` locales for routing and all user-facing copy
   - No hard-coded language-only content

3. **Resilience**: 
   - Gracefully handle empty/failed child-event fetches with user-friendly messaging
   - Handle loading states with appropriate UI feedback

4. **Compatibility**: 
   - Must coexist with the legacy pages router
   - Feature toggle must be simple and reliable
   - Redirect must not interfere with other project detail pages

5. **Maintainability**:
   - Feature toggle should be easily configurable (environment variable or admin setting)
   - Code should be reusable if similar event pages are needed for other hubs

### AI Agent Insights and Additions

**Additional Considerations:**
1. Consider date-based sorting logic: events are sorted by start_date, with upcoming events (>= today) appearing first, followed by past events.
2. Add basic loading skeletons to align with existing UX patterns (infinite scroll) so the grid feels responsive while data loads.
3. Gate the special page, redirect, and nav highlight with a simple environment-variable switch to match how other experimental features are toggled today.
4. Keep the redirect logic narrowly scoped: only the Wasseraktionswochen detail page should redirect, and only while the env variable is enabled.
5. The 2nd level navigation highlight may require a new style variant; plan to introduce a minimal, hub-specific highlighted state if no reusable component exists yet.
6. For the Webflow placeholder, use a clearly labeled container so it is easy to replace once the actual component ships.

## System impact

**Actors involved**
- VisitorActor: anonymous or logged-in user viewing hub/event content
- MemberActor: authenticated visitor with access to notifications/profile/contact entry points
- PlatformOpsActor: flips the Wasseraktionswochen env toggle to activate the special page (enables redirect + nav item simultaneously)
- CMSActor: manages Webflow content (placeholder for now)

**Actions to implement / update**
- VisitorActor → BrowseSpecialEvent → ChildProject entities (new dedicated flow for Wasseraktionswochen page)
- VisitorActor → LoadChildProjectsInfiniteScroll → Project collection (reuse browse infinite scroll with parent slug filter)
- PlatformOpsActor → ToggleWasseraktionswochenFeature → FeatureToggle (env variable) activating page + redirect + nav link
- VisitorActor → AccessProjectDetail(Wasseraktionswochen) → Project entity (redirects via Next.js config while toggle active)
- MemberActor → AccessSecondaryNavHighlight → HubNavigation state (Wasseraktionswochen link visible only when toggle active)

**Flows affected / added**
1. **WasseraktionswochenSpecialPageFlow (new)**
   - Trigger: Visitor navigates to `/[locale]/hubs/em/wasseraktionswochen` while feature toggle enabled
   - Technical components: Next.js pages router, `WideLayout`, `ProjectPreviews`, API `/api/projects?parent_project_slug=...`
   - Entities: Project (parent + child), HubThemeConfig, SEO meta derived from parent project API response
   - Metrics: page load success, API fetch success (reuse existing monitoring)
2. **ProjectDetailRedirectFlow (modified)**
   - Trigger: Visitor opens parent project detail URL (`/projects/wasseraktionswochen-...`) while env toggle enabled
   - Technical components: `next.config.js` redirect rule controlled by env variable
   - Entities: Project, FeatureToggle
3. **HubSecondaryNavigationFlow (modified)**
   - Trigger: Hub navigation render while env toggle enabled
   - Technical components: Hub navigation config consumed by `WideLayout`, translation resources
   - Entities: HubNavigationItem, FeatureToggle

**Entity changes needed**
- No database schema changes; rely on existing Project relationships from #1430
- Feature toggle realized via environment variable; no persistent storage required

**Integration changes**
- API: reuse `/api/projects` with `parent_project_slug` filter (already implemented per PoC)
- Webflow: placeholder container only; future integration will embed Devlink component
- Navigation: ensure theme + header links can inject highlighted item without affecting other hubs; toggle gating handles visibility

**Specification updates required**
- Document env variable controlling special page activation (name, default, scope)
- Extend navigation spec to describe Wasseraktionswochen highlighted menu behavior tied to toggle
- Add routing spec note describing temporary Next.js redirect controlled via env variable
- Note SEO meta extraction from parent project API response (same approach as existing project detail page)

**Notes based on PoC (`frontend/pages/hubs/em/wasseraktionswochen.tsx`)**
- Already fetches child projects by slug and renders grid, but missing:
  - Date-based sorting (upcoming vs past) and infinite scroll behavior
  - Feature toggle checks + nav highlight binding
  - SEO metadata derivation (should reuse parent project API data, as project detail pages do)
  - Loading/error states + skeletons
  - Contact button and Webflow component integration (currently simple placeholder)

## Software Architecture

- **Pages Router Entry**: `frontend/pages/hubs/em/wasseraktionswochen.tsx` remains a pages-router component (functional component + `getServerSideProps` if we need locale-aware metadata). It composes existing hub layout helpers (`WideLayout`, `HubThemeProvider`) to ensure full-width styling and hub navigation.
- **Project Fetching**: reuse the browse-page data hook/utility (`fetchProjects`, `getProjects`) but pass `parent_project_slug=wasseraktionswochen-143-2932026` and `ordering=start_date`. Infinite scroll uses the same `ProjectPreviews` (or `ProjectCardGrid`) component with pagination cursors.
- **Sorting Logic**: after fetching each page, split results into `upcoming` (start_date >= today) and `past`. Concatenate `[upcoming, past]` to keep desired ordering without server changes.
- **Loading/Error UI**: reuse profile/browse skeleton components (e.g., `ProjectCardSkeleton`) and the generic `ErrorState` to keep consistency.
- **SEO Metadata**: in `getServerSideProps`, call the project detail endpoint for the parent (if not already included in the child list response) and map `meta.title_de`, `meta.title_en`, etc., into `<Head>` tags similar to `pages/projects/[slug].tsx`.
- **Webflow Placeholder**: create a dedicated component (e.g., `WasseraktionswochenWebflowSlot`) that currently renders a styled placeholder. Later, swap this component with the actual Devlink embed without touching the page structure.
- **Feature Toggle**: introduce env var `WAW_FEATURE_PAGE`. The page export checks it; if false, return 404 to keep route hidden. The same env var is consumed in `next.config.js` for redirect rules and in hub navigation helpers to append the highlighted menu item. Developers set this via the local `.env` file (not committed), while CI/CD and Azure define it through their respective environment variable settings.
- **Redirect Implementation**: add to `next.config.js` `async redirects()` array a rule guarded by `process.env.WAW_FEATURE_PAGE === 'true'`, redirecting from `/projects/wasseraktionswochen-143-2932026` (and locale-prefixed variants, including `?hub=em`) to the special page.
- **Navigation Hook**: extend the existing hub navigation builder (likely in `frontend/src/utils/hubs/navigation.ts`) to read the env var and push `{ label: "Wasseraktionswochen", href: '/[locale]/hubs/em/wasseraktionswochen', highlight: true }` when enabled.
- **Contact Button**: reuse the `ContactProjectButton` component from project detail if available, fed with the parent project’s contact data.

## Data

- **Entities Used**: Project (parent + child) already defined in parent-child spec #1430. No schema or migration work required.
- **API Contracts**:
  - `GET /api/projects?parent_project_slug=wasseraktionswochen-143-2932026&ordering=start_date&limit=...` for child events (paginated). Response already includes `results`, `next`, `previous`, `count` as on browse page.
  - `GET /api/projects/wasseraktionswochen-143-2932026/` for parent metadata (title, description, contact info, hero assets used for SEO + contact button).
- **Fields Consumed**:
  - `title`, `short_description`, `start_date`, `end_date`, `location`, `cover_image`, `slug` for cards.
  - `stats_child_count` (if available) to show number of sub events (optional callout).
  - SEO meta fields: `meta_title_{locale}`, `meta_description_{locale}` (fall back to `title`/`short_description` if empty).
  - Contact info fields: `contact_email`, `contact_url`, `owner` (for optional contact button).
- **Sorting Logic**: uses `start_date` in UTC; rely on frontend moment/dayjs to compare with `today` (timezone aware) after API returns data.
- **Caching**: no new caches; rely on existing API caching/CDN behavior.
- **Translations**: Card component already consumes localized fields; ensure page-level copy uses `next-i18next` namespace for hub pages.

## Testing

- **Unit/Component**
  - Project grid component: verifies upcoming vs past ordering logic and skeleton display while loading.
  - Navigation helper: ensures Wasseraktionswochen item appears only when env toggle true and carries `highlight` flag.
  - Redirect config helper (if abstracted): asserts redirect path + condition derived from env var.
- **Integration / E2E**
  1. Toggle OFF: `/[locale]/hubs/em/wasseraktionswochen` returns 404; project detail page shows default content.
  2. Toggle ON: visiting `/projects/wasseraktionswochen-...` redirects (307) to `/[locale]/hubs/em/wasseraktionswochen`.
  3. Page load: verify API called with `parent_project_slug` and infinite scroll fetches subsequent pages; skeletons show while fetching.
  4. Sorting: upcoming events appear first, past events after; adjust system clock or mock dates to cover both cases.
  5. SEO: page `<head>` contains locale-specific title/description pulled from parent project API response.
  6. Navigation: top menu shows About/Donations/etc plus highlighted Wasseraktionswochen item in secondary nav.
  7. Contact button: renders when parent project exposes contact data; hides gracefully otherwise.
  8. Webflow placeholder: visible with clear label; does not break layout on mobile/desktop.
- **Manual QA Checklist**
  - Run `yarn dev` with env toggle true and smoke-test both `/de/...` and `/en/...` routes.
  - Confirm redirect removal when toggle false (no stale Next.js cache).
  - Validate responsive layout (mobile, tablet, desktop) still respects `wideLayout`.

## Log

- 2026-01-21 14:13 UTC — Initial draft created (Taskie).
- 2026-01-21 14:25 UTC — Problem statement & requirements approved; ready for Archie system impact analysis (Taskie).
- 2026-01-26 - Implemented custom navigation for page and refactored header links.
- 2026-01-27 - Extracted component and added sorting logic.

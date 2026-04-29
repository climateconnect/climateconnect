# 20260429_1525_update_header_links_auth_unification

**Type**: Story  
**Status**: COMPLETED  
**Started**: 2026-04-29 15:25  
**Completed**: 2026-04-29 15:35  
**Owner**: —  
**Depends on**: [EPIC: Auth Unification](./EPIC_auth_unification.md) — AUTH_UNIFICATION feature toggle must be active.  
**Blocks**: —  

---

## Problem Statement

When the `AUTH_UNIFICATION` feature toggle is active, the platform's header currently displays separate login and signup buttons that link to the legacy `/signin` and `/signup` pages. To align with the new unified authentication flow, which provides a single entry point for both login and signup, the header must be updated to show only a login button linking to the new `/login` page. The button text should be 'Anmelden' in German, consistent with the platform's localization.

This change matters for users because it simplifies the authentication experience by presenting a single, clear path to access the platform, reducing potential confusion from multiple buttons and ensuring they enter the modern flow when the toggle is enabled. It supports the business goal of a streamlined, passwordless-by-default auth system that enables features like guest event registration.

---

## Acceptance Criteria

- **Toggle Off Behavior**: When `AUTH_UNIFICATION` toggle is disabled, the header links remain unchanged, displaying both login and signup buttons as they do today.
- **Toggle On Behavior**: When `AUTH_UNIFICATION` toggle is enabled, the header shows only one login button with the text 'Anmelden' (localized to German), linking to `/login`.
- **Redirect and Hub Support**: The login button preserves `?redirect=` and `?hub=` query parameters, appending them appropriately to the `/login` URL. The hub parameter must be included for both custom hubs and location hubs to enable correct branding on the `/login` page.
- **No Impact on Other Links**: Logged-in user links, notifications, and other header elements are unaffected.
- **Localization**: The button text 'Anmelden' is correctly displayed in German contexts; no changes to other languages unless specified.
- **Testing**: Verified on staging with toggle on/off, across different hubs (custom and location) and redirect scenarios.

---

## Constraints and Non-Negotiable Requirements

- **Backward Compatibility**: The change must not affect the header when the toggle is off.
- **Feature Toggle Integration**: The header logic must dynamically check the `AUTH_UNIFICATION` toggle state (likely via an API call or context, following existing patterns).
- **Hub Theming Preservation**: If hub theming affects header links, ensure the change integrates without disrupting it.
- **No Endpoint Changes**: This is a frontend-only change; no new backend endpoints or modifications to existing ones.
- **Performance**: The toggle check should not introduce noticeable latency to header rendering.
- **Security**: No exposure of sensitive auth data through the header links.

---

## Domain Context

This story belongs to the Auth Unification epic, specifically supporting the transition to the combined login/signup page introduced in Phase A. The header links are a critical navigation component used across all pages, providing quick access to authentication for logged-out users. The unified flow reduces friction by eliminating the need for users to choose between login and signup upfront, instead branching automatically based on email lookup. This update ensures the header reflects this simplification, guiding users to the appropriate entry point.

---

## AI Insights

- **Hint**: Leverage the existing `FeatureToggle` model and API (used elsewhere in the codebase) to check the `AUTH_UNIFICATION` state. If the toggle is fetched server-side or client-side, ensure it's cached appropriately to avoid repeated requests.
- **Trade-off Note**: Showing only one button simplifies the UI but may require user education if they expect a separate signup option. However, the combined page's design inherently handles both login and new user signup, so this trade-off favors clarity and consistency over granular control. If A/B testing shows confusion, consider adding a subtle hint or secondary CTA on the `/login` page.
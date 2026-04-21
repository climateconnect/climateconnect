# US-1: `AUTH_UNIFICATION` Feature Toggle + Redirect

**Status**: READY FOR IMPLEMENTATION  
**Type**: Tech Enabler  
**Epic**: [EPIC: Auth Unification](./EPIC_auth_unification.md)  
**Date created**: 2026-04-20 12:00  
**Blocks**: US-2, US-2b, US-3, US-4, US-5 (all Phase A work can proceed behind this toggle once it exists)

---

## Problem Statement

All Phase A auth unification work needs to be developed and deployed without affecting the current `/signin` and `/signup` flows in production. A feature toggle is the mechanism that makes this safe: new code ships behind `AUTH_UNIFICATION = off` and is only activated when explicitly enabled per environment.

Additionally, once the toggle is on, users who navigate to the old `/signin` or `/signup` URLs must be transparently redirected to the new `/login` page (to be built in US-5), preserving all query parameters (`?redirect=`, `?hub=`).

This story has two deliverables:
1. **The `AUTH_UNIFICATION` toggle record** — created in the backend via the existing `FeatureToggle` mechanism.
2. **Redirect logic on `/signin` and `/signup`** — when the toggle is on, both pages redirect to `/login` (preserving query params). When off, both pages behave exactly as today.

---

## Acceptance Criteria

- [ ] A `FeatureToggle` record named `AUTH_UNIFICATION` is created by a data migration in the `feature_toggles` app. Default state: off in all environments (`production_is_active`, `staging_is_active`, `development_is_active` all `False`).
- [ ] Navigating to `/signin` when `AUTH_UNIFICATION` is **on** redirects to `/login`, preserving all query parameters (`?redirect=`, `?hub=`, `?message=`, `?message_type=`).
- [ ] Navigating to `/signup` when `AUTH_UNIFICATION` is **on** redirects to `/login`, preserving all query parameters.
- [ ] When `AUTH_UNIFICATION` is **off**, `/signin` and `/signup` behave exactly as today — no visible change to users.
- [ ] The redirect is a server-side redirect (HTTP 307) from `getServerSideProps` — no client-side flash.
- [ ] Enabling the toggle on staging does not affect production.

---

## Implementation Notes

### Backend
Create the `AUTH_UNIFICATION` toggle via a data migration in the `feature_toggles` app — the same pattern used for `EVENT_REGISTRATION` in `0002_add_event_registration_toggle.py`. The migration should use `get_or_create` with a reverse function that deletes the record, and set all environment flags to `False` (off everywhere by default).

### Frontend
Both `/signin` (`pages/signin.tsx`) and `/signup` (`pages/signup.tsx`) already use `getServerSideProps`. The toggle check and redirect should be added there.

The existing `getFeatureTogglesFromRequest(req)` helper (from `src/hooks/featureToggles.ts`) fetches toggles server-side and is the right tool here. Check `isFeatureEnabled('AUTH_UNIFICATION', toggles)` and return a `{ redirect }` response if true, forwarding all query params to `/login`.

The `/login` page does not exist yet (US-5). The redirect should still be wired now — it will simply 404 until US-5 ships, which is fine since the toggle will be off on production.

---

## Out of Scope

- The `/login` page itself (US-5).
- Any new backend auth endpoints.
- Any UI or visual changes to `/signin` or `/signup`.

---

## Log

- 2026-04-20 12:00 — Spec created. Small enabler story; unblocks all parallel Phase A work.


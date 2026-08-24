# Prevent guest users from triggering the organization follow-state API on organization pages

**Status**: DRAFT
**Type**: Frontend
**Issue**: #2175
**Date created**: 2026-08-04

---

## Problem Statement

The organization detail page currently calls the follow-state endpoint at `/api/organizations/[org slug]/am_i_following/` even when the user is not authenticated.

This causes unnecessary backend errors and noisy error logs for guest users visiting organization pages. The issue is especially visible on the organization detail page flow where the page fetches follow-state during server-side data loading.

The expected behavior is that this follow-status request is only made for authenticated users.

---

## Goals / Scope

- Prevent the frontend from calling the organization follow-state endpoint for guest users.
- Preserve the existing behavior for authenticated users, including the current follow-state UI and data flow.
- Keep the fix focused on the organization detail page experience and avoid unrelated API or permission changes.

### In scope
- The organization detail page SSR/data-loading path.
- Any initial follow-state fetch that runs before the page renders.
- A regression-safe behavior change so guest requests skip the follow-state lookup.

### Out of scope
- Changing backend endpoint behavior or permissions broadly.
- Reworking the follow/unfollow feature itself.
- Changing other pages that may use the same follow-state pattern unless they are directly affected by the same bug.

---

## Current Behavior

On the organization detail page, the frontend requests the follow-state endpoint as part of the page data initialization. For unauthenticated visitors, the request is still triggered and the backend logs an error because the request is not authorized for that endpoint.

This results in:
- browser console noise,
- backend error logs for guest traffic,
- unnecessary API calls for anonymous users.

---

## Proposed Solution

Guard the follow-state lookup so it only runs when a valid authentication token is present.

### Expected behavior
- If the user is a guest (no auth token), the page should not call `/am_i_following/`.
- The follow-state should default to a safe neutral value such as `false` or `null`, depending on the existing UI expectations.
- If the user is logged in, the current follow-state flow should remain unchanged and continue to fetch the real follow status.

---

## Acceptance Criteria

- [ ] Visiting an organization detail page as a guest does not trigger the `/api/organizations/[org slug]/am_i_following/` request.
- [ ] No backend error is produced for the guest-user organization page flow caused by this endpoint call.
- [ ] The organization page still renders correctly for guests without broken follow-state UI.
- [ ] Logged-in users still receive the real follow-state value and can use the follow/unfollow experience normally.
- [ ] The fix does not introduce regressions in the existing organization page data loading flow.
- [ ] A regression test or equivalent coverage is added to ensure guest users do not trigger the follow-state request.

---

## Constraints / Non-Negotiables

- The fix should be minimal and targeted to the affected frontend path.
- Existing authenticated behavior must remain intact.
- The change should avoid introducing a new user-facing error state for guests.
- No broad permission or API contract changes should be required for this issue.

---

## Domain Context

Relevant implementation area:
- Frontend organization page: [frontend/pages/organizations/[organizationUrl].tsx](frontend/pages/organizations/[organizationUrl].tsx)

The page currently fetches organization data and follow-state together during server-side rendering. The follow-state helper is responsible for calling the organization follow-status endpoint and should be skipped whenever there is no authenticated session.

---

## Implementation Notes

1. Inspect the organization page data-loading flow and identify the follow-state fetch path.
2. Add a guard so the follow-state request is only executed when an auth token is present.
3. Ensure the page state handles the unauthenticated case gracefully.
4. Add a regression test around the organization page or the helper responsible for the follow-state fetch.

### Suggested implementation shape
- In the server-side props flow, only call the follow-state request when `auth_token` exists.
- If no token is present, return a neutral/default follow state instead of issuing the request.
- Keep the existing logged-in path unchanged.

---

## Verification Plan

- Manually verify the organization detail page as a guest user.
- Confirm that the follow-state request is no longer sent for unauthenticated visits.
- Confirm the page still loads normally and no related errors appear in the backend logs.
- Run the relevant frontend tests or linting checks after implementing the fix.

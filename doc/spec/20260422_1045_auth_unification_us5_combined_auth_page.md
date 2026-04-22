# US-5: Combined Auth Page — Email Entry Step

**Status**: DRAFT  
**Type**: Frontend — new page  
**Epic**: [EPIC: Auth Unification](./EPIC_auth_unification.md)  
**Date created**: 2026-04-22  
**Depends on**: US-2b (`POST /api/auth/check-email` — endpoint must be live)  
**Unblocks**: US-6 (OTP code entry), US-7 (password login option), US-8 (new user signup); US-6/US-7/US-8 can be built in parallel once this page skeleton with 3-path routing is in place.  
**Reuse context**: This page's email-entry step must be architected to be embedded as a modal component inside the event registration flow (EPIC: Event Registration — Phase 3). The page and the modal share the same email-entry logic; do not split them yet — establish the pattern here so US-6/US-7/US-8 can build on it.

---

## Problem Statement

Today, `/signin` and `/signup` are two separate pages. The combined `/login` page is a single entry point that:

1. Presents an email field.
2. Calls `POST /api/auth/check-email` to determine the user's status (`new` | `returning_password` | `returning_otp`).
3. Transitions to the correct next step **without navigating to a new URL** — the page stays at `/login` and changes its internal UI state.

The email-entry step is the first interaction in the flow. It must work correctly behind the `AUTH_UNIFICATION` feature toggle and must support hub theming (`?hub=`) and post-login redirect (`?redirect=`).

---

## Architecture: 3-Path State Machine

The page has **one URL** (`/login`) and **three internal UI states** driven by `user_status` from `check-email`:

```
┌─────────────────────────────────────────────────────────────┐
│  STEP: email_entry  (always the entry point)                │
│                                                             │
│  User enters email → POST /api/auth/check-email → user_status│
│                                                             │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │    "new"     │"returning_   │ "returning_  │            │
│  │             │ password"    │    otp"     │            │
│  │             │              │              │            │
│  │ → US-8 flow │ → US-7 flow  │ → US-6 flow  │            │
│  │   (signup)  │  (password   │   (OTP       │            │
│  │             │   login)     │   code)      │            │
│  └──────────────┴──────────────┴──────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

**Critical constraint**: no URL change when transitioning between states. This is a single-page state transition.

---

## Context Parameters (URL query params)

The page must read and preserve the following params throughout the flow:

| Param | Source | Purpose | Persisted where |
|-------|--------|---------|-----------------|
| `?hub=` | URL query | Hub theming key — passed to `getHubTheme()` in `getServerSideProps` | Passed as prop to theme components |
| `?redirect=` | URL query | Destination URL after successful auth — stored in `sessionStorage` on email submission, read back after `verify-token` succeeds | `sessionStorage` key: `auth_redirect_url` |

---

## Hub Theming Support

Hub theming follows the **same pattern as `/signin` and `/signup`** — server-side via `getServerSideProps`:

1. Read `hubSlug` from `ctx.query.hub`.
2. Call `getHubTheme(hubSlug)` to fetch theme data.
3. Apply `transformThemeData()` to produce a MUI theme override.
4. Wrap the page in a `ThemeProvider` with the custom theme.
5. Pass `hubThemeData` as a prop for components that need it (e.g. `CustomAuthImage`).

If `?hub=` is absent or the hub is not found, render with the default platform theme.

---

## Reuse Pattern (Modal Embedding for Event Registration)

The email-entry step (the form + `check-email` call + state routing) will later be extracted into a reusable component so it can be embedded inside the event registration modal. The architecture decision made here enables that extraction without rework:

- **The email-entry logic lives in a dedicated component** (e.g. `AuthEmailStep`) that is mounted by the `/login` page.
- **State is lifted to the page level**: the page owns `userStatus` state so the parent can control it when the component is reused elsewhere.
- **No hard-coded routing**: the component receives a callback (e.g. `onUserStatusDetermined(status)`) so the parent controls what happens after email is validated.

When extracting for the modal (future work — not in this story), the component is mounted with `onUserStatusDetermined` pointing to a handler that closes the modal and proceeds to registration. For the `/login` page, the handler transitions to the next step UI state.

This means US-5 does NOT extract the component yet — it only **structures the code so extraction is trivial later**. Do not over-engineer the abstraction; establish the pattern and let US-6/US-7/US-8 build the actual step components.

---

## Acceptance Criteria

- [ ] New page at `/frontend/pages/login.tsx` (file: `login.tsx` — note: singular, not `signin` or `signup`).
- [ ] Page is behind `AUTH_UNIFICATION` feature toggle (reads from `featureToggles` prop passed from `getServerSideProps`).
- [ ] If toggle is off, redirect to `/signin` (preserving `redirect` and `hub` params).
- [ ] `getServerSideProps` fetches hub theme data when `?hub=` is present — same pattern as `/signin` and `/signup`.
- [ ] Email input: labeled, required, type="email", lowercased on submit.
- [ ] On email submit: call `POST /api/auth/check-email` with `{ email: lowercase(email) }`.
- [ ] Handle loading state during API call (disable button, show spinner).
- [ ] Handle error state: display backend error message inline below the form.
- [ ] On success: transition internal UI state based on `user_status` — no URL change:
  - `"new"` → show signup step 1 (placeholder UI; actual form implemented in US-8).
  - `"returning_password"` → show password field (placeholder; implemented in US-7).
  - `"returning_otp"` → show OTP code entry (placeholder; implemented in US-6).
- [ ] `?redirect=` param is stored in `sessionStorage` under key `auth_redirect_url` immediately after `check-email` succeeds, before transitioning UI state.
- [ ] Page renders correctly on mobile (single column), tablet, and desktop (split layout with auth image — same as `/signin`).
- [ ] Accessibility: email input has `aria-label`, button has `aria-busy` during loading, error messages use `role="alert"`.
- [ ] "Back" button on each downstream step returns to the email-entry state.
- [ ] Tests: page renders, email lowercasing, loading state, error state, state transitions for each `user_status` value, sessionStorage write, toggle off redirects to `/signin`.

---

## UI Component Inventory

### `login.tsx` — page component

**Props**: `hubThemeData`, `hubSlug`, `isEnabled`

**States**:
- `emailEntry` — initial state with email form
- `signupStep1` — placeholder for new user (name + location) — implemented in US-8
- `passwordLogin` — placeholder for returning password user — implemented in US-7
- `otpEntry` — placeholder for returning OTP user — implemented in US-6

**Owns**: `userStatus` state, `email` state, `sessionKey` state (from `request-token` — consumed by US-6)

**Layout**: `WideLayout` + `ThemeProvider` for hub theming + `ContentImageSplitView` with `CustomAuthImage` on desktop — same split layout used by `/signin` and `/signup`. Duplication of layout code is acceptable; do not create reusable wrappers if the existing components don't offer clean extraction points.

### `AuthEmailStep` — component (internal, extracted pattern for reuse)

**Purpose**: The email entry form + `check-email` call + state transition trigger.  
**Location**: `frontend/src/components/auth/AuthEmailStep.tsx` (new file).  
**Props**:
```ts
interface AuthEmailStepProps {
  onUserStatusDetermined: (status: "new" | "returning_password" | "returning_otp", email: string, sessionKey?: string) => void;
  redirectUrl?: string;
  hubUrl?: string;
}
```

**Note**: US-5 creates the file with the email-entry logic. US-6/US-7/US-8 will call this component from within their step UIs (the back button returns to `AuthEmailStep` state). The component is not yet exported for reuse outside the `/login` page — that's Phase 3 of Event Registration work.

---

## Step-by-Step Implementation Plan

### Step 1 — Scaffold page and routing

Create `frontend/pages/login.tsx`. Use `WideLayout` + `ThemeProvider` for hub theming + `ContentImageSplitView` with `CustomAuthImage` on desktop — same split layout as `/signin` and `/signup`. On mobile, the layout collapses to a single-column form (handled by the existing `useMediaQuery` pattern in the components). Follow the same responsive breakpoints as the existing auth pages. Duplication is acceptable; do not refactor existing components. Implement `getServerSideProps`:

1. Call `getFeatureTogglesFromRequest(ctx.req)`.
2. If `AUTH_UNIFICATION` toggle is off, redirect to `/signin` preserving params.
3. If `?hub=` is present, call `getHubTheme(hubSlug)` and pass theme data.
4. Return `hubThemeData`, `hubSlug`, `featureToggles` as props.

Create placeholder step states (`signupStep1`, `passwordLogin`, `otpEntry`) that each show a simple "coming soon" message with a back button returning to email entry. This allows US-6/US-7/US-8 to be built in parallel against the placeholder — they just wire up their actual UI in place of the placeholder.

### Step 2 — Email entry component

Create `frontend/src/components/auth/AuthEmailStep.tsx`.

Props: `onUserStatusDetermined`, `redirectUrl`, `hubUrl`.

Implementation:
- Email input field (lowercases on submit).
- Calls `axios.post("/api/auth/check-email", { email })`.
- On success: stores `redirectUrl` in `sessionStorage` as `auth_redirect_url`; calls `onUserStatusDetermined(status, email)`.
- Loading state: button disabled, spinner.
- Error state: `role="alert"` message below form.
- "Forgot password?" link → `/resetpassword?email={email}` (preserves email for pre-fill on the reset page).

### Step 3 — Wire step state machine

In `login.tsx`:
- `useState` for `currentStep` (initial: `"email_entry"`).
- Render `AuthEmailStep` when `currentStep === "email_entry"`.
- Each step component receives `onBack` callback that sets `currentStep` back to `"email_entry"`.
- Pass `hubThemeData` and `hubSlug` to each step component for theming.

### Step 4 — Test setup

Add Jest tests in `frontend/pages/__tests__/login.test.tsx` (or inline if no test directory exists yet). Use `@testing-library/react`. Mock `check-email` endpoint responses for each `user_status` case.

---

## Non-Negotiable Constraints

1. **No URL change on state transitions** — use `useState`, not `router.push`.
2. **`redirect_url` written to `sessionStorage` before state transition** — prevents losing the redirect if the user closes the tab before completing auth.
3. **Email lowercased client-side** before sending to backend — consistent with existing `/signin` behaviour.
4. **Hub theming fetched server-side in `getServerSideProps`** — same pattern as existing auth pages.
5. **Feature toggle checked server-side, not client-side** — avoids hydration mismatch and ensures toggle is enforced at the edge.
6. **"Back" always returns to email entry** — not to some intermediate state; keeps the flow simple and re-entry safe.

---

## Resolved Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Page location | `frontend/pages/login.tsx` | Consistent with existing auth pages (`signin.tsx`, `signup.tsx`) — singular "login" aligns with the unified flow name. |
| Component namespace | `frontend/src/components/auth/` (new directory) | New auth-specific namespace; existing `src/components/signup/Login.tsx` is used by `/signin` and will not be touched during Phase A. |
| `sessionKey` storage | Lifted to page level state | `AuthEmailStep` does not store `sessionKey`; when US-6 mounts the OTP step, it reads `sessionKey` from page state (set during `request-token`). Avoids prop drilling and keeps the email step generic. |
| Locale prefix | `getLocalePrefix(ctx.locale)` | Same pattern as `/signin` and `/signup`; redirect in `getServerSideProps` builds destination as `${getLocalePrefix(ctx.locale)}/login`. |

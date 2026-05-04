# Guest Event Registration with Auth Integration

**Status**: COMPLETED  
**Type**: Feature  
**Date created**: 2026-04-30  
**Epic**: [EPIC: Event Registration](./EPIC_event_registration.md) — Phase 3  
**Depends on**:
- [EPIC: Auth Unification](./EPIC_auth_unification.md) Phase A (US-5 through US-8) — combined auth page, OTP flow, password login, and new-user signup must all be implemented and live.
- Event Registration Phase 2 — `EventRegistrationModal` and `POST /api/projects/{slug}/register/` must exist.

**Unblocks**: Production toggle flip for `EVENT_REGISTRATION`.

---

## Problem Statement

Today, a guest who clicks "Register" on an event sees the `EventRegistrationModal` with a placeholder message: "signup flow coming soon". The modal has a stub unauthenticated flow (email → legacy password login) but no way for a new user to create an account and complete registration without leaving the event page.

The Auth Unification epic delivered a complete combined login/signup flow at `/login` with OTP-based authentication. That flow is page-based and requires users to navigate away from the event, losing context. For event registration, the auth flow must happen **inside the existing modal** so the user never leaves the event page, and registration must complete **automatically** once authentication succeeds.

### Business Reason

This is the final go-live blocker for Event Registration. Without it, unregistered visitors cannot sign up for events — the primary conversion goal of the feature. The friction of forcing guests to navigate to a separate signup page, create an account, then find the event again, would drop conversion by an order of magnitude.

---

## Core Requirements

### Three Scenarios

| # | Scenario | User State | Flow |
|---|----------|------------|------|
| 1 | Already logged in | `user` exists in `UserContext` | Show registration confirmation directly (existing behaviour — no changes). |
| 2 | Returning user, not logged in | No `user`; email exists in DB | Combined auth flow inside modal: email → password login OR OTP code → auto-register. |
| 3 | New user, not logged in | No `user`; email unknown | Streamlined signup inside modal: email → personal info → OTP code → auto-register. **Interest-topic selection (step 2 of the standalone signup flow) is skipped** to keep the flow minimal. |

### Scenario 1 — Authenticated (existing behaviour, preserved)

No changes. The modal continues to show the user's profile preview, the event name, and a "Confirm registration" button. Clicking it calls `POST /api/projects/{slug}/register/`.

### Scenario 2 — Returning User (new)

1. Guest clicks "Register now" on an event.
2. `EventRegistrationModal` opens.
3. Because `user` is null, the modal shows the combined auth entry point: an email field + "Continue" button.
4. On submit, the modal calls `POST /api/auth/check-email`.
5. If `user_status` is `"returning_password"`, show the password login form (same component and API as `/login`). Include a "Use a code instead" link that switches to OTP.
6. If `user_status` is `"returning_otp"`, send OTP and show the 6-digit code entry form (same component and API as `/login`).
7. On successful auth (`signIn` completes), the modal detects that `user` is now present and **automatically** transitions to the registration confirmation step (same as Scenario 1).
8. The user sees their profile preview and the "Confirm registration" button — one tap to finish.

### Scenario 3 — New User (new)

1. Steps 1–3 same as Scenario 2.
2. On submit, `POST /api/auth/check-email` returns `"new"`.
3. Show the personal-info collection step (first name, last name, location, terms acceptance) — reuse the component from the standalone `/login` signup flow.
4. On submit, create the account via `POST /signup/` **without a password and without interest sectors** (backend already supports passwordless signup for OTP users).
5. After account creation succeeds, automatically request an OTP code (`POST /api/auth/request-token`) and show the 6-digit code entry form.
6. On successful OTP verification (`POST /api/auth/verify-token`), `signIn` completes. The modal detects `user` is present and transitions to the registration confirmation step.
7. User confirms registration.

### Critical UX Constraint: Skip Interest Topics for Event Signup

The standalone signup flow at `/login` asks new users to select interest sectors after personal info. **When signing up via the event registration modal, this step must be omitted.** The rationale is to minimise friction for a context-specific conversion (registering for an event). Users can always complete their profile interests later from account settings.

---

## Non-Functional Requirements

- **Zero page navigations**: the entire auth + registration flow must stay inside `EventRegistrationModal`. The browser URL must not change.
- **Context preservation**: if the user closes the modal mid-auth and re-opens it, the flow resets to the email entry step (same as today).
- **Accessibility**: all auth sub-steps must maintain ARIA labels, focus management, and keyboard navigation already established in the `/login` components.
- **Error handling**: network errors, validation errors, and OTP errors must display inline within the modal, not as page-level alerts.
- **Rate limiting**: reuse the same rate-limit behaviour as the `/login` page (429 responses displayed as inline messages).
- **Feature toggle**: `EVENT_REGISTRATION` gates the entire modal. `AUTH_UNIFICATION` is a prerequisite (deployed before or alongside this feature) — the modal assumes the combined auth flow is available.
- **Backward compatibility**: existing users with passwords must be able to log in through the modal without any migration.

---

## AI Agent Insights and Additions

### Component Reuse Analysis

The `/login` page is built from discrete step components that are already designed for reuse:

| Component | Used in `/login` | Reusable in modal? | Notes |
|-----------|------------------|-------------------|-------|
| `AuthEmailStep` | Email entry | ✅ Yes | Pure presentational + API call; accepts `onUserStatusDetermined` callback. No changes needed. |
| `AuthPasswordLogin` | Password login | ✅ Yes | Accepts `onSuccess` callback; calls `signIn` internally. No changes needed. |
| `AuthOtp` | OTP code entry | ✅ Yes | Accepts `onSuccess` callback; manages `sessionStorage` session key. No changes needed. |
| `SignupPersonalInfoStep` | Personal info | ✅ Yes | Pure form component; accepts `onContinue` callback. No changes needed. |
| `AuthSignupStep` | Orchestrates signup | ⚠️ Partial | Currently hard-codes the two-step flow (personal → interests). For modal reuse, either (a) add a `skipInterests` prop, or (b) extract a new `AuthSignupMinimalStep` that stops after personal info and calls `/signup/` directly. |

**Recommended approach**: add a `skipInterests?: boolean` prop to `AuthSignupStep` (default `false`). When `true`, the component transitions directly from `SignupPersonalInfoStep` to account creation, omitting `SignupInterestsStep`.

### Auto-Registration After Auth Success

The modal's state machine currently switches content based on `user` presence (`UserContext`). When `signIn()` updates the context, React re-renders the modal. The modal should distinguish between:
- `user` present + registration not yet submitted → show confirmation step
- `user` present + registration already submitted → show success step

A small piece of local state (`registrationState`) inside the modal is sufficient: `"auth" | "confirm" | "submitting" | "success" | "error"`.

### Backend Considerations

No new backend endpoints are required. The existing endpoints are sufficient:
- `POST /api/auth/check-email` — user status lookup
- `POST /api/auth/request-token` — OTP delivery
- `POST /api/auth/verify-token` — OTP verification + Knox token issuance
- `POST /login/` — password login (backward compat)
- `POST /signup/` — account creation (already supports passwordless)
- `POST /api/projects/{slug}/register/` — event registration (already requires auth)

The `/signup/` endpoint already treats `sectors` (interest topics) as optional — no backend change is required to omit this field. This aligns with the design decision to keep the interests step separate and optional in the standalone signup flow.

---

## System Impact

- **Actors involved**:
  - `Guest` (unauthenticated visitor): Can now register for events by creating an account inside the modal.
  - `Returning Member` (has account but not logged in): Can log in via password or OTP inside the modal.
  - `Authenticated Member`: No change — continues to use the direct confirmation flow.
- **Actions to implement**:
  - `Guest` → `View Event` → `Click Register` → `Enter Email` → `Complete Auth` → `Confirm Registration` → `Success`
- **Flows affected**:
  - **Event Registration Flow** (unauthenticated branch): replaces placeholder with full combined auth + auto-registration.
  - **Combined Auth Flow**: components are reused; no functional change to `/login` page.
- **Entity changes needed**: None.
- **Flow changes needed**: Yes — the unauthenticated branch of `EventRegistrationModal` is rebuilt.
- **Integration changes needed**: No.

---

## Software Architecture

### Frontend: Modal State Machine

The `EventRegistrationModal` unauthenticated content is replaced by a state machine that embeds the auth step components:

```
┌─────────────────────────────────────────────────────────────┐
│  EventRegistrationModal (unauthenticated user)              │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  auth_step: "email"                                 │   │
│  │  → AuthEmailStep                                    │   │
│  │     → onUserStatusDetermined("new", email)          │   │
│  │     → onUserStatusDetermined("returning_password", email) │   │
│  │     → onUserStatusDetermined("returning_otp", email)│   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│          ┌───────────────┼───────────────┐                  │
│          ▼               ▼               ▼                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ auth_step:   │ │ auth_step:   │ │ auth_step:   │        │
│  │ "signup"     │ │ "password"   │ │ "otp"        │        │
│  │ → AuthSignup │ │ → AuthPass-  │ │ → AuthOtp    │        │
│  │   Step       │ │   wordLogin  │ │              │        │
│  │   (skipInter-│ │              │ │              │        │
│  │   ests=true) │ │              │ │              │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│          │               │               │                  │
│          └───────────────┴───────────────┘                  │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  user now present in UserContext                     │   │
│  │  → render authenticated confirmation step            │   │
│  │  → "Confirm registration" button calls /register/    │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  registration_state: "success"                       │   │
│  │  → show success message (existing)                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Key design points**:
- `auth_step` is local state inside `EventRegistrationModal` (not a URL parameter).
- When `user` becomes non-null, the modal ignores `auth_step` and renders the authenticated content.
- `AuthSignupStep` (when `skipInterests=true`) calls `/signup/` with `sectors: []` (or omits the field), then immediately triggers `onSignupComplete`, which causes the parent to transition to the OTP step.

### API Surface (no new endpoints)

| Endpoint | Method | Caller | Notes |
|----------|--------|--------|-------|
| `POST /api/auth/check-email` | POST | `AuthEmailStep` | Reused exactly as in `/login`. |
| `POST /api/auth/request-token` | POST | `AuthOtp` (on mount / resend) | Reused exactly as in `/login`. |
| `POST /api/auth/verify-token` | POST | `AuthOtp` (on submit) | Reused exactly as in `/login`. |
| `POST /login/` | POST | `AuthPasswordLogin` | Reused exactly as in `/login`. |
| `POST /signup/` | POST | `AuthSignupStep` | Must accept omitted or empty `sectors`. |
| `POST /api/projects/{slug}/register/` | POST | `EventRegistrationModal` | Already exists; called after `user` is present. |

### Toggle Gating

The modal is gated by `EVENT_REGISTRATION` only. `AUTH_UNIFICATION` is a hard prerequisite — it will be deployed before or alongside this feature, so the modal can assume the combined auth endpoints and components are available. There is no legacy fallback path inside the modal.

---

## Acceptance Criteria

- [ ] `EventRegistrationModal` unauthenticated content uses `AuthEmailStep` for email entry.
- [ ] `check-email` returns `"new"` → modal shows `SignupPersonalInfoStep` (reused component).
- [ ] `check-email` returns `"returning_password"` → modal shows `AuthPasswordLogin` (reused component) with "Use a code instead" link.
- [ ] `check-email` returns `"returning_otp"` → modal shows `AuthOtp` (reused component) after auto-requesting token.
- [ ] New-user signup inside modal **does not ask for interest sectors** — account is created after personal info only.
- [ ] After successful account creation (new user) or successful login/OTP (returning user), `signIn()` updates `UserContext`.
- [ ] Modal detects authenticated user and transitions to registration confirmation (profile preview + "Confirm registration" button).
- [ ] Clicking "Confirm registration" calls `POST /api/projects/{slug}/register/` and shows success state.
- [ ] If registration API fails after auth success, show error state with "Try again" button (reuses existing error UI).
- [ ] "Back" navigation works within each auth sub-step and returns to email entry.
- [ ] Modal close button resets auth state so reopening starts fresh at email entry.
- [ ] `EVENT_REGISTRATION` toggle gates the modal. `AUTH_UNIFICATION` is a hard prerequisite — the modal assumes combined auth is available.
- [ ] All existing tests for `EventRegistrationModal` pass; new tests cover the three unauthenticated scenarios (new user, returning password, returning OTP).
- [ ] Rate-limit errors (429) from any auth endpoint display inline within the modal.

---

## Design Decisions (Confirmed)

### No Post-Auth Redirect

The user never leaves the event page. After auth success inside the modal, the modal transitions to the registration confirmation step. After the user confirms and registration succeeds, the modal closes and the page updates the button state via the existing `onRegistrationSuccess` callback. No browser navigation or redirect occurs at any point.

### Implicit Account Verification

New users who sign up via the event registration modal are verified by OTP entry — the same mechanism as the standalone `/login` flow. `POST /signup/` creates an unverified account, and successful `POST /api/auth/verify-token` both authenticates the user and marks the email as verified. No separate verification email is sent.

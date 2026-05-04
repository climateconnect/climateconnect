# US-7: Password Login Option (Backward Compatibility)

**Status**: COMPLETED  
**Type**: Frontend — step component (pure frontend; backend endpoint exists unchanged)  
**Epic**: [EPIC: Auth Unification](./EPIC_auth_unification.md)  
**Date created**: 2026-04-23  
**Depends on**: US-2b (`POST /api/auth/check-email` — live), US-3 (`POST /api/auth/request-token` — live), US-5 (combined `/login` page with 3-path state machine — implemented)  
**Parallelisable with**: US-8 (new user signup)

---

## Problem Statement

When `POST /api/auth/check-email` returns `returning_password`, the `/login` page must present a password field within the same page state. This is the backward-compatibility path for existing users who have a password set on their account.

The user should be able to authenticate using their existing password — with zero friction compared to the old `/signin` page. They must also have an easy escape hatch to switch to OTP login if they prefer not to type their password (or have forgotten it).

This story replaces the placeholder stub in `AuthPasswordLogin.tsx` with a fully working component. No changes are needed to the backend or to any other part of `login.tsx` beyond adding a single new prop.

---

## Architecture

### Placement within `/login` page

`AuthPasswordLogin` is already imported and wired in `login.tsx`. The state machine transitions to `"password_login"` when `handleUserStatusDetermined` receives `"returning_password"`. The component is rendered via `commonProps`:

```
email_entry (US-5)
    │
    │ check-email returns "returning_password"
    ▼
password_login (US-7)   ← implement this stub
    │
    ├─► POST /login/  ────► signIn(token, expiry)
    │                        page-level useEffect detects user → redirect
    │
    ├─► "Forgot password?" ─► /resetpassword?email={email}  (existing page, no changes)
    │
    └─► "Use a code instead" ─► onSwitchToOtp()
                                  parent sets step to "otp_entry"
                                  AuthOtp mounts and auto-calls request-token
```

### Redirect on success

`login.tsx` already contains a `useEffect` that fires when `user` is set in context:

```
if (user) {
  const destination = redirectUrl || getLocalePrefix(locale || "en") + "/";
  router.push(destination);
}
```

`AuthPasswordLogin` triggers this by calling `signIn(token, expiry)` from `UserContext` — the same mechanism used by the existing `/signin` page. No additional `onSuccess` callback is needed in `login.tsx` for the redirect.

### "Use a code instead" transition

`AuthPasswordLogin` receives an `onSwitchToOtp` callback from the parent. When the user clicks "Use a code instead":

1. `onSwitchToOtp()` is called.
2. Parent (`login.tsx`) sets `currentStep` to `"otp_entry"`.
3. `AuthOtp` mounts and calls `POST /api/auth/request-token` automatically on mount (per US-6 design).

No `request-token` call inside `AuthPasswordLogin` itself. The transition is a pure state change; `AuthOtp` owns its own token request lifecycle.

---

## API Contract (exists — documented for frontend reference)

### `POST /login/`

Endpoint: existing, unchanged. Used by the current `/signin` page.

**Request**: `{ username: string, password: string }` — `username` is the email (lowercased)  
**Success response (200)**: `{ token: string, expiry: string }`  
**Failure responses**:

| HTTP | `response.data` shape | Meaning |
|------|-----------------------|---------|
| 400 | `{ message: string }` | Wrong password or generic login error |
| 400 | `{ type: "not_verified", message: string }` | Account exists but email not verified |

The component must handle the `not_verified` case distinctly — show a specific message with an option to resend the verification email (or direct user to check inbox), same as the old `/signin` page.

---

## Component: `AuthPasswordLogin`

**Location**: `frontend/src/components/auth/AuthPasswordLogin.tsx` (already exists — implement in place; replace the placeholder body)

**Updated interface**:

```ts
interface AuthPasswordLoginProps {
  email: string;
  onBack: () => void;
  hubUrl?: string;
  onSwitchToOtp: () => void;  // NEW — triggers OTP path for this email
}
```

**State owned**:

- `password` — controlled input value
- `isLoading` — true while `POST /login/` is in-flight
- `errorMessage` — display string for failed login; `null` when clean

**Does NOT own**:

- Redirect logic — handled by page-level `useEffect` in `login.tsx` reacting to `user` context
- `sessionKey` — not relevant to this component
- Step transitions beyond "back" and "switch to OTP"

---

## `login.tsx` Changes

`AuthPasswordLogin` in `login.tsx` currently receives only `commonProps` (`email`, `onBack`, `hubUrl`). Add the new `onSwitchToOtp` prop when rendering the `password_login` case.

Add a handler in `login.tsx`:

```
handleSwitchToOtp: () => setCurrentStep("otp_entry")
```

Pass it as `onSwitchToOtp` when rendering `AuthPasswordLogin`. No other changes to `login.tsx` are required.

---

## UI Behaviour

### Initial render

- Display the user's email as read-only text (not a field — they returned from the email step; show it for context and reassurance).
- Render a password input field.
- Render a "Log in" submit button.
- Render "Forgot password?" as a text link.
- Render "Use a code instead" as a secondary text link.
- Render a "Back" button or back-chevron to return to email entry.

### On submit

1. Validate: password field must not be empty. Show inline error if empty — do not call the API.
2. Show loading state: disable input and button, show spinner in button.
3. Call `POST /login/` with `{ username: email.toLowerCase(), password }`.
4. On success: call `signIn(token, expiry)` from `UserContext`. The page-level `useEffect` handles redirect.
5. On failure: show error message inline; clear the password field; re-enable input and button.

### "Forgot password?" link

Links to `/resetpassword` with the email prefilled as a query param — `?email={encodeURIComponent(email)}` — so the reset page can pre-populate the email input. No changes to the reset password flow itself.

### "Use a code instead"

Calls `onSwitchToOtp()`. No confirmation dialog. The transition is immediate. `AuthOtp` will mount and send the code automatically.

### "Back" button

Calls `onBack()`. Returns to email entry. Password field is discarded.

---

## Error Handling

| Condition | Display | Behaviour |
|-----------|---------|-----------|
| Empty password on submit | "Please enter your password." | Shown inline; API not called |
| Wrong password (`400`, no `type`) | `error.response.data.message` (from backend) | Shown inline; password cleared |
| Account not verified (`400`, `type: "not_verified"`) | `texts.not_verified_error_message` (existing key) | Shown inline; password cleared |
| Rate limited (`429`) | "Too many attempts. Please try again later." | Shown inline |
| Network / unexpected error | "Something went wrong. Please try again." | Shown inline; password cleared |

All error messages rendered via MUI `Alert` component with `severity="error"` and `role="alert"`.

---

## Accessibility

- Password input: `type="password"`, `aria-label` matches visible label text, `autoComplete="current-password"`
- Submit button: `aria-busy={isLoading}` while loading
- Error messages: `role="alert"` on `Alert` component
- "Use a code instead" link: keyboard-focusable, not just a `div`

---

## Reuse Context

`AuthPasswordLogin` is used only within the `/login` page (Phase A). It is **not** planned for modal embedding in the event registration flow (the event registration modal will funnel new users through OTP only — no password path). Keep the component self-contained; no over-engineering for future reuse.

---

## Acceptance Criteria

- [ ] `AuthPasswordLogin.tsx` stub replaced with full implementation — no new files required
- [ ] `login.tsx` updated to pass `onSwitchToOtp` prop to `AuthPasswordLogin`
- [ ] User's email displayed as read-only context above the password field
- [ ] Password input: `type="password"`, labeled, `autoComplete="current-password"`
- [ ] On submit: `POST /login/` called with `{ username: email.toLowerCase(), password }`
- [ ] On success: `signIn(token, expiry)` called from `UserContext`; page-level `useEffect` handles redirect — no `router.push` inside the component
- [ ] On failure: error message shown via `Alert role="alert"`; password field cleared; submit button re-enabled
- [ ] `not_verified` error type handled explicitly using existing `texts.not_verified_error_message` key
- [ ] Loading state: input and button disabled, spinner shown in button, `aria-busy` set
- [ ] "Forgot password?" link navigates to `/resetpassword?email={encodeURIComponent(email)}`
- [ ] "Use a code instead" link calls `onSwitchToOtp()` — no API call inside the component
- [ ] "Back" button calls `onBack()` — returns to email entry
- [ ] All user-facing strings sourced from `getTexts({ page: "profile", locale, hubName: hubUrl })`
- [ ] Tests: renders with email displayed, password submit success, submit failure (wrong password, not verified, network error), empty-password validation, "forgot password" link href, "use a code instead" callback, "back" callback

---

## Non-Negotiable Constraints

1. **No changes to `POST /login/` endpoint** — backward compatibility requires this endpoint to stay untouched.
2. **No changes to the reset password flow** — "Forgot password?" links to the existing `/resetpassword` page without modification.
3. **Email lowercased client-side** before sending as `username` — consistent with the existing `/signin` page behaviour.
4. **Redirect handled at page level only** — `AuthPasswordLogin` must not call `router.push`; it calls `signIn()` and trusts the `user`-watching `useEffect` in `login.tsx`.
5. **No `request-token` call in this component** — the OTP transition is entirely managed by `onSwitchToOtp()` callback + `AuthOtp` mounting.

---

## Resolved Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Redirect ownership | Page-level `useEffect` reacting to `user` context | `login.tsx` already has this wired; adding `onSuccess` would be redundant and create a double-redirect risk when `user` is also set |
| `onSwitchToOtp` placement | Separate prop, not in `commonProps` | Only `AuthPasswordLogin` needs it; adding it to `commonProps` would pollute the interface for `AuthOtp` and `AuthSignupStep` |
| OTP trigger ownership | `AuthOtp` calls `request-token` on mount | Consistent with US-6 design; `AuthPasswordLogin` has no knowledge of the OTP flow internals |
| "Forgot password?" email prefill | `?email=` query param | Best-effort UX improvement; the reset page already exists and the email field is shown there |
| Email display | Read-only text, not an input | User already entered the email; repeating it as an input invites confusion about whether changing it does anything |


# US-6: OTP Code Entry + Resend

**Status**: READY FOR IMPLEMENTATION  
**Type**: Frontend — step component (pure frontend; backend endpoints exist)  
**Epic**: [EPIC: Auth Unification](./EPIC_auth_unification.md)  
**Date created**: 2026-04-22  
**Depends on**: US-3 (`POST /api/auth/request-token` — endpoint exists), US-4 (`POST /api/auth/verify-token` — endpoint exists), US-5 (combined `/login` page skeleton with 3-path state machine)

---

## Problem Statement

The `/login` page transitions to an OTP code entry state when `check-email` returns `returning_otp`. This step must:

1. Call `POST /api/auth/request-token` to send the 6-digit code to the user's email.
2. Show a 6-digit input field.
3. Call `POST /api/auth/verify-token` on submit.
4. On success: call `signIn()` from `UserContext`, read `redirect_url` from `sessionStorage`, and redirect.
5. Provide a "Resend" button with a 60-second cooldown.
6. Handle error states: expired code, max attempts reached, session mismatch.

This step is the **OTP path** for existing users who have opted into passwordless login.

---

## Architecture

### Placement within `/login` page

The `AuthOtp` component (already named, currently with stub content) is already wired in `login.tsx`. Implement the OTP logic inside the existing `AuthOtp` component. The state machine in `login.tsx` already passes:
- `email` — the email address to send the code to
- `onBack` — callback to return to email-entry state

### Flow

```
email_entry (US-5)
    │
    │ check-email returns "returning_otp"
    ▼
otp_entry (US-6)
    │
    ├─► POST /api/auth/request-token  ──► store session_key in sessionStorage
    │                                     Show 6-digit code input
    │
    ├─► user enters code → POST /api/auth/verify-token
    │       │
    │       ├─ success → signIn(token, expiry) → read auth_redirect_url → redirect
    │       │
    │       └─ failure → show error message (attempts remaining / expired / locked)
    │
    └─► "Resend code" button (enabled after 60s countdown)
            └─► POST /api/auth/request-token → new session_key → clear input
```

---

## API Contracts (exist — documented for frontend reference)

### `POST /api/auth/request-token`

**Request**: `{ email: string }`  
**Response**: `{ session_key: string }`  
**Always HTTP 200** (user enumeration prevention)  
**Rate limit**: 3 requests per email per 10 minutes; 60s cooldown between requests  
**Side effect**: sends 6-digit code via email

### `POST /api/auth/verify-token`

**Request**: `{ session_key: string, code: string }`  
**Success response (200)**: `{ token: string, expiry: string, user: UserObject }`  
**Failure response (401)**: `{ detail: string }` — messages:
- "Code expired. Please request a new one." — expired token
- "Too many attempts. Please request a new code." — attempt_count ≥ 5
- "Invalid code." — hash mismatch

---

## Component: `AuthOtp`

**Location**: `frontend/src/components/auth/AuthOtp.tsx` (already exists with stub content — implement in place)  
**Props**:
```ts
interface AuthOtpProps {
  email: string;
  onBack: () => void;
  onSuccess: (user: UserObject) => void;
  hubUrl?: string;
}
```

**State owned**:
- `sessionKey` — from `request-token` response, stored in component state + `sessionStorage`
- `code` — the 6-digit input value
- `isLoading` — submitting to `verify-token`
- `resendCountdown` — seconds remaining until resend is enabled (null when enabled)
- `errorMessage` — display string for failures

**sessionStorage key**: `auth_session_key` (key name consistent with EPIC security model)

**Redirect owned by parent** — `AuthOtp` does not call `router.push`. On `verify-token` success it calls `onSuccess(user)` and lets the parent (`login.tsx`) handle redirect. This mirrors the `redirectUrl` pattern from US-5 and keeps the component reusable for the event registration modal.

---

## Implementation Details

### Step 1 — Trigger `request-token` on mount

On component mount, immediately call `POST /api/auth/request-token` with the email from props. This is different from the US-5 flow where the email step is user-initiated — here the transition to OTP state implies the user wants to log in, so we start the flow automatically.

Store the returned `session_key` in component state and `sessionStorage`.

### Step 2 — 6-Digit Code Input

Render a single `TextField` or custom 6-character input. Options:
- **6 separate single-character inputs** (one per digit) — better UX, more complex state management
- **Single text field with 6-character max** — simpler, less code, acceptable for this use case

For US-6, use a **single `TextField` with `maxLength={6}`, `inputType="text"`, `autoComplete="one-time-code"`** — simple and meets WCAG requirements. Can be upgraded to 6 separate inputs in a later refinement if UX testing shows it.

### Step 3 — Submit to `verify-token`

On form submit (Enter key or button click):
1. Disable input, show spinner in submit button.
2. Call `POST /api/auth/verify-token` with `{ session_key, code }`.
3. On success: extract `token` and `expiry` from response, call `signIn(token, expiry)` from `UserContext`.
4. Read `auth_redirect_url` from `sessionStorage` — if present, `router.push(redirectUrl)`; otherwise `router.push(home)`.
5. On failure: parse error message to determine what to show:
   - `"Code expired"` → `expiredMessage` + resend countdown auto-starts
   - `"Too many attempts"` → `lockedMessage` + resend countdown auto-starts  
   - `"Invalid code"` → `invalidMessage` + `attemptsRemaining` counter (from `attempt_count` in response if exposed, otherwise generic "try again")
6. Clear input field after any failure.

### Step 4 — Resend Button

Render a "Resend code" text button with a visible countdown:
- "Resend code (60s)" — button disabled, countdown ticks every second
- "Resend code" — button enabled, calls `request-token` again
- New `session_key` overwrites previous in state and `sessionStorage`
- Input field cleared
- Countdown resets to 60s

The countdown uses `setInterval` with cleanup in `useEffect` return.

### Step 5 — Back Button

"Back" button (top-left or above the form) calls `onBack()` — returns to `email_entry` state in the parent page. Clears `session_key` from `sessionStorage`.

---

## Error Handling

| Error message from backend | Display string | Behaviour |
|---|---|---|
| `"Code expired. Please request a new one."` | "This code has expired. Please request a new one." | Resend countdown auto-starts |
| `"Too many attempts. Please request a new code."` | "Too many attempts. Please request a new code." | Resend countdown auto-starts |
| `"Invalid code."` | "Incorrect code. You have {n} attempts remaining." | Input cleared, user can retry |
| Rate limited (429) | "Please wait before requesting a new code." | Resend button stays disabled until cooldown expires |
| Network error | "Connection error. Please try again." | Input cleared, retry allowed |

---

## Accessibility

- Code input: `aria-label="6-digit code"`, `inputMode="numeric"`, `maxLength={6}`
- Resend button: `aria-disabled` when countdown is active, includes live countdown text
- Error messages: `role="alert"` on the `Alert` component
- Loading state: `aria-busy` on the form, submit button shows spinner

---

## Reuse Context

The `AuthOtp` component is designed to be reusable as part of the event registration modal (EPIC: Event Registration Phase 3). Key design decisions that enable this:

1. **No hard-coded routing** — on success, the component calls `onSuccess(user)` callback. For the `/login` page, this callback handles `router.push` with `sessionStorage auth_redirect_url`. For the event registration modal, it closes the modal and proceeds to registration.
2. **`email` prop** — the component receives the email rather than storing it, so the parent (page or modal) owns that identity.
3. **`onBack` prop** — parent controls what "back" means. In the page it returns to email entry; in the modal it could close the modal.

---

## Acceptance Criteria

- [ ] `AuthOtp.tsx` is already wired in `login.tsx` state machine — implement the OTP logic in place of the stub content
- [ ] On mount: `POST /api/auth/request-token` called, `session_key` stored in `sessionStorage` key `auth_session_key`
- [ ] 6-digit code input: labeled "Enter your code", `maxLength={6}`, `inputMode="numeric"`
- [ ] On submit: `POST /api/auth/verify-token` called with `{ session_key, code }`
- [ ] On success: `signIn(token, expiry)` called from `UserContext`; `onSuccess(user)` callback invoked — parent (`login.tsx`) reads `auth_redirect_url` from `sessionStorage` and handles redirect
- [ ] On failure: appropriate error message shown; input cleared; attempts remaining displayed if available
- [ ] "Resend" button: disabled for 60s with visible countdown; calls `request-token` again; clears input; updates `session_key` in state + `sessionStorage`
- [ ] "Back" button: calls `onBack`, clears `session_key` from `sessionStorage`
- [ ] Loading state: input disabled, submit button shows spinner, resend button disabled
- [ ] Error messages use `role="alert"` via MUI `Alert` component
- [ ] `hubUrl` prop passed through for hub-aware theming (text translations)
- [ ] i18n: all user-facing strings come from `getTexts()` with `page: "profile"`
- [ ] Tests: code input, submit, success redirect, failure with error messages, resend countdown, back navigation

---

## Step-by-Step Implementation Plan

### Step 1 — Replace placeholder

The `AuthOtp` component is already wired in `login.tsx` with `email`, `onBack`, `hubUrl` props. Implement the OTP logic inside the existing component — no import changes needed.

### Step 2 — Request token on mount

In `useEffect` with empty deps, call `apiRequest({ method: "post", url: "/api/auth/request-token", payload: { email } })`. Store `session_key` in component state and `sessionStorage.setItem("auth_session_key", session_key)`.

### Step 3 — Code input + submit

Render a single `TextField` with `maxLength={6}`, `inputMode="numeric"`, `autoComplete="one-time-code"`. On form submit, call `apiRequest({ method: "post", url: "/api/auth/verify-token", payload: { session_key: storedSessionKey, code: codeValue } })`.

### Step 4 — Success handler

On `verify-token` success:
1. `const { token, expiry, user } = response.data`
2. `signIn(token, expiry)` from `UserContext`
3. Call `onSuccess(user)` callback

The parent `login.tsx` implements `handleOtpSuccess` as:
```ts
const handleOtpSuccess = (user) => {
  const redirectUrl = sessionStorage.getItem("auth_redirect_url");
  router.push(redirectUrl || getLocalePrefix(locale) + "/");
};
```

This keeps redirect logic in the page, not the step component.

### Step 5 — Error handling

Parse `err.response?.data?.detail` for specific messages. Use `setInterval` for resend countdown.

### Step 6 — Resend

"Resend code" button: disabled while `resendCountdown > 0`. When clicked: call `request-token`, update `session_key`, clear `code`, reset countdown.

### Step 7 — Back

"Back" button: `sessionStorage.removeItem("auth_session_key")`, `onBack()`.

### Step 8 — Tests

Add tests to `AuthOtp.test.tsx`: renders, request-token on mount, code input, submit success, submit failure (expired / invalid / locked), resend countdown, back navigation.

---

## Resolved Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Code input UI | Single `TextField`, `maxLength={6}` | Simple, meets accessibility requirements; can upgrade to 6 separate inputs later if UX demands |
| Request-token trigger | On mount (auto-send) | User expects to receive a code immediately after being routed to this step; no extra button press needed |
| `session_key` storage | Component state + `sessionStorage` | Component state for render reactivity; `sessionStorage` for persistence across tab refresh |
| Resend countdown start | Auto-starts on expired/locked errors | User doesn't need to manually trigger resend when the code is already known to be invalid |
| Redirect on success | `router.push` with `auth_redirect_url` fallback | Same pattern used by the rest of the auth flow; page-level decision, not component-level |
| Error message parsing | String matching on `response.data.detail` | Backend returns specific strings; no structured error code field exists yet |
| Redirect ownership | `onSuccess` callback to parent; parent does `router.push` | Component stays reusable for event registration modal; parent owns navigation context |
| `session_key` storage | Component state + `sessionStorage` | Component state for render reactivity; `sessionStorage` for persistence across tab refresh |

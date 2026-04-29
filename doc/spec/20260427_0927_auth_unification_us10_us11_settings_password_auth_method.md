# US-10 + US-11: Password & Auth Method Management in Settings

**Type**: User Story Spec  
**Epic**: [EPIC: Auth Unification](./EPIC_auth_unification.md)  
**Depends on**: [US-9](./20260427_0816_auth_unification_us9_expose_auth_method.md) (`auth_method` and `has_password` exposed via `/api/account_settings/`)  
**Status**: DRAFT  
**Created**: 2026-04-27  

---

## Problem Statement

The account settings page (`/settings`) currently has a single "Change Password" section that assumes every user already has a password. With the auth unification epic, new accounts are created without a password and log in via OTP. This creates two gaps:

1. **OTP-only users cannot set a password** — the change-password form requires a current-password field that these users don't have. There is no UI path for them to add a password and switch to password-based login.
2. **Users cannot toggle their login method** — there is no way for a user to indicate whether they prefer OTP or password login. The `auth_method` field exists in the DB and is exposed by US-9, but the settings page does not surface it.

Additionally, this new settings UI must not appear until the `AUTH_UNIFICATION` feature is rolled out, so it must be gated behind the existing feature toggle.

---

## What & Why (not How)

**What**: Update the `/settings` page to (a) display an auth-method toggle that lets users switch between OTP and password login, and (b) adapt the password section so it supports both *changing* an existing password and *setting* a password for the first time.

**Why**: This is Phase B of the auth unification epic. Without it, OTP-only users created through the combined flow are permanently locked into OTP — they can never add a password or switch methods. The toggle also gives existing password users the choice to switch to OTP if they prefer.

---

## Acceptance Criteria

### 1. Feature toggle gating

The new auth-method toggle and the updated password section **must only render** when the `AUTH_UNIFICATION` feature toggle is enabled.

- When the toggle is **off**, the settings page renders exactly as it does today — no new UI, no changed behaviour.
- When the toggle is **on**, the new sections render above the existing password section: first the "Login method" toggle, then the "Password" section directly below it.

### 2. Auth method toggle UI

When `AUTH_UNIFICATION` is on, a new "Login method" section appears with a control offering two options:

- **One-time code (email)** — corresponds to `auth_method: "otp"`
- **Password** — corresponds to `auth_method: "password"`

Requirements:

- The control **must** reflect the current `auth_method` value from the settings API.
- The **"Password" option must be disabled** when the user has no password set (`has_password === false`). It must still be visible, but not selectable. A helper text explains that a password must be set first.
- The control **must** be keyboard-accessible and use proper A semantics.

### 3. Auth method toggle auto-save

The auth method toggle **must auto-save immediately** when the user changes it.

- On change: call `POST /api/account_settings/` with the new `auth_method` value.
- Show a loading state while the request is in flight.
- On success: update local state and show a transient success message.
- On error (e.g. backend rejects switching to password because none is set): revert the control to its previous value and show the error message.

### 4. Password section — user WITH a password (`has_password === true`)

When the user has a password, the password section behaves as it does today:

- Section header: "Password".
- Fields: old password, new password, confirm new password (all required).
- Helper text about password requirements.
- Submit button: "Change password".
- "Forgot password?" link to the existing reset-password page.
- On submit: send old password, new password, and confirmation to the existing settings endpoint.
- On success: clear fields and show success message.
- On error: display the error in the password section.

### 5. Password section — user WITHOUT a password (`has_password === false`)

When the user has no password, the password section adapts for first-time setup:

- Section header: "Password".
- Introductory text explaining that the user currently logs in via OTP and can set a password if preferred.
- Fields: new password, confirm new password (both required). **No old-password field.**
- **No "Forgot password?" link.**
- Submit button: "Set password".
- On submit: send new password and confirmation. The backend must accept this without an old password when the user has none.
- On success: clear fields, show success message, and **update local state so the auth-method toggle immediately knows a password is now available** (no page refresh required).
- On error: display the error in the password section.
- Client-side validation: new password and confirmation must match before submitting.

### 6. Backend: support password setting without old password

The existing `POST /api/account_settings/` endpoint requires an old password to change passwords. It must be updated to also accept a new password without an old password, **but only when the authenticated user does not currently have a usable password**. If the user already has a password, omitting the old password must be rejected.

Existing password-change behaviour must remain untouched.

### 7. Text translations

All new user-facing text **must** be translatable. New entries must be added to the settings text file with both English and German translations.

### 8. State management and reactivity

After successfully setting a password, the settings page must immediately reflect that the user now has a password, so the auth-method toggle enables the "Password" option without requiring a page refresh.

After successfully changing `auth_method`, the settings page must immediately reflect the new value.

### 9. No regressions

- When `AUTH_UNIFICATION` is off, the settings page must be identical to today.
- Existing settings flows (change email, email preferences, cookie preferences) must continue to work unchanged.

---

## Domain Context

### Current settings page architecture

- **Page**: `frontend/pages/settings.tsx` — fetches settings via `GET /api/account_settings/` server-side and passes them to `SettingsPage`.
- **Component**: `frontend/src/components/account/SettingsPage.tsx` — manages local state for password inputs, email preferences, cookie preferences.
- **Text source**: `frontend/public/texts/settings.json` — static JSON with `en`/`de` keys.
- **Feature toggle system**: already used by `/login`, `/signin`, `/signup` to gate auth-unification behaviour.
- **Existing password validation**: The frontend already validates that new password and confirmation match before submitting. Password complexity (minimum length, character requirements) is validated by the backend; the frontend only displays a helper text.

### API contract (established by US-9)

`GET /api/account_settings/` returns `auth_method` ( `"password"` | `"otp"` ) and `has_password` (boolean, read-only, computed from the user's actual password state).

`POST /api/account_settings/` accepts partial updates. Adding `auth_method` to the payload updates the user's preference. Adding password fields changes or sets the password.

---

## AI Insights

### Likely implementation notes

- The password section's mode (change vs. set) should be driven by `has_password`, not by `auth_method`. A user could have set a password but still prefer OTP — in that case they still need the "change password" form.
- After a successful "set password" POST, the frontend knows the user now has a password, so it can safely update local state without re-fetching the full settings object.

### Trade-offs & risks

| Concern | Mitigation |
|---------|------------|
| Auto-saving the auth method toggle means the user cannot "cancel" a mistaken click. | The toggle is a binary choice with no irreversible side effects (switching back is one more click). This is standard UX for preference toggles. |
| The "set password" backend path omits the old password, which could be a security concern if an attacker bypasses the frontend. | The backend must verify the user has no usable password before allowing the request. If a password exists, the request is rejected. |

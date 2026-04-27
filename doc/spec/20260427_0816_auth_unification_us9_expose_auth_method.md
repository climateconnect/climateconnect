# US-9: Expose `auth_method` via Account Settings API

**Type**: User Story Spec  
**Epic**: [EPIC: Auth Unification](./EPIC_auth_unification.md)  
**Depends on**: [US-2](./20260420_1215_auth_unification_us2_data_layer.md) (`UserProfile.auth_method` model field)  
**Status**: DRAFT  
**Created**: 2026-04-27  

---

## Problem Statement

The `UserProfile.auth_method` field (values: `password` | `otp`) was added in US-2 to support the combined login flow and future account-settings features. However, it is **not yet exposed** through the existing account settings API (`GET/POST /api/account_settings/`). This blocks:

- **US-10** (set/change password from settings) — the UI needs to know whether the user currently has a password set to decide whether to show a "current password" field.
- **US-11** (toggle between OTP and password login) — the UI needs to read and update the user's preferred auth method, and it must know whether the user actually **has** a usable password before offering a toggle to switch to password-based login.
- The settings page itself, which should display the current auth method to the user.

Additionally, the frontend cannot call `user.has_usable_password()` — that state lives on the backend only. The account settings endpoint must expose a read-only signal (e.g. `has_password`) so the frontend can make UI decisions without guessing.

Until this data contract is in place, any settings-page work that depends on it must hardcode assumptions or be delayed.

---

## What & Why (not How)

**What**: Make `auth_method` readable and writable, and expose a read-only `has_password` flag, via the account settings serializer and view.

**Why**: US-10 and US-11 both need this data contract in place. Exposing it now (a pure backend enablement with no model change) allows frontend work on those stories to proceed in parallel without waiting for a later backend task.

---

## Acceptance Criteria

### 1. Read: `GET /api/account_settings/` includes `auth_method`

When an authenticated user calls `GET /api/account_settings/`, the response body **must** include `"auth_method": "password"` or `"auth_method": "otp"`.

Example response (truncated):

```json
{
  "email": "user@example.com",
  "auth_method": "otp",
  "has_password": false,
  "send_newsletter": true,
  ...
}
```

### 2. Read: `GET /api/account_settings/` includes `has_password`

The response body **must** include `"has_password": true` or `"has_password": false`, computed from `user.has_usable_password()`.

This field is **read-only** — it is never accepted on `POST`.

### 3. Write: `POST /api/account_settings/` accepts `auth_method`

When an authenticated user calls `POST /api/account_settings/` with `"auth_method"` in the payload, the backend **must** validate and persist the new value.

- **Valid values**: `"password"`, `"otp"`.
- **Invalid values**: return `HTTP 400` with a clear validation error (e.g. `"auth_method" must be either "password" or "otp".`).
- **Missing `auth_method` in payload**: no change to the field (existing partial-update behaviour is preserved).
- **Guard against inconsistent state**: if the user requests `"auth_method": "password"` but `user.has_usable_password()` is `False`, return `HTTP 400` with a message such as `"Cannot set auth_method to password because no password is set."`. This protects the API even if the frontend (which will gate this in US-11) is bypassed.

### 4. Partial update compatibility

The endpoint already supports partial updates (e.g. updating only email preferences, or only password). Adding `auth_method` **must not** break this — a request that omits `auth_method` must leave the field untouched.

### 5. `has_password` is ignored on write

`POST /api/account_settings/` must ignore `"has_password"` if it appears in the payload. It is a read-only computed field.

### 6. Existing behaviour preserved

All other fields and flows on `POST /api/account_settings/` (password change, email change, email preferences) must continue to work exactly as before.

### 7. Tests

- `GET` returns `auth_method` for both `"password"` and `"otp"` users.
- `GET` returns `has_password: true` when the user has a usable password, and `false` when they do not.
- `POST` with `"auth_method": "otp"` updates the field.
- `POST` with `"auth_method": "password"` updates the field when the user has a usable password.
- `POST` with `"auth_method": "password"` returns `400` when the user does **not** have a usable password.
- `POST` with an invalid `auth_method` returns `400`.
- `POST` without `auth_method` leaves the field unchanged.
- `POST` with `"has_password"` in the payload is ignored (read-only).

---

## Domain Context

### Existing endpoint behaviour

`GET /api/account_settings/`  
- Returns `UserAccountSettingsSerializer(UserProfile)` data.
- Currently serializes: `email`, `send_newsletter`, `url_slug`, and ~12 email-preference booleans.
- `email` is a `SerializerMethodField` that reads `user.email`.
- `has_password` will be a new `SerializerMethodField` that reads `user.has_usable_password()`.

`POST /api/account_settings/`  
- Partial-update endpoint: inspects the payload and updates whichever fields are present.
- Password change: requires `old_password`, `password`, `confirm_password`.
- Email change: sets `pending_new_email` and sends a verification email.
- Email preferences: if `send_newsletter` is present, **all** email preference fields must be present (existing validation), then they are bulk-updated.
- Returns `{"message": "Account successfully updated"}` on success.

### The `auth_method` field

Defined on `UserProfile`:

```python
class AuthMethod(models.TextChoices):
    PASSWORD = "password", "Password"
    OTP = "otp", "OTP"

auth_method = models.CharField(
    max_length=8,
    choices=AuthMethod.choices,
    default=AuthMethod.PASSWORD,
    null=False,
    blank=False,
)
```

- Added in migration `0100_userprofile_auth_method.py` (US-2).
- All existing users have default `"password"`.
- New users created through the combined flow (US-8) may have `"otp"`.

### Frontend consumer

The settings page (`frontend/pages/settings.tsx` + `frontend/src/components/account/SettingsPage.tsx`) already fetches from `/api/account_settings/` on load and POSTs updates. Once this field is exposed, the frontend can display the current auth method and send it back when the user toggles it (US-11).

---

## AI Insights

### Likely implementation notes

- **Serializer**: add `"auth_method"` and `"has_password"` to `UserAccountSettingsSerializer.Meta.fields`.
  - `auth_method`: no custom field needed — `CharField` with `choices` serializes naturally to its string value.
  - `has_password`: add a `SerializerMethodField` with `get_has_password(self, obj) -> bool` that returns `obj.user.has_usable_password()`.
- **View**: in `UserAccountSettingsView.post()`, add a branch that checks `"auth_method" in request.data`, validates the value, checks the password guard, sets `user.user_profile.auth_method`, and saves. Keep this branch independent of the email-preferences logic so partial updates continue to work. `has_password` must be ignored if sent in the payload.
- **Validation**: DRF's `ChoiceField` will reject invalid values automatically if you use a serializer-based approach. Given the view's current style — where the `POST` handler manually inspects `request.data` and assigns fields one by one instead of delegating to `serializer.is_valid()` and `serializer.save()` — an explicit `if request.data["auth_method"] not in UserProfile.AuthMethod.values` check (or similar) is more consistent with the existing code.

### Trade-offs & risks

| Concern | Mitigation |
|---------|------------|
| The `POST` handler manually assigns fields one by one rather than using the serializer's `update()` method (the `GET` handler does use the serializer). Adding another manual branch increases tech debt. | Keep the change small and consistent with existing patterns. A future refactoring could migrate the view to use `serializer.is_valid()` / `serializer.save()` for writes, but that is out of scope. |
| `auth_method` is technically independent of whether the user actually *has* a usable password. Setting `"password"` when no password exists could confuse the login flow. | Mitigated in this story: the backend now rejects `"auth_method": "password"` when `has_usable_password()` is `False`. The frontend (US-11) will additionally gate the toggle so users never hit this error in normal use. |
| The endpoint is `POST`, not `PATCH` or `PUT`, which is non-RESTful for updates. | **Do not change the HTTP method.** The epic mentions `PATCH` for clarity, but the production endpoint is `POST`. Changing the method would break the existing frontend. Just add the field to the existing `POST` handler. |

### Testing hints

- The existing account-settings tests (if any) can serve as a template. Check `backend/climateconnect_api/tests/` for user-profile or settings-related test modules.
- Use `UserProfile.AuthMethod.PASSWORD` / `.OTP` in assertions rather than string literals — protects against future rename.

---

## Out of Scope

- **US-10**: set/change password form logic (will consume this field but is a separate story).
- **US-11**: toggle UI and business rules (e.g. "cannot switch to password without setting one first").
- **US-12**: wiring password login to `LoginAuditLog`.
- Changing the HTTP method from `POST` to `PATCH` for updates.
- Refactoring the settings view to use a serializer for writes.

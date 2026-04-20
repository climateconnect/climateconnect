# US-2b: `POST /api/auth/check-email` Endpoint

**Status**: READY FOR IMPLEMENTATION  
**Type**: Tech Enabler — backend endpoint  
**Epic**: [EPIC: Auth Unification](./EPIC_auth_unification.md)  
**Date created**: 2026-04-20 12:30  
**Depends on**: US-2 (`auth_app` exists, `UserProfile.auth_method` field is in DB — this endpoint reads it)  
**Unblocks**: US-5 (combined auth page — email entry step)

---

## Problem Statement

The combined `/login` page (US-5) needs to know what to show after the user enters their email: a signup form, a password field, or an OTP flow. This single endpoint provides that routing decision. It is the first user-facing endpoint of the new auth flow.

Unlike `request-token`, this endpoint **intentionally reveals whether an email is registered** — that is the point. The frontend needs to branch on that information. Rate limiting per IP is the mitigation for enumeration risk; no always-200 body hiding is applied here.

---

## Acceptance Criteria

- [ ] `POST /api/auth/check-email` accepts `{ email }` and always returns HTTP 200.
- [ ] Response body is `{ user_status: "new" | "returning_password" | "returning_otp" }`:
  - `new` — no `User` record found for that email.
  - `returning_password` — user exists and `UserProfile.auth_method = "password"`.
  - `returning_otp` — user exists and `UserProfile.auth_method = "otp"`.
- [ ] Email input is validated (valid email format, required). Returns HTTP 400 with a clear error message if invalid.
- [ ] Endpoint is rate-limited: `20 requests / hour / IP`. Exceeding the limit returns HTTP 429 with a `Retry-After` header.
- [ ] Endpoint requires no authentication (`AllowAny`).
- [ ] Tests cover: new email, existing user with password, existing user without password, invalid email format, rate limit behaviour.

---

## Steps

### Step 1 — URL and view scaffolding

Add the endpoint to the `auth_app` (created in US-2). Create `auth_app/urls.py` with the `check-email` path, and wire it into `climateconnect_main/urls.py` under the `api/` prefix alongside the other app includes:

```
path("api/", include("auth_app.urls")),
```

The full URL will be `POST /api/auth/check-email`.

Create `auth_app/views.py` (or `auth_app/views/auth_views.py` if the app will grow — be consistent with the app structure chosen in US-2) with a DRF `APIView` subclass, `permission_classes = [AllowAny]`.

### Step 2 — Request validation

Accept `{ email }` in the request body. Validate using a DRF serializer (inline or in `auth_app/serializers.py`):
- `email` is required.
- `email` must be a valid email format (`EmailField`).

Return HTTP 400 with a descriptive error if validation fails — do not proceed to the user lookup.

### Step 3 — User lookup and `user_status` logic

Look up `User` by email. The existing codebase stores the email as `username` (set at signup in `SignUpView`) and does **case-sensitive** lookups via Django's `authenticate()` and `filter(username=...)` — there is no `iexact` or `.lower()` normalisation in the backend.

Case-insensitivity is handled on the **frontend**: the existing `/signin` page lowercases the email before sending it to `POST /login/` (e.g. `values.username.toLowerCase()`). The new `/login` page (US-5) must do the same before calling this endpoint. The backend lookup here should use the same case-sensitive `filter(username=request.data["email"])` pattern — it can assume the value has already been lowercased by the caller.

Determine `user_status`:

- No user found → `"new"`
- User found, `UserProfile.auth_method = "password"` → `"returning_password"`
- User found, `UserProfile.auth_method = "otp"` → `"returning_otp"`

The `auth_method` field (added in US-2, migration default `"password"`) is the authoritative source for routing. This correctly handles users who have a password set but have explicitly switched to OTP in their account settings — `has_usable_password()` would wrongly route them to the password form.

Fetch `UserProfile` via `select_related` or `user.user_profile` after the `User` lookup. Always return HTTP 200 regardless of outcome.

### Step 4 — Rate limiting

Apply `django-ratelimit` (added as a dependency in this epic — confirm it is in `pyproject.toml`). Rate limit: `20/h` keyed by IP address.

Use `@method_decorator(ratelimit(key="ip", rate="20/h", block=True), name="dispatch")` on the view class. Catch `Ratelimited` exceptions and return HTTP 429 with a `Retry-After: 3600` header. The pattern should be consistent with how US-3 and US-4 will do it — consider a shared utility or base class in `auth_app` for the 429 response if that aids consistency.

### Step 5 — Tests

Add tests in `auth_app/tests/test_check_email.py`. Use `self.client.post` (Django test client). Test cases:

| Scenario | Expected response |
|---|---|
| Email not in DB | 200, `user_status: "new"` |
| Email in DB, `auth_method = "password"` | 200, `user_status: "returning_password"` |
| Email in DB, `auth_method = "otp"` | 200, `user_status: "returning_otp"` |
| Missing `email` field | 400 |
| Malformed email (`notanemail`) | 400 |
| Email submitted with different casing than stored | 200, `user_status: "new"` — backend is case-sensitive; frontend must lowercase before calling (same as existing `/signin` behaviour) |

Rate limit testing: mock `django-ratelimit` or use `override_settings` — avoid making 20 real requests in CI.

---

## Out of Scope

- No authentication required — `AllowAny`.
- No `LoginAuditLog` entry written here (audit logging begins at `request-token`, US-3).
- No session key or OTP generation — that is `request-token` (US-3).
- `has_usable_password()` is not used for routing — `UserProfile.auth_method` is the authoritative field per the flow design. A user may have a usable password set but prefer OTP (`auth_method = "otp"`); this endpoint must route them to OTP in that case.

---

## Log

- 2026-04-20 12:30 — Spec created. First user-facing endpoint of the new auth flow. Depends on US-2 for `auth_app` scaffold.


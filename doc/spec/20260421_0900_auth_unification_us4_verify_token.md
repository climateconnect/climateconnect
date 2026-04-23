# US-4: `POST /api/auth/verify-token` Endpoint

**Status**: IMPLEMENTED
**Type**: Tech Enabler — backend endpoint  
**Epic**: [EPIC: Auth Unification](./EPIC_auth_unification.md)  
**Date created**: 2026-04-21 09:00  
**Depends on**: US-3 (`LoginToken` records are created by `request-token`; `LoginAuditLog` model exists; `anonymise_ip()` utility exists in `auth_app/utility/ip.py`)  
**Unblocks**: US-6 (OTP code entry UI), US-7 ("use a code instead" path completes here), US-8 (new user account verification via OTP)

---

## Problem Statement

After the user receives the 6-digit code by email and types it into the browser, the platform needs an endpoint to validate the submission and, on success, issue an authenticated session. This is the final step of the OTP flow: it verifies the code against the stored hash, enforces all security invariants (expiry, single-use, attempt limit, constant-time comparison), marks the token consumed, issues a Knox `{token, expiry}` pair, and returns the authenticated user object so the frontend can complete the login without any additional round-trips.

The endpoint must also serve the **new-user account verification** use case (US-8): when a new user completes the signup sub-flow and is then sent an OTP, a successful `verify-token` call implicitly proves inbox ownership and marks the account as verified — eliminating the need for a separate email-link verification step.

---

## Acceptance Criteria

- [x] `POST /api/auth/verify-token` accepts `{ session_key, code }` and processes the request.
- [x] On success: returns HTTP 200 with `{ token, expiry, user }`, where `token` and `expiry` are the Knox `AuthToken` values and `user` contains the authenticated user data (consistent with the shape returned by `POST /login/`).
- [x] `session_key` is looked up in `LoginToken`. If no matching record exists, returns HTTP 401.
- [x] Validation checks are enforced in this order:
  - Token is not expired (`expires_at > now`). Failure → HTTP 401, outcome `expired`.
  - Token is not already used (`used_at IS NULL`). Failure → HTTP 401, outcome `failed` (treat as an invalid attempt; no new state transition needed beyond rejecting it).
  - `attempt_count < 5`. Failure → HTTP 401, outcome `exhausted` (token locked; do not increment further).
  - Code hash matches `token_hash` using constant-time comparison (`hmac.compare_digest`). Failure → HTTP 401, outcome `failed`; `attempt_count` incremented; if the increment brings `attempt_count` to 5, outcome is `exhausted`.
- [x] On a failed code comparison: `attempt_count` is incremented atomically (use `F()` expression to avoid race conditions). The response body includes the number of attempts remaining (e.g. `{ "detail": "Invalid code. 3 attempts remaining." }`), or a locked message when exhausted (`"detail": "Too many failed attempts. Please request a new code."`).
- [x] On success: `used_at` is set to `now` before the Knox token is issued. This is the authoritative single-use guard.
- [x] On success for a new user (account not yet verified — `UserProfile.is_profile_verified = False`): the endpoint marks the profile verified (`is_profile_verified = True`) before issuing the Knox token. No separate verification email step is needed.
- [x] Knox token is issued via `AuthToken.objects.create(user)` (same mechanism as `POST /login/`). The raw token and expiry are returned to the frontend.
- [x] `LoginAuditLog` is written on **every** call (all outcomes: `verified`, `failed`, `expired`, `exhausted`). IP address anonymised using the `anonymise_ip()` utility from `auth_app/utility/ip.py` (established in US-3).
- [x] Endpoint requires no authentication (`AllowAny`).
- [x] Both `session_key` and `code` are required fields. Returns HTTP 400 for missing or malformed input.
- [x] Tests cover all scenarios listed in the Steps section. (10/11 pass; concurrent duplicate-request test is pending.)

---

## Steps

### Step 1 — URL registration

Add the `verify-token` path to `auth_app/urls.py`. The full URL will be `POST /api/auth/verify-token`. The `api/` prefix is already wired in `climateconnect_main/urls.py` via `path("api/", include("auth_app.urls"))`.

### Step 2 — Request validation

Accept `{ session_key, code }` in the request body. Validate using a DRF serializer in `auth_app/serializers.py` (consistent with the serializers added for US-2b and US-3):

- `session_key` is required; must be a non-empty string.
- `code` is required; must be a non-empty string (do not enforce digit-only validation here — that leaks information about token format; let the hash comparison fail naturally).

Return HTTP 400 with a descriptive error if validation fails. Do not proceed to token lookup.

### Step 3 — Token lookup

Look up `LoginToken` by `session_key`:

```python
token = LoginToken.objects.select_related("user").filter(session_key=session_key).first()
```

If no record is found, write a `LoginAuditLog` entry (`email=None`, `user=None`, outcome `failed`) and return HTTP 401 with `{ "detail": "Invalid or expired session." }`. Do not distinguish "session not found" from other failure modes — this keeps the error surface consistent and avoids session enumeration.

### Step 4 — Sequential validation checks

Perform checks in this order. On any failure, write to `LoginAuditLog` and return HTTP 401 before proceeding to the next check.

**Check 1 — Expiry**

```python
if token.expires_at <= now:
    # log outcome "expired"
    return 401 { "detail": "This code has expired. Please request a new one." }
```

**Check 2 — Single-use**

```python
if token.used_at is not None:
    # log outcome "failed" (already consumed — treat as invalid)
    return 401 { "detail": "Invalid or expired session." }
```

**Check 3 — Attempt count**

```python
if token.attempt_count >= 5:
    # log outcome "exhausted"
    return 401 { "detail": "Too many failed attempts. Please request a new code." }
```

**Check 4 — Code comparison (constant-time)**

Hash the submitted code the same way `request-token` hashed it:

```python
submitted_hash = hashlib.sha256(code.encode()).hexdigest()
match = hmac.compare_digest(submitted_hash, token.token_hash)
```

Using `hmac.compare_digest` prevents timing attacks — the comparison takes the same amount of time regardless of where a mismatch occurs. Never use `==` for secret comparison.

On mismatch:

```python
LoginToken.objects.filter(pk=token.pk).update(attempt_count=F("attempt_count") + 1)
token.refresh_from_db(fields=["attempt_count"])
remaining = 5 - token.attempt_count
if remaining <= 0:
    outcome = "exhausted"
    detail = "Too many failed attempts. Please request a new code."
else:
    outcome = "failed"
    detail = f"Invalid code. {remaining} attempt{'s' if remaining != 1 else ''} remaining."
# log outcome
return 401 { "detail": detail }
```

Use `F("attempt_count") + 1` to increment atomically and avoid a read-modify-write race when two concurrent requests are made with the same session.

### Step 5 — Mark token as used and verify new users

Wrap this step in `@transaction.atomic` to ensure `used_at` is set and the Knox token is issued together — if Knox token creation fails, the `used_at` update is rolled back and the user can retry.

```python
with transaction.atomic():
    LoginToken.objects.filter(pk=token.pk, used_at__isnull=True).update(used_at=now)
    # Re-check: if update() affected 0 rows, another request beat us to it
    # (concurrent verify) — return 401 to the slower request.
    ...
    user = token.user
    # For new users: mark account verified
    if not user.userprofile.is_profile_verified:
        user.userprofile.is_profile_verified = True
        user.userprofile.save(update_fields=["is_profile_verified"])
    # Issue Knox token
    instance, auth_token = AuthToken.objects.create(user=user)
```

The double-`update()` guard (checking affected rows) eliminates the race condition where two concurrent requests both pass the `used_at IS NULL` check and try to issue two Knox tokens for the same OTP. The second request gets a 0-row update result and returns 401.

### Step 6 — Build and return success response

Return the Knox token and user data in the same shape as `POST /login/` so the frontend can use identical handling code:

```json
HTTP 200
{
  "token": "<knox raw token>",
  "expiry": "<ISO 8601 datetime>",
  "user": { ... }
}
```

The `user` object should use the same serializer shape returned by the existing login endpoint — check `auth_app/views.py` and reuse the same serializer.

### Step 7 — Write `LoginAuditLog` for success and return

```python
LoginAuditLog.objects.create(
    email=token.email,
    user=user,
    outcome="verified",
    ip_address=anonymise_ip(request.META.get("REMOTE_ADDR")),
    user_agent=request.META.get("HTTP_USER_AGENT", "")[:512],
)
```

Use the `anonymise_ip()` utility from `auth_app/utility/ip.py` (established in US-3 — no changes needed).

### Step 8 — Tests

Add tests in `auth_app/tests/test_verify_token.py`. Use `self.client.post` (Django test client). Use Factory Boy to create `User`, `UserProfile`, and `LoginToken` records.

| Scenario | Expected response |
|---|---|
| Valid `session_key` + correct `code`, token not expired, not used, `attempt_count=0` | 200; `{ token, expiry, user }` returned; `LoginToken.used_at` is set; Knox `AuthToken` record created; `LoginAuditLog` outcome `verified` |
| Correct code but token expired (`expires_at` in the past) | 401; `LoginAuditLog` outcome `expired`; `used_at` not set |
| Correct code but `used_at` already set | 401; `LoginAuditLog` outcome `failed`; no new Knox token |
| `attempt_count = 5` before submission | 401; `LoginAuditLog` outcome `exhausted`; `attempt_count` not incremented further |
| Wrong code, `attempt_count = 0` | 401; `attempt_count` becomes 1; response contains "4 attempts remaining"; `LoginAuditLog` outcome `failed` |
| Wrong code, `attempt_count = 4` | 401; `attempt_count` becomes 5; response contains "Too many failed attempts"; `LoginAuditLog` outcome `exhausted` |
| Unknown `session_key` | 401; `LoginAuditLog` written with `email=None`, `user=None`, outcome `failed` |
| Missing `session_key` | 400 |
| Missing `code` | 400 |
| New user (`is_profile_verified=False`), correct code | 200; `UserProfile.is_profile_verified` set to `True`; Knox token issued |
| Concurrent duplicate requests with same `session_key` + correct code | Only one request returns 200 and receives a Knox token; the other returns 401 (race condition guard via `update()` affected-rows check) |

For Knox token assertions: verify that an `AuthToken` record exists in the DB for the user after a successful call. Assert the `token` value in the response is non-empty and the `expiry` is a valid future datetime.

For the `is_profile_verified` test: assert the field value on the `UserProfile` instance after the call (reload from DB with `.refresh_from_db()`).

---

## Out of Scope

- Frontend code entry screen — that is US-6.
- "Use a code instead" option on the password form — that is US-7.
- New user signup sub-flow — that is US-8 (calls `request-token` after `POST /signup/`, then the user lands here; `is_profile_verified` marking is handled by this endpoint for that case).
- `request-token` endpoint — that is US-3.
- Password login (`POST /login/`) — unchanged; audit logging for password login is Phase B (US-12).

---

## Log

- 2026-04-21 09:00 — Spec created. Core OTP verification endpoint; issues Knox token on success. Depends on US-3 for `LoginToken` records and `anonymise_ip()` utility.
- 2026-04-21 — Implemented. `VerifyTokenSerializer`, `VerifyTokenView`, URL registered. 10/11 tests pass (concurrent duplicate-request test pending). `doc/api-documentation.md` updated with full endpoint reference.


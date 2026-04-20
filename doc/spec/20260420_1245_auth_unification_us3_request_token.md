# US-3: `POST /api/auth/request-token` Endpoint

**Status**: READY FOR IMPLEMENTATION  
**Type**: Tech Enabler — backend endpoint  
**Epic**: [EPIC: Auth Unification](./EPIC_auth_unification.md)  
**Date created**: 2026-04-20 12:45  
**Depends on**: US-2 (`auth_app` exists, `LoginToken` and `LoginAuditLog` models are in DB)  
**Unblocks**: US-4 (`verify-token`), US-6 (OTP code entry UI), US-7 (password login — "use a code instead" path), US-8 (new user signup — triggers OTP after account creation)

---

## Problem Statement

Once the email entry step (`check-email`, US-2b) has routed the user to the OTP path, the frontend needs an endpoint to kick off the actual token delivery: generate a one-time code, tie it to the current browser tab via a `session_key`, and dispatch it to the user's inbox. This endpoint is also the **resend** mechanism — the same URL is called when the user requests a new code. It is the core of the passwordless flow.

Security note: this endpoint **must never reveal whether an email is registered**. It always returns HTTP 200 with `{ session_key }` regardless of whether a matching `User` record exists. The email is simply not sent when no user is found. This prevents attackers from using this endpoint to enumerate account existence.

---

## Acceptance Criteria

- [ ] `POST /api/auth/request-token` accepts `{ email }` and **always** returns HTTP 200 with `{ session_key }`, even for unknown email addresses.
- [ ] A cryptographically secure 6-digit code is generated via `secrets.randbelow(1_000_000)`, zero-padded to 6 characters. `random.randint` is never used.
- [ ] A `session_key` is generated via `secrets.token_hex(32)`.
- [ ] Only the SHA-256 hash of the raw code is stored in `LoginToken.token_hash`. The raw code is never persisted.
- [ ] Any previous active (unused, non-expired) `LoginToken` for the same email is invalidated before the new one is saved.
- [ ] `LoginToken` is saved with `expires_at = now + 15 minutes`.
- [ ] A `SendLoginCodeEmail` Celery task is enqueued (via `.delay()`) with the raw code and email address. The raw code is **not** passed to anything that persists it.
- [ ] `LoginAuditLog` is written on every call:
  - outcome `requested` for a new token request.
  - outcome `resent` when a previous token for the same email existed (resend path).
  - The same log entry is written even when the email is not found (outcome `requested`; `user_id` remains null).
- [ ] **Resend cooldown**: if a `LoginToken` for the same email was created within the last 60 seconds, the endpoint returns HTTP 429 with a `Retry-After` header indicating seconds remaining.
- [ ] **Per-email rate limit**: maximum 3 requests per email address per 10 minutes (enforced via `django-ratelimit`, key `post:email`). Exceeding returns HTTP 429 with `Retry-After`.
- [ ] **Per-IP secondary rate limit**: maximum 30 requests per IP per hour (enforced via `django-ratelimit`, key `ip`). Exceeding returns HTTP 429 with `Retry-After`.
- [ ] Endpoint requires no authentication (`AllowAny`).
- [ ] Email input is validated (required, valid email format). Returns HTTP 400 for invalid input — this is the only non-200/429 response.
- [ ] Tests cover all scenarios listed in the Steps section.

---

## Steps

### Step 1 — URL registration

Add the `request-token` path to `auth_app/urls.py` (created in US-2b). The full URL will be `POST /api/auth/request-token`. The `api/` prefix is already wired in `climateconnect_main/urls.py` via `path("api/", include("auth_app.urls"))`.

### Step 2 — Request validation

Accept `{ email }` in the request body. Validate using a DRF serializer (in `auth_app/serializers.py`, consistent with the serializer added for US-2b):
- `email` is required.
- `email` must be a valid email format (`EmailField`).

Return HTTP 400 with a descriptive error if validation fails. Do not proceed to token generation.

As established in US-2b: the frontend lowercases the email before sending (same as the existing `/signin` page). The backend performs a case-sensitive lookup using `filter(username=email)` — it can assume the value has been normalised by the caller.

### Step 3 — Rate limiting (per-email and per-IP)

Apply `django-ratelimit` (already added to `pyproject.toml` as part of this epic) with two decorators on the view's `dispatch` or `post` method:

1. Per-email: `ratelimit(key="post:email", rate="3/10m", block=True)`
2. Per-IP (secondary): `ratelimit(key="ip", rate="30/h", block=True)`

Catch `Ratelimited` exceptions and return HTTP 429. The `Retry-After` header value should reflect the relevant window:
- Per-email limit hit → `Retry-After: 600` (10 minutes).
- Per-IP limit hit → `Retry-After: 3600` (1 hour).

Follow the same 429 helper pattern established in US-2b to keep responses consistent across all auth endpoints.

### Step 4 — Resend cooldown check

After rate limit checks, query `LoginToken` for the most recent token for this email regardless of its state:

```python
LoginToken.objects.filter(email=email).order_by("-created_at").first()
```

If a token exists and `created_at > now - 60s`, return HTTP 429 immediately with a `Retry-After` header set to the remaining seconds (`60 - (now - token.created_at).seconds`). Write a `LoginAuditLog` entry with outcome `resent` before returning (the attempt was received and counted).

This check is intentionally **not** a `django-ratelimit` decorator — it is a per-email, DB-backed cooldown that survives Redis flushes and correctly tracks the resend scenario independently from the broader 3/10m rate limit.

### Step 5 — User lookup and enumeration-safe branching

Look up `User` by `filter(username=email).first()`. If not found:
- Write `LoginAuditLog(email=email, user_id=None, outcome="requested", ip_address=<anonymised>, ...)`.
- Generate a `session_key` via `secrets.token_hex(32)` (identical code path — no branching that a timing attack could detect).
- **Do not** create a `LoginToken` and **do not** enqueue an email.
- Return HTTP 200 with `{ "session_key": session_key }`.

This keeps the response time and body identical to the success path. The generated `session_key` is unused and ephemeral — when the frontend later calls `verify-token` with it, no matching `LoginToken` will be found and the attempt will fail with a session-key-not-found 401.

### Step 6 — Invalidate previous active token

If a user was found, invalidate any existing active token before creating the new one. "Active" means `used_at IS NULL` and `expires_at > now`:

```python
LoginToken.objects.filter(
    email=email, used_at__isnull=True, expires_at__gt=now
).update(used_at=now)
```

Using `update()` marks them used in a single query and preserves them in the DB for the 24h audit retention window (per the token retention rules in the epic).

Determine the `LoginAuditLog` outcome for this call:
- If any active token was just invalidated → outcome is `resent`.
- Otherwise → outcome is `requested`.

### Step 7 — Generate token and save `LoginToken`

```python
raw_code = str(secrets.randbelow(1_000_000)).zfill(6)
session_key = secrets.token_hex(32)
token_hash = hashlib.sha256(raw_code.encode()).hexdigest()
expires_at = now + timedelta(minutes=15)

LoginToken.objects.create(
    user=user,
    email=email,
    token_hash=token_hash,
    session_key=session_key,
    expires_at=expires_at,
)
```

The `raw_code` variable must not be passed to anything that persists it (no logging, no model fields, no task kwargs that end up in the Celery result backend). It is passed only to `SendLoginCodeEmail.delay(email=email, code=raw_code)` and then discarded.

### Step 8 — Enqueue email task

Create `send_login_code_email` as a Celery task in `auth_app/tasks.py`. Accept `user_id` (not the raw user object — Celery tasks must be serialisable) and `code` (the raw 6-digit string):

```python
@app.task(bind=True, max_retries=3)
def send_login_code_email(self, user_id, code):
    from django.contrib.auth.models import User
    from auth_app.utility.email import send_login_code_email_to_user
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        logger.warning(f"[send_login_code_email] User {user_id} not found, skipping.")
        return
    send_login_code_email_to_user(user=user, code=code)
```

Enqueue from the view (after saving `LoginToken`) with:

```python
send_login_code_email.delay(user_id=user.id, code=raw_code)
```

**Email helper** (`auth_app/utility/email.py`):

Create `send_login_code_email_to_user(user, code)` using the existing `send_email()` utility from `climateconnect_api.utility.email_setup`. This follows the exact same pattern as `send_user_verification_email` and `send_password_link`.

```python
def send_login_code_email_to_user(user, code):
    # Dev fallback: if the Mailjet template is not configured, log the code so
    # developers can authenticate locally without a working email integration.
    if not getattr(settings, "LOGIN_CODE_EMAIL_TEMPLATE_ID", ""):
        logger.warning(
            f"[LOGIN CODE] No Mailjet template configured. "
            f"OTP for {user.email}: {code}"
        )
        return

    subjects_by_language = {
        "en": "Your Climate Connect login code",
        "de": "Dein Climate Connect Anmeldecode",
    }
    variables = {
        "FirstName": user.first_name,
        "Code": code,
        "ExpiryMinutes": 15,
    }
    send_email(
        user=user,
        variables=variables,
        template_key="LOGIN_CODE_EMAIL_TEMPLATE_ID",
        subjects_by_language=subjects_by_language,
        should_send_email_setting="",   # transactional — no user preference gate
        notification=None,
    )
```

**Template variables passed to Mailjet:**

| Variable | Value | Notes |
|---|---|---|
| `FirstName` | `user.first_name` | Personalisation greeting |
| `Code` | 6-digit string (e.g. `"048271"`) | Must be displayed in large, prominent type |
| `ExpiryMinutes` | `15` | Used in the copy: "This code expires in 15 minutes" |

**Email copy requirements** (template designer note — all text content is backend-generated via variables; the Mailjet template is a styled wrapper):

- Display `Code` prominently — large font, visually distinct (e.g. monospace, bordered block).
- Include: *"This code expires in {{var:ExpiryMinutes}} minutes."*
- Include: *"If you didn't request this code, you can safely ignore this email. No account changes have been made."*
- **No clickable login link** — the user must return to the browser tab and type the code. This is intentional: it preserves session binding and avoids all magic-link problems.
- Subject line doubles as the email envelope subject (passed via `subjects_by_language` → `send_email()`).

**New settings** (`climateconnect_main/settings.py`):

Add two settings following the established naming convention (see `EMAIL_VERIFICATION_TEMPLATE_ID`, `RESET_PASSWORD_TEMPLATE_ID`):

```python
LOGIN_CODE_EMAIL_TEMPLATE_ID = env("LOGIN_CODE_EMAIL_TEMPLATE_ID", default="")
LOGIN_CODE_EMAIL_TEMPLATE_ID_DE = env("LOGIN_CODE_EMAIL_TEMPLATE_ID_DE", default="")
```

`get_template_id(template_key, lang_code)` in `email_setup.py` already handles the `_DE` suffix lookup automatically — no changes needed to that utility.

Add both template ID env vars to `.backend_env` and Azure App Service configuration once the Mailjet templates are created. When `LOGIN_CODE_EMAIL_TEMPLATE_ID` is absent or blank (the default for local dev), the helper short-circuits and logs the OTP to the console instead — no email is attempted, and no error is raised. This means local development works out of the box without any Mailjet configuration.

### Step 9 — Write `LoginAuditLog` and return response

```python
LoginAuditLog.objects.create(
    email=email,
    user=user,  # None if not found
    outcome=outcome,  # "requested" or "resent"
    ip_address=anonymise_ip(request.META.get("REMOTE_ADDR")),
    user_agent=request.META.get("HTTP_USER_AGENT", "")[:512],
)
```

IP anonymisation: zero the last octet for IPv4 (`192.168.1.42` → `192.168.1.0`). For IPv6, zero the last 80 bits or store only the first 48 bits. Apply in a utility function (e.g. `auth_app/utility/ip.py`) so it is reusable by US-4.

Return:

```json
HTTP 200
{ "session_key": "<64-char hex string>" }
```

### Step 10 — Tests

Add tests in `auth_app/tests/test_request_token.py`. Use `self.client.post` (Django test client).

| Scenario | Expected response |
|---|---|
| Valid email, user exists, no previous token | 200, `{ session_key }` returned; `LoginToken` created; `SendLoginCodeEmail` enqueued; `LoginAuditLog` outcome `requested` |
| Valid email, user exists, previous active token exists (>60s ago) | 200, new `session_key`; old token marked `used_at`; outcome `resent` |
| Valid email, user exists, previous token created <60s ago | 429, `Retry-After` header present; no new `LoginToken` created; outcome `resent` logged |
| Valid email, user does NOT exist | 200, `{ session_key }` returned; no `LoginToken` in DB; no email enqueued; audit log written with `user_id=None` |
| Missing `email` field | 400 |
| Malformed email (`notanemail`) | 400 |
| Per-email rate limit exceeded (>3 in 10m) | 429 — mock `django-ratelimit` or use `override_settings` |
| Per-IP rate limit exceeded (>30/h) | 429 — mock `django-ratelimit` |

For all 200 responses: assert `session_key` is a 64-character hex string (`len == 64`, `all(c in string.hexdigits for c in sk)`).

For the "user not found" case: assert `SendLoginCodeEmail` was **not** called (use `unittest.mock.patch` on the task's `.delay`).

For token generation: mock `secrets.randbelow` and `secrets.token_hex` only if needed to assert on specific values — prefer asserting on the DB state and response shape rather than internal call details.

---

## Out of Scope

- `verify-token` validation logic — that is US-4.
- Frontend code entry screen — that is US-6.
- "Use a code instead" option on the password form — that is US-7 (calls this endpoint when the user opts in from the password path).
- New user OTP trigger after signup — that is US-8 (also calls this endpoint after `POST /signup/` creates the account).
- Account verification via OTP (replacing the email link click for new users in US-8) — that is US-8's responsibility; this endpoint just issues the token.

---

## Log

- 2026-04-20 12:45 — Spec created. Core OTP token generation endpoint; also serves as the resend endpoint. Depends on US-2 for `auth_app`, `LoginToken`, and `LoginAuditLog` models.
- 2026-04-20 13:00 — Step 8 expanded with full email implementation: `send_login_code_email_to_user()` helper using `send_email()` from `climateconnect_api.utility.email_setup`, `subjects_by_language`, Mailjet template variables (`FirstName`, `Code`, `ExpiryMinutes`), new settings (`LOGIN_CODE_EMAIL_TEMPLATE_ID` / `_DE`), email copy requirements, and dev-mode console fallback when template ID is not configured.


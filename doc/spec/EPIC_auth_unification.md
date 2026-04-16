# EPIC: Auth Unification

**Type**: Epic  
**Status**: PLANNED  
**Started**: —  
**Owner**: CC  
**Depended on by**: [EPIC: Event Registration](./EPIC_event_registration.md) — Phase 3 (guest registration) cannot ship until Phase A of this epic is complete.

---

## Overview

This epic simplifies and unifies the platform's authentication experience. Today, login and signup are two separate pages with separate flows, and all accounts require a password. This epic delivers:

1. **A combined login/signup entry point** — one page where users enter their email and the platform branches automatically: returning users proceed to login, new users proceed to signup. No upfront choice between two separate pages.
2. **OTP-based (passwordless) login as the default** — instead of a password, the platform emails a **6-digit one-time code** to the user. The user enters it on the same page and in the same browser tab. New accounts are created without a password by default. This significantly reduces friction and eliminates the most common support issue (forgotten passwords). **Magic links are explicitly not used** — they open a new browser tab, losing the original redirect context and breaking session binding.
3. **Password as an opt-in setting** — existing users keep their passwords and can continue using them. Any user can set or change a password and toggle between OTP-based and password-based login from their account settings.

The primary driver for this epic is enabling **guest event registration**: a visitor who wants to register for an event must be able to create a platform account as part of the registration flow without the friction of a password. This epic is the prerequisite.

> **Full technical design for the OTP flow** (data model, security rules, sequence diagram, implementation checklist) is documented in [`doc/mosy/flows/passwordless-login-flow.md`](../mosy/flows/passwordless-login-flow.md). Per-story specs reference that document directly. This epic captures the scope, story breakdown, and constraints.

---

## Current System (as of April 2026)

Understanding what exists is essential before changing it.

### Frontend

| Page | URL | Description |
|------|-----|-------------|
| Sign in | `/signin` | Single-step form: email + password. Supports `?redirect=` and `?hub=` params. Calls `POST /login/`. |
| Sign up | `/signup` | Three-step wizard: (1) email + password, (2) first/last name + location, (3) interest areas/sectors. Calls `POST /signup/`. Supports `?redirect=` and `?hub=` params. |
| Account created | `/accountcreated/` | Intermediate page shown after signup; informs user a verification email was sent. |
| Reset password | `/resetpassword` | Sends password reset email via `/api/send_reset_password_email/`. |

Hub theming (custom colours, header images) is applied to both `/signin` and `/signup` via `?hub=` query param using `getHubTheme()` and `transformThemeData()`.

### Backend

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /login/` | POST | Extends Knox `LoginView`. Authenticates with `username` (email) + `password`. Returns `{token, expiry}`. Checks `is_profile_verified` before allowing login. |
| `POST /signup/` | POST | Creates `User` and `UserProfile`. Required fields: `email`, `password`, `first_name`, `last_name`, `location`, `send_newsletter`, `source_language`. Sends verification email (unless `AUTO_VERIFY=True`). |
| `POST /logout/` | POST | Knox `LogoutView`. |
| `POST /api/send_reset_password_email/` | POST | Initiates password reset flow. |
| `POST /api/set_new_password/` | POST | Completes password reset. |
| `POST /api/verify_profile/` | GET | Activates account from verification email link. |
| `POST /api/resend_verification_email/` | POST | Resends account verification email. |
| `PATCH /api/account_settings/` | PATCH | Updates account settings (email, password, notifications). |

**Auth token mechanism**: Django REST Knox — tokens stored as `AuthToken` records, returned as `{token, expiry}`, stored in cookies on the frontend via `signIn()` in `UserContext`.

### Key constraints for any changes

- **Backward compatibility is non-negotiable**: existing users with passwords must be able to log in without any migration or forced re-authentication.
- **Hub theming must be preserved**: the combined page must support `?hub=` and apply custom themes exactly as today.
- **`?redirect=` param must work end-to-end**: the redirect flow is relied upon by the Event Registration epic (deep-linking to `/projects/{slug}/register`).
- **Knox tokens stay**: the token mechanism does not change. Only *how* a user authenticates to obtain a token changes.
- **`AUTO_VERIFY` setting**: staging/dev environments use `AUTO_VERIFY=True` to skip verification emails. This must continue to work with the new flow.

---

## Phases

### 🎯 Phase A — Combined Flow + OTP Login (MVP · go-live enabler)

This phase is the prerequisite for Event Registration Phase 3. All stories must be complete and validated on staging before the `EVENT_REGISTRATION` toggle is flipped to production.

> **Full technical design** (LoginToken data model, rate limiting, security rules, Celery tasks, sequence diagram) is in [`doc/mosy/flows/passwordless-login-flow.md`](../mosy/flows/passwordless-login-flow.md).

| Story | Notes | Status |
|-------|-------|--------|
| User enters email on combined auth page and is routed to login or signup | New page (e.g. `/login`) replaces `/signin` and `/signup` as the entry point. Step 1 is always email. Backend checks if email is known and responds accordingly (always HTTP 200 — prevents user enumeration). Old URLs redirect to new page. Hub theming (`?hub=`) and `?redirect=` param must work. | ⚪ |
| Existing user logs in with OTP code | After email is identified as known, user requests a 6-digit OTP sent to their email. Backend issues `POST /api/auth/request-token` → returns `session_key` (stored in `sessionStorage`, tab-scoped). User enters code; `POST /api/auth/verify-token` validates it and returns Knox `{token, expiry}`. 15-minute expiry, single-use, 5 attempts max, constant-time comparison. Redirect and hub flows unchanged. Resend available after 60s. | ⚪ |
| Existing user with a password can still log in with password | Backward compat. If user has a password, offer password login as an alternative on the login step. No user is forced to change their login method. | ⚪ |
| New user completes signup within combined flow | After email is identified as unknown, user is guided through the signup steps (name, location, sectors — same data as today). Account created with no password (OTP-based by default). User is authenticated immediately after first OTP verification — no separate email verification step (inbox access is implicit proof of email ownership). | ⚪ |

### 🔧 Phase B — Password Management in Settings

Post-Phase A. Allows users to manage their auth method after account creation.

| Story | Notes | Status |
|-------|-------|--------|
| User sets a password from account settings | Relevant for OTP-only users who want to add a password. Requires current authenticated session (no old password needed since they don't have one). | ⚪ |
| User changes existing password from account settings | Existing password users update their password. Requires current password confirmation. | ⚪ |
| User toggles between OTP-based and password-based login | Auth method preference stored on `UserProfile`. Toggle in account settings UI. If switching to password and none is set, prompt to set one first. | ⚪ |

### 🔮 Phase C — Polish & Simplification (nice to have)

| Story | Notes | Status |
|-------|-------|--------|
| Simplify or retire email verification step | With OTP-based auth, inbox access is implicit verification. Consider retiring the separate verification email for OTP-based users, or merging it with the first login code email. | ⚪ |
| Password reset flow simplification | Once OTP-based auth is stable, the "forgot password" flow is unnecessary for users without a password. Consider simplifying or removing it for OTP-only users. | ⚪ |

---

## Shared Architecture Notes

> ⚠️ **Implementation details belong in per-story specs and the system architect review.** This section records entities, endpoints, and constraints that are known from the technical design doc so agents don't have to rediscover them.

### New Entities (Phase A)

#### `LoginToken`

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `user_id` | FK → User, nullable | Set after lookup; null while email is unrecognised |
| `email` | String | Address the code was sent to |
| `token_hash` | String | SHA-256 (or bcrypt) hash of the raw 6-digit code — raw code never stored |
| `session_key` | String | 32-byte hex random value; ties the token to the specific browser tab |
| `redirect_url` | String, nullable | The URL the user was trying to reach before login |
| `expires_at` | DateTime | `now + 15 minutes` |
| `used_at` | DateTime, nullable | Set on first successful use — authoritative single-use guard |
| `attempt_count` | Integer | Default 0; incremented on each failed verify; token locked at 5 |
| `created_at` | DateTime | Auto |

**Key rules**: one active token per email at a time (new request invalidates previous); raw code held in memory only, never persisted; `session_key` returned to browser and stored in `sessionStorage` (tab-scoped).

**Retention**: used tokens kept 24h after use then deleted; expired unused tokens deleted 1h past `expires_at`. Both handled by a `CleanupLoginTokens` Celery beat task (runs every 30 min).

#### `LoginAuditLog`

Append-only audit table for security monitoring. Separate from `LoginToken` (which is operational and short-lived).

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `email` | String | Email used in the attempt |
| `user_id` | FK → User, nullable | Null if email not found |
| `outcome` | Enum | `requested` / `verified` / `failed` / `expired` / `exhausted` / `resent` |
| `ip_address` | String, nullable | Anonymised (last octet zeroed for IPv4) — GDPR |
| `user_agent` | String, nullable | GDPR — optional |
| `created_at` | DateTime | Auto |

**Retention**: entries purged after 90 days by `CleanupLoginAuditLogs` Celery beat task.  
**GDPR**: IP addresses must be anonymised; retention period and lawful basis (legitimate interest / security) must be documented in the privacy policy.

### New API Endpoints (Phase A)

| Endpoint | Method | Notes |
|----------|--------|-------|
| `POST /api/auth/request-token` | POST | Accepts `{ email, redirect_url }`. Validates `redirect_url` is a relative path (starts with `/`, not `//`). Always returns HTTP 200 (user enumeration prevention). Returns `{ session_key }`. Also serves as the **resend** endpoint — enforces 60s cooldown per email, invalidates previous token, issues new `session_key`. |
| `POST /api/auth/verify-token` | POST | Accepts `{ session_key, code }`. Validates expiry, single-use, attempt count, constant-time hash comparison. On success: marks token used, issues Knox `{token, expiry}`, returns `{ token, expiry, user, redirect_url }`. |

### `UserProfile` changes (Phase B)

- Add `auth_method` field (or derive from whether the user has a usable Django password): used to show correct login option on the combined page and to enforce the toggle in settings.

### What does NOT change

- Knox `AuthToken` format and storage (`{token, expiry}`, stored in cookies via `signIn()` in `UserContext`)
- `POST /logout/` endpoint (Knox `LogoutView`)
- Hub theme fetching and application (`getHubTheme()`, `transformThemeData()`)
- The `?redirect=` post-auth behaviour
- `POST /login/` (kept for password-based login — Phase A backward compat)

---

## Cross-Cutting Concerns

### Backward Compatibility

Every existing user with a password must be able to log in on day one of Phase A without any action on their part. The combined page must detect that the user has a password and offer password login as a first-class option — not buried behind an extra step.

### Security

The full security model is in [`doc/mosy/flows/passwordless-login-flow.md`](../mosy/flows/passwordless-login-flow.md). Key points for implementers:

- **Cryptographically secure generation**: `secrets.randbelow(1_000_000)` for the 6-digit code; `secrets.token_hex(32)` for `session_key`. Never `random.randint`.
- **Never store the raw code**: only `sha256(code)` or bcrypt hash in DB.
- **Constant-time comparison**: `hmac.compare_digest` in Python — prevents timing attacks.
- **User enumeration prevention**: `POST /api/auth/request-token` always returns HTTP 200, even for unknown emails.
- **Rate limiting**: 3 token requests per email per 10 min (request endpoint); 5 attempts per `session_key` (verify endpoint, enforced via `attempt_count`); 60s cooldown per email for resend.
- **Session binding**: `session_key` is the security anchor — attacker who intercepts the email cannot redeem it without the `session_key` from the original browser tab.
- **Open redirect protection**: `redirect_url` must be validated server-side to be a relative path (`/...`, not `//...` or `https://...`).
- **Email content**: 6-digit code, 15-minute expiry notice, "didn't request this?" copy — **no clickable login link** (intentional — preserves session binding).
- **HTTPS only**: `session_key` and code are sensitive in transit.
- **Security ceiling**: email inbox is the trust anchor, same as existing password reset flows. The OTP approach is more secure than password reset because every login generates a visible email notification, making unauthorised access immediately detectable.

### Hub-Aware Auth

The combined page must load hub theme data server-side when `?hub=` is present, exactly as both current pages do today (`getHubTheme()` in `getServerSideProps`). Hub redirect after login (to `/hubs/{hub}/browse`) must be preserved.

### Last Login Display

`User.last_login` (automatically updated by Django on every successful authentication) should be surfaced to the user in account settings as a security transparency feature. Consider also storing and displaying the *previous* last login (captured before `update_last_login()` is called) so users can detect unexpected access.

### Feature Toggle

Auth Unification **requires** a `FeatureToggle` named `AUTH_UNIFICATION` to enable parallel development and safe incremental rollout.

**Rationale**: The new combined flow is entirely new frontend code — new page(s), new components, new API calls. The existing `/signin` and `/signup` pages remain untouched behind the toggle. This means:
- Development can proceed on the new flow without touching or risking the legacy auth code.
- The new backend endpoints (`POST /api/auth/request-token`, `POST /api/auth/verify-token`) can be deployed independently — they are additive and do not affect the existing `POST /login/` or `POST /signup/` endpoints.
- QA and staging validation of the new flow can happen while production still runs the old flow.
- The toggle can be flipped per-environment: off on production, on on staging, on for internal users first.

**Toggle behaviour**:
- `AUTH_UNIFICATION = off` (default): `/signin` and `/signup` behave exactly as today. No change.
- `AUTH_UNIFICATION = on`: `/signin` and `/signup` redirect to the new combined page (e.g. `/login`). The new page and new API endpoints are active.

**Cutover**: once Phase A is validated on staging and production rollout is approved, the toggle is flipped to on globally and the old pages are retired in a follow-up cleanup task. The toggle itself is removed once the old code is deleted.

> The `FeatureToggle` model and `feature_toggles` app already exist in the codebase — use the established pattern.

---

## Combined Login/Signup Flow

```mermaid
flowchart TD
    A([Login Page]) --> B[User enters email]
    B --> C{Is email known?}

    C -->|No - new user| D[Show signup step 1\nFirst name, last name, location]
    D --> E[Continue signup\nInterest areas / sectors]
    E --> F[Send OTP to email\nCreate account - no password]
    F --> G[Show OTP code form]
    G --> H{Code valid?}
    H -->|Yes| I([Authenticated\nRedirect to destination])
    H -->|No / expired| G
    G -->|Resend after 60s cooldown| F

    C -->|Yes - has password| J[Show password form]
    J --> K{Password correct?}
    K -->|Yes| I
    K -->|No| J
    J -->|Forgot password| P[Send password reset email]
    P --> Q[User clicks reset link\nin email]
    Q --> R[Set new password form]
    R --> S{Password saved?}
    S -->|Yes| J
    S -->|No| R
    J -.->|Prefer OTP instead| L

    C -->|Yes - no password| L[Send OTP to email]
    L --> M[Show OTP code form]
    M --> N{Code valid?}
    N -->|Yes| I
    N -->|No / expired| M
    M -->|Resend after 60s cooldown| L
```

---

## Dependency Graph

```
Phase A — Combined entry point + token login
    │
    ├──▶ [EPIC: Event Registration] Phase 3 — guest registration becomes possible
    │
    └──▶ Phase B — Password management in settings
              │
              └──▶ Phase C — Simplify verification / password reset (nice to have)
```

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Token delivery mechanism | **6-digit OTP code** (not a magic link) | Magic links open a new browser tab, abandoning the original redirect context and breaking `session_key` binding. OTP keeps the user on the same page in the same tab. |
| Token expiry | **15 minutes** | Industry standard for OTP codes. Long enough to act on the email; short enough to limit the window for interception. |
| Session binding | `session_key` stored in `sessionStorage` (tab-scoped) | Ties the OTP to the specific browser tab that requested it. Attacker who intercepts the email cannot redeem the code without the `session_key`. |
| Token storage | Hash only (`sha256` or bcrypt) — raw code never stored | Prevents raw code exposure in case of database compromise. |
| Attempt limiting | 5 failed attempts → token locked | Prevents brute-force of the 6-digit code space (1,000,000 possibilities). |
| Rate limiting | 3 req/email/10 min (request); 60s cooldown/email (resend); IP-based secondary layer | Prevents email flooding and enumeration attacks. |
| User enumeration | `POST /api/auth/request-token` always returns HTTP 200 | Prevents attackers from discovering which emails have accounts. |
| Redirect URL safety | `redirect_url` validated server-side: must start with `/`, not `//` | Prevents open redirect attacks. |
| Implicit email verification | OTP-based users are considered verified | Inbox access is proof of email ownership; eliminates the separate verification email step for new users. |
| Existing passwords | Preserved; password login remains available via `POST /login/` | Zero migration cost; no user disruption. |
| New user default | OTP-based, no password | Simpler onboarding; passwords can be added later in settings. |
| Combined page URL | ❓ `/login` or reuse `/signin` — TBD in first story spec | Old URLs must redirect regardless of choice. |
| Knox token mechanics | Unchanged — `{token, expiry}` returned by `verify-token` same as today | Already works; no reason to change the token storage and auth middleware. |
| Audit log retention | 90 days, IP addresses anonymised | GDPR compliance; legitimate interest lawful basis for security monitoring. |


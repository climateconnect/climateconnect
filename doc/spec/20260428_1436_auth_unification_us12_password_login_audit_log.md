# US-12: Wire Password Login to `LoginAuditLog`

**Type**: User Story — pure backend change  
**Epic**: [EPIC: Auth Unification](./EPIC_auth_unification.md)  
**Status**: DRAFT  
**Created**: 2026-04-28  
**Depends on**: US-2 (`LoginToken` and `LoginAuditLog` models exist in `auth_app`)  

---

## Problem Statement

The `LoginAuditLog` table currently records every event in the OTP flow (`requested`, `verified`, `failed`, `expired`, `exhausted`, `resent`) but knows nothing about password-based logins. The existing `POST /login/` endpoint (Knox `LoginView` in `climateconnect_api`) returns success or failure without writing any audit trail.

This creates two gaps:

1. **Incomplete security history** — a user (or admin reviewing abuse patterns) cannot see password login attempts alongside OTP attempts in a single timeline.
2. **Blind spot for abuse detection** — unified queries such as "how many failed login attempts has this email had in the last hour?" return incomplete results because password failures are invisible to the audit table.

The fix is to make `POST /login/` write a `LoginAuditLog` entry on **every** attempt, success or failure, using the same schema and anonymisation rules as the OTP flow.

---

## What & Why (not How)

**What**: Extend the existing password login endpoint so that every login attempt (successful or failed) appends a row to `LoginAuditLog` with the appropriate outcome.

**Why**: Phase A of the epic introduced `LoginAuditLog` as the single source of truth for login activity. Password login is still a first-class auth method (backward compatibility), so omitting it from the audit table undermines the security monitoring and abuse-detection value the table was built for. A unified log enables cross-method analytics and simplifies future threat-detection queries.

---

## Acceptance Criteria

- [ ] Every call to `POST /login/` results in exactly one `LoginAuditLog` row being created, regardless of outcome.
- [ ] **Success path** — when the email + password are correct and the account is verified:
  - `outcome = LoginAuditLog.Outcome.VERIFIED`
  - `user` is set to the authenticated `User` instance.
  - `email` is set to the username (email address) from the request.
- [ ] **Failure path — wrong password** — when the email exists but the password is incorrect:
  - `outcome = LoginAuditLog.Outcome.FAILED`
  - `user` is set to the `User` instance that was looked up (if found).
  - `email` is set to the submitted username.
- [ ] **Failure path — email not found** — when the submitted username does not match any user:
  - `outcome = LoginAuditLog.Outcome.FAILED`
  - `user` is `null`.
  - `email` is set to the submitted username.
- [ ] **Failure path — account not verified** — when credentials are correct but `is_profile_verified` is `false`:
  - `outcome = LoginAuditLog.Outcome.FAILED`
  - `user` is set to the matched `User` instance.
  - `email` is set to the submitted username.
  - The response behaviour (HTTP 400 with `type: "not_verified"`) remains unchanged.
- [ ] **IP anonymisation** — the IP address stored in `ip_address` is passed through the same `anonymise_ip()` utility used by the OTP flow (last octet zeroed for IPv4) before saving.
- [ ] **User-Agent** — `user_agent` is truncated to 512 characters, same as OTP flow.
- [ ] **No change to response contract** — the JSON response body, HTTP status codes, and Knox token behaviour of `POST /login/` remain identical to today. The audit log is a side effect only.
- [ ] **No change to rate limiting** — `POST /login/` does not receive new rate-limit rules in this story. Existing throttling (if any) stays as-is.
- [ ] **Tests** — new test cases verify that:
  - Successful login writes one `LoginAuditLog` with `VERIFIED`.
  - Wrong password writes one `LoginAuditLog` with `FAILED` and the correct `user`.
  - Unknown email writes one `LoginAuditLog` with `FAILED` and `user=None`.
  - Unverified account writes one `LoginAuditLog` with `FAILED`.
  - Each test asserts that exactly one audit row is created per request (no duplicates, no omissions).

---

## Constraints & Context

- **Backward compatibility is non-negotiable** — the `POST /login/` endpoint is consumed by both the legacy `/signin` page and the new combined flow (US-7 password branch). Response shape, status codes, and Knox token issuance must not change.
- **Reuse existing patterns** — the OTP flow already writes audit logs via `LoginAuditLog.objects.create(...)` and the `anonymise_ip()` helper in `auth_app/utility/ip.py`. Follow the same pattern (import from `auth_app`) rather than reimplementing.
- **Model location** — `LoginAuditLog` lives in `auth_app.models`. The `POST /login/` view lives in `climateconnect_api.views.user_views`. Cross-app imports are acceptable and already happen elsewhere in the project.
- **Django `last_login`** — Django's built-in `update_last_login()` signal still fires on successful authentication. This story does not change that behaviour; `LoginAuditLog` is an additional append-only record, not a replacement.
- **GDPR** — IP anonymisation and the 90-day retention policy already established for `LoginAuditLog` apply equally to password login entries. No new retention logic is required.

---

## AI Insights

### Trade-offs & Hints

1. **Where to place the audit write** — The natural hook is inside `LoginView.post()` after authentication succeeds or fails. Because `LoginView` inherits from Knox `LoginView`, avoid overriding `post()` in a way that breaks Knox's token creation on success. The safest approach is to wrap the existing logic: run the authentication check, write the audit log based on the result, then return the original response.

2. **User lookup on failure** — `authenticate()` returns `None` for both "user not found" and "wrong password". To set `user` correctly on a wrong-password failure, you may need to look up the user by username when `authenticate()` returns `None` and the username is present. Be careful not to leak timing information that would help attackers distinguish "user not found" from "wrong password" — but note that `LoginAuditLog` rows are internal-only and not exposed via any API, so a second lookup does not create an external side channel.

3. **Import path** — `auth_app` is already installed and its models are importable from `climateconnect_api`. The existing OTP views import `anonymise_ip` from `auth_app.utility.ip` — use the same path.

4. **Test isolation** — `LoginAuditLog` rows are not cleaned up automatically between tests. Use `LoginAuditLog.objects.all().delete()` in `setUp` or assert on deltas (count before + 1) to avoid flakiness.

5. **Transaction safety** — The audit log write should happen regardless of whether the Knox token creation succeeds. Do not wrap the audit write and the Knox token creation in the same atomic block, or a token-creation failure would roll back the audit record. The audit log is intentionally outside the main transaction.

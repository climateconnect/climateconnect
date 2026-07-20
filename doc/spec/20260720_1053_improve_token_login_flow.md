# Improve Token Login Flow

**Status**: DRAFT
**Type**: Backend + Frontend — UX hardening
**Epic**: Authentication Reliability
**Issue**: https://github.com/climateconnect/climateconnect/issues/2139
**Date created**: 2026-07-20

---

## Problem Statement

A few users are unable to log in with the email token (OTP) login flow. The reported symptoms point to three distinct but related friction points in the one-time-code login experience:

1. **Premature resends invalidate prior codes.** Users press "resend" early and multiple times. Each resend invalidates all previously issued active tokens for that email (see `RequestTokenView.post`, which marks prior active tokens `used_at=now`), so only the last-sent code works. Because login emails — especially to Gmail — can be delayed by several minutes, the user often hasn't received the earlier codes yet, and ends up trying codes that were already invalidated. This produces a confusing "invalid code" loop.

2. **No reassurance that delay is normal.** Users do not understand that email delivery can take a few minutes (particularly on first login / with Gmail), and that the spam folder is worth checking. Without context, they assume the code never arrived and hammer the resend button — worsening problem #1.

3. **Copy & paste of the code can drop a digit (not a backend issue).** When a user copies the 6-digit code from the email, the clipboard often contains surrounding whitespace (e.g. `' 123456 '`). Pasting this into the MUI `TextField` triggers a lossy truncation: the input's `maxLength: 6` is applied to the **raw** pasted string *before* the `onChange` handler strips non-digits. So a paste like `' 123456 '` (8 chars) is clamped to the first 6 raw chars (`' 12345'`), and after the handler strips whitespace only `'12345'` remains — a 5-digit, invalid code. The dropped digit is gone before the digits are ever counted. This is a **client-side truncation bug**, not whitespace reaching the backend (the backend would actually accept a trimmed value fine).

### Why It Matters

The OTP login flow is the primary entry path for `auth_method = "otp"` users (the default for accounts created after the OTP migration). Login failures here directly block access to the platform and generate support burden. The fix is low-risk and improves perceived reliability without changing the security model.

---

## Core Requirements

### Change 1 — Increase resend wait time from 60s to 3 minutes

Give emails time to arrive before a user can (re)trigger a resend that invalidates the current code.

- The **frontend** resend countdown must start at **180 seconds** instead of 60.
- The **backend** resend cooldown guard must reject resends that occur **less than 180 seconds** after the most recent active token was created (currently hardcoded to 60 in `RequestTokenView.post`).
- The `Retry-After` header returned on cooldown must reflect the new window.

### Change 2 — Add an informational note below the token input field

Display a reassuring, localized message beneath the code `TextField` explaining that delivery can take a few minutes and the spam folder is worth checking.

- German: "Noch keine E-Mail angekommen? Das kann – besonders beim ersten Login – ein paar Minuten dauern. Schau in der Zwischenzeit gern im Spam-Ordner nach. Ein erneuter Versand ist in Kürze möglich."
- English: "Haven't received an email yet? It may take a few minutes—especially when logging in for the first time. In the meantime, feel free to check your spam folder. You'll be able to resend it shortly."
- The text must be added as i18n keys (both `en` and `de`) in `frontend/public/texts/profile_texts.tsx`, following the existing pattern of the other `profile` text keys.
- The note should be visible whenever the OTP input is shown (not only after an error), so users see it before they panic-resend.

### Change 3 — Handle copy/paste of the code without dropping digits

Ensure pasting a code that contains surrounding whitespace (e.g. `' 123456 '`) always yields the full 6-digit code, never a truncated one.

- **Root cause to fix**: `maxLength: 6` on the input truncates the *raw* pasted string before the `onChange` handler strips non-digits, so whitespace consumes character slots and a digit gets dropped (see AI Agent Insights for the exact trace).
- The `onChange` handler should strip non-digits **and** cap to 6 digits based on the *stripped* value. Concretely, the `maxLength` restriction must not truncate the pre-strip string — either remove `maxLength` (relying on `.slice(0, 6)` of the stripped value) or add an `onPaste` handler that reads `clipboardData`, strips, and sets state directly.
- A leading/trailing `.trim()` on the pasted text before stripping digits is a good complement so the digit count is never affected by surrounding spaces.
- **Backend**: A defensive `.strip()` on the `code` field in `VerifyTokenSerializer` (or `VerifyTokenView`) is still worthwhile as defense-in-depth so the API tolerates any stray whitespace the client might send — but it is *not* the primary fix, because the digit-loss happens client-side before submission.

---

## System Impact

### Files Affected

| File | Change |
|------|--------|
| `frontend/src/components/auth/AuthOtp.tsx` | Change `RESEND_COOLDOWN_SECONDS` from `60` to `180`; trim whitespace from `code` on change/submit; render the new informational note below the `TextField`. |
| `frontend/public/texts/profile_texts.tsx` | Add new i18n keys (en + de) for the "haven't received an email" note. |
| `backend/auth_app/views.py` | Change the resend cooldown threshold in `RequestTokenView.post` from `60` to `180` seconds; update `Retry-After` accordingly. |
| `backend/auth_app/serializers.py` | Trim whitespace from the `code` field in `VerifyTokenSerializer` (or normalize in `VerifyTokenView`). |

### No Changes Required

| File | Reason |
|------|--------|
| `backend/auth_app/models.py` (`LoginToken`, `LoginAuditLog`) | No schema change; cooldown is computed from `created_at`. |
| `backend/auth_app/tasks.py` (`send_login_code_email`) | Email content/sending unchanged. |
| Per-email / per-IP rate limits in `RequestTokenView.dispatch` (`3/10m`, `30/h`) | Out of scope; these are separate from the resend cooldown. |
| Token expiry (15 min) and attempt limit (5) | Unchanged. |

---

## Acceptance Criteria

- [ ] Frontend resend countdown starts at 180 seconds (`RESEND_COOLDOWN_SECONDS = 180`).
- [ ] Backend rejects resends made less than 180 seconds after the most recent active token, returning HTTP 429 with a `Retry-After` reflecting the remaining window.
- [ ] New i18n text keys for the "haven't received an email" note exist in `en` and `de` in `profile_texts.tsx`.
- [ ] The informational note is rendered beneath the OTP `TextField` in `AuthOtp.tsx` (visible in both locales).
- [ ] Pasting a code that contains surrounding whitespace (e.g. `' 123456 '` or `'123456 '`) results in the full 6-digit code being accepted (no digit dropped) — verified on the frontend. The digit-loss-from-`maxLength` bug is fixed (root cause in AI Agent Insights).
- [ ] As defense-in-depth, the backend `VerifyTokenSerializer.code` strips surrounding whitespace before comparison.
- [ ] Existing `AuthOtp.test.tsx` tests are updated where they assert the `60s` countdown label, and new tests cover the 180s window and whitespace trimming.
- [ ] Backend tests pass (`python manage.py test auth_app --keepdb`), including any new test for the 180s cooldown and code trimming.
- [ ] Frontend builds and lints cleanly (`yarn lint`).

---

## Non-Goals

- Changing the per-email (`3/10m`) or per-IP (`30/h`) request rate limits.
- Changing token lifetime (15 min) or the max-attempt lockout (5).
- Changing email deliverability infrastructure (SPF/DKIM are already configured and verified; out of scope).
- Changing the multi-token invalidation behavior on resend (we mitigate its impact via the longer cooldown and clearer messaging rather than altering the security model).
- Adding backend translation/i18n for the note (note is rendered by the frontend).

---

## AI Agent Insights

### Where the resend cooldown lives (two places must stay in sync)

There are **two independent** resend gates and both must be updated together, or the client and server will disagree:
- **Client**: `RESEND_COOLDOWN_SECONDS` in `frontend/src/components/auth/AuthOtp.tsx:19` drives the visible button countdown. If only the backend is changed, the button re-enables at 60s but the server still 429s until 180s — confusing UX.
- **Server**: `RequestTokenView.post` in `backend/auth_app/views.py` computes `seconds_since = (now - recent_token.created_at).total_seconds()` and blocks while `< 60`. This is the authoritative guard. The existing tests in `backend/auth_app/tests/test_request_token.py` (e.g. the `resend` user scenario using `seconds_ago=120`) will need their expectations updated.

### Why longer cooldown helps even though it doesn't change invalidation

On resend, `RequestTokenView.post` invalidates all prior active tokens for the email (`LoginToken.objects.filter(...).update(used_at=now)`). With a 60s cooldown, an impatient user can generate several codes in the first few minutes — and the email they eventually open is likely an early, already-invalidated one. Pushing the cooldown to 180s strongly discouragives repeated resends within the typical Gmail delay window, so the code the user receives is almost always the still-valid latest one. The informational note reinforces this by setting expectations up front.

### The paste bug is a client-side truncation, not a backend whitespace problem

The `onChange` handler at `AuthOtp.tsx:253` does `e.target.value.replace(/\D/g, "").slice(0, 6)`, which correctly strips non-digits and caps at 6. The real culprit is the `maxLength: 6` on the raw `<input>` (`AuthOtp.tsx:255`), which truncates the **unstripped** pasted string *before* `onChange` runs:

- Paste `' 123456 '` (8 chars, space + 6 digits + space).
- `maxLength: 6` clamps the input to the first 6 raw characters → `' 12345'` (space + `12345`).
- `onChange` strips non-digits → `'12345'` → stored as a 5-digit code → invalid.

So a digit is silently dropped by `maxLength` before the digits are even counted. This is why the user saw `'12345'` after pasting `' 123456 '`.

**Fix direction** (implementer's choice, but must avoid the truncation):
- Remove `maxLength` (or raise it well above 6) and rely on `.slice(0, 6)` of the **stripped** value to cap length — so spaces never consume slots. OR
- Add an `onPaste` handler that reads `e.clipboardData.getData("text")`, `.trim()`s and `.replace(/\D/g, "")`s it, then `setCode(... .slice(0, 6))` directly, bypassing the native maxLength truncation.

The backend `VerifyTokenSerializer.code` (`backend/auth_app/serializers.py:14`) is a plain `CharField` with no normalization. A backend `.strip()` is still good defense-in-depth, but it does **not** address this bug — by the time anything is submitted, the digit is already gone client-side. Do not rely on the backend fix alone.

### Test references to update

- `frontend/src/components/auth/AuthOtp.test.tsx` asserts `/resend code \(60s\)/i` in several places (lines ~91, 122, 297). These must become `180s`.
- Add/adjust a frontend test that pastes `' 123456 '` (or `' 123456'`) and asserts the resulting `code` state/ submitted value is the full `'123456'` (6 digits) — confirming the `maxLength`-truncation bug is fixed and no digit is dropped.
- `backend/auth_app/tests/test_request_token.py` resend scenario uses `seconds_ago=120` to test the cooldown; verify it still exercises the new 180s boundary (e.g. test that a resend at <180s is blocked and ≥180s is allowed). Optionally add a test that a `code` sent with surrounding whitespace still verifies.

---

## Implementation Notes

### Frontend

1. In `AuthOtp.tsx`, set `const RESEND_COOLDOWN_SECONDS = 180;`.
2. Fix the paste truncation: ensure the 6-digit cap is applied to the **digit-stripped** value, not the raw `maxLength`-truncated string. Either remove/raise `maxLength` and rely on `.slice(0, 6)` of the stripped value, or add an `onPaste` handler that reads the clipboard, trims, strips non-digits, and sets state directly. Verify pasting `' 123456 '` yields `'123456'`.
3. Add a `Typography` (or `Box`) node beneath the `TextField` (after line ~264) that renders `texts.code_delivery_note` (or similarly named key) with appropriate styling/`aria` for accessibility.
4. Add the two i18n keys to `profile_texts.tsx` following the existing `en`/`de` object pattern used by `enter_your_code`, `we_sent_a_code_to`, etc.

### Backend

1. In `RequestTokenView.post`, replace the `seconds_since < 60` comparison (and the `retry_after = int(60 - seconds_since) + 1` calc) with `180`.
2. In `VerifyTokenSerializer` (or at the top of `VerifyTokenView.post`), strip surrounding whitespace from the validated `code` before hashing/comparison, as defense-in-depth. This is secondary to the frontend fix — the digit-loss happens client-side.

> Note: Implementation details above are guidance for the assigned developer; the agent should follow repo conventions and the AGENTS.md backend/frontend instructions (use `pdm run` for backend, `yarn` for frontend; run `make format` and `yarn lint` before committing).

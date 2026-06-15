# Sentry GDPR Compliance — Frontend & Backend

**Date**: 2026-06-11  
**Status**: DRAFT  
**Type**: Full Stack — compliance / security  
**GitHub Issue**: —  

---

## Problem Statement

Sentry is used across the stack for error monitoring and performance tracing. The frontend integration was recently added (branch `add-Sentry-to-front`), and the backend integration has been running since earlier. Both implementations lack GDPR-specific configuration. Since Climate Connect is based in Germany and serves EU users, we are obligated to comply with GDPR when processing personal data through third-party processors like Sentry.

Sentry's [GDPR Best Practices](https://sentry.io/trust/privacy/gdpr-best-practices/) identifies six compliance areas. Our implementations fail on **Data Minimization** — the most critical technical requirement.

### Why it matters

- **Legal exposure**: Sending unscrubbed PII (IP addresses, headers, request bodies containing user data) to a US-based processor violates GDPR data minimization principles. Fines can reach €20M or 4% of annual turnover.
- **User trust**: Climate Connect's audience is climate-conscious and privacy-aware. Transparent handling of error monitoring data aligns with our values.

### Legal basis: Legitimate Interest (no consent required)

Error monitoring qualifies as a **legitimate interest** under GDPR Art. 6(1)(f). Consent is NOT required because:

| Factor | Assessment |
|--------|-----------|
| **Legitimate interest** | Detecting and fixing bugs that affect users — strong |
| **Necessity** | Error monitoring is standard practice for maintaining service quality — strong |
| **Impact on data subjects** | With data minimisation layers: no IP, no user agent, no request bodies, no headers, no cookies — minimal |
| **Reasonable expectation** | Users of a web service reasonably expect it to work and be maintained — strong |

This means:
- **No consent gating** — Sentry initializes for all users, which maximizes error visibility
- **No traffic loss** — every user gets error monitoring coverage

The requirements are: **transparency** (privacy policy), **data minimization** (SDK scrubbing), and **accountability** (documented balancing test — this spec).

### Current state

**Frontend** (three Sentry init files):
- `sendDefaultPii: true` (deprecated) — all PII collection enabled
- No `beforeSend` hook — no PII scrubbing
- `SENTRY_AUTH_TOKEN` exposed to client bundle (security issue)
- Stale `@sentry/react` v7 dependency

**Backend** (`settings.py`):
- `send_default_pii=True` — IP, user agent, headers, cookies, user info all sent
- `traces_sample_rate=1.0` — 100% of transactions captured
- `max_request_body_size` at default (`medium` = 10KB) — request bodies with PII captured
- No `before_send` hook
- No `event_scrubber` configured
- Integrations: Django, Celery, Redis (fine to keep)

---

## Scope

### In scope

1. Frontend: `dataCollection` (replacing deprecated `sendDefaultPii`) + `beforeSend` scrubbing
2. Frontend: reduce `tracesSampleRate`, remove `SENTRY_AUTH_TOKEN` from client env, remove stale `@sentry/react`
3. Backend: `send_default_pii=False`, `max_request_body_size="never"`, `traces_sample_rate=0.2`
4. Backend: `before_send` hook + `event_scrubber` with `pii_denylist`
5. Verify and document DPA signing, EU region, and privacy policy updates

### Out of scope

- Consent gating for Sentry (not required — legitimate interest applies)
- Sentry Relay setup — only needed if SDK-level scrubbing proves insufficient
- Session Replay configuration — not currently enabled
- Data Subject Access Request (DSAR) tooling — manual process for now

---

## Acceptance Criteria

### Frontend

#### AC-F1: `dataCollection` configured across all configs (replaces deprecated `sendDefaultPii`)

**Client** (`instrumentation-client.ts`) — maximum data minimisation:
```typescript
dataCollection: {
  userInfo: false,
  cookies: false,
  httpHeaders: false,
  httpBodies: [],        // Prevents capturing outgoing request bodies (form data with PII)
  queryParams: true,     // Kept — hub slugs, page numbers, no PII
}
```

**Server/Edge** (`sentry.server.config.ts`, `sentry.edge.config.ts`) — identity/cookie disabled, bodies kept:
```typescript
dataCollection: {
  userInfo: false,
  cookies: false,
  httpHeaders: false,
  // httpBodies defaults to all types — KEPT intentionally.
  // The Next.js server only handles SSR data fetching from the Django API
  // (public page data). User form submissions go browser → Django API
  // directly, bypassing the Next.js server entirely.
  queryParams: false,
}
```

#### AC-F2: `beforeSend` hook scrubs residual PII (client-side, defense in depth)

A `beforeSend` hook on the client-side Sentry init strips data that `dataCollection` might not cover:
- `event.request.data` — request body
- `event.request.headers` — `Authorization`, `Cookie`, etc.
- `event.request.cookies`
- `event.user` object

URLs and query parameters are kept — they contain only public hub slugs and page numbers.

#### AC-F3: Reasonable server/edge sampling rates

- `sentry.server.config.ts`: `tracesSampleRate: 0.2` (20%)
- `sentry.edge.config.ts`: `tracesSampleRate: 0.2` (20%)
- `instrumentation-client.ts`: `tracesSampleRate: 0.1` (10%) — already reasonable

#### AC-F4: `SENTRY_AUTH_TOKEN` removed from client-exposed env

Remove from `next.config.js` `env` block. Only needed at build time for source map uploads.

#### AC-F5: Stale `@sentry/react` dependency removed

Remove `@sentry/react` v7.46.0 from `package.json`. `@sentry/nextjs` v10 bundles its own React integration.

---

### Backend

#### AC-B1: `send_default_pii=False`

Set `send_default_pii=False` in `sentry_sdk.init()`. This disables automatic collection of:
- User IP address
- User agent string
- Request headers
- Request cookies
- User info (if any integration sets it)

#### AC-B2: Field-level PII redaction via `before_send`

Instead of stripping entire request bodies or removing PII fields, **redact** them with `"[REDACTED]"`. This preserves the data structure for debugging — you can see *which* fields were submitted without seeing the actual personal data.

**PII fields redacted in any request body** (verified against `request.data` usage in views, June 2026):

| Category | Fields | Context |
|----------|--------|---------|
| Identity | `username`, `email`, `email_address`, `first_name`, `last_name`, `biography` | API request bodies |
| Profile images | `image`, `thumbnail_image`, `background_image` | API request bodies (base64 data URLs) |
| Credentials | `password`, `old_password`, `new_password`, `confirm_password`, `password_reset_key` | API request bodies |
| Auth tokens | `session_key`, `code` | API request bodies (OTP flow) |
| Free text | `message_content`, `message`, `content` | API request bodies |
| Registration | `custom_field_answers` | API request bodies (organiser-defined fields) |
| Local variables | `user` | Celery task stack frames (Django User object with `.email`, `.first_name`) |
| Nested dicts | `Email` | Mailjet API payload in email utility stack frames |

**NOT redacted** (kept for debugging): `location` (geo data, public on profiles/projects), `website` (public URLs), `name`, `description`, `short_description`, `sectors`, `skills`, notification preferences (`email_on_*`), etc.

**Always stripped (not redacted):** headers, cookies, user object — these have no debugging value.

Example profile edit POST:
```json
{
  "first_name": "[REDACTED]",
  "last_name": "[REDACTED]",
  "biography": "[REDACTED]",
  "location": "Berlin, Germany",
  "website": "https://jane.example.com"
}
```

#### AC-B3: `traces_sample_rate=0.2`

Reduce from `1.0` (100%) to `0.2` (20%). 100% transaction capture is excessive and sends maximum data to Sentry.

#### AC-B4: `event_scrubber` with extended PII denylist

Configure the built-in `EventScrubber` with a denylist that combines Sentry's default PII keys (IP addresses) with our `_SENTRY_PII_FIELDS` (identity, credentials, messages). The scrubber runs on the **entire event payload** — request data, local variables in stack frames, breadcrumbs, exception values.

This is critical for Celery task failures (e.g., email sending via Mailjet). When a task fails, local variables like `user` (Django User object with `.email`, `.first_name`) are captured in the stack frame. The `before_send` hook only scrubs `request.data` (which doesn't exist for Celery tasks). The `event_scrubber` catches the same field names in local variables. `Email` (capitalized) catches the Mailjet API payload key in nested dicts.

**Known limitation**: scrubbing is by exact key name. A variable named `recipient_email` would NOT be caught by the `email` entry. This is the same limitation as `before_send` and is accepted as residual risk.

#### AC-B5: `before_send` hook (defense in depth)

A `before_send` hook strips any residual request data that might contain PII:
- `event["request"]["data"]` — request body (defense in depth for `max_request_body_size`)
- `event["request"]["headers"]` — may contain `Authorization`, `Cookie`
- `event["request"]["cookies"]`

The hook returns the event (not `None`) — errors are reported, just scrubbed.

---

## Constraints

- **No consent gating** — Sentry initializes unconditionally in production. Error monitoring operates under legitimate interest (Art. 6(1)(f) GDPR).
- **No Sentry Relay** — SDK-level scrubbing is sufficient for current scale.
- **Server-side scrubbing rules** — configure in Sentry's UI as a final safety net for residual PII in error messages.
- **Architecture**: Browser → Django API (direct, not through Next.js). Next.js server only does SSR fetching of public data. Backend Sentry handles the actual request processing where PII lives.

---

## Domain Context

### Architecture and PII flow

```
Browser ──POST /api/edit_profile/──→ Django API (sentry: backend)
   │                                      │
   │ GET /projects/erlangen               │ Response (200/500)
   │                                      │
   ▼                                      ▼
Next.js SSR ──GET /api/projects/──→ Django API
(sentry: server)                    (sentry: backend)
```

- **Browser → Django**: User form submissions (PII in request body). Captured by **backend** Sentry.
- **Next.js → Django**: SSR data fetching (public page data). Captured by **backend** Sentry.
- **Browser errors**: JavaScript errors, unhandled promises. Captured by **client-side** Sentry.

### Data scrubbing layers

**Frontend (client):**

| Layer | Mechanism | What it catches |
|-------|-----------|-----------------|
| 1. `dataCollection` | SDK config | IP, user agent, headers, cookies, request/response bodies |
| 2. `beforeSend` | Client code | Residual request data, headers, user object (defense in depth) |

**Frontend (server/edge):**

| Layer | Mechanism | What it catches |
|-------|-----------|-----------------|
| 1. `dataCollection` | SDK config | IP, user agent, headers, cookies (bodies kept — SSR only) |

**Backend:**

| Layer | Mechanism | What it catches |
|-------|-----------|-----------------|
| 1. `send_default_pii=False` | SDK config | IP, user agent, user info |
| 2. `before_send` (field-level) | Python code | Known PII fields redacted to "[REDACTED]" + headers, cookies, user object |
| 3. `event_scrubber` (extended denylist) | SDK built-in | Same PII field names scrubbed from local variables, breadcrumbs, exception values |

**Sentry project settings (all environments):**

| Layer | Mechanism | What it catches |
|-------|-----------|-----------------|
| 5. Server-side scrubbing rules | Sentry UI | Custom patterns (project-specific PII formats) |

### What residual PII risk remains

Error **messages** (free-form text from Django or third-party libraries) could theoretically contain PII. The `event_scrubber` with `pii_denylist` catches common patterns (emails, phone numbers, credit cards). Server-side scrubbing rules in Sentry's UI provide an additional safety net. This residual risk is accepted under GDPR Art. 5(1)(c) — data minimization, not elimination.

### Privacy policy

The privacy policy is hosted on Webflow. It must be updated to mention Sentry as a subprocessor and document the legitimate interest basis. This is a content/legal task, tracked as a dependency.

---

## Open Questions

1. **DPA signed.** ✅ Sentry Data Processing Addendum is in place.

2. **EU data region.** ✅ Sentry account is configured to store data in the EU.

3. **Privacy policy update.** 🔄 Webflow-hosted privacy policy to be updated.

4. **Sentry server-side scrubbing rules.** Should we configure additional project-level scrubbing rules in Sentry's UI for patterns common to Climate Connect (e.g., email addresses, user IDs in specific formats)?

---

## Research Notes

### Python SDK `before_send` — field-level PII redaction

The `before_send` hook receives the full event dict including `event["request"]["data"]` (the request body). PII fields are replaced with `"[REDACTED]"` rather than removed — this preserves the data structure so developers can see which fields were submitted without exposing personal data.

The PII fields are defined in `_SENTRY_PII_FIELDS` in `settings.py`. This list should be updated when new endpoints or fields are added that could contain personal data.

`custom_field_answers` is redacted entirely because event registration fields are organiser-defined and can request arbitrary PII (phone numbers, dietary needs, accessibility requirements). These cannot be filtered by field name before deserialization.

### Python SDK `event_scrubber`

From [Sentry Python docs](https://docs.sentry.io/platforms/python/data-management/sensitive-data/#event-scrubber):

The `EventScrubber` scrubs values whose keys match a built-in denylist. With `pii_denylist=True`, it additionally scrubs values matching PII patterns (emails, phone numbers, SSNs, credit cards) when `send_default_pii=False`.

Default denylist includes: `password`, `secret`, `api_key`, `authorization`, `cookie`, `session`, `ip_address`, `sentry_dsn`.

PII denylist adds: `email`, `phone`, `ssn`, `credit_card`, `card_cvv`, `card_expiry`.

### Python SDK `before_send`

From [Sentry Python docs](https://docs.sentry.io/platforms/python/configuration/options/#before_send):

> This function is called with the event payload, and can return a modified event object, or `None` to skip reporting the event. This can be used for manual PII stripping before sending.

### Frontend `dataCollection` documentation

From [Sentry JS docs](https://docs.sentry.io/platforms/javascript/configuration/options/#dataCollection):

Controls which categories of data the SDK collects automatically. Available since v10.57.0. Replaces deprecated `sendDefaultPii`.

### Why `sendDefaultPii` is insufficient (frontend)

`sendDefaultPii` (deprecated, removed in v11) only controls automatic IP collection. It does NOT control `httpBodies` collection — the primary PII vector on the client side.

### GDPR Art. 5(1)(c) — Data Minimization

> Personal data shall be adequate, relevant and limited to what is necessary in relation to the purposes for which they are processed.

The purpose is error monitoring. The minimum necessary data is: error stack traces, breadcrumbs (without PII), and application context. The scrubbing layers above achieve this.

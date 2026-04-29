# US-13: Auth Funnel Analytics Tracking

**Status**: DRAFT  
**Type**: Frontend + Backend — analytics instrumentation  
**Epic**: [EPIC: Auth Unification](./EPIC_auth_unification.md)  
**Date created**: 2026-04-28  
**Depends on**: US-5 (combined auth page), US-6 (OTP code entry), US-7 (password login), US-8 (new user signup) — all auth flow steps must be implemented first to identify exact tracking points

---

## Problem Statement

We need to understand where users drop off during the signup/login flow to optimize conversion. The new combined auth flow introduces multiple paths (new user signup, OTP login, password login) with several steps each. Without funnel analytics, we cannot:

1. Identify which step has the highest drop-off rate
2. Compare conversion rates between OTP vs password login
3. Detect technical issues (e.g., high failure rates at specific steps)

We have Google Analytics 4 (GA4) already installed via `react-ga4`, but it only tracks users who accept the statistics cookie. Users who block analytics client-side are invisible, which skews the data.

---

## Architecture

### Two-Tier Tracking Strategy

**Tier 1: GA4 Custom Events (Frontend)**
- Tracks users who accept statistics cookies
- Captures UI-level interactions and state transitions
- Uses existing `ReactGA` from `UserContext`
- No additional infrastructure required

**Tier 2: Backend Proxy (Server-Side)**
- Tracks all users regardless of client-side blocking
- Optional implementation — can be added if GA4 data proves insufficient
- Proxies events to GA4 Measurement Protocol from the backend
- Ensures complete funnel visibility

### Event Schema

All events follow GA4 custom event format with consistent parameters:

```typescript
// Base parameters (included in all events)
{
  hub_slug?: string,                  // If ?hub= present
  locale: string,                    // "en" | "de"
}

// Event-specific parameters documented below
```

---

## Event Definitions

### Phase A: Combined Auth Flow Events

#### Email Entry Step (US-5)

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `auth_email_entered` | User submits email form | `user_status: "new" \| "returning_password" \| "returning_otp"` |
| `auth_email_error` | `check-email` API fails | `error_type: "network" \| "rate_limit" \| "server_error"` |

#### New User Signup Flow (US-8)

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `auth_signup_started` | Transition to signup step 1 (after `user_status: "new"`) | — |
| `auth_signup_name_submitted` | User submits first/last name | — |
| `auth_signup_location_submitted` | User submits location | — |
| `auth_signup_interests_submitted` | User submits interest areas/sectors | — |
| `auth_signup_error` | Signup API fails | `error_type: "validation" \| "network" \| "server_error"` |

#### OTP Flow (US-6)

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `auth_otp_requested` | `request-token` called (on mount or resend) | `is_resend: boolean` |
| `auth_otp_code_entered` | User submits 6-digit code | — |
| `auth_otp_verified` | `verify-token` succeeds | `auth_type: "otp"` |
| `auth_otp_failed` | `verify-token` fails | `failure_reason: "expired" \| "invalid_code" \| "max_attempts" \| "session_mismatch"` |
| `auth_otp_resent` | User clicks resend button | — |

#### Password Login Flow (US-7)

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `auth_password_entered` | User submits password | — |
| `auth_password_failed` | Password login fails | `failure_reason: "invalid_credentials" \| "network" \| "server_error"` |
| `auth_password_forgot_clicked` | User clicks "Forgot password?" link | — |

#### Completion

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `auth_completed` | Successful authentication (OTP or password) | `auth_type: "otp" \| "password"`, `user_type: "new" \| "returning"` |


---

## Implementation: Tier 1 (GA4 Frontend)

### Location

Add tracking calls in the following components:

- `frontend/src/components/auth/AuthEmailStep.tsx` — email entry events
- `frontend/src/components/auth/AuthSignupStep.tsx` — signup flow events (US-8)
- `frontend/src/components/auth/AuthOtp.tsx` — OTP events (US-6)
- `frontend/src/components/auth/AuthPassword.tsx` — password events (US-7)
- `frontend/pages/login.tsx` — completion event

### Helper Function

Create `frontend/src/utils/analytics.ts`:

```typescript
export const trackAuthEvent = (
  eventName: string,
  params: Record<string, string | number | boolean>,
  ReactGA: any
) => {
  if (typeof window === "undefined") return; // SSR guard
  
  ReactGA.event(eventName, params);
};
```

### Usage Pattern

```typescript
// In component
const { ReactGA, locale, hubUrl } = useUserContext();

trackAuthEvent("auth_email_entered", {
  hub_slug: hubUrl,
  locale: locale,
  user_status: userStatus,
}, ReactGA);
```

### Cookie Consent Check

GA4 is already initialized only when `acceptedStatistics` cookie is present (see `_app.tsx` lines 67-80). Events sent via `ReactGA.event()` will only fire when GA4 is initialized. No additional consent check needed.

---

## Implementation: Tier 2 (Backend Proxy - Optional)

### When to Implement

Implement Tier 2 if:
- GA4 data shows significant drop-off but sample size is small (due to ad blockers)
- Stakeholders require complete funnel visibility regardless of consent
- Funnel analysis reveals unexpected patterns that need server-side validation

### Architecture

**Backend endpoint**: `POST /api/analytics/event`

**Request body**:
```json
{
  "event_name": "auth_email_entered",
  "parameters": {
    "auth_flow": "combined",
    "user_status": "new",
    "locale": "en",
    "hub_slug": "berlin"
  },
  "client_id": "anonymous_client_id"  // Generated server-side for correlation
}
```

**Backend flow**:
1. Accept event from frontend (sent via `apiRequest` regardless of GA4 initialization)
2. Validate event name against allowlist (security)
3. Forward to GA4 Measurement Protocol: `https://www.google-analytics.com/mp/collect`
4. Requires `GA_MEASUREMENT_ID` and `GA_API_SECRET` environment variables

**Frontend changes**:
- Add `trackAuthEventServerSide()` helper that calls `/api/analytics/event`
- Call this in addition to `trackAuthEvent()` for dual tracking
- Server-side events fire even when GA4 is not initialized

### Security Considerations

- Event name allowlist prevents abuse
- Rate limit per IP (using existing `django-ratelimit`)
- No PII in event parameters (email never sent)
- `client_id` is anonymized UUID, not user identifier

---

## Acceptance Criteria

### Tier 1 (GA4 Frontend)

- [ ] `frontend/src/utils/analytics.ts` created with `trackAuthEvent` helper
- [ ] All events implemented in respective auth components (US-5, US-6, US-7, US-8)
- [ ] Events include base parameters: `locale`, `hub_slug` (if present)
- [ ] Events include event-specific parameters per schema above
- [ ] `auth_completed` event fires on successful OTP and password authentication
- [ ] Events only fire when GA4 is initialized (respects cookie consent)
- [ ] Tests: mock `ReactGA.event` and verify correct parameters passed for each event
- [ ] Documentation: add comment in each component where events are fired

### Tier 2 (Backend Proxy - Optional)

- [ ] `POST /api/analytics/event` endpoint created
- [ ] Event name allowlist implemented (security)
- [ ] Rate limiting applied (per IP)
- [ ] GA4 Measurement Protocol integration working
- [ ] `GA_MEASUREMENT_ID` and `GA_API_SECRET` environment variables documented
- [ ] Frontend helper `trackAuthEventServerSide()` created
- [ ] Dual tracking: both frontend GA4 and backend proxy called for each event
- [ ] Tests: endpoint validation, rate limiting, Measurement Protocol forwarding

---

## Viewing the Funnel

### GA4 Funnel Exploration

1. Go to GA4 → **Explore**
2. Create **Funnel exploration**
3. Add steps in sequence:
   - Step 1: Event `auth_email_entered`
   - Step 2: Event `auth_signup_started` (for new users) OR `auth_otp_requested` (for returning OTP) OR `auth_password_entered` (for returning password)
   - Step 3: Continue with subsequent events based on path
   - Final step: Event `auth_completed`
4. Break down by `user_status` or `auth_type` to compare paths

---

## Step-by-Step Implementation Plan

### Step 1 — Wait for auth flow completion

This story cannot start until US-5, US-6, US-7, and US-8 are implemented. The exact component structure and state transitions must be known to place tracking calls correctly.

### Step 2 — Create analytics helper

Create `frontend/src/utils/analytics.ts` with `trackAuthEvent` function.

### Step 3 — Add Tier 1 events to components

Go through each auth component and add `trackAuthEvent` calls at state transitions:
- `AuthEmailStep.tsx`: `auth_email_entered`, `auth_email_error`
- `AuthSignupStep.tsx`: `auth_signup_started`, `auth_signup_*_submitted`, `auth_signup_error`
- `AuthOtp.tsx`: `auth_otp_requested`, `auth_otp_code_entered`, `auth_otp_verified`, `auth_otp_failed`, `auth_otp_resent`
- `AuthPassword.tsx`: `auth_password_entered`, `auth_password_failed`, `auth_password_forgot_clicked`
- `login.tsx`: `auth_completed`

### Step 4 — Test

Write tests that mock `ReactGA.event` and verify correct event names and parameters are called.

### Step 6 — Verify in GA4

Test the flow in staging with statistics cookies accepted. Verify events appear in GA4 → Realtime → Events.

### Step 7 — (Optional) Implement Tier 2

If GA4 data proves insufficient, implement backend proxy per Tier 2 architecture.

---

## Non-Negotiable Constraints

1. **No PII in events** — email addresses, names, or any personally identifiable information must never be sent to GA4
2. **Respect cookie consent** — Tier 1 events only fire when GA4 is initialized (already handled by existing logic)
3. **Event name consistency** — use exact event names from schema to enable funnel visualization
4. **Server-side proxy is optional** — only implement if data shows it's needed
5. **No performance impact** — analytics calls must be fire-and-forget, never block UI
6. **SSR guard** — `trackAuthEvent` must check `typeof window !== "undefined"` to prevent server-side errors

---

## Resolved Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Tracking approach | Two-tier (GA4 + optional backend proxy) | GA4 is fastest path; backend proxy available if ad blockers skew data |
| Event schema | Custom events with consistent base parameters | GA4 custom events support funnel exploration natively; base parameters enable filtering |
| Helper function | Centralized `trackAuthEvent` in `analytics.ts` | DRY, easy to modify event format globally, simple to test |
| Backend proxy timing | Implement only if needed | Avoids unnecessary backend work; GA4 may be sufficient |
| PII handling | Explicitly prohibited in event params | GDPR compliance; email never sent to analytics |
| Client ID for backend proxy | Server-generated anonymized UUID | Enables correlation without exposing user identity |

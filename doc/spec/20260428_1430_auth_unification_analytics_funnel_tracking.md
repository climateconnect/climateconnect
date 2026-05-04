# US-13: Auth Funnel Analytics Tracking

**Status**: DRAFT
**Type**: Frontend + Backend — analytics instrumentation
**Epic**: [EPIC: Auth Unification](./EPIC_auth_unification.md)
**Date created**: 2026-04-28
**Updated**: 2026-05-04 — tracking events migrated to [Analytics Events Reference](../mosy/metrics/analytics_events.md)
**Depends on**: US-5 (combined auth page), US-6 (OTP code entry), US-7 (password login), US-8 (new user signup) — all auth flow steps must be implemented first to identify exact tracking points

> **Note**: Implementation details (event schema, helper function, component locations) are maintained in the permanent [Analytics Events Reference](../mosy/metrics/analytics_events.md). This spec provides context and acceptance criteria only.

---

## Problem Statement

We need to understand where users drop off during the signup/login flow to optimize conversion. The new combined auth flow introduces multiple paths (new user signup, OTP login, password login) with several steps each. Without funnel analytics, we cannot:

1. Identify which step has the highest drop-off rate
2. Compare conversion rates between OTP vs password login
3. Detect technical issues (e.g., high failure rates at specific steps)
4. Understand which form fields cause friction (e.g., location selection difficulty)

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

#### Step View Events

Step view events fire when a user is presented with a new step. These are essential for funnel analysis because they mark the "entry" point of each step, enabling drop-off calculation.

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `auth_step_viewed` | User is presented with a new auth step | `step: "email_entry" \| "signup_personal_info" \| "signup_interests" \| "password_login" \| "forgot_password" \| "otp_entry"`, `user_status?: "new" \| "returning"` |

#### Email Entry Step (US-5)

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `auth_email_entered` | User submits email form | `user_status: "new" \| "returning_password" \| "returning_otp"` |
| `auth_email_error` | `check-email` API fails | `error_type: "network" \| "rate_limit" \| "server_error" \| "validation"` |

#### New User Signup Flow (US-8)

The signup flow consists of two steps managed by `AuthSignupStep`:
1. **Personal info** (`SignupPersonalInfoStep`): first name, last name, location, terms — submitted together
2. **Interests** (`SignupInterestsStep`): sector selection — submitted separately

**Step-level events:**

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `auth_signup_started` | Transition to signup personal info step | — |
| `auth_signup_personal_info_submitted` | User submits personal info (all fields together) | — |
| `auth_signup_interests_submitted` | User submits interest sectors | `sector_count: number` |
| `auth_signup_error` | Signup API fails | `error_type: "validation" \| "network" \| "server_error"`, `step: "personal_info" \| "interests"` |

**Field-level events (for drop-off analysis within personal info step):**

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `auth_signup_field_focused` | User focuses a signup field | `field_name: "first_name" \| "last_name" \| "location" \| "terms" \| "interests"`, `step: "personal_info" \| "interests"` |
| `auth_signup_field_filled` | User leaves a field that now has a value | `field_name`, `step` |
| `auth_signup_field_error` | Field validation fails on submit | `field_name`, `step`, `error_type: "required" \| "invalid"` |

> **Rationale for field-level tracking**: The personal info step combines first name, last name, location, and terms acceptance into a single submit. Without field-level events, we cannot determine which specific field causes users to abandon the step. Location selection is a known friction point — these events let us quantify that.

#### OTP Flow (US-6)

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `auth_otp_requested` | `request-token` called (on mount or resend) | `is_resend: boolean` |
| `auth_otp_code_entered` | User submits 6-digit code | — |
| `auth_otp_verified` | `verify-token` succeeds | `auth_type: "otp"` |
| `auth_otp_failed` | `verify-token` fails | `failure_reason: "expired" \| "invalid_code" \| "max_attempts" \| "rate_limit" \| "network"` |

#### Password Login Flow (US-7)

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `auth_password_entered` | User submits password | — |
| `auth_password_failed` | Password login fails | `failure_reason: "invalid_credentials" \| "not_verified" \| "rate_limit" \| "network" \| "server_error"` |
| `auth_password_forgot_clicked` | User clicks "Forgot password?" link | — |
| `auth_switch_to_otp_clicked` | User clicks "Use a code instead" | — |

#### Completion

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `auth_completed` | Successful authentication (OTP or password) | `auth_type: "otp" \| "password"`, `user_type: "new" \| "returning"` |


---

## Implementation: Tier 1 (GA4 Frontend)

### Location

Add tracking calls in the following components:

- `frontend/src/components/auth/AuthEmailStep.tsx` — email entry events
- `frontend/src/components/auth/SignupPersonalInfoStep.tsx` — signup field-level + step events
- `frontend/src/components/auth/SignupInterestsStep.tsx` — signup interests events
- `frontend/src/components/auth/AuthPasswordLogin.tsx` — password events
- `frontend/src/components/auth/AuthOtp.tsx` — OTP events
- `frontend/pages/login.tsx` — step view events and `auth_completed` via `onSuccess` handlers

### Helper Function

Create `frontend/src/utils/analytics.ts`:

```typescript
export const trackAuthEvent = (
  eventName: string,
  params: Record<string, string | number | boolean>,
  ReactGA: any
) => {
  if (typeof window === "undefined") return; // SSR guard
  if (!ReactGA) return; // GA not initialized (no cookie consent or ad blocker)
  
  ReactGA.event(eventName, params);
};
```

### Usage Pattern

```typescript
// In component
const { ReactGA, locale, hubUrl } = useContext(UserContext);

trackAuthEvent("auth_email_entered", {
  hub_slug: hubUrl,
  locale: locale,
  user_status: userStatus,
}, ReactGA);
```

### Cookie Consent Check

GA4 is already initialized only when `acceptedStatistics` cookie is present (see `_app.tsx` lines 67-80). Events sent via `ReactGA.event()` will only fire when GA4 is initialized. The `trackAuthEvent` helper adds an additional `ReactGA` truthiness check. No additional consent logic needed.

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
- [ ] All events implemented in respective auth components
- [ ] Events include base parameters: `locale`, `hub_slug` (if present)
- [ ] Events include event-specific parameters per schema above
- [ ] `auth_step_viewed` fires on every step transition in `login.tsx`
- [ ] `auth_completed` event fires on successful OTP and password authentication
- [ ] Field-level events (`auth_signup_field_focused`, `auth_signup_field_filled`, `auth_signup_field_error`) implemented in `SignupPersonalInfoStep.tsx`
- [ ] Events only fire when GA4 is initialized (respects cookie consent)
- [ ] Tests: mock `ReactGA.event` and verify correct parameters passed for key events
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
   - Step 1: Event `auth_step_viewed` with parameter `step: "email_entry"`
   - Step 2: Event `auth_email_entered`
   - Step 3: Event `auth_step_viewed` with parameter `step: "signup_personal_info"` (for new users) OR `auth_step_viewed` with parameter `step: "password_login"` (for returning password) OR `auth_step_viewed` with parameter `step: "otp_entry"` (for returning OTP)
   - Step 4: Event `auth_signup_personal_info_submitted` (new users) OR `auth_password_entered` (returning password)
   - Step 5: Event `auth_step_viewed` with parameter `step: "signup_interests"` (new users) OR `auth_otp_code_entered` (OTP path)
   - Step 6: Event `auth_signup_interests_submitted` (new users only)
   - Final step: Event `auth_completed`
4. Break down by `user_status` or `auth_type` to compare paths

### Field-Level Drop-off Analysis

To analyze drop-off within the personal info step:
1. In GA4 → **Explore** → **Free form**
2. Set dimension: `field_name`
3. Set metric: Event count for `auth_signup_field_focused` and `auth_signup_field_filled`
4. Compare ratios to identify fields with low completion rates

---

## Step-by-Step Implementation Plan

### Step 1 — Wait for auth flow completion

This story cannot start until US-5, US-6, US-7, and US-8 are implemented. The exact component structure and state transitions must be known to place tracking calls correctly.

### Step 2 — Create analytics helper

Create `frontend/src/utils/analytics.ts` with `trackAuthEvent` function.

### Step 3 — Add step view tracking

In `frontend/pages/login.tsx`, fire `auth_step_viewed` whenever `currentStep` changes.

### Step 4 — Add Tier 1 events to components

Go through each auth component and add `trackAuthEvent` calls at state transitions:
- `AuthEmailStep.tsx`: `auth_email_entered`, `auth_email_error`
- `SignupPersonalInfoStep.tsx`: `auth_signup_field_focused`, `auth_signup_field_filled`, `auth_signup_field_error`, `auth_signup_personal_info_submitted`
- `SignupInterestsStep.tsx`: `auth_signup_field_focused`, `auth_signup_field_filled`, `auth_signup_interests_submitted`
- `AuthOtp.tsx`: `auth_otp_requested`, `auth_otp_code_entered`, `auth_otp_verified`, `auth_otp_failed`
- `AuthPasswordLogin.tsx`: `auth_password_entered`, `auth_password_failed`, `auth_password_forgot_clicked`, `auth_switch_to_otp_clicked`, `auth_completed`

### Step 5 — Test

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
7. **Debounced field events** — field focus/fill events must not flood GA4; use simple first-interaction-only tracking per session or debounce

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
| Field-level tracking | Focus/fill/error events on signup fields | Required to identify friction within multi-field steps like personal info |
| Step view events | `auth_step_viewed` on every step transition | Enables accurate funnel visualization with entry/exit rates per step |

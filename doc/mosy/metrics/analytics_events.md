# Analytics Events Reference

This document catalogs all Google Analytics 4 (GA4) custom events tracked across the Climate Connect platform. It serves as the permanent reference for analytics instrumentation, replacing information previously captured in ephemeral spec documents.

**Related documents:**
- [Auth Unification Spec](../spec/20260428_1430_auth_unification_analytics_funnel_tracking.md) — implementation context
- [Event Registration Spec](../spec/20260430_0949_event_registration_analytics_funnel.md) — implementation context

---

## Tracking Architecture

### Two-Tier Strategy

**Tier 1: GA4 Custom Events (Frontend)**
- Tracks users who accept statistics cookies via `react-ga4`
- Captures UI-level interactions and state transitions
- No additional infrastructure required
- Events only fire when GA4 is initialized (respects cookie consent)

**Tier 2: Backend Proxy (Server-Side) — Optional**
- Tracks all users regardless of client-side blocking
- Proxies events to GA4 Measurement Protocol from the backend
- Implement only if GA4 data proves insufficient due to ad blockers

### Event Helper

The tracking helper is implemented at [`frontend/src/utils/analytics.ts`](../../frontend/src/utils/analytics.ts).

```typescript
import { trackAuthEvent } from "../../utils/analytics";

// In component
const { ReactGA, locale, hubUrl } = useContext(UserContext);

trackAuthEvent("auth_email_entered", {
  hub_slug: hubUrl,
  locale: locale,
  user_status: userStatus,
}, ReactGA);
```

**Usage rules:**
- SSR guard is handled by the helper (`typeof window !== "undefined"` check)
- GA4 initialization check is handled by the helper (`if (!ReactGA) return`)
- Always pass `ReactGA` from `UserContext` as the last argument
- Base parameters (`hub_slug`, `locale`) should be included for context

### Base Parameters

All events include these base parameters when applicable:

| Parameter | Type | Description |
|-----------|------|-------------|
| `hub_slug` | `string \| undefined` | If `?hub=` query param is present |
| `locale` | `string` | User's language (`"en"` \| `"de"`) |

---

## Event Catalog

### Category: Authentication (`auth_*`)

Events for the combined login/signup flow at `/login`.

#### Step View Events

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `auth_step_viewed` | User is presented with a new auth step | `step: "email_entry" \| "signup_personal_info" \| "signup_interests" \| "password_login" \| "forgot_password" \| "otp_entry"`, `user_status?: "new" \| "returning"` |

#### Email Entry Step

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `auth_email_entered` | User submits email form | `user_status: "new" \| "returning_password" \| "returning_otp"` |
| `auth_email_error` | `check-email` API fails | `error_type: "network" \| "rate_limit" \| "server_error" \| "validation"` |

#### New User Signup Flow

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

#### OTP Flow

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `auth_otp_requested` | `request-token` called (on mount or resend) | `is_resend: boolean` |
| `auth_otp_code_entered` | User submits 6-digit code | — |
| `auth_otp_verified` | `verify-token` succeeds | `auth_type: "otp"` |
| `auth_otp_failed` | `verify-token` fails | `failure_reason: "expired" \| "invalid_code" \| "max_attempts" \| "rate_limit" \| "network"` |

#### Password Login Flow

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

### Category: Event Registration (`event_registration_*`)

Events for the event registration funnel via `EventRegistrationModal`.

#### Entry & Intent

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `event_registration_button_impression` | Registration button renders on event page or card | `location: "event_page" \| "browse_card" \| "similar_projects_sidebar"`, `event_slug: string`, `registration_status: "open" \| "closed" \| "full"` |
| `event_registration_modal_opened` | User clicks register button, modal opens | `user_type: "authenticated" \| "guest"`, `event_slug: string`, `has_available_seats: boolean` |

#### Authenticated Flow

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `event_registration_confirm_shown` | Authenticated user sees confirmation step | `event_slug: string` |
| `event_registration_confirmed` | User clicks "Confirm registration" | `event_slug: string`, `available_seats_at_click: number \| null` |
| `event_registration_success` | Registration API returns 200/201 | `event_slug: string`, `user_type: "authenticated" \| "guest"` |
| `event_registration_cancelled` | User clicks cancel/close before confirming | `step: "confirm"`, `user_type: "authenticated" \| "guest"` |

#### Guest Auth Flow (inside modal)

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `event_registration_auth_started` | Guest submits email in modal | `event_slug: string`, `entry_method: "register_button"` |
| `event_registration_auth_method_selected` | After check-email, path is determined | `auth_path: "password" \| "otp" \| "signup"`, `event_slug: string` |
| `event_registration_auth_completed` | `signIn()` succeeds inside modal | `auth_path: "password" \| "otp" \| "signup"`, `event_slug: string` |
| `event_registration_auth_abandoned` | Modal closed during auth flow | `auth_step: "email" \| "password" \| "otp" \| "signup_personal_info" \| "signup_otp"`, `event_slug: string` |

#### Error States

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `event_registration_error` | Registration API fails after confirmation | `error_type: "network" \| "full" \| "closed" \| "ended" \| "server_error"`, `event_slug: string` |

---

## Adding New Events

When adding new analytics events, follow this checklist:

### Schema Requirements

- [ ] Event name follows `_{category}_{action}` pattern (e.g., `auth_email_entered`)
- [ ] Event name is in snake_case
- [ ] All parameters use snake_case
- [ ] No PII is sent (email, name, user ID never included)
- [ ] Base parameters (`hub_slug`, `locale`) included where applicable

### Implementation Requirements

- [ ] Tracking call placed at correct trigger point (state transition, user action, API response)
- [ ] `trackAuthEvent` helper used (or new category-specific helper if needed)
- [ ] SSR guard in place (`typeof window !== "undefined"`)
- [ ] GA4 initialization check (`if (!ReactGA) return`)
- [ ] Comment added in component explaining where/why event fires

### Privacy Requirements

- [ ] Event only fires when statistics cookie consent is granted
- [ ] Event tested manually in staging with consent enabled
- [ ] Event NOT tested with ad blocker (GA4 won't fire; verify server-side fallback if needed)

### Documentation Requirements

- [ ] Event added to this catalog with full parameter documentation
- [ ] Acceptance criteria updated in relevant spec
- [ ] GA4 funnel exploration steps updated if applicable

---

## Viewing Funnels in GA4

### Auth Funnel

1. Go to GA4 → **Explore**
2. Create **Funnel exploration**
3. Add steps in sequence:
   - **Step 1**: Event `auth_step_viewed` with parameter `step: "email_entry"`
   - **Step 2**: Event `auth_email_entered`
   - **Step 3**: Event `auth_step_viewed` with parameter `step: "signup_personal_info"` (for new users) **OR** `auth_step_viewed` with parameter `step: "password_login"` (for returning password) **OR** `auth_step_viewed` with parameter `step: "otp_entry"` (for returning OTP)
   - **Step 4**: Event `auth_signup_personal_info_submitted` (new users) **OR** `auth_password_entered` (returning password)
   - **Step 5**: Event `auth_step_viewed` with parameter `step: "signup_interests"` (new users) **OR** `auth_otp_code_entered` (OTP path)
   - **Step 6**: Event `auth_signup_interests_submitted` (new users only)
   - **Final step**: Event `auth_completed`
4. Break down by `user_status` or `auth_type` to compare paths

### Field-Level Drop-off Analysis (Auth)

To analyze drop-off within the personal info step:
1. In GA4 → **Explore** → **Free form**
2. Set dimension: `field_name`
3. Set metric: Event count for `auth_signup_field_focused` and `auth_signup_field_filled`
4. Compare ratios to identify fields with low completion rates

### Event Registration Funnel

1. Go to GA4 → **Explore**
2. Create **Funnel exploration**
3. Add steps in sequence:
   - **Step 1**: Event `event_registration_button_impression`
   - **Step 2**: Event `event_registration_modal_opened`
   - **Step 3**: Event `event_registration_auth_started` (guests) **OR** `event_registration_confirm_shown` (authenticated)
   - **Step 4**: Event `event_registration_auth_completed` (guests) **OR** `event_registration_confirmed` (authenticated)
   - **Final step**: Event `event_registration_success`
4. Break down by `user_type` to compare guest vs authenticated paths

### Event Registration Auth Drop-off Analysis

To analyze where guests abandon the auth flow inside the registration modal:
1. In GA4 → **Explore** → **Funnel exploration**
2. Use steps: `event_registration_auth_started` → `event_registration_auth_completed` → `event_registration_success`
3. The drop-off between auth_started and auth_completed shows auth abandonment
4. Use `auth_step` parameter from `event_registration_auth_abandoned` to identify which step causes most drop-offs

### Button Impression Performance

To analyze registration button performance by location:
1. In GA4 → **Explore** → **Free form**
2. Dimension: `location`
3. Metrics: `event_registration_button_impression`, `event_registration_modal_opened`
4. Calculate conversion rate: `modal_opened / impression` per location

---

## Non-Negotiable Constraints

1. **No PII in events** — email addresses, names, or any personally identifiable information must never be sent to GA4
2. **Respect cookie consent** — events only fire when GA4 is initialized (handled by `trackAuthEvent` helper)
3. **Event name consistency** — use exact event names from this catalog to enable funnel visualization
4. **No performance impact** — analytics calls must be fire-and-forget, never block UI
5. **SSR guard** — all tracking calls must check `typeof window !== "undefined"` to prevent server-side errors
6. **Debounced field events** — field focus/fill events use first-interaction-only tracking per session to avoid flooding GA4

---

## Environment Variables (Tier 2 Backend Proxy)

If Tier 2 is implemented, these environment variables are required:

| Variable | Description |
|----------|-------------|
| `GA_MEASUREMENT_ID` | GA4 Measurement ID (e.g., `G-XXXXXXXXXX`) |
| `GA_API_SECRET` | GA4 API Secret for Measurement Protocol |

See [Auth Unification Spec](../spec/20260428_1430_auth_unification_analytics_funnel_tracking.md) for backend proxy architecture details.

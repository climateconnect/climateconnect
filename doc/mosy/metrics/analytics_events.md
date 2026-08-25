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
import { trackGA4Event } from "../../utils/analytics";

// In component
const { ReactGA, locale, hubUrl } = useContext(UserContext);

trackGA4Event("auth_email_entered", {
  hub_slug: hubUrl,
  locale: locale,
  user_status: userStatus,
}, ReactGA);
```

`trackAuthEvent` is a backward-compatible alias for `trackGA4Event`. Existing auth components continue to use it; new event registration code should use `trackGA4Event`.

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

Events for the event registration funnel via `EventRegistrationModal`. All events include `event_slug` for funnel segmentation by event.

#### Entry & Intent

| Event Name | Trigger | Parameters | Implementation Location |
|------------|---------|------------|------------------------|
| `event_registration_button_impression` | Registration button renders on event page or card | `surface: "event_page" \| "browse_card" \| "similar_projects_sidebar"`, `event_slug: string`, `registration_status: "open" \| "closed" \| "full"` | `RegistrationActionButton.tsx` (useEffect on mount) and `ProjectMetaData.tsx` (useEffect on mount) |
| `event_registration_modal_opened` | User clicks register button, modal opens | `user_type: "authenticated" \| "guest"`, `event_slug: string`, `has_available_seats: boolean` | `ProjectPageRoot.tsx` — `handleRegisterClick` |

#### Authenticated Flow

| Event Name | Trigger | Parameters | Implementation Location |
|------------|---------|------------|------------------------|
| `event_registration_confirm_shown` | Authenticated user sees confirmation step (fires once per modal session) | `event_slug: string` | `EventRegistrationModal.tsx` — useEffect (guarded by `confirmShownFiredRef`) |
| `event_registration_confirmed` | User clicks "Confirm registration" (fires before API call) | `event_slug: string`, `available_seats_at_click: number \| null` | `EventRegistrationModal.tsx` — `handleRegister` |
| `event_registration_success` | Registration API returns 200/201 | `event_slug: string`, `user_type: "authenticated"` | `EventRegistrationModal.tsx` — `handleRegister` success branch |
| `event_registration_cancelled` | User clicks cancel/close while on the confirmation step | `step: "confirm"`, `user_type: "authenticated"` | `EventRegistrationModal.tsx` — `handleClose` |

#### Guest Auth Flow (inside modal)

| Event Name | Trigger | Parameters | Implementation Location |
|------------|---------|------------|------------------------|
| `event_registration_auth_started` | Guest submits email in modal (fires on `check-email` success) | `event_slug: string`, `entry_method: "register_button"` | `EventRegistrationModal.tsx` — `handleUserStatusDetermined` |
| `event_registration_auth_method_selected` | After `check-email` returns, auth path is determined | `auth_path: "password" \| "otp" \| "signup"`, `event_slug: string` | `EventRegistrationModal.tsx` — `handleUserStatusDetermined` |
| `event_registration_auth_completed` | Auth step succeeds inside modal (password/otp/signup `onSuccess` fires) | `auth_path: "password" \| "otp" \| "signup"`, `event_slug: string` | `EventRegistrationModal.tsx` — `onSuccess` callbacks on `AuthPasswordLogin`, `AuthOtp`, `AuthSignupStep` |
| `event_registration_auth_abandoned` | Modal closed during auth flow (not on email step) | `auth_step: "password" \| "otp" \| "signup"`, `event_slug: string` | `EventRegistrationModal.tsx` — `handleClose` |

#### Custom Fields (optional step)

| Event Name | Trigger | Parameters | Implementation Location |
|------------|---------|------------|------------------------|
| `event_registration_custom_fields_started` | First interaction with any custom registration field (checkbox toggled, option selected, inventory option/quantity changed, time slot selected). Fires once per modal session. | `event_slug: string`, `field_count: number` | `RegistrationFieldAnswersForm.tsx` — `onFirstInteraction` callback via `notifyFirstInteraction()` ref guard; `EventRegistrationModal.tsx` passes the callback |

#### Error States

| Event Name | Trigger | Parameters | Implementation Location |
|------------|---------|------------|------------------------|
| `event_registration_error` | Registration API fails after confirmation | `error_type: "network" \| "full" \| "closed" \| "ended" \| "server_error"`, `event_slug: string` | `EventRegistrationModal.tsx` — `handleRegister` catch branch |

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
- [ ] `trackGA4Event` helper used (or `trackAuthEvent` for backward compatibility in existing auth components)
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

### Prerequisites: Custom Dimensions

Before creating funnels, register these custom dimensions in GA4:

1. Go to **Configure → Custom definitions → Custom dimensions**
2. Create the following dimensions with the matching parameter names:

**Auth funnel dimensions:**

| Dimension Name | Parameter | Description |
|----------------|-----------|-------------|
| `step` | `step` | Auth step identifier (for `auth_step_viewed`) |
| `user_status` | `user_status` | New vs returning user status |
| `auth_type` | `auth_type` | Auth method used (OTP, password) |
| `user_type` | `user_type` | User classification: `"new" \| "returning"` in auth events |

**Event registration funnel dimensions:**

| Dimension Name | Parameter | Description |
|----------------|-----------|-------------|
| `event_slug` | `event_slug` | Event URL slug for segmentation |
| `surface` | `surface` | UI surface where the button rendered (event_page, browse_card, similar_projects_sidebar) |
| `auth_path` | `auth_path` | Auth path in registration modal (password, otp, signup) |
| `registration_status` | `registration_status` | Event registration status (open, closed, full) |
| `error_type` | `error_type` | Error classification for failed registrations |
| `user_type` | `user_type` | User classification: `"authenticated" \| "guest"` in event registration events |

These dimensions are required for funnel step conditions and breakdowns.

---

### Auth Funnel (3 Separate Funnels)

The auth flow has 3 distinct paths. Create **separate funnel explorations** for each to accurately track drop-offs. **Note:** Because these funnels pre-filter by `user_status` or path, users on the "wrong" path will show as dropped off after Step 1 or 2. This is expected — use [Path Exploration](#alternative-path-exploration-for-auth-flow) (below) to see the full branching picture, and these funnels to measure conversion rates on each known path.

#### Funnel 1: New User Signup

| Step | Event | Condition |
|------|-------|-----------|
| Step 1 | `auth_step_viewed` | `step` equals `email_entry` |
| Step 2 | `auth_email_entered` | `user_status` equals `new` |
| Step 3 | `auth_step_viewed` | `step` equals `signup_personal_info` |
| Step 4 | `auth_signup_personal_info_submitted` | — |
| Step 5 | `auth_step_viewed` | `step` equals `signup_interests` |
| Step 6 | `auth_signup_interests_submitted` | — |
| Step 7 | `auth_step_viewed` | `step` equals `otp_entry` |
| Step 8 | `auth_otp_code_entered` | — |
| Step 9 | `auth_otp_verified` | — |
| Final step | `auth_completed` | `user_type` equals `new` |

#### Funnel 2: Returning User (Password Login)

| Step | Event | Condition |
|------|-------|-----------|
| Step 1 | `auth_step_viewed` | `step` equals `email_entry` |
| Step 2 | `auth_email_entered` | `user_status` equals `returning_password` |
| Step 3 | `auth_step_viewed` | `step` equals `password_login` |
| Step 4 | `auth_password_entered` | — |
| Final step | `auth_completed` | `auth_type` equals `password` |

#### Funnel 3: Returning User (OTP Login)

| Step | Event | Condition |
|------|-------|-----------|
| Step 1 | `auth_step_viewed` | `step` equals `email_entry` |
| Step 2 | `auth_email_entered` | `user_status` equals `returning_otp` |
| Step 3 | `auth_step_viewed` | `step` equals `otp_entry` |
| Step 4 | `auth_otp_code_entered` | — |
| Step 5 | `auth_otp_verified` | — |
| Final step | `auth_completed` | `auth_type` equals `otp` |

---

### GA4 Funnel Step Configuration

For each step in GA4 Funnel Exploration:

1. **Event name**: Enter the exact event name (e.g., `auth_step_viewed`)
2. **Add condition** (optional): Click "Add condition" to filter by parameter
   - Select the dimension (e.g., `step`, `user_status`)
   - Condition: `equals`
   - Value: the expected value (e.g., `email_entry`)
3. **Step name**: Arbitrary label for your reference (not used for matching)
4. **"Indirectly followed by"** vs **"Directly followed by"**:
   - **Directly followed by** (default): User must complete this step and then immediately the next step, with no other events in between
   - **Indirectly followed by**: User must complete this step, then at some later point complete the next step (other events may occur in between)

**Recommendation**: Use **"Indirectly followed by"** for all funnel steps. Since Climate Connect uses a React SPA with modal-based flows (auth, event registration), intermediate events such as `auth_signup_field_focused`, `auth_signup_field_filled`, scroll events, and other GA4 auto-collected events will fire between funnel steps. "Directly followed by" treats any intervening event as a break in the funnel chain, causing steps to appear empty or users to show as dropped off even when they completed the full flow. "Indirectly followed by" correctly counts users who complete both steps in order regardless of what happens in between.

**Note**: Conditions in funnel steps use AND logic — the user must match all conditions for the step.

---

### Alternative: Single Funnel with Breakdown

Instead of 3 separate funnels, you can create **one funnel** with all shared steps and use "Break down by" to separate paths:

1. Create funnel with shared steps: `auth_step_viewed` (email_entry) → `auth_email_entered` → `auth_completed`
2. After creating the funnel, click **"Break down by"**
3. Select `user_status` or `auth_type`
4. GA4 will show separate columns for each value

**Limitation**: This works best when paths share most steps. Since the 3 auth flows diverge significantly after Step 2, separate funnels (above) provide cleaner drop-off analysis.

### Alternative: Path Exploration for Auth Flow

Since the auth flow branches into multiple paths (signup, password login, OTP login), a **Path Exploration** in GA4 often provides better insight than funnel explorations. Path Exploration shows the actual sequence of events users take, including branching and backtracking, without requiring you to pre-define the expected path.

#### Setting Up Auth Path Exploration

1. Go to GA4 → **Explore** → **Path exploration**
2. Set **Starting point**: Event `auth_step_viewed` with condition `step` equals `email_entry`
3. The exploration will automatically show all events that occur next, branching by frequency
4. Click any node to expand the next step in that branch

#### Recommended Path Exploration Configuration

| Setting | Value |
|---------|-------|
| **Starting point** | `auth_step_viewed` where `step = email_entry` |
| **Ending point** (optional) | `auth_completed` — to see only successful completions |
| **Breakdown** | `user_status` — to see how new vs returning users diverge |
| **Node type** | Event name (default) |

#### What Path Exploration Reveals That Funnels Don't

- **Actual branching**: Shows that after `auth_email_entered`, users split into `auth_step_viewed` (password_login), `auth_step_viewed` (otp_entry), or `auth_step_viewed` (signup_personal_info) — all on one diagram
- **Backtracking**: Users who go back (e.g., click "Use a code instead" after seeing the password step) are visible as loops
- **Drop-off context**: You can see exactly which event users last fired before dropping off, without needing separate funnels per path
- **Side events**: Scroll, click, and other auto-collected events show up, helping identify UI issues

#### Complementary Use

Use Path Exploration and Funnel Explorations together:
- **Path Exploration** for discovery — understand what paths users actually take
- **Funnel Explorations** for measurement — track conversion rates on known, well-defined paths

### Field-Level Drop-off Analysis (Auth)

To analyze drop-off within the personal info step:
1. In GA4 → **Explore** → **Free form**
2. Set dimension: `field_name`
3. Set metric: Event count for `auth_signup_field_focused` and `auth_signup_field_filled`
4. Compare ratios to identify fields with low completion rates

### Event Registration Funnel

Create **two separate funnel explorations** — one for authenticated users, one for guests — since the flows diverge after the modal opens.

#### Funnel A: Authenticated Registration

| Step | Event | Condition |
|------|-------|-----------|
| Step 1 | `event_registration_button_impression` | — |
| Step 2 | `event_registration_modal_opened` | `user_type` equals `authenticated` |
| Step 3 | `event_registration_confirm_shown` | — |
| Step 4 | `event_registration_confirmed` | — |
| Final step | `event_registration_success` | — |

#### Funnel B: Guest Registration (with auth inside modal)

| Step | Event | Condition |
|------|-------|-----------|
| Step 1 | `event_registration_button_impression` | — |
| Step 2 | `event_registration_modal_opened` | `user_type` equals `guest` |
| Step 3 | `event_registration_auth_started` | — |
| Step 4 | `event_registration_auth_method_selected` | — |
| Step 5 | `event_registration_auth_completed` | — |
| Step 6 | `event_registration_confirmed` | — |
| Final step | `event_registration_success` | — |

#### Combined Funnel with Breakdown

To create a single funnel with guest vs authenticated breakdown:

1. Go to GA4 → **Explore** → **Funnel exploration**
2. Add steps:
   - **Step 1**: `event_registration_button_impression`
   - **Step 2**: `event_registration_modal_opened`
   - **Step 3**: `event_registration_auth_started` **OR** `event_registration_confirm_shown` (use "Indirectly followed by")
   - **Step 4**: `event_registration_auth_completed` **OR** `event_registration_confirmed` (use "Indirectly followed by")
   - **Final step**: `event_registration_success`
3. Click **"Break down by"** → `user_type`

**Note**: Since guest and authenticated paths fire different events at Steps 3-4, this combined funnel will show drop-off at the "wrong" path's events. Use the separate funnels above for accurate per-path conversion rates.

### Event Registration Auth Drop-off Analysis

To analyze where guests abandon the auth flow inside the registration modal:
1. In GA4 → **Explore** → **Funnel exploration**
2. Use steps: `event_registration_auth_started` → `event_registration_auth_completed` → `event_registration_success`
3. The drop-off between auth_started and auth_completed shows auth abandonment
4. Use `auth_step` parameter from `event_registration_auth_abandoned` to identify which step causes most drop-offs

### Custom Fields Drop-off Analysis

To analyze drop-off at the custom fields step:
1. In GA4 → **Explore** → **Funnel exploration**
2. Use steps: `event_registration_custom_fields_started` → `event_registration_confirmed` → `event_registration_success`
3. The drop-off between custom_fields_started and confirmed shows users who started filling custom fields but did not complete registration
4. Filter by `event_slug` to analyze per-event

### Button Impression Performance

To analyze registration button performance by surface:
1. In GA4 → **Explore** → **Free form**
2. Dimension: `surface`
3. Metrics: `event_registration_button_impression`, `event_registration_modal_opened`
4. Calculate conversion rate: `modal_opened / impression` per surface

---

## Non-Negotiable Constraints

1. **No PII in events** — email addresses, names, or any personally identifiable information must never be sent to GA4
2. **Respect cookie consent** — events only fire when GA4 is initialized (handled by `trackGA4Event` helper)
3. **Event name consistency** — use exact event names from this catalog to enable funnel visualization
4. **No performance impact** — analytics calls must be fire-and-forget, never block UI
5. **SSR guard** — all tracking calls must check `typeof window !== "undefined"` to prevent server-side errors
6. **Debounced field events** — field focus/fill events use first-interaction-only tracking per session to avoid flooding GA4
7. **No regression** — existing `auth_*` events must continue to fire unchanged when auth components are used inside the event registration modal

---

## Environment Variables (Tier 2 Backend Proxy)

If Tier 2 is implemented, these environment variables are required:

| Variable | Description |
|----------|-------------|
| `GA_MEASUREMENT_ID` | GA4 Measurement ID (e.g., `G-XXXXXXXXXX`) |
| `GA_API_SECRET` | GA4 API Secret for Measurement Protocol |

See [Auth Unification Spec](../spec/20260428_1430_auth_unification_analytics_funnel_tracking.md) for backend proxy architecture details.

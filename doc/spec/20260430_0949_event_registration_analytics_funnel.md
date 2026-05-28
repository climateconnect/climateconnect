# Event Registration Analytics Funnel Tracking

**Status**: COMPLETED
**Type**: Frontend — analytics instrumentation
**Epic**: [EPIC: Event Registration](./EPIC_event_registration.md)
**Date created**: 2026-04-30
**Updated**: 2026-05-04 — tracking events migrated to [Analytics Events Reference](../mosy/metrics/analytics_events.md)
**Depends on**:
- [`20260430_0936_guest_event_registration_auth_integration.md`](./20260430_0936_guest_event_registration_auth_integration.md) — guest auth flow inside modal must be implemented first so tracking points are known
- [`20260428_1430_auth_unification_analytics_funnel_tracking.md`](./20260428_1430_auth_unification_analytics_funnel_tracking.md) — auth analytics helper/utils should be in place

> **Note**: Event definitions are maintained in the permanent [Analytics Events Reference](../mosy/metrics/analytics_events.md). This spec provides implementation context only.

## Problem Statement

The Event Registration epic introduces a new conversion funnel with multiple entry points and user states (authenticated vs guest). Without dedicated analytics, we cannot measure:

1. **Conversion rate from event page view to registration** — the primary success metric
2. **Guest vs authenticated split** — what percentage of registrations come from new account creation inside the modal vs already-logged-in users
3. **Auth drop-off inside the modal** — where guests abandon the combined login/signup flow before completing registration
4. **Channel attribution** — whether users arrive via direct event link, browse page, project sidebar, or email

We already have GA4 via `react-ga4` and the auth analytics infrastructure from the Auth Unification epic. This task extends that foundation to cover the event registration funnel.

---

## Core Requirements

### Funnel Overview

```
Event Page View
    │
    ├──▶ Click "Register" button
    │         │
    │         ├──▶ Authenticated user → [Custom fields] → Confirm → Success
    │         │
    │         └──▶ Guest user → Auth flow (email → password/OTP/signup)
    │                       │
    │                       ├──▶ Auth succeeds → [Custom fields] → Confirm → Success
    │                       │
    │                       └──▶ Auth abandoned → Drop-off
    │
    └──▶ No click → Bounce
```

The `[Custom fields]` step is optional — only shown when the event has configured custom registration fields. Since each event's form is unique, there is no fixed per-field funnel. Instead, a single `event_registration_custom_fields_started` event fires on the first interaction with any custom field, enabling drop-off analysis between "started filling in details" and "completed registration".

### Event Definitions

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

#### Custom Fields (optional step)

| Event Name | Trigger | Parameters |
|------------|---------|------------|
| `event_registration_custom_fields_started` | First interaction with any custom registration field (checkbox toggled, option selected, inventory option/quantity changed, time slot selected) | `event_slug: string`, `field_count: number` |

---

## Non-Functional Requirements

- **Privacy compliant**: only track users who accepted statistics cookies (same pattern as auth analytics).
- **No PII in events**: `event_slug` is acceptable; never include user email or name.
- **Consistent parameter naming**: reuse parameter names from the auth analytics spec where applicable (`user_type`, `auth_path`, etc.).
- **De-duplication guard**: `event_registration_success` must fire only once per actual registration, even if the user clicks "Try again" after an error.
- **No regression**: The login flow event tracking must not be affected by this change. Since this is touching the same components that are being used in two different flows.
---

## AI Agent Insights and Additions

### Integration with Auth Analytics

The guest auth steps inside the modal are the same components used by `/login`. The auth analytics spec already defines events like `auth_email_entered`, `auth_otp_verified`, and `auth_completed`. **This spec does not duplicate those events** — it adds event-registration-specific wrapping events (`event_registration_auth_started`, `event_registration_auth_completed`) that provide the event context (`event_slug`) the auth events lack.

Recommended approach: the modal's `onUserStatusDetermined` callback fires `event_registration_auth_started`, and the modal's `onAuthSuccess` callback fires `event_registration_auth_completed`. The underlying auth components continue to fire their own `auth_*` events. This gives two views of the same funnel:
- Auth funnel (universal): `auth_email_entered` → `auth_completed`
- Event registration funnel (contextual): `event_registration_modal_opened` → `event_registration_auth_started` → `event_registration_auth_completed` → `event_registration_confirmed` → `event_registration_success`

### Where to Add Tracking Calls

| Component | Events to Fire |
|-----------|---------------|
| `ProjectOverview.tsx` / `ProjectMetaData.tsx` | `event_registration_button_impression` when the register button renders |
| `EventRegistrationModal.tsx` — `handleRegisterClick` | `event_registration_modal_opened` |
| `EventRegistrationModal.tsx` — `handleUserStatusDetermined` (new callback) | `event_registration_auth_started`, `event_registration_auth_method_selected` |
| `EventRegistrationModal.tsx` — `handleAuthSuccess` (new callback) | `event_registration_auth_completed` |
| `RegistrationFieldAnswersForm.tsx` — first field interaction | `event_registration_custom_fields_started` (fires once per modal session; guarded by a ref) |
| `EventRegistrationModal.tsx` — `handleRegister` (authenticated) | `event_registration_confirmed` |
| `EventRegistrationModal.tsx` — `handleRegister` success branch | `event_registration_success` |
| `EventRegistrationModal.tsx` — `handleRegister` error branch | `event_registration_error` |
| `EventRegistrationModal.tsx` — `handleClose` during auth | `event_registration_auth_abandoned` |

### Parameter: `location` for Button Impression

The registration button appears in multiple places. The `location` parameter must distinguish:
- `"event_page"` — primary CTA on `/projects/{slug}`
- `"browse_card"` — project card on `/browse` or `/hubs/{hub}/browse`
- `"similar_projects_sidebar"` — sidebar on individual event pages

This requires the button rendering code to know its container context. If prop-drilling is undesirable, a simple `data-analytics-location` attribute on the button element can be read by the tracking helper.

### Custom Fields Drop-off Tracking

Custom registration fields are optional — a user can submit the form without filling them in. To detect drop-off caused by the custom fields step, `event_registration_custom_fields_started` fires the **first time** the user interacts with any custom field. This is a once-per-modal-session event.

Implementation approach:
- `RegistrationFieldAnswersForm` accepts an optional `onFirstInteraction` callback prop.
- The component maintains a `hasInteracted` ref (initially `false`). On the first call to any change handler (`handleBooleanChange`, `handleOptionChange`, `handleInventoryOptionChange`, `handleInventoryQuantityChange`, `handleTimeSlotChange`), if `hasInteracted` is `false`, set it to `true` and invoke `onFirstInteraction()`.
- `EventRegistrationModal` passes a callback that fires the GA4 event with `event_slug` and `field_count` (number of configured custom fields).
- The event fires regardless of which specific field the user interacts with — it signals "user started engaging with the custom fields step", not which field.
- Using a ref (not state) avoids re-renders. The guard ensures the event fires exactly once per registration attempt, even if the user interacts with multiple fields.

This event, combined with `event_registration_success` and `event_registration_cancelled` / modal-close events, enables a simple drop-off analysis: users who started filling custom fields but did not complete registration.

---

## System Impact

- **Actors involved**:
  - `Product Team`: Needs funnel data to optimise event registration conversion
  - `Guest` / `Member`: Tracked only if statistics cookies accepted
- **Actions to implement**:
  - Track every step from button impression through registration success
- **Flows affected**:
  - **Event Registration Flow** (all branches): instrumented with GA4 custom events
- **Entity changes needed**: None
- **Flow changes needed**: No functional changes; additive tracking only
- **Integration changes needed**: None

---

## Acceptance Criteria

- [ ] `event_registration_button_impression` fires when the register button renders, with correct `location` parameter.
- [ ] `event_registration_modal_opened` fires when any user opens the registration modal.
- [ ] `event_registration_auth_started` fires when a guest submits their email in the modal.
- [ ] `event_registration_auth_method_selected` fires after `check-email` returns, recording the chosen path (`password` / `otp` / `signup`).
- [ ] `event_registration_auth_completed` fires when a guest successfully authenticates inside the modal.
- [ ] `event_registration_confirmed` fires when any user clicks "Confirm registration".
- [ ] `event_registration_success` fires when the registration API returns success.
- [ ] `event_registration_error` fires when the registration API fails, with appropriate `error_type`.
- [ ] `event_registration_auth_abandoned` fires when the modal is closed during the auth flow.
- [ ] `event_registration_custom_fields_started` fires once on the first interaction with any custom registration field, with `event_slug` and `field_count`.
- [ ] All events respect the statistics cookie consent — no tracking if consent is denied.
- [ ] `event_slug` is included in all event-registration-specific events for funnel segmentation.
- [ ] Existing auth analytics events (`auth_email_entered`, `auth_otp_verified`, etc.) continue to fire unchanged inside the modal.

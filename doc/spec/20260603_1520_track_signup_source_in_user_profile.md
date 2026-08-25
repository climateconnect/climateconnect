# Track Signup Source in User Profile

**Status**: DRAFT
**Type**: Backend + Frontend — feature
**Epic**: Analytics / User Attribution
**Date created**: 2026-06-03
**Depends on**:
- [`20260430_0949_event_registration_analytics_funnel.md`](./20260430_0949_event_registration_analytics_funnel.md) — event registration modal and GA4 funnel tracking must be in place
- [`20260423_1530_auth_unification_us8_new_user_signup.md`](./20260423_1530_auth_unification_us8_new_user_signup.md) — unified signup endpoint that creates `UserProfile`

---

## Problem Statement

New users can sign up through multiple entry points:

1. **Standard login/signup flow** (`/login`) — the unified auth page at [`frontend/src/components/auth/AuthPage.tsx`](frontend/src/components/auth/AuthPage.tsx)
2. **Event registration modal** ([`EventRegistrationModal.tsx`](frontend/src/components/project/EventRegistrationModal.tsx)) — guests authenticate inline to register for an event

More entry points will be added over time (organization invites, campaign landing pages, etc.).

Currently, the backend has **no persistent record of where a user signed up from**. GA4 events like [`event_registration_auth_started`](doc/mosy/metrics/analytics_events.md:150) capture this client-side, but they are:

- **Cookie-gated** — only fire when the user accepts statistics cookies
- **Ad-blocker-vulnerable** — GA4 is often blocked, creating blind spots
- **Ephemeral** — not tied to the user record; impossible to query retroactively in the database

Without a server-side source of truth, the team cannot:

- Run cohort analysis ("how many event-registration signups converted to active members?")
- Segment users by acquisition channel in CRM or email campaigns
- Measure the long-term quality of signups from each entry point
- Make data-driven decisions about which signup flows to invest in

---

## Core Requirements

### What We're Building

A `signup_source` field on `UserProfile` that records which entry point the user signed up through. The field is set at account creation time and never changes.

### Allowed Values

| Value | Label | Description |
|-------|-------|-------------|
| `login` | Standard login / signup | User signed up via `/login` (default) |
| `event_registration` | Event registration | User signed up inside an event registration modal |
| `organization_invite` | Organization invite | User accepted an invite to join an organization |
| `direct_link` | Direct link / campaign | User arrived via a tracked campaign link |
| `other` | Other | Fallback for any future or uncategorized source |

### Data Flow

```
Frontend entry point
    │
    ├── Standard /login → POST /api/v1/signup (no signup_source param, defaults to "login")
    │
    ├── EventRegistrationModal → POST /api/v1/signup (signup_source: "event_registration")
    │
    ├── Organization invite flow → POST /api/v1/signup (signup_source: "organization_invite")
    │
    └── Campaign landing page → POST /api/v1/signup (signup_source: "direct_link")
```

---

## System Impact

### Actors Involved

- **Backend Developer**: Model migration, serializer/view update, tests
- **Frontend Developer**: Pass `signup_source` from `EventRegistrationModal.tsx` and any future entry points
- **Product Team**: Can now query signup source in admin and analytics

### Entities Changed

| Entity | Change |
|--------|--------|
| `UserProfile` ([`backend/climateconnect_api/models/user.py`](backend/climateconnect_api/models/user.py:23)) | Add `signup_source` CharField with choices, default `"login"`, `db_index=True` |

### Flows Affected

- **Signup flow** ([`SignupView`](backend/climateconnect_api/views/user_views.py:140)) — accepts optional `signup_source` parameter
- **Event registration modal** ([`EventRegistrationModal.tsx`](frontend/src/components/project/EventRegistrationModal.tsx:1)) — passes `signup_source: "event_registration"` when submitting signup
- **Standard login/signup page** — no change needed; default handles it

### Integration Changes

- [`UserProfileSerializer`](backend/climateconnect_api/serializers/user.py:110) — optionally expose `signup_source` in API responses
- [`doc/mosy/metrics/analytics_events.md`](doc/mosy/metrics/analytics_events.md:1) — document the new field as the server-side counterpart to GA4 `entry_method`

---

## Acceptance Criteria

### Backend

- [ ] `UserProfile` model has a `signup_source` field with the five choices listed above, default `"login"`, and `db_index=True`
- [ ] Django migration is generated and applies cleanly (existing rows backfilled with `"login"`)
- [ ] `SignupView` accepts an optional `signup_source` in the request body
- [ ] `signup_source` is validated against the allowed choices; invalid values fall back to `"login"` (no 400 error)
- [ ] `signup_source` is persisted on the `UserProfile` at creation time
- [ ] `UserProfileSerializer` includes `signup_source` in its output (read-only is fine)
- [ ] Backend tests cover: valid source, invalid source (fallback), missing source (default), and serializer output

### Frontend

- [ ] `EventRegistrationModal.tsx` passes `signup_source: "event_registration"` when submitting the signup step (the `AuthSignupStep` `onSuccess` or the signup API call)
- [ ] Standard `/login` flow is unchanged (relies on default)
- [ ] No regression in existing auth or event registration flows

### Analytics / Documentation

- [ ] [`doc/mosy/metrics/analytics_events.md`](doc/mosy/metrics/analytics_events.md:1) updated to document `signup_source` as the durable server-side record, complementary to GA4 `entry_method`
- [ ] Admin list view for `UserProfile` includes `signup_source` as a filterable column (optional but recommended)

---

## AI Agent Insights and Additions

### Why a Choices Field, Not Free Text

Free-text source tracking becomes messy fast: "event reg", "event_registration", "Event Registration", "modal" all mean the same thing. A `TextChoices` enum enforces consistency at the database level and makes aggregation queries trivial:

```python
UserProfile.objects.filter(signup_source="event_registration").count()
```

### Why Default to `"login"` Instead of `"other"`

The vast majority of existing and near-term signups will come from the standard `/login` flow. Defaulting to `"login"` means:
- Existing callers that don't pass the field continue to work without code changes
- The data distribution reflects reality (most users = `"login"`, not `"other"`)
- No data migration needed to backfill old rows

### Why Store on `UserProfile`, Not `User`

`UserProfile` is already the extension model that holds signup-relevant data (`auth_method`, `is_activist`, `related_hubs`). Adding `signup_source` there keeps all user-metadata together. The Django `User` model is also used by other apps (chat, ideas) and should stay lean.

### Frontend: Where to Pass the Value

In [`EventRegistrationModal.tsx`](frontend/src/components/project/EventRegistrationModal.tsx:1), the signup is triggered by `AuthSignupStep`'s `onSuccess` callback. The modal already has access to `event_slug` and all context needed. The `signup_source` value should be included in the signup API request body alongside the existing fields (`email`, `first_name`, `last_name`, `location`, `source_language`, `sectors`, etc.).

### Future Extensibility

When a new signup entry point is added (e.g. organization invite), the only changes required are:
1. Add a new choice to `SignupSource` (backend)
2. Pass the new value from the new frontend entry point
3. No schema migration needed beyond the initial field addition

### GA4 Events Remain Valuable

This change does **not** replace GA4 funnel tracking. The DB field answers "who signed up from where" (cohort analysis). GA4 events answer "what did the user do step-by-step before signing up" (funnel analysis). Both are needed.

---

## Implementation Notes

### Model Change

File: [`backend/climateconnect_api/models/user.py`](backend/climateconnect_api/models/user.py:23)

Add `SignupSource` choices class and `signup_source` field to `UserProfile`. Place it near `auth_method` for logical grouping.

### View Change

File: [`backend/climateconnect_api/views/user_views.py`](backend/climateconnect_api/views/user_views.py:140)

In `SignupView.post()`, read `signup_source` from `request.data`, validate it against `UserProfile.SignupSource.values`, and pass it to `UserProfile.objects.create()`.

### Serializer Change

File: [`backend/climateconnect_api/serializers/user.py`](backend/climateconnect_api/serializers/user.py:110)

Add `signup_source` to `UserProfileSerializer.fields` (read-only or read-write as appropriate).

### Frontend Change

File: [`frontend/src/components/project/EventRegistrationModal.tsx`](frontend/src/components/project/EventRegistrationModal.tsx:1)

Find the signup submission logic (likely in the `handleUserStatusDetermined` or `onSuccess` callback for `AuthSignupStep`) and include `signup_source: "event_registration"` in the request payload.

### Migration

Run `pdm run python manage.py makemigrations climateconnect_api` after the model change. The migration will auto-backfill existing rows with the default value.

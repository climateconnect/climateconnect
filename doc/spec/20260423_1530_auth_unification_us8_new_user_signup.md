# US-8: New User Signup within Combined Flow

**Status**: READY FOR IMPLEMENTATION  
**Type**: Frontend + Backend — signup flow integration  
**Epic**: [EPIC: Auth Unification](./EPIC_auth_unification.md)  
**Date created**: 2026-04-27  
**Depends on**: US-3 (`POST /api/auth/request-token`), US-4 (`POST /api/auth/verify-token`), US-5 (combined auth page skeleton)  
**Parallelisable with**: US-7 (password login option) — both build upon US-5's page structure  
**Reuse context**: The signup steps must be architected to be embedded as part of the event registration modal flow (EPIC: Event Registration — Phase 3). The signup flow shares the same data collection requirements; do not split yet — establish the pattern here.

---

## Problem Statement

When a user enters an email address on the `/login` page and `POST /api/auth/check-email` returns `user_status: "new"`, the combined flow must:

1. Collect the same signup information as today's `/signup` page:
   - **Step 1**: First name, last name, location (city/country search)
   - **Step 2**: Interest areas (climate action sectors/categories)
2. Create the user account by calling `POST /api/signup/` **without requiring a password**.
3. Immediately trigger the OTP flow: call `POST /api/auth/request-token` to send a login code to the user's email.
4. Display the OTP code entry form (US-6 component).
5. On successful code verification via `POST /api/auth/verify-token`, mark the account as **verified** — **no separate email verification link is sent**.

The result: new users complete account creation and are logged in using the same OTP mechanism as returning users, eliminating the separate email verification step entirely. The account is created in an unverified state (same as today's `/signup`), but OTP entry replaces the email verification link click.

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Signup data collected | Same fields as today's `/signup` (first/last name, location, interest areas) | Preserves existing onboarding flow; no user confusion or data gaps. |
| Password field | **Omitted entirely** | OTP is the default auth method for new users; passwords can be added later in account settings (Phase B). |
| Account verification | OTP code entry **replaces** email verification link | Entering a correct OTP proves email ownership; eliminates a redundant email interaction. `UserProfile.is_profile_verified` is set immediately after the OTP is verified, not by clicking an email link. |
| `send_newsletter` default | True (opt-out checkbox) | Same as today's `/signup`. |
| Location field | Autocomplete search using existing location API | Same UX as `/signup` — reuses `LocationSearchTypeahead` component. |
| Interest areas | Multi-select checkboxes, **optional** | Same UX as `/signup` — reuses existing sector/category components. Users can skip this step (same as today). |
| Backend changes | Adapt `POST /api/signup/` to make `password` optional | Today the endpoint requires `password` (400 if missing). The endpoint must accept `password: null` or absent, set the account with `set_unusable_password()`, set `UserProfile.auth_method = "otp"`. All other required fields remain the same: `email`, `first_name`, `last_name`, `location`, `send_newsletter`, `source_language`. |
| Account unverified state | Same as today — `is_profile_verified = False` initially | The account is created unverified. `POST /api/auth/verify-token` marks it verified after OTP entry succeeds. This preserves the `AUTO_VERIFY` setting behaviour for dev/staging environments. |

---

## Architecture: 3-Step Signup Flow

```
┌────────────────────────────────────────────────────────────┐
│  STATE: "email_entry" (US-5)                               │
│  User enters email → check-email returns "new"             │
│                      ↓                                     │
├────────────────────────────────────────────────────────────┤
│  STATE: "signup_step1"                                     │
│  Collect: first name, last name, location                 │
│  Button: "Continue"                                        │
│                      ↓                                     │
├────────────────────────────────────────────────────────────┤
│  STATE: "signup_step2"                                     │
│  Collect: interest areas (sectors/categories)             │
│  Checkbox: "Send newsletter" (default: checked)           │
│  Button: "Create account"                                 │
│                      ↓                                     │
│  API: POST /api/signup/                                    │
│       { email, first_name, last_name, location,           │
│         send_newsletter, interest_sectors, source_language}│
│       → Returns { user }                                   │
│                      ↓                                     │
│  API: POST /api/auth/request-token                         │
│       { email }                                            │
│       → Returns { session_key }                            │
│                      ↓                                     │
├────────────────────────────────────────────────────────────┤
│  STATE: "otp_entry" (US-6 component)                       │
│  6-digit code input                                        │
│                      ↓                                     │
│  API: POST /api/auth/verify-token                          │
│       { session_key, code }                                │
│       → Returns { token, expiry, user }                    │
│       → Backend sets is_profile_verified = True            │
│                      ↓                                     │
├────────────────────────────────────────────────────────────┤
│  Authenticated — navigate to redirect_url or home          │
└────────────────────────────────────────────────────────────┘
```

**Back button behaviour**: any step except `otp_entry` can go back to the previous step. `otp_entry` cannot go back — once the account is created and OTP is sent, the user must verify to proceed (resend button available).

---

## Backend Changes

### 1. Adapt `POST /api/signup/` to support passwordless accounts

**Today's behaviour**: `password` is a required field; 400 if missing. Account is created with `user.set_password(password)`.

**New behaviour**:
- `password` field becomes **optional** (nullable).
- If `password` is provided: behave exactly as today — call `user.set_password(password)`, set `UserProfile.auth_method = "password"`.
- If `password` is absent or null: call `user.set_unusable_password()`, set `UserProfile.auth_method = "otp"`.
- All other fields remain required: `email`, `first_name`, `last_name`, `location`, `send_newsletter`, `source_language`.
- `interest_sectors` (or `sectors` in the backend) is **optional** — same as today's `/signup`.
- Validation logic unchanged: email uniqueness, location lookup, sector IDs must exist if provided.
- Account created with `is_profile_verified = False` — same as today.
- **No verification email is sent** when `auth_method = "otp"` — the OTP flow replaces it.
- `AUTO_VERIFY` setting: if `AUTO_VERIFY = True` (dev/staging), set `is_profile_verified = True` immediately — same behaviour as today.

**Implementation requirements**:
- Update the signup serializer to make `password` optional (`required=False, allow_null=True`).
- Update signup view to check if `password` is provided: if yes, call `user.set_password(password)` and set `auth_method = "password"`; if no, call `user.set_unusable_password()` and set `auth_method = "otp"`.
- Conditionally send verification email: only send for `auth_method = "password"` when `AUTO_VERIFY = False`.
- Set `UserProfile.auth_method` based on password presence.

**Backward compatibility**: existing frontend signup calls (from the old `/signup` page when toggle is off) continue to provide `password`, so they behave exactly as today.

### 2. Extend `POST /api/auth/verify-token` to mark profile verified

**Today's behaviour** (from US-4): validates OTP, marks `LoginToken.used_at`, issues Knox token, returns `{ token, expiry, user }`.

**New behaviour**:
- After issuing the Knox token, check if `user.userprofile.is_profile_verified == False`.
- If unverified: set `is_profile_verified = True` and save.
- This replaces the email verification link click for OTP-based signups.
- **Rate this operation as minimal risk**: `verify-token` already has transaction safety (US-4 spec); adding a profile update inside the same transaction is idempotent and safe.

**Implementation requirements**:
- After issuing the Knox token in `verify-token`, check if `user.userprofile.is_profile_verified == False`.
- If unverified, set `is_profile_verified = True` and save (use `update_fields=['is_profile_verified']` for efficiency).
- Must be within the existing `@transaction.atomic` block from US-4.

**Why here and not in `request-token`**: `request-token` is user-enumeration-proof — it returns 200 even for unknown emails. Verification must happen at the point where we definitively know the user has proven email ownership (entering the correct OTP).

---

## Frontend Changes

### 1. Add signup step components to `pages/login.tsx`

**File**: `frontend/pages/login.tsx` (created in US-5)

**New states**: `signup_step1`, `signup_step2`

**Flow**:
- When `check-email` returns `user_status: "new"`, set `currentStep = "signup_step1"`.
- Step 1: render `SignupPersonalInfoStep` component → collects name + location → "Continue" button sets `currentStep = "signup_step2"`.
- Step 2: render `SignupInterestsStep` component → collects interest sectors + newsletter opt-out → "Create account" button calls `POST /api/signup/`, then `POST /api/auth/request-token`, then sets `currentStep = "otp_entry"`.
- Step "otp_entry": render `AuthOtpStep` component (from US-6) → user enters code, calls `verify-token`, on success navigates to `redirect_url` or home.

**State management** (lifted to page level):
- `signupData`: `{ email, first_name, last_name, location, interest_sectors, send_newsletter }`
- `sessionKey`: set from `request-token` response, passed to `AuthOtpStep`.

### 2. Create `SignupPersonalInfoStep` component

**File**: `frontend/src/components/auth/SignupPersonalInfoStep.tsx` (new)

**Props**: Component receives `email` (string, pre-filled and read-only), `onContinue` callback (receives `first_name`, `last_name`, and `location` ID), and `onBack` callback.

**UI**:
- Email field: pre-filled, disabled (user cannot change it — it's from step 1).
- First name: text input, required.
- Last name: text input, required.
- Location: autocomplete search using `LocationSearchTypeahead` component (same as `/signup`).
- "Back" button → calls `onBack()` → returns to email entry.
- "Continue" button → validates fields (all required), calls `onContinue({ first_name, last_name, location })`.

**Reuse**: the existing `LocationSearchTypeahead` component from `src/components/location/` can be used directly — it returns a location object with `id`. Extract the `id` and pass it to the parent.

**Validation**: client-side only at this stage — backend will validate on `POST /api/signup/`. Display inline error messages for empty fields.

### 3. Create `SignupInterestsStep` component

**File**: `frontend/src/components/auth/SignupInterestsStep.tsx` (new)

**Props**: Component receives `email`, `first_name`, `last_name`, and `location` ID (for display), `onSubmit` callback (receives `interest_sectors` array and `send_newsletter` boolean), and `onBack` callback.

**UI**:
- Display user's name and location (read-only summary from step 1) — gives context.
- Interest areas: multi-select checkboxes for climate action sectors/categories.
  - **Reuse existing component**: `src/components/signup/InterestAreasSelection.tsx` (or similar) — same as today's `/signup` page.
  - Each sector has an ID; collect selected IDs as `interest_sectors: number[]`.
  - **Optional** — users can skip and proceed without selecting any sectors (same as today).
- Newsletter checkbox: "Send me updates about climate action opportunities" — default **checked** (opt-out).
- "Back" button → calls `onBack()` → returns to step 1.
- "Create account" button → calls `onSubmit({ interest_sectors, send_newsletter })`. Disabled only if sectors field is invalid (not because it's empty).

**API calls** (triggered by `onSubmit` callback in parent):
1. `POST /api/signup/` with full signup payload (no password field).
2. On 201 response: immediately call `POST /api/auth/request-token` with `{ email }`.
3. On `request-token` success: store `session_key` in page state, transition to `otp_entry` step.

**Error handling**:
- `POST /api/signup/` errors (email already exists, invalid location, etc.) → display inline below form.
- `POST /api/auth/request-token` errors (rate limit) → display inline; user can retry after cooldown.

**Loading state**: disable "Create account" button during API calls; show spinner.

### 4. Wire OTP entry step (reuse US-6 component)

**No new component needed** — the `AuthOtpStep` component from US-6 is reused.

**Parent state** (`login.tsx`):
- When `signup_step2` calls `onSubmit` and both API calls succeed, transition to `currentStep = "otp_entry"`.
- Pass `sessionKey` (from `request-token`) and `email` to `AuthOtpStep`.
- `AuthOtpStep` handles code entry, verification, and navigation to `redirect_url`.

**Verification marks profile verified**: backend (see Backend Changes #2 above) sets `is_profile_verified = True` when `verify-token` succeeds, so no additional frontend logic is needed.

---

## Acceptance Criteria

### Backend
- [ ] `POST /api/signup/` accepts `password` as optional (nullable).
- [ ] When `password` is absent: account created with `set_unusable_password()`, `UserProfile.auth_method = "otp"`.
- [ ] When `password` is provided: behaves exactly as today — `set_password()`, `auth_method = "password"`.
- [ ] No verification email sent for OTP-based signups (`auth_method = "otp"`).
- [ ] Verification email still sent for password-based signups (backward compatibility).
- [ ] `AUTO_VERIFY` setting: if True, set `is_profile_verified = True` immediately for both auth methods.
- [ ] `POST /api/auth/verify-token` marks `is_profile_verified = True` after OTP validation succeeds.
- [ ] Existing `POST /api/signup/` callers (old `/signup` page with toggle off) continue to work without changes.

### Frontend
- [ ] When `check-email` returns `"new"`, transition to `signup_step1`.
- [ ] Step 1: collect first name, last name, location.
- [ ] Step 2: collect interest sectors, newsletter opt-out (default: checked).
- [ ] "Back" button on each step returns to previous step (step 1 → email entry, step 2 → step 1).
- [ ] "Create account" button calls `POST /api/signup/` with no `password` field.
- [ ] On signup success, immediately call `POST /api/auth/request-token`.
- [ ] On `request-token` success, transition to `otp_entry` state (reuse `AuthOtpStep` from US-6).
- [ ] On `verify-token` success, navigate to `redirect_url` from `sessionStorage` or home if absent.
- [ ] Error handling: display backend errors inline for both signup and request-token API calls.
- [ ] Loading states: disable buttons during API calls; show spinner.
- [ ] Hub theming: signup steps apply hub theme colors/images same as email entry step (passed as props from page).
- [ ] Accessibility: all form fields have labels, error messages use `role="alert"`, buttons have `aria-busy` during loading.
- [ ] Mobile responsive: steps render correctly on mobile (single column), tablet, and desktop.

### Tests
- [ ] Backend: test `POST /api/signup/` with `password=null` creates OTP account.
- [ ] Backend: test `POST /api/signup/` with `password="..."` creates password account (backward compat).
- [ ] Backend: test `POST /api/signup/` succeeds with no `interest_sectors` field (optional).
- [ ] Backend: test verification email not sent for OTP signups.
- [ ] Backend: test `verify-token` marks `is_profile_verified = True` for unverified accounts.
- [ ] Backend: test `AUTO_VERIFY = True` sets `is_profile_verified = True` immediately.
- [ ] Frontend: test email entry → `"new"` → signup step 1 renders.
- [ ] Frontend: test step 1 → step 2 transition with valid data.
- [ ] Frontend: test step 2 "Create account" calls both APIs in sequence.
- [ ] Frontend: test step 2 allows proceeding without selecting any interest sectors.
- [ ] Frontend: test OTP entry step renders after signup completes.
- [ ] Frontend: test back button navigation (step 2 → step 1 → email entry).
- [ ] Frontend: test error handling for signup API 400 response.
- [ ] Frontend: test newsletter checkbox default (checked).

---

## Step-by-Step Implementation Plan

### Phase 1 — Backend

1. **Update `SignupSerializer`**: make `password` optional (nullable).
2. **Update signup view**: check if `password` provided; if yes → `set_password()`, if no → `set_unusable_password()`.
3. **Set `auth_method`**: add `UserProfile.auth_method` assignment based on password presence (note: model already added in US-2).
4. **Conditionally send verification email**: only send for `auth_method = "password"` and when `AUTO_VERIFY = False`.
5. **Update `verify-token` view**: add profile verification logic (set `is_profile_verified = True` if not already).
6. **Write tests**: new test cases for passwordless signup, verification email logic, `verify-token` profile marking.

### Phase 2 — Frontend Components

1. **Create `SignupPersonalInfoStep.tsx`**: name + location form, reuse `LocationSearchTypeahead`.
2. **Create `SignupInterestsStep.tsx`**: interest sectors multi-select, reuse existing sector selection component, newsletter checkbox.
3. **Wire state machine in `login.tsx`**:
   - Add `signup_step1` and `signup_step2` states.
   - Render `SignupPersonalInfoStep` when `currentStep = "signup_step1"`.
   - Render `SignupInterestsStep` when `currentStep = "signup_step2"`.
   - Handle `onContinue` / `onSubmit` callbacks to collect data and transition states.
4. **API call sequence**: in `onSubmit` of step 2, call `POST /api/signup/` then `POST /api/auth/request-token`, then transition to `otp_entry`.
5. **Error handling**: inline error messages for API failures on both signup and request-token.

### Phase 3 — Integration Testing

1. **End-to-end manual test**: enter new email → fill signup steps → receive OTP → enter code → land on home or redirect URL.
2. **Test with hub theming**: `?hub=berlin` → verify signup steps apply hub colors/images.
3. **Test with redirect**: `?redirect=/projects/123` → verify landing after OTP success.
4. **Test back button**: step 2 → step 1 → email entry.
5. **Test resend OTP**: enter wrong code → resend → new code works.
6. **Test AUTO_VERIFY**: in dev/staging, verify `is_profile_verified = True` immediately after signup API call (before OTP entry).

---

## Non-Negotiable Constraints

1. **Backward compatibility**: existing password-based signup (old `/signup` page when toggle off) must continue to work without changes.
2. **No verification email for OTP signups**: replaced by OTP code entry.
3. **Verification email still sent for password signups**: preserves existing flow for legacy page.
4. **Required fields match today's signup**: `email`, `first_name`, `last_name`, `location`, `send_newsletter`, `source_language` are required. `password` and `interest_sectors` are both optional (same as today for sectors).
5. **OTP entry step uses US-6 component**: no duplication of OTP UI code.
6. **Hub theming preserved**: all signup steps apply hub colors/images via props from parent page.
7. **`session_key` binding**: the OTP sent during signup is tied to the same browser tab via `session_key` (same security model as US-6).
8. **`redirect_url` from sessionStorage**: after signup + OTP success, navigate to the URL stored in `auth_redirect_url` sessionStorage key (set in US-5).

---

## Known Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| User enters typo in email during step 1 | No mitigation in this story — email is locked after step 1. Future enhancement: add "change email" option on step 2 summary. |
| User closes tab during signup steps | Frontend state is lost; user must restart. Acceptable for Phase A — signup is fast (2 steps). Future: persist partial signup state in `sessionStorage`. |
| `request-token` rate limit hit during signup | Display error message inline; user must wait for cooldown. Same UX as returning user OTP flow (US-6). |
| Account created but OTP send fails | Account exists in DB unverified. User can restart flow; `POST /api/signup/` will return 400 "email already exists". User must use password reset or contact support. Future: add "resend verification OTP" endpoint (out of scope for Phase A). |
| `verify-token` fails after account created | User can use resend button (US-6 component) — no additional logic needed. |

---

## Out of Scope (Phase A)

- Editing email after step 1 (user must restart if typo).
- Persisting partial signup state across tab closures.
- Social auth (Google, GitHub, etc.) — separate epic.
- Two-factor authentication (2FA) — separate epic.
- Admin-created accounts with forced password reset — existing flow unchanged.

---

## Future Enhancements (Post-Phase A)

- **Resend verification OTP endpoint**: for users whose `request-token` failed during signup; allows re-triggering OTP without re-entering signup data.
- **"Change email" option on step 2**: display email with an "edit" link that returns to email entry and preserves step 1 data.
- **Partial state persistence**: store step 1 data in `sessionStorage` so users can resume if they close the tab.
- **Embed in event registration modal** (Phase 3 of Event Registration epic): extract signup steps into reusable components that mount inside the modal.

---

## Resolved Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Number of signup steps | 2 (same as today) | Keeps cognitive load low; interest sectors can be edited later in profile settings. |
| Password field placement | Omitted entirely | OTP is default; passwords added in account settings (Phase B US-10). |
| Newsletter opt-in default | Checked (opt-out) | Same as today's `/signup`; increases newsletter engagement. |
| Location field type | Autocomplete search | Same UX as today; reuses `LocationSearchTypeahead` component. |
| Interest sectors field | Multi-select checkboxes | Same UX as today; reuses existing sector selection component. |
| OTP trigger point | After `POST /api/signup/` succeeds | Account must exist before `request-token` is called (it looks up user by email). |
| Profile verification logic | In `verify-token` endpoint | Single source of truth; avoids frontend conditional logic. |
| Back button from OTP step | Disabled | Account already created; user must complete verification. Resend button is the path forward. |
| Email editing after step 1 | Not supported (Phase A) | Simplifies state management; users can restart if needed. Future enhancement. |

---

## Log

- 2026-04-27 15:30 — Spec created. Builds on US-5 page structure and US-6 OTP component. Backend and frontend changes are tightly coupled; implement atomically. Unblocks Event Registration Phase 3 guest signup when complete.

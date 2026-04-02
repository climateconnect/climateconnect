# Code Review: Member Can Register for an Event — Frontend

**Reviewer:** GitHub Copilot
**Date:** April 2, 2026
**Branch:** `member-registeration-for-event-frontend`
**Spec:** [`20260309_0900_member_register_for_event.md`](doc/spec/20260309_0900_member_register_for_event.md)
**Files reviewed:**
- `frontend/pages/projects/[projectId]/register.tsx` (new)
- `frontend/pages/signup.tsx` (modified)
- `frontend/public/texts/project_texts.tsx` (modified)
- `frontend/src/components/project/Buttons/ProjectInteractionButtons.tsx` (modified)
- `frontend/src/components/project/EventRegistrationModal.tsx` (new)
- `frontend/src/components/project/ProjectMetaData.tsx` (modified)
- `frontend/src/components/project/ProjectOverview.tsx` (modified)
- `frontend/src/components/project/ProjectPageRoot.tsx` (modified)
- `frontend/src/utils/eventRegistrationHelpers.ts` (new)

---

> **Note:** A previous review file (`PR_1865_CODE_REVIEW.md`) already exists in the repo root but contains several inaccuracies about the actual code (see section [Corrections to existing review](#corrections-to-existing-review-pr_1865_code_reviewmd) below). This review supersedes it.

---

## Summary

The implementation is overall well-structured and covers most of the spec. The utility helpers are correctly extracted to a shared file (`eventRegistrationHelpers.ts`), the feature toggle is wired in all the right places, and both the listing card badge and the detail page buttons are implemented. However, there are a few bugs and gaps that should be addressed before merge.

---

## Bugs

### 🟢 BUG-1 — `signup.tsx` redirect change is unnecessary for this feature

**Context:** An earlier version of the spec planned to redirect unauthenticated users out to `/signup?redirect=/projects/{slug}/register` after the event registration signup button was clicked. That approach was replaced with in-modal login/signup. The `signup.tsx` change in this PR — which preserves a `redirect` query param through to `/accountcreated/` — was written to support the old redirect approach.

Since authentication now happens entirely within the registration modal, this code path is never triggered from the event registration flow. The change is **harmless** (it's a general improvement to signup) but:
- It is incomplete: `accountcreated.tsx` does not read `ctx.query.redirect`, so if any future flow does use `/signup?redirect=…`, the redirect will be silently dropped.
- The `signup.tsx` useEffect that calls `redirectOnLogin` only fires when the user is *already* logged in on arrival — it does not run after new account creation.

**Recommendation:** Either remove the `redirect` param handling from `signup.tsx` (it's not needed for this feature), or complete it by also updating `accountcreated.tsx` to read and act on `ctx.query.redirect`. Leaving it half-implemented may cause confusion in future.

---

### 🔴 BUG-2 — `available_seats` used without null-guard in registrations tab label

**File:** `ProjectPageRoot.tsx` line 291–294

**Analysis:** `available_seats` is typed as `number | null` for two legitimate reasons:
- On **list responses** the backend always returns `null` (the COUNT is deliberately skipped for performance).
- On **detail responses with unlimited capacity** (`max_participants is None`), the backend also returns `null`.

When `max_participants` *is* set and the detail endpoint is used, the backend always returns an integer (`max(0, max_participants - count)`). So in practice, the combination of "max_participants is set + available_seats is null" cannot occur on the detail page. The `number | null` type is semantically correct — `null` means "unlimited capacity, no seat cap".

However, the original guard only checked `max_participants` and used `available_seats` without a corresponding null check, which TypeScript correctly flags as unsafe and which would produce `NaN` in the tab label if the data ever came from a context where `available_seats` is null.

**Fixed** in `ProjectPageRoot.tsx`: both fields are now checked before the arithmetic.

```ts
// Before
if (currentEventRegistration && currentEventRegistration.max_participants) {
  const takenSeats =
    currentEventRegistration.max_participants - currentEventRegistration.available_seats;

// After
if (
  currentEventRegistration?.max_participants != null &&
  currentEventRegistration?.available_seats != null
) {
  const takenSeats =
    currentEventRegistration.max_participants - currentEventRegistration.available_seats;
```

---

### 🟡 BUG-3 — Seat count does not decrement after successful registration

**Acceptance criterion:**
> The available seat count on the event detail page decrements by 1 after a successful registration.

`EventRegistrationModal` defines an `onRegistrationSuccess?: () => void` prop, and the modal calls it on success (line 185–187). But `ProjectPageRoot.tsx` renders the modal *without* this prop:

```tsx
<EventRegistrationModal
  open={registrationModalOpen}
  onClose={() => setRegistrationModalOpen(false)}
  project={project}
  {/* ← onRegistrationSuccess is never passed */}
/>
```

Because `currentEventRegistration` is local state initialised once from `project.event_registration`, it is never refreshed after registration. The displayed `available_seats` stays stale until the user manually reloads.

**Suggested fix:** Pass a callback that decrements `available_seats` optimistically:
```tsx
<EventRegistrationModal
  open={registrationModalOpen}
  onClose={() => setRegistrationModalOpen(false)}
  project={project}
  onRegistrationSuccess={() => {
    setCurrentEventRegistration((prev) =>
      prev && prev.available_seats != null
        ? { ...prev, available_seats: prev.available_seats - 1 }
        : prev
    );
  }}
/>
```

---

### 🔴 BUG-4 — Register button does not reflect that the user has already registered

**Your observation is correct.** There are two distinct failure modes:

1. **After registering in the modal and closing it:** the "Register now" button stays as-is. There is no local state tracking `isUserRegistered`, and `onRegistrationSuccess` is never wired (see BUG-3).

2. **When the user returns to the page:** `GET /api/projects/{slug}/` has no `is_registered` field — and rightly so (embedding per-user state in the shared project response would break cacheability and is architecturally wrong). There is nothing to initialise from on page load.

**The spec does not mention `is_registered` at all.** This is a missing requirement, not an oversight in the implementation.

**Recommended approach — extend the existing `my_interactions` endpoint:**

The codebase already solves this pattern for follow/like state. `GET /api/projects/{slug}/my_interactions/` is called in `getServerSideProps` for authenticated users and returns:
```json
{ "liking": true, "following": false, "has_requested_to_join": false }
```
This result is fed into `useState` hooks in `index.tsx` and passed to `ProjectPageRoot` as `following` / `liking` props.

Adding `is_registered` here is the natural and consistent extension — one extra `EventParticipant.objects.filter(...).exists()` query, guarded so it only runs when the project has an `EventRegistration`:

*Backend — `GetUserInteractionsWithProjectView` in `project_views.py`:*
```python
is_registered = False
if hasattr(project, "event_registration"):
    try:
        is_registered = EventParticipant.objects.filter(
            user=request.user, event_registration=project.event_registration
        ).exists()
    except EventRegistration.DoesNotExist:
        pass

return Response({
    "liking": is_liking,
    "following": is_following,
    "has_requested_to_join": has_open_membership_request,
    "is_registered": is_registered,
})
```

*Frontend — `index.tsx` `getServerSideProps`:*
```ts
isUserRegistered: userInteractions.is_registered ?? false,
```

*Frontend — `ProjectPageRoot.tsx`:*
```tsx
// Initialise from my_interactions, set to true after successful registration
const [isUserRegistered, setIsUserRegistered] = useState(isUserRegistered);
// Pass onRegistrationSuccess to set it:
onRegistrationSuccess={() => {
  setIsUserRegistered(true);
  // also decrement seat count (BUG-3 fix)
}}
```

The helpers in `eventRegistrationHelpers.ts` would then receive `isUserRegistered` and return a "Registered ✓" disabled button when true. The listing card in `ProjectMetaData` does not need this (it doesn't know the current user's registration state — that's acceptable).

---

## Spec Alignment Gaps

### 🟡 GAP-1 — Signup path within the modal is unreachable

`handleCheckEmail` (line 197–205) currently always transitions to `"login"` regardless of whether the email exists. The `"signup"` auth step is never reached. The `authStep === "signup"` block renders only a "Sign-up flow coming soon" placeholder.

```ts
const handleCheckEmail = async () => {
  if (!email) return;
  setCheckingEmail(true);
  // TODO: Implement email check API call
  // For now, just show login form
  setAuthStep("login");   // ← always goes to login
  setCheckingEmail(false);
};
```

The spec says the email check is deferred ("to be implemented later"), so this is an intentional placeholder. But the `"signup"` branch in the JSX is dead code — it can never render — which is misleading. Recommend either:
- Removing the `authStep === "signup"` block and the `setAuthStep("signup")` handling for now, or
- Adding a visible "Sign up instead" link alongside the login form

---

### 🟡 GAP-2 — Deep-link page: no loading state

**File:** `register.tsx`

```tsx
export default function RegisterPage() {
  const router = useRouter();
  const { projectId } = router.query;

  useEffect(() => {
    if (projectId) {
      router.replace(`/projects/${projectId}?openRegistration=true`);
    }
  }, [projectId, router]);

  return null;  // ← blank screen until router is ready
}
```

On first render, `projectId` is `undefined` (Next.js router is not hydrated yet) so the page renders nothing. On a slow connection this blank flash is visible. There is also no `getServerSideProps`, so there is no server-side redirect — the client must render before the redirect happens.

**Suggested improvement:**
```tsx
import { CircularProgress, Box } from "@mui/material";
// ...
return (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
    <CircularProgress />
  </Box>
);
```

Or use a `getServerSideProps` to perform a server-side redirect immediately:
```ts
export async function getServerSideProps({ params }) {
  return {
    redirect: {
      destination: `/projects/${params.projectId}?openRegistration=true`,
      permanent: false,
    },
  };
}
```
The server-side approach is better: it avoids the client flash and works for SSR/SEO.

---

### 🟡 GAP-3 — `openRegistration` query param persists in URL after modal opens

**File:** `ProjectPageRoot.tsx` lines 216–226

After the deep-link opens the modal, `?openRegistration=true` remains in the browser URL. If the user closes the modal and refreshes the page, the modal re-opens. This is unexpected behaviour.

**Suggested fix:** After setting the modal open, clean up the URL:
```ts
if (params.openRegistration === "true" && isEventRegistrationEnabled && project.event_registration) {
  setRegistrationModalOpen(true);
  router.replace(`/projects/${project.url_slug}`, undefined, { shallow: true });
}
```

---

## Code Quality Issues

### 🟡 QUALITY-1 — No tests for `eventRegistrationHelpers.ts`

The three helper functions (`shouldShowRegisterButton`, `getRegisterButtonText`, `isRegisterButtonDisabled`) contain the core display logic for the registration button state machine. They have no test file. These are the most straightforward functions to unit-test in the entire PR and should be covered.

Suggested test cases:
- `shouldShowRegisterButton`: returns false when toggle disabled / no `event_registration` / status is `"ended"`; returns true otherwise
- `getRegisterButtonText`: returns correct text for `"open"`, `"full"`, `"closed"`
- `isRegisterButtonDisabled`: returns true for `"closed"` and `"full"`, false for `"open"`

---

### 🟡 QUALITY-2 — No tests for `EventRegistrationModal`

The modal component has no test file. Given its complexity (stepper, inline login, API calls, three distinct states), it is high-risk to ship without tests.

Recommended coverage:
- Authenticated user: renders pre-filled fields; "Confirm Registration" enabled; API called on submit; success state shown; error state shown
- Unauthenticated user: shows email field; correct message displayed; login form shown after email submit
- Error state: "Try Again" resets to initial step
- Modal close resets all state

---

### 🟡 QUALITY-3 — `texts: any` in `getRegisterButtonText`

**File:** `eventRegistrationHelpers.ts` line 26

```ts
export const getRegisterButtonText = (project: Project, texts: any): string => {
```

Using `any` for `texts` bypasses TypeScript checking. The project already has a typed texts pattern. Consider a minimal interface or use `Record<string, string>` at minimum.

---

### 🟢 QUALITY-4 — Minor: `try_again` button does not reset `errorMessage`

**File:** `EventRegistrationModal.tsx` line 408

```tsx
<Button onClick={() => setState("initial")} variant="contained" color="primary">
  {texts.try_again}
</Button>
```

`setState("initial")` resets the registration state but `errorMessage` is not cleared. The stale error message is briefly visible after clicking "Try Again" before it is overwritten by the new attempt's response. 

**Fix:**
```tsx
<Button onClick={() => { setState("initial"); setErrorMessage(""); }} ...>
```

---

## Corrections to Existing Review (`PR_1865_CODE_REVIEW.md`)

The existing review file contains inaccuracies that misrepresent the actual code. These should not be actioned:

| Existing review item | What it claims | Reality |
|---|---|---|
| Issue 4 — "Unused `eventRegistration` prop prefixed with `_`" | States the modal has an `eventRegistration` prop that is unused | The actual `Props` type has no `eventRegistration` prop at all. The review describes code that does not exist. |
| Issue 6 — "Helper functions at module level in `ProjectInteractionButtons.tsx`" | Claims helpers are defined inline in the file | All three helpers are **imported** from `eventRegistrationHelpers.ts`. They are not defined in `ProjectInteractionButtons.tsx`. |
| Issue 7 — "Code duplication across three files" | Claims the button logic is duplicated in `ProjectInteractionButtons.tsx`, `ProjectMetaData.tsx`, and `ProjectOverview.tsx` | All three files import from the shared `eventRegistrationHelpers.ts` utility. There is no duplication. |

These items suggest the existing review was generated against an earlier draft of the code, not the current branch.

---

## Feature Toggle Coverage

All new UI is correctly gated behind the `EVENT_REGISTRATION` feature toggle. Existing behaviour when the toggle is **off** is fully preserved.

| Surface | Guard | Existing behaviour when toggle OFF |
|---|---|---|
| `ProjectPageRoot` — Registrations tab | `showRegistrationsTab` requires `isEventRegistrationEnabled &&` | Tab not shown (unchanged) |
| `ProjectPageRoot` — deep-link `useEffect` | `isEventRegistrationEnabled && project.event_registration` in condition | `useEffect` no-ops (unchanged) |
| `ProjectPageRoot` — modal render | `{isEventRegistrationEnabled && project.event_registration && …}` | Modal not mounted (unchanged) |
| `ProjectInteractionButtons` (mobile bar) | `shouldShowRegisterButton(isEventRegistrationEnabled, …)` | FollowButton shown as before |
| `ProjectOverview` — `LargeScreenOverview` (desktop) | same helper | FollowButton shown as before |
| `ProjectMetaData` (listing cards) | own `useFeatureToggles()` + same helper | No button rendered (unchanged) |
| `signup.tsx` redirect param forwarding | Not toggle-gated, but only activates if `redirect` query param is present | Unchanged for users arriving without `?redirect=` |

**Minor gap:** `pages/projects/[projectId]/register.tsx` does not check the toggle — it always redirects to `?openRegistration=true`. This is harmless because `ProjectPageRoot`'s `useEffect` guards the modal open with `isEventRegistrationEnabled`. The only effect when the toggle is off is a spurious `?openRegistration=true` param in the URL that silently does nothing.

**FollowButton replacement is intentional and correct.** When `showRegisterButton` is `true`, the FollowButton is replaced by the Register button on both mobile and desktop. This matches the spec verbatim: *"On an event page, a 'Register' button replaces the follow button (especially important for mobile)."*

---

## Positive Observations

- ✅ **Utility extraction is well done.** `eventRegistrationHelpers.ts` is correctly used across all three call sites with no duplication.
- ✅ **Feature toggle is consistently applied across all surfaces.** See [Feature Toggle Coverage](#feature-toggle-coverage) section above for the full breakdown.
- ✅ **FollowButton correctly replaced by Register button** on both mobile and desktop when registration is shown — matches spec: *"Register button replaces the follow button (especially important for mobile)"*.
- ✅ **Status-based button logic is correct.** `"ended"` → no button; `"open"` → enabled; `"full"` / `"closed"` → disabled. Matches spec.
- ✅ **Login URL endpoint is consistent** with `signin.tsx` (`/login/`).
- ✅ **Bilingual translations are complete.** All new text keys have both `en` and `de` values.
- ✅ **`signIn` context function is used correctly** — passes `(token, expiry)` matching the `_app.tsx` signature.
- ✅ **`handleClose` resets all state** including email, password, and auth step.
- ✅ **Idiomatic Next.js/MUI patterns** used throughout. TypeScript is used in the new files.

---

## Acceptance Criteria Checklist

| Criterion | Status |
|---|---|
| Listing card shows "Register now" (open) / "Booked out" (full) / "Registration closed" (closed) / no button (ended) | ✅ Implemented |
| No seat count in listing cards | ✅ Correct |
| Follow button replaced by "Register" on event detail page (mobile + desktop) | ✅ Implemented — matches spec |
| "Registration closed" disabled button when closed/full/ended | ✅ Implemented |
| Logged-in member sees pre-filled confirmation form | ✅ Implemented |
| Unauthenticated user: button enabled, modal opens, email-first inline auth flow shown | ✅ Implemented |
| Unauthenticated user can log in within the modal and proceed to registration | ✅ Implemented |
| Success confirmation shown in UI after registration | ✅ Implemented |
| Register button reflects "already registered" state (after registration and on return visit) | ❌ Not implemented — no `is_registered` from API, no frontend state (see BUG-4) |
| Confirmation email sent asynchronously | ✅ Backend-side, wired by existing backend implementation |
| Registration stored (EventParticipant) | ✅ Backend-side |
| Seat count decrements by 1 after registration | ❌ Not implemented — `onRegistrationSuccess` not wired (see BUG-3) |
| Re-registration is idempotent | ✅ Backend-side (200 on re-register); frontend handles 200 and 201 both as success |
| Race condition handled | ✅ Backend-side |
| `/projects/{slug}/register` deep-link opens modal | ✅ Implemented (via redirect to `?openRegistration=true`) |
| Deep-link works for authenticated and unauthenticated | ✅ Works |
| No breaking changes to existing project/event APIs | ✅ Confirmed |
| All tests pass | ⚠️ No new tests added for new components/utilities |

---

## Summary of Issues by Priority

| ID | Priority | Description |
|---|---|---|
| BUG-1 | 🟢 Low | `signup.tsx` redirect param change is incomplete/unnecessary for this feature |
| BUG-2 | ✅ Fixed | `available_seats` null-guard missing in registrations tab label (theoretical; now guarded) |
| BUG-3 | 🟡 Medium | Seat count does not update after successful registration (`onRegistrationSuccess` not wired) |
| BUG-4 | 🔴 High | Register button never reflects "already registered" — no `is_registered` from API, no frontend state |
| GAP-1 | 🟡 Medium | Signup path within modal is dead code — never reachable |
| GAP-2 | 🟡 Medium | Deep-link page renders blank with no loading state; client-side only |
| GAP-3 | 🟡 Medium | `?openRegistration=true` param persists in URL after modal opens |
| QUALITY-1 | 🟡 Medium | No tests for `eventRegistrationHelpers.ts` |
| QUALITY-2 | 🟡 Medium | No tests for `EventRegistrationModal` |
| QUALITY-3 | 🟢 Low | `texts: any` parameter type in `getRegisterButtonText` |
| QUALITY-4 | 🟢 Low | "Try Again" button does not clear `errorMessage` |


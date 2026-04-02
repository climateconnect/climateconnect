# Code Review: PR #1865 - Event Registration Frontend Implementation

**Reviewer:** GitHub Copilot  
**Date:** April 2, 2026  
**PR:** https://github.com/climateconnect/climateconnect/pull/1865/changes  
**Related Issue:** Product Backlog #44 (Event Registration)

## Overview

This PR implements the frontend for event registration functionality, allowing users to register for events on the Climate Connect platform. The implementation includes:

- Event registration modal with multi-step flow
- Registration button in project previews and detail pages
- Authentication flow for unauthenticated users
- Deep-link support via `/projects/{projectId}/register` route
- Bilingual support (English/German)

**Files Changed:** 8 files  
**Lines Added:** +788  
**Lines Removed:** -32

---

## Summary of Changes

### 1. **New Registration Page** ([register.tsx](frontend/pages/projects/[projectId]/register.tsx))
- Creates a redirect page that routes to project detail with `?openRegistration=true` parameter
- Implements deep-linking for event registration

### 2. **Signup Flow Enhancement** ([signup.tsx](frontend/pages/signup.tsx))
- Adds support for `redirect` query parameter to redirect users after signup
- Preserves redirect parameter through the account creation flow

### 3. **Translation Additions** ([project_texts.tsx](frontend/public/texts/project_texts.tsx))
- Adds 24 new translation keys for event registration UI
- Includes both English and German translations

### 4. **Registration Modal** ([EventRegistrationModal.tsx](frontend/src/components/project/EventRegistrationModal.tsx))
- New component: 438 lines
- Implements multi-step registration flow with stepper UI
- Handles authentication for unauthenticated users
- Shows success/error states

### 5. **UI Component Updates**
- **ProjectInteractionButtons.tsx**: Adds register button to replace follow button for events
- **ProjectMetaData.tsx**: Adds register button in project preview cards
- **ProjectOverview.tsx**: Integrates registration button in project detail view
- **ProjectPageRoot.tsx**: Wires up registration modal and deep-link handling

---

## Detailed Analysis

### ✅ Strengths

1. **Comprehensive Implementation**
   - Complete user flow from unauthenticated to registered state
   - Handles edge cases (full events, closed registration, ended events)
   - Good separation of concerns with dedicated modal component

2. **Good UX Design**
   - Uses Material-UI Stepper for clear multi-step flow
   - Provides visual feedback with loading states and icons
   - Disables registration for full/closed/ended events with clear labels

3. **Bilingual Support**
   - All UI text properly internationalized
   - Consistent with platform's existing i18n approach

4. **Feature Toggle Integration**
   - Uses existing `useFeatureToggles()` hook for `EVENT_REGISTRATION` toggle
   - Allows gradual rollout and easy disable if needed

5. **Deep-Link Support**
   - `/projects/{projectId}/register` provides shareable registration links
   - Properly handles query parameter to auto-open modal

6. **TypeScript Migration Progress**
   - EventRegistrationModal is fully TypeScript (.tsx)
   - Proper type definitions in types.ts

---

## 🔍 Issues & Suggestions

### Critical Issues

**None identified.** The implementation appears functionally complete.

---

### High Priority Suggestions

#### 1. **Incomplete Email Check Flow** ([EventRegistrationModal.tsx:217-224](frontend/src/components/project/EventRegistrationModal.tsx#L217-L224))

```typescript
const handleCheckEmail = async () => {
  if (!email) return;

  setCheckingEmail(true);
  // TODO: Implement email check API call
  // For now, just show login form
  setAuthStep("login");
  setCheckingEmail(false);
};
```

**Issue:** The email check is not implemented. Currently just transitions to login form.

**Suggestion:** 
- Either implement the email check API call to determine if user exists (→ login) or doesn't exist (→ signup)
- OR simplify the flow by providing both login/signup buttons upfront
- OR complete the signup flow (currently shows "coming soon" message)

**Current Impact:** Users cannot sign up for an account during event registration; they can only log in.

---

#### 2. **Signup Flow Not Implemented** ([EventRegistrationModal.tsx:388-393](frontend/src/components/project/EventRegistrationModal.tsx#L388-L393))

```typescript
{authStep === "signup" && (
  <Box className={classes.authButtons}>
    <Typography variant="body2" className={classes.helperText}>
      {texts.signup_flow_coming_soon}
    </Typography>
  </Box>
)}
```

**Issue:** Signup flow shows "coming soon" placeholder but is never reached since `handleCheckEmail` always goes to login.

**Suggestion:**
- Either complete the signup flow within the modal
- OR redirect to signup page with proper redirect parameter (already supported in signup.tsx)
- OR remove the "signup" step entirely if not in scope for this PR

---

#### 3. **Error Handling Could Be More Specific** ([EventRegistrationModal.tsx:195-211](frontend/src/components/project/EventRegistrationModal.tsx#L195-L211))

```typescript
try {
  const response = await apiRequest({
    method: "post",
    url: `/api/projects/${project.url_slug}/register/`,
    payload: {},
    token: token,
    locale: locale,
  });

  if (response.status === 200 || response.status === 201) {
    setState("success");
    if (onRegistrationSuccess) {
      onRegistrationSuccess();
    }
  }
} catch (error: any) {
  setState("error");
  setErrorMessage(error?.response?.data?.message || texts.registration_failed_please_try_again);
}
```

**Suggestion:** Handle specific error cases:
- Event is full (status might have changed)
- Registration deadline passed
- User already registered
- Network errors vs server errors

Consider showing different messages/UI for each case.

---

### Medium Priority Suggestions

#### 4. **Unused eventRegistration Prop** ([EventRegistrationModal.tsx:119](frontend/src/components/project/EventRegistrationModal.tsx#L119))

```typescript
export default function EventRegistrationModal({
  open,
  onClose,
  project,
  eventRegistration: _eventRegistration, // ← Prefixed with underscore, never used
  onRegistrationSuccess,
}: Props) {
```

**Issue:** The `eventRegistration` prop is destructured but prefixed with `_`, indicating it's unused. The component accesses `project.event_registration` instead.

**Suggestion:**
- Either remove the prop from the interface and component
- OR use it instead of `project.event_registration`

This is likely a leftover from refactoring.

---

#### 5. **Missing PropTypes** ([ProjectInteractionButtons.tsx](frontend/src/components/project/Buttons/ProjectInteractionButtons.tsx))

**Observation:** The component receives two new props (`isEventRegistrationEnabled`, `handleRegisterClick`) but there are no TypeScript types or PropTypes defined.

**Suggestion:** 
- Add PropTypes validation (as mentioned in copilot-instructions.md)
- OR migrate the file to TypeScript (.tsx) for compile-time type safety

---

#### 6. **Helper Functions at Module Level** ([ProjectInteractionButtons.tsx:9-32](frontend/src/components/project/Buttons/ProjectInteractionButtons.tsx#L9-L32))

```typescript
// Helper functions for event registration
const shouldShowRegisterButton = (
  isEventRegistrationEnabled: boolean,
  project: Project
): boolean => { ... };

const getRegisterButtonText = (project: Project, texts: any): string => { ... };

const isRegisterButtonDisabled = (project: Project): boolean => { ... };
```

**Observation:** Helper functions defined at module level (outside component).

**Suggestion:** Consider moving to a separate utility file if used in multiple components, or move inside the component if only used here. This improves:
- Testability (can test helpers independently)
- Reusability (used in ProjectOverview.tsx with duplicated logic)

---

#### 7. **Code Duplication** 

The logic for determining whether to show the register button and what text to display is duplicated across:
- ProjectInteractionButtons.tsx (lines 10-32)
- ProjectMetaData.tsx (lines 277-311)
- ProjectOverview.tsx (lines 401-423)

**Suggestion:** Extract to shared utility functions:

```typescript
// utils/eventRegistration.ts
export const shouldShowRegisterButton = (
  isEventRegistrationEnabled: boolean,
  eventRegistration?: EventRegistrationData | null
): boolean => {
  return !!(
    isEventRegistrationEnabled &&
    eventRegistration &&
    eventRegistration.status !== "ended"
  );
};

export const getRegisterButtonText = (
  status: string,
  texts: any
): string => {
  switch (status) {
    case "open": return texts.register_now;
    case "full": return texts.booked_out;
    case "closed": return texts.registration_closed;
    default: return texts.registration_closed;
  }
};

export const isRegisterButtonDisabled = (status: string): boolean => {
  return ["closed", "full"].includes(status);
};
```

---

#### 8. **State Management After Login** ([EventRegistrationModal.tsx:244-248](frontend/src/components/project/EventRegistrationModal.tsx#L244-L248))

```typescript
// Sign in the user - this will update the UserContext
await signIn(response.data.token, response.data.expiry);

// After signIn updates the context, the modal will automatically re-render
// and show the authenticated registration form instead of login form
```

**Observation:** Relies on UserContext update to trigger re-render and show registration form.

**Suggestion:** This is okay but could be more explicit. Consider:
- Adding a loading state after login
- Showing a brief "Login successful, preparing registration..." message
- Explicitly handling the transition rather than relying on context update

This would improve UX clarity and handle cases where context update might be delayed.

---

#### 9. **Commented CSS Property** ([ProjectInteractionButtons.tsx:51](frontend/src/components/project/Buttons/ProjectInteractionButtons.tsx#L51))

```typescript
registerButton: {
  // height: 40,  // ← Commented out
  marginLeft: theme.spacing(1),
  marginRight: theme.spacing(1),
  whiteSpace: "nowrap",
},
```

**Issue:** Commented-out code should be removed.

**Suggestion:** Either apply the height or remove the comment.

---

#### 10. **Missing Error State Reset** ([EventRegistrationModal.tsx](frontend/src/components/project/EventRegistrationModal.tsx))

**Observation:** When user corrects their email/password after an error, the error message clears (good!). However, if they're in error state from registration and click "Try Again", the error message persists briefly.

**Current behavior** ([line 263](frontend/src/components/project/EventRegistrationModal.tsx#L263)):
```typescript
const handleClose = () => {
  setState("initial");
  setErrorMessage("");
  setEmail("");
  setPassword("");
  setAuthStep("email");
  onClose();
};
```

**Suggestion:** In the "Try Again" button handler, also reset error message:

```typescript
<Button 
  onClick={() => {
    setState("initial");
    setErrorMessage("");  // Add this
  }} 
  variant="contained" 
  color="primary"
>
  {texts.try_again}
</Button>
```

---

### Low Priority / Minor Issues

#### 11. **Type Safety for `texts` Object** ([ProjectInteractionButtons.tsx:22](frontend/src/components/project/Buttons/ProjectInteractionButtons.tsx#L22))

```typescript
const getRegisterButtonText = (project: Project, texts: any): string => {
```

**Suggestion:** Define proper type for texts instead of `any`.

---

#### 12. **Stepper Logic Complexity** ([EventRegistrationModal.tsx:142-187](frontend/src/components/project/EventRegistrationModal.tsx#L142-L187))

The stepper flow has different steps for authenticated vs unauthenticated users:
- Authenticated: 2 steps
- Unauthenticated: 3 steps (but step 1 is skipped)

**Suggestion:** Simplify by using conditional steps array:

```typescript
const steps = useMemo(() => {
  if (user) {
    return [texts.event_registration, texts.confirmation];
  }
  return [texts.authentication, texts.event_registration, texts.confirmation];
}, [user, texts]);
```

This makes the flow clearer and easier to maintain.

---

#### 13. **Accessibility Considerations**

**Missing:**
- `aria-label` on modal for screen readers
- Focus management (focus should move to modal on open)
- Keyboard navigation (Escape to close is likely handled by GenericDialog)

**Suggestion:** Add ARIA attributes and test with screen reader.

---

#### 14. **Deep Link Query Parameter Cleanup** ([ProjectPageRoot.tsx:216-227](frontend/src/components/project/ProjectPageRoot.tsx#L216-L227))

```typescript
useEffect(() => {
  const params = getParams(window.location.href);
  if (
    params.openRegistration === "true" && 
    isEventRegistrationEnabled && 
    project.event_registration
  ) {
    setRegistrationModalOpen(true);
  }
}, [isEventRegistrationEnabled, project.event_registration]);
```

**Observation:** After opening the modal, the `?openRegistration=true` parameter remains in the URL.

**Suggestion:** Clean up the URL parameter after opening the modal:

```typescript
if (params.openRegistration === "true" && ...) {
  setRegistrationModalOpen(true);
  // Clean up URL
  router.replace(`/projects/${project.url_slug}`, undefined, { shallow: true });
}
```

This prevents the modal from reopening if the user refreshes the page.

---

#### 15. **Mobile Responsiveness** ([ProjectMetaData.tsx:92-99](frontend/src/components/project/ProjectMetaData.tsx#L92-L99))

```typescript
registerButton: {
  marginLeft: "auto",
  fontSize: 11,
  padding: "4px 12px",
  height: 24,
  textTransform: "none",
  whiteSpace: "nowrap",
},
```

**Observation:** Very small button (height: 24px, fontSize: 11px) in project preview cards.

**Suggestion:** Test on mobile devices. Consider:
- Increasing minimum tap target size to 44x44px for accessibility
- Using responsive font sizes with theme.typography
- Testing with long German translations (e.g., "Anmeldung geschlossen" = 23 chars)

---

#### 16. **Translation Key Naming** ([project_texts.tsx](frontend/public/texts/project_texts.tsx))

**Observation:** Some generic keys (`name`, `email`, `password`, `cancel`, `close`) added to project_texts.tsx.

**Question:** Are these translations available globally? If they already exist in a common/shared texts file, consider importing from there to avoid duplication.

---

## Testing Recommendations

### Manual Testing Checklist

- [ ] **Authenticated user flow**
  - [ ] Click "Register now" button
  - [ ] Verify user info pre-filled
  - [ ] Submit registration
  - [ ] Verify success message
  - [ ] Verify confirmation email sent (if backend implemented)

- [ ] **Unauthenticated user flow**
  - [ ] Click "Register now" button
  - [ ] Enter email
  - [ ] Enter password
  - [ ] Login successful → registration form appears
  - [ ] Submit registration
  - [ ] Verify success

- [ ] **Deep link**
  - [ ] Visit `/projects/{projectId}/register`
  - [ ] Verify redirect to project page
  - [ ] Verify modal auto-opens

- [ ] **Signup redirect preservation**
  - [ ] Visit `/projects/{projectId}/register` while logged out
  - [ ] Click "Sign Up" (when implemented)
  - [ ] Complete signup
  - [ ] Verify redirect back to event registration

- [ ] **Edge cases**
  - [ ] Event full: button shows "Booked out" and is disabled
  - [ ] Registration closed: button shows "Registration closed" and is disabled
  - [ ] Event ended: button does not appear
  - [ ] Invalid credentials: error message shown
  - [ ] Network error: error handling

- [ ] **Button states across UI**
  - [ ] Project detail page (large screen)
  - [ ] Project detail page (mobile)
  - [ ] Project preview card (browse page)
  - [ ] Project interaction buttons (sticky footer on mobile)

- [ ] **Internationalization**
  - [ ] Test in English
  - [ ] Test in German
  - [ ] Verify all text translates properly
  - [ ] Check for overflow with long German words

- [ ] **Responsive design**
  - [ ] Mobile (< 600px)
  - [ ] Tablet (600-960px)
  - [ ] Desktop (> 960px)

### Automated Testing Suggestions

While this is frontend only, consider adding:

1. **Unit tests** for helper functions:
   - `shouldShowRegisterButton()`
   - `getRegisterButtonText()`
   - `isRegisterButtonDisabled()`

2. **Component tests** for EventRegistrationModal:
   - Renders correctly for authenticated user
   - Renders correctly for unauthenticated user
   - Login flow works
   - Registration API call made correctly
   - Success/error states render properly

3. **Integration tests**:
   - Deep link opens modal
   - Signup redirect preservation
   - Feature toggle disables registration UI

---

## Code Style & Best Practices

### ✅ Follows Project Conventions

- [x] Material-UI v5 components used
- [x] Emotion styling with `makeStyles`
- [x] Proper use of theme spacing
- [x] Responsive design with theme breakpoints
- [x] i18n pattern matches existing code
- [x] Feature toggle pattern used correctly

### Improvements Needed

- [ ] Add PropTypes or migrate to TypeScript fully
- [ ] Extract duplicated logic to utils
- [ ] Remove commented code
- [ ] Complete TODO items (email check, signup flow)

---

## Security Considerations

✅ **Good:**
- Uses token authentication from cookies
- Credentials sent via POST (not GET)
- Error messages don't leak sensitive info

⚠️ **Consider:**
- Ensure backend validates:
  - Event registration is actually open
  - User hasn't already registered
  - Event has capacity
  - Registration deadline hasn't passed
- Consider rate limiting on registration endpoint (prevent spam)
- CSRF protection (should be handled by Django)

---

## Performance Considerations

✅ **Good:**
- Modal only renders when open
- No unnecessary re-renders
- Conditional rendering based on feature toggle

💡 **Consider:**
- Lazy load EventRegistrationModal (currently imported at top of ProjectPageRoot)
  ```typescript
  const EventRegistrationModal = dynamic(
    () => import('../components/project/EventRegistrationModal'),
    { ssr: false }
  );
  ```

---

## Documentation

**Missing:**
- No inline code comments explaining complex logic (stepper flow, state transitions)
- No JSDoc comments for component props
- TODO comments need to be addressed or tracked in issues

**Suggestion:** Add brief comments at key decision points, especially:
- Why different stepper flows for auth/unauth users
- Expected API response format
- What happens after successful registration

---

## Conclusion

### Overall Assessment: ⭐⭐⭐⭐☆ (4/5)

This is a **solid implementation** of the event registration frontend feature. The code is well-structured, follows project conventions, and provides a complete user experience for the happy path.

### Key Strengths
- Complete multi-step user flow
- Good UX with clear states and feedback
- Proper internationalization
- Feature toggle integration
- Deep-link support

### Must-Fix Before Merge
1. **Decide on signup flow approach** (complete in-modal, redirect to signup page, or defer to future PR)
2. **Implement or remove email check** (currently a TODO)
3. **Remove unused `eventRegistration` prop** (code cleanliness)

### Recommended Before Merge
4. Extract duplicated button logic to shared utilities
5. Clean up URL after deep-link opens modal
6. Remove commented code
7. Add PropTypes or complete TypeScript migration
8. Improve error handling specificity

### Nice-to-Have (Can be Follow-up PRs)
9. Lazy load modal component
10. Add automated tests
11. Improve accessibility (ARIA labels)
12. Add JSDoc comments

---

## Action Items

### For Developer
- [ ] Complete or remove signup flow
- [ ] Implement email check or simplify auth flow
- [ ] Extract shared helper functions
- [ ] Remove commented code
- [ ] Clean up unused props
- [ ] Test on mobile devices
- [ ] Add error state reset to "Try Again"

### For Reviewer
- [ ] Verify backend API is ready (`/api/projects/{slug}/register/`)
- [ ] Check if confirmation emails are configured
- [ ] Confirm feature toggle `EVENT_REGISTRATION` exists
- [ ] Review security implications with backend team
- [ ] Test complete flow in staging environment

### For Future Work
- [ ] Issue: Implement signup flow in modal or improve redirect flow
- [ ] Issue: Add automated tests for registration flow
- [ ] Issue: Improve mobile button sizing for accessibility
- [ ] Issue: Lazy load modal component
- [ ] Issue: Add rate limiting to registration API

---

**Review completed on:** April 2, 2026  
**Next step:** Address must-fix items and recommended improvements, then re-review or merge.

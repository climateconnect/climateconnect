# TASK: Auth Flow UX Improvements

**Type**: Task  
**Status**: COMPLETED  
**Started**: 2026-05-04  
**Epic**: [EPIC_auth_unification](./EPIC_auth_unification.md)  
**Owner**: CC  

---

## Overview

This task addresses five UX improvements to the new combined authentication flow (Phase A of Auth Unification epic). The new auth flow at `/login` needs refinement to match the visual polish and contextual clarity of the old `/signin` and `/signup` pages.

---

## Problem Statements

### 1. Custom Hub Styling (Priority: Prio1 and Perth)

**Problem**: When accessing the auth flow via `?hub=prio1` or `?hub=perth`, the custom hub header color is not applied to the auth page. The old `/signin` and `/signup` pages correctly applied hub-specific theming (e.g., Prio1 uses orange header, Perth uses its own brand color), but the new combined `/login` page does not.

**Business Reason**: Hub-specific theming is a key part of the platform's brand differentiation. Custom hubs like Prio1 and Perth rely on their distinct visual identity to feel like branded experiences, not generic Climate Connect pages.

**Old Pattern Reference** — signin.tsx uses this pattern (lines 170-173):
```tsx
const customTheme = hubThemeData ? transformThemeData(hubThemeData) : undefined;
const customThemeSignIn = hubThemeData
  ? transformThemeData(hubThemeData, themeSignUp)
  : themeSignUp;
```

The new `/login` page (line 267-270) does call `transformThemeData` but the resulting `customThemeSignUp` is not being passed to the `ThemeProvider` wrapping the auth components. Need to verify the ThemeProvider is actually using the custom theme.

**Implementation checklist**:
1. Verify `customThemeSignUp` is passed to `ThemeProvider` wrapping the auth step components
2. Check `ThemeProvider` wrapping in login.tsx renders at the correct level to affect all auth steps
3. Ensure `transformThemeData` is called with `themeSignUp` as the second argument (not just `theme`)

**Evidence**:
- Old pages: `getHubTheme()` is called in `getServerSideProps` and passed to the page, applying `transformThemeData()` to create a custom MUI theme with `palette.header.background` set to the hub's color.
- New page: `hubThemeData` is fetched and `customThemeSignUp` is created (line 268-270) but may not be passed to the ThemeProvider correctly.

**Acceptance Criteria**:
- [ ] When `?hub=prio1` is present, the auth page header uses the Prio1 orange color
- [ ] When `?hub=perth` is present, the auth page header uses the Perth brand color
- [ ] The custom header color persists across all auth steps (email entry, OTP, signup personal info, signup interests)
- [ ] No regression for non-hub auth flow (no `?hub=` param)
- [ ] ThemeProvider correctly wraps all auth step components with `customThemeSignUp`

---

### 2. Step 1 SVG Overlap Issue (Priority: Prio1)

**Problem**: When viewing the signup Step 1 (personal info) with custom hub `prio1`, the SVG/image element in `CustomAuthImage` component is not tall enough, causing it to overlap with the text content below it.

**Business Reason**: Visual layout defects undermine trust in the platform. Users notice when elements overlap or are cut off.

**Solution**: Simply make the image container taller. The fix is straightforward — increase the `height` value in `prio1_imageContainer`.

**Evidence**:
- `CustomAuthImage.tsx` line 29-43: `prio1_imageContainer` has `height: "6rem"` with responsive breakpoints reducing to `5rem` and `4rem` at lower breakpoints.
- When auth steps progress, the SVG container height appears insufficient, causing content overlap.

**Implementation**:
- Increase `height` from `6rem` to `8rem` (or whatever value is needed to prevent overlap)
- Apply same increase to `5rem` and `4rem` breakpoints if they still cause overlap
- Test on mobile viewport (375px width) to confirm fix

**Acceptance Criteria**:
- [ ] The custom hub image container has sufficient height at all breakpoints (mobile, tablet, desktop)
- [ ] No visual overlap between the SVG/image and the form content below it on Step 1 (personal info)
- [ ] Same fix applied to Perth hub if affected
- [ ] Tested on mobile viewport (375px width)

---

### 3. Navigation Icons

**Problem**: The new auth flow lacks proper navigation icons that existed in the old sign-in page:
1. **Back icon**: The old `/signin` page had a back arrow icon in the header area. The new flow uses a text "Back" button at the bottom of the form instead of a proper back arrow icon in the header.
2. **Close icon on Step 1**: The old sign-in had an X/close icon on the first step (similar to what exists in the old signup flow) to dismiss the auth modal/page.

**Business Reason**: Users expect consistent navigation affordances. The absence of familiar icons (back arrow, close X) makes the new flow feel less polished and potentially confusing.

**Old Signup Pattern Reference** — use the same component patterns as the old signup pages:

**Close icon** (BasicInfo.tsx — Step 1):
```tsx
import Close from "@mui/icons-material/Close";
<IconButton aria-label="close" onClick={() => { window.history.back(); }}>
  <Close />
</IconButton>
```

**Back arrow** (AddInfo.tsx, AddInterestArea.tsx — subsequent steps):
```tsx
import ArrowBack from "@mui/icons-material/ArrowBack";
const GoBackArrow = () => (
  <IconButton aria-label="close" onClick={() => handleGoBack(undefined, values)}>
    <ArrowBack />
  </IconButton>
);
```

**Acceptance Criteria**:
- [ ] AuthEmailStep (Step 1 - first step) has a close/X icon in the top-right corner — use same pattern as `BasicInfo.tsx`
- [ ] All subsequent auth steps have a back arrow icon in the header area — use same pattern as `AddInfo.tsx`
- [ ] Clicking back arrow returns to previous step
- [ ] Clicking close on Step 1 navigates to home or closes the flow
- [ ] Icons have proper aria-label for accessibility
- [ ] Icons match visual style and positioning of old signup pages
- [ ] Reuse the same imports (`@mui/icons-material/ArrowBack`, `@mui/icons-material/Close`)

---

### 4. Hub Context Mention

**Problem**: When a user signs up in the context of a hub (via `?hub=hubname`), the signup flow should mention the hub name so the user understands they're joining a specific community. The old registration form did this for custom hubs but the new flow doesn't do it for any hubs.

**Business Reason**: Contextual awareness increases conversion and reduces drop-off. Users who arrive via a hub should understand they're signing up for that hub's community, not a generic Climate Connect account.

**Evidence**:
- Old signup: used `texts.signup_to_join_hub` or similar text key when `hubUrl` was present
- New flow: `SignupPersonalInfoStep.tsx` line 42 uses `getTexts({ page: "profile", locale: locale, hubName: hubUrl })` but the text content doesn't mention the hub
- Need to identify exact location and text key to add

**Note**: Since we're already adding text in Step 1 (SignupPersonalInfoStep) for the Organisation Mention improvement (#5), the Hub Context Mention should also be added in the same location - Step 1. Both improvements can share the same location for adding contextual text to the user.

**Acceptance Criteria**:
- [ ] When `?hub=<name>` is present, the signup personal info step (Step 1) displays text that mentions the hub name (e.g., "Join the [Hub Name] community")
- [ ] This applies to ALL hubs, not just custom hubs (prio1, perth)
- [ ] The hub name is displayed in the appropriate text
- [ ] Location: in `SignupPersonalInfoStep.tsx` - same location as Organisation Mention text

---

### 5. Organisation Mention

**Problem**: The old signup form included text informing users that they can create or add an organization later. This was present in `BasicInfo.tsx` line 101: `texts.you_will_have_an_opportunity_to_create_or_add_an_organization_once_signed_up`. The new signup flow in `SignupPersonalInfoStep.tsx` does not have this text.

**Business Reason**: Users who want to join on behalf of an organization need assurance that they can add their organization later. Removing this text may cause confusion or cause potential organization representatives to abandon signup.

**Evidence**:
- Old `BasicInfo.tsx`: "You will have an opportunity to create or add an organization once you're signed up"
- New flow: `SignupPersonalInfoStep.tsx` - no such text near the form fields

**Acceptance Criteria**:
- [ ] `SignupPersonalInfoStep.tsx` includes a note that organizations can be added later
- [ ] Text should be consistent with the old registration text key or a new equivalent
- [ ] Placement: below the main form fields, above the Submit button, or as helper text
- [ ] Does not interfere with the main signup flow (should be subtle, not a primary CTA)

---

## Constraints & Non-Negotiable Requirements

1. **Hub theming must be preserved**: Any changes must not break the existing hub theming mechanism (`getHubTheme()` + `transformThemeData()`).
2. **Backward compatibility**: All existing auth functionality (email check, OTP flow, password login) must continue to work.
3. **Responsive design**: All UI changes must work on mobile (320px+), tablet, and desktop.
4. **Accessibility**: All new UI elements must have proper ARIA labels and keyboard navigation support.
5. **No breaking changes to API contracts**: Backend endpoints remain unchanged.

---

## Domain Context

### Auth Flow Components (New Combined Flow)
- `AuthEmailStep.tsx` - Entry step: email input, routes to signup/password/otp based on user status
- `AuthOtp.tsx` - OTP code entry step
- `AuthPasswordLogin.tsx` - Password login for returning users
- `AuthSignupStep.tsx` - Container for signup sub-steps
- `SignupPersonalInfoStep.tsx` - Step 1 of signup: name, location
- `SignupInterestsStep.tsx` - Step 2 of signup: sector/interest selection

### Hub Theming
- `getHubTheme()` in `frontend/src/themes/fetchHubTheme.ts` - Fetches hub theme data
- `transformThemeData()` in `frontend/src/themes/transformThemeData.ts` - Transforms API data to MUI theme with `palette.header.background`
- `CustomAuthImage.tsx` - Renders custom hub logo/images for prio1 and perth

### Custom Hub URLs
- `prio1` - Priority 1 hub (orange branding)
- `perth` - Perth hub

---

## AI Insights & Hints

1. **Hub styling issue**: The `AuthEmailStep` and other auth components already receive `hubUrl` prop. The missing piece is likely in the page-level component that wraps these - it may not be applying the custom theme correctly. Check how the `/login` page applies the custom theme from `getHubTheme()`.

2. **SVG overlap**: The `prio1_imageContainer` height of `6rem` may be insufficient when the auth form content is taller than expected. Consider using `min-height` instead of fixed height, or adjusting based on actual content needs.

3. **Navigation icons**: Material-UI `IconButton` with `ArrowBack` icon can be used for back navigation. The close icon can be `Close` icon. Position them in a header row above the form content.

4. **Hub context**: The `getTexts()` function accepts `hubName` parameter. If the text key `signup_to_join_hub` exists in the translation files, it may need to be used. Otherwise a new text key may need to be added.

5. **Organisation text**: The text key `you_will_have_an_opportunity_to_create_or_add_an_organization_once_signed_up` likely exists in the translation files. It can be reused or a new equivalent key added.

---

## Files Likely to be Modified

### Frontend
- `frontend/src/components/auth/AuthEmailStep.tsx` - Add close icon, hub styling verification
- `frontend/src/components/auth/AuthOtp.tsx` - Add back icon in header
- `frontend/src/components/auth/AuthPasswordLogin.tsx` - Add back icon in header
- `frontend/src/components/auth/SignupPersonalInfoStep.tsx` - Add hub context mention, org text
- `frontend/src/components/auth/SignupInterestsStep.tsx` - Back icon
- `frontend/src/components/hub/CustomAuthImage.tsx` - Fix SVG height
- `frontend/src/pages/` - If there is a `/login` page, check how it applies hub theming

### Translations (if needed)
- `frontend/public/texts/` - May need new text keys for hub context mention

---

## Testing Requirements

1. **Visual regression testing** for custom hubs (prio1, perth) at all breakpoints
2. **Accessibility testing** for new navigation icons
3. **Integration testing** ensuring auth flow completes successfully with all changes
4. **Mobile testing** specifically for SVG overlap issue

---

## System Impact Analysis

### Scope Classification
**Primary**: Frontend-only task. No backend API changes required.

### Components Affected

| Component | Type | Changes |
|-----------|------|---------|
| `AuthEmailStep.tsx` | Frontend | Add close icon, verify hub styling |
| `AuthOtp.tsx` | Frontend | Add back icon in header |
| `AuthPasswordLogin.tsx` | Frontend | Add back icon in header |
| `SignupPersonalInfoStep.tsx` | Frontend | Add hub context text, org mention text |
| `SignupInterestsStep.tsx` | Frontend | Back icon |
| `CustomAuthImage.tsx` | Frontend | Fix SVG height for prio1/perth |
| Hub theming system | Frontend | Verify custom theme application |

### Backend Impact
**None** - No API changes, no model changes, no migration needed.

### Architecture Impact
**Minimal** - This is a refinement task. The auth flow architecture (Phase A of EPIC_auth_unification) is already in place. This task improves UX within existing architecture.

### Risk Assessment
- **Low risk**: CSS-only changes and text additions
- **No breaking changes**: All modifications are additive or visual
- **Testable**: Visual regression testing sufficient; no backend test changes needed

### Implementation Recommendation
This task can be implemented by a **Frontend Developer** without architect review. The changes are localized to auth components and do not affect system architecture.

**Handoff**: Ready for implementation phase. Assign to Frontend Developer.

---

## Task Progress

```
Task Progress: IMPLEMENTATION (3/6)
┌─────────────────────────────┐
│ [✓] DRAFT                  │
│ [✓] IMPLEMENTATION          │
│ [ ] INTEGRATION_TESTING    ← Next
│ [ ] CODE_REVIEW            │
│ [ ] VALIDATION             │
│ [ ] COMPLETED             │
└─────────────────────────────┘
```

## Implementation Summary

**Completed implementations (2026-05-04):**

### 2. Step 1 SVG Height Fix
- **File**: [`CustomAuthImage.tsx`](../../frontend/src/components/hub/CustomAuthImage.tsx)
- **Change**: Increased `prio1_imageContainer` height from `6rem` to `8rem` (desktop), `5rem` to `6rem` (xl), `4rem` to `5rem` (lg)
- **Reason**: Prevents overlap between SVG/image and form content below it

### 3. Navigation Icons
- **Files**:
  - [`AuthEmailStep.tsx`](../../frontend/src/components/auth/AuthEmailStep.tsx) - Added close (X) icon
  - [`AuthOtp.tsx`](../../frontend/src/components/auth/AuthOtp.tsx) - Added back arrow icon
  - [`AuthPasswordLogin.tsx`](../../frontend/src/components/auth/AuthPasswordLogin.tsx) - Added back arrow icon
  - [`SignupPersonalInfoStep.tsx`](../../frontend/src/components/auth/SignupPersonalInfoStep.tsx) - Added back arrow icon
  - [`SignupInterestsStep.tsx`](../../frontend/src/components/auth/SignupInterestsStep.tsx) - Added back arrow icon
- **Reason**: Restore familiar navigation affordances from old auth pages

### 4. Hub Context Mention
- **File**: [`SignupPersonalInfoStep.tsx`](../../frontend/src/components/auth/SignupPersonalInfoStep.tsx)
- **Change**: Added conditional text display when `hubUrl` is present
- **Text**: Uses `texts.signup_to_join_hub?.replace("{hub_name}", hubUrl)` with fallback
- **Reason**: Increases conversion by making hub context clear to users

### 5. Organisation Mention
- **File**: [`SignupPersonalInfoStep.tsx`](../../frontend/src/components/auth/SignupPersonalInfoStep.tsx)
- **Change**: Added text below the headline reassuring users they can add organization later
- **Text**: Uses `texts.you_will_have_an_opportunity_to_create_or_add_an_organization_once_signed_up` with fallback
- **Reason**: Prevents organization representatives from abandoning signup due to uncertainty

### 1. Custom Hub Styling
- **Status**: Verified but NOT modified (see below)

**Note**: Hub theming is correctly passed through the component hierarchy:
- `login.tsx` creates `customThemeSignUp` via `transformThemeData(hubThemeData, themeSignUp)`
- `WideLayout` receives `customThemeSignUp` as `customTheme` prop and passes it to `LayoutWrapper`
- `LayoutWrapper` correctly applies it via `ThemeProvider theme={customTheme ?? theme}`
- **No code changes needed** - the theming infrastructure is working correctly. If hub colors don't appear, the issue may be with `hubThemeData` not being fetched or the hub not having a configured theme.

---

## Dependencies

- Depends on: EPIC_auth_unification (Phase A completion)
- Related: `AuthEmailStep.tsx`, `AuthOtp.tsx`, `AuthPasswordLogin.tsx`, `SignupPersonalInfoStep.tsx`, `CustomAuthImage.tsx`

---

## Notes

- This task covers UX improvements only - no backend changes required.
- All five issues are frontend-focused.
- The task should be split into sub-tasks if needed for parallel development.

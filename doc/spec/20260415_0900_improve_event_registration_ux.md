# Improve Event Registration UX

**Status**: READY FOR IMPLEMENTATION (Reference: [`task-based-development.md`](../for-agents/guides/task-based-development.md))
**Type**: Improvement
**Date and time created**: 2026-04-15 09:00
**Date Completed**: TBD
**GitHub Issue**: [#1885](https://github.com/climateconnect/climateconnect/issues/1885)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)  
**Related Specs**:
- [`20260309_0900_member_register_for_event.md`](./20260309_0900_member_register_for_event.md) ← builds on this initial implementation

## Problem Statement

Following the initial implementation of event registration (#1845), several UX issues and improvement opportunities have been identified from user testing and team review. This specification addresses UI polish items, text improvements, modal simplification, and additional features like available seat display.

**Core Requirements (User/Stakeholder Stated):**

1. **Button Text Styling (Browse Page Cards)**
   - Registration buttons on project cards in browse view should use uppercase text
   - Investigate why Material-UI default uppercase styling is not being applied

2. **Shortened "Closed" Button Text**
   - When event registration is closed (booked out), display "Booked Out" instead of "Registration Closed"
   - Rationale: Shorter text fits better in button layout, especially on mobile

3. **Language Redirect Fix**
   - Fix language redirect when users access the event via the registration deep-link URL (`/projects/{slug}/register`)
   - Current behavior: Language preference may not be preserved correctly

4. **Disable Card Hover Effect**
   - Disable the hover expansion effect on project cards that causes the registration button to jump/shift position
   - Keep the hover effect code in place for potential future use (comment out/disable via prop)

5. **Remove Modal Steps**
   - Remove the step indicators (1/2, 2/2) from the event registration modal
   - Rationale: Steps don't add enough value and become inconsistent across different use cases (logged in vs. not logged in)

6. **Show User Identity for Logged-In Users**
   - When a logged-in user opens the registration modal, display their avatar and name using the existing user component (likely `MiniProfilePreview`)
   - Remove the separate email and name input fields for logged-in users (they should be pre-filled/shown but not editable)

7. **Confirmation Message with Event Name**
   - Display confirmation message in the format: "Confirm your registration for [Event Name]"
   - This may be combined with the user identity display (#6)

8. **Show Available Seats**
   - Display available seats count below the registration button, similar to how follower count is displayed
   - Must work in both desktop and mobile views
   - On mobile, this may require increasing the height of the bottom navigation bar to accommodate the additional text

### Non Functional Requirements

- All changes must maintain accessibility standards (ARIA labels, keyboard navigation)
- Button styling must be consistent with Material-UI v5 conventions
- Mobile responsiveness must be preserved across all changes
- Changes should not introduce performance regressions
- Language switching must work correctly for all entry points (direct event page, browse cards, deep-link registration URL)
- Available seats display must show real-time data (or near real-time) to prevent user confusion

### AI Agent Insights and Additions

- The button text uppercase issue suggests a potential CSS specificity problem or missing `textTransform` prop on the Button component
- The hover effect is likely controlled in `ProjectCard` or `ProjectMetaData` components via a `hovering` state prop
- Language redirect issue probably relates to locale handling in the Next.js routing/middleware for the `/projects/{slug}/register` path
- Step removal will simplify the modal state machine and reduce code complexity
- Available seats should leverage the existing `registration_config.available_seats` field from the event detail API response
- The user identity component should reuse existing profile preview components to maintain consistency

## System Impact

- **Actors involved**:
  - `Member` (logged in): Sees improved registration UI with pre-filled identity
  - `Guest` (not logged in): Sees streamlined registration modal without steps
  - `System`: Provides available seats data in real-time
  
- **Actions to update**:
  - `Member` → `View Event Registration Button` → improved button text and styling
  - `Member` → `Open Registration Modal` → sees confirmation message with event name and available seats
  - `Member` (logged in) → `View Registration Form` → sees avatar/name instead of input fields
  
- **Flows affected**:
  - **Member Event Registration Flow** (from #1845): UI improvements throughout
  - **Browse Projects Flow**: Button styling on cards

- **Entity changes needed**: No
  - All data fields already exist in `EventRegistrationConfig`
  
- **Flow changes needed**: No
  - Core flow logic remains the same; only UI presentation changes

- **Integration changes needed**: No
  - No new external integrations required

- **New specifications required**: No
  - This is a refinement spec building on existing implementation

## Software Architecture

### Frontend Changes

#### 1. Button Text Uppercase (Browse Cards)

**Files to modify:**
- `/frontend/src/components/project/ProjectMetaData.tsx` - Registration button rendering

**Changes needed:**
- Add explicit `textTransform: 'uppercase'` to registration button styling
- Ensure Material-UI theme default is properly configured
- May require inline `sx` prop if CSS specificity issues exist

**Testing:**
- Verify buttons on browse page show uppercase text
- Check that MUI theme default is properly configured in theme files

#### 2. "Booked Out" Button Text

**Files to modify:**
- `/frontend/src/utils/eventRegistrationHelpers.ts` - `getRegisterButtonText()` function

**Changes needed:**
- Update return value when `status === "closed"` or `status === "full"` from "Registration Closed" to "Booked Out"
- Use translation key `booked_out` instead of `registration_closed`

**Translations to add:**
- `/frontend/public/texts/texts.ts` - Add `booked_out` key to project texts
- English: "Booked Out"
- German: "Ausgebucht"

#### 3. Language Redirect Fix

**Files to investigate:**
- `/frontend/middleware.ts` - Next.js middleware for locale handling
- `/frontend/pages/projects/[slug]/register.tsx` or similar registration page

**Changes needed:**
- Ensure the deep-link route (`/projects/{slug}/register`) properly detects and preserves locale from cookies or URL prefix
- Verify that `getServerSideProps` includes proper locale handling
- May need to add `getLocalePrefix()` call in page server-side props

**Testing:**
- Access `/projects/{slug}/register` with different locale cookies set
- Verify redirect URLs maintain locale prefix (`/de/projects/...` etc.)

#### 4. Disable Card Hover Effect

**Files to modify:**
- `/frontend/src/components/project/ProjectCard.tsx` or wherever hover state is managed
- `/frontend/src/components/project/ProjectMetaData.tsx`

**Changes needed:**
- Disable the hover expansion effect that causes the registration button to jump
- Either set `hovering={false}` prop or add a feature flag to conditionally enable/disable
- Keep the hover effect code in place with a comment explaining why it's disabled

**Testing:**
- Verify hover on project cards no longer causes button position shift
- Ensure code can be easily re-enabled if needed

#### 5. Remove Modal Steps

**Files to modify:**
- Event registration modal component (need to locate - likely in `/frontend/src/components/project/` or `/frontend/src/components/event/`)

**Changes needed:**
- Remove `<Stepper>` component from Material-UI
- Remove step indicators (1/2, 2/2) from modal header/footer
- Simplify modal to single-view form (no step transitions)
- Remove step-related state variables (`activeStep`, `handleNext`, `handleBack`)

**Testing:**
- Verify modal displays single unified form
- Ensure form submission still works correctly
- Test both logged-in and guest user flows

#### 6. Show User Identity for Logged-In Users

**Files to modify:**
- Registration modal/form component

**Changes needed:**
- When user is logged in, display their avatar and name using `MiniProfilePreview` component
- Remove or hide the separate email and name input fields for logged-in users
- Show confirmation email address as read-only text
- Keep name/email input fields for guest users (not logged in)

**Components to reuse:**
- `MiniProfilePreview` from `/frontend/src/components/profile/MiniProfilePreview.tsx`
- Access user data via `UserContext`

**Testing:**
- Verify logged-in users see their avatar and name
- Verify guest users still see input fields
- Ensure email confirmation message is displayed

#### 7. Confirmation Message with Event Name

**Files to modify:**
- Registration modal component

**Changes needed:**
- Add confirmation message in format: "Confirm your registration for [Event Name]"
- Use translation key for internationalization
- Display event name dynamically from `project.name`

**Translation keys to add:**
- `confirm_registration_for`: "Confirm your registration for"
- German: "Bestätigen Sie Ihre Anmeldung für"

**Testing:**
- Verify message displays with correct event name
- Test in both English and German

#### 8. Show Available Seats

**Files to modify:**
- `/frontend/src/components/project/ProjectMetaData.tsx` - Add seats display near button
- Mobile view: May need to adjust bottom navigation height

**Changes needed:**
- Display available seats count below the registration button
- Format: "[X] / [Y] seats available" (similar to follower count display)
- Show on both desktop and mobile views
- Only display when `registration_config.max_participants` exists
- On mobile, check if bottom navigation bar needs height adjustment to prevent overlap

**Data source:**
- `project.registration_config.available_seats` - already returned from API
- `project.registration_config.max_participants` - already returned from API

**Translation keys to add:**
- `seats_available`: "{available} / {total} seats available"
- German: "{available} / {total} Plätze verfügbar"

**Mobile navigation adjustment:**
- Check if bottom navigation needs height increase
- File: `/frontend/src/components/layouts/MobileBottomNavigation.tsx` or similar
- May need to increase `minHeight` or add padding if text overlaps with available seats display

**Testing:**
- Verify seats display on desktop and mobile
- Test with various seat counts (0, low, high numbers)
- Ensure mobile layout doesn't overlap with navigation

### API Changes

**No API changes required** - all necessary data is already provided:
- `GET /api/projects/{slug}/` returns `registration_config` with `available_seats` and `max_participants`
- Existing endpoints support all UI improvements

### Database Changes

**No database changes required** - all fields exist in `EventRegistrationConfig` model

## Testing Strategy

### Unit Tests

1. **Button text helpers** (`eventRegistrationHelpers.ts`)
   - Test `getRegisterButtonText()` returns "Booked Out" when status is "full" or "closed"
   - Test uppercase styling is applied

2. **Avatar display logic**
   - Test logged-in user sees `MiniProfilePreview`
   - Test guest user sees name/email input fields

3. **Available seats display**
   - Test seats are shown when `max_participants` exists
   - Test seats are hidden when registration is not enabled
   - Test edge cases (0 seats, null values)

### Integration Tests

1. **Language redirect**
   - Test accessing `/projects/{slug}/register` with German locale cookie
   - Verify correct redirect to `/de/projects/{slug}/register`
   - Test with English locale

2. **Modal flow (simplified)**
   - Test modal opens without step indicators
   - Test form submission works with single-view modal
   - Test logged-in vs. guest modal content

### Manual Testing Checklist

- [ ] Browse page registration buttons show uppercase text
- [ ] "Booked Out" appears when event is full or closed
- [ ] Language is preserved when using registration deep-link
- [ ] Hover effect on project card is disabled
- [ ] Registration modal has no step indicators
- [ ] Logged-in users see avatar and name (not email input)
- [ ] Confirmation message shows "Confirm your registration for [Event Name]"
- [ ] Available seats displayed below button on desktop
- [ ] Available seats displayed on mobile without layout issues
- [ ] Bottom navigation height is adequate on mobile
- [ ] All changes work in both English and German

### Accessibility Testing

- [ ] Button uppercase styling doesn't break screen reader announcements
- [ ] Available seats info is announced by screen readers
- [ ] Keyboard navigation works through simplified modal
- [ ] Color contrast meets WCAG AA standards for all new text

## Implementation Notes

### Order of Implementation

Suggested order to minimize conflicts:

1. **Remove modal steps** (simplifies subsequent changes)
2. **Add user identity display** (requires simplified modal)
3. **Add confirmation message** (pairs with user identity)
4. **Button text uppercase** (independent change)
5. **"Booked Out" text** (simple helper function change)
6. **Disable hover effect** (independent component change)
7. **Language redirect fix** (requires investigation first)
8. **Available seats display** (may require mobile layout adjustment)

### Files Summary

**Primary files to modify:**
- `/frontend/src/components/project/ProjectMetaData.tsx`
- `/frontend/src/utils/eventRegistrationHelpers.ts`
- Registration modal component (TBD - needs location)
- `/frontend/public/texts/texts.ts`
- `/frontend/middleware.ts` (possibly)
- Mobile bottom navigation component (possibly)

**Files to investigate:**
- Event registration modal component location
- Locale redirect handling in middleware
- Mobile bottom navigation layout

### Translation Keys Needed

Add to `/frontend/public/texts/texts.ts` under project section:

- `booked_out`: "Booked Out" (de: "Ausgebucht")
- `confirm_registration_for`: "Confirm your registration for" (de: "Bestätigen Sie Ihre Anmeldung für")
- `seats_available`: "{available} / {total} seats available" (de: "{available} / {total} Plätze verfügbar")

## Dependencies

- Material-UI v5 (`@mui/material`)
- Existing `MiniProfilePreview` component
- Existing `UserContext`
- Existing event registration API endpoints (no changes needed)

## Rollback Plan

All changes are frontend-only and do not affect data models or API contracts. Rollback can be achieved by:
1. Reverting the deployment
2. Individual changes can be feature-flagged if needed
3. No database migrations to roll back

## Success Metrics

- Registration button click-through rate (expected to maintain or improve)
- User confusion reports decrease (qualitative)
- Mobile usability scores improve
- No increase in accessibility issues reported
- Event registration completion rate maintains or improves

## Open Questions

1. **Modal component location** - Where is the event registration modal defined?
2. **Mobile bottom nav** - Will adding available seats require height adjustment? Need to test with actual UI.
3. **Hover effect removal** - Should we add a feature flag/prop to easily re-enable, or simply remove the hover state handling?
4. **Language redirect** - What is the exact failure mode? Need to reproduce the issue first.

## References

- Original issue: https://github.com/climateconnect/climateconnect/issues/1885
- Initial implementation: #1845
- Material-UI Button API: https://mui.com/material-ui/api/button/
- Next.js i18n routing: https://nextjs.org/docs/advanced-features/i18n-routing

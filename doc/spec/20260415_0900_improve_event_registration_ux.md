# Improve Event Registration UX

**Status**: IN PROGRESS (Points 1-5 COMPLETED)
**Type**: Improvement
**Date and time created**: 2026-04-15 09:00
**Date Completed**: TBD
**GitHub Issue**: [#1885](https://github.com/climateconnect/climateconnect/issues/1885)
**Epic**: [`EPIC_event_registration.md`](./EPIC_event_registration.md)  
**Related Specs**:

- [`20260309_0900_member_register_for_event.md`](./20260309_0900_member_register_for_event.md) ← builds on this initial implementation

**Implementation Progress:**

- ✅ Point 1: Button Text Uppercase - COMPLETED (2026-04-16)
- ✅ Point 2: "Booked Out" Text - COMPLETED (2026-04-16)
- ✅ Point 3: Language Redirect Fix - COMPLETED (2026-04-16)
- ✅ Point 4: Disable Card Hover Effect - COMPLETED (2026-04-16)
- ✅ Point 5: Remove Modal Steps - COMPLETED (2026-04-16)
- ⏳ Point 6: Show User Identity for Logged-In Users - PENDING
- ⏳ Point 7: Confirmation Message with Event Name - PENDING
- ⏳ Point 8: Show Available Seats - PENDING

## Problem Statement

Following the initial implementation of event registration (#1845), several UX issues and improvement opportunities have been identified from user testing and team review. This specification addresses UI polish items, text improvements, modal simplification, and additional features like available seat display.

**Core Requirements (User/Stakeholder Stated):**

1. **Button Text Styling (Browse Page Cards)**
   - Registration buttons on project cards in browse view should use uppercase text
   - Investigate why Material-UI default uppercase styling is not being applied

2. **Shortened "Closed" Button Text**
   - When event registration is closed (booked out), display "Booked Out" instead of "Registration Closed"
   - Applies to registration status: "closed", "full", and default fallback cases
   - Rationale: Shorter text fits better in button layout, especially on mobile
   - Note: The adminClosed state (when admin cancels a user's registration) still shows "Registration closed" as it's a different context

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
- Update default fallback return value to "Booked Out" (when status is undefined or other values)
- Use translation key `booked_out` instead of `registration_closed` for these cases
- Note: `texts.registration_closed` is still used for `adminClosed` UI state in RegistrationActionButton component

**Translations to update:**

- `/frontend/public/texts/project_texts.tsx` - Update `booked_out` key capitalization
- English: "Booked Out" (capital 'O')
- German: "Ausgebucht" (already correct)

**Tests to update:**

- `/frontend/src/utils/eventRegistrationHelpers.test.ts` - Update test expectations from "Registration Closed" to "Booked Out"

#### 3. Language Redirect Fix

**Files modified:**

- `/frontend/pages/projects/[projectId]/register.tsx` - Registration deep-link page

**Changes implemented:**

- Added import for `getLocalePrefix` from `apiOperations`
- Added `locale` parameter to `getServerSideProps` context
- Used `getLocalePrefix(locale)` to construct proper redirect destination with locale prefix
- Redirect now preserves language: `/de/projects/{slug}/register` → `/de/projects/{slug}?openRegistration=true`

**Testing:**

- Access `/projects/{slug}/register` (English) - should redirect to `/projects/{slug}?openRegistration=true`
- Access `/de/projects/{slug}/register` (German) - should redirect to `/de/projects/{slug}?openRegistration=true`
- Verify modal opens correctly with proper language after redirect

#### 4. Disable Card Hover Effect

**Files modified:**

- `/frontend/src/components/project/ProjectPreview.tsx` - Project card preview component

**Changes implemented:**

- Disabled hover state changes by setting `hovering = false` (constant instead of state)
- Commented out `useState(false)` and hover handlers (`handleMouseEnter`, `handleMouseLeave`)
- Commented out `onMouseEnter` and `onMouseLeave` props on Card component
- Added clear comments explaining the change is due to Issue #1885 (registration button jump/shift)
- All hover effect code kept in place for potential future re-enablement

**Result:**

- Project cards no longer expand on hover
- Registration buttons remain in stable position
- Short description stays hidden (no expansion)
- Code can be easily re-enabled by uncommenting the marked sections

**Testing:**

- Hover over project cards on browse page - no expansion occurs
- Registration button stays in same position
- Card styling remains consistent

#### 5. Remove Modal Steps

**Files modified:**

- `/frontend/src/components/project/EventRegistrationModal.tsx` - Event registration modal component

**Changes implemented:**

- Removed Material-UI Stepper components: `Stepper`, `Step`, `StepLabel`, `StepContent`
- Removed step-related code:
  - `steps` useMemo that defined step labels
  - `activeStep` variable that tracked current step
  - `getStepContent()` function that switched between step content
- Replaced with simplified `renderContent()` function that directly renders based on state:
  - Success state → shows success message
  - Error state → shows error message
  - Authenticated user + initial state → shows registration form
  - Unauthenticated user + initial state → shows authentication flow
- Modal now displays single unified view without step indicators

**Result:**

- No step indicators (1/2, 2/2) displayed in modal
- Cleaner, simpler UI
- Same functionality maintained (authentication → registration → confirmation)
- Code is more maintainable with less complexity

**Testing:**

- Authenticated users see registration form immediately
- Unauthenticated users see authentication flow first, then registration form after login
- Success/error states display correctly
- Form submission works as before

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

**Location:**

- **Project page (project detail page)** - Display available seats on the individual project page, NOT on browse cards
- Show below the registration button, similar to how the Following and Like buttons display their counts

**Files to modify:**

- `/frontend/src/components/project/ProjectOverview.tsx` - Main project detail page (desktop)
- `/frontend/src/components/project/Buttons/ProjectInteractionButtons.tsx` - Mobile bottom navigation bar
- `/frontend/src/components/project/Buttons/RegistrationActionButton.tsx` - Add container and seats display similar to FollowButton pattern

**Changes needed:**

- Display available seats count below the registration button on the project page
- Use the same visual pattern as the Following and Like buttons (number + text below button)
- Format: "[X] / [Y] seats available" where X is available_seats and Y is max_participants
- Show on both desktop and mobile views
- Only display when `registration_config.max_participants` exists (i.e., not unlimited capacity)
- Style similar to FollowButton's follower count display:
  - Container with flexbox column layout
  - Bold number, regular weight text
  - Appropriate spacing between button and count

**Data source:**

- `project.registration_config.available_seats` - already returned from API
- `project.registration_config.max_participants` - already returned from API

**Translation keys to add:**

- `seats_available`: "seats available"
- `seat_available`: "seat available" (singular form)
- German: "Plätze verfügbar" / "Platz verfügbar"

**Implementation pattern (follow FollowButton pattern):**

- Reference `/frontend/src/components/general/FollowButton.tsx` for the container and text display pattern
- Use `showLinkUnderButton` prop pattern from FollowButton
- Add `showSeatsInfo` prop to RegistrationActionButton component

**Testing:**

- Verify seats display on project page (desktop and mobile)
- Test with various seat counts (0, 1, low, high numbers)
- Verify singular/plural text (1 seat vs. multiple seats)
- Ensure styling matches Following/Like button displays
- Test with unlimited capacity events (should not show seats info)

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

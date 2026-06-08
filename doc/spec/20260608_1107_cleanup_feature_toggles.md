# Task: Clean Up Completed Feature Toggles (Frontend)

**Type**: Task  
**Status**: DRAFT  
**Created**: 2026-06-08  
**Owner**: —

---

## Problem Statement

Three feature toggles were used to gate incremental rollouts and are now fully live in all environments:

1. **`EVENT_REGISTRATION`** — gated the event registration UI across project pages, profile, and project creation.
2. **`AUTH_UNIFICATION`** — gated the new combined `/login` page and redirected legacy `/signin` and `/signup` to it.
3. **`REGISTRATION_CUSTOM_FIELDS`** — gated the custom registration fields UI in the organiser registration config and registration overview.

All three features are production-ready and the toggles are no longer needed as gates. The database entries will be deleted manually. This task removes the **frontend** toggle checks so the code reads as if the toggles are always on.

---

## Scope

**In scope**: Remove all frontend references to these three toggles — `isEnabled()` / `isFeatureEnabled()` calls, toggle-gated conditionals, toggle parameter threading, and the old auth page code that was behind the toggle.

**Out of scope**:
- Backend toggle model, migrations, API, or database entries (handled manually).
- The `FeatureToggleProvider` infrastructure, `useFeatureToggles` hook, or `isFeatureEnabled` helper — these are shared infrastructure used by other toggles and must remain.
- Any new features or behaviour changes — the production behaviour must be identical before and after.

---

## Acceptance Criteria

1. No frontend source file (outside of the feature toggle infrastructure itself and its tests) references `EVENT_REGISTRATION`, `AUTH_UNIFICATION`, or `REGISTRATION_CUSTOM_FIELDS`.
2. All event registration UI renders unconditionally for event-type projects (no toggle guard).
3. The combined `/login` page renders without a toggle guard. `/signin` and `/signup` permanently redirect (301) to `/login` (preserving `?redirect=` and `?hub=` params).
4. Custom registration fields UI renders unconditionally in the organiser create/edit flow and the registration overview.
5. The old `/signin` page component and `pages/signup.tsx` page component are replaced with minimal redirect stubs (see below).
6. Header links always show the single "Log in" link pointing to `/login` (the old "Log in" + "Sign up" dual-link pattern is removed).
7. Settings page auth method toggle and "set password" hint render unconditionally.
8. No dead imports or unused components remain.
9. `yarn lint` and `yarn format` pass.
10. Existing tests are updated to reflect the new unconditional behaviour.

---

## Implementation Notes

### Toggle 1: `EVENT_REGISTRATION`

The toggle only hid new features — there is no old code to remove. Each usage should be simplified to remove the guard, keeping the "enabled" path.

| File | Current Pattern | Change |
|------|----------------|--------|
| `src/components/shareProject/ShareProjectRoot.tsx` | `const isEventRegistrationEnabled = isEnabled("EVENT_REGISTRATION");` used in `showRegistrationStep = isEvent && isEventRegistrationEnabled` | Remove toggle variable. Simplify to `showRegistrationStep = isEvent`. Remove `useFeatureToggles()` import if no other toggle is used in this file. |
| `src/components/project/ProjectPageRoot.tsx` | `const isEventRegistrationEnabled = isEnabled("EVENT_REGISTRATION");` used in 8 places: `showRegistrationsTab`, deep-link `useEffect`, prop passing to `ProjectOverview` and `ProjectInteractionButtons`, and 3 JSX conditional blocks for modals (`EventRegistrationModal`, `ViewRegistrationAnswersModal`, `CancelRegistrationModal`) | Remove toggle variable. Remove `isEventRegistrationEnabled &&` from all conditionals. Remove `isEventRegistrationEnabled` prop from `<ProjectOverview>` and `<ProjectInteractionButtons>`. Clean up `useEffect` dependency array. Remove `useFeatureToggles()` import if unused. |
| `src/components/project/ProjectMetaData.tsx` | `const isEventRegistrationEnabled = isEnabled("EVENT_REGISTRATION");` passed to `shouldShowRegisterButton()` | Remove toggle variable. Update call site to not pass the toggle parameter. Remove `useFeatureToggles()` import if unused. |
| `src/utils/eventRegistrationHelpers.ts` | `shouldShowRegisterButton(isEventRegistrationEnabled, project)` and `getRegistrationUIState(isEventRegistrationEnabled, project, ...)` both take `isEventRegistrationEnabled` as first parameter | Remove `isEventRegistrationEnabled` parameter from both functions. Simplify: `shouldShowRegisterButton` removes the `isEventRegistrationEnabled &&` check; `getRegistrationUIState` removes the `!isEventRegistrationEnabled ||` early return. |
| `src/components/profile/ProfileRoot.tsx` | `const isEventRegistrationEnabled = isEnabled("EVENT_REGISTRATION");` guards API fetch and JSX | Remove toggle variable. Remove `isEventRegistrationEnabled &&` from the `useEffect` condition and JSX conditional. Remove `useFeatureToggles()` import if unused. |
| `src/components/project/Buttons/ProjectContentSideButtons.tsx` | `const isEventRegistrationEnabled = isEnabled("EVENT_REGISTRATION");` used in `showRegistrationButtons` | Remove toggle variable. Remove `isEventRegistrationEnabled &&` from `showRegistrationButtons` condition. Remove `useFeatureToggles()` import if unused. |
| `src/components/project/ProjectOverview.tsx` | Receives `isEventRegistrationEnabled` as a prop, passes to `getRegistrationUIState()` | Remove prop from interface and call site. After `getRegistrationUIState` signature change, remove the first argument. |
| `src/components/project/Buttons/ProjectInteractionButtons.tsx` | Receives `isEventRegistrationEnabled` as a prop, passes to `getRegistrationUIState()` | Remove prop from interface and call site. After `getRegistrationUIState` signature change, remove the first argument. |
| `src/components/project/EventRegistrationModal.tsx` | `isEnabled("EVENT_REGISTRATION") && (project.registration_config?.fields?.length ?? 0) > 0` for `showCustomFields` | Simplify to `(project.registration_config?.fields?.length ?? 0) > 0`. Remove `useFeatureToggles()` import if unused. |

**Test files to update**:
| File | Change |
|------|--------|
| `src/components/project/EventRegistrationModal.test.tsx` | Remove tests that explicitly toggle `EVENT_REGISTRATION` on/off. Keep tests that verify custom fields render based on `registration_config.fields`. |
| `src/utils/eventRegistrationHelpers.test.ts` | Remove tests that pass `false` as first arg to `shouldShowRegisterButton()` and `getRegistrationUIState()`. Update all remaining calls to remove the first boolean parameter. |

### Toggle 2: `AUTH_UNIFICATION`

The toggle gated a new page (`/login`) and redirected old pages (`/signin`, `/signup`). With the toggle always on:
- `/signin` and `/signup` become **permanent redirect stubs** to `/login`.
- `/login` no longer needs to check the toggle or redirect to `/signin` when off.
- The old `Login` component (`src/components/signup/Login.tsx`) is only used by `signin.tsx` — when `signin.tsx` becomes a redirect stub, it becomes dead code.
- The `BasicInfo`, `AddInfo`, `AddInterestArea` components are only used by `signup.tsx` — when it becomes a redirect stub, they become dead code.
- `AccountCreatedContent` is only used by `accountcreated.tsx`. The `/accountcreated/` page was part of the old signup flow (shown after signup to inform about verification email). In the new OTP flow, new users verify via OTP inline, so this page is also dead code. However, keep `/accountcreated.tsx` as a redirect to `/login` as well for old bookmarks/links.

| File | Change |
|------|--------|
| `pages/login.tsx` | Remove the `AUTH_UNIFICATION` toggle check in `getServerSideProps` (lines 38–54). Remove the `featureToggles` prop and its threading. Remove the `isFeatureEnabled` import if unused. |
| `pages/signin.tsx` | **Replace entire page component** with a minimal redirect stub. The stub should: (1) in `getServerSideProps`, redirect to `/login` with `?redirect=` and `?hub=` params preserved, status 301. (2) Export a minimal default component (can just return `null`). This preserves old links/bookmarks. |
| `pages/signup.tsx` | **Replace entire page component** with a minimal redirect stub. Same pattern as signin: redirect to `/login` preserving `?redirect=`, `?hub=`, `?message=`, `?message_type=` params. Status 301. |
| `pages/accountcreated.tsx` | **Replace with redirect stub** to `/login` preserving `?hub=` param. Status 301. This page was part of the old signup flow and is dead in the new OTP flow. |
| `src/components/header/Header.tsx` | Remove `isAuthUnificationEnabled` variable. Remove `isEnabled("AUTH_UNIFICATION")` call. Remove `useFeatureToggles()` import if unused. Remove the `isAuthUnificationEnabled` argument from `getLinks()` call. |
| `public/lib/headerLinks.ts` | Remove `isAuthUnificationEnabled` parameter from `getLinks()`, `getDefaultLinks()`, `getWasseraktionswochenLinks()`, and `COMMON_LINKS.AUTH_LINKS()`. Always return the single `/login` link (the `isAuthUnificationEnabled` branch). Remove the old dual-link `else` branch. |
| `public/data/customHubData.ts` | Remove `isAuthUnificationEnabled` from `CustomHubDataParams`, `GetCustomHubDataParams`, and all function signatures. |
| `public/data/customHubConfig/customHubLinks.ts` | Remove `isAuthUnificationEnabled` parameter from `getSharedLinks()`. |
| `public/data/customHubConfig/prio1.ts` | Remove `isAuthUnificationEnabled` parameter from `getPrio1Links()` and `prio1Config()`. |
| `public/data/customHubConfig/scott.ts` | Remove `isAuthUnificationEnabled` parameter from `getScottLinks()` and `scottConfig()`. |
| `src/components/account/SettingsPage.tsx` | Remove `isAuthUnificationEnabled` variable. Remove the `{isAuthUnificationEnabled && (` conditional wrapper around the auth method toggle section — render it unconditionally. Remove the `{isAuthUnificationEnabled && !settings.has_password && (` conditional around the set-password description hint — render unconditionally when `!settings.has_password`. Remove `featureToggles` from the component props. |
| `pages/settings.tsx` | Remove `featureToggles` from `getServerSideProps` fetch and from props passed to `<SettingsPage>`. Remove `getFeatureTogglesFromRequest` import if unused. |

**Files to delete** (dead code after redirect stubs):
| File | Reason |
|------|--------|
| `src/components/signup/Login.tsx` | Only imported by `signin.tsx` which becomes a redirect stub. |
| `src/components/signup/BasicInfo.tsx` | Only imported by `signup.tsx` which becomes a redirect stub. |
| `src/components/signup/AddInfo.tsx` | Only imported by `signup.tsx` which becomes a redirect stub. |
| `src/components/signup/AddInterestArea.tsx` | Only imported by `signup.tsx` which becomes a redirect stub. |
| `src/components/signup/AccountCreatedContent.tsx` | Only imported by `accountcreated.tsx` which becomes a redirect stub. |

**Test files to update**:
| File | Change |
|------|--------|
| `public/lib/headerLinks.test.ts` | Remove all tests that pass `isAuthUnificationEnabled` with different values. Update remaining tests to not pass this parameter. Add a test verifying the auth links always return the single `/login` link. |

### Toggle 3: `REGISTRATION_CUSTOM_FIELDS`

Same pattern as Toggle 1 — remove the guard, keep the enabled path.

| File | Change |
|------|--------|
| `src/components/shareProject/EventRegistrationSection.tsx` | Remove `{isEnabled("REGISTRATION_CUSTOM_FIELDS") && (` conditional around the custom fields section. Render it unconditionally. Remove `useFeatureToggles()` import if unused. |
| `src/components/project/ProjectRegistrationsContent.tsx` | `const isCustomFieldsEnabled` guards: (1) custom field export columns list, (2) "view answers" icon visibility, (3) conditional column definition generation. Remove variable and all 3 guards — always include custom field columns and view icon. Remove `useFeatureToggles()` import if unused. |
| `src/components/project/EditEventRegistrationModal.tsx` | `const isCustomFieldsEnabled` guards: (1) validate custom fields on publish, (2) include fields in save payload, (3) JSX conditional for the custom fields editor section. Remove variable and all 3 guards — always validate, always include in payload, always render the section. Remove `useFeatureToggles()` import if unused. |

**Test files to update**:
| File | Change |
|------|--------|
| `src/components/shareProject/EventRegistrationSection.test.tsx` | Remove toggle-gating tests. Remove `customFieldsToggleEnabled` parameter from `renderSection()`. Simplify `FeatureToggleProvider` wrapping if no other toggle is needed. |
| `src/components/project/EventRegistrationModal.test.tsx` | Remove tests that specifically test the `REGISTRATION_CUSTOM_FIELDS` toggle interaction. |
| `src/components/project/EditEventRegistrationModal.test.tsx` | Remove tests that mock `REGISTRATION_CUSTOM_FIELDS` toggle. |

---

## Out-of-scope Note: Feature Toggle Infrastructure

The `FeatureToggleProvider`, `useFeatureToggles`, `isFeatureEnabled`, `getFeatureToggles`, and `getFeatureTogglesFromRequest` utilities are **shared infrastructure** used by any current or future toggle. They must NOT be deleted or simplified as part of this task. The `pages/demo/featureToggles.tsx` demo page also stays.

---

## Verification

1. `cd frontend && yarn lint` — passes.
2. `cd frontend && yarn format` — passes.
3. `cd frontend && yarn test` — all tests pass (updated tests reflect unconditional rendering).
4. Manual smoke test:
   - `/signin` → 301 redirects to `/login`
   - `/signup` → 301 redirects to `/login`
   - `/login` → renders the combined auth page
   - Header shows single "Log in" link pointing to `/login`
   - `/settings` → auth method toggle and password section visible
   - Create event → registration step visible
   - Event detail page → register button, registration tab visible
   - Profile page → registered events section visible
   - Edit event registration → custom fields section visible

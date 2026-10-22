# Code Review: Removal of `@mui/styles`

**Branch:** `migrate-away-from-mui-style`
**Issue:** [#2290](https://github.com/climateconnect/climatehub/issues/2290)
**Reviewed against:** `master` (after merging `origin/master` at `c27b56f3c` into the branch, merge commit `3cfb7eef6`)
**Date:** 2026-10-21
**Reviewer:** Claude (code-review agent, forked, effort: high; findings re-verified in the main session)

---

## Summary

The branch removes the legacy `@mui/styles` (JSS: `makeStyles`, `withStyles`, `StylesThemeProvider`, `ServerStyleSheets`) from the frontend. It replaces it with `styled()` / `sx` from `@mui/material/styles` (emotion). It also adds an ESLint guard against reintroducing the package and updates the styling docs. The work is spread over 21 commits, and the diff touches 328 files (+13.5k / −15.1k lines).

**Verdict: no serious visual or behavioural regressions were found. The migration is careful.** The review checked the risk areas specific to a JSS → emotion migration:

- CSS ordering and specificity differences between JSS and emotion
- `$`-prefixed / style-only props leaking to the DOM or to MUI components (`shouldForwardProp`)
- `className` props passed to components that no longer forward them
- Theme access differences: the outer theme vs the hub `ThemeProvider` (old `makeStyles` hooks ran above it)
- Responsive breakpoints lost during conversion
- Styles dropped during conversion
- Lost class-based overrides of MUI internals (`.Mui*` selectors, `classes={{...}}`)

We scanned the whole diff with scripts and read about 60 files closely. Places that depend on the old JSS ordering or on the outer theme are handled deliberately, usually with a comment explaining why.

Eight findings remain open: one medium issue introduced by the branch, two low-severity bugs that predate the branch (the branch carries them over), and four cleanup items. In addition, the review uncovered a functional bug in `VisibleFooterHeight` that predates the branch. A ninth finding, an emotion runtime error found during manual testing, has been fixed.

**Checks after the merge:** `yarn check-types` passes · `eslint src pages public` clean · Jest **948/948 tests in 69 suites pass** · `yarn install --immutable` consistent · no `@mui/styles` left in `package.json` or `yarn.lock`.

---

## Merge with `master`

Merging the 20 new `master` commits led to conflicts in 10 files. In each conflict we kept the branch's `styled()` version and rewrote master's additions in the same style:

| File                                                                      | What master added, now in `styled()`                                                                                                                                                    |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pages/organizations/[organizationUrl].tsx`                               | Info `Alert` for draft organisations                                                                                                                                                    |
| `account/EditAccountPage.tsx`                                             | Drag & drop background drop zone (`$isDragOver` outline/background, focus ring); "Save draft" secondary button                                                                          |
| `account/UserAvatar.tsx`                                                  | Avatar drop zone (round, drag-over outline/background, focus ring)                                                                                                                      |
| `dialogs/GenericDialog.tsx`                                               | Brand-coloured `:focus-visible` ring on the dialog Paper (moved into `StyledDialog` as `& .MuiDialog-paper:focus-visible`; the auto-merged `classes.dialogPaper` reference was removed) |
| `editProject/EditProjectOverview.tsx`, `shareProject/AddPhotoSection.tsx` | Image drop zone drag-over border/background and focus ring on `ImageZone`                                                                                                               |
| `general/Form.tsx`                                                        | Secondary submit button (reuses `SubmitButton`)                                                                                                                                         |
| `organization/EditOrganizationRoot.tsx` (+ test)                          | Draft labels on the delete button; test no longer wraps renders in `StylesThemeProvider`                                                                                                |
| `organization/OrganizationPreview.tsx`                                    | "Draft" corner triangle; drafts link to the edit page                                                                                                                                   |

Master also brought in `@mui/styles` usage in files that merged cleanly:

- `organization/OrganizationDraftSavedPage.tsx` (new, used `makeStyles`): migrated to `styled()`, mirroring `ProjectSubmittedPage`.
- Five new test files wrapped renders in `StylesThemeProvider`: `EditAccountPage.test.tsx`, `UserAvatar.test.tsx`, `EditProjectOverview.test.tsx`, `Form.test.tsx`, `AddPhotoSection.test.tsx`. The wrapper was removed from all five.

---

## Findings

Severity legend: **Medium** = should be fixed before merge · **Low** = small defect · **Cleanup** = maintainability only.
"Origin" says whether the branch introduced the problem or carried it over from `master`.

### 1. [PERFORMANCE · Medium · introduced by branch] Scroll-driven value passed as a styled prop

**File:** `frontend/src/components/general/TranslateTexts.tsx:104–109`, used at `:525`

On master, the mobile `ActionBar`'s `bottom` was a dynamic `makeStyles` rule fed by `visibleFooterHeight`. JSS updates that single rule in place. The branch turns it into a styled prop:

```tsx
const ActionBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "$visibleFooterHeight",
})<{ $visibleFooterHeight?: number }>(({ $visibleFooterHeight }) => ({
  ...
  bottom: $visibleFooterHeight,
}));
```

Emotion serialises each distinct prop value into its own class and never removes old ones. With a value that changes on scroll, that means CSS rules are inserted during scrolling. It also breaks the rule this PR adds to `frontend/agent.md`: _"Put continuously changing values (scroll, sizes) in an inline style."_ `ProjectInteractionButtons` in this PR already follows that rule (`style={{ bottom }}`).

**How bad is it?** It is not a memory leak that builds up with usage:

- Emotion caches classes by their serialised styles. Going back to a value seen before reuses its class, so the number of classes grows with _distinct values_, not with scroll events. Scrolling up and down repeatedly over the same range adds nothing after the first pass.
- The value only varies while the footer is coming into view, between 0 and the footer height (64px). With whole-pixel scroll positions that caps at about 65 small rules (a few KB). On zoomed or high-DPI screens `scrollY` can be fractional, which allows more distinct values: hundreds up to a few thousand tiny rules over a long session. That is still well under 1 MB and not something a user would notice.
- The realistic cost is style recalculation when a new rule is inserted during scroll. That could cause slight jank on low-end devices the first time the user scrolls through the footer zone. Later passes reuse the cached classes.
- **The problem is currently latent:** because of the hook bug below, `visibleFooterHeight` only ever takes the values `0` and `NaN`, so in practice only two classes are ever created. Fixing the hook would expose the problem.

**Fix:** keep the static styles in `ActionBar` and pass the value inline: `<ActionBar style={{ bottom: visibleFooterHeight }} …>`. Drop the `$visibleFooterHeight` prop.

### 2. [BUG · Low · predates branch] `VisibleFooterHeight` hook always returns `NaN` after scrolling

**File:** `frontend/src/components/hooks/VisibleFooterHeight.ts:11`. Callers: `TranslateTexts.tsx:161`, `ProjectPageRoot.tsx:119`.

```ts
const footerHeight = footerHeightProp ? footerHeightProp : theme.spacing(8);
```

`theme.spacing(8)` returns the **string** `"64px"` (verified in Jest), not the number 64. As a result:

- `scrollYInverted > "64px"` and `scrollYInverted === "64px"` are always `false`.
- `"64px" - scrollYInverted` is `NaN`.

Both callers pass `{}`, so after the first scroll the hook returns `NaN` permanently. The browser drops `bottom: NaN`, so the fixed mobile action bars in TranslateTexts and on the project page never move up above the footer as intended. The behaviour is the same on `master`. This bug is also why finding 1 is latent today.

**Fix:** use a numeric height, e.g. `parseInt(theme.spacing(8), 10)` or a `64` constant. Fix finding 1 first (or in the same change), because a working hook would activate the class growth described there.

### 3. [BUG · Low · predates branch, made worse by branch] Right-side dialog close button style lost

**File:** `frontend/src/components/dialogs/GenericDialog.tsx:196`

```tsx
className={`classes.closeButtonRight ${closeButtonRightStyle}`}
```

This is a template string containing the _literal_ text `classes.closeButtonRight`, not a class lookup. The bug already existed on master. The branch then deleted the only `closeButtonRight` style definition (`color: grey[500]`) and kept the dead reference. Dialogs opened with `closeButtonRightSide` and no `closeButtonRightStyle` render the close icon in the default `IconButton` colour. Left-side close buttons (`CloseButtonLeft`) do get `grey[500]`, so the two variants look different, and the meaningless class name is emitted into the DOM.

**Fix:** add a `CloseButtonRight = styled(IconButton)` with `color: theme.palette.grey[500]` and pass `className={closeButtonRightStyle}`.

### 4. [BUG · Low · predates branch] Negative icon margin produces `NaN`

**Files:** `frontend/src/components/profile/ProfileRoot.tsx:46`, `frontend/src/components/account/AccountPage.tsx:143`

```ts
marginLeft: -theme.spacing(1), // -"8px" → NaN, declaration dropped by the browser
```

The intended −8px pull on the icon in the "share a project" / "create organization" buttons never applied, before or after the migration. The branch carried the line over in these two files and quietly dropped it in `pages/organizations/[organizationUrl].tsx`, so three copies of the same rule now differ.

**Fix:** `marginLeft: theme.spacing(-1)` everywhere. This _will_ visibly shift the icons by 8px, so check them visually.

### 5. [CLEANUP] Outdated "still on makeStyles" workarounds

**Files:**

- `frontend/src/components/eventCalendar/EventCardWide.tsx:23`
- `frontend/src/components/shareProject/ShareProject.tsx:14`

Both comments justify unscoped global class names plus descendant selectors because a child component "still uses `makeStyles`":

- `EventCardWide`: classes `EventCardWide-cardIcon`, `EventCardWide-locationText`, `EventCardWide-locationCell`; child components `LocationDisplay` and `ProjectSectorsDisplay`.
- `ShareProject`: class `shareProjectField`; child component `ProjectTypeSelector`.

All of those children are migrated in this PR, so the comments are wrong and the workaround is unnecessary. Unscoped global class names can clash with Webflow/devlink CSS, and the raised specificity makes later overrides harder.

**Fix:** replace them with `styled(ChildComponent)` wrappers or emotion classes passed through the existing `className` / `iconClassName` / `textClassName` props.

### 6. [CLEANUP] Transient-prop filter duplicated across the codebase

**Example:** `frontend/src/components/header/Header.tsx:44`

The "don't forward `$` props" filter is written out again in about 40 files under different names (`isNotTransientProp`, `noTransient`, `transientProps`, `notTransient`, …) with small differences (`typeof prop === "string"` vs `String(prop)`, typed vs untyped). About 64 more places use hand-kept `prop !== "$x"` lists. When someone adds a new `$prop` to a component with an explicit list (e.g. `LanguageSelect`, `GoBackButton`, `HubsDropDown`) and forgets the list, the prop is forwarded and React logs unknown-prop warnings.

**Fix:** one exported helper, e.g. `src/utils/styled.ts` → `export const shouldForwardTransient = (prop: PropertyKey) => typeof prop !== "string" || !prop.startsWith("$")`, used everywhere.

### 7. [CLEANUP] Unnecessary `<ClassNames>` + `&&` specificity hack

**File:** `frontend/src/components/dialogs/HubSupportersDialog.tsx:132`

The component wraps its whole dialog in emotion's `<ClassNames>` render prop and uses `"&&"` selectors so its classes "win over GenericDialog's own title/close styles". `GenericDialog` applies those class names to emotion-styled components. Emotion merges registered classes passed via `className` _after_ the component's own styles, so they win without the extra specificity. The doubled selector makes later overrides harder, and the render prop rebuilds the dialog tree on every render.

**Fix:** drop `&&`, or let `GenericDialog` accept `titleTextSx` / `closeButtonSx` props.

### 8. [CLEANUP] `Footer` uses a hand-kept forward-prop list for non-`$` props

**File:** `frontend/src/components/footer/Footer.tsx:15`

`FooterRoot = styled("footer", { shouldForwardProp: p => p !== "textColor" && p !== "noSpacingTop" && … })` blocks four style props by name. A custom `shouldForwardProp` replaces emotion's default `isPropValid` filtering for HTML tags. As a result, any future style prop missing from the list reaches the `<footer>` element and triggers React warnings.

**Fix:** rename them to `$textColor`, `$noSpacingTop`, … and use the shared filter from finding 6.

### 9. [BUG · Low · introduced by branch · FIXED] Emotion runtime error for an unquoted `content` value

**File:** `frontend/src/components/footer/LargeFooter.tsx:85`

Found during manual testing. In development, Next.js showed:

> You seem to be using a value for 'content' without quotes, try replacing it with `content: '" ''"'`

The newsletter box's `&:after` pseudo-element used `content: " ''"`, with a space before the quotes. Emotion's dev-mode check only accepts `content` values that are quoted strings or CSS keywords, and the leading space makes this value neither. JSS never checked `content`, so the value worked unchanged on master. The CSS output is the same either way, because whitespace before the quotes has no meaning, so production rendering was unaffected. It was a dev-only error overlay. No other `content` value in `src`, `pages` or `public` has this problem.

**Fix (applied):** `content: "''"`, matching the `&:before` rule next to it.

---

## Recommended next steps

| #   | Finding                             | Recommendation                                                                                                                               |
| --- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | TranslateTexts scroll prop          | Fix before merge (small change)                                                                                                              |
| 2   | `VisibleFooterHeight` returns `NaN` | Fix together with 1, ideally as a separate commit, since it changes behaviour that also exists on master (the action bars will start moving) |
| 3   | GenericDialog close button          | Fix before merge (small change)                                                                                                              |
| 4   | `-theme.spacing(1)`                 | Fix and check visually (icons shift by 8px)                                                                                                  |
| 5–8 | Cleanup                             | Follow-up PR is fine                                                                                                                         |
| 9   | Unquoted `content` in LargeFooter   | Fixed                                                                                                                                        |

## Verification notes

- Findings 1, 2, 3 and 4 were reproduced or confirmed by reading the code in the main session. `theme.spacing(8) === "64px"` was confirmed by running it in Jest.
- Findings 5–8 were confirmed by reading the cited code. The suggested fixes have not been prototyped.
- Finding 9 was reported from manual testing and has been fixed. Findings 1–8 have not been fixed on the branch yet.

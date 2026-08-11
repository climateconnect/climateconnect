# Frontend: Upgrade from Webflow Devlink Sync to Webflow Devlink Export

## Problem Statement

The Webflow CLI command we currently use to pull components from the Webflow Designer — `npx webflow devlink sync` — is being retired by Webflow on **August 31, 2026**. After that date the command stops working, which would break our CI pipeline (PR checks and production build), both of which run `yarn devlink-sync` to generate `frontend/devlink/` from the live Webflow project.

The official replacement is `webflow devlink export`, which is a different command with a different output format. Webflow provides a [migration guide](https://developers.webflow.com/devlink/docs/reference/migrate-from-sync) and the upgrade must be done by August 31.

This change is **high regression risk**: every prior upgrade of the Webflow CLI or the `devlink sync` command has introduced new problems (broken image URLs in CSS, unwanted framework styles leaking into `global.css`, conflicting star exports from the auto-generated barrel, generated `index.js` re-exporting incompatible modules). We have a post-processing script `frontend/scripts/fix-devlink.js` that patches a number of known issues after every sync. We must verify whether each of these patches is still needed under the new `export` command, whether the patches are still being applied correctly, and what new patterns the export command introduces that we need to handle.

The deadline-driven nature of this change means we cannot defer — if we miss August 31, the production build will fail and we cannot deploy.

## Acceptance Criteria

- [ ] `frontend/package.json` `devlink-sync` script runs `webflow devlink export` (instead of `webflow devlink sync`) and still applies the post-processing patch
- [ ] `@webflow/webflow-cli` devDependency is bumped to a version that supports `devlink export` (≥ 1.19.0 per the migration guide; pin to latest stable at implementation time)
- [ ] The output directory is **kept as `frontend/devlink/`** by setting `"rootDir": "./devlink"` in the new `webflow.json`. The migration guide's example uses `frontend/webflow/`, but `rootDir` is a free-form string in the V2 schema and any value works (verified against `@webflow/webflow-cli@1.21.0` source). See Trade-off Notes for the full rationale
- [ ] `frontend/webflow.json` is updated to the V2 schema (`devlink-export` block instead of `devlink` block, with `siteId` at the top level)
- [ ] `frontend/.webflowrc.js` is removed (the V2 CLI reads `webflow.json` only; `.webflowrc.js` is ignored)
- [ ] All application imports of devlink-generated code are **unchanged** (they continue to use `../devlink/...` because the directory name is kept). The existing import sites are:
  - `frontend/pages/_app.tsx` (global CSS import)
  - `frontend/pages/index.tsx` (landing page components + focus patch — verify whether the focus patch is still needed with the new module layout)
  - `frontend/src/components/devlink/DevlinkPage.tsx` (DevLinkProvider import)
  - `frontend/src/utils/getDevlinkComponent.ts` (componentRegistry import)
  - Any other file that imports from `devlink/`
- [ ] The `eslint` `ignorePatterns` in `frontend/.eslintrc.js` (`ignorePatterns: ["devlink/"]`) is **unchanged** because the directory name is kept as `frontend/devlink/`
- [ ] `frontend/next.config.js` `ignoreWarnings` rule for "conflicting star exports" is reviewed: kept if `webflow/` still produces the same warning, removed if the new export format does not (and the comment is updated to reflect current state)
- [ ] `frontend/scripts/fix-devlink.js` is updated to operate on the same `frontend/devlink/` directory, but the patches inside it may change based on the Phase 4 / Phase 5 comparison
- [ ] Each of the existing post-sync patches is evaluated against the new `export` output and either:
  - Kept (if still needed and verified to apply correctly to the new layout)
  - Removed (if no longer needed)
  - Replaced (if a different fix is needed for the new output format)
- [ ] The `componentRegistry.ts` regeneration step keeps working with the new output layout (`.d.ts` files in the new directory still match the `^declare function (\w+)` pattern)
- [ ] The `css/global.css` override from `scripts/devlink-global.css` is kept or adjusted — verify whether the new `export` command still injects the unwanted Webflow UI framework block, and if not, remove the override and the snapshot file
- [ ] The `css/classes.module.css` CDN-hostname fix is kept or removed — verify whether the new command still produces `https:///...` URLs in the consolidated CSS module
- [ ] The `frontend/scripts/devlink-global.css` snapshot is updated to match any new Webflow CSS structure (or the override is removed entirely if no longer needed)
- [ ] Local run of `yarn devlink-sync` succeeds end-to-end and produces a working build (`yarn build`) with the existing `frontend/devlink/` directory (refreshed in place)
- [ ] The `WebflowToken` field in `frontend/next.config.js` env allowlist is still valid (no change expected, but verified)
- [ ] `doc/environment-variables.md` is reviewed and updated if any env var name changes
- [ ] Both CI workflows (`.github/workflows/pull_request_frontend.yml` and the production deploy workflow) successfully run `yarn devlink-sync`
- [ ] The pre-existing bug in the PR CI workflow — it sets `WEBFLOW_SITE_API_TOKEN` (legacy) instead of `WEBFLOW_API_TOKEN` (canonical) — is fixed as part of this work
- [ ] `doc/architecture.md` is **unchanged** (still references `devlink/`, which remains the directory name). Optionally update the comment in that section to mention that the CLI is now `webflow devlink export` even though the directory is still called `devlink/`
- [ ] The migration PR contains ONLY the config / script / import-path changes (not the generated tree — that is gitignored and regenerated by CI). The diff is small and reviewable: `package.json`, `webflow.json`, `.webflowrc.js` (deleted), `fix-devlink.js`, `next.config.js`, `.eslintrc.js`, `.gitignore`, import statements in 5-10 files, and the workflow file. The generated `webflow/` tree (or `devlink/`, if the name is kept) is created on first CI run.
- [ ] A baseline snapshot of the current `devlink/` output is saved **inside the project** at `frontend/devlink-baseline/` (gitignored) before the CLI is upgraded, so it can be diffed against the new output from inside the IDE. This directory exists only on the developer's local machine and on the feature branch's working tree during the comparison — it never gets committed.
- [ ] The first `webflow devlink export` run is performed locally into `frontend/devlink-raw/` (gitignored), **without `fix-devlink.js` having been run**, so the raw new output can be inspected before any post-processing is applied
- [ ] The existing `frontend/devlink/` ignore rule in `.gitignore` is widened to cover all three comparison directories. Recommended: change `frontend/devlink/` to `frontend/devlink*/` in `.gitignore` (or list each explicitly: `frontend/devlink/`, `frontend/devlink-baseline/`, `frontend/devlink-baseline-fixed/`, `frontend/devlink-raw/`). The migration target directory itself remains `frontend/devlink/` (see Trade-off Notes)
- [ ] Hub landing pages (Balkonien, CcLandingpage, EnLandingpageClimateConnect, etc.) render with the same visual appearance as before the upgrade — the `global.css` override change is the biggest regression risk here

## Constraints and Non-Negotiable Requirements

- **Hard deadline**: Webflow retires `devlink sync` on **August 31, 2026**. The migration must be merged and deployed before then.
- **No change to the Webflow project / site ID** (`615d9a37fbb2467a53e09161`) — we are only changing how the code is pulled, not what is pulled.
- **No change to the Webflow components themselves** — this is purely an infrastructure/CLI upgrade.
- **The `devlink-global.css` snapshot must remain in sync with the Webflow base CSS** if the override is still needed. If the new `export` command no longer injects the unwanted framework styles, the override must be removed (not silently kept).
- **Backwards-compatible env vars**: `WEBFLOW_API_TOKEN` and `WEBFLOW_SITE_ID` are already documented in `doc/environment-variables.md` and are the names the new CLI expects. Do not rename them.
- **No new Webflow CLI features** beyond what `devlink export` provides — do not adopt the new `DevLink Slots → Webflow Slot`, `Runtime Props → Attributes`, or other Designer-side migrations in the same change. They are explicitly out of scope per the migration guide ("don't break the export, but they show deprecation warnings in the Designer" — separate work).
- **The devlink generated directory is gitignored** today (`.gitignore` line 42: `frontend/devlink/`). It is regenerated on every CI run by `yarn devlink-sync`. We are keeping the directory name `frontend/devlink/` (see Trade-off Notes) — the gitignore rule does not change for the main directory, only the comparison directories are added to it.
- **The devlink generated directory is excluded from ESLint** today (`frontend/.eslintrc.js` `ignorePatterns: ["devlink/"]`). Keep that behavior for the new directory — update the pattern to match the new directory name.
- **The migration PR diff is small.** Because the generated tree is gitignored, the PR will only contain config + script + import-path changes (no ~480-file generated diff). Reviewers can read the whole PR without skim-mode.
- **No backend changes** — the backend does not import from the devlink directory.
- **Tests must pass** (`yarn test`) and the build must succeed (`yarn build`) after the migration.

## Domain Context

### Current state — what works today

**CI runs** (both `.github/workflows/pull_request_frontend.yml` and `.github/workflows/master_climateconnect-frontend-appservice(slot2).yml`):
1. Install deps
2. `yarn devlink-sync` → which is `npx webflow devlink sync --no-input && node scripts/fix-devlink.js`
3. Continue to build/test

**`npx webflow devlink sync`** reads `frontend/.webflowrc.js` (V1 schema) plus `frontend/webflow.json` (V1 schema), authenticates with `WEBFLOW_API_TOKEN` + `WEBFLOW_SITE_ID`, and writes generated files into `frontend/devlink/`:
- ~70 component pairs (`Component.jsx` + `Component.d.ts`)
- `devlink/componentRegistry.ts` (auto-generated by our script, not by Webflow)
- `devlink/DevLinkProvider.js` + `.d.ts`
- `devlink/css/classes.module.css` (consolidated CSS module)
- `devlink/css/global.css` (Webflow base CSS)
- `devlink/webflow_modules/` (built-in infrastructure: Asset, BackgroundVideo, Basic, Boolean, Builtin, Conditionals, Conditions, Dropdown, Embed, Form, Icon, Layout, ListOfElements, Navbar, Number, Search, Slider, Slots, Tabs, Text, Widget, fonts.manifest.json, devlink-ix3.js, interactions.js, ix3-interactions.js, useInjectFonts.js, utils.js, etc.)

**`node scripts/fix-devlink.js`** applies three patches:
1. **CDN hostname fix** in `devlink/css/classes.module.css` — replaces `https:///` with `https://cdn.prod.website-files.com/`. Documented as a "safety net" — the script's own header notes components no longer import this file after fix #6 was abandoned, but `Button.jsx` (and likely other components) actually do still import it via `import _styles from "./css/classes.module.css"`, so this fix is doing real work.
2. **`global.css` override** — the new Webflow CLI injects a large Webflow UI framework block (`.w-nav`, `.w-slider`, `.w-button` etc.) into `css/global.css` which leaks into devlink components and visually breaks the hub landing pages. The fix is `fs.copyFileSync("scripts/devlink-global.css", "devlink/css/global.css")` — restoring a known-good 2,310-line snapshot of Webflow's base CSS. The script has a TODO: *"find a solution that doesn't require copying the file"*.
3. **Regenerate `componentRegistry.ts`** — scans all `.d.ts` files in `devlink/`, skips `webflow_modules/` and infrastructure files (`DevLinkProvider.d.ts`, `ix3-interactions.d.ts`), extracts the exported component name via regex `/^declare function (\w+)/m`, and emits a `componentRegistry: Record<string, React.ComponentType<any>>` map. Consumed by `frontend/src/utils/getDevlinkComponent.ts` for locale-aware (`En`/`De`) component lookups (full Jest test coverage exists).

**Other devlink-related code in the app** (not in the post-processing script):
- `frontend/next.config.js` lines 226-232: silences the webpack `ignoreWarnings` for "conflicting star exports" caused by `devlink/index.js` re-exporting both Boolean and Number value modules with the same names. Comment: *"This is a known issue in the Webflow DevLink code generator and cannot be fixed on our side."*
- `frontend/pages/index.tsx` lines 17-41: patches `HTMLElement.prototype.focus` to add `preventScroll: true` for `.w-tab-link` elements during the lifetime of the landing page. Comment links issue #2142: Webflow's generated Tabs component calls `.focus()` on the active tab on mount/remount, scrolling the page to the middle. The focus call lives in a gitignored devlink module, so they patch the prototype from outside.
- `frontend/.eslintrc.js` line 15: `ignorePatterns: ["devlink/"]`.
- `frontend/pages/_app.tsx` line 21: `import "../devlink/css/global.css"`.
- `frontend/src/components/devlink/DevlinkPage.tsx`: wraps children in `<DevLinkProvider>` from the devlink module.
- `frontend/public/lib/webflowOperations.ts` line 5: uses `process.env.WEBFLOW_API_TOKEN` for direct Webflow CMS API calls (independent of devlink).

### Pre-existing bugs uncovered

**PR CI auth bug** (`.github/workflows/pull_request_frontend.yml` line 29):
```yaml
WEBFLOW_SITE_API_TOKEN: ${{ secrets.WEBFLOW_API_TOKEN }}
```
The env var name `WEBFLOW_SITE_API_TOKEN` is the legacy name. The `.webflowrc.js` reads `process.env.WEBFLOW_API_TOKEN`. The secret itself is named `WEBFLOW_API_TOKEN`. So in PR CI, the resolved value of `process.env.WEBFLOW_API_TOKEN` is empty — PR sync has either been silently failing (cached token fallback?) or has been broken for some time. The production deploy workflow correctly uses `WEBFLOW_API_TOKEN`. This must be fixed as part of this work.

### Key Webflow migration facts (from the migration guide)

- New command: `webflow devlink export` (replaces `webflow devlink sync`)
- Requires `@webflow/webflow-cli` v1.19.0+ (we are on ^1.18.0)
- Requires Node.js v22+ (we are on v22.x in CI ✅)
- New config in `webflow.json`: `devlink-export` block with `rootDir: "./webflow"`, `cssScopes: true` (replaces `cssModules: true`), `ts: true`, `components: ".*"`, `componentGroups: ".*"`, `relativeHrefRoot: "/"`
- Site ID moves to top-level `siteId` field in `webflow.json`
- `.webflowrc.js` is ignored by the V2 CLI
- The export output uses CSS `@scope` (not CSS Modules) for style isolation
- Output directory default is `webflow/` (not `devlink/`)
- `devlink sync` stops working on August 31, 2026
- `WEBFLOW_SITE_API_TOKEN` is the legacy name → renamed to `WEBFLOW_API_TOKEN` (we are already on the new name, but the PR CI workflow is misconfigured)
- `devlinkContext.js` / `DevLinkProvider.js` duplicate export issue: may or may not exist in the new format — to be verified

### Name-collision risk: existing `src/components/webflow/` and `src/utils/webflow.ts`

There already exist two files unrelated to the devlink sync flow that use the `webflow` name:
- `frontend/src/utils/webflow.ts` — calls `https://climateconnect.webflow.io/hub-texts/...` via axios + cheerio to fetch HTML for legacy hub description pages
- `frontend/src/components/webflow/WebflowPage.tsx` — renders that scraped HTML

These predate the devlink work and have nothing to do with the Webflow CLI or the new `devlink export` command. **Decision: we are keeping the new directory as `frontend/devlink/`** by configuring `rootDir: "./devlink"` in the new `webflow.json`. This sidesteps the name-collision concern entirely. (Verified against `@webflow/webflow-cli@1.21.0` source — the `rootDir` field accepts any non-empty string.) We will not adopt the migration guide's example `frontend/webflow/` name; the only reason to rename would be to follow the guide's example more literally, and the cost (a misleading "webflow" directory in the project) outweighs the benefit (slight consistency with the guide's examples).

### Files that will likely need to change

**Strong expectations (migration guide is explicit):**
- `frontend/package.json` — `devlink-sync` script + `@webflow/webflow-cli` version
- `frontend/webflow.json` — V2 schema with `devlink-export` block
- `frontend/.webflowrc.js` — delete
- `frontend/tsconfig.json` — may need `paths` alias update (we currently have no `devlink/*` alias, so likely no change)
- All `import` paths from `devlink/...` to the new directory name (likely zero — if we keep the directory name as `devlink/`, no import changes are needed)
- `frontend/scripts/fix-devlink.js` — point at new directory
- `frontend/scripts/devlink-global.css` — possibly remove if no longer needed
- `frontend/.eslintrc.js` — update `ignorePatterns` (the current rule is the exact string `"devlink/"`, which does NOT match `"webflow/"` or any other name)
- `frontend/next.config.js` — review `ignoreWarnings` rule
- `frontend/.gitignore` — widen the existing `frontend/devlink/` rule to also cover `frontend/devlink-raw/` and `frontend/devlink-baseline/` (see Comparison & Verification Plan)
- `.github/workflows/pull_request_frontend.yml` — fix env var name
- `doc/architecture.md` — directory tree reference
- `doc/environment-variables.md` — review (no expected change)

**Note: the generated tree (`frontend/devlink/`) is NOT committed to git.** `frontend/devlink/` is gitignored (rule at `.gitignore` line 42: `frontend/devlink/`). It is regenerated on every CI run by `yarn devlink-sync`. This means:
- The migration PR will NOT contain the ~480 generated files as a diff — only the config + script + import-path changes
- The "first PR run produces a clean diff" acceptance criterion below refers to the **config/script diff**, not the generated content
- The new `rootDir` will also be gitignored, and the same regeneration pattern applies

**To be verified against the new output:**
- Whether the CDN hostname fix in `classes.module.css` is still needed (new format uses `@scope`, may not have the same image URL issue)
- Whether the `global.css` override is still needed (the framework block injection may have been fixed in newer CLI versions)
- Whether the `componentRegistry.ts` regex still matches the new `.d.ts` layout
- Whether the "conflicting star exports" warning still occurs
- Whether the `HTMLElement.focus` patch is still needed (depends on whether the Tabs module still uses `.focus()`)
- Whether `WEBFLOW_SITE_ID` env var is still used (V2 prefers it in `webflow.json`, but env override is still allowed per the migration guide)

### What we do NOT know yet (open questions for implementation)

- Exact output format of `webflow devlink export` (file extensions, naming, structure of `webflow_modules/`, structure of CSS files) — will only be known after running the command against a real Webflow project
- Whether the export command is interactive or has a `--no-input` equivalent — guide says "Let the CLI prompt you" for the first run; the actual command to run silently in CI may be different
- Whether the component files are still `.jsx` or whether they've moved to `.tsx` (guide mentions `ts: true` option)
- Whether the export command still requires `WEBFLOW_API_TOKEN` or whether it has moved to OAuth (`webflow auth login` is mentioned for failed-auth recovery)
- Whether the `tsx` output is compatible with our existing `tsconfig.json` (`include` patterns, `allowJs: false` — generated `.jsx` files might now be `.tsx`, which could affect the include list)

### Recent git history (devlink-related commits)

```
854dc17b Custom project description using webflow (#2016)
c3ea667e Fix devlink issues
90cd6ed3 Fix devlink issues (#1883)
da4f5704 Refactor devlink fixes
f35edace Fix devlink issues
86cb84e7 Fix Devlink Bug
963e353b Integrate Webflow ClimateHub landing pages with Devlink feature (#1480)
```

## AI Insights

### Implementation Hints

**1. The first devlink export should be done interactively in a dev environment** to walk through the CLI prompts, capture the actual output structure, and then write a fully non-interactive `devlink-export` block in `webflow.json` before pushing the migration to CI. The migration guide explicitly supports both flows: let the CLI prompt you, or hand-edit the diff. We will likely need a hybrid: run once interactively to verify the new layout, then commit the explicit `webflow.json`.

**2. Keep the directory name as `frontend/devlink/`** by setting `"rootDir": "./devlink"` in the new `webflow.json`. The migration guide's example uses `frontend/webflow/`, but `rootDir` is a free-form string in the V2 CLI's JSON schema (verified against the installed CLI source — see the schema definition in `node_modules/@webflow/webflow-cli/dist/index.js` and the CHANGELOG entry: *"Configurable output location with `rootDir`"*). This is a major de-risking choice: it means almost no import path changes are needed, the `.eslintrc.js` `ignorePatterns` doesn't change, the `.gitignore` rule doesn't change, and the migration PR becomes much smaller. The commit that does the migration is:
- Update `package.json` (`devlink-sync` script + CLI version bump)
- Update `webflow.json` (V2 schema with `rootDir: "./devlink"`)
- Delete `frontend/.webflowrc.js`
- Update `frontend/scripts/fix-devlink.js` (if any patches are dropped/replaced based on the comparison)
- (Optional) update `frontend/next.config.js` and `frontend/pages/index.tsx` based on the comparison
- (Optional) update `.github/workflows/pull_request_frontend.yml` to fix the env var bug

The `frontend/devlink/` directory stays where it is (gitignored) and gets refreshed on the first CI run. The devlink import paths (`from "../devlink/ComponentName"`) continue to work because the directory name doesn't change.

If a single atomic commit is too risky, fall back to a two-commit plan: (1) update the CLI + config, (2) adjust the post-sync script and any workarounds. But a single commit is strongly preferred so we never have a half-migrated state.

**3. Re-evaluate each post-sync patch after running the new command once** — do not just port them blindly. Specifically:
- Run `webflow devlink export` and inspect `frontend/devlink-raw/css/` — does it still contain `classes.module.css` with `https:///` URLs? Or has the new `@scope`-based approach changed the CSS layout entirely?
- Inspect `frontend/devlink-raw/css/global.css` — does it still contain the unwanted `.w-nav` / `.w-slider` / `.w-button` framework block? The migration guide implies the new format is cleaner, but does not guarantee it.
- Run `tsc --noEmit` against the new output to catch type errors early.
- Run `yarn build` to see whether the "conflicting star exports" warning still appears.

If a patch turns out to be no longer needed, **remove it and remove the related code** (including the `scripts/devlink-global.css` file if the `global.css` override is dropped). Do not carry forward dead code.

**4. The PR CI env var bug fix is small and should be done in the same PR** — the diff is one line:
```diff
-          WEBFLOW_SITE_API_TOKEN: ${{ secrets.WEBFLOW_API_TOKEN }}
+          WEBFLOW_API_TOKEN: ${{ secrets.WEBFLOW_API_TOKEN }}
```

**5. The `next.config.js` `ignoreWarnings` rule should be re-evaluated** rather than blindly kept. If the new format doesn't produce the warning, drop the rule and the comment. If it does, keep it (the comment text doesn't need to change because the directory name is still `devlink/`).

**6. The `HTMLElement.prototype.focus` patch in `pages/index.tsx`** depends on whether the new Tabs module still calls `.focus()` directly. Since the new `@webflow/webflow-cli` may regenerate the Tabs module from scratch, the patch may either still be needed (because the regenerated code still calls `.focus()`) or no longer needed (if Webflow fixed the underlying issue). Verify by inspecting the new Tabs component after the first export, and by testing the landing page scroll behavior in a browser.

**7. The package bump** from `^1.18.0` to `^1.19.0` (or latest) should be done in the same commit as the script change to avoid a half-broken intermediate state where the new yarn command is wired up but the CLI doesn't support it yet.

**8. Plan for two PRs at minimum**:
- **PR 1 (migration + first sync)**: All the code/config changes to migrate from sync to export. The generated `frontend/devlink/` directory is gitignored and NOT part of the PR — it is regenerated on the first CI run. This is the main risk PR — needs careful visual review of the hub landing pages (in the CI-generated artifact, or by running `yarn devlink-sync` locally + `yarn build`) to confirm no regressions. The PR is small and reviewable because the directory name is unchanged.
- **PR 2 (cleanup)**: Remove the post-processing patches that turned out to be unnecessary after PR 1 was verified in production. This is a safe follow-up that can wait a sprint.

### Comparison & Verification Plan (before/after the upgrade)

The only way to know whether each existing post-sync patch is still needed is to **sync via the old way, then export via the new way, and diff the results**. The plan is a strict sequence — do not skip phases.

**Important: do everything inside the project, not in `/tmp/`.** The IDE needs to see and follow the comparison artifacts, and the diff results need to be browsable in the file tree. Use a dedicated gitignored directory inside `frontend/` for each snapshot (see Acceptance Criteria for the gitignore rules).

**Phase 0 — Capture the baseline (local, ~5 min)**

We need THREE reference snapshots before the upgrade, not just one. The reason: `yarn devlink-sync` runs **two** steps — the Webflow CLI's `devlink sync` (which produces the raw generated tree) and our `scripts/fix-devlink.js` (which post-processes the tree). To compare apples to apples after the upgrade, we need to capture the state both **before and after** our fix script runs, on the **current** (old) CLI. That gives us:

- `devlink-baseline/` — the raw old CLI output (before fix-devlink.js)
- `devlink-baseline-fixed/` — the old CLI output AFTER fix-devlink.js (this is what we ship today)
- (after upgrade) `devlink-raw/` — the raw new CLI output (before fix-devlink.js)
- (after upgrade) `devlink/` — the new CLI output AFTER fix-devlink.js (this is what we ship after the migration)

Capturing all three references lets us answer both questions:
- "What did the Webflow CLI change?" → `diff -r devlink-baseline devlink-raw`
- "What does our fix script change, and does the new output need the same fix?" → `diff -r devlink-baseline devlink-baseline-fixed` (today) and `diff -r devlink-raw devlink/` (after upgrade)
- "Is the new fix output the same as the old fix output?" → `diff -r devlink-baseline-fixed devlink/`

Steps:
- `cd frontend`
- Create the gitignored baseline directories: `mkdir -p devlink-baseline devlink-baseline-fixed`
- The current `devlink/` already has the **post-fix** output (we just ran it). Save a copy:
  ```bash
  cp -r devlink/. devlink-baseline-fixed/
  ```
- We don't yet have the **pre-fix** raw output. We get that in Phase 1 below
- Save the post-fix file listing:
  ```bash
  find devlink-baseline-fixed -type f | sed 's|^devlink-baseline-fixed/||' | sort > devlink-baseline-fixed-files.txt
  ```
- Note the currently installed CLI version: `cat node_modules/@webflow/webflow-cli/package.json | grep version`

**Phase 1 — Re-run the old sync to confirm the baseline, AND capture the pre-fix snapshot (local, ~1-2 min)**
- The simplest way to capture the pre-fix (raw CLI) snapshot is to back up the current post-fix tree, re-run the CLI step alone (without `fix-devlink.js`), snapshot the result, then restore:
  ```bash
  cp -r devlink devlink-postfix-backup   # safety: keep the post-fix version
  npx webflow devlink sync --no-input     # overwrites devlink/ with raw output (no fix-devlink.js)
  cp -r devlink/. devlink-baseline/       # save the raw pre-fix snapshot
  rm -rf devlink
  mv devlink-postfix-backup devlink       # restore the post-fix devlink/ tree
  ```
- After this step:
  - `devlink-baseline/` = the raw old CLI output (pre-fix)
  - `devlink-baseline-fixed/` = the post-fix old output (this is what we ship today)
  - `devlink/` = the live, post-fix tree (unchanged from the start of Phase 1)
- Save the pre-fix file listing:
  ```bash
  find devlink-baseline -type f | sed 's|^devlink-baseline/||' | sort > devlink-baseline-files.txt
  ```
- **Do not delete `devlink-baseline/` or `devlink-baseline-fixed/` until the migration is complete.** They are the source of truth for the old layout in both raw and fixed states.

**Phase 2 — Upgrade the CLI and config (local, ~2 min)**
- `yarn add -D @webflow/webflow-cli@latest` (or pin to ≥ v1.19.0)
- Update `frontend/webflow.json` to the V2 schema (with `devlink-export` block, `siteId` at top, `rootDir: "./devlink-raw"`, `cssScopes: true`, `ts: true`) — **use `devlink-raw/` as the temporary `rootDir` for now** so we don't have to immediately decide on the final directory name. The comparison in Phase 4 will tell us if the new output is similar enough to the old that we can keep the directory as `frontend/devlink/` (recommended — see Trade-off Notes) or if we should rename it
- Delete `frontend/.webflowrc.js`
- **Do not** rename `frontend/devlink/` yet (decision made in Phase 5)
- **Do not** touch `frontend/scripts/fix-devlink.js` or `scripts/devlink-global.css` yet — we need the raw new output first

**Phase 3 — Run the new export once, cleanly, with and without the fix script (local, ~1-2 min)**
- The first `webflow devlink export` may be interactive (per the migration guide). Run it in a dev environment, accept the prompts, and capture the resulting config + output
- The raw output should land in `frontend/devlink-raw/` (because we set `rootDir` to that in Phase 2)
- **Critical: do NOT run `fix-devlink.js` yet against `devlink-raw/`.** The whole point of this phase is to see the unprocessed new output
- After capturing the raw output, we have a choice for the post-fix new snapshot:
  - (i) Skip it for now — defer the post-fix new vs. post-fix old comparison until after the migration
  - (ii) Edit `fix-devlink.js` temporarily to point at `devlink-raw/`, run it, save the result as `devlink-new-fixed/`, then revert
  - **Recommendation: option (i) for now.** The raw new output (`devlink-raw/`) is what we need to make the decision. The post-fix comparison can be done as a follow-up after the migration is in place (just re-run `yarn devlink-sync` once the migration is merged and the post-fix comparison happens in CI artifacts)
- After Phase 3, we have these three reference directories:
  - `devlink-baseline/` — raw old CLI output (pre-fix)
  - `devlink-baseline-fixed/` — post-fix old output (what we ship today)
  - `devlink-raw/` — raw new CLI output (pre-fix, no fix-devlink.js yet)
  - `devlink/` — live post-fix tree (unchanged from start of Phase 1; will be refreshed by CI after the migration)
- All four sit side by side in the project, all gitignored, all browsable in the IDE

**Phase 4 — Compare old vs new (the interesting part)**

We have three reference trees now (plus the live one), and each comparison tells us a different question:

| Comparison | Question it answers |
|---|---|
| `devlink-baseline/` vs `devlink-raw/` | What did Webflow's CLI change between sync and export? (This is the answer to the spec's main risk question.) |
| `devlink-baseline/` vs `devlink-baseline-fixed/` | What does our `fix-devlink.js` script change today, on the old CLI output? (Reference for what the fix script does — also tells us which files fix-devlink.js reads/modifies.) |
| `devlink-baseline-fixed/` vs `devlink-raw/` (when sizes/structure are similar) | The "is the new export a drop-in replacement for what we ship today?" question. If this diff is small or empty, the migration is trivial. |
| (Later, after migration) `devlink-baseline-fixed/` vs the new live `devlink/` | Did the post-fix output stay visually the same after the upgrade? (This is the visual regression test.) |

4a. **File-level diff** — which files exist in one tree but not the other (run against `devlink-baseline/` vs `devlink-raw/`):
```bash
cd frontend
diff devlink-baseline-files.txt <(find devlink-raw -type f | sed 's|^devlink-raw/||' | sort)
```
This surfaces: files that were renamed, files that were split (e.g. one `classes.module.css` → many scoped files), new infrastructure files, deleted infrastructure files.

4b. **Per-file diff for files that exist in both** — what changed in each file:
```bash
cd frontend
diff -ru devlink-baseline devlink-raw | head -200
```
This is where the real discoveries live:
- The `.jsx` → `.tsx` change
- The CSS module → CSS `@scope` change
- Whether `global.css` still has the unwanted framework block (compare against `scripts/devlink-global.css` directly)
- Whether `https:///...` URLs are still in the CSS
- Whether `index.js` still has the conflicting exports
- Whether the `declare function` regex still matches the new `.d.ts` layout

4c. **For files that only exist in one tree** — inspect by hand to understand what they are, then decide whether `fix-devlink.js` needs to learn about them (e.g. new infrastructure files to skip in the `componentRegistry.ts` scan)

4d. **"What does our fix script do today" diff** (sanity check that we know what the fix script is supposed to do):
```bash
cd frontend
diff -ru devlink-baseline devlink-baseline-fixed | head -100
```
This is the diff between the raw old CLI output and the post-fix old output. It tells us:
- Which files the fix script touches (the diff list)
- What changes it makes (the per-file diffs)
- Confirms that the fix script is doing what we think it's doing (vs. silently no-op-ing)

4e. **Build comparison:**
- `yarn build` against the old tree (should still work — we haven't broken it yet)
- `yarn build` against the new tree (this is the real test)
- Diff the two `next build` outputs for warnings — especially "conflicting star exports"

4f. **Visual diff** (if feasible): deploy both versions to staging, render the hub landing pages, and compare. This is the highest-effort check but also catches CSS regressions that no automated diff will see — especially around the `global.css` framework styles (`.w-nav`, `.w-slider`, `.w-button`).

**Phase 5 — Decide which patches survive, and whether to rename the directory**

5a. **Directory naming decision** (high-leverage — affects the rest of the migration):
- Compare the new export's output structure (`frontend/devlink-raw/`) against the existing one (`frontend/devlink-baseline/`)
- If the layout is similar (components in the root, css/ subfolder, webflow_modules/ subfolder) → **keep the directory name as `frontend/devlink/`** by setting `rootDir: "./devlink"` in the final `webflow.json`. (Recommended. See Trade-off Notes.)
- If the layout is very different (e.g. components nested under a different subfolder) → consider whether renaming helps clarity. In practice the layout is similar enough that keeping the name is fine.
- Add a code comment to `frontend/webflow.json` explaining that the directory is named `devlink/` for backwards-compatibility reasons, not because the CLI command is `devlink sync`

5b. **Patch decisions**:

| Patch / workaround | Decision rule (based on Phase 4) |
|---|---|
| CDN hostname fix in `css/classes.module.css` | If 4b shows no `https:///...` URLs in the new CSS (likely — `@scope` may handle this differently), drop the patch and the `replaceAll` call |
| `css/global.css` override from `scripts/devlink-global.css` | Compare `frontend/devlink-raw/css/global.css` against `frontend/scripts/devlink-global.css`. If they match → override is a no-op, drop the snapshot file and the `copyFileSync` call. If they differ and the diff is the unwanted framework block → keep the override and regenerate the snapshot from the new CLI's "clean" output. If they differ for some other reason → investigate before deciding |
| `componentRegistry.ts` auto-generation | Try running `fix-devlink.js` against `frontend/devlink-raw/` (with the `devlinkDir` path tweaked). If the `^declare function (\w+)` regex still matches the new `.d.ts` layout, keep it as-is. If not, update the regex and the infrastructure-file allowlist |
| `next.config.js` `ignoreWarnings` for "conflicting star exports" | Based on 4d — if the warning still appears, keep the rule. If not, drop the rule and the comment. No need to rename the comment to mention `webflow/` if we keep the directory name |
| `pages/index.tsx` `HTMLElement.focus` patch | Manual browser test — render the landing page, trigger the Tabs scroll behavior (issue #2142), see if it still happens. If yes, keep the patch. If Webflow fixed the underlying issue, drop it |

**Phase 6 — Make the change atomic in one commit (per file list in Acceptance Criteria)**
By this point we know:
- Whether the directory is `devlink/` (kept) or `webflow/` (renamed) — based on which diff is smaller and what reads better
- Which patches to keep, drop, or replace
- The final shape of `fix-devlink.js`, `scripts/devlink-global.css` (or its absence), `next.config.js`, `pages/index.tsx`
- The non-interactive `devlink-export` block in `webflow.json` (hand-edited from the interactive Phase 3 output)

**Important: the generated tree is gitignored.** The ~480 generated files in `frontend/devlink/` (the CLI produces ~480 files including the `webflow_modules/` infrastructure; `fix-devlink.js` adds `componentRegistry.ts` to make 481) are NOT in git (and will not be, regardless of whether we keep the directory name or rename it). The Phase 6 commit contains ONLY:
- `package.json` (script + CLI version bump)
- `webflow.json` (V2 schema)
- `.webflowrc.js` (deleted)
- `fix-devlink.js` (path + patch updates)
- `next.config.js` (ignoreWarnings review)
- `pages/index.tsx` (focus patch review)
- `.eslintrc.js` (ignorePatterns update)
- `.gitignore` (widened rule for `devlink*/` directories)
- **Zero source files with import path updates** (because we kept the directory name)
- `.github/workflows/pull_request_frontend.yml` (env var fix)
- `doc/architecture.md`, `doc/environment-variables.md`

The generated tree (`webflow/` or `devlink/`) is created on first CI run. This means reviewers can read the entire PR without skim-mode.

Then do the migration in a single commit (per the "single commit" trade-off below) and verify with `yarn lint`, `yarn check-types`, `yarn test`, `yarn build`, plus a visual check of at least one hub landing page.

**Phase 7 — PR CI verification**
- Push the branch and watch the PR CI run `yarn devlink-sync` against the live Webflow project with the corrected env var (`WEBFLOW_API_TOKEN` instead of `WEBFLOW_SITE_API_TOKEN`)
- This is the first time a PR has been able to actually authenticate against Webflow (the legacy env var name has been silently breaking PR CI auth — see Domain Context)
- If the PR sync fails, the corrected env var surfaces the failure mode instead of silently passing with no data

**Artifacts to keep around after the migration** (for future debugging — all inside the project, all gitignored):
- `frontend/devlink-baseline/` — old way reference
- `frontend/devlink-raw/` — first raw new export
- The commit hash / branch name where the first PR-ready new export was generated
- **Cleanup:** once the migration is merged to master and a subsequent production sync has run successfully, both `frontend/devlink-baseline/` and `frontend/devlink-raw/` can be deleted (or kept for one release cycle in case a regression is found late)

### Trade-off Notes

- **Keep `frontend/devlink/` as the directory name (recommended)** by setting `rootDir: "./devlink"` in the new `webflow.json`. Verified against the installed CLI source — `rootDir` is a free-form string. This is the safer choice because: (1) it requires no import path changes, (2) the eslint `ignorePatterns` and gitignore rule don't need to change, (3) the migration PR diff becomes much smaller (just config + script, no source-file changes), (4) the name-collision concern with the existing legacy `src/components/webflow/` and `src/utils/webflow.ts` is sidestepped entirely, and (5) the only downside is that the directory is named after a now-deprecated command — but a comment in `webflow.json` and `fix-devlink.js` can document that. The alternative (renaming to `webflow/` per the guide) has no functional advantage and adds risk.
- **Note on the "devlink folder that isn't from devlink sync" objection**: the directory was always called `devlink/` as a Webflow terminology, not because the command was `devlink sync`. Future developers reading the codebase can find context in `webflow.json`, the `devlink-sync` script in `package.json`, and the `fix-devlink.js` header comment. This is not a real downside.
- **Run the post-processing script unconditionally vs. conditionally**. Current script always runs `copyFileSync` and `replaceAll` even when they are no-ops. Keep this behavior — it makes the script idempotent and the log output makes regressions obvious.
- **Bump `@webflow/webflow-cli` to latest vs. pin to v1.19.x**. Latest is what the migration guide recommends ("`@webflow/webflow-cli@latest`"). We should follow that unless the latest version has a known regression. Use the latest stable at the time of the migration.
- **Adopt `ts: true` in the export config vs. keep generating `.jsx`**. The guide's recommended config has `"ts": true`. Our app already has TypeScript set up, so the generated `.tsx` files will work. This is the cleanest path. (Trade-off: `.tsx` is a stricter format than `.jsx` and may surface type errors in Webflow's code that were previously hidden. Worth running `tsc` early to find out.)
- **Keep or drop the `scripts/devlink-global.css` snapshot**. If the new CLI no longer injects the framework block, drop the snapshot and the override — it's 2,310 lines of stale CSS that drifts from upstream. If the block is still injected, the snapshot must be regenerated against the new CLI output and committed.
- **Delete the `devlink/` directory in the same commit vs. in a follow-up**. Single commit is cleaner; two commits is safer. Recommend single commit because the migration is deadline-driven and a follow-up is easy to lose track of.

### What "done" means for this task

The task is done when:
1. `yarn devlink-sync` runs `webflow devlink export` + a (potentially slimmed-down) post-processing script
2. The PR diff contains only the config / script / import-path changes — NOT the ~480-file generated tree (which is gitignored and regenerated by CI on first run)
3. The app builds, lints, and tests pass
4. Hub landing pages render correctly in production (visually verified)
5. The PR CI workflow is fixed (`WEBFLOW_API_TOKEN` instead of the legacy `WEBFLOW_SITE_API_TOKEN`)
6. No dead code from the old `sync` flow remains
7. `doc/architecture.md` and `doc/environment-variables.md` are up to date
8. `frontend/devlink/` is gitignored (unchanged) and excluded from ESLint (unchanged). The comparison directories `frontend/devlink-baseline/`, `frontend/devlink-baseline-fixed/`, and `frontend/devlink-raw/` are also gitignored via a widened rule
9. `frontend/devlink-baseline/` and `frontend/devlink-raw/` are either deleted (cleanest) or kept for one release cycle as a debugging fallback

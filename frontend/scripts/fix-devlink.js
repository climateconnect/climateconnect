/**
 * Post-devlink-sync patch script.
 *
 * Webflow devlink generates several issues that must be patched
 * after every `npx webflow devlink sync` run:
 *
 * 1. `css/classes.module.css` contains broken background-image URLs where the
 *    CDN hostname (`cdn.prod.website-files.com`) is stripped, producing invalid
 *    URLs like `https:///615d9a37...`. Fix: restore the missing hostname (kept
 *    as a safety net even though components no longer import this file after #4).
 *
 * 2. The new Webflow CLI injects a large Webflow UI framework block into `global.css`
 *    (`.w-nav { background: #dddddd }`, `.w-slider { background: #dddddd; height: 300px }`,
 *    `.w-button { background-color: #3898EC }`, etc.). These leak into devlink components
 *    and change the appearance of the hub landing pages.
 *    Fix: replace global.css with the stable version stored at scripts/devlink-global.css.
 *    If the Webflow design changes (fonts, CSS variables, typography), update that file too.
 *
 * If devlink index.js is being used (should be avoided!) there are more issues:
 * 3. `devlinkContext.js` (legacy) and `DevLinkProvider.js` (current) are both
 *    generated and re-exported from `index.js`. They export the same names,
 *    causing a "conflicting star exports" build error. Fix: delete the legacy
 *    files, remove the duplicate export line from index.js and index.d.ts,
 *    and update _Builtin/Basic.js which imports DevLinkContext from the
 *    legacy file (it should import from DevLinkProvider instead).
 *
 * 4. `export * from "./css/classes"` references a CSS module file
 *    (`classes.module.css`) that cannot be re-exported as a JS module.
 *    Fix: remove that export line.
 *
 * 5. `values/Number/doesNotEqual` and `values/Number/equals` conflict with
 *    `values/Boolean/doesNotEqual` and `values/Boolean/equals` (same export
 *    names). Fix: remove the Number variants from the barrel (they are
 *    functionally identical for the use cases in Webflow components).
 *
 * 6. Each component JS file now imports from the consolidated `css/classes.module.css`
 *    instead of its own `ComponentName.module.css`. The consolidated file has broken
 *    image URLs (see #5) and causes CSS loading issues with Next.js dynamic imports.
 *    The individual CSS files are still generated and have correct content.
 *    Fix: revert each component's CSS import to its own file.
 *
 * Run this script immediately after `npx webflow devlink sync`.
 */

const fs = require("fs");
const path = require("path");

const devlinkDir = path.join(__dirname, "..", "devlink");

// 1. Fix broken background-image URLs in css/classes.module.css.
// The Webflow CLI strips the CDN hostname when generating the consolidated CSS,
// producing `url(https:///615d9a37...)` instead of
// `url(https://cdn.prod.website-files.com/615d9a37...)`.
const cssPath = path.join(devlinkDir, "css", "classes.module.css");
if (fs.existsSync(cssPath)) {
  const original = fs.readFileSync(cssPath, "utf8");
  const patched = original.replaceAll("https:///", "https://cdn.prod.website-files.com/");
  if (patched !== original) {
    fs.writeFileSync(cssPath, patched, "utf8");
    console.log("fix-devlink: restored CDN hostnames in css/classes.module.css");
  } else {
    console.log("fix-devlink: css/classes.module.css URLs already clean, nothing to do");
  }
}

// 2. Replace global.css with the stable version from scripts/devlink-global.css.
// The synced global.css now includes Webflow's full UI framework CSS (.w-nav,
// .w-slider, .w-button, etc.) which conflicts with the hub landing page styling.
// scripts/devlink-global.css is the known-good version without those additions.
// Update scripts/devlink-global.css if fonts, CSS variables, or typography change.
// TODO find a solution that doesn't require copying the file
const stableGlobalCss = path.join(__dirname, "devlink-global.css");
const globalCssPath = path.join(devlinkDir, "global.css");
if (fs.existsSync(stableGlobalCss)) {
  fs.copyFileSync(stableGlobalCss, globalCssPath);
  console.log("fix-devlink: restored global.css from scripts/devlink-global.css");
} else {
  console.warn("fix-devlink: scripts/devlink-global.css not found — global.css NOT restored.");
}

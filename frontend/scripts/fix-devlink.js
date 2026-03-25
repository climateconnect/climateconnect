/**
 * Post-devlink-sync patch script.
 *
 * Webflow devlink generates both `devlinkContext.js` (legacy) and
 * `DevLinkProvider.js` (current) and re-exports both from `index.js`.
 * They export the same names, which causes a "conflicting star exports"
 * build error in Next.js / webpack.
 *
 * This script removes the stale files and the duplicate export line.
 * Run it immediately after `npx webflow devlink sync`.
 */

const fs = require("fs");
const path = require("path");

const devlinkDir = path.join(__dirname, "..", "devlink");

// 1. Delete legacy files
const legacyFiles = ["devlinkContext.js", "devlinkContext.d.ts"];
for (const file of legacyFiles) {
  const fullPath = path.join(devlinkDir, file);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log(`fix-devlink: removed ${file}`);
  }
}

// 2. Remove the duplicate export line from index.js
const indexPath = path.join(devlinkDir, "index.js");
if (fs.existsSync(indexPath)) {
  const original = fs.readFileSync(indexPath, "utf8");
  const patched = original
    .split("\n")
    .filter((line) => !line.includes('export * from "./devlinkContext"'))
    .join("\n");

  if (patched !== original) {
    fs.writeFileSync(indexPath, patched, "utf8");
    console.log("fix-devlink: removed duplicate export from index.js");
  } else {
    console.log("fix-devlink: index.js already clean, nothing to do");
  }
}

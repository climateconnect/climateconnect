#!/usr/bin/env node

const fs = require("fs");
const { execSync } = require("child_process");

// Get all files with React.* usage warnings from ESLint
const eslintOutput = execSync("yarn lint 2>&1", { encoding: "utf-8", cwd: __dirname + "/.." });

// Parse ESLint output to get files and what React members they use
const fileIssues = {};
const lines = eslintOutput.split("\n");

let currentFile = null;
lines.forEach((line) => {
  // Match file paths
  const fileMatch = line.match(/^(.+\.(tsx?|jsx?))$/);
  if (fileMatch) {
    currentFile = fileMatch[1];
    if (!fileIssues[currentFile]) {
      fileIssues[currentFile] = new Set();
    }
    return;
  }

  // Match warnings about React members
  const warningMatch = line.match(/`React` also has a named export `(\w+)`/);
  if (warningMatch && currentFile) {
    fileIssues[currentFile].add(warningMatch[1]);
  }

  // Match Router issues
  if (
    line.includes("Using exported name 'Router' as identifier for default import") &&
    currentFile
  ) {
    fileIssues[currentFile].add("Router");
  }

  // Match PropTypes issues
  const propTypesMatch = line.match(/`PropTypes` also has a named export `(\w+)`/);
  if (propTypesMatch && currentFile) {
    if (!fileIssues[currentFile].has("PropTypes")) {
      fileIssues[currentFile].add("PropTypes");
    }
  }
});

// Process each file
let filesModified = 0;
Object.entries(fileIssues).forEach(([filePath, members]) => {
  if (members.has("Router")) {
    fixRouterImport(filePath);
    members.delete("Router");
  }

  if (members.has("PropTypes")) {
    // PropTypes issues are trickier, skip for now
    members.delete("PropTypes");
  }

  if (members.size > 0) {
    fixReactImports(filePath, Array.from(members));
  }
});

function fixRouterImport(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");

    // Replace: import Router from "next/router"
    // With: import { useRouter } from "next/router"
    const routerPattern = /import\s+Router\s+from\s+["']next\/router["']/g;
    if (routerPattern.test(content)) {
      content = content.replace(routerPattern, 'import { useRouter } from "next/router"');
      // Note: This may require more manual fixes for Router usage
      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`Fixed Router import in: ${filePath}`);
      filesModified++;
    }
  } catch (err) {
    console.error(`Error fixing Router in ${filePath}:`, err.message);
  }
}

function fixReactImports(filePath, members) {
  try {
    let content = fs.readFileSync(filePath, "utf-8");
    let modified = false;

    // Find the React import line
    const reactImportPattern = /import\s+React(?:\s*,\s*\{([^}]*)\})?\s+from\s+["']react["'];?/;
    const match = content.match(reactImportPattern);

    if (!match) {
      console.warn(`No React import found in ${filePath}`);
      return;
    }

    // Get existing named imports
    const existingImports = match[1]
      ? match[1]
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    // Add new imports that aren't already imported
    const allImports = [...new Set([...existingImports, ...members])];

    // Build new import statement
    let newImport;
    if (allImports.length > 0) {
      newImport = `import React, { ${allImports.join(", ")} } from "react";`;
    } else {
      newImport = `import React, { member } from "react";`;
    }

    content = content.replace(reactImportPattern, newImport);
    modified = true;

    // Replace member with member
    members.forEach((member) => {
      const pattern = new RegExp(`React\\.${member}\\b`, "g");
      if (pattern.test(content)) {
        content = content.replace(pattern, member);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`Fixed React imports in: ${filePath}`);
      filesModified++;
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
}

console.log(`\n✅ Modified ${filesModified} files`);
console.log('\nRun "yarn lint" again to verify fixes.');

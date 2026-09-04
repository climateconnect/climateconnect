import { readdirSync, statSync, unlinkSync, rmSync } from "fs";
import { join, extname, basename } from "path";

const ROOT = join(import.meta.dirname, "..", "node_modules");

// Exact match from https://github.com/tj/node-prune/blob/master/internal/prune/prune.go
const FILES = new Set([
  "Jenkinsfile",
  "Makefile",
  "Gulpfile.js",
  "Gruntfile.js",
  "gulpfile.js",
  ".DS_Store",
  ".tern-project",
  ".gitattributes",
  ".editorconfig",
  ".eslintrc",
  "eslint",
  ".eslintrc.js",
  ".eslintrc.json",
  ".eslintrc.yml",
  ".eslintignore",
  ".stylelintrc",
  "stylelint.config.js",
  ".stylelintrc.json",
  ".stylelintrc.yaml",
  ".stylelintrc.yml",
  ".stylelintrc.js",
  ".htmllintrc",
  "htmllint.js",
  ".lint",
  ".npmrc",
  ".npmignore",
  ".jshintrc",
  ".flowconfig",
  ".documentup.json",
  ".yarn-metadata.json",
  ".travis.yml",
  "appveyor.yml",
  ".gitlab-ci.yml",
  "circle.yml",
  ".coveralls.yml",
  "CHANGES",
  "changelog",
  "LICENSE.txt",
  "LICENSE",
  "LICENSE-MIT",
  "LICENSE.BSD",
  "license",
  "LICENCE.txt",
  "LICENCE",
  "LICENCE-MIT",
  "LICENCE.BSD",
  "licence",
  "AUTHORS",
  "CONTRIBUTORS",
  ".yarn-integrity",
  ".yarnclean",
  "_config.yml",
  ".babelrc",
  ".yo-rc.json",
  "jest.config.js",
  "karma.conf.js",
  "wallaby.js",
  "wallaby.conf.js",
  ".prettierrc",
  ".prettierrc.yml",
  ".prettierrc.toml",
  ".prettierrc.js",
  ".prettierrc.json",
  "prettier.config.js",
  ".appveyor.yml",
  "tsconfig.json",
  "tslint.json",
]);

const DIRECTORIES = new Set([
  "__tests__",
  "test",
  "tests",
  "powered-test",
  "docs",
  "doc",
  ".idea",
  ".vscode",
  "website",
  "images",
  "assets",
  "example",
  "examples",
  "coverage",
  ".nyc_output",
  ".circleci",
  ".github",
]);

const EXTENSIONS = new Set([
  ".markdown",
  ".md",
  ".mkd",
  ".ts",
  ".jst",
  ".coffee",
  ".tgz",
  ".swp",
]);

let filesRemoved = 0;
let dirsRemoved = 0;

function shouldRemoveFile(filePath) {
  const name = basename(filePath);
  if (FILES.has(name)) return true;
  const ext = extname(filePath);
  return EXTENSIONS.has(ext);
}

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    let stat;
    try {
      stat = statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      if (DIRECTORIES.has(entry)) {
        try {
          rmSync(fullPath, { recursive: true, force: true });
          dirsRemoved++;
        } catch {}
        continue;
      }
      if (entry === "node_modules") continue;
      walk(fullPath);
    } else if (shouldRemoveFile(fullPath)) {
      try {
        unlinkSync(fullPath);
        filesRemoved++;
      } catch {}
    }
  }
}

console.log(`Pruning ${ROOT} ...`);
walk(ROOT);
console.log(`Done. Removed ${filesRemoved} files and ${dirsRemoved} directories.`);

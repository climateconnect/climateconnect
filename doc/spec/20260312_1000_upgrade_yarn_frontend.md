# Upgrade Yarn to v4 in the Frontend (node-modules linker)

**Status**: DRAFT (Reference: [`task-based-development.md`](../guides/task-based-development.md))
**Type**: Chore / Infrastructure
**Date and time created**: 2026-03-12 10:00
**Date Completed**: TBD
**Related GitHub Issue**: N/A
**Related Specs**:
- [`docs/mosy/architecture_overview.md`](../mosy/architecture_overview.md)

---

## Problem Statement

The frontend currently uses **Yarn Classic (v1)**, as evidenced by the `yarn lockfile v1` header in `frontend/yarn.lock`. Yarn Classic is in maintenance mode and receives no new features or performance improvements. Upgrading to **Yarn 4** (Berry) provides a modern, actively maintained package manager with better security auditing, enforced version pinning via Corepack, and improved workspace tooling — and establishes the foundation for a future optional PnP migration.

**Core Requirements (User/Stakeholder Stated):**

- Upgrade the frontend from Yarn Classic (v1) to Yarn 4.
- Do **not** enable Yarn PnP (Plug'n'Play) as part of this upgrade — continue using the `node-modules` linker.
- All existing scripts (`yarn dev`, `yarn build`, `yarn lint`, `yarn test`, `yarn format`) must continue to work without modification.
- The Docker-based development environment must continue to work after the upgrade.
- The `bun.lock` file currently present in the frontend directory must be removed to eliminate lock file ambiguity.
- Pin the Yarn version using the `packageManager` field in `package.json` so Corepack enforces the correct version for all contributors.

### Non Functional Requirements

- No changes to application behaviour, API contracts, or entities — this is a pure tooling change.
- The upgrade must not introduce regressions in the CI build or Docker dev environment.
- Contributor onboarding must remain straightforward (ideally one `corepack enable` step).

### AI Agent Insights and Additions

**Why we are not enabling PnP in this upgrade:**

Yarn PnP (Plug'n'Play) replaces `node_modules` with a `.pnp.cjs` resolution map, which eliminates disk-heavy installs and significantly speeds up dependency resolution. However, enabling PnP in this codebase requires non-trivial compatibility work that is out of scope for a routine tooling upgrade:

1. **`@zeit/next-css` (v1.0.1)** — an unmaintained, Zeit-era package still present in `dependencies`. It predates PnP and is almost certainly not PnP-compatible. Migrating or removing it is a separate concern.
2. **`babel-plugin-lodash` + `next/babel` preset** — the `.babelrc.ts` uses CommonJS `module.exports` and `babel-plugin-lodash`. Babel loader resolution under PnP requires careful configuration and testing.
3. **Custom webpack config** — `next.config.js` injects `@svgr/webpack` via a custom `webpack()` function. Webpack + PnP requires either `pnpWebpackPlugin` or Yarn's built-in webpack integration to be explicitly wired in.
4. **Direct `require()` calls in `next.config.js`** — top-level `require("dotenv").config()` and `require("lodash/pick")` bypass the standard module resolution layer; these need auditing under PnP.
5. **ESLint plugin resolution** — multiple ESLint plugins (`plugin:import`, `next/core-web-vitals`, etc.) require IDE SDK shims (`yarn dlx @yarnpkg/sdks`) and PnP-aware resolver configuration.
6. **IDE and test tooling** — TypeScript, Jest, Prettier, and ESLint SDKs all need regeneration with PnP-aware wrappers, adding friction for contributors.

The `node-modules` linker gives us Yarn 4's security, version enforcement, and modern CLI while deferring the PnP compatibility work to a dedicated future task.

---

## System Impact

- **Actors involved**: N/A — tooling-only change; no user-facing actors affected.
- **Actions to implement**: None — no new or modified application actions.
- **Flows affected**: None.
- **Entity changes needed**: No.
- **Flow changes needed**: No.
- **Integration changes needed**: Minimal — the Docker build step must be updated (see Software Architecture below).
- **New specifications required**: None.

---

## Software Architecture

### Overview

This is a tooling-only change confined to the `frontend/` directory and `docker/frontend.Dockerfile`. No backend, API, database, or entity changes are required.

### Files to change

#### 1. `frontend/package.json`
Add the `packageManager` field to lock the Yarn version via Corepack:
```json
{
  "packageManager": "yarn@4.x.x"
}
```
Replace `4.x.x` with the exact stable version resolved during implementation (run `yarn set version stable` and use the version it pins).

#### 2. `.yarnrc.yml` (new file at `frontend/.yarnrc.yml`)
Created automatically by `yarn set version stable`. Must explicitly set the node-modules linker to prevent Yarn 4 from defaulting to PnP:
```yaml
nodeLinker: node-modules

yarnPath: .yarn/releases/yarn-x.x.x.cjs
```

#### 3. `frontend/.yarn/releases/` (new directory)
Created automatically by `yarn set version stable`. Contains the Yarn 4 binary (`yarn-x.x.x.cjs`). This file **must be committed** to the repository so Corepack and CI environments use the exact pinned binary.

#### 4. `frontend/yarn.lock`
Delete and regenerate by running `yarn install` after the upgrade. The new lockfile uses Yarn 4 format.

#### 5. `frontend/bun.lock` — **delete**
This file is a stale artefact from a previous Bun experiment. It contains outdated version pins (e.g. `axios: ^0.21.2` vs the current `^1.13.5`) and causes lock file ambiguity. It must be removed.

#### 6. `docker/frontend.Dockerfile`
Two changes required:

```dockerfile
# Before:
RUN yarn install --frozen-lockfile

# After:
RUN corepack enable
RUN yarn install --immutable
```

- `corepack enable` activates Corepack so it respects the `packageManager` field and uses the pinned Yarn binary.
- `--frozen-lockfile` does not exist in Yarn 4; the equivalent flag is `--immutable`.

#### 7. `docker-compose.yml`
No changes required. The `- /app/node_modules` anonymous volume mount in the `frontend` service is compatible with the `node-modules` linker.

### Implementation Steps

1. `cd frontend`
2. `corepack enable` (one-time, requires Node.js 20 — already the Docker base image)
3. `yarn set version stable` — writes `.yarnrc.yml` and `.yarn/releases/yarn-x.x.x.cjs`
4. Edit `.yarnrc.yml` to add `nodeLinker: node-modules`
5. Delete `bun.lock`
6. Run `yarn install` — generates new `yarn.lock` in Yarn 4 format
7. Add `"packageManager": "yarn@4.x.x"` to `package.json` with the exact pinned version
8. Update `docker/frontend.Dockerfile` as described above
9. Run `yarn dev`, `yarn lint`, `yarn test`, `yarn build` to verify nothing is broken
10. Commit all changes: `.yarnrc.yml`, `.yarn/releases/`, updated `yarn.lock`, updated `package.json`, updated `Dockerfile`, deleted `bun.lock`

### What is explicitly NOT in scope

- Enabling Yarn PnP — deferred, see "AI Agent Insights" above
- Updating or removing `@zeit/next-css` — separate chore task
- Migrating `.babelrc.ts` from CommonJS to ESM — separate concern
- Any changes to application code, components, or API

---

## Technical Solution Overview

[To be filled by a development agent]

---

## Log

- 2026-03-12 10:00 - Task created. Branch: `upgrade_yarn_frontend`.

---

## Acceptance Criteria

- [ ] `yarn --version` inside the `frontend/` directory returns a Yarn 4.x version.
- [ ] `package.json` contains a `packageManager` field pinned to the exact Yarn 4.x version.
- [ ] `.yarnrc.yml` exists with `nodeLinker: node-modules`.
- [ ] `.yarn/releases/yarn-x.x.x.cjs` is committed to the repository.
- [ ] `bun.lock` is deleted from the repository.
- [ ] `yarn dev` starts the Next.js development server without errors.
- [ ] `yarn build` completes successfully.
- [ ] `yarn lint` passes without new errors.
- [ ] `yarn test` passes without regressions.
- [ ] `yarn format` runs successfully.
- [ ] Docker dev environment builds and starts successfully using the updated Dockerfile.
- [ ] No `--frozen-lockfile` flags remain in any Dockerfile or CI script.
- [ ] Code review approved.


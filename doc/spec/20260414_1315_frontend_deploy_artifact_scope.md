# Fix Deployment Workflows: Deploy Only the Relevant App Directory

**Status**: READY FOR IMPLEMENTATION
**Type**: DevOps / CI-CD improvement
**Date and time created**: 2026-04-14 13:15
**Related files**:
- `.github/workflows/master_climateconnect-frontend-appservice(slot2).yml`
- `.github/workflows/master_climate-backend-appservice(slot2).yml`
- `start_backend.sh` (repo root)

---

## Problem Statement

Both the frontend and backend production deployment workflows zip and deploy the **entire repository root** to their respective Azure App Services:

```yaml
# Both workflows contain this line:
- name: Zip artifact for deployment
  run: zip release.zip ./* -r   # ← runs from repo root, zips everything
```

This has several problems:

### Frontend workflow deploys backend code to the frontend server
The frontend App Service receives `backend/` Python source, `backend/.backend_env`, `doc/` specs, `.github/` workflows, and the entire monorepo. The frontend server only needs the compiled Next.js output and its runtime dependencies.

### Backend workflow deploys frontend code to the backend server
The backend App Service receives `frontend/` (including `node_modules/`), `doc/`, `.github/`, and the entire monorepo. The backend server only needs the Django Python application.

### Shared problems
1. **Security**: each server receives source code and configuration files from the other service.
2. **Unnecessarily large artifacts**: the full monorepo is zipped and uploaded, slowing deployments and wasting Azure storage.
3. **Deployment noise**: each App Service's file system contains files it will never use.

---

## Current Startup Commands

### Backend
Azure App Service is configured to run: `sh start_backend.sh`

`start_backend.sh` lives at the **repo root** and does `cd backend` internally:
```bash
apt-get update -qq && apt-get install binutils libproj-dev gdal-bin -yqq
pip install pdm
cd backend
pdm install
$(pdm venv activate)
gunicorn --preload --bind=0.0.0.0 climateconnect_main.asgi:application -w 4 -k uvicorn.workers.UvicornWorker & celery -A climateconnect_main worker -B -l INFO
```

### Frontend
Azure App Service is configured to run: `cd frontend && yarn start`

The `cd frontend` prefix means Azure expects the deployed package to contain a `frontend/` subdirectory. The `yarn start` command requires `node_modules/` to be present (Azure does not run `yarn install` on startup).

---

## Analysis: What Does the Frontend Actually Need?

`yarn build` produces `frontend/.next/` (compiled output). However, `yarn start` (which runs `next start`) requires:
- `frontend/.next/` — the compiled build
- `frontend/public/` — static assets
- `frontend/node_modules/` — Next.js framework and runtime dependencies
- `frontend/package.json` — for `next start` to find the Next.js binary
- `frontend/next.config.js` — runtime configuration
- `frontend/server.js` — custom server entry point

Since Azure runs `cd frontend && yarn start` without a prior `yarn install`, `node_modules/` must be present in the deployed artifact. The current workflow achieves this by zipping the entire repo root (which includes `frontend/node_modules/` after the `yarn install` step).

---

## Proposed Solution

### Frontend workflow fix

Scope the zip to `frontend/` only, keeping the `frontend/` directory structure so the Azure startup command `cd frontend && yarn start` continues to work without changes.

**Zip the entire `frontend/` directory**

```yaml
- name: Zip artifact for deployment
  run: zip -r release.zip frontend/
```

This includes `frontend/node_modules/` (the exact same dependencies installed and tested in CI), `frontend/.next/`, `frontend/public/`, etc. It excludes `backend/`, `doc/`, `.github/`, and all other non-frontend files.

The Azure startup command `cd frontend && yarn start` continues to work unchanged.

**Why include `node_modules/` from CI (not install on the server)**

Running `yarn install` on the server is not acceptable: the server environment (OS, Node version, native module compilation) may differ from CI, meaning the installed packages could differ from what was tested — even with `--frozen-lockfile`. Deploying `node_modules/` from CI guarantees the server runs the exact same code that was built and tested.

### Backend workflow fix

`start_backend.sh` lives at the repo root and does `cd backend` internally. Two options:

**Option A (recommended): Move `start_backend.sh` into `backend/` and update it**

Move `start_backend.sh` to `backend/start_backend.sh` and remove the `cd backend` line:

```bash
# backend/start_backend.sh
apt-get update -qq && apt-get install binutils libproj-dev gdal-bin -yqq
pip install pdm
pdm install
$(pdm venv activate)
gunicorn --preload --bind=0.0.0.0 climateconnect_main.asgi:application -w 4 -k uvicorn.workers.UvicornWorker & celery -A climateconnect_main worker -B -l INFO
```

Then zip from `backend/`:
```yaml
- name: Zip artifact for deployment
  run: |
    cd backend
    zip -r ../release.zip \
      . \
      --exclude "*.pyc" \
      --exclude "__pycache__/*" \
      --exclude "venv/*" \
      --exclude ".git/*" \
      --exclude "*.egg-info/*" \
      --exclude "media/*" \
      --exclude "static/*"
```

Azure App Service startup command stays: `sh start_backend.sh` (now resolves to `start_backend.sh` at the root of the deployed package, which is the `backend/` directory).

**Option B (minimal change): Keep `start_backend.sh` at root, include it in the zip**

```yaml
- name: Zip artifact for deployment
  run: |
    zip release.zip start_backend.sh
    cd backend
    zip -r ../release.zip \
      . \
      --exclude "*.pyc" \
      --exclude "__pycache__/*" \
      --exclude "venv/*" \
      --exclude ".git/*" \
      --exclude "*.egg-info/*" \
      --exclude "media/*" \
      --exclude "static/*"
```

The `cd backend` in `start_backend.sh` still works because `backend/` is present in the zip root.

### Frontend Option B: Run from Package (fastest startup, read-only filesystem)

Azure App Service supports running directly from the zip package without extracting it (`WEBSITE_RUN_FROM_PACKAGE=1`). This eliminates the file extraction step on startup and makes deployments atomic.

**Benefits:**
- Faster startup and redeployment (no extraction step)
- Atomic deployments (swap zip, restart — no partial state)
- Smaller disk footprint on the server

**Constraint: read-only filesystem**

The app runs from a read-only mount. Next.js writes to the filesystem in one scenario: **ISR (Incremental Static Regeneration)** — if any page uses `revalidate` in `getStaticProps`, Next.js writes cached pages to `.next/cache/`. On a read-only filesystem, ISR cache writes would fail.

**Investigation needed before choosing this option:**
- Check whether any pages in `pages/` use `revalidate` in `getStaticProps`
- Check whether `next.config.js` enables any ISR-related features
- If no ISR is used, "Run from Package" is safe

**Implementation:**
1. Set `WEBSITE_RUN_FROM_PACKAGE=1` in Azure App Service application settings
2. The zip step remains the same as Option A: `zip -r release.zip frontend/`
3. The `azure/webapps-deploy` action automatically handles the package mounting when this setting is enabled

**Recommendation**: Investigate ISR usage first. If no ISR is used, Option B is the best choice. If ISR is used, stick with Option A.

---

## Files to Change

### Frontend (Option A)

| File | Change |
|---|---|
| `.github/workflows/master_climateconnect-frontend-appservice(slot2).yml` | Change `zip release.zip ./* -r` to `zip -r release.zip frontend/` |

No Azure configuration change needed — `cd frontend && yarn start` continues to work.

### Backend (Option A)

| File | Change |
|---|---|
| `start_backend.sh` | Move to `backend/start_backend.sh`; remove `cd backend` line |
| `.github/workflows/master_climate-backend-appservice(slot2).yml` | Zip from `backend/` directory |

No Azure configuration change needed — `sh start_backend.sh` continues to work.

If there are staging/preview workflows (slot1 or similar), apply the same fixes there.

---

## Risk Assessment

**Low-medium risk.**

- **Frontend Option A**: very low risk — same files deployed, just without the `backend/` and `doc/` noise. The `cd frontend && yarn start` startup command is unchanged.
- **Backend Option A**: low-medium risk — requires moving `start_backend.sh` and removing the `cd backend` line. Test on a staging slot first.

**Verification steps after deployment:**
1. Frontend: confirm the app starts, serves pages, and `backend/` is not present in the App Service file system
2. Backend: confirm the Django app starts, migrations run, and `frontend/` is not present in the App Service file system
3. Check artifact sizes — should be significantly smaller (backend: no `frontend/node_modules/`; frontend: no `backend/`)

---

## Log

- 2026-04-14 13:15 — Task created. Both frontend and backend workflows zip the entire monorepo root. Added startup command context and analysis of what the frontend actually needs at runtime (`node_modules/` must be present since Azure doesn't run `yarn install`). Recommended Option A for both: scope frontend zip to `frontend/`; move `start_backend.sh` into `backend/` and zip from there.

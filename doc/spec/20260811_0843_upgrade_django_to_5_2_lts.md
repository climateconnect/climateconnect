# Upgrade Django Backend to 5.2 LTS

**Status**: DRAFT
**Type**: Backend — dependency upgrade / maintenance
**Date**: 2026-08-11

---

## Problem Statement

The backend pins `Django~=4.2.27` (`backend/pyproject.toml`). Django 4.2 LTS security support ended **April 2026**; as of 2026-08-11 we are ~4 months past EOL and running an unsupported branch in production. The next LTS, **Django 5.2** (released 2025-04-02, supported through at least April 2028), is the natural target.

Climate Connect has always ridden Django LTS releases (2.2 → 3.2 → 4.2). The next LTS jump is 4.2 → 5.2.

**Urgency**: prod is on an unsupported Django branch *today*. Every day we delay is another day without upstream security patches.

**This spec deviates from the official Django upgrade guide**, which recommends stepping through each feature release (4.2 → 4.3 → 5.0 → 5.1 → 5.2) with a `python -Wa` deprecation sweep before each step. We are doing the whole jump in one PR because the EOL pressure makes a 3-6 month incremental rollout unacceptable. The `python -Wa` sweep is preserved as an acceptance criterion so removed-in-5.x APIs surface and get fixed in this PR.

This spec is **behavior-preserving**: no API contract changes, no new 5.2 features adopted, frontend must not notice.

---

## Target

- **Django 5.2.x** (latest 5.2.x patch as of spec date). Pin `Django~=5.2.0` to allow patch-level fixes.
- **Python 3.12** stays the floor (Django 5.2 supports 3.10–3.14).
- **PostgreSQL 17.10** in prod (verified 2026-08-11). Well above Django 5.2's 14+ floor. No DB upgrade required.

---

## Scope

### In scope

**Dependency bumps in `backend/pyproject.toml`:**

| Package | From | To | Reason |
|---|---|---|---|
| `Django` | `~=4.2.27` | `~=5.2.0` | The upgrade itself |
| `djangorestframework` | `>=3.14.0` | `~=3.18.0` | DRF 3.16+ dropped Django 4.2; 3.18 explicitly requires Django 5.2+ |
| `django-filter` | `>=23.1` | `>=26.1` | django-filter 26.x classifiers list only Django 5.2/6.0/6.1 |
| `django-timezone-field` | `>=6.0` | `>=7.0` | v7 is the pytz-free release |
| `asgiref` | `>=3.5.0` | `>=3.8.1` | Django 5.1 minimum |
| `psycopg2-binary` | `>=2.9.5` | `>=2.9.9` | Django 5.2 floor |
| `pytz` | `>=2021.3` | *remove* | Django 5.0 removed pytz support |
| `django-rest-knox` | `>=4.2.0` | bump if needed | Verify compatibility with DRF 3.18 at install time; bump together if PDM complains |
| `sentry-sdk` | `>=1.9.10` | `>=2.0.0` | Sentry 1.x doesn't support Django 5.2; 2.x is the current line |

Plus the transitive bumps PDM resolves on its own (sqlparse, colorama, docutils, Pillow, etc.).

**Code changes in `backend/`:**
- `backend/climateconnect_api/views/donation_views.py` lines 28 and 41: replace `pytz.utc` with stdlib `datetime.timezone.utc`, drop the `import pytz`. Also `datetime.datetime.utcnow()` → `datetime.now(timezone.utc)`.
- `backend/climateconnect_main/settings.py`: verify `STORAGES = {...}` is used (not the removed-in-5.0 `DEFAULT_FILE_STORAGE` / `STATICFILES_STORAGE`).
- `backend/agent.md`: change "Django 4.2" → "Django 5.2" in the tech stack line.
- Regenerate `backend/pdm.lock` and commit.

**Verification (run during implementation):**
- Full test suite passes with `python -Wa` flag.
- `makemigrations --dry-run` produces zero new migrations (we are not adopting new 5.2 features).
- `manage.py check` is clean.

### Out of scope

- Frontend changes.
- Django 6.x.
- Adopting any new 5.2 features (composite primary keys, `{% querystring %}`, `db_default`, `GeneratedField`, PostgreSQL connection pools, etc.).
- **Migrating to psycopg 3** (`psycopg[binary]`). Our code has zero direct `psycopg2` imports, but psycopg 3's server-side parameter binding breaks some raw-SQL patterns (`WHERE id IN %s` with a tuple, `WHERE field IS %s`). Needs a raw-SQL audit first. Separate PR.
- **Celery 5.2.7 → 5.6.3**. Not required by Django 5.2. Separate PR.
- **Channels 4.x**. Already compatible with Django 5.2; bump opportunistically.
- **Azure platform image / Debian version / OS upgrade**. Out of our control; per user 2026-08-11, not a planning concern for this team. Microsoft manages the platform image under commercial extended support.
- **GDAL and `start_backend.sh` install path**. Recorded as context below; not changed in this PR.

---

## Research

### Why 5.2 (LTS) and not 5.0 or 5.1

- Django 5.0 and 5.1 are non-LTS; landing on either forces another upgrade within ~12 months. 5.2 → 6.2 (next LTS) buys us ~3 years of security support.
- Django 5.2 is officially designed for the 4.2 → 5.2 jump; no in-between hops required for technical compatibility.

### Codebase audit for 5.0/5.1/5.2 breaking changes

Grepped for the patterns the release notes explicitly remove or break. Findings:

- **`pytz.utc` (removed in 5.0)** — 2 sites in `donation_views.py:28,41`. **Must fix.** Detailed above.
- **`pytz` as the timezone backend (default removed in 5.0)** — only the 2 sites above. Fixed by the same change.
- **`is_dst=` argument (removed in 5.0)** — not used. ✓
- **`USE_L10N` setting (removed in 5.0)** — not set. ✓
- **`index_together` (removed in 5.1)** — not used; we use `Meta.indexes = [...]`. ✓
- **`assertFormsetError` old spelling (removed in 5.1)** — not used. ✓
- **`JSONField` encoded-string-literal support (removed in 5.1)** — not used. ✓
- **`GeoModelAdmin` / `OSMGeoAdmin` / `OpenLayersWidget` (removed in 5.0)** — not used. ✓
- **`cx_Oracle` / `oracledb`** — not used. ✓
- **`FORMS_URLFIELD_ASSUME_HTTPS` transitional setting (deprecated 5.0)** — not set. ✓
- **`DEFAULT_FILE_STORAGE` / `STATICFILES_STORAGE` (removed in 5.0)** — must verify settings use `STORAGES` dict.
- **`Model.save()` positional args (deprecated 5.2)** — audit at IMPLEMENTATION time.
- **`EmailMultiAlternatives.alternatives` set-as-list (5.2)** — our email goes through `mailjet-rest`, but the celery task that renders emails may use Django's `EmailMultiAlternatives`. Audit at IMPLEMENTATION time.
- **`django.utils.text.Truncator` HTML parser change (5.1)** — used in email templates; behavior change is "more robust" per release notes. Watch email rendering tests; not a blocker.
- **`asgiref` floor** — currently 3.5.0, must bump to 3.8.1.
- **Transitive floors** — sqlparse, colorama, docutils, Pillow etc. all raised in 5.0/5.1/5.2; PDM resolves.

### Third-party package compatibility (PyPI audit, 2026-08-11)

Every Django-adjacent dep checked on PyPI. The full list lives in the AI insights section's "third-party compat table" if needed; the only forced bumps are the ones in the in-scope table above. Verified: `drf-spectacular`, `django-cors-headers`, `django-celery-beat`, `django-storages`, `django-redis`, `django-ratelimit`, `django-debug-toolbar`, `django-rest-knox`, `channels`, `channels-redis`, `daphne` — all support Django 5.2 either on their current floor or with a small bump captured above.

### Migration considerations

- Django 5.2's `makemigrations --dry-run` should produce **zero** new migrations. We are not adopting `db_default`, `GeneratedField`, or any other 5.2-specific model features. If it suggests anything, that's a real signal something is wrong.
- The cache may contain pickled objects from 4.2; clear cache after deploy (Django's deploy checklist).

---

## GDAL: context, not work

**We are not changing GDAL in this PR.** It is recorded here as context only.

- Django 5.2 requires GDAL ≥ 3.1 and GEOS ≥ 3.10. All our environments meet that floor:

| Environment | GDAL | Source |
|---|---|---|
| Local venv | 3.12.3 | Homebrew on the dev Mac |
| `.devcontainer/Dockerfile` | 3.4.x | Debian bullseye apt |
| `docker/backend.Dockerfile` | 3.6.x | `python:3.11-slim` (Debian bookworm) apt |
| CI (`backend_tests.yml`) | 3.8.x | `ubuntu-latest` (24.04) apt |
| `start_backend.sh` (manual setup) | unpinned | user's local `apt-get` |
| **Azure prod (App Service)** | **3.2.2** | `libgdal28 3.2.2+dfsg-2+deb11u2`, from `start_backend.sh`'s `apt-get install gdal-bin` at cold start |

- **Prod is on Debian 11 (bullseye)**, directly verified via `cat /etc/os-release` on 2026-08-11. Debian 11 community LTS ended June 2026 (~6 weeks before this spec). Per user, OS/platform-image decisions are out of this team's scope.
- The GDAL version spread between environments (3.2.2 prod vs 3.12.3 local) is real but the only environment we don't control is the one that matters most. **No code or install-path change in this PR.**

---

## Acceptance Criteria

### Build & install
- [ ] `cd backend && pdm install` succeeds with no resolver errors. After install, run `pdm why pytz` (expected resolvers: `twisted`, `autobahn`) and `pdm why sentry-sdk` (expected: 2.x) to verify the resolver tree is sane.
- [ ] `cd backend && pdm run python -c "import django; print(django.get_version())"` prints a 5.2.x version.
- [ ] `cd backend && pdm run python manage.py check` returns "System check identified no issues (0 silenced)."

### Migrations
- [ ] `cd backend && pdm run python manage.py makemigrations --dry-run` produces no new migration files.
- [ ] `cd backend && pdm run python manage.py migrate --plan` shows only existing migrations.

### Tests
- [ ] `cd backend && pdm run python -Wa manage.py test --keepdb` passes 100%. The `-Wa` is required to surface `RemovedInDjango50Warning` / `RemovedInDjango51Warning` / `RemovedInDjango52Warning`.
- [ ] Any deprecation warning that surfaces in the test run is a real compatibility regression and must be fixed in this PR.
- [ ] Sentry integration smoke: in dev, trigger a 500 (or run `pdm run python -c "from sentry_sdk import capture_message; capture_message('django 5.2 upgrade smoke test')"`) and confirm the `sentry-sdk>=2.0.0` `DjangoIntegration` loads cleanly under Django 5.2.
- [ ] PostgreSQL on port 5432 and Redis on port 6379 are running (per `backend/agent.md`).
- [ ] GDAL verification: `pdm run python -c "from django.contrib.gis.gdal.libgdal import GDAL_VERSION; print(GDAL_VERSION)"` prints a tuple `>= (3, 1, 0)`.

### Code changes
- [ ] `grep -r "pytz" backend/ --include="*.py"` returns zero matches in app code.
- [ ] `donation_views.py:28,41` use `datetime.timezone.utc` (or `django.utils.timezone.now()`).
- [ ] `settings.py` uses `STORAGES = {...}`; no `DEFAULT_FILE_STORAGE` or `STATICFILES_STORAGE`.
- [ ] `backend/agent.md` mentions Django 5.2.
- [ ] `grep -rE "is_dst=|assertFormsetError|index_together" backend/ --include="*.py"` returns zero matches.

### Dep files
- [ ] `pyproject.toml` updated per the In-scope table.
- [ ] `backend/pdm.lock` regenerated and committed.

### Quality gates
- [ ] `cd backend && make format` passes.
- [ ] `cd backend && pdm run python manage.py check --deploy` reports no new warnings vs. 4.2 baseline.
- [ ] Sentry test exception in dev still works (sanity check that error reporting integrations still load).

### Smoke test
- [ ] `cd backend && pdm run python manage.py runserver` starts cleanly.
- [ ] `curl http://localhost:8000/api/` returns 200.

---

## Constraints

- **LTS-only strategy**: do not land on Django 5.0 or 5.1 even as a stepping stone. Go directly 4.2 → 5.2.
- **Behavior-preserving**: no API contract changes; frontend must not notice.
- **No new features**: do not adopt 5.2's new features in this PR.
- **Python floor**: 3.12 minimum, unchanged.
- **PostgreSQL floor**: 14+, unchanged.
- **PDM workflow**: use `pdm` exclusively; no `pip` / `requirements.txt` regeneration.
- **No test workarounds**: if a test fails, fix it. Do not skip, mark xfail, or rewrite to dodge a real 5.2 behavior change.

---

## Implementation Hints

- The bulk of this PR is pyproject.toml + lockfile + 2-line code change in `donation_views.py`. Expect ~30 min plus a full test run.
- Run `pdm update Django djangorestframework django-filter django-timezone-field asgiref` first; let PDM resolve the rest; then audit the diff in `pdm.lock`.
- Pay close attention in the test run to: `assertFormsetError`, `JSONField` encoded literals, `Model.save()` positional args, Sentry's `DjangoIntegration` version, and any `STORAGES` warnings on startup.
- If `pdm` pulls a major bump on something unexpected (`celery`, `djangorestframework`, etc.), stop and ask — a transitive constraint shifted; don't absorb unrelated upgrades.
- Known silent bumps PDM will surface: `sentry-sdk` 1.x → 2.x (in-scope, see dep table), `MarkupSafe` 2.x → 3.x (transitive, expected), `cryptography` and `pyOpenSSL` patch bumps (security-driven, expected and note in PR description). Anything else that appears is unexpected — stop and ask.

---

## Local environment & devcontainer

The devcontainer and any local venvs are NOT rebuilt automatically by this PR. After merge, every developer must do one of the following before running tests. This is the single most likely source of "works on CI, fails on my machine" reports.

### Critical: activate the right venv before running tests

**Agents (and humans) running backend tests MUST be inside the venv that matches the branch's Django version.** `pdm.lock` on the 4.2 branch resolves Django 4.2; `pdm.lock` on the 5.2 branch resolves Django 5.2. If you are on the `update-django-5-2` branch but your active venv is the old `django4` venv, every `pdm run python manage.py test` will silently run against Django 4.2 and pass on a deprecated codebase. The classic symptom: "the CI was green, why is my local check red?" - the answer is almost always "you're on the wrong venv."

**Before running any backend command on the 5.2 branch, confirm:**

```bash
cd backend
pdm run python -c "import django; print(django.get_version())"   # MUST print 5.2.x
```

If it prints `4.2.x`, you are on the wrong venv. Switch with `pdm use -p /path/to/.venv52` (or activate the right venv directly: `source .venv52/bin/activate` on Linux/macOS, `.venv52\Scripts\activate` on Windows).

The convention in this repo's agent docs (`AGENTS.md`) is `pdm venv activate django4` for the 4.2 venv. We extend that to `pdm venv activate django5` for the new 5.2 venv.

### Pattern: one venv per Django major version

We **strongly recommend** keeping separate venvs per Django major (one for `4.2.x`, one for `5.2.x`) rather than upgrading in place. The user has been using this pattern since the 3.x → 4.x upgrade; it lets you switch branches and run the matching test suite without rebuilding the venv. With this PR we go from one venv to two.

Concretely:

- `backend/.venv` is whatever your current `4.2.x` venv is. **Leave it alone.** Old branches still work.
- `backend/.venv52` (or whatever name you pick) is the new `5.2.x` venv. Branch `update-django-5-2` uses it.

PDM will resolve into the active venv, so the workflow is:

```bash
# On the 5.2 branch:
cd backend
pdm venv create --name venv52 -p 3.12   # or: pdm venv create -p 3.12 (auto-named)
pdm use -p 3.12                          # bind pyproject.toml to Python 3.12
pdm install                              # populate venv from pdm.lock
pdm run python -c "import django; print(django.get_version())"  # confirm 5.2.x
pdm run python manage.py test --keepdb
```

To switch back to the 4.2 branch:

```bash
cd backend
pdm use .venv                  # or: pdm use -p 3.12 in the 4.2 branch's venv
pdm run python -c "import django; print(django.get_version())"  # confirm 4.2.x
```

The `pdm.lock` is checked in and authoritative for the venv that the current branch expects. **Do not** delete `pdm.lock` to "rebuild it" — it must be regenerated by `pdm lock` (or `pdm update`), not deleted.

### Devcontainer

The devcontainer is defined in `.devcontainer/Dockerfile` and `.devcontainer/docker-compose.yml`. It does **not** need code changes for the Django 5.2 upgrade — the Python version is already 3.12 (set in `devcontainer.json` line 26: `"version": "3.12"`), and the system packages installed in the Dockerfile (`postgresql-client`, `gdal-bin`, `libgdal-dev`, `libproj-dev`) are at distro versions that already meet Django 5.2's GDAL ≥ 3.1 / GEOS ≥ 3.10 floor.

What the devcontainer does need:

1. **Rebuild the container** after the branch is checked out: VS Code → Command Palette → "Dev Containers: Rebuild Container". This re-runs `Dockerfile` and re-mounts the workspace, but the `backend/.venv` (if any) is a bind mount and survives the rebuild. **If your venv was created before this PR, it still has Django 4.2 and will fail on the 5.2 branch.**
2. **Recreate the venv inside the container**: open a terminal in the devcontainer and run the venv-per-Django-version workflow above. The recommended location for the new venv is `backend/.venv52` (next to the existing one).
3. **Run the Sentry smoke** (acceptance criterion in Tests): in the dev container, `pdm run python -c "from sentry_sdk import capture_message; capture_message('dev container django 5.2 smoke test')"` and confirm the message is captured (or visible in the dev Sentry dashboard if `SENTRY_DSN` is set).

### Local dev machine (macOS or Linux, not devcontainer)

Same workflow as devcontainer, but the venv is at `backend/.venv` and the user is responsible for creating the second venv at e.g. `backend/.venv52`.

```bash
cd backend
# Optional: pin Python 3.12 via pyenv or asdf if not system default
python3.12 -m venv .venv52
source .venv52/bin/activate
pip install -U pdm
pdm install
pdm run python -c "import django; print(django.get_version())"   # 5.2.x
```

Add `backend/.venv52/` to your global gitignore (`~/.gitignore_global` or similar) so you don't accidentally commit a path that should be local.

### Local dev machine: the `start_backend.sh` path

The repo's `start_backend.sh` is also the production startup script (per README "Deploy" section). The `apt-get install gdal-bin` line in it is **unchanged by this PR** and continues to work on the 5.2 branch. No edits to `start_backend.sh` are required for the upgrade; if you want to bump GDAL on a branch, do it in a separate PR.

### Manual steps PDM does not handle

PDM handles everything in `pyproject.toml` / `pdm.lock` automatically. The following are **not** handled by PDM and require manual action by each developer after pulling this branch:

- [ ] Rebuild / restart the devcontainer (VS Code → "Dev Containers: Rebuild Container").
- [ ] Create the new venv (`pdm venv create` or `python3.12 -m venv .venv52`).
- [ ] Run `pdm install` (or `pip install -e .` in a manual venv).
- [ ] Confirm `pdm run python -c "import django; print(django.get_version())"` prints `5.2.x`.
- [ ] Run the full test suite: `pdm run python -Wa manage.py test --keepdb`.
- [ ] If you use the existing `backend/.venv` for other branches, leave it alone. Use a separate venv for the 5.2 branch.

### What to do if you have a broken local venv

If a `pdm install` fails on an existing venv (e.g. because the old venv was created with `pdm<2.10` and lockfile format changed), the nuclear option is:

```bash
cd backend
rm -rf .venv .venv52
pdm venv create -p 3.12
pdm install
```

This destroys both venvs and recreates the active one. **Do not do this on a shared CI machine or in the devcontainer** unless you know what you're doing.

---

## Documentation & agent-file updates

Beyond code and `pyproject.toml`, this PR touches documentation and agent config. The agent files in particular are read by automated tools (and other agents) on every future task, so leaving them stale will cause the next Django-related task to be done wrong.

### Files that must be updated in this PR

| File | Change | Reason |
|---|---|---|
| `backend/agent.md` | "Django 4.2 + DRF" -> "Django 5.2 + DRF" in the tech stack | Tech stack line is read by every backend agent invocation |
| `AGENTS.md` | "Django 4.2 + DRF" -> "Django 5.2 + DRF" in the Backend Developer section; add `pdm venv activate django5` note | Same; also encodes the venv-per-Django convention for future agents |
| `.github/agents/BackendDeveloper.agent.md` | "Django 4.2 + Django REST Framework" -> "Django 5.2 + Django REST Framework" in the tech stack | Read by GitHub Copilot |
| `.github/COPILOT_SETUP_GUIDE.md` | "Always use Django 4.2 patterns" -> "Always use Django 5.2 patterns"; bump doc links from `en/3.2/` to `en/5.2/` where present | Avoids Copilot suggesting 3.2/4.2-era APIs |
| `.github/COPILOT_SUMMARY.md` | "Django 4.2" -> "Django 5.2" in the tech stack summary; bump doc links from `en/3.2/` to `en/5.2/` | Same |
| `README.md` | **No changes required.** The README does not mention a Django version number. (It does link to Django 3.1 docs in two places, which is already stale on master; fixing those is **out of scope** for this PR.) | - |

### Files that are intentionally NOT updated

- **`README.md` docs links pointing to `docs.djangoproject.com/en/3.1/`**: already stale on master (predates this PR), and are minor (Step 1 install instructions, secret key generator). Fixing is a separate doc-cleanup PR. Do not bundle into this upgrade.
- **`doc/spec/20260708_1302_rich_text_image_support.md` and any other older specs** that mention "Django 4.2" in their problem-statement context. They are historical records of decisions made under Django 4.2; do not retroactively rewrite them.
- **`backend/local-env-setup.md`**: already version-agnostic.
- **`.devcontainer/devcontainer.json` and `.devcontainer/Dockerfile`**: already specify Python 3.12, which is what Django 5.2 needs. No edit required.

### Manual deps the user remembers installing

The user noted that during the 3.x -> 4.x setup, there were some dependencies they had to install manually (beyond what `pdm install` handles, beyond what `start_backend.sh` does for prod). We do **not** know which ones in advance. The spec defers this to the IMPLEMENTATION phase:

- During IMPLEMENTATION, on a fresh venv, watch for any `ImportError` or `OSError: [Errno 2] No such file or directory` that is not a known Django 5.2 issue.
- If something is missing and it's a system-level tool (e.g. `libxml2-dev`, `libxslt-dev`, `build-essential`, `pkg-config`), document it in a new "Manual system dependencies" sub-section of the Local environment section of this spec, **or** in `backend/local-env-setup.md` if it's truly environment-setup rather than Django-version-specific.
- If it's a Python package that should have been in `pyproject.toml`, add it to the in-scope dep list and run `pdm add`.

### Acceptance criteria for the docs updates

- [ ] `backend/agent.md` line 6: "Django 4.2" -> "Django 5.2".
- [ ] `AGENTS.md` line 14: "Django 4.2" -> "Django 5.2"; line 14 also gains the `pdm venv activate django5` note.
- [ ] `.github/agents/BackendDeveloper.agent.md` line 35: "Django 4.2" -> "Django 5.2".
- [ ] `.github/COPILOT_SETUP_GUIDE.md`: no remaining "Django 4.2" references in the runtime-instruction sections; doc links bumped from `/en/3.2/` to `/en/5.2/`.
- [ ] `.github/COPILOT_SUMMARY.md`: no remaining "Django 4.2" references; doc links bumped.
- [ ] `git grep "Django 4\\.2" backend/agent.md AGENTS.md .github/agents/BackendDeveloper.agent.md .github/COPILOT_SETUP_GUIDE.md .github/COPILOT_SUMMARY.md` returns no matches in the runtime/tech-stack sections. (Historical references in other spec files are OK.)

---

## Open Questions

1. ~~**PostgreSQL version in prod**: confirm 14+...~~ **Resolved 2026-08-11:** prod is on PostgreSQL 17.10, well above the 14+ floor.
2. **`pytz` removal**: remove from `pyproject.toml` and let PDM complain. The `twisted` / `autobahn` / Channels stack brings `pytz` transitively, so `pdm install` will still succeed. After install, verify with `pdm why pytz` and confirm the only resolvers are `twisted` and `autobahn`. (Recommendation: remove from pyproject.)
3. **`django-rest-knox` compatibility with DRF 3.18**: verify on install whether it pins a DRF upper bound below 3.18. If it does, bump knox together. (Recommendation: bump together if needed.)

# US-2: `LoginToken`, `LoginAuditLog` Models + `UserProfile.auth_method`

**Status**: DONE  
**Type**: Tech Enabler — pure data layer, no endpoints  
**Epic**: [EPIC: Auth Unification](./EPIC_auth_unification.md)  
**Date created**: 2026-04-20 12:15  
**Depends on**: US-1 (branch exists; this can be built independently in parallel)  
**Unblocks**: US-2b, US-3, US-4 (backend endpoints), US-5/US-7 (frontend login flow), US-10/US-11 (settings)

---

## Problem Statement

The OTP login flow requires two new database tables (`LoginToken` and `LoginAuditLog`) and a new field on `UserProfile` (`auth_method`). None of these exist yet. This story delivers the complete data layer — models, migrations, admin registration, and cleanup tasks — so that all subsequent stories can build on stable, deployed schema from day one.

No API endpoints are introduced here. No existing behaviour changes.

---

## Acceptance Criteria

- [ ] `LoginToken` model exists with all fields specified in the epic data model section.
- [ ] `LoginAuditLog` model exists with all fields specified in the epic data model section.
- [ ] `UserProfile.auth_method` field exists with values `password` / `otp` and migration default `password` (all existing users remain unaffected).
- [ ] All three schema changes are covered by Django migrations that apply cleanly on a production-equivalent database.
- [ ] Both new models are registered in Django Admin (read-only for `LoginAuditLog`; standard for `LoginToken`).
- [ ] `CleanupLoginTokens` Celery task exists and is registered in the beat schedule (every 30 minutes).
- [ ] `CleanupLoginAuditLogs` Celery task exists and is registered in the beat schedule (purges entries older than 90 days).
- [ ] `python manage.py test` passes with no regressions.

---

## Steps

### Step 1 — Create a new `auth_app` Django app

Create a new Django app (e.g. `auth_app`) to house `LoginToken` and `LoginAuditLog`. These models do not belong in `climateconnect_api` — they are auth-specific, short-lived/operational (`LoginToken`) and security audit (`LoginAuditLog`), and will accumulate their own endpoints, tasks, and tests over subsequent stories.

- Register the new app in `INSTALLED_APPS` in `climateconnect_main/settings.py`.
- Follow the same structure as existing apps: `models/`, `migrations/`, `admin.py`, `tests/`, `tasks.py`.

> **Note**: The app name `auth_app` avoids clashing with Django's built-in `django.contrib.auth`. Choose consistently — whatever name is used here will be referenced in all subsequent US-2b through US-4 stories.

### Step 2 — `LoginToken` model

Create the `LoginToken` model in the new app. Fields and rules are fully specified in the [epic data model section](./EPIC_auth_unification.md#logintoken).

Key constraints to enforce at the model/DB level:
- `id`: UUID primary key (not auto-increment — prevents ID enumeration).
- `email`: indexed (queries look up by email to invalidate previous active tokens).
- `session_key`: unique index (used as the lookup key in `verify-token`).
- `expires_at`: indexed (cleanup task filters by this).
- `used_at`: nullable — null means the token has not been used yet.
- `attempt_count`: default 0.

One active token per email is a **business rule enforced in the service layer** (not a DB constraint), since invalidation means setting a soft flag or deleting the old record — confirm which approach is preferred. A DB unique constraint on `(email, used_at IS NULL)` is not straightforward in Django; the application layer is the right place.

### Step 3 — `LoginAuditLog` model

Create the `LoginAuditLog` model in the new app. Fields and rules are fully specified in the [epic data model section](./EPIC_auth_unification.md#loginauditlog).

Key constraints:
- `id`: UUID primary key.
- `email`: indexed (security queries filter by email).
- `created_at`: indexed (retention cleanup and time-range queries).
- `outcome`: use `TextChoices` for the enum values (`requested`, `verified`, `failed`, `expired`, `exhausted`, `resent`).
- `ip_address`: store as `GenericIPAddressField` (nullable). IP anonymisation (last octet zeroed) is applied **before** saving, in the service/view layer — not in the model.
- This table is append-only by design. The model should not expose `update()` or `save()` shortcuts that could mutate existing rows. Enforce this in the admin (read-only) and document it in the model docstring.

### Step 4 — `UserProfile.auth_method` field

Add `auth_method` to the existing `UserProfile` model in `climateconnect_api/models/user.py`.

- Values: `password` / `otp` — use `TextChoices`.
- Migration default: `password`. This is safe — all existing users have a password and should continue to authenticate with it until they explicitly switch.
- `null=False`, `blank=False` (the field always has a value after migration).
- The field is **not yet exposed via any API** in this story. That happens in Phase B US-9.

### Step 5 — Migrations

Run `python manage.py makemigrations` to generate:
1. A migration for the new `auth_app` (creates `LoginToken` and `LoginAuditLog` tables).
2. A migration for `climateconnect_api` (adds `auth_method` to `UserProfile`).

Verify both apply cleanly: `python manage.py migrate --run-syncdb` on a fresh DB and on a DB with existing data.

### Step 6 — Django Admin registration

Register both new models in `auth_app/admin.py`:

- `LoginToken`: standard `ModelAdmin`. Useful for debugging during development. List display should show `email`, `expires_at`, `used_at`, `attempt_count`.
- `LoginAuditLog`: read-only admin. All fields should be non-editable. No delete action. List display should show `email`, `outcome`, `ip_address`, `created_at`.

### Step 7 — Celery cleanup tasks

Add two tasks to the new app's `tasks.py` (using `from climateconnect_main.celery import app`, same pattern as `climateconnect_api/tasks.py`):

**`cleanup_login_tokens`**  
Deletes:
- Used tokens where `used_at` is older than 24 hours.
- Unused tokens where `expires_at` is more than 1 hour in the past.

**`cleanup_login_audit_logs`**  
Deletes `LoginAuditLog` entries where `created_at` is older than 90 days.

Register both in `climateconnect_main/celery.py` `beat_schedule`:
- `cleanup_login_tokens`: every 30 minutes (`crontab(minute="*/30")`).
- `cleanup_login_audit_logs`: once daily is sufficient (e.g. `crontab(hour=3, minute=0)`).

---

## Out of Scope

- No API endpoints (US-2b, US-3, US-4).
- No frontend changes.
- `auth_method` is not exposed via the account settings API (Phase B US-9).
- IP anonymisation logic lives in the view/service layer (US-3/US-4), not here.

---

## Log

- 2026-04-20 12:15 — Spec created. Pure data layer; no endpoints, no frontend changes. New `auth_app` Django app introduced to keep auth-specific models separate from `climateconnect_api`.


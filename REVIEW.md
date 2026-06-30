# Local Review for **branch diff**: `fix/autoconplete_logging` -> `origin/master`

## Summary
This branch refactors Nominatim autocomplete request tracking from synchronous per-request database writes (using F() expressions and GREATEST()) to a lightweight insert-then-aggregate pattern: the tracking endpoint creates one `NominatimRequestLog` row per request, and a periodic Celery task aggregates them into `NominatimPeriodStats`. A rate throttle is added, `peak_req_per_second` semantics change from fractional rate to integer count-per-second (intentional fix — old values were averages, not peaks), and the frontend tracking call is reordered. The architecture is sound, but the migration will corrupt historical stats on first Celery run.

## Issues Found
| # | Severity | File:Line | Issue | Status |
|---|----------|-----------|-------|--------|
| 1 | CRITICAL | migrations/0020_refactor_nominatim_tracking.py:14 | Existing per-minute bucket rows will be aggregated as 1 request each on first Celery run | **Open** |
| 2 | ~~WARNING~~ | tasks.py:153 | `select_for_update` locks released before aggregation; concurrent workers can double-count | Dismissed — single-worker setup (`start_backend.sh` uses `celery -B`) |
| 3 | ~~WARNING~~ | migrations/0020_refactor_nominatim_tracking.py:31 | FloatField→PositiveIntegerField truncates existing fractional peak rates to 0 | Dismissed — intentional fix; old values were averages, not true peaks |
| 4 | ~~WARNING~~ | migrations/0020_refactor_nominatim_tracking.py:14 | RemoveField in same migration breaks rolling deploys | Dismissed — single app service, low-traffic internal endpoint, acceptable brief errors |
| 5 | SUGGESTION | tasks.py:220 | `update(processed=True)` missing `processed=False` — rewrites all rows ≤ max_id every 10 min | **Open** |
| 6 | SUGGESTION | tasks.py:180 | `period_start` unpacked but unused; `_period_start_from_key()` redundantly recomputes it | **Open** |

---

## Detailed Findings

### 1. CRITICAL — Historical data corruption on first Celery run

- **File:** `backend/location/migrations/0020_refactor_nominatim_tracking.py:14`
- **Confidence:** 95%
- **Problem:** The migration removes `bucket_key` and `count` from `NominatimRequestLog` and adds `processed=False` + `minute_key=0` to every existing row. Those old rows were per-minute buckets each representing N requests (stored in `count`). The Celery task at `tasks.py:173` treats each row as exactly 1 request. On the first Celery Beat run after deploy, every historical row will be undercounted (1 instead of N), and `NominatimPeriodStats` will be silently corrupted. The subsequent 7-day cleanup at `tasks.py:222` then permanently deletes the source data.
- **Suggestion:** Add a data migration that marks all pre-existing rows as `processed=True` before the Celery task runs, so they are skipped. Historical stats in `NominatimPeriodStats` already reflect the correct counts from the old synchronous tracking.

### 5. SUGGESTION — Unnecessary rewrite of already-processed rows

- **File:** `backend/location/tasks.py:220`
- **Confidence:** 90%
- **Problem:** `NominatimRequestLog.objects.filter(id__lte=max_id).update(processed=True)` updates ALL rows with `id <= max_id`, including rows already marked `processed=True` from previous runs. Every 10-minute execution rewrites up to 7 days of already-processed rows.
- **Suggestion:** Add `processed=False` to the filter: `.filter(id__lte=max_id, processed=False).update(processed=True)`.

### 6. SUGGESTION — Unused variable / redundant computation

- **File:** `backend/location/tasks.py:180`
- **Confidence:** 95%
- **Problem:** `period_start` is unpacked from `_get_period_keys_for_dt()` but never referenced in the loop body. At line 195, `_period_start_from_key()` recomputes the same period-start datetime. This is unused code that obscures the redundant computation.
- **Suggestion:** Either use `period_start` from the tuple (store it in `period_buckets`) and remove `_period_start_from_key()`, or drop the third element from `_get_period_keys_for_dt()`'s return and keep `_period_start_from_key()`.

---

## Recommendation
**NEEDS CHANGES** — Finding #1 must be addressed before merging (add a data migration to mark existing rows as processed). Findings #5 and #6 are minor improvements worth including.

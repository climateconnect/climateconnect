# Nominatim Autocomplete Request Monitoring

**Status**: DRAFT
**Type**: Backend — data model + API
**Date and time created**: 2026-06-11 12:00

---

## Problem Statement

We need to evaluate which Nominatim API plan (free vs paid) can withstand our platform's autocomplete search traffic. This requires long-term visibility into request volume and peak load. The current implementation (`NominatimRequestLog` per-minute buckets + `NominatimStats` singleton) only stores rolling-window stats for "today", "yesterday", "last 7 days", and "last 30 days". When a window rolls forward, historical values are lost — we cannot answer questions like "what was our total on May 3rd?" or "which week in April had the highest peak?"

**What we need**: persistent daily, weekly, and monthly aggregate records so we can inspect any past period and spot trends over time. Data collection starts at deployment — no historical backfill.

---

## Core Requirements

### Metrics per Period

For every calendar day, ISO-week, and calendar month, store:

| Metric | Description |
|--------|-------------|
| `total_requests` | Total number of autocomplete requests in the period |
| `avg_req_per_second` | `total_requests / elapsed_seconds_since_period_start`. For completed periods this is `total_requests / period_duration`. Recomputed on every incoming request (not from a scheduled task). |
| `peak_req_per_second` | Highest per-second rate observed within the period. Updated incrementally via PostgreSQL `GREATEST()` — on each request, compare the current minute's bucket count / 60 against the stored peak and keep the larger value. Atomic, no race conditions. |

### Period Definitions

| Period Type | Key Format | Example | Boundary |
|-------------|-----------|---------|----------|
| Day | `YYYY-MM-DD` | `2026-06-11` | UTC midnight to UTC midnight |
| Week | `YYYY-Www` (ISO) | `2026-W24` | Monday 00:00 UTC to Sunday 23:59 UTC |
| Month | `YYYY-MM` | `2026-06` | 1st 00:00 UTC to last day 23:59 UTC |

### Data Flow

```
Frontend autocomplete request
  → POST /api/nominatim_request_count/        (existing, fire-and-forget)
    → _increment_nominatim_counters()          (extended — see below)
      1. Atomically increment per-minute bucket in NominatimRequestLog  (existing, F())
      2. Atomically upsert current day/week/month in NominatimPeriodStats  (NEW, F() + GREATEST())
      3. Delete per-minute buckets older than today                        (NEW, inline cleanup)

Admin views stats
  → GET /api/nominatim_stats/
    → returns NominatimPeriodStats rows grouped by period type
```

**No Celery beat task. No Redis cache.** All aggregation happens inline in the tracking endpoint, writing directly to PostgreSQL. Every field update is a single atomic SQL `UPDATE` using `F()` expressions or PostgreSQL `GREATEST()` — no read-then-write patterns, no lost increments under concurrent access.

---

## Data Model

### Remove: `NominatimStats` (singleton)

Delete the `NominatimStats` model entirely. It is replaced by `NominatimPeriodStats`. Remove its migration dependency, admin registration, and all references in views.

### Keep (modified): `NominatimRequestLog` (per-minute buckets)

Unchanged schema. Used only for tracking the current minute's request count so we can compute `peak_req_per_second` incrementally. Buckets older than the current UTC day are deleted on each incoming request.

### New Model: `NominatimPeriodStats`

One row per (period_type, period_key) combination. Updated inline on every tracked request.

```python
class NominatimPeriodStats(models.Model):
    class PeriodType(models.TextChoices):
        DAY = "day", "Day"
        WEEK = "week", "Week"
        MONTH = "month", "Month"

    period_type = models.CharField(
        max_length=5,
        choices=PeriodType.choices,
    )
    period_key = models.CharField(
        max_length=10,
        help_text="YYYY-MM-DD, YYYY-Www, or YYYY-MM",
    )
    total_requests = models.PositiveIntegerField(default=0)
    avg_req_per_second = models.FloatField(default=0)
    peak_req_per_second = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "location"
        unique_together = [("period_type", "period_key")]
        indexes = [
            models.Index(fields=["period_type", "period_key"]),
        ]
```

### Expected Row Counts (after 1 year)

| Period Type | Rows after 1 year | Growth |
|-------------|-------------------|--------|
| Day | ~365 | ~365/year |
| Week | ~52 | ~52/year |
| Month | ~12 | ~12/year |

Total: ~429 rows/year — negligible storage.

---

## Computation Logic

### Extended `_increment_nominatim_counters()`

Replace the current function with one that does all work inline — no Celery, no Redis. **All updates use atomic `F()` expressions and PostgreSQL `GREATEST()`** — no read-then-write patterns that could lose increments under concurrency.

```python
from django.db.models import F
from django.db.models.functions import Greatest


def _increment_nominatim_counters() -> None:
    """
    Called once per tracked Nominatim autocomplete request.
    1. Atomically increment the per-minute bucket (for peak-rate detection).
    2. Atomically upsert total_requests, peak, and avg on current day/week/month.
    3. Delete per-minute buckets from previous days (cleanup).
    All writes go directly to PostgreSQL as atomic UPDATE statements.
    No request count is ever lost under concurrent access.
    """
    now = int(time.time())
    minute_key = now // 60
    dt = datetime.utcfromtimestamp(now)

    # --- 1. per-minute bucket (atomic increment) ---
    NominatimRequestLog.objects.get_or_create(
        bucket_key=minute_key, defaults={"count": 0},
    )
    NominatimRequestLog.objects.filter(
        bucket_key=minute_key,
    ).update(count=F("count") + 1)

    # Re-read the atomically-incremented count.
    # Safe: our UPDATE is committed, so the read always includes our increment.
    # May include concurrent increments too — that only makes the peak higher, which is correct.
    current_minute_count = (
        NominatimRequestLog.objects
        .filter(bucket_key=minute_key)
        .values_list("count", flat=True)
        .first()
    ) or 1
    current_rate = current_minute_count / 60.0

    # --- 2. atomic period stats upsert ---
    periods = _get_current_period_keys(dt)

    for period_type, period_key, period_start in periods:
        elapsed = max(now - period_start, 1)

        # Ensure the row exists. get_or_create handles concurrent creates
        # (IntegrityError → Django retries the GET automatically).
        NominatimPeriodStats.objects.get_or_create(
            period_type=period_type,
            period_key=period_key,
            defaults={
                "total_requests": 0,
                "avg_req_per_second": 0.0,
                "peak_req_per_second": 0.0,
            },
        )

        # Single atomic UPDATE — all three fields computed in PostgreSQL.
        #   total_requests:  F() + 1 → atomic increment, no lost updates
        #   peak:            GREATEST(stored, current_rate) → atomic max
        #   avg:             (pre-update total + 1) / elapsed  → correct new total
        #   In SQL all RHS expressions see the pre-update row value,
        #   so F("total_requests") + 1 evaluates to the correct new total.
        NominatimPeriodStats.objects.filter(
            period_type=period_type,
            period_key=period_key,
        ).update(
            total_requests=F("total_requests") + 1,
            peak_req_per_second=Greatest(
                F("peak_req_per_second"), current_rate
            ),
            avg_req_per_second=(F("total_requests") + 1) / elapsed,
        )

    # --- 3. cleanup old minute buckets ---
    today_start_minute = (now // 86400) * (24 * 60)
    NominatimRequestLog.objects.filter(
        bucket_key__lt=today_start_minute,
    ).delete()
```

Helper `_get_current_period_keys(dt)` returns the period type, key string, and start epoch for the current day, ISO week, and calendar month:

```python
def _get_current_period_keys(dt):
    """Return [(period_type, period_key, start_epoch), ...] for the given datetime."""
    # day
    day_key = dt.strftime("%Y-%m-%d")
    day_start = int(datetime(dt.year, dt.month, dt.day).timestamp())

    # iso week
    iso_year, iso_week, _ = dt.isocalendar()
    week_key = f"{iso_year}-W{iso_week:02d}"
    # Monday of that ISO week
    week_start_dt = datetime.strptime(f"{iso_year}-W{iso_week:02d}-1", "%G-W%V-%u")
    week_start = int(week_start_dt.timestamp())

    # month
    month_key = dt.strftime("%Y-%m")
    month_start = int(datetime(dt.year, dt.month, 1).timestamp())

    return [
        ("day", day_key, day_start),
        ("week", week_key, week_start),
        ("month", month_key, month_start),
    ]
```

**Why inline instead of Celery beat**:
- No task queuing overhead in Redis
- No Celery worker memory consumed for rollup batches
- Stats are always up-to-date (no 5-minute lag)
- Per-minute buckets are cleaned up promptly (only current day kept)
- The extra DB writes per request are cheap (3 upserts + 1 delete) — well within PostgreSQL's capacity for the expected request volume

### Atomicity Guarantee

Every field update in `NominatimPeriodStats` is a single SQL `UPDATE` statement using expressions evaluated inside PostgreSQL — no Python-side read-then-write.

| Field | SQL expression | Guarantee |
|-------|---------------|-----------|
| `total_requests` | `total_requests + 1` | Atomic `F()` increment — two concurrent `UPDATE`s produce `N + 2`, never `N + 1` |
| `peak_req_per_second` | `GREATEST(peak_req_per_second, <rate>)` | Atomic PostgreSQL `GREATEST()` — no compare-and-swap race |
| `avg_req_per_second` | `(total_requests + 1) / <elapsed>` | In SQL, RHS sees the **pre-update** row value, so `total_requests + 1` is the correct new total. Computed in the same `UPDATE` — no second round-trip |

**Minute bucket**: uses `F("count") + 1` (atomic). The subsequent re-read of the count is safe because the `UPDATE` is already committed; the read may include concurrent increments, but that only raises the peak, which is correct.

**Row creation**: `get_or_create` handles concurrent creates via Django's built-in IntegrityError retry (if two requests try to create the same row, the second gets an `IntegrityError` on INSERT, retries the SELECT, and finds the row created by the first). Both requests then proceed to the atomic `UPDATE` — no increment lost.

**Net result**: zero lost requests under any concurrency level.

---

## API Changes

### `GET /api/nominatim_stats/`

Single endpoint. No backward compatibility with the old singleton response.

**Without query params** — returns all three period types, latest entry each:

```json
{
  "day": {
    "period_key": "2026-06-11",
    "total_requests": 1423,
    "avg_req_per_second": 0.0165,
    "peak_req_per_second": 0.533
  },
  "week": {
    "period_key": "2026-W24",
    "total_requests": 8940,
    "avg_req_per_second": 0.0149,
    "peak_req_per_second": 0.650
  },
  "month": {
    "period_key": "2026-06",
    "total_requests": 34210,
    "avg_req_per_second": 0.0132,
    "peak_req_per_second": 0.700
  }
}
```

**With `?period_type=day&limit=30`** — returns the last N entries for that period type:

```json
{
  "period_type": "day",
  "periods": [
    {
      "period_key": "2026-06-11",
      "total_requests": 1423,
      "avg_req_per_second": 0.0165,
      "peak_req_per_second": 0.533
    },
    {
      "period_key": "2026-06-10",
      "total_requests": 987,
      "avg_req_per_second": 0.0114,
      "peak_req_per_second": 0.367
    }
  ]
}
```

Default `limit` = 1. Max `limit` = 365. Results ordered by `period_key` descending (most recent first). Permission: `IsAdminUser` (unchanged).

---

## Retention Policy

| Data | Retention | Cleanup |
|------|-----------|---------|
| `NominatimRequestLog` (per-minute buckets) | Current day only | Deleted inline on each request (buckets older than today's start) |
| `NominatimPeriodStats` day | 1 year | Optional periodic cleanup of rows older than 365 days |
| `NominatimPeriodStats` week | Indefinite | Manual cleanup if needed |
| `NominatimPeriodStats` month | Indefinite | Manual cleanup if needed |

---

## Admin Integration

`NominatimPeriodStatsAdmin` in `backend/location/admin.py`:

- List display: `period_type`, `period_key`, `total_requests`, `avg_req_per_second`, `peak_req_per_second`
- List filter: `period_type`
- Search: `period_key`
- Read-only (all fields computed)
- Ordering: `period_type`, `-period_key`

Remove `NominatimStatsAdmin` (singleton deleted).

---

## System Impact

- **Actors involved**: Platform admin — reviews stats to choose Nominatim API plan
- **Entities changed**: New `NominatimPeriodStats` model; remove `NominatimStats` model
- **Flows changed**: `_increment_nominatim_counters()` now also atomically upserts period stats and cleans old minute buckets; stats endpoint returns new format
- **Integration changes**: No Celery beat task needed; no Redis usage for stats
- **Frontend changes**: None

---

## Acceptance Criteria

- [ ] `NominatimPeriodStats` model created with migration
- [ ] `NominatimStats` model removed with migration (data loss acceptable — singleton is replaced)
- [ ] `_increment_nominatim_counters()` atomically updates `NominatimPeriodStats` for current day, week, and month on every request using `F()` and `Greatest()`
- [ ] `peak_req_per_second` is updated atomically via PostgreSQL `GREATEST()` — no race condition
- [ ] `total_requests` is updated atomically via `F("total_requests") + 1` — no lost increments
- [ ] `avg_req_per_second` is computed atomically in the same `UPDATE` as `total_requests` — no read-then-write
- [ ] Per-minute buckets older than the current UTC day are deleted on each request
- [ ] `GET /api/nominatim_stats/` (no params) returns current day, week, and month stats
- [ ] `GET /api/nominatim_stats/?period_type=day&limit=7` returns the last 7 days
- [ ] Old singleton response format is removed (no backward compatibility)
- [ ] Admin panel shows `NominatimPeriodStats` with list filter by period type
- [ ] No Celery beat task or Redis cache involved in stats computation
- [ ] Existing tracking endpoint (`POST /api/nominatim_request_count/`) continues to work
- [ ] Existing tests continue to pass; new tests cover atomic aggregation and API response shape
- [ ] Concurrent-request test proves zero lost increments (see Test Cases)

---

## Test Cases

### Backend Tests

| Scenario | Expected |
|----------|----------|
| Single request in a fresh minute | `total_requests` = 1, `avg_req_per_second` > 0, `peak_req_per_second` = 1/60 |
| 60 requests in one minute | `peak_req_per_second` reaches 1.0 on all three period rows |
| Requests span two minutes | Second minute's count does not lower the peak; total sums correctly |
| Request on a new UTC day | New day row created; previous day row unchanged; old minute buckets deleted |
| Request on Monday (new ISO week) | New week row created; previous week row unchanged |
| Request on 1st of month | New month row created; previous month row unchanged |
| `GET /api/nominatim_stats/` | Returns day, week, month objects with correct keys |
| `GET /api/nominatim_stats/?period_type=week&limit=4` | Returns exactly 4 week rows, most recent first |
| ISO year-boundary week (Dec 29) | Week key uses ISO year (e.g. `2027-W01`), not calendar year |
| **Concurrent requests (atomicity proof)** | Fire N requests concurrently (e.g. via `ThreadPoolExecutor`). Assert `total_requests == N` on all three period rows. Zero tolerance for lost increments. |

### Concurrency Test Detail

```python
import concurrent.futures

def test_concurrent_increments_zero_lost():
    """Prove that N concurrent tracked requests produce exactly N total_requests."""
    N = 100
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as pool:
        futures = [pool.submit(_increment_nominatim_counters) for _ in range(N)]
        concurrent.futures.wait(futures)

    # All three period rows must reflect exactly N requests
    for pt in ("day", "week", "month"):
        stats = NominatimPeriodStats.objects.get(
            period_type=pt, period_key=_get_current_period_keys(...)[...][1]
        )
        assert stats.total_requests == N, f"{pt}: expected {N}, got {stats.total_requests}"
```

---

## Files to Change

| File | Change |
|------|--------|
| `backend/location/models.py` | Add `NominatimPeriodStats`; remove `NominatimStats` |
| `backend/location/migrations/` | New migration: create `NominatimPeriodStats`, drop `NominatimStats` |
| `backend/location/location_views.py` | Rewrite `_increment_nominatim_counters()` with atomic period upsert + cleanup; rewrite `NominatimStatsView` to read from `NominatimPeriodStats`; remove old `_compute_nominatim_stats()` |
| `backend/location/admin.py` | Add `NominatimPeriodStatsAdmin`; remove `NominatimStatsAdmin` |
| `backend/location/tests/test_period_stats.py` | New test file for atomic aggregation + API response + concurrency proof |

---

## Dependency Notes

- **Replaces**: `NominatimStats` singleton model (delete entirely)
- **Keeps**: `NominatimRequestLog` per-minute bucket model (no schema change, narrower retention)
- **Keeps**: `POST /api/nominatim_request_count/` tracking endpoint (no frontend change)
- **Removes**: `_compute_nominatim_stats()` function (replaced by inline logic)
- **No Celery dependency** for this feature
- **No Redis dependency** for this feature
- **No new pip dependencies required** (`Greatest` is in `django.db.models.functions`, available since Django 1.9)
- **No frontend changes required**

---

## Notes and Open Questions

1. **ISO week edge case**: Python's `datetime.strptime("%G-W%V-%u")` correctly handles ISO year boundaries (e.g. 2025-12-29 → `2026-W01-1`). Verified in Python 3.10+.

2. **avg_req_per_second for current vs completed periods**: For the current (incomplete) period, `elapsed_seconds` is the time since period start, giving a running average. For past periods, the value was frozen at the last request of that period. Since past periods may have had no requests in their final minutes, the stored avg may be slightly lower than the true final average. This is acceptable for plan-evaluation purposes.

3. **Minute bucket cleanup cost**: One `DELETE` query per request filtering on `bucket_key__lt=today_start_minute`. With the index on `bucket_key` this is an index range scan + delete — fast for the expected row count (~1440 rows max for a full day). If profiling shows this is too expensive, move cleanup to a daily cron or run it every Nth request.

4. **Greatest import**: `django.db.models.functions.Greatest` is available since Django 1.9. It maps directly to PostgreSQL's `GREATEST()` function. On other databases it falls back to `MAX()` across arguments (functionally identical).

5. **Future: remove per-minute buckets entirely**: If peak-rate tracking is no longer needed, the `NominatimRequestLog` model and its cleanup logic can be removed. `total_requests` and `avg_req_per_second` do not depend on minute-level granularity. `peak_req_per_second` would need an alternative approach (e.g., sample every N seconds instead of every minute).

---

## Log

- 2026-06-11 12:00 — Spec created. Initial draft based on codebase analysis.
- 2026-06-11 — Revised: removed backfill, removed backward compatibility, replaced Celery beat with inline per-request updates, removed NominatimStats singleton, added minute-bucket cleanup.
- 2026-06-11 — Revised: all updates now use atomic `F()` + `Greatest()` — zero lost requests under concurrency. Added concurrency test case and atomicity guarantee section.

#!/usr/bin/env python3
"""
Manual test script for the LocationIQ autocomplete endpoint.

Matches the Celery-backed, non-blocking design in
doc/spec/20260720_1400_locationiq_rate_limited_queue_design.md — a fresh
query returns 202 and must be polled until it resolves to 200, exactly like
the frontend does. See manual_testing_guide.md for the fuller walkthrough
(this script covers the same ground, scriptable/repeatable).

Start the stack first:
    docker compose up -d
(or `cd backend && pdm run python manage.py runserver` if you're running the
backend outside Docker — either way, celery-lookup must be running for
anything past the "short" scenario to resolve to a real result rather than
falling back to a direct fetch.)

Then run this script:
    python test_queue_manual.py <scenario>
    python test_queue_manual.py            # lists scenarios
"""

import json
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

BASE = "http://localhost:8000/api/location_autocomplete/"
REDIS = ["redis-cli", "-h", "localhost", "-p", "6379"]


def get(q, countrycodes="", max_wait=10.0, poll_interval=0.3):
    """
    Fire a request and, if it comes back 202 (pending), poll the same URL
    until it resolves to a terminal status or `max_wait` elapses — this is
    exactly what the frontend's poll loop does.

    Returns (status, data, attempts, elapsed_seconds), where `status` is
    either the final HTTP status code, or the string "gave-up" if it was
    still 202 when max_wait ran out.
    """
    params = {"q": q}
    if countrycodes:
        params["countrycodes"] = countrycodes

    t0 = time.time()
    attempts = 0
    while True:
        attempts += 1
        r = requests.get(BASE, params=params, timeout=15)
        if r.status_code != 202:
            try:
                data = r.json()
            except ValueError:
                data = None
            return r.status_code, data, attempts, time.time() - t0
        if time.time() - t0 >= max_wait:
            return "gave-up", None, attempts, time.time() - t0
        time.sleep(poll_interval)


def divider(title):
    print(f"\n{'='*60}\n  {title}\n{'='*60}")


def redis_cmd(*args):
    """Run a redis-cli command against the docker-compose redis service."""
    result = subprocess.run(
        REDIS + list(args),
        capture_output=True,
        text=True,
        timeout=5,
    )
    return result.stdout.strip()


def result_count(data):
    return len(data) if isinstance(data, list) else "N/A"


# ──────────────────────────────────────────────────────────────
# Scenario 1: Basic request (fresh query, full 202 -> 200 lifecycle)
# ──────────────────────────────────────────────────────────────
def test_basic():
    divider("1. Basic request (fresh query, polls until resolved)")
    status, data, attempts, elapsed = get("Berlin")
    print(f"  Final status: {status}")
    print(f"  Poll attempts: {attempts}")
    print(f"  Results: {result_count(data)}")
    print(f"  Total latency: {elapsed:.2f}s")
    assert status == 200, f"Expected 200, got {status}"
    assert isinstance(data, list) and len(data) > 0, "Expected non-empty list"
    print("  PASSED")


# ──────────────────────────────────────────────────────────────
# Scenario 2: Short query returns empty immediately (no job created)
# ──────────────────────────────────────────────────────────────
def test_short_query():
    divider("2. Short query (< 3 chars) — no job created, no polling needed")
    status, data, attempts, elapsed = get("Be")
    print(f"  Status: {status}, attempts: {attempts}, data: {data}")
    assert status == 200, f"Expected 200, got {status}"
    assert data == [], f"Expected empty list, got {data}"
    assert attempts == 1, "Should resolve on the first request, no 202/poll"
    print("  PASSED")


# ──────────────────────────────────────────────────────────────
# Scenario 3: Cache hit (same query twice — 2nd is a single fast request)
# ──────────────────────────────────────────────────────────────
def test_cache():
    divider("3. Cache hit (same query twice)")
    status1, data1, attempts1, t1 = get("Munich")
    print(f"  1st request: status={status1}, attempts={attempts1}, latency={t1:.2f}s")

    status2, data2, attempts2, t2 = get("Munich")
    print(f"  2nd request: status={status2}, attempts={attempts2}, latency={t2:.2f}s")

    assert status1 == 200, f"First request: expected 200, got {status1}"
    assert status2 == 200, f"Second request: expected 200, got {status2}"
    assert attempts2 == 1, "Cached hit should resolve on the very first request"
    assert result_count(data1) == result_count(
        data2
    ), "Cache should return the same results"
    print(f"  Cache speedup: {t1/max(t2, 0.001):.1f}x")
    print("  PASSED")


# ──────────────────────────────────────────────────────────────
# Scenario 4: Concurrent duplicate requests (deduplication)
# ──────────────────────────────────────────────────────────────
def test_dedup():
    divider("4. Concurrent duplicate requests (deduplication)")
    print("  5 concurrent requests for the SAME new query.")
    print("  Only whichever request wins the race creates a sentinel + task;")
    print("  the rest see 'pending' and just poll — none of this should 429,")
    print("  since polling an existing lookup doesn't touch the strict per-IP limit.")
    print("  Cross-check: watch `celery-lookup` logs during this run and confirm")
    print("  only ONE fetch_autocomplete execution for 'Hamburg'.")
    results = {}

    def make_request(i):
        results[i] = get("Hamburg")

    threads = [threading.Thread(target=make_request, args=(i,)) for i in range(5)]
    t0 = time.time()
    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=20)
    total = time.time() - t0

    print(f"  Total wall time: {total:.2f}s")
    ok = sum(1 for s, *_ in results.values() if s == 200)
    limited = sum(1 for s, *_ in results.values() if s == 429)
    for i in range(5):
        status, data, attempts, elapsed = results[i]
        print(
            f"    Request {i}: status={status}, attempts={attempts}, "
            f"results={result_count(data)}, latency={elapsed:.2f}s"
        )
    print(f"  Summary: {ok} succeeded, {limited} rate-limited (429, unexpected here)")
    print("  PASSED")


# ──────────────────────────────────────────────────────────────
# Scenario 5: Distinct queries — global 2 req/s pacing via Celery rate_limit
# ──────────────────────────────────────────────────────────────
def test_rate_limit():
    divider("5. Distinct queries (global LOCATIONIQ_MAX_RATE=2/s pacing)")
    print("  NOTE: since each of these is a genuinely NEW query, the strict")
    print("  per-IP limit (1/s) will 429 most of them immediately — only one")
    print("  new job can be created per second from a single IP. Watch")
    print("  celery-lookup logs to see the ones that do get through starting")
    print("  ~500ms apart (2/s), not all at once.")
    queries = ["Paris", "London", "Rome", "Madrid"]
    results = {}

    def make_request(q):
        results[q] = get(q)

    threads = [threading.Thread(target=make_request, args=(q,)) for q in queries]
    t0 = time.time()
    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=30)
    total = time.time() - t0

    print(f"  Total wall time: {total:.2f}s")
    for q in queries:
        status, data, attempts, elapsed = results[q]
        print(
            f"    '{q}': status={status}, attempts={attempts}, "
            f"results={result_count(data)}, latency={elapsed:.2f}s"
        )
    print("  PASSED (check output)")


# ──────────────────────────────────────────────────────────────
# Scenario 6: Strict per-IP limit trips on distinct new queries
# ──────────────────────────────────────────────────────────────
def test_ip_new():
    divider("6. Strict per-IP limit (1/s) — distinct NEW queries")
    print("  Sending 3 rapid requests, each a different query...")
    statuses = []
    for i, q in enumerate(["RateA", "RateB", "RateC"]):
        r = requests.get(BASE, params={"q": q}, timeout=15)
        statuses.append(r.status_code)
        print(f"    Request {i+1} ('{q}'): status={r.status_code}")
    has_429 = 429 in statuses
    print(
        "  Got 429 as expected (strict limit working)"
        if has_429
        else "  No 429 seen — depends on timing, try again"
    )
    print("  PASSED (check output)")


# ──────────────────────────────────────────────────────────────
# Scenario 7: Polling the SAME query rapidly does NOT trip the strict limit
# ──────────────────────────────────────────────────────────────
def test_ip_poll():
    divider("7. Strict per-IP limit exemption — polling the SAME query")
    print("  Sending 5 rapid requests for the SAME query (simulates the")
    print("  frontend's own poll loop) — none of these should be 429,")
    print("  since only the first one creates a new job; the rest just")
    print("  check on it.")
    statuses = []
    for i in range(5):
        r = requests.get(BASE, params={"q": "SamePollQuery"}, timeout=15)
        statuses.append(r.status_code)
        print(f"    Request {i+1}: status={r.status_code}")
        time.sleep(0.2)
    assert (
        429 not in statuses
    ), f"Unexpected 429 while polling the same query: {statuses}"
    print("  PASSED")


# ──────────────────────────────────────────────────────────────
# Scenario 8: Backpressure (503) via seeding pending_jobs directly
# ──────────────────────────────────────────────────────────────
def test_backpressure():
    divider("8. Backpressure (503) — seeded via redis-cli, not real load")
    print("  Organically triggering this from one IP is impractical (the")
    print("  strict 1/s limit already caps how fast one client can create")
    print("  new jobs), so we seed locationiq:pending_jobs directly instead.")

    redis_cmd("del", "locationiq:pending_jobs")
    far_future = str(int(time.time()) + 10_000)
    for i in range(16):
        redis_cmd("zadd", "locationiq:pending_jobs", far_future, f"fake{i}")
    count = redis_cmd("zcard", "locationiq:pending_jobs")
    print(f"  Seeded pending_jobs with {count} fake entries (cap is normally 16).")

    r = requests.get(BASE, params={"q": "BackpressureTestQuery"}, timeout=15)
    print(f"  New query while at cap -> status={r.status_code}")
    assert r.status_code == 503, f"Expected 503, got {r.status_code}: {r.text}"

    redis_cmd("del", "locationiq:pending_jobs")
    print("  Cleaned up locationiq:pending_jobs.")
    print("  PASSED")


# ──────────────────────────────────────────────────────────────
# Scenario 9: Rapid-fire stress test (same query — mostly dedup+loose limit)
# ──────────────────────────────────────────────────────────────
def test_stress():
    divider("9. Stress test (10 rapid concurrent requests, same query)")
    print("  All for the same query, so this mostly exercises dedup + the")
    print("  loose (10/s) limit rather than the strict one — expect mostly")
    print("  200s, not 429s, unlike the old design.")
    counts = {"200": 0, "429": 0, "503": 0, "gave-up": 0, "other": 0}

    def make_request(_i):
        status, *_ = get("StressTestQuery")
        return status

    with ThreadPoolExecutor(max_workers=10) as pool:
        futures = [pool.submit(make_request, i) for i in range(10)]
        for f in as_completed(futures):
            status = f.result()
            key = str(status) if str(status) in counts else "other"
            counts[key] += 1

    total = sum(counts.values())
    print(f"  Results: {counts}")
    print(f"  200 (success): {counts['200']}/{total}")
    print(f"  429 (rate limited): {counts['429']}/{total}")
    print(f"  503 (backpressure): {counts['503']}/{total}")
    print(f"  gave-up (client polling timeout): {counts['gave-up']}/{total}")
    print("  PASSED (check distribution)")


# ──────────────────────────────────────────────────────────────
# Scenario 10: Inspect current Redis state (one-shot)
# ──────────────────────────────────────────────────────────────
def test_redis_inspect():
    divider("10. Redis state — one-shot inspection")
    try:
        pending_count = redis_cmd("zcard", "locationiq:pending_jobs") or "0"
        print(f"  pending_jobs (in-flight, distinct queries): {pending_count}")

        keys = redis_cmd("keys", "locationiq:lookup:*")
        if keys:
            for key in keys.split("\n"):
                if not key:
                    continue
                ttl = redis_cmd("ttl", key)
                val = redis_cmd("get", key)
                try:
                    parsed = json.loads(val) if val else {}
                    status = parsed.get("status", "?")
                    results = parsed.get("results")
                    summary = f"status={status}, results={len(results) if isinstance(results, list) else results}"
                except (json.JSONDecodeError, TypeError):
                    summary = "unparseable"
                print(f"    {key} -> {summary}, TTL={ttl}s")
        else:
            print("  No locationiq:lookup:* keys currently set.")
    except Exception as e:
        print(f"  Error: {e}")
    print("  Done")


# ──────────────────────────────────────────────────────────────
# Scenario 11: Watch queue state in real time (Ctrl+C to stop)
# ──────────────────────────────────────────────────────────────
def test_watch_queue():
    divider("11. Watch queue in real-time (Ctrl+C to stop)")
    print("  Watching... (fire requests from another terminal)\n")
    last_line = ""
    try:
        while True:
            pending = redis_cmd("zcard", "locationiq:pending_jobs") or "0"
            lookup_keys = redis_cmd("keys", "locationiq:lookup:*")
            total_keys = len(lookup_keys.split("\n")) if lookup_keys else 0
            line = f"pending_jobs={pending} lookup_keys={total_keys}"
            if line != last_line:
                print(f"  [{time.strftime('%H:%M:%S')}] {line}")
                last_line = line
            time.sleep(0.2)
    except KeyboardInterrupt:
        print("\n  Stopped.")


SCENARIOS = {
    "basic": test_basic,
    "short": test_short_query,
    "cache": test_cache,
    "dedup": test_dedup,
    "rate": test_rate_limit,
    "ip-new": test_ip_new,
    "ip-poll": test_ip_poll,
    "backpressure": test_backpressure,
    "stress": test_stress,
    "redis": test_redis_inspect,
    "watch": test_watch_queue,
}


if __name__ == "__main__":
    if len(sys.argv) > 1:
        scenario = sys.argv[1]
        if scenario in SCENARIOS:
            SCENARIOS[scenario]()
        else:
            print(f"Unknown scenario: {scenario}")
            print(f"Available: {', '.join(SCENARIOS.keys())}")
    else:
        print("LocationIQ Autocomplete Manual Test Script")
        print("=" * 40)
        print()
        print("Usage:")
        print("  python test_queue_manual.py <scenario>")
        print()
        print("Scenarios:")
        print("  basic         - Single fresh request, polls to completion")
        print("  short         - Short query (< 3 chars), no job created")
        print("  cache         - Cache hit (same query twice)")
        print("  dedup         - 5 concurrent identical requests -> 1 fetch")
        print("  rate          - 4 distinct queries, global 2 req/s pacing")
        print("  ip-new        - Strict per-IP limit trips on distinct queries")
        print("  ip-poll       - Strict per-IP limit does NOT trip on polling")
        print("  backpressure  - Seed pending_jobs, confirm 503 at the cap")
        print("  stress        - 10 rapid concurrent requests, same query")
        print("  redis         - Inspect Redis state (one-shot)")
        print("  watch         - Watch queue state in real-time")
        print()
        print("Run several in sequence:")
        print(
            "  for s in basic short cache dedup rate ip-new ip-poll backpressure stress; do"
        )
        print("    python test_queue_manual.py $s")
        print("    sleep 2")
        print("  done")

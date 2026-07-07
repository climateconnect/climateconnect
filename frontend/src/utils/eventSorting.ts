/**
 * Shared event sorting helpers for chronological, calendar-style views.
 *
 * Originally defined inside WasseraktionswochenEvents and extracted here so the
 * Event Calendar and Wasseraktionswochen share a single source of truth for
 * within-day event ordering (timed → all-day → ongoing multi-day).
 */

export const toTimestamp = (rawDate?: string | null): number | null => {
  if (!rawDate) {
    return null;
  }

  const timestamp = Date.parse(rawDate);
  return Number.isNaN(timestamp) ? null : timestamp;
};

export const getStartOfTodayMs = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
};

/** Returns true when a timestamp falls exactly at local midnight (all-day events). */
export const isMidnightLocal = (timestampMs: number): boolean => {
  const d = new Date(timestampMs);
  return d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0;
};

/**
 * Returns the timestamp used for display sort order.
 * - Ongoing events (started before today) → end of today (23:59:59.999)
 * - All-day events (start time = 00:00)   → 23:00 of their start day
 * - Everything else                        → actual start_date
 */
export const getDisplaySortTimestamp = (project: any, todayStartMs: number): number | null => {
  const startMs = toTimestamp(project?.start_date);

  if (startMs === null) return null;

  // Ongoing events: bump to end of today so they follow today's events
  if (startMs < todayStartMs) {
    return todayStartMs + 24 * 60 * 60 * 1000 - 1;
  }

  // All-day events: bump to 23:00 of their start day so timed events on the
  // same day appear first (all-day events set start time to 00:00)
  if (isMidnightLocal(startMs)) {
    return startMs + 23 * 60 * 60 * 1000;
  }

  return startMs;
};

/**
 * Comparator for within-day ordering of events.
 *
 * Three-tier ordering within a day (example: today = 13.3):
 *   1. Timed events starting today   → actual start_date     (e.g. 13.3 10:00)
 *   2. All-day events today (00:00)  → bumped to 13.3 23:00  (after timed events)
 *   3. Ongoing multi-day events      → bumped to 13.3 23:59:59 (after all-day)
 *   4. Future events                 → their actual start_date (e.g. 14.3 …)
 *
 * Within the ongoing/all-day groups, the original start_date is used as a
 * secondary key for a stable, deterministic order.
 */
export const compareByStartDate = (a: any, b: any) => {
  const todayStartMs = getStartOfTodayMs();
  const aTimestamp = getDisplaySortTimestamp(a, todayStartMs);
  const bTimestamp = getDisplaySortTimestamp(b, todayStartMs);

  if (aTimestamp === null && bTimestamp === null) return 0;
  if (aTimestamp === null) return 1;
  if (bTimestamp === null) return -1;

  if (aTimestamp !== bTimestamp) return aTimestamp - bTimestamp;

  // Secondary sort for multiple ongoing events: earlier start_date first
  const aActual = toTimestamp(a?.start_date) ?? 0;
  const bActual = toTimestamp(b?.start_date) ?? 0;
  return aActual - bActual;
};

/**
 * Returns the timestamp used to decide whether an event is upcoming or past.
 * We prefer `end_date` so that ongoing events (started but not yet ended)
 * remain in the "upcoming" bucket. Falls back to `start_date` if no end date
 * is set; returns null when neither is available (treated as upcoming).
 */
export const getClassificationTimestamp = (project: any): number | null =>
  toTimestamp(project?.end_date) ?? toTimestamp(project?.start_date);

export const sortProjectsByStartDate = (projects: any[] = []) => {
  const todayStartMs = getStartOfTodayMs();
  const upcoming: any[] = [];
  const past: any[] = [];

  projects.forEach((project) => {
    const timestamp = getClassificationTimestamp(project);
    if (timestamp === null || timestamp >= todayStartMs) {
      upcoming.push(project);
    } else {
      past.push(project);
    }
  });

  return [...upcoming.sort(compareByStartDate), ...past.sort(compareByStartDate)];
};

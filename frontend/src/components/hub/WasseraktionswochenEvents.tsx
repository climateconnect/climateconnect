import React, { useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import ProjectPreviews from "../project/ProjectPreviews";
import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material/styles";

interface WasseraktionswochenEventsProps {
  projects?: any[];
  hubUrl?: string;
  isGerman?: boolean;
}

const DEFAULT_HUB_SLUG = "em";

const useStyles = makeStyles((theme: Theme) => ({
  subHeader: {
    paddingLeft: "8px",
    fontWeight: "bold",
    paddingBottom: theme.spacing(1),
  },
}));

const WasseraktionswochenEvents: React.FC<WasseraktionswochenEventsProps> = ({
  projects = [],
  hubUrl = DEFAULT_HUB_SLUG,
  isGerman = false,
}) => {
  const { upcoming, past } = useMemo(() => {
    const todayStartMs = getStartOfTodayMs();
    const upcomingProjects: any[] = [];
    const pastProjects: any[] = [];

    projects.forEach((project) => {
      const timestamp = getClassificationTimestamp(project);
      if (timestamp === null || timestamp >= todayStartMs) {
        upcomingProjects.push(project);
      } else {
        pastProjects.push(project);
      }
    });

    return {
      upcoming: upcomingProjects.sort(compareByStartDate),
      past: pastProjects.sort(compareByStartDate),
    };
  }, [projects]);

  const classes = useStyles();

  const theme = useTheme();

  return (
    <Box sx={{ mt: 4 }}>
      {upcoming.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography
            component="h2"
            variant="h6"
            color={theme.palette.background.default_contrastText}
            className={classes.subHeader}
          >
            {isGerman ? "Diese Events erwarten Euch" : "Upcoming Events"}
          </Typography>
          <ProjectPreviews
            projects={upcoming}
            hubUrl={hubUrl}
            hasMore={false}
            isLoading={false}
            displayOnePreviewInRow={false}
            parentHandlesGridItems
          />
        </Box>
      )}

      {past.length > 0 && (
        <Box>
          <Typography
            component="h2"
            variant="h6"
            color={theme.palette.background.default_contrastText}
            className={classes.subHeader}
          >
            {isGerman ? "Vergangene Veranstaltungen" : "Past Events"}
          </Typography>
          <ProjectPreviews
            projects={past}
            hubUrl={hubUrl}
            hasMore={false}
            isLoading={false}
            displayOnePreviewInRow={false}
            parentHandlesGridItems
          />
        </Box>
      )}
    </Box>
  );
};

export default WasseraktionswochenEvents;

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

/**
 * Comparator for upcoming events.
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
const compareByStartDate = (a: any, b: any) => {
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
 * Returns the timestamp used for display sort order.
 * - Ongoing events (started before today) → end of today (23:59:59.999)
 * - All-day events (start time = 00:00)   → 23:00 of their start day
 * - Everything else                        → actual start_date
 */
const getDisplaySortTimestamp = (project: any, todayStartMs: number): number | null => {
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

/** Returns true when a timestamp falls exactly at local midnight (all-day events). */
const isMidnightLocal = (timestampMs: number): boolean => {
  const d = new Date(timestampMs);
  return d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0;
};

const toTimestamp = (rawDate?: string | null): number | null => {
  if (!rawDate) {
    return null;
  }

  const timestamp = Date.parse(rawDate);
  return Number.isNaN(timestamp) ? null : timestamp;
};

const getStartOfTodayMs = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
};

/**
 * Returns the timestamp used to decide whether an event is upcoming or past.
 * We prefer `end_date` so that ongoing events (started but not yet ended)
 * remain in the "upcoming" bucket. Falls back to `start_date` if no end date
 * is set; returns null when neither is available (treated as upcoming).
 */
const getClassificationTimestamp = (project: any): number | null =>
  toTimestamp(project?.end_date) ?? toTimestamp(project?.start_date);

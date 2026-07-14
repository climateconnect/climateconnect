import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Button, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import ProjectPreviews from "../project/ProjectPreviews";
import { getClassificationTimestamp, getStartOfTodayMs } from "../../utils/eventSorting";

// Pull the next `limit` upcoming events out of the existing browse grid
// (we intentionally reuse the ranked projects list instead of calling the
// events API). Returns the highlighted events plus the rest of the list
// with those highlights removed, so they are not shown twice.
export const getUpcomingEventHighlights = (
  projects: any[] = [],
  limit = 4
): { highlights: any[]; remaining: any[]; total: number } => {
  const today = getStartOfTodayMs();
  const upcoming = (projects || [])
    .filter((p) => {
      const ts = getClassificationTimestamp(p);
      // Only event-type projects that have not ended yet.
      return p.project_type === "event" && ts != null && ts >= today;
    })
    .sort((a, b) => {
      const ta = a.start_date ? new Date(a.start_date).getTime() : 0;
      const tb = b.start_date ? new Date(b.start_date).getTime() : 0;
      return ta - tb;
    });

  const highlights = upcoming.slice(0, limit);
  const slugs = new Set(highlights.map((e) => e.url_slug));
  const remaining = (projects || []).filter((p) => !slugs.has(p.url_slug));
  return { highlights, remaining, total: upcoming.length };
};

const useStyles = makeStyles((theme) => ({
  // Option 1 highlight: a light tint behind just this event section.
  // Horizontal padding is 0 so the event grid's left/right edges line
  // up exactly with the normal grid below (both share the same lg
  // container); only vertical padding gives the tint breathing room.
  // Option-1 highlight: a light tint behind just this event section.
  // The band bleeds a bit past the grid edges (lg+ where there is
  // gutter room) so it reads as deliberately wider than the cards,
  // while the inner content is re-inset by the same amount so the
  // title/CTA/cards still line up with the grid borders below.
  group: {
    backgroundColor: theme.palette.primary.extraLight,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(3),
    marginLeft: `calc(-1 * ${theme.spacing(3)})`,
    marginRight: `calc(-1 * ${theme.spacing(3)})`,
    [theme.breakpoints.down("lg")]: {
      marginLeft: 0,
      marginRight: 0,
    },
  },
  inner: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    [theme.breakpoints.down("lg")]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  headerRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
    flexWrap: "wrap",
  },
  title: {
    fontWeight: 700,
    fontSize: 22,
    color: theme.palette.primary.main,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    // Align the title with the project cards, which are inset 8px by the
    // grid item padding in ProjectPreviews (see classes.items -> padding: 8px).
    paddingLeft: theme.spacing(1),
  },
  titleIcon: {
    fontSize: 24,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    flexWrap: "wrap",
    // Mirror the title's 8px inset so the button's right edge lines up
    // with the project cards (which are inset 8px by the grid item padding).
    paddingRight: theme.spacing(1),
  },
  calendarButton: {
    whiteSpace: "nowrap",
    textTransform: "none",
    alignSelf: "center",
  },
}));

export default function UpcomingEventsGroup({
  events,
  hubUrl,
}: {
  events: any[];
  hubUrl?: string;
}) {
  const { locale } = useContext(UserContext);
  const classes = useStyles();
  const texts = getTexts({ page: "hub", locale: locale });

  const calendarHref = `${getLocalePrefix(locale)}${hubUrl ? `/hubs/${hubUrl}/events` : "/events"}`;

  return (
    <section className={classes.group} aria-label={texts.upcoming_events}>
      <div className={classes.inner}>
        <div className={classes.headerRow}>
          <Typography component="h2" className={classes.title}>
            <AccessTimeIcon className={classes.titleIcon} />
            {texts.upcoming_events}
          </Typography>
          <div className={classes.headerActions}>
            <Button
              className={classes.calendarButton}
              href={calendarHref}
              endIcon={<ArrowForwardIcon />}
              variant="contained"
              color="primary"
              size="small"
            >
              {texts.event_calendar}
            </Button>
          </div>
        </div>
        <ProjectPreviews
          parentHandlesGridItems
          projects={events}
          hubUrl={hubUrl}
          analyticsSurface="browse_upcoming_events"
        />
      </div>
    </section>
  );
}

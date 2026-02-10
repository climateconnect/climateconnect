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
      const timestamp = toTimestamp(project?.start_date);
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
    const timestamp = toTimestamp(project?.start_date);
    if (timestamp === null || timestamp >= todayStartMs) {
      upcoming.push(project);
    } else {
      past.push(project);
    }
  });

  return [...upcoming.sort(compareByStartDate), ...past.sort(compareByStartDate)];
};

const compareByStartDate = (a: any, b: any) => {
  const aTimestamp = toTimestamp(a?.start_date);
  const bTimestamp = toTimestamp(b?.start_date);

  if (aTimestamp === null && bTimestamp === null) {
    return 0;
  }
  if (aTimestamp === null) {
    return 1;
  }
  if (bTimestamp === null) {
    return -1;
  }

  return aTimestamp - bTimestamp;
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

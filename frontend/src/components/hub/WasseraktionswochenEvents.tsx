import React, { useMemo } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import ProjectPreviews from "../project/ProjectPreviews";
import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material/styles";
import {
  compareByStartDate,
  getClassificationTimestamp,
  getStartOfTodayMs,
} from "../../utils/eventSorting";

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

export { sortProjectsByStartDate } from "../../utils/eventSorting";

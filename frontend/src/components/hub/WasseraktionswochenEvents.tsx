import React, { useMemo } from "react";
import { Box } from "@mui/material";
import ProjectPreviews from "../project/ProjectPreviews";

interface WasseraktionswochenEventsProps {
  projects?: any[];
  hubUrl?: string;
  isGerman?: boolean;
}

const DEFAULT_HUB_SLUG = "em";

const WasseraktionswochenEvents: React.FC<WasseraktionswochenEventsProps> = ({
  projects = [],
  hubUrl = DEFAULT_HUB_SLUG,
  isGerman = false,
}) => {
  const sortedProjects = useMemo(() => sortProjectsByStartDate(projects), [projects]);

  return (
    <Box sx={{ mt: 4 }}>
      <ProjectPreviews
        projects={sortedProjects}
        hubUrl={hubUrl}
        hasMore={false}
        isLoading={false}
        displayOnePreviewInRow={false}
        parentHandlesGridItems
      />
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

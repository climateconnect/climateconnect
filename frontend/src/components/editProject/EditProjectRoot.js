import React from "react";
import { useMediaQuery, Container } from "@material-ui/core";
import EditProjectOverview from "./EditProjectOverview";
import EditProjectContent from "./EditProjectContent";
export default function EditProjectRoot({
  project,
  skillsOptions,
  userOrganizations,
  statusOptions,
  handleSetProject,
  tagsOptions
}) {
  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("sm"));
  return (
    <Container disableGutters={isNarrowScreen}>
      <EditProjectOverview
        tagsOptions={tagsOptions}
        project={project}
        smallScreen={isNarrowScreen}
        handleSetProject={handleSetProject}
      />
      <EditProjectContent
        project={project}
        handleSetProject={handleSetProject}
        statusOptions={statusOptions}
        userOrganizations={userOrganizations}
        skillsOptions={skillsOptions}
      />
    </Container>
  );
}

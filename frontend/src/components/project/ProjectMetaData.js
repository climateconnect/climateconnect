import React from "react";
import { Box } from "@material-ui/core";
import PlaceIcon from "@material-ui/icons/Place";
import ProjectStatus from "./ProjectStatus";
import { makeStyles } from "@material-ui/core/styles";
import MiniOrganizationPreview from "../organization/MiniOrganizationPreview";
import MiniProfilePreview from "../profile/MiniProfilePreview";

const useStyles = makeStyles(theme => ({
  creatorImage: {
    height: 20,
    marginRight: theme.spacing(1),
    marginBottom: -5    
  },
  cardIcon: {
    verticalAlign: "bottom",
    marginBottom: -2,
    marginTop: 2
  },
  creator: {
    marginBottom: 5
  },
  status: {
    marginTop: theme.spacing(1)
  }
}));

export default function ProjectMetaData({ project }) {
  const classes = useStyles();
  const project_parent = project.project_parents[0];
  return (
    <Box>
      {project_parent && project_parent.parent_organization && (
        <MiniOrganizationPreview
          className={classes.creator}
          organization={project_parent.parent_organization}
          size="small"
        />
      )}
      {project_parent && !project_parent.parent_organization && project_parent.parent_user && (
        <MiniProfilePreview
          className={classes.creator}
          profile={project_parent.parent_user}
          size="small"
        />
      )}
      <Box>
        <PlaceIcon className={classes.cardIcon} />
        {project.location}
        <div>
          <ProjectStatus status={project.status} className={classes.status} />
        </div>
      </Box>
    </Box>
  );
}

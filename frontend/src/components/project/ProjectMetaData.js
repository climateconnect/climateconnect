import React from "react";
import { Box } from "@material-ui/core";
import PlaceIcon from "@material-ui/icons/Place";
import ProjectStatus from "./ProjectStatus";
import { makeStyles } from "@material-ui/core/styles";
import MiniOrganizationPreview from "../organization/MiniOrganizationPreview";

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
  return (
    <Box>
      <MiniOrganizationPreview
        className={classes.creator}
        organization={{ image: project.creator_image, name: project.creator_name }}
        size="small"
      />
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

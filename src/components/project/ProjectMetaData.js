import React from "react";
import { Box } from "@material-ui/core";
import PlaceIcon from "@material-ui/icons/Place";
import ProjectStatus from "./ProjectStatus";
import { makeStyles } from "@material-ui/core/styles";

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
      <Box className={classes.creator}>
        <img src={project.creator_image} className={classes.creatorImage} />
        {project.creator_name}
      </Box>
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

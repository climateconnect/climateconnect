import React from "react";
import { Box, Chip } from "@material-ui/core";
import PlaceIcon from "@material-ui/icons/Place";
import { makeStyles } from "@material-ui/core/styles";
import project_status_metadata from "./../../../public/data/project_status_metadata";

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
          <Chip
            icon={project_status_metadata.filter(p => p.key === project.status)[0].icon}
            label={project_status_metadata.filter(p => p.key === project.status)[0].name}
            className={classes.status}
          />
        </div>
      </Box>
    </Box>
  );
}

import React from "react";
import { Box } from "@material-ui/core";
import PlaceIcon from "@material-ui/icons/Place";
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
        <span className={classes.cardIconBox}>
          <PlaceIcon className={classes.cardIcon} />
        </span>
        {project.location}
      </Box>
    </Box>
  );
}

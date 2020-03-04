import React from "react";
import { Box } from "@material-ui/core";
import PlaceIcon from "@material-ui/icons/Place";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  orgLogo: {
    height: "0.9rem",
    marginBottom: -2
  },
  cardIconBox: {
    width: 40,
    display: "inline-block"
  },
  cardIcon: {
    verticalAlign: "bottom",
    marginBottom: -2,
    marginTop: 2
  }
});

export default function ProjectMetaData({ project }) {
  const classes = useStyles();

  return (
    <Box>
      <Box>
        <span className={classes.cardIconBox}>
          <img src={project.organization_image} className={classes.orgLogo} />
        </span>
        {project.organization_name}
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

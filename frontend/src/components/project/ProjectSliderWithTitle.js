import React from "react";
import { Typography, Divider } from "@material-ui/core";
import ProjectsSlider from "../climateMatchResults/ProjectsSlider";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => {
  return {
    subHeader: {
      fontWeight: "bold",
      paddingBottom: theme.spacing(2),
    },
    divider: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  };
});

export default function ProjectSliderWithTitle({ similarProjects, title }) {
  const classes = useStyles();
  return (
    <>
      <Divider className={classes.divider} />
      <Typography component="h2" variant="h6" color="primary" className={classes.subHeader}>
        {title}
      </Typography>
      <ProjectsSlider projects={similarProjects} showSimilarProjects />
    </>
  );
}

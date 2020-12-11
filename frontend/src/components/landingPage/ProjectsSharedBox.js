import React from "react";
import { makeStyles, Typography, Button } from "@material-ui/core";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import ProjectPreviewsFixed from "../project/ProjectPreviewsFixed";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "90%",
    maxWidth: 1280,
    margin: "0 auto",
  },
  headline: {
    fontSize: 25,
    fontWeight: 700,
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      fontSize: 21,
      marginBottom: theme.spacing(2),
    },
  },
  explainerText: {
    maxWidth: 750,
    marginBottom: theme.spacing(3),
  },
  showProjectsButtonContainer: {
    marginTop: theme.spacing(3),
    color: theme.palette.yellow.main,
  },
  showProjectsArrow: {
    marginLeft: theme.spacing(2),
  },
  showProjectsText: {
    textDecoration: "underline",
  },
}));

export default function ProjectsSharedBox({ projects }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography color="primary" component="h1" className={classes.headline}>
        Make an impact nearby or anywhere on earth
      </Typography>
      <Typography color="secondary" className={classes.explainerText}>
        Find the best climate change solutions from around the world. Share your own solutions and
        projects for others to replicate.
      </Typography>
      <ProjectPreviewsFixed projects={projects} />
      <div className={classes.showProjectsButtonContainer}>
        <Button color="inherit" href="/browse">
          <span className={classes.showProjectsText}>Show all projects</span>
          <KeyboardArrowRightIcon className={classes.showProjectsArrow} />
        </Button>
      </div>
    </div>
  );
}

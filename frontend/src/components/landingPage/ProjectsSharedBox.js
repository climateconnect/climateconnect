import { Button, makeStyles, Typography } from "@material-ui/core";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import React from "react";
import FixedPreviewCards from "./FixedPreviewCards";

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
    color: theme.palette.primary.main,
  },
  showProjectsArrow: {
    marginLeft: theme.spacing(2),
  },
  showProjectsText: {
    textDecoration: "underline",
  },
}));

export default function ProjectsSharedBox({ projects, className, isLoading }) {
  const classes = useStyles();
  return (
    <div className={`${className} ${classes.root}`}>
      <Typography color="primary" component="h1" className={classes.headline}>
        Climate solutions shared by Climate Connect users
      </Typography>
      <Typography color="secondary" className={classes.explainerText}>
        Find the best climate change solutions from around the world. Get involved, share your own
        solutions or spread effective projects and ideas to your location.
      </Typography>
      <FixedPreviewCards isLoading={isLoading} elements={projects} type="project" />
      <div className={classes.showProjectsButtonContainer}>
        <Button color="inherit" href="/browse">
          <span className={classes.showProjectsText}>Show all projects</span>
          <KeyboardArrowRightIcon className={classes.showProjectsArrow} />
        </Button>
      </div>
    </div>
  );
}

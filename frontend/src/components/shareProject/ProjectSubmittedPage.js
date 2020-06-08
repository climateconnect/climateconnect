import React from "react";
import { Typography } from '@material-ui/core';
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  root: {
    textAlign: "center",
    padding: theme.spacing(5),
    marginTop: theme.spacing(10)
  },
  headline: {
    marginBottom: theme.spacing(3)
  }
}));

export default function ProjectSubmittedPage({isDraft, url_slug}) {
  const classes = useStyles();
  console.log(isDraft)
  console.log(url_slug)
  return (
    <div className={classes.root}>
      <Typography variant="h5" className={classes.headline}>
        Congratulations! Your project has been published!
      </Typography>      
      <Typography variant="h5" className={classes.headline}>We are really happy that you inspire the global climate action community!</Typography>
      <Typography variant="h5">You can view your project <a href={"/projects/"+url_slug}>here</a></Typography>
    </div>
  )
}
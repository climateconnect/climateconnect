import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import LinearProgress from "@material-ui/core/LinearProgress";

const useStyles = makeStyles(theme => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2)
    },
    textAlign: "center"
  }
}));

export default function ProgressBar(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      {props.progressPercentage}%
      <LinearProgress variant="determinate" value={props.progressPercentage} />
    </div>
  );
}

import { CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const useStyles = makeStyles(() => ({
  translationLoader: {
    color: "white",
  },
}));

export default function ButtonLoader() {
  const classes = useStyles();
  return <CircularProgress className={classes.translationLoader} size={23} />;
}

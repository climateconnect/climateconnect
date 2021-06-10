import { CircularProgress, makeStyles } from "@material-ui/core";
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

import React from "react";
import { Typography, Link, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => {
  return {
    infoMessage: {
      textAlign: "center",
      marginTop: theme.spacing(4),
    },
  };
});

export default function NoItemsFound({ type }) {
  const classes = useStyles();
  return (
    <Typography component="h4" variant="h5" className={classes.infoMessage}>
      No results.
    </Typography>
  );
}

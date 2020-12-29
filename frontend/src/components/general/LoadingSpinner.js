import React, { useContext } from "react";

import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

import LoadingContext from "../context/LoadingContext";

const useStyles = makeStyles({
  spinner: {
    marginTop: "48px",
  },
});

/**
 * Generalized loading spinner that's centered and to be used
 * for search and filtering use cases. Uses a global loading context
 * to determine if the spinnner should be rendered.
 */
const LoadingSpinner = () => {
  const classes = useStyles();
  const loadingContext = useContext(LoadingContext);

  if (!loadingContext.spinning) {
    return null;
  }

  return (
    <Grid container justify="center">
      <CircularProgress className={classes.spinner} />
    </Grid>
  );
};

export default LoadingSpinner;

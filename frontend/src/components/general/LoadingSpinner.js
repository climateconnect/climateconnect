import React from "react";

import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles({
  spinner: {
    marginTop: "48px",
  },
});

/**
 * Generalized loading spinner that's centered and to be used
 * for search and filtering use cases.
 *
 * API includes an optional prop to override loading
 * state. Defaults to true.
 */
const LoadingSpinner = ({ isLoading = true }) => {
  const classes = useStyles();

  return (
    isLoading && (
      <Grid container justify="center">
        <CircularProgress className={classes.spinner} />
      </Grid>
    )
  );
};

export default LoadingSpinner;

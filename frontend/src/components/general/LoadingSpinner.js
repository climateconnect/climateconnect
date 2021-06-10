import { Grid } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";
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
const LoadingSpinner = ({ isLoading = false, className }) => {
  const classes = useStyles();

  // A short-circuit isLoading prop will bypass the loading context.
  if (isLoading) {
    return (
      <Grid container justify="center" className={className}>
        <CircularProgress className={classes.spinner} />
      </Grid>
    );
  }

  const loadingContext = useContext(LoadingContext);
  if (!loadingContext.spinning) {
    return null;
  }

  return (
    <Grid container justify="center" className={className}>
      <CircularProgress className={classes.spinner} />
    </Grid>
  );
};

export default LoadingSpinner;

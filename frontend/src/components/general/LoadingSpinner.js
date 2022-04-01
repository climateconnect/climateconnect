import { Grid, Typography } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from "@material-ui/core/styles";
import React, { useContext } from "react";
import LoadingContext from "../context/LoadingContext";

const useStyles = makeStyles((theme) => ({
  spinner: (props) => ({
    marginTop: props.noMarginTop ? 0 : "48px",
    color: props.color ? props.color : "default",
  }),
  text: {
    marginTop: theme.spacing(2),
    textAlign: "center",
  },
  progressAndMessageContainer: {
    textAlign: "center",
  },
}));

/**
 * Generalized loading spinner that's centered and to be used
 * for search and filtering use cases. Uses a global loading context
 * to determine if the spinnner should be rendered.
 */
const LoadingSpinner = ({ isLoading = false, className, color, noMarginTop, message }) => {
  const classes = useStyles({ color: color, noMarginTop: noMarginTop });

  // A short-circuit isLoading prop will bypass the loading context.
  if (isLoading) {
    return (
      <Grid
        direction="column"
        container
        justify="center"
        alignContent="center"
        className={className}
      >
        <div className={classes.progressAndMessageContainer}>
          <CircularProgress className={classes.spinner} />
          {message && <Typography className={classes.text}>{message}</Typography>}
        </div>
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

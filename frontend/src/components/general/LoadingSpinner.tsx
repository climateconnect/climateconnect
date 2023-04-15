import { Theme, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import CircularProgress from "@mui/material/CircularProgress";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import LoadingContext from "../context/LoadingContext";

const useStyles = makeStyles<Theme, { noMarginTop?: boolean; color?: string }>((theme) => ({
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

type Props = {
  isLoading?: boolean;
  className?: string;
  color?: string;
  noMarginTop?: boolean;
  message?: string;
};
/**
 * Generalized loading spinner that's centered and to be used
 * for search and filtering use cases. Uses a global loading context
 * to determine if the spinnner should be rendered.
 */
const LoadingSpinner = ({ isLoading = false, className, color, noMarginTop, message }: Props) => {
  const classes = useStyles({ color: color, noMarginTop: noMarginTop });

  // A short-circuit isLoading prop will bypass the loading context.
  if (isLoading) {
    return (
      <Grid
        direction="column"
        container
        justifyContent="center"
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
    <Grid container justifyContent="center" className={className}>
      <CircularProgress className={classes.spinner} />
    </Grid>
  );
};

export default LoadingSpinner;

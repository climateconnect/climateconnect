import React from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  spinnerContainer: props => ({
    display: "flex",
    position: "relative",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: `calc(100vh - ${props.subtractedHeight}px)`,
    flexDirection: "column"
  }),
  spinner: {
    width: 100
  }
}));
export default function LoadingContainer({ headerHeight, footerHeight }) {
  const classes = useStyles({
    subtractedHeight: (headerHeight + footerHeight).toString()
  });
  return (
    <div className={classes.spinnerContainer}>
      <div>
        <img className={classes.spinner} src="/images/logo.png" />
      </div>
      <Typography component="div">Loading...</Typography>
    </div>
  );
}

import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => {
  return {
    imageContainer: {
      width: "100%",
      marginBottom: theme.spacing(10),
      [theme.breakpoints.down("xs")]: {
        marginBottom: theme.spacing(1)
      }
    }
  };
});

export default function AboutHeaderImage() {
  const classes = useStyles();
  return (
    <img className={classes.imageContainer} src="images/about_background.jpg" />
  );
}

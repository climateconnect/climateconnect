import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  imageContainer: {
    width: "100%",
    height: "auto"
  }
});

export default function QuoteSlideShow({ image, className }) {
  const classes = useStyles();
  return <img className={`${classes.imageContainer} ${className}`} src={"images/" + image} />;
}

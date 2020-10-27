import React from "react";
import TextLoop from "react-text-loop";
import { Typography } from "@material-ui/core";

export default function AlternatingText({ classes }) {
  if (!classes) classes = {};
  return (
    <TextLoop mask={true} interval={5000}>
      <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
        Get inspired by
      </Typography>
    </TextLoop>
  );
}

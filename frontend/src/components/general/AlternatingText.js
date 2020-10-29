import React from "react";
import TextLoop from "react-text-loop";
import { Typography } from "@material-ui/core";

export default function AlternatingText({ classes, mobile }) {
  if (!classes) classes = {};
  return (
    <TextLoop mask={true} interval={4000}>
      <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
          Share
        </Typography>
        <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
          Find
        </Typography>
        <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
          Work on
        </Typography>
        <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
          Get inspired by
        </Typography>
        <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
          Replicate
        </Typography>
        <Typography component="h1" variant="h5" color="primary" className={classes.titleText}>
          {mobile ? "Join" : "Collaborate with"}
        </Typography>
    </TextLoop>
  );
}

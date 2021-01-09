import React from "react";
import { makeStyles, Typography } from "@material-ui/core";
import FixedPreviewCards from "./FixedPreviewCards";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "90%",
    maxWidth: 1280,
    margin: "0 auto",
  },
  headline: {
    fontSize: 25,
    fontWeight: 700,
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      fontSize: 21,
      marginBottom: theme.spacing(2),
    },
  },
  explainerText: {
    maxWidth: 750,
    marginBottom: theme.spacing(3),
  },
}));

export default function HubsBox({ hubs }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography color="primary" component="h1" className={classes.headline}>
        Find solutions for each sector in our hubs
      </Typography>
      <Typography color="secondary" className={classes.explainerText}>
        Discover facts and concrete climate actions, projects and solutions Climate Connect users
        are working on by vising the Hubs. Get a rundown of every main field of action in the fight
        against climate change.
      </Typography>
      <FixedPreviewCards elements={hubs} type="hub" />
    </div>
  );
}

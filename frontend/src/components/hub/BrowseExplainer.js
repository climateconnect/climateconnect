import React from "react";
import { makeStyles, Typography, Container } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  browseExplainer: {
    fontSize: 18,
    marginBottom: theme.spacing(2),
    textAlign: "center",
  },
  headline: {
    color: theme.palette.primary.main,
    fontWeight: 700,
    fontSize: 22,
    marginBottom: theme.spacing(2),
  },
}));

export default function BrowseExplainer() {
  const classes = useStyles();
  return (
    <Container>
      <Typography component="div" className={classes.browseExplainer}>
        <Typography component="h1" className={classes.headline}>
          Find impactful climate change solutions created by Climate Connect users.
        </Typography>
        Knowing the facts is important but taking action is what matters! The clock is ticking and
        every tenth of an degree matters.
        <br /> Get involved with the solutions or spread them to your home town. Contact the{" "}
        {"solutions'"} creators direcly on the project page to start a conversation!
      </Typography>
    </Container>
  );
}

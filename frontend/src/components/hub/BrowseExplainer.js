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
          Find impactful climate change solutions created by Climate Connect users
        </Typography>
      </Typography>
    </Container>
  );
}

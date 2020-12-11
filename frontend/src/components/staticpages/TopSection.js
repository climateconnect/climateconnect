import React from "react";
import { Typography, makeStyles, Container } from "@material-ui/core";
import SmallCloud from "./SmallCloud";

const useStyles = makeStyles((theme) => ({
  contentWrapper: {
    background: theme.palette.primary.light,
    position: "relative",
  },
  contentContainer: {
    display: "flex",
    alignItems: "center",
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    maxWidth: theme.breakpoints.md,
    margin: "0 auto",
  },
  headersContainer: {
    marginLeft: theme.spacing(3),
    position: "relative",
  },
  headline: {
    color: theme.palette.primary.main,
    fontSize: 40,
    fontWeight: "bold",
  },
  subHeader: {
    fontSize: 19,
    fontWeight: 600,
    color: theme.palette.secondary.main,
  },
  mobileSubheaderContainer: {
    marginTop: 30,
  },
  smallCloud2: {
    position: "absolute",
    width: 90,
    height: 75,
    bottom: 0,
    right: 20,
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
  smallCloud1: {
    position: "absolute",
    width: 120,
    height: 90,
    top: -20,
    right: -60,
  },
  image: {
    maxWidth: 70,
  },
}));
export default function TopSection({ headline, subHeader }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <div className={classes.contentWrapper}>
        <Container className={classes.contentContainer}>
          <div className={classes.headersContainer}>
            <Typography component="h1" className={classes.headline}>
              {headline}
            </Typography>
            <Typography component="h2" className={classes.subHeader}>
              {subHeader}
            </Typography>
            <SmallCloud type={1} className={classes.smallCloud1} />
          </div>
        </Container>
        <SmallCloud type={2} reverse className={classes.smallCloud2} />
      </div>
    </div>
  );
}

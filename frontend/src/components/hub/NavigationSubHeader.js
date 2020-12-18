import React from "react";
import { Container, Link, Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.main,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  path: {
    color: "white",
    fontWeight: 600,
  },
  link: {
    color: "white",
    display: "inline-block",
    fontWeight: 600,
    marginRight: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5),
  },
}));

export default function NavigationSubHeader({ hubName }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Container>
        <Typography className={classes.path} component="div">
          <Link className={classes.link} href="/browse">
            Browse
          </Link>
          {" / "}
          <Link className={classes.link} href="/hubs">
            Hubs
          </Link>
          {" / "}
          <Typography className={classes.link}>{hubName}</Typography>
        </Typography>
      </Container>
    </div>
  );
}

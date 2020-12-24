import React from "react";
import { makeStyles, Link, Container } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.main,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  link: {
    color: "white",
    display: "inline-block",
    fontWeight: 600,
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
    fontSize: 16,
  },
  container: {
    display: "flex",
    justifyContent: "flex-end",
  },
}));

export default function HubsSubHeader({ hubs }) {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Container className={classes.container}>
        <Link className={classes.link} key={"/hubs"} href={`/hubs/`}>
          All Hubs
        </Link>
        {hubs &&
          hubs.map((hub) => (
            <Link className={classes.link} key={hub.url_slug} href={`/hubs/${hub.url_slug}`}>
              {hub.name}
            </Link>
          ))}
      </Container>
    </div>
  );
}

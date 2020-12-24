import React from "react";
import { makeStyles, Link, Container, useMediaQuery, Button } from "@material-ui/core";
import theme from "../../themes/theme";

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
    [theme.breakpoints.down("xs")]: {
      justifyContent: "center"
    }
  },
  viewHubsButton: {
    background: "white"
  }
}));

export default function HubsSubHeader({ hubs }) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("xs"))
  return (
    <div className={classes.root}>
      <Container className={classes.container}>
        {
          isNarrowScreen ?
            <Button className={classes.viewHubsButton} variant="contained" href={`/hubs/`}>View sector hubs</Button>
          :
          <Link className={classes.link} key={"/hubs"} href={`/hubs/`}>
            All Hubs
          </Link>
        }
        {hubs && !isNarrowScreen &&
          hubs.map((hub) => (
            <Link className={classes.link} key={hub.url_slug} href={`/hubs/${hub.url_slug}`}>
              {hub.name}
            </Link>
          ))
        }
      </Container>
    </div>
  );
}

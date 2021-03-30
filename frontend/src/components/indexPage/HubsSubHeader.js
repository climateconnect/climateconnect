import { Button, Container, Link, makeStyles, useMediaQuery } from "@material-ui/core";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";

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
      justifyContent: "center",
    },
  },
  viewHubsButton: {
    background: "white",
  },
}));

export default function HubsSubHeader({ hubs, subHeaderRef }) {
  const classes = useStyles();
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "navigation", locale: locale });
  return (
    <div className={classes.root} ref={subHeaderRef}>
      <Container className={classes.container}>
        {isNarrowScreen ? (
          <Button className={classes.viewHubsButton} variant="contained" href={`/hubs/`}>
            {texts.view_sector_hubs}
          </Button>
        ) : (
          <Link className={classes.link} key={"/hubs"} href={`/hubs/`}>
            {texts.all_hubs}
          </Link>
        )}
        {hubs &&
          !isNarrowScreen &&
          hubs.map((hub) => (
            <Link className={classes.link} key={hub.url_slug} href={`/hubs/${hub.url_slug}`}>
              {hub.name}
            </Link>
          ))}
      </Container>
    </div>
  );
}

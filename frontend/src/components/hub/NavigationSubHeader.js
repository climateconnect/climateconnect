import { Container, Link, makeStyles, Typography } from "@material-ui/core";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

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
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "navigation", locale: locale });
  return (
    <div className={classes.root}>
      <Container>
        <Typography className={classes.path} component="div">
          <Link className={classes.link} href={getLocalePrefix(locale) + "/browse"}>
            {texts.browse}
          </Link>
          {" / "}
          <Link className={classes.link} href={getLocalePrefix(locale) + "/hubs"}>
            {texts.hubs}
          </Link>
          {hubName && (
            <>
              {" / "}
              <Typography className={classes.link}>{hubName}</Typography>
            </>
          )}
        </Typography>
      </Container>
    </div>
  );
}

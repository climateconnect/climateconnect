import { Container, Theme, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext } from "react";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import AppLink from "../general/AppLink";
import HubLinks from "../indexPage/hubsSubHeader/HubLinks";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.main,
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
  flexContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rightSideContainer: {
    display: "flex",
    alignItems: "center",
  },
  allProjectsLink: {
    marginRight: theme.spacing(1.5),
  },
}));

export default function NavigationSubHeader({ hubName, allHubs, isLocationHub }: any) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "navigation", locale: locale });
  const isNarrowScreen = useMediaQuery<Theme>(theme.breakpoints.down("sm"));
  const isSmallMediumScreen = useMediaQuery<Theme>(theme.breakpoints.down("md"));
  return (
    <div className={classes.root}>
      <Container className={classes.flexContainer}>
        <Typography className={classes.path} component="div">
          {!isNarrowScreen && !(isLocationHub && isSmallMediumScreen) && (
            <>
              <AppLink className={classes.link} href="/projects" leaveHub underline="hover">
                {texts.browse}
              </AppLink>
              {" / "}
              <AppLink className={classes.link} href="/hubs" leaveHub underline="hover">
                {texts.hubs}
              </AppLink>

              {hubName && (
                <>
                  {" / "}
                  <Typography className={classes.link}>{hubName}</Typography>
                </>
              )}
            </>
          )}
        </Typography>
        <Typography component="div" className={classes.rightSideContainer}>
          <HubLinks
            hubs={allHubs}
            locale={locale}
            isNarrowScreen={isNarrowScreen}
            showAllProjectsButton
            linkClassName={classes.link}
          />
        </Typography>
      </Container>
    </div>
  );
}

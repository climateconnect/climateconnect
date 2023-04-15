import { Container, Link, makeStyles, Theme, Typography, useMediaQuery } from "@material-ui/core";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import HubLinks from "../indexPage/hubsSubHeader/HubLinks";

type NavigationSubHeaderProps =
  | {
      type: "hub";
      hubName: string;
      isLocationHub: boolean;
      allHubs: Array<any>; // TODO: use correct Hub typing here
      hubUrl: string;
      navigationRequested: (target: string) => void;
    }
  | {
      type: "browse";
      allHubs: Array<any>; // TODO: use correct Hub typing here
    };


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
  climateMatchButton: {
    background: theme.palette.primary.light,
    color: "black",
  },
}));

function createNavigationUrl(locale: string, urlSlug: string, target: string): string {
  return `${getLocalePrefix(locale)}/hubs/${urlSlug}#${target}`; // ?hubPage=${urlSlug}
}

export default function NavigationSubHeader(props: NavigationSubHeaderProps) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "navigation", locale: locale });
  const isNarrowScreen = useMediaQuery<Theme>(theme.breakpoints.down("xs"));
  const isSmallMediumScreen = useMediaQuery<Theme>(theme.breakpoints.down("sm"));
  return (
    <div className={classes.root}>
      <Container className={classes.flexContainer}>
        <Typography className={classes.path} component="div">
          {!isNarrowScreen && props.type === "hub" && (
            <>
              <Link
                className={classes.link}
                href={createNavigationUrl(locale, props.hubUrl, "projects")}
                onClick={() => props.navigationRequested("projects")}
              >
                {texts.projects}
              </Link>
              <Link
                className={classes.link}
                href={createNavigationUrl(locale, props.hubUrl, "organizations")}
                onClick={() => props.navigationRequested("organizations")}
              >
                {texts.organizations}
              </Link>
              <Link
                className={classes.link}
                href={createNavigationUrl(locale, props.hubUrl, "ideas")}
              >
                {texts.ideas}
              </Link>
              <Link
                className={classes.link}
                href={`${getLocalePrefix(locale)}/climatematch?from_hub=${props.hubName}`}
              >
                {texts.get_active}
              </Link>
            </>
          )}
          {props.type === "hub" && props.isLocationHub && isSmallMediumScreen && (
            <Link
              className={classes.link}
              href={`${getLocalePrefix(locale)}/climatematch?from_hub=${props.hubName}`}
            >
              {texts.get_active}
            </Link>
          )}
        </Typography>
        <Typography component="div" className={classes.rightSideContainer}>
          <HubLinks
            hubs={props.allHubs}
            locale={locale}
            isNarrowScreen={isNarrowScreen}
            showAllProjectsButton
            linkClassName={classes.link}
            isLocationHub={props.type === "hub" && props.isLocationHub}
          />
        </Typography>
      </Container>
    </div>
  );
}

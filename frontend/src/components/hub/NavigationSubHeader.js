import {
  Badge,
  Button,
  Container,
  Link,
  makeStyles,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import React, { useContext } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
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
  climateMatchButton: {
    background: theme.palette.primary.light,
    color: "black",
  },
}));

export default function NavigationSubHeader({ hubName, allHubs, isLocationHub }) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "navigation", locale: locale });
  const isNarrowScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const isSmallMediumScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <div className={classes.root}>
      <Container className={classes.flexContainer}>
        <Typography className={classes.path} component="div">
          {!isNarrowScreen && !(isLocationHub && isSmallMediumScreen) && (
            <>
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
            </>
          )}
          {isLocationHub && isSmallMediumScreen && (
            <Badge badgeContent={texts.new} color="error">
              <Button
                href={`${getLocalePrefix(locale)}/climatematch?from_hub=erlangen`}
                variant="contained"
                color="primary"
                size="small"
                className={classes.climateMatchButton}
              >
                {texts.get_active}
              </Button>
            </Badge>
          )}
        </Typography>
        <Typography component="div" className={classes.rightSideContainer}>
          <HubLinks
            hubs={allHubs}
            locale={locale}
            isNarrowScreen={isNarrowScreen}
            showAllProjectsButton
          />
        </Typography>
      </Container>
    </div>
  );
}

import { Theme } from "@emotion/react";
import { Container, Link, Tab, Tabs, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext, useState } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";
import HubsDropDown from "../indexPage/hubsSubHeader/HubsDropDown";

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.primary.main,
  },
  tabs: {
    "& .MuiTabs-indicator": {
      background: "transparent",
    },
  },
  tab: {
    textTransform: "none",
    color: "white",
    fontSize: 16,
    "&.Mui-selected": {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      "& .tabLabel": {
        color: theme.palette.primary.main,
        background: "white",
        borderRadius: 15,
        paddingTop: 3,
        paddingBottom: 3,
        padding: theme.spacing(1.5),
        display: "flex",
        alignItems: "center",
      },
    },
    "&:hover": {
      textDecoration: "underline",
    },
  },
  tabIndicator: {
    background: "white",
    color: "white",
  },
  path: {
    color: "white",
    fontWeight: 600,
  },
  link: {
    color: "white",
    display: "inline-block",
    fontWeight: 600,
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
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
  climateMatchLinkContainer: {
    display: "flex",
    alignItems: "center",
  },
  climateMatchLink: {
    color: "white",
    fontWeight: 600,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  linksAndTabsWrapper: {
    display: "flex",
    alignItems: "center",
    height: theme.spacing(6),
    [theme.breakpoints.down("md")]: {
      justifyContent: "space-between",
    },
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
  },
}));

export default function HubTabsNavigation({
  TYPES_BY_TAB_VALUE,
  tabValue,
  handleTabChange,
  type_names,
  hubUrl,
  className,
  allHubs,
}) {
  const { locale, user } = useContext(UserContext);
  const classes = useStyles();
  const locationHubs = allHubs.filter((h) => h.hub_type === "location hub");
  const texts = getTexts({ page: "navigation", locale: locale });
  const isNarrowScreen = useMediaQuery<Theme>(theme.breakpoints.down("md"));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const handleOpen = () => {
    setDropdownOpen(true);
  };
  const handleClose = () => {
    setDropdownOpen(false);
  };
  const handleToggleOpen = () => {
    setDropdownOpen(!dropdownOpen);
  };

  //Don't show the HubTabsNavigation if we're logged out on mobile
  if (!user && isNarrowScreen) {
    return <></>;
  }
  return (
    <div className={`${className} ${classes.root}`}>
      <Container maxWidth="lg" className={classes.container}>
        <div className={classes.linksAndTabsWrapper}>
          {!isNarrowScreen && (
            <Tabs
              variant={isNarrowScreen ? "fullWidth" : "standard"}
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              className={classes.tabs}
            >
              {!isNarrowScreen &&
                TYPES_BY_TAB_VALUE.map((t, index) => {
                  const tabProps: any = {
                    classes: {
                      root: classes.tab,
                      indicator: classes.tabIndicator,
                    },
                  };
                  return (
                    <Tab
                      {...tabProps}
                      disableRipple
                      key={index}
                      label={<div className="tabLabel">{type_names[t]}</div>}
                    />
                  );
                })}
            </Tabs>
          )}
          <div className={classes.climateMatchLinkContainer}>
            <Link
              className={classes.climateMatchLink}
              href={`${getLocalePrefix(locale)}/climatematch?from_hub=${hubUrl}`}
              underline="hover"
            >
              ClimateMatch
            </Link>
          </div>
          {isNarrowScreen && (
            <Link
              className={classes.climateMatchLink}
              href={`${getLocalePrefix(locale)}/climatematch?from_hub=${hubUrl}`}
              underline="hover"
            >
              {texts.projects_worldwide}
            </Link>
          )}
        </div>
        <HubsDropDown
          hubs={locationHubs}
          label={texts.all_hubs}
          isNarrowScreen={isNarrowScreen}
          onToggleOpen={handleToggleOpen}
          open={dropdownOpen}
          onOpen={handleOpen}
          onClose={handleClose}
          addLocationHubExplainerLink
          height={48}
        />
      </Container>
    </div>
  );
}

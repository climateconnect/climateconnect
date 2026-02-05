import { Button, Checkbox, Container, Theme, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext, useState } from "react";
import Cookies from "universal-cookie";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => {
  return {
    root: {
      position: "fixed",
      bottom: 0,
      left: 0,
      width: "100%",
      height: 150,
      zIndex: 200,
      background: "white",
      borderTop: `1px solid ${theme.palette.secondary.main}`,
      paddingTop: theme.spacing(1),
      [theme.breakpoints.down("lg")]: {
        height: 200,
      },
    },
    headline: {
      fontWeight: "bold",
      marginBottom: theme.spacing(1),
      [theme.breakpoints.down("lg")]: {
        fontSize: 15,
      },
    },
    buttons: {
      float: "right",
      [theme.breakpoints.down("lg")]: {
        float: "none",
        display: "block",
      },
    },
    leftButton: {
      [theme.breakpoints.up("md")]: {
        marginRight: theme.spacing(1),
      },
      [theme.breakpoints.down("lg")]: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
      },
    },
    rightButton: {
      [theme.breakpoints.down("lg")]: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
      },
    },
    leftButtonContainer: {
      display: "inline-block",
      [theme.breakpoints.down("lg")]: {
        width: "50%",
        padding: theme.spacing(0.5),
      },
    },
    rightButtonContainer: {
      display: "inline-block",
      [theme.breakpoints.down("lg")]: {
        width: "50%",
        padding: theme.spacing(0.5),
      },
    },
  };
});

export default function CookieBanner({ closeBanner }) {
  const classes = useStyles();
  const { updateCookies, locale } = useContext(UserContext);
  const texts = getTexts({ page: "cookie", locale: locale });
  const [checked, setChecked] = useState({ necessary: true, statistics: false });
  const cookies = new Cookies();
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const onStatisticsChange = () => {
    setChecked({ ...checked, statistics: !checked.statistics });
  };

  const now = new Date();
  const oneYearFromNow = new Date(now.setFullYear(now.getFullYear() + 1));

  const confirmSelection = () => {
    cookies.set("acceptedNecessary", true, { path: "/", sameSite: "lax", expires: oneYearFromNow });
    cookies.set("acceptedStatistics", checked.statistics, {
      path: "/",
      sameSite: "lax",
      expires: oneYearFromNow,
    });
    updateCookies();
    closeBanner();
  };

  const enableAll = () => {
    cookies.set("acceptedNecessary", true, { path: "/", sameSite: "lax", expires: oneYearFromNow });
    cookies.set("acceptedStatistics", true, {
      path: "/",
      sameSite: "lax",
      expires: oneYearFromNow,
    });
    updateCookies();
    closeBanner();
  };

  return (
    <div className={classes.root}>
      <Container maxWidth="lg">
        <Typography variant="h6" color="secondary" className={classes.headline}>
          {texts.cookie_banner_headline}
        </Typography>
        {!isNarrowScreen && <Typography variant="body2">{texts.cookie_explanation}</Typography>}
        <Typography variant="body2">
          {texts.for_more_information_check_out_our}{" "}
          <a href={getLocalePrefix(locale) + "privacy"} target="_blank" rel="noreferrer">
            {texts.privacy_policy}
          </a>{" "}
          {texts.and}{" "}
          <a href={getLocalePrefix(locale) + "terms"} target="_blank" rel="noreferrer">
            {texts.terms_of_use}.
          </a>
        </Typography>
        <Checkbox checked={checked.necessary} disabled />
        {texts.cookies_necessary}
        <Checkbox checked={checked.statistics} onChange={onStatisticsChange} />
        {texts.cookies_statistics}
        <span className={classes.buttons}>
          <div className={classes.leftButtonContainer}>
            <Button
              variant="contained"
              color="secondary"
              className={classes.leftButton}
              onClick={confirmSelection}
            >
              {texts.confirm_selection}
            </Button>
          </div>
          <div className={classes.rightButtonContainer}>
            <Button
              color="primary"
              className={classes.rightButton}
              variant="contained"
              onClick={enableAll}
            >
              {texts.enable_all_cookies}
            </Button>
          </div>
        </span>
      </Container>
    </div>
  );
}

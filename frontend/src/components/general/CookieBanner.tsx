import {
  Button,
  Checkbox,
  Container,
  Modal,
  Theme,
  Typography,
  useMediaQuery,
  Box,
  FormControlLabel,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, { useContext, useState } from "react";
import Cookies from "universal-cookie";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";
import LaunchIcon from "@mui/icons-material/Launch";

const useStyles = makeStyles((theme) => {
  return {
    modal: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.secondary.main}`,
      padding: theme.spacing(2, 4, 3),
      borderRadius: theme.shape.borderRadius,
      maxWidth: "600px",
      width: "90%",
      outline: "none",
    },
    headline: {
      fontWeight: "bold",
      marginBottom: theme.spacing(1),
      [theme.breakpoints.down("lg")]: {
        fontSize: 15,
      },
    },
    buttons: {
      display: "flex",
      justifyContent: "center",
      gap: theme.spacing(2),
      marginTop: theme.spacing(2),
      [theme.breakpoints.down("md")]: {
        flexDirection: "column",
      },
    },
    leftButton: {
      flex: 1,
      [theme.breakpoints.up("md")]: {
        marginRight: theme.spacing(1),
      },
      [theme.breakpoints.down("lg")]: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
      },
    },
    rightButton: {
      flex: 1,
      [theme.breakpoints.down("lg")]: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
      },
    },
    link: {
      display: "inline-flex",
      alignItems: "center",
    },
    linkIcon: {
      fontSize: "1rem",
      marginLeft: theme.spacing(0.5),
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

  const handleClose = () => {
    // do nothing
  };

  return (
    <Modal open={true} onClose={handleClose} className={classes.modal}>
      <Box className={classes.content}>
        <Container maxWidth="lg">
          <Typography variant="h6" color="secondary" className={classes.headline}>
            {texts.cookie_banner_headline}
          </Typography>
          {!isNarrowScreen && <Typography variant="body2">{texts.cookie_explanation}</Typography>}
          <Typography variant="body2">
            {texts.for_more_information_check_out_our}{" "}
            <a
              href={getLocalePrefix(locale) + "/privacy"}
              target="_blank"
              rel="noreferrer"
              className={classes.link}
            >
              {texts.privacy_policy}
              <LaunchIcon className={classes.linkIcon} />
            </a>{" "}
            {texts.and}{" "}
            <a
              href={getLocalePrefix(locale) + "/terms"}
              target="_blank"
              rel="noreferrer"
              className={classes.link}
            >
              {texts.terms_of_use}
              <LaunchIcon className={classes.linkIcon} />
            </a>
            .
          </Typography>
          <FormControlLabel
            control={<Checkbox checked={checked.necessary} disabled />}
            label={texts.cookies_necessary}
          />
          <FormControlLabel
            control={<Checkbox checked={checked.statistics} onChange={onStatisticsChange} />}
            label={texts.cookies_statistics}
          />
          <div className={classes.buttons}>
            <Button
              variant="outlined"
              color="secondary"
              className={classes.leftButton}
              onClick={confirmSelection}
            >
              {texts.confirm_selection}
            </Button>
            <Button
              color="primary"
              className={classes.rightButton}
              variant="contained"
              onClick={enableAll}
            >
              {texts.enable_all_cookies}
            </Button>
          </div>
        </Container>
      </Box>
    </Modal>
  );
}

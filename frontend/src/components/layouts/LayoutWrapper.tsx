import { Snackbar, SnackbarContent, Theme, useMediaQuery } from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";
import { ThemeProvider } from "@mui/material/styles";
import Head from "next/head";
import Router from "next/router";
import React, { useContext, useEffect, useState } from "react";
import getTexts from "../../../public/texts/texts";
import FeedbackContext from "../context/FeedbackContext";
import UserContext from "../context/UserContext";
import FeedbackButton from "../feedback/FeedbackButton";
import CookieBanner from "../general/CookieBanner";
import LoadingContainer from "../general/LoadingContainer";
import CloseSnackbarAction from "../snackbarActions/CloseSnackbarAction";
import LogInAction from "../snackbarActions/LogInAction";
import { DevLinkProvider } from "../../../devlink/DevLinkProvider";

declare module "@mui/styles/defaultTheme" {
  // eslint-disable-next-line no-unused-vars
  interface DefaultTheme extends Theme {}
}

const useStyles = makeStyles<Theme>((theme) => ({
  leaveSpaceForFooter: {
    position: "relative",
    //height of footer + spacing(1)
    paddingBottom: theme.spacing(12),
    minHeight: "100vh",
  },
  spinnerContainer: {
    display: "flex",
    position: "relative",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    flexDirection: "column",
  },
  spinner: {
    width: 100,
  },
  snackBar: {
    background: `${theme.palette.primary.main}`,
  },
  errorSnackBar: {
    background: theme.palette.error.main,
  },
  successSnackBar: {
    background: theme.palette.success.main,
  },
  snackBarMessage: {
    maxWidth: 300,
    fontSize: 16,
  },
}));

export default function LayoutWrapper({
  title,
  children,
  theme,
  fixedHeight,
  noFeedbackButton,
  noSpaceForFooter,
  description,
  image,
}: any) {
  const [snackbarProps, setSnackbarProps] = useState({
    open: false,
    message: "",
    action: <></>,
    hash: "",
    error: undefined as any,
    success: undefined as any,
  });
  const classes = useStyles();
  const [initialized, setInitialized] = useState(false);
  const isSmallerThanMediumScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("lg"));
  const [loading, setLoading] = useState(true);
  const [bannerOpen, setBannerOpen] = useState(true);
  const { acceptedNecessary, locale, isLoading } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });

  const handleUpdateHash = (newHash) => {
    setSnackbarProps({ ...snackbarProps, hash: newHash });
  };

  const handleSnackbarClose = (e, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarProps({ ...snackbarProps, open: false });
  };

  const closeBanner = () => setBannerOpen(false);
  Router.events.on("routeChangeStart", () => {
    setLoading(true);
  });
  Router.events.on("routeChangeComplete", () => {
    setLoading(false);
  });
  Router.events.on("routeChangeError", () => {
    setLoading(false);
  });

  useEffect(function () {
    if (!initialized) setInitialized(true);
    if (loading) {
      setLoading(false);
    }
  }, []);
  const defaultDescription = texts.defaultDescription;

  //if promptLogIn is true, the user will be shown a button to log in.
  //Otherwise the caller of the function can also set a custom action that should be shown to the user
  const showFeedbackMessage = ({ message, promptLogIn, action, newHash, error, success }) => {
    const newStateValue = {
      ...snackbarProps,
      open: true,
      message: message,
      error: error,
      success: success,
      action: promptLogIn ? (
        <LogInAction onClose={handleSnackbarClose} />
      ) : action ? (
        action
      ) : (
        <CloseSnackbarAction onClose={handleSnackbarClose} />
      ),
    };
    if (newHash) newStateValue.hash = newHash;
    setSnackbarProps(newStateValue);
  };

  const contextValues = {
    showFeedbackMessage: showFeedbackMessage,
    handleUpdateHash: handleUpdateHash,
  };

  const shouldShowCookieBanner = () => {
    if (acceptedNecessary || !bannerOpen || !initialized) {
      return false;
    }

    const excludedPaths = ["/privacy", "/terms", "/imprint"];
    return !excludedPaths.some((path) => Router.pathname.includes(path));
  };

  return (
    <>
      <Head>
        <title>{title ? title + " | Climate Connect" : "Climate Connect"}</title>
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link href="/fonts/openSans.css" rel="stylesheet" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
        />
        <meta
          property="og:image"
          content={image ? image : "https://climateconnect.earth/images/landing_image_small.jpg"}
        />
        <meta property="og:title" content={title ? title : texts.default_title} />
        <meta property="og:type" content="website" />

        <meta name="description" content={description ? description : defaultDescription} />
      </Head>
      {/* If theme is falsy, slience the MUI console.warning for having an undefined theme */}
      <ThemeProvider theme={theme}>
        <DevLinkProvider>
          {loading || isLoading ? (
            <div className={classes.spinnerContainer}>
              <LoadingContainer headerHeight={0} footerHeight={0} />
            </div>
          ) : (
            <FeedbackContext.Provider value={contextValues}>
              <div
                className={`${!fixedHeight && !noSpaceForFooter && classes.leaveSpaceForFooter}`}
              >
                {children}
                {shouldShowCookieBanner() && <CookieBanner closeBanner={closeBanner} />}
                {!noFeedbackButton && !isSmallerThanMediumScreen && <FeedbackButton />}
                <Snackbar
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  color="primary"
                  open={snackbarProps.open}
                  autoHideDuration={10000}
                  onClose={handleSnackbarClose}
                >
                  <SnackbarContent
                    message={snackbarProps.message}
                    action={snackbarProps.action}
                    classes={{
                      root: `${classes.snackBar} ${snackbarProps.error && classes.errorSnackBar} ${
                        snackbarProps.success && classes.successSnackBar
                      }`,
                      message: classes.snackBarMessage,
                    }}
                  />
                </Snackbar>
              </div>
            </FeedbackContext.Provider>
          )}
        </DevLinkProvider>
      </ThemeProvider>
    </>
  );
}

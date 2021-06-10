import {
  CircularProgress,
  Snackbar,
  SnackbarContent,
  Typography,
  useMediaQuery,
} from "@material-ui/core";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import Head from "next/head";
import { Router } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import getTexts from "../../../public/texts/texts";
import FeedbackContext from "../context/FeedbackContext";
import UserContext from "../context/UserContext";
import FeedbackButton from "../feedback/FeedbackButton";
import CookieBanner from "../general/CookieBanner";
import SignUpAction from "../snackbarActions/SignUpAction";

const useStyles = makeStyles((theme) => ({
  leaveSpaceForFooter: {
    position: "relative",
    //height of footer + spacing(1)
    paddingBottom: theme.spacing(9),
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
    background: `${theme.palette.primary.main} !important`,
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
}) {
  const classes = useStyles();
  const [initialized, setInitialized] = React.useState(false);
  const isSmallerThanMediumScreen = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const [loading, setLoading] = React.useState(true);
  const [bannerOpen, setBannerOpen] = React.useState(true);
  const { acceptedNecessary, locale, isLoading } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });
  const [snackbarProps, setSnackbarProps] = useState({
    open: false,
    message: "",
    action: <></>,
    hash: "",
  });

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

  //if promptSignUp is true, the user will be shown a button to sign up.
  //Otherwise the caller of the function can also set a custom action that should be shown to the user
  const showFeedbackMessage = ({ message, promptSignUp, action, newHash }) => {
    console.log(newHash);
    const newStateValue = {
      ...snackbarProps,
      open: true,
      message: message,
      action: promptSignUp ? <SignUpAction onClose={handleSnackbarClose} /> : action,
    };
    if (newHash) newStateValue.hash = newHash;
    setSnackbarProps(newStateValue);
  };

  const contextValues = {
    showFeedbackMessage: showFeedbackMessage,
    handleUpdateHash: handleUpdateHash,
  };
  return (
    <>
      <Head>
        <title>{title ? title + " | Climate Connect" : "Climate Connect"}</title>
        <link
          href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,600,700,800"
          rel="stylesheet"
        />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no"
        />
        <meta property="og:image" content="https://climateconnect.earth/images/landing_image.jpg" />
        <meta property="og:title" content={texts.default_title} />
        <meta property="og:type" content="website" />

        <meta name="description" content={description ? description : defaultDescription} />
      </Head>
      {/* If theme is falsy, slience the MUI console.warning for having an undefined theme */}
      <ThemeProvider theme={theme}>
        {loading || isLoading ? (
          <div className={classes.spinnerContainer}>
            <div>
              <img className={classes.spinner} src="/images/logo.png" />
            </div>
            <CircularProgress />
            <Typography component="div">{texts.loading_and_waiting}</Typography>
          </div>
        ) : (
          <FeedbackContext.Provider value={contextValues}>
            <div className={`${!fixedHeight && !noSpaceForFooter && classes.leaveSpaceForFooter}`}>
              {children}
              {!acceptedNecessary && bannerOpen && initialized && (
                <CookieBanner closeBanner={closeBanner} />
              )}
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
                    root: classes.snackBar,
                    message: classes.snackBarMessage,
                  }}
                />
              </Snackbar>
            </div>
          </FeedbackContext.Provider>
        )}
      </ThemeProvider>
    </>
  );
}

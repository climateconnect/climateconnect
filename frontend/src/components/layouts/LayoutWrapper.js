import { Typography, useMediaQuery } from "@material-ui/core";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import Head from "next/head";
import React, { useContext, useEffect } from "react";
import UserContext from "../context/UserContext";
import FeedbackButton from "../feedback/FeedbackButton";
import CookieBanner from "../general/CookieBanner";


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
  const { acceptedNecessary } = useContext(UserContext);
  const closeBanner = () => setBannerOpen(false);
  useEffect(function () {
    if (!initialized) setInitialized(true);
    if (loading) {
      setLoading(false);
    }
  });
  const defaultDescription =
    "Free and non-profit climate action platform. Share, find and work on impactful, innovative and inspiring solutions to reduce and stop global warming. Join #teamclimate now!";
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
        <meta
          property="og:title"
          content="Global Platform for Climate Change Solutions | Climate Connect"
        />
        <meta property="og:type" content="website" />

        <meta name="description" content={description ? description : defaultDescription} />
      </Head>
      {/* If theme is falsy, slience the MUI console.warning for having an undefined theme */}
      <ThemeProvider theme={theme}>
        {loading ? (
          <div className={classes.spinnerContainer}>
            <div>
              <img className={classes.spinner} src="/images/logo.png" />
            </div>
            <Typography component="div">Loading...</Typography>
          </div>
        ) : (
          <div className={`${!fixedHeight && !noSpaceForFooter && classes.leaveSpaceForFooter}`}>
            {children}
            {!acceptedNecessary && bannerOpen && initialized && (
              <CookieBanner closeBanner={closeBanner} />
            )}
            {!noFeedbackButton && !isSmallerThanMediumScreen && <FeedbackButton />}
          </div>
        )}
      </ThemeProvider>
    </>
  );
}

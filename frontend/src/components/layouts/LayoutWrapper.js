import React, { useEffect } from "react";
import Head from "next/head";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import CookieBanner from "../general/CookieBanner";
import Cookies from "universal-cookie";
import { useMediaQuery } from "@material-ui/core";
import FeedbackButton from "../feedback/FeedbackButton";

const useStyles = makeStyles(theme => ({
  leaveSpaceForFooter: {
    position: "relative",
    //height of footer + spacing(1)
    paddingBottom: theme.spacing(9),
    minHeight: "100vh"
  },
  spinnerContainer: {
    display: "flex",
    position: "relative",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    flexDirection: "column"
  },
  spinner: {
    width: 100
  }
}));

export default function LayoutWrapper({
  title,
  children,
  theme,
  fixedHeight,
  noFeedbackButton,
  noSpaceForFooter
}) {
  const classes = useStyles();
  const [initialized, setInitialized] = React.useState(false)
  const isSmallerThanMediumScreen = useMediaQuery(theme => theme.breakpoints.down("md"));
  const cookies = new Cookies();
  const [bannerOpen, setBannerOpen] = React.useState(true);
  const acceptedNecessary = cookies.get("acceptedNecessary");
  const closeBanner = () => setBannerOpen(false);
  useEffect(function(){
    if(!initialized)
      setInitialized(true)
  })
  return (
    <>
      <Head>
        <title>{title}</title>
        <link
          href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,500,600,700,800"
          rel="stylesheet"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <div className={`${!fixedHeight && !noSpaceForFooter && classes.leaveSpaceForFooter}`}>
          {children}
          {!acceptedNecessary && bannerOpen && initialized && <CookieBanner closeBanner={closeBanner} />}
          {!noFeedbackButton && !isSmallerThanMediumScreen && <FeedbackButton />}
        </div>
      </ThemeProvider>
    </>
  );
}

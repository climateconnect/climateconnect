import React, { useEffect } from "react";
import Head from "next/head";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import CookieBanner from "../general/CookieBanner";
import Cookies from "universal-cookie";
import { Typography } from "@material-ui/core";

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

export default function LayoutWrapper({ title, children, theme }) {
  const classes = useStyles();
  const cookies = new Cookies();
  const [loading, setLoading] = React.useState(true);
  const [bannerOpen, setBannerOpen] = React.useState(true);
  const acceptedNecessary = cookies.get("acceptedNecessary");
  useEffect(() => {
    setLoading(false);
  });
  const closeBanner = () => setBannerOpen(false);
  if (loading)
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
          <div className={classes.spinnerContainer}>
            <div>
              <img className={classes.spinner} src="/images/logo.png" />
            </div>
            <Typography component="div">Loading...</Typography>
          </div>
        </ThemeProvider>
      </>
    );
  else
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
          <div className={classes.leaveSpaceForFooter}>
            {children}
            {!acceptedNecessary && bannerOpen && <CookieBanner closeBanner={closeBanner} />}
          </div>
        </ThemeProvider>
      </>
    );
}

import React from "react";
import Head from "next/head";
import Header from "../general/Header";
import Footer from "../general/Footer";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import theme from "../../themes/theme";

const useStyles = makeStyles({
  root: {
    margin: 0,
    height: "100vh",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column"
  },
  noFlex: {
    flex: "none"
  }
});

export default function FixedHeightLayout({ title, children, loggedInUser }) {
  const classes = useStyles();

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <ThemeProvider theme={theme}>
        <div className={classes.root}>
          <Header noSpacingBottom className={classes.noFlex} loggedInUser={loggedInUser} />
          {children}
          <Footer noSpacingTop noAbsolutePosition className={classes.noFlex} />
        </div>
      </ThemeProvider>
    </>
  );
}

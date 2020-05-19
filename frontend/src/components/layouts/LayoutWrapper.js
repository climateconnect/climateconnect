import React from "react";
import Head from "next/head";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  leaveSpaceForFooter: {
    position: "relative",
    //height of footer + spacing(1)
    paddingBottom: theme.spacing(9),
    minHeight: "100vh"
  }
}));

export default function LayoutWrapper({ title, children, theme }) {
  const classes = useStyles();
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
        <div className={classes.leaveSpaceForFooter}>{children}</div>
      </ThemeProvider>
    </>
  );
}

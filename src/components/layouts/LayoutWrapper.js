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

export default function Layout({ title, children, theme }) {
  const classes = useStyles();

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <ThemeProvider theme={theme}>
        <div className={classes.leaveSpaceForFooter}>{children}</div>
      </ThemeProvider>
    </>
  );
}

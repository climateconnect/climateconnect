import React from "react";
import Head from "next/head";
import Header from "../general/Header";
import Footer from "../general/Footer";
import { Container, Typography } from "@material-ui/core";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import theme from "../../theme";

const useStyles = makeStyles(theme => ({
  mainHeading: {
    textAlign: "center",
    margin: `${theme.spacing(4)}px 0`
  }
}));

export default function Layout({ title, children }) {
  const classes = useStyles();

  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider theme={theme}>
        <Header />
        <Container maxWidth="lg" component="main">
          <Container maxWidth="sm">
            <Typography variant="h1" className={classes.mainHeading}>
              {title}
            </Typography>
          </Container>
          {children}
        </Container>
        <Footer />
      </ThemeProvider>
    </>
  );
}

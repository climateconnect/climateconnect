import React from "react";
import Head from "next/head";
import Header from "../general/Header";
import Footer from "../general/Footer";
import { Container, Typography } from "@material-ui/core";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import theme from "../../themes/aboutTheme";

const useStyles = makeStyles({
  mainHeading: {
    textAlign: "center",
    marginTop: -16
  },
  main: {
    padding: 0
  }
});

export default function Layout({ title, children }) {
  const classes = useStyles();

  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.11.2/css/all.css"
          integrity="sha384-KA6wR/X5RY4zFAHpv/CnoG2UW1uogYfdnP67Uv7eULvTveboZJg0qUpmJZb5VqzN"
          crossOrigin="anonymous"
        />
      </Head>
      <ThemeProvider theme={theme}>
        <Header />
        <Container maxWidth={false} component="main" className={classes.main}>
          <Container maxWidth={false}>
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

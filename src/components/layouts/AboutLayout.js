import React from "react";
import Header from "../general/Header";
import Footer from "../general/Footer";
import { Container } from "@material-ui/core";
import { makeStyles, ThemeProvider } from "@material-ui/core/styles";
import aboutTheme from "../../themes/aboutTheme";

const useStyles = makeStyles({
  main: {
    padding: 0,
    marginTop: -16
  }
});

export default function AboutLayout({ children }) {
  const classes = useStyles();

  return (
    <>
      <ThemeProvider theme={aboutTheme}>
        <Header />
        <Container
          maxWidth={false}
          component="main"
          className={`${classes.main} ${classes.directlyUnderHeader}`}
        >
          {children}
        </Container>
        <Footer />
      </ThemeProvider>
    </>
  );
}

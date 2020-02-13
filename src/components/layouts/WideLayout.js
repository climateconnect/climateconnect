import React from "react";
import Header from "../general/Header";
import Footer from "../general/Footer";
import { Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import aboutTheme from "../../themes/aboutTheme";
import LayoutWrapper from "./LayoutWrapper";

const useStyles = makeStyles(theme => ({
  main: {
    padding: 0,
    marginTop: -16,
    marginBottom: theme.spacing(6)
  }
}));

//This layout is used for pages, where we want to use the whole width of the page.
export default function WideLayout({ children, title }) {
  const classes = useStyles();

  return (
    <LayoutWrapper theme={aboutTheme} title={title}>
      <Header />
      <Container maxWidth={false} component="main" className={classes.main}>
        {children}
      </Container>
      <Footer />
    </LayoutWrapper>
  );
}

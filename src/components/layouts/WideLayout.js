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

export default function WideLayout({ children, title, loggedInUser }) {
  const classes = useStyles();

  return (
    <LayoutWrapper theme={aboutTheme} title={title}>
      <Header loggedInUser={loggedInUser} />
      <Container maxWidth={false} component="main" className={classes.main}>
        {children}
      </Container>
      <Footer />
    </LayoutWrapper>
  );
}

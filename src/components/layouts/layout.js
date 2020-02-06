import React from "react";
import Header from "../general/Header";
import Footer from "../general/Footer";
import { Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import LayoutWrapper from "./LayoutWrapper";
import theme from "../../themes/theme";

const useStyles = makeStyles(theme => ({
  mainHeading: {
    textAlign: "center",
    margin: `${theme.spacing(4)}px 0`
  }
}));

export default function Layout({ title, children }) {
  const classes = useStyles();

  return (
    <LayoutWrapper theme={theme}>
      <Header />
      <Container maxWidth="lg" component="main">
        <Container maxWidth="sm">
          <Typography component="h1" variant="h5" className={classes.mainHeading}>
            {title}
          </Typography>
        </Container>
        {children}
      </Container>
      <Footer />
    </LayoutWrapper>
  );
}

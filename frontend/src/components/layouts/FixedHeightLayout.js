import React from "react";
import Header from "../general/Header";
import Footer from "../general/Footer";
import { makeStyles } from "@material-ui/core/styles";
import theme from "../../themes/theme";
import LayoutWrapper from "./LayoutWrapper";

const useStyles = makeStyles({
  root: {
    margin: 0,
    height: "calc(100vh)",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column"
  },
  noFlex: {
    flex: "none"
  }
});

export default function FixedHeightLayout({ title, children }) {
  const classes = useStyles();

  return (
    <LayoutWrapper theme={theme} title={title} fixedHeight>
      <div className={classes.root}>
        <Header noSpacingBottom className={classes.noFlex} />
        {children}
        <Footer noSpacingTop noAbsolutePosition className={classes.noFlex} />
      </div>
    </LayoutWrapper>
  );
}

import React from "react";
import Header from "../general/Header";
import Footer from "../general/Footer";
import { Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import LayoutWrapper from "./LayoutWrapper";
import theme from "../../themes/theme";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles(theme => ({
  mainHeading: {
    textAlign: "center",
    margin: `${theme.spacing(4)}px 0`
  },
  alert: {
    width: "100%",
    marginTop: -16
  }
}));

export default function Layout({
  title,
  hideHeadline,
  noSpacingBottom,
  children,
  message,
  messageType
}) {
  const classes = useStyles();
  const [alertOpen, setAlertOpen] = React.useState(true);
  return (
    <LayoutWrapper theme={theme} title={title}>
      <Header noSpacingBottom={noSpacingBottom} />
      <Container maxWidth="lg" component="main">
        {message && alertOpen && (
          <Alert
            className={classes.alert}
            severity={messageType ? messageType : "success"}
            onClose={() => {
              setAlertOpen(false);
            }}
          >
            {message}
          </Alert>
        )}
        <Container maxWidth="sm">
          {!hideHeadline && (
            <Typography component="h1" variant="h5" className={classes.mainHeading}>
              {title}
            </Typography>
          )}
        </Container>
        {children}
      </Container>
      <Footer />
    </LayoutWrapper>
  );
}

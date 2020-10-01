import React from "react";
import Header from "../general/Header";
import Footer from "../general/Footer";
import { Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import aboutTheme from "../../themes/aboutTheme";
import LayoutWrapper from "./LayoutWrapper";
import Alert from "@material-ui/lab/Alert";
import LoadingContainer from "../general/LoadingContainer";

const useStyles = makeStyles(theme => ({
  main: {
    padding: 0,
    marginTop: -16,
    marginBottom: theme.spacing(6)
  },
  alert: {
    textAlign: "center",
    maxWidth: 1280,
    margin: "0 auto"
  }
}));

export default function WideLayout({
  children,
  title,
  message,
  messageType,
  isLoading,
  isStaticPage
}) {
  const classes = useStyles();
  const [alertOpen, setAlertOpen] = React.useState(true);

  return (
    <LayoutWrapper theme={aboutTheme} title={title}>
      <Header isStaticPage={isStaticPage} />
      {isLoading ? (
        <LoadingContainer headerHeight={113} footerHeight={80} />
      ) : (
        <Container maxWidth={false} component="main" className={classes.main}>
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
          {children}
        </Container>
      )}
      <Footer />
    </LayoutWrapper>
  );
}

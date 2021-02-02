import React, { useEffect } from "react";
import Header from "../general/Header";
import Footer from "../general/Footer";
import { Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import LayoutWrapper from "./LayoutWrapper";
import theme from "../../themes/theme";
import Alert from "@material-ui/lab/Alert";
import LoadingContainer from "../general/LoadingContainer";
import DonationCampaignInformation from "../staticpages/donate/DonationCampaignInformation";
import { getParams } from "../../../public/lib/generalOperations";
import { getMessageFromUrl } from "../../../public/lib/parsingOperations";

const useStyles = makeStyles((theme) => ({
  mainHeading: {
    textAlign: "center",
    margin: `${theme.spacing(4)}px 0`,
  },
  alert: {
    width: "100%",
    zIndex: 10,
  },
}));

export default function Layout({
  title,
  hideHeadline,
  noSpacingBottom,
  children,
  message,
  messageType,
  isLoading,
  isStaticPage,
}) {
  const classes = useStyles();
  const [hideAlertMessage, setHideAlertMessage] = React.useState(false);
  const [initialMessageType, setInitialMessageType] = React.useState(null);
  const [initialMessage, setInitialMessage] = React.useState("");
  useEffect(() => {
    const params = getParams(window.location.href);
    if (params.message) setInitialMessage(decodeURI(params.message));
    if (params.errorMessage) {
      setInitialMessage(decodeURI(params.errorMessage));
      setInitialMessageType("error");
    }
  }, []);
  return (
    <LayoutWrapper theme={theme} title={title}>
      <Header noSpacingBottom={noSpacingBottom} isStaticPage={isStaticPage} />
      {process.env.DONATION_CAMPAIGN_RUNNING === "true" && <DonationCampaignInformation />}
      {isLoading ? (
        <LoadingContainer headerHeight={113} footerHeight={80} />
      ) : (
        <Container maxWidth="lg" component="main">
          {(message || initialMessage) && !(hideAlertMessage === message) && (
            <Alert
              className={classes.alert}
              severity={
                messageType ? messageType : initialMessageType ? initialMessageType : "success"
              }
              onClose={() => {
                setHideAlertMessage(message);
              }}
            >
              {getMessageFromUrl(message ? message : initialMessage)}
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
      )}
      <Footer />
    </LayoutWrapper>
  );
}

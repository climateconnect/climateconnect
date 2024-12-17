import { Container, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Alert from "@mui/material/Alert";
import React, { useEffect } from "react";
import { getParams } from "../../../public/lib/generalOperations";
import { getMessageFromUrl } from "../../../public/lib/parsingOperations";
import theme from "../../themes/theme";
import Footer from "../footer/Footer";
import LoadingContainer from "../general/LoadingContainer";
import Header from "../header/Header";
import DonationCampaignInformation from "../staticpages/donate/DonationCampaignInformation";
import LayoutWrapper from "./LayoutWrapper";

const useStyles = makeStyles((theme) => ({
  main: {
    paddingBottom: theme.spacing(6),
  },

  mainHeading: {
    textAlign: "center",
    margin: `${theme.spacing(4)} 0`,
  },
  alert: () => ({
    width: "100%",
    zIndex: 100,
  }),
}));

export default function Layout({
  title,
  hideHeadline,
  children,
  message,
  messageType,
  isLoading,
  isStaticPage,
}: any) {
  const classes = useStyles({ donationCampaignRunning: process.env.DONATION_CAMPAIGN_RUNNING });
  const [hideAlertMessage, setHideAlertMessage] = React.useState(false);
  const [initialMessageType, setInitialMessageType] = React.useState(null as string | null);
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
      <Header noSpacingBottom isStaticPage={isStaticPage} />
      {<DonationCampaignInformation />}
      {isLoading ? (
        <LoadingContainer headerHeight={113} footerHeight={80} />
      ) : (
        <Container component="main" className={classes.main}>
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
          <Container maxWidth="lg" component="main">
            <Container maxWidth="sm">
              {!hideHeadline && (
                <Typography component="h1" variant="h5" className={classes.mainHeading}>
                  {title}
                </Typography>
              )}
            </Container>
            {children}
          </Container>
        </Container>
      )}
      <Footer />
    </LayoutWrapper>
  );
}

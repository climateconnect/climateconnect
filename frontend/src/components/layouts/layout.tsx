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
//We are ignoring the "missing" devlink import because it will be there at runtime
//You will need to run 'npx webflow devlink sync' to generate this file.
//If you do not have access to an API key you can line out.
// @ts-ignore
import { DevLinkProvider } from "../../../devlink/DevLinkProvider";

const useStyles = makeStyles((theme) => ({
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
    <DevLinkProvider>
      <LayoutWrapper theme={theme} title={title}>
        <Header noSpacingBottom isStaticPage={isStaticPage} />
        {<DonationCampaignInformation />}
        {isLoading ? (
          <LoadingContainer headerHeight={113} footerHeight={80} />
        ) : (
          <>
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
          </>
        )}
        <Footer />
      </LayoutWrapper>
    </DevLinkProvider>
  );
}

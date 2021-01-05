import React, { useEffect } from "react";
import Header from "../general/Header";
import Footer from "../general/Footer";
import { Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import LayoutWrapper from "./LayoutWrapper";
import Alert from "@material-ui/lab/Alert";
import LoadingContainer from "../general/LoadingContainer";
import DonationCampaignInformation from "../staticpages/donate/DonationCampaignInformation";
import { getParams } from "../../../public/lib/generalOperations";
import { getMessageFromUrl } from "../../../public/lib/parsingOperations";

const useStyles = makeStyles((theme) => ({
  main: (props) => ({
    padding: 0,
    marginTop: props.isStaticPage ? 0 : -16,
    marginBottom: props.noSpaceBottom ? 0 : theme.spacing(6),
  }),
  alert: {
    textAlign: "center",
    maxWidth: 1280,
    margin: "0 auto",
  },
}));

export default function WideLayout({
  children,
  title,
  message,
  messageType,
  isLoading,
  fixedHeader,
  transparentHeader,
  isStaticPage,
  noFeedbackButton, //don't display the fixed feedback button on the right border of the screen. Can be useful on mobile
  noSpaceBottom, //display the footer directly under the content without any margin
  showOnScrollUp, //display the footer when scrolling up, used for "inifinite scroll" pages
  largeFooter,
  description,
  landingPage,
  headerBackground,
  subHeader,
}) {
  const classes = useStyles({ noSpaceBottom: noSpaceBottom, isStaticPage: isStaticPage });
  const [alertOpen, setAlertOpen] = React.useState(true);
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
    <LayoutWrapper
      title={title}
      noFeedbackButton={noFeedbackButton}
      noSpaceForFooter={noSpaceBottom}
      description={description}
    >
      <Header
        isStaticPage={isStaticPage}
        fixedHeader={fixedHeader}
        transparentHeader={transparentHeader}
        noSpacingBottom={isStaticPage}
        background={headerBackground}
      />
      {isLoading ? (
        <LoadingContainer headerHeight={113} footerHeight={80} />
      ) : (
        <Container maxWidth={false} component="main" className={classes.main}>
          {(message || initialMessage) && alertOpen && (
            <Alert
              className={classes.alert}
              severity={
                messageType ? messageType : initialMessageType ? initialMessageType : "success"
              }
              onClose={() => {
                setAlertOpen(false);
              }}
            >
              {getMessageFromUrl(message ? message : initialMessage)}
            </Alert>
          )}
          {subHeader && subHeader}
          {!fixedHeader && process.env.DONATION_CAMPAIGN_RUNNING === "true" && !landingPage && <DonationCampaignInformation />}
          {children}
        </Container>
      )}
      <Footer
        noSpacingTop={noSpaceBottom}
        noAbsolutePosition={noSpaceBottom}
        showOnScrollUp={showOnScrollUp}
        large={isStaticPage || largeFooter}
      />
    </LayoutWrapper>
  );
}

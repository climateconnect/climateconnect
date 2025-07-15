import { Container, Theme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Alert from "@mui/material/Alert";
import React, { useContext, useEffect, useState } from "react";
import { getParams } from "../../../public/lib/generalOperations";
import { getMessageFromUrl } from "../../../public/lib/parsingOperations";
import theme from "../../themes/theme";
import Footer from "../footer/Footer";
import LoadingContainer from "../general/LoadingContainer";
import Header from "../header/Header";
import ElementSpaceToTop from "../hooks/ElementSpaceToTop";
import DonationCampaignInformation from "../staticpages/donate/DonationCampaignInformation";
import LayoutWrapper from "./LayoutWrapper";
import { CustomBackground } from "../hub/CustomBackground";

type ThemeProps = { noSpaceBottom?: boolean; isStaticPage?: boolean };
const useStyles = makeStyles<Theme, ThemeProps>((theme) => ({
  main: (props) => ({
    padding: 0,
    marginTop: props.isStaticPage ? 0 : -16,
    marginBottom: props.noSpaceBottom ? 0 : theme.spacing(6),
  }),
  alert: {
    textAlign: "center",
    margin: "0 auto",
    zIndex: 100,
    maxWidth: 1280,
  },
  alertFixed: {
    top: 0,
    position: "fixed",
    width: "100%",
    [theme.breakpoints.up("lg")]: {
      left: "50%",
      marginLeft: -640,
    },
  },
}));

type Props = {
  children?: React.ReactNode | undefined;
  title?: string;
  message?: string;
  messageType?: string;
  isLoading?: boolean;
  fixedHeader?: boolean;
  transparentHeader?: boolean;
  isStaticPage?: boolean;
  noFeedbackButton?: boolean;
  noSpaceBottom?: boolean;
  showOnScrollUp?: boolean;
  largeFooter?: boolean;
  description?: string;
  landingPage?: boolean;
  headerBackground?: string;
  subHeader?: JSX.Element;
  image?: string;
  useFloodStdFont?: boolean;
  rootClassName?: string;
  hideFooter?: boolean;
  resetAlertMessage?: () => void;
  isHubPage?: boolean;
  hubUrl?: string;
  hideDonationCampaign?: boolean;
  customFooterImage?: string;
  isLocationHub?: boolean;
  noHeader?: boolean;
  footerTextColor?: string;
  customTheme?: any;
  hideAlert?: boolean;
  transparentBackgroundColor?: string;
  hasHubLandingPage?: boolean;
  isLandingPage?: boolean;
  showDonationGoal?: boolean;
};
//Wrapper layout component for pages where the content takes the whole width of the screen
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
  image,
  useFloodStdFont,
  rootClassName,
  hideFooter,
  resetAlertMessage,
  isHubPage,
  hubUrl,
  isLocationHub,
  hideDonationCampaign,
  customFooterImage,
  noHeader,
  footerTextColor,
  customTheme,
  hideAlert,
  isLandingPage,
  hasHubLandingPage,
  showDonationGoal,
}: Props) {
  const classes = useStyles({ noSpaceBottom: noSpaceBottom, isStaticPage: isStaticPage });
  const [alertOpen, setAlertOpen] = React.useState(hideAlert ? false : true);
  const [initialMessageType, setInitialMessageType] = React.useState(null as any);
  const [initialMessage, setInitialMessage] = React.useState("");
  const [alertEl, setAlertEl] = React.useState(null);
  //Atm this is simply used to slide in the donation campaign banner after a certain timeout
  const [showDonationBanner, setShowDonationBanner] = useState(false);
  const spaceToTop = ElementSpaceToTop({ el: alertEl });

  useEffect(() => {
    const params = getParams(window.location.href);
    if (params.message) setInitialMessage(decodeURI(params.message));
    if (params.errorMessage) {
      setInitialMessage(decodeURI(params.errorMessage));
      setInitialMessageType("error");
    }
    setTimeout(() => {
      setShowDonationBanner(true);
    }, 3000);
  }, []);
  useEffect(() => {
    !hideAlert && setAlertOpen(true);
  }, [message]);

  return (
    <LayoutWrapper
      title={title}
      noFeedbackButton={noFeedbackButton}
      noSpaceForFooter={noSpaceBottom}
      description={description}
      useFloodStdFont={useFloodStdFont}
      theme={customTheme ?? theme}
      image={image}
    >
      <CustomBackground hubUrl={hubUrl} />

      {!noHeader && (
        <Header
          isStaticPage={isStaticPage}
          fixedHeader={fixedHeader}
          transparentHeader={transparentHeader}
          noSpacingBottom={isStaticPage}
          background={headerBackground}
          isHubPage={isHubPage}
          hubUrl={hubUrl}
          isLocationHub={isLocationHub}
          hasHubLandingPage={hasHubLandingPage}
          isLandingPage={isLandingPage}
        />
      )}
      {isLoading ? (
        <LoadingContainer headerHeight={113} footerHeight={80} />
      ) : (
        <Container maxWidth={false} component="main" className={`${classes.main} ${rootClassName}`}>
          {(message || initialMessage) && alertOpen && (
            <Alert
              className={`
                ${classes.alert}
                ${spaceToTop.screen! <= 0 && spaceToTop.page! >= 98 && classes.alertFixed}
              `}
              severity={
                (messageType
                  ? messageType
                  : initialMessageType
                  ? initialMessageType
                  : "success") as any
              }
              ref={(node: any) => {
                if (node) {
                  setAlertEl(node);
                }
              }}
              onClose={() => {
                resetAlertMessage && resetAlertMessage();
                setAlertOpen(false);
              }}
            >
              {getMessageFromUrl(message ? message : initialMessage)}
            </Alert>
          )}
          {subHeader && subHeader}
          {!fixedHeader && showDonationGoal && <DonationCampaignInformation />}
          {children}
        </Container>
      )}
      {!hideFooter && (
        <Footer
          noSpacingTop={noSpaceBottom}
          noAbsolutePosition={noSpaceBottom}
          showOnScrollUp={showOnScrollUp}
          large={isStaticPage || largeFooter}
          customFooterImage={customFooterImage}
          textColor={footerTextColor}
        />
      )}
    </LayoutWrapper>
  );
}

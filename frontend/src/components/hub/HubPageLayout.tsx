import React, { useContext, useEffect, useRef, useState } from "react";
import { Container, Theme, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import WideLayout from "../layouts/WideLayout";
import HubHeaderImage from "./HubHeaderImage";
import HubContent from "./HubContent";
import HubTabsNavigation from "./HubTabsNavigation";
import HubSupporters from "./HubSupporters";
import HubLinkButton from "./HubLinkButton";
import DonationCampaignInformation from "../staticpages/donate/DonationCampaignInformation";
import { FabShareButton } from "./FabShareButton";
import MobileBottomMenu from "../browse/MobileBottomMenu";
import { getImageUrl } from "../../../public/lib/imageOperations";
import { getHubAmbassadorData, getHubSupportersData } from "../../../public/lib/getHubData";
import isLocationHubLikeHub from "../../../public/lib/isLocationHubLikeHub";
import { transformThemeData } from "../../themes/transformThemeData";
import hubTheme from "../../themes/hubTheme";
import getTexts from "../../../public/texts/texts";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => ({
  linkedHubsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    gap: theme.spacing(1),
  },
  linkedHubsContainerMobile: {
    display: "flex",
    flexDirection: "row",
    overflowX: "auto",
    gap: theme.spacing(2),
    padding: theme.spacing(2, 0),
    marginBottom: theme.spacing(2),
  },
  subHubInfoText: {
    fontStyle: "italic",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    textAlign: "left" as const,
  },
}));

type HubPageLayoutProps = {
  children: React.ReactNode;
  activeTab: number;
  TYPES_BY_TAB_VALUE: string[];
  handleTabChange: (_event: React.SyntheticEvent, _newValue: number) => void;
  hubUrl: string;
  subHubSegment?: string;
  linkedHubs?: any[];
  hubAmbassador?: any;
  hubSupporters?: any;
  hubData?: any;
  hubThemeData?: any;
  allHubs?: any[];
  isLocationHub?: boolean;
};

export default function HubPageLayout({
  children,
  activeTab,
  TYPES_BY_TAB_VALUE,
  handleTabChange,
  hubUrl,
  subHubSegment,
  linkedHubs,
  hubAmbassador: initialAmbassador,
  hubSupporters: initialSupporters,
  hubData,
  hubThemeData,
  allHubs,
  isLocationHub: isLocationHubProp,
}: HubPageLayoutProps) {
  const { locale, CUSTOM_HUB_URLS } = useContext(UserContext);
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const classes = useStyles();
  const texts = getTexts({ page: "hub", locale: locale, hubName: hubData?.name });
  const customTheme = hubThemeData ? transformThemeData(hubThemeData) : undefined;
  const contentRef = useRef<HTMLDivElement>(null);

  const isLocationHub =
    isLocationHubProp ?? isLocationHubLikeHub(hubData?.hub_type, hubData?.parent_hub);
  const isCustomHub = CUSTOM_HUB_URLS?.includes(hubUrl);
  const [hubAmbassador, setHubAmbassador] = useState(initialAmbassador || null);
  const [hubSupporters, setHubSupporters] = useState(initialSupporters || null);

  const browseTabTypes = TYPES_BY_TAB_VALUE.filter((t) => t !== "events");

  useEffect(() => {
    if (initialAmbassador !== undefined) return;
    (async () => {
      const ambassador = await getHubAmbassadorData(hubUrl, locale);
      setHubAmbassador(ambassador);
      if (isLocationHub) {
        const supporters = await getHubSupportersData(hubUrl, locale);
        setHubSupporters(supporters);
      }
    })();
  }, [hubUrl, locale]);

  const type_names: Record<string, string> = {
    projects: texts.projects,
    organizations: isNarrowScreen ? texts.orgs : texts.organizations,
    members: texts.members,
  };

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <WideLayout
      title={hubData?.headline ?? undefined}
      hideAlert
      headerBackground={
        customTheme ? customTheme.palette.header.background : hubTheme.palette.background.default
      }
      image={hubData?.image ? getImageUrl(hubData.image) : undefined}
      isHubPage
      hubUrl={hubUrl}
      customFooterImage={
        hubData?.custom_footer_image ? getImageUrl(hubData.custom_footer_image) : undefined
      }
      customTheme={customTheme}
      hasHubLandingPage={hubData?.landing_page_component ? true : false}
    >
      <DonationCampaignInformation hubUrl={hubUrl} />
      {!isLocationHub && (
        <HubHeaderImage
          image={hubData?.image ? getImageUrl(hubData.image) : undefined}
          source={hubData?.image_attribution}
          isLocationHub={isLocationHub}
        />
      )}
      <HubContent
        headline={hubData?.headline}
        hubAmbassador={hubAmbassador}
        hubSupporters={hubSupporters}
        quickInfo={hubData?.quick_info}
        statBoxTitle={hubData?.stat_box_title}
        stats={hubData?.stats}
        scrollToSolutions={scrollToContent}
        subHeadline={hubData?.sub_headline}
        welcomeMessageLoggedIn={hubData?.welcome_message_logged_in}
        welcomeMessageLoggedOut={hubData?.welcome_message_logged_out}
        isLocationHub={isLocationHub}
        hubData={hubData}
        hubUrl={hubUrl}
        image={hubData?.image ? getImageUrl(hubData.image) : undefined}
      />
      <HubTabsNavigation
        TYPES_BY_TAB_VALUE={browseTabTypes}
        tabValue={activeTab}
        handleTabChange={handleTabChange}
        type_names={type_names}
        hubUrl={hubUrl}
        className=""
        allHubs={allHubs}
        fromPage="hub"
        subHubSegment={subHubSegment}
      />
      <div ref={contentRef}>
        <Container maxWidth="lg">
          {isNarrowScreen && hubSupporters && (
            <HubSupporters supportersList={hubSupporters} hubName={hubData?.name} hubUrl={hubUrl} />
          )}
          {isNarrowScreen && linkedHubs && linkedHubs.length > 0 && (
            <div className={classes.linkedHubsContainerMobile}>
              {linkedHubs.map((linkedHub: any) => (
                <HubLinkButton key={linkedHub.hubUrl} hub={linkedHub} />
              ))}
            </div>
          )}
          {!isNarrowScreen && linkedHubs && linkedHubs.length > 0 && (
            <div className={classes.linkedHubsContainer}>
              {linkedHubs.map((linkedHub: any) => (
                <HubLinkButton key={linkedHub.hubUrl} hub={linkedHub} />
              ))}
            </div>
          )}
          {hubData?.parent_hub && (
            <div className={classes.subHubInfoText}>{texts.you_are_seeing_projects_related_to}</div>
          )}
          {children}
        </Container>
      </div>
      {isNarrowScreen && (
        <MobileBottomMenu
          tabValue={activeTab}
          handleTabChange={handleTabChange}
          TYPES_BY_TAB_VALUE={TYPES_BY_TAB_VALUE}
          hubAmbassador={hubAmbassador}
        />
      )}
      {isNarrowScreen && (
        <FabShareButton locale={locale} hubAmbassador={hubAmbassador} isCustomHub={isCustomHub} />
      )}
    </WideLayout>
  );
}

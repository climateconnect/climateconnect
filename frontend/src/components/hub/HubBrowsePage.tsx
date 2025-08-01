import { useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import parseHtml from "html-react-parser";
import Head from "next/head";
import { useContext, useEffect, useRef, useState } from "react";
import Cookies from "universal-cookie";
import {
  getOrganizationTagsOptions,
  getProjectTagsOptions,
  getProjectTypeOptions,
  getSkillsOptions,
  getSectorOptions,
} from "../../../public/lib/getOptions";
import { extractHubUrlsFromContext, getAllHubs } from "../../../public/lib/hubOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import { getLocationFilteredBy } from "../../../public/lib/locationOperations";
import getTexts from "../../../public/texts/texts";
import BrowseContent from "../browse/BrowseContent";
import UserContext from "../context/UserContext";
import BrowseExplainer from "./BrowseExplainer";
import HubContent from "./HubContent";
import HubHeaderImage from "./HubHeaderImage";
import NavigationSubHeader from "./NavigationSubHeader";
import WideLayout from "../layouts/WideLayout";
import DonationCampaignInformation from "../staticpages/donate/DonationCampaignInformation";
import { Theme } from "@mui/material/styles";
import theme from "../../themes/hubTheme";
import BrowseContext from "../context/BrowseContext";
import { transformThemeData } from "../../themes/transformThemeData";
import getHubTheme from "../../themes/fetchHubTheme";
import isLocationHubLikeHub from "../../../public/lib/isLocationHubLikeHub";
import { FilterProvider } from "../provider/FilterProvider";
import {
  getHubAmbassadorData,
  getHubData,
  getHubSupportersData,
  getLinkedHubsData,
} from "../../../public/lib/getHubData";
import { retrieveDescriptionFromWebflow } from "../../utils/webflow";
import { HubDescription } from "./description/HubDescription";
import { FabShareButton } from "./FabShareButton";
import React from "react";

const useStyles = makeStyles((theme) => ({
  content: {
    position: "relative",
  },
}));

export interface HubBrowsePageProps {
  headline: string;
  hubUrl: string;
  subHubUrl: string;
  image_attribution: string;
  image: string;
  isLocationHub: boolean;
  name: string;
  quickInfo: any;
  statBoxTitle: string;
  stats: any;
  subHeadline: string;
  welcomeMessageLoggedIn: string;
  welcomeMessageLoggedOut: string;
  initialLocationFilter: any;
  filterChoices: any;
  allHubs: any[];
  hubLocation: any;
  hubData: any;
  hubDescription: any;
  projectTypes: any[];
  hubThemeData: any;
  linkedHubs: any[];
}

export async function getHubBrowseServerSideProps(ctx) {
  let hubUrl = ctx.query.hubUrl;
  let { subHub } = extractHubUrlsFromContext(ctx);

  if (subHub) {
    hubUrl = subHub;
  }

  const [
    hubData,
    organization_types,
    skills,
    location_filtered_by,
    allHubs,
    hubDescription,
    projectTypes,
    hubThemeData,
    linkedHubs,
    sectorOptions,
  ] = await Promise.all([
    getHubData(hubUrl, ctx.locale),
    getOrganizationTagsOptions(ctx.locale),
    getSkillsOptions(ctx.locale),
    getLocationFilteredBy(ctx.query),
    getAllHubs(ctx.locale, false),
    retrieveDescriptionFromWebflow(ctx.query, ctx.locale),
    getProjectTypeOptions(ctx.locale),
    getHubTheme(hubUrl),
    getLinkedHubsData(hubUrl),
    getSectorOptions(ctx.locale),
  ]);

  return {
    props: {
      hubUrl: ctx.query.hubUrl,
      subHubUrl: subHub || null,
      isLocationHub: isLocationHubLikeHub(hubData?.hub_type, hubData?.parent_hub),
      hubData: hubData,
      name: hubData?.name ?? null,
      headline: hubData?.headline ?? null,
      subHeadline: hubData?.sub_headline ?? null,
      welcomeMessageLoggedIn: hubData?.welcome_message_logged_in ?? null,
      welcomeMessageLoggedOut: hubData?.welcome_message_logged_out ?? null,
      image: hubData?.image ?? null,
      quickInfo: hubData?.quick_info ?? null,
      stats: hubData?.stats ?? null,
      statBoxTitle: hubData?.stat_box_title ?? null,
      image_attribution: hubData?.image_attribution ?? null,
      hubLocation: hubData?.location?.length > 0 ? hubData?.location[0] : null,
      filterChoices: {
        sectors: sectorOptions,
        organization_types: organization_types,
        skills: skills,
      },
      initialLocationFilter: location_filtered_by,
      sectorHubs: allHubs ? allHubs.filter((h) => h?.hub_type === "sector hub") : null,
      allHubs: allHubs,
      hubDescription: hubDescription,
      projectTypes: projectTypes,
      hubThemeData: hubThemeData,
      linkedHubs: linkedHubs || [],
    },
  };
}

export default function HubBrowsePage({
  headline,
  hubUrl,
  subHubUrl,
  image_attribution,
  image,
  isLocationHub,
  name,
  quickInfo,
  statBoxTitle,
  stats,
  subHeadline,
  welcomeMessageLoggedIn,
  welcomeMessageLoggedOut,
  initialLocationFilter,
  filterChoices,
  allHubs,
  hubLocation,
  hubData,
  hubDescription,
  projectTypes,
  hubThemeData,
  linkedHubs,
}: HubBrowsePageProps) {
  // donationGoal was removed in PR #1560?
  const { locale, CUSTOM_HUB_URLS, donationGoal } = useContext(UserContext);
  const isCustomHub = CUSTOM_HUB_URLS.includes(hubUrl);
  const classes = useStyles();
  const texts = getTexts({ page: "hub", locale: locale, hubName: name });
  const token = new Cookies().get("auth_token");
  const [hubAmbassador, setHubAmbassador] = useState(null);
  const [hubSupporters, setHubSupporters] = useState(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // Do we need this? this line was removed on PR ##1560
  const donationGoalActive = donationGoal && donationGoal.hub === hubUrl;
  const customTheme = hubThemeData ? transformThemeData(hubThemeData) : undefined;

  useEffect(() => {
    (async () => {
      const retrievedHubAmbassador = await getHubAmbassadorData(subHubUrl ? subHubUrl : hubUrl, locale);
      setHubAmbassador(retrievedHubAmbassador);
      if (isLocationHub) {
        const retrivedHubSupporters = await getHubSupportersData(hubUrl, locale);
        setHubSupporters(retrivedHubSupporters);
      }
    })();
  }, [hubUrl, subHubUrl, locale]);

  const isSmallScreen = useMediaQuery<Theme>(theme.breakpoints.down("md"));

  //Refs and state for tutorial
  const [requestTabNavigation, tabNavigationRequested] = useState("foo");

  const navRequested = (tabKey) => {
    tabNavigationRequested(tabKey);
  };

  const scrollToSolutions = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const customSearchBarLabels = {
    projects: isLocationHub
      ? texts.search_projects_in_location
      : texts.search_for_solutions_in_sector,
    organizations: isLocationHub
      ? texts.search_organization_in_location
      : texts.search_for_organizations_in_sector,
    members: isLocationHub
      ? texts.search_profiles_in_location
      : texts.search_for_climate_actors_in_sector,
    profiles: texts.search_profiles_in_location,
  };

  const closeHubHeaderImage = (e) => {
    e.preventDefault();
    console.log("closing hub header image");
  };

  const contextValues = {
    projectTypes: projectTypes,
  };

  return (
    <>
      {hubDescription && hubDescription.headContent && (
        <Head>{parseHtml(hubDescription.headContent)}</Head>
      )}
      <WideLayout
        title={headline}
        hideAlert
        headerBackground={
          customTheme ? customTheme.palette.header.background : theme.palette.background.default
        }
        image={getImageUrl(image)}
        isHubPage
        hubUrl={hubUrl}
        customFooterImage={
          hubData?.custom_footer_image && getImageUrl(hubData?.custom_footer_image)
        }
        isLocationHub={isLocationHub}
        customTheme={customTheme}
        hasHubLandingPage={hubData?.landing_page_component ? true : false}
      >
        <div className={classes.content}>
          {/* donationGoalActive was removed on PR #1560  */}
          {donationGoalActive && <DonationCampaignInformation />}
          {!isLocationHub && (
            <NavigationSubHeader
              type={"hub"}
              hubName={name}
              allHubs={allHubs}
              isLocationHub={isLocationHub}
              hubUrl={hubUrl}
              navigationRequested={navRequested}
            />
          )}
          {!isLocationHub && (
            <HubHeaderImage
              image={getImageUrl(image)}
              source={image_attribution}
              onClose={closeHubHeaderImage}
              isLocationHub={isLocationHub} // TODO: needed?
              statBoxTitle={statBoxTitle}
              stats={stats}
            />
          )}
          <HubContent
            headline={headline}
            hubAmbassador={hubAmbassador}
            hubSupporters={hubSupporters}
            quickInfo={quickInfo}
            statBoxTitle={statBoxTitle}
            stats={stats}
            scrollToSolutions={scrollToSolutions}
            detailledInfo={
              hubDescription?.bodyContent ? (
                <div dangerouslySetInnerHTML={{ __html: hubDescription.bodyContent }} />
              ) : (
                <HubDescription hub={hubUrl} texts={texts} />
              )
            }
            hubUrl={hubUrl}
            subHeadline={subHeadline}
            welcomeMessageLoggedIn={welcomeMessageLoggedIn}
            welcomeMessageLoggedOut={welcomeMessageLoggedOut}
            isLocationHub={isLocationHub}
            location={hubLocation}
            hubData={hubData}
            image={getImageUrl(image)}
          />
          {!isLocationHub && <BrowseExplainer />}
          <BrowseContext.Provider value={contextValues}>
            <FilterProvider
              filterChoices={filterChoices}
              initialLocationFilter={initialLocationFilter}
              locale={locale}
              token={token}
              hubUrl={subHubUrl || hubUrl}
            >
              <BrowseContent
                contentRef={contentRef}
                customSearchBarLabels={customSearchBarLabels}
                hubAmbassador={hubAmbassador}
                filterChoices={filterChoices}
                hideMembers={!isLocationHub}
                hubName={name}
                initialLocationFilter={initialLocationFilter}
                allHubs={allHubs}
                hubData={hubData}
                hubUrl={hubUrl}
                hubSupporters={hubSupporters}
                linkedHubs={linkedHubs}
              />
            </FilterProvider>
          </BrowseContext.Provider>
        </div>
        {isSmallScreen && (
          <FabShareButton
            locale={locale}
            hubAmbassador={hubAmbassador}
            isCustomHub={isCustomHub}
            hubUrl={hubUrl}
          />
        )}
      </WideLayout>
    </>
  );
}

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
} from "../../../../public/lib/getOptions";
import { getAllHubs } from "../../../../public/lib/hubOperations";
import { getImageUrl } from "../../../../public/lib/imageOperations";
import { getLocationFilteredBy } from "../../../../public/lib/locationOperations";
import getTexts from "../../../../public/texts/texts";
import BrowseContent from "../../../../src/components/browse/BrowseContent";
import UserContext from "../../../../src/components/context/UserContext";
import HubContent from "../../../../src/components/hub/HubContent";
import WideLayout from "../../../../src/components/layouts/WideLayout";
import DonationCampaignInformation from "../../../../src/components/staticpages/donate/DonationCampaignInformation";
import { Theme } from "@mui/material/styles";
import theme from "../../../../src/themes/hubTheme";
import BrowseContext from "../../../../src/components/context/BrowseContext";
import { transformThemeData } from "../../../../src/themes/transformThemeData";
import getHubTheme from "../../../../src/themes/fetchHubTheme";
import { FilterProvider } from "../../../../src/components/provider/FilterProvider";
import { retrieveDescriptionFromWebflow } from "../../../../src/utils/webflow";
import { HubDescription } from "../../../../src/components/hub/description/HubDescription";
import { FabShareButton } from "../../../../src/components/hub/FabShareButton";
import {
  getHubAmbassadorData,
  getHubData,
  getHubSupportersData,
} from "../../../../public/lib/getHubData";

const useStyles = makeStyles((theme) => ({
  content: {
    position: "relative",
  },
}));

export async function getServerSideProps(ctx) {
  const parentUrl = ctx.query.hubUrl;
  const subHub = ctx.query.subHub;
  const hubUrl = subHub ? `${parentUrl}_${subHub}` : parentUrl;

  const [
    hubData,
    project_categories,
    organization_types,
    skills,
    location_filtered_by,
    allHubs,
    hubDescription,
    projectTypes,
    hubThemeData,
  ] = await Promise.all([
    getHubData(hubUrl, ctx.locale),
    getProjectTagsOptions(hubUrl, ctx.locale),
    getOrganizationTagsOptions(ctx.locale),
    getSkillsOptions(ctx.locale),
    getLocationFilteredBy(ctx.query),
    getAllHubs(ctx.locale, false),
    retrieveDescriptionFromWebflow(ctx.query, ctx.locale),
    getProjectTypeOptions(ctx.locale),
    getHubTheme(hubUrl),
  ]);
  return {
    props: {
      hubUrl: hubUrl,
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
      hubLocation: hubData?.location?.length > 0 ? hubData.location[0] : null,
      filterChoices: {
        project_categories: project_categories,
        organization_types: organization_types,
        skills: skills,
      },
      initialLocationFilter: location_filtered_by,
      sectorHubs: allHubs ? allHubs.filter((h) => h?.hub_type === "sector hub") : null,
      allHubs: allHubs,
      hubDescription: hubDescription,
      projectTypes: projectTypes,
      hubThemeData: hubThemeData,
    },
  };
}

// TODO: refactor this component so that the code of it and the /hubs/[hubUrl]/browse.tsx
// is not duplicated
export default function Hub({
  headline,
  hubUrl,
  image,
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
}) {
  const { locale, CUSTOM_HUB_URLS } = useContext(UserContext);
  const isCustomHub = CUSTOM_HUB_URLS.includes(hubUrl);
  const classes = useStyles();
  const texts = getTexts({ page: "hub", locale: locale, hubName: name });
  const token = new Cookies().get("auth_token");
  const [hubAmbassador, setHubAmbassador] = useState(null);
  const [hubSupporters, setHubSupporters] = useState(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const retrievedHubAmbassador = await getHubAmbassadorData(hubUrl, locale);
      setHubAmbassador(retrievedHubAmbassador);

      const retrivedHubSupporters = await getHubSupportersData(hubUrl, locale);
      setHubSupporters(retrivedHubSupporters);
    })();
  }, [locale]);

  const isSmallScreen = useMediaQuery<Theme>(theme.breakpoints.down("md"));

  //Refs and state for tutorial
  const [requestTabNavigation, tabNavigationRequested] = useState("foo");

  const scrollToSolutions = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const customSearchBarLabels = {
    projects: texts.search_projects_in_location,
    organizations: texts.search_organization_in_location,
    members: texts.search_profiles_in_location,
    profiles: texts.search_profiles_in_location,
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
        headerBackground={hubUrl === "prio1" ? "#7883ff" : "#FFF"}
        image={getImageUrl(image)}
        isHubPage
        hubUrl={hubUrl}
        hideDonationCampaign
        customFooterImage={
          hubData?.custom_footer_image && getImageUrl(hubData?.custom_footer_image)
        }
        customTheme={hubThemeData ? transformThemeData(hubThemeData) : undefined}
        hasHubLandingPage={hubData?.landing_page_component ? true : false}
      >
        <div className={classes.content}>
          {<DonationCampaignInformation />}
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
            isLocationHub={true}
            location={hubLocation}
            hubData={hubData}
            image={getImageUrl(image)}
          />
          <BrowseContext.Provider value={contextValues}>
            <FilterProvider
              filterChoices={filterChoices}
              initialLocationFilter={initialLocationFilter}
              locale={locale}
              token={token}
              hubUrl={hubUrl}
            >
              <BrowseContent
                contentRef={contentRef}
                customSearchBarLabels={customSearchBarLabels}
                hubAmbassador={hubAmbassador}
                filterChoices={filterChoices}
                hideMembers={false}
                hubName={name}
                initialLocationFilter={initialLocationFilter}
                // TODO: is this still needed?
                // initialOrganizations={initialOrganizations}
                // initialProjects={initialProjects}
                allHubs={allHubs}
                hubLocation={hubLocation}
                hubData={hubData}
                hubUrl={hubUrl}
                tabNavigationRequested={requestTabNavigation}
                hubSupporters={hubSupporters}
                isLocationHub={true}
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

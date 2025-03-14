import { Fab, Typography, useMediaQuery } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import parseHtml from "html-react-parser";
import Head from "next/head";
import React, { useContext, useEffect, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { apiRequest, getLocalePrefix } from "../../public/lib/apiOperations";
import { applyNewFilters, getInitialFilters } from "../../public/lib/filterOperations";
import {
  getOrganizationTagsOptions,
  getProjectTagsOptions,
  getProjectTypeOptions,
  getSkillsOptions,
  getStatusOptions,
} from "../../public/lib/getOptions";
import { getAllHubs } from "../../public/lib/hubOperations";
import { getImageUrl } from "../../public/lib/imageOperations";
import { getLocationFilteredBy } from "../../public/lib/locationOperations";
import getTexts from "../../public/texts/texts";
import BrowseContent from "../../src/components/browse/BrowseContent";
import UserContext from "../../src/components/context/UserContext";
import BrowseExplainer from "../../src/components/hub/BrowseExplainer";
import FashionDescription from "../../src/components/hub/description/FashionDescription";
import FoodDescription from "../../src/components/hub/description/FoodDescription";
import HubContent from "../../src/components/hub/HubContent";
import HubHeaderImage from "../../src/components/hub/HubHeaderImage";
import NavigationSubHeader from "../../src/components/hub/NavigationSubHeader";
import WideLayout from "../../src/components/layouts/WideLayout";
import DonationCampaignInformation from "../../src/components/staticpages/donate/DonationCampaignInformation";
import { retrievePage } from "../../src/utils/webflow";
import AddIcon from "@mui/icons-material/Add";
import { Theme } from "@mui/material/styles";
import theme from "../../src/themes/hubTheme";
import BrowseContext from "../../src/components/context/BrowseContext";
import { transformThemeData } from "../../src/themes/transformThemeData";
import getHubTheme from "../../src/themes/fetchHubTheme";
import isLocationHubLikeHub from "../../public/lib/isLocationHubLikeHub";

const useStyles = makeStyles((theme) => ({
  moreInfoSoon: {
    fontWeight: 600,
    maxWidth: 800,
    marginTop: theme.spacing(2),
    textAlign: "center",
  },
  content: {
    position: "relative",
  },
}));

type ShareProjectMakeStyleProps = {
  isCustomHub: boolean;
};

const shareProjectFabStyle = makeStyles((theme) => ({
  fabShareProject: (props: ShareProjectMakeStyleProps) => ({
    position: "fixed",
    background: props.isCustomHub
      ? theme.palette.background.default_contrastText
      : theme.palette.primary.light,
    color: props.isCustomHub ? theme.palette.background.default : "default",
    // bottom: theme.spacing(5),
    right: theme.spacing(3),
  }),
}));

const DESCRIPTION_WEBFLOW_LINKS = {
  energy: {
    en: "energy-en",
    de: "energie-de",
  },
  mobility: {
    de: "mobilitat-de",
    en: "mobility-en",
  },
  biodiversity: {
    de: "biodiversitat",
    en: "biodiversity-en",
  },
  landuse: {
    de: "landuse-de",
    en: "landuse-en",
  },
};

//potentially switch back to getinitialprops here?!
export async function getServerSideProps(ctx) {
  const hubUrl = ctx.query.hubUrl;

  const [
    hubData,
    project_categories,
    organization_types,
    skills,
    project_statuses,
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
    getStatusOptions(ctx.locale),
    getLocationFilteredBy(ctx.query),
    getAllHubs(ctx.locale, false),
    retrieveDescriptionFromWebflow(ctx.query, ctx.locale),
    getProjectTypeOptions(ctx.locale),
    getHubTheme(hubUrl),
  ]);
  return {
    props: {
      hubUrl: hubUrl,
      isLocationHub: isLocationHubLikeHub(hubData?.hub_type),
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
      hubLocation: hubData?.location?.length > 0 ? hubData.location[0] : null,
      filterChoices: {
        project_categories: project_categories,
        organization_types: organization_types,
        skills: skills,
        project_statuses: project_statuses,
      },
      initialLocationFilter: location_filtered_by,
      sectorHubs: allHubs.filter((h) => h.hub_type === "sector hub"),
      allHubs: allHubs,
      hubDescription: hubDescription,
      projectTypes: projectTypes,
      hubThemeData: hubThemeData,
    },
  };
}

export default function Hub({
  headline,
  hubUrl,
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
}) {
  const { locale, CUSTOM_HUB_URLS } = useContext(UserContext);
  const isCustomHub = CUSTOM_HUB_URLS.includes(hubUrl);
  const classes = useStyles();
  const texts = getTexts({ page: "hub", locale: locale, hubName: name });
  const token = new Cookies().get("auth_token");
  const [hubAmbassador, setHubAmbassador] = useState(null);
  const [hubSupporters, setHubSupporters] = useState(null);

  // Initialize filters. We use one set of filters for all tabs (projects, organizations, members)
  const [filters, setFilters] = useState(
    getInitialFilters({
      filterChoices: filterChoices,
      locale: locale,
      initialLocationFilter: initialLocationFilter,
    })
  );
  const [tabsWhereFiltersWereApplied, setTabsWhereFiltersWereApplied] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const handleSetErrorMessage = (newMessage) => {
    setErrorMessage(newMessage);
  };
  const contentRef = useRef(null);

  useEffect(() => {
    (async () => {
      const retrievedHubAmbassador = await getHubAmbassadorData(hubUrl, locale);
      setHubAmbassador(retrievedHubAmbassador);
      if (isLocationHub) {
        const retrivedHubSupporters = await getHubSupportersData(hubUrl, locale);
        setHubSupporters(retrivedHubSupporters);
      }
    })();
  }, []);

  const isSmallScreen = useMediaQuery<Theme>(theme.breakpoints.down("md"));

  //Refs and state for tutorial
  const [requestTabNavigation, tabNavigationRequested] = useState("foo");

  const navRequested = (tabKey) => {
    tabNavigationRequested(tabKey);
  };

  const scrollToSolutions = () => {
    contentRef.current.scrollIntoView({ behavior: "smooth" });
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

  const handleAddFilters = (newFilters) => {
    setFilters({ ...filters, ...newFilters });
  };

  const handleSetTabsWhereFiltersWereApplied = (tabs) => {
    setTabsWhereFiltersWereApplied(tabs);
  };

  const handleApplyNewFilters = async ({ type, newFilters, closeFilters, nonFilterParams }) => {
    return await applyNewFilters({
      type: type,
      filters: filters,
      newFilters: newFilters,
      closeFilters: closeFilters,
      filterChoices: filterChoices,
      locale: locale,
      token: token,
      handleAddFilters: handleAddFilters,
      handleSetErrorMessage: handleSetErrorMessage,
      tabsWhereFiltersWereApplied: tabsWhereFiltersWereApplied,
      handleSetTabsWhereFiltersWereApplied: handleSetTabsWhereFiltersWereApplied,
      hubUrl: hubUrl,
    });
  };

  const closeHubHeaderImage = (e) => {
    e.preventDefault();
    console.log("closing hub header image");
  };

  const handleUpdateFilterValues = (valuesToUpdate) => {
    setFilters({
      ...filters,
      ...valuesToUpdate,
    });
  };

  const contextValues = {
    projectTypes: projectTypes,
  };
  const currentTheme = hubThemeData ? transformThemeData(hubThemeData) : theme;

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
        isLocationHub={isLocationHub}
        customTheme={hubThemeData ? transformThemeData(hubThemeData) : undefined}
      >
        <div className={classes.content}>
          {<DonationCampaignInformation />}
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
              isLocationHub={isLocationHub}
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
            allHubs={allHubs}
            hubData={hubData}
            image={getImageUrl(image)}
            source={image_attribution}
          />
          {!isLocationHub && <BrowseExplainer />}
          <BrowseContext.Provider value={contextValues}>
            <BrowseContent
              applyNewFilters={handleApplyNewFilters}
              contentRef={contentRef}
              customSearchBarLabels={customSearchBarLabels}
              errorMessage={errorMessage}
              hubAmbassador={hubAmbassador}
              filters={filters}
              handleUpdateFilterValues={handleUpdateFilterValues}
              filterChoices={filterChoices}
              handleSetErrorMessage={handleSetErrorMessage}
              hideMembers={!isLocationHub}
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
            />
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

const FabShareButton = ({ locale, hubAmbassador, isCustomHub, hubUrl }) => {
  const fabClass = shareProjectFabStyle({ isCustomHub: isCustomHub });
  const queryString = hubUrl ? `?hub=${hubUrl}` : "";
  return (
    <Fab
      className={fabClass.fabShareProject}
      size="medium"
      color="primary"
      href={`${getLocalePrefix(locale)}/share${queryString}`}
      sx={{ bottom: (theme) => (hubAmbassador ? theme.spacing(11.5) : theme.spacing(5)) }}
      // onClick={}
    >
      <AddIcon />
    </Fab>
  );
};

const HubDescription = ({ hub, texts }) => {
  const classes = useStyles();
  if (hub === "food") return <FoodDescription />;
  if (hub === "fashion") return <FashionDescription />;
  return (
    <Typography className={classes.moreInfoSoon}>
      {texts.more_info_about_hub_coming_soon}
    </Typography>
  );
};

const WEBFLOW_BASE_LINK = "https://climateconnect.webflow.io/hub-texts/";

const retrieveDescriptionFromWebflow = async (query, locale) => {
  if (
    DESCRIPTION_WEBFLOW_LINKS[query?.hubUrl] &&
    DESCRIPTION_WEBFLOW_LINKS[query?.hubUrl][locale]
  ) {
    const props = await retrievePage(
      WEBFLOW_BASE_LINK + DESCRIPTION_WEBFLOW_LINKS[query.hubUrl][locale]
    );
    return props;
  }
  return null;
};

const getHubData = async (url_slug, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/hubs/${url_slug}/`,
      locale: locale,
    });
    return resp.data;
  } catch (err: any) {
    if (err.response && err.response.data) {
      console.log(err.response.data);
      console.error("Error in getHubData!: " + err.response.data.detail);
    }
    return null;
  }
};

const getHubAmbassadorData = async (url_slug, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/hubs/${url_slug}/ambassador/`,
      locale: locale,
    });
    return resp.data;
  } catch (err: any) {
    if (err.response && err.response.data)
      console.log("Error in getHubAmbassadorData: " + err.response.data.detail);
    console.log(err);
    return null;
  }
};
const getHubSupportersData = async (url_slug, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/hubs/${url_slug}/supporters/`,
      locale: locale,
    });
    return resp.data;
  } catch (err: any) {
    //Don't log an error if there simply are no supporters for this hub
    if (err?.response?.status === 404) {
      return null;
    }
    if (err.response && err.response.data)
      console.log("Error in getHubSupportersData: " + err.response.data.detail);
    console.log(err);
    return null;
  }
};

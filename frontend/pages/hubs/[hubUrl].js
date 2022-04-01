import { makeStyles, Typography } from "@material-ui/core";
import parseHtml from "html-react-parser";
import Head from "next/head";
import React, { useContext, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { apiRequest } from "../../public/lib/apiOperations";
import { applyNewFilters, getInitialFilters } from "../../public/lib/filterOperations";
import {
  getOrganizationTagsOptions,
  getProjectTagsOptions,
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

const useStyles = makeStyles((theme) => ({
  contentRefContainer: {
    paddingTop: theme.spacing(4),
    position: "relative",
    [theme.breakpoints.down("sm")]: {
      paddingTop: theme.spacing(1),
    },
  },
  contentUnderHeader: {
    marginTop: 112,
  },
  contentRef: {
    position: "absolute",
    top: -90,
  },
  moreInfoSoon: {
    fontWeight: 600,
    marginTop: theme.spacing(2),
    textAlign: "center",
  },
}));

const DESCRIPTION_WEBFLOW_LINKS = {
  energy: {
    en: "energy-hub",
  },
};

//potentially switch back to getinitialprops here?!
export async function getServerSideProps(ctx) {
  const hubUrl = ctx.query.hubUrl;
  const ideaToOpen = ctx.query.idea;

  const [
    hubData,
    project_categories,
    organization_types,
    skills,
    project_statuses,
    location_filtered_by,
    allHubs,
    hubDescription,
  ] = await Promise.all([
    getHubData(hubUrl, ctx.locale),
    getProjectTagsOptions(hubUrl, ctx.locale),
    getOrganizationTagsOptions(ctx.locale),
    getSkillsOptions(ctx.locale),
    getStatusOptions(ctx.locale),
    getLocationFilteredBy(ctx.query),
    getAllHubs(ctx.locale, false),
    retrieveDescriptionFromWebflow(ctx.query, ctx.locale),
  ]);

  return {
    props: {
      hubUrl: hubUrl,
      isLocationHub: hubData.hub_type === "location hub",
      hubData: hubData,
      name: hubData.name,
      headline: hubData.headline,
      subHeadline: hubData.sub_headline,
      image: hubData.image,
      quickInfo: hubData.quick_info,
      stats: hubData.stats,
      statBoxTitle: hubData.stat_box_title,
      image_attribution: hubData.image_attribution,
      hubLocation: hubData.location?.length > 0 ? hubData.location[0] : null,
      filterChoices: {
        project_categories: project_categories,
        organization_types: organization_types,
        skills: skills,
        project_statuses: project_statuses,
      },
      initialLocationFilter: location_filtered_by,
      sectorHubs: allHubs.filter((h) => h.hub_type === "sector hub"),
      allHubs: allHubs,
      initialIdeaUrlSlug: ideaToOpen ? encodeURIComponent(ideaToOpen) : null,
      hubDescription: hubDescription,
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
  initialLocationFilter,
  filterChoices,
  sectorHubs,
  allHubs,
  initialIdeaUrlSlug,
  hubLocation,
  hubData,
  hubDescription,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale, hubName: name });
  const token = new Cookies().get("token");

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

  /*
   * When you share an idea through CreateIdeaDialog, you will be
   * redirected to the idea's board with the new idea open.
   * However this redirect does not reset state which is why we need
   * this function to make sure ideas are caught again after refreshing.
   * otherwise the idea's board will be empty.
   */
  const resetTabsWhereFiltersWereApplied = () => {
    setTabsWhereFiltersWereApplied([]);
  };

  //Refs and state for tutorial
  const hubQuickInfoRef = useRef(null);
  const hubProjectsButtonRef = useRef(null);
  const [nextStepTriggeredBy, setNextStepTriggeredBy] = useState(false);

  const scrollToSolutions = () => {
    setNextStepTriggeredBy("showProjectsButton");
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
    ideas: texts.search_ideas_in_location,
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
      idea: nonFilterParams?.idea,
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

  return (
    <>
      {hubDescription && hubDescription.headContent && (
        <Head>{parseHtml(hubDescription.headContent)}</Head>
      )}
      <WideLayout title={headline} fixedHeader headerBackground="#FFF" image={getImageUrl(image)}>
        <div className={classes.contentUnderHeader}>
          <NavigationSubHeader hubName={name} allHubs={allHubs} isLocationHub={isLocationHub} />
          {<DonationCampaignInformation />}
          <HubHeaderImage
            image={getImageUrl(image)}
            source={image_attribution}
            onClose={closeHubHeaderImage}
            isLocationHub={isLocationHub}
            statBoxTitle={statBoxTitle}
            stats={stats}
          />
          <HubContent
            hubQuickInfoRef={hubQuickInfoRef}
            headline={headline}
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
            hubProjectsButtonRef={hubProjectsButtonRef}
            isLocationHub={isLocationHub}
            location={hubLocation}
            allHubs={sectorHubs}
            hubData={hubData}
            hubName={name}
          />
          <div className={classes.contentRefContainer}>
            <div ref={contentRef} className={classes.contentRef} />
            {!isLocationHub && <BrowseExplainer />}
            <BrowseContent
              applyNewFilters={handleApplyNewFilters}
              customSearchBarLabels={customSearchBarLabels}
              errorMessage={errorMessage}
              filters={filters}
              handleUpdateFilterValues={handleUpdateFilterValues}
              filterChoices={filterChoices}
              handleSetErrorMessage={handleSetErrorMessage}
              hideMembers={!isLocationHub}
              hubName={name}
              hubProjectsButtonRef={hubProjectsButtonRef}
              hubQuickInfoRef={hubQuickInfoRef}
              initialLocationFilter={initialLocationFilter}
              // TODO: is this still needed?
              // initialOrganizations={initialOrganizations}
              // initialProjects={initialProjects}
              nextStepTriggeredBy={nextStepTriggeredBy}
              showIdeas={isLocationHub}
              allHubs={sectorHubs}
              initialIdeaUrlSlug={initialIdeaUrlSlug}
              hubLocation={hubLocation}
              hubData={hubData}
              resetTabsWhereFiltersWereApplied={resetTabsWhereFiltersWereApplied}
              hubUrl={hubUrl}
            />
          </div>
        </div>
      </WideLayout>
    </>
  );
}

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

const WEBFLOW_BASE_LINK = "https://climateconnect.webflow.io/";

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
  console.log("getting data for hub " + url_slug);
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/hubs/${url_slug}/`,
      locale: locale,
      shouldThrowError: true,
    });
    return resp.data;
  } catch (err) {
    if (err.response && err.response.data)
      console.log("Error in getHubData: " + err.response.data.detail);
    console.log(err);
    return null;
  }
};

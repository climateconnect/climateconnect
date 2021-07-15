import { makeStyles, Typography } from "@material-ui/core";
import React, { useContext, useRef, useState } from "react";
import Cookies from "universal-cookie";
import possibleFilters from "../../public/data/possibleFilters";
import { apiRequest } from "../../public/lib/apiOperations";
import { getUnaffectedTabs, hasDifferingValues } from "../../public/lib/filterOperations";
import {
  getOrganizationTagsOptions,
  getProjectTagsOptions,
  getSkillsOptions,
  getStatusOptions,
  membersWithAdditionalInfo,
} from "../../public/lib/getOptions";
import { getAllHubs } from "../../public/lib/hubOperations";
import { getImageUrl } from "../../public/lib/imageOperations";
import { getLocationFilteredBy } from "../../public/lib/locationOperations";
import {
  getInfoMetadataByType,
  getReducedPossibleFilters,
  parseData,
} from "../../public/lib/parsingOperations";
import { encodeQueryParamsFromFilters } from "../../public/lib/urlOperations";
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

const useStyles = makeStyles((theme) => ({
  contentRefContainer: {
    paddingTop: theme.spacing(4),
    position: "relative",
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

//potentially switch back to getinitialprops here?!
export async function getServerSideProps(ctx) {
  const hubUrl = ctx.query.hubUrl;
  const ideaToOpen = ctx.query.idea;
  const { token } = NextCookies(ctx);
  const [
    hubData,
    initialProjects,
    initialOrganizations,
    initialIdeas,
    project_categories,
    organization_types,
    skills,
    project_statuses,
    location_filtered_by,
    allHubs
  ] = await Promise.all([
    getHubData(hubUrl, ctx.locale),
    getProjects({ page: 1, token: token, hubUrl: hubUrl, locale: ctx.locale }),
    getOrganizations({ page: 1, token: token, hubUrl: hubUrl, locale: ctx.locale }),
    getIdeas({
      page: 1,
      token: token,
      hubUrl: hubUrl,
      locale: ctx.locale,
      urlEnding: ideaToOpen ? `&idea=${encodeURIComponent(ideaToOpen)}` : "",
    }),
    getProjectTagsOptions(hubUrl, ctx.locale),
    getOrganizationTagsOptions(ctx.locale),
    getSkillsOptions(ctx.locale),
    getStatusOptions(ctx.locale),
    getLocationFilteredBy(ctx.query),
    getAllHubs(ctx.locale, true),
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
      initialProjects: initialProjects,
      initialOrganizations: initialOrganizations,
      initialIdeas: initialIdeas,
      filterChoices: {
        project_categories: project_categories,
        organization_types: organization_types,
        skills: skills,
        project_statuses: project_statuses,
      },
      initialLocationFilter: location_filtered_by,
      allHubs,
      initialIdeaUrlSlug: ideaToOpen ? encodeURIComponent(ideaToOpen) : null,
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
  initialProjects,
  initialOrganizations,
  initialIdeas,
  allHubs,
  initialIdeaUrlSlug,
  hubLocation,
  hubData,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale, hubName: name });
  const token = new Cookies().get("token");

  const getInitialFilters = () => {
    return getReducedPossibleFilters(
      possibleFilters({ key: "all", filterChoices: filterChoices, locale: locale }),
      initialLocationFilter
    );
  };

  const [filters, setFilters] = useState(getInitialFilters());
  const [tabsWhereFiltersWereApplied, setTabsWhereFiltersWhereApplied] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const handleSetErrorMessage = (newMessage) => {
    setErrorMessage(newMessage);
  };
  const contentRef = useRef(null);

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
    profiles: texts.search_profiles_in_location,
    ideas: texts.search_ideas_in_location,
  };

  const loadMoreData = async (type, page, urlEnding) => {
    try {
      const newDataObject = await getDataFromServer({
        type: type,
        page: page,
        token: token,
        urlEnding: urlEnding,
        hubUrl: hubUrl,
        locale: locale,
      });
      const newData =
        type === "members" ? membersWithAdditionalInfo(newDataObject.members) : newDataObject[type];

      return {
        hasMore: newDataObject.hasMore,
        newData: newData,
      };
    } catch (e) {
      console.log("error");
      console.log(e);
      throw e;
    }
  };

  const applyNewFilters = async (type, newFilters, closeFilters) => {
    if (
      !hasDifferingValues({
        obj: filters,
        newObj: newFilters,
        type: type,
        filterChoices: filterChoices,
        locale: locale,
      }) &&
      tabsWhereFiltersWereApplied.includes(type)
    ) {
      return;
    }

    if (
      !hasDifferingValues({
        obj: filters,
        newObj: newFilters,
        type: type,
        filterChoices: filterChoices,
        locale: locale,
      })
    ) {
      setTabsWhereFiltersWhereApplied([...tabsWhereFiltersWereApplied, type]);
    } else {
      //If there was a change to the filters, we'll only remove the affected tabs from the tabs that were affected by the change
      //e.g. your cannot browse organizations by project category at the moment, so if you change this filter and then switch to the organizations tab
      //this should not trigger a reload of the organzations
      const unaffectedTabs = getUnaffectedTabs({
        tabs: tabsWhereFiltersWereApplied,
        filterChoices: filterChoices,
        locale: locale,
        filters: filters,
        newFilters: newFilters,
        type: type,
      });
      setTabsWhereFiltersWhereApplied([...unaffectedTabs, type]);
    }
    setFilters({ ...filters, ...newFilters });

    const newUrlEnding = encodeQueryParamsFromFilters({
      filters: newFilters,
      infoMetadata: getInfoMetadataByType(type, locale),
      filterChoices: filterChoices,
      locale: locale,
    });
    handleSetErrorMessage("");
    try {
      const filteredItemsObject = await getDataFromServer({
        type: type,
        page: 1,
        token: token,
        urlEnding: newUrlEnding,
        // TODO: This is the primary difference between the applyNewFilters logic
        // here locally in [hubUrl] and within browse.js -- we should deduplicate
        hubUrl: hubUrl,
        locale: locale,
      });

      if (type === "members") {
        filteredItemsObject.members = membersWithAdditionalInfo(filteredItemsObject.members);
      }

      return {
        closeFilters: closeFilters,
        filteredItemsObject: filteredItemsObject,
        newUrlEnding: newUrlEnding,
      };
    } catch (e) {
      console.log(e);
    }
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

  console.log(filters);

  return (
    <WideLayout title={headline} fixedHeader headerBackground="#FFF">
      <div className={classes.contentUnderHeader}>
        <NavigationSubHeader hubName={name} />
        {process.env.DONATION_CAMPAIGN_RUNNING === "true" && <DonationCampaignInformation />}
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
          detailledInfo={<HubDescription hub={hubUrl} texts={texts} />}
          subHeadline={subHeadline}
          hubProjectsButtonRef={hubProjectsButtonRef}
          isLocationHub={isLocationHub}
          location={hubLocation}
        />
        <div className={classes.contentRefContainer}>
          <div ref={contentRef} className={classes.contentRef} />
          {!isLocationHub && <BrowseExplainer />}
          <BrowseContent
            applyNewFilters={applyNewFilters}
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
            loadMoreData={loadMoreData}
            nextStepTriggeredBy={nextStepTriggeredBy}
            hubName={name}
            initialIdeas={initialIdeas}
            showIdeas={isLocationHub}
            allHubs={allHubs}
            initialIdeaUrlSlug={initialIdeaUrlSlug}
            hubLocation={hubLocation}
            hubData={hubData}
          />
        </div>
      </div>
    </WideLayout>
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

async function getIdeas({ page, token, urlEnding, hubUrl, locale }) {
  return await getDataFromServer({
    type: "ideas",
    page: page,
    token: token,
    urlEnding: urlEnding,
    hubUrl: hubUrl,
    locale: locale,
  });
}

async function getProjects({ page, token, urlEnding, hubUrl, locale }) {
  return await getDataFromServer({
    type: "projects",
    page: page,
    token: token,
    urlEnding: urlEnding,
    hubUrl: hubUrl,
    locale: locale,
  });
}

async function getOrganizations({ page, token, urlEnding, hubUrl, locale }) {
  return await getDataFromServer({
    type: "organizations",
    page: page,
    token: token,
    urlEnding: urlEnding,
    hubUrl: hubUrl,
    locale: locale,
  });
}

async function getMembers({ page, token, urlEnding, hubUrl, locale }) {
  return await getDataFromServer({
    type: "members",
    page: page,
    token: token,
    urlEnding: urlEnding,
    hubUrl: hubUrl,
    locale: locale,
  });
}

async function getDataFromServer({ type, page, token, urlEnding, hubUrl, locale }) {
  let url = `/api/${type}/?page=${page}&hub=${hubUrl}`;
  console.log(`getting ${type} data for category ${hubUrl}`);
  if (urlEnding) url += urlEnding;
  try {
    console.log(`Getting data for ${type} at ${url}`);
    const resp = await apiRequest({
      method: "get",
      url: url,
      token: token,
      locale: locale,
    });

    if (resp.data.length === 0) {
      console.log(`No data of type ${type} found...`);
      return null;
    } else {
      return {
        [type]: parseData({ type: type, data: resp.data.results }),
        hasMore: !!resp.data.next,
      };
    }
  } catch (err) {
    if (err.response && err.response.data) {
      console.log("Error: ");
      console.log(err.response.data);
    } else console.log(err);
    throw err;
  }
}

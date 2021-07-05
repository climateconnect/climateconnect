import { makeStyles, Typography } from "@material-ui/core";
import NextCookies from "next-cookies";
import React, { useContext, useEffect, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { apiRequest } from "../../public/lib/apiOperations";
import { buildUrlEndingFromFilters } from "../../public/lib/filterOperations";
import {
  getOrganizationTagsOptions,
  getProjectTagsOptions,
  getSkillsOptions,
  getStatusOptions,
  membersWithAdditionalInfo
} from "../../public/lib/getOptions";
import { getAllHubs } from "../../public/lib/hubOperations";
import { getImageUrl } from "../../public/lib/imageOperations";
import { parseData } from "../../public/lib/parsingOperations";
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
    allHubs,
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
      allHubs,
      initialIdeaUrlSlug: ideaToOpen ? encodeURIComponent(ideaToOpen) : null,
    },
  };
}

export default function Hub({
  hubUrl,
  name,
  statBoxTitle,
  headline,
  image,
  quickInfo,
  stats,
  initialProjects,
  initialOrganizations,
  initialIdeas,
  filterChoices,
  subHeadline,
  image_attribution,
  isLocationHub,
  allHubs,
  initialIdeaUrlSlug,
  hubLocation,
  hubData,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale, hubName: name });
  const token = new Cookies().get("token");
  const [filters, setFilters] = useState({
    projects: {},
    members: {},
    organizations: {},
  });
  const [errorMessage, setErrorMessage] = useState("");
  const handleSetErrorMessage = (newMessage) => {
    setErrorMessage(newMessage);
  };
  const contentRef = useRef(null);

  const [initialMembers, setInitialMembers] = useState(null);
  useEffect(async function () {
    if (isLocationHub) {
      setInitialMembers(
        await getMembers({ page: 1, token: token, hubUrl: hubUrl, locale: locale })
      );
    }
  }, []);

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

  const applyNewFilters = async (type, newFilters, closeFilters, oldUrlEnding) => {
    if (filters === newFilters) {
      return;
    }
    setFilters({ ...filters, [type]: newFilters });
    const newUrlEnding = buildUrlEndingFromFilters(newFilters);
    if (oldUrlEnding === newUrlEnding) {
      return null;
    }
    handleSetErrorMessage("");
    try {
      const filteredItemsObject = await getDataFromServer({
        type: type,
        page: 1,
        token: token,
        urlEnding: newUrlEnding,
        hubUrl: hubUrl,
        locale: locale,
      });
      if (type === "members") {
        filteredItemsObject.members = membersWithAdditionalInfo(filteredItemsObject.members);
      }
      console.log(filteredItemsObject);
      return {
        closeFilters: closeFilters,
        filteredItemsObject: filteredItemsObject,
        newUrlEnding: newUrlEnding,
      };
    } catch (e) {
      console.log(e);
    }
  };

  const applySearch = async (type, searchValue, oldUrlEnding) => {
    const newSearchQueryParam = `&search=${searchValue}`;
    console.log(newSearchQueryParam);
    if (oldUrlEnding === newSearchQueryParam) {
      console.log("it's the same!");
      return;
    }
    try {
      const filteredItemsObject = await getDataFromServer({
        type: type,
        page: 1,
        token: token,
        urlEnding: newSearchQueryParam,
        hubUrl: hubUrl,
        locale: locale,
      });
      if (type === "members") {
        filteredItemsObject.members = membersWithAdditionalInfo(filteredItemsObject.members);
      }
      return {
        filteredItemsObject: filteredItemsObject,
        newUrlEnding: newSearchQueryParam,
      };
    } catch (e) {
      console.log(e);
    }
  };

  const closeHubHeaderImage = (e) => {
    e.preventDefault();
    console.log("closing hub header image");
  };

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
            initialProjects={initialProjects}
            initialOrganizations={initialOrganizations}
            initialMembers={initialMembers}
            filterChoices={filterChoices}
            loadMoreData={loadMoreData}
            applyNewFilters={applyNewFilters}
            applySearch={applySearch}
            hideMembers={!isLocationHub}
            customSearchBarLabels={customSearchBarLabels}
            handleSetErrorMessage={handleSetErrorMessage}
            errorMessage={errorMessage}
            hubQuickInfoRef={hubQuickInfoRef}
            hubProjectsButtonRef={hubProjectsButtonRef}
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
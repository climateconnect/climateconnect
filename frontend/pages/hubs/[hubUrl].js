import { makeStyles, Typography } from "@material-ui/core";
import axios from "axios";
import NextCookies from "next-cookies";
import React, { useContext, useRef, useState } from "react";
import Cookies from "universal-cookie";
import tokenConfig from "../../public/config/tokenConfig";
import { buildUrlEndingFromFilters } from "../../public/lib/filterOperations";
import {
  getOrganizationTagsOptions,
  getProjectTagsOptions,
  getSkillsOptions,
  getStatusOptions,
  membersWithAdditionalInfo,
} from "../../public/lib/getOptions";
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

export async function getServerSideProps(ctx) {
  const hubUrl = ctx.query.hubUrl;
  const { token } = NextCookies(ctx);
  const [
    hubData,
    initialProjects,
    initialOrganizations,
    project_categories,
    organization_types,
    skills,
    project_statuses,
  ] = await Promise.all([
    getHubData(hubUrl),
    getProjects({ page: 1, token: token, hubUrl: hubUrl }),
    getOrganizations({ page: 1, token: token, hubUrl: hubUrl }),
    getProjectTagsOptions(hubUrl),
    getOrganizationTagsOptions(),
    getSkillsOptions(),
    getStatusOptions(),
  ]);
  return {
    props: {
      hubUrl: hubUrl,
      name: hubData.name,
      headline: hubData.headline,
      subHeadline: hubData.sub_headline,
      image: hubData.image,
      quickInfo: hubData.quick_info,
      stats: hubData.stats,
      statBoxTitle: hubData.stat_box_title,
      image_attribution: hubData.image_attribution,
      initialProjects: initialProjects,
      initialOrganizations: initialOrganizations,
      filterChoices: {
        project_categories: project_categories,
        organization_types: organization_types,
        skills: skills,
        project_statuses: project_statuses,
      },
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
  filterChoices,
  subHeadline,
  image_attribution,
}) {
  const classes = useStyles();
  const { locale } = useContext(UserContext);
  const texts = getTexts({ page: "hub", locale: locale });
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

  //Refs and state for tutorial
  const hubQuickInfoRef = useRef(null);
  const hubProjectsButtonRef = useRef(null);
  const [nextStepTriggeredBy, setNextStepTriggeredBy] = useState(false);

  const scrollToSolutions = () => {
    setNextStepTriggeredBy("showProjectsButton");
    contentRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const customSearchBarLabels = {
    projects: texts.search_for_solutions_in_sector,
    organizations: texts.search_for_organizations_in_sector,
  };

  const loadMoreData = async (type, page, urlEnding) => {
    try {
      const newDataObject = await getDataFromServer({
        type: type,
        page: page,
        token: token,
        urlEnding: urlEnding,
        hubUrl: hubUrl,
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

  return (
    <WideLayout title={headline} fixedHeader headerBackground="#FFF">
      <div className={classes.contentUnderHeader}>
        <NavigationSubHeader hubName={name} />
        {process.env.DONATION_CAMPAIGN_RUNNING === "true" && <DonationCampaignInformation />}
        <HubHeaderImage image={getImageUrl(image)} source={image_attribution} />
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
        />
        <div className={classes.contentRefContainer}>
          <div ref={contentRef} className={classes.contentRef} />
          <BrowseExplainer />
          <BrowseContent
            initialProjects={initialProjects}
            initialOrganizations={initialOrganizations}
            filterChoices={filterChoices}
            loadMoreData={loadMoreData}
            applyNewFilters={applyNewFilters}
            applySearch={applySearch}
            hideMembers
            customSearchBarLabels={customSearchBarLabels}
            handleSetErrorMessage={handleSetErrorMessage}
            errorMessage={errorMessage}
            hubQuickInfoRef={hubQuickInfoRef}
            hubProjectsButtonRef={hubProjectsButtonRef}
            nextStepTriggeredBy={nextStepTriggeredBy}
            hubName={name}
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

const getHubData = async (url_slug) => {
  console.log("getting data for hub " + url_slug);
  try {
    const resp = await axios.get(`${process.env.API_URL}/api/hubs/${url_slug}/`);
    return resp.data;
  } catch (err) {
    if (err.response && err.response.data)
      console.log("Error in getHubData: " + err.response.data.detail);
    console.log(err);
    return null;
  }
};

async function getProjects({ page, token, urlEnding, hubUrl }) {
  return await getDataFromServer({
    type: "projects",
    page: page,
    token: token,
    urlEnding: urlEnding,
    hubUrl: hubUrl,
  });
}

async function getOrganizations({ page, token, urlEnding, hubUrl }) {
  return await getDataFromServer({
    type: "organizations",
    page: page,
    token: token,
    urlEnding: urlEnding,
    hubUrl: hubUrl,
  });
}

async function getDataFromServer({ type, page, token, urlEnding, hubUrl }) {
  let url = `${process.env.API_URL}/api/${type}/?page=${page}&hub=${hubUrl}`;
  console.log(`getting ${type} data for category ${hubUrl}`);
  if (urlEnding) url += urlEnding;

  try {
    console.log(`Getting data for ${type} at ${url}`);
    const resp = await axios.get(url, tokenConfig(token));

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

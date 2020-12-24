import React, { useState, useRef } from "react";
import axios from "axios";
import NextCookies from "next-cookies";
import WideLayout from "../../src/components/layouts/WideLayout";
import NavigationSubHeader from "../../src/components/hub/NavigationSubHeader";
import HubHeaderImage from "../../src/components/hub/HubHeaderImage";
import HubContent from "../../src/components/hub/HubContent";
import tokenConfig from "../../public/config/tokenConfig";
import { parseData } from "../../public/lib/parsingOperations";
import {
  getProjectTagsOptions,
  getOrganizationTagsOptions,
  getSkillsOptions,
  getStatusOptions,
  membersWithAdditionalInfo,
} from "../../public/lib/getOptions";
import BrowseContent from "../../src/components/browse/BrowseContent";
import Cookies from "universal-cookie";
import FoodDescription from "../../src/components/hub/description/FoodDescription";
import BrowseExplainer from "../../src/components/hub/BrowseExplainer";
import { makeStyles, Typography } from "@material-ui/core";
import { getImageUrl } from "../../public/lib/imageOperations";
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
}) {
  console.log(statBoxTitle);
  const classes = useStyles();
  const token = new Cookies().get("token");
  const [filters, setFilters] = useState({
    projects: {},
    members: {},
    organizations: {},
  });
  const contentRef = useRef(null);
  const scrollToSolutions = () => contentRef.current.scrollIntoView({ behavior: "smooth" });

  const customSearchBarLabels = {
    projects: "Search for climate solutions in the food sector",
    organizations: "Search for climate organizations in the food sector",
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
    <WideLayout header={headline} fixedHeader headerBackground="#FFF">
      <div className={classes.contentUnderHeader}>
        <NavigationSubHeader hubName={name} />
        {process.env.DONATION_CAMPAIGN_RUNNING && <DonationCampaignInformation />}
        <HubHeaderImage image={getImageUrl(image)} />
        <HubContent
          headline={headline}
          quickInfo={quickInfo}
          statBoxTitle={statBoxTitle}
          stats={stats}
          scrollToSolutions={scrollToSolutions}
          detailledInfo={<HubDescription hub={hubUrl} />}
          subHeadline={subHeadline}
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
          />
        </div>
      </div>
    </WideLayout>
  );
}

const HubDescription = ({ hub }) => {
  const classes = useStyles();
  if (hub === "food") return <FoodDescription />;
  return (
    <Typography className={classes.moreInfoSoon}>
      More Info coming soon! Have a look at the projects and solutions submitted by Climate Connect
      users below!
    </Typography>
  );
};

const buildUrlEndingFromFilters = (filters) => {
  let url = "&";
  Object.keys(filters).map((filterKey) => {
    if (filters[filterKey] && filters[filterKey].length > 0) {
      if (Array.isArray(filters[filterKey]))
        url += encodeURI(filterKey + "=" + filters[filterKey].join()) + "&";
      else url += encodeURI(filterKey + "=" + filters[filterKey] + "&");
    }
  });
  return url;
};

Hub.getInitialProps = async (ctx) => {
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
    hubUrl: hubUrl,
    name: hubData.name,
    headline: hubData.headline,
    subHeadline: hubData.sub_headline,
    image: hubData.image,
    quickInfo: hubData.quick_info,
    stats: hubData.stats,
    statBoxTitle: hubData.stat_box_title,
    initialProjects: initialProjects,
    initialOrganizations: initialOrganizations,
    filterChoices: {
      project_categories: project_categories,
      organization_types: organization_types,
      skills: skills,
      project_statuses: project_statuses,
    },
  };
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

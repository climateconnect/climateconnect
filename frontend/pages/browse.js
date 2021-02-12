import React, { useState } from "react";
import NextCookies from "next-cookies";
import { useRouter } from "next/router";
import axios from "axios";

import {
  getSkillsOptions,
  getStatusOptions,
  getProjectTagsOptions,
  getOrganizationTagsOptions,
  membersWithAdditionalInfo,
} from "../public/lib/getOptions";

import { buildUrlEndingFromFilters } from "../public/lib/urlParsing";
import tokenConfig from "../public/config/tokenConfig";

import WideLayout from "../src/components/layouts/WideLayout";
import MainHeadingContainerMobile from "../src/components/indexPage/MainHeadingContainerMobile";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import TopOfPage from "../src/components/hooks/TopOfPage";
import BrowseContent from "../src/components/browse/BrowseContent";
import { parseData } from "../public/lib/parsingOperations";
import HubsSubHeader from "../src/components/indexPage/HubsSubHeader";

export default function Browse({
  projectsObject,
  organizationsObject,
  membersObject,
  token,
  filterChoices,
  hubs,
}) {
  const [filters, setFilters] = useState({
    projects: {},
    members: {},
    organizations: {},
  });

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

  const applySearch = async (type, searchValue, oldUrlEnding) => {
    const newSearchQueryParam = `&search=${searchValue}`;
    if (oldUrlEnding === newSearchQueryParam) {
      return;
    }
    try {
      const filteredItemsObject = await getDataFromServer({
        type: type,
        page: 1,
        token: token,
        urlEnding: newSearchQueryParam,
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

  const loadMoreData = async (type, page, urlEnding) => {
    try {
      const newDataObject = await getDataFromServer({
        type: type,
        page: page,
        token: token,
        urlEnding: urlEnding,
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

  const isScrollingUp = !useScrollTrigger({
    disableHysteresis: false,
    threshold: 0,
  });
  const atTopOfPage = TopOfPage({ initTopOfPage: true });
  const showOnScrollUp = isScrollingUp && !atTopOfPage;

  /**
   * Support the functionality of a user entering
   * a provided URL, that already has URL encoded
   * query params from a filter in it. In this use
   * case, we should automatically set the filters
   * dynamically.
   */
  const router = useRouter();
  if (router.query) {
    // Apply new filters with the query object immediately:
    // applyNewFilters
  }

  return (
    <>
      <WideLayout
        title="Global Platform for Climate Change Solutions"
        hideHeadline
        showOnScrollUp={showOnScrollUp}
        subHeader={<HubsSubHeader hubs={hubs} />}
      >
        <MainHeadingContainerMobile />
        <BrowseContent
          initialProjects={projectsObject}
          initialOrganizations={organizationsObject}
          initialMembers={membersObject}
          applyNewFilters={applyNewFilters}
          filterChoices={filterChoices}
          loadMoreData={loadMoreData}
          applySearch={applySearch}
        />
      </WideLayout>
    </>
  );
}

Browse.getInitialProps = async (ctx) => {
  const { token, hideInfo } = NextCookies(ctx);
  const [
    projectsObject,
    organizationsObject,
    membersObject,
    project_categories,
    organization_types,
    skills,
    project_statuses,
    hubs,
  ] = await Promise.all([
    getProjects(1, token),
    getOrganizations(1, token),
    getMembers(1, token),
    getProjectTagsOptions(),
    getOrganizationTagsOptions(),
    getSkillsOptions(),
    getStatusOptions(),
    getHubs(),
  ]);
  return {
    projectsObject: projectsObject,
    organizationsObject: organizationsObject,
    membersObject: membersObject,
    token: token,
    filterChoices: {
      project_categories: project_categories,
      organization_types: organization_types,
      skills: skills,
      project_statuses: project_statuses,
    },
    hideInfo: hideInfo === "true",
    hubs: hubs,
  };
};

async function getProjects(page, token, urlEnding) {
  return await getDataFromServer({
    type: "projects",
    page: page,
    token: token,
    urlEnding: urlEnding,
  });
}

async function getOrganizations(page, token, urlEnding) {
  return await getDataFromServer({
    type: "organizations",
    page: page,
    token: token,
    urlEnding: urlEnding,
  });
}

async function getMembers(page, token, urlEnding) {
  return await getDataFromServer({
    type: "members",
    page: page,
    token: token,
    urlEnding: urlEnding,
  });
}

async function getDataFromServer({ type, page, token, urlEnding }) {
  let url = `${process.env.API_URL}/api/${type}/?page=${page}`;
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

async function getHubs() {
  try {
    const resp = await axios.get(`${process.env.API_URL}/api/hubs/`);
    return resp.data.results;
  } catch (e) {
    console.log(e);
  }
}

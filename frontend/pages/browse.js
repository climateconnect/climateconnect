// 3rd party or built-in imports
import NextCookies from "next-cookies";
import React, { useRef, useState, useContext } from "react";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";

// Relative imports
import { apiRequest } from "../public/lib/apiOperations";
import {
  getOrganizationTagsOptions,
  getProjectTagsOptions,
  getSkillsOptions,
  getStatusOptions,
  membersWithAdditionalInfo,
} from "../public/lib/getOptions";
import { encodeQueryParamsFromFilters } from "../public/lib/urlOperations";
import { nullifyUndefinedValues } from "../public/lib/profileOperations";
import { parseData } from "../public/lib/parsingOperations";
import BrowseContent from "../src/components/browse/BrowseContent";
import HubsSubHeader from "../src/components/indexPage/HubsSubHeader";
import MainHeadingContainerMobile from "../src/components/indexPage/MainHeadingContainerMobile";
import TopOfPage from "../src/components/hooks/TopOfPage";
import UserContext from "../src/components/context/UserContext";
import WideLayout from "../src/components/layouts/WideLayout";

export async function getServerSideProps(ctx) {
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
    getProjects(1, token, "", ctx.locale),
    getOrganizations(1, token, "", ctx.locale),
    getMembers(1, token, "", ctx.locale),
    getProjectTagsOptions(null, ctx.locale),
    getOrganizationTagsOptions(ctx.locale),
    getSkillsOptions(ctx.locale),
    getStatusOptions(ctx.locale),
    getHubs(ctx.locale),
  ]);
  return {
    props: nullifyUndefinedValues({
      projectsObject: projectsObject,
      organizationsObject: organizationsObject,
      membersObject: membersObject,
      token: token ? token : null,
      filterChoices: {
        project_categories: project_categories,
        organization_types: organization_types,
        skills: skills,
        project_statuses: project_statuses,
      },
      hideInfo: hideInfo === "true",
      hubs: hubs,
    }),
  };
}

export default function Browse({
  projectsObject,
  organizationsObject,
  membersObject,
  token,
  filterChoices,
  hubs,
}) {
  const { locale } = useContext(UserContext);

  // Initialize filters
  const [filters, setFilters] = useState({
    projects: {},
    members: {},
    organizations: {},
  });
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Fetches data from the server based on the newly provided
   * filters. Returns an object with the new filter data, as well
   * as other options.
   *
   * @param {string} type one of "projects", "members", "organizations"
   * @param {Object} newFilters something like {"location": "", status: [], etc... }
   * @param {boolean} closeFilters
   * @param {string} oldUrlEnding previous end of URL through the query param
   */
  const applyNewFilters = async (type, newFilters, closeFilters, oldUrlEnding) => {
    // Don't fetch data again if the filters are equivalent
    if (filters === newFilters) {
      return;
    }

    setFilters({ ...filters, [type]: newFilters });

    const newUrlEnding = encodeQueryParamsFromFilters(newFilters);
    if (oldUrlEnding === newUrlEnding) {
      return null;
    }

    setErrorMessage(null);

    try {
      const filteredItemsObject = await getDataFromServer({
        type: type,
        page: 1,
        token: token,
        urlEnding: newUrlEnding,
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

  // In browse.js, work on parsing the query param filter and visually updating the filters
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

  const loadMoreData = async (type, page, urlEnding) => {
    try {
      const newDataObject = await getDataFromServer({
        type: type,
        page: page,
        token: token,
        urlEnding: urlEnding,
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

  const isScrollingUp = !useScrollTrigger({
    disableHysteresis: false,
    threshold: 0,
  });
  const atTopOfPage = TopOfPage({ initTopOfPage: true });
  const showOnScrollUp = isScrollingUp && !atTopOfPage;

  const handleSetErrorMessage = (newMessage) => {
    setErrorMessage(newMessage);
  };
  const hubsSubHeaderRef = useRef(null);
  return (
    <>
      <WideLayout
        hideHeadline
        showOnScrollUp={showOnScrollUp}
        subHeader={<HubsSubHeader hubs={hubs} subHeaderRef={hubsSubHeaderRef} />}
      >
        <MainHeadingContainerMobile />
        <BrowseContent
          applyNewFilters={applyNewFilters}
          applySearch={applySearch}
          errorMessage={errorMessage}
          filterChoices={filterChoices}
          handleSetErrorMessage={handleSetErrorMessage}
          hubsSubHeaderRef={hubsSubHeaderRef}
          initialMembers={membersObject}
          initialOrganizations={organizationsObject}
          initialProjects={projectsObject}
          loadMoreData={loadMoreData}
        />
      </WideLayout>
    </>
  );
}

async function getProjects(page, token, urlEnding, locale) {
  return await getDataFromServer({
    type: "projects",
    page: page,
    token: token,
    urlEnding: urlEnding,
    locale: locale,
  });
}

async function getOrganizations(page, token, urlEnding, locale) {
  return await getDataFromServer({
    type: "organizations",
    page: page,
    token: token,
    urlEnding: urlEnding,
    locale: locale,
  });
}

async function getMembers(page, token, urlEnding, locale) {
  return await getDataFromServer({
    type: "members",
    page: page,
    token: token,
    urlEnding: urlEnding,
    locale: locale,
  });
}

async function getDataFromServer({ type, page, token, urlEnding, locale }) {
  let url = `/api/${type}/?page=${page}`;

  // Handle query params as well
  if (urlEnding) {
    // &category=Lowering%20food%20waste&
    url += urlEnding;
  }

  try {
    console.log(`Getting data for ${type} at ${url}`);
    const resp = await apiRequest({ method: "get", url: url, token: token, locale: locale });
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

async function getHubs(locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/hubs/`,
      locale: locale,
    });
    return resp.data.results;
  } catch (e) {
    console.log(e);
  }
}

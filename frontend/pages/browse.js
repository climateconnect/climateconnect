import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import NextCookies from "next-cookies";
import React, { useContext, useRef, useState } from "react";
import { apiRequest } from "../public/lib/apiOperations";
import { buildUrlEndingFromFilters } from "../public/lib/filterOperations";
import {
  getOrganizationTagsOptions,
  getProjectTagsOptions,
  getSkillsOptions,
  getStatusOptions,
  membersWithAdditionalInfo
} from "../public/lib/getOptions";
import { parseData } from "../public/lib/parsingOperations";
import BrowseContent from "../src/components/browse/BrowseContent";
import UserContext from "../src/components/context/UserContext";
import TopOfPage from "../src/components/hooks/TopOfPage";
import HubsSubHeader from "../src/components/indexPage/HubsSubHeader";
import MainHeadingContainerMobile from "../src/components/indexPage/MainHeadingContainerMobile";
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
    props: {
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
    },
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
  const { locale } = useContext(UserContext)
  const [filters, setFilters] = useState({
    projects: {},
    members: {},
    organizations: {},
  });
  const [errorMessage, setErrorMessage] = useState("");

  const applyNewFilters = async (type, newFilters, closeFilters, oldUrlEnding) => {
    if (filters === newFilters) {
      return;
    }
    //todo: throw error if user didn't choose a location from the list
    setFilters({ ...filters, [type]: newFilters });
    const newUrlEnding = buildUrlEndingFromFilters(newFilters);
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
        locale: locale
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
        locale: locale
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
        locale: locale
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
          initialProjects={projectsObject}
          initialOrganizations={organizationsObject}
          initialMembers={membersObject}
          applyNewFilters={applyNewFilters}
          filterChoices={filterChoices}
          loadMoreData={loadMoreData}
          applySearch={applySearch}
          handleSetErrorMessage={handleSetErrorMessage}
          errorMessage={errorMessage}
          hubsSubHeaderRef={hubsSubHeaderRef}
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
    locale: locale
  });
}

async function getOrganizations(page, token, urlEnding, locale) {
  return await getDataFromServer({
    type: "organizations",
    page: page,
    token: token,
    urlEnding: urlEnding,
    locale: locale
  });
}

async function getMembers(page, token, urlEnding, locale) {
  return await getDataFromServer({
    type: "members",
    page: page,
    token: token,
    urlEnding: urlEnding,
    locale: locale
  });
}

async function getDataFromServer({ type, page, token, urlEnding, locale}) {
  let url = `/api/${type}/?page=${page}`;
  if (urlEnding) url += urlEnding;

  try {
    console.log(`Getting data for ${type} at ${url}`);
    const resp = await apiRequest({method: "get", url: url, token: token, locale: locale});
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
      locale: locale
    });
    return resp.data.results;
  } catch (e) {
    console.log(e);
  }
}

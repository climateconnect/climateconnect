// 3rd party or built-in imports
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import NextCookies from "next-cookies";
import React, { useContext, useRef, useState } from "react";
import Cookies from "universal-cookie";
import possibleFilters from "../public/data/possibleFilters";
// Relative imports
import { apiRequest } from "../public/lib/apiOperations";
import { getUnaffectedTabs, hasDifferingValues } from "../public/lib/filterOperations";
import {
  getOrganizationTagsOptions,
  getProjectTagsOptions,
  getSkillsOptions,
  getStatusOptions,
  membersWithAdditionalInfo
} from "../public/lib/getOptions";
import { getAllHubs } from "../public/lib/hubOperations";
import { getLocationFilteredBy } from "../public/lib/locationOperations";
import {
  getInfoMetadataByType,
  getReducedPossibleFilters,
  parseData
} from "../public/lib/parsingOperations";
import { nullifyUndefinedValues } from "../public/lib/profileOperations";
import { encodeQueryParamsFromFilters } from "../public/lib/urlOperations";
import BrowseContent from "../src/components/browse/BrowseContent";
import UserContext from "../src/components/context/UserContext";
import TopOfPage from "../src/components/hooks/TopOfPage";
import HubsSubHeader from "../src/components/indexPage/HubsSubHeader";
import MainHeadingContainerMobile from "../src/components/indexPage/MainHeadingContainerMobile";
import WideLayout from "../src/components/layouts/WideLayout";

export async function getServerSideProps(ctx) {
  const { hideInfo } = NextCookies(ctx);
  const [
    project_categories,
    organization_types,
    skills,
    project_statuses,
    hubs,
    location_filtered_by,
  ] = await Promise.all([
    getProjectTagsOptions(null, ctx.locale),
    getOrganizationTagsOptions(ctx.locale),
    getSkillsOptions(ctx.locale),
    getStatusOptions(ctx.locale),
    getAllHubs(ctx.locale),
    getLocationFilteredBy(ctx.query),
  ]);
  return {
    props: nullifyUndefinedValues({
      filterChoices: {
        project_categories: project_categories,
        organization_types: organization_types,
        skills: skills,
        project_statuses: project_statuses,
      },
      hideInfo: hideInfo === "true",
      hubs: hubs,
      initialLocationFilter: location_filtered_by,
    }),
  };
}

export default function Browse({ filterChoices, hubs, initialLocationFilter }) {
  const cookies = new Cookies();
  const token = cookies.get("token");
  const { locale } = useContext(UserContext);

  const getInitialFilters = () => {
    return {
      ...getReducedPossibleFilters(
        possibleFilters({ key: "all", filterChoices: filterChoices, locale: locale }),
        initialLocationFilter
      ),
      search: "",
    };
  };

  // Initialize filters. We use one set of filters for all tabs (projects, organizations, members)
  const [filters, setFilters] = useState(getInitialFilters());
  const [tabsWhereFiltersWereApplied, setTabsWhereFiltersWhereApplied] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Fetches data from the server based on the newly provided
   * filters. Returns an object with the new filter data, as well
   * as other options.
   *
   * @param {Object} newFilters something like {"location": "", status: [], etc... }
   * @param {boolean} closeFilters
   * @param {string} oldUrlEnding previous end of URL through the query param
   */
  const applyNewFilters = async (type, newFilters, closeFilters) => {
    // Don't fetch data again if the exact same filters were already applied in this tab
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
    //Record the tabs in which the filters were applied already
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

  const handleUpdateFilterValues = (valuesToUpdate) => {
    setFilters({
      ...filters,
      ...valuesToUpdate,
    });
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
          filters={filters}
          handleUpdateFilterValues={handleUpdateFilterValues}
          errorMessage={errorMessage}
          filterChoices={filterChoices}
          handleSetErrorMessage={handleSetErrorMessage}
          hubsSubHeaderRef={hubsSubHeaderRef}
          loadMoreData={loadMoreData}
          initialLocationFilter={initialLocationFilter}
        />
      </WideLayout>
    </>
  );
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

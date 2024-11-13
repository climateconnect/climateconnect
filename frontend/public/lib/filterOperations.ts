import _ from "lodash";
import possibleFilters from "../data/possibleFilters";
// import { getDataFromServer } from "./getDataOperations";
import { getDataFromServer } from "./getCachedDataOperations";
import { membersWithAdditionalInfo } from "./getOptions";
import { getInfoMetadataByType, getReducedPossibleFilters } from "./parsingOperations";
import {
  encodeQueryParamsFromFilters,
  findOptionByNameDeep,
  getSearchParams,
} from "./urlOperations";
import { BrowseTabs, CcLocale, FilterChoices } from "../../src/types";
import getFilters from "../data/possibleFilters";

export function getInitialFilters({
  filterChoices,
  locale,
  initialLocationFilter,
}: {
  filterChoices: FilterChoices;
  locale: CcLocale;
  initialLocationFilter: any;
}) {
  return {
    ...getReducedPossibleFilters(
      possibleFilters({ key: "all", filterChoices: filterChoices, locale: locale }),
      initialLocationFilter
    ),
    search: "",
  };
}

export function getFiltersFromSearchString(
  currentTab: BrowseTabs,
  searchQueryString: string,
  filterChoices: FilterChoices,
  locale: CcLocale
): {
  filters: any;
  // filtersFromSearch: (FilterTextDefinition | FilterDefinition)[];
  nonFilters: any;
} {
  const searchParams = getSearchParams(searchQueryString);
  const searchQueryObject = getQueryObjectFromUrl(searchParams, filterChoices, locale);
  // TODO: ignoring the location indication for now. Maybe it does not belong to this
  // component anyways
  // if (!legacyModeEnabled && newFilters.location && !isLocationValid(newFilters.location)) {
  // handle

  const possibleFilters = getFilters({
    key: currentTab,
    filterChoices: filterChoices,
    locale: locale,
  });

  return splitFiltersFromQueryObject(searchQueryObject, possibleFilters);
}

/**
 * Fetches data from the server based on the newly provided
 * filters. Returns an object with the new filter data, as well
 * as other options.
 * By using CachedDataOperations.getDataFromServer, the data is
 * cached based on the url (including e.g. hub, filters, ...).
 *
 * @param {string} currentTab one of ["projects", "organizations", "members", "ideas"] (ideas is deprecated)
 * @param {string} locationSearch the search query (e.g. current window.search.path)
 * @param {boolean} closeFilters
 * @param {Object} filterChoices the choices for select and multiselect filters
 * @param {string} locale the user's language, e.g. "en" or "de"
 * @param {string} token the user's login token to authenticate with the backend
 * @param {string} hubUrl is set if only results from a certain hub should be displayed
 */
export async function loadDataBasedOnNewFilters(
  currentTab: BrowseTabs,
  locationSearch: string,
  filterChoices: FilterChoices,
  locale: CcLocale,
  token: string,
  hubUrl: string | undefined
) {
  const splitQueryObject = getFiltersFromSearchString(
    currentTab,
    locationSearch,
    filterChoices,
    locale
  );
  const filters = { ...splitQueryObject.filters };
  console.log("[FilterOperations v2apply]: filters", filters);

  const newUrlEnding = encodeQueryParamsFromFilters({
    filters: filters,
    infoMetadata: getInfoMetadataByType(currentTab, locale),
    filterChoices: filterChoices,
    locale: locale,
  });
  // ----------------
  // costruct payload and perform loading
  const payload: any = {
    type: currentTab,
    page: 1,
    token: token,
    urlEnding: newUrlEnding,
    locale: locale,
  };
  // TODO: remove searching for ideas
  // if (idea) {
  //   payload.idea = idea;
  // }
  if (hubUrl) {
    payload.hubUrl = hubUrl;
  }

  try {
    const filteredItemsObject: any = await getDataFromServer(payload);

    if (currentTab === "members") {
      filteredItemsObject.members = membersWithAdditionalInfo(filteredItemsObject.members);
    }

    return {
      filteredItemsObject: filteredItemsObject,
      newUrlEnding: newUrlEnding,
    };
  } catch (e) {
    console.log(e);
  }
}

// ##############################
// # Helper functions
// ##############################

//Splits a query array from a url into filters and non-fitlers
function splitFiltersFromQueryObject(
  queryObject,
  possibleFilters
): { filters: any; nonFilters: any } {
  if (!queryObject) return { filters: {}, nonFilters: {} };
  const possibleFilterKeys = possibleFilters.map((f) => f.key);
  const filters = Object.keys(queryObject).reduce((obj, curKey) => {
    if (possibleFilterKeys.includes(curKey)) {
      obj[curKey] = queryObject[curKey];
    }
    return obj;
  }, {});
  const restOfQueryObject = Object.keys(queryObject).reduce((obj, curKey) => {
    if (!possibleFilterKeys.includes(curKey)) {
      obj[curKey] = queryObject[curKey];
    }
    return obj;
  }, {});
  return { filters: filters, nonFilters: restOfQueryObject };
}

const getQueryObjectFromUrl = (query: any, filterChoices: FilterChoices, locale: CcLocale) => {
  const queryObject = _.cloneDeep(query);
  const possibleFiltersMetadata = getFilters({
    key: "all",
    filterChoices: filterChoices,
    locale: locale,
  });

  // TODO: (Karol) mayebe I am wrong, but shouldn't this simplyfied using the URLSearchParams API?
  // e.g. for URLSearchParams:
  //
  // obj =  new URLSearchParams("search=Test&search=Test2")
  // obj.get("search") // "Test"
  // obj.getAll("search") // ["Test", "Test2"]

  const splitQueryObject = splitFiltersFromQueryObject(queryObject, possibleFiltersMetadata);
  for (const [key, value] of Object.entries(splitQueryObject.filters) as any) {
    const metadata = possibleFiltersMetadata.find((f) => f.key === key);

    if (value.indexOf(",") > 0) {
      queryObject[key] = value.split(",").map((v) => getValueInCurrentLanguage(metadata, v));
    } else if (
      metadata?.type === "multiselect" ||
      metadata?.type === "openMultiSelectDialogButton"
    ) {
      queryObject[key] = [getValueInCurrentLanguage(metadata, value)];
    } else if (key === "radius") {
      queryObject[key] = value + "km";
    }
  }
  return queryObject;
};

/* We always save filter values in the url in english.
                Therefore we need to get the name in the current language
                when retrieving them from the query object */
const getValueInCurrentLanguage = (metadata, value) => {
  return findOptionByNameDeep({
    filterChoices: metadata.options,
    propertyToFilterBy: "original_name",
    valueToFilterBy: value,
  }).name;
};

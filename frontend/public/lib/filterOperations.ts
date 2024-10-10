import _ from "lodash";
import { getLocationFilterKeys } from "../data/locationFilters";
import possibleFilters from "../data/possibleFilters";
import { getDataFromServer } from "./getDataOperations";
import { membersWithAdditionalInfo } from "./getOptions";
import { getInfoMetadataByType, getReducedPossibleFilters } from "./parsingOperations";
import { encodeQueryParamsFromFilters } from "./urlOperations";

const getLocationFilterUrl = (location) => {
  /*Pass place id. If the place id is found in our db we can use it's polygon,
  otherwise make a request to the location API with the backend */
  return `place=${location.place_id}&osm=${location.osm_id}&loc_type=${location.osm_type}&`;
};

export function buildUrlEndingFromFilters(filters) {
  let url = "&";
  Object.keys(filters).map((filterKey) => {
    if (
      filters[filterKey] &&
      (filters[filterKey].length > 0 || Object.keys(filters[filterKey]).length > 0)
    ) {
      //only use location filter if we have selected a location
      if (filterKey === "location" && typeof filters[filterKey] === "object") {
        url += getLocationFilterUrl(filters[filterKey]);
      } else if (Array.isArray(filters[filterKey]))
        url += encodeURI(filterKey + "=" + filters[filterKey].join()) + "&";
      else url += encodeURI(filterKey + "=" + filters[filterKey] + "&");
    }
  });
  return url;
}

export function getKeysOfDifferingValues({ obj, newObj, type, filterChoices, locale }) {
  const possibleFilterKeys = possibleFilters({
    key: type,
    filterChoices: filterChoices,
    locale: locale,
  }).map((f) => f.key);
  const locationKeys = getLocationFilterKeys();
  const differingKeys: string[] = [];
  for (const key of possibleFilterKeys) {
    if (key === "location" && (!newObj[key] || typeof newObj[key] === "object")) {
      let isLocationEqual = true;
      //if there are no location keys in either object we still check whether the user selected a location
      //If a user selects a location from the options it changes from a string to an obj
      if (typeof obj?.location === "string" && typeof newObj?.location === "object") {
        isLocationEqual = false;
      } else {
        //Otherwise we'll have to check for each key from the url whether it has changed.
        for (const locKey of locationKeys) {
          if (!_.isEqual(newObj[locKey], obj[locKey])) {
            isLocationEqual = false;
          }
        }
        //If no location was selected before and after the change but the radius changed:
        //Pretend the location didn't change because a radius filter without a selected location does nothing
        if (
          _.isEqual(
            locationKeys.filter((k) => newObj[k]?.length > 0 && obj[k]?.length > 0),
            ["radius"]
          )
        ) {
          isLocationEqual = true;
        }
      }
      if (!isLocationEqual) {
        differingKeys.push("location");
      }
    } else if (!_.isEqual(newObj[key], obj[key])) {
      differingKeys.push(key);
    }
  }
  return differingKeys;
}

export function hasDifferingValues({ obj, newObj, type, filterChoices, locale }) {
  return (
    getKeysOfDifferingValues({
      obj: obj,
      newObj: newObj,
      type: type,
      filterChoices: filterChoices,
      locale: locale,
    }).length > 0
  );
}

export function getUnaffectedTabs({ tabs, filterChoices, locale, filters, newFilters, type }) {
  return tabs.filter((tab) => {
    const possibleFiltersInTab = possibleFilters({
      key: tab,
      filterChoices: filterChoices,
      locale: locale,
    });
    const keysOfDifferingValues = getKeysOfDifferingValues({
      obj: filters,
      newObj: newFilters,
      type: type,
      filterChoices: filterChoices,
      locale: locale,
    });
    for (const filter of possibleFiltersInTab) {
      if (keysOfDifferingValues.includes(filter.key)) {
        return false;
      }
    }
    return true;
  });
}

export function getInitialFilters({ filterChoices, locale, initialLocationFilter }) {
  return {
    ...getReducedPossibleFilters(
      possibleFilters({ key: "all", filterChoices: filterChoices, locale: locale }),
      initialLocationFilter
    ),
    search: "",
  };
}

//Splits a query array from a url into filters and non-fitlers
export function splitFiltersFromQueryObject(queryObject, possibleFilters): any {
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

/**
 * Fetches data from the server based on the newly provided
 * filters. Returns an object with the new filter data, as well
 * as other options.
 *
 * @param {string} type one of ["projects", "organizations", "members", "ideas"]
 * @param {Object} filters the old filters: something like {"location": "", status: [], etc... }
 * @param {Object} newFilters the new filters after a change happened
 * @param {boolean} closeFilters
 * @param {Object} filterChoices the choices for select and multiselect filters
 * @param {string} locale the user's language, e.g. "en" or "de"
 * @param {string} token the user's login token to authenticate with the backend
 * @param {function} handleAddFilters a function that allows adding additional filters to the current ones
 * @deprecated @param {function} handleSetErrorMessage function to display an error message
 * @param {Array} tabsWhereFiltersWereApplied is an array of the tabs where filters were already applied and therefore data doesn't need to be retrieved from the server again
 * @param {function} handleSetTabsWhereFiltersWereApplied function to change tabsWhereFiltersWereApplied
 * @param {string} hubUrl is set if only results from a certain hub should be displayed
 */
export async function applyNewFilters({
  type,
  filters,
  newFilters,
  closeFilters,
  filterChoices,
  locale,
  token,
  handleAddFilters,
  handleSetErrorMessage, // TODO: not used
  tabsWhereFiltersWereApplied,
  handleSetTabsWhereFiltersWereApplied, // TODO: implement this
  hubUrl,
  idea,
}: any) {
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
    handleSetTabsWhereFiltersWereApplied([...tabsWhereFiltersWereApplied, type]);
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
    handleSetTabsWhereFiltersWereApplied([...unaffectedTabs, type]);
  }
  handleAddFilters(newFilters);
  const newUrlEnding = encodeQueryParamsFromFilters({
    filters: newFilters,
    infoMetadata: getInfoMetadataByType(type, locale),
    filterChoices: filterChoices,
    locale: locale,
  });
  handleSetErrorMessage(null);

  try {
    const payload: any = {
      type: type,
      page: 1,
      token: token,
      urlEnding: newUrlEnding,
      locale: locale,
    };
    if (idea) {
      payload.idea = idea;
    }
    if (hubUrl) {
      payload.hubUrl = hubUrl;
    }
    const filteredItemsObject: any = await getDataFromServer(payload);

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
}

export async function v2applyNewFilters({
  currentTab,
  filters,
  filterChoices,
  locale,
  token,
  hubUrl,
}: any) {
  // TODO reimplement Caching
  // * Record the tabs in which the filters were applied already
  // * so one does not have to query them twice

  const newUrlEnding = encodeQueryParamsFromFilters({
    filters: filters,
    infoMetadata: getInfoMetadataByType(currentTab, locale),
    filterChoices: filterChoices,
    locale: locale,
  });

  try {
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

import _ from "lodash";
import { getLocationFilterKeys } from "../data/locationFilters";
import possibleFilters from "../data/possibleFilters";

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
  const differingKeys = [];
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
      if (!isLocationEqual) differingKeys.push(location);
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

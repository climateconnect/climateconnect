import { getLocationFilterKeys } from "../data/locationFilters";
import possibleFilters from "../data/possibleFilters";

const encodeObjectToQueryParams = (obj) => {
  if (!obj) {
    return "";
  }
  return Object.keys(obj).reduce((str, curKey) => {
    str += `${curKey}=${encodeURIComponent(obj[curKey])}&`;
    return str;
  }, "");
};
/**
 * For example when filtering by location="San Francisco", the url should
 * automatically change to active filters. This enables filtered searches
 * to persist, so that they can be easily shareable to other users.
 *
 * Builds a URL with the new filters, e.g. something like:
 * http://localhost:3000/browse?&country=Austria&city=vienna&
 */
const getFilterUrl = ({
  activeFilters,
  infoMetadata,
  filterChoices,
  locale,
  idea,
  nonFilterParams,
}: any) => {
  const filteredParams = encodeQueryParamsFromFilters({
    filters: activeFilters,
    infoMetadata: infoMetadata,
    filterChoices: filterChoices,
    locale: locale,
  });
  const encodedNonFilterParams = encodeObjectToQueryParams(nonFilterParams);
  // Only include "?" if query params aren't nullish
  const filteredQueryParams =
    filteredParams || encodedNonFilterParams
      ? `?${filteredParams ? filteredParams : ""}${
          encodedNonFilterParams ? encodedNonFilterParams : ""
        }${idea ? `idea=${idea.url_slug}` : ""}`
      : "";

  // Build a URL with properties. E.g., /browse?...
  const origin = window?.location?.origin;
  const pathname = window?.location?.pathname;
  const hashFragment = window?.location?.hash;
  const newUrl = `${origin}${pathname}${filteredQueryParams}${hashFragment}`;
  return newUrl;
};

const findOptionByNameDeep = ({ filterChoices, propertyToFilterBy, valueToFilterBy }) => {
  return filterChoices.reduce((result, filterChoice) => {
    if (filterChoice[propertyToFilterBy] === valueToFilterBy) {
      result = filterChoice;
    }
    const subcategoriesFiltered = filterChoice?.subcategories?.filter(
      (fc) => fc[propertyToFilterBy] === valueToFilterBy
    );
    if (subcategoriesFiltered?.length > 0) {
      result = subcategoriesFiltered[0];
    }
    return result;
  }, null);
};

const getFilterName = (filter, key, filterChoices) => {
  const keyToFilterChoicesKeyMap = {
    organization_type: "organization_types",
    skills: "skills",
    status: "project_statuses",
    category: "project_categories",
  };
  //get the filter choice we were looking for (either on top level or one level down)
  const filterName = findOptionByNameDeep({
    filterChoices: filterChoices[keyToFilterChoicesKeyMap[key]],
    propertyToFilterBy: "name",
    valueToFilterBy: filter,
  })?.original_name;
  return filterName;
};

/**
 * Used to build query params to the end of a URL.
 * Originally used in places like applying filters from
 * search categories.
 */
const encodeQueryParamsFromFilters = ({ filters, infoMetadata, filterChoices, locale }) => {
  if (!filters || Object.entries(filters).length === 0) {
    return;
  }
  // TODO: should make this more robust, and if the filters
  // object includes properties that are empty, shouldn't add the &
  let queryParamFragment = "&";
  const allPossibleFilters = possibleFilters({
    key: "all",
    filterChoices: filterChoices,
    locale: locale,
  });
  //iterate through all possible filter keys and encode them. Don't encode unrelated query params
  Object.keys(filters)
    .filter((filterKey) => allPossibleFilters.filter((f) => f.key === filterKey).length > 0)
    .map((filterKey) => {
      const type = infoMetadata && infoMetadata[filterKey]?.type;
      const locationFilterkeys = getLocationFilterKeys();
      //Submitted location filters should always be in the form of an object
      //Simplified example: {place_id: 12323423, display_name: "Test"}
      //When a location is just a string, the filter is not submitted yet (e.g. "New Y")
      if (type === "location") {
        if (typeof filters[filterKey] === "object") {
          const encodedFragment = `place=${filters[filterKey].place_id}&osm=${filters[filterKey].osm_id}&loc_type=${filters[filterKey].osm_type}&`;
          queryParamFragment += encodedFragment;
        }
      } else if (
        //search and radius are supposed to be saved as just strings
        !["search", "radius"].includes(filterKey) &&
        filterKey !== "idea" &&
        filters[filterKey] &&
        filters[filterKey].length > 0 &&
        !locationFilterkeys.includes(filterKey)
      ) {
        // Stringify array values
        let filterValues;
        const possibleFiltersForFilterKey = possibleFilters({
          key: "all",
          filterChoices: filterChoices,
          locale: locale,
        }).find((f) => f.key === filterKey);
        if (Array.isArray(filters[filterKey])) {
          filterValues = [
            filters[filterKey].map((filter) => getFilterName(filter, filterKey, filterChoices)),
          ].join();
        } else {
          const options = (possibleFiltersForFilterKey as any).options;
          filterValues = findOptionByNameDeep({
            filterChoices: options,
            propertyToFilterBy: "name",
            valueToFilterBy: filters[filterKey],
          })?.original_name; //options.find((o) => o.name === filters[filterKey]).original_name;
        }
        // We also need to handle reserved characters, which
        // are not escaped by encodeURI as they're necessary
        // to form a complete URI (notably, ";,/?:@&=+$#";).
        // We can't guarantee what the input will be, so
        // we use encodeURIComponent to handle these characters. We
        // still only encode the filter values though.
        const encodedKey = encodeURIComponent(filterKey);
        const encodedValue = encodeURIComponent(filterValues);
        const encodedFragment = `${encodedKey}=${encodedValue}&`;
        queryParamFragment += encodedFragment;
      } else if (
        ["search", "radius"].includes(filterKey) &&
        filters[filterKey] &&
        filters[filterKey].length > 0
      ) {
        const encodedKey = encodeURIComponent(filterKey);
        const encodedValue = encodeURIComponent(
          filterKey === "radius" ? filters[filterKey].replace("km", "") : filters[filterKey]
        );
        const encodedFragment = `${encodedKey}=${encodedValue}&`;
        queryParamFragment += encodedFragment;
      }
    });
  return queryParamFragment;
};

const getSearchParams = (searchString) => {
  const urlSearchParams = new URLSearchParams(searchString);
  const params = {};
  for (const [key, value] of urlSearchParams) {
    params[key] = value;
  }
  return params;
};

export { getFilterUrl, encodeQueryParamsFromFilters, getSearchParams, findOptionByNameDeep };

/**
 * For example when filtering by location="San Francisco", the url should
 * automatically change to active filters. This enables filtered searches
 * to persist, so that they can be easily shareable to other users.
 *
 * Builds a URL with the new filters, e.g. something like:
 * http://localhost:3000/browse?&country=Austria&city=vienna&
 */
const getFilterUrl = (activeFilters, infoMetadata) => {
  const filteredParams = encodeQueryParamsFromFilters(activeFilters, infoMetadata);
  // Only include "?" if query params aren't nullish
  const filteredQueryParams = filteredParams ? `?${filteredParams}` : "";

  // Build a URL with properties. E.g., /browse?...
  const origin = window?.location?.origin;
  const pathname = window?.location?.pathname;
  const hashFragment = window?.location?.hash;
  const newUrl = `${origin}${pathname}${filteredQueryParams}${hashFragment}`;
  return newUrl;
};

/**
 * Used to build query params to the end of a URL.
 * Originally used in places like applying filters from
 * search categories.
 */
const encodeQueryParamsFromFilters = (filters, infoMetadata) => {
  if (!filters || Object.entries(filters).length === 0) {
    return;
  }
  // TODO: should make this more robust, and if the filters
  // object includes properties that are empty, shouldn't add the &
  let queryParamFragment = "&";
  Object.keys(filters).map((filterKey) => {
    const type = infoMetadata && infoMetadata[filterKey]?.type;
    //Submitted location filters should always be in the form of an object
    //Simplified example: {place_id: 12323423, display_name: "Test"}
    //When a location is just a string, the filter is not submitted yet (e.g. "New Y")
    if (type === "location") {
      if (typeof filters[filterKey] === "object") {
        const encodedFragment = `place=${filters[filterKey].place_id}&osm=${filters[filterKey].osm_id}&loc_type=${filters[filterKey].osm_type}&`;
        queryParamFragment += encodedFragment;
      }
    } else if (filters[filterKey] && filters[filterKey].length > 0) {
      // Stringify array values
      const filterValues = [filters[filterKey]].join();

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
    }
  });

  return queryParamFragment;
};

export { getFilterUrl, encodeQueryParamsFromFilters };

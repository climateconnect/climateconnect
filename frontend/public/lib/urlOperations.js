/**
 * For example when filtering by location="San Francisco", the url should
 * automatically change to active filters. This enables filtered searches
 * to persist, so that they can be easily shareable to other users.
 *
 * Builds a URL and updates window state. E.g. something like:
 * http://localhost:3000/browse?&country=Austria&city=vienna&
 */
const persistFiltersInURL = (activeFilters) => {
  const filteredParams = encodeQueryParamsFromFilters(activeFilters);
  const filteredQueryParams = `?${filteredParams}`;

  // Build a URL with properties. E.g., /browse?...
  const origin = window?.location?.origin;
  const pathname = window?.location?.pathname;
  const newUrl = `${origin}${pathname}${filteredQueryParams}`;

  // Only push state if there's a URL change
  if (newUrl !== window?.location?.href) {
    window.history.pushState({}, "", newUrl);
  }
};

/**
 * Used to build query params to the end of a URL.
 * Originally used in places like applying filters from
 * search categories.
 */
const encodeQueryParamsFromFilters = (filters) => {
  if (!filters || Object.entries(filters).length === 0) {
    return;
  }

  let queryParamFragment = "&";
  Object.keys(filters).map((filterKey) => {
    if (filters[filterKey] && filters[filterKey].length > 0) {
      // Stringify array values
      let filterValues = [filters[filterKey]].join();

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

export { persistFiltersInURL, encodeQueryParamsFromFilters };

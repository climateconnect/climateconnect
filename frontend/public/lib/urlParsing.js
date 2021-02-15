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
      // we use encodeURIComponent to handle these characters
      const encoded = encodeURIComponent(filterKey + "=" + filterValues + "&");
      queryParamFragment += encoded;
    }
  });

  return queryParamFragment;
};

export { encodeQueryParamsFromFilters };

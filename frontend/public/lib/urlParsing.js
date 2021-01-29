const buildUrlEndingFromFilters = (filters) => {
  let url = "&";
  Object.keys(filters).map((filterKey) => {
    if (filters[filterKey] && filters[filterKey].length > 0) {
      if (Array.isArray(filters[filterKey]))
        url += encodeURI(filterKey + "=" + filters[filterKey].join()) + "&";
      else url += encodeURI(filterKey + "=" + filters[filterKey] + "&");
    }
  });
  return url;
};

export { buildUrlEndingFromFilters };

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

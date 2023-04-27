import { getLocationFilterKeys } from "../data/locationFilters";
import { apiRequest } from "./apiOperations";

export function getNameFromLocation(location) {
  if (location.added_manually)
    return {
      name: location.name,
      city: location.city,
      state: location.state,
      country: location.country,
    };
  if (process.env.ENABLE_LEGACY_LOCATION_FORMAT === "true")
    return location.city + "" + location.country;
  if (!location.address || !location.address.country) return location.display_name;
  const firstPartOrder = [
    "village",
    "town",
    "city_district",
    "suburb",
    "borough",
    "subdivision",
    "neighbourhood",
    "place",
    "city",
    "district",
    "municipality",
    "county",
    "state_district",
    "province",
    "administrative",
    "state",
    "region",
  ];
  const middlePartOrder = [
    "city_district",
    "district",
    "suburb",
    "borough",
    "subdivision",
    "neighbourhood",
    "town",
    "village",
  ];
  if (isCountry(location)) {
    return {
      country: location.address.country,
      name: location.display_name,
    };
  }
  const middlePartSuffixes = ["city", "state"];
  const firstPart = getFirstPart(location.address, firstPartOrder);
  const middlePart = getMiddlePart(location.address, middlePartOrder, middlePartSuffixes);
  const showMiddlePart = firstPart !== middlePart;
  const name =
    firstPart +
    ", " +
    (showMiddlePart ? middlePart : "") +
    (showMiddlePart && middlePart?.length > 0 ? ", " : "") +
    location.address.country;
  return {
    city: firstPart,
    state: middlePart,
    country: location.address.country,
    name: name,
  };
}

const getFirstPart = (address, order) => {
  for (const el of order) {
    if (address[el]) {
      console.log(el);
      if (el === "state") return address[el] + " (state)";
      if (el === "municipality") return address[el] + " (municipality)";
      return address[el];
    }
  }
  return "";
};

const getMiddlePart = (address, order, suffixes) => {
  for (const el of order) {
    if (address[el]) {
      for (const suffix of suffixes) {
        if (address[suffix]) {
          return address[suffix];
        }
      }
    }
  }
  return "";
};

const isCountry = (location) => {
  if (location.type !== "administrative") {
    return false;
  }
  //short circuit if the address contains any information other than country and country code
  for (const key of Object.keys(location.address)) {
    if (!["country", "country_code"].includes(key)) {
      return false;
    }
  }
  return true;
};

export function isLocationValid(location) {
  //In legacy mode form control handles validation
  if (process.env.ENABLE_LEGACY_LOCATION_FORMAT === "true") return true;
  if (!location || typeof location == "string") return false;
  else return true;
}

export function parseLocation(location) {
  const location_object = getNameFromLocation(location);
  //don't return anything if in legacy mode
  if (process.env.ENABLE_LEGACY_LOCATION_FORMAT === "true") {
    return location;
  }
  //don't do anything if location is already parsed
  if (typeof location === "object" && alreadyParsed(location)) {
    return location;
  }
  return {
    type: location.added_manually ? location.type : location?.geojson?.type,
    coordinates: location?.geojson?.coordinates,
    geojson: location?.geojson,
    place_id: location?.place_id,
    osm_id: location?.osm_id,
    name: location_object.name,
    lon: location?.lon,
    lat: location?.lat,
    city: location_object.city,
    state: location_object.state,
    country: location_object.country,
  };
}

const props = [
  "type",
  "coordinates",
  "geojson",
  "place_id",
  "name",
  "city",
  "state",
  "country",
  "lon",
  "lat",
];
const alreadyParsed = (location) => {
  for (const prop of props) {
    if (!Object.keys(location).includes(prop)) {
      return false;
    }
  }
  return true;
};

export function indicateWrongLocation(
  locationInputRef,
  setLocationOptionsOpen,
  setErrorMessage,
  texts
) {
  locationInputRef.current.focus();
  setLocationOptionsOpen(true);
  setErrorMessage(texts.please_choose_one_of_the_location_options);
}

export function getLocationFields({
  locationInputRef,
  locationOptionsOpen,
  handleSetLocationOptionsOpen,
  values,
  locationKey,
  texts,
}) {
  //in legacy mode, return a city and a country field
  if (process.env.ENABLE_LEGACY_LOCATION_FORMAT === "true") {
    return [
      {
        required: true,
        label: texts.city,
        type: "text",
        key: "city",
        value: values[locationKey].city,
      },
      {
        required: true,
        label: texts.country,
        type: "text",
        key: "country",
        value: values[locationKey].country,
      },
    ];
  }
  //normally, just return a location field
  return [
    {
      required: true,
      label: texts.location,
      type: "location",
      key: locationKey ? locationKey : "location",
      value: values[locationKey],
      ref: locationInputRef,
      locationOptionsOpen: locationOptionsOpen,
      handleSetLocationOptionsOpen: handleSetLocationOptionsOpen,
    },
  ];
}

export function getLocationValue(values, locationKey) {
  if (process.env.ENABLE_LEGACY_LOCATION_FORMAT === "true") {
    return {
      country: values.country,
      city: values.city,
    };
  }
  return values[locationKey];
}

/**
 * When filtering by location, the url only holds the place_id, osm_id and loc_type, but not the name. This is used to retrieve the whole location object
 */
export async function getLocationFilteredBy(query) {
  const required_params = getLocationFilterKeys(true);
  //Return no if we didn't filter by any location
  for (const param of required_params) {
    if (!Object.keys(query).includes(param)) {
      console.log(`${param} is missing!`);
      return null;
    }
  }
  const url = `/api/get_location/`;
  const payload = {
    place: query.place,
    osm: query.osm,
    loc_type: query.loc_type,
  };
  try {
    const res = await apiRequest({ method: "post", url: url, payload: payload });
    const full_location = {
      ...res.data,
      place_id: query.place,
      osm_id: query.osm,
      osm_type: query.loc_type,
    };
    return full_location;
  } catch (e) {
    console.log(e);
  }
}

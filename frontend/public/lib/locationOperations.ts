import { getLocationFilterKeys } from "../data/locationFilters";
import { apiRequest } from "./apiOperations";

const CUSTOM_NAME_MAPPINGS = {
  "Scotland (state), Scotland": "Scotland",
};

//These countries are wrongly categorized as states in Nominatim. We want to show them as countries as this is more clear
const MAP_STATE_TO_COUNTRY = ["Scotland", "Wales", "England", "Northern Ireland"];

const buildLocationName = (firstPart: string, middlePart: string, lastPart: string): string => {
  const parts: string[] = [];

  if (firstPart) {
    parts.push(firstPart);
  }

  const showMiddlePart = middlePart && middlePart !== firstPart && middlePart !== lastPart;

  if (showMiddlePart) {
    parts.push(middlePart);
  }

  if (lastPart && lastPart !== firstPart) {
    parts.push(lastPart);
  }

  return parts.join(", ");
};

type DisplayLocation = {
  name: string;
  city: string;
  state: string;
  country: string;
};

const DEFAULT_DISPLAY_LOCATION: DisplayLocation = {
  name: "",
  city: "",
  state: "",
  country: "",
};

//This function has an equivalent in backend/location/utility.py -> format_location_name
//We should consider using the same codebase for these
export function getDisplayLocationFromLocation(location): DisplayLocation {
  if (location.added_manually)
    return {
      name: location.name,
      city: location.city,
      state: location.state,
      country: location.country,
    };
  if (process.env.ENABLE_LEGACY_LOCATION_FORMAT === "true")
    return {
      ...DEFAULT_DISPLAY_LOCATION,
      name: location.city + "" + location.country,
    };
  if (!location.address || !location.address.country)
    return { ...DEFAULT_DISPLAY_LOCATION, name: location.display_name };
  const firstPartOrder = [
    "hamlet",
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
    "county",
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
      ...DEFAULT_DISPLAY_LOCATION,
      country: location.address.country,
      name: location.display_name,
    };
  }
  const middlePartSuffixes = ["town", "city", "county", "state"];
  const firstPart = getFirstPart(location.address, firstPartOrder);
  const middlePart = getMiddlePart(location.address, middlePartOrder, middlePartSuffixes);
  const lastPart = MAP_STATE_TO_COUNTRY.includes(location?.address?.state)
    ? location.address.state
    : location.address.country;
  let name = buildLocationName(firstPart, middlePart, lastPart);
  //For certain locations our automatic name generation doesn't work. In this case we want to override the name with a custom one
  if (Object.keys(CUSTOM_NAME_MAPPINGS).includes(name)) {
    name = CUSTOM_NAME_MAPPINGS[name];
  }
  return {
    city: firstPart,
    state: location.address?.state || middlePart,
    country: location.address.country,
    name: name,
  };
}

const getCityOrCountyName = (address) => {
  const cityElementOrder = [
    "city",
    "place",
    "boundary",
    "town",
    "village",
    "place",
    "municipality",
    "county",
    "state_district",
    "province",
    "administrative",
    "state",
    "region",
  ];
  return getFirstPart(address, cityElementOrder);
};

const getPlaceSpecificName = (location): string => {
  return location.address[location.class] || location.address[location.type] || "";
};

const buildStreetAddress = (location): string => {
  if (!location?.address?.road) {
    return "";
  }
  const road = location.address.road;
  const houseNumber = location.address.house_number;
  return houseNumber ? `${road} ${houseNumber}` : road;
};

const buildCityAndCountryPart = (city: string, country: string, firstPart: string): string => {
  const shouldIncludeCity = firstPart !== city && city;
  return shouldIncludeCity ? `${city}, ${country}` : country;
};

export function getDisplayLocationFromExactLocation(location): DisplayLocation {
  //If the location object is empty, just return empty strings
  if (Object.keys(location).length === 0) {
    return DEFAULT_DISPLAY_LOCATION;
  }
  const isConcretePlace = isExactLocation(location);
  const firstPart = isConcretePlace ? getPlaceSpecificName(location) : "";
  const middlePart = isConcretePlace ? buildStreetAddress(location) : "";
  const city = getCityOrCountyName(location.address);
  const country = MAP_STATE_TO_COUNTRY.includes(location?.address?.state)
    ? location.address.state
    : location.address.country;
  const cityAndCountry = buildCityAndCountryPart(city, country, firstPart);

  let name = buildLocationName(firstPart, middlePart, cityAndCountry);

  //For certain locations our automatic name generation doesn't work. In this case we want to override the name with a custom one
  if (Object.keys(CUSTOM_NAME_MAPPINGS).includes(name)) {
    name = CUSTOM_NAME_MAPPINGS[name];
  }
  return {
    name: name || location.display_name || "test",
    city: city,
    state: location.address.state,
    country: location.address.country,
  };
}

const getFirstPart = (address, order) => {
  for (const el of order) {
    if (address[el]) {
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

export function isExactLocation(location) {
  const placeClasses = [
    "amenity",
    "building",
    "historic",
    "tourism",
    "landuse",
    "leisure",
    "place",
    "highway",
    "office",
  ];
  return placeClasses.includes(location.class);
}

//Sometimes the Nominatim API does not return any "geojson" for points
//For these cases we reconstruct it by assuming it's a point with lat and lon as coordinates
const generateGeoJson = (location) => {
  return {
    type: "Point",
    coordinates: [parseFloat(location.lon), parseFloat(location.lat)],
  };
};

const getLocationType = (location) => {
  if (!location) return;
  if (location.added_manually) {
    return location.type;
  }
  //If Nominatim does not provice a geojson we assume the location is a Point
  if (!location.geojson) {
    return "Point";
  }
  return location.geojson.type;
};

export function parseLocation(location, isConcretePlace = false) {
  const displayLocation = isConcretePlace
    ? getDisplayLocationFromExactLocation(location)
    : getDisplayLocationFromLocation(location);
  //don't return anything if in legacy mode
  if (process.env.ENABLE_LEGACY_LOCATION_FORMAT === "true") {
    return location;
  }
  //don't do anything if location is already parsed
  if (typeof location === "object" && alreadyParsed(location)) {
    return location;
  }

  //placeName is the name of the concrete building, e.g. "City Hall"
  let placeName: string = "";

  if (isConcretePlace && (location.address[location.class] || location.address[location.type])) {
    placeName = location.address[location.class] || location.address[location.type];
  }

  //For exact locations we also want the address in the format `<streetname> <number>`
  let exactAddress: string = "";

  if (isConcretePlace && location.address.road) {
    exactAddress =
      location.address.road +
      (location.address.house_number ? ` ${location.address.house_number}` : "");
  }
  return {
    type: getLocationType(location),
    coordinates: location?.geojson?.coordinates,
    geojson: location.geojson ? location.geojson : generateGeoJson(location),
    place_id: location?.place_id,
    osm_id: location?.osm_id,
    osm_type:
      typeof location?.osm_type === "string"
        ? location?.osm_type.charAt(0).toUpperCase()
        : undefined,
    osm_class: location?.class,
    osm_class_type: location?.type,
    display_name: location?.display_name,
    name: location_object.name,
    name: displayLocation.name,
    lon: location?.lon,
    lat: location?.lat,
    city: displayLocation.city,
    state: displayLocation.state,
    country: displayLocation.country,
    place_name: placeName,
    exact_address: exactAddress,
    additional_info: location?.additionalInfoText || location?.additionalInfo,
    is_exact_location: isConcretePlace,
  };
}

const props = [
  "type",
  "coordinates",
  "geojson",
  "place_id",
  "osm_id",
  "osm_type",
  "osm_class",
  "osm_class_type",
  "display_name",
  "name",
  "city",
  "state",
  "country",
  "lon",
  "lat",
  "place_name",
  "exact_address",
  "additional_info",
  "is_exact_location",
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

export function getNameFromLocation(location, legacyModeEnabled) {
  if(legacyModeEnabled)
    return location.city + "" + location.country
  if (!location.address || !location.address.country) return location.display_name;
  const firstPartOrder = [
    "village",
    "town",
    "city_district",
    "district",
    "suburb",
    "borough",
    "subdivision",
    "neighbourhood",
    "place",
    "city",
    "municipality",
    "county",
    "state_district",
    "province",
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
  return {
    city: firstPart,
    state: middlePart,
    country: location.address.country,
    name:
      firstPart +
      ", " +
      middlePart +
      (middlePart?.length > 0 ? ", " : "") +
      location.address.country,
  };
}

const getFirstPart = (address, order) => {
  for (const el of order) {
    if (address[el]) {
      if (el === "state") return address[el] + " (state)";
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

export function isLocationValid(location, legacyModeEnabled) {
  //In legacy mode form control handles validation
  if(legacyModeEnabled)
    return true;
  if (!location || typeof location == "string") return false;
  else return true;
}

export function parseLocation(location, legacyModeEnabled) {
  const location_object = getNameFromLocation(location, legacyModeEnabled);
  //don't return anything if in legacy mode
  if(legacyModeEnabled) {
    return location;
  }
  //don't do anything if location is already parsed
  if (typeof location === "object" && alreadyParsed(location)) {
    return location;
  }
  return {
    type: location?.geojson?.type,
    coordinates: location?.geojson?.coordinates,
    geojson: location?.geojson,
    place_id: location?.place_id,
    osm_id: location?.osm_id,
    name: location_object.name,
    city: location_object.city,
    state: location_object.state,
    country: location_object.country,
  };
}

const props = ["type", "coordinates", "geojson", "place_id", "name", "city", "state", "country"];
const alreadyParsed = (location) => {
  for (const prop of props) {
    if (!Object.keys(location).includes(prop)) {
      return false;
    }
  }
  return true;
};

export function indicateWrongLocation(locationInputRef, setLocationOptionsOpen, setErrorMessage) {
  locationInputRef.current.focus();
  setLocationOptionsOpen(true);
  setErrorMessage("Please choose one of the location options");
}

export function getLocationFields({
  locationInputRef,
  locationOptionsOpen,
  handleSetLocationOptionsOpen,
  legacyModeEnabled,
  values,
  locationKey
}) {
  //in legacy mode, return a city and a country field
  if(legacyModeEnabled) {
    return [
      {
        required: true,
        label: "City",
        type: "text",
        key: "city",
        value: values[locationKey].city,
      },
      {
        required: true,
        label: "Country",
        type: "text",
        key: "country",
        value: values[locationKey].country,
      },
    ]
  }
  //normally, just return a location field
  return [{
    required: true,
    label: "Location",
    type: "location",
    key: "location",
    value: values[locationKey],
    ref: locationInputRef,
    locationOptionsOpen: locationOptionsOpen,
    handleSetLocationOptionsOpen: handleSetLocationOptionsOpen,
  }]
}

export function getLocationValue(values, legacyModeEnabled, locationKey){
  if(legacyModeEnabled) {
    return {
      country: values.country,
      city: values.city,
    }
  }
  return values[locationKey]
}
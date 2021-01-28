export function getNameFromLocation(location) {
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
  ];
  const middlePartSuffixes = ["city", "state"];
  const firstPart = getFirstPart(location.address, firstPartOrder);
  const middlePart = getMiddlePart(location.address, middlePartOrder, middlePartSuffixes);
  return {
    city: firstPart,
    state: middlePart,
    country: location.address.country,
    name: firstPart + ", " + middlePart + (middlePart?.length > 0 ? ", " : "") + location.address.country,
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

export function isLocationValid(location) {
  if (!location || typeof location == "string") return false;
  else return true;
}

export function parseLocation(location) {
  const location_object = getNameFromLocation(location);
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
  }
}
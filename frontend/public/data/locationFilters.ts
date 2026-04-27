export function getLocationFilterKeys(required_only = false) {
  // Canonical query parameter names for location filters.
  // radius is not required to filter by location, the other params are.
  if (required_only) return ["osm_id", "osm_type", "osm_class"];
  return ["osm_id", "osm_type", "osm_class", "place_id", "radius"];
}

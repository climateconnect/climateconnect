export function getLocationFilterKeys(required_only = false) {
  const keys = ["osm_id", "osm_type", "osm_class"];
  //radius is not required to filter by location, the other params are.
  if (!required_only) {
    keys.push("radius");
  }
  return keys;
}

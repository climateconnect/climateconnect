export default function isLocationHubLikeHub(hubType: string, parentHub?: string) {
  return hubType === "location hub" || hubType === "custom hub" || parentHub != null;
}

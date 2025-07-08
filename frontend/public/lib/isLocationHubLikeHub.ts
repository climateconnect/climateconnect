export default function isLocationHubLikeHub(hubType?: string, parentHub?: string) {
  const isLocationHub = hubType && hubType === "location hub";
  const isCustomHub = hubType && hubType === "custom hub";
  const hasParentHub = parentHub != null;

  return isLocationHub || isCustomHub || hasParentHub;
}

import { apiRequest } from "./apiOperations";

export async function getAllHubs(locale: any, just_sector_hubs?: boolean) {
  const url = just_sector_hubs ? `/api/sector_hubs/` : `/api/hubs/`;
  try {
    const resp = await apiRequest({
      method: "get",
      url: url,
      locale: locale,
    });
    return resp.data.results;
  } catch (err: any) {
    if (err.response && err.response.data)
      console.log("Error in getHubData: " + err.response.data.detail);
    console.log(err);
    return null;
  }
}

export function extractHubFromUrl(redirectUrl) {
  const decodedRedirect = decodeURIComponent(redirectUrl);
  // Check if the path contains /hubs/someValue
  // and extract the value after /hubs/
  const hubsPathMatch = decodedRedirect.match(/\/hubs\/([^/?#]+)/);
  if (hubsPathMatch) {
    return hubsPathMatch[1];
  }
  // Check if there's a query parameter hub= in the URL
  const hubQueryMatch = decodedRedirect.match(/[?&]hub=([^&#]+)/);
  if (hubQueryMatch) {
    return hubQueryMatch[1];
  }
  return null;
}

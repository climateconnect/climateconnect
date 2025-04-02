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

export function extractHubFromRedirectUrl(redirect) {
  if (!redirect) return null;

  try {
    const decodedRedirect = decodeURIComponent(redirect);
    const queryString = decodedRedirect.split("?")[1];

    if (!queryString) return null;

    const hubUrl = new URLSearchParams(queryString).get("hub")?.split("#")[0] || null;
    return hubUrl;
  } catch (error) {
    console.error("Error extracting hub URL:", error);
    return null;
  }
}

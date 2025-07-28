import { apiRequest } from "./apiOperations";

export async function getAllSectors(locale: any, hub_url?: string) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/sectors/",
      locale: locale,
    });

    return resp.data.results;
  } catch (err: any) {
    if (err.response && err.response.data)
      console.log("Error in getAllSectors: " + err.response.data.detail);
    console.log(err);
    return null;
  }
}

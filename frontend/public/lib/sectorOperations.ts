import { apiRequest } from "./apiOperations";

export async function getAllSectors(locale: any, hub_url?: string) {
  //TODO: duplicated code with getOptions.ts > getSectorOptions?
  const query = hub_url ? `?hub=${hub_url}` : "";
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/sectors/" + query,
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

import { apiRequest } from "./apiOperations";

export async function getAllHubs(locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/hubs/`,
      locale: locale,
    });
    return resp.data.results;
  } catch (err) {
    if (err.response && err.response.data)
      console.log("Error in getHubData: " + err.response.data.detail);
    console.log(err);
    return null;
  }
}

import { apiRequest } from "../../public/lib/apiOperations";

export default async function getHubTheme(url_slug: string) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/hubs/${url_slug}/theme/`,
    });
    return resp.data;
  } catch (err: any) {
    //Don't log an error if there simply is no theme for this hub
    if(err?.response?.status === 404) {
      return null
    }
    if (err.response && err.response.data)
      console.log("Error in getHubThemeData: " + err.response.data.detail);
    console.log(err);
    return null;
  }
}

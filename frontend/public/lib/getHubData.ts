import { apiRequest } from "./apiOperations";

const getHubData = async (url_slug, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/hubs/${url_slug}/`,
      locale: locale,
    });
    return resp.data;
  } catch (err: any) {
    if (err.response && err.response.data) {
      console.log(err.response.data);
      console.error("Error in getHubData!: " + err.response.data.detail);
    }
    return null;
  }
};

const getHubAmbassadorData = async (url_slug, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/hubs/${url_slug}/ambassador/`,
      locale: locale,
    });
    return resp.data;
  } catch (err: any) {
    if (err.response && err.response.data)
      console.log("Error in getHubAmbassadorData: " + err.response.data.detail);
    console.log(err);
    return null;
  }
};
const getHubSupportersData = async (url_slug, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: `/api/hubs/${url_slug}/supporters/`,
      locale: locale,
    });
    return resp.data;
  } catch (err: any) {
    //Don't log an error if there simply are no supporters for this hub
    if (err?.response?.status === 404) {
      return null;
    }
    if (err.response && err.response.data)
      console.log("Error in getHubSupportersData: " + err.response.data.detail);
    console.log(err);
    return null;
  }
};

export { getHubData, getHubAmbassadorData, getHubSupportersData };

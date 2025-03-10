import { apiRequest } from "./apiOperations";
import { membersWithAdditionalInfo } from "./getOptions";
import { parseData } from "./parsingOperations";

export async function getDataFromServer({ type, page, token, urlEnding, hubUrl, locale, idea }) {
  if (type) type = encodeURIComponent(type);
  if (page) page = encodeURIComponent(page);

  let url = `/api/${type}/?page=${page}`;
  if (hubUrl) {
    hubUrl = encodeURIComponent(hubUrl);
    url += `&hub=${hubUrl}`;
  }
  if (idea) {
    idea = encodeURIComponent(idea);
    url += `&idea=${idea}`;
  }

  // Handle query params as well
  if (urlEnding) {
    urlEnding = encodeURI(urlEnding);
    url += urlEnding;
  }

  try {
    console.log(`Getting data for ${type} at ${url}`);
    const resp = await apiRequest({ method: "get", url, token, locale });
    if (resp.data.length === 0) {
      console.log(`No data of type ${type} found...`);
      return null;
    } else {
      return {
        [type]: parseData({ type: type, data: resp.data.results }),
        hasMore: !!resp.data.next,
      };
    }
  } catch (err: any) {
    if (err.response && err.response.data) {
      console.log("Error: ");
      console.log(err.response.data);
    } else console.log(err);
    throw err;
  }
}

export async function loadMoreData({ type, page, urlEnding, token, locale, hubUrl }) {
  try {
    const payload: any = {
      type: type,
      page: page,
      token: token,
      urlEnding: urlEnding,
      locale: locale,
    };
    if (hubUrl) {
      payload.hubUrl = hubUrl;
    }
    const newDataObject: any = await getDataFromServer(payload);
    const newData =
      type === "members" ? membersWithAdditionalInfo(newDataObject.members) : newDataObject[type];

    return {
      hasMore: newDataObject.hasMore,
      newData: newData,
    };
  } catch (e) {
    console.log("error");
    console.log(e);
    throw e;
  }
}

import { apiRequest } from "./apiOperations";
import { membersWithAdditionalInfo } from "./getOptions";
import { parseData } from "./parsingOperations";

export async function getDataFromServer({
  type,
  page,
  token,
  urlEnding,
  hubUrl,
  locale,
  idea,
  location,
}) {
  let url = `/api/${type}/?page=${page}`;

  if (hubUrl) {
    url += `&hub=${hubUrl}`;
  }
  if (idea) {
    url += `&idea=${idea}`;
  }

  // Handle query params as well
  if (urlEnding) {
    // &category=Lowering%20food%20waste&
    url += urlEnding;
  }

  try {
    console.log(`Getting data for ${type} at ${url}`);

    const resp = location
      ? await apiRequest({ method: "post", url, payload: location, token, locale })
      : await apiRequest({ method: "get", url, token, locale });

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

export async function getUpcomingEvents({
  token,
  locale,
  hubUrl,
  filters,
  location,
}: {
  token?: string;
  locale?: string;
  hubUrl?: string;
  filters?: any;
  location?: any;
}): Promise<any[]> {
  let url = "/api/events/upcoming/?";

  if (hubUrl) {
    url += `hub=${hubUrl}&`;
  }

  if (filters?.search) {
    url += `search=${encodeURIComponent(filters.search)}&`;
  }

  if (filters?.sectors?.length) {
    url += `sectors=${filters.sectors.join(",")}&`;
  }

  if (filters?.start_date) {
    url += `start_date=${filters.start_date}&`;
  }

  try {
    const apiLocale = locale as "en" | "de" | undefined;
    const resp = location
      ? await apiRequest({ method: "post", url, payload: location, token, locale: apiLocale })
      : await apiRequest({ method: "get", url, token, locale: apiLocale });

    return resp.data || [];
  } catch (err: any) {
    if (err.response && err.response.data) {
      console.log("Error getting upcoming events:");
      console.log(err.response.data);
    } else {
      console.log(err);
    }
    return [];
  }
}

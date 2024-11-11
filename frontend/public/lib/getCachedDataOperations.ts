import { apiRequest } from "./apiOperations";
import { membersWithAdditionalInfo } from "./getOptions";
import { parseData } from "./parsingOperations";

const cache: Record<string, { data: any; timestamp: number }> = {}; // Cache with timestamps
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

function buildUrlFrom({
  type,
  page,
  urlEnding,
  hubUrl,
}: {
  type: string;
  page: string;
  urlEnding: string;
  hubUrl: string;
}) {
  let url = `/api/${type}/?page=${page}`;
  if (hubUrl) {
    url += `&hub=${hubUrl}`;
  }

  // Handle query params as well
  if (urlEnding) {
    // &category=Lowering%20food%20waste&
    url += urlEnding;
  }
  return url;
}

export async function getDataFromServer({ type, page, token, urlEnding, hubUrl, locale }: any) {
  const now = Date.now();
  const url = buildUrlFrom({ type, page, urlEnding, hubUrl });

  console.debug("[getDataOperations]: Cache");
  console.debug("[getDataOperations]:", cache);
  console.debug("[getDataOperations]: Requesting url", url);
  console.debug("[getDataOperations]: cache[url]", cache[url]);

  // Check if cached data is still valid
  if (cache[url] && now - cache[url].timestamp < CACHE_TIMEOUT) {
    return cache[url].data;
  }

  try {
    console.debug(`[getDataOperation]: Getting data for ${type} at ${url}`);
    const resp = await apiRequest({ method: "get", url, token, locale });
    if (resp.data.length === 0) {
      console.log(`No data of type ${type} found...`);
      return null;
    } else {
      cache[url] = {
        timestamp: Date.now(),
        data: {
          [type]: parseData({ type: type, data: resp.data.results }),
          hasMore: !!resp.data.next,
        },
      };

      return cache[url].data;
    }
  } catch (err: any) {
    if (err.response && err.response.data) {
      console.log("Error: ");
      console.log(err.response.data);
    } else console.log(err);
    throw err;
  }
}

export async function loadMoreData(payload: {
  type: string;
  page: string;
  urlEnding: string;
  token: string;
  locale: string;
  hubUrl?: string;
}) {
  console.log("100 % confused");
  try {
    const newDataObject: any = await getDataFromServer(payload);
    const newData =
      payload.type === "members"
        ? membersWithAdditionalInfo(newDataObject.members)
        : newDataObject[payload.type];

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

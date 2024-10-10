import { apiRequest } from "./apiOperations";
import { membersWithAdditionalInfo } from "./getOptions";
import { parseData } from "./parsingOperations";

export async function getDataFromServer({ type, page, token, urlEnding, hubUrl, locale, idea }) {
  if (!validParams(type, page, urlEnding, hubUrl, idea)) {
    // TODO: maybe add reporting to spot, whether it works as intended on prod.
    throw new Error("malicious url detected.");
  }

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

function validParams(type: string, page: string, urlEnding: string, hubUrl: string, idea: string) {
  if (!onlyChars(type)) {
    console.error(`Invalid 'type=${type}'. Contains forbidden characters`);
    return false;
  }
  if (!onlyChars(page)) {
    console.error(`Invalid 'page=${page}'. Contains forbidden characters`);
    return false;
  }
  if (!onlyUrlQueryParameterChars(urlEnding)) {
    console.error(`Invalid 'urlEnding=${urlEnding}'. Contains forbidden characters`);
    return false;
  }
  if (!onlyChars(hubUrl)) {
    console.error(`Invalid 'type=${hubUrl}'. Contains forbidden characters`);
    return false;
  }
  if (!onlyChars(idea)) {
    console.error(`Invalid 'type=${idea}'. Contains forbidden characters`);
    return false;
  }
  return true;
}

function onlyChars(value: string) {
  // look for chacters that are not a-z,A-Z or 0-9
  const regex = /[^a-zA-Z0-9]/;
  return !regex.test(value);
}

function onlyUrlQueryParameterChars(value: string) {
  // look for chacters that are not a-z,A-Z or 0-9 or = or &
  const regex = /[^a-zA-Z0-9=&]/;
  return !regex.test(value);
}

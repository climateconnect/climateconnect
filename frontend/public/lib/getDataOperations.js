import { apiRequest } from "./apiOperations";
import { parseData } from "./parsingOperations";

export async function getDataFromServer({ type, page, token, urlEnding, hubUrl, locale }) {
  let url = `/api/${type}/?page=${page}`;
  if(hubUrl) {
    url += `&hub=${hubUrl}`
  }

  // Handle query params as well
  if (urlEnding) {
    // &category=Lowering%20food%20waste&
    url += urlEnding;
  }

  try {
    console.log(`Getting data for ${type} at ${url}`);
    const resp = await apiRequest({ method: "get", url: url, token: token, locale: locale });
    if (resp.data.length === 0) {
      console.log(`No data of type ${type} found...`);
      return null;
    } else {
      return {
        [type]: parseData({ type: type, data: resp.data.results }),
        hasMore: !!resp.data.next,
      };
    }
  } catch (err) {
    if (err.response && err.response.data) {
      console.log("Error: ");
      console.log(err.response.data);
    } else console.log(err);
    throw err;
  }
}
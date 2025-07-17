import { apiRequest } from "./apiOperations";
import { GetServerSidePropsContext } from "next";

function parseQuery(query: string | string[] | undefined) {
  if (Array.isArray(query)) {
    console.warn("[Warning]: multiple (sub) hubs given in the query:", query);
    console.warn("[Warning]: only using the first, ignoring the others");
  }
  const hub = Array.isArray(query) ? query[0] : query ?? "";
  return hub;
}

export function extractHubUrlsFromContext(ctx: GetServerSidePropsContext) {
  const hubUrl = parseQuery(ctx.query.hubUrl);
  const subHub = parseQuery(ctx.query.sub);

  return { hubUrl, subHub };
}

export async function getAllHubs(locale: any, just_sector_hubs?: boolean) {
  const url = just_sector_hubs ? `/api/sector_hubs/` : `/api/hubs/`;
  try {
    const resp = await apiRequest({
      method: "get",
      url: url,
      locale: locale,
    });

    return resp.data.results;
  } catch (err: any) {
    if (err.response && err.response.data)
      console.log("Error in getHubData: " + err.response.data.detail);
    console.log(err);
    return null;
  }
}

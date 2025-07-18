import { apiRequest } from "./apiOperations";
import { GetServerSidePropsContext } from "next";

export function extractHubUrlsFromContext(ctx: GetServerSidePropsContext) {
  const hubUrl = ctx.query.hubUrl;
  const subHub = ctx.query.subHub;

  if (!subHub) {
    return { hubUrl, subHub: undefined };
  }

  return { hubUrl, subHub: hubUrl + "_" + subHub };
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

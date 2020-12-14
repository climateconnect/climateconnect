import React from "react";
import axios from "axios";
import NextCookies from "next-cookies";
import WideLayout from "../../src/components/layouts/WideLayout";
import NavigationSubHeader from "../../src/components/hub/NavigationSubHeader";
import HubHeaderImage from "../../src/components/hub/HubHeaderImage";
import HubContent from "../../src/components/hub/HubContent";
import tokenConfig from "../../public/config/tokenConfig";
import { parseData } from "../../public/lib/parsingOperations";
import {
  getProjectTagsOptions,
  getOrganizationTagsOptions,
  getSkillsOptions,
  getStatusOptions,
} from "../../public/lib/getOptions";

export default function Hub({ name, headline, image, quickInfo, detailledInfo, stats }) {
  return (
    <WideLayout header={headline}>
      <NavigationSubHeader hubName={name} />
      <HubHeaderImage image={image} />
      <HubContent
        headline={headline}
        quickInfo={quickInfo}
        detailledInfo={detailledInfo}
        name={name}
        stats={stats}
      />
    </WideLayout>
  );
}

Hub.getInitialProps = async (ctx) => {
  const url_slug = ctx.query.hubUrl;
  const { token } = NextCookies(ctx);
  const [hubData] = await Promise.all([
    getHubData(url_slug),
    getProjects(1, token),
    getOrganizations(1, token),
    getMembers(1, token),
    getProjectTagsOptions(),
    getOrganizationTagsOptions(),
    getSkillsOptions(),
    getStatusOptions(),
  ]);
  return {
    url_slug: url_slug,
    name: hubData.name,
    headline: hubData.headline,
    image: hubData.image,
    quickInfo: hubData.quick_info,
    stats: hubData.stats,
  };
};

const getHubData = async (url_slug) => {
  console.log("getting data for hub " + url_slug);
  try {
    const resp = await axios.get(`${process.env.API_URL}/api/hubs/${url_slug}/`);
    return resp.data;
  } catch (err) {
    if (err.response && err.response.data)
      console.log("Error in getHubData: " + err.response.data.detail);
    console.log(err);
    return null;
  }
};

async function getProjects(page, token, urlEnding) {
  return await getDataFromServer({
    type: "projects",
    page: page,
    token: token,
    urlEnding: urlEnding,
  });
}

async function getOrganizations(page, token, urlEnding) {
  return await getDataFromServer({
    type: "organizations",
    page: page,
    token: token,
    urlEnding: urlEnding,
  });
}

async function getMembers(page, token, urlEnding) {
  return await getDataFromServer({
    type: "members",
    page: page,
    token: token,
    urlEnding: urlEnding,
  });
}

async function getDataFromServer({ type, page, token, urlEnding }) {
  let url = `${process.env.API_URL}/api/${type}/?page=${page}`;
  if (urlEnding) url += urlEnding;

  try {
    console.log(`Getting data for ${type} at ${url}`);
    const resp = await axios.get(url, tokenConfig(token));

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

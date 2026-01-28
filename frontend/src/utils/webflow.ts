import axios from "axios";
import * as cheerio from "cheerio";

const WEBFLOW_BASE_LINK = "https://climateconnect.webflow.io/hub-texts/";
const DESCRIPTION_WEBFLOW_LINKS = {
  energy: {
    en: "energy-en",
    de: "energie-de",
  },
  mobility: {
    de: "mobilitat-de",
    en: "mobility-en",
  },
  biodiversity: {
    de: "biodiversitat",
    en: "biodiversity-en",
  },
  landuse: {
    de: "landuse-de",
    en: "landuse-en",
  },
};

const retrieveDescriptionFromWebflow = async (query, locale) => {
  if (
    DESCRIPTION_WEBFLOW_LINKS[query?.hubUrl] &&
    DESCRIPTION_WEBFLOW_LINKS[query?.hubUrl][locale]
  ) {
    const props = await retrievePage(
      WEBFLOW_BASE_LINK + DESCRIPTION_WEBFLOW_LINKS[query.hubUrl][locale]
    );
    return props;
  }
  return null;
};

const retrievePage = async (url: string) => {
  const res = await axios.get(url).catch((err) => {
    console.error(err);
  });
  if (!res) throw Error("error caught but not handled");
  const html = res.data;

  // Parse HTML with Cheerio
  const $ = await cheerio.load(html);
  const bodyContent = $(`body`).html();
  const headContent = $(`head`).html();
  const title = $("title").text();
  const description = $('meta[name="description"]').attr("content");

  return {
    bodyContent: bodyContent,
    headContent: headContent,
    title: title,
    description: description ? description : null,
  };
};

export { retrievePage, retrieveDescriptionFromWebflow };

import { Link } from "../customHubtypes";
import { getSharedLinks, getStaticLinks, StaticLinkConfig } from "./customHubLinks";

const SCOTT_BASE_URL = "https://climateconnect.scot";
const NETWORKS_URL = `${SCOTT_BASE_URL}/networks-across-perth-kinross`;

export const getScottLinks = (pathToRedirect: string, texts: any): Link[] =>
  getSharedLinks(pathToRedirect, texts, {
    baseUrl: SCOTT_BASE_URL,
    hubKey: "perth",
    mainTextKey: "climateconnect_scot",
  });

const SCOTTISH_STATIC_LINKS_CONFIG: StaticLinkConfig[] = [];

export const scottishStaticLinks = (texts: any): Link[] =>
  getStaticLinks(texts, SCOTTISH_STATIC_LINKS_CONFIG, NETWORKS_URL);

export const scottConfig = (pathToRedirect: string, texts: any) => ({
  hubTabLinkNarrowScreen: {
    href: SCOTT_BASE_URL,
    text: texts.climateconnect_scot,
  },
  headerLinks: getScottLinks(pathToRedirect, texts),
  headerStaticLinks: scottishStaticLinks(texts),
});

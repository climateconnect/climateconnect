import { Link } from "../customHubtypes";
import { getSharedLinks, getStaticLinks, StaticLinkConfig } from "./customHubLinks";

const SCOTT_BASE_URL = "https://climateconnect.scot";
const NETWORKS_URL = `${SCOTT_BASE_URL}/networks-across-perth-kinross`;

export const getScottLinks = (pathToRedirect: string, texts: any): Link[] =>
  getSharedLinks(pathToRedirect, texts, {
    baseUrl: SCOTT_BASE_URL,
    hubKey: "perth",
    mainTextKey: "climateconnect.scot",
  });

const SCOTTISH_STATIC_LINKS_CONFIG: StaticLinkConfig[] = [];

export const scottishStaticLinks = (texts: any): Link[] =>
  getStaticLinks(texts, SCOTTISH_STATIC_LINKS_CONFIG, NETWORKS_URL);

export const scottConfig = (pathToRedirect: string, texts: any) => ({
  welcome: "DEVLINK_ELEMENT",
  hubTabLinkNarrowScreen: {
    href: SCOTT_BASE_URL,
    text: texts.PRIO1_klima,
  },
  headerLinks: getScottLinks(pathToRedirect, texts),
  headerStaticLinks: scottishStaticLinks(texts),
});

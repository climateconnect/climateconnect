import { Link } from "../customHubtypes";
import { EnPrio1Welcome, DePrio1Willkommen } from "../../../devlink";
import { getSharedLinks, getStaticLinks, StaticLinkConfig } from "./customHubLinks";

const PRIO1_BASE_URL = "https://prio1-klima.net";

export const getPrio1Links = (pathToRedirect: string, texts: any): Link[] =>
  getSharedLinks(pathToRedirect, texts, {
    baseUrl: PRIO1_BASE_URL,
    hubKey: "prio1",
    mainTextKey: "PRIO1_klima",
  });

const PRIO1_STATIC_LINKS_CONFIG: StaticLinkConfig[] = [
  { href: "/klima-preis/", textKey: "PRIO1_Climate_Prize" },
  { href: "/prio1-community/", textKey: "PRIO1_community" },
  { href: "/akteure/", textKey: "for_actors" },
];

export const prio1StaticLinks = (texts: any): Link[] =>
  getStaticLinks(texts, PRIO1_STATIC_LINKS_CONFIG, PRIO1_BASE_URL);

export const prio1Config = (pathToRedirect: string, texts: any) => ({
  welcome: {
    en: EnPrio1Welcome,
    de: DePrio1Willkommen,
  },
  hubTabLinkNarrowScreen: {
    href: PRIO1_BASE_URL,
    text: texts.PRIO1_klima,
  },
  headerLinks: getPrio1Links(pathToRedirect, texts),
  headerStaticLinks: prio1StaticLinks(texts),
});

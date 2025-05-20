import { DePrio1Willkommen, EnPrio1Welcome } from "../../devlink";
import { getPrio1Links, getScottLinks, prio1StaticLinks } from "../lib/headerLink";

export default function customHubData({
  path_to_redirect = "",
  texts = {},
}: {
  path_to_redirect?: string;
  texts?: any;
} = {}) {
  const data = {
    prio1: {
      welcome: {
        en: EnPrio1Welcome,
        de: DePrio1Willkommen,
      },
      hubTabLinkNarrowScreen: {
        href: "https://prio1-klima.net",
        text: texts.PRIO1_klima,
      },
      headerLink: getPrio1Links(path_to_redirect, texts),
      headerStaticLink: prio1StaticLinks(texts),
    },
    scott: {
      welcome: "DEVLINK_ELEMENT",
      headerLink: getScottLinks(path_to_redirect, texts),
      // change prio1StaticLinks to ScottStaticLinks
      headerStaticLink: prio1StaticLinks(texts),
    },
  };
  return data;
}

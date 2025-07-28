import { Link } from "./types";
import { COMMON_LINKS } from "../lib/headerLinks";
import InfoIcon from "@mui/icons-material/Info";
import { DePrio1Willkommen, EnPrio1Welcome } from "../../devlink";

export const getPrio1Links = (pathToRedirect: string, texts: any): Link[] => [
  {
    href: "https://prio1-klima.net",
    text: texts.PRIO1_klima,
    iconForDrawer: InfoIcon,
    showStaticLinksInDropdown: true,
    hideOnStaticPages: true,
    isExternalLink: true,
    className: "btnIconTextColor",
  },
  {
    ...COMMON_LINKS.SHARE,
    href: "/share?hub=prio1",
    text: texts.share_a_project,
    hideOnMediumScreen: true,
  },
  { type: "languageSelect" },
  {
    ...COMMON_LINKS.NOTIFICATIONS,
    text: texts.inbox,
  },
  ...COMMON_LINKS.AUTH_LINKS(pathToRedirect, texts, "hub=prio1"),
];

export const prio1StaticLinks = (texts: any): Link[] => [
  {
    href: "https://prio1-klima.net/klima-preis/",
    text: texts.PRIO1_Climate_Prize,
    target: "_blank",
    isExternalLink: true,
  },
  {
    href: "https://prio1-klima.net/prio1-community/",
    text: texts.PRIO1_community,
    target: "_blank",
    isExternalLink: true,
  },
  {
    href: "https://prio1-klima.net/akteure/",
    text: texts.for_actors,
    target: "_blank",
    isExternalLink: true,
  },
];

export const prio1Config = (pathToRedirect: string, texts: any) => ({
  welcome: {
    en: EnPrio1Welcome,
    de: DePrio1Willkommen,
  },
  hubTabLinkNarrowScreen: {
    href: "https://prio1-klima.net",
    text: texts.PRIO1_klima,
  },
  headerLinks: getPrio1Links(pathToRedirect, texts),
  headerStaticLinks: prio1StaticLinks(texts),
});

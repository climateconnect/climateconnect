import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import { getLocalePrefix } from "./apiOperations";

const ERLANGEN_SLUG = "erlangen";
const ERLANGEN_DONATE = "https://www.climatehub.earth/300";
const COMMON_LINKS = {
  NOTIFICATIONS: {
    type: "notificationsButton",
    iconForDrawer: NotificationsIcon,
    hasBadge: true,
    onlyShowIconOnNormalScreen: true,
    onlyShowIconOnMobile: true,
    className: "notificationsButton",
    icon: NotificationsIcon,
    alwaysDisplayDirectly: true,
    onlyShowLoggedIn: true,
    // Fixed issue where missing href caused redirection issues on mobile.
    onlyShowOnNormalScreen: true,
  },
  SHARE: {
    href: "/share",
    mediumScreenText: "share",
    iconForDrawer: AddCircleIcon,
    isFilledInHeader: true,
    className: "shareProjectButton",
    vanillaIfLoggedOut: true,
  },
  AUTH_LINKS: (path_to_redirect, texts, queryString) => [
    {
      href: `/signin?redirect=${encodeURIComponent(path_to_redirect)}${
        queryString ? `&${queryString}` : ""
      }`,
      text: texts.log_in,
      iconForDrawer: AccountCircleIcon,
      isOutlinedInHeader: true,
      onlyShowLoggedOut: true,
    },
    {
      href: `/signup${queryString ? `?${queryString}` : ""}`,
      text: texts.sign_up,
      iconForDrawer: AccountCircleIcon,
      isOutlinedInHeader: true,
      onlyShowLoggedOut: true,
      alwaysDisplayDirectly: true,
    },
  ],
};

const getPrio1Links = (path_to_redirect, texts) => [
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
  {
    type: "languageSelect",
  },
  {
    ...COMMON_LINKS.NOTIFICATIONS,
    text: texts.inbox,
  },
  ...COMMON_LINKS.AUTH_LINKS(path_to_redirect, texts, "hub=prio1"),
];

const getDefaultLinks = (path_to_redirect, texts, isLocationHub, hasHubLandingPage, hubUrl) => {
  const isOnLandingPage = path_to_redirect == `/hubs/${hubUrl}`; // Detect if we are on the landing page
  {
    return [
      {
        href: "/browse",
        text: isLocationHub
          ? isOnLandingPage || hasHubLandingPage
            ? texts.climate_connect
            : texts.projects_worldwide
          : texts.browse,
        iconForDrawer: HomeIcon,
        showJustIconUnderSm: HomeIcon,
        showStaticLinksInDropdown:
          isLocationHub && (hasHubLandingPage || isOnLandingPage) ? true : false,
      },
      {
        href: isOnLandingPage
          ? `/hubs/${hubUrl}/browse`
          : hasHubLandingPage
          ? `/hubs/${hubUrl}/`
          : "/about",
        text: isOnLandingPage
          ? texts.return_to_climatehub_projects
          : isLocationHub && hasHubLandingPage
          ? texts.about_climatehub
          : texts.about,
        iconForDrawer: InfoIcon,
        showStaticLinksInDropdown: isOnLandingPage
          ? false
          : isLocationHub && hasHubLandingPage
          ? false
          : true,
        hideOnStaticPages: true,
      },
      {
        href: hubUrl === ERLANGEN_SLUG ? ERLANGEN_DONATE : "/donate",
        text: texts.donate,
        iconForDrawer: FavoriteBorderIcon,
        isOutlinedInHeader: true,
        icon: FavoriteBorderIcon,
        hideDesktopIconUnderSm: true,
        vanillaIfLoggedOut: true,
        hideOnStaticPages: true,
        alwaysDisplayDirectly: "loggedIn",
      },
      {
        ...COMMON_LINKS.SHARE,
        text: texts.share_a_project,
        hideOnMediumScreen: isLocationHub,
      },
      {
        type: "languageSelect",
      },
      {
        ...COMMON_LINKS.NOTIFICATIONS,
        text: texts.inbox,
      },
      ...COMMON_LINKS.AUTH_LINKS(path_to_redirect, texts, ""),
    ];
  }
};

const getLinks = (
  path_to_redirect,
  texts,
  isLocationHub,
  isCustomHub,
  hasHubLandingPage,
  hubUrl
) => {
  return isCustomHub
    ? getPrio1Links(path_to_redirect, texts)
    : getDefaultLinks(
        path_to_redirect,
        texts,
        isLocationHub || isCustomHub,
        hasHubLandingPage,
        hubUrl
      );
};

const getLoggedInLinks = ({ loggedInUser, texts, queryString }) => {
  return [
    {
      href: "/profiles/" + loggedInUser.url_slug + queryString,
      text: texts.my_profile,
      iconForDrawer: AccountCircleIcon,
    },
    {
      href: "/inbox",
      text: texts.inbox,
      iconForDrawer: MailOutlineIcon,
    },
    {
      href: "/profiles/" + loggedInUser.url_slug + (queryString || "/") + "#projects",
      text: texts.my_projects,
      iconForDrawer: GroupWorkIcon,
    },
    {
      href: "/profiles/" + loggedInUser.url_slug + (queryString || "/") + "#organizations",
      text: texts.my_organizations,
      iconForDrawer: GroupWorkIcon,
    },
    {
      href: "/settings" + queryString,
      text: texts.settings,
      iconForDrawer: SettingsIcon,
    },
    {
      avatar: true,
      href: "/profiles/" + loggedInUser.url_slug + queryString,
      src: loggedInUser.image,
      alt: texts.profile_image_of + " " + loggedInUser.name,
      showOnMobileOnly: true,
    },
    {
      isLogoutButton: true,
      text: texts.log_out,
      iconForDrawer: ExitToAppIcon,
    },
  ];
};

const defaultStaticLinks = (texts, hubUrl) => [
  {
    href: "/about",
    text: texts.about,
  },
  {
    href: hubUrl === ERLANGEN_SLUG ? ERLANGEN_DONATE : "/donate",
    text: texts.donate,
    only_show_on_static_page: true,
  },
  {
    href: "/team",
    text: texts.team,
    parent_item: "/about",
  },
  {
    href: "/verein",
    text: texts.association,
    parent_item: "/about",
    only_show_in_languages: ["de"],
  },
  {
    href: "/join",
    text: texts.join,
    parent_item: "/about",
  },
  {
    href: "/transparency",
    text: texts.transparency,
    parent_item: "/about",
  },
  /*
  remove donor forest for now as it's outdated
  {
    href: "/donorforest",
    text: texts.donorforest,
    parent_item: "/donate",
  },
  */
  {
    href: "/blog",
    text: texts.blog,
  },
  {
    href: "/press",
    text: texts.press,
  },
  {
    href: "/faq",
    text: texts.faq,
  },
];

const Prio1StaticLinks = (texts) => [
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

const customHubStaticLinksFunction = {
  prio1: Prio1StaticLinks,
};

const getCustomHubStaticLinks = (url_slug, texts) => {
  if (Object.keys(customHubStaticLinksFunction).includes(url_slug))
    return customHubStaticLinksFunction[url_slug](texts);
  return defaultStaticLinks(texts, url_slug);
};
const getStaticLinks = (texts, customHubUrlSlug) => {
  return !customHubUrlSlug
    ? defaultStaticLinks(texts, "")
    : getCustomHubStaticLinks(customHubUrlSlug, texts);
};

const getStaticLinkFromItem = (locale, item) => {
  if (item.isExternalLink) {
    return item.href;
  }
  return `${getLocalePrefix(locale)}${item.href}`;
};

export { getLinks, getLoggedInLinks, getStaticLinks, getStaticLinkFromItem };

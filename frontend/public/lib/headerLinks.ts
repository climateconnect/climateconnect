import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import { getLocalePrefix } from "./apiOperations";
import { getCustomHubData } from "../data/customHubData";
import { WASSERAKTIONSWOCHEN_PATH } from "../data/wasseraktionswochen_config";

const ERLANGEN_SLUG = "erlangen";
const ERLANGEN_DONATE = "https://www.climatehub.earth/300";
const COMMON_LINKS = {
  NOTIFICATIONS: {
    type: "notificationsButton",
    iconForDrawer: NotificationsIcon,
    hasBadge: true,
    onlyShowIconOnNormalScreen: true,
    onlyShowIconOnMobile: true,
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
    icon: AddCircleOutlineIcon,
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

const isLandingPagePath = (pathToRedirect, hubUrl) =>
  !!hubUrl && pathToRedirect === `/hubs/${hubUrl}`;

const isWasseraktionswochenPage = (pathToRedirect) =>
  typeof pathToRedirect === "string" && pathToRedirect.startsWith(WASSERAKTIONSWOCHEN_PATH);

const getBrowseLinkText = ({ texts, isLocationHub, isOnLandingPage, hasHubLandingPage }) => {
  if (!isLocationHub) {
    return texts.browse;
  }
  if (isOnLandingPage || hasHubLandingPage) {
    return texts.climate_connect;
  }
  return texts.projects_worldwide;
};

const shouldShowStaticLinksForBrowse = ({ isLocationHub, hasHubLandingPage, isOnLandingPage }) => {
  return Boolean(isLocationHub && (hasHubLandingPage || isOnLandingPage));
};

const buildBrowseLink = ({ texts, isLocationHub, isOnLandingPage, hasHubLandingPage }) => ({
  href: "/browse",
  text: getBrowseLinkText({ texts, isLocationHub, isOnLandingPage, hasHubLandingPage }),
  iconForDrawer: HomeIcon,
  showJustIconUnderSm: HomeIcon,
  showStaticLinksInDropdown: shouldShowStaticLinksForBrowse({
    isLocationHub,
    hasHubLandingPage,
    isOnLandingPage,
  }),
});

const getAboutLinkHref = ({ isOnLandingPage, hasHubLandingPage, hubUrl }) => {
  if (isOnLandingPage && hubUrl) {
    return `/hubs/${hubUrl}/browse`;
  }
  if (hasHubLandingPage && hubUrl) {
    return `/hubs/${hubUrl}/`;
  }
  return "/about";
};

const getAboutLinkText = ({ texts, isLocationHub, hasHubLandingPage, isOnLandingPage }) => {
  if (isOnLandingPage) {
    return texts.return_to_climatehub_projects;
  }
  if (isLocationHub && hasHubLandingPage) {
    return texts.about_climatehub;
  }
  return texts.about;
};

const shouldShowStaticLinksForAbout = ({ isOnLandingPage, isLocationHub, hasHubLandingPage }) => {
  if (isOnLandingPage) {
    return false;
  }
  if (isLocationHub && hasHubLandingPage) {
    return false;
  }
  return true;
};

const buildAboutLink = ({ texts, isLocationHub, hasHubLandingPage, isOnLandingPage, hubUrl }) => ({
  href: getAboutLinkHref({ isOnLandingPage, hasHubLandingPage, hubUrl }),
  text: getAboutLinkText({ texts, isLocationHub, hasHubLandingPage, isOnLandingPage }),
  iconForDrawer: InfoIcon,
  showStaticLinksInDropdown: shouldShowStaticLinksForAbout({
    isOnLandingPage,
    isLocationHub,
    hasHubLandingPage,
  }),
  hideOnStaticPages: true,
});

const getDonateHref = (hubUrl) => (hubUrl === ERLANGEN_SLUG ? ERLANGEN_DONATE : "/donate");

const isDonateExternal = (hubUrl) => hubUrl === ERLANGEN_SLUG;

const buildDonateLink = ({ texts, hubUrl }) => ({
  href: getDonateHref(hubUrl),
  isExternalLink: isDonateExternal(hubUrl),
  text: texts.donate,
  iconForDrawer: FavoriteBorderIcon,
  isOutlinedInHeader: true,
  icon: FavoriteBorderIcon,
  hideDesktopIconUnderSm: true,
  vanillaIfLoggedOut: true,
  hideOnStaticPages: true,
  alwaysDisplayDirectly: "loggedIn",
  className: "btnColor buttonMarginLeft",
});

const getWasseraktionswochenLinks = ({ path_to_redirect, texts, hubUrl, hasHubLandingPage }) => [
  buildAboutLink({
    texts,
    isLocationHub: true,
    hasHubLandingPage,
    isOnLandingPage: false,
    hubUrl,
  }),
  buildDonateLink({ texts, hubUrl }),
  {
    type: "languageSelect",
  },
  {
    ...COMMON_LINKS.NOTIFICATIONS,
    text: texts.inbox,
  },
  ...COMMON_LINKS.AUTH_LINKS(path_to_redirect, texts, ""),
];

const getDefaultLinks = (path_to_redirect, texts, isLocationHub, hasHubLandingPage, hubUrl) => {
  const isOnLandingPage = isLandingPagePath(path_to_redirect, hubUrl);

  {
    return [
      buildBrowseLink({ texts, isLocationHub, isOnLandingPage, hasHubLandingPage }),
      buildAboutLink({ texts, isLocationHub, hasHubLandingPage, isOnLandingPage, hubUrl }),
      buildDonateLink({ texts, hubUrl }),
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
  path_to_redirect: string,
  texts: Record<string, string>,
  isLocationHub: boolean | undefined,
  isCustomHub: boolean | undefined,
  hasHubLandingPage: boolean | undefined,
  hubUrl?: any
) => {
  if (isWasseraktionswochenPage(path_to_redirect)) {
    return getWasseraktionswochenLinks({
      path_to_redirect,
      texts,
      hubUrl,
      hasHubLandingPage,
    });
  }
  const effectiveIsLocationHub = isLocationHub || isCustomHub;
  return isCustomHub
    ? getCustomHubData({ hubUrl, texts, path_to_redirect })?.headerLinks
    : getDefaultLinks(path_to_redirect, texts, effectiveIsLocationHub, hasHubLandingPage, hubUrl);
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

const getCustomHubStaticLinks = (url_slug, texts) => {
  const customHubData = getCustomHubData({ hubUrl: url_slug, texts });
  return customHubData?.headerStaticLinks || defaultStaticLinks(texts, url_slug);
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

export { getLinks, getLoggedInLinks, getStaticLinks, getStaticLinkFromItem, COMMON_LINKS };

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
    // TODO: On mobile view, missing an href causes the inbox to redirect to undefined.
    // TODO: On desktop view, adding an href causes an issue where clicking the icon to open the notification box redirects to the inbox instead of opening the box.
    // href: "/inbox",
  },
  SHARE: {
    href: "/share",
    mediumScreenText: "share",
    iconForDrawer: AddCircleIcon,
    isFilledInHeader: true,
    className: "shareProjectButton",
    vanillaIfLoggedOut: true,
  },
  AUTH_LINKS: (path_to_redirect, texts) => [
    {
      href: `/signin?redirect=${path_to_redirect}`,
      text: texts.log_in,
      iconForDrawer: AccountCircleIcon,
      isOutlinedInHeader: true,
      onlyShowLoggedOut: true,
    },
    {
      href: "/signup",
      text: texts.sign_up,
      iconForDrawer: AccountCircleIcon,
      isOutlinedInHeader: true,
      onlyShowLoggedOut: true,
      alwaysDisplayDirectly: true,
    },
  ],
};

const getPrio1Links = (path_to_redirect, texts, isLocationHub) => [
  {
    href: "/prio1-klima",
    text: texts.PRIO1_klima,
    iconForDrawer: InfoIcon,
    showStaticLinksInDropdown: true,
    hideOnStaticPages: true,
    className: "btnIconTextColor",
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
  ...COMMON_LINKS.AUTH_LINKS(path_to_redirect, texts),
];

const getDefaultLinks = (path_to_redirect, texts, isLocationHub) => [
  {
    href: "/browse",
    text: isLocationHub ? texts.projects_worldwide : texts.browse,
    iconForDrawer: HomeIcon,
    showJustIconUnderSm: HomeIcon,
  },
  {
    href: "/about",
    text: texts.about,
    iconForDrawer: InfoIcon,
    showStaticLinksInDropdown: true,
    hideOnStaticPages: true,
  },
  {
    href: "/donate",
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
  ...COMMON_LINKS.AUTH_LINKS(path_to_redirect, texts),
];

const getLinks = (path_to_redirect, texts, isLocationHub, isCustomHub) => {
  return isCustomHub
    ? getPrio1Links(path_to_redirect, texts, isLocationHub)
    : getDefaultLinks(path_to_redirect, texts, isLocationHub);
};

const getLoggedInLinks = ({ loggedInUser, texts }) => {
  return [
    {
      href: "/profiles/" + loggedInUser.url_slug,
      text: texts.my_profile,
      iconForDrawer: AccountCircleIcon,
    },
    {
      href: "/inbox",
      text: texts.inbox,
      iconForDrawer: MailOutlineIcon,
    },
    {
      href: "/profiles/" + loggedInUser.url_slug + "/#projects",
      text: texts.my_projects,
      iconForDrawer: GroupWorkIcon,
    },
    {
      href: "/profiles/" + loggedInUser.url_slug + "/#organizations",
      text: texts.my_organizations,
      iconForDrawer: GroupWorkIcon,
    },
    {
      href: "/settings",
      text: texts.settings,
      iconForDrawer: SettingsIcon,
    },
    {
      avatar: true,
      href: "/profiles/" + loggedInUser.url_slug,
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

const defaultStaticLinks = (texts) => [
  {
    href: "/about",
    text: texts.about,
  },
  {
    href: "/donate",
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
    href: "https://prio1-klima.net/junge-menschen/",
    text: texts.for_young_people,
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
  return defaultStaticLinks(texts);
};
const getStaticLinks = (texts, customHubUrlSlug) => {
  return !customHubUrlSlug
    ? defaultStaticLinks(texts)
    : getCustomHubStaticLinks(customHubUrlSlug, texts);
};

const getStaticLinkFromItem = (locale, item) => {
  if (item.isExternalLink) {
    return item.href;
  }
  return `${getLocalePrefix(locale)}${item.href}`;
};

export { getLinks, getLoggedInLinks, getStaticLinks, getStaticLinkFromItem };

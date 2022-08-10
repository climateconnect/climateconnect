import {
  Avatar,
  Badge,
  Box,
  Button,
  ClickAwayListener,
  Container,
  Divider,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  SwipeableDrawer,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import GroupWorkIcon from "@material-ui/icons/GroupWork";
import HomeIcon from "@material-ui/icons/Home";
import InfoIcon from "@material-ui/icons/Info";
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import MenuIcon from "@material-ui/icons/Menu";
import NotificationsIcon from "@material-ui/icons/Notifications";
import SettingsIcon from "@material-ui/icons/Settings";
import noop from "lodash/noop";
import React, { useContext, useEffect, useState } from "react";
import { getStaticPageLinks } from "../../../public/data/getStaticPageLinks";

// Relative imports
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import Notification from "../communication/notifications/Notification";
import NotificationsBox from "../communication/notifications/NotificationsBox";
import UserContext from "../context/UserContext";
import ProfileBadge from "../profile/ProfileBadge";
import DropDownButton from "./DropDownButton";
import LanguageSelect from "./LanguageSelect";
import StaticPageLinks from "./StaticPageLinks";

const useStyles = makeStyles((theme) => {
  return {
    root: (props) => {
      return {
        zIndex: props.fixedHeader ? 20 : "auto",
        borderBottom:
          props.transparentHeader || props.isStaticPage
            ? 0
            : `1px solid ${theme.palette.grey[300]}`,
        position: props.fixedHeader ? "fixed" : "auto",
        width: props.fixedHeader ? "100%" : "auto",
        // height: props.fixedHeader ? 97 : "auto",
        top: props.fixedHeader ? 0 : "auto",
        background:
          !props.transparentHeader &&
          props.fixedHeader &&
          (props.background ? props.background : "#F8F8F8"),
        transition: "all 0.25s linear", // use all instead of transform since the background color too is changing at some point. It'll be nice to have a smooth transition.
      };
    },
    hideHeader: {
      [theme.breakpoints.down("md")]: {
        transform: "translateY(-97px)",
      },
    },
    spacingBottom: {
      marginBottom: theme.spacing(2),
    },
    container: {
      padding: theme.spacing(2),
      paddingRight: "auto",
      paddingLeft: "auto",
      [theme.breakpoints.down("md")]: {
        padding: theme.spacing(2),
      },
      [theme.breakpoints.down("sm")]: {
        padding: `${theme.spacing(0.8)}px ${theme.spacing(2)}px`,
      },
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    logoLink: {
      [theme.breakpoints.down("sm")]: {
        flex: `0 1 auto`,
        width: "calc(1.1vw + 1.3em)",
        maxWidth: "2.3rem",
        minWidth: "1.3rem",
      },
    },
    logo: {
      [theme.breakpoints.down("sm")]: {
        height: "auto",
      },
      height: 60,
    },
    buttonMarginLeft: {
      marginLeft: theme.spacing(1),
    },
    marginRight: {
      marginRight: theme.spacing(3),
    },
    loggedInRoot: {
      verticalAlign: "middle",
      marginLeft: theme.spacing(2),
      zIndex: 101,
    },
    loggedInAvatar: {
      height: 30,
      width: 30,
    },
    loggedInAvatarMobile: {
      height: 60,
      width: 60,
      display: "block",
      margin: "0 auto",
    },
    loggedInLink: {
      color: theme.palette.primary.main,
      width: "100%",
    },
    linkContainer: {
      display: "flex",
      alignItems: "center",
      maxWidth: "calc(100% - 200px)",
      [theme.breakpoints.down("md")]: {
        maxWidth: "calc(100% - 150px)",
      },
      [theme.breakpoints.down("sm")]: {
        maxWidth: "calc(100% - 35px)",
      },
      justifyContent: "space-around",
    },
    menuLink: (props) => ({
      color: props.transparentHeader ? "white" : theme.palette.primary.main,
      textDecoration: "inherit",
    }),
    shareProjectButton: {
      height: 36,
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    notificationsHeadline: {
      padding: theme.spacing(2),
      textAlign: "center",
    },
    loggedInLinksFixedHeader: {
      zIndex: 30,
    },
    loggedInPopper: {
      zIndex: 30,
    },
    normalScreenIcon: {
      fontSize: 20,
      marginRight: theme.spacing(0.25),
    },
    mobileAvatarContainer: {
      display: "flex",
      justifyContent: "center",
    },
  };
});

const getLinks = (path_to_redirect, texts) => [
  {
    href: "/browse",
    text: texts.browse,
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
  },
  {
    href: "/share",
    text: texts.share_a_project,
    mediumScreenText: texts.share,
    iconForDrawer: AddCircleIcon,
    isFilledInHeader: true,
    className: "shareProjectButton",
    vanillaIfLoggedOut: true,
  },
  {
    type: "languageSelect",
    alwaysDisplayDirectly: true,
  },
  {
    type: "notificationsButton",
    text: texts.inbox,
    iconForDrawer: NotificationsIcon,
    hasBadge: true,
    onlyShowIconOnNormalScreen: true,
    onlyShowIconOnMobile: true,
    className: "notificationsButton",
    icon: NotificationsIcon,
    alwaysDisplayDirectly: true,
    onlyShowLoggedIn: true,
  },
  {
    href: "/signin?redirect=" + path_to_redirect,
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
];

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

export default function Header({
  className,
  noSpacingBottom,
  isStaticPage,
  fixedHeader,
  transparentHeader,
  background,
}) {
  const classes = useStyles({
    fixedHeader: fixedHeader,
    transparentHeader: transparentHeader,
    isStaticPage: isStaticPage,
    background: background,
  });
  const { user, signOut, notifications, pathName, locale } = useContext(UserContext);
  const texts = getTexts({ page: "navigation", locale: locale });
  const [anchorEl, setAnchorEl] = React.useState(false);
  const isNarrowScreen = useMediaQuery((theme) => theme.breakpoints.down("xs"));
  const isMediumScreen = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const LINKS = getLinks(pathName, texts);
  const toggleShowNotifications = (event) => {
    if (!anchorEl) setAnchorEl(event.currentTarget);
    else setAnchorEl(null);
  };
  const localePrefix = getLocalePrefix(locale);

  const onNotificationsClose = () => setAnchorEl(null);

  const getLogo = () => {
    if (isMediumScreen) {
      return transparentHeader ? "/images/logo_white_no_text.svg" : "/images/logo_no_text.svg";
    }
    return transparentHeader ? "/images/logo_white.png" : "/images/logo.png";
  };

  const logo = getLogo();
  const [hideHeader, setHideHeader] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setHideHeader(window.scrollY > lastScrollY); // hide when user scrolls down and show when user scrolls up

      // remember last scroll position
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <Box
      component="header"
      className={`${classes.root} ${className} ${!noSpacingBottom && classes.spacingBottom} ${
        hideHeader ? classes.hideHeader : ""
      }`}
    >
      <Container className={classes.container}>
        <Link href={localePrefix + "/"} className={classes.logoLink}>
          <img src={logo} alt={texts.climate_connect_logo} className={classes.logo} />
        </Link>
        {isNarrowScreen ? (
          <NarrowScreenLinks
            loggedInUser={user}
            handleLogout={signOut}
            anchorEl={anchorEl}
            toggleShowNotifications={toggleShowNotifications}
            onNotificationsClose={onNotificationsClose}
            notifications={notifications}
            transparentHeader={transparentHeader}
            fixedHeader={fixedHeader}
            LINKS={LINKS}
            texts={texts}
            localePrefix={localePrefix}
          />
        ) : (
          <NormalScreenLinks
            loggedInUser={user}
            handleLogout={signOut}
            anchorEl={anchorEl}
            toggleShowNotifications={toggleShowNotifications}
            onNotificationsClose={onNotificationsClose}
            notifications={notifications}
            transparentHeader={transparentHeader}
            fixedHeader={fixedHeader}
            LINKS={LINKS}
            texts={texts}
            localePrefix={localePrefix}
            isStaticPage={isStaticPage}
          />
        )}
      </Container>
      <div>{isStaticPage && <StaticPageLinks />}</div>
    </Box>
  );
}

function NormalScreenLinks({
  loggedInUser,
  handleLogout,
  anchorEl,
  toggleShowNotifications,
  onNotificationsClose,
  notifications,
  transparentHeader,
  fixedHeader,
  LINKS,
  texts,
  localePrefix,
  isStaticPage,
}) {
  const classes = useStyles({ fixedHeader: fixedHeader, transparentHeader: transparentHeader });
  const isSmallMediumScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  const STATIC_PAGE_LINKS = getStaticPageLinks(texts);
  return (
    <Box className={classes.linkContainer}>
      {LINKS.filter(
        (link) =>
          !(loggedInUser && link.onlyShowLoggedOut) &&
          !(!loggedInUser && link.onlyShowLoggedIn) &&
          !link.showOnMobileOnly
      ).map((link, index) => {
        const buttonProps = getLinkButtonProps({
          link: link,
          index: index,
          loggedInUser: loggedInUser,
          classes: classes,
          transparentHeader: transparentHeader,
          toggleShowNotifications: toggleShowNotifications,
          localePrefix: localePrefix,
        });
        const Icon = link.icon;

        if (
          !(isMediumScreen && link.hideOnMediumScreen) &&
          !(isStaticPage && link.hideOnStaticPages)
        )
          return (
            <React.Fragment key={index}>
              <span className={classes.menuLink}>
                {link.type === "languageSelect" ? (
                  <LanguageSelect transparentHeader={transparentHeader} />
                ) : link.onlyShowIconOnNormalScreen ? (
                  <>
                    <IconButton {...buttonProps} className={classes.link}>
                      {link.hasBadge && notifications && notifications.length > 0 ? (
                        <Badge badgeContent={notifications.length} color="error">
                          <Icon />
                        </Badge>
                      ) : (
                        <Icon />
                      )}
                    </IconButton>
                    {link.type === "notificationsButton" && anchorEl && (
                      <NotificationsBox
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={onNotificationsClose}
                      >
                        <Typography
                          className={classes.notificationsHeadline}
                          component="h1"
                          variant="h5"
                        >
                          {texts.notifications}
                        </Typography>
                        <Divider />
                        {notifications && notifications.length > 0 ? (
                          notifications.map((n, index) => (
                            <Notification key={index} notification={n} />
                          ))
                        ) : (
                          <Notification key={index} isPlaceholder />
                        )}
                      </NotificationsBox>
                    )}
                  </>
                ) : link?.showStaticLinksInDropdown ? (
                  <DropDownButton options={STATIC_PAGE_LINKS} buttonProps={{ ...buttonProps }}>
                    {isMediumScreen && link.mediumScreenText ? link.mediumScreenText : link.text}
                  </DropDownButton>
                ) : link?.showJustIconUnderSm && isSmallMediumScreen ? (
                  <IconButton {...buttonProps} className={classes.link}>
                    <link.showJustIconUnderSm />
                  </IconButton>
                ) : (
                  <Button color="primary" {...buttonProps}>
                    {link.icon && !(link.hideDesktopIconUnderSm && isSmallMediumScreen) && (
                      <link.icon className={classes.normalScreenIcon} />
                    )}
                    {isMediumScreen && link.mediumScreenText ? link.mediumScreenText : link.text}
                  </Button>
                )}
              </span>
            </React.Fragment>
          );
      })}
      {loggedInUser && (
        <LoggedInNormalScreen
          loggedInUser={loggedInUser}
          handleLogout={handleLogout}
          fixedHeader={fixedHeader}
          texts={texts}
          localePrefix={localePrefix}
        />
      )}
    </Box>
  );
}

function NarrowScreenLinks({
  loggedInUser,
  handleLogout,
  anchorEl,
  toggleShowNotifications,
  onNotificationsClose,
  notifications,
  transparentHeader,
  fixedHeader,
  LINKS,
  texts,
  localePrefix,
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = setIsDrawerOpen.bind(null, true);
  const closeDrawer = setIsDrawerOpen.bind(null, false);
  const classes = useStyles({ fixedHeader: fixedHeader, transparentHeader: transparentHeader });
  const linksOutsideDrawer = LINKS.filter(
    (link) =>
      link.alwaysDisplayDirectly &&
      !(loggedInUser && link.onlyShowLoggedOut) &&
      !(!loggedInUser && link.onlyShowLoggedIn)
  );
  return (
    <>
      <Box>
        {linksOutsideDrawer.map((link, index) => {
          const Icon = link.iconForDrawer;
          const buttonProps = getLinkButtonProps({
            link: link,
            index: index,
            loggedInUser: loggedInUser,
            classes: classes,
            transparentHeader: transparentHeader,
            toggleShowNotifications: toggleShowNotifications,
            isNarrowScreen: true,
            linksOutsideDrawer: linksOutsideDrawer,
            localePrefix: localePrefix,
          });
          if (index === linksOutsideDrawer.length - 1) {
            buttonProps.className = classes.marginRight;
          }
          return (
            <React.Fragment key={index}>
              {link.onlyShowIconOnMobile ? (
                <>
                  <IconButton color="primary" className={classes.marginRight} {...buttonProps}>
                    {link.hasBadge && notifications && notifications.length > 0 ? (
                      <Badge badgeContent={notifications.length} color="error">
                        <Icon />
                      </Badge>
                    ) : (
                      <Icon />
                    )}
                  </IconButton>
                  {link.type === "notificationsButton" && anchorEl && (
                    <NotificationsBox
                      anchorEl={anchorEl}
                      keepMounted
                      open={Boolean(anchorEl)}
                      onClose={onNotificationsClose}
                    >
                      <Typography
                        className={classes.notificationsHeadline}
                        component="h1"
                        variant="h5"
                      >
                        {texts.notifications}
                      </Typography>
                      <Divider />
                      {notifications && notifications.length > 0 ? (
                        notifications.map((n, index) => (
                          <Notification key={index} notification={n} />
                        ))
                      ) : (
                        <Notification key={index} isPlaceholder />
                      )}
                    </NotificationsBox>
                  )}
                </>
              ) : (
                <span className={classes.menuLink}>
                  {link.type === "languageSelect" ? (
                    <LanguageSelect transparentHeader={transparentHeader} />
                  ) : (
                    <Button color="primary" {...buttonProps} key={index}>
                      {link.text}
                    </Button>
                  )}
                </span>
              )}
            </React.Fragment>
          );
        })}
        <span className={classes.menuLink}>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={openDrawer}>
            <MenuIcon />
          </IconButton>
        </span>
        <SwipeableDrawer
          anchor="right"
          open={isDrawerOpen}
          // `onOpen` is a required property, even though we don't use it.
          onOpen={noop}
          onClose={closeDrawer}
          disableBackdropTransition={true}
        >
          <List styles={{ height: "100vh" }}>
            {LINKS.filter(
              (link) =>
                !link.alwaysDisplayDirectly &&
                !(loggedInUser && link.onlyShowLoggedOut) &&
                !(!loggedInUser && link.onlyShowLoggedIn)
            ).map((link, index) => {
              const Icon = link.iconForDrawer;
              return (
                <Link href={localePrefix + link.href} key={index}>
                  <ListItem button component="a" onClick={closeDrawer}>
                    <ListItemIcon>
                      <Icon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={link.text} />
                  </ListItem>
                </Link>
              );
            })}
            {loggedInUser &&
              getLoggedInLinks({ loggedInUser: loggedInUser, texts: texts }).map((link, index) => {
                const Icon = link.iconForDrawer;
                const avatarProps = {
                  className: classes.loggedInAvatarMobile,
                  src: getImageUrl(loggedInUser.image),
                  alt: loggedInUser.name,
                };
                if (link.avatar)
                  return (
                    <div className={classes.mobileAvatarContainer}>
                      {loggedInUser?.badges?.length > 0 ? (
                        <ProfileBadge
                          badge={loggedInUser?.badges[0]}
                          size="medium"
                          className={classes.badge}
                        >
                          <Avatar {...avatarProps} />
                        </ProfileBadge>
                      ) : (
                        <Avatar {...avatarProps} />
                      )}
                    </div>
                  );
                else if (link.isLogoutButton)
                  return (
                    <ListItem button component="a" key={index} onClick={handleLogout}>
                      <ListItemIcon>
                        <Icon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={link.text} />
                    </ListItem>
                  );
                else
                  return (
                    <Link href={localePrefix + link.href} key={index}>
                      <ListItem button component="a" onClick={closeDrawer}>
                        <ListItemIcon>
                          <Icon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={link.text} />
                      </ListItem>
                    </Link>
                  );
              })}
          </List>
        </SwipeableDrawer>
      </Box>
    </>
  );
}

const LoggedInNormalScreen = ({ loggedInUser, handleLogout, fixedHeader, texts, localePrefix }) => {
  const classes = useStyles();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  const avatarProps = {
    className: classes.loggedInAvatar,
    src: getImageUrl(loggedInUser.image),
    alt: loggedInUser.name,
  };

  return (
    <ClickAwayListener onClickAway={handleCloseMenu}>
      <Box className={classes.loggedInRoot}>
        <Button
          onClick={handleToggleMenu}
          disableElevation
          disableRipple
          disableFocusRipple
          style={{ backgroundColor: "transparent" }}
          ref={anchorRef}
        >
          {loggedInUser?.badges?.length > 0 ? (
            <ProfileBadge badge={loggedInUser?.badges[0]} size="small" className={classes.badge}>
              <Avatar {...avatarProps} />
            </ProfileBadge>
          ) : (
            <Avatar {...avatarProps} />
          )}
          <ArrowDropDownIcon />
        </Button>
        <Popper
          open={menuOpen}
          anchorEl={anchorRef.current}
          className={`${fixedHeader && classes.loggedInLinksFixedHeader} ${classes.loggedInPopper}`}
        >
          <Paper>
            <MenuList>
              {getLoggedInLinks({ loggedInUser: loggedInUser, texts: texts })
                .filter((link) => !link.showOnMobileOnly)
                .map((link, index) => {
                  const menuItemProps = {
                    component: "button",
                    className: classes.loggedInLink,
                  };
                  if (link.isLogoutButton) menuItemProps.onClick = handleLogout;
                  else menuItemProps.href = localePrefix + link.href;
                  return (
                    <MenuItem
                      key={index}
                      component="button"
                      className={classes.loggedInLink}
                      onClick={link.isLogoutButton && handleLogout}
                      href={!link.isLogoutButton ? localePrefix + link.href : undefined}
                    >
                      {link.text}
                    </MenuItem>
                  );
                })}
            </MenuList>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

const getLinkButtonProps = ({
  link,
  index,
  loggedInUser,
  classes,
  transparentHeader,
  toggleShowNotifications,
  isNarrowScreen,
  linksOutsideDrawer,
  localePrefix,
}) => {
  const buttonProps = {};
  if (!isNarrowScreen && index !== 0) {
    if (link.className) buttonProps.className = classes[link.className];
    else buttonProps.className = classes.buttonMarginLeft;
  }
  if ((isNarrowScreen || loggedInUser || !link.vanillaIfLoggedOut) && link.isOutlinedInHeader) {
    buttonProps.variant = "outlined";
  }
  const contained =
    !isNarrowScreen && (loggedInUser || !link.vanillaIfLoggedOut) && link.isFilledInHeader;
  if (contained) {
    buttonProps.variant = "contained";
  }

  if (!isNarrowScreen && (loggedInUser || !link.vanillaIfLoggedOut) && link.icon) {
    buttonProps.starticon = <link.icon />;
  }

  if (!transparentHeader) buttonProps.color = "primary";
  else if (!contained && link.type !== "notificationsButton") buttonProps.color = "inherit";
  if (link.type === "notificationsButton") buttonProps.onClick = toggleShowNotifications;
  if (link.href) buttonProps.href = localePrefix + link.href;
  if (isNarrowScreen && index === linksOutsideDrawer.length - 1) {
    buttonProps.className = classes.marginRight;
  }
  return buttonProps;
};

import React, { useState } from "react";
import noop from "lodash/noop";
import {
  Box,
  Container,
  Button,
  IconButton,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Avatar,
  MenuList,
  MenuItem,
  Popper,
  Paper,
  ClickAwayListener,
  Link,
  Typography,
  Divider
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useContext } from "react";
import UserContext from "./../context/UserContext";

import MenuIcon from "@material-ui/icons/Menu";
import InfoIcon from "@material-ui/icons/Info";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import SettingsIcon from "@material-ui/icons/Settings";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import GroupWorkIcon from "@material-ui/icons/GroupWork";
import { getImageUrl } from "../../../public/lib/imageOperations";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import MailOutlineIcon from "@material-ui/icons/MailOutline";
import NotificationsIcon from "@material-ui/icons/Notifications";
import NotificationsBox from "../communication/notifications/NotificationsBox";
import Notification from "../communication/notifications/Notification";
import HomeIcon from "@material-ui/icons/Home";
import theme from "../../themes/theme";

const useStyles = makeStyles(theme => {
  return {
    root: props => {
      return {
        zIndex: props.fixedHeader ? 20 : "auto",
        borderBottom:
          props.transparentHeader || props.isStaticPage
            ? 0
            : `1px solid ${theme.palette.grey[300]}`,
        position: props.fixedHeader ? "fixed" : "auto",
        width: props.fixedHeader ? "100%" : "auto",
        height: props.fixedHeader ? 97 : "auto",
        top: props.fixedHeader ? 0 : "auto",
        background: !props.transparentHeader && props.fixedHeader && "#F8F8F8"
      };
    },
    spacingBottom: {
      marginBottom: theme.spacing(2)
    },
    container: {
      padding: theme.spacing(2),
      paddingRight: "auto",
      paddingLeft: "auto",
      [theme.breakpoints.down("md")]: {
        padding: theme.spacing(2)
      },
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
    logo: {
      height: 60
    },
    buttonMarginLeft: {
      marginLeft: theme.spacing(1)
    },
    marginRight: {
      marginRight: theme.spacing(3)
    },
    loggedInRoot: {
      display: "inline-block",
      verticalAlign: "middle",
      marginLeft: theme.spacing(2)
    },
    loggedInAvatar: {
      height: 30,
      width: 30
    },
    loggedInAvatarMobile: {
      height: 60,
      width: 60,
      display: "block",
      margin: "0 auto"
    },
    loggedInLink: {
      color: theme.palette.primary.main,
      width: "100%"
    },
    linkContainer: {
      display: "flex",
      alignItems: "center",
      maxWidth: "calc(100% - 200px)",
      [theme.breakpoints.down("md")]: {
        maxWidth: "calc(100% - 150px)"
      },
      justifyContent: "space-around"
    },
    menuLink: props => ({
      color: props.transparentHeader ? "white" : theme.palette.primary.main,
      textDecoration: "inherit"
    }),
    shareProjectButton: {
      height: 36,
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2)
    },
    staticPageLinksWrapper: {
      width: "100%",
      height: 50,
      background: theme.palette.primary.main
    },
    staticPageLinksContainer: {
      width: "100%",
      maxWidth: 1280,
      height: "100%"
    },
    staticPageLinks: {
      float: "right",
      display: "inline-flex",
      height: "100%",
      alignItems: "center",
      [theme.breakpoints.down("xs")]: {
        width: "100%",
        justifyContent: "space-between"
      }
    },
    staticPageLink: {
      paddingLeft: theme.spacing(2),
      marginLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      marginRight: theme.spacing(2),
      fontSize: 16,
      fontWeight: 600,
      textDecoration: "inherit",
      color: "white",
      [theme.breakpoints.down("xs")]: {
        padding: 0
      }
    },
    currentStaticPageLink: {
      textDecoration: "underline"
    },
    notificationsHeadline: {
      padding: theme.spacing(2),
      textAlign: "center"
    },
    loggedInLinksFixedHeader: {
      zIndex: 30
    }
  };
});

const getLinks = path_to_redirect => [
  {
    href: "/browse",
    text: "Browse",
    iconForDrawer: HomeIcon
  },
  {
    href: "/about",
    text: "About",
    iconForDrawer: InfoIcon
  },
  {
    href: "/donate",
    text: "Donate",
    iconForDrawer: FavoriteBorderIcon,
    isOutlinedInHeader: true,
    icon: FavoriteBorderIcon,
    vanillaIfLoggedOut: true
  },
  {
    href: "/share",
    text: "Share a project",
    mediumScreenText: "Share",
    iconForDrawer: AddCircleIcon,
    isFilledInHeader: true,
    className: "shareProjectButton",
    vanillaIfLoggedOut: true
  },
  {
    type: "notificationsButton",
    text: "Inbox",
    iconForDrawer: NotificationsIcon,
    hasBadge: true,
    onlyShowIconOnNormalScreen: true,
    onlyShowIconOnMobile: true,
    className: "notificationsButton",
    icon: NotificationsIcon,
    alwaysDisplayDirectly: true,
    onlyShowLoggedIn: true
  },
  {
    href: "/signin?redirect=" + path_to_redirect,
    text: "Log in",
    iconForDrawer: AccountCircleIcon,
    isOutlinedInHeader: true,
    onlyShowLoggedOut: true,
    alwaysDisplayDirectly: true
  },
  {
    href: "/signup",
    text: "Sign up",
    iconForDrawer: AccountCircleIcon,
    isOutlinedInHeader: true,
    onlyShowLoggedOut: true
  }
];

const STATIC_PAGE_LINKS = [
  {
    href: "/about",
    text: "About"
  },
  {
    href: "/donate",
    text: "Donate"
  },
  {
    href: "/faq",
    text: "FAQ"
  }
];

const getLoggedInLinks = ({ loggedInUser }) => {
  return [
    {
      href: "/profiles/" + loggedInUser.url_slug,
      text: "My Profile",
      iconForDrawer: AccountCircleIcon
    },
    {
      href: "/inbox",
      text: "Inbox",
      iconForDrawer: MailOutlineIcon
    },
    {
      href: "/profiles/" + loggedInUser.url_slug + "/#projects",
      text: "My Projects",
      iconForDrawer: GroupWorkIcon
    },
    {
      href: "/settings",
      text: "Settings",
      iconForDrawer: SettingsIcon
    },
    {
      avatar: true,
      href: "/profiles/" + loggedInUser.url_slug,
      src: loggedInUser.image,
      alt: loggedInUser.name,
      showOnMobileOnly: true
    },
    {
      isLogoutButton: true,
      text: "Log out",
      iconForDrawer: ExitToAppIcon
    }
  ];
};

export default function Header({
  className,
  noSpacingBottom,
  isStaticPage,
  fixedHeader,
  transparentHeader
}) {
  const classes = useStyles({
    fixedHeader: fixedHeader,
    transparentHeader: transparentHeader,
    isStaticPage: isStaticPage
  });
  const { user, signOut, notifications, pathName } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = React.useState(false);
  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("xs"));
  const LINKS = getLinks(pathName);
  const toggleShowNotifications = event => {
    if (!anchorEl) setAnchorEl(event.currentTarget);
    else setAnchorEl(null);
  };

  const onNotificationsClose = () => setAnchorEl(null);

  return (
    <Box
      component="header"
      className={`${classes.root} ${className} ${!noSpacingBottom && classes.spacingBottom}`}
    >
      <Container className={classes.container}>
        <Link href="/">
          <img
            src={transparentHeader ? "/images/logo_white_beta.svg" : "/images/logo.png"}
            alt="Climate Connect logo"
            className={classes.logo}
          />
        </Link>
        {process.env.PRE_LAUNCH === "true" ? (
          <></>
        ) : (
          <>
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
              />
            )}
          </>
        )}
      </Container>
      <div>{isStaticPage && <StaticPageLinks />}</div>
    </Box>
  );
}

function StaticPageLinks() {
  const classes = useStyles();
  return (
    <div className={classes.staticPageLinksWrapper}>
      <Container className={classes.staticPageLinksContainer}>
        <div className={classes.staticPageLinks}>
          {STATIC_PAGE_LINKS.map((link, index) => {
            return (
              <Link
                href={link.href}
                key={index + "-" + link.text}
                className={`${classes.staticPageLink} ${window.location.href.includes(link.href) &&
                  classes.currentStaticPageLink}`}
              >
                {link.text}
              </Link>
            );
          })}
        </div>
      </Container>
    </div>
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
  LINKS
}) {
  const classes = useStyles({ fixedHeader: fixedHeader, transparentHeader: transparentHeader });
  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Box className={classes.linkContainer}>
      {LINKS.filter(
        link =>
          !(loggedInUser && link.onlyShowLoggedOut) &&
          !(!loggedInUser && link.onlyShowLoggedIn) &&
          !link.showOnMobileOnly
      ).map((link, index) => {
        const buttonProps = getLinkButtonProps(
          link,
          index,
          loggedInUser,
          classes,
          transparentHeader,
          toggleShowNotifications
        );
        const Icon = link.icon;
        if (!(isMediumScreen && link.hideOnMediumScreen))
          return (
            <React.Fragment key={index}>
              <span className={classes.menuLink}>
                {link.onlyShowIconOnNormalScreen ? (
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
                          Notifications
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
                  <Button color="primary" {...buttonProps}>
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
  LINKS
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = setIsDrawerOpen.bind(null, true);
  const closeDrawer = setIsDrawerOpen.bind(null, false);
  const classes = useStyles({ fixedHeader: fixedHeader, transparentHeader: transparentHeader });
  const linksOutsideDrawer = LINKS.filter(
    link =>
      link.alwaysDisplayDirectly &&
      !(loggedInUser && link.onlyShowLoggedOut) &&
      !(!loggedInUser && link.onlyShowLoggedIn)
  );
  return (
    <>
      <Box>
        {linksOutsideDrawer.map((link, index) => {
          const Icon = link.iconForDrawer;
          const buttonProps = getLinkButtonProps(
            link,
            index,
            loggedInUser,
            classes,
            transparentHeader,
            toggleShowNotifications,
            true,
            linksOutsideDrawer
          );
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
                        Notifications
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
                  <Button color="primary" {...buttonProps} key={index}>
                    {link.text}
                  </Button>
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
              link =>
                !link.alwaysDisplayDirectly &&
                !(loggedInUser && link.onlyShowLoggedOut) &&
                !(!loggedInUser && link.onlyShowLoggedIn)
            ).map((link, index) => {
              const Icon = link.iconForDrawer;
              return (
                <Link href={link.href} key={index}>
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
              getLoggedInLinks({ loggedInUser }).map((link, index) => {
                const Icon = link.iconForDrawer;
                if (link.avatar)
                  return (
                    <Link href={link.href} key={index}>
                      <Avatar
                        className={classes.loggedInAvatarMobile}
                        src={getImageUrl(loggedInUser.image)}
                        alt={loggedInUser.name}
                      />
                    </Link>
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
                    <Link href={link.href} key={index}>
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

const LoggedInNormalScreen = ({ loggedInUser, handleLogout, fixedHeader }) => {
  const classes = useStyles();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const handleToggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  return (
    <Box className={classes.loggedInRoot}>
      <Button
        onClick={handleToggleMenu}
        disableElevation
        disableRipple
        disableFocusRipple
        style={{ backgroundColor: "transparent" }}
        ref={anchorRef}
      >
        <Avatar
          className={classes.loggedInAvatar}
          src={getImageUrl(loggedInUser.image)}
          alt={loggedInUser.name}
        />
        <ArrowDropDownIcon />
      </Button>
      <Popper
        open={menuOpen}
        anchorEl={anchorRef.current}
        className={fixedHeader && classes.loggedInLinksFixedHeader}
      >
        <ClickAwayListener onClickAway={handleCloseMenu}>
          <Paper>
            <MenuList>
              {getLoggedInLinks({ loggedInUser })
                .filter(link => !link.showOnMobileOnly)
                .map((link, index) => {
                  const menuItemProps = {
                    component: "button",
                    className: classes.loggedInLink
                  };
                  if (link.isLogoutButton) menuItemProps.onClick = handleLogout;
                  else menuItemProps.href = link.href;
                  return (
                    <MenuItem
                      key={index}
                      component="button"
                      className={classes.loggedInLink}
                      onClick={link.isLogoutButton && handleLogout}
                      href={!link.isLogoutButton && link.href}
                    >
                      {link.text}
                    </MenuItem>
                  );
                })}
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
};

const getLinkButtonProps = (
  link,
  index,
  loggedInUser,
  classes,
  transparentHeader,
  toggleShowNotifications,
  isNarrowScreen,
  linksOutsideDrawer
) => {
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
    buttonProps.startIcon = <link.icon />;
  }
  if (!transparentHeader) buttonProps.color = "primary";
  else if (!contained && link.type !== "notificationsButton") buttonProps.color = "inherit";
  if (link.type === "notificationsButton") buttonProps.onClick = toggleShowNotifications;
  if (link.href) buttonProps.href = link.href;
  if (isNarrowScreen && index === linksOutsideDrawer.length - 1) {
    buttonProps.className = classes.marginRight;
  }
  return buttonProps;
};

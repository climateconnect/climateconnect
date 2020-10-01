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

const useStyles = makeStyles(theme => {
  return {
    root: {
      borderBottom: `1px solid ${theme.palette.grey[300]}`
    },
    spacingBottom: {
      marginBottom: theme.spacing(2)
    },
    container: {
      padding: theme.spacing(2),
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
      color: theme.palette.primary.main
    },
    menuLink: {
      color: theme.palette.primary.main,
      textDecoration: "inherit"
    },
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
      background: "#E5E5E5"
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
      fontWeight: "bold",
      textDecoration: "inherit",
      color: theme.palette.primary.main,
      [theme.breakpoints.down("xs")]: {
        padding: 0
      }
    },
    notificationsHeadline: {
      padding: theme.spacing(2),
      textAlign: "center"
    }
  };
});

const LINKS = [
  {
    href: "/",
    text: "Home",
    iconForDrawer: HomeIcon,
    onlyShowIconOnNormalScreen: true,
    icon: HomeIcon
  },
  {
    href: "/about",
    text: "About",
    iconForDrawer: InfoIcon
  },
  {
    href: "/support",
    text: "Donate",
    iconForDrawer: FavoriteBorderIcon,
    isOutlinedInHeader: true,
    icon: FavoriteBorderIcon,
    vanillaIfLoggedOut: true
  },
  {
    href: "/share",
    text: "Share a project",
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
    href: "/signin",
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
    text: "About Us"
  },
  {
    href: "/support",
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

export default function Header({ className, noSpacingBottom, isStaticPage }) {
  const classes = useStyles();
  const { user, signOut, notifications } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = React.useState(false);
  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("xs"));

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
          <a>
            <img src="/images/logo.png" alt="Climate Connect" className={classes.logo} />
          </a>
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
              />
            ) : (
              <NormalScreenLinks
                loggedInUser={user}
                handleLogout={signOut}
                anchorEl={anchorEl}
                toggleShowNotifications={toggleShowNotifications}
                onNotificationsClose={onNotificationsClose}
                notifications={notifications}
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
          {STATIC_PAGE_LINKS.map((link, index) => (
            <Link href={link.href} key={index + "-" + link.text}>
              <a className={classes.staticPageLink}>{link.text}</a>
            </Link>
          ))}
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
  notifications
}) {
  const classes = useStyles();
  return (
    <Box>
      {LINKS.filter(
        link =>
          !(loggedInUser && link.onlyShowLoggedOut) &&
          !(!loggedInUser && link.onlyShowLoggedIn) &&
          !link.showOnMobileOnly
      ).map((link, index) => {
        const buttonProps = {};
        if (index !== 0) {
          if (link.className) buttonProps.className = classes[link.className];
          else buttonProps.className = classes.buttonMarginLeft;
        }
        if ((loggedInUser || !link.vanillaIfLoggedOut) && link.isOutlinedInHeader) {
          buttonProps.variant = "outlined";
        }
        if ((loggedInUser || !link.vanillaIfLoggedOut) && link.isFilledInHeader) {
          buttonProps.variant = "contained";
        }
        if ((loggedInUser || !link.vanillaIfLoggedOut) && link.icon) {
          buttonProps.startIcon = <link.icon />;
        }
        if (link.type === "notificationsButton") buttonProps.onClick = toggleShowNotifications;
        if (link.href) buttonProps.href = link.href;
        const Icon = link.icon;
        return (
          <React.Fragment key={index}>
            <span className={classes.menuLink}>
              {link.onlyShowIconOnNormalScreen ? (
                <>
                  <IconButton color="primary" {...buttonProps} className={classes.link}>
                    {link.hasBadge && notifications.length > 0 ? (
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
                      {notifications.length > 0 ? (
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
                  {link.text}
                </Button>
              )}
            </span>
          </React.Fragment>
        );
      })}
      {loggedInUser && (
        <LoggedInNormalScreen loggedInUser={loggedInUser} handleLogout={handleLogout} />
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
  notifications
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = setIsDrawerOpen.bind(null, true);
  const closeDrawer = setIsDrawerOpen.bind(null, false);
  const classes = useStyles();
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
          const buttonProps = {};
          if (link.isOutlinedInHeader) {
            buttonProps.variant = "outlined";
          }
          if (index === linksOutsideDrawer.length - 1) {
            buttonProps.className = classes.marginRight;
          }
          if (link.type === "notificationsButton") buttonProps.onClick = toggleShowNotifications;
          if (link.href) buttonProps.href = link.href;
          return (
            <React.Fragment key={index}>
              {link.onlyShowIconOnMobile ? (
                <>
                  <IconButton color="primary" className={classes.marginRight} {...buttonProps}>
                    {link.hasBadge && notifications.length > 0 > 0 ? (
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
                      {notifications.length > 0 ? (
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
                <Button color="primary" {...buttonProps} key={index}>
                  {link.text}
                </Button>
              )}
            </React.Fragment>
          );
        })}
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={openDrawer}>
          <MenuIcon />
        </IconButton>
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

const LoggedInNormalScreen = ({ loggedInUser, handleLogout }) => {
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
      <Popper open={menuOpen} anchorEl={anchorRef.current}>
        <ClickAwayListener onClickAway={handleCloseMenu}>
          <Paper>
            <MenuList>
              {getLoggedInLinks({ loggedInUser })
                .filter(link => !link.showOnMobileOnly)
                .map((link, index) => (
                  <React.Fragment key={index}>
                    {link.isLogoutButton ? (
                      <MenuItem
                        key={index}
                        component="button"
                        onClick={handleLogout}
                        className={classes.loggedInLink}
                      >
                        {link.text}
                      </MenuItem>
                    ) : (
                      <MenuItem
                        key={index}
                        component="button"
                        href={link.href}
                        className={classes.loggedInLink}
                      >
                        {link.text}
                      </MenuItem>
                    )}
                  </React.Fragment>
                ))}
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
};

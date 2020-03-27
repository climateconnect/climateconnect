import React, { useState } from "react";
import noop from "lodash/noop";
import Link from "next/link";
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
  ClickAwayListener
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import MenuIcon from "@material-ui/icons/Menu";
import InfoIcon from "@material-ui/icons/Info";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import NotificationsIcon from "@material-ui/icons/Notifications";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import SettingsIcon from "@material-ui/icons/Settings";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";

const LINKS = [
  {
    href: "/about",
    text: "About",
    iconForDrawer: InfoIcon
  },
  {
    href: "/create",
    text: "Create a project",
    iconForDrawer: AddCircleIcon
  },
  {
    href: "/inbox",
    text: "Inbox",
    iconForDrawer: NotificationsIcon,
    hasBadge: true,
    //TODO: replace by user's unread notifications
    badgeNumber: 3,
    onlyShowIconOnNormalScreen: true,
    onlyShowIconOnMobile: true,
    icon: NotificationsIcon,
    alwaysDisplayDirectly: true,
    onlyShowLoggedIn: true
  },
  {
    href: "/signin",
    text: "Sign in",
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
    onlyShowLoggedOut: true,
    showOnMobileOnly: true
  }
];

const getLoggedInLinks = ({ loggedInUser }) => {
  return [
    {
      href: "/profiles/" + loggedInUser.url,
      text: "My Profile",
      iconForDrawer: AccountCircleIcon
    },
    {
      href: "/settings",
      text: "Settings",
      iconForDrawer: SettingsIcon
    },
    {
      avatar: true,
      href: "/profiles/" + loggedInUser.url,
      src: loggedInUser.image,
      alt: loggedInUser.name,
      showOnMobileOnly: true
    },
    {
      href: "/logouts",
      text: "Log out",
      iconForDrawer: ExitToAppIcon
    }
  ];
};

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
      width: 30,
      display: "inline-block"
    },
    loggedInAvatarMobile: {
      height: 60,
      width: 60,
      display: "block",
      margin: "0 auto"
    },
    menuLink: {
      color: theme.palette.primary.main,
      textDecoration: "inherit"
    }
  };
});

export default function Header({ className, noSpacingBottom, loggedInUser }) {
  const classes = useStyles();

  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("xs"));

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
              <NarrowScreenLinks loggedInUser={loggedInUser} />
            ) : (
              <NormalScreenLinks loggedInUser={loggedInUser} />
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

function NormalScreenLinks({ loggedInUser }) {
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
          buttonProps.className = classes.buttonMarginLeft;
        }
        if (link.isOutlinedInHeader) {
          buttonProps.variant = "outlined";
        }
        const Icon = link.icon;
        return (
          <Link href={link.href} key={link.href}>
            {link.onlyShowIconOnNormalScreen ? (
              <IconButton color="primary" {...buttonProps}>
                {link.hasBadge && link.badgeNumber > 0 ? (
                  <Badge badgeContent={link.badgeNumber} color="error">
                    <Icon />
                  </Badge>
                ) : (
                  <Icon />
                )}
              </IconButton>
            ) : (
              <Button color="primary" {...buttonProps}>
                {link.text}
              </Button>
            )}
          </Link>
        );
      })}
      {loggedInUser && <LoggedInNormalScreen loggedInUser={loggedInUser} />}
    </Box>
  );
}

function NarrowScreenLinks({ loggedInUser }) {
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
          return (
            <Link href={link.href} key={link.href}>
              {link.onlyShowIconOnMobile ? (
                <IconButton color="primary" className={classes.marginRight}>
                  {link.hasBadge && link.badgeNumber > 0 ? (
                    <Badge badgeContent={link.badgeNumber} color="error">
                      <Icon />
                    </Badge>
                  ) : (
                    <Icon />
                  )}
                </IconButton>
              ) : (
                <Button color="primary" {...buttonProps}>
                  {link.text}
                </Button>
              )}
            </Link>
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
                      <Icon />
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
                        src={loggedInUser.image}
                        alt={loggedInUser.name}
                      />
                    </Link>
                  );
                else
                  return (
                    <Link href={link.href} key={index}>
                      <ListItem button component="a" onClick={closeDrawer}>
                        <ListItemIcon>
                          <Icon />
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

const LoggedInNormalScreen = ({ loggedInUser }) => {
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
          src={loggedInUser.image}
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
                  <MenuItem key={index}>
                    <Link href={link.href}>
                      <a className={classes.menuLink}>{link.text}</a>
                    </Link>
                  </MenuItem>
                ))}
            </MenuList>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
};

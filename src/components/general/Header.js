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
  Badge
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import MenuIcon from "@material-ui/icons/Menu";
import InfoIcon from "@material-ui/icons/Info";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import NotificationsIcon from "@material-ui/icons/Notifications";

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
    showIconOnNormalScreen: true,
    icon: NotificationsIcon,
    alwaysDisplayDirectly: true
  },
  {
    href: "/signin",
    text: "Sign in",
    iconForDrawer: AccountCircleIcon,
    isOutlinedInHeader: true
  }
];

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
    }
  };
});

export default function Header({ className, noSpacingBottom }) {
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
          <>{isNarrowScreen ? <NarrowScreenLinks /> : <NormalScreenLinks />}</>
        )}
      </Container>
    </Box>
  );
}

function NormalScreenLinks() {
  const classes = useStyles();

  return (
    <Box>
      {LINKS.map((link, index) => {
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
            {link.showIconOnNormalScreen ? (
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
    </Box>
  );
}

function NarrowScreenLinks() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = setIsDrawerOpen.bind(null, true);
  const closeDrawer = setIsDrawerOpen.bind(null, false);
  const classes = useStyles();

  return (
    <>
      <Box>
        {LINKS.filter(link => link.alwaysDisplayDirectly).map(link => {
          const Icon = link.iconForDrawer;
          return (
            <Link href={link.href} key={link.href}>
              <IconButton color="primary" className={classes.marginRight}>
                {link.hasBadge && link.badgeNumber > 0 ? (
                  <Badge badgeContent={link.badgeNumber} color="error">
                    <Icon />
                  </Badge>
                ) : (
                  <Icon />
                )}
              </IconButton>
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
          <List>
            {LINKS.filter(link => !link.alwaysDisplayDirectly).map(link => {
              const Icon = link.iconForDrawer;
              return (
                <Link href={link.href} key={link.href}>
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

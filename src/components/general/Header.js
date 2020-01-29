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
  ListItemText
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import MenuIcon from "@material-ui/icons/Menu";
import InfoIcon from "@material-ui/icons/Info";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";

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
    href: "/signin",
    text: "Sign in",
    iconForDrawer: AccountCircleIcon,
    isOutlinedInHeader: true
  }
];

const useStyles = makeStyles(theme => {
  return {
    root: {
      marginBottom: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.grey[300]}`
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
    }
  };
});

export default function Header() {
  const classes = useStyles();

  const isNarrowScreen = useMediaQuery(theme => theme.breakpoints.down("xs"));

  return (
    <Box component="header" className={classes.root}>
      <Container className={classes.container}>
        <Link href="/">
          <a>
            <img src="/images/logo.jpg" alt="Climate Connect" className={classes.logo} />
          </a>
        </Link>

        {isNarrowScreen ? <NarrowScreenLinks /> : <NormalScreenLinks />}
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
        return (
          <Link href={link.href} key={link.href}>
            <Button color="primary" {...buttonProps}>
              {link.text}
            </Button>
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

  return (
    <>
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
          {LINKS.map(link => {
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
    </>
  );
}

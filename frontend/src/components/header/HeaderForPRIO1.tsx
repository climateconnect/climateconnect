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
} from "@mui/material";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import useMediaQuery from "@mui/material/useMediaQuery";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import InfoIcon from "@mui/icons-material/Info";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import noop from "lodash/noop";
import React, { useContext, useState } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import Notification from "../communication/notifications/Notification";
import NotificationsBox from "../communication/notifications/NotificationsBox";
import UserContext from "../context/UserContext";
import ProfileBadge from "../profile/ProfileBadge";
import DropDownButton from "./DropDownButton";
import LanguageSelect from "./LanguageSelect";
import { HeaderProps } from "./types";

type StyleProps = {
  background?: string;
  isLocationHub?: boolean;
};

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) => {
  return {
    root: {
      background: theme?.palette?.secondary?.light,
      transition: "all 0.25s linear", // use all instead of transform since the background color too is changing at some point. It'll be nice to have a smooth transition.
    },
    hideHeader: {
      [theme.breakpoints.down("lg")]: {
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
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      [theme.breakpoints.down("lg")]: {
        padding: theme.spacing(2),
      },
      [theme.breakpoints.down("md")]: {
        padding: `${theme.spacing(0.8)} ${theme.spacing(2)}`,
      },
    },
    logoLink: {
      [theme.breakpoints.down("md")]: {
        flex: `0 1 auto`,
        width: "calc(1.1vw + 1.3em)",
        maxWidth: "2.3rem",
        minWidth: "1.3rem",
      },
    },
    logo: (props) => ({
      [theme.breakpoints.down("md")]: {
        height: props.isLocationHub ? 35 : "auto",
      },
      height: 60,
      maxWidth: 180,
    }),
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

      margin: "0 auto",
    },
    loggedInLink: {
      color: theme?.palette?.background?.default_contrastText,
      width: "100%",
    },
    linkContainer: {
      display: "flex",
      alignItems: "center",
      maxWidth: "calc(100% - 200px)",
      [theme.breakpoints.down("lg")]: {
        maxWidth: "calc(100% - 150px)",
      },
      [theme.breakpoints.down("md")]: {
        maxWidth: "calc(100% - 35px)",
      },
      justifyContent: "space-around",
    },
    menuLink: {
      color: theme.palette.primary.contrastText,
      textDecoration: "inherit",
    },
    shareProjectButton: {
      height: 36,
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
      boxShadow: "none",
      "&:hover": {
        boxShadow: "none",
      },
    },
    notificationsHeadline: {
      padding: theme.spacing(2),
      textAlign: "center",
    },
    loggedInPopper: {
      zIndex: 130,
    },
    normalScreenIcon: {
      fontSize: 20,
      marginRight: theme.spacing(0.25),
    },
    mobileAvatarContainer: {
      display: "flex",
      justifyContent: "center",
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    languageSelectMobile: {
      display: "flex",
      justifyContent: "center",
    },
    btnIconTextColor: {
      color: theme.palette.primary.contrastText,
    },
    drawerItem: {
      color: theme.palette.background.default_contrastText,
    },
    drawerLink: {
      "&:hover": {
        color: theme.palette.background.default_contrastText,
      },
    },
    profileImage: {
      "&:hover": {
        backgroundColor: "transparent",
      },
    },
    btnMain: {
      borderColor: theme.palette.primary.contrastText,
      color: theme.palette.primary.contrastText,
    },
  };
});

const getLoggedInLinks = ({ loggedInUser, texts }) => {
  if (!loggedInUser) return [];
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
  ];
};
const PRIO1_StaticPageLinks = (hubTexts) => {
  return [
    {
      href: "https://prio1-klima.net/klima-preis/",
      text: hubTexts.PRIO1_Climate_Prize,
    },
    {
      href: "https://prio1-klima.net/junge-menschen/",
      text: hubTexts.for_young_people,
    },
    {
      href: "https://prio1-klima.net/akteure/",
      text: hubTexts.for_actors,
    },
  ];
};
export default function HeaderForPRIO1({ background, isLocationHub }: HeaderProps) {
  const classes = useStyles({
    background: background,
    isLocationHub: isLocationHub,
  });

  const { user, signOut, notifications, pathName, locale } = useContext(UserContext);
  const texts = getTexts({ page: "navigation", locale: locale });
  const hubTexts = getTexts({ page: "hub", locale: locale, hubName: "Prio1" });

  const [anchorEl, setAnchorEl] = useState<false | null | HTMLElement>(false);
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));
  const isMediumScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const toggleShowNotifications = (event) => {
    if (!anchorEl) setAnchorEl(event.currentTarget);
    else setAnchorEl(null);
  };
  const localePrefix = getLocalePrefix(locale);
  const notificationsOnClose = () => setAnchorEl(null);

  return (
    <Box component="header" className={`${classes.root} ${classes.spacingBottom} `}>
      <Container className={classes.container}>
        <Link href={localePrefix + "/"} className={classes.logoLink} underline="hover">
          <img
            src={`/images/hub_logos/prio1.png`}
            alt={texts.climate_connect_logo}
            className={classes.logo}
          />
        </Link>
        {isNarrowScreen || isMediumScreen ? (
          <NarrowScreenMenu
            loggedInUser={user}
            handleLogout={signOut}
            anchorEl={anchorEl}
            toggleShowNotifications={toggleShowNotifications}
            notificationsOnClose={notificationsOnClose}
            notifications={notifications}
            texts={texts}
            pathName={pathName}
          />
        ) : (
          <NormalScreenMenu
            loggedInUser={user}
            handleLogout={signOut}
            anchorEl={anchorEl}
            toggleShowNotifications={toggleShowNotifications}
            notificationsOnClose={notificationsOnClose}
            notifications={notifications}
            texts={texts}
            hubTexts={hubTexts}
            pathName={pathName}
          />
        )}
      </Container>
    </Box>
  );
}

function NormalScreenMenu({
  loggedInUser,
  handleLogout,
  anchorEl,
  toggleShowNotifications,
  notificationsOnClose,
  notifications,
  texts,
  hubTexts,
  pathName,
}) {
  const { locale } = useContext(UserContext);
  const localePrefix = getLocalePrefix(locale);
  const classes = useStyles({});
  const STATIC_PAGE_LINKS = PRIO1_StaticPageLinks(hubTexts);
  return (
    <Box className={classes.linkContainer}>
      <span className={classes.menuLink}>
        <DropDownButton
          options={STATIC_PAGE_LINKS}
          buttonProps={{
            className: `${classes.btnIconTextColor}`,
          }}
        >
          {hubTexts.PRIO1_klima}
        </DropDownButton>
      </span>
      <span className={classes.menuLink}>
        <Button
          className={`${classes.btnIconTextColor} ${classes.shareProjectButton}`}
          variant="contained"
          href={localePrefix + "/share"}
        >
          {texts.share_a_project}
        </Button>
      </span>
      <span className={classes.menuLink}>
        <LanguageSelect implementedIn={"HeaderForPRIO1"} />
      </span>
      <NotificationsOrSignup
        loggedInUser={loggedInUser}
        classes={classes}
        toggleShowNotifications={toggleShowNotifications}
        notifications={notifications}
        anchorEl={anchorEl}
        notificationsOnClose={notificationsOnClose}
        texts={texts}
        pathName={pathName}
      />
      {loggedInUser && (
        <NormalScreenLogIn
          loggedInUser={loggedInUser}
          handleLogout={handleLogout}
          texts={texts}
          localePrefix={localePrefix}
        />
      )}
    </Box>
  );
}

const NormalScreenLogIn = ({ loggedInUser, handleLogout, texts, localePrefix }) => {
  const classes = useStyles({});
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
          className={classes.profileImage}
          ref={anchorRef}
        >
          {loggedInUser?.badges?.length > 0 ? (
            <ProfileBadge badge={loggedInUser?.badges[0]} size="small">
              <Avatar {...avatarProps} />
            </ProfileBadge>
          ) : (
            <Avatar {...avatarProps} />
          )}
          <ArrowDropDownIcon className={classes.btnIconTextColor} />
        </Button>
        <Popper open={menuOpen} anchorEl={anchorRef.current} className={classes.loggedInPopper}>
          <Paper>
            <MenuList>
              {getLoggedInLinks({ loggedInUser, texts }).map((link, index) => {
                return (
                  <MenuItem
                    key={index}
                    component="button"
                    className={classes.loggedInLink}
                    href={localePrefix + link.href}
                  >
                    {link.text}
                  </MenuItem>
                );
              })}
              {loggedInUser && (
                <MenuItem
                  component="button"
                  className={classes.loggedInLink}
                  onClick={handleLogout}
                >
                  {texts.log_out}
                </MenuItem>
              )}
            </MenuList>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
};

function NarrowScreenMenu({
  loggedInUser,
  handleLogout,
  anchorEl,
  toggleShowNotifications,
  notificationsOnClose,
  notifications,
  texts,
  pathName,
}) {
  const { locale } = useContext(UserContext);
  const localePrefix = getLocalePrefix(locale);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const openDrawer = setIsDrawerOpen.bind(null, true);
  const closeDrawer = setIsDrawerOpen.bind(null, false);
  const classes = useStyles({});
  const loggedInLinks = getLoggedInLinks({ loggedInUser, texts });
  const constantLinks = [
    {
      href: "#",
      text: "PRIO1-klima.net",
      iconForDrawer: InfoIcon,
    },
    {
      href: "/share",
      text: texts.share_a_project,
      iconForDrawer: AddCircleIcon,
    },
  ];
  const guestLinks = [
    {
      href: "/signup",
      text: texts.sign_up,
      iconForDrawer: AccountCircleIcon,
    },
  ];

  const links = [...constantLinks, ...(loggedInUser ? [] : guestLinks), ...loggedInLinks];

  return (
    <>
      <Box>
        <NotificationsOrSignup
          loggedInUser={loggedInUser}
          classes={classes}
          toggleShowNotifications={toggleShowNotifications}
          notifications={notifications}
          anchorEl={anchorEl}
          notificationsOnClose={notificationsOnClose}
          texts={texts}
          pathName={pathName}
        />
        <span className={classes.menuLink}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={openDrawer}
            size="large"
          >
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
          <List>
            <ListItem className={classes.languageSelectMobile}>
              <LanguageSelect implementedIn={"HeaderForPRIO1"} />
            </ListItem>
            {links.map((link, index) => {
              const Icon = link.iconForDrawer;
              return (
                <Link
                  href={localePrefix + link.href}
                  key={index}
                  underline="hover"
                  className={classes.drawerLink}
                >
                  <ListItem button component="a" onClick={closeDrawer}>
                    <ListItemIcon>
                      <Icon className={classes.drawerItem} />
                    </ListItemIcon>
                    <ListItemText primary={link.text} className={classes.drawerItem} />
                  </ListItem>
                </Link>
              );
            })}

            {loggedInUser && (
              <>
                <div className={classes.mobileAvatarContainer}>
                  <Link href={"/profiles/" + loggedInUser.url_slug} underline="hover">
                    {loggedInUser?.badges?.length > 0 ? (
                      <ProfileBadge
                        badge={loggedInUser?.badges[0]}
                        size="medium"
                        className={classes.badge}
                      >
                        <Avatar
                          alt={loggedInUser.name}
                          src={getImageUrl(loggedInUser.image)}
                          className={classes.loggedInAvatarMobile}
                        />
                      </ProfileBadge>
                    ) : (
                      <Avatar
                        alt={loggedInUser.name}
                        src={getImageUrl(loggedInUser.image)}
                        className={classes.loggedInAvatarMobile}
                      />
                    )}
                  </Link>
                </div>
                <ListItem button component="a" onClick={handleLogout}>
                  <ListItemIcon>
                    <ExitToAppIcon className={classes.drawerItem} />
                  </ListItemIcon>
                  <ListItemText primary={texts.log_out} className={classes.drawerItem} />
                </ListItem>
              </>
            )}
          </List>
        </SwipeableDrawer>
      </Box>
    </>
  );
}

const NotificationsOrSignup = ({
  loggedInUser,
  classes,
  toggleShowNotifications,
  notifications,
  anchorEl,
  notificationsOnClose,
  texts,
  pathName,
}) => {
  const { locale } = useContext(UserContext);
  const localePrefix = getLocalePrefix(locale);
  const isNarrowScreen = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  return (
    <>
      {loggedInUser ? (
        <span className={classes.menuLink}>
          <IconButton
            className={isNarrowScreen ? classes.marginRight : ""}
            onClick={toggleShowNotifications}
            size="large"
          >
            {notifications && notifications.length > 0 ? (
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon className={classes.btnIconTextColor} />
              </Badge>
            ) : (
              <NotificationsIcon className={classes.btnIconTextColor} />
            )}
          </IconButton>
          {anchorEl && (
            <NotificationsBox
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={notificationsOnClose}
            >
              <Typography className={classes.notificationsHeadline} component="h1" variant="h5">
                {texts.notifications}
              </Typography>
              <Divider />
              {notifications && notifications.length > 0 ? (
                notifications.map((n, index) => <Notification key={index} notification={n} />)
              ) : (
                <Notification isPlaceholder />
              )}
            </NotificationsBox>
          )}
        </span>
      ) : (
        <span className={classes.menuLink}>
          <Button
            variant="outlined"
            className={`${classes.marginRight} ${classes.btnMain}`}
            href={localePrefix + "/signup?redirect=" + pathName}
          >
            {texts.sign_up}
          </Button>
        </span>
      )}
    </>
  );
};

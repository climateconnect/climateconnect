import {
  Avatar,
  Box,
  Button,
  Link,
  makeStyles,
  Typography,
  MenuItem,
  MenuList,
  Paper,
  Popper,
} from "@material-ui/core";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import AssignmentIcon from "@material-ui/icons/Assignment";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import EmojiObjectsIcon from "@material-ui/icons/EmojiObjects";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import React, { useContext, useState, useRef } from "react";

import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { getImageUrl } from "../../../public/lib/imageOperations";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import UserContext from "../context/UserContext";

const useStyles = makeStyles((theme) => {
  return {
    welcomeBanner: {
      backgroundColor: theme.palette.primary.main,
      minWidth: 300,
      width: "100%",
      borderRadius: 5,
      border: theme.borders.thick,
      color: "white",
      position: "relative",
      maxWidth: "800px",
    },
    profileInner: {
      float: "left",
      position: "absolute",
      left: "0px",
      top: "0px",
      "z-index": " 1000",
      padding: "5px",
    },
    root: {
      marginBottom: theme.spacing(1.5),
      borderLeft: `5px solid ${theme.palette.primary.main}`,
    },

    userImage: {
      // TODO(design): what color should this actually be -- I
      // don't see it represented in the XD mockup? Ideally
      // it'd be from our emerging design system
      border: theme.borders.thin,
      borderRadius: "50%",
      height: "40px",
      width: "43px",
      background: "white",
    },
    subsection: {
      // TODO(design): again want to make sure we reflect this color
      // scheme in our design system or in code. I just grabbed
      // this color from the color picker in Chrome DevTools
      background: "#f0f2f5",
      borderRadius: 4,
      padding: theme.spacing(1),
    },

    // TODO(Chris): is there a standard
    // set of Typography headings, components?
    headingText: {
      fontWeight: "bold",
      paddingLeft: theme.spacing(1),
    },

    welcomeMessage: {
      background: "white",
      borderRadius: "25px",
      color: theme.palette.secondary.main,
      display: "flex",
      alignItems: "center",
      width: "100%",
      // TODO: not sure about correct weight here
      fontWeight: "700",
      padding: theme.spacing(1.5),
    },

    welcomeSubsection: {
      display: "flex",
      alignItems: "center",
    },

    hubName: {
      color: theme.palette.yellow.main,
    },

    buttonContainer: {
      display: "flex",
      justifyContent: "space-around",
    },
  };
});

// TODO(Piper): generalize this spacing unit to be used in other places,
// for consistency.
const HorizontalSpacing = ({ children, size }) => {
  return (
    <Box css={{ marginTop: theme.spacing(size), marginBottom: theme.spacing(size) }}>
      {children}
    </Box>
  );
};

// TODO(Piper): we should generalize these components post launch
// of CityHub so that they can be used across the platform.
const HoverButton = ({ items, label, startIcon }) => {
  const classes = useStyles();
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleOpen = (e) => {
    e.preventDefault();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Button
        aria-haspopup="true"
        className={classes.HoverButtonButton}
        color="primary"
        onClick={handleOpen}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        ref={buttonRef}
        startIcon={startIcon}
        type="submit"
      >
        {label}
        <ArrowDropDownIcon />
      </Button>
      <DropDownList
        buttonRef={buttonRef}
        handleClose={handleClose}
        handleOpen={handleOpen}
        items={items}
        open={open}
      />
    </>
  );
};

const DropDownList = ({ buttonRef, handleOpen, handleClose, items, open }) => {
  const classes = useStyles();
  const { locale, startLoading } = useContext(UserContext);

  const handleClick = () => {
    startLoading();
  };

  return (
    <Popper open={open} anchorEl={buttonRef.current}>
      <Paper onMouseEnter={handleOpen} onMouseLeave={handleClose} className={classes.menu}>
        <MenuList>
          {items?.map((item) => (
            <Link
              key={item.url_slug}
              // TODO: fix links
              // href={`${getLocalePrefix(locale)}/hubs/${item.url_slug}/`}
              href={item.url_slug}
              onClick={handleClick}
              // onClick={(evt, item) => {
              //   // window.location.hash = "projects";
              //   history.pushState(null, null, "#hashexample");
              //   console.log(item);
              // }}
            >
              <MenuItem component="button" className={classes.cityHubOption}>
                {item.name}
              </MenuItem>
            </Link>
          ))}
        </MenuList>
      </Paper>
    </Popper>
  );
};

export default function Dashboard({ className, location }) {
  const classes = useStyles();

  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "general", locale: locale });

  return (
    <div className={`${classes.welcomeBanner} ${className}`}>
      <HorizontalSpacing size={1}>
        <Typography variant="h4" component="h1" className={`${classes.headingText}`}>
          {/* Have a sensible default */}
          {texts && texts?.climate_protection_in ? (
            `${texts.climate_protection_in} ${location}`
          ) : (
            <>
              <span>Welcome </span>
              <span className={classes.hubName}>{user.first_name}!</span>
            </>
          )}
        </Typography>
      </HorizontalSpacing>

      <div className={`${classes.subsection}`}>
        <HorizontalSpacing size={1}>
          <div className={`${classes.welcomeSubsection}`}>
            {/* Generic Avatar / profile image if user is not logged in */}
            {user ? (
              <div>
                <img className={`${classes.userImage}`} src={getImageUrl(user.image)} />
              </div>
            ) : (
              <Avatar style={{ border: theme.borders.thin }} />
            )}

            {/* Trying to keep spacing out of UI components, and isolated within Box components directly */}
            <Box css={{ marginLeft: theme.spacing(1), width: "100%" }}>
              <div className={`${classes.welcomeMessage}`}>
                <Typography style={{ fontWeight: "600" }}>
                  {texts.share_your_solutions_text_1}
                </Typography>
              </div>
            </Box>
          </div>
        </HorizontalSpacing>

        <hr />

        <div className={`${classes.buttonContainer}`}>
          {/* When the user is logged out, we want to prompt them to sign up! And we don't
          show them the other controls. */}
          {user ? (
            <>
              <HoverButton
                startIcon={<EmojiObjectsIcon />}
                label={texts.ideas}
                items={[
                  {
                    name: "Create idea",
                    // url_slug: `${getLocalePrefix(locale)}/${item.url_slug}/`,
                    url_slug: `#ideas`,
                  },
                  {
                    name: "Your Ideas",
                    // TODO: fix slug here
                    url_slug: "/profiles/your_url_slug#ideas",
                  },
                ]}
              />
              <HoverButton
                startIcon={<AssignmentIcon />}
                label={texts.projects}
                items={[
                  {
                    name: "Create project",
                    url_slug: "/share",
                  },
                  {
                    name: "Your projects",
                    // TODO: fix slug here
                    url_slug: "/profiles/your_url_slug#projects",
                  },
                ]}
              />
              <HoverButton
                startIcon={<GroupAddIcon />}
                label={texts.organization}
                items={[
                  {
                    name: "Create organization",
                    url_slug: "/createorganization",
                  },
                  {
                    name: "Your organizations",
                    // TODO: fix slug here
                    url_slug: "/profiles/your_url_slug#organizations",
                  },
                ]}
              />
              <HoverButton
                startIcon={<AccountCircleIcon />}
                label={texts.my_profile}
                items={[
                  {
                    name: "Edit profile",
                    url_slug: "/editprofile",
                  },
                ]}
              />

              {/* TODO: restore Climate Match icon and link once CM is live  */}
              {/* <Button type="submit">Climate Match</Button> */}
            </>
          ) : (
            <>
              {/* TODO: fix sign up link */}
              <Button
                color="primary"
                component="div"
                href={getLocalePrefix(locale) + "/signup"}
                variant="contained"
              >
                {texts.join_now}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

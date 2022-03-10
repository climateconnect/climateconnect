import {
  Box,
  Button,
  Link,
  makeStyles,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Typography,
} from "@material-ui/core";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import AssignmentIcon from "@material-ui/icons/Assignment";
import EmojiObjectsIcon from "@material-ui/icons/EmojiObjects";
import GroupAddIcon from "@material-ui/icons/GroupAdd";
import React, { useContext, useEffect, useRef, useState } from "react";
import Cookies from "universal-cookie";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import getTexts from "../../../public/texts/texts";
import theme from "../../themes/theme";
import OpenClimateMatchButton from "../climateMatch/OpenClimateMatchButton";
import UserContext from "../context/UserContext";
import UserImage from "./UserImage";
import CreateIdeaDialog from "../ideas/createIdea/CreateIdeaDialog";
import { getUserOrganizations } from "../../../public/lib/organizationOperations";

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
    climateHubOption: {
      width: "100%",
    },
  };
});

// TODO: generalize this spacing unit to be used in other places,
// for consistency.
const HorizontalSpacing = ({ children, size }) => {
  return (
    <Box css={{ marginTop: theme.spacing(size), marginBottom: theme.spacing(size) }}>
      {children}
    </Box>
  );
};

// TODO(Piper): we should generalize these components post launch
// of ClimateHub so that they can be used across the platform.
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
  const { startLoading } = useContext(UserContext);

  const handleClick = (onClick) => {
    if (onClick) {
      onClick();
    } else {
      startLoading();
    }
  };

  return (
    <Popper open={open} anchorEl={buttonRef.current}>
      <Paper onMouseEnter={handleOpen} onMouseLeave={handleClose} className={classes.menu}>
        <MenuList>
          {items?.map((item) => (
            <Link
              key={item.url_slug}
              href={item.url_slug}
              onClick={() => handleClick(item.onClick)}
            >
              <MenuItem component="button" className={classes.climateHubOption}>
                {item.name}
              </MenuItem>
            </Link>
          ))}
        </MenuList>
      </Paper>
    </Popper>
  );
};

export default function Dashboard({ allHubs, hubData, className, headline, location, hubUrl }) {
  const classes = useStyles();

  const [userOrganizations, setUserOrganizations] = useState(null);
  const [isCreateIdeaOpen, setCreateIdeaOpen] = useState(false);
  const token = new Cookies().get("token");

  useEffect(async function () {
    if (userOrganizations === null) {
      setUserOrganizations("");
      const userOrgsFromServer = await getUserOrganizations(token, locale);
      setUserOrganizations(userOrgsFromServer || []);
    }
  }, []);

  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "dashboard", locale: locale, user: user, location: location });

  return (
    <div className={`${classes.welcomeBanner} ${className}`}>
      <HorizontalSpacing size={1}>
        <Typography variant="h4" component="h1" className={`${classes.headingText}`}>
          {headline}
        </Typography>
      </HorizontalSpacing>

      <div className={`${classes.subsection}`}>
        <HorizontalSpacing size={1}>
          <div className={`${classes.welcomeSubsection}`}>
            <UserImage user={user} />
            {/* TODO: doing some left spacing here -- trying to keep spacing directly out of the UI components, and isolated within Box components directly  */}
            <Box css={{ marginLeft: theme.spacing(1), width: "100%" }}>
              <div className={`${classes.welcomeMessage}`}>
                <Typography style={{ fontWeight: "600" }}>
                  {user ? texts.welcome_message_logged_in : texts.welcome_message_logged_out}
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
                  // TODO: implement tab change based on link -- this might
                  // be more involved than we thought
                  // {
                  //   name: "Create idea",
                  //   // url_slug: `${getLocalePrefix(locale)}/${item.url_slug}/`,
                  //   url_slug: `#ideas`,
                  // },
                  {
                    name: texts.create_idea,
                    // url_slug: `${getLocalePrefix(locale)}/${item.url_slug}/`,
                    url_slug: "#",
                    onClick: () => setCreateIdeaOpen(true),
                  },
                  {
                    name: texts.my_ideas,
                    url_slug: `/profiles/${user.url_slug}#ideas`,
                  },
                ]}
              />
              <HoverButton
                startIcon={<AssignmentIcon />}
                label={texts.projects}
                items={[
                  {
                    name: texts.share_project,
                    url_slug: "/share",
                  },
                  {
                    name: texts.my_projects,
                    url_slug: `/profiles/${user.url_slug}#projects`,
                  },
                ]}
              />
              <HoverButton
                startIcon={<GroupAddIcon />}
                label={texts.organizations}
                items={[
                  {
                    name: texts.create_organization,
                    url_slug: "/createorganization",
                  },
                  {
                    name: texts.my_organizations,
                    url_slug: `/profiles/${user.url_slug}#organizations`,
                  },
                ]}
              />
              <HoverButton
                startIcon={<AccountCircleIcon />}
                label={texts.profile}
                items={[
                  {
                    name: texts.my_profile,
                    url_slug: `/profiles/${user.url_slug}`,
                  },
                  {
                    name: texts.edit_profile,
                    url_slug: "/editprofile",
                  },
                ]}
              />
              <OpenClimateMatchButton hubUrl={hubUrl} />
              {/* TODO: restore Climate Match icon and link once CM is live  */}
              {/* <Button type="submit">Climate Match</Button> */}
            </>
          ) : (
            <>
              <Button
                color="primary"
                href={getLocalePrefix(locale) + "/signup"}
                variant="contained"
              >
                {texts.join_now}
              </Button>
            </>
          )}
        </div>
      </div>
      <CreateIdeaDialog
        open={isCreateIdeaOpen}
        onClose={() => setCreateIdeaOpen(false)}
        allHubs={allHubs}
        userOrganizations={userOrganizations}
        hubLocation={location}
        hubData={hubData}
        resetTabsWhereFiltersWereApplied={() => {}}
      />
    </div>
  );
}

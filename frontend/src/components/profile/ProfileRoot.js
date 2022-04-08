import { Button, Container, makeStyles, Typography, useMediaQuery } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import Router from "next/router";
import React, { useEffect, useRef } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { startPrivateChat } from "../../../public/lib/messagingOperations";
import AccountPage from "../account/AccountPage";
import LoginNudge from "../general/LoginNudge";
import IdeaPreviews from "../ideas/IdeaPreviews";
import OrganizationPreviews from "../organization/OrganizationPreviews";
import ProjectPreviews from "../project/ProjectPreviews";
import ControlPointSharpIcon from "@material-ui/icons/ControlPointSharp";
import IconButton from "@material-ui/core/IconButton";

const DEFAULT_BACKGROUND_IMAGE = "/images/default_background_user.jpg";

const useStyles = makeStyles((theme) => {
  return {
    background: {
      width: "100%",
    },
    profilePreview: {
      margin: "0 auto",
      marginTop: theme.spacing(-11),
      [theme.breakpoints.up("sm")]: {
        margin: 0,
        marginTop: theme.spacing(-11),
        display: "inline-block",
        width: "auto",
      },
    },
    memberInfoContainer: {
      [theme.breakpoints.up("sm")]: {
        display: "inline-block",
      },
      padding: 0,
    },
    content: {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      color: `${theme.palette.secondary.main}`,
      fontWeight: "bold",
    },
    noPadding: {
      padding: 0,
    },
    infoContainer: {
      [theme.breakpoints.up("sm")]: {
        display: "flex",
      },
    },
    noprofile: {
      textAlign: "center",
      padding: theme.spacing(5),
    },
    marginTop: {
      marginTop: theme.spacing(1),
    },
    loginNudge: {
      textAlign: "center",
      margin: "0 auto",
    },
    container: {
      position: "relative",
    },
    sectionHeadlineWithButtonContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: theme.spacing(3),
    },
    innerIcon: {
      marginRight: theme.spacing(0.5),
      marginLeft: -theme.spacing(1),
    },
    createButton: {
      right: theme.spacing(1),
      position: "absolute",
      [theme.breakpoints.down("xs")]: {
        position: "relative",
        marginTop: theme.spacing(2),
      },
    },
  };
});

export default function ProfileRoot({
  profile,
  projects,
  organizations,
  ideas,
  infoMetadata,
  user,
  token,
  texts,
  locale,
}) {
  const classes = useStyles();
  const theme = useTheme();
  const isOwnAccount = user && user.url_slug === profile.url_slug;
  const handleConnectBtn = async (e) => {
    e.preventDefault();
    const chat = await startPrivateChat(profile, token, locale);
    Router.push({
      pathname: "/chat/" + chat.chat_uuid + "/",
    });
  };
  const projectsRef = useRef(null);
  const organizationsRef = useRef(null);
  const ideasRef = useRef(null);
  const scrollDownSmooth = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  };
  const isTinyScreen = useMediaQuery(theme.breakpoints.down("xs"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const URL = window.location.href;
    if (URL.slice(-9) == "#projects") {
      scrollDownSmooth(projectsRef);
    }
    if (URL.slice(-14) == "#organizations") {
      scrollDownSmooth(organizationsRef);
    }
    if (URL.slice(-6) == "#ideas") {
      scrollDownSmooth(ideasRef);
    }
  }, []);

  return (
    <AccountPage
      account={profile}
      default_background={DEFAULT_BACKGROUND_IMAGE}
      editHref={getLocalePrefix(locale) + "/editprofile"}
      isOwnAccount={isOwnAccount}
      type="profile"
      isOrganization={false}
      infoMetadata={infoMetadata}
      isTinyScreen={isTinyScreen}
      isSmallScreen={isSmallScreen}
    >
      {!user && (
        <LoginNudge
          className={classes.loginNudge}
          whatToDo={texts.to_see_this_users_full_information}
        />
      )}
      {user && user.url_slug !== profile.url_slug && (
        <Button variant="contained" color="primary" onClick={handleConnectBtn}>
          {texts.send_message}
        </Button>
      )}
      <Container className={classes.container} ref={projectsRef}>
        <div className={classes.sectionHeadlineWithButtonContainer}>
          <h2>{isOwnAccount ? texts.your_projects + ":" : texts.this_users_projects + ":"}</h2>
          {isTinyScreen ? (
            <IconButton href={getLocalePrefix(locale) + "/share"}>
              <ControlPointSharpIcon
                className={classes.button}
                variant="contained"
                color="primary"
              />
            </IconButton>
          ) : (
            <Button variant="contained" color="primary" href={getLocalePrefix(locale) + "/share"}>
              <ControlPointSharpIcon className={classes.innerIcon} />
              {texts.share_a_project}
            </Button>
          )}
        </div>
        {projects && projects.length ? (
          <ProjectPreviews projects={projects} />
        ) : (
          <Typography>
            {(isOwnAccount ? texts.you_are : texts.user_name_is) +
              " " +
              texts.not_involved_in_any_projects_yet}
          </Typography>
        )}
      </Container>
      {(isOwnAccount || (ideas && ideas.length > 0)) && (
        <Container className={classes.container} ref={ideasRef}>
          <div className={classes.sectionHeadlineWithButtonContainer}>
            <h2>{isOwnAccount ? texts.your_ideas + ":" : texts.this_users_ideas + ":"}</h2>
          </div>
          {ideas && ideas.length ? (
            <IdeaPreviews ideas={ideas} noCreateCard sendToIdeaPageOnClick />
          ) : (
            <Typography>
              {(isOwnAccount ? texts.you_are : texts.user_name_is) +
                " " +
                texts.not_involved_in_any_ideas_yet}
            </Typography>
          )}
        </Container>
      )}
      <Container className={classes.container} ref={organizationsRef}>
        <div className={classes.sectionHeadlineWithButtonContainer}>
          <h2>
            {isOwnAccount ? texts.your_organizations + ":" : texts.this_users_organizations + ":"}
          </h2>
          {isTinyScreen ? (
            <IconButton href={getLocalePrefix(locale) + "/createorganization"}>
              <ControlPointSharpIcon
                className={classes.button}
                variant="contained"
                color="primary"
              />
            </IconButton>
          ) : (
            <Button
              variant="contained"
              color="primary"
              href={getLocalePrefix(locale) + "/createorganization"}
            >
              <ControlPointSharpIcon className={classes.innerIcon} />
              {texts.create_an_organization}
            </Button>
          )}
        </div>
        {organizations && organizations.length > 0 ? (
          <OrganizationPreviews organizations={organizations} />
        ) : (
          <Typography>
            {(isOwnAccount ? texts.you_are : texts.user_name_is) +
              " " +
              texts.not_involved_in_any_organizations_yet}
          </Typography>
        )}
      </Container>
    </AccountPage>
  );
}

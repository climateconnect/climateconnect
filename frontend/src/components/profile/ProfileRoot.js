import { Button, Container, makeStyles, Typography } from "@material-ui/core";
import { Router } from "next/router";
import React, { useEffect, useRef } from "react";
import { getLocalePrefix } from "../../../public/lib/apiOperations";
import { startPrivateChat } from "../../../public/lib/messagingOperations";
import AccountPage from "../account/AccountPage";
import LoginNudge from "../general/LoginNudge";
import IdeaPreviews from "../ideas/IdeaPreviews";
import OrganizationPreviews from "../organization/OrganizationPreviews";
import ProjectPreviews from "../project/ProjectPreviews";

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
  const isOwnAccount = user && user.url_slug === profile.url_slug;
  const handleConnectBtn = async (e) => {
    e.preventDefault();
    const chat = await startPrivateChat(profile, token, locale);
    Router.push("/chat/" + chat.chat_uuid + "/");
  };
  const projectsRef = useRef(null);
  const organizationsRef = useRef(null);
  const ideasRef = useRef(null)
  const scrollDownSmooth = (ref) => {
    ref.current.scrollIntoView({ behavior: "smooth" })
  }
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
      infoMetadata={infoMetadata}
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
        <h2>
          {isOwnAccount ? texts.your_projects + ":" : texts.this_users_projects + ":"}
          <Button
            variant="contained"
            color="primary"
            href={getLocalePrefix(locale) + "/share"}
            className={classes.createButton}
          >
            {texts.share_a_project}
          </Button>
        </h2>
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
      {(isOwnAccount || (ideas && ideas.length > 0)) &&
        (
          <Container className={classes.container} ref={ideasRef}>
            <h2>
              {isOwnAccount ? texts.your_ideas + ":" : texts.this_users_ideas + ":"}
            </h2>
            {ideas && ideas.length ? (
              <IdeaPreviews 
                ideas={ideas} 
                noCreateCard
                sendToIdeaPageOnClick
              />
            ) : (
              <Typography>
                {(isOwnAccount ? texts.you_are : texts.user_name_is) +
                  " " +
                  texts.not_involved_in_any_ideas_yet}
              </Typography>
            )}
          </Container>
        )
      }
      <Container className={classes.container} ref={organizationsRef}>
        <h2>
          {isOwnAccount ? texts.your_organizations + ":" : texts.this_users_organizations + ":"}
          <Button
            variant="contained"
            color="primary"
            href={getLocalePrefix(locale) + "/createorganization"}
            className={classes.createButton}
          >
            {texts.create_an_organization}
          </Button>
        </h2>
        {organizations && organizations.length > 0 ? (
          <OrganizationPreviews organizations={organizations} showOrganizationType />
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
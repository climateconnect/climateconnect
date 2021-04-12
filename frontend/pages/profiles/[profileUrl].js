import { Button, Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import Cookies from "next-cookies";
import Router from "next/router";
import React, { useContext } from "react";
import tokenConfig from "../../public/config/tokenConfig";
import { getLocalePrefix } from "../../public/lib/apiOperations";
import { startPrivateChat } from "../../public/lib/messagingOperations";
import getTexts from "../../public/texts/texts";
import LoginNudge from "../../src/components/general/LoginNudge";
import PageNotFound from "../../src/components/general/PageNotFound";
import WideLayout from "../../src/components/layouts/WideLayout";
import getProfileInfoMetadata from "./../../public/data/profile_info_metadata";
import { nullifyUndefinedValues, parseProfile } from "./../../public/lib/profileOperations";
import AccountPage from "./../../src/components/account/AccountPage";
import UserContext from "./../../src/components/context/UserContext";
import OrganizationPreviews from "./../../src/components/organization/OrganizationPreviews";
import ProjectPreviews from "./../../src/components/project/ProjectPreviews";

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

export async function getServerSideProps(ctx) {
  const { token } = Cookies(ctx);
  const profileUrl = encodeURI(ctx.query.profileUrl);
  const [profile, organizations, projects] = await Promise.all([
    getProfileByUrlIfExists(profileUrl, token),
    getOrganizationsByUser(profileUrl, token),
    getProjectsByUser(profileUrl, token),
  ]);
  return {
    props: nullifyUndefinedValues({
      profile: profile,
      organizations: organizations,
      projects: projects,
      token: token,
    }),
  };
}

export default function ProfilePage({ profile, projects, organizations, token }) {
  const { user, locale } = useContext(UserContext);
  const infoMetadata = getProfileInfoMetadata(locale);
  const texts = getTexts({ page: "profile", locale: locale, profile: profile });
  return (
    <WideLayout
      title={profile ? texts.persons_profile : texts.not_found}
      description={
        profile.name +
        " | " +
        profile.info.location +
        (profile.info.bio ? " | " + profile.info.bio : "")
      }
    >
      {profile ? (
        <ProfileLayout
          profile={profile}
          projects={projects}
          organizations={organizations}
          infoMetadata={infoMetadata}
          user={user}
          token={token}
          texts={texts}
          locale={locale}
        />
      ) : (
        <PageNotFound itemName="Profile" />
      )}
    </WideLayout>
  );
}

function ProfileLayout({ profile, projects, organizations, infoMetadata, user, token, texts, locale }) {
  const classes = useStyles();
  const isOwnAccount = user && user.url_slug === profile.url_slug;
  const handleConnectBtn = async (e) => {
    e.preventDefault();
    const chat = await startPrivateChat(profile, token);
    Router.push("/chat/" + chat.chat_uuid + "/");
  };
  const projectsRef = React.useRef(null);
  const organizationsRef = React.useRef(null);
  const scrollDownToProjects = () => {
    projectsRef.current.scrollIntoView({ behavior: "smooth" });
  };
  const scrollDownToOrganizations = () => {
    organizationsRef.current.scrollIntoView({ behavior: "smooth" });
  };
  React.useEffect(() => {
    const URL = window.location.href;
    if (URL.slice(-9) == "#projects") {
      scrollDownToProjects();
    }
    if (URL.slice(-14) == "#organizations") {
      scrollDownToOrganizations();
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
      <Container className={classes.container} ref={projectsRef}>
        {user && user.url_slug !== profile.url_slug && (
          <Button variant="contained" color="primary" onClick={handleConnectBtn}>
            {texts.message}
          </Button>
        )}
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
            {(isOwnAccount ? texts.you_are : texts.this_user_is) +
              " " +
              texts.not_involved_in_any_projects_yet}
          </Typography>
        )}
      </Container>
      <Container className={classes.container} ref={organizationsRef}>
        <h2>
          {isOwnAccount ? texts.your_organizations : texts.this_users_organizations}
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
            {(isOwnAccount ? texts.you_are : texts.this_user_is) +
              " " +
              texts.not_involved_in_any_organizations_yet}
          </Typography>
        )}
      </Container>
    </AccountPage>
  );
}

// This will likely become asynchronous in the future (a database lookup or similar) so it's marked as `async`, even though everything it does is synchronous.
async function getProfileByUrlIfExists(profileUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/member/" + profileUrl + "/",
      tokenConfig(token)
    );
    return parseProfile(resp.data);
  } catch (err) {
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    console.log("error!");
    console.log(err);
    return null;
  }
}

async function getProjectsByUser(profileUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/member/" + profileUrl + "/projects/",
      tokenConfig(token)
    );
    if (!resp.data) return null;
    else {
      return parseProjectStubs(resp.data.results);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getOrganizationsByUser(profileUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/member/" + profileUrl + "/organizations/",
      tokenConfig(token)
    );
    if (!resp.data) return null;
    else {
      return parseOrganizationStubs(resp.data.results);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

function parseProjectStubs(projects) {
  return projects.map((p) => {
    const project = p.project;
    return {
      ...project,
      location: project.location,
    };
  });
}

function parseOrganizationStubs(organizations) {
  return organizations.map((o) => ({
    ...o.organization,
    types: o.organization.types.map((type) => type.organization_tag),
    info: {
      location: o.organization.location,
    },
  }));
}

import React, { useEffect } from "react";
import Link from "next/link";
import { Container, Typography, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import { useContext } from "react";
import Cookies from "next-cookies";
import UserContext from "./../../src/components/context/UserContext";
import Router from "next/router";

import WideLayout from "../../src/components/layouts/WideLayout";
import ProjectPreviews from "./../../src/components/project/ProjectPreviews";
import OrganizationPreviews from "./../../src/components/organization/OrganizationPreviews";
import AccountPage from "./../../src/components/account/AccountPage";

import TEMP_PROFILE_TYPES from "./../../public/data/profile_types.json";
import TEMP_INFOMETADATA from "./../../public/data/profile_info_metadata";
import tokenConfig from "../../public/config/tokenConfig";
import LoginNudge from "../../src/components/general/LoginNudge";
import { parseProfile } from "./../../public/lib/profileOperations";
import { getParams } from "./../../public/lib/generalOperations";
import { startPrivateChat } from "../../public/lib/messagingOperations";

const DEFAULT_BACKGROUND_IMAGE = "/images/default_background_user.jpg";

const useStyles = makeStyles(theme => {
  return {
    background: {
      width: "100%"
    },
    profilePreview: {
      margin: "0 auto",
      marginTop: theme.spacing(-11),
      [theme.breakpoints.up("sm")]: {
        margin: 0,
        marginTop: theme.spacing(-11),
        display: "inline-block",
        width: "auto"
      }
    },
    memberInfoContainer: {
      [theme.breakpoints.up("sm")]: {
        display: "inline-block"
      },
      padding: 0
    },
    content: {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      color: `${theme.palette.secondary.main}`,
      fontWeight: "bold"
    },
    noPadding: {
      padding: 0
    },
    infoContainer: {
      [theme.breakpoints.up("sm")]: {
        display: "flex"
      }
    },
    noprofile: {
      textAlign: "center",
      padding: theme.spacing(5)
    },
    marginTop: {
      marginTop: theme.spacing(1)
    },
    loginNudge: {
      textAlign: "center",
      margin: "0 auto"
    },
    container: {
      position: "relative"
    },
    createButton: {
      right: theme.spacing(1),
      position: "absolute",
      [theme.breakpoints.down("xs")]: {
        position: "relative",
        marginTop: theme.spacing(2)
      }
    }
  };
});

export default function ProfilePage({
  profile,
  projects,
  organizations,
  profileTypes,
  infoMetadata,
  token
}) {
  const { user } = useContext(UserContext);
  const [message, setMessage] = React.useState("");

  useEffect(() => {
    const params = getParams(window.location.href);
    if (params.message) setMessage(decodeURI(params.message));
  });
  return (
    <WideLayout message={message} title={profile ? profile.name + "'s profile" : "Not found"}>
      {profile ? (
        <ProfileLayout
          profile={profile}
          projects={projects}
          organizations={organizations}
          profileTypes={profileTypes}
          infoMetadata={infoMetadata}
          user={user}
          token={token}
        />
      ) : (
        <NoProfileFoundLayout />
      )}
    </WideLayout>
  );
}

ProfilePage.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  const profileUrl = encodeURI(ctx.query.profileUrl);
  return {
    profile: await getProfileByUrlIfExists(profileUrl, token),
    organizations: await getOrganizationsByUser(profileUrl, token),
    projects: await getProjectsByUser(profileUrl, token),
    profileTypes: await getProfileTypes(),
    infoMetadata: await getProfileInfoMetadata(),
    token: token
  };
};

function ProfileLayout({
  profile,
  projects,
  organizations,
  profileTypes,
  infoMetadata,
  user,
  token
}) {
  const classes = useStyles();
  const isOwnAccount = user && user.url_slug === profile.url_slug;
  const handleConnectBtn = async e => {
    e.preventDefault();
    const chat = await startPrivateChat(profile, token);
    Router.push("/chat/" + chat.chat_uuid + "/");
  };
  return (
    <AccountPage
      account={profile}
      default_background={DEFAULT_BACKGROUND_IMAGE}
      editHref={"/editprofile"}
      isOwnAccount={isOwnAccount}
      type="profile"
      possibleAccountTypes={profileTypes}
      infoMetadata={infoMetadata}
    >
      {!user && (
        <LoginNudge className={classes.loginNudge} whatToDo="see this user's full information" />
      )}
      <Container className={classes.container} id="projects">
        {user && user.url_slug !== profile.url_slug && (
          <Button variant="contained" color="primary" onClick={handleConnectBtn}>
            Message
          </Button>
        )}
        <h2>
          {isOwnAccount ? "Your projects:" : "This user's projects:"}
          <Button
            variant="contained"
            color="primary"
            href="/share"
            className={classes.createButton}
          >
            Share a project
          </Button>
        </h2>
        {projects && projects.length ? (
          <ProjectPreviews projects={projects} />
        ) : (
          <Typography>
            {(isOwnAccount ? "You are" : "This user is") + " not involved in any projects yet!"}
          </Typography>
        )}
      </Container>
      <Container className={classes.container}>
        <h2>
          {isOwnAccount ? "Your organizations" : "This user's organizations:"}
          <Button
            variant="contained"
            color="primary"
            href="/createorganization"
            className={classes.createButton}
          >
            Create an organization
          </Button>
        </h2>
        {organizations && organizations.length > 0 ? (
          <OrganizationPreviews organizations={organizations} showOrganizationType />
        ) : (
          <Typography>
            {(isOwnAccount ? "You are" : "This user is") +
              " not involved in any organizations yet!"}
          </Typography>
        )}
      </Container>
    </AccountPage>
  );
}

function NoProfileFoundLayout() {
  const classes = useStyles();
  return (
    <div className={classes.noprofile}>
      <Typography variant="h1">Profile not found.</Typography>
      <p>
        <Link href="/">
          <a>Click here to return to the homepage.</a>
        </Link>
      </p>
    </div>
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

async function getProfileTypes() {
  return TEMP_PROFILE_TYPES.profile_types;
}

async function getProfileInfoMetadata() {
  return TEMP_INFOMETADATA;
}

function parseProjectStubs(projects) {
  return projects.map(p => {
    const project = p.project;
    return {
      ...project,
      location: project.city ? project.city + ", " + project.country : project.country
    };
  });
}

function parseOrganizationStubs(organizations) {
  return organizations.map(o => ({
    ...o.organization,
    types: o.organization.types.map(type => type.organization_tag),
    info: {
      location: o.organization.city
        ? o.organization.city + ", " + o.organization.country
        : o.organization.country
    }
  }));
}

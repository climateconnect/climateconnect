import React, { useEffect } from "react";
import Link from "next/link";
import { Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import axios from "axios";
import { useContext } from "react";
import Cookies from "next-cookies";
import UserContext from "./../../src/components/context/UserContext";

import WideLayout from "../../src/components/layouts/WideLayout";
import ProjectPreviews from "./../../src/components/project/ProjectPreviews";
import OrganizationPreviews from "./../../src/components/organization/OrganizationPreviews";
import AccountPage from "./../../src/components/account/AccountPage";

import TEMP_PROFILE_TYPES from "./../../public/data/profile_types.json";
import TEMP_INFOMETADATA from "./../../public/data/profile_info_metadata.json";
import tokenConfig from "../../public/config/tokenConfig";
import LoginNudge from "../../src/components/general/LoginNudge";
import { parseProfile } from "./../../public/lib/profileOperations";
import { getParams } from "./../../public/lib/generalOperations";

const DEFAULT_BACKGROUND_IMAGE = "/images/background1.jpg";

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
    subtitle: {
      color: `${theme.palette.secondary.main}`
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
    cardHeadline: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(1)
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
    }
  };
});

export default function ProfilePage({
  profile,
  projects,
  organizations,
  profileTypes,
  infoMetadata
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
        />
      ) : (
        <NoProfileFoundLayout />
      )}
    </WideLayout>
  );
}

ProfilePage.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  return {
    profile: await getProfileByUrlIfExists(ctx.query.profileUrl, token),
    organizations: await getOrganizationsByUser(ctx.query.profileUrl, token),
    projects: await getProjectsByUser(ctx.query.profileUrl, token),
    profileTypes: await getProfileTypes(),
    infoMetadata: await getProfileInfoMetadata()
  };
};

function ProfileLayout({ profile, projects, organizations, profileTypes, infoMetadata, user }) {
  const classes = useStyles();
  return (
    <AccountPage
      account={profile}
      default_background={DEFAULT_BACKGROUND_IMAGE}
      editHref={"/editprofile"}
      isOwnAccount={user && user.url_slug === profile.url_slug}
      type="profile"
      possibleAccountTypes={profileTypes}
      infoMetadata={infoMetadata}
    >
      {!user && (
        <LoginNudge className={classes.loginNudge} whatToDo="see this user's full information" />
      )}
      <Container>
        <div className={`${classes.subtitle} ${classes.cardHeadline}`}>Projects:</div>
        {projects && projects.length ? (
          <ProjectPreviews projects={projects} />
        ) : (
          <Typography>This user is not involved in any projects yet!</Typography>
        )}
      </Container>
      <Container>
        <div className={`${classes.subtitle} ${classes.cardHeadline}`}>Organizations:</div>
        {organizations && organizations.length > 0 ? (
          <OrganizationPreviews organizations={organizations} showOrganizationType />
        ) : (
          <Typography>This user is not involved in any organizations yet!</Typography>
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

import React from "react";
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

import TEMP_PROJECT_DATA from "../../public/data/projects.json";
import TEMP_ORGANIZATION_DATA from "../../public/data/organizations.json";
import TEMP_PROFILE_TYPES from "./../../public/data/profile_types.json";
import TEMP_INFOMETADATA from "./../../public/data/profile_info_metadata.json";
import tokenConfig from '../../public/config/tokenConfig';

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
  return (
    <WideLayout title={profile ? profile.name + "'s profile" : "Not found"}>
      {profile ? (
        <ProfileLayout
          profile={profile}
          projects={projects}
          organizations={organizations}
          profileTypes={profileTypes}
          infoMetadata={infoMetadata}
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
    organizations: await getOrganizationsByUser(ctx.query.profileUrl),
    projects: await getProjects(ctx.query.profileUrl),
    profileTypes: await getProfileTypes(),
    infoMetadata: await getProfileInfoMetadata()
  };
};

function ProfileLayout({ profile, projects, organizations, profileTypes, infoMetadata }) {
  const classes = useStyles();
  const { user } = useContext(UserContext);
  return (
    <AccountPage
      account={profile}
      default_background={DEFAULT_BACKGROUND_IMAGE}
      editHref={"/editProfile/" + profile.url_slug}
      isOwnAccount={user && user.url_slug === profile.url_slug}
      type="profile"
      possibleAccountTypes={profileTypes}
      infoMetadata={infoMetadata}
    >
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
          <OrganizationPreviews organizations={organizations} showMembers />
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
    console.log(tokenConfig(token));
    const resp = await axios.get(
      process.env.API_URL + "/api/members/?search=" + profileUrl,
      tokenConfig(token)
    );
    if (resp.data.results.length === 0) return null;
    else {
      return parseProfile(resp.data.results[0]);
    }
  } catch (err) {
    //console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

function parseProfile(profile) {
  return {
    url_slug: profile.url_slug,
    name: profile.first_name + " " + profile.last_name,
    image: profile.profile_image,
    background_image: profile.background_image,
    info: {
      location: profile.city + ", " + profile.country,
      bio: profile.biography,
      skills: profile.skills,
      availability: profile.availability
    }
  };
}

async function getProjects(profileUrl) {
  return TEMP_PROJECT_DATA.projects.filter(
    project => !!project.team.find(m => m.url_slug === profileUrl)
  );
}

async function getOrganizationsByUser(profileUrl) {
  return TEMP_ORGANIZATION_DATA.organizations.filter(
    org => org.members && org.members.includes(profileUrl)
  );
}

async function getProfileTypes() {
  return TEMP_PROFILE_TYPES.profile_types;
}

async function getProfileInfoMetadata() {
  return TEMP_INFOMETADATA;
}

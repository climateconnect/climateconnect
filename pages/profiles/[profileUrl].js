import React from "react";
import Link from "next/link";
import { Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import WideLayout from "../../src/components/layouts/WideLayout";
import ProjectPreviews from "./../../src/components/project/ProjectPreviews";
import OrganizationPreviews from "./../../src/components/organization/OrganizationPreviews";
import AccountPage from "./../../src/components/account/AccountPage";

import TEMP_FEATURED_DATA from "../../public/data/profiles.json";
import TEMP_PROJECT_DATA from "../../public/data/projects.json";
import TEMP_ORGANIZATION_DATA from "../../public/data/organizations.json";
import TEMP_PROFILE_TYPES from "./../../public/data/profile_types.json";
import TEMP_INFOMETADATA from "./../../public/data/profile_info_metadata.json";

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
  return {
    profile: await getProfileByUrlIfExists(ctx.query.profileUrl),
    organizations: await getOrganizationsByUser(ctx.query.profileUrl),
    projects: await getProjects(ctx.query.profileUrl),
    profileTypes: await getProfileTypes(),
    infoMetadata: await getProfileInfoMetadata()
  };
};

function ProfileLayout({ profile, projects, organizations, profileTypes, infoMetadata }) {
  const classes = useStyles();
  return (
    <AccountPage
      account={profile}
      default_background={DEFAULT_BACKGROUND_IMAGE}
      editHref={"/editProfile/" + profile.url}
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
          <OrganizationPreviews organizations={organizations} />
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
async function getProfileByUrlIfExists(profileUrl) {
  return TEMP_FEATURED_DATA.profiles.find(({ url }) => url === profileUrl);
}

async function getProjects(profileUrl) {
  console.log(profileUrl);
  return TEMP_PROJECT_DATA.projects.filter(
    project => !!project.team.find(m => m.url === profileUrl)
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

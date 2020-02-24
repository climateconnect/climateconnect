import React from "react";
import Link from "next/link";
import WideLayout from "../../src/components/layouts/WideLayout";
import ProjectPreviews from "./../../src/components/project/ProjectPreviews";
import OrganizationPreviews from "./../../src/components/organization/OrganizationPreviews";
import ProfilePreview from "./../../src/components/profile/ProfilePreview";
import { Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TEMP_FEATURED_DATA from "../../public/data/profiles.json";
import TEMP_PROJECT_DATA from "../../public/data/projects.json";
import TEMP_ORGANIZATION_DATA from "../../public/data/organizations.json";

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

export default function ProfilePage({ profile, projects, organizations }) {
  return (
    <WideLayout title={profile ? profile.name + "'s profile" : "Not found"}>
      {profile ? (
        <ProfileLayout profile={profile} projects={projects} organizations={organizations} />
      ) : (
        <NoProfileFoundLayout />
      )}
    </WideLayout>
  );
}

ProfilePage.getInitialProps = async ctx => {
  return {
    profile: await getProfileByUrlIfExists(ctx.query.profileUrl),
    organizations: await getOrganizations(ctx.query.profileUrl),
    projects: await getProjects(ctx.query.profileUrl)
  };
};

function ProfileLayout({ profile, projects, organizations }) {
  const classes = useStyles();
  return (
    <Container maxWidth="lg" className={classes.noPadding}>
      <div
        style={{
          background: `url(${
            profile.background_image ? profile.background_image : DEFAULT_BACKGROUND_IMAGE
          })`,
          "background-size": "cover",
          "background-position": "center",
          width: "100%",
          height: 305
        }}
      />
      <Container className={classes.infoContainer}>
        <Container className={classes.profilePreview}>
          <ProfilePreview profile={profile} />
        </Container>
        <Container className={classes.memberInfoContainer}>
          {profile.bio && (
            <>
              <div className={`${classes.subtitle} ${classes.marginTop}`}>Bio:</div>
              <div className={classes.content}>{profile.bio}</div>
            </>
          )}
          {profile.location && (
            <>
              <div className={classes.subtitle}>Location:</div>
              <div className={classes.content}>{profile.location}</div>
            </>
          )}
          {profile.skills && (
            <>
              <div className={classes.subtitle}>Skills:</div>
              <div className={classes.content}>{profile.skills.join(", ")}</div>
            </>
          )}
          {profile.availability && (
            <>
              <div className={classes.subtitle}>Availability:</div>
              <div className={classes.content}>{profile.availability} hours per week</div>
            </>
          )}
        </Container>
      </Container>
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
    </Container>
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
  return TEMP_PROJECT_DATA.projects.filter(project => project.members.includes(profileUrl));
}

async function getOrganizations(profileUrl) {
  return TEMP_ORGANIZATION_DATA.organizations.filter(
    org => org.members && org.members.includes(profileUrl)
  );
}

import React from "react";
import Link from "next/link";
import AboutLayout from "../../src/components/layouts/AboutLayout";
import ProjectPreviews from "./../../src/components/project/ProjectPreviews";
import OrganisationPreviews from "./../../src/components/organisation/OrganisationPreviews";
import { Container, Avatar, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TEMP_FEATURED_DATA from "../../public/data/profiles.json";
import TEMP_PROJECT_DATA from "../../public/data/projects.json";
import TEMP_ORGANISATION_DATA from "../../public/data/organisations.json";

const DEFAULT_BACKGROUND_IMAGE = "/images/background1.jpg";

const useStyles = makeStyles(theme => {
  return {
    background: {
      width: "100%"
    },
    avatar: {
      height: theme.spacing(20),
      width: theme.spacing(20),
      margin: "0 auto",
      marginTop: theme.spacing(-11),
      fontSize: 50
    },
    avatarWithInfo: {
      textAlign: "center",
      width: theme.spacing(40),
      margin: "0 auto",
      [theme.breakpoints.up("sm")]: {
        margin: 0,
        display: "inline-block",
        width: "auto"
      }
    },
    memberInfo: {
      [theme.breakpoints.up("sm")]: {
        display: "inline-block"
      },
      padding: 0
    },
    name: {
      fontWeight: "bold",
      padding: theme.spacing(1)
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
    }
  };
});

export default function ProfilePage({ profile, projects, organisations }) {
  console.log(profile);
  return (
    <AboutLayout title={profile ? profile.name + "'s profile" : "Not found"}>
      {profile ? (
        <ProfileLayout profile={profile} projects={projects} organisations={organisations} />
      ) : (
        <NoProfileFoundLayout />
      )}
    </AboutLayout>
  );
}

ProfilePage.getInitialProps = async ctx => {
  return {
    profile: await getProfileByUrlIfExists(ctx.query.profileUrl),
    organisations: await getOrganisations(ctx.query.profileUrl),
    projects: await getProjects(ctx.query.profileUrl)
  };
};

function ProfileLayout({ profile, projects, organisations }) {
  if (projects && !projects.length) {
    projects = [projects];
  }
  const classes = useStyles();
  return (
    <Container maxWidth="lg" className={classes.noPadding}>
      <img
        src={profile.background_image ? profile.background_image : DEFAULT_BACKGROUND_IMAGE}
        className={classes.background}
      />
      <Container className={classes.infoContainer}>
        <Container className={classes.avatarWithInfo}>
          <Avatar
            alt={profile.name}
            size="large"
            src={"/images/" + profile.image}
            className={classes.avatar}
          />
          <Typography variant="h5" className={classes.name}>
            {profile.name}
          </Typography>
          <Typography className={classes.subtitle}>{profile.type}</Typography>
        </Container>
        <Container className={classes.memberInfo}>
          {profile.bio ? (
            <>
              <div className={classes.subtitle}>Bio:</div>
              <div className={classes.content}>{profile.bio}</div>
            </>
          ) : (
            <></>
          )}
          {profile.location ? (
            <>
              <div className={classes.subtitle}>Location:</div>
              <div className={classes.content}>{profile.location}</div>
            </>
          ) : (
            <></>
          )}
          {profile.skills ? (
            <>
              <div className={classes.subtitle}>Skills:</div>
              <div className={classes.content}>{profile.skills}</div>
            </>
          ) : (
            <></>
          )}
          {profile.availability ? (
            <>
              <div className={classes.subtitle}>Availability:</div>
              <div className={classes.content}>{profile.availability} hours per week</div>
            </>
          ) : (
            <></>
          )}
        </Container>
      </Container>
      <Container>
        <div className={`${classes.subtitle} ${classes.cardHeadline}`}>Projects:</div>
        {projects ? (
          <ProjectPreviews projects={projects} />
        ) : (
          <Typography>This user is not involved in any projects yet!</Typography>
        )}
      </Container>
      <Container>
        <div className={`${classes.subtitle} ${classes.cardHeadline}`}>Organisations:</div>
        {organisations && organisations.length > 0 ? (
          <OrganisationPreviews organisations={organisations} />
        ) : (
          <Typography>This user is not involved in any organisations yet!</Typography>
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
  console.log("projects");
  return TEMP_PROJECT_DATA.projects.find(({ members }) => members.includes(profileUrl));
}

async function getOrganisations(profileUrl) {
  return TEMP_ORGANISATION_DATA.organisations.filter(org => org.members.includes(profileUrl));
}

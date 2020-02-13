import React from "react";
import Link from "next/link";
import WideLayout from "../../src/components/layouts/WideLayout";
import ProjectPreviews from "../../src/components/project/ProjectPreviews";
import { Container, Avatar, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TEMP_FEATURED_DATA from "../../public/data/organizations.json";
import TEMP_PROJECT_DATA from "../../public/data/projects.json";

const DEFAULT_BACKGROUND_IMAGE = "/images/background1.jpg";

const useStyles = makeStyles(theme => {
  return {
    background: {
      width: "100%",
      height: 305
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

export default function ProfilePage({ organization, projects }) {
  console.log(organization);
  return (
    <WideLayout title={organization ? organization.name + "'s profile" : "Not found"}>
      {organization ? (
        <OrganizationLayout organization={organization} projects={projects} />
      ) : (
        <NoOrganizationFoundLayout />
      )}
    </WideLayout>
  );
}

ProfilePage.getInitialProps = async ctx => {
  return {
    organization: await getOrganizationByUrlIfExists(ctx.query.organizationUrl),
    projects: await getProjects(ctx.query.profileUrl)
  };
};

function OrganizationLayout({ organization, projects }) {
  const classes = useStyles();
  return (
    <Container maxWidth="lg" className={classes.noPadding}>
      <img
        src={
          organization.background_image ? organization.background_image : DEFAULT_BACKGROUND_IMAGE
        }
        className={classes.background}
      />
      <Container className={classes.infoContainer}>
        <Container className={classes.avatarWithInfo}>
          <Avatar
            alt={organization.name}
            size="large"
            src={"/images/" + organization.logo}
            className={classes.avatar}
          />
          <Typography variant="h5" className={classes.name}>
            {organization.name}
          </Typography>
          <Typography className={classes.subtitle}>{organization.type}</Typography>
        </Container>
        <Container className={classes.memberInfo}>
          {organization.shortdescription ? (
            <>
              <div className={classes.subtitle}>Description:</div>
              <div className={classes.content}>{organization.shortdescription}</div>
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
          <Typography>This organization has not listed any projects yet!</Typography>
        )}
      </Container>
    </Container>
  );
}

function NoOrganizationFoundLayout() {
  const classes = useStyles();
  return (
    <div className={classes.noprofile}>
      <Typography variant="h1">Organization profile not found.</Typography>
      <p>
        <Link href="/">
          <a>Click here to return to the homepage.</a>
        </Link>
      </p>
    </div>
  );
}

// This will likely become asynchronous in the future (a database lookup or similar) so it's marked as `async`, even though everything it does is synchronous.
async function getOrganizationByUrlIfExists(organizationUrl) {
  return TEMP_FEATURED_DATA.organizations.find(({ url }) => url === organizationUrl);
}

async function getProjects(profileUrl) {
  console.log("projects");
  return TEMP_PROJECT_DATA.projects.find(({ members }) => members.includes(profileUrl));
}

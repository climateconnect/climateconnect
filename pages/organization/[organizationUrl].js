import React from "react";
import Link from "next/link";
import WideLayout from "../../src/components/layouts/WideLayout";
//import ProfilePreviews from "../../src/components/profile/ProfilePreviews";
import ProjectPreviews from "../../src/components/project/ProjectPreviews";
import { Container, Avatar, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TEMP_FEATURED_DATA from "../../public/data/organizations.json";
import TEMP_PROJECT_DATA from "../../public/data/projects.json";
//import TEMP_MEMBER_DATA from "../../public/data/profiles.json";

const DEFAULT_BACKGROUND_IMAGE = "/images/background1.jpg";

const useStyles = makeStyles(theme => ({
  avatar: {
    height: theme.spacing(20),
    width: theme.spacing(20),
    margin: "0 auto",
    marginTop: theme.spacing(-11),
    fontSize: 50,
    backgroundcolor: "white",
    "& img": {
      objectFit: "contain",
      backgroundColor: "white"
    },
    border: `1px solid ${theme.palette.grey[300]}`
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
  organizationInfo: {
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
}));

export default function OrganizationPage({ organization, projects }) {
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

OrganizationPage.getInitialProps = async ctx => {
  return {
    organization: await getOrganizationByUrlIfExists(ctx.query.organizationUrl),
    projects: await getProjects(ctx.query.organizationUrl)
  };
};

function OrganizationLayout({ organization, projects }) {
  if (!organization.background_image) organization.background_image = DEFAULT_BACKGROUND_IMAGE;
  const classes = useStyles();
  return (
    <Container maxWidth="lg" className={classes.noPadding}>
      <div
        style={{
          background: `url(${organization.background_image})`,
          "background-size": "cover",
          "background-position": "center",
          width: "100%",
          height: 305
        }}
      />
      <Container className={classes.infoContainer}>
        <Container className={classes.avatarWithInfo}>
          <Avatar
            alt={organization.name}
            component="div"
            size="large"
            src={"/images/" + organization.logo}
            className={classes.avatar}
          />
          <Typography variant="h5" className={classes.name}>
            {organization.name}
          </Typography>
          <Typography className={classes.subtitle}>{organization.type}</Typography>
        </Container>
        <Container className={classes.organizationInfo}>
          {organization.shortdescription ? (
            <>
              <div className={classes.subtitle}>Description:</div>
              <div className={classes.content}>{organization.shortdescription}</div>
            </>
          ) : (
            <></>
          )}
          {organization.location ? (
            <>
              <div className={classes.subtitle}>Location:</div>
              <div className={classes.content}>{organization.location}</div>
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

async function getProjects(organizationUrl) {
  return TEMP_PROJECT_DATA.projects.filter(project =>
    project.organization_url.includes(organizationUrl)
  );
}

/*async function getMembers(organizationUrl) {
  return TEMP_MEMBER_DATA.projects.filter(member => member.organizations.includes(organizationUrl));
}*/

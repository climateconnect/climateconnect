import React from "react";
import Link from "next/link";
import WideLayout from "../../src/components/layouts/WideLayout";
import EditAccountPage from "../../src/components/account/EditAccountPage";
import TEMP_FEATURED_DATA from "../../public/data/organizations.json";
import TEMP_PROJECT_DATA from "../../public/data/projects.json";
import TEMP_MEMBER_DATA from "../../public/data/profiles.json";
import { Typography, Container } from "@material-ui/core";
import ProfilePreviews from "../../src/components/profile/ProfilePreviews";
import ProjectPreviews from "../../src/components/project/ProjectPreviews";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
  cardHeadline: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1)
  },
  subtitle: {
    color: `${theme.palette.secondary.main}`
  }
}));

//This route should only be accessible to admins of the organization

export default function EditOrganizationPage({ organization, projects, members }) {
  const classes = useStyles();

  return (
    <WideLayout title={organization ? organization.name + "'s profile" : "Not found"}>
      {organization ? (
        <EditAccountPage
          type="organization"
          account={organization}
          editHref={"/editOrganization/" + organization.url}
        >
          <Container>
            <div className={`${classes.subtitle} ${classes.cardHeadline}`}>Projects:</div>
            {projects && projects.length ? (
              <ProjectPreviews projects={projects} />
            ) : (
              <Typography>This organization has not listed any projects yet!</Typography>
            )}
          </Container>
          <Container>
            <div className={`${classes.subtitle} ${classes.cardHeadline}`}>Members:</div>
            {members && members.length ? (
              <ProfilePreviews profiles={members} />
            ) : (
              <Typography>None of the members of this organization has signed up yet!</Typography>
            )}
          </Container>
        </EditAccountPage>
      ) : (
        <NoOrganizationFoundLayout />
      )}
    </WideLayout>
  );
}

EditOrganizationPage.getInitialProps = async ctx => {
  return {
    organization: await getOrganizationByUrlIfExists(ctx.query.organizationUrl),
    projects: await getProjects(ctx.query.organizationUrl),
    members: await getMembers(ctx.query.organizationUrl)
  };
};

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

async function getMembers(organizationUrl) {
  return TEMP_MEMBER_DATA.profiles.filter(member => member.organizations.includes(organizationUrl));
}

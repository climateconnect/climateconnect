import React from "react";
import Link from "next/link";
import { Typography, Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Cookies from "next-cookies";
import axios from "axios";

import WideLayout from "../../src/components/layouts/WideLayout";
import AccountPage from "../../src/components/account/AccountPage";
import ProfilePreviews from "../../src/components/profile/ProfilePreviews";
import ProjectPreviews from "../../src/components/project/ProjectPreviews";

import TEMP_FEATURED_DATA from "../../public/data/organizations.json";
import TEMP_PROJECT_DATA from "../../public/data/projects.json";
import TEMP_MEMBER_DATA from "../../public/data/profiles.json";
import TEMP_ORGANIZATION_TYPES from "./../../public/data/organization_types.json";
import TEMP_INFOMETADATA from "./../../public/data/organization_info_metadata.js";
import tokenConfig from '../../public/config/tokenConfig';

const DEFAULT_BACKGROUND_IMAGE = "/images/background1.jpg";

const useStyles = makeStyles(theme => ({
  cardHeadline: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1)
  },
  subtitle: {
    color: `${theme.palette.secondary.main}`
  }
}));

export default function OrganizationPage({
  organization,
  projects,
  members,
  organizationTypes,
  infoMetadata
}) {
  console.log(organization)
  return (
    <WideLayout title={organization ? organization.name + "'s profile" : "Not found"}>
      {organization ? (
        <OrganizationLayout
          organization={organization}
          projects={projects}
          members={members}
          organizationTypes={organizationTypes}
          infoMetadata={infoMetadata}
        />
      ) : (
        <NoOrganizationFoundLayout />
      )}
    </WideLayout>
  );
}

OrganizationPage.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  return {
    organization: await getOrganizationByUrlIfExists(ctx.query.organizationUrl, token),
    projects: await getProjectsByOrganization(ctx.query.organizationUrl),
    members: await getMembersByOrganization(ctx.query.organizationUrl),
    organizationTypes: await getOrganizationTypes(),
    infoMetadata: await getOrganizationInfoMetadata()
  };
};

function OrganizationLayout({ organization, projects, members, organizationTypes, infoMetadata }) {
  const classes = useStyles();
  return (
    <AccountPage
      account={organization}
      default_background={DEFAULT_BACKGROUND_IMAGE}
      editHref={"/editOrganization/" + organization.url}
      type="organization"
      possibleAccountTypes={organizationTypes}
      infoMetadata={infoMetadata}
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
    </AccountPage>
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

// These will likely become asynchronous in the future (a database lookup or similar) so it's marked as `async`, even though everything it does is synchronous.
async function getOrganizationByUrlIfExists(organizationUrl, token) {
  console.log('getting organization by url')
  try {
    console.log('here is the token config')
    console.log('token: ', token)
    console.log(tokenConfig(token));
    const resp = await axios.get(
      process.env.API_URL + "/organizations/?search=" + organizationUrl,
      tokenConfig(token)
    );
    console.log(resp.data.results[0])
    if (resp.data.results.length === 0) return null;
    else {
      //console.log(resp.data.results[0]);
      return parseOrganization(resp.data.results[0]);
    }
  } catch (err) {
    //console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

function parseOrganization(organization) {
  console.log(organization)
  return {
    url_slug: organization.url_slug,
    background_image: organization.background_image,
    name: organization.name,
    image: organization.image,
    types: organization.types /* TODO get actual types, this is always empty.*/,
    info: {
      location: organization.city+", "+organization.country,
      shortdescription: organization.short_description,
      school: organization.school,
      organ: organization.organ,
      parent_organization: organization.parent_organization
    }
  }
}

async function getProjectsByOrganization(organizationUrl) {
  return TEMP_PROJECT_DATA.projects.filter(project =>
    project.creator_url.includes(organizationUrl)
  );
}

async function getMembersByOrganization(organizationUrl) {
  return TEMP_MEMBER_DATA.profiles.filter(member => member.organizations.includes(organizationUrl));
}

async function getOrganizationTypes() {
  return TEMP_ORGANIZATION_TYPES.organization_types;
}

async function getOrganizationInfoMetadata() {
  return TEMP_INFOMETADATA;
}

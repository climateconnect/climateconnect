import React from "react";
import Link from "next/link";
import { Typography, Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Cookies from "next-cookies";
import axios from "axios";
import { useContext } from "react";
import UserContext from "./../../src/components/context/UserContext";

import WideLayout from "../../src/components/layouts/WideLayout";
import AccountPage from "../../src/components/account/AccountPage";
import ProfilePreviews from "../../src/components/profile/ProfilePreviews";
import ProjectPreviews from "../../src/components/project/ProjectPreviews";

import TEMP_INFOMETADATA from "./../../public/data/organization_info_metadata.js";
import tokenConfig from "../../public/config/tokenConfig";

import LocationOnIcon from "@material-ui/icons/LocationOn";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import LoginNudge from "../../src/components/general/LoginNudge";

const DEFAULT_BACKGROUND_IMAGE = "/images/background1.jpg";

const useStyles = makeStyles(theme => ({
  cardHeadline: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1)
  },
  subtitle: {
    color: `${theme.palette.secondary.main}`
  },
  loginNudge: {
    textAlign: "center",
    margin: "0 auto"
  }
}));

export default function OrganizationPage({
  organization,
  projects,
  members,
  organizationTypes,
  infoMetadata
}) {
  const { user } = useContext(UserContext);
  return (
    <WideLayout title={organization ? organization.name + "'s profile" : "Not found"}>
      {organization ? (
        <OrganizationLayout
          organization={organization}
          projects={projects}
          members={members}
          organizationTypes={organizationTypes}
          infoMetadata={infoMetadata}
          user={user}
        />
      ) : (
        <NoOrganizationFoundLayout />
      )}
    </WideLayout>
  );
}

OrganizationPage.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  const organizationUrl = encodeURI(ctx.query.organizationUrl)
  return {
    organization: await getOrganizationByUrlIfExists(organizationUrl, token),
    projects: await getProjectsByOrganization(organizationUrl, token),
    members: await getMembersByOrganization(organizationUrl, token),
    infoMetadata: await getOrganizationInfoMetadata()
  };
};

function OrganizationLayout({ organization, projects, members, infoMetadata, user }) {
  const classes = useStyles();
  const getMembersWithAdditionalInfo = members => {
    return members.map(m => ({
      ...m,
      additionalInfo: [
        {
          text: m.location,
          icon: LocationOnIcon,
          iconName: "LocationOnIcon",
          importance: "high"
        },
        {
          text: m.role_in_organization,
          icon: AccountBoxIcon,
          iconName: "AccountBoxIcon",
          importance: "high",
          toolTipText: "Role in organization"
        },
        {
          text: m.permission,
          importance: "low"
        }
      ]
    }));
  };
  const membersWithAdditionalInfo = getMembersWithAdditionalInfo(members);

  return (
    <AccountPage
      account={organization}
      default_background={DEFAULT_BACKGROUND_IMAGE}
      editHref={"/editOrganization/" + organization.url_slug}
      type="organization"
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
          <Typography>This organization has not listed any projects yet!</Typography>
        )}
      </Container>
      <Container>
        <div className={`${classes.subtitle} ${classes.cardHeadline}`}>Members:</div>
        {members && members.length ? (
          <ProfilePreviews profiles={membersWithAdditionalInfo} showAdditionalInfo />
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
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/organizations/" + organizationUrl + "/",
      tokenConfig(token)
    );
    if (!resp.data) return null;
    else {
      return parseOrganization(resp.data);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getProjectsByOrganization(organizationUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/organizations/" + organizationUrl + "/projects/",
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

async function getMembersByOrganization(organizationUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/organizations/" + organizationUrl + "/members/",
      tokenConfig(token)
    );
    if (!resp.data) return null;
    else {
      return parseProjectMembers(resp.data.results);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getOrganizationInfoMetadata() {
  return TEMP_INFOMETADATA;
}

function parseOrganization(organization) {
  return {
    url_slug: organization.url_slug,
    background_image: organization.background_image,
    name: organization.name,
    image: organization.image,
    types: organization.types.map(t => ({ ...t.organization_tag, key: t.organization_tag.id })),
    info: {
      location: organization.city
        ? organization.city + ", " + organization.country
        : organization.country,
      shortdescription: organization.short_description,
      school: organization.school,
      organ: organization.organ,
      parent_organization: organization.parent_organization
    }
  };
}

function parseProjectStubs(projects) {
  return projects.map(p => {
    const project = p.project;
    return {
      ...project,
      location: project.city + ", " + project.country
    };
  });
}

function parseProjectMembers(members) {
  return members.map(m => {
    const member = m.user;
    return {
      ...member,
      name: member.first_name + " " + member.last_name,
      permission: m.permission === "Creator" ? "Administrator" : m.permission,
      time_per_week: m.time_per_week,
      role_in_organization: m.role_in_organization,
      location: member.city ? member.city + ", " + member.country : member.country
    };
  });
}

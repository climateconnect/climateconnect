import React, { useEffect } from "react";
import Link from "next/link";
import { Typography, Container, Button, Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import NextCookies from "next-cookies";
import axios from "axios";
import { useContext } from "react";
import UserContext from "./../../src/components/context/UserContext";

import WideLayout from "../../src/components/layouts/WideLayout";
import AccountPage from "../../src/components/account/AccountPage";
import ProfilePreviews from "../../src/components/profile/ProfilePreviews";
import ProjectPreviews from "../../src/components/project/ProjectPreviews";

import TEMP_INFOMETADATA from "./../../public/data/organization_info_metadata.js";
import tokenConfig from "../../public/config/tokenConfig";
import { getParams } from "./../../public/lib/generalOperations";

import LocationOnIcon from "@material-ui/icons/LocationOn";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import LoginNudge from "../../src/components/general/LoginNudge";
import { parseOrganization } from "../../public/lib/organizationOperations";
import { startPrivateChat } from "../../public/lib/messagingOperations";
import Router from "next/router";
import Cookies from "universal-cookie";

const DEFAULT_BACKGROUND_IMAGE = "/images/default_background_org.jpg";

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
  },
  editButton: {
    marginBottom: theme.spacing(1)
  },
  divider: {
    marginTop: theme.spacing(1)
  }
}));

export default function OrganizationPage({
  organization,
  projects,
  members,
  organizationTypes,
  infoMetadata
}) {
  const [message, setMessage] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  useEffect(() => {
    const params = getParams(window.location.href);
    if (params.message) setMessage(decodeURI(params.message));
    if (params.errorMessage) setErrorMessage(decodeURI(params.message));
  });
  const { user } = useContext(UserContext);
  return (
    <WideLayout
      errorMessage={errorMessage}
      message={message}
      title={organization ? organization.name : "Not found"}
    >
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
  const { token } = NextCookies(ctx);
  const organizationUrl = encodeURI(ctx.query.organizationUrl);
  return {
    organization: await getOrganizationByUrlIfExists(organizationUrl, token),
    projects: await getProjectsByOrganization(organizationUrl, token),
    members: await getMembersByOrganization(organizationUrl, token),
    organizationTypes: await getOrganizationTypes(),
    infoMetadata: await getOrganizationInfoMetadata()
  };
};

function OrganizationLayout({ organization, projects, members, infoMetadata, user }) {
  const classes = useStyles();
  const cookies = new Cookies();
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

  const handleConnectBtn = async e => {
    e.preventDefault();
    const token = cookies.get("token");
    const creator = members.filter(m => m.isCreator === true)[0];
    const chat = await startPrivateChat(creator, token);
    Router.push("/chat/" + chat.chat_uuid + "/");
  };

  const canEdit =
    user &&
    !!members.find(m => m.id === user.id) &&
    ["Creator", "Administrator"].includes(members.find(m => m.id === user.id).permission);

  const membersWithAdditionalInfo = getMembersWithAdditionalInfo(members);
  return (
    <AccountPage
      account={organization}
      default_background={DEFAULT_BACKGROUND_IMAGE}
      editHref={"/editOrganization/" + organization.url_slug}
      type="organization"
      infoMetadata={infoMetadata}
      isOwnAccount={canEdit}
      editText={"Edit organization"}
    >
      {!user && (
        <LoginNudge
          className={classes.loginNudge}
          whatToDo="see this organization's full information"
        />
      )}
      <Container>
        {user && !canEdit && (
          <Button variant="contained" color="primary" onClick={handleConnectBtn}>
            Message
          </Button>
        )}
        <div className={`${classes.subtitle} ${classes.cardHeadline}`}>
          This {"organization's"} Projects:{" "}
          <Button variant="contained" color="primary" href="/share">
            Share a project
          </Button>
        </div>
        {projects && projects.length ? (
          <ProjectPreviews projects={projects} />
        ) : (
          <Typography>This organization has not listed any projects yet!</Typography>
        )}
      </Container>
      <Divider className={classes.divider} />
      <Container>
        <div className={`${classes.subtitle} ${classes.cardHeadline}`}>
          {canEdit && (
            <div>
              <Button
                className={classes.editButton}
                variant="contained"
                color="primary"
                href={"/manageOrganizationMembers/" + organization.url_slug}
              >
                Manage members
              </Button>
            </div>
          )}
          Members:
        </div>
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
    return parseOrganization(resp.data);
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
      return parseOrganizationMembers(resp.data.results);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getOrganizationTypes() {
  return [];
}

async function getOrganizationInfoMetadata() {
  return TEMP_INFOMETADATA;
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

function parseOrganizationMembers(members) {
  return members.map(m => {
    const member = m.user;
    return {
      ...member,
      name: member.first_name + " " + member.last_name,
      permission: m.permission.name === "Creator" ? "Administrator" : m.permission.name,
      isCreator: m.permission.name === "Creator",
      time_per_week: m.time_per_week,
      role_in_organization: m.role_in_organization,
      location: member.city ? member.city + ", " + member.country : member.country
    };
  });
}

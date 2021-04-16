import { Button, Container, Divider, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import NextCookies from "next-cookies";
import Router from "next/router";
import React, { useContext } from "react";
import Cookies from "universal-cookie";
import { apiRequest, getLocalePrefix } from "../../public/lib/apiOperations";
import { startPrivateChat } from "../../public/lib/messagingOperations";
import { parseOrganization } from "../../public/lib/organizationOperations";
import getTexts from "../../public/texts/texts";
import AccountPage from "../../src/components/account/AccountPage";
import LoginNudge from "../../src/components/general/LoginNudge";
import PageNotFound from "../../src/components/general/PageNotFound";
import WideLayout from "../../src/components/layouts/WideLayout";
import ProfilePreviews from "../../src/components/profile/ProfilePreviews";
import ProjectPreviews from "../../src/components/project/ProjectPreviews";
import getOrganizationInfoMetadata from "./../../public/data/organization_info_metadata.js";
import UserContext from "./../../src/components/context/UserContext";

const DEFAULT_BACKGROUND_IMAGE = "/images/default_background_org.jpg";

const useStyles = makeStyles((theme) => ({
  cardHeadline: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    color: `${theme.palette.secondary.main}`,
  },
  loginNudge: {
    textAlign: "center",
    margin: "0 auto",
  },
  editButton: {
    marginBottom: theme.spacing(1),
  },
  divider: {
    marginTop: theme.spacing(1),
  },
}));

export async function getServerSideProps(ctx) {
  const { token } = NextCookies(ctx);
  const organizationUrl = encodeURI(ctx.query.organizationUrl);
  const [organization, projects, members, organizationTypes, infoMetadata] = await Promise.all([
    getOrganizationByUrlIfExists(organizationUrl, token, ctx.locale),
    getProjectsByOrganization(organizationUrl, token, ctx.locale),
    getMembersByOrganization(organizationUrl, token, ctx.locale),
    getOrganizationTypes(),
    getOrganizationInfoMetadata(),
  ]);
  return {
    props: {
      organization: organization,
      projects: projects,
      members: members,
      organizationTypes: organizationTypes,
      infoMetadata: infoMetadata,
    },
  };
}

export default function OrganizationPage({
  organization,
  projects,
  members,
  organizationTypes,
  infoMetadata,
}) {
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "organization", locale: locale, organization: organization });
  return (
    <WideLayout
      title={organization ? organization.name : texts.not_found_error}
      description={organization.name + " | " + organization.info.shortdescription}
    >
      {organization ? (
        <OrganizationLayout
          organization={organization}
          projects={projects}
          members={members}
          organizationTypes={organizationTypes}
          infoMetadata={infoMetadata}
          user={user}
          texts={texts}
          locale={locale}
        />
      ) : (
        <PageNotFound itemName={texts.organization} />
      )}
    </WideLayout>
  );
}

function OrganizationLayout({
  organization,
  projects,
  members,
  infoMetadata,
  user,
  texts,
  locale,
}) {
  const classes = useStyles();
  const cookies = new Cookies();
  const getMembersWithAdditionalInfo = (members) => {
    return members.map((m) => ({
      ...m,
      additionalInfo: [
        {
          text: m.location,
          icon: LocationOnIcon,
          iconName: "LocationOnIcon",
          importance: "high",
        },
        {
          text: m.role_in_organization,
          icon: AccountBoxIcon,
          iconName: "AccountBoxIcon",
          importance: "high",
          toolTipText: texts.role_in_organization,
        },
        {
          text: m.permission,
          importance: "low",
        },
      ],
    }));
  };

  const handleConnectBtn = async (e) => {
    e.preventDefault();
    const token = cookies.get("token");
    const creator = members.filter((m) => m.isCreator === true)[0];
    const chat = await startPrivateChat(creator, token, locale);
    Router.push("/chat/" + chat.chat_uuid + "/");
  };

  const canEdit =
    user &&
    !!members.find((m) => m.id === user.id) &&
    ["Creator", "Administrator"].includes(members.find((m) => m.id === user.id).permission);

  const membersWithAdditionalInfo = getMembersWithAdditionalInfo(members);
  return (
    <AccountPage
      account={organization}
      default_background={DEFAULT_BACKGROUND_IMAGE}
      editHref={getLocalePrefix(locale) + "/editOrganization/" + organization.url_slug}
      type="organization"
      infoMetadata={infoMetadata}
      isOwnAccount={canEdit}
      editText={texts.edit_organization}
    >
      {!user && (
        <LoginNudge
          className={classes.loginNudge}
          whatToDo={texts.to_see_this_organizations_full_information}
        />
      )}
      <Container>
        {user && !canEdit && (
          <Button variant="contained" color="primary" onClick={handleConnectBtn}>
            {texts.message}
          </Button>
        )}
        <div className={`${classes.subtitle} ${classes.cardHeadline}`}>
          {texts.this_organizations_projects}:{" "}
          <Button variant="contained" color="primary" href={getLocalePrefix(locale) + "/share"}>
            {texts.share_a_project}
          </Button>
        </div>
        {projects && projects.length ? (
          <ProjectPreviews projects={projects} />
        ) : (
          <Typography>{texts.this_organization_has_not_listed_any_projects_yet}</Typography>
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
                href={
                  getLocalePrefix(locale) + "/manageOrganizationMembers/" + organization.url_slug
                }
              >
                {texts.manage_members}
              </Button>
            </div>
          )}
          {texts.members}:
        </div>
        {members && members.length ? (
          <ProfilePreviews profiles={membersWithAdditionalInfo} showAdditionalInfo />
        ) : (
          <Typography>
            {texts.none_of_the_members_of_this_organization_has_signed_up_yet}
          </Typography>
        )}
      </Container>
    </AccountPage>
  );
}

async function getOrganizationByUrlIfExists(organizationUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/organizations/" + organizationUrl + "/",
      token: token,
      locale: locale,
    });
    return parseOrganization(resp.data);
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getProjectsByOrganization(organizationUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/organizations/" + organizationUrl + "/projects/",
      token: token,
      locale: locale,
    });
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

async function getMembersByOrganization(organizationUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/organizations/" + organizationUrl + "/members/",
      token: token,
      locale: locale,
    });
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

function parseProjectStubs(projects) {
  return projects.map((p) => {
    const project = p.project;
    return {
      ...project,
      location: project.location,
    };
  });
}

function parseOrganizationMembers(members) {
  return members.map((m) => {
    const member = m.user;
    return {
      ...member,
      name: member.first_name + " " + member.last_name,
      permission: m.permission.name === "Creator" ? "Administrator" : m.permission.name,
      isCreator: m.permission.name === "Creator",
      time_per_week: m.time_per_week,
      role_in_organization: m.role_in_organization,
      location: member.location,
    };
  });
}

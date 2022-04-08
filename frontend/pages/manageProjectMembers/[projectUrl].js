import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Cookies from "next-cookies";
import React, { useContext } from "react";

import ROLE_TYPES from "../../public/data/role_types";
import { apiRequest, sendToLogin } from "../../public/lib/apiOperations";
import getTexts from "../../public/texts/texts";
import UserContext from "../../src/components/context/UserContext";
import LoginNudge from "../../src/components/general/LoginNudge";
import Layout from "../../src/components/layouts/layout";
import WideLayout from "../../src/components/layouts/WideLayout";
import ManageProjectMembers from "../../src/components/project/ManageProjectMembers";

const useStyles = makeStyles((theme) => {
  return {
    headline: {
      textAlign: "center",
      marginTop: theme.spacing(4),
    },
  };
});

export async function getServerSideProps(ctx) {
  const { token } = Cookies(ctx);
  const texts = getTexts({ page: "project", locale: ctx.locale });
  if (ctx.req && !token) {
    const message = texts.you_have_to_log_in_to_manage_a_projects_members;
    return sendToLogin(ctx, message, ctx.locale, ctx.resolvedUrl);
  }
  const projectUrl = encodeURI(ctx.query.projectUrl);
  const [project, members, rolesOptions, availabilityOptions] = await Promise.all([
    getProjectByUrlIfExists(projectUrl, token, ctx.locale),
    getMembersByProject(projectUrl, token, ctx.locale),
    getRolesOptions(token, ctx.locale),
    getAvailabilityOptions(token, ctx.locale),
  ]);

  return {
    props: {
      project: project,
      members: members,
      rolesOptions: rolesOptions,
      availabilityOptions: availabilityOptions,
      token: token,
    },
  };
}

export default function manageProjectMembers({
  project,
  members,
  availabilityOptions,
  rolesOptions,
  token,
}) {
  const { user, locale } = useContext(UserContext);
  const texts = getTexts({ page: "project", locale: locale, project: project });
  const classes = useStyles();
  const [currentMembers, setCurrentMembers] = React.useState(
    members ? [...members.sort((a, b) => b.role.role_type - a.role.role_type)] : []
  );

  if (!user)
    return (
      <WideLayout
        title={texts.please_log_in + " " + texts.to_manage_the_members_of_this_project}
        hideHeadline={true}
      >
        <LoginNudge fullPage whatToDo={texts.to_manage_the_members_of_this_project} />
      </WideLayout>
    );
  else if (!members.find((m) => m.id === user.id))
    return (
      <WideLayout
        title={texts.please_log_in + " " + texts.to_manage_the_members_of_this_project}
        hideHeadline={true}
      >
        <Typography variant="h4" color="primary" className={classes.headline}>
          {texts.you_are_not_a_member_of_this_project}{" "}
        </Typography>
      </WideLayout>
    );
  else if (
    members.find((m) => m.id === user.id).role.role_type != ROLE_TYPES.all_type &&
    members.find((m) => m.id === user.id).role.role_type != ROLE_TYPES.read_write_type
  )
    return (
      <WideLayout title={texts.no_permission_to_manage_members_of_this_project} hideHeadline={true}>
        <Typography variant="h4" color="primary" className={classes.headline}>
          {texts.you_need_to_be_an_administrator_of_the_project_to_manage_project_members}
        </Typography>
      </WideLayout>
    );
  else {
    return (
      <Layout title={texts.manage_projects_members} hideHeadline>
        <ManageProjectMembers
          user={user}
          members={members}
          currentMembers={currentMembers}
          setCurrentMembers={setCurrentMembers}
          rolesOptions={rolesOptions}
          project={project}
          token={token}
          availabilityOptions={availabilityOptions}
        />
      </Layout>
    );
  }
}

async function getProjectByUrlIfExists(projectUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projects/" + projectUrl + "/",
      token: token,
      locale: locale,
    });
    return parseProject(resp.data);
  } catch (err) {
    //console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getMembersByProject(projectUrl, token, locale) {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/api/projects/" + projectUrl + "/members/",
      token: token,
      locale: locale,
    });
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

function parseProjectMembers(members) {
  return members.map((m) => {
    const member = m.user;
    return {
      ...member,
      member_id: m.id,
      id: member.id,
      image: process.env.API_URL + member.image,
      name: member.first_name + " " + member.last_name,
      role: m.role,
      availability: m.availability,
      role_in_project: m.role_in_project ? m.role_in_project : "",
      location: member.location,
      isCreator: m.role.role_type === ROLE_TYPES.all_type,
    };
  });
}

function parseProject(project) {
  return {
    name: project.name,
    id: project.id,
    url_slug: project.url_slug,
    image: project.image,
    status: project.status,
    location: project.location,
    description: project.description,
    short_description: project.short_description,
    collaborators_welcome: project.collaborators_welcome,
    start_date: project.start_date,
    end_date: project.end_date,
    creation_date: project.created_at,
    helpful_skills: project.skills,
    helpful_connections: project.helpful_connections,
    creator: project.project_parents[0].parent_organization
      ? project.project_parents[0].parent_organization
      : project.project_parents[0].parent_user,
    isPersonalProject: !project.project_parents[0].parent_organization,
    tags: project.tags.map((t) => t.project_tag.name),
    collaborating_organizations: project.collaborating_organizations.map(
      (o) => o.collaborating_organization
    ),
  };
}

const getRolesOptions = async (token, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/roles/",
      token: token,
      locale: locale,
    });
    if (resp.data.results.length === 0) return null;
    else {
      return resp.data.results;
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};

const getAvailabilityOptions = async (token, locale) => {
  try {
    const resp = await apiRequest({
      method: "get",
      url: "/availability/",
      token: token,
      locale: locale,
    });
    if (resp.data.results.length === 0) return null;
    else {
      return resp.data.results;
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};

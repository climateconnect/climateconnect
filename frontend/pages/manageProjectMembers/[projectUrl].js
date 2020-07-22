import Layout from "../../src/components/layouts/layout";
import React from "react";
import tokenConfig from "../../public/config/tokenConfig";
import axios from "axios";
import { useContext } from "react";
import Cookies from "next-cookies";
import UserContext from "../../src/components/context/UserContext";
import WideLayout from "../../src/components/layouts/WideLayout";
import LoginNudge from "../../src/components/general/LoginNudge";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ManageProjectMembers from "../../src/components/project/ManageProjectMembers";

const useStyles = makeStyles(theme => {
  return {
    headline: {
      textAlign: "center",
      marginTop: theme.spacing(4)
    }
  };
});

export default function manageProjectMembers({
  project,
  members,
  availabilityOptions,
  rolesOptions,
  token
}) {
  const { user } = useContext(UserContext);
  const classes = useStyles();
  const [currentMembers, setCurrentMembers] = React.useState(
    members ? [...members.sort((a, b) => b.role.role_type - a.role.role_type)] : []
  );
  if (!user)
    return (
      <WideLayout title="Please log in to manage the members of this project" hideHeadline={true}>
        <LoginNudge fullPage whatToDo="manage the members of this project" />
      </WideLayout>
    );
  else if (!members.find(m => m.id === user.id))
    return (
      <WideLayout title="Please log in to manage the members of an project" hideHeadline={true}>
        <Typography variant="h4" color="primary" className={classes.headline}>
          You are not a member of this project. Go to{" "}
          <a href={"/projects/" + project.url_slug}>the project page</a> and click join to join it.
        </Typography>
      </WideLayout>
    );
  else if (
    members.find(m => m.id === user.id).role.name != "Creator" &&
    members.find(m => m.id === user.id).role.name != "Administrator"
  )
    return (
      <WideLayout title="No permission to manage members of this project" hideHeadline={true}>
        <Typography variant="h4" color="primary" className={classes.headline}>
          You need to be an administrator of the project to manage project members.
        </Typography>
      </WideLayout>
    );
  else {
    return (
      <Layout title="Manage project's members" hideHeadline>
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

manageProjectMembers.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  const projectUrl = encodeURI(ctx.query.projectUrl);
  return {
    project: await getProjectByUrlIfExists(projectUrl, token),
    members: await getMembersByProject(projectUrl, token),
    rolesOptions: await getRolesOptions(token),
    availabilityOptions: await getAvailabilityOptions(token),
    token: token
  };
};

async function getProjectByUrlIfExists(projectUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/projects/" + projectUrl + "/",
      tokenConfig(token)
    );
    return parseProject(resp.data);
  } catch (err) {
    //console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

async function getMembersByProject(projectUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/projects/" + projectUrl + "/members/",
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

function parseProjectMembers(members) {
  return members.map(m => {
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
      location: member.city ? member.city + ", " + member.country : member.country,
      isCreator: m.role.role_type === 2
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
    location: project.city + ", " + project.country,
    description: project.description,
    shortdescription: project.short_description,
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
    tags: project.tags.map(t => t.project_tag.name),
    collaborating_organizations: project.collaborating_organizations.map(
      o => o.collaborating_organization
    )
  };
}
const getRolesOptions = async token => {
  try {
    const resp = await axios.get(process.env.API_URL + "/roles/", tokenConfig(token));
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

const getAvailabilityOptions = async token => {
  try {
    const resp = await axios.get(process.env.API_URL + "/availability/", tokenConfig(token));
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

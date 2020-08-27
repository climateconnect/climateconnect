import React, { useContext } from "react";
import Layout from "../../src/components/layouts/layout";
import Cookies from "next-cookies";
import tokenConfig from "../../public/config/tokenConfig";
import axios from "axios";
import EditProjectRoot from "../../src/components/editProject/EditProjectRoot";
import { Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import UserContext from "../../src/components/context/UserContext";
import LoginNudge from "../../src/components/general/LoginNudge";
import WideLayout from "../../src/components/layouts/WideLayout";
import { getImageUrl } from "../../public/lib/imageOperations";
import {
  getSkillsOptions,
  getStatusOptions,
  getProjectTagsOptions
} from "../../public/lib/getOptions";

const useStyles = makeStyles(theme => ({
  root: {
    textAlign: "center"
  },
  errorTitle: {
    textAlign: "center",
    marginTop: theme.spacing(8)
  }
}));

export default function EditProjectPage({
  project,
  members,
  skillsOptions,
  userOrganizations,
  statusOptions,
  tagsOptions,
  token
}) {
  const classes = useStyles();
  const [curProject, setCurProject] = React.useState({
    ...project,
    status: statusOptions.find(s => s.name === project.status)
  });
  project = {
    ...project,
    status: statusOptions.find(s => s.name === project.status)
  };
  const { user } = useContext(UserContext);

  const handleSetProject = newProject => {
    setCurProject({ ...newProject });
  };

  if (!user)
    return (
      <WideLayout title="Please log in to edit this project" hideHeadline={true}>
        <LoginNudge fullPage whatToDo="edit this project" />
      </WideLayout>
    );
  else if (!project)
    return (
      <Layout className={classes.root} title="Project not found">
        <Typography className={classes.errorTitle} variant="h3">
          This project does not exist. <Link href="/share">Click here</Link> to create a project
        </Typography>
      </Layout>
    );
  else if (!members.find(m => m.user && m.user.id === user.id))
    return (
      <WideLayout title="Please log in to edit an project" hideHeadline={true}>
        <Typography variant="h4" color="primary" className={classes.errorTitle}>
          You are not a member of this project. Go to{" "}
          <a href={"/projects/" + project.url_slug}>the project page</a> and ask to be part of the
          team.
        </Typography>
      </WideLayout>
    );
  else if (
    members.find(m => m.user && m.user.id === user.id).role.name != "Creator" &&
    members.find(m => m.user && m.user.id === user.id).role.name != "Administrator"
  )
    return (
      <WideLayout title="No permission to edit this project" hideHeadline={true}>
        <Typography variant="h4" color="primary" cclassName={classes.errorTitle}>
          You need to be an administrator of the project to manage the team.
        </Typography>
      </WideLayout>
    );
  else {
    const user_role = members.find(m => m.user && m.user.id === user.id).role;
    return (
      <WideLayout className={classes.root} title={"Edit project " + project.name} hideHeadline>
        <EditProjectRoot
          oldProject={project}
          project={curProject}
          skillsOptions={skillsOptions}
          userOrganizations={userOrganizations}
          statusOptions={statusOptions}
          handleSetProject={handleSetProject}
          tagsOptions={tagsOptions}
          token={token}
          user={user}
          user_role={user_role}
        />
      </WideLayout>
    );
  }
}

EditProjectPage.getInitialProps = async ctx => {
  const { token } = Cookies(ctx);
  const projectUrl = encodeURI(ctx.query.projectUrl);
  return {
    project: await getProjectByIdIfExists(projectUrl, token),
    members: await getMembersByProject(projectUrl, token),
    skillsOptions: await getSkillsOptions(),
    userOrganizations: await getUserOrganizations(token),
    statusOptions: await getStatusOptions(),
    tagsOptions: await getProjectTagsOptions(),
    token: token
  };
};

async function getProjectByIdIfExists(projectUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/projects/" + projectUrl + "/",
      tokenConfig(token)
    );
    if (resp.data.length === 0) return null;
    else {
      return parseProject(resp.data);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

const parseProject = project => ({
  ...project,
  image: getImageUrl(project.image),
  tags: project.tags.map(t => t.project_tag),
  project_parents: project.project_parents[0],
  is_personal_project: !project.project_parents[0].parent_organization,
  skills: project.skills.map(s => ({ ...s, key: s.id }))
});

const getUserOrganizations = async token => {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/my_organizations/",
      tokenConfig(token)
    );
    if (resp.data.length === 0) return null;
    else {
      return resp.data.map(o => o.organization);
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
};

async function getMembersByProject(projectUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/projects/" + projectUrl + "/members/",
      tokenConfig(token)
    );
    if (!resp.data) return null;
    else {
      return resp.data.results;
    }
  } catch (err) {
    console.log(err);
    if (err.response && err.response.data) console.log("Error: " + err.response.data.detail);
    return null;
  }
}

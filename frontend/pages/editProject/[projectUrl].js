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
  getProjectTagsOptions,
} from "../../public/lib/getOptions";
import { sendToLogin } from "../../public/lib/apiOperations";

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: "center",
  },
  errorTitle: {
    textAlign: "center",
    marginTop: theme.spacing(8),
  },
}));

export default function EditProjectPage({
  project,
  members,
  skillsOptions,
  userOrganizations,
  statusOptions,
  tagsOptions,
  token,
}) {
  const classes = useStyles();
  const [curProject, setCurProject] = React.useState({
    ...project,
    status: statusOptions.find((s) => s.name === project.status),
  });
  project = {
    ...project,
    status: statusOptions.find((s) => s.name === project.status),
  };
  const [errorMessage, setErrorMessage] = React.useState("");
  const { user } = useContext(UserContext);

  const handleSetErrorMessage = (newErrorMessage) => {
    setErrorMessage(newErrorMessage);
  };
  const handleSetProject = (newProject) => {
    setCurProject({ ...newProject });
  };

  if (!user)
    return (
      <WideLayout title="Please Log In to Edit this Climate Solution" hideHeadline={true}>
        <LoginNudge fullPage whatToDo="edit this project" />
      </WideLayout>
    );
  else if (!project)
    return (
      <Layout className={classes.root} title="Project not Found">
        <Typography className={classes.errorTitle} variant="h3">
          This project does not exist. <Link href="/share">Click here</Link> to create a project
        </Typography>
      </Layout>
    );
  else if (!members.find((m) => m.user && m.user.id === user.id))
    return (
      <WideLayout title="Please Log In to Edit a Climate Solution" hideHeadline={true}>
        <Typography variant="h4" color="primary" className={classes.errorTitle}>
          You are not a member of this project. Go to{" "}
          <a href={"/projects/" + project.url_slug}>the project page</a> and ask to be part of the
          team.
        </Typography>
      </WideLayout>
    );
  else if (
    members.find((m) => m.user && m.user.id === user.id).role.name != "Creator" &&
    members.find((m) => m.user && m.user.id === user.id).role.name != "Administrator"
  )
    return (
      <WideLayout title="No Permission to Edit this Climate Solution" hideHeadline={true}>
        <Typography variant="h4" color="primary" cclassName={classes.errorTitle}>
          You need to be an administrator of the project to manage the team.
        </Typography>
      </WideLayout>
    );
  else {
    const user_role = members.find((m) => m.user && m.user.id === user.id).role;
    return (
      <WideLayout
        className={classes.root}
        title={"Edit Solution " + project.name}
        hideHeadline
        message={errorMessage}
        messageType={errorMessage && "error"}
      >
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
          handleSetErrorMessage={handleSetErrorMessage}
        />
      </WideLayout>
    );
  }
}

EditProjectPage.getInitialProps = async (ctx) => {
  const { token } = Cookies(ctx);
  if (ctx.req && !token) {
    const message = "You have to log in to edit a project.";
    return sendToLogin(ctx, message);
  }
  const projectUrl = encodeURI(ctx.query.projectUrl);
  const [
    project,
    members,
    skillsOptions,
    userOrganizations,
    statusOptions,
    tagsOptions,
  ] = await Promise.all([
    getProjectByIdIfExists(projectUrl, token),
    getMembersByProject(projectUrl, token),
    getSkillsOptions(),
    getUserOrganizations(token),
    getStatusOptions(),
    getProjectTagsOptions(),
  ]);
  return {
    project: project,
    members: members,
    skillsOptions: skillsOptions,
    userOrganizations: userOrganizations,
    statusOptions: statusOptions,
    tagsOptions: tagsOptions,
    token: token,
  };
};

async function getProjectByIdIfExists(projectUrl, token) {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/projects/" + projectUrl + "/?edit_view=true",
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

const parseProject = (project) => ({
  ...project,
  image: getImageUrl(project.image),
  tags: project.tags.map((t) => t.project_tag),
  project_parents: project.project_parents[0],
  is_personal_project: !project.project_parents[0].parent_organization,
  skills: project.skills.map((s) => ({ ...s, key: s.id })),
});

const getUserOrganizations = async (token) => {
  try {
    const resp = await axios.get(
      process.env.API_URL + "/api/my_organizations/",
      tokenConfig(token)
    );
    if (resp.data.length === 0) return null;
    else {
      return resp.data.map((o) => o.organization);
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
